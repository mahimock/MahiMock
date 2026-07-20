const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminMockTests.tsx', 'utf-8');

const oldHeader = `<div className="p-6 border-b border-gray-100 dark:border-[#3A3A4D] flex items-center justify-between shrink-0 bg-white dark:bg-[#1E1E2D] z-10 sticky top-0 rounded-t-2xl">
              <div>
                <h3 className="text-xl font-bold text-gray-900  dark:text-white">Add Test & Questions</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{selectedTestType} for {selectedExam?.examName}</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors"><X className="w-5 h-5" /></button>
            </div>`;

const newHeader = `<div className="p-4 sm:p-6 border-b border-gray-100 dark:border-[#3A3A4D] flex items-center justify-between shrink-0 bg-white dark:bg-[#1E1E2D] z-20 sticky top-0 rounded-t-2xl gap-4">
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

if (code.includes(oldHeader)) {
  code = code.replace(oldHeader, newHeader);
  console.log("Replaced modal header!");
} else {
  // Regex match just in case
  const headerRegex = /<div className="p-6 border-b border-gray-100 dark:border-\[#3A3A4D\] flex items-center justify-between shrink-0 bg-white dark:bg-\[#1E1E2D\] z-10 sticky top-0 rounded-t-2xl">[\s\S]*?<\/button>\s*<\/div>/;
  if (headerRegex.test(code)) {
    code = code.replace(headerRegex, newHeader);
    console.log("Replaced modal header via regex!");
  } else {
    console.log("Could not find modal header!");
  }
}

// Now remove the Bottom Actions bar
const oldBottomActions = `{/* Bottom Actions */}
            <div className="p-4 border-t border-gray-100 dark:border-[#3A3A4D] bg-white dark:bg-[#1E1E2D] rounded-b-2xl flex flex-col sm:flex-row justify-between items-center shrink-0 gap-4">
              <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">{testQuestions.length} Questions Ready</span>
              <div className="flex gap-3 w-full sm:w-auto">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl border border-gray-200 dark:border-[#3A3A4D] text-gray-700 dark:text-white font-bold hover:bg-gray-50 dark:bg-[#2A2A3D] transition-colors text-sm">Cancel</button>
                <button type="button" onClick={handleSaveTest} disabled={saving} className="flex-[2] sm:flex-none px-8 py-2.5 rounded-xl bg-[#5B5FFB] text-white font-bold flex items-center justify-center gap-2 hover:bg-[#4A4DE0] disabled:opacity-70 transition-colors text-sm">
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />} Final Save Test
                </button>
              </div>
            </div>`;

if (code.includes(oldBottomActions)) {
  code = code.replace(oldBottomActions, "");
  console.log("Removed bottom actions!");
} else {
  const bottomActionsRegex = /\{\/\* Bottom Actions \*\/\}[\s\S]*?Final Save Test\s*<\/button>\s*<\/div>\s*<\/div>/;
  if (bottomActionsRegex.test(code)) {
    code = code.replace(bottomActionsRegex, "");
    console.log("Removed bottom actions via regex!");
  } else {
    console.log("Could not find bottom actions!");
  }
}

fs.writeFileSync('src/pages/admin/AdminMockTests.tsx', code);
