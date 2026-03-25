import React, { useEffect } from "react";
import { ArrowLeft, ArrowRight, CheckSquare, UserCircle, ShieldCheck, AlertCircle, CreditCard, Copyright, XCircle, RefreshCw, Mail } from "lucide-react";
import { translations } from "../lib/translations";

interface TermsProps {
  onBack: () => void;
  theme: "light" | "dark";
  lang: "ar" | "en";
}

export function TermsOfUse({ onBack, theme, lang }: TermsProps) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const isRtl = lang === "ar";
  const t = (key: keyof typeof translations.ar) => (translations[lang] as any)[key] || key;

  const sections = [
    {
      id: "acceptance",
      icon: <CheckSquare className="w-6 h-6 text-emerald-500" />,
      title: t('terms1'),
      content: t('terms1Content')
    },
    {
      id: "eligibility",
      icon: <UserCircle className="w-6 h-6 text-blue-500" />,
      title: t('terms2'),
      content: t('terms2Content')
    },
    {
      id: "permitted-use",
      icon: <ShieldCheck className="w-6 h-6 text-cyan-500" />,
      title: t('terms3'),
      content: t('terms3Content')
    },
    {
      id: "liability",
      icon: <AlertCircle className="w-6 h-6 text-yellow-500" />,
      title: t('terms4'),
      content: t('terms4Content')
    },
    {
      id: "payments",
      icon: <CreditCard className="w-6 h-6 text-violet-500" />,
      title: t('terms5'),
      content: t('terms5Content')
    },
    {
      id: "intellectual-property",
      icon: <Copyright className="w-6 h-6 text-fuchsia-500" />,
      title: t('terms6'),
      content: t('terms6Content')
    },
    {
      id: "termination",
      icon: <XCircle className="w-6 h-6 text-red-500" />,
      title: t('terms7'),
      content: t('terms7Content')
    },
    {
      id: "amendments",
      icon: <RefreshCw className="w-6 h-6 text-teal-500" />,
      title: t('terms8'),
      content: t('terms8Content')
    },
    {
      id: "contact",
      icon: <Mail className="w-6 h-6 text-indigo-400" />,
      title: t('terms9'),
      content: t('terms9Content')
    },
    {
      id: "medical-disclaimer",
      icon: <AlertCircle className="w-6 h-6 text-rose-500" />,
      title: t('terms10'),
      content: t('terms10Content')
    }
  ];

  return (
    <div className={`min-h-screen relative overflow-hidden pb-20 ${theme === 'dark' ? 'bg-[#010309] text-slate-100' : 'bg-[#F2F6F9] text-slate-800'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Background gradients */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
      <div className={`fixed top-[15%] right-[20%] w-[600px] h-[600px] blur-[150px] rounded-full pointer-events-none opacity-20 ${theme === 'dark' ? 'bg-indigo-900/30' : 'bg-indigo-300/30'}`}></div>

      {/* Header Area */}
      <div className={`relative pt-12 pb-24 md:pt-16 md:pb-32 px-6 lg:px-24 mb-10 ${theme === 'dark' ? 'bg-gradient-to-b from-[#060b14] to-transparent' : 'bg-gradient-to-b from-slate-100 to-transparent'}`}>
        <div className="max-w-4xl mx-auto">
          <button 
            onClick={(e) => { e.preventDefault(); onBack(); }}
            className={`flex items-center gap-2 mb-10 py-2.5 px-5 rounded-full transition-all hover:scale-105 active:scale-95 text-sm font-bold ${theme === 'dark' ? 'bg-[#0a0f1c] hover:bg-[#0f172a] text-slate-300 border border-slate-800/80' : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'}`}
          >
            {isRtl ? <ArrowRight className="w-4 h-4 text-[#34d399]" /> : <ArrowLeft className="w-4 h-4 text-[#34d399]" />}
            <span>{t('backToHome')}</span>
          </button>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 tracking-tight">
            {t('termsTitle').split(' ').length > 1 ? (
              <>
                {t('termsTitle').split(' ')[0]}{" "}
                <span className="text-[#34d399]">
                  {t('termsTitle').split(' ').slice(1).join(' ')}
                </span>
              </>
            ) : t('termsTitle')}
          </h1>
          <p className={`text-lg md:text-xl font-medium max-w-2xl leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
            {t('termsSubtitle')}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 relative z-10 space-y-6 animate-in fade-in slide-in-from-bottom-10 duration-700">
        
        {sections.map((sec) => (
          <div key={sec.id} className={`p-8 rounded-3xl border ${theme === 'dark' ? 'bg-[#04070d]/80 backdrop-blur-xl border-white/[0.05] shadow-lg shadow-black/40 hover:border-indigo-500/20' : 'bg-white/80 backdrop-blur-xl border-slate-200 shadow-xl shadow-slate-200/50 hover:border-indigo-200'} relative overflow-hidden group transition-colors`}>
            {/* Soft glowing line on top of each card */}
            <div className="absolute top-0 inset-x-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            
            <div className="flex items-start gap-4 md:gap-6">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border mt-1 ${theme === 'dark' ? 'bg-[#0a0f1c] border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                {sec.icon}
              </div>
              <div className="pt-2">
                <h3 className={`text-2xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{sec.title}</h3>
                <div className="space-y-3">
                  {(sec.content as string[]).map((text, idx) => {
                    const isEmail = text.includes('@');
                    return (
                      <p key={idx} className={`text-base leading-relaxed flex items-start ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                        {isEmail ? (
                          <a href={`mailto:${text}`} className="font-bold text-[#34d399] hover:text-[#34d399]/80 transition-colors underline decoration-2 underline-offset-4">{text}</a>
                        ) : text}
                      </p>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        ))}

        <div className={`text-center pt-8 mt-12 border-t ${theme === 'dark' ? 'border-slate-800/50 text-slate-500' : 'border-slate-200 text-slate-400'}`}>
          <p className="font-medium text-sm">{t('footerRights')}</p>
        </div>
        
      </div>
    </div>
  );
}
