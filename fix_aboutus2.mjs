import fs from 'fs';

let content = fs.readFileSync('src/pages/AboutUs.tsx', 'utf8');

// remove the hardcoded features grid
const oldFeaturesRegex = /<div className="bg-white dark:bg-\[\#1E1E2D\] rounded-\[2\.5rem\] p-8 md:p-12 shadow-sm border border-gray-100 dark:border-white\/5">[\s\S]*?<\/div>\s*<\/div>\s*\{\/\* Features Map replacement \*\/\}/;
content = content.replace(oldFeaturesRegex, "");

fs.writeFileSync('src/pages/AboutUs.tsx', content);
