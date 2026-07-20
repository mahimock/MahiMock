import fs from 'fs';

let content = fs.readFileSync('src/layouts/MainLayout.tsx', 'utf8');

content = content.replace("import AboutMahiMockFooter from '../components/AboutMahiMockFooter';", "import AboutMahiMockFooter from '../components/AboutMahiMockFooter';\nimport ProfileSidebar from '../components/ProfileSidebar';");

const dropdownRegex = /<div className="relative" ref=\{dropdownRef\}>[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/header>/;

content = content.replace(dropdownRegex, `<button 
                  onClick={() => setProfileOpen(true)}
                  className="flex items-center gap-2 p-1.5 pr-4 rounded-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:border-[#7C5CFF]/30 transition-all group"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7C5CFF] to-[#5B5FFB] p-[2px]">
                    <div className="w-full h-full rounded-full bg-white dark:bg-[#1E1E2D] flex items-center justify-center overflow-hidden">
                      <span className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-[#7C5CFF] to-[#5B5FFB]">
                        {userProfile?.name?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-gray-700 dark:text-gray-200 hidden sm:block group-hover:text-[#7C5CFF] transition-colors">
                    Profile
                  </span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="hidden sm:flex items-center justify-center px-6 py-2.5 rounded-full text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5 transition-all">
                  Log in
                </Link>
                <Link to="/login" className="flex items-center gap-2 bg-[#7C5CFF] text-white px-7 py-2.5 rounded-full text-sm font-bold hover:bg-[#6D4AFF] transition-all shadow-lg shadow-[#7C5CFF]/20 active:scale-95">
                  <UserIcon className="w-4 h-4" />
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>
      
      <ProfileSidebar isOpen={profileOpen} onClose={() => setProfileOpen(false)} />`);

fs.writeFileSync('src/layouts/MainLayout.tsx', content);
