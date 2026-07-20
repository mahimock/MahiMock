import fs from 'fs';
import path from 'path';

function walkSync(dir, filelist = []) {
  fs.readdirSync(dir).forEach(file => {
    const dirFile = path.join(dir, file);
    try {
      filelist = walkSync(dirFile, filelist);
    } catch (err) {
      if (err.code === 'ENOTDIR' || err.code === 'EBADF') filelist.push(dirFile);
    }
  });
  return filelist;
}

const files = walkSync('src').filter(f => f.endsWith('.tsx') || f.endsWith('.ts'));

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // We want to safely add dark mode variants to these hardcoded values
  // Only if they are not already preceded by dark: or light: (though light: isn't tailwind standard)
  
  // A helper to replace specific class patterns
  const replaceClass = (regex, replacement) => {
    content = content.replace(regex, replacement);
  };

  // The logic: if we see `bg-[#0B1020]`, replace with `bg-white dark:bg-[#0B1020]`
  // BUT we must avoid replacing if it's already `dark:bg-[#0B1020]`.
  replaceClass(/(?<!dark:)bg-\[\#0B1020\]/g, 'bg-white dark:bg-[#0B1020]');
  replaceClass(/(?<!dark:)bg-\[\#0B0F1A\]/g, 'bg-[#F8FAFC] dark:bg-[#0B0F1A]');
  replaceClass(/(?<!dark:)bg-\[\#1A1D29\]/g, 'bg-gray-50 dark:bg-[#1A1D29]');
  replaceClass(/(?<!dark:)bg-\[\#111424\]/g, 'bg-[#F8FAFC] dark:bg-[#111424]');
  replaceClass(/(?<!dark:)bg-\[\#111420\]/g, 'bg-white dark:bg-[#111420]');
  replaceClass(/(?<!dark:)bg-\[\#1E1E2D\]/g, 'bg-white dark:bg-[#1E1E2D]');
  replaceClass(/(?<!dark:)bg-\[\#151521\]/g, 'bg-[#F8FAFC] dark:bg-[#151521]');
  replaceClass(/(?<!dark:)bg-\[\#0B0D17\]/g, 'bg-white dark:bg-[#0B0D17]');
  replaceClass(/(?<!dark:)bg-\[\#2F2A45\]/g, 'bg-white dark:bg-[#2F2A45]');
  
  // Generic backgrounds that need a light mode equivalent
  replaceClass(/(?<!dark:)bg-gray-900\/50/g, 'bg-gray-900/50 dark:bg-gray-900/80');
  replaceClass(/(?<!dark:)bg-gray-900\/60/g, 'bg-gray-900/60 dark:bg-gray-900/80');
  
  // Text colors
  replaceClass(/(?<!dark:)text-\[\#A7ACC8\]/g, 'text-gray-500 dark:text-[#A7ACC8]');
  replaceClass(/(?<!dark:)text-white(?![a-zA-Z0-9_-])/g, 'text-gray-900 dark:text-white');
  replaceClass(/(?<!dark:)text-white\/40/g, 'text-gray-400 dark:text-white/40');
  replaceClass(/(?<!dark:)text-white\/60/g, 'text-gray-500 dark:text-white/60');
  replaceClass(/(?<!dark:)text-white\/80/g, 'text-gray-700 dark:text-white/80');
  
  // Borders
  replaceClass(/(?<!dark:)border-white\/5/g, 'border-gray-200 dark:border-white/5');
  replaceClass(/(?<!dark:)border-white\/10/g, 'border-gray-200 dark:border-white/10');
  replaceClass(/(?<!dark:)border-white\/20/g, 'border-gray-300 dark:border-white/20');
  
  // Misc
  replaceClass(/(?<!dark:)bg-white\/5(?![0-9])/g, 'bg-gray-100 dark:bg-white/5');
  replaceClass(/(?<!dark:)bg-white\/10/g, 'bg-gray-200 dark:bg-white/10');

  // Fix up doubled classes we might have accidentally created like `text-gray-900 dark:text-gray-900 dark:text-white`
  replaceClass(/text-gray-900 dark:text-gray-900 dark:text-white/g, 'text-gray-900 dark:text-white');
  replaceClass(/bg-white dark:bg-white dark:/g, 'bg-white dark:');
  replaceClass(/bg-\[\#F8FAFC\] dark:bg-\[\#F8FAFC\] dark:/g, 'bg-[#F8FAFC] dark:');

  if (content !== original) {
    fs.writeFileSync(file, content);
  }
}
