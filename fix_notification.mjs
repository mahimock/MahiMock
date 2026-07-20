import fs from 'fs';

let content = fs.readFileSync('src/components/NotificationCenter.tsx', 'utf8');

content = content.replace(/bg-white/g, 'bg-white dark:bg-[#1E1E2D]');
content = content.replace(/border-gray-100/g, 'border-gray-100 dark:border-white/5');
content = content.replace(/bg-gray-50\/50/g, 'bg-gray-50/50 dark:bg-white/5');
content = content.replace(/bg-gray-50/g, 'bg-gray-50 dark:bg-white/5');
content = content.replace(/text-gray-500/g, 'text-gray-500 dark:text-gray-400');
content = content.replace(/text-gray-800/g, 'text-gray-800 dark:text-white');
content = content.replace(/hover:bg-gray-50/g, 'hover:bg-gray-50 dark:hover:bg-white/5');
content = content.replace(/hover:bg-gray-100/g, 'hover:bg-gray-100 dark:hover:bg-white/10');
content = content.replace(/bg-\[\#F8FAFC\]/g, 'bg-[#F8FAFC] dark:bg-white/5');
content = content.replace(/bg-blue-50\/30/g, 'bg-blue-50/30 dark:bg-blue-500/10');
content = content.replace(/border-blue-100/g, 'border-blue-100 dark:border-blue-500/20');
content = content.replace(/text-gray-900/g, 'text-gray-900 dark:text-white');

fs.writeFileSync('src/components/NotificationCenter.tsx', content);
