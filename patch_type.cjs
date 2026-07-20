const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/TestQuestionsManagement.tsx', 'utf-8');

const oldGrid = `<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Marks</label>
                  <input type="number" step="0.1" required value={formData.marks} onChange={e => setFormData({...formData, marks: parseFloat(e.target.value)||0})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-[#5B5FFB] outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">-ve Marks</label>
                  <input type="number" step="0.01" required value={formData.negativeMarks} onChange={e => setFormData({...formData, negativeMarks: parseFloat(e.target.value)||0})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-[#5B5FFB] outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                  <select value={formData.difficulty} onChange={e => setFormData({...formData, difficulty: e.target.value as any})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-[#5B5FFB] outline-none bg-white">
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                  <input type="text" value={formData.language} onChange={e => setFormData({...formData, language: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-[#5B5FFB] outline-none" />
                </div>
              </div>`;

const newGrid = `<div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Marks</label>
                  <input type="number" step="0.1" required value={formData.marks} onChange={e => setFormData({...formData, marks: parseFloat(e.target.value)||0})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-[#5B5FFB] outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">-ve Marks</label>
                  <input type="number" step="0.01" required value={formData.negativeMarks} onChange={e => setFormData({...formData, negativeMarks: parseFloat(e.target.value)||0})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-[#5B5FFB] outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Question Type</label>
                  <select disabled className="w-full border border-gray-200 rounded-xl px-4 py-2.5 outline-none bg-gray-50 text-gray-500 cursor-not-allowed">
                    <option value="Single Correct">Single Correct</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                  <select value={formData.difficulty} onChange={e => setFormData({...formData, difficulty: e.target.value as any})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-[#5B5FFB] outline-none bg-white">
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                  <input type="text" value={formData.language} onChange={e => setFormData({...formData, language: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-[#5B5FFB] outline-none" />
                </div>
              </div>`;

code = code.replace(oldGrid, newGrid);

fs.writeFileSync('src/pages/admin/TestQuestionsManagement.tsx', code);
