const fs = require('fs');
let code = fs.readFileSync('src/pages/TestResult.tsx', 'utf-8');

code = code.replace(
  "import { Loader2, CheckCircle, XCircle, ArrowLeft, Trophy, Target, TrendingUp, Award, BarChart3, AlertTriangle } from 'lucide-react';",
  "import { Loader2, CheckCircle, XCircle, ArrowLeft, Trophy, Target, TrendingUp, Award, BarChart3, AlertTriangle, Download, RotateCcw } from 'lucide-react';\nimport jsPDF from 'jspdf';\nimport html2canvas from 'html2canvas';"
);

const buttonsHTML = `
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/test-series')} className="p-2 hover:bg-gray-200 rounded-full transition-colors bg-white shadow-sm border border-gray-100">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Test Result</h1>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleDownloadPDF} disabled={isDownloading} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50">
              {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} <span className="hidden sm:inline">{isDownloading ? 'Generating...' : 'Download PDF'}</span>
            </button>
            <button onClick={() => navigate(\`/test-instructions/\${testId}\`)} className="flex items-center gap-2 px-4 py-2 bg-[#5B5FFB] text-white rounded-xl font-bold hover:bg-[#4A4DE0] transition-colors shadow-sm">
              <RotateCcw className="w-4 h-4" /> <span className="hidden sm:inline">Retake Test</span>
            </button>
          </div>
        </div>
`;

code = code.replace(
  `        <div className="mb-6 flex items-center gap-4">
          <button onClick={() => navigate('/test-series')} className="p-2 hover:bg-gray-200 rounded-full transition-colors bg-white shadow-sm border border-gray-100">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Test Result</h1>
        </div>`,
  buttonsHTML
);

// Add isDownloading state
code = code.replace(
  "const [stats, setStats] = useState({",
  "const [isDownloading, setIsDownloading] = useState(false);\n  const [stats, setStats] = useState({"
);

// Add handleDownloadPDF function
const pdfFunc = `
  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    try {
      const element = document.getElementById('result-pdf-container');
      if (!element) return;
      const canvas = await html2canvas(element, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('Test_Result.pdf');
    } catch (err) {
      console.error('Failed to generate PDF', err);
    } finally {
      setIsDownloading(false);
    }
  };
`;

code = code.replace(
  "if (!result) return null;",
  pdfFunc + "\n\n  if (!result) return null;"
);

// Wrap main content with ID 'result-pdf-container'
code = code.replace(
  "        {/* Score Card & Performance Analysis */}",
  "        <div id=\"result-pdf-container\" className=\"bg-[#F8FAFC] pb-4\">\n        {/* Score Card & Performance Analysis */}"
);

code = code.replace(
  "        </div>\n      </div>\n    </div>\n  );\n}",
  "        </div>\n        </div>\n      </div>\n    </div>\n  );\n}"
);

fs.writeFileSync('src/pages/TestResult.tsx', code);
