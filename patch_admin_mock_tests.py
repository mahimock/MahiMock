import re

with open("src/pages/admin/AdminMockTests.tsx", "r") as f:
    content = f.read()

old_func = """  const handleBulkImport = async () => {
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
        toast.success(`Successfully imported ${importedQs.length} questions`);
        setBulkFile(null);
      }
    } catch (error) {
      toast.error('Error importing questions. Check file format.');
    } finally {
      setBulkProcessing(false);
    }
  };"""

new_func = """  const handleBulkImport = async () => {
    if (!bulkFile) return toast.error('Please select an Excel or CSV file');
    setBulkProcessing(true);
    try {
      let data: any[] = [];
      const buffer = await bulkFile.arrayBuffer();
      const wb = XLSX.read(new Uint8Array(buffer), { type: 'array' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      data = XLSX.utils.sheet_to_json(ws);
      
      const normalizedData = data.map((row: any) => {
        const newRow: any = {};
        for (const key in row) {
          if (Object.prototype.hasOwnProperty.call(row, key)) {
            const cleanKey = key.trim().toLowerCase();
            newRow[cleanKey] = row[key];
          }
        }
        return newRow;
      });

      const importedQs: any[] = [];
      const errors: string[] = [];

      normalizedData.forEach((row, idx) => {
        const isEmpty = Object.values(row).every(v => v === null || v === undefined || v === '');
        if (isEmpty) return;

        const text = row['question'] || row['text'] || '';
        const optionA = row['option a'] || row['optiona'] || '';
        const optionB = row['option b'] || row['optionb'] || '';
        const optionC = row['option c'] || row['optionc'] || '';
        const optionD = row['option d'] || row['optiond'] || '';
        const rawAnswer = row['correct answer'] || row['correctanswer'] || row['answer'] || '';

        if (!text || !optionA || !optionB || !optionC || !optionD || !rawAnswer) {
          errors.push(`Row ${idx + 2}: Missing required fields.`);
          return;
        }
        
        let cleanCorrectAnswer = String(rawAnswer).trim().toUpperCase();
        if (cleanCorrectAnswer.startsWith('OPTION ')) {
          cleanCorrectAnswer = cleanCorrectAnswer.replace('OPTION ', '');
        }

        if (!['A', 'B', 'C', 'D'].includes(cleanCorrectAnswer)) {
          errors.push(`Row ${idx + 2}: Invalid Correct Answer (must be A, B, C, or D).`);
          return;
        }

        importedQs.push({
          id: Date.now().toString() + Math.random().toString() + idx,
          text,
          optionA,
          optionB,
          optionC,
          optionD,
          correctAnswer: cleanCorrectAnswer,
          explanation: row['explanation'] || '',
          marks: parseFloat(row['marks']) || 2,
          negativeMarks: parseFloat(row['negative marks'] || row['negativemarks'] || row['negativemarking']) || testFormData.negativeMarking || 0.5,
          difficulty: row['difficulty'] || 'Medium',
          subject: row['subject'] || '',
          topic: row['topic'] || '',
          image: row['image'] || '',
        });
      });

      if (errors.length > 0) {
        toast.error(errors[0] + (errors.length > 1 ? ` (and ${errors.length - 1} more errors)` : ''), { duration: 5000 });
      }

      if (importedQs.length === 0) {
        toast.error('No valid questions found. Expected columns: Question, Option A, Option B, Option C, Option D, Correct Answer, Subject, Difficulty, Explanation', { duration: 6000 });
      } else {
        setTestQuestions(prev => [...prev, ...importedQs]);
        toast.success(`Successfully imported ${importedQs.length} questions`);
        setBulkFile(null);
      }
    } catch (error) {
      toast.error('Error importing questions. Check file format.');
    } finally {
      setBulkProcessing(false);
    }
  };"""

content = content.replace(old_func, new_func)

with open("src/pages/admin/AdminMockTests.tsx", "w") as f:
    f.write(content)

