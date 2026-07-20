import fs from 'fs';

let content = fs.readFileSync('src/pages/MyProfile.tsx', 'utf8');

const targetStr = `              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{userProfile?.name || 'User'}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{currentUser.email}</p>
            </div>`;

const newStr = `              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{userProfile?.name || 'User'}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{currentUser.email}</p>
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-[#5B5FFB]/10 border border-[#5B5FFB]/20">
                <span className="text-xs font-black text-[#5B5FFB] uppercase tracking-wider">{userProfile?.role || 'Student'}</span>
              </div>
            </div>`;

content = content.replace(targetStr, newStr);

fs.writeFileSync('src/pages/MyProfile.tsx', content);
