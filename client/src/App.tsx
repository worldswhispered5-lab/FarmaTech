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
      const res = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setAnalysis(data.result || data.error);
    } catch (err) {
      setAnalysis("حدث خطأ في الاتصال بالسيرفر.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-[#0f1115] text-white p-4 flex flex-col"
      dir="rtl"
    >
      <header className="flex items-center gap-3 border-b border-gray-800 pb-4 mb-6">
        <div className="bg-teal-500 p-2 rounded-xl shadow-lg">
          <Sun size={24} />
        </div>
        <h1 className="text-xl font-bold italic">صيدلية شفاء الشمس</h1>
      </header>

      <main className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex flex-col items-center py-10 gap-4">
            <Loader2 className="animate-spin text-teal-500" size={40} />
            <p className="text-teal-400">جاري التحليل السري...</p>
          </div>
        ) : analysis ? (
          <div className="bg-[#1a1d23] p-6 rounded-3xl border-r-4 border-teal-500 animate-in fade-in">
            <div className="flex items-center gap-2 mb-4 text-teal-400 font-bold border-b border-gray-800 pb-2">
              <CheckCircle2 size={18} /> <span>النتائج:</span>
            </div>
            <p className="text-gray-200 text-sm whitespace-pre-wrap leading-relaxed">
              {analysis}
            </p>
          </div>
        ) : (
          <div className="text-center text-gray-500 mt-20 italic">
            ارفع صورة الروشتة للبدء ☀️
          </div>
        )}
      </main>

      <footer className="relative mt-4">
        {showMenu && (
          <div className="absolute bottom-20 right-0 flex gap-4 animate-in zoom-in">
            <label className="cursor-pointer bg-[#1a1d23] p-4 rounded-2xl border border-gray-700">
              <Camera className="text-teal-400" />
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleAnalyze}
              />
            </label>
            <label className="cursor-pointer bg-[#1a1d23] p-4 rounded-2xl border border-gray-700">
              <ImageIcon className="text-teal-400" />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAnalyze}
              />
            </label>
          </div>
        )}
        <div className="flex bg-[#1a1d23] rounded-2xl p-2 border border-gray-800 items-center">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="bg-teal-500 p-4 rounded-xl active:scale-90 transition-all"
          >
            <Plus size={24} />
          </button>
          <input
            type="text"
            placeholder="اكتب هنا..."
            className="bg-transparent flex-1 px-4 outline-none text-right"
          />
        </div>
      </footer>
    </div>
  );
}
export default App;
