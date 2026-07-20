import fs from 'fs';

let content = fs.readFileSync('src/layouts/MainLayout.tsx', 'utf8');

content = content.replace(/            \}\)\n          <\/div>\n        <\/div>\n      <\/header>/, `            )}
            </div>
          </div>
        </div>
      </header>`);

fs.writeFileSync('src/layouts/MainLayout.tsx', content);
