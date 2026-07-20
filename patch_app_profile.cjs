const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  "import Exams from './pages/Exams';",
  "import Exams from './pages/Exams';\nimport MyProfile from './pages/MyProfile';"
);

code = code.replace(
  /<Route path="leaderboard" element=\{<Leaderboard \/>\} \/>/,
  "<Route path=\"leaderboard\" element={<Leaderboard />} />\n            <Route path=\"profile\" element={<MyProfile />} />"
);

fs.writeFileSync('src/App.tsx', code);
