import fs from 'fs';

let content = fs.readFileSync('src/components/ProfileSidebar.tsx', 'utf8');

// I will fix the whole function up to `if (!currentUser || !userProfile) return null;`
// and NavItem's isAction.

content = content.replace(/  useEffect\(\(\) => \{[\s\S]*?if \(!currentUser \|\| !userProfile\) return null;/m, `  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  if (!currentUser || !userProfile) return null;`);

content = content.replace(/    if \(isAction\) \{[\s\S]*?\}\s*return \(\s*<Link/m, `    if (isAction) {
      return (
        <button 
          onClick={() => {
             if (to === 'theme') {
               setTheme(theme === 'dark' ? 'light' : 'dark');
             } else if (to === 'contact') {
               window.location.href = 'mailto:support@mahimock.com';
             } else if (to === 'support') {
               toast.success('Help & Support page coming soon!');
             } else {
               toast.success('Coming soon!');
             }
          }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-gray-100 dark:hover:bg-white/5 transition-all group relative overflow-hidden"
        >
          {content}
        </button>
      );
    }

    return (
      <Link`);

fs.writeFileSync('src/components/ProfileSidebar.tsx', content);
