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

  // Since we replaced `text-white` with `text-gray-900 dark:text-white` everywhere,
  // we messed up buttons that have colored backgrounds.
  // We want to change `bg-[#5B5FFB] text-gray-900 dark:text-white` back to `bg-[#5B5FFB] text-white`
  
  content = content.replace(/bg-\[\#5B5FFB\](.*?)text-gray-900 dark:text-white/g, 'bg-[#5B5FFB]$1text-white');
  content = content.replace(/bg-\[\#7C5CFF\](.*?)text-gray-900 dark:text-white/g, 'bg-[#7C5CFF]$1text-white');
  
  // Actually, wait, sometimes the text class comes BEFORE the bg class.
  // Better approach: Any line containing `bg-[#5B5FFB]` or `bg-[#7C5CFF]` and `text-gray-900 dark:text-white`
  // We replace the text part. But that might be too broad if there are multiple elements on the same line.

  // Let's just do standard replacement for the common ones we saw
  content = content.replace(/bg-\[\#5B5FFB\] text-gray-900 dark:text-white/g, 'bg-[#5B5FFB] text-white');
  content = content.replace(/bg-\[\#7C5CFF\] text-gray-900 dark:text-white/g, 'bg-[#7C5CFF] text-white');
  content = content.replace(/text-gray-900 dark:text-white bg-\[\#5B5FFB\]/g, 'text-white bg-[#5B5FFB]');
  content = content.replace(/text-gray-900 dark:text-white bg-\[\#7C5CFF\]/g, 'text-white bg-[#7C5CFF]');

  if (content !== original) {
    fs.writeFileSync(file, content);
  }
}
