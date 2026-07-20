const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminMockTests.tsx', 'utf-8');

// Add import
if (!code.includes("import AdminQuestionManager from './AdminQuestionManager';")) {
  code = code.replace(
    "import { UploadCloud, Download } from 'lucide-react';",
    "import { UploadCloud, Download, FileText, Settings } from 'lucide-react';\nimport AdminQuestionManager from './AdminQuestionManager';"
  );
}

// Add selectedTest state
code = code.replace(
  "const [selectedTestType, setSelectedTestType] = useState<string>('');",
  "const [selectedTestType, setSelectedTestType] = useState<string>('');\n  const [selectedTest, setSelectedTest] = useState<any>(null);"
);

// Update view checks in breadcrumbs
const oldBreadcrumb = `{selectedTestType && (
          <>
            <ChevronRight className="w-4 h-4" />
            <span className="text-[#5B5FFB] font-bold">{selectedTestType}</span>
          </>
        )}`;
const newBreadcrumb = `{selectedTestType && (
          <>
            <ChevronRight className="w-4 h-4" />
            <button onClick={() => setView('tests')} className={\`hover:text-[#5B5FFB] font-medium transition-colors \${view === 'tests' ? 'text-[#5B5FFB] font-bold' : ''}\`}>
              {selectedTestType}
            </button>
          </>
        )}
        {view === 'questions' && selectedTest && (
          <>
            <ChevronRight className="w-4 h-4" />
            <span className="text-[#5B5FFB] font-bold">{selectedTest.title} Questions</span>
          </>
        )}`;
code = code.replace(oldBreadcrumb, newBreadcrumb);

// Update View Header
code = code.replace(
  "{view === 'tests' && selectedTestType}",
  "{view === 'tests' && selectedTestType}\n            {view === 'questions' && 'Manage Questions'}"
);

// Add action button for questions to Test Table
const oldTableActions = `<button onClick={() => handleDeleteTest(test.id)} className="p-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>`;
const newTableActions = `<button onClick={() => { setSelectedTest(test); setView('questions'); }} className="p-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors" title="Manage Questions">
                          <Settings className="w-4 h-4" /> Manage Questions
                        </button>
                        <button onClick={() => handleDeleteTest(test.id)} className="p-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>`;
code = code.replace(oldTableActions, newTableActions);

// Add the AdminQuestionManager View rendering
const oldTestsViewEnd = `              </tbody>
            </table>
          </div>
        </div>
      )}`;
const newTestsViewEnd = `              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Questions View */}
      {view === 'questions' && selectedTest && (
        <AdminQuestionManager 
          catName={selectedCategory?.name || selectedCategory?.category}
          examName={selectedExam?.examName}
          typeCollection={selectedTestType}
          testId={selectedTest.id}
          testTitle={selectedTest.title}
          onBack={() => setView('tests')}
        />
      )}`;
code = code.replace(oldTestsViewEnd, newTestsViewEnd);

fs.writeFileSync('src/pages/admin/AdminMockTests.tsx', code);
