import fs from 'fs';

let content = fs.readFileSync('src/layouts/MainLayout.tsx', 'utf8');

content = content.replace(/className=\{\`min-h-screen \$\{isHome \? '[^']+' : '[^']+'\} (.*?)\`\}/g, 'className="min-h-screen bg-white dark:bg-[#0B1020] text-gray-900 dark:text-white $1"');
content = content.replace(/className=\{\`sticky top-0 z-50 transition-all duration-300 \$\{isHome \? '[^']+' : '[^']+'\} backdrop-blur-xl border-b shadow-sm\`\}/g, 'className="sticky top-0 z-50 transition-all duration-300 bg-white/80 dark:bg-[#0B1020]/80 border-gray-100 dark:border-white/5 backdrop-blur-xl border-b shadow-sm"');
content = content.replace(/className=\{\`text-\[18px\] font-bold \$\{isHome \? '[^']+' : '[^']+'\}\`\}/g, 'className="text-[18px] font-bold text-gray-900 dark:text-white"');

// Links
content = content.replace(/className=\{\`text-sm font-bold tracking-tight transition-colors \$\{isHome \? '[^']+' : '[^']+'\}\`\}/g, 'className="text-sm font-bold tracking-tight transition-colors text-gray-600 dark:text-white/60 hover:text-[#7C5CFF]"');
content = content.replace(/className=\{\`\$\{isHome \? '[^']+' : '[^']+'\} hover:text-\[\#7C5CFF\] transition-colors lg:hidden\`\}/g, 'className="text-gray-500 dark:text-white/60 hover:text-[#7C5CFF] transition-colors lg:hidden"');
content = content.replace(/className=\{\`\$\{isHome \? '[^']+' : ''\}\`\}/g, 'className="bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-white/20"');

// Dropdown
content = content.replace(/className=\{\`absolute right-0 mt-4 w-64 \$\{isHome \? '[^']+' : '[^']+'\} rounded-3xl shadow-2xl py-3 border z-50 transform origin-top-right transition-all\`\}/g, 'className="absolute right-0 mt-4 w-64 bg-white dark:bg-[#1E1E2D] border-gray-100 dark:border-gray-800 rounded-3xl shadow-2xl py-3 border z-50 transform origin-top-right transition-all"');
content = content.replace(/className=\{\`px-5 py-4 border-b \$\{isHome \? '[^']+' : '[^']+'\} mb-2\`\}/g, 'className="px-5 py-4 border-b border-gray-100 dark:border-white/5 mb-2"');
content = content.replace(/className=\{\`text-sm font-bold \$\{isHome \? '[^']+' : '[^']+'\} truncate\`\}/g, 'className="text-sm font-bold text-gray-900 dark:text-white truncate"');
content = content.replace(/className=\{\`text-xs \$\{isHome \? '[^']+' : '[^']+'\} truncate mt-0\.5\`\}/g, 'className="text-xs text-gray-500 dark:text-white/40 truncate mt-0.5"');

// Dropdown links
content = content.replace(/className=\{\`flex items-center px-4 py-2\.5 text-sm rounded-xl transition-all \$\{isHome \? '[^']+' : '[^']+'\}\`\}/g, 'className="flex items-center px-4 py-2.5 text-sm rounded-xl transition-all text-gray-700 dark:text-white/60 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-[#7C5CFF]"');
content = content.replace(/className=\{\`mt-2 pt-2 border-t \$\{isHome \? '[^']+' : '[^']+'\} px-2\`\}/g, 'className="mt-2 pt-2 border-t border-gray-100 dark:border-white/5 px-2"');

// Mobile bottom nav
content = content.replace(/className=\{\`lg:hidden fixed bottom-0 left-0 right-0 \$\{isHome \? '[^']+' : '[^']+'\} backdrop-blur-xl border-t z-50 pb-safe shadow-\[0_-10px_40px_rgba\(0,0,0,0\.1\)\]\`\}/g, 'className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-[#0B1020]/90 border-gray-100 dark:border-white/5 backdrop-blur-xl border-t z-50 pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.1)]"');
content = content.replace(/className=\{\`flex flex-col items-center justify-center w-full h-full transition-all \$\{location\.pathname === '[^']+' \? '[^']+' : isHome \? '[^']+' : '[^']+'\}\`\}/g, (match, path, color1, color2, color3) => {
  return `className={\`flex flex-col items-center justify-center w-full h-full transition-all \${location.pathname === '${path}' ? 'text-[#7C5CFF]' : 'text-gray-400 dark:text-white/40'}\`}`;
});

fs.writeFileSync('src/layouts/MainLayout.tsx', content);
