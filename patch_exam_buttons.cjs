const fs = require('fs');
let code = fs.readFileSync('src/pages/ExamDetail.tsx', 'utf-8');

if (!code.includes("Play")) {
  code = code.replace(
    "} from 'lucide-react';",
    "  ListPlus, Play\n} from 'lucide-react';"
  );
}

const oldDivStart = `<div 
              key={test.id}
              onClick={() => navigate('/test-instructions/' + test.id)}
              className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:border-[#5B5FFB] cursor-pointer transition-all group flex items-center justify-between relative"
            >`;

const newDivStart = `<div 
              key={test.id}
              onClick={() => !isAdmin && navigate('/test-instructions/' + test.id)}
              className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:border-[#5B5FFB] cursor-pointer transition-all group flex flex-col sm:flex-row sm:items-center justify-between relative gap-4"
            >`;

code = code.replace(oldDivStart, newDivStart);

const oldActions = `<div className="flex items-center gap-3">
                <div className="hidden sm:flex px-4 py-2 rounded-xl bg-blue-50 text-blue-600 text-sm font-bold opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                  'Start Test'
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-[#5B5FFB] transition-colors" />
              </div>
              
              <div className="absolute top-2 right-2 flex gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                <button onClick={(e) => { e.stopPropagation(); handleOpenTestModal(test); }} className="p-1.5 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={(e) => { e.stopPropagation(); handleDeleteTest(test.id); }} className="p-1.5 bg-red-50 text-red-600 rounded-md hover:bg-red-100">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>`;

const newActions = `<div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                {isAdmin ? (
                  <>
                    <button 
                      onClick={(e) => { e.stopPropagation(); navigate(\`/admin/tests/\${test.id}/questions\`); }}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-[#5B5FFB] text-white rounded-xl text-sm font-bold hover:bg-[#4A4DE0] transition-colors"
                    >
                      <ListPlus className="w-4 h-4" /> Manage Questions
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); navigate(\`/test-instructions/\${test.id}\`); }}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-green-50 text-green-700 rounded-xl text-sm font-bold hover:bg-green-100 transition-colors"
                    >
                      <Play className="w-4 h-4" /> Preview Test
                    </button>
                  </>
                ) : (
                  <>
                    <div className="hidden sm:flex px-4 py-2 rounded-xl bg-blue-50 text-blue-600 text-sm font-bold opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                      Start Test
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-[#5B5FFB] transition-colors" />
                  </>
                )}
              </div>
              
              {isAdmin && (
                <div className="absolute top-2 right-2 flex gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                  <button onClick={(e) => { e.stopPropagation(); handleOpenTestModal(test); }} className="p-1.5 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); handleDeleteTest(test.id); }} className="p-1.5 bg-red-50 text-red-600 rounded-md hover:bg-red-100">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}`;

code = code.replace(oldActions, newActions);

fs.writeFileSync('src/pages/ExamDetail.tsx', code);
