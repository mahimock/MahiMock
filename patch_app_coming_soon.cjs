const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  '<Route path="study-materials" element={<div className="flex items-center justify-center h-[50vh] text-gray-500 font-medium text-lg">Study Materials - Coming Soon</div>} />',
  '<Route path="study-materials" element={<div className="flex flex-col items-center justify-center h-[50vh] text-center px-4"><h2 className="text-2xl font-bold text-gray-900 mb-2">Study Materials</h2><p className="text-gray-500">Currently organizing our study resources. Please check back later.</p></div>} />'
);

code = code.replace(
  '<Route path="updates" element={<div className="flex items-center justify-center h-[50vh] text-gray-500 font-medium text-lg">Latest Updates - Coming Soon</div>} />',
  '<Route path="updates" element={<div className="flex flex-col items-center justify-center h-[50vh] text-center px-4"><h2 className="text-2xl font-bold text-gray-900 mb-2">Latest Updates</h2><p className="text-gray-500">No updates available at the moment. Please check back later.</p></div>} />'
);

fs.writeFileSync('src/App.tsx', code);
