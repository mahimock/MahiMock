import fs from 'fs';

let content = fs.readFileSync('src/layouts/MainLayout.tsx', 'utf8');

const targetStr = `<div className="w-full h-full rounded-full bg-white dark:bg-[#1E1E2D] flex items-center justify-center overflow-hidden">
                      <span className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-[#7C5CFF] to-[#5B5FFB]">
                        {userProfile?.name?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>`;

const newStr = `<div className="w-full h-full rounded-full bg-white dark:bg-[#1E1E2D] flex items-center justify-center overflow-hidden">
                      {userProfile?.photoURL ? (
                        <img src={userProfile.photoURL} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-[#7C5CFF] to-[#5B5FFB]">
                          {userProfile?.name?.charAt(0).toUpperCase() || 'U'}
                        </span>
                      )}
                    </div>`;

content = content.replace(targetStr, newStr);

fs.writeFileSync('src/layouts/MainLayout.tsx', content);
