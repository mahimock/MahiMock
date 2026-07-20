import fs from 'fs';

let content = fs.readFileSync('src/components/ProfileSidebar.tsx', 'utf8');

content = content.replace("const { theme, setTheme } = useTheme();", "const { theme, setTheme } = useTheme();\n  const [language, setLanguage] = useState<'English' | 'Hindi'>('English');");

content = content.replace(/\} else if \(to === 'share'\) \{/, `} else if (to === 'lang') {
               setLanguage(language === 'English' ? 'Hindi' : 'English');
               toast.success(\`Language changed to \${language === 'English' ? 'Hindi' : 'English'}\`);
             } else if (to === 'share') {`);

content = content.replace(/<NavItem to="lang" icon=\{Languages\} label="Language" badge="English" \/>/, `{/* Language Toggle */}
              <button 
                onClick={() => {
                  setLanguage(language === 'English' ? 'Hindi' : 'English');
                  toast.success(\`Language changed to \${language === 'English' ? 'Hindi' : 'English'}\`);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-gray-100 dark:hover:bg-white/5 transition-all group relative overflow-hidden"
              >
                <Languages className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-[#5B5FFB] transition-colors" />
                <span className="flex-1 text-left font-bold text-gray-700 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-white">Language</span>
                <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 text-[10px] font-black uppercase tracking-wider">
                  {language}
                </span>
              </button>`);

fs.writeFileSync('src/components/ProfileSidebar.tsx', content);
