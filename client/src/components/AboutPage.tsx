import React, { useEffect } from "react";
import { ArrowRight, ArrowLeft, ShieldCheck, Zap, Stethoscope } from "lucide-react";
import { translations } from "../lib/translations";

interface AboutPageProps {
  onBack: () => void;
  theme: "light" | "dark";
  lang: "ar" | "en";
}

export function AboutPage({ onBack, theme, lang }: AboutPageProps) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const isRtl = lang === "ar";
  const t = (key: keyof typeof translations.ar) => (translations[lang] as any)[key] || key;

  return (
    <div className={`min-h-screen relative p-6 md:p-12 lg:p-24 overflow-hidden ${theme === 'dark' ? 'bg-[#010309] text-slate-100' : 'bg-[#F2F6F9] text-slate-800'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Background gradients */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
      <div className={`fixed top-[-10%] right-[-10%] w-[800px] h-[800px] blur-[150px] rounded-full pointer-events-none opacity-20 ${theme === 'dark' ? 'bg-emerald-900/40' : 'bg-emerald-300/40'}`}></div>
      <div className={`fixed bottom-[-10%] left-[-10%] w-[800px] h-[800px] blur-[150px] rounded-full pointer-events-none opacity-20 ${theme === 'dark' ? 'bg-blue-900/40' : 'bg-blue-300/40'}`}></div>

      <div className="max-w-4xl mx-auto relative z-10 w-full animate-in fade-in zoom-in-95 duration-700">
        <button 
          onClick={(e) => { e.preventDefault(); onBack(); }}
          className={`flex items-center gap-2 mb-12 py-3 px-6 rounded-full transition-all hover:scale-105 active:scale-95 shadow-sm font-bold ${theme === 'dark' ? 'bg-[#0a0f1c] hover:bg-[#0f172a] text-slate-300 border border-slate-800/80 shadow-black/50' : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-slate-200'}`}
        >
          {isRtl ? <ArrowRight className="w-5 h-5 text-emerald-500" /> : <ArrowLeft className="w-5 h-5 text-emerald-500" />}
          <span>{t('backToHome')}</span>
        </button>

        <div className="space-y-12">
          <div className="space-y-4 text-center lg:text-right">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-2 leading-tight">
              {t('aboutHeroTitle').includes('.') ? (
                <>
                  {t('aboutHeroTitle').split('.')[0]} <br className="hidden md:block"/> 
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500 drop-shadow-sm">
                    {t('aboutHeroTitle').split('.')[1]}
                  </span>
                </>
              ) : t('aboutHeroTitle')}
            </h1>
            <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-emerald-300/90 tracking-wide mb-8">
              {t('aboutHeroSubtitle')}
            </h2>
          </div>

          <div className={`p-8 md:p-12 rounded-[2.5rem] border ${theme === 'dark' ? 'bg-[#04070d]/80 backdrop-blur-xl border-white/[0.05] shadow-2xl shadow-black/80' : 'bg-white/80 backdrop-blur-xl border-slate-200 shadow-xl shadow-slate-200/50'} space-y-6 relative overflow-hidden group`}>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-50 group-hover:opacity-100 transition-opacity"></div>
            <h3 className="text-2xl md:text-3xl font-extrabold text-emerald-500 mb-4 tracking-tight">{lang === 'ar' ? 'من نحن؟' : 'Who We Are?'}</h3>
            <p className={`text-lg md:text-xl leading-relaxed ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'} font-medium`}>
              {t('aboutWhoWeAre')}
            </p>
            <p className={`text-lg md:text-xl leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
              {t('aboutTeam')}
            </p>
            <ul className={`space-y-4 mt-6 md:text-lg ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
              <li className="flex items-start gap-3">
                <span className="text-emerald-500 font-bold">1-</span>
                <span><strong className={theme === 'dark' ? 'text-white' : 'text-slate-900'}>{t('aboutVisionTitle')}</strong> {t('aboutVisionDesc')}</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-emerald-500 font-bold">2-</span>
                <span><strong className={theme === 'dark' ? 'text-white' : 'text-slate-900'}>{t('aboutLocalTitle')}</strong> {t('aboutLocalDesc')}</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-emerald-500 font-bold">3-</span>
                <span><strong className={theme === 'dark' ? 'text-white' : 'text-slate-900'}>{t('aboutGoalTitle')}</strong> {t('aboutGoalDesc')}</span>
              </li>
            </ul>
          </div>

          <div className={`p-8 md:p-12 rounded-[2.5rem] border ${theme === 'dark' ? 'bg-[#04070d]/80 backdrop-blur-xl border-white/[0.05] shadow-2xl shadow-black/80' : 'bg-white/80 backdrop-blur-xl border-slate-200 shadow-xl shadow-slate-200/50'} space-y-10 relative overflow-hidden group`}>
            <div className="absolute top-0 right-0 w-1/2 h-1 bg-gradient-to-l from-transparent via-teal-500 to-transparent opacity-50 group-hover:opacity-100 transition-opacity"></div>
            <h3 className="text-2xl md:text-3xl font-extrabold text-teal-400 tracking-tight">{t('aboutTechTitle')}</h3>
            <p className={`text-lg md:text-xl leading-relaxed ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'} font-medium`}>
              {t('aboutTechDesc')}
            </p>
            <p className={`text-lg md:text-xl leading-relaxed ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'} font-medium`}>
              {t('aboutVisionExtra')}
            </p>

            <div className="grid md:grid-cols-3 gap-8 pt-8 border-t border-slate-800/50">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                  <ShieldCheck className="w-6 h-6 text-emerald-500" />
                </div>
                <h4 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{t('aboutSafetyTitle')}</h4>
                <p className={`text-sm leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                  {t('aboutSafetyDesc')}
                </p>
              </div>
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20">
                  <Zap className="w-6 h-6 text-yellow-500" />
                </div>
                <h4 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{t('aboutSpeedTitle')}</h4>
                <p className={`text-sm leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                  {t('aboutSpeedDesc')}
                </p>
              </div>
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                  <Stethoscope className="w-6 h-6 text-blue-500" />
                </div>
                <h4 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{t('aboutUITitle')}</h4>
                <p className={`text-sm leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                  {t('aboutUIDesc')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className={`mt-20 p-10 md:p-16 rounded-[2.5rem] border ${theme === 'dark' ? 'bg-[#03060c]/90 backdrop-blur-xl border-cyan-900/30 shadow-[0_0_50px_rgba(6,182,212,0.08)]' : 'bg-cyan-50 border-cyan-100 shadow-xl'} flex flex-col items-center justify-center text-center relative overflow-hidden group`}>
          <div className="absolute top-0 inset-x-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/80 to-transparent opacity-50"></div>
          
          <div className={`absolute inset-0 opacity-20 pointer-events-none ${theme === 'dark' ? 'block' : 'hidden'}`} style={{ backgroundImage: 'radial-gradient(circle at 10% 20%, #06b6d4 1px, transparent 1px), radial-gradient(circle at 80% 70%, #10b981 1px, transparent 1px)', backgroundSize: '120px 120px' }}></div>
          
          <h2 className={`text-3xl md:text-5xl font-black mb-6 relative z-10 ${theme === 'dark' ? 'text-white drop-shadow-md' : 'text-slate-900'}`}>
            {lang === 'ar' ? (
              <>انضم إلى الجيل الجديد من <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-400">صيادلة العراق</span></>
            ) : (
              <>Join the New Generation of <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-400">Iraqi Pharmacists</span></>
            )}
          </h2>
          <p className={`text-lg md:text-xl font-medium max-w-2xl mx-auto mb-10 relative z-10 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
            {t('aboutJoinDesc')}
          </p>
          <button 
            onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'instant' }); onBack(); }}
            className="relative z-10 bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-white font-black text-lg py-4 px-12 rounded-full shadow-[0_0_30px_rgba(6,182,212,0.4)] hover:shadow-[0_0_40px_rgba(6,182,212,0.6)] hover:scale-105 active:scale-95 transition-all duration-300"
          >
            {t('aboutStartNow')}
          </button>
        </div>

        <div className="mt-16 text-center border-t border-slate-800/50 pt-8 pb-10">
          <p className="text-slate-500 font-medium">{t('footerRights')}</p>
        </div>
      </div>
    </div>
  );
}
