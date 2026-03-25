const fs = require('fs');
const file = 'd:/xphrm/client/src/App.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add Import
if (!content.includes('import { ContactPage }')) {
  content = content.replace('import { AboutPage }', 'import { AboutPage } from "./components/AboutPage";\nimport { ContactPage }');
}

// 2. Add publicView Type (if it is strictly typed)
if (content.includes('useState<"landing" | "about">')) {
  content = content.replace('useState<"landing" | "about">', 'useState<"landing" | "about" | "contact">');
}

// 3. Condition for Contact Page
if (!content.includes('if (publicView === "contact") {')) {
  content = content.replace('if (publicView === "about") {', 'if (publicView === "contact") {\n      return <ContactPage onBack={() => setPublicView("landing")} theme={theme} lang={lang} API_BASE_URL={API_BASE_URL} />;\n    }\n    if (publicView === "about") {');
}

// 4. Update the Footer "اتصل بنا" Link
content = content.replace('<a href="#" className="hover:text-[#06b6d4] transition-colors">اتصل بنا</a>', '<a href="#" onClick={(e) => { e.preventDefault(); setPublicView("contact"); }} className="hover:text-[#06b6d4] transition-colors">اتصل بنا</a>');

fs.writeFileSync(file, content, 'utf8');
console.log('App.tsx successfully updated with Contact route');
