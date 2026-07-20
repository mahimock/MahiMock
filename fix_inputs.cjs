const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminMockTests.tsx', 'utf-8');

// Ensure button says Add Full Mock Test if it's that view, or just Add Full Mock Test permanently.
// The user says "Make the 'Add Full Mock Test' button permanently visible above the Full Mock Tests section."
// We can change the button text to "Add Full Mock Test" when selectedTestType is 'Full Mock Tests', or just "Add Test" otherwise.
code = code.replace(
  "<Plus className=\"w-4 h-4\" /> Add Test",
  "<Plus className=\"w-5 h-5\" /> {selectedTestType === 'Full Mock Tests' ? 'Add Full Mock Test' : 'Add Test'}"
);

// We need a sticky/FAB button for mobile to ensure it's permanently visible.
const targetHeader = `        {view === 'tests' && (
          <button 
            onClick={openAddTestModal}
            className="bg-[#5B5FFB] hover:bg-[#4A4DE0] text-white px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5" /> {selectedTestType === 'Full Mock Tests' ? 'Add Full Mock Test' : 'Add Test'}
          </button>
        )}`;

const replacementHeader = `        {view === 'tests' && (
          <>
            <button 
              onClick={openAddTestModal}
              className="hidden sm:flex bg-[#5B5FFB] hover:bg-[#4A4DE0] text-white px-5 py-2.5 rounded-xl text-sm font-semibold items-center gap-2 transition-colors shadow-sm"
            >
              <Plus className="w-5 h-5" /> {selectedTestType === 'Full Mock Tests' ? 'Add Full Mock Test' : 'Add Test'}
            </button>
            <button 
              onClick={openAddTestModal}
              className="sm:hidden fixed bottom-24 right-6 z-[50] flex items-center justify-center gap-2 bg-[#5B5FFB] text-white px-5 py-3.5 rounded-full shadow-2xl hover:bg-[#4A4DE0] transition-all text-sm font-bold border-2 border-white"
            >
              <Plus className="w-5 h-5" /> {selectedTestType === 'Full Mock Tests' ? 'Add Full Mock Test' : 'Add Test'}
            </button>
          </>
        )}`;

if (code.includes(targetHeader)) {
  code = code.replace(targetHeader, replacementHeader);
}

// 4. Set all labels, headings, input text, placeholders and dropdown text to white (#FFFFFF) for the dark theme.
// 5. Keep input backgrounds dark (#1E1E2E) with white text.

// Make labels white
code = code.replace(/text-gray-700 dark:text-gray-300/g, "text-gray-700 dark:text-white");
// Headings are mostly dark:text-white already, but let's make sure
code = code.replace(/text-gray-900 dark:text-white/g, "text-gray-900 dark:text-white");
// Make inputs have white text
// Most inputs use dark:bg-[#151521] or don't have text color set directly (inherit). We add dark:text-white placeholder-gray-400 dark:placeholder-gray-300
code = code.replace(/className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-[^"]+"([^>]*)>/g, (match) => {
  if (!match.includes("dark:text-white")) {
    return match.replace(/className="/, 'className="dark:text-white dark:bg-[#1E1E2E] ');
  }
  return match;
});

code = code.replace(/className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-[^"]+"/g, (match) => {
  if (!match.includes("dark:text-white")) {
    return match.replace(/className="/, 'className="dark:text-white dark:bg-[#1E1E2E] ');
  }
  return match;
});

// Update bg-gray-50 dark:bg-[#151521] inputs to #1E1E2E as well
code = code.replace(/bg-gray-50 dark:bg-\[#151521\]/g, "bg-gray-50 dark:bg-[#1E1E2E] dark:text-white");

fs.writeFileSync('src/pages/admin/AdminMockTests.tsx', code);
