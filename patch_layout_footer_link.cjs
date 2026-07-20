const fs = require('fs');
let code = fs.readFileSync('src/layouts/MainLayout.tsx', 'utf8');

code = code.replace(
  '<li><a href="#" className="text-sm text-gray-400 hover:text-[#5B5FFB] transition-colors">About Us</a></li>',
  '<li><Link to="/about" className="text-sm text-gray-400 hover:text-[#5B5FFB] transition-colors">About Us</Link></li>'
);

fs.writeFileSync('src/layouts/MainLayout.tsx', code);
