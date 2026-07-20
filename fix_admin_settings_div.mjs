import fs from 'fs';

let content = fs.readFileSync('src/pages/admin/AdminSettings.tsx', 'utf8');

// The issue is likely that `</div></div><div><label>Features...` causes the `Features` div to be a sibling of `space-y-6` but inside the `bg-white` container it's fine? Wait, no, if it's inside `bg-white` container, there's `h2` and `div`s.

// Let's just fix it automatically using a regex to restore the original correct structure and add Features properly.
content = content.replace(/            <\/div>\n                      <\/div>\n          <\/div>\n          \n          <div>\n            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Features \(one per line\)<\/label>/, `            </div>
          </div>
          
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Features (one per line)</label>`);

fs.writeFileSync('src/pages/admin/AdminSettings.tsx', content);
