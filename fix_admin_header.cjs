const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminMockTests.tsx', 'utf-8');

// Header button changes
const targetHeader = `        {view === 'tests' && (
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

const replacementHeader = `        {selectedTestType && (
          <div className="flex gap-2">
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
          </div>
        )}`;

if (code.includes(targetHeader)) {
  code = code.replace(targetHeader, replacementHeader);
  console.log("Replaced header conditional");
} else {
  // Try regex in case of slight spacing differences
  const regexHeader = /\{view === 'tests' && \([\s\S]*?<\/button>\s*<\/>\s*\)\}/;
  code = code.replace(regexHeader, replacementHeader);
  console.log("Replaced header conditional using regex");
}


// Dark theme colors:
// - All headings: white (#FFFFFF)
// - Labels: white
// - Input text: white
// - Placeholder: #B0B0B0 (dark:placeholder-[#B0B0B0])
// - Select text: white
// - Modal background: #1E1E2D (dark:bg-[#1E1E2D]) -> wait, what about the main list?
// - Input background: #2A2A3D (dark:bg-[#2A2A3D])
// - Borders: #3A3A4D (dark:border-[#3A3A4D])

code = code.replace(/dark:bg-\[#1E1E2E\]/g, "dark:bg-[#2A2A3D]");
// Some were set to dark:bg-[#151521], let's change those to dark:bg-[#1E1E2D] or dark:bg-[#2A2A3D] for inputs
code = code.replace(/dark:bg-\[#151521\]/g, "dark:bg-[#1E1E2D]");
// The main container background in dark mode:
code = code.replace(/dark:bg-\[#1E1E2D\]/g, "dark:bg-[#1E1E2D]");

// Add placeholder color
code = code.replace(/dark:placeholder-white/g, "dark:placeholder-[#B0B0B0]");
code = code.replace(/dark:placeholder-gray-300/g, "dark:placeholder-[#B0B0B0]");
code = code.replace(/dark:placeholder-gray-400/g, "dark:placeholder-[#B0B0B0]");

// Let's add dark:placeholder-[#B0B0B0] to any input that doesn't have it
code = code.replace(/<input([^>]*)className="([^"]*)"/g, (match, before, classes) => {
  if (!classes.includes("dark:placeholder-[#B0B0B0]") && !before.includes('type="file"')) {
    return `<input${before}className="${classes} dark:placeholder-[#B0B0B0]"`;
  }
  return match;
});

code = code.replace(/<textarea([^>]*)className="([^"]*)"/g, (match, before, classes) => {
  if (!classes.includes("dark:placeholder-[#B0B0B0]")) {
    return `<textarea${before}className="${classes} dark:placeholder-[#B0B0B0]"`;
  }
  return match;
});

// Update borders: dark:border-[#3A3A4D]
code = code.replace(/dark:border-gray-700/g, "dark:border-[#3A3A4D]");
code = code.replace(/dark:border-gray-800/g, "dark:border-[#3A3A4D]");

fs.writeFileSync('src/pages/admin/AdminMockTests.tsx', code);
