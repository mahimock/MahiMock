const fs = require('fs');
let code = fs.readFileSync('src/layouts/MainLayout.tsx', 'utf-8');

const lbLink = `
                      <Link to="/leaderboard" onClick={() => setProfileOpen(false)} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-[#F8FAFC] hover:text-[#5B5FFB] transition-colors">
                        <Trophy className="w-4 h-4 mr-3" />
                        Leaderboard
                      </Link>
`;

code = code.replace(
  /<Link to="\/performance-history"[\s\S]*?<\/Link>/,
  "$&" + lbLink
);

if (!code.includes("Trophy")) {
  code = code.replace(
    "import { Activity,",
    "import { Activity, Trophy,"
  );
}

fs.writeFileSync('src/layouts/MainLayout.tsx', code);
