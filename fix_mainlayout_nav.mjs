import fs from 'fs';

let content = fs.readFileSync('src/layouts/MainLayout.tsx', 'utf8');

content = content.replace(/location\.pathname === '\d+'/g, (match) => {
  if (content.indexOf("LayoutDashboard className") > content.indexOf(match)) return "location.pathname === '/'";
});

// Since the above is tricky, I'll just hard replace
content = content.replace(/location\.pathname === '11320'/g, "location.pathname === '/'");
content = content.replace(/location\.pathname === '11777'/g, "location.pathname === '/test-series'");
content = content.replace(/location\.pathname === '12258'/g, "location.pathname === '/study-materials'");
content = content.replace(/location\.pathname === '12735'/g, "location.pathname === '/profile'");

fs.writeFileSync('src/layouts/MainLayout.tsx', content);
