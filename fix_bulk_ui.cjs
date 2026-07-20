const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminMockTests.tsx', 'utf-8');

code = code.replace(
  'bg-blue-50/50 p-6 rounded-xl border border-blue-100 text-center',
  'bg-blue-50/50 dark:bg-blue-900/10 p-6 rounded-xl border border-blue-100 dark:border-blue-900/50 text-center'
);

code = code.replace(
  'border-2 border-dashed border-blue-200 rounded-xl bg-white dark:bg-[#1E1E2D] hover:bg-blue-50/30 transition-colors',
  'border-2 border-dashed border-blue-200 dark:border-blue-800/50 rounded-xl bg-white dark:bg-[#1E1E2D] hover:bg-blue-50/30 dark:hover:bg-blue-900/20 transition-colors'
);

code = code.replace(
  /bg-gray-100 text-gray-700 dark:text-white hover:bg-gray-200/g,
  'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700'
);

fs.writeFileSync('src/pages/admin/AdminMockTests.tsx', code);
