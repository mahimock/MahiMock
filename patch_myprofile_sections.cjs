const fs = require('fs');
let code = fs.readFileSync('src/pages/MyProfile.tsx', 'utf8');

const additionalSections = `
            {/* Achievements */}
            <div className="bg-white dark:bg-[#1E1E2D] rounded-[2rem] p-6 shadow-sm border border-gray-100 dark:border-white/5">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Achievements</h3>
              <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-hide">
                <div className="flex-shrink-0 w-24 h-24 rounded-2xl bg-gradient-to-br from-amber-100 to-amber-50 dark:from-amber-900/40 dark:to-amber-900/10 flex flex-col items-center justify-center border border-amber-200 dark:border-amber-700/50">
                  <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center mb-2">
                    <Trophy className="w-5 h-5 text-amber-600 dark:text-amber-500" />
                  </div>
                  <span className="text-xs font-bold text-amber-800 dark:text-amber-400">Top 1%</span>
                </div>
                <div className="flex-shrink-0 w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/40 dark:to-blue-900/10 flex flex-col items-center justify-center border border-blue-200 dark:border-blue-700/50">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center mb-2">
                    <Award className="w-5 h-5 text-blue-600 dark:text-blue-500" />
                  </div>
                  <span className="text-xs font-bold text-blue-800 dark:text-blue-400">Scholar</span>
                </div>
                <div className="flex-shrink-0 w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-900/40 dark:to-purple-900/10 flex flex-col items-center justify-center border border-purple-200 dark:border-purple-700/50">
                  <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center mb-2">
                    <Activity className="w-5 h-5 text-purple-600 dark:text-purple-500" />
                  </div>
                  <span className="text-xs font-bold text-purple-800 dark:text-purple-400">7 Day Streak</span>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white dark:bg-[#1E1E2D] rounded-[2rem] p-6 shadow-sm border border-gray-100 dark:border-white/5">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {[
                  { title: "UPSC Prelims Mock Test 4", date: "Today, 10:30 AM", score: "112/200", color: "blue" },
                  { title: "Current Affairs Quiz - July", date: "Yesterday", score: "45/50", color: "emerald" },
                  { title: "SSC CGL Tier 1 Practice", date: "2 days ago", score: "165/200", color: "purple" }
                ].map((activity, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-[#2A2A3D] transition-colors border border-transparent hover:border-gray-100 dark:hover:border-white/5 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className={\`w-10 h-10 rounded-full bg-\${activity.color}-50 dark:bg-\${activity.color}-500/10 flex items-center justify-center\`}>
                        <FileQuestion className={\`w-5 h-5 text-\${activity.color}-500\`} />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white text-sm">{activity.title}</p>
                        <p className="text-xs text-gray-500">{activity.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900 dark:text-white text-sm">{activity.score}</p>
                      <p className="text-xs text-gray-500">Score</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>`;

code = code.replace(
  "</div>\n\n          {/* Right Column: Details & Settings */}",
  additionalSections + "\n\n          {/* Right Column: Details & Settings */}"
);

code = code.replace(
  "import { Camera, Loader2, User as UserIcon, Mail, Phone, Calendar, MapPin, Target, Trophy, Activity, Award, Settings, LogOut, ChevronRight, Moon, Bell, Globe, Shield, HelpCircle, Heart, Lock } from 'lucide-react';",
  "import { Camera, Loader2, User as UserIcon, Mail, Phone, Calendar, MapPin, Target, Trophy, Activity, Award, Settings, LogOut, ChevronRight, Moon, Bell, Globe, Shield, HelpCircle, Heart, Lock, FileQuestion, Trash2 } from 'lucide-react';"
);

fs.writeFileSync('src/pages/MyProfile.tsx', code);
