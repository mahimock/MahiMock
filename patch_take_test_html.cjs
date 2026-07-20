const fs = require('fs');
let code = fs.readFileSync('src/pages/TakeTest.tsx', 'utf-8');

code = code.replace(
  "<h2 className=\"text-lg sm:text-xl font-bold text-gray-900 leading-relaxed\">{currentQ.text}</h2>",
  "<div className=\"text-lg sm:text-xl font-bold text-gray-900 leading-relaxed prose prose-sm max-w-none\" dangerouslySetInnerHTML={{ __html: currentQ.text }} />"
);

fs.writeFileSync('src/pages/TakeTest.tsx', code);
