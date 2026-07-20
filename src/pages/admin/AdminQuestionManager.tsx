import React, { useState, useEffect, useRef } from 'react';
import { collection, doc, getDocs, setDoc, deleteDoc, writeBatch, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import { Search, Plus, Trash2, Edit2, UploadCloud, Download, Image as ImageIcon, X, ChevronLeft, Loader2, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { uploadImageToCloudinary } from '../../lib/cloudinary';
import * as XLSX from 'xlsx';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

interface AdminQuestionManagerProps {
  catName: string;
  examName: string;
  typeCollection: string;
  testId: string;
  testTitle: string;
  onBack: () => void;
}

export default function AdminQuestionManager({ catName, examName, typeCollection, testId, testTitle, onBack }: AdminQuestionManagerProps) {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Search
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  
  // Bulk File
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [bulkProcessing, setBulkProcessing] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);

  // Form State
  const defaultForm = {
    text: '',
    textHindi: '',
    optionA: '',
    optionAHindi: '',
    optionB: '',
    optionBHindi: '',
    optionC: '',
    optionCHindi: '',
    optionD: '',
    optionDHindi: '',
    correctAnswer: 'A',
    explanation: '',
    explanationHindi: '',
    marks: 1,
    negativeMarks: 0,
    difficulty: 'Medium',
    subject: '',
    topic: '',
    image: '',
  };
  const [formData, setFormData] = useState(defaultForm);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const qRef = collection(db, 'tests', testId, 'Questions');
      const qSnap = await getDocs(query(qRef, orderBy('order', 'asc')));
      let fetched = qSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      
      // If no order, sort by creation or something. But order is usually added.
      setQuestions(fetched);
    } catch (err: any) {
      toast.error('Failed to load questions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleOpenModal = (q?: any) => {
    if (q) {
      setEditingQuestionId(q.id);
      setFormData({
        text: q.text || '',
        textHindi: q.textHindi || '',
        optionA: q.optionA || '',
        optionAHindi: q.optionAHindi || '',
        optionB: q.optionB || '',
        optionBHindi: q.optionBHindi || '',
        optionC: q.optionC || '',
        optionCHindi: q.optionCHindi || '',
        optionD: q.optionD || '',
        optionDHindi: q.optionDHindi || '',
        correctAnswer: q.correctAnswer || 'A',
        explanation: q.explanation || '',
        explanationHindi: q.explanationHindi || '',
        marks: q.marks || 1,
        negativeMarks: q.negativeMarks || 0,
        difficulty: q.difficulty || 'Medium',
        subject: q.subject || '',
        topic: q.topic || '',
        image: q.image || '',
      });
    } else {
      setEditingQuestionId(null);
      setFormData(defaultForm);
    }
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.text || !formData.optionA || !formData.optionB || !formData.optionC || !formData.optionD) {
      return toast.error('Please fill the question and all options.');
    }
    setSaving(true);
    try {
      let imageUrl = formData.image;
      if (imageFile) {
        imageUrl = await uploadImageToCloudinary(imageFile);
      }

      const qRef = collection(db, 'tests', testId, 'Questions');
      const docRef = editingQuestionId ? doc(qRef, editingQuestionId) : doc(qRef);

      const payload = {
        ...formData,
        image: imageUrl,
        order: editingQuestionId ? (questions.find(q => q.id === editingQuestionId)?.order || questions.length + 1) : questions.length + 1,
      };

      await setDoc(docRef, payload, { merge: true });
      toast.success(editingQuestionId ? 'Question updated' : 'Question added');
      setIsModalOpen(false);
      
      // Update Test doc counts
      const updatedQs = (editingQuestionId ? questions.map(q => q.id === editingQuestionId ? payload : q) : [...questions, payload]);
      const newTotal = updatedQs.length;
      const newMarks = updatedQs.reduce((sum, q) => sum + (Number(q.marks) || 1), 0);
      
      const testDocRef = doc(db, 'tests', testId);
      await setDoc(testDocRef, { questionsCount: newTotal, marks: newMarks }, { merge: true });

      // Fetch fresh again to keep UI in sync
      await fetchQuestions();
    } catch (err: any) {
      console.error('Save question error:', err);
      toast.error('Error saving question: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;
    try {
      const qRef = doc(db, 'tests', testId, 'Questions', id);
      await deleteDoc(qRef);
      
      const updatedQs = questions.filter(q => q.id !== id);
      const testDocRef = doc(db, 'tests', testId);
      await setDoc(testDocRef, {
        questionsCount: updatedQs.length,
        marks: updatedQs.reduce((sum, q) => sum + (Number(q.marks) || 1), 0)
      }, { merge: true });

      setQuestions(updatedQs);
      toast.success('Question deleted');
    } catch (err: any) {
      toast.error('Failed to delete question');
    }
  };

  const handleBulkImport = async () => {
    if (!bulkFile) return toast.error('Please select an Excel or CSV file');
    setBulkProcessing(true);
    try {
      const buffer = await bulkFile.arrayBuffer();
      const wb = XLSX.read(new Uint8Array(buffer), { type: 'array', cellDates: true });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' }) as any[][];
      
      console.log('Import started. Total raw rows:', rows.length);
      console.log('First 5 rows preview:', rows.slice(0, 5));

      if (rows.length === 0) {
        toast.error('File is empty');
        return;
      }

      // Identify Header Row & Mappings
      let headerIdx = -1;
      let mappings: any = {
        question: 1, // Default Column B (0-indexed: 1)
        optionA: 2,  // Default Column C (0-indexed: 2)
        optionB: 3,  // Default Column D
        optionC: 4,  // Default Column E
        optionD: 5,  // Default Column F
        correctAnswer: 6, // Default Column G
        explanation: 7,   // Default Column H
        subject: -1,
        difficulty: -1,
        marks: -1,
        negativeMarks: -1
      };

      // Check first 5 rows for recognizable headers to override defaults
      for (let i = 0; i < Math.min(rows.length, 5); i++) {
        const row = rows[i].map(c => String(c || '').trim().toLowerCase());
        const hasHeader = row.some(c => 
          c.includes('question') || 
          c.includes('option a') || 
          c.includes('correct answer') ||
          c === 'q' || c === 'ans' || c === 'explanation'
        );

        if (hasHeader) {
          headerIdx = i;
          console.log(`Header found at row ${i + 1}:`, row);
          row.forEach((cell, cellIdx) => {
            const c = cell.trim().toLowerCase();
            if (c.includes('question') || c === 'text' || c === 'q') mappings.question = cellIdx;
            if (c.includes('option a') || c === 'optiona' || c === 'a') mappings.optionA = cellIdx;
            if (c.includes('option b') || c === 'optionb' || c === 'b') mappings.optionB = cellIdx;
            if (c.includes('option c') || c === 'optionc' || c === 'c') mappings.optionC = cellIdx;
            if (c.includes('option d') || c === 'optiond' || c === 'd') mappings.optionD = cellIdx;
            if (c.includes('correct answer') || c === 'answer' || c === 'ans' || c === 'correct') mappings.correctAnswer = cellIdx;
            if (c.includes('explanation')) mappings.explanation = cellIdx;
            if (c === 'subject') mappings.subject = cellIdx;
            if (c === 'difficulty') mappings.difficulty = cellIdx;
            if (c === 'marks') mappings.marks = cellIdx;
            if (c.includes('negative')) mappings.negativeMarks = cellIdx;
          });
          break;
        }
      }

      const importedQs: any[] = [];
      const errors: string[] = [];
      const startRow = headerIdx === -1 ? 0 : headerIdx + 1;
      
      console.log('Using mappings:', mappings);
      console.log('Starting data parse from row:', startRow + 1);

      for (let i = startRow; i < rows.length; i++) {
        const row = rows[i];
        if (!row) continue;
        
        // Skip empty rows
        const isRowEmpty = row.every(cell => cell === null || cell === undefined || String(cell).trim() === '');
        if (isRowEmpty) continue;

        const text = row[mappings.question];
        const optionA = row[mappings.optionA];
        const optionB = row[mappings.optionB];
        const optionC = row[mappings.optionC];
        const optionD = row[mappings.optionD];
        const rawAnswer = row[mappings.correctAnswer];

        // If it's a very incomplete row, skip or report error
        if (!text && !optionA && !optionB) continue;

        if (!text || !optionA || !optionB || !optionC || !optionD || !rawAnswer) {
          errors.push(`Row ${i + 1}: Missing required fields (Question, Options, or Answer).`);
          continue;
        }

        let cleanCorrectAnswer = String(rawAnswer).trim().toUpperCase();
        // Handle "Option A" or "1" or "A)" or just "A"
        if (cleanCorrectAnswer.startsWith('OPTION ')) {
          cleanCorrectAnswer = cleanCorrectAnswer.replace('OPTION ', '');
        }
        if (cleanCorrectAnswer.endsWith(')')) {
           cleanCorrectAnswer = cleanCorrectAnswer.replace(')', '');
        }
        // Map 1, 2, 3, 4 to A, B, C, D
        if (cleanCorrectAnswer === '1') cleanCorrectAnswer = 'A';
        if (cleanCorrectAnswer === '2') cleanCorrectAnswer = 'B';
        if (cleanCorrectAnswer === '3') cleanCorrectAnswer = 'C';
        if (cleanCorrectAnswer === '4') cleanCorrectAnswer = 'D';

        if (!['A', 'B', 'C', 'D'].includes(cleanCorrectAnswer)) {
          errors.push(`Row ${i + 1}: Invalid Correct Answer "${rawAnswer}". Must be A, B, C, or D (or 1-4).`);
          continue;
        }

        const subjectVal = mappings.subject !== -1 ? String(row[mappings.subject] || '').trim() : '';
        const difficultyVal = mappings.difficulty !== -1 ? String(row[mappings.difficulty] || '').trim() : '';

        importedQs.push({
          text: String(text).trim(),
          optionA: String(optionA).trim(),
          optionB: String(optionB).trim(),
          optionC: String(optionC).trim(),
          optionD: String(optionD).trim(),
          correctAnswer: cleanCorrectAnswer,
          explanation: mappings.explanation !== -1 ? String(row[mappings.explanation] || '').trim() : '',
          marks: mappings.marks !== -1 ? (parseFloat(String(row[mappings.marks])) || 1) : 1,
          negativeMarks: mappings.negativeMarks !== -1 ? (parseFloat(String(row[mappings.negativeMarks])) || 0) : 0,
          difficulty: difficultyVal || 'Medium',
          subject: subjectVal || 'General',
          topic: '',
          image: '',
        });
      }

      console.log('Successfully parsed questions:', importedQs.length);
      if (importedQs.length > 0) console.log('First parsed question:', importedQs[0]);

      if (errors.length > 0) {
        console.warn('Import Errors:', errors);
        if (importedQs.length === 0) {
           toast.error(errors[0], { duration: 5000 });
        }
      }

      if (importedQs.length === 0) {
        toast.error('No valid questions found. Check console for details.', { duration: 5000 });
      } else {
        const batch = writeBatch(db);
        const baseOrder = questions.length;
        const qColRef = collection(db, 'tests', testId, 'Questions');
        
        importedQs.forEach((q, idx) => {
          const newQRef = doc(qColRef);
          batch.set(newQRef, { ...q, order: baseOrder + idx + 1 });
        });
        
        await batch.commit();

        const newTotal = questions.length + importedQs.length;
        const newMarks = questions.reduce((sum, q) => sum + (Number(q.marks) || 1), 0) + importedQs.reduce((sum, q) => sum + (Number(q.marks) || 1), 0);
        
        const testDocRef = doc(db, 'tests', testId);
        await setDoc(testDocRef, { questionsCount: newTotal, marks: newMarks }, { merge: true });

        toast.success(`Successfully imported ${importedQs.length} questions`);
        setBulkFile(null);
        setShowBulkUpload(false);
        fetchQuestions();
      }
    } catch (error: any) {
      console.error('Bulk Import Fatal Error:', error);
      toast.error(`Error processing file: ${error.message}`);
    } finally {
      setBulkProcessing(false);
    }
  };

  const handleExportQuestions = () => {
    const dataToExport = questions.map(q => ({
      'Question': q.text,
      'Option A': q.optionA,
      'Option B': q.optionB,
      'Option C': q.optionC,
      'Option D': q.optionD,
      'Correct Answer': q.correctAnswer,
      'Explanation': q.explanation,
      'Marks': q.marks,
      'Negative Marks': q.negativeMarks,
      'Difficulty': q.difficulty,
      'Subject': q.subject,
      'Topic': q.topic,
      'Image': q.image
    }));
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Questions');
    XLSX.writeFile(wb, `\${testTitle}_Questions.xlsx`);
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
      'Difficulty': 'Medium',
      'Subject': 'Math',
      'Topic': 'Algebra',
      'Image': ''
    }]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, 'Questions_Template.xlsx');
  };

  // Filter & Pagination
  const filteredQuestions = questions.filter(q => q.text.toLowerCase().includes(searchTerm.toLowerCase()));
  const totalPages = Math.ceil(filteredQuestions.length / itemsPerPage);
  const currentQuestions = filteredQuestions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
      ['link', 'image', 'video'],
      ['clean']
    ],
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between bg-white dark:bg-[#1E1E2D] p-4 sm:p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm gap-4 flex-wrap">
        <div>
          <button onClick={onBack} className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-2 text-sm font-semibold">
            <ChevronLeft className="w-4 h-4" /> Back to Tests
          </button>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            Managing Questions: <span className="text-[#5B5FFB]">{testTitle}</span>
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{questions.length} Total Questions</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button onClick={() => setShowBulkUpload(true)} className="px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-50 dark:bg-[#151521] flex items-center gap-2 text-sm transition-colors shadow-sm">
            <UploadCloud className="w-4 h-4" /> Import Excel
          </button>
          <button onClick={handleExportQuestions} className="px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-50 dark:bg-[#151521] flex items-center gap-2 text-sm transition-colors shadow-sm">
            <Download className="w-4 h-4" /> Export Excel
          </button>
          <button onClick={() => handleOpenModal()} className="px-5 py-2.5 bg-[#5B5FFB] text-white font-bold rounded-xl hover:bg-[#4A4DE0] flex items-center gap-2 text-sm transition-colors shadow-sm">
            <Plus className="w-4 h-4" /> Add Question
          </button>
        </div>
      </div>

      {showBulkUpload && (
        <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 text-center animate-in fade-in slide-in-from-top-4 relative">
          <button onClick={() => setShowBulkUpload(false)} className="absolute top-4 right-4 p-1.5 bg-white dark:bg-[#1E1E2D] text-gray-400 hover:text-gray-700 dark:text-gray-300 rounded-full shadow-sm"><X className="w-4 h-4" /></button>
          <div className="max-w-md mx-auto space-y-4">
            <div className="p-8 border-2 border-dashed border-blue-200 rounded-xl bg-white dark:bg-[#1E1E2D] hover:bg-blue-50/30 transition-colors cursor-pointer relative">
              <input type="file" accept=".xlsx,.xls,.csv" onChange={(e) => setBulkFile(e.target.files ? e.target.files[0] : null)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              <UploadCloud className="w-10 h-10 text-blue-500 mx-auto mb-3" />
              <h5 className="font-bold text-gray-800 dark:text-gray-200 mb-1">{bulkFile ? bulkFile.name : 'Click to Upload Questions File'}</h5>
              <p className="text-xs text-gray-500 dark:text-gray-400">Excel (.xlsx, .xls) or CSV files supported</p>
            </div>
            <div className="flex gap-3">
              <button onClick={handleDownloadTemplate} className="flex-1 py-2.5 bg-white dark:bg-[#1E1E2D] border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-bold hover:bg-gray-50 dark:bg-[#151521] transition-colors flex items-center justify-center gap-2 shadow-sm">
                <Download className="w-4 h-4" /> Template
              </button>
              <button onClick={handleBulkImport} disabled={!bulkFile || bulkProcessing} className="flex-[2] py-2.5 bg-[#5B5FFB] text-white rounded-xl text-sm font-bold hover:bg-[#4A4DE0] transition-colors disabled:opacity-70 flex items-center justify-center gap-2 shadow-sm">
                {bulkProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />} Import Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search and List */}
      <div className="bg-white dark:bg-[#1E1E2D] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-[#151521]/50 flex justify-between items-center gap-4 flex-wrap">
          <div className="relative max-w-sm w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search questions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-sm outline-none focus:border-[#5B5FFB] focus:ring-1 focus:ring-[#5B5FFB] transition-all bg-white dark:bg-[#1E1E2D]"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-[#5B5FFB]" /></div>
        ) : currentQuestions.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {currentQuestions.map((q, idx) => (
              <div key={q.id} className="p-4 sm:p-6 hover:bg-gray-50 dark:bg-[#151521] transition-colors group">
                <div className="flex justify-between items-start gap-4 mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md">Q{(currentPage - 1) * itemsPerPage + idx + 1}</span>
                      <span className="text-xs font-semibold px-2 py-1 rounded-md bg-blue-50 text-blue-600">{q.subject || 'No Subject'}</span>
                      <span className="text-xs font-semibold px-2 py-1 rounded-md bg-purple-50 text-purple-600">{q.difficulty || 'Medium'}</span>
                    </div>
                    <div className="prose prose-sm max-w-none text-gray-900 dark:text-white font-medium" dangerouslySetInnerHTML={{ __html: q.text }} />
                    {q.image && <img loading="lazy" src={q.image} alt="Question" className="mt-3 max-h-40 rounded-lg border border-gray-200 dark:border-gray-700" />}
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleOpenModal(q)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => handleDeleteQuestion(q.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 text-sm">
                  <div className={`p-3 rounded-xl border \${q.correctAnswer === 'A' ? 'bg-green-50 border-green-200 font-medium text-green-800' : 'bg-gray-50 dark:bg-[#151521] border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-400'}`}>
                    <span className="font-bold mr-2">A)</span> {q.optionA}
                  </div>
                  <div className={`p-3 rounded-xl border \${q.correctAnswer === 'B' ? 'bg-green-50 border-green-200 font-medium text-green-800' : 'bg-gray-50 dark:bg-[#151521] border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-400'}`}>
                    <span className="font-bold mr-2">B)</span> {q.optionB}
                  </div>
                  <div className={`p-3 rounded-xl border \${q.correctAnswer === 'C' ? 'bg-green-50 border-green-200 font-medium text-green-800' : 'bg-gray-50 dark:bg-[#151521] border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-400'}`}>
                    <span className="font-bold mr-2">C)</span> {q.optionC}
                  </div>
                  <div className={`p-3 rounded-xl border \${q.correctAnswer === 'D' ? 'bg-green-50 border-green-200 font-medium text-green-800' : 'bg-gray-50 dark:bg-[#151521] border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-400'}`}>
                    <span className="font-bold mr-2">D)</span> {q.optionD}
                  </div>
                </div>
                
                {q.explanation && (
                  <div className="mt-4 p-4 bg-yellow-50 rounded-xl border border-yellow-100">
                    <span className="text-xs font-bold text-yellow-800 uppercase tracking-wider mb-1 block">Explanation</span>
                    <div className="prose prose-sm text-yellow-900 max-w-none" dangerouslySetInnerHTML={{ __html: q.explanation }} />
                  </div>
                )}
                
                <div className="mt-4 flex items-center gap-4 text-xs font-medium text-gray-500 dark:text-gray-400">
                  <span>Marks: {q.marks}</span>
                  <span>Negative: {q.negativeMarks}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center text-gray-500 dark:text-gray-400">
            {searchTerm ? 'No questions found matching your search.' : 'No questions added yet. Click "Add Question" to start.'}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1E1E2D] flex justify-center gap-2">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-8 h-8 rounded-lg text-sm font-bold flex items-center justify-center transition-colors \${currentPage === i + 1 ? 'bg-[#5B5FFB] text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200'}`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/60 dark:bg-gray-900/80 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E1E2D] rounded-2xl shadow-xl w-full max-w-4xl max-h-[95vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between shrink-0">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{editingQuestionId ? 'Edit Question' : 'Add Question'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="overflow-y-auto flex-1 p-6 space-y-6">
              <form id="question-form" onSubmit={handleSaveQuestion} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Question Text *</label>
                  <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                    <ReactQuill theme="snow" value={formData.text} onChange={val => setFormData({...formData, text: val})} modules={modules} className="bg-white dark:bg-[#1E1E2D] h-40 [&_.ql-toolbar]:border-none [&_.ql-toolbar]:bg-gray-50 dark:bg-[#151521] [&_.ql-container]:border-none [&_.ql-container]:text-base" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-8">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Option A *</label>
                    <input type="text" required value={formData.optionA} onChange={e => setFormData({...formData, optionA: e.target.value})} className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-[#5B5FFB]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Option B *</label>
                    <input type="text" required value={formData.optionB} onChange={e => setFormData({...formData, optionB: e.target.value})} className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-[#5B5FFB]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Option C *</label>
                    <input type="text" required value={formData.optionC} onChange={e => setFormData({...formData, optionC: e.target.value})} className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-[#5B5FFB]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Option D *</label>
                    <input type="text" required value={formData.optionD} onChange={e => setFormData({...formData, optionD: e.target.value})} className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-[#5B5FFB]" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-gray-100 dark:border-gray-800">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Correct Answer *</label>
                    <select value={formData.correctAnswer} onChange={e => setFormData({...formData, correctAnswer: e.target.value})} className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-[#5B5FFB] bg-white dark:bg-[#1E1E2D]">
                      <option value="A">Option A</option>
                      <option value="B">Option B</option>
                      <option value="C">Option C</option>
                      <option value="D">Option D</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Difficulty</label>
                    <select value={formData.difficulty} onChange={e => setFormData({...formData, difficulty: e.target.value})} className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-[#5B5FFB] bg-white dark:bg-[#1E1E2D]">
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject / Section</label>
                    <input type="text" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-[#5B5FFB]" placeholder="e.g. Mathematics" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Topic</label>
                    <input type="text" value={formData.topic} onChange={e => setFormData({...formData, topic: e.target.value})} className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-[#5B5FFB]" placeholder="e.g. Algebra" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Marks *</label>
                    <input type="number" step="0.5" required value={formData.marks} onChange={e => setFormData({...formData, marks: Number(e.target.value)})} className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-[#5B5FFB]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Negative Marks</label>
                    <input type="number" step="0.1" value={formData.negativeMarks} onChange={e => setFormData({...formData, negativeMarks: Number(e.target.value)})} className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-[#5B5FFB]" />
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Detailed Explanation</label>
                  <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                    <ReactQuill theme="snow" value={formData.explanation} onChange={val => setFormData({...formData, explanation: val})} modules={modules} className="bg-white dark:bg-[#1E1E2D] h-32 [&_.ql-toolbar]:border-none [&_.ql-toolbar]:bg-gray-50 dark:bg-[#151521] [&_.ql-container]:border-none [&_.ql-container]:text-sm" />
                  </div>
                </div>

                <div className="pt-8 pb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Question Image (Optional)</label>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-[#5B5FFB] hover:bg-blue-50 transition-colors">
                      <ImageIcon className="w-5 h-5 text-gray-400" />
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Choose Image</span>
                      <input type="file" accept=".png,.jpg,.jpeg,.svg" onChange={e => setImageFile(e.target.files ? e.target.files[0] : null)} className="hidden" />
                    </label>
                    {imageFile && <span className="text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">{imageFile.name}</span>}
                    {!imageFile && formData.image && <span className="text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full">Current Image Uploaded</span>}
                  </div>
                </div>
              </form>
            </div>
            
            <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-[#151521] rounded-b-2xl flex justify-end gap-3 shrink-0">
              <button onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1E1E2D] text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm">Cancel</button>
              <button type="submit" form="question-form" disabled={saving} className="px-8 py-2.5 rounded-xl bg-[#5B5FFB] text-white font-bold hover:bg-[#4A4DE0] disabled:opacity-70 transition-colors flex items-center justify-center gap-2 text-sm shadow-sm">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} {editingQuestionId ? 'Update Question' : 'Save Question'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
