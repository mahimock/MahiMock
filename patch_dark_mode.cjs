const fs = require('fs');

const files = [
  'src/pages/admin/AdminCategories.tsx',
  'src/pages/admin/AdminStudyMaterials.tsx',
  'src/pages/admin/AdminMockTests.tsx',
  'src/pages/admin/AdminUpdates.tsx',
  'src/pages/admin/AdminQuestionManager.tsx'
];

files.forEach(file => {
  if (!fs.existsSync(file)) return;
  let code = fs.readFileSync(file, 'utf-8');
  
  // Basic dark mode utility replacements
  code = code.replace(/bg-white/g, "bg-white dark:bg-[#1E1E2D]");
  code = code.replace(/bg-gray-50/g, "bg-gray-50 dark:bg-[#151521]");
  code = code.replace(/border-gray-100/g, "border-gray-100 dark:border-gray-800");
  code = code.replace(/border-gray-200/g, "border-gray-200 dark:border-gray-700");
  
  code = code.replace(/text-gray-900/g, "text-gray-900 dark:text-white");
  code = code.replace(/text-gray-800/g, "text-gray-800 dark:text-gray-200");
  code = code.replace(/text-gray-700/g, "text-gray-700 dark:text-gray-300");
  code = code.replace(/text-gray-600/g, "text-gray-600 dark:text-gray-400");
  code = code.replace(/text-gray-500/g, "text-gray-500 dark:text-gray-400");
  
  // Fixes if we duplicated
  code = code.replace(/bg-white dark:bg-\[#1E1E2D\] dark:bg-\[#1E1E2D\]/g, "bg-white dark:bg-[#1E1E2D]");
  
  fs.writeFileSync(file, code);
});
