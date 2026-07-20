const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminMockTests.tsx', 'utf-8');

code = code.replace(
  "import { Plus, Edit2, Trash2, X, Loader2, FileQuestion, ListPlus } from 'lucide-react';",
  "import { Plus, Edit2, Trash2, X, Loader2, FileQuestion, ListPlus, Play } from 'lucide-react';"
);

const oldActions = `                      <button onClick={() => navigate(\`/admin/tests/\${test.id}/questions\`)} className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Manage Questions">
                        <ListPlus className="w-4 h-4" />
                      </button>
                      <button onClick={() => openModal(test)} className="p-2 text-gray-400 hover:text-[#5B5FFB] hover:bg-blue-50 rounded-lg transition-colors" title="Edit Test">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(test.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>`;

const newActions = `                      <button onClick={() => navigate(\`/admin/tests/\${test.id}/questions\`)} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#5B5FFB] text-white hover:bg-[#4A4DE0] rounded-lg text-xs font-bold transition-colors">
                        <ListPlus className="w-4 h-4" /> Manage Questions
                      </button>
                      <button onClick={() => navigate(\`/test-instructions/\${test.id}\`)} className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg text-xs font-bold transition-colors">
                        <Play className="w-4 h-4" /> Preview Test
                      </button>
                      <button onClick={() => openModal(test)} className="p-2 text-gray-400 hover:text-[#5B5FFB] hover:bg-blue-50 rounded-lg transition-colors" title="Edit Test">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(test.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete Test">
                        <Trash2 className="w-4 h-4" />
                      </button>`;

code = code.replace(oldActions, newActions);

fs.writeFileSync('src/pages/admin/AdminMockTests.tsx', code);
