import fs from 'fs';

let content = fs.readFileSync('src/layouts/MainLayout.tsx', 'utf8');

// just find `      </header>` and replace it with `        </div>\n      </header>`
content = content.replace("      </header>", "        </div>\n      </header>");

fs.writeFileSync('src/layouts/MainLayout.tsx', content);
