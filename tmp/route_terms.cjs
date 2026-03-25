const fs = require('fs');
const file = 'd:/xphrm/client/src/App.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add Import
if (!content.includes('import { TermsOfUse }')) {
  content = content.replace('import { PrivacyPolicy } from "./components/PrivacyPolicy";', 'import { PrivacyPolicy } from "./components/PrivacyPolicy";\nimport { TermsOfUse } from "./components/TermsOfUse";');
}

// 2. Add publicView Type
if (content.includes('useState<"landing" | "about" | "contact" | "privacy">')) {
  content = content.replace('useState<"landing" | "about" | "contact" | "privacy">', 'useState<"landing" | "about" | "contact" | "privacy" | "terms">');
}

// 3. Condition for Terms Page (Added right above Privacy to be clean)
if (!content.includes('if (publicView === "terms") {')) {
  const check = 'if (publicView === "privacy") {';
  const newRoute = 'if (publicView === "terms") {\n      return <TermsOfUse onBack={() => setPublicView("landing")} theme={theme} lang={lang} />;\n    }\n    ' + check;
  content = content.replace(check, newRoute);
}

// 4. Update the Footer "شروط الاستخدام" Link
content = content.replace('<a href="#" className="hover:text-[#06b6d4] transition-colors">شروط الاستخدام</a>', '<a href="#" onClick={(e) => { e.preventDefault(); setPublicView("terms"); }} className="hover:text-[#06b6d4] transition-colors">شروط الاستخدام</a>');

fs.writeFileSync(file, content, 'utf8');
console.log('App.tsx routing for Terms of Use was successful!');
