import fs from 'fs';

let content = fs.readFileSync('src/components/ProfileSidebar.tsx', 'utf8');

content = content.replace(/\} else \{[\s\S]*?toast\.success\('Coming soon!'\);[\s\S]*?\}/, `} else if (to === 'contact') {
               window.location.href = 'mailto:support@mahimock.com';
             } else if (to === 'support') {
               toast.success('Help & Support page coming soon!');
             } else {
               toast.success('Coming soon!');
             }`);

fs.writeFileSync('src/components/ProfileSidebar.tsx', content);
