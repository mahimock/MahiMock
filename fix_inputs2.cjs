const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminMockTests.tsx', 'utf-8');

// Fix the duplicated class names from previous replace
code = code.replace(/className="dark:text-white dark:bg-\[#1E1E2E\] w-full/g, 'className="w-full');
code = code.replace(/bg-gray-50 dark:bg-\[#1E1E2E\] dark:text-white/g, 'bg-gray-50 dark:bg-[#1E1E2E]');
code = code.replace(/text-gray-500 dark:text-gray-400 cursor-not-allowed/g, 'text-gray-500 dark:text-white cursor-not-allowed');

// Add dark:bg-[#1E1E2E] and dark:text-white to all inputs, selects, textareas
code = code.replace(/<input([^>]*)className="([^"]*)"/g, (match, before, classes) => {
  if (before.includes('type="file"')) return match; // skip file input
  const cleanClasses = classes.replace(/dark:bg-\[[^\]]+\]/g, '').replace(/dark:text-[a-z0-9-]+/g, '');
  return `<input${before}className="${cleanClasses} dark:bg-[#1E1E2E] dark:text-white dark:placeholder-white"`;
});

code = code.replace(/<select([^>]*)className="([^"]*)"/g, (match, before, classes) => {
  const cleanClasses = classes.replace(/dark:bg-\[[^\]]+\]/g, '').replace(/dark:text-[a-z0-9-]+/g, '');
  return `<select${before}className="${cleanClasses} dark:bg-[#1E1E2E] dark:text-white"`;
});

code = code.replace(/<textarea([^>]*)className="([^"]*)"/g, (match, before, classes) => {
  const cleanClasses = classes.replace(/dark:bg-\[[^\]]+\]/g, '').replace(/dark:text-[a-z0-9-]+/g, '');
  return `<textarea${before}className="${cleanClasses} dark:bg-[#1E1E2E] dark:text-white dark:placeholder-white"`;
});

// Fix labels
code = code.replace(/<label([^>]*)className="([^"]*)"/g, (match, before, classes) => {
  const cleanClasses = classes.replace(/dark:text-[a-z0-9-]+/g, '');
  return `<label${before}className="${cleanClasses} dark:text-white"`;
});

// Fix h3, h4, h5 (headings)
code = code.replace(/<h([1-6])([^>]*)className="([^"]*)"/g, (match, tag, before, classes) => {
  const cleanClasses = classes.replace(/dark:text-[a-z0-9-]+/g, '');
  return `<h${tag}${before}className="${cleanClasses} dark:text-white"`;
});

fs.writeFileSync('src/pages/admin/AdminMockTests.tsx', code);
