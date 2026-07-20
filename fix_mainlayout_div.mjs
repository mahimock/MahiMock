import fs from 'fs';

let content = fs.readFileSync('src/layouts/MainLayout.tsx', 'utf8');

content = content.replace(/                <\/button>\n              <\/div>\n            \) : \(/, `                </button>
            ) : (`);

fs.writeFileSync('src/layouts/MainLayout.tsx', content);
