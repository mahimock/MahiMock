const fs = require('fs');
let code = fs.readFileSync('src/pages/TestResult.tsx', 'utf-8');

code = code.replace(
  "<h3 className=\"font-bold text-gray-900 mb-4\">{q.text}</h3>",
  "<div className=\"font-bold text-gray-900 mb-4 prose prose-sm max-w-none\" dangerouslySetInnerHTML={{ __html: q.text }} />"
);

code = code.replace(
  "<p className=\"text-sm text-blue-800 whitespace-pre-wrap\">{q.explanation}</p>",
  "<div className=\"text-sm text-blue-800 prose prose-sm max-w-none prose-blue\" dangerouslySetInnerHTML={{ __html: q.explanation }} />"
);

fs.writeFileSync('src/pages/TestResult.tsx', code);
