import React, { useState } from "react";
import {
  Camera,
  Image as ImageIcon,
  Plus,
  CheckCircle2,
  Loader2,
  Sun,
} from "lucide-react";

function App() {
  const [showMenu, setShowMenu] = useState(false);
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setShowMenu(false);
    const formData = new FormData();
    formData.append("image", file);

    try {
      // نرسل الطلب للسيرفر الداخلي (مخفي) وليس لجوجل مباشرة
      const res = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setAnalysis(data.result || data.error);
    } catch (err) {
      setAnalysis("حدث خطأ في الاتصال بالسيرفر الصيدلاني.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-[#0f1115] text-white p-4 flex flex-col font-sans"
      dir="rtl"
    >
      <header className="flex items-center gap-3 border-b border-gray-800 pb-4 mb-6">
        <div className="bg-teal-500 p-2.5 rounded-xl shadow-[0_0_20px_rgba(20,184,166,0.4)]">
          <Sun size={28} className="text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold">صيدلية شفاء الشمس</h1>
          <p className="text-[10px] text-teal-400 font-bold tracking-widest">
            SHIFAA AL-SHAMS PHARMACY
          </p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto space-y-4">
        {loading && (
          <div className="flex flex-col items-center gap-4 py-10">
            <Loader2 className="animate-spin text-teal-500" size={40} />
            <p className="text-teal-400 font-medium">جاري قراءة الروشتة...</p>
          </div>
        )}

        {analysis ? (
          <div className="bg-[#1a1d23] p-6 rounded-3xl border-r-4 border-teal-500 shadow-2xl animate-in slide-in-from-bottom-4">
            <div className="flex items-center gap-2 mb-4 text-teal-400 font-bold border-b border-gray-800 pb-3">
              <CheckCircle2 size={20} />
              <span>نتائج التحليل الذكي:</span>
            </div>
            <div className="text-gray-200 text-sm whitespace-pre-wrap leading-relaxed">
              {analysis}
            </div>
          </div>
        ) : (
          !loading && (
            <div className="bg-[#1a1d23] p-6 rounded-3xl border border-gray-800 text-center">
              <p className="text-gray-400 text-sm">
                ارفع صورة الروشتة لبدء التحليل الآمن.
              </p>
            </div>
          )
        )}
      </div>

      <div className="relative mt-6">
        {showMenu && (
          <div className="absolute bottom-24 right-0 flex gap-4 z-50 animate-in zoom-in">
            <label className="flex flex-col items-center gap-2 cursor-pointer">
              <div className="bg-[#1a1d23] p-5 rounded-2xl text-teal-400 border border-gray-700 hover:bg-teal-600 transition-all shadow-xl">
                <Camera size={30} />
              </div>
              <span className="text-[11px] font-bold">كاميرا</span>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleAnalyze}
              />
            </label>
            <label className="flex flex-col items-center gap-2 cursor-pointer">
              <div className="bg-[#1a1d23] p-5 rounded-2xl text-teal-400 border border-gray-700 hover:bg-teal-600 transition-all shadow-xl">
                <ImageIcon size={30} />
              </div>
              <span className="text-[11px] font-bold">استوديو</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAnalyze}
              />
            </label>
          </div>
        )}

        <div className="flex items-center gap-4 bg-[#1a1d23] rounded-2xl p-3 border border-gray-800">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="bg-teal-500 p-4 rounded-xl text-white shadow-lg active:scale-95 transition-all"
          >
            <Plus
              size={28}
              className={
                showMenu
                  ? "rotate-45 transition-transform"
                  : "transition-transform"
              }
            />
          </button>
          <input
            type="text"
            placeholder="اطلب معلومة عن دواء..."
            className="flex-1 bg-transparent outline-none text-sm text-white text-right"
          />
        </div>
      </div>
    </div>
  );
}

export default App;
