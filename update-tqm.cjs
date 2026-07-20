const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/TestQuestionsManagement.tsx', 'utf-8');

code = code.replace(
  "optionD: string;",
  "optionD: string;\n  optionAImage?: string;\n  optionBImage?: string;\n  optionCImage?: string;\n  optionDImage?: string;"
);

code = code.replace(
  "const [expImage, setExpImage] = useState('');",
  "const [expImage, setExpImage] = useState('');\n  const [optAImage, setOptAImage] = useState('');\n  const [optBImage, setOptBImage] = useState('');\n  const [optCImage, setOptCImage] = useState('');\n  const [optDImage, setOptDImage] = useState('');"
);

code = code.replace(
  "setExpImage(q.explanationImage || '');",
  "setExpImage(q.explanationImage || '');\n      setOptAImage(q.optionAImage || '');\n      setOptBImage(q.optionBImage || '');\n      setOptCImage(q.optionCImage || '');\n      setOptDImage(q.optionDImage || '');"
);

code = code.replace(
  "setExpImage('');",
  "setExpImage('');\n      setOptAImage('');\n      setOptBImage('');\n      setOptCImage('');\n      setOptDImage('');"
);

code = code.replace(
  "explanationImage: expImage,",
  "explanationImage: expImage,\n        optionAImage: optAImage,\n        optionBImage: optBImage,\n        optionCImage: optCImage,\n        optionDImage: optDImage,"
);

// Table view replacement
const tableStart = `        {filteredQuestions.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
            <p className="text-gray-500">No questions added yet.</p>
          </div>
        ) : (`;
const tableEnd = `        )}
      </div>`;

const newTableView = `        {filteredQuestions.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
            <p className="text-gray-500">No questions added yet.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-700">
                <thead className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 whitespace-nowrap">#</th>
                    <th className="px-6 py-4 min-w-[300px]">Question</th>
                    <th className="px-6 py-4 whitespace-nowrap">Options</th>
                    <th className="px-6 py-4 whitespace-nowrap">Correct</th>
                    <th className="px-6 py-4 whitespace-nowrap">Marks</th>
                    <th className="px-6 py-4 whitespace-nowrap text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredQuestions.map((q, index) => (
                    <tr key={q.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{index + 1}</td>
                      <td className="px-6 py-4">
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
                      <td className="px-6 py-4 whitespace-nowrap font-bold text-green-600">{q.correctAnswer}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span>+{q.marks}</span>
                          <span className="text-red-500 text-xs">-{q.negativeMarks}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => handleOpenModal(q)} className="p-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors"><Edit2 className="w-4 h-4" /></button>
                          <button onClick={() => handleDelete(q.id)} className="p-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>`;

const startIndex = code.indexOf(tableStart);
const endIndex = code.indexOf(tableEnd) + tableEnd.length;
if(startIndex !== -1 && endIndex !== -1) {
  code = code.substring(0, startIndex) + newTableView + code.substring(endIndex);
}

// Option images UI inside modal
const optAOld = `<div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Option A *</label>
                  <input required type="text" value={formData.optionA} onChange={e => setFormData({...formData, optionA: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-[#5B5FFB] outline-none" />
                </div>`;
const optBOld = `<div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Option B *</label>
                  <input required type="text" value={formData.optionB} onChange={e => setFormData({...formData, optionB: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-[#5B5FFB] outline-none" />
                </div>`;
const optCOld = `<div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Option C *</label>
                  <input required type="text" value={formData.optionC} onChange={e => setFormData({...formData, optionC: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-[#5B5FFB] outline-none" />
                </div>`;
const optDOld = `<div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Option D *</label>
                  <input required type="text" value={formData.optionD} onChange={e => setFormData({...formData, optionD: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-[#5B5FFB] outline-none" />
                </div>`;

const optANew = `<div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Option A *</label>
                  <input required={!optAImage} type="text" value={formData.optionA} onChange={e => setFormData({...formData, optionA: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-[#5B5FFB] outline-none mb-2" />
                  <div className="flex items-center gap-2">
                    {optAImage && <img src={optAImage} alt="A" className="w-8 h-8 object-cover rounded" />}
                    <label className="cursor-pointer text-xs font-semibold text-blue-600 hover:underline">
                      + Add Image
                      <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, setOptAImage)} className="hidden" />
                    </label>
                    {optAImage && <button type="button" onClick={() => setOptAImage('')} className="text-xs text-red-500 hover:underline">Remove</button>}
                  </div>
                </div>`;

const optBNew = `<div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Option B *</label>
                  <input required={!optBImage} type="text" value={formData.optionB} onChange={e => setFormData({...formData, optionB: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-[#5B5FFB] outline-none mb-2" />
                  <div className="flex items-center gap-2">
                    {optBImage && <img src={optBImage} alt="B" className="w-8 h-8 object-cover rounded" />}
                    <label className="cursor-pointer text-xs font-semibold text-blue-600 hover:underline">
                      + Add Image
                      <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, setOptBImage)} className="hidden" />
                    </label>
                    {optBImage && <button type="button" onClick={() => setOptBImage('')} className="text-xs text-red-500 hover:underline">Remove</button>}
                  </div>
                </div>`;

const optCNew = `<div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Option C *</label>
                  <input required={!optCImage} type="text" value={formData.optionC} onChange={e => setFormData({...formData, optionC: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-[#5B5FFB] outline-none mb-2" />
                  <div className="flex items-center gap-2">
                    {optCImage && <img src={optCImage} alt="C" className="w-8 h-8 object-cover rounded" />}
                    <label className="cursor-pointer text-xs font-semibold text-blue-600 hover:underline">
                      + Add Image
                      <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, setOptCImage)} className="hidden" />
                    </label>
                    {optCImage && <button type="button" onClick={() => setOptCImage('')} className="text-xs text-red-500 hover:underline">Remove</button>}
                  </div>
                </div>`;

const optDNew = `<div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Option D *</label>
                  <input required={!optDImage} type="text" value={formData.optionD} onChange={e => setFormData({...formData, optionD: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-[#5B5FFB] outline-none mb-2" />
                  <div className="flex items-center gap-2">
                    {optDImage && <img src={optDImage} alt="D" className="w-8 h-8 object-cover rounded" />}
                    <label className="cursor-pointer text-xs font-semibold text-blue-600 hover:underline">
                      + Add Image
                      <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, setOptDImage)} className="hidden" />
                    </label>
                    {optDImage && <button type="button" onClick={() => setOptDImage('')} className="text-xs text-red-500 hover:underline">Remove</button>}
                  </div>
                </div>`;

code = code.replace(optAOld, optANew);
code = code.replace(optBOld, optBNew);
code = code.replace(optCOld, optCNew);
code = code.replace(optDOld, optDNew);

fs.writeFileSync('src/pages/admin/TestQuestionsManagement.tsx', code);
