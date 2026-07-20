const fs = require('fs');
let code = fs.readFileSync('src/pages/TakeTest.tsx', 'utf-8');

const oldEmpty = `  if (!test || questions.length === 0) {
    if (isAdmin) {
      return (
        <div className="min-h-screen bg-[#F8FAFC]">
          <AdminTestManagementUI />
        </div>
      );
    }
    return <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">No questions available for this test.</div>;
  }`;

const newEmpty = `  if (!test || questions.length === 0) {
    if (isAdmin) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC] gap-4">
          <p className="text-gray-500">No questions available for this test.</p>
          <button onClick={() => navigate(\`/admin/tests/\${testId}/questions\`)} className="px-6 py-2 bg-[#5B5FFB] text-white rounded-xl font-bold flex items-center gap-2">
            <LayoutGrid className="w-5 h-5" /> Manage Questions
          </button>
        </div>
      );
    }
    return <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC]">
      <p className="text-gray-500">No questions available for this test.</p>
    </div>;
  }`;

code = code.replace(oldEmpty, newEmpty);
fs.writeFileSync('src/pages/TakeTest.tsx', code);
