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

const files = walkSync('src/pages/admin');

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  content = content.replace(/(?<!dark:)hover:bg-gray-100(?![a-zA-Z0-9_-])/g, 'hover:bg-gray-100 dark:hover:bg-gray-800');
  content = content.replace(/(?<!dark:)bg-gray-100(?![a-zA-Z0-9_-])/g, 'bg-gray-100 dark:bg-gray-800');

  // Fix up doubled classes we might have accidentally created like `bg-gray-100 dark:bg-gray-800 dark:bg-white/5`
  content = content.replace(/bg-gray-100 dark:bg-gray-800 dark:/g, 'bg-gray-100 dark:');
  content = content.replace(/hover:bg-gray-100 dark:hover:bg-gray-800 dark:/g, 'hover:bg-gray-100 dark:');

  if (content !== original) {
    fs.writeFileSync(file, content);
  }
}
