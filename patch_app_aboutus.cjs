const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

if (!code.includes("import AboutUs from './pages/AboutUs';")) {
  code = code.replace(
    "import Home from './pages/Home';",
    "import Home from './pages/Home';\nimport AboutUs from './pages/AboutUs';"
  );
}

if (!code.includes('<Route path="about" element={<AboutUs />} />')) {
  code = code.replace(
    '<Route path="exams" element={<Exams />} />',
    '<Route path="exams" element={<Exams />} />\n            <Route path="about" element={<AboutUs />} />'
  );
}

fs.writeFileSync('src/App.tsx', code);
