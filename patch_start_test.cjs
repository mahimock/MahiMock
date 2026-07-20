const fs = require('fs');
let code = fs.readFileSync('src/pages/ExamDetail.tsx', 'utf-8');

code = code.replace(
  `              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                {isAdmin ? (`,
  `              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                {!isAdmin && test.status !== 'Draft' && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); navigate('/test-instructions/' + test.id); }}
                    className="px-6 py-2.5 bg-[#5B5FFB] text-white font-bold rounded-xl hover:bg-[#4A4DE0] transition-colors shadow-sm ml-auto sm:ml-0"
                  >
                    Start Test
                  </button>
                )}
                {isAdmin ? (`
);

fs.writeFileSync('src/pages/ExamDetail.tsx', code);
