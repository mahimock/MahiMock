import fs from 'fs';

let content = fs.readFileSync('src/layouts/MainLayout.tsx', 'utf8');

content = content.replace(/\$\{undefined \? /g, '${location.pathname === \'/\' ? '); // wait, they all say undefined?
// I can just replace them explicitly based on the text below them!

content = content.replace(/className=\{\`flex flex-col items-center justify-center w-full h-full transition-all \$\{undefined \? 'text-\[\#7C5CFF\]' : 'text-gray-400 dark:text-white\/40'\}\`\}\>\n            <LayoutDashboard/g, 'className={`flex flex-col items-center justify-center w-full h-full transition-all ${location.pathname === \'/\' ? \'text-[#7C5CFF]\' : \'text-gray-400 dark:text-white/40\'}`}>\n            <LayoutDashboard');

content = content.replace(/className=\{\`flex flex-col items-center justify-center w-full h-full transition-all \$\{undefined \? 'text-\[\#7C5CFF\]' : 'text-gray-400 dark:text-white\/40'\}\`\}\>\n            <FileQuestion/g, 'className={`flex flex-col items-center justify-center w-full h-full transition-all ${location.pathname === \'/test-series\' ? \'text-[#7C5CFF]\' : \'text-gray-400 dark:text-white/40\'}`}>\n            <FileQuestion');

content = content.replace(/className=\{\`flex flex-col items-center justify-center w-full h-full transition-all \$\{undefined \? 'text-\[\#7C5CFF\]' : 'text-gray-400 dark:text-white\/40'\}\`\}\>\n            <BookOpen/g, 'className={`flex flex-col items-center justify-center w-full h-full transition-all ${location.pathname === \'/study-materials\' ? \'text-[#7C5CFF]\' : \'text-gray-400 dark:text-white/40\'}`}>\n            <BookOpen');

content = content.replace(/className=\{\`flex flex-col items-center justify-center w-full h-full transition-all \$\{undefined \? 'text-\[\#7C5CFF\]' : 'text-gray-400 dark:text-white\/40'\}\`\}\>\n            <UserIcon/g, 'className={`flex flex-col items-center justify-center w-full h-full transition-all ${location.pathname === \'/profile\' ? \'text-[#7C5CFF]\' : \'text-gray-400 dark:text-white/40\'}`}>\n            <UserIcon');


fs.writeFileSync('src/layouts/MainLayout.tsx', content);
