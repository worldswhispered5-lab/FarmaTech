import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() });

// الأكواد الـ 7 المسموحة
const ALLOWED_CODES = ["m1", "s1", "r1", "s2", "h1", "m2", "y1"];

export function registerRoutes(app: Express): Server {
  app.post("/api/analyze", upload.single("image"), async (req, res) => {
    try {
      // 1. حماية الـ 7 أشخاص
      const userCode = req.body.accessCode;
      if (!userCode || !ALLOWED_CODES.includes(userCode)) {
        return res.status(401).json({
          error: "عذراً، الرمز غير صحيح. الموقع مخصص لـ 7 أشخاص فقط.",
        });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      const promptText = req.body.prompt; // النص القادم من المحادثة أو الجرعة

      // 2. تحديد الموديل (نفس طريقتك الأصلية لضمان الاستقرار)
      const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
      const listRes = await fetch(listUrl);
      const listData = await listRes.json();

      let targetModel = "models/gemini-1.5-flash";
      if (listData.models && listData.models.length > 0) {
        const availableModel = listData.models.find((m: any) =>
          m.supportedGenerationMethods.includes("generateContent"),
        );
        if (availableModel) targetModel = availableModel.name;
      }

      const url = `https://generativelanguage.googleapis.com/v1beta/${targetModel}:generateContent?key=${apiKey}`;

      // 3. بناء محتوى الطلب (هنا السر للتبديل بين الصورة والنص)
      let payload: any;

      if (req.file) {
        // إذا رفع صورة (روشتة) - يستخدم كودك الأصلي
        payload = {
          contents: [
            {
              parts: [
                {
                  text: "أنت مساعد صيدلي في صيدلية شفاء الشمس. حلل الروشتة واستخرج الأدوية والجرعات بالعربية بجدول مرتب.",
                },
                {
                  inline_data: {
                    mime_type: req.file.mimetype,
                    data: req.file.buffer.toString("base64"),
                  },
                },
              ],
            },
          ],
        };
      } else if (promptText) {
        // إذا كان كلام نصي (دردشة مع Gemini)
        payload = {
          contents: [
            {
              parts: [
                {
                  text: `بصفتك مساعد صيدلي في صيدلية شفاء الشمس، أجب على ما يلي: ${promptText}`,
                },
              ],
            },
          ],
        };
      } else {
        return res
          .status(400)
          .json({ error: "يرجى إرسال صورة أو نص للتكلم مع النظام." });
      }

      // 4. إرسال الطلب لجوجل
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.candidates && data.candidates[0].content) {
        res.json({ result: data.candidates[0].content.parts[0].text });
      } else {
        res.status(500).json({ error: "جوجل ترفض الرد، تأكد من وضوح الطلب." });
      }
    } catch (error: any) {
      res.status(500).json({ error: "خطأ داخلي: " + error.message });
    }
  });

  return createServer(app);
}
