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

const files = walkSync('src');

for (const file of files) {
  if (!file.endsWith('.tsx') && !file.endsWith('.ts')) continue;
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Change hover:text-gray-900 dark:text-white to hover:text-gray-900 dark:hover:text-white
  content = content.replace(/hover:text-gray-900 dark:text-white(?![a-zA-Z0-9\/_-])/g, 'hover:text-gray-900 dark:hover:text-white');

  if (content !== original) {
    fs.writeFileSync(file, content);
  }
}
