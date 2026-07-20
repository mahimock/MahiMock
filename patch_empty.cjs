const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/TestQuestionsManagement.tsx', 'utf-8');

const oldEmpty = `<div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
            <p className="text-gray-500">No questions added yet.</p>
          </div>`;

const newEmpty = `<div className="bg-white rounded-2xl p-12 text-center border border-gray-100 flex flex-col items-center justify-center min-h-[300px]">
            <p className="text-gray-500 mb-6 text-lg">No questions available</p>
            <button onClick={() => handleOpenModal()} className="flex items-center justify-center gap-2 px-8 py-4 bg-[#5B5FFB] text-white rounded-xl text-lg font-bold hover:bg-[#4A4DE0] shadow-md transition-all">
              <Plus className="w-6 h-6" /> Add Question
            </button>
          </div>`;

code = code.replace(oldEmpty, newEmpty);
fs.writeFileSync('src/pages/admin/TestQuestionsManagement.tsx', code);
