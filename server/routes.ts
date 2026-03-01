import type { Express } from "express";
import { createServer, type Server } from "http";
import { GoogleGenerativeAI } from "@google-cloud/generative-ai";
import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() });

// ربط المفتاح السري
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export function registerRoutes(app: Express): Server {
  app.post("/api/analyze", upload.single("image"), async (req, res) => {
    try {
      if (!req.file)
        return res.status(400).json({ error: "يرجى رفع صورة الروشتة أولاً" });

      // السر هنا: استخدام الموديل بدون تحديد إصدار v1beta يدوياً في الرابط
      // المكتبة ستتولى اختيار v1 المستقر تلقائياً
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
      });

      const imagePart = {
        inlineData: {
          data: req.file.buffer.toString("base64"),
          mimeType: req.file.mimetype,
        },
      };

      const prompt =
        "أنت مساعد صيدلي في صيدلية شفاء الشمس. حلل هذه الروشتة بوضوح واستخرج الأدوية والجرعات بالعربية.";

      const result = await model.generateContent([prompt, imagePart]);
      const response = await result.response;
      const text = response.text();

      res.json({ result: text });
    } catch (error: any) {
      console.error("AI Error:", error);
      res
        .status(500)
        .json({
          error: "فشل في التحليل. تأكد من أن المفتاح صحيح والموقع يدعم الخدمة.",
        });
    }
  });

  return createServer(app);
}
