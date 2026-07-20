const fs = require('fs');
let code = fs.readFileSync('src/pages/ExamDetail.tsx', 'utf-8');

const target = `        {isAdmin && (
          <>
            <button 
              onClick={() => handleOpenTestModal()} 
              className="hidden sm:flex items-center justify-center gap-2 bg-[#5B5FFB] text-white px-5 py-2.5 rounded-full shadow-lg hover:bg-[#4A4DE0] hover:scale-105 transition-all text-sm font-semibold shrink-0"
            >
              <Plus className="w-5 h-5" /> {view === 'full-mocks' ? 'Add Full Mock Test' : 'Add Test'}
            </button>
            <button 
              onClick={() => handleOpenTestModal()} 
              className="sm:hidden fixed bottom-24 right-6 z-[100] flex items-center justify-center gap-2 bg-[#5B5FFB] text-white px-5 py-3.5 rounded-full shadow-2xl hover:bg-[#4A4DE0] transition-all text-sm font-bold border-2 border-white"
            >
              <Plus className="w-5 h-5" /> {view === 'full-mocks' ? 'Add Full Mock Test' : 'Add Test'}
            </button>
          </>
        )}`;

const replacement = `        {isAdmin && (
          <button 
            onClick={() => handleOpenTestModal()} 
            className="flex items-center justify-center gap-1.5 sm:gap-2 bg-[#5B5FFB] text-white px-3 py-2 sm:px-5 sm:py-2.5 rounded-full shadow-lg hover:bg-[#4A4DE0] hover:scale-105 transition-all text-xs sm:text-sm font-semibold shrink-0"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" /> {view === 'full-mocks' ? 'Add Full Mock' : 'Add Test'}
          </button>
        )}`;

if (code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync('src/pages/ExamDetail.tsx', code);
  console.log("Successfully patched sticky header button!");
} else {
  console.log("Target not found.");
}
