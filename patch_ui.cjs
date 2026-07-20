const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminMockTests.tsx', 'utf-8');

// Replace test details fields
const oldTestDetails = `<div className="lg:col-span-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Test Title</label>
                    <input type="text" value={testFormData.title} onChange={e => setTestFormData({...testFormData, title: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-[#5B5FFB]" placeholder="e.g. SSC CGL Full Mock Test 1" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Total Questions</label>
                    <input type="number" value={testFormData.questionsCount} onChange={e => setTestFormData({...testFormData, questionsCount: Number(e.target.value)})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-[#5B5FFB]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Total Marks</label>
                    <input type="number" value={testFormData.marks} onChange={e => setTestFormData({...testFormData, marks: Number(e.target.value)})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-[#5B5FFB]" />
                  </div>`;

const newTestDetails = `<div className="lg:col-span-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Test Title</label>
                    <input type="text" value={testFormData.title} onChange={e => setTestFormData({...testFormData, title: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-[#5B5FFB]" placeholder="e.g. SSC CGL Full Mock Test 1" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Total Questions (Auto)</label>
                    <input type="number" disabled value={testQuestions.length} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 outline-none bg-gray-50 text-gray-500 cursor-not-allowed" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Total Marks (Auto)</label>
                    <input type="number" disabled value={testQuestions.reduce((sum, q) => sum + (Number(q.marks) || 0), 0)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 outline-none bg-gray-50 text-gray-500 cursor-not-allowed" />
                  </div>`;

code = code.replace(oldTestDetails, newTestDetails);

// Add Image & Negative marks to the question builder and tabs
const oldBuilder = `{/* Question Form */}
                <div className="space-y-4 mb-8 bg-blue-50/50 p-4 sm:p-6 rounded-xl border border-blue-100">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Question *</label>
                    <textarea rows={2} value={currentQuestion.text} onChange={e => setCurrentQuestion({...currentQuestion, text: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#5B5FFB] resize-none" placeholder="Type question here..." />
                  </div>`;

const newBuilder = `{/* Question Form Tabs */}
                <div className="flex gap-3 mb-4">
                  <button onClick={() => setEntryMode('manual')} className={\`px-4 py-2 rounded-xl text-sm font-bold transition-colors \${entryMode === 'manual' ? 'bg-[#5B5FFB] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}\`}>Manual Entry</button>
                  <button onClick={() => setEntryMode('bulk')} className={\`px-4 py-2 rounded-xl text-sm font-bold transition-colors \${entryMode === 'bulk' ? 'bg-[#5B5FFB] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}\`}>Bulk Import</button>
                </div>

                {entryMode === 'bulk' && (
                  <div className="space-y-6 mb-8 bg-blue-50/50 p-6 rounded-xl border border-blue-100 text-center">
                    <div className="max-w-md mx-auto space-y-4">
                      <div className="p-8 border-2 border-dashed border-blue-200 rounded-xl bg-white hover:bg-blue-50/30 transition-colors">
                        <UploadCloud className="w-10 h-10 text-blue-500 mx-auto mb-3" />
                        <h5 className="font-bold text-gray-800 mb-1">Upload Questions File</h5>
                        <p className="text-xs text-gray-500 mb-4">Excel (.xlsx, .xls) or CSV files supported</p>
                        <input type="file" accept=".xlsx,.xls,.csv" onChange={(e) => setBulkFile(e.target.files ? e.target.files[0] : null)} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 outline-none" />
                      </div>
                      <div className="flex gap-3">
                        <button onClick={handleDownloadTemplate} className="flex-1 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 shadow-sm">
                          <Download className="w-4 h-4" /> Template
                        </button>
                        <button onClick={handleBulkImport} disabled={!bulkFile || bulkProcessing} className="flex-[2] py-2.5 bg-[#5B5FFB] text-white rounded-xl text-sm font-bold hover:bg-[#4A4DE0] transition-colors disabled:opacity-70 flex items-center justify-center gap-2 shadow-sm">
                          {bulkProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />} Import Questions
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {entryMode === 'manual' && (
                <div className="space-y-4 mb-8 bg-blue-50/50 p-4 sm:p-6 rounded-xl border border-blue-100">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Question *</label>
                    <textarea rows={2} value={currentQuestion.text} onChange={e => setCurrentQuestion({...currentQuestion, text: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#5B5FFB] resize-none" placeholder="Type question here..." />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Question Image URL (Optional)</label>
                    <input type="text" value={currentQuestion.image} onChange={e => setCurrentQuestion({...currentQuestion, image: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-[#5B5FFB]" placeholder="https://..." />
                  </div>`;

code = code.replace(oldBuilder, newBuilder);

const oldMarks = `<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Correct Answer *</label>
                      <select value={currentQuestion.correctAnswer} onChange={e => setCurrentQuestion({...currentQuestion, correctAnswer: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-[#5B5FFB] bg-white">
                        <option value="A">Option A</option>
                        <option value="B">Option B</option>
                        <option value="C">Option C</option>
                        <option value="D">Option D</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Marks *</label>
                      <input type="number" step="0.5" value={currentQuestion.marks} onChange={e => setCurrentQuestion({...currentQuestion, marks: Number(e.target.value)})} className="w-full border border-gray-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-[#5B5FFB]" />
                    </div>
                  </div>`;

const newMarks = `<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Correct Answer *</label>
                      <select value={currentQuestion.correctAnswer} onChange={e => setCurrentQuestion({...currentQuestion, correctAnswer: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-[#5B5FFB] bg-white">
                        <option value="A">Option A</option>
                        <option value="B">Option B</option>
                        <option value="C">Option C</option>
                        <option value="D">Option D</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Marks *</label>
                      <input type="number" step="0.5" value={currentQuestion.marks} onChange={e => setCurrentQuestion({...currentQuestion, marks: Number(e.target.value)})} className="w-full border border-gray-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-[#5B5FFB]" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Negative Marks</label>
                      <input type="number" step="0.1" value={currentQuestion.negativeMarks} onChange={e => setCurrentQuestion({...currentQuestion, negativeMarks: Number(e.target.value)})} className="w-full border border-gray-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-[#5B5FFB]" />
                    </div>
                  </div>`;
                  
code = code.replace(oldMarks, newMarks);

const oldCloseDiv = `                      </button>
                    )}
                  </div>
                </div>`;

const newCloseDiv = `                      </button>
                    )}
                  </div>
                </div>
                )}`;

code = code.replace(oldCloseDiv, newCloseDiv);

// Now update handleSaveTest to dynamically use testQuestions lengths and sums
const oldSave = `      await setDoc(testRef, {
        ...testFormData,
        createdAt: Date.now()
      });`;

const newSave = `      await setDoc(testRef, {
        ...testFormData,
        questionsCount: testQuestions.length,
        marks: testQuestions.reduce((sum, q) => sum + (Number(q.marks) || 0), 0),
        createdAt: Date.now()
      });`;

code = code.replace(oldSave, newSave);

fs.writeFileSync('src/pages/admin/AdminMockTests.tsx', code);
