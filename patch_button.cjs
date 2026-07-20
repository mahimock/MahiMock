const fs = require('fs');
let code = fs.readFileSync('src/pages/ExamDetail.tsx', 'utf-8');

const target = `  const renderTestList = (testList: Test[], title: string, onBack: () => void) => (
    <div className="space-y-4 relative">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
      </div>

      <button 
        onClick={() => handleOpenTestModal()} 
        className="absolute top-0 right-0 z-10 flex items-center gap-2 bg-[#5B5FFB] text-white px-5 py-2.5 rounded-full shadow-lg hover:bg-[#4A4DE0] hover:scale-105 transition-all text-sm font-semibold"
      >
        <Plus className="w-5 h-5" /> {view === 'full-mocks' ? 'Add Full Mock Test' : 'Add Test'}
      </button>`;

const replacement = `  const renderTestList = (testList: Test[], title: string, onBack: () => void) => (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors shrink-0">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        </div>
        
        {isAdmin && (
          <button 
            onClick={() => handleOpenTestModal()} 
            className="flex items-center justify-center gap-2 bg-[#5B5FFB] text-white px-5 py-2.5 rounded-full shadow-lg hover:bg-[#4A4DE0] hover:scale-105 transition-all text-sm font-semibold shrink-0"
          >
            <Plus className="w-5 h-5" /> {view === 'full-mocks' ? 'Add Full Mock Test' : 'Add Test'}
          </button>
        )}
      </div>`;

if (code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync('src/pages/ExamDetail.tsx', code);
  console.log("Successfully patched!");
} else {
  console.log("Target not found. Let's try matching with regex.");
  // Try regex in case of trailing spaces
  const regexTarget = /const renderTestList[\s\S]*?Add Test'\}\n\s*<\/button>/;
  if (regexTarget.test(code)) {
    code = code.replace(regexTarget, replacement);
    fs.writeFileSync('src/pages/ExamDetail.tsx', code);
    console.log("Successfully patched with regex!");
  } else {
    console.log("Not found with regex either.");
  }
}
