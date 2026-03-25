const fs = require('fs');
const file = 'd:/xphrm/client/src/App.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add Import
if (!content.includes('import { AboutPage }')) {
  content = content.replace('import { createClient }', 'import { AboutPage } from "./components/AboutPage";\nimport { createClient }');
}

// 2. Add publicView State
if (!content.includes('const [publicView, setPublicView]')) {
  content = content.replace('const [view, setView] = useState<"main" | "history" | "profile" | "pricing">("main");', 'const [view, setView] = useState<"main" | "history" | "profile" | "pricing">("main");\n  const [publicView, setPublicView] = useState<"landing" | "about">("landing");');
}

// 3. Condition the Landing Page render
if (!content.includes('if (publicView === "about") {')) {
  content = content.replace('  if (!isLoggedIn) {', '  if (!isLoggedIn) {\n    if (publicView === "about") {\n      return <AboutPage onBack={() => setPublicView("landing")} theme={theme} lang={lang} />;\n    }');
}

// 4. Update the Footer Links to use publicView
content = content.replace('<a href="#" className="hover:text-[#06b6d4] transition-colors">من نحن</a>', '<a href="#" onClick={(e) => { e.preventDefault(); setPublicView("about"); }} className="hover:text-[#06b6d4] transition-colors">من نحن</a>');

fs.writeFileSync(file, content, 'utf8');
console.log('App.tsx successfully modified');
