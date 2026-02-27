import type { Express } from "express";
import { type Server } from "http";
import { GoogleGenerativeAI } from "@google/generative-ai";
import multer from "multer";

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

// استدعاء المفتاح من الخزنة السرية
export const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.post("/api/analyze", upload.single("image"), async (req, res) => {
    try {
      if (!req.file)
        return res.status(400).json({ error: "يرجى رفع صورة الروشتة" });

      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const imagePart = {
        inlineData: {
          data: req.file.buffer.toString("base64"),
          mimeType: req.file.mimetype,
        },
      };

      const prompt =
        "أنت مساعد صيدلي في صيدلية شفاء الشمس. حلل هذه الروشتة واستخرج الأدوية والجرعات بالعربية.";
      const result = await model.generateContent([prompt, imagePart]);

      res.json({ result: result.response.text() });
    } catch (error: any) {
      res.status(500).json({ error: "خطأ في السيرفر: " + error.message });
    }
  });

  return httpServer;
}
