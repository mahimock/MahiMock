const fs = require('fs');
let code = fs.readFileSync('src/layouts/MainLayout.tsx', 'utf8');

const bottomNav = `
      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 pb-safe shadow-lg">
        <div className="flex items-center justify-around h-16 px-2">
          <Link to="/" className="flex flex-col items-center justify-center w-full h-full text-gray-500 hover:text-[#5B5FFB] transition-colors">
            <LayoutDashboard className="w-5 h-5 mb-1" />
            <span className="text-[10px] font-medium">Home</span>
          </Link>
          <Link to="/test-series" className="flex flex-col items-center justify-center w-full h-full text-gray-500 hover:text-[#5B5FFB] transition-colors">
            <FileQuestion className="w-5 h-5 mb-1" />
            <span className="text-[10px] font-medium">Tests</span>
          </Link>
          <Link to="/study-materials" className="flex flex-col items-center justify-center w-full h-full text-gray-500 hover:text-[#5B5FFB] transition-colors">
            <BookOpen className="w-5 h-5 mb-1" />
            <span className="text-[10px] font-medium">Study</span>
          </Link>
          <Link to="/leaderboard" className="flex flex-col items-center justify-center w-full h-full text-gray-500 hover:text-[#5B5FFB] transition-colors">
            <Trophy className="w-5 h-5 mb-1" />
            <span className="text-[10px] font-medium">Rank</span>
          </Link>
          <Link to="/profile" className="flex flex-col items-center justify-center w-full h-full text-gray-500 hover:text-[#5B5FFB] transition-colors">
            <UserIcon className="w-5 h-5 mb-1" />
            <span className="text-[10px] font-medium">Profile</span>
          </Link>
        </div>
      </div>
`;

code = code.replace('</main>', `</main>\n${bottomNav}`);

// Add pb-20 to main to give space for bottom nav on mobile
code = code.replace('<main>', '<main className="pb-16 lg:pb-0">');

fs.writeFileSync('src/layouts/MainLayout.tsx', code);
