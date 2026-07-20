const fs = require('fs');
let content = fs.readFileSync('src/pages/Home.tsx', 'utf8');

// The main wrapper
content = content.replace(/className="bg-\[\#0B0F1A\] min-h-screen text-white/g, 'className="bg-white dark:bg-[#0B1020] min-h-screen text-gray-900 dark:text-white');

// Backgrounds
content = content.replace(/bg-\[\#0B0F1A\]/g, 'bg-white dark:bg-[#0B1020]');
content = content.replace(/bg-\[\#111424\]/g, 'bg-[#F8FAFC] dark:bg-[#111424]');
content = content.replace(/bg-white\/5/g, 'bg-gray-100 dark:bg-white/5');
content = content.replace(/bg-white\/10/g, 'bg-gray-200 dark:bg-white/10');
content = content.replace(/bg-black\/50/g, 'bg-white/50 dark:bg-black/50');
content = content.replace(/bg-black\/80/g, 'bg-white/80 dark:bg-black/80');
content = content.replace(/bg-blue-500\/10/g, 'bg-blue-50 dark:bg-blue-500/10');
content = content.replace(/bg-blue-500\/20/g, 'bg-blue-100 dark:bg-blue-500/20');
content = content.replace(/bg-\[\#7C5CFF\]\/10/g, 'bg-[#7C5CFF]/5 dark:bg-[#7C5CFF]/10');
content = content.replace(/bg-\[\#7C5CFF\]\/20/g, 'bg-[#7C5CFF]/10 dark:bg-[#7C5CFF]/20');


// Text
content = content.replace(/text-white\/40/g, 'text-gray-400 dark:text-white/40');
content = content.replace(/text-white\/60/g, 'text-gray-500 dark:text-white/60');
content = content.replace(/text-white\/80/g, 'text-gray-700 dark:text-white/80');
content = content.replace(/text-white/g, 'text-gray-900 dark:text-white');
content = content.replace(/text-\[\#A7ACC8\]/g, 'text-gray-500 dark:text-[#A7ACC8]');
// We have to fix places where we double-replaced text-gray-900 dark:text-gray-900 dark:text-white
content = content.replace(/text-gray-900 dark:text-gray-900 dark:text-white/g, 'text-gray-900 dark:text-white');

// Borders
content = content.replace(/border-white\/5/g, 'border-gray-200 dark:border-white/5');
content = content.replace(/border-white\/10/g, 'border-gray-200 dark:border-white/10');
content = content.replace(/border-white\/20/g, 'border-gray-300 dark:border-white/20');

// specifically for "text-gray-900 dark:text-white" inside strings where text-white was already replaced
content = content.replace(/text-gray-900 dark:text-white\/40/g, 'text-gray-400 dark:text-white/40');
content = content.replace(/text-gray-900 dark:text-white\/60/g, 'text-gray-500 dark:text-white/60');
content = content.replace(/text-gray-900 dark:text-white\/80/g, 'text-gray-700 dark:text-white/80');


fs.writeFileSync('src/pages/Home.tsx', content);

let mainLayout = fs.readFileSync('src/layouts/MainLayout.tsx', 'utf8');

// For MainLayout
mainLayout = mainLayout.replace(/bg-\[\#0F111A\]/g, 'bg-white dark:bg-[#0B1020]');
mainLayout = mainLayout.replace(/text-white/g, 'text-gray-900 dark:text-white');
mainLayout = mainLayout.replace(/text-gray-900 dark:text-white\/40/g, 'text-gray-400 dark:text-white/40');
mainLayout = mainLayout.replace(/text-gray-900 dark:text-white\/60/g, 'text-gray-500 dark:text-white/60');
mainLayout = mainLayout.replace(/text-gray-900 dark:text-white\/80/g, 'text-gray-700 dark:text-white/80');
mainLayout = mainLayout.replace(/bg-white\/5/g, 'bg-gray-100 dark:bg-white/5');
mainLayout = mainLayout.replace(/border-white\/5/g, 'border-gray-100 dark:border-white/5');
mainLayout = mainLayout.replace(/border-white\/10/g, 'border-gray-200 dark:border-white/10');
mainLayout = mainLayout.replace(/bg-\[\#1A1A2E\]/g, 'bg-gray-100 dark:bg-[#1A1A2E]');
mainLayout = mainLayout.replace(/text-gray-900 dark:text-gray-900 dark:text-white/g, 'text-gray-900 dark:text-white');

// For MainLayout bg-white/80, there might be conflicts
fs.writeFileSync('src/layouts/MainLayout.tsx', mainLayout);
