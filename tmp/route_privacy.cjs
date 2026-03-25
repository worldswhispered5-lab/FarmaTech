const fs = require('fs');
const file = 'd:/xphrm/client/src/App.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add Import
if (!content.includes('import { PrivacyPolicy }')) {
  content = content.replace('import { ContactPage } from "./components/ContactPage";', 'import { ContactPage } from "./components/ContactPage";\nimport { PrivacyPolicy } from "./components/PrivacyPolicy";');
}

// 2. Add publicView Type
if (content.includes('useState<"landing" | "about" | "contact">')) {
  content = content.replace('useState<"landing" | "about" | "contact">', 'useState<"landing" | "about" | "contact" | "privacy">');
}

// 3. Condition for Privacy Page (Added right above Contact to be clean)
if (!content.includes('if (publicView === "privacy") {')) {
  // It should be injected somewhere around publicView checks
  const check = 'if (publicView === "contact") {';
  const newRoute = 'if (publicView === "privacy") {\n      return <PrivacyPolicy onBack={() => setPublicView("landing")} theme={theme} lang={lang} />;\n    }\n    ' + check;
  content = content.replace(check, newRoute);
}

// 4. Update the Footer "سياسة الخصوصية" Link
content = content.replace('<a href="#" className="hover:text-[#06b6d4] transition-colors">سياسة الخصوصية</a>', '<a href="#" onClick={(e) => { e.preventDefault(); setPublicView("privacy"); }} className="hover:text-[#06b6d4] transition-colors">سياسة الخصوصية</a>');

fs.writeFileSync(file, content, 'utf8');
console.log('App.tsx routing for Privacy Policy was successful!');
