const fs = require('fs');
let code = fs.readFileSync('src/layouts/MainLayout.tsx', 'utf-8');

const perfRegex = /<Link to="\/performance-history"[\s\S]*?<\/Link>/g;
let match;
let matchCount = 0;
while ((match = perfRegex.exec(code)) !== null) {
    matchCount++;
    if (matchCount > 1) {
        // remove the duplicate
        code = code.slice(0, match.index) + code.slice(match.index + match[0].length);
        break; // Assuming only one duplicate
    }
}

fs.writeFileSync('src/layouts/MainLayout.tsx', code);
