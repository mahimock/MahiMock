const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminMockTests.tsx', 'utf-8');

code = code.replace(
  "import { Plus, Edit2, Trash2, X, Loader2, FileQuestion } from 'lucide-react';",
  "import { Plus, Edit2, Trash2, X, Loader2, FileQuestion, ListPlus } from 'lucide-react';\nimport { useNavigate } from 'react-router-dom';"
);

code = code.replace(
  "const [saving, setSaving] = useState(false);",
  "const [saving, setSaving] = useState(false);\n  const navigate = useNavigate();"
);

code = code.replace(
  "                      <button onClick={() => openModal(test)} className=\"p-2 text-gray-400 hover:text-[#5B5FFB] hover:bg-blue-50 rounded-lg transition-colors\">\n                        <Edit2 className=\"w-4 h-4\" />\n                      </button>",
  "                      <button onClick={() => navigate(`/admin/tests/${test.id}/questions`)} className=\"p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors\" title=\"Manage Questions\">\n                        <ListPlus className=\"w-4 h-4\" />\n                      </button>\n                      <button onClick={() => openModal(test)} className=\"p-2 text-gray-400 hover:text-[#5B5FFB] hover:bg-blue-50 rounded-lg transition-colors\" title=\"Edit Test\">\n                        <Edit2 className=\"w-4 h-4\" />\n                      </button>"
);

fs.writeFileSync('src/pages/admin/AdminMockTests.tsx', code);
