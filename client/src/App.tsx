import React, { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Toaster } from "./components/ui/toaster";
import { useToast } from "./hooks/use-toast";
import {
  LogOut,
  Loader2,
  History as HistoryIcon,
  Camera,
  Image as ImageIcon,
  X,
  Maximize2,
  AlertTriangle,
  MessageSquare,
  Calculator,
  ArrowRight,
  ChevronLeft,
  Search,
  FileSignature,
  ScanBarcode,
  FlaskConical,
  Sparkles,
  User,
  PieChart,
  Clock,
  Settings,
  Home as HomeIcon,
  Moon,
  Sun,
  Plus,
  Send,
  Share2,
  Check,
  Zap,
  Star,
  TrendingUp,
  Award,
  Wallet,
  ShieldCheck,
  BadgePercent,
  Copy,
  PenTool,
  Languages,
  Instagram,
  Linkedin,
  Facebook,
  MessageCircle,
  CreditCard,
  Lock,
  Activity,
  ChevronDown,
} from "lucide-react";

import { AboutPage } from "./components/AboutPage";
import { ContactPage } from "./components/ContactPage";
import { PrivacyPolicy } from "./components/PrivacyPolicy";
import { TermsOfUse } from "./components/TermsOfUse";
import { translations } from "./lib/translations";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase Client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("[FarmaTech] Supabase configuration missing! Check environment variables.");
}

export const supabase = createClient(supabaseUrl || "", supabaseAnonKey || "");

const API_BASE_URL = import.meta.env.VITE_API_URL || "";


const TIER_LIMITS: Record<string, number> = {
  free: 10,
  starter: 130, // 120 + 10
  pro: 300,    // 290 + 10
  enterprises: 4500  // 4490 + 10
};

// Constants moved to translations.ts

