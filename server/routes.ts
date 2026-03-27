import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import crypto from "crypto";
import { storage } from "./storage";
import { createClient } from "@supabase/supabase-js";
import { searchDrugInOpenFDA, searchCosmeticInOpenBeauty } from "./db-services";
import { GoogleGenerativeAI } from "@google/generative-ai";

const upload = multer({ storage: multer.memoryStorage() });

// AI Intelligence: Analyze Image (The heart of FarmaTech AI)
async function generateImageEmbedding(image: string): Promise<number[] | null> {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const embedModel = genAI.getGenerativeModel({ model: "text-embedding-004" });
    
    // 1. Generate a compact "Visual Signature" of the image
    // This reduces the image into a descriptive string that is stable across angles
    const imageData = image.split(",")[1];
    const result = await model.generateContent([
      "Briefly describe only the unique identifying marks, brand name, and color of this medicine packaging in 10 words or less.",
      {
        inlineData: {
          data: imageData,
          mimeType: "image/jpeg"
        }
      }
    ]);
    
    const signature = result.response.text().trim();
    console.log(`[Visual Search] Signature: ${signature}`);

    // 2. Convert the signature into a vector embedding
    const embedResult = await embedModel.embedContent(signature);
    return Array.from(embedResult.embedding.values);
  } catch (error) {
    console.error("[AI Error] Embedding generation failed:", error);
    return null;
  }
}
async function analyzeImage(image: string, type: string) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = type === "prescription" 
    ? `تحليل روشتة طبية احترافي:
    قم بقراءة الروشتة المرفقة واستخراج المعلومات التالية بتنسيق JSON:
    {
      "title": "اسم المريض أو الطبيب (إن وجد) مع تاريخ الروشتة",
      "medicines": [
        {
          "name": "اسم الدواء بالإنجليزية",
          "name_ar": "اسم الدواء بالعربية",
          "dosage": "الجرعة المقررة (مثلاً: حبة 3 مرات يومياً)",
          "purpose": "الغرض من الدواء (مثلاً: مسكن للآلام)"
        }
      ],
      "doctor_notes": "أي ملاحظات إضافية من الطبيب",
      "general_advice": "نصيحة عامة للمريض بناءً على الروشتة"
    }
    تأكد من أن النتيجة JSON صالح فقط باللغتين العربية والإنجليزية.`
    : `تحليل دواء احترافي:
    قم بتحليل صورة الدواء/المنتج واستخراج المعلومات التالية بتنسيق JSON:
    {
      "title": "اسم الدواء الرسمي بالإنجليزية والعربية",
      "active_ingredients": "المواد الفعالة",
      "uses": "دواعي الاستعمال الرئيسية",
      "dosage": "الجرعة المعتادة (إخلاء مسؤولية: استشر الطبيب)",
      "warnings": "التحذيرات والآثار الجانبية الهامة",
      "iraq_alternative": "بدائل مقترحة في العراق أو الوطن العربي (إن وجدت)",
      "safety_rating": "تقييم السلامة (مثلاً: آمن، استشر طبيب، خطر للحوامل)"
    }
    تأكد من أن النتيجة JSON صالح فقط باللغتين العربية والإنجليزية.
    أضف دائماً تنبيهاً طبياً (Disclaimer) في النهاية.`;

  const imageData = image.split(",")[1];
  const result = await model.generateContent([
    prompt,
    {
      inlineData: {
        data: imageData,
        mimeType: "image/jpeg"
      }
    }
  ]);

  const text = result.response.text();
  // Clear potential markdown blocks
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("فشل الذكاء الاصطناعي في تنسيق النتيجة. حاول مرة أخرى.");
  
  return JSON.parse(jsonMatch[0]);
}

