const fs = require('fs');
let code = fs.readFileSync('src/layouts/MainLayout.tsx', 'utf-8');

code = code.replace(
  "import { Search, Bell, Facebook, Instagram, Youtube, Send, User as UserIcon, BookOpen, FileQuestion, LogOut, LayoutDashboard } from 'lucide-react';",
  "import { Search, Bell, Facebook, Instagram, Youtube, Send, User as UserIcon, BookOpen, FileQuestion, LogOut, LayoutDashboard, Activity, Trophy } from 'lucide-react';"
);

fs.writeFileSync('src/layouts/MainLayout.tsx', code);
