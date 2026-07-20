const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminMockTests.tsx', 'utf-8');

const oldHeader = `<div className="p-4 sm:p-6 border-b border-gray-100 dark:border-[#3A3A4D] flex items-center justify-between shrink-0 bg-white dark:bg-[#1E1E2D] z-20 sticky top-0 rounded-t-2xl gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate">Add Test</h3>
                <p className="hidden sm:block text-sm text-gray-500 dark:text-gray-400 truncate">{selectedTestType} for {selectedExam?.examName}</p>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                <button type="button" onClick={() => setIsModalOpen(false)} className="hidden sm:block px-4 py-2 rounded-xl border border-gray-200 dark:border-[#3A3A4D] text-gray-700 dark:text-white font-bold hover:bg-gray-50 dark:hover:bg-[#2A2A3D] transition-colors text-sm">Cancel</button>
                <button type="button" onClick={handleSaveTest} disabled={saving} className="px-4 sm:px-6 py-2 rounded-xl bg-[#5B5FFB] text-white font-bold flex items-center justify-center gap-2 hover:bg-[#4A4DE0] disabled:opacity-70 transition-colors text-sm whitespace-nowrap shadow-sm">
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />} Save Test
                </button>
                <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-[#2A2A3D] rounded-full transition-colors"><X className="w-5 h-5" /></button>
              </div>
            </div>`;

const newHeader = `<div className="p-4 sm:p-6 border-b border-gray-100 dark:border-[#3A3A4D] flex flex-col sm:flex-row sm:items-center justify-between shrink-0 bg-white dark:bg-[#1E1E2D] z-20 sticky top-0 rounded-t-2xl gap-4">
              <div className="flex items-center justify-between sm:w-auto sm:flex-1 min-w-0">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate">Add Test</h3>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">{selectedTestType} for {selectedExam?.examName} • {testQuestions.length} Qs</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="sm:hidden p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-[#2A2A3D] rounded-full transition-colors"><X className="w-5 h-5" /></button>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 shrink-0 w-full sm:w-auto">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#3A3A4D] text-gray-700 dark:text-white font-bold hover:bg-gray-50 dark:hover:bg-[#2A2A3D] transition-colors text-sm">Cancel</button>
                <button type="button" onClick={handleSaveTest} disabled={saving} className="flex-[2] sm:flex-none px-4 sm:px-6 py-2.5 rounded-xl bg-[#5B5FFB] text-white font-bold flex items-center justify-center gap-2 hover:bg-[#4A4DE0] disabled:opacity-70 transition-colors text-sm whitespace-nowrap shadow-sm">
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />} Save Test
                </button>
                <button onClick={() => setIsModalOpen(false)} className="hidden sm:block p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-[#2A2A3D] rounded-full transition-colors"><X className="w-5 h-5" /></button>
              </div>
            </div>`;

if (code.includes(oldHeader)) {
  code = code.replace(oldHeader, newHeader);
  console.log("Patched modal header for mobile!");
} else {
  console.log("Could not find old modal header. Maybe already changed?");
}

fs.writeFileSync('src/pages/admin/AdminMockTests.tsx', code);
