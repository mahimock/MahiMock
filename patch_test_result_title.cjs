const fs = require('fs');
let code = fs.readFileSync('src/pages/TestResult.tsx', 'utf-8');

if (!code.includes("const [testDetails, setTestDetails] = useState")) {
  code = code.replace(
    "const [stats, setStats] = useState({",
    "const [testDetails, setTestDetails] = useState<any>(null);\n  const [stats, setStats] = useState({"
  );
  
  code = code.replace(
    "const resQuery = query(collection(db, 'results'), where('userId', '==', currentUser.uid), where('testId', '==', testId));",
    "const tSnap = await getDoc(doc(db, 'tests', testId));\n        if (tSnap.exists()) setTestDetails(tSnap.data());\n        \n        const resQuery = query(collection(db, 'results'), where('userId', '==', currentUser.uid), where('testId', '==', testId));"
  );
  
  const headerHtml = `
        <div id="result-pdf-container" className="bg-[#F8FAFC] pb-4 px-4 sm:px-0 pt-4 sm:pt-0 -mt-4 sm:mt-0">
          {/* Report Header */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-bold">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{testDetails?.title || 'Official Result Report'}</h2>
                <p className="text-sm text-gray-500">Performance Summary</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm border-t border-gray-100 pt-4">
              <div>
                <p className="text-gray-500 font-medium mb-1">Candidate</p>
                <p className="font-bold text-gray-900 truncate">{currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Student'}</p>
              </div>
              <div>
                <p className="text-gray-500 font-medium mb-1">Date</p>
                <p className="font-bold text-gray-900">{new Date(result.submittedAt).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-gray-500 font-medium mb-1">Time Taken</p>
                <p className="font-bold text-gray-900">{result.timeTaken ? \`\${Math.floor(result.timeTaken / 60)}m \${result.timeTaken % 60}s\` : 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-500 font-medium mb-1">Test ID</p>
                <p className="font-bold text-gray-900 font-mono text-xs mt-0.5">{testId.slice(0,8).toUpperCase()}</p>
              </div>
            </div>
          </div>
  `;
  
  code = code.replace(
    '<div id="result-pdf-container" className="bg-[#F8FAFC] pb-4">',
    headerHtml
  );
}

fs.writeFileSync('src/pages/TestResult.tsx', code);
