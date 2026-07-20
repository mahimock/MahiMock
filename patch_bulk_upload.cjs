const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/TestQuestionsManagement.tsx', 'utf-8');

if (!code.includes("import Papa")) {
  code = code.replace(
    "import * as XLSX from 'xlsx';",
    "import * as XLSX from 'xlsx';\nimport Papa from 'papaparse';"
  );
}

const oldBulkUpload = `  const handleBulkUpload = async () => {
    if (!bulkFile) return;
    setBulkProcessing(true);
    
    try {
      const data = await bulkFile.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows: any[] = XLSX.utils.sheet_to_json(worksheet);

      let successCount = 0;
      let errorCount = 0;

      // Firestore batches allow 500 ops. We'll do simple sequential for progress UI.
      for (let i = 0; i < rows.length; i++) {
        setBulkProgress({ total: rows.length, current: i + 1, success: successCount, error: errorCount });
        
        const row = rows[i];
        try {
          // Validation
          if (!row.Question || !row['Option A'] || !row['Option B'] || !row['Option C'] || !row['Option D'] || !row['Correct Answer (A/B/C/D)']) {
            throw new Error('Missing required fields');
          }

          let correct = row['Correct Answer (A/B/C/D)'].toString().trim().toUpperCase();
          if (!['A', 'B', 'C', 'D'].includes(correct)) correct = 'A';

          const newQ = {
            testId,
            text: row.Question.toString(),
            optionA: row['Option A'].toString(),
            optionB: row['Option B'].toString(),
            optionC: row['Option C'].toString(),
            optionD: row['Option D'].toString(),
            correctAnswer: correct,
            explanation: row.Explanation ? row.Explanation.toString() : '',
            marks: parseFloat(row.Marks) || 1,
            negativeMarks: parseFloat(row['Negative Marks']) || 0,
            difficulty: row.Difficulty ? row.Difficulty.toString() : 'Medium',
            language: row.Language ? row.Language.toString() : 'English',
            createdAt: Date.now() + i
          };

          // Skip duplicates by checking if exact question text exists in this test
          if (questions.some(q => q.text === newQ.text)) {
            // Already exists, skip or count as success? Let's throw error for duplicate
            throw new Error('Duplicate');
          }

          await addDoc(collection(db, 'questions'), newQ);
          successCount++;
        } catch (e) {
          errorCount++;
        }
      }
      
      setBulkProgress({ total: rows.length, current: rows.length, success: successCount, error: errorCount });
      toast.success(\`Import complete. Success: \${successCount}, Errors/Duplicates: \${errorCount}\`);
      setTimeout(() => {
        setIsBulkModalOpen(false);
        setBulkFile(null);
        setBulkProcessing(false);
        setBulkProgress({ total: 0, current: 0, success: 0, error: 0 });
      }, 2000);

    } catch (err) {
      toast.error('Failed to parse file');
      setBulkProcessing(false);
    }
  };`;

const newBulkUpload = `  const processRows = async (rows: any[]) => {
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < rows.length; i++) {
      setBulkProgress({ total: rows.length, current: i + 1, success: successCount, error: errorCount });
      
      const row = rows[i];
      try {
        if (!row.Question || !row['Option A'] || !row['Option B'] || !row['Option C'] || !row['Option D'] || !row['Correct Answer (A/B/C/D)']) {
          throw new Error('Missing required fields');
        }

        let correct = row['Correct Answer (A/B/C/D)'].toString().trim().toUpperCase();
        if (!['A', 'B', 'C', 'D'].includes(correct)) correct = 'A';

        const newQ = {
          testId,
          text: row.Question.toString(),
          optionA: row['Option A'].toString(),
          optionB: row['Option B'].toString(),
          optionC: row['Option C'].toString(),
          optionD: row['Option D'].toString(),
          correctAnswer: correct,
          explanation: row.Explanation ? row.Explanation.toString() : '',
          marks: parseFloat(row.Marks) || 1,
          negativeMarks: parseFloat(row['Negative Marks']) || 0,
          difficulty: row.Difficulty ? row.Difficulty.toString() : 'Medium',
          language: row.Language ? row.Language.toString() : 'English',
          createdAt: Date.now() + i
        };

        if (questions.some(q => q.text === newQ.text)) {
          throw new Error('Duplicate');
        }

        await addDoc(collection(db, 'questions'), newQ);
        successCount++;
      } catch (e) {
        errorCount++;
      }
    }
    
    setBulkProgress({ total: rows.length, current: rows.length, success: successCount, error: errorCount });
    toast.success(\`Import complete. Success: \${successCount}, Errors/Duplicates: \${errorCount}\`);
    setTimeout(() => {
      setIsBulkModalOpen(false);
      setBulkFile(null);
      setBulkProcessing(false);
      setBulkProgress({ total: 0, current: 0, success: 0, error: 0 });
    }, 2000);
  };

  const handleBulkUpload = async () => {
    if (!bulkFile) return;
    setBulkProcessing(true);
    
    try {
      if (bulkFile.name.endsWith('.csv')) {
        Papa.parse(bulkFile, {
          header: true,
          skipEmptyLines: true,
          complete: async (results) => {
            await processRows(results.data);
          },
          error: (error) => {
            console.error('CSV Parsing Error:', error);
            toast.error('Failed to parse CSV file');
            setBulkProcessing(false);
          }
        });
      } else {
        const data = await bulkFile.arrayBuffer();
        const workbook = XLSX.read(data);
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows: any[] = XLSX.utils.sheet_to_json(worksheet);
        await processRows(rows);
      }
    } catch (err) {
      toast.error('Failed to process file');
      setBulkProcessing(false);
    }
  };`;

code = code.replace(oldBulkUpload, newBulkUpload);
fs.writeFileSync('src/pages/admin/TestQuestionsManagement.tsx', code);
