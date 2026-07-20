const fs = require('fs');
let code = fs.readFileSync('src/layouts/MainLayout.tsx', 'utf8');

code = code.replace(
  '<footer className="bg-[#111827] text-white pt-16 pb-8 mt-auto rounded-t-[2.5rem] lg:mx-4 mb-4">',
  '<footer className="hidden lg:block bg-[#111827] text-white pt-16 pb-8 mt-auto rounded-t-[2.5rem] lg:mx-4 mb-4">'
);

fs.writeFileSync('src/layouts/MainLayout.tsx', code);
