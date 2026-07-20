const fs = require('fs');
let code = fs.readFileSync('src/layouts/MainLayout.tsx', 'utf-8');

const perfLink = `
                      <Link to="/performance-history" onClick={() => setProfileOpen(false)} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-[#F8FAFC] hover:text-[#5B5FFB] transition-colors">
                        <Activity className="w-4 h-4 mr-3" />
                        Performance History
                      </Link>
`;

code = code.replace(
  /<Link to="\/my-tests"[\s\S]*?<\/Link>/,
  "$&" + perfLink
);

if (!code.includes("Activity")) {
  code = code.replace(
    "import { BookOpen, Search, Menu, X, ChevronDown, User as UserIcon, LayoutDashboard, LogOut, FileQuestion, Facebook, Instagram, Youtube, Send } from 'lucide-react';",
    "import { Activity, BookOpen, Search, Menu, X, ChevronDown, User as UserIcon, LayoutDashboard, LogOut, FileQuestion, Facebook, Instagram, Youtube, Send } from 'lucide-react';"
  );
}

fs.writeFileSync('src/layouts/MainLayout.tsx', code);