// Setup Supabase Backend Client to Verify Tokens
const supabaseUrl = process.env.VITE_SUPABASE_URL || "https://wgndikqowpwamfykxqul.supabase.co";
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_Wvj4_zuM-cIoMHW2MkCxKg_36e6pIYe";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export function registerRoutes(app: Express): Server {
  // Diagnostic health check
  app.get("/api/ping", (_req, res) => {
    res.json({ 
      status: "ok", 
      time: new Date().toISOString(), 
      env: process.env.NODE_ENV,
      version: "v10.4-ping"
    });
  });

  // POST User Profile (Credits & Tier) with Fingerprinting
  app.post("/api/profile", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) return res.status(401).json({ error: "Missing authorization header" });
      const token = authHeader.replace("Bearer ", "");
      const { fingerprint } = req.body;
      
      const { data: authData, error: authError } = await supabase.auth.getUser(token);
      if (authError || !authData?.user) {
        console.error("[Profile Error] Auth failed:", authError);
        return res.status(401).json({ error: "Invalid session" });
      }

      const user = authData.user;
      let profile = await storage.getProfile(user.id).catch(e => {
        console.error("[Profile Error] getProfile failed:", e);
        return null;
      });
      
      let expiryWarning = null;
      if (profile && profile.subscriptionExpiresAt) {
        const expiresAt = new Date(profile.subscriptionExpiresAt);
        const now = new Date();
        
        if (expiresAt < now) {
          profile = await storage.updateProfile(user.id, {
            credits: 0,
            maxCredits: 0,
            subscriptionTier: 'free',
            subscriptionExpiresAt: undefined
          }).catch(e => profile); // fallback to old profile if update fails
        } else {
          const diffDays = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          if (diffDays <= 3) expiryWarning = `باقي ${diffDays} أيام وينتهي اشتراكك`;
        }
      }

      if (!profile) {
        // --- Fraud Prevention System (The Shield) ---
        let initialCredits = 10;
        let initialMax = 10;

        if (fingerprint) {
          // Check if another profile already has THIS fingerprint and HAD credits
          const existingDeviceProfile = await storage.getProfileByFingerprint(fingerprint);
          if (existingDeviceProfile && existingDeviceProfile.id !== user.id) {
            console.log(`[FarmaTech Shield] Duplicate Device Detected: ${fingerprint}. Account: ${user.id}. Preventing free tokens.`);
            initialCredits = 0;
            initialMax = 0;
          }
        }

        profile = await storage.updateProfile(user.id, { 
          email: user.email, 
          credits: initialCredits, 
          maxCredits: initialMax, 
          subscriptionTier: 'free',
          fingerprint: fingerprint || undefined
        }).catch(e => {
          console.error("[Profile Error] Initial create failed:", e);
          return { id: user.id, email: user.email, credits: initialCredits, maxCredits: initialMax, subscriptionTier: 'free', fingerprint } as any;
        });
      } else {
        // Update fingerprint if missing
        if (profile && fingerprint && !profile.fingerprint) {
          profile = await storage.updateProfile(user.id, { fingerprint }).catch(e => profile);
        }

        // Global Credit Policy Enforcement
        if (profile && profile.subscriptionTier === 'free' && ((profile.maxCredits ?? 0) > 10 || (profile.credits ?? 0) > 10)) {
          console.log(`[FarmaTech v10.8-ultimate] Enforcing 10-token limit for ${user.id}`);
          profile = await storage.updateProfile(user.id, {
            maxCredits: 10,
            credits: Math.min((profile as any).credits ?? 0, 10)
          }).catch(e => profile);
        }
      }

      const response = { 
        ...(profile || {}), 
        expiryWarning, 
        serverVersion: "v10.22-social" 
      };
      
      console.log(`[FarmaTech v10.22-social] Success for ${user.id}`);
      return res.json(response);
    } catch (error: any) {
      console.error("[Profile Error] UNEXPECTED CRASH:", error);
      res.status(500).json({ error: "An unexpected server error occurred.", details: error.message });
    }
  });

  // GET User History
  app.get("/api/history", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) return res.status(401).json({ error: "Missing authorization header" });
      const token = authHeader.replace("Bearer ", "");
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      if (authError || !user) return res.status(401).json({ error: "Invalid session" });

      // Auto-cleanup old records (>30 days)
      await storage.cleanupOldHistory(user.id);

      const history = await storage.getHistory(user.id);
      return res.json(history);
    } catch (error: any) {
      console.error("[History Fetch Error]", error);
      res.status(500).json({ error: error.message });
    }
  });

  // DELETE specific history entry
  app.delete("/api/history/:id", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) return res.status(401).json({ error: "Missing authorization header" });
      const token = authHeader.replace("Bearer ", "");
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      if (authError || !user) return res.status(401).json({ error: "Invalid session" });

      const historyId = req.params.id;
      // Optional: check if the history item belongs to the user
      const historyItems = await storage.getHistory(user.id);
      if (!historyItems.some(h => h.id === historyId)) {
        return res.status(403).json({ error: "Unauthorized or not found" });
      }

      await storage.deleteHistory(historyId);
      return res.json({ success: true, message: "History entry deleted" });
    } catch (error: any) {
      console.error("[History Delete Error]", error);
      res.status(500).json({ error: error.message });
    }
  });

  // FREE Search (FDA & Beauty Facts)
  app.post("/api/search-free", async (req, res) => {
    try {
      const { query, lang = "ar" } = req.body;
      const authHeader = req.headers.authorization;
      let user: any = null;

      if (authHeader) {
        const token = authHeader.replace("Bearer ", "");
        const { data } = await supabase.auth.getUser(token);
        user = data.user;
      }

      const [localResults, fdaResult, beautyResult] = await Promise.all([
        storage.searchProducts(query),
        searchDrugInOpenFDA(query, lang),
        searchCosmeticInOpenBeauty(query, lang)
      ]);

      let result = null;
      if (localResults.length > 0) {
        const p = localResults[0];
        result = lang === 'en' 
          ? `Found in local database ✅\n\n1- Name: ${p.name}\nScientific Name: ${p.scientificName || 'N/A'}\nOrigin: ${p.origin || 'N/A'}\n\nDescription: ${p.description || 'N/A'}`
          : `تم العثور على المنتج في قاعدة البيانات المحلية ✅\n\n1- الاسم: ${p.name}\nالاسم العلمي: ${p.scientificName || 'غير متوفر'}\nالمنشأ: ${p.origin || 'غير متوفر'}\n\nالوصف: ${p.description || 'غير متوفر'}`;
      } else {
        result = fdaResult || beautyResult;
      }

      if (result && user) {
        // Save to persistent history if logged in
        try {
          await storage.createHistory({
            userId: user.id,
            title: fdaResult ? "medicineScan" : "cosmeticSearch",
            type: fdaResult ? "medicine" : "cosmetic",
            content: result,
          });
        } catch (e) {
          console.error("[History Save Error - Free]", e);
        }
      }

      if (result) {
        return res.json({ result });
      } else {
        return res.json({ fallback: true });
      }
    } catch (error: any) {
      console.error("[Search Free Error]", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Simulate Payment Success
  app.post("/api/simulate-payment", async (req, res) => {
    try {
      const { planId, token } = req.body;
      if (!token) return res.status(401).json({ error: "Missing token" });
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      if (authError || !user) return res.status(401).json({ error: "Invalid session" });

      const profile = await storage.getProfile(user.id);
      if (!profile) return res.status(404).json({ error: "Profile not found" });

      // Calculate add-on credits: Total - 10 free base
      const additions: Record<string, number> = {
        starter: 130,
        pro_monthly: 300,
        pro: 2100,
        enterprises: 4500
      };

      const creditsToAdd = additions[planId] || 0;
      const currentCredits = profile.credits || 0;
      const currentMax = profile.maxCredits || 10;

      const newCredits = currentCredits + creditsToAdd;
      const newMax = currentMax + creditsToAdd;

      console.log(`[Subscription STACKING] User: ${user.id}, Adding: ${creditsToAdd}, New Balance: ${newCredits}/${newMax}`);

      const days = planId === 'enterprises' ? 365 : (planId === 'pro' ? 180 : 30);
      const now = new Date();
      let expiryBase = now;
      
      if (profile.subscriptionExpiresAt) {
        const currentExpiry = new Date(profile.subscriptionExpiresAt);
        if (currentExpiry > now) {
          expiryBase = currentExpiry;
        }
      }
      
      const expiryDate = new Date(expiryBase);
      expiryDate.setDate(expiryDate.getDate() + days);

      console.log(`[Subscription STACKING] Plan: ${planId}, Days: ${days}`);
      console.log(`[Subscription STACKING] Current Expiry: ${profile.subscriptionExpiresAt}`);
      console.log(`[Subscription STACKING] Expiry Base: ${expiryBase.toISOString()}`);
      console.log(`[Subscription STACKING] New Expiry: ${expiryDate.toISOString()}`);

      const updatedProfile = await storage.updateProfile(user.id, {
        credits: newCredits,
        maxCredits: newMax,
        subscriptionTier: planId,
        subscriptionExpiresAt: expiryDate.toISOString()
      });

      return res.json({ 
        success: true, 
        newTotal: newCredits, 
        newMax: newMax,
        message: `تمت الإضافة بنجاح! رصيدك الحالي الآن هو ${newCredits} طلب من أصل ${newMax}.` 
      });
    } catch (error: any) {
      console.error("[Payment Error]", error);
      res.status(500).json({ error: error.message });
    }
  });

  // NEW: Checkout route for Mastercard/Visa integration preparation
  app.post("/api/checkout", async (req, res) => {
    try {
      const { planId, paymentMethod, amount, token } = req.body;
      if (!token) return res.status(401).json({ error: "Missing token" });
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      if (authError || !user) return res.status(401).json({ error: "Invalid session" });

      const profile = await storage.getProfile(user.id);
      if (!profile) return res.status(404).json({ error: "Profile not found" });

      // 1. Create a pending subscription record
      const subscription = await storage.createSubscription({
        userId: user.id,
        planId: planId,
        amount: amount || 0,
        paymentMethod: paymentMethod, // 'mastercard' or 'visa'
        status: 'pending',
      });

      // 2. // TODO: [PAYMENT GATEWAY INTEGRATION] 
      // Replace the below simulation with an actual call to Stripe, ZainCash, or NassPay API.
      console.log(`[Payment Gateway Mock] Processing ${amount} via ${paymentMethod} for user ${user.id}`);

      // 3. Simulate Successful payment & Profile update
      const additions: Record<string, number> = {
        starter: 130,
        pro_monthly: 300,
        pro: 2100,
        enterprises: 4500
      };

      const creditsToAdd = additions[planId] || 0;
      const currentCredits = profile.credits || 0;
      const currentMax = profile.maxCredits || 10;

      const newCredits = currentCredits + creditsToAdd;
      const newMax = currentMax + creditsToAdd;

      const days = planId === 'enterprises' ? 365 : (planId === 'pro' ? 180 : 30);
      const now = new Date();
      let expiryBase = now;
      
      if (profile.subscriptionExpiresAt) {
        const currentExpiry = new Date(profile.subscriptionExpiresAt);
        if (currentExpiry > now) {
          expiryBase = currentExpiry;
        }
      }
      
      const expiryDate = new Date(expiryBase);
      expiryDate.setDate(expiryDate.getDate() + days);

      console.log(`[Checkout STACKING] Plan: ${planId}, Days: ${days}`);
      console.log(`[Checkout STACKING] Current Expiry: ${profile.subscriptionExpiresAt}`);
      console.log(`[Checkout STACKING] Expiry Base: ${expiryBase.toISOString()}`);
      console.log(`[Checkout STACKING] New Expiry: ${expiryDate.toISOString()}`);

      await storage.updateProfile(user.id, {
        credits: newCredits,
        maxCredits: newMax,
        subscriptionTier: planId,
        subscriptionExpiresAt: expiryDate.toISOString()
      });

      // 4. Mark subscription as completed
      await supabase.from('subscriptions').update({ 
        status: 'completed', 
        expires_at: expiryDate.toISOString() 
      }).eq('id', subscription.id);

      return res.json({ 
        success: true, 
        newTotal: newCredits, 
        newMax: newMax,
        message: `تم الدفع وتفعيل الاشتراك بنجاح عبر ${paymentMethod === 'mastercard' ? 'ماستر كارد' : 'فيزا'}!` 
      });

    } catch (error: any) {
      console.error("[Checkout Error]", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/analyze", upload.single("image"), async (req, res) => {
    try {
      const token = req.body.accessCode;
      const promptText = req.body.prompt; 
      console.log(`[Analyze Request] Prompt: "${promptText?.substring(0, 50)}...", File: ${!!req.file}, Lang: ${req.body.lang}`);
      
      if (!token) return res.status(401).json({ error: "لم يتم تسجيل الدخول." });

      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      if (authError || !user) return res.status(401).json({ error: "جلسة غير صالحة." });

      const profile = await storage.getProfile(user.id);
      const userCredits = profile?.credits ?? 10;
      if (userCredits <= 0) return res.status(403).json({ error: "رصيدك نفذ. يرجى ترقية الباقة." });

      const history = req.body.history ? JSON.parse(req.body.history) : [];
      const lang = req.body.lang || "ar";

      const isMedicineScan = promptText && (promptText.includes("تعرف على هذا الدواء") || promptText.includes("Identify this medicine") || promptText.includes("قم بمسح هذه الععلبة") || promptText.includes("Please scan this package"));
      const isLabAnalysis = promptText && (promptText.includes("نتائج هذا التقرير المختبري") || promptText.includes("laboratory report") || promptText.includes("التقرير المختبري"));
      const isPrescription = !isMedicineScan && !isLabAnalysis && req.file && !promptText?.includes("احسب الجرعة لـ") && !promptText?.includes("التفاعلات الدوائية لـ");
      const isDoseCalc = promptText && promptText.includes("احسب الجرعة لـ");
      const isInteractions = promptText && (promptText.includes("التفاعلات الدوائية لـ") || promptText.includes("Drug interactions for"));
      const isSymptoms = promptText && (promptText.includes("أشعر بـ") || promptText.includes("I feel"));

      const currentReqType = isMedicineScan ? "medicine" : (isLabAnalysis ? "lab" : (isPrescription ? "prescription" : (isDoseCalc ? "calculation" : (isInteractions ? "interaction" : (isSymptoms ? "symptoms" : "chat")))));

      // --- GLOBAL DUPLICATE DETECTION (AI CACHING) ---
      let imageHash: string | undefined;
      if (req.file) {
        imageHash = crypto.createHash('md5').update(req.file.buffer).digest('hex');
        
        // 1. Check if the CURRENT user already has this (save duplication)
        const myExisting = await storage.getHistoryByHash(user.id, imageHash);
        if (myExisting) {
          // Even for local cache, ensure type consistency
          if (myExisting.type === currentReqType) {
            console.log(`[Cache-Local] User ${user.id} reused their own image: ${imageHash}. Type: ${currentReqType}`);
            return res.json({ 
              result: myExisting.content, 
              historyId: myExisting.id, 
              cached: true,
              model: "cached",
              credits: userCredits,
              maxCredits: profile?.maxCredits ?? 10
            });
          }
        }

        // 2. Check if ANY user has processed this image before (save AI cost)
        const globalExisting = await storage.getGlobalHistoryByHash(imageHash);
        if (globalExisting) {
          // STRICT TYPE GUARD: Only use cache if the tool-type matches perfectly
          if (globalExisting.type === currentReqType) {
            console.log(`[Cache-Global] Match found for hash ${imageHash}. Type consistency verified: ${currentReqType}`);
            
            // Deduct credit for viewing the global cache
            const updatedProfile = await storage.updateProfile(user.id, { credits: userCredits - 1 });

            // Create a new history entry for the CURRENT user using the CACHED content
            const created = await storage.createHistory({
              userId: user.id,
              title: globalExisting.title,
              type: globalExisting.type,
              content: globalExisting.content,
              image: `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`,
              imageHash: imageHash
            });

            return res.json({ 
              result: globalExisting.content, 
              historyId: created.id, 
              cached: true,
              model: "global-cache",
              credits: updatedProfile.credits,
              maxCredits: updatedProfile.maxCredits
            });
          } else {
            console.log(`[Cache-Global] Hash match found but TYPE MISMATCH (Cached: ${globalExisting.type}, Req: ${currentReqType}). Bypassing cache.`);
          }
        }
      }

      let systemInstruction = "";
      if (lang === 'en') {
        if (isPrescription) {
          systemInstruction = `You are a Senior Clinical Pharmacist. Your task is to analyze medical prescriptions with 100% accuracy. 
          1. Start immediately with the phrase "Prescription Reading". 
          2. List each medication name and dosage clearly. 
          3. For each medication, provide: Scientific name, Indication/Usage, Frequency, and any critical precautions or contraindications.
          4. If the handwriting is unclear, mention it but provide the most likely reading.
          5. Add a "Pharmacist Note" at the end with general advice. 
          STRICT RULE: If this image is a laboratory report (test results, units, reference ranges) instead of a medical prescription, you MUST respond ONLY with the exact text "LAB_REPORT_DETECTED".
          NO greetings or introductory filler.`;
        } else if (isMedicineScan) {
          systemInstruction = `Expert Pharmacist specialized in identifying medications from package images. 
          Your primary task is to identify the medicine from its package design, branding, or text, even if a barcode is missing.
          Your response MUST prioritize:
          1. Brand Name and Generic Name.
          2. Active Ingredients and Strength.
          3. Therapeutic Usage and Medical Benefits.
          4. Usage instructions and pharmacist advice.
          Additionally, extract the Barcode or Batch Number (Serial) ONLY if clearly visible; do not dwell on their absence.
          STRICT RULE: Refuse to analyze prescriptions and direct the user to the correct service. Respond ONLY in English.`;
        } else if (isDoseCalc) {
          systemInstruction = "Senior Clinical Pharmacist specialized in pediatrics and geriatrics. Calculate the precise dose based on the provided weight and age. Mention the calculation steps, the final dose in mg and ml (if syrup), and the maximum daily dose. Include common side effects.";
        } else if (isInteractions) {
          systemInstruction = "Expert Pharmacologist. Analyze potential interactions between the listed drugs and common foods. Categorize interactions as: Major (Red), Moderate (Orange), or Minor (Yellow). Provide advice on how to manage these interactions.";
        } else if (isSymptoms) {
          systemInstruction = "Senior Pharmacist Assistant. Analyze the mentioned symptoms carefully. Suggest common OTC treatments if appropriate, but emphasize when a doctor visit is mandatory. Do NOT provide a definitive medical diagnosis, only pharmaceutical consultation.";
        } else if (isLabAnalysis) {
          systemInstruction = `You are a Senior Clinical Pharmacist specialized in laboratory results interpretation.
          1. Start immediately with the header "### Lab Report Analysis".
          2. Extract each laboratory test with its result, unit, and reference range.
          3. Indicate if each result is normal, high, or low based on provided patient data.
          4. Provide a brief clinical significance for each abnormal result.
          5. End with pharmaceutical recommendations and advice.
          STRICT RULE: If this image is a medical prescription (doctor's prescription/handwritten meds) instead of a laboratory report, you MUST respond ONLY with the exact text "PRESCRIPTION_DETECTED".
          NO greetings or introductory filler.`;
        } else {
          systemInstruction = "Expert Pharmacist in Iraq. Provide professional pharmaceutical consultation based on the user request. Be helpful, detailed, and accurate.";
        }
      } else {
        if (isPrescription) {
          systemInstruction = `أنت صيدلي سريري أقدم خبير جداً. مهمتك هي تحليل الروشتات الطبية بدقة 100%. 
          يجب أن تكون الإجابة باللغة العربية حصراً.
          1. استخدم دائماً العنوان الرئيسي "### قراءة الروشتة" في البداية.
          2. ادرج كل دواء في سطر منفصل يبدأ برقم (مثلاً: 1. اسم الدواء) لتفعيل عرض البطاقات.
          3. لكل دواء، اذكر: الاسم بالإنجليزية والعربية، المادة الفعالة، الاستخدام، وطريقة الاستخدام.
          4. استخدم العنوان "### التحليل السريري وخطة العمل" للقسم التالي.
          5. استخدم العنوان "### نقاط استشارة المريض" للنصائح النهائية.
          6. استخدم النقاط (-) للنصائح الجانبية.
          قاعدة صارمة: إذا كانت هذه الصورة عبارة عن فحص مختبري (نتائج، وحدات، قيم طبيعية) وليست وصفة طبية (روشتة)، يجب أن يكون ردك هو الكلمة التالية فقط بدون أي زيادة: LAB_REPORT_DETECTED
          لا تذكر أي مقدمات أو ترحيب في نص الرد (سيتم إضافته تلقائياً).`;
        } else if (isMedicineScan) {
          systemInstruction = `أنت صيدلي خبير متخصص في التعرف على الأدوية من صور العبوات. 
          يجب أن تكون الإجابة باللغة العربية حصراً.
          1. استخدم دائماً العنوان الرئيسي "### مسح علبة / باركود" في البداية.
          2. استخدم العنوان "### قراءة الصورة" للقسم الأول من البيانات.
          3. حدد اسم الدواء ونوعه من شكل العلبة أو التصميم أو الكتابة عليها، حتى لو لم يظهر الباركود.
          4. يجب أن يتضمن ردك بصورة أساسية:
             - الاسم التجاري والاسم العلمي.
             - المكونات الفعالة والجرعة.
             - دواعي الاستعمال والفوائد الطبية.
             - طريقة الاستخدام والنصائح الصيدلانية.
          5. استخرج الباركود (Barcode) أو رقم الوجبة (Batch Number) فقط إذا كانا واضحين تماماً.
          قاعدة صارمة: لا تذكر أي تفاصيل عن الروشتات ولا تستخدم مصطلح "روشتة" هنا.`;
        } else if (isDoseCalc) {
          systemInstruction = "أنت صيدلي سريري متخصص. يجب أن تكون الإجابة باللغة العربية حصراً. احسب الجرعة الدقيقة بناءً على الوزن والعمر المذكورين. اذكر خطوات الحساب، الجرعة النهائية (بالمجم والمل إذا كان شراباً)، والجرعة اليومية القصوى. اذكر الأعراض الجانبية الشائعة.";
        } else if (isInteractions) {
          systemInstruction = "أنت خبير في علم الأدوية. يجب أن تكون الإجابة باللغة العربية حصراً. حلل التفاعلات المحتملة بين الأدوية المذكورة وبينها وبين الأطعمة الشائعة. صنف التفاعلات إلى: خطيرة (أحمر)، متوسطة (برتقالي)، أو بسيطة (أصفر). قدم نصيحة حول كيفية التعامل معها.";
        } else if (isSymptoms) {
          systemInstruction = "أنت مساعد صيدلي سريري. يجب أن تكون الإجابة باللغة العربية حصراً. حلل الأعراض المذكورة بعناية. اقترح علاجات OTC (بدون وصفة) عند الاقتضاء، لكن أكد بوضوح على الحالات التي تتطلب مراجعة الطبيب. لا تقدم تشخيصاً طبياً نهائياً، بل استشارة صيدلانية.";
        } else if (isLabAnalysis) {
          systemInstruction = `أنت صيدلي سريري أقدم خبير في تحليل وتفسير النتائج المختبرية.
          يجب أن تكون الإجابة باللغة العربية حصراً.
          1. استخدم دائماً العنوان الرئيسي "### تحليل الفحص المختبري" في البداية.
          2. استخرج كل فحص مختبري مع نتيجته، الوحدة، والمدى الطبيعي.
          3. وضح ما إذا كانت النتيجة طبيعية، مرتفعة، أو منخفضة بناءً على بيانات المريض المزودة.
          4. قدم شرحاً مبسطاً للأهمية السريرية لكل نتيجة غير طبيعية.
          5. اختم بتوصيات صيدلانية ونصائح مناسبة للحالة.
          قاعدة صارمة: إذا كانت هذه الصورة عبارة عن وصفة طبية (روشتة دكتور/أدوية مكتوبة) وليست فحصاً مختبرياً، يجب أن يكون ردك هو الكلمة التالية فقط بدون أي زيادة: PRESCRIPTION_DETECTED
          لا تذكر أي مقدمات أو ترحيب في نص الرد (سيتم إضافته تلقائياً).`;
        } else {
          systemInstruction = "أنت صيدلي خبير في العراق. يجب أن تكون الإجابة باللغة العربية حصراً. قدم استشارة صيدلانية مهنية مفصلة ودقيقة بناءً على طلب المستخدم.";
        }
      }

      const openRouterKey = process.env.OPENROUTER_API_KEY;
      const modelChain = [
        "google/gemini-2.0-flash-001",
        "openai/gpt-4o-mini",
        "anthropic/claude-3-haiku"
      ];

      if (!openRouterKey) throw new Error("Missing OpenRouter API Key");

      const messages = [
        { role: "system", content: systemInstruction },
        ...history.map((msg: any) => ({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content
        })),
        {
          role: "user",
          content: [
            { type: "text", text: promptText || (lang === 'ar' ? "حلل هذا الطلب صيدلانياً بدقة." : "Analyze this request pharmaceutically and accurately.") },
            ...(req.file ? [{ type: "image_url", image_url: { url: `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}` } }] : [])
          ]
        }
      ];

      const payload = {
        messages: messages,
        temperature: 0, // Deterministic results
        max_tokens: 4096
      };

      const headers = {
        "Authorization": `Bearer ${openRouterKey}`,
        "HTTP-Referer": "https://farma-tech.app",
        "X-Title": "FarmaTech AI",
        "Content-Type": "application/json",
      };

      const response = await fetchWithRetry(
        modelChain,
        headers,
        payload
      );
      
      const resultText = response.choices[0].message.content;
      
      // Check for detection flags
      if (resultText.trim().includes("LAB_REPORT_DETECTED")) {
        return res.json({ labReportDetected: true });
      }
      if (resultText.trim().includes("PRESCRIPTION_DETECTED")) {
        return res.json({ prescriptionDetected: true });
      }

      let finalResult = resultText;
      if (isPrescription) {
        const fullName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "";
        const firstName = fullName.split(" ")[0];
        if (lang === "ar") {
          finalResult = `أهلاً بك يا الدكتور ${firstName} بصفتي مساعدك الصيدلي الدقيق.\n\nإليك التحليل المهني الدقيق:\n\n${resultText}`;
        } else {
          finalResult = `Hello, Dr. ${firstName}, as your precise pharmacy assistant.\n\nHere is the professional precise analysis:\n\n${resultText}`;
        }
      }

      let historyTitle = isMedicineScan ? "medicineScan" : (isLabAnalysis ? "labReportAnalysis" : (isPrescription ? "prescriptionAnalysis" : (isDoseCalc ? "doseCalculator" : (isInteractions ? "drugInteractions" : (isSymptoms ? "symptomAnalysis" : "aiAnalysis")))));
      let historyType = isMedicineScan ? "medicine" : (isLabAnalysis ? "lab" : (isPrescription ? "prescription" : (isDoseCalc ? "calculation" : (isInteractions ? "interaction" : (isSymptoms ? "symptoms" : "chat")))));

      const historyIdFromReq = req.body.historyId || null;
      let finalHistoryId;
      
      // Mandatory: update imageHash if a new image was provided, even on updates
      if (historyIdFromReq) {
        const updated = await storage.updateHistory(historyIdFromReq, { 
          content: finalResult,
          title: historyTitle,
          type: historyType,
          image: req.file ? `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}` : undefined,
          imageHash: imageHash // CRITICAL: Update the hash to current image
        });
        finalHistoryId = updated.id;
      } else {
        const created = await storage.createHistory({
          userId: user.id,
          title: historyTitle,
          type: historyType,
          content: finalResult,
          image: req.file ? `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}` : undefined,
          imageHash: imageHash
        });
        finalHistoryId = created.id;
        
        // Silent cleanup of older entries
        storage.cleanupOldHistory(user.id).catch(err => 
          console.error("[Cleanup Error] Failed to cleanup after analysis:", err)
        );
      }

      const updatedProfile = await storage.updateProfile(user.id, { credits: userCredits - 1 });
      return res.json({ 
        result: finalResult, 
        historyId: finalHistoryId, 
        model: response.model,
        credits: updatedProfile.credits,
        maxCredits: updatedProfile.maxCredits
      });

    } catch (error: any) {
      console.error("[Analyze Error]", error);
      res.status(500).json({ error: error.message || "تعذر الاتصال بالذكاء الاصطناعي." });
    }
  });

  app.post("/api/support", async (req, res) => {
    try {
      const { message, userEmail } = req.body;
      const botToken = process.env.TELEGRAM_BOT_TOKEN;
      const chatId = process.env.ADMIN_CHAT_ID;

      if (!botToken || !chatId || botToken === "your_bot_token_here" || !botToken.includes(':')) {
        return res.status(500).json({ 
          error: "Telegram support is not configured yet. Please add BOT_TOKEN and CHAT_ID to .env" 
        });
      }

      const text = `🚨 *طلب دعم فني جديد*\n\n*المستخدم:* ${userEmail || 'زائر'}\n*الرسالة:* ${message}`;

      const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: text,
          parse_mode: 'Markdown'
        })
      });

      if (response.ok) {
        res.json({ success: true });
      } else {
        const errorData = await response.json();
        console.error("Telegram API Error:", errorData);
        res.status(500).json({ error: "فشل إرسال الرسالة لتليكرام" });
      }
    } catch (error) {
      console.error("Support API Error:", error);
      res.status(500).json({ error: "حدث خطأ في الخادم" });
    }
  });

  return createServer(app);
}

async function fetchWithRetry(
  modelChain: string[],
  headers: any,
  body: any,
  retriesPerModel = 3
): Promise<any> {
  let lastError: any;

  for (const model of modelChain) {
    let currentRetries = retriesPerModel;
    const currentBody = { ...body, model };

    while (currentRetries >= 0) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers,
          body: JSON.stringify(currentBody),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData?.error?.message || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        // Return the data along with the model info for tracking
        return { ...data, model };
      } catch (error: any) {
        lastError = error;
        if (currentRetries > 0) {
          console.log(`[Retry] Model ${model} failed: ${error.message}. Retrying... (${currentRetries} left)`);
          await new Promise((res) => setTimeout(res, 2000)); // 2s delay
          currentRetries--;
        } else {
          console.warn(`[Fallback] Model ${model} exhausted. Moving to next in chain.`);
          break; // Move to next model in the chain
        }
      }
    }
  }

  throw lastError;
}