export default function Home() {
  const { toast } = useToast();
  const [isReady, setIsReady] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubscribeLoading, setIsSubscribeLoading] = useState<string | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [showMenu, setShowMenu] = useState(false);
  const [showCalc, setShowCalc] = useState(false);
  const [view, setView] = useState<"main" | "history" | "profile" | "pricing">("main");
  const [publicView, setPublicView] = useState<"landing" | "about" | "contact" | "privacy" | "terms">("landing");
  const [selectedEntry, setSelectedEntry] = useState<any | null>(null);
  const [chatInput, setChatInput] = useState("");
  const [currentAnalysisImage, setCurrentAnalysisImage] = useState<string | null>(null);
  const [menuType, setMenuType] = useState<"prescription" | "medicine" | "lab">("prescription");
  const [showLabForm, setShowLabForm] = useState(false);
  const [labPatientData, setLabPatientData] = useState({
    age: "",
    gender: "male" as "male" | "female",
    isPregnant: false,
    clinicalNotes: ""
  });
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [supportMessage, setSupportMessage] = useState("");
  const [isSendingSupport, setIsSendingSupport] = useState(false);
  const [expiryWarning, setExpiryWarning] = useState<string | null>(null);

  // Checkout Modal State
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [selectedCheckoutPlan, setSelectedCheckoutPlan] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"mastercard" | "visa">("mastercard");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardName, setCardName] = useState("");

  const [calcData, setCalcData] = useState({ drug: "", weight: "", age: "" });
  const inputRef = useRef<HTMLInputElement>(null);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">((localStorage.getItem("theme") as "light" | "dark") || "dark");
  const [totalCredits, setTotalCredits] = useState<number>(10);
  const [maxLimit, setMaxLimit] = useState<number>(10);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [activeVersion, setActiveVersion] = useState<string>("v10.22-social");
  const [subscriptionTier, setSubscriptionTier] = useState<string>("free");
  const [subscriptionExpiresAt, setSubscriptionExpiresAt] = useState<string | null>(null);
  const [lang, setLang] = useState<"ar" | "en">((localStorage.getItem("lang") as "ar" | "en") || "ar");
  const [currentHistoryId, setCurrentHistoryId] = useState<string | null>(null);

  const t = (key: keyof typeof translations.ar) => (translations[lang] as any)[key] || key;

  const syncRoute = useCallback(() => {
    const path = window.location.pathname;
    const cleanPath = path.endsWith('/') ? path.slice(0, -1) : path;

    if (cleanPath === "/about") setPublicView("about");
    else if (cleanPath === "/contact") setPublicView("contact");
    else if (cleanPath === "/privacy-policy") setPublicView("privacy");
    else if (cleanPath === "/terms-of-use") setPublicView("terms");
    else setPublicView("landing");
  }, []);

  const navigate = (to: "landing" | "about" | "contact" | "privacy" | "terms") => {
    const paths = {
      landing: "/",
      about: "/about",
      contact: "/contact",
      privacy: "/privacy-policy",
      terms: "/terms-of-use"
    };
    window.history.pushState({}, "", paths[to]);
    setPublicView(to);
    window.scrollTo(0, 0);
  };

  useEffect(() => {
    syncRoute();
    window.addEventListener("popstate", syncRoute);

    const initSession = async () => {
      try {
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Supabase timeout")), 5000)
        );

        const { data: { session } } = await Promise.race([
          supabase.auth.getSession(),
          timeoutPromise
        ]) as any;

        setSession(session);
        setIsLoggedIn(!!session);
        if (session) {
          const savedHistory = localStorage.getItem(`history_${session.user.id}`);
          if (savedHistory) setHistory(JSON.parse(savedHistory));
          const savedCredits = localStorage.getItem(`credits_${session.user.id}`);
          if (savedCredits) {
            const credits = parseInt(savedCredits);
            // Emergency migration for users stuck with 25 cached
            if (credits > 10 && !localStorage.getItem(`migrated_10_v2`)) {
              setTotalCredits(10);
              localStorage.setItem(`credits_${session.user.id}`, "10");
              localStorage.setItem(`migrated_10_v2`, "true");
            } else {
              setTotalCredits(credits);
            }
          }
          const savedMax = localStorage.getItem(`max_${session.user.id}`);
          if (savedMax) setMaxLimit(parseInt(savedMax));
        }
      } catch (e) {
        console.error("Session init failed or timed out", e);
      } finally {
        setIsReady(true);
      }
    };

    initSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setIsLoggedIn(!!session);
      if (session) {
        // Fetch real profile from DB
        try {
          const res = await fetch(`${API_BASE_URL}/api/profile`, {
            headers: { "Authorization": `Bearer ${session.access_token}` }
          });
          const profile = await res.json();
          if (res.ok) {
            setTotalCredits(profile.credits);
            setMaxLimit(profile.maxCredits ?? 10);
            setExpiryWarning(profile.expiryWarning);
            setSubscriptionTier(profile.subscriptionTier || "free");
            setSubscriptionExpiresAt(profile.subscriptionExpiresAt || null);
            setActiveVersion(profile.serverVersion || "v10.11-unknown");
            setProfileLoaded(true);
            console.log("[FarmaTech] Profile Loaded, Version:", profile.serverVersion);
            localStorage.setItem(`credits_${session.user.id}`, (profile.credits ?? 0).toString());
            localStorage.setItem(`max_${session.user.id}`, (profile.maxCredits ?? 10).toString());
          }
        } catch (e) { console.error("Profile fetch failed", e); }

        const fetchHistory = async () => {
          try {
            const hRes = await fetch(`${API_BASE_URL}/api/history`, {
              headers: { "Authorization": `Bearer ${session.access_token}` }
            });
            const hData = await hRes.json();
            if (hRes.ok) setHistory(hData);
          } catch (e) { console.error("History fetch failed", e); }
        };
        fetchHistory();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSendSupport = async () => {
    if (!supportMessage.trim()) return;
    setIsSendingSupport(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/support`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: supportMessage,
          userEmail: session?.user?.email || "Guest"
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast({ title: lang === 'ar' ? "تم الإرسال" : "Sent", description: lang === 'ar' ? "وصلت رسالتك لفريق الدعم بنجاح" : "Your message reached support successfully" });
        setSupportMessage("");
        setShowSupportModal(false);
      } else {
        toast({ title: "Error", description: data.error, variant: "destructive" });
      }
    } catch (e) {
      toast({ title: "Error", description: "Failed to connect", variant: "destructive" });
    } finally {
      setIsSendingSupport(false);
    }
  };

  const formatBoldText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <span key={i} className={`font-extrabold ${theme === 'dark' ? 'text-teal-400' : 'text-teal-700'}`}>
            {part.slice(2, -2)}
          </span>
        );
      }
      return part;
    });
  };

  const renderFormattedResult = (text: string) => {
    if (!text) return null;
    const lines = text.split("\n");
    const isRtl = lang === 'ar';
    return (
      <div
        className={`space-y-4 w-full animate-in fade-in slide-in-from-bottom-2 duration-700 leading-relaxed ${isRtl ? 'text-right' : 'text-left'}`}
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        {lines.map((line, i) => {
          const trimmed = line.trim();
          // Horizontal Divider
          if (trimmed === "---" || /^_{10,}$/.test(trimmed)) {
            return <hr key={i} className={`border-t my-8 w-full ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`} />;
          }

          // Special Headers with Icons
          const isWarning = trimmed.includes("⚠️") ||
            trimmed.includes("ملاحظات هامة للصرف") ||
            trimmed.includes("[تنبيه للتدخل]") ||
            trimmed.includes("Important Dispensing Notes") ||
            trimmed.includes("[Intervention Alert]") ||
            trimmed.includes("Important Warnings");

          if (isWarning) {
            return (
              <div key={i} className={`${theme === 'dark' ? 'bg-orange-950/30 border-orange-600' : 'bg-orange-50 border-orange-500'} ${isRtl ? 'border-r-4' : 'border-l-4'} p-4 rounded-lg mt-6 mb-4 flex items-center gap-3`}>
                <span className="text-2xl">⚠️</span>
                <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-orange-400' : 'text-orange-700'}`}>
                  {formatBoldText(trimmed.replace("⚠️", "").trim())}
                </h3>
              </div>
            );
          }

          const isMajorHeader = trimmed.includes("قراءة الروشتة") ||
            trimmed.includes("تحليل الفحص المختبري") ||
            trimmed.includes("التحليل السريري وخطة العمل") ||
            trimmed.includes("نقاط استشارة المريض") ||
            trimmed.includes("الخلاصة") ||
            trimmed.includes("Prescription Reading") ||
            trimmed.includes("Lab Report Analysis") ||
            trimmed.includes("Clinical Analysis and Action Plan") ||
            trimmed.includes("Patient Counseling Points") ||
            trimmed.includes("Conclusion");

          if (isMajorHeader) {
            return (
              <h2 key={i} className={`text-xl font-black mt-8 mb-4 flex items-center gap-3 ${theme === 'dark' ? 'text-teal-300' : 'text-teal-800'}`}>
                <div className="w-2 h-8 bg-emerald-500 rounded-full"></div>
                {formatBoldText(trimmed.replace("###", "").trim())}
              </h2>
            );
          }

          // Headings
          if (trimmed.startsWith("###")) {
            return (
              <h3 key={i} className={`text-lg font-black mt-6 mb-2 ${isRtl ? 'border-r-4 pr-3' : 'border-l-4 pl-3'} py-2 rounded-xl ${theme === 'dark' ? 'text-teal-400 border-emerald-600 bg-emerald-900/20' : 'text-teal-700 border-emerald-500 bg-emerald-50'}`}>
                {formatBoldText(trimmed.replace("###", "").trim())}
              </h3>
            );
          }

          // Bullet Points
          if (trimmed.startsWith("-") || trimmed.startsWith("*") || trimmed.startsWith("•")) {
            return (
              <div key={i} className={`flex gap-3 items-start mb-3 ${isRtl ? 'pr-2' : 'pl-2'} group`}>
                <div className={`min-w-[8px] h-2 bg-emerald-500 rounded-full mt-2.5 shadow-[0_0_8px_rgba(16,185,129,0.5)] group-hover:scale-125 transition-transform`}></div>
                <p className={`text-sm md:text-base leading-relaxed ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                  {formatBoldText(trimmed.substring(1).trim())}
                </p>
              </div>
            );
          }

          // Numbered lists
          if (/^\d+[\.\-\:]/.test(trimmed)) {
            const separator = trimmed.match(/[\.\-\:]/)?.[0] || ".";
            const num = trimmed.split(separator)[0];
            const content = trimmed.split(separator).slice(1).join(separator).trim();
            return (
              <div key={i} className={`flex gap-4 items-center mb-6 mt-8 p-3 rounded-xl border ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500 text-white font-black text-sm shrink-0 shadow-lg shadow-emerald-500/20">
                  {num}
                </div>
                <p className={`font-bold text-base md:text-lg ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
                  {formatBoldText(content)}
                </p>
              </div>
            );
          }

          // Normal Paragraph
          return (
            <p key={i} className={`text-sm md:text-base ${isRtl ? 'pr-2' : 'pl-2'} mb-2 leading-loose ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
              {formatBoldText(trimmed)}
            </p>
          );
        })}
      </div>
    );
  };

  const compressImage = async (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDim = 1000;
        
        if (width > height && width > maxDim) {
          height *= maxDim / width;
          width = maxDim;
        } else if (height > maxDim) {
          width *= maxDim / height;
          height = maxDim;
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);
        }
        canvas.toBlob((blob) => {
          URL.revokeObjectURL(img.src);
          if (blob) resolve(blob);
          else reject(new Error("Compression failed"));
        }, 'image/jpeg', 0.6);
      };
      img.onerror = () => {
        URL.revokeObjectURL(img.src);
        reject(new Error("Image load failed"));
      };
    });
  };

  const handleAction = async (
    type: "image" | "text" | "calc",
    payload?: any,
  ) => {
    setIsLoading(true);
    // Safety timeout: auto-stop loading after 15 seconds to prevent getting stuck
    const loadingTimeout = setTimeout(() => setIsLoading(false), 15000);

    setShowMenu(false);
    setShowCalc(false);
    setResult("");
    const formData = new FormData();
    formData.append("lang", lang);
    // Use Supabase Session Token instead of simple accessCode
    formData.append("accessCode", session?.access_token || "");
    let displayImage = "/logo.png";
    if (type === "image") {
      let compressedFile = payload;
      if (payload instanceof File) {
        try {
          compressedFile = await compressImage(payload);
          console.log(`[FarmaTech] Image compressed. Original: ${payload.size}b, Compressed: ${compressedFile.size}b`);
        } catch (e) {
          console.warn("[FarmaTech] Compression failed, using original", e);
        }
      }
      formData.append("image", compressedFile);
      displayImage = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(compressedFile);
        reader.onload = () => resolve(reader.result as string);
      });
      setCurrentAnalysisImage(displayImage);

      if (menuType === "medicine") {
        const medicinePrompt = lang === 'ar'
          ? "تعرف على هذا الدواء من صورته وقدم معلوماته الصيدلانية (الاسم والفاعلية والاستخدام) مع استخراج الباركود أو السيريال إن وجدا بوضوح."
          : "Identify this medicine from its image and provide its pharmaceutical information (Name, active ingredients, and usage) along with extracting the Barcode or Serial number if clearly visible.";
        formData.append("prompt", medicinePrompt);
      } else if (menuType === "lab") {
        const patientContext = lang === 'ar'
          ? `بيانات المريض: العمر ${labPatientData.age} سنة، الجنس ${labPatientData.gender === 'male' ? 'ذكر' : 'أنثى'}${labPatientData.gender === 'female' ? (labPatientData.isPregnant ? '، حالة الحمل: حامل' : '، حالة الحمل: غير حامل') : ''}، الملاحظات السريرية: ${labPatientData.clinicalNotes || 'سليم'}.`
          : `Patient Data: Age ${labPatientData.age}, Gender ${labPatientData.gender}${labPatientData.gender === 'female' ? (labPatientData.isPregnant ? ', Pregnancy: Pregnant' : ', Pregnancy: Not Pregnant') : ''}, Clinical Notes: ${labPatientData.clinicalNotes || 'Healthy'}.`;
        const labPrompt = lang === 'ar'
          ? `${patientContext}\nقم بتحليل نتائج هذا التقرير المختبري. استخرج كل فحص مع نتيجته والوحدة والمدى الطبيعي. وضح إذا كانت النتائج طبيعية أو خارج المدى بناءً على عمر وجنس المريض، وقدم شرحاً مبسطاً لكل فحص وأهميته السريرية بالنسبة لحالته المذكورة مع توصيات صيدلانية مناسبة.`
          : `${patientContext}\nAnalyze the results of this laboratory report. Extract each test with its result, unit, and reference range. Indicate if the results are normal or out of range considering the patient's age and gender. Provide a simplified explanation for each test and its clinical significance given the patient's data, along with appropriate pharmaceutical recommendations.`;
        formData.append("prompt", labPrompt);
      } else {
        formData.append("prompt", chatInput || (lang === 'ar' ? "حلل هذه الصورة واستخرج كافة البيانات الطبية منها بدقة." : "Analyze this image and extract all medical data accurately."));
      }
    } else if (type === "calc") {
      formData.append(
        "prompt",
        `احسب الجرعة لـ: ${calcData.drug}، الوزن: ${calcData.weight} كجم، العمر: ${calcData.age}`
      );
    } else {
      formData.append("prompt", chatInput);
    }

    if (type === "text") {
      // Removed lastQuery/messages logic
    }

    // Fallback to Gemini AI if free search fails or if it's an image/calc
    try {
      if (currentHistoryId) {
        formData.append("historyId", currentHistoryId);
      }

      const res = await fetch(`${API_BASE_URL}/api/analyze`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        if (data.labReportDetected) {
          setResult("");
          setMenuType("lab");
          setShowLabForm(true);
          toast({
            variant: "destructive",
            title: lang === 'ar' ? "تنبيه: تم اكتشاف فحص مختبري" : "Alert: Lab Report Detected",
            description: lang === 'ar'
              ? "هذا الملف يبدو كفحص مختبري. يرجى إكمال البيانات التالية لتحليله بدقة في القسم المخصص."
              : "This file appears to be a lab report. Please complete the following details to analyze it accurately in the dedicated section."
          });
          return;
        }

        if (data.prescriptionDetected) {
          setResult("");
          setMenuType("prescription");
          setShowMenu(true);
          toast({
            variant: "destructive",
            title: lang === 'ar' ? "تنبيه: تم اكتشاف وصفة طبية" : "Alert: Prescription Detected",
            description: lang === 'ar'
              ? "هذا الملف يبدو كوصفة طبية (روشتة). يرجى استخدامه في قسم 'تحليل الوصفة الطبية'."
              : "This file appears to be a medical prescription. Please use it in the 'Prescription Analysis' section."
          });
          return;
        }

        setResult(data.result);
        if (data.historyId) setCurrentHistoryId(data.historyId);
        setChatInput("");

        // Immediate Credit Update from Analysis Response
        if (data.credits !== undefined) {
          setTotalCredits(data.credits);
          localStorage.setItem(`credits_${session?.user?.id}`, data.credits.toString());
          if (data.maxCredits !== undefined) {
            setMaxLimit(data.maxCredits);
            localStorage.setItem(`max_${session?.user?.id}`, data.maxCredits.toString());
          }
        }

        // Refresh history
        const hRes = await fetch(`${API_BASE_URL}/api/history`, {
          headers: { "Authorization": `Bearer ${session.access_token}` }
        });
        const hData = await hRes.json();
        if (hRes.ok) setHistory(hData);
      } else {
        const errorMsg = data.error || "خطأ في الاتصال بالسيرفر";
        setResult(`⚠️ ${errorMsg}`);
        setChatInput("");
      }
    } catch (e: any) {
      console.error(e);
      setResult(`⚠️ ${lang === 'ar' ? 'فشل الاتصال بالذكاء الاصطناعي. يرجى المحاولة مرة أخرى.' : 'Failed to connect to AI. Please try again.'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubscribe = (planId: string) => {
    setSelectedCheckoutPlan(planId);
    setShowCheckoutModal(true);
  };

  const confirmCheckout = async () => {
    if (!selectedCheckoutPlan) return;
    setIsSubscribeLoading(selectedCheckoutPlan);
    setShowCheckoutModal(false);
    try {
      const res = await fetch(`${API_BASE_URL}/api/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: selectedCheckoutPlan,
          paymentMethod: paymentMethod,
          amount: selectedCheckoutPlan === 'enterprises' ? 200 : selectedCheckoutPlan === 'pro' ? 120 : selectedCheckoutPlan === 'pro_monthly' ? 20 : 10,
          token: session?.access_token
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast({
          title: lang === 'ar' ? "تم الدفع بنجاح" : "Payment Successful",
          description: data.message,
        });
        setTotalCredits(data.newTotal);
        if (data.newMax) {
          setMaxLimit(data.newMax);
          localStorage.setItem(`max_${session?.user?.id}`, data.newMax.toString());
        }
        setSubscriptionTier(selectedCheckoutPlan);
        setView("profile");
      } else {
        toast({
          variant: "destructive",
          title: lang === 'ar' ? "خطأ في الدفع" : "Payment Error",
          description: data.error,
        });
      }
    } catch (e: any) {
      console.error(e);
      toast({
        variant: "destructive",
        title: lang === 'ar' ? "خطأ" : "Error",
        description: e.message,
      });
    } finally {
      setIsSubscribeLoading(null);
      setSelectedCheckoutPlan(null);
      setCardNumber("");
      setCardExpiry("");
      setCardCvv("");
      setCardName("");
    }
  };

  const copyToClipboard = async (text: string, successMessage: string) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        toast({ title: successMessage, description: "" });
      } else {
        throw new Error("Clipboard API not available");
      }
    } catch (err) {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        toast({ title: successMessage, description: "" });
      } catch (e) {
        console.error("Fallback copy failed", e);
      }
      document.body.removeChild(textArea);
    }
  };

  const downloadAsPDF = (title: string, content: string, image?: string | null) => {
    toast({ title: t('postPrepared'), description: "" });
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <html dir="${lang === 'ar' ? 'rtl' : 'ltr'}">
        <head>
          <title>${title}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Noto+Sans+Arabic:wght@400;700&display=swap');
            body { 
              font-family: ${lang === 'ar' ? "'Noto Sans Arabic'" : "'Inter'"}, sans-serif; 
              padding: 40px; 
              line-height: 1.6; 
              color: #1a1a1a;
              max-width: 800px;
              margin: 0 auto;
            }
            .header { 
              text-align: center; 
              margin-bottom: 40px; 
              border-bottom: 2px solid #0d9488; 
              padding-bottom: 20px; 
            }
            .logo { font-size: 28px; font-weight: bold; color: #0d9488; margin-bottom: 8px; }
            .subtitle { font-size: 14px; color: #6b7280; }
            .title { font-size: 22px; margin: 24px 0; color: #111827; font-weight: 700; }
            .content { 
              white-space: pre-wrap; 
              font-size: 16px; 
              background: #fdfdfd; 
              padding: 24px; 
              border-radius: 16px; 
              border: 1px solid #e5e7eb;
              box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
            }
            .image-container { text-align: center; margin-bottom: 30px; }
            .image { max-width: 100%; max-height: 400px; height: auto; border-radius: 16px; border: 4px solid white; box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1); }
            .footer { 
              margin-top: 60px; 
              font-size: 12px; 
              color: #9ca3af; 
              text-align: center; 
              border-top: 1px solid #f3f4f6; 
              padding-top: 30px; 
            }
            @media print {
              body { padding: 20px; }
              .content { border: none; box-shadow: none; background: transparent; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">FarmaTech <span style="color: rgb(52, 211, 153);">AI</span></div>
            <div class="subtitle">${translations[lang].subtitle}</div>
            <div class="title">${title}</div>
          </div>
          ${image ? `<div class="image-container"><img src="${image}" class="image" /></div>` : ''}
          <div class="content">${content}</div>
          <div class="footer">
            ${lang === 'ar' ? 'تم إنشاء هذا التقرير بواسطة FarmaTech AI - مساعدك الصيدلي الذكي' : 'Generated by FarmaTech AI - Your Smart Pharmacist Assistant'}
            <br/>
            ${new Date().toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US')}
          </div>
          <script>
            window.onload = () => {
              window.print();
              setTimeout(() => window.close(), 1000);
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  const shareContent = async (title: string, text: string, imageUrl?: string | null) => {
    const shareData: any = { title, text };

    try {
      if (imageUrl && navigator.canShare && navigator.canShare({ files: [] })) {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const file = new File([blob], "medicine-analysis.png", { type: blob.type });
        if (navigator.canShare({ files: [file] })) {
          shareData.files = [file];
        }
      }
    } catch (e) {
      console.warn("Failed to prepare file for sharing", e);
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (e: any) {
        if (e.name !== 'AbortError') {
          copyToClipboard(text, t('postPrepared'));
        }
      }
    } else {
      copyToClipboard(text, t('postPrepared'));
    }
  };

  if (!isReady) return null;

  // --- Login Screen ---
  if (!isLoggedIn) {
    if (publicView === "terms") {
      return <TermsOfUse onBack={() => navigate("landing")} theme={theme} lang={lang} />;
    }
    if (publicView === "privacy") {
      return <PrivacyPolicy onBack={() => navigate("landing")} theme={theme} lang={lang} />;
    }
    if (publicView === "contact") {
      return <ContactPage onBack={() => navigate("landing")} theme={theme} lang={lang} API_BASE_URL={API_BASE_URL} />;
    }
    if (publicView === "about") {
      return <AboutPage onBack={() => navigate("landing")} theme={theme} lang={lang} />;
    }
    const features = [
      {
        icon: <FileSignature className="w-6 h-6 text-emerald-400" />,
        title: t('prescriptionAnalysis'),
        desc: lang === 'ar' ? "تحويل فوري ودقيق للوصفات اليدوية" : "Instant and accurate conversion of handwritten prescriptions",
      },
      {
        icon: <FlaskConical className="w-6 h-6 text-emerald-400" />,
        title: t('labReportAnalysis'),
        desc: t('labReportAnalysisDesc'),
      },
      {
        icon: <ScanBarcode className="w-6 h-6 text-emerald-400" />,
        title: t('medicineScan'),
        desc: lang === 'ar' ? "فحص المعلومات الدوائية المباشرة" : "Direct scan for medication information",
      },
      {
        icon: <AlertTriangle className="w-6 h-6 text-emerald-400" />,
        title: t('drugInteractions'),
        desc: lang === 'ar' ? "كاشف التفاعلات الدوائية الخطيرة" : "Check for dangerous drug-drug interactions",
      },
      {
        icon: <Calculator className="w-6 h-6 text-emerald-400" />,
        title: t('doseCalculator'),
        desc: lang === 'ar' ? "دقة متناهية للأطفال والبالغين" : "Extreme precision for children and adults",
      },
      {
        icon: <Sparkles className="w-6 h-6 text-emerald-400" />,
        title: t('smartAdvice'),
        desc: lang === 'ar' ? "إجابات فورية لأي استفسار دوائي" : "Instant answers for any medication inquiry",
      },
    ];

    const plans = [
      {
        id: "free",
        name: t('planFreeName'),
        price: t('planFreePrice'),
        period: t('planFreePeriod'),
        desc: t('planFreeDesc'),
        features: t('planFreeFeatures') as string[],
        buttonProps: { text: t('aboutStartNow'), primary: false }
      },
      {
        id: "starter",
        name: t('planStarterName'),
        price: t('planStarterPrice'),
        period: t('planStarterPeriod'),
        desc: t('planStarterDesc'),
        features: t('planStarterFeatures') as string[],
        buttonProps: { text: lang === 'ar' ? "اشترك في Starter" : "Subscribe to Starter", primary: false }
      },
      {
        id: "pro_monthly",
        name: t('planProName'),
        price: t('planProPrice'),
        period: t('planProPeriod'),
        desc: t('planProDesc'),
        features: t('planProFeatures') as string[],
        buttonProps: { text: lang === 'ar' ? "اشترك في Pro" : "Subscribe to Pro", primary: true },
        badge: lang === 'ar' ? "الأكثر مبيعاً" : "Best Seller"
      },
      {
        id: "pro",
        name: t('planProfessionalName'),
        price: t('planProfessionalPrice'),
        period: t('planProfessionalPeriod'),
        desc: t('planProfessionalDesc'),
        features: t('planProfessionalFeatures') as string[],
        buttonProps: { text: lang === 'ar' ? "اشترك في الاحترافي" : "Subscribe Professional", primary: false },
      },
      {
        id: "enterprises",
        name: t('planEnterprisesName'),
        price: t('planEnterprisesPrice'),
        period: t('planEnterprisesPeriod'),
        desc: t('planEnterprisesDesc'),
        features: t('planEnterprisesFeatures') as string[],
        buttonProps: { text: lang === 'ar' ? "انضم للمؤسسات" : "Join Enterprises", primary: false }
      }
    ];

    const testimonials = [
      {
        quote: lang === 'ar'
          ? "لطالما كان البحث في المراجع الورقية يستهلك وقتي أثناء ازدحام الصيدلية، لكن FarmaTech AI اختصر المسافة بضغطة زر. دقة النظام في كشف تداخلات الأدوية المعقدة منحتني طمأنينة كاملة عند صرف الوصفات المزمنة."
          : "Paper references used to consume my time during pharmacy rushes, but FarmaTech AI bridged the gap with a button click. The system's accuracy in detecting complex drug interactions gave me peace of mind when dispensing chronic prescriptions.",
        author: lang === 'ar' ? "د. لؤي الراوي" : "Dr. Louay Al-Rawi",
        role: lang === 'ar' ? "صيدلي ممارسة" : "Advanced Practice Pharmacist",
        avatar: "L",
        color: "bg-[#34d399]"
      },
      {
        quote: lang === 'ar'
          ? "كنت أبحث عن أداة ذكية تدعم قراراتي السريرية داخل المستشفى، ووجدت في FarmaTech AI المساعد المثالي. ميزة الـ OCR وقراءة الملاحظات الطبية دقيقة جداً وتساعد في تلافي الأخطاء الدوائية التي قد تغيب عن العين البشرية."
          : "I was looking for a smart tool to support my clinical decisions in the hospital, and I found the perfect assistant in FarmaTech AI. The OCR feature and medical notes reading are very accurate and help avoid medication errors human eyes might miss.",
        author: lang === 'ar' ? "د. سارة المشهداني" : "Dr. Sara Al-Mashhadani",
        role: lang === 'ar' ? "صيدلانية سريرية" : "Clinical Pharmacist",
        avatar: "S",
        color: "bg-[#34d399]"
      },
      {
        quote: lang === 'ar'
          ? "بصراحة، النظام غيّر روتين عملي اليومي. لم يعد الأمر مجرد صرف أدوية، بل أصبح لدي مستشار تقني يحلل الجرعات ويقدم لي المعلومة المحدثة فوراً، مما زاد من ثقة المرضى في التوجيهات التي أقدمها لهم."
          : "Honestly, the system changed my daily work routine. It's no longer just dispensing meds; I now have a tech consultant analyzing doses and providing instant info, boosting patients' trust in my guidance.",
        author: lang === 'ar' ? "د. حسن البصري" : "Dr. Hassan Al-Basri",
        role: lang === 'ar' ? "صيدلاني" : "Pharmacist",
        avatar: "H",
        color: "bg-[#34d399]"
      },
      {
        quote: lang === 'ar'
          ? "ما يميز FarmaTech AI هو جمعه بين سرعة الذكاء الاصطناعي وموثوقية المصادر العلمية. أعتبره أداة تعليمية وتطبيقية جبارة تساعد الصيادلة والطلاب على مواكبة أحدث البروتوكولات العلاجية بكل سهولة ويسر."
          : "What distinguishes FarmaTech AI is its blend of AI speed and scientific source reliability. I consider it a powerful educational and practical tool helping pharmacists and students keep up with the latest protocols easily.",
        author: lang === 'ar' ? "زينة العبيدي" : "Zaina Al-Obaidi",
        role: lang === 'ar' ? "طالبة كلية صيدلة" : "Pharmacy Student",
        avatar: "Z",
        color: "bg-[#34d399]"
      }
    ];

    const faqs = [
      {
        q: lang === 'ar' ? "ما الذي يميز FarmaTech AI عن محركات البحث التقليدية؟" : "What distinguishes FarmaTech AI from traditional search engines?",
        a: lang === 'ar' ? "صُمم نظامنا خصيصاً للصيادلة؛ فهو لا يكتفي بعرض المعلومات، بل يحلل التداخلات الدوائية، ويقرأ الوصفات اليدوية (OCR)، ويقدم توصيات دقيقة مبنية على أحدث البروتوكولات العلاجية المعتمدة عالمياً." : "Our system is specifically designed for pharmacists; it doesn't just display information, but analyzes drug interactions, reads handwritten prescriptions (OCR), and provides accurate recommendations based on the latest globally approved treatment protocols."
      },
      {
        q: lang === 'ar' ? "هل نتائج الذكاء الاصطناعي موثوقة للاستخدام السريري؟" : "Are AI results reliable for clinical use?",
        a: lang === 'ar' ? "نعم، يعتمد نظامنا على قواعد بيانات طبية محدثة باستمرار. ومع ذلك، نؤكد أن FarmaTech AI هو أداة \"دعم قرار\" لمساعدة الصيدلي، وتظل المسؤولية المهنية النهائية والتقييم السريري على عاتق الممارس الصحي المرخص." : "Yes, our system relies on constantly updated medical databases. However, we emphasize that FarmaTech AI is a \"decision support\" tool to assist the pharmacist, and the final professional responsibility and clinical evaluation remain with the licensed health practitioner."
      },
      {
        q: lang === 'ar' ? "كيف يضمن النظام خصوصية بيانات المرضى والصيدلية؟" : "How does the system ensure patient and pharmacy data privacy?",
        a: lang === 'ar' ? "نحن نستخدم بروتوكولات تشفير متقدمة لحماية بياناتك. جميع العمليات التي تتم عبر المنصة مشفرة بالكامل، ولا يتم مشاركة أي معلومات حساسة أو بيانات مرضى مع أي أطراف خارجية تحت أي ظرف." : "We use advanced encryption protocols to protect your data. All operations through the platform are fully encrypted, and no sensitive information or patient data is shared with any external parties under any circumstances."
      },
      {
        q: lang === 'ar' ? "هل يدعم النظام قراءة الوصفات المكتوبة بخط اليد؟" : "Does the system support reading handwritten prescriptions?",
        a: lang === 'ar' ? "بالتأكيد، يوفر FarmaTech AI ميزة قراءة ذكية (OCR) متطورة قادرة على تحليل الخطوط اليدوية وتحديد الأدوية والجرعات المطلوبة، مما يقلل من احتمالية الخطأ البشري في الصرف." : "Absolutely, FarmaTech AI provides an advanced smart reading (OCR) feature capable of analyzing handwriting and identifying required medications and dosages, reducing the possibility of human error in dispensing."
      },
      {
        q: lang === 'ar' ? "هل يمكنني استخدام FarmaTech AI على أكثر من جهاز؟" : "Can I use FarmaTech AI on more than one device?",
        a: lang === 'ar' ? "نعم، المنصة سحابية بالكامل؛ يمكنك الوصول إلى حسابك واستخدام أدوات الذكاء الاصطناعي من هاتفك المحمول، جهازك اللوحي، أو حاسوب الصيدلية الشخصي في آن واحد." : "Yes, the platform is fully cloud-based; you can access your account and use AI tools from your mobile phone, tablet, or personal pharmacy computer simultaneously."
      },
      {
        q: lang === 'ar' ? "ما هي باقات الاشتراك وهل توجد فترة تجريبية؟" : "What are the subscription plans and is there a trial period?",
        a: lang === 'ar' ? "نوفر باقات متنوعة تناسب الصيدليات الفردية والمجموعات الكبيرة. نعم، يمكنك البدء بفترة تجريبية مجانية لاستكشاف كافة الميزات والأدوات قبل الالتزام بأي اشتراك مدفوع." : "We provide various plans suitable for individual pharmacies and large groups. Yes, you can start with a free trial period to explore all features and tools before committing to any paid subscription."
      }
    ];

    return (
      <div
        className={`min-h-screen relative flex flex-col ${theme === 'dark' ? 'bg-[#010309]' : 'bg-[#f8fafc]'} ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'} font-sans selection:bg-emerald-500/30 overflow-x-hidden transition-colors duration-500`}
        dir={lang === 'ar' ? 'rtl' : 'ltr'}
      >
        {/* --- FIXED NAVBAR --- */}
        <nav className={`fixed top-0 z-[100] w-full border-b transition-all duration-500 backdrop-blur-md ${theme === 'dark' ? 'bg-[#010309]/80 border-white/5 shadow-2xl shadow-black/20' : 'bg-white/70 border-emerald-100/50 shadow-sm'}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
            {/* Logo */}
            <div
              className="flex items-center gap-2 cursor-pointer group"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-xl p-[1px] shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-[#020817] rounded-xl flex items-center justify-center overflow-hidden">
                  <img src="/logo.png" alt="PharmaTech" className="w-7 h-7 object-contain" />
                </div>
              </div>
              <h1 className={`text-xl font-black transition-colors ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                FarmaTech <span className="text-[#34d399]">AI</span>
              </h1>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {/* Theme Toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  const newTheme = theme === 'dark' ? 'light' : 'dark';
                  setTheme(newTheme);
                  localStorage.setItem("theme", newTheme);
                }}
                className={`rounded-full transition-all duration-300 ${theme === 'dark' ? 'text-slate-400 hover:text-amber-400 hover:bg-white/5 border border-white/5' : 'text-slate-500 hover:text-indigo-600 hover:bg-slate-100 border border-slate-200'}`}
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </Button>

              {/* Language Switcher */}
              <Button
                onClick={() => {
                  const newLang = lang === 'ar' ? 'en' : 'ar';
                  setLang(newLang);
                  localStorage.setItem("lang", newLang);
                }}
                className={`rounded-full px-4 py-2 font-bold text-xs flex items-center gap-2 transition-all duration-300 shadow-lg ${theme === 'dark' ? 'bg-white/5 border border-white/10 hover:bg-white/10 text-white shadow-black/20' : 'bg-white border border-slate-200 hover:bg-slate-50 text-slate-900 shadow-slate-200'}`}
              >
                <Languages className="w-4 h-4 text-emerald-400" />
                {t('changeLang')}
              </Button>
            </div>
          </div>
        </nav>
        {/* Global Abstract Background Effects */}
        <div className="fixed inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
        <div className="fixed top-[-20%] left-[-10%] w-[800px] h-[800px] blur-[150px] rounded-full pointer-events-none opacity-20 bg-emerald-900/40"></div>
        <div className="fixed bottom-[-20%] right-[-10%] w-[800px] h-[800px] blur-[150px] rounded-full pointer-events-none opacity-20 bg-blue-900/40"></div>

        {/* --- HERO SECTION --- */}
        <section className="min-h-screen w-full flex items-center relative z-10 pt-40 lg:pt-32 pb-12">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">

              <div className={`lg:col-span-7 flex flex-col justify-center text-center ${lang === 'ar' ? 'lg:text-right' : 'lg:text-left'} space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 mt-10 lg:mt-0`}>
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-semibold ${lang === 'ar' ? 'lg:ml-auto lg:mr-0' : 'lg:mr-auto lg:ml-0'} mx-auto w-fit backdrop-blur-sm shadow-[0_0_15px_rgba(16,185,129,0.1)]`}>
                  <Sparkles className="w-4 h-4" />
                  <span>{t('heroBadge')}</span>
                </div>

                <div className="space-y-6">
                  <h1 className={`text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                    {t('heroTitle').split('.')[0]} <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-600 font-black drop-shadow-sm">
                      {t('heroTitle').split('.')[1] || "AI Powered"}
                    </span>
                  </h1>

                  <h2 className="text-2xl md:text-3xl font-bold text-emerald-300/90 tracking-wide">
                    {t('heroSubtitle')}
                  </h2>

                  <p className={`text-lg lg:text-xl font-medium leading-relaxed max-w-2xl mx-auto lg:ms-0 lg:me-auto ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                    {t('heroDescription')}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 shrink-0 max-w-2xl mx-auto lg:ms-0 lg:me-auto w-full mb-10 lg:mb-0">
                  {features.map((feature, idx) => (
                    <div key={idx} className={`flex items-start gap-4 p-4 rounded-2xl border transition-all duration-300 ${theme === 'dark' ? 'bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.04]' : 'bg-white border-emerald-100/50 shadow-sm hover:shadow-md hover:border-emerald-200'}`}>
                      <div className="mt-1 p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)] shrink-0">
                        {feature.icon}
                      </div>
                      <div>
                        <h3 className={`font-bold text-base mb-1 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{feature.title}</h3>
                        <p className="text-slate-400 text-sm">{feature.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-5 flex justify-center lg:justify-end pb-12 lg:pb-0">
                <div className="w-full max-w-md p-[1px] rounded-[2.5rem] bg-gradient-to-b from-emerald-500/30 via-slate-800/40 to-slate-900/50 relative group animate-in fade-in zoom-in-95 duration-[1200ms] shadow-2xl shadow-emerald-900/20">
                  <div className="absolute inset-0 bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-xl rounded-[2.5rem]"></div>

                  <div className="h-full w-full rounded-[2.5rem] bg-[#020817]/90 backdrop-blur-2xl p-8 sm:p-10 relative overflow-hidden flex flex-col items-center">
                    <div className="absolute top-0 inset-x-0 h-px w-1/2 mx-auto bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-50"></div>

                    <div className="relative z-10 mb-8 mt-4">
                      <div className="w-24 h-24 mx-auto bg-gradient-to-br from-emerald-400 to-teal-600 rounded-3xl p-[2px] shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                        <div className="w-full h-full bg-[#020817] rounded-3xl flex items-center justify-center">
                          <img src="/logo.png" alt="PharmaTech" className="w-16 h-16 object-contain" />
                        </div>
                      </div>
                    </div>

                    <div className="text-center space-y-2 mb-10 w-full relative z-10">
                      <h2 className="text-3xl font-black tracking-tight text-white outline-none">
                        FarmaTech <span className="text-[#34d399]">AI</span>
                      </h2>
                      <p className="text-emerald-500/80 text-sm font-bold tracking-[0.2em] uppercase">
                        {t('heroSubtitle')}
                      </p>
                    </div>

                    <div className="w-full space-y-4 relative z-10">
                      <Button
                        className="w-full h-14 rounded-2xl font-bold text-base flex items-center justify-center gap-3 bg-white text-slate-900 hover:bg-slate-100 transition-all hover:scale-[1.02] active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.1)] group"
                        onClick={async () => {
                          console.log("[FarmaTech] Google Sign-in Clicked. Origin:", window.location.origin);
                          try {
                            if (!supabase || !supabase.auth) {
                              throw new Error("Supabase is not initialized properly");
                            }
                            const { error } = await supabase.auth.signInWithOAuth({
                              provider: 'google',
                              options: {
                                redirectTo: window.location.origin,
                                queryParams: {
                                  prompt: 'select_account'
                                }
                              }
                            });
                            if (error) {
                              console.error("[FarmaTech] OAuth Error:", error);
                              toast({ variant: "destructive", title: t('loginError'), description: error.message });
                            }
                          } catch (e: any) {
                            console.error("[FarmaTech] Auth Exception:", e);
                            toast({ variant: "destructive", title: t('loginError'), description: e.message });
                          }
                        }}
                      >
                        <svg width="22" height="22" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="group-hover:scale-110 transition-transform">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        {t('loginWithGoogle')}
                      </Button>
                    </div>

                    <div className="mt-8 text-center w-full relative z-10 border-t border-slate-800/50 pt-6">
                      <p className="text-[10px] md:text-xs text-slate-500 font-medium leading-relaxed">
                        {lang === 'ar' ? (
                          <>
                            بالاستمرار، أنت توافق على{" "}
                            <span onClick={() => navigate("terms")} className="text-[#34d399] hover:text-[#5eead4] hover:underline cursor-pointer font-bold transition-colors">{t('termsOfUse')}</span>
                            {" "}و{" "}
                            <span onClick={() => navigate("privacy")} className="text-[#34d399] hover:text-[#5eead4] hover:underline cursor-pointer font-bold transition-colors">{t('privacyPolicy')}</span>
                            {" "}لمنصة FarmaTech Ai.
                          </>
                        ) : (
                          <>
                            By continuing, you agree to the{" "}
                            <span onClick={() => navigate("terms")} className="text-[#34d399] hover:text-[#5eead4] hover:underline cursor-pointer font-bold transition-colors">{t('termsOfUse')}</span>
                            {" "}and{" "}
                            <span onClick={() => navigate("privacy")} className="text-[#34d399] hover:text-[#5eead4] hover:underline cursor-pointer font-bold transition-colors">{t('privacyPolicy')}</span>
                            {" "}of FarmaTech platform.
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- PRICING SECTION --- */}
        <section className="w-full py-24 relative z-10 border-y border-white/[0.02]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16 space-y-4">
              <h2 className={`text-3xl md:text-5xl font-black ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{t('pricingTitle')}</h2>
              <p className={`text-lg font-medium max-w-2xl mx-auto ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>{t('pricingSubtitle')}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {plans.map((plan, i) => (
                <div key={i} className={`relative p-8 rounded-3xl border flex flex-col transition-all duration-300 hover:-translate-y-2 
                  ${plan.buttonProps.primary
                    ? (theme === 'dark' ? 'bg-[#060b13] border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.1)]' : 'bg-white border-emerald-400 shadow-[0_10px_40px_rgba(16,185,129,0.1)]')
                    : (theme === 'dark' ? 'bg-[#02050a] border-white/[0.05] hover:border-slate-700' : 'bg-white/50 border-emerald-100/50 hover:border-emerald-200 shadow-sm')} 
                  ${plan.buttonProps.primary ? 'md:scale-105 z-10' : ''}`}>
                  {(plan.buttonProps.primary || plan.badge) && (
                    <div className="absolute top-0 inset-x-0 -mt-3 flex justify-center">
                      <span className="bg-emerald-500 text-slate-900 text-xs font-black uppercase tracking-wider py-1.5 px-4 rounded-full shadow-lg shadow-emerald-500/30">
                        {plan.badge || (lang === 'ar' ? "الأكثر طلباً" : "Most Popular")}
                      </span>
                    </div>
                  )}
                  <h3 className={`text-xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{plan.name}</h3>
                  <div className="mb-4">
                    <span className="text-4xl font-black text-emerald-400">{plan.price}</span>
                    {plan.price !== "0" && <span className={`text-sm ml-1 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>/ {plan.period}</span>}
                  </div>
                  <p className={`text-sm mb-8 flex-grow leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>{plan.desc}</p>

                  <ul className="space-y-4 mb-8">
                    {plan.features.map((f, j) => (
                      <li key={j} className="flex items-center gap-3 text-sm font-medium">
                        <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                        <span className={theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    variant={plan.buttonProps.primary ? "default" : "outline"}
                    className={`w-full rounded-xl font-bold h-12 ${plan.buttonProps.primary ? 'bg-emerald-500 hover:bg-emerald-600 text-slate-900 shadow-lg shadow-emerald-500/25' : theme === 'dark' ? 'border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white' : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'}`}
                    onClick={() => {
                      toast({
                        title: lang === 'ar' ? "يرجى تسجيل الدخول" : "Please Login",
                        description: lang === 'ar' ? "قم بتسجيل الدخول أولاً للتمكن من الاشتراك في الباقات." : "Sign in first to subscribe to plans."
                      });
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  >
                    {plan.buttonProps.text}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --- TESTIMONIALS SECTION --- */}
        <section className={`w-full py-24 relative z-10 border-b ${theme === 'dark' ? 'border-white/[0.02]' : 'border-emerald-100/50'}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16 space-y-4">
              <h2 className={`text-3xl md:text-5xl font-black ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{t('testimonialsTitle')}</h2>
              <p className={`text-lg font-medium max-w-2xl mx-auto ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>{t('testimonialsDesc')}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {testimonials.map((test, idx) => (
                <div key={idx} className={`p-8 rounded-3xl border shadow-xl flex flex-col justify-between transition-all duration-300 ${theme === 'dark' ? 'bg-[#05080f] border-white/[0.04] shadow-black/40 hover:border-white/[0.1]' : 'bg-white border-emerald-100/50 shadow-sm hover:shadow-md hover:border-emerald-200'}`}>
                  <div>
                    <div className="flex justify-center mb-6">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star key={star} className="w-5 h-5 text-amber-500 fill-amber-500 mx-0.5" />
                      ))}
                    </div>
                    <p className={`text-sm leading-relaxed text-center mb-8 italic ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                      "{test.quote}"
                    </p>
                  </div>

                  <div className={`flex flex-col items-center border-t pt-6 ${theme === 'dark' ? 'border-white/[0.05]' : 'border-emerald-50'}`}>
                    <h4 className={`font-bold text-base ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{test.author}</h4>
                    <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>{test.role}</p>
                    <div className={`w-10 h-10 mt-4 rounded-full flex items-center justify-center text-white font-bold text-lg ${test.color}`}>
                      {test.avatar}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --- FAQ SECTION --- */}
        <section className={`w-full py-24 relative z-10 border-b ${theme === 'dark' ? 'border-white/[0.02]' : 'border-emerald-100/50'}`}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className={`text-3xl md:text-5xl font-black px-4 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{t('faqTitle')}</h2>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, idx) => (
                <details key={idx} className={`group border rounded-2xl overflow-hidden transition-all duration-300 ${theme === 'dark' ? 'bg-[#04070d] border-white/[0.05] hover:border-emerald-500/30' : 'bg-white border-emerald-100/50 hover:border-emerald-300'}`}>
                  <summary className={`flex justify-between items-center p-6 text-base md:text-lg font-bold cursor-pointer list-none select-none outline-none ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
                    <span>{faq.q}</span>
                    <span className="text-[#34d399] text-2xl leading-none group-open:rotate-45 transition-transform duration-300">+</span>
                  </summary>
                  <div className={`px-6 pb-6 text-sm md:text-base leading-relaxed border-t pt-4 mt-2 ${theme === 'dark' ? 'text-slate-400 border-white/[0.02]' : 'text-slate-600 border-emerald-50'}`}>
                    {faq.a}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* --- NEW EXACT FOOTER SECTION --- */}
        <footer className={`w-full relative z-10 pt-16 pb-8 transition-colors duration-500 ${theme === 'dark' ? 'bg-black' : 'bg-white border-t border-emerald-100/50'}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">

            <div className="mb-10 text-center">
              <h2 className={`text-3xl font-black tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                FarmaTech <span className="text-[#34d399]">AI</span>
              </h2>
            </div>

            <div className="flex gap-4 mb-10 justify-center">
              <a href="https://www.tiktok.com/@farmatechai" target="_blank" rel="noopener noreferrer" className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${theme === 'dark' ? 'bg-[#0f1420] text-slate-400 hover:text-white' : 'bg-white border border-emerald-100 text-slate-600 hover:text-emerald-600 shadow-sm'}`}>
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 2.37-1.15 4.67-2.9 6.25-1.74 1.58-4.2 2.3-6.52 1.9-2.32-.41-4.32-1.85-5.38-3.95-1.07-2.11-1.07-4.73.06-6.84 1.09-2.02 3.12-3.41 5.4-3.69v4.06c-1.12.11-2.18.66-2.9 1.56-.72.89-1 2.1-.73 3.22.27 1.12 1.05 2.05 2.08 2.51 1.03.46 2.27.42 3.26-.1.99-.53 1.7-1.48 1.9-2.61.05-.33.06-.67.06-1.01.02-6.53.01-13.06.01-19.59z" /></svg>
              </a>
              <a href="https://www.instagram.com/farmatech_ai/" target="_blank" rel="noopener noreferrer" className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${theme === 'dark' ? 'bg-[#0f1420] text-slate-400 hover:text-white hover:bg-[#E1306C]' : 'bg-white border border-emerald-100 text-slate-600 hover:text-white hover:bg-[#E1306C] shadow-sm'}`}>
                <Instagram className="w-4 h-4" />
              </a>
              <a href="https://www.facebook.com/FarmaTechAi/" target="_blank" rel="noopener noreferrer" className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${theme === 'dark' ? 'bg-[#0f1420] text-slate-400 hover:text-white hover:bg-[#1877F2]' : 'bg-white border border-emerald-100 text-slate-600 hover:text-white hover:bg-[#1877F2] shadow-sm'}`}>
                <Facebook className="w-4 h-4" />
              </a>
            </div>

            <div className="flex flex-wrap justify-center gap-6 mb-10 text-sm font-medium text-slate-500">
              <a href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-[#06b6d4] transition-colors">{t('home')}</a>
              <a href="/about" onClick={(e) => { e.preventDefault(); navigate("about"); }} className="hover:text-[#06b6d4] transition-colors">{t('aboutUs')}</a>
              <a href="/contact" onClick={(e) => { e.preventDefault(); navigate("contact"); }} className="hover:text-[#06b6d4] transition-colors">{t('contactUs')}</a>
              <a href="/privacy-policy" onClick={(e) => { e.preventDefault(); navigate("privacy"); }} className="hover:text-[#06b6d4] transition-colors">{t('privacyPolicy')}</a>
              <a href="/terms-of-use" onClick={(e) => { e.preventDefault(); navigate("terms"); }} className="hover:text-[#06b6d4] transition-colors">{t('termsOfUse')}</a>
            </div>

            <div className="text-center text-xs text-slate-600 font-medium w-full">
              {t('footerRights')}
            </div>

          </div>
        </footer>

      </div>
    );
  }

  return (
    <div
      className={`min-h-screen pb-10 font-sans relative overflow-hidden transition-colors duration-500 ${theme === 'dark' ? 'bg-[#0a0f16] text-slate-200' : 'bg-[#f8fafc] text-slate-800'}`}
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      {/* Background gradients */}
      <div className={`absolute top-0 left-0 w-full h-96 pointer-events-none transition-colors duration-500 ${theme === 'dark' ? 'bg-gradient-to-b from-[#0f1b29] to-transparent' : 'bg-gradient-to-b from-blue-100/50 to-transparent'}`}></div>
      <div className={`absolute bottom-0 right-[-10%] w-96 h-96 blur-[100px] rounded-full pointer-events-none transition-colors duration-500 ${theme === 'dark' ? 'bg-green-600/10' : 'bg-green-200/40'}`}></div>
      <div className={`absolute bottom-0 left-[-10%] w-96 h-96 blur-[100px] rounded-full pointer-events-none transition-colors duration-500 ${theme === 'dark' ? 'bg-blue-600/10' : 'bg-blue-200/40'}`}></div>

      {/* Header */}
      <div className={`flex items-center justify-between p-4 md:p-6 relative z-[100] backdrop-blur-md transition-colors duration-500 ${theme === 'dark' ? 'bg-[#0a0f16]/60 border-b border-white/5' : 'bg-white/50 border-b border-slate-100'}`}>
        <div className="flex items-center gap-2 md:gap-3">
          <div
            onClick={() => setView('profile')}
            className={`w-10 h-10 md:w-12 md:h-12 rounded-full p-1 flex items-center justify-center shrink-0 cursor-pointer transition-all active:scale-95 ${theme === 'dark' ? 'bg-[#1a2332] border border-slate-700 shadow-[0_0_15px_rgba(0,0,0,0.5)]' : 'bg-white shadow-md border border-slate-100 opacity-90 hover:opacity-100'}`}
          >
            {session?.user?.user_metadata?.avatar_url ? (
              <img src={session.user.user_metadata.avatar_url} className="w-full h-full rounded-full object-cover" />
            ) : (
              <User className={`w-5 h-5 md:w-6 md:h-6 text-slate-400`} />
            )}
          </div>

          <div
            className="flex flex-col items-start md:items-center cursor-pointer active:scale-95 transition-transform"
            onClick={() => { setView('main'); setResult(""); setSelectedEntry(null); }}
          >
            <h1 className={`font-extrabold text-lg md:text-2xl tracking-tight transition-colors duration-500 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
              {t('title')} <span className="text-[#34d399] font-medium">AI</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3 relative group">
          {session && (
            <div
              onClick={() => setView('profile')}
              className={`flex items-center gap-1.5 px-2 md:px-3 py-1 md:py-1.5 rounded-xl border border-dashed cursor-pointer transition-all duration-500 active:scale-95 ${theme === 'dark' ? 'bg-emerald-900/20 border-emerald-800 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}
              dir="ltr"
            >
              <span className="text-[11px] md:text-sm font-black leading-none">
                {(totalCredits ?? 0).toLocaleString()} {t('points')}
              </span>
              <PieChart className="w-3.5 h-3.5 md:w-4 md:h-4" />
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            className={`rounded-full transition-colors duration-500 ${theme === 'dark' ? 'text-slate-400 hover:bg-white/5 border border-slate-800' : 'text-slate-500 hover:bg-slate-50 border border-slate-100'}`}
            onClick={() => setShowSettingsMenu(!showSettingsMenu)}
          >
            <Settings className="w-5 h-5" />
          </Button>

          {showSettingsMenu && (
            <>
              <div className="fixed inset-0 z-[105]" onClick={() => setShowSettingsMenu(false)}></div>
              <div className={`fixed top-20 ${lang === 'ar' ? 'left-4' : 'right-4'} w-52 rounded-2xl shadow-xl border py-2 z-[110] animate-in fade-in zoom-in-95 transition-colors duration-500 ${theme === 'dark' ? 'bg-[#1a2332] border-slate-700 shadow-[0_10px_30px_rgba(0,0,0,0.8)]' : 'bg-white border-slate-100'}`}>
                <button
                  onClick={() => { setView('main'); setShowSettingsMenu(false); }}
                  className={`w-full text-left px-4 py-3 flex items-center justify-start gap-3 transition-colors font-medium ${theme === 'dark' ? 'text-slate-300 hover:bg-white/5' : 'text-slate-700 hover:bg-slate-50'}`}
                >
                  <HomeIcon className="w-4 h-4 text-teal-500" />
                  {t('home')}
                </button>
                <button
                  onClick={() => { setView('profile'); setShowSettingsMenu(false); }}
                  className={`w-full text-left px-4 py-3 flex items-center justify-start gap-3 transition-colors font-medium ${theme === 'dark' ? 'text-slate-300 hover:bg-white/5' : 'text-slate-700 hover:bg-slate-50'}`}
                >
                  <User className="w-4 h-4 text-emerald-500" />
                  {t('profile')}
                </button>
                <button
                  onClick={() => { setView('history'); setShowSettingsMenu(false); }}
                  className={`w-full text-left px-4 py-3 flex items-center justify-start gap-3 transition-colors font-medium ${theme === 'dark' ? 'text-slate-300 hover:bg-white/5' : 'text-slate-700 hover:bg-slate-50'}`}
                >
                  <HistoryIcon className="w-4 h-4 text-teal-500" />
                  {t('history')}
                </button>
                <div className={`h-px w-full my-1 ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-100'}`}></div>
                <button
                  onClick={() => {
                    setShowSettingsMenu(false);
                    supabase.auth.signOut().then(() => {
                      localStorage.clear();
                      sessionStorage.clear();
                      window.location.replace("/");
                    });
                  }}
                  className={`w-full text-left px-4 py-3 flex items-center justify-start gap-3 transition-colors font-medium ${theme === 'dark' ? 'text-red-400 hover:bg-red-500/10' : 'text-red-600 hover:bg-red-50'}`}
                >
                  <LogOut className="w-4 h-4" />
                  {t('logout')}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className={`${view === 'pricing' ? 'max-w-[1400px] w-full' : 'max-w-xl'} mx-auto p-5 relative z-10 flex flex-col min-h-[calc(100vh-160px)] transition-all duration-500`}>
        {view === "main" ? (
          <div className="space-y-6 animate-in fade-in duration-700 flex-1 flex flex-col">
            {(profileLoaded && totalCredits <= 0) ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-6">
                <div className={`w-20 h-20 rounded-3xl flex items-center justify-center ${theme === 'dark' ? 'bg-amber-500/10 text-amber-500' : 'bg-amber-50 text-amber-600'}`}>
                  <AlertTriangle className="w-10 h-10" />
                </div>
                <h3 className={`text-2xl font-black ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                  {t('subscribeToContinue')}
                </h3>
                <p className={`text-sm opacity-60 font-medium max-w-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                  {lang === 'ar' ? 'لقد استهلكت جميع المحاولات المتاحة لهذا اليوم أو انتهى اشتراكك.' : 'You have consumed all available attempts for today or your subscription has expired.'}
                </p>
                <Button
                  onClick={() => setView('pricing')}
                  className="h-14 px-8 rounded-2xl font-black text-base bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
                >
                  {t('upgradePlan')}
                </Button>
              </div>
            ) : (
              <>
                {/* Greeting & Subtitle */}
                {!result && !isLoading && (
                  <div className="text-center py-6 animate-in fade-in duration-700">
                    <h2 className={`text-2xl font-bold tracking-tight mb-2 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                      {t('welcomeBack')} {session?.user?.email?.split('@')[0] || "User"}
                    </h2>
                    <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                      {t('pharmacistAssistant')}
                    </p>
                  </div>
                )}

                {!result && !isLoading && (
                  <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    {[
                      {
                        label: t('prescriptionAnalysis'),
                        icon: <FileSignature className="w-10 h-10" />,
                        onClick: () => { setMenuType("prescription"); setShowMenu(true); },
                      },
                      {
                        label: t('labReportAnalysis'),
                        icon: <Activity className="w-10 h-10" />,
                        onClick: () => { setMenuType("lab"); setShowLabForm(true); },
                      },
                      {
                        label: t('medicineScan'),
                        icon: <ScanBarcode className="w-8 h-8" />,
                        onClick: () => { setMenuType("medicine"); setShowMenu(true); }
                      },
                      {
                        label: t('drugInteractions'),
                        icon: <FlaskConical className="w-8 h-8" />,
                        onClick: () => { setChatInput(lang === 'ar' ? "التفاعلات الدوائية لـ: " : "Drug interactions for: "); inputRef.current?.focus(); }
                      },
                      {
                        label: t('doseCalculator'),
                        icon: <Calculator className="w-8 h-8" />,
                        onClick: () => setShowCalc(true)
                      },
                      {
                        label: t('smartAdvice'),
                        icon: <Sparkles className="w-8 h-8" />,
                        onClick: () => { setChatInput(lang === 'ar' ? "أحتاج إلى نصيحة طبية بخصوص: " : "I need medical advice regarding: "); inputRef.current?.focus(); }
                      },
                    ].map((card, idx) => (
                      <button
                        key={idx}
                        onClick={card.onClick}
                        className={`flex flex-col items-center justify-center gap-3 p-4 md:p-8 rounded-[2rem] border transition-all duration-300 active:scale-95 group relative overflow-hidden h-[160px]
                          ${theme === 'dark'
                            ? `bg-slate-900/40 border-slate-800 hover:border-emerald-500/50 hover:bg-slate-900/60`
                            : `bg-white border-emerald-100 shadow-sm hover:border-emerald-300 hover:shadow-md`}`}
                      >
                        <div className={`p-2 md:p-3 rounded-2xl transition-transform group-hover:scale-110 duration-300
                          ${theme === 'dark' ? `text-emerald-400` : `text-emerald-600`}`}>
                          {card.icon}
                        </div>
                        <span className={`text-xs md:text-sm font-bold tracking-tight text-center ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                          {card.label}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Result Area */}
                {(result || isLoading) && (
                  <div className="flex-1 flex flex-col space-y-6 pt-2 pb-10">
                    <div className="flex justify-between items-center px-2">
                      <h3 className={`text-sm font-black uppercase tracking-widest ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                        {t('analysisResult')}
                      </h3>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setResult("");
                          setCurrentAnalysisImage(null);
                        }}
                        className={`rounded-full h-8 w-8 transition-all hover:rotate-90 duration-300 ${theme === 'dark' ? 'text-slate-400 hover:bg-white/10 hover:text-rose-400' : 'text-slate-500 hover:bg-slate-100 hover:text-rose-600'}`}
                      >
                        <X className="w-5 h-5" />
                      </Button>
                    </div>

                    <div className={`w-full p-6 rounded-[2rem] border shadow-xl animate-in fade-in zoom-in-95 duration-500 ${theme === 'dark' ? 'bg-[#151c28] border-slate-700 shadow-black/50' : 'bg-white border-emerald-100 shadow-sm'}`}>
                      {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-10 gap-4">
                          <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
                          <span className="text-sm font-bold animate-pulse">{t('processing')}</span>
                        </div>
                      ) : (
                        <>
                          {currentAnalysisImage && (
                            <div className="mb-6 rounded-[1.5rem] overflow-hidden border-2 border-dashed border-teal-500/30 shadow-2xl animate-in zoom-in duration-500">
                              <img
                                src={currentAnalysisImage}
                                className="w-full object-contain max-h-[450px]"
                                alt="Prescription"
                              />
                            </div>
                          )}
                          <div className="prose prose-sm max-w-none prose-teal dark:prose-invert">
                            {renderFormattedResult(result)}
                          </div>
                          <div className="flex gap-2 justify-end mt-6 border-t pt-4 border-dashed border-slate-700/30">
                            <Button
                              variant="outline"
                              size="sm"
                              className={`rounded-xl flex items-center gap-2 border-dashed ${theme === 'dark' ? 'border-slate-700 text-slate-400 hover:bg-white/5' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                              onClick={() => {
                                const postText = `📝 منشور صيدلاني توعوي:\n\n${result}\n\n#farmatechai #FarmaTechAI #farmatechai.com #فارمتك_AI #نصيحة_طبية #صيدلية`;
                                shareContent(t('analysisResult'), postText, currentAnalysisImage);
                              }}
                            >
                              <Share2 className="w-4 h-4" />
                              {t('shareAsPost')}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className={`rounded-xl flex items-center gap-2 border-dashed ${theme === 'dark' ? 'border-emerald-800 text-emerald-400 hover:bg-emerald-900/20' : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'}`}
                              onClick={() => downloadAsPDF(t('analysisResult'), result, currentAnalysisImage)}
                            >
                              <FileSignature className="w-4 h-4" />
                              {t('downloadPDF')}
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Disclaimer */}
                {!isLoading && (
                  <div className="text-center py-4 px-6 mt-auto">
                    <p className={`text-[10px] leading-relaxed opacity-40 hover:opacity-100 transition-opacity duration-500 cursor-default ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                      {t('disclaimer')}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        ) : view === "profile" ? (
          <div className="flex-1 animate-in fade-in slide-in-from-bottom duration-500 overflow-hidden flex flex-col items-center">
            <div className={`w-full p-8 rounded-[2.5rem] border transition-colors duration-500 flex flex-col items-center text-center ${theme === 'dark' ? 'bg-[#151c28] border-slate-700 shadow-2xl shadow-black/40' : 'bg-white border-slate-100 shadow-lg'}`}>
              <div className={`w-24 h-24 rounded-full p-1.5 mb-6 flex items-center justify-center shrink-0 transition-colors duration-500 ${theme === 'dark' ? 'bg-[#1a2332] border-2 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 'bg-white shadow-md border-2 border-emerald-500'}`}>
                {session?.user?.user_metadata?.avatar_url ? (
                  <img src={session.user.user_metadata.avatar_url} className="w-full h-full rounded-full object-cover" />
                ) : (
                  <div className="w-full h-full rounded-full bg-emerald-500 flex items-center justify-center text-white text-3xl font-black">
                    {session?.user?.email?.[0].toUpperCase()}
                  </div>
                )}
              </div>

              <h3 className={`text-xl font-black mb-1 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                {session?.user?.email?.split('@')[0]}
              </h3>
              <p className={`text-[10px] mt-2 opacity-30 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                {activeVersion}
              </p>

              <div className="flex flex-col items-center gap-3 mb-6 mt-6">
                <div className="w-fit flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-full border border-dashed cursor-pointer transition-all duration-500 active:scale-95 bg-emerald-900/10 border-emerald-800/30 text-emerald-400" dir="ltr">
                  <span className="text-xs md:text-sm font-black leading-none">
                    {(totalCredits ?? 0).toLocaleString()} {t('points')}
                  </span>
                  <PieChart className="w-3.5 h-3.5 md:w-4 md:h-4" />
                </div>

                <div className={`px-4 py-1.5 rounded-full text-xs font-black ${theme === 'dark' ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-800' : 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm'}`}>
                  {subscriptionTier === 'free' ? t('basicTier') : subscriptionTier.toUpperCase()} ({subscriptionTier === 'free' ? t('free') : t('premium')})
                </div>

                {subscriptionTier !== 'free' && subscriptionExpiresAt && (
                  <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[12px] font-black ${theme === 'dark' ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-800/50' : 'bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-sm'}`}>
                    <Clock className="w-4 h-4" />
                    <span>
                      {(() => {
                        const expiresAt = new Date(subscriptionExpiresAt);
                        const now = new Date();
                        const diffTime = expiresAt.getTime() - now.getTime();
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        return `${t('subscriptionEndsIn')} ${diffDays > 0 ? diffDays : 0} ${t('daysRemaining')}`;
                      })()}
                    </span>
                  </div>
                )}
              </div>

              {expiryWarning && (
                <div className="w-full mt-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center gap-3 animate-pulse">
                  <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                  <span className="text-xs font-bold text-right" dir="rtl">{expiryWarning}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 w-full mt-6">
              <button
                onClick={() => setView('main')}
                className={`h-20 rounded-3xl flex items-center justify-between px-6 font-extrabold transition-all active:scale-[0.98] ${theme === 'dark' ? 'bg-slate-900/50 border border-slate-800 text-slate-300 hover:bg-slate-800' : 'bg-white border border-slate-100 text-slate-700 hover:bg-slate-50 shadow-sm'}`}
              >
                <div className="flex items-center gap-4">
                  <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-500">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <span className="text-lg">{t('smartAssistant')}</span>
                </div>
                <ChevronLeft className={`w-6 h-6 opacity-30 ${lang === 'ar' ? 'rotate-180' : ''}`} />
              </button>

              <button
                onClick={() => setView('pricing')}
                className={`h-20 rounded-3xl flex items-center justify-between px-6 font-extrabold transition-all active:scale-[0.98] ${theme === 'dark' ? 'bg-slate-900/50 border border-slate-800 text-slate-300 hover:bg-slate-800' : 'bg-white border border-slate-100 text-slate-700 hover:bg-slate-50 shadow-sm'}`}
              >
                <div className="flex items-center gap-4">
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <span className="text-lg">{t('upgradePlan')}</span>
                </div>
                <ChevronLeft className={`w-6 h-6 opacity-30 ${lang === 'ar' ? 'rotate-180' : ''}`} />
              </button>

              <button
                onClick={() => setShowSupportModal(true)}
                className={`h-20 rounded-3xl flex items-center justify-between px-6 font-extrabold transition-all active:scale-[0.98] ${theme === 'dark' ? 'bg-slate-900/50 border border-slate-800 text-slate-300 hover:bg-slate-800' : 'bg-white border border-slate-100 text-slate-700 hover:bg-slate-50 shadow-sm'}`}
              >
                <div className="flex items-center gap-4">
                  <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <span className="text-lg">{t('techSupport')}</span>
                </div>
                <ChevronLeft className={`w-6 h-6 opacity-30 ${lang === 'ar' ? 'rotate-180' : ''}`} />
              </button>

              <button
                onClick={() => {
                  supabase.auth.signOut().then(() => {
                    localStorage.clear();
                    sessionStorage.clear();
                    window.location.replace("/");
                  });
                }}
                className={`h-20 rounded-3xl flex items-center justify-between px-6 font-extrabold transition-all active:scale-[0.98] ${theme === 'dark' ? 'bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20' : 'bg-red-50 border border-red-100 text-red-600 hover:bg-red-100 shadow-sm'}`}
              >
                <div className="flex items-center gap-4">
                  <div className="p-2.5 rounded-xl bg-red-500/20 text-red-500">
                    <LogOut className="w-6 h-6" />
                  </div>
                  <span className="text-lg">{t('logout')}</span>
                </div>
                <ChevronLeft className={`w-6 h-6 opacity-30 ${lang === 'ar' ? 'rotate-180' : ''}`} />
              </button>
            </div>

            <div className="flex items-center gap-8 mt-10 mb-6 opacity-60 hover:opacity-100 transition-opacity duration-500">
              <button
                onClick={() => window.open('https://www.tiktok.com/@farmatechai', '_blank')}
                className="text-slate-500 hover:text-emerald-500 transition-colors bg-transparent border-none p-0 flex items-center gap-2 font-bold"
              >
                TikTok
              </button>
              <button
                onClick={() => window.open('https://www.instagram.com/farmatech_ai/', '_blank')}
                className="text-slate-500 hover:text-pink-500 transition-colors bg-transparent border-none p-0 flex items-center gap-2 font-bold"
              >
                <Instagram className="w-5 h-5" />
                Instagram
              </button>
              <button
                onClick={() => window.open('https://www.facebook.com/FarmaTechAi/', '_blank')}
                className="text-slate-500 hover:text-blue-600 transition-colors bg-transparent border-none p-0 flex items-center gap-2 font-bold"
              >
                Facebook
              </button>
            </div>
          </div>
        ) : view === "pricing" ? (
          <div className="flex-1 animate-in fade-in slide-in-from-bottom duration-700 overflow-hidden flex flex-col items-center w-full max-w-[1400px] mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className={`text-4xl font-black mb-3 tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{t('choosePlan')}</h2>
              <p className={`text-base opacity-60 font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{t('pricingDesc')}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 w-full pt-16 pb-20 items-stretch">
              {[
                {
                  id: "free",
                  name: t('planFreeName'),
                  price: t('planFreePrice'),
                  period: t('planFreePeriod'),
                  description: t('planFreeDesc'),
                  features: t('planFreeFeatures'),
                  color: "emerald",
                  cta: t('aboutStartNow'),
                  neon: "shadow-[0_0_15px_rgba(52,211,153,0.05)] border-slate-800"
                },
                {
                  id: "starter",
                  name: t('planStarterName'),
                  price: t('planStarterPrice'),
                  period: t('planStarterPeriod'),
                  description: t('planStarterDesc'),
                  features: t('planStarterFeatures'),
                  color: "blue",
                  cta: lang === 'ar' ? "اشترك في Starter" : "Subscribe to Starter",
                  neon: "shadow-[0_0_15px_rgba(59,130,246,0.05)] border-slate-800"
                },
                {
                  id: "pro_monthly",
                  name: t('planProName'),
                  price: t('planProPrice'),
                  period: t('planProPeriod'),
                  description: t('planProDesc'),
                  features: t('planProFeatures'),
                  color: "teal",
                  highlight: true,
                  badge: lang === 'ar' ? "الأكثر مبيعاً" : "Best Seller",
                  cta: lang === 'ar' ? "اشترك في Pro" : "Subscribe to Pro",
                  neon: "shadow-[0_0_40px_rgba(52,211,153,0.3)] border-[#34d399]/50"
                },
                {
                  id: "pro",
                  name: t('planProfessionalName'),
                  price: t('planProfessionalPrice'),
                  period: t('planProfessionalPeriod'),
                  description: t('planProfessionalDesc'),
                  features: t('planProfessionalFeatures'),
                  color: "slate",
                  highlight: false,
                  cta: lang === 'ar' ? "اشترك في الاحترافي" : "Subscribe Professional",
                  neon: "shadow-[0_0_15px_rgba(16,185,129,0.05)] border-slate-800"
                },
                {
                  id: "enterprises",
                  name: t('planEnterprisesName'),
                  price: t('planEnterprisesPrice'),
                  period: t('planEnterprisesPeriod'),
                  description: t('planEnterprisesDesc'),
                  features: t('planEnterprisesFeatures'),
                  color: "amber",
                  cta: lang === 'ar' ? "انضم للمؤسسات" : "Join Enterprises",
                  neon: "shadow-[0_0_20px_rgba(245,158,11,0.1)] border-amber-500/20"
                }
              ].map((plan: any, idx) => (
                <div
                  key={idx}
                  className={`p-6 md:p-8 rounded-[2.5rem] border transition-all duration-500 relative flex flex-col items-center text-center
                     ${plan.highlight ? 'md:scale-105 z-10 border-[#34d399]/50 shadow-[0_0_40px_rgba(52,211,153,0.2)]' : 'scale-100'}
                     ${theme === 'dark'
                      ? `bg-[#0d141f] ${plan.neon}`
                      : `bg-white border-slate-100 shadow-2xl`}`}
                >
                  {plan.badge && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#34d399] text-[#001c24] text-[11px] font-black px-5 py-2 rounded-full flex items-center gap-1.5 shadow-[0_4px_25px_rgba(52,211,153,0.45)] whitespace-nowrap z-30 transition-all">
                      {plan.badge} <Star className="w-3.5 h-3.5 fill-current mb-0.5" />
                    </div>
                  )}

                  <h4 className={`text-xl font-black mb-3 ${plan.highlight ? 'text-[#34d399]' : theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{plan.name}</h4>

                  <div className="mb-4">
                    <span className={`text-4xl md:text-5xl font-black tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{plan.price}</span>
                    {plan.period && <span className="text-[11px] opacity-40 font-bold block mt-2 text-center">{plan.period}</span>}
                  </div>

                  <p className={`text-[12px] font-medium leading-[1.6] px-1 min-h-[50px] mb-8 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                    {plan.description}
                  </p>

                  <Button
                    onClick={() => {
                      if (plan.id === 'free') {
                        setView('main');
                      } else {
                        handleSubscribe(plan.id);
                      }
                    }}
                    disabled={isSubscribeLoading !== null}
                    className={`w-full h-14 rounded-2xl font-black text-sm md:text-base transition-all active:scale-95 mb-10
                      ${plan.highlight
                        ? 'bg-[#34d399] hover:bg-[#2fb986] text-[#001c24] shadow-[0_0_35px_rgba(52,211,153,0.45)]'
                        : (theme === 'dark'
                          ? 'bg-transparent border border-slate-700 hover:bg-slate-800 text-slate-400 hover:text-white'
                          : 'bg-transparent border border-emerald-200 hover:bg-emerald-50 text-emerald-700 hover:text-emerald-800')}`}
                  >
                    {isSubscribeLoading === plan.id ? <Loader2 className="animate-spin w-5 h-5 mx-auto" /> : plan.cta}
                  </Button>

                  <div className="space-y-4 w-full text-right mt-auto" dir="rtl">
                    {plan.features.map((feature: string, i: number) => (
                      <div key={i} className="flex items-center gap-3 text-[13px] font-bold">
                        <div className="flex-shrink-0 opacity-80">
                          <Check className="w-4 h-4 text-[#34d399]" />
                        </div>
                        <span className={`line-clamp-1 ${plan.highlight && i === 0
                          ? 'text-[#34d399]'
                          : theme === 'dark' ? 'text-slate-200' : 'text-slate-700'
                          }`}>
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <Button
              variant="ghost"
              className="mt-4 mb-20 px-8 h-14 rounded-2xl font-bold flex items-center justify-center gap-3 opacity-50 hover:opacity-100 transition-all hover:bg-slate-800/20"
              onClick={() => setView('profile')}
            >
              <ArrowRight className={`w-5 h-5 ${lang === 'en' ? 'rotate-180' : ''}`} />
              {t('profile')}
            </Button>
          </div>
        ) : (
          <div className="flex-1 animate-in fade-in slide-in-from-left duration-500 overflow-hidden flex flex-col">
            <div className={`p-6 rounded-[2rem] border flex-1 flex flex-col transition-colors duration-500 ${theme === 'dark' ? 'bg-[#151c28] border-slate-700' : 'bg-white border-slate-100 shadow-sm'}`}>
              <div className="flex items-center justify-between mb-6">
                <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{t('history')}</h3>
                <HistoryIcon className="w-5 h-5 text-teal-500" />
              </div>

              <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                {history.length > 0 ? (
                  history.map((entry, idx) => (
                    <div
                      key={entry.id || idx}
                      onClick={() => {
                        setSelectedEntry(entry);
                        setResult("");
                      }}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all active:scale-[0.98] ${theme === 'dark' ? 'bg-slate-900/50 border-slate-800 hover:bg-slate-800 hover:border-slate-700' : 'bg-slate-50 border-slate-100 hover:bg-white hover:border-slate-200 shadow-sm hover:shadow-md'}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-bold ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                          {entry.date || "غير محدد"}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${theme === 'dark' ? 'bg-teal-900/30 text-teal-400' : 'bg-teal-50 text-teal-700'}`}>
                          {entry.id ? t('archived') : t('local')}
                        </span>
                      </div>
                      <p className={`text-sm mt-2 line-clamp-1 font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                        {t(entry.title as any) || entry.query || t('aiAnalysis')}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center h-full opacity-30">
                    <HistoryIcon className="w-12 h-12 mb-2" />
                    <p className="text-sm font-medium">{t('noHistory')}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Input area fixed at bottom */}
        <div className="pt-4 mt-auto">
          <div className="relative group">
            <div className={`absolute -inset-1 blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200 rounded-[2rem] ${theme === 'dark' ? 'bg-teal-500' : 'bg-teal-300'}`}></div>
            <div className={`relative flex items-center p-2 rounded-[2rem] border shadow-2xl transition-all duration-500 ${theme === 'dark' ? 'bg-[#151c28] border-slate-700' : 'bg-white border-slate-100'}`}>
              <button
                onClick={() => { setMenuType("prescription"); setShowMenu(true); }}
                className={`p-3 rounded-full transition-all active:scale-90 ${theme === 'dark' ? 'text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800' : 'text-slate-400 hover:text-slate-800 bg-slate-50 hover:bg-slate-100'}`}
              >
                <Plus className="w-6 h-6" />
              </button>

              <Input
                ref={inputRef}
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAction("text", null)}
                placeholder={lang === 'ar' ? "اسألني أي شيء عن الأدوية..." : "Ask me anything about medicines..."}
                className={`flex-1 border-none focus-visible:ring-0 bg-transparent text-base font-medium px-4 ${theme === 'dark' ? 'placeholder-slate-600' : 'placeholder-slate-400'}`}
              />

              <button
                onClick={() => handleAction("text", null)}
                disabled={isLoading || !chatInput.trim()}
                className={`p-3 rounded-full transition-all active:scale-90 disabled:opacity-20 shadow-lg ${theme === 'dark' ? 'bg-teal-600 hover:bg-teal-500 text-white' : 'bg-teal-600 hover:bg-teal-700 text-white'}`}
              >
                {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showMenu && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setShowMenu(false)}>
          <div className={`w-full max-w-sm rounded-[2.5rem] p-8 space-y-8 animate-in zoom-in-95 duration-300 border ${theme === 'dark' ? 'bg-[#151c28] border-slate-700 shadow-black' : 'bg-white border-slate-100 shadow-2xl'}`} onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center bg-teal-500/10 p-4 -mt-4 -mx-4 rounded-t-[2.5rem] mb-6">
              <h3 className={`font-black text-xl flex items-center gap-2 ${theme === 'dark' ? 'text-teal-400' : 'text-teal-800'}`}>
                {menuType === "prescription" ? <FileSignature className="w-6 h-6" /> : menuType === "lab" ? <Activity className="w-6 h-6" /> : <ScanBarcode className="w-6 h-6" />}
                {menuType === "prescription" ? t('prescriptionAnalysis') : menuType === "lab" ? t('labReportAnalysis') : t('medicineScan')}
              </h3>
              <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setShowMenu(false)}>
                <X className="w-6 h-6" />
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <label
                className={`flex items-center gap-4 p-6 rounded-[1.5rem] border cursor-pointer transition-all active:scale-95
                  ${theme === 'dark' ? 'bg-slate-900 border-slate-700 hover:border-teal-500' : 'bg-teal-50 border-teal-100 hover:border-teal-400'}`}
              >
                <div className="p-3 bg-teal-500 rounded-full text-white shadow-lg">
                  <Camera className="w-6 h-6" />
                </div>
                <span className={`font-bold text-lg ${theme === 'dark' ? 'text-teal-400' : 'text-teal-800'}`}>{lang === 'ar' ? "التقاط صورة" : "Capture Image"}</span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) =>
                    e.target.files?.[0] &&
                    handleAction("image", e.target.files[0])
                  }
                />
              </label>

              <label
                className={`flex items-center gap-4 p-6 rounded-[1.5rem] border cursor-pointer transition-all active:scale-95
                  ${theme === 'dark' ? 'bg-slate-900 border-slate-700 hover:border-emerald-500' : 'bg-emerald-50 border-emerald-100 hover:border-emerald-400'}`}
              >
                <div className="p-3 bg-emerald-500 rounded-full text-white shadow-lg">
                  <ImageIcon className="w-6 h-6" />
                </div>
                <span className={`font-bold text-lg ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-800'}`}>{lang === 'ar' ? "من المعرض" : "Gallery Search"}</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) =>
                    e.target.files?.[0] &&
                    handleAction("image", e.target.files[0])
                  }
                />
              </label>
            </div>
          </div>
        </div>
      )}

      {showCalc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setShowCalc(false)}>
          <div className={`w-full max-w-sm rounded-[2.5rem] p-8 space-y-6 animate-in zoom-in-95 duration-300 border ${theme === 'dark' ? 'bg-[#151c28] border-slate-700 shadow-black' : 'bg-white border-slate-100 shadow-2xl'}`} onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center bg-teal-500/10 p-4 -mt-4 -mx-4 rounded-t-[2.5rem] mb-4">
              <h3 className={`font-black text-xl flex items-center gap-2 ${theme === 'dark' ? 'text-teal-400' : 'text-teal-800'}`}>
                <Calculator className="w-6 h-6" />
                {t('doseCalculator')}
              </h3>
              <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setShowCalc(false)}>
                <X className="w-6 h-6" />
              </Button>
            </div>

            <div className="space-y-4">
              <Input
                placeholder={t('drugPlaceholder')}
                className={`h-14 focus-visible:ring-teal-500 text-right rounded-2xl font-medium ${theme === 'dark' ? 'bg-[#0a0f16] border-slate-700 text-white placeholder:text-slate-600' : 'bg-slate-50 border-slate-200'}`}
                value={calcData.drug}
                onChange={(e) => setCalcData({ ...calcData, drug: e.target.value })}
                dir="rtl"
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  placeholder={t('weightPlaceholder')}
                  type="number"
                  className={`h-14 focus-visible:ring-teal-500 text-right rounded-2xl font-medium ${theme === 'dark' ? 'bg-[#0a0f16] border-slate-700 text-white placeholder:text-slate-600' : 'bg-slate-50 border-slate-200'}`}
                  value={calcData.weight}
                  onChange={(e) => setCalcData({ ...calcData, weight: e.target.value })}
                  dir="rtl"
                />
                <Input
                  placeholder={t('agePlaceholder')}
                  className={`h-14 focus-visible:ring-teal-500 text-right rounded-2xl font-medium ${theme === 'dark' ? 'bg-[#0a0f16] border-slate-700 text-white placeholder:text-slate-600' : 'bg-slate-50 border-slate-200'}`}
                  value={calcData.age}
                  onChange={(e) => setCalcData({ ...calcData, age: e.target.value })}
                  dir="rtl"
                />
              </div>
              <Button
                className="w-full h-14 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl font-bold text-lg shadow-lg shadow-teal-600/20 active:scale-95 transition-all mt-2"
                onClick={() => handleAction("calc")}
                disabled={!calcData.drug || !calcData.weight}
              >
                {t('doseCalculator')}
              </Button>
            </div>
            <p className="text-[10px] text-center text-slate-500 font-medium px-4">
              {t('note')}
            </p>
          </div>
        </div>
      )}

      {showSupportModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setShowSupportModal(false)}>
          <div className={`w-full max-w-sm rounded-[2.5rem] p-8 space-y-6 animate-in zoom-in-95 duration-300 border shadow-2xl ${theme === 'dark' ? 'bg-[#151c28] border-slate-700 shadow-black/50' : 'bg-white border-slate-100 shadow-xl'}`} onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center bg-blue-500/10 p-5 -mt-8 -mx-8 rounded-t-[2.5rem] mb-6">
              <h3 className={`font-black text-xl flex items-center gap-3 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-800'}`}>
                <div className="p-2 bg-blue-500 rounded-xl text-white">
                  <MessageSquare className="w-5 h-5" />
                </div>
                {t('supportTitle')}
              </h3>
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-red-500/10 hover:text-red-500 transition-colors" onClick={() => setShowSupportModal(false)}>
                <X className="w-6 h-6" />
              </Button>
            </div>

            <div className="space-y-4">
              <textarea
                placeholder={t('supportPlaceholder')}
                className={`w-full h-40 p-5 rounded-2xl font-medium resize-none focus:ring-2 focus:ring-blue-500 outline-none transition-all ${theme === 'dark' ? 'bg-[#0a0f16] border-slate-700 text-white placeholder:text-slate-600' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
                value={supportMessage}
                onChange={(e) => setSupportMessage(e.target.value)}
                dir={lang === 'ar' ? 'rtl' : 'ltr'}
              />

              <div className="flex gap-4">
                <Button
                  variant="outline"
                  className="flex-1 h-14 rounded-2xl font-bold border-slate-200"
                  onClick={() => setShowSupportModal(false)}
                >
                  {t('cancel')}
                </Button>
                <Button
                  className="flex-[2] h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold shadow-lg shadow-blue-600/20 active:scale-95 transition-all disabled:opacity-50"
                  onClick={handleSendSupport}
                  disabled={!supportMessage.trim() || isSendingSupport}
                >
                  {isSendingSupport ? <Loader2 className="w-5 h-5 animate-spin" /> : t('send')}
                </Button>
              </div>
            </div>

            <p className={`text-[10px] text-center font-medium opacity-50 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
              {lang === 'ar' ? "سيتم الرد عليك في أقصر وقت ممكن عبر البريد الإلكتروني." : "You will be replied to as soon as possible via email."}
            </p>
          </div>
        </div>
      )}

      {showLabForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setShowLabForm(false)}>
          <div className={`w-full max-w-md rounded-[2.5rem] p-8 space-y-6 animate-in zoom-in-95 duration-300 border ${theme === 'dark' ? 'bg-[#151c28] border-slate-700 shadow-black' : 'bg-white border-slate-100 shadow-2xl'}`} onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center bg-emerald-500/10 p-4 -mt-4 -mx-4 rounded-t-[2.5rem] mb-4">
              <h3 className={`font-black text-xl flex items-center gap-2 ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-800'}`}>
                <Activity className="w-6 h-6" />
                {t('labReportAnalysis')}
              </h3>
              <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setShowLabForm(false)}>
                <X className="w-6 h-6" />
              </Button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className={`text-xs font-bold px-1 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>{t('patientAge')}</label>
                  <Input
                    type="number"
                    placeholder="25"
                    className={`h-12 rounded-xl font-bold ${theme === 'dark' ? 'bg-[#0a0f16] border-slate-700 text-white' : 'bg-slate-50 border-slate-200'}`}
                    value={labPatientData.age}
                    onChange={(e) => setLabPatientData({ ...labPatientData, age: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className={`text-xs font-bold px-1 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>{t('patientGender')}</label>
                  <div className={`flex h-12 rounded-xl p-1 ${theme === 'dark' ? 'bg-[#0a0f16] border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                    <button
                      onClick={() => setLabPatientData({ ...labPatientData, gender: 'male' })}
                      className={`flex-1 rounded-lg text-xs font-bold transition-all ${labPatientData.gender === 'male' ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-500'}`}
                    >
                      {t('male')}
                    </button>
                    <button
                      onClick={() => setLabPatientData({ ...labPatientData, gender: 'female' })}
                      className={`flex-1 rounded-lg text-xs font-bold transition-all ${labPatientData.gender === 'female' ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-500'}`}
                    >
                      {t('female')}
                    </button>
                  </div>
                </div>
              </div>

              {labPatientData.gender === 'female' && (
                <button
                  onClick={() => setLabPatientData({ ...labPatientData, isPregnant: !labPatientData.isPregnant })}
                  className={`w-full h-12 rounded-xl border flex items-center justify-between px-4 transition-all ${labPatientData.isPregnant ? 'bg-pink-500/10 border-pink-500/50 text-pink-500' : theme === 'dark' ? 'bg-slate-900/50 border-slate-800 text-slate-500' : 'bg-slate-50 border-slate-200 text-slate-500'}`}
                >
                  <span className="font-bold text-sm">{t('isPregnant')}</span>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${labPatientData.isPregnant ? 'bg-pink-500 border-pink-500' : 'border-slate-500'}`}>
                    {labPatientData.isPregnant && <Check className="w-3 h-3 text-white" />}
                  </div>
                </button>
              )}

              <div className="space-y-2">
                <label className={`text-xs font-bold px-1 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>{t('clinicalNotes')}</label>
                <textarea
                  placeholder={t('clinicalNotesPlaceholder')}
                  className={`w-full h-24 p-4 rounded-xl font-medium resize-none focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-xs ${theme === 'dark' ? 'bg-[#0a0f16] border border-slate-700 text-white placeholder:text-slate-600' : 'bg-slate-50 border border-slate-200 text-slate-800'}`}
                  value={labPatientData.clinicalNotes}
                  onChange={(e) => setLabPatientData({ ...labPatientData, clinicalNotes: e.target.value })}
                  dir={lang === 'ar' ? 'rtl' : 'ltr'}
                />
              </div>

              <Button
                className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-lg shadow-lg shadow-emerald-600/20 active:scale-95 transition-all mt-2"
                onClick={() => { setShowLabForm(false); setShowMenu(true); }}
                disabled={!labPatientData.age}
              >
                {t('proceedToUpload')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {showCheckoutModal && selectedCheckoutPlan && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowCheckoutModal(false)}></div>
          <div className={`relative w-full max-w-md p-6 rounded-[2rem] shadow-2xl animate-in zoom-in-95 duration-300 ${theme === 'dark' ? 'bg-[#151c28] border border-slate-700' : 'bg-white border border-slate-200'}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
            <div className="flex justify-between items-center mb-6">
              <h3 className={`text-xl font-black ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                {lang === 'ar' ? "إتمام عملية الدفع" : "Complete Payment"}
              </h3>
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-red-500/10 hover:text-red-500" onClick={() => setShowCheckoutModal(false)}>
                <X className="w-6 h-6" />
              </Button>
            </div>

            <div className="space-y-4">
              <div className={`p-4 rounded-2xl border flex justify-between items-center ${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                <span className={`font-bold ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>{lang === 'ar' ? "الباقة المختارة:" : "Selected Plan:"}</span>
                <span className={`font-black text-lg uppercase tracking-wider ${theme === 'dark' ? 'text-teal-400' : 'text-teal-600'}`}>{selectedCheckoutPlan}</span>
              </div>

              <div className="pt-4 space-y-3">
                <p className={`text-sm font-bold mb-3 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                  {lang === 'ar' ? "تأكيد بيانات البطاقة الائتمانية" : "Confirm Credit Card Details"}
                </p>
                <div className="relative">
                  <CreditCard className={`absolute top-3.5 ${lang === 'ar' ? 'right-3' : 'left-3'} w-5 h-5 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`} />
                  <input
                    type="text"
                    placeholder={lang === 'ar' ? "رقم البطاقة (0000 0000 0000 0000)" : "Card Number (0000 0000 0000 0000)"}
                    maxLength={19}
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value.replace(/[^0-9\s]/g, ''))}
                    className={`w-full h-12 ${lang === 'ar' ? 'pr-10 pl-3 text-right' : 'pl-10 pr-3 text-left'} rounded-xl font-medium focus:ring-2 focus:ring-teal-500 outline-none transition-all ${theme === 'dark' ? 'bg-[#0a0f16] border border-slate-700 text-white placeholder:text-slate-600' : 'bg-slate-50 border border-slate-200 text-slate-800'}`}
                    dir="ltr"
                  />
                </div>

                <input
                  type="text"
                  placeholder={lang === 'ar' ? "الاسم على البطاقة" : "Cardholder Name"}
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  className={`w-full h-12 px-4 rounded-xl font-medium focus:ring-2 focus:ring-teal-500 outline-none transition-all ${theme === 'dark' ? 'bg-[#0a0f16] border border-slate-700 text-white placeholder:text-slate-600' : 'bg-slate-50 border border-slate-200 text-slate-800'}`}
                />

                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="MM/YY"
                    maxLength={5}
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value.replace(/[^0-9/]/g, ''))}
                    className={`w-full h-12 px-4 text-center rounded-xl font-medium focus:ring-2 focus:ring-teal-500 outline-none transition-all ${theme === 'dark' ? 'bg-[#0a0f16] border border-slate-700 text-white placeholder:text-slate-600' : 'bg-slate-50 border border-slate-200 text-slate-800'}`}
                    dir="ltr"
                  />
                  <div className="relative">
                    <Lock className={`absolute top-3.5 right-3 w-5 h-5 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`} />
                    <input
                      type="password"
                      placeholder="CVV"
                      maxLength={4}
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value.replace(/[^0-9]/g, ''))}
                      className={`w-full h-12 px-4 text-center rounded-xl font-medium focus:ring-2 focus:ring-teal-500 outline-none transition-all ${theme === 'dark' ? 'bg-[#0a0f16] border border-slate-700 text-white placeholder:text-slate-600' : 'bg-slate-50 border border-slate-200 text-slate-800'}`}
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-2 opacity-60 justify-center">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span className={`text-[10px] font-bold ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                    {lang === 'ar' ? "سيتم معالجة الدفع عبر بوابة آمنة وموثقة" : "Payment tracked securely inside the system"}
                  </span>
                </div>
              </div>

              <div className="pt-6 flex gap-3">
                <Button variant="outline" className={`flex-1 h-14 rounded-2xl font-bold border-2 ${theme === 'dark' ? 'border-slate-700 hover:bg-slate-800 text-slate-300' : 'border-slate-200 hover:bg-slate-100 text-slate-700'}`} onClick={() => setShowCheckoutModal(false)}>
                  {t('cancel')}
                </Button>
                <Button className="flex-[2] h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold shadow-lg shadow-emerald-600/20 active:scale-95 transition-all" onClick={confirmCheckout}>
                  {isSubscribeLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : (lang === 'ar' ? "متابعة الدفع الأمن" : "Proceed to Secure Payment")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedEntry && (
        <div
          className={`fixed inset-0 z-[150] flex flex-col animate-in slide-in-from-bottom duration-700 ${theme === 'dark' ? 'bg-[#0a0f16]' : 'bg-[#F2F6F9]'}`}
          dir="rtl"
        >
          <div className={`p-6 border-b flex justify-between items-center shadow-sm sticky top-0 z-10 ${theme === 'dark' ? 'bg-[#151c28] border-slate-800' : 'bg-white border-slate-200'}`}>
            <div className="text-right">
              <h3 className={`font-black text-lg ${theme === 'dark' ? 'text-teal-400' : 'text-teal-800'}`}>
                {t(selectedEntry.title as any) || selectedEntry.title}
              </h3>
              <p className={`text-xs font-medium ${theme === 'dark' ? 'text-slate-500' : 'text-slate-500'}`}>{selectedEntry.date}</p>
            </div>
            <Button
              variant="ghost"
              className={`rounded-xl px-4 flex items-center gap-2 ${theme === 'dark' ? 'hover:bg-[#1a2332]' : 'hover:bg-slate-100'}`}
              onClick={() => setSelectedEntry(null)}
            >
              <ArrowRight className={`w-5 h-5 ${theme === 'dark' ? 'text-teal-400' : 'text-teal-600'}`} />
              <span className={`font-bold ${theme === 'dark' ? 'text-teal-400' : 'text-teal-600'}`}>{t('back')}</span>
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 pb-20">
            {selectedEntry.image && (
              <img
                src={selectedEntry.image}
                className={`w-full max-h-96 object-contain rounded-[2rem] border shadow-xl ${theme === 'dark' ? 'bg-[#0a0f16] border-slate-800' : 'bg-white border-slate-200'}`}
              />
            )}
            <div className={`p-6 rounded-[2rem] shadow-sm border ${theme === 'dark' ? 'bg-[#151c28] border-slate-800' : 'bg-white border-slate-100'}`}>
              {renderFormattedResult(selectedEntry.content)}

              <div className="flex gap-2 justify-end mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  className={`rounded-xl flex items-center gap-2 border-dashed ${theme === 'dark' ? 'border-slate-700 text-slate-400 hover:bg-white/5' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                  onClick={() => {
                    const postText = `📝 منشور صيدلاني توعوي:\n\n${selectedEntry.content}\n\n#farmatechai #FarmaTechAI #farmatechai.com #فارمتك_AI #نصيحة_طبية #صيدلية`;
                    shareContent(t(selectedEntry.title as any) || selectedEntry.title, postText, selectedEntry.image);
                  }}
                >
                  <Share2 className="w-4 h-4" />
                  {t('shareAsPost')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className={`rounded-xl flex items-center gap-2 border-dashed ${theme === 'dark' ? 'border-emerald-800 text-emerald-400 hover:bg-emerald-900/20' : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'}`}
                  onClick={() => downloadAsPDF(t(selectedEntry.title as any) || selectedEntry.title, selectedEntry.content, selectedEntry.image)}
                >
                  <FileSignature className="w-4 h-4" />
                  {t('downloadPDF')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      <Toaster />
    </div>
  );
}
