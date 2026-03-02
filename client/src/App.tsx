import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Clock,
  CheckCircle2,
  ChevronLeft,
} from "lucide-react";

export default function Home() {
  const [isReady, setIsReady] = useState(false);
  const [accessCode, setAccessCode] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [showMenu, setShowMenu] = useState(false);
  const [showCalc, setShowCalc] = useState(false);
  const [view, setView] = useState<"main" | "history">("main");
  const [selectedEntry, setSelectedEntry] = useState<any | null>(null);
  const [chatInput, setChatInput] = useState("");
  const [currentAnalysisImage, setCurrentAnalysisImage] = useState<
    string | null
  >(null);

  const [calcData, setCalcData] = useState({ drug: "", weight: "", age: "" });
  const inputRef = useRef<HTMLInputElement>(null);

  const userMap: any = {
    m1: "Mohamed",
    s1: "Shams",
    r1: "Rand",
    s2: "Suroor",
    h1: "Hamid",
    m2: "Mazen",
    y1: "Yasser",
  };

  useEffect(() => {
    const savedCode = localStorage.getItem("shifa_access_code");
    if (savedCode && userMap[savedCode.toLowerCase().trim()]) {
      const code = savedCode.toLowerCase().trim();
      setAccessCode(code);
      setIsLoggedIn(true);
      const savedHistory = localStorage.getItem(`history_${code}`);
      if (savedHistory) setHistory(JSON.parse(savedHistory));
    }
    setIsReady(true);
  }, []);

  const renderFormattedResult = (text: string) => {
    if (!text.includes("|") && !text.includes("**")) {
      return (
        <div className="text-right text-slate-300 leading-relaxed p-2">
          {text}
        </div>
      );
    }
    const sections = text.split("\n\n");
    return (
      <div className="space-y-4 w-full animate-in fade-in slide-in-from-bottom-2 duration-500 text-right">
        {sections.map((section, idx) => {
          const lines = section.split("\n");
          if (section.includes("|")) {
            const rows = lines.filter(
              (l) => l.includes("|") && !l.includes("---"),
            );
            return (
              <div key={idx} className="space-y-3">
                {rows.map((row, rIdx) => {
                  const cells = row.split("|").filter((c) => c.trim() !== "");
                  if (rIdx === 0 && cells[0]?.includes("دواء")) return null;
                  return (
                    <div
                      key={rIdx}
                      className="bg-[#151515] border border-white/5 rounded-[1.5rem] p-4 shadow-xl"
                    >
                      <div className="flex items-center gap-2 mb-3 border-b border-white/5 pb-2">
                        {/* لوجو صغير بدون إطار داخل النتائج */}
                        <img
                          src="/logo.png"
                          className="w-6 h-6 object-contain"
                          alt=""
                        />
                        <span className="font-bold text-blue-400">
                          {cells[0]?.trim()}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                        <div className="flex items-center gap-3 bg-white/5 p-2 rounded-xl text-xs">
                          <Calculator className="w-3.5 h-3.5 text-purple-400" />
                          <span className="text-slate-300 font-bold ml-1">
                            الجرعة:
                          </span>
                          <span className="text-white">{cells[1]?.trim()}</span>
                        </div>
                        <div className="flex items-center gap-3 bg-white/5 p-2 rounded-xl text-xs">
                          <Clock className="w-3.5 h-3.5 text-orange-400" />
                          <span className="text-slate-300 font-bold ml-1">
                            المدة:
                          </span>
                          <span className="text-white">{cells[2]?.trim()}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          }
          return (
            <div
              key={idx}
              className="bg-[#111] p-4 rounded-2xl border border-white/5 text-sm"
            >
              {lines.map((l, i) => (
                <p key={i} className="mb-1 text-slate-300">
                  {l.replace(/\*\*|#/g, "")}
                </p>
              ))}
            </div>
          );
        })}
      </div>
    );
  };

  const handleAction = async (
    type: "image" | "text" | "calc",
    payload?: any,
  ) => {
    setIsLoading(true);
    setShowMenu(false);
    setShowCalc(false);
    setResult("");
    const formData = new FormData();
    formData.append("accessCode", accessCode.toLowerCase().trim());
    let displayImage = "/logo.png";
    if (type === "image") {
      formData.append("image", payload);
      displayImage = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(payload);
        reader.onload = () => resolve(reader.result as string);
      });
      setCurrentAnalysisImage(displayImage);
    } else if (type === "calc") {
      formData.append(
        "prompt",
        `احسب جرعة: ${calcData.drug}، وزن: ${calcData.weight}كجم، عمر: ${calcData.age}`,
      );
    } else {
      formData.append("prompt", chatInput);
    }
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setResult(data.result);
        const newEntry = {
          id: Date.now(),
          title: type === "image" ? "تحليل روشتة" : chatInput.substring(0, 20),
          date: new Date().toLocaleString("ar-EG"),
          content: data.result,
          image: displayImage,
        };
        setHistory([newEntry, ...history]);
        setChatInput("");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isReady) return null;

  // --- شاشة تسجيل الدخول (تم حذف الإطار المربع) ---
  if (!isLoggedIn) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-[#0a0a0a] p-6 text-white"
        dir="rtl"
      >
        <div className="w-full max-w-sm space-y-8 text-center">
          <div className="relative inline-block">
            {/* توهج خفيف خلف اللوجو فقط */}
            <div className="absolute inset-0 bg-blue-600/10 blur-[80px] rounded-full"></div>
            {/* اللوجو يظهر مباشرة بدون أي خلفية أو إطار */}
            <img
              src="/logo.png"
              alt="Logo"
              className="w-48 h-48 object-contain relative z-10 mx-auto animate-in zoom-in duration-700"
            />
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-black italic tracking-tighter text-white">
              SHIFAA
            </h1>
            <p className="text-slate-500 text-xs font-medium uppercase tracking-[0.3em]">
              Al-Shams Medical AI System
            </p>
          </div>
          <div className="space-y-4 pt-4">
            <Input
              placeholder="رمز الوصول"
              className="h-14 bg-[#111] border-white/5 text-center text-xl font-mono rounded-2xl focus:border-blue-500/50"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
            />
            <Button
              className="w-full h-14 bg-blue-600 hover:bg-blue-700 rounded-2xl font-bold text-lg shadow-lg shadow-blue-900/20"
              onClick={() => {
                if (userMap[accessCode.toLowerCase().trim()]) {
                  localStorage.setItem(
                    "shifa_access_code",
                    accessCode.toLowerCase().trim(),
                  );
                  setIsLoggedIn(true);
                  window.location.reload();
                } else {
                  alert("الرمز غير صحيح!");
                }
              }}
            >
              دخول النظام
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-[#0a0a0a] text-white pb-32 font-sans"
      dir="rtl"
    >
      {/* --- الهيدر (تم حذف الإطار المربع حول اللوجو الصغير) --- */}
      <div className="p-4 flex justify-between items-center border-b border-white/5 sticky top-0 bg-[#0a0a0a]/80 backdrop-blur-md z-40">
        <div className="flex items-center gap-3">
          {/* اللوجو يظهر هنا أيضاً بدون إطار */}
          <img
            src="/logo.png"
            alt="Logo"
            className="w-20 h-20 object-contain"
          />
          <div>
            <span className="font-black text-xl italic tracking-tighter block leading-none">
              SHIFAA
            </span>
            <span className="text-[10px] text-blue-500 font-bold uppercase tracking-widest leading-none mt-1 block">
              Al-Shams
            </span>
          </div>
        </div>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setView(view === "main" ? "history" : "main")}
          >
            <HistoryIcon
              className={`w-6 h-6 ${view === "history" ? "text-blue-400" : "text-slate-400"}`}
            />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              localStorage.removeItem("shifa_access_code");
              window.location.reload();
            }}
          >
            <LogOut className="w-5 h-5 text-red-500" />
          </Button>
        </div>
      </div>

      <div className="max-w-xl mx-auto p-5">
        {view === "main" ? (
          <div className="space-y-8 animate-in fade-in duration-500 text-center">
            <div className="py-6">
              <h1 className="text-3xl font-black italic tracking-tight">
                مرحباً، د. {userMap[accessCode]}
              </h1>
              <p className="text-slate-500 text-xs mt-2 uppercase tracking-[0.2em]">
                جاهز لتحليل البيانات الطبية
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <ActionBox
                icon={<Maximize2 className="text-blue-400" />}
                label="تحليل روشتة"
                color="blue"
                onClick={() => setShowMenu(true)}
              />
              <ActionBox
                icon={<Calculator className="text-purple-400" />}
                label="حساب جرعة"
                color="purple"
                onClick={() => setShowCalc(true)}
              />
              <ActionBox
                icon={<AlertTriangle className="text-orange-400" />}
                label="تداخلات"
                color="orange"
                onClick={() => {
                  setChatInput("تداخلات دواء: ");
                  inputRef.current?.focus();
                }}
              />
              <ActionBox
                icon={<MessageSquare className="text-green-400" />}
                label="نصيحة طبية"
                color="green"
                onClick={() => {
                  setChatInput("نصيحة حول: ");
                  inputRef.current?.focus();
                }}
              />
            </div>

            {isLoading && (
              <div className="flex flex-col items-center py-10">
                <Loader2 className="w-12 h-12 animate-spin text-blue-500 mb-2" />
                <p className="text-xs text-blue-400 font-bold animate-pulse tracking-widest uppercase">
                  جاري المعالجة...
                </p>
              </div>
            )}

            {result && !isLoading && (
              <div className="space-y-4 animate-in zoom-in-95 duration-300">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    Analysis Result
                  </span>
                  <button
                    onClick={() => {
                      setResult("");
                      setCurrentAnalysisImage(null);
                    }}
                    className="text-slate-600 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                {currentAnalysisImage && (
                  <div className="rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl">
                    <img
                      src={currentAnalysisImage}
                      className="w-full max-h-72 object-contain bg-black"
                    />
                  </div>
                )}
                {renderFormattedResult(result)}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4 pt-4 animate-in fade-in">
            <h2 className="text-xl font-black px-2 mb-6 text-right">
              سجل العمليات
            </h2>
            {history.map((item) => (
              <div
                key={item.id}
                className="bg-[#111] p-4 rounded-[1.5rem] flex items-center gap-4 border border-white/5 active:scale-95 transition-all"
                onClick={() => setSelectedEntry(item)}
              >
                <img
                  src={item.image}
                  className="w-14 h-14 rounded-xl object-cover border border-white/10 shadow-lg"
                />
                <div className="flex-1 text-right">
                  <h4 className="font-bold text-blue-400 text-sm">
                    {item.title}
                  </h4>
                  <p className="text-[10px] text-slate-500 mt-1">{item.date}</p>
                </div>
                <ChevronLeft className="w-5 h-5 text-slate-700" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* شريط البحث السفلي */}
      <div className="fixed bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black via-black/90 to-transparent z-40">
        <div className="max-w-md mx-auto bg-[#1a1a1a] border border-white/10 rounded-[2rem] p-2 flex items-center shadow-2xl">
          <Input
            ref={inputRef}
            placeholder="اسأل أي سؤال طبي..."
            className="bg-transparent border-none text-right focus-visible:ring-0 text-white"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAction("text")}
          />
          <button
            onClick={() => handleAction("text")}
            className="w-12 h-12 bg-blue-600 rounded-[1.4rem] flex items-center justify-center text-white active:scale-90 transition-transform"
          >
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* قوالب الإدخال */}
      {showCalc && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-6 backdrop-blur-md animate-in fade-in">
          <div className="bg-[#111] w-full max-w-sm rounded-[2.5rem] p-8 border border-white/10 shadow-2xl space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-purple-400 font-bold flex items-center gap-2">
                حاسبة الجرعة الذكية
              </h3>
              <X
                className="w-6 h-6 text-slate-600 cursor-pointer"
                onClick={() => setShowCalc(false)}
              />
            </div>
            <div className="space-y-4 text-right">
              <Input
                placeholder="اسم الدواء"
                className="h-14 bg-white/5 border-white/10 text-right rounded-xl"
                value={calcData.drug}
                onChange={(e) =>
                  setCalcData({ ...calcData, drug: e.target.value })
                }
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  placeholder="الوزن"
                  type="number"
                  className="h-14 bg-white/5 border-white/10 text-right rounded-xl"
                  value={calcData.weight}
                  onChange={(e) =>
                    setCalcData({ ...calcData, weight: e.target.value })
                  }
                />
                <Input
                  placeholder="العمر"
                  className="h-14 bg-white/5 border-white/10 text-right rounded-xl"
                  value={calcData.age}
                  onChange={(e) =>
                    setCalcData({ ...calcData, age: e.target.value })
                  }
                />
              </div>
              <Button
                className="w-full h-14 bg-purple-600 rounded-2xl font-bold"
                onClick={() => handleAction("calc")}
              >
                حساب الجرعة
              </Button>
            </div>
          </div>
        </div>
      )}

      {showMenu && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-6 backdrop-blur-md animate-in fade-in"
          onClick={() => setShowMenu(false)}
        >
          <div
            className="bg-[#111] w-full max-w-xs rounded-[2.5rem] p-8 space-y-6 border border-white/5 animate-in zoom-in"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-center text-blue-400 font-bold uppercase tracking-widest text-xs">
              مصدر الصورة
            </h3>
            <div className="grid gap-4">
              <label className="flex items-center gap-4 cursor-pointer p-5 bg-blue-600/10 rounded-2xl border border-blue-500/20 active:scale-95 transition-all shadow-lg">
                <Camera className="text-blue-400 w-6 h-6" />
                <span className="font-bold">فتح الكاميرا</span>
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
              <label className="flex items-center gap-4 cursor-pointer p-5 bg-purple-600/10 rounded-2xl border border-purple-500/20 active:scale-95 transition-all shadow-lg">
                <ImageIcon className="text-purple-400 w-6 h-6" />
                <span className="font-bold text-white">من المعرض</span>
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

      {/* عرض تفاصيل السجل */}
      {selectedEntry && (
        <div
          className="fixed inset-0 bg-black z-50 flex flex-col animate-in slide-in-from-bottom duration-500"
          dir="rtl"
        >
          <div className="p-5 border-b border-white/5 flex justify-between items-center bg-[#0a0a0a]">
            <div className="text-right">
              <h3 className="font-bold text-blue-400 text-sm">
                {selectedEntry.title}
              </h3>
              <p className="text-[10px] text-slate-500">{selectedEntry.date}</p>
            </div>
            <Button
              variant="ghost"
              className="rounded-full bg-white/5 w-10 h-10"
              onClick={() => setSelectedEntry(null)}
            >
              <X className="w-6 h-6" />
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-20">
            <img
              src={selectedEntry.image}
              className="w-full rounded-[2.5rem] border border-white/10 shadow-2xl"
            />
            <div>{renderFormattedResult(selectedEntry.content)}</div>
          </div>
        </div>
      )}
    </div>
  );
}

function ActionBox({ icon, label, color, onClick }: any) {
  const colors: any = {
    blue: "border-b-blue-500 hover:bg-blue-500/5 shadow-blue-900/10",
    purple: "border-b-purple-500 hover:bg-purple-500/5 shadow-purple-900/10",
    orange: "border-b-orange-500 hover:bg-orange-500/5 shadow-orange-900/10",
    green: "border-b-green-500 hover:bg-green-500/5 shadow-green-900/10",
  };
  return (
    <div
      className={`bg-[#111] border border-white/5 p-6 rounded-[2.2rem] flex flex-col items-center gap-3 border-b-2 ${colors[color]} cursor-pointer active:scale-95 transition-all group shadow-2xl`}
      onClick={onClick}
    >
      <div className="p-3 bg-white/5 rounded-2xl group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <span className="text-[11px] font-bold text-slate-300 uppercase tracking-tighter">
        {label}
      </span>
    </div>
  );
}
