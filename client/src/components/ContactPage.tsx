import React, { useState, useEffect } from "react";
import { ArrowLeft, ArrowRight, Mail, MessageSquare, Send, CheckCircle2 } from "lucide-react";
import { translations } from "../lib/translations";

interface ContactPageProps {
  onBack: () => void;
  theme: "light" | "dark";
  lang: "ar" | "en";
  API_BASE_URL: string;
}

export function ContactPage({ onBack, theme, lang, API_BASE_URL }: ContactPageProps) {
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const isRtl = lang === "ar";
  const t = (key: keyof typeof translations.ar) => (translations[lang] as any)[key] || key;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    // Simulate sending
    setTimeout(() => {
      setIsSending(false);
      setIsSent(true);
    }, 1500);
  };

  return (
    <div className={`min-h-screen relative overflow-hidden pb-12 ${theme === 'dark' ? 'bg-[#010309] text-slate-100' : 'bg-[#F2F6F9] text-slate-800'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Background elements */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
      <div className={`fixed top-[20%] left-[10%] w-[500px] h-[500px] blur-[120px] rounded-full pointer-events-none opacity-20 ${theme === 'dark' ? 'bg-cyan-900/30' : 'bg-cyan-300/30'}`}></div>
      <div className={`fixed bottom-[10%] right-[10%] w-[500px] h-[500px] blur-[120px] rounded-full pointer-events-none opacity-20 ${theme === 'dark' ? 'bg-indigo-900/30' : 'bg-indigo-300/30'}`}></div>

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        {/* Header Area */}
        <div className="pt-12 pb-16 md:pt-20 md:pb-24">
          <button 
            onClick={(e) => { e.preventDefault(); onBack(); }}
            className={`flex items-center gap-2 mb-10 py-2.5 px-5 rounded-full transition-all hover:scale-105 active:scale-95 text-sm font-bold ${theme === 'dark' ? 'bg-[#0a0f1c] hover:bg-[#0f172a] text-slate-300 border border-slate-800/80' : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'}`}
          >
            {isRtl ? <ArrowRight className="w-4 h-4 text-[#34d399]" /> : <ArrowLeft className="w-4 h-4 text-[#34d399]" />}
            <span>{t('backToHome')}</span>
          </button>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 tracking-tight">
            {t('contactTitle').split(' ').length > 1 ? (
              <>
                {t('contactTitle').split(' ')[0]}{" "}
                <span className="text-[#34d399]">
                  {t('contactTitle').split(' ').slice(1).join(' ')}
                </span>
              </>
            ) : t('contactTitle')}
          </h1>
          <p className={`text-lg md:text-xl font-medium max-w-2xl leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
            {t('contactSubtitle')}
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-12 items-start animate-in fade-in slide-in-from-bottom-10 duration-700">
          
          {/* Contact Info Cards */}
          <div className="lg:col-span-2 space-y-6">
            <div className={`p-8 rounded-3xl border ${theme === 'dark' ? 'bg-[#04070d]/80 backdrop-blur-xl border-white/[0.05] shadow-xl' : 'bg-white/80 backdrop-blur-xl border-slate-200 shadow-xl'}`}>
              <div className="w-12 h-12 rounded-2xl bg-[#34d399]/10 flex items-center justify-center mb-6 border border-[#34d399]/20">
                <Mail className="w-6 h-6 text-[#34d399]" />
              </div>
              <h3 className={`text-xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{t('contactEmailLabel')}</h3>
              <p className={`text-sm mb-6 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                {t('contactEmailDesc')}
              </p>
              <a href="mailto:farmatechai.info@gmail.com" className="text-lg font-bold text-[#34d399] hover:text-[#34d399]/80 transition-colors">
                farmatechai.info@gmail.com
              </a>
            </div>


          </div>

          {/* Contact Form */}
          <div className="lg:col-span-3">
            <div className={`p-8 md:p-12 rounded-[2.5rem] border relative overflow-hidden ${theme === 'dark' ? 'bg-[#04070d]/80 backdrop-blur-2xl border-white/[0.05] shadow-2xl' : 'bg-white/90 backdrop-blur-2xl border-slate-200 shadow-2xl shadow-slate-200/50'}`}>
              
              {!isSent ? (
                <>
                  <h3 className={`text-2xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{t('contactFormTitle')}</h3>
                  <p className={`mb-10 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                    {t('contactFormSubtitle')}
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className={`text-sm font-bold px-1 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>{t('contactNameLabel')}</label>
                        <input 
                          type="text" 
                          required
                          placeholder={t('contactNamePlaceholder')}
                          className={`w-full py-4 px-6 rounded-2xl border transition-all outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500/50 ${theme === 'dark' ? 'bg-[#0a0f1c] border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className={`text-sm font-bold px-1 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>{t('contactEmailLabel')}</label>
                        <input 
                          type="email" 
                          required
                          placeholder={t('contactEmailPlaceholder')}
                          className={`w-full py-4 px-6 rounded-2xl border transition-all outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500/50 ${theme === 'dark' ? 'bg-[#0a0f1c] border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className={`text-sm font-bold px-1 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>{t('contactMessageLabel')}</label>
                      <textarea 
                        rows={5}
                        required
                        placeholder={t('contactMessagePlaceholder')}
                        className={`w-full py-4 px-6 rounded-2xl border transition-all outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500/50 resize-none ${theme === 'dark' ? 'bg-[#0a0f1c] border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                      ></textarea>
                    </div>

                    <button 
                      type="submit"
                      disabled={isSending}
                      className="w-full py-4 px-8 rounded-2xl bg-gradient-to-r from-[#34d399] to-emerald-600 hover:from-[#34d399]/90 hover:to-emerald-500 text-white font-black text-lg shadow-lg shadow-[#34d399]/20 hover:shadow-[#34d399]/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:scale-100"
                    >
                      {isSending ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          {t('contactSending')}
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          {t('contactSend')}
                        </>
                      )}
                    </button>
                  </form>
                </>
              ) : (
                <div className="py-12 flex flex-col items-center text-center space-y-6 animate-in zoom-in-95 duration-500">
                  <div className="w-24 h-24 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 mb-4">
                    <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                  </div>
                  <h3 className={`text-4xl font-black ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{t('contactSuccess')}</h3>
                  <p className={`text-lg max-w-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                    {t('contactSuccessDesc')}
                  </p>
                  <button 
                    onClick={() => setIsSent(false)}
                    className="mt-8 py-3 px-8 rounded-full border border-cyan-500 text-cyan-500 font-bold hover:bg-cyan-500 hover:text-white transition-all"
                  >
                    {t('contactAnother')}
                  </button>
                </div>
              )}

            </div>
          </div>

        </div>

        <div className={`text-center pt-24 pb-8 border-t mt-24 ${theme === 'dark' ? 'border-slate-800/50 text-slate-500' : 'border-slate-100 text-slate-400'}`}>
          <p className="font-medium text-sm">{t('footerRights')}</p>
        </div>
      </div>
    </div>
  );
}
