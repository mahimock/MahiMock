const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

if (!code.includes("import Leaderboard")) {
  code = code.replace(
    "import PerformanceHistory from './pages/PerformanceHistory';",
    "import PerformanceHistory from './pages/PerformanceHistory';\nimport Leaderboard from './pages/Leaderboard';"
  );
}

if (!code.includes('<Route path="leaderboard" element={<Leaderboard />} />')) {
  code = code.replace(
    '<Route path="performance-history" element={<PerformanceHistory />} />',
    '<Route path="performance-history" element={<PerformanceHistory />} />\n            <Route path="leaderboard" element={<Leaderboard />} />'
  );
}

fs.writeFileSync('src/App.tsx', code);
