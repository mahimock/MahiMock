const fs = require('fs');
let code = fs.readFileSync('src/layouts/MainLayout.tsx', 'utf8');

if (!code.includes('to="/about"')) {
  code = code.replace(
    '<Link to="/leaderboard" onClick={() => setProfileOpen(false)} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-[#F8FAFC] hover:text-[#5B5FFB] transition-colors">\n                        <Trophy className="w-4 h-4 mr-3" />\n                        Leaderboard\n                      </Link>',
    '<Link to="/leaderboard" onClick={() => setProfileOpen(false)} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-[#F8FAFC] hover:text-[#5B5FFB] transition-colors">\n                        <Trophy className="w-4 h-4 mr-3" />\n                        Leaderboard\n                      </Link>\n                      <Link to="/about" onClick={() => setProfileOpen(false)} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-[#F8FAFC] hover:text-[#5B5FFB] transition-colors">\n                        <Info className="w-4 h-4 mr-3" />\n                        About Us\n                      </Link>'
  );
  
  if (!code.includes('Info')) {
    code = code.replace(
      "import { Search, Bell, Menu, X, ChevronRight, User as UserIcon, LogOut, BookOpen, FileQuestion, Activity, Trophy, LayoutDashboard } from 'lucide-react';",
      "import { Search, Bell, Menu, X, ChevronRight, User as UserIcon, LogOut, BookOpen, FileQuestion, Activity, Trophy, LayoutDashboard, Info } from 'lucide-react';"
    );
  }
}

fs.writeFileSync('src/layouts/MainLayout.tsx', code);
