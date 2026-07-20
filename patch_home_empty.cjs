const fs = require('fs');
let code = fs.readFileSync('src/pages/Home.tsx', 'utf8');

code = code.replace(
  '<h3 className="font-bold text-gray-900 text-xl mb-3">Mock Tests Coming Soon</h3>',
  '<h3 className="font-bold text-gray-900 text-xl mb-3">No Mock Tests Available</h3>'
);

code = code.replace(
  '<p className="text-gray-500 max-w-lg mx-auto mb-8 text-base">We are preparing high-quality, exam-oriented mock tests to boost your preparation. Check back soon for the latest test series.</p>',
  '<p className="text-gray-500 max-w-lg mx-auto mb-8 text-base">We are currently updating our database with high-quality, exam-oriented mock tests. Please check back later.</p>'
);

fs.writeFileSync('src/pages/Home.tsx', code);
