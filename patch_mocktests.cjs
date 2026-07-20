const fs = require('fs');

let code = fs.readFileSync('src/pages/admin/AdminMockTests.tsx', 'utf-8');

// Imports
if (!code.includes("import * as XLSX from 'xlsx';")) {
  code = code.replace("import toast from 'react-hot-toast';", "import toast from 'react-hot-toast';\nimport * as XLSX from 'xlsx';\nimport { UploadCloud, Download } from 'lucide-react';");
}

// Add state for entryMode and bulk file
code = code.replace(
  "const [testQuestions, setTestQuestions] = useState<any[]>([]);",
  "const [testQuestions, setTestQuestions] = useState<any[]>([]);\n  const [entryMode, setEntryMode] = useState<'manual' | 'bulk'>('manual');\n  const [bulkFile, setBulkFile] = useState<File | null>(null);\n  const [bulkProcessing, setBulkProcessing] = useState(false);"
);

// Update currentQuestion default state
code = code.replace(
  "marks: 2,\n  });",
  "marks: 2,\n    negativeMarks: 0.5,\n    image: '',\n  });"
);

// Update resetQuestionForm
code = code.replace(
  "marks: 2,\n    });",
  "marks: 2,\n      negativeMarks: 0.5,\n      image: '',\n    });"
);

// Bulk Import logic
const bulkImportCode = `
  const handleBulkImport = async () => {
    if (!bulkFile) return toast.error('Please select an Excel or CSV file');
    setBulkProcessing(true);
    try {
      const buffer = await bulkFile.arrayBuffer();
      const wb = XLSX.read(buffer, { type: 'buffer' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(ws);
      
      const importedQs = data.map((row: any) => ({
        id: Date.now().toString() + Math.random().toString(),
        text: row.Question || row.text || '',
        optionA: row['Option A'] || row.optionA || '',
        optionB: row['Option B'] || row.optionB || '',
        optionC: row['Option C'] || row.optionC || '',
        optionD: row['Option D'] || row.optionD || '',
        correctAnswer: row['Correct Answer'] || row.correctAnswer || 'A',
        explanation: row.Explanation || row.explanation || '',
        marks: parseFloat(row.Marks || row.marks) || 2,
        negativeMarks: parseFloat(row['Negative Marks'] || row.negativeMarks || row.negativeMarking) || testFormData.negativeMarking || 0.5,
        image: row['Image'] || row.image || '',
      })).filter((q: any) => q.text && q.optionA && q.optionB && q.optionC && q.optionD);

      if (importedQs.length === 0) {
        toast.error('No valid questions found. Please check columns: Question, Option A, Option B, Option C, Option D, Correct Answer.');
      } else {
        setTestQuestions(prev => [...prev, ...importedQs]);
        toast.success(\`Successfully imported \${importedQs.length} questions\`);
        setBulkFile(null);
      }
    } catch (error) {
      toast.error('Error importing questions. Check file format.');
    } finally {
      setBulkProcessing(false);
    }
  };

  const handleDownloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet([{
      'Question': 'Sample Question?',
      'Option A': 'Option 1',
      'Option B': 'Option 2',
      'Option C': 'Option 3',
      'Option D': 'Option 4',
      'Correct Answer': 'A',
      'Explanation': 'Explanation for answer',
      'Marks': 2,
      'Negative Marks': 0.5,
      'Image': ''
    }]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Questions');
    XLSX.writeFile(wb, 'Questions_Template.xlsx');
  };
`;
code = code.replace("const handleSaveQuestion = () => {", bulkImportCode + "\n  const handleSaveQuestion = () => {");

fs.writeFileSync('src/pages/admin/AdminMockTests.tsx', code);
