import type { Express } from "express";
import { createServer, type Server } from "http";
import { GoogleGenerativeAI } from "@google/generative-ai";
import multer from "multer";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

// إعداد المفتاح السري
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export function registerRoutes(app: Express): Server {
  app.post("/api/analyze", upload.single("image"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "يرجى اختيار صورة أولاً" });
      }

      // تحديد الموديل
      // سنستخدم "gemini-1.5-flash"
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
      }, { apiVersion: 'v1beta' });

      const imagePart = {
        inlineData: {
          data: req.file.buffer.toString("base64"),
          mimeType: req.file.mimetype,
        },
      };

      const prompt =
        "أنت مساعد صيدلي في صيدلية شفاء الشمس. حلل هذه الروشتة بوضوح.";

      // إرسال الطلب
      const result = await model.generateContent([prompt, imagePart]);
      const response = await result.response;

      res.json({ result: response.text() });
    } catch (error: any) {
      console.error("AI Error:", error);
      // إذا استمر الخطأ، سنعرض رسالة تفصيلية
      res.status(500).json({
        error: "فشل في التحليل. تأكد من تحديث المكتبة في الـ Shell.",
      });
    }
  });

  return createServer(app);
}
