const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/TestQuestionsManagement.tsx', 'utf-8');

const oldHeader = `      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <div className="relative w-full sm:w-96">
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search questions..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5B5FFB] outline-none"
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto overflow-x-auto hide-scrollbar">
          <button onClick={downloadTemplate} className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-xl text-sm font-semibold hover:bg-green-100 whitespace-nowrap">
            <FileDown className="w-4 h-4" /> Download Sample Excel
          </button>
          <button onClick={() => setIsBulkModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-sm font-semibold hover:bg-blue-100 whitespace-nowrap">
            <Upload className="w-4 h-4" /> Bulk Upload
          </button>
          <button onClick={() => handleOpenModal()} className="flex items-center gap-2 px-4 py-2 bg-[#5B5FFB] text-white rounded-xl text-sm font-semibold hover:bg-[#4A4DE0] whitespace-nowrap">
            <Plus className="w-4 h-4" /> Add Question
          </button>
        </div>
      </div>`;

const newHeader = `      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-200 rounded-full transition-colors bg-white border border-gray-200 shadow-sm">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Manage Questions</h1>
            <p className="text-gray-500">{test.title} • {questions.length} Questions</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-3">
          <button onClick={() => handleOpenModal()} className="flex items-center justify-center gap-2 px-8 py-3 bg-[#5B5FFB] text-white rounded-xl text-base font-bold hover:bg-[#4A4DE0] shadow-md transition-all">
            <Plus className="w-5 h-5" /> Add Question
          </button>
          
          <div className="flex flex-wrap items-center gap-3 justify-end">
            <div className="relative w-64">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search questions..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#5B5FFB] outline-none"
              />
            </div>
            <button onClick={() => setIsBulkModalOpen(true)} className="flex items-center gap-1.5 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-semibold hover:bg-blue-100 transition-colors">
              <Upload className="w-4 h-4" /> Import Questions (Excel/CSV)
            </button>
            <button onClick={exportQuestions} className="flex items-center gap-1.5 px-4 py-2 bg-gray-50 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-100 transition-colors border border-gray-200">
              <Download className="w-4 h-4" /> Export Questions
            </button>
            <button onClick={downloadTemplate} className="flex items-center gap-1.5 px-4 py-2 text-blue-600 rounded-lg text-sm font-semibold hover:bg-blue-50 transition-colors" title="Download Template">
              <FileDown className="w-4 h-4" /> Template
            </button>
          </div>
        </div>
      </div>`;

// Replace oldHeader with nothing, then we'll replace the old title section with newHeader
code = code.replace(oldHeader, "");

const oldTitle = `      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Questions</h1>
          <p className="text-gray-500">{test.title} • {questions.length} Questions</p>
        </div>
      </div>`;

code = code.replace(oldTitle, newHeader);

// Ensure the table structure is as requested:
// Question, Correct Answer, Marks, Actions (Edit/Delete).
const tableHeadOld = `                <thead className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 whitespace-nowrap">#</th>
                    <th className="px-6 py-4 min-w-[300px]">Question</th>
                    <th className="px-6 py-4 whitespace-nowrap">Options</th>
                    <th className="px-6 py-4 whitespace-nowrap">Correct</th>
                    <th className="px-6 py-4 whitespace-nowrap">Marks</th>
                    <th className="px-6 py-4 whitespace-nowrap text-right">Actions</th>
                  </tr>
                </thead>`;

const tableHeadNew = `                <thead className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 whitespace-nowrap">#</th>
                    <th className="px-6 py-4 min-w-[300px]">Question</th>
                    <th className="px-6 py-4 whitespace-nowrap">Correct Answer</th>
                    <th className="px-6 py-4 whitespace-nowrap">Marks</th>
                    <th className="px-6 py-4 whitespace-nowrap text-right">Actions</th>
                  </tr>
                </thead>`;

code = code.replace(tableHeadOld, tableHeadNew);

const trOld = `                      <td className="px-6 py-4">
                        <div className="line-clamp-2 text-gray-900 font-medium mb-1">{q.text}</div>
                        {q.image && <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-semibold">Has Image</span>}
                        {q.explanation && <div className="text-xs text-gray-500 mt-1 line-clamp-1 border-l-2 border-gray-200 pl-2">Exp: {q.explanation}</div>}
                      </td>
                      <td className="px-6 py-4 text-xs">
                        <div className="flex flex-col gap-1">
                          <span className={q.correctAnswer === 'A' ? 'font-bold text-green-600' : ''}>A: {q.optionA || (q.optionAImage ? '[Image]' : '')}</span>
                          <span className={q.correctAnswer === 'B' ? 'font-bold text-green-600' : ''}>B: {q.optionB || (q.optionBImage ? '[Image]' : '')}</span>
                          <span className={q.correctAnswer === 'C' ? 'font-bold text-green-600' : ''}>C: {q.optionC || (q.optionCImage ? '[Image]' : '')}</span>
                          <span className={q.correctAnswer === 'D' ? 'font-bold text-green-600' : ''}>D: {q.optionD || (q.optionDImage ? '[Image]' : '')}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-bold text-green-600">{q.correctAnswer}</td>`;

const trNew = `                      <td className="px-6 py-4">
                        <div className="line-clamp-2 text-gray-900 font-medium mb-1">{q.text}</div>
                        {q.image && <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-semibold">Has Image</span>}
                        {q.explanation && <div className="text-xs text-gray-500 mt-1 line-clamp-1 border-l-2 border-gray-200 pl-2">Exp: {q.explanation}</div>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-bold text-green-600">Option {q.correctAnswer}</td>`;

code = code.replace(trOld, trNew);

fs.writeFileSync('src/pages/admin/TestQuestionsManagement.tsx', code);
