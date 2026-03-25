const fs = require('fs');
const file = 'd:/xphrm/client/src/App.tsx';
let content = fs.readFileSync(file, 'utf8');

const lucideImports = ['Star', 'Linkedin', 'Send'];
lucideImports.forEach(imp => {
  if (!content.includes(imp + ',') && !content.includes(imp + ' }') && !content.includes(imp + '}')) {
    content = content.replace('Instagram,', `Instagram,\n  ${imp},`);
  }
});

const lines = content.split(/\r?\n/);
let startIdx = lines.findIndex(l => l.includes('// --- Login Screen ---'));
let endIdx = -1;
for(let i = startIdx + 1; i < lines.length; i++){
  if(lines[i].includes('  return (') && lines[i+1].includes('<div') && lines[i+2].includes('className={`min-h-screen pb-10')){
    endIdx = i;
    break;
  }
}

if(startIdx === -1 || endIdx === -1) {
  console.error("Start:", startIdx, "End:", endIdx);
  process.exit(1);
}

const newLoginBlock = `  // --- Login Screen ---
  if (!isLoggedIn) {
    const features = [
      {
        icon: <FileSignature className="w-6 h-6 text-emerald-400" />,
        title: "قراءة الوصفات (OCR)",
        desc: "تحويل فوري ودقيق للوصفات اليدوية",
      },
      {
        icon: <AlertTriangle className="w-6 h-6 text-emerald-400" />,
        title: "كاشف التفاعلات",
        desc: "فحص التداخلات الدوائية الخطيرة",
      },
      {
        icon: <Calculator className="w-6 h-6 text-emerald-400" />,
        title: "حاسبة الجرعات",
        desc: "دقة متناهية للأطفال والبالغين",
      },
      {
        icon: <Sparkles className="w-6 h-6 text-emerald-400" />,
        title: "مساعد ذكي",
        desc: "إجابات فورية لأي استفسار دوائي",
      },
    ];

    const plans = [
      {
        name: "مجاني",
        price: "0",
        period: "التجربة الأولى",
        desc: "فرصة مثالية لتجربة النظام واختبار الذكاء الاصطناعي بدون تكلفة.",
        features: ["25 طلب مجاني", "جميع نماذج AI متاحة", "قراءة الروشتات (OCR)"],
        buttonProps: { text: "ابدأ الآن", primary: false }
      },
      {
        name: "مبتدئ (Starter)",
        price: "10$",
        period: "شهرياً",
        desc: "مصممة لطلاب الصيدلة والباحثين لإنجاز المهام الدراسية.",
        features: ["150 طلب شهرياً", "سرعة استجابة قياسية", "كاشف التفاعلات الدوائية"],
        buttonProps: { text: "اشترك في Starter", primary: false }
      },
      {
        name: "برو (Pro)",
        price: "20$",
        period: "شهرياً",
        desc: "الخيار الاحترافي للصيدليات لسرعة وأمان في الصرف اليومي.",
        features: ["375 طلب شهرياً", "أولوية قصوى ⚡", "دعم فني مباشر وسريع"],
        buttonProps: { text: "اشترك في Pro", primary: true }
      },
      {
        name: "النخبة (Elite)",
        price: "200$",
        period: "سنوياً",
        desc: "أقصى توفير وتغطية طويلة الأمد للمؤسسات الكبرى.",
        features: ["5525 طلب سنوياً", "شهرين مجاناً 💰", "أولوية VIP ودعم مخصص"],
        buttonProps: { text: "انضم للنخبة", primary: false }
      }
    ];

    const testimonials = [
      {
        quote: "كنت متشككاً في البداية، لكن ميزة الـ OCR وقراءة الوصفات صدمتني بدقتها. النظام يكتشف أخطاء وصفية قد نغفل عنها.",
        author: "د. خالد يوسف",
        role: "صيدلي إكلينيكي",
        avatar: "خ",
        color: "bg-[#06b6d4]"
      },
      {
        quote: "بصفتي طالبة، FarmaTech ساعدني كثيراً في فهم آليات الأدوية وحفظ الجرعات. إنه بمثابة معلم خاص متاح 24 ساعة.",
        author: "سارة العلي",
        role: "طالبة صيدلة - السنة الخامسة",
        avatar: "س",
        color: "bg-[#06b6d4]"
      },
      {
        quote: "أداة لا غنى عنها في الصيدلية! توفر علي ساعات من البحث في المراجع الورقية، خاصة عند ازدحام العملاء. دقة التفاعلات مذهلة.",
        author: "د. أحمد المنصوري",
        role: "صيدلي مجتمع - 8 سنوات خبرة",
        avatar: "أ",
        color: "bg-[#06b6d4]"
      }
    ];

    const faqs = [
      {
        q: "هل نتائج الذكاء الاصطناعي موثوقة طبياً؟",
        a: "تم تدريب نماذجنا على قواعد بيانات عالمية معتمدة لتوفير أعلى درجات الدقة. ومع ذلك، تبقى أداة داعمة للقرار الطبي ولا تغني عن خبرتك السريرية كصيدلي."
      },
      {
        q: "هل بياناتي وبيانات المرضى آمنة؟",
        a: "نعم، نستخدم أحدث بروتوكولات التشفير ولا نشارك أي معلومات شخصية لضمان الخصوصية التامة لك ولمرضاك."
      },
      {
        q: "هل يمكنني تجربة الخدمة قبل الدفع؟",
        a: "بالتأكيد! نوفر باقة مجانية تماماً تتيح لك 25 طلباً لتجربة جميع ميزات الذكاء الاصطناعي دون الحاجة لبطاقة ائتمانية."
      },
      {
        q: "هل يمكنني إلغاء الاشتراك في أي وقت؟",
        a: "نعم، النظام مرن بالكامل. يمكنك إلغاء أو ترقية اشتراكك في أي وقت مباشرة عبر لوحة التحكم الخاصة بك."
      }
    ];

    return (
      <div 
        className="min-h-screen relative flex flex-col bg-[#010309] text-slate-100 font-sans selection:bg-emerald-500/30 overflow-x-hidden"
        dir="rtl"
      >
        {/* Floating Technical Support Button */}
        <div className="fixed bottom-6 right-6 z-[100] animate-bounce-slow">
          <a href="https://t.me/PharmaPalAISupport_Bot" target="_blank" rel="noopener noreferrer" className="w-14 h-14 rounded-full bg-[#229ED9] flex items-center justify-center text-white shadow-lg shadow-[#229ED9]/40 hover:scale-110 transition-transform duration-300">
            <Send className="w-6 h-6 ml-[-4px] mt-[2px]" />
          </a>
        </div>

        {/* Global Abstract Background Effects */}
        <div className="fixed inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
        <div className="fixed top-[-20%] left-[-10%] w-[800px] h-[800px] blur-[150px] rounded-full pointer-events-none opacity-20 bg-emerald-900/40"></div>
        <div className="fixed bottom-[-20%] right-[-10%] w-[800px] h-[800px] blur-[150px] rounded-full pointer-events-none opacity-20 bg-blue-900/40"></div>

        {/* --- HERO SECTION --- */}
        <section className="min-h-screen w-full flex items-center relative z-10 pt-10 lg:pt-0 pb-12">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
              
              <div className="lg:col-span-7 flex flex-col justify-center text-center lg:text-right space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 mt-10 lg:mt-0">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-semibold mx-auto lg:mx-0 w-fit backdrop-blur-sm shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                  <Sparkles className="w-4 h-4" />
                  <span>الجيل الجديد من تكنولوجيا الصيدلة</span>
                </div>

                <div className="space-y-6">
                  <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] text-white">
                    الذكاء الاصطناعي <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-600 font-black drop-shadow-sm">
                      بمفهوم صيدلاني جديد.
                    </span>
                  </h1>
                  <p className="text-lg lg:text-xl text-slate-400 font-medium leading-relaxed max-w-2xl mx-auto lg:mx-0">
                    قدرات خارقة وواجهة بسيطة. احصل على التحليل الدوائي الشامل، التفاعلات، وجرعات الأدوية بضغطة زر. صُمم خصيصاً لتعزيز ممارستك.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 shrink-0 max-w-2xl mx-auto lg:mx-0 w-full mb-10 lg:mb-0">
                  {features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-colors">
                      <div className="mt-1 p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)] shrink-0">
                        {feature.icon}
                      </div>
                      <div>
                        <h3 className="text-white font-bold text-base mb-1">{feature.title}</h3>
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
                      <h2 className="text-3xl font-black text-white tracking-tight">
                        FarmaTech <span className="text-emerald-400">AI</span>
                      </h2>
                      <p className="text-emerald-500/80 text-sm font-bold tracking-[0.2em] uppercase">
                        بوابتك للذكاء الطبي
                      </p>
                    </div>

                    <div className="w-full space-y-4 relative z-10">
                      <Button
                        className="w-full h-14 rounded-2xl font-bold text-base flex items-center justify-center gap-3 bg-white text-slate-900 hover:bg-slate-100 transition-all hover:scale-[1.02] active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.1)] group"
                        onClick={async () => {
                          try {
                            const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin }});
                            if (error) toast({ variant: "destructive", title: t('loginError'), description: error.message });
                          } catch (e: any) {
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
                      <p className="text-xs text-slate-500 font-medium leading-relaxed">
                        بالاستمرار، أنت توافق على شروط الاستخدام وسياسة الخصوصية لمنصة FarmaTech.
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
              <h2 className="text-3xl md:text-5xl font-black text-white">الباقات</h2>
              <p className="text-lg text-slate-400 font-medium max-w-2xl mx-auto">ارتقِ بأدائك الصيدلاني واختر الباقة التي تناسب حجم عملك اليومي.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {plans.map((plan, i) => (
                <div key={i} className={\`relative p-8 rounded-3xl border flex flex-col transition-all duration-300 hover:-translate-y-2 \${plan.buttonProps.primary ? 'bg-[#060b13] border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.1)] md:scale-105 z-10' : 'bg-[#02050a] border-white/[0.05] hover:border-slate-700'}\`}>
                  {plan.buttonProps.primary && (
                    <div className="absolute top-0 inset-x-0 -mt-3 flex justify-center">
                      <span className="bg-emerald-500 text-slate-900 text-xs font-black uppercase tracking-wider py-1.5 px-4 rounded-full shadow-lg shadow-emerald-500/30">الأكثر طلباً</span>
                    </div>
                  )}
                  <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                  <div className="mb-4">
                    <span className="text-4xl font-black text-emerald-400">{plan.price}</span>
                    {plan.price !== "0" && <span className="text-slate-500 text-sm ml-1">/ {plan.period}</span>}
                  </div>
                  <p className="text-slate-400 text-sm mb-8 flex-grow leading-relaxed">{plan.desc}</p>
                  
                  <ul className="space-y-4 mb-8">
                    {plan.features.map((f, j) => (
                      <li key={j} className="flex items-center gap-3 text-sm font-medium text-slate-300">
                        <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    variant={plan.buttonProps.primary ? "default" : "outline"}
                    className={\`w-full rounded-xl font-bold h-12 \${plan.buttonProps.primary ? 'bg-emerald-500 hover:bg-emerald-600 text-slate-900 shadow-lg shadow-emerald-500/25' : 'border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white'}\`}
                    onClick={() => {
                      toast({ title: "يرجى تسجيل الدخول", description: "قم بتسجيل الدخول أولاً للتمكن من الاشتراك في الباقات." });
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
        <section className="w-full py-24 relative z-10 border-b border-white/[0.02]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-3xl md:text-5xl font-black text-white">آراء العملاء</h2>
              <p className="text-lg text-slate-400 font-medium max-w-2xl mx-auto">انضم لآلاف الخبراء الذين جعلوا FarmaTech جزءاً من روتينهم اليومي.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((test, idx) => (
                <div key={idx} className="bg-[#05080f] p-8 rounded-3xl border border-white/[0.04] shadow-xl shadow-black/40 flex flex-col justify-between hover:border-white/[0.1] transition-colors">
                  <div>
                    <div className="flex justify-center mb-6">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star key={star} className="w-5 h-5 text-amber-500 fill-amber-500 mx-0.5" />
                      ))}
                    </div>
                    <p className="text-slate-300 text-sm leading-relaxed text-center mb-8 italic">
                      "{test.quote}"
                    </p>
                  </div>
                  
                  <div className="flex flex-col items-center border-t border-white/[0.05] pt-6">
                    <h4 className="text-white font-bold text-base">{test.author}</h4>
                    <p className="text-slate-500 text-xs mt-1">{test.role}</p>
                    <div className={\`w-10 h-10 mt-4 rounded-full flex items-center justify-center text-white font-bold text-lg \${test.color}\`}>
                      {test.avatar}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --- FAQ SECTION --- */}
        <section className="w-full py-24 relative z-10 border-b border-white/[0.02]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-black text-white">أسئلة شائعة</h2>
            </div>
            
            <div className="space-y-4">
              {faqs.map((faq, idx) => (
                <details key={idx} className="group bg-[#04070d] border border-white/[0.05] rounded-2xl overflow-hidden hover:border-emerald-500/30 transition-colors duration-300">
                  <summary className="flex justify-between items-center p-6 text-base md:text-lg font-bold text-white cursor-pointer list-none select-none outline-none">
                    <span>{faq.q}</span>
                    <span className="text-cyan-500 text-2xl leading-none group-open:rotate-45 transition-transform duration-300">+</span>
                  </summary>
                  <div className="px-6 pb-6 text-slate-400 text-sm md:text-base leading-relaxed border-t border-white/[0.02] pt-4 mt-2">
                    {faq.a}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* --- NEW EXACT FOOTER SECTION --- */}
        <footer className="w-full relative z-10 bg-black pt-16 pb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
            
            <div className="mb-10 text-center">
              <h2 className="text-3xl font-black text-white tracking-tight">
                FarmaTech <span className="text-[#06b6d4]">AI</span>
              </h2>
            </div>
            
            <div className="flex gap-4 mb-10 justify-center">
              <a href="https://www.tiktok.com/@farmatechai" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-[#0f1420] flex items-center justify-center text-slate-400 hover:text-white transition-all">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 2.37-1.15 4.67-2.9 6.25-1.74 1.58-4.2 2.3-6.52 1.9-2.32-.41-4.32-1.85-5.38-3.95-1.07-2.11-1.07-4.73.06-6.84 1.09-2.02 3.12-3.41 5.4-3.69v4.06c-1.12.11-2.18.66-2.9 1.56-.72.89-1 2.1-.73 3.22.27 1.12 1.05 2.05 2.08 2.51 1.03.46 2.27.42 3.26-.1.99-.53 1.7-1.48 1.9-2.61.05-.33.06-.67.06-1.01.02-6.53.01-13.06.01-19.59z"/></svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-[#0f1420] flex items-center justify-center text-slate-400 hover:text-white hover:bg-[#0077b5] transition-all">
                <Linkedin className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-[#0f1420] flex items-center justify-center text-slate-400 hover:text-white hover:bg-black transition-all">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 22.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="https://www.instagram.com/farmatech_ai/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-[#0f1420] flex items-center justify-center text-slate-400 hover:text-white hover:bg-[#E1306C] transition-all">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="https://www.facebook.com/FarmaTechAi/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-[#0f1420] flex items-center justify-center text-slate-400 hover:text-white hover:bg-[#1877F2] transition-all">
                <Facebook className="w-4 h-4" />
              </a>
            </div>

            <div className="flex flex-wrap justify-center gap-6 mb-10 text-sm font-medium text-slate-500">
              <a href="#" className="hover:text-[#06b6d4] transition-colors">الرئيسية</a>
              <a href="#" className="hover:text-[#06b6d4] transition-colors">من نحن</a>
              <a href="#" className="hover:text-[#06b6d4] transition-colors">اتصل بنا</a>
              <a href="#" className="hover:text-[#06b6d4] transition-colors">سياسة الخصوصية</a>
              <a href="#" className="hover:text-[#06b6d4] transition-colors">شروط الاستخدام</a>
            </div>

            <div className="text-center text-xs text-slate-600 font-medium w-full">
              FarmaTech AI 2026 © جميع الحقوق محفوظة.
            </div>
            
          </div>
        </footer>

      </div>
    );
  }
`;

lines.splice(startIdx, endIdx - startIdx, newLoginBlock);
fs.writeFileSync(file, lines.join('\n'), 'utf8');
console.log('App.tsx Landing Page rebuilt successfully.');
