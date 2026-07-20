const fs = require('fs');
let code = fs.readFileSync('src/layouts/AdminLayout.tsx', 'utf-8');

// Add imports
code = code.replace(
  "import { useAuth } from '../contexts/AuthContext';",
  "import { useAuth } from '../contexts/AuthContext';\nimport { Users, BarChart3, Bell, Settings, Moon, Sun, Layers, HelpCircle } from 'lucide-react';"
);

// Add dark mode state
code = code.replace(
  "const [sidebarOpen, setSidebarOpen] = useState(false);",
  "const [sidebarOpen, setSidebarOpen] = useState(false);\n  const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains('dark'));\n\n  const toggleDarkMode = () => {\n    const root = document.documentElement;\n    if (root.classList.contains('dark')) {\n      root.classList.remove('dark');\n      setDarkMode(false);\n      localStorage.setItem('theme', 'light');\n    } else {\n      root.classList.add('dark');\n      setDarkMode(true);\n      localStorage.setItem('theme', 'dark');\n    }\n  };"
);

// Update nav items
const navItemsReplacement = `
  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Categories', path: '/admin/categories', icon: BookOpen },
    { name: 'Exams', path: '/admin/tests', icon: FileQuestion },
    { name: 'Test Series', path: '/admin/test-series', icon: Layers },
    { name: 'Question Bank', path: '/admin/question-bank', icon: HelpCircle },
    { name: 'Study Materials', path: '/admin/materials', icon: FileText },
    { name: 'Students', path: '/admin/students', icon: Users },
    { name: 'Results', path: '/admin/results', icon: BarChart3 },
    { name: 'Current Affairs', path: '/admin/updates', icon: Globe },
    { name: 'Notifications', path: '/admin/notifications', icon: Bell },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ];
`;

code = code.replace(/const navItems = \[[\s\S]*?\];/, navItemsReplacement);

// Update sidebar background and texts for dark mode
code = code.replace(
  "className=\"flex flex-col h-full bg-white border-r border-gray-100\"",
  "className=\"flex flex-col h-full bg-white dark:bg-[#1E1E2D] border-r border-gray-100 dark:border-gray-800\""
);

code = code.replace(
  "className=\"text-xl font-bold tracking-tight text-gray-900\"",
  "className=\"text-xl font-bold tracking-tight text-gray-900 dark:text-white\""
);

// Update NavLink colors
code = code.replace(
  "bg-blue-50 text-[#5B5FFB]'\n                   : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'",
  "bg-blue-50 dark:bg-[#5B5FFB]/10 text-[#5B5FFB] dark:text-[#5B5FFB]'\n                   : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white'"
);

// Add Dark Mode Toggle below Logout
code = code.replace(
  "Logout\n        </button>\n      </div>",
  "Logout\n        </button>\n        <button onClick={toggleDarkMode} className=\"mt-2 flex items-center justify-between px-4 py-3 w-full rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all\">\n          <div className=\"flex items-center gap-3\">\n            {darkMode ? <Sun className=\"w-5 h-5\" /> : <Moon className=\"w-5 h-5\" />}\n            {darkMode ? 'Light Mode' : 'Dark Mode'}\n          </div>\n        </button>\n      </div>"
);

// Update Main Layout container
code = code.replace(
  "className=\"min-h-screen bg-[#F8FAFC]\"",
  "className=\"min-h-screen bg-[#F8FAFC] dark:bg-[#151521]\""
);

// Update Header
code = code.replace(
  "className=\"bg-white border-b border-gray-100 sticky top-0 z-30\"",
  "className=\"bg-white dark:bg-[#1E1E2D] border-b border-gray-100 dark:border-gray-800 sticky top-0 z-30\""
);

code = code.replace(
  "className=\"lg:hidden p-2 text-gray-600 hover:bg-gray-50 rounded-lg\"",
  "className=\"lg:hidden p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg\""
);

code = code.replace(
  "className=\"flex-1 lg:hidden text-center font-semibold text-gray-900\"",
  "className=\"flex-1 lg:hidden text-center font-semibold text-gray-900 dark:text-white\""
);

fs.writeFileSync('src/layouts/AdminLayout.tsx', code);
