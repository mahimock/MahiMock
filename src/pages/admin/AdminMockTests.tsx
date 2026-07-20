import React, { useState, useEffect } from 'react';
import { collection, addDoc, setDoc, updateDoc, deleteDoc, doc, onSnapshot, query, where, writeBatch, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { Plus, Edit2, Trash2, X, Loader2, ChevronRight, LayoutGrid, FileQuestion, PlusCircle, Save, FolderOpen, BookOpen, Layers } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import { UploadCloud, Download, FileText, Settings } from 'lucide-react';
import AdminQuestionManager from './AdminQuestionManager';

export default function AdminMockTests() {
  const [view, setView] = useState<'categories' | 'exams' | 'testTypes' | 'subjects' | 'chapters' | 'tests'>('categories');
  const [selectedSubject, setSelectedSubject] = useState<any>(null);
  const [selectedChapter, setSelectedChapter] = useState<any>(null);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [chapters, setChapters] = useState<any[]>([]);
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [isChapterModalOpen, setIsChapterModalOpen] = useState(false);
  const [subjectFormData, setSubjectFormData] = useState({ name: '', displayOrder: 0 });
  const [chapterFormData, setChapterFormData] = useState({ name: '', displayOrder: 0 });
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [selectedExam, setSelectedExam] = useState<any>(null);
  const [selectedTestType, setSelectedTestType] = useState<string>('');
  const [selectedTest, setSelectedTest] = useState<any>(null);

  const [categories, setCategories] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [tests, setTests] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTestId, setEditingTestId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Test form
  const [testFormData, setTestFormData] = useState({
    title: '',
    questionsCount: 100,
    marks: 1,
    negativeMarking: 0,
    showResultImmediately: true,
    language: 'Hindi',
    status: 'Draft'
  });

  // Questions Builder
  const [testQuestions, setTestQuestions] = useState<any[]>([]);
  const [entryMode, setEntryMode] = useState<'manual' | 'bulk'>('manual');
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [bulkProcessing, setBulkProcessing] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState({
    id: '',
    text: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctAnswer: 'A',
    explanation: '',
    marks: 1,
    negativeMarks: 0,
    image: '',
  });

  const navigate = useNavigate();

  // Fetch Categories
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'examCategories'), snap => {
      setCategories(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })).filter(c => c.id !== '_init'));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // Fetch Exams
  useEffect(() => {
    if (view === 'exams' && selectedCategory) {
      setLoading(true);
      const catName = selectedCategory.name || selectedCategory.category;
      const q = query(collection(db, 'exams'), where('category', '==', catName));
      const unsub = onSnapshot(q, snap => {
        setExams(snap.docs.map(d => ({id: d.id, ...d.data()})));
        setLoading(false);
      });
      return () => unsub();
    }
  }, [view, selectedCategory]);

  
  // Fetch Subjects
  useEffect(() => {
    if (view === 'subjects' && selectedExam) {
      setLoading(true);
      const q = query(collection(db, 'subjects'), where('examId', '==', selectedExam.id));
      const unsub = onSnapshot(q, snap => {
        setSubjects(snap.docs.map(d => ({id: d.id, ...d.data()})));
        setLoading(false);
      });
      return () => unsub();
    }
  }, [view, selectedExam]);

  // Fetch Chapters
  useEffect(() => {
    if (view === 'chapters' && selectedSubject) {
      setLoading(true);
      const q = query(collection(db, 'chapters'), where('subjectId', '==', selectedSubject.id));
      const unsub = onSnapshot(q, snap => {
        setChapters(snap.docs.map(d => ({id: d.id, ...d.data()})));
        setLoading(false);
      });
      return () => unsub();
    }
  }, [view, selectedSubject]);

  // Fetch Tests
  useEffect(() => {
    if (view === 'tests' && selectedCategory && selectedExam && selectedTestType) {
      setLoading(true);
      const catName = selectedCategory.name || selectedCategory.category;
      const typeCollection = selectedTestType;
      let q;
      if (selectedTestType === 'Topic Tests' && selectedChapter) {
        q = query(collection(db, 'tests'), where('chapterId', '==', selectedChapter.id), where('type', '==', selectedTestType));
      } else {
        q = query(collection(db, 'tests'), where('examId', '==', selectedExam.id), where('type', '==', selectedTestType));
      }
      const unsub = onSnapshot(q, snap => {
        setTests(snap.docs.map(d => ({id: d.id, ...d.data()})));
        setLoading(false);
      });
      return () => unsub();
    }
  }, [view, selectedCategory, selectedExam, selectedTestType, selectedChapter]);

  const resetQuestionForm = () => {
    setCurrentQuestion({
      id: '',
      text: '',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correctAnswer: 'A',
      explanation: '',
      marks: 2,
      negativeMarks: 0.5,
      image: '',
    });
    setEditingQuestionId(null);
  };

  
  const handleBulkImport = async () => {
    if (!bulkFile) return toast.error('Please select an Excel or CSV file');
    setBulkProcessing(true);
    try {
      const buffer = await bulkFile.arrayBuffer();
      const wb = XLSX.read(new Uint8Array(buffer), { type: 'array' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];
      
      console.log('Raw Rows Parsed:', rows);

      if (rows.length === 0) {
        toast.error('File is empty');
        return;
      }

      // Identify Header Row & Mappings
      let headerIdx = -1;
      let mappings: any = {
        question: 1, // Default Column B (0-indexed)
        optionA: 2,  // Default Column C
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

      console.log('Mapping Strategy:', mappings);

      // Check first few rows for recognizable headers
      for (let i = 0; i < Math.min(rows.length, 5); i++) {
        const row = rows[i].map(c => String(c || '').trim().toLowerCase());
        if (row.some(c => c.includes('question') || c.includes('option a') || c.includes('correct answer'))) {
          console.log('Found Header Row at index:', i);
          headerIdx = i;
          row.forEach((cell, cellIdx) => {
            const c = cell.toLowerCase();
            if (c.includes('question') || c === 'text') mappings.question = cellIdx;
            if (c.includes('option a') || c === 'optiona') mappings.optionA = cellIdx;
            if (c.includes('option b') || c === 'optionb') mappings.optionB = cellIdx;
            if (c.includes('option c') || c === 'optionc') mappings.optionC = cellIdx;
            if (c.includes('option d') || c === 'optiond') mappings.optionD = cellIdx;
            if (c.includes('correct answer') || c === 'answer' || c === 'correct') mappings.correctAnswer = cellIdx;
            if (c.includes('explanation')) mappings.explanation = cellIdx;
            if (c.includes('subject')) mappings.subject = cellIdx;
            if (c.includes('difficulty')) mappings.difficulty = cellIdx;
            if (c.includes('marks')) mappings.marks = cellIdx;
            if (c.includes('negative')) mappings.negativeMarks = cellIdx;
          });
          break;
        }
      }

      const importedQs: any[] = [];
      const errors: string[] = [];
      const startRow = headerIdx + 1;

      for (let i = startRow; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.length === 0) continue;
        
        // Skip empty rows
        const isRowEmpty = row.every(cell => cell === null || cell === undefined || String(cell).trim() === '');
        if (isRowEmpty) continue;

        const text = row[mappings.question];
        const optionA = row[mappings.optionA];
        const optionB = row[mappings.optionB];
        const optionC = row[mappings.optionC];
        const optionD = row[mappings.optionD];
        const rawAnswer = row[mappings.correctAnswer];

        if (!text || !optionA || !optionB || !optionC || !optionD || !rawAnswer) {
          if (headerIdx !== -1 || i > 0) {
            errors.push(`Row ${i + 1}: Missing required fields.`);
          }
          continue;
        }

        let cleanCorrectAnswer = String(rawAnswer).trim().toUpperCase();
        if (cleanCorrectAnswer.startsWith('OPTION ')) {
          cleanCorrectAnswer = cleanCorrectAnswer.replace('OPTION ', '');
        }

        if (!['A', 'B', 'C', 'D'].includes(cleanCorrectAnswer)) {
          if (headerIdx === -1 && i === 0) continue;
          errors.push(`Row ${i + 1}: Invalid Correct Answer "${rawAnswer}" (must be A, B, C, or D).`);
          continue;
        }

        importedQs.push({
          id: Date.now().toString() + Math.random().toString() + i,
          text: String(text).trim(),
          optionA: String(optionA).trim(),
          optionB: String(optionB).trim(),
          optionC: String(optionC).trim(),
          optionD: String(optionD).trim(),
          correctAnswer: cleanCorrectAnswer,
          explanation: String(row[mappings.explanation] || '').trim(),
          marks: parseFloat(String(row[mappings.marks] || '1')) || 1,
          negativeMarks: parseFloat(String(row[mappings.negativeMarks] || testFormData.negativeMarking || '0')) || 0,
          difficulty: String(row[mappings.difficulty] || 'Medium').trim() || 'Medium',
          subject: String(row[mappings.subject] || 'General').trim() || 'General',
          topic: '',
          image: '',
        });
      }

      if (errors.length > 0) {
        console.error('Import Errors:', errors);
        toast.error(errors[0] + (errors.length > 1 ? ` (and ${errors.length - 1} more errors)` : ''), { duration: 6000 });
      }

      if (importedQs.length === 0) {
        toast.error('No valid questions found. Ensure columns match: Question, Option A, Option B, Option C, Option D, Correct Answer', { duration: 8000 });
      } else {
        setTestQuestions(prev => [...prev, ...importedQs]);
        toast.success(`Successfully imported ${importedQs.length} questions`);
        setBulkFile(null);
      }
    } catch (error: any) {
      console.error('Bulk Import Error:', error);
      toast.error(`Error importing questions: ${error.message || 'Check file format.'}`);
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
      'Marks': 1,
      'Negative Marks': 0,
      'Image': ''
    }]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Questions');
    XLSX.writeFile(wb, 'Questions_Template.xlsx');
  };

  const handleSaveQuestion = () => {
    if (!currentQuestion.text || !currentQuestion.optionA || !currentQuestion.optionB || !currentQuestion.optionC || !currentQuestion.optionD) {
      toast.error('Please fill all required fields for the question.');
      return;
    }
    
    if (editingQuestionId) {
      setTestQuestions(prev => prev.map(q => q.id === editingQuestionId ? { ...currentQuestion } : q));
      toast.success('Question updated.');
    } else {
      setTestQuestions(prev => [...prev, { ...currentQuestion, id: Date.now().toString() }]);
      toast.success('Question added to test.');
    }
  };

  const handleAddNextQuestion = () => {
    handleSaveQuestion();
    if (currentQuestion.text && currentQuestion.optionA && currentQuestion.optionB && currentQuestion.optionC && currentQuestion.optionD) {
      resetQuestionForm();
    }
  };

  const handleEditQuestion = (q: any) => {
    setCurrentQuestion(q);
    setEditingQuestionId(q.id);
  };

  const handleDeleteQuestion = (id: string) => {
    setTestQuestions(prev => prev.filter(q => q.id !== id));
    if (editingQuestionId === id) resetQuestionForm();
  };

  const openAddTestModal = () => {
    setEditingTestId(null);
    setTestFormData({
      title: '',
      questionsCount: 100,
      marks: 200,
      durationMinutes: 60,
      negativeMarking: 0.50,
      showResultImmediately: true,
      language: 'Hindi',
      status: 'Draft'
    });
    setTestQuestions([]);
    resetQuestionForm();
    setIsModalOpen(true);
  };

  const openEditTestModal = (test: any) => {
    setEditingTestId(test.id);
    setTestFormData({
      title: test.title || '',
      questionsCount: test.questionsCount || 100,
      marks: test.marks || 200,
      durationMinutes: test.durationMinutes || 60,
      negativeMarking: test.negativeMarking || 0.50,
      showResultImmediately: test.showResultImmediately ?? true,
      language: test.language || 'Hindi',
      status: test.status || 'Draft'
    });
    setTestQuestions([]);
    resetQuestionForm();
    setIsModalOpen(true);
  };

  const handleSaveTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTestId && testQuestions.length === 0) {
      toast.error('Please add at least one question before saving.');
      return;
    }
    setSaving(true);
    try {
      if (editingTestId) {
        const testRef = doc(db, 'tests', editingTestId);
        // Recalculate marks from questions if we have them
        const finalMarks = testQuestions.length > 0 
          ? testQuestions.reduce((sum, q) => sum + (Number(q.marks) || 1), 0)
          : testFormData.marks;

        await updateDoc(testRef, {
          ...testFormData,
          marks: finalMarks,
          updatedAt: Date.now()
        });
        toast.success('Test updated successfully!');
      } else {
        const testRef = doc(collection(db, 'tests'));
        
        await setDoc(testRef, {
          ...testFormData,
          examId: selectedExam.id,
          categoryId: selectedCategory.id,
          subjectId: selectedSubject ? selectedSubject.id : null,
          chapterId: selectedChapter ? selectedChapter.id : null,
          type: selectedTestType,
          questionsCount: testQuestions.length,
          marks: testQuestions.reduce((sum, q) => sum + (Number(q.marks) || 1), 0),
          createdAt: Date.now()
        });

        const batch = writeBatch(db);
        testQuestions.forEach((q, idx) => {
          const qRef = doc(collection(testRef, 'Questions'));
          const { id, ...qData } = q;
          batch.set(qRef, { ...qData, order: idx + 1 });
        });
        await batch.commit();

        toast.success('Test and Questions saved successfully!');
      }
      setIsModalOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to save test');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTest = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this test?')) {
      try {
        const testRef = doc(db, 'tests', id);
        
        // Delete subcollection questions
        const qSnap = await getDocs(collection(testRef, 'Questions'));
        const batch = writeBatch(db);
        qSnap.forEach(d => batch.delete(d.ref));
        await batch.commit();

        // Delete test doc
        await deleteDoc(testRef);
        toast.success('Test deleted successfully');
      } catch (error) {
        toast.error('Failed to delete test');
      }
    }
  };

  if (loading && view === 'categories') {
    return <div className="flex items-center justify-center h-[60vh]"><Loader2 className="w-8 h-8 animate-spin text-[#5B5FFB]" /></div>;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-6 flex-wrap">
        <button onClick={() => setView('categories')} className="hover:text-[#5B5FFB] font-medium transition-colors">Exams Dashboard</button>
        {selectedCategory && (
          <>
            <ChevronRight className="w-4 h-4" />
            <button onClick={() => setView('exams')} className={`hover:text-[#5B5FFB] font-medium transition-colors ${view === 'exams' ? 'text-[#5B5FFB]' : ''}`}>
              {selectedCategory.name || selectedCategory.category}
            </button>
          </>
        )}
        {selectedExam && (
          <>
            <ChevronRight className="w-4 h-4" />
            <button onClick={() => setView('testTypes')} className={`hover:text-[#5B5FFB] font-medium transition-colors ${view === 'testTypes' ? 'text-[#5B5FFB]' : ''}`}>
              {selectedExam.examName}
            </button>
          </>
        )}
        {view === 'tests' && selectedTestType && (
          <>
            <ChevronRight className="w-4 h-4" />
            <button onClick={() => { if(selectedTestType === 'Topic Tests') setView('subjects'); else setView('tests'); }} className={`hover:text-[#5B5FFB] font-medium transition-colors ${(view === 'tests' && selectedTestType !== 'Topic Tests') || view === 'subjects' ? 'text-[#5B5FFB] font-bold' : ''}`}>
              {selectedTestType}
            </button>
          </>
        )}
        {selectedTestType === 'Topic Tests' && selectedSubject && (view === 'chapters' || view === 'tests') && (
          <>
            <ChevronRight className="w-4 h-4" />
            <button onClick={() => setView('chapters')} className={`hover:text-[#5B5FFB] font-medium transition-colors ${view === 'chapters' ? 'text-[#5B5FFB] font-bold' : ''}`}>
              {selectedSubject.name}
            </button>
          </>
        )}
        {selectedTestType === 'Topic Tests' && selectedChapter && view === 'tests' && (
          <>
            <ChevronRight className="w-4 h-4" />
            <button onClick={() => setView('tests')} className={`hover:text-[#5B5FFB] font-medium transition-colors ${view === 'tests' ? 'text-[#5B5FFB] font-bold' : ''}`}>
              {selectedChapter.name}
            </button>
          </>
        )}
        {view === 'questions' && selectedTest && (
          <>
            <ChevronRight className="w-4 h-4" />
            <span className="text-[#5B5FFB] font-bold">{selectedTest.title} Questions</span>
          </>
        )}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-[60px] lg:top-20 z-40 bg-[#F8FAFC] dark:bg-[#151521] py-4 -mx-4 px-4 sm:mx-0 sm:px-0 sm:bg-transparent dark:sm:bg-transparent">
        <div>
          <h1 className="text-2xl font-bold text-gray-900  dark:text-white">
            {view === 'categories' && 'Select Category'}
            {view === 'exams' && 'Select Exam'}
            {view === 'testTypes' && 'Select Test Type'}
            {view === 'subjects' && 'Select Subject'}
            {view === 'chapters' && 'Select Chapter'}
            {view === 'tests' && selectedTestType}
            {view === 'questions' && 'Manage Questions'}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage tests and hierarchy efficiently.</p>
        </div>
        {view === 'tests' && selectedTestType && (
          <div className="flex gap-2">
            <button 
              onClick={openAddTestModal}
              className="hidden sm:flex bg-[#5B5FFB] hover:bg-[#4A4DE0] text-white px-5 py-2.5 rounded-xl text-sm font-semibold items-center gap-2 transition-colors shadow-sm"
            >
              <Plus className="w-5 h-5" /> {selectedTestType === 'Full Mock Tests' ? 'Add Full Mock Test' : 'Add Test'}
            </button>
            <button 
              onClick={openAddTestModal}
              className="sm:hidden fixed bottom-24 right-6 z-[50] flex items-center justify-center gap-2 bg-[#5B5FFB] text-white px-5 py-3.5 rounded-full shadow-2xl hover:bg-[#4A4DE0] transition-all text-sm font-bold border-2 border-white"
            >
              <Plus className="w-5 h-5" /> {selectedTestType === 'Full Mock Tests' ? 'Add Full Mock Test' : 'Add Test'}
            </button>
          </div>
        )}
      </div>

      {/* Categories View */}
      {view === 'categories' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map(cat => (
            <div 
              key={cat.id} 
              onClick={() => { setSelectedCategory(cat); setView('exams'); }}
              className="bg-white dark:bg-[#1E1E2D] p-6 rounded-2xl border border-gray-100 dark:border-[#3A3A4D] hover:border-[#5B5FFB] hover:shadow-md transition-all cursor-pointer group flex items-center gap-4"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                <FolderOpen className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900  dark:text-white">{cat.name || cat.category}</h3>
              </div>
            </div>
          ))}
          {categories.length === 0 && !loading && (
            <div className="col-span-full p-12 text-center text-gray-500 dark:text-gray-400 bg-white dark:bg-[#1E1E2D] rounded-2xl border border-gray-100 dark:border-[#3A3A4D]">
              No categories found. Create some in the Categories section.
            </div>
          )}
        </div>
      )}

      {/* Exams View */}
      {view === 'exams' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {exams.map(exam => (
            <div 
              key={exam.id} 
              onClick={() => { setSelectedExam(exam); setView('testTypes'); }}
              className="bg-white dark:bg-[#1E1E2D] p-6 rounded-2xl border border-gray-100 dark:border-[#3A3A4D] hover:border-[#5B5FFB] hover:shadow-md transition-all cursor-pointer group flex items-center gap-4"
            >
              <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
                <LayoutGrid className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900  dark:text-white">{exam.examName}</h3>
              </div>
            </div>
          ))}
          {exams.length === 0 && !loading && (
            <div className="col-span-full p-12 text-center text-gray-500 dark:text-gray-400 bg-white dark:bg-[#1E1E2D] rounded-2xl border border-gray-100 dark:border-[#3A3A4D]">
              No exams found for this category.
            </div>
          )}
        </div>
      )}

      {/* Test Types View */}
      {view === 'testTypes' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {['Full Mock Tests', 'Previous Year Papers', 'Topic Tests', 'Sectional Tests'].map(type => (
            <div 
              key={type} 
              onClick={() => { setSelectedTestType(type); if(type === 'Topic Tests' || type === 'Sectional Tests') setView('subjects'); else setView('tests'); }}
              className="bg-white dark:bg-[#1E1E2D] p-6 rounded-2xl border border-gray-100 dark:border-[#3A3A4D] hover:border-[#5B5FFB] hover:shadow-md transition-all cursor-pointer group flex items-center gap-4"
            >
              <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-600 group-hover:scale-110 transition-transform">
                <FileQuestion className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900  dark:text-white">{type}</h3>
              </div>
            </div>
          ))}
        </div>
      )}

      
      {/* Subjects View */}
      {view === 'subjects' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map(subject => (
            <div 
              key={subject.id} 
              onClick={() => { setSelectedSubject(subject); setView('chapters'); }}
              className="bg-white dark:bg-[#1E1E2D] p-6 rounded-2xl border border-gray-100 dark:border-[#3A3A4D] hover:border-[#5B5FFB] hover:shadow-md transition-all cursor-pointer group flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white">{subject.name}</h3>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-[#5B5FFB] transition-colors" />
            </div>
          ))}
          {subjects.length === 0 && !loading && (
            <div className="col-span-full p-12 text-center text-gray-500 dark:text-gray-400 bg-white dark:bg-[#1E1E2D] rounded-2xl border border-gray-100 dark:border-[#3A3A4D]">
              No subjects found. Click "Add Subject" to create one.
            </div>
          )}
        </div>
      )}

      {/* Chapters View */}
      {view === 'chapters' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {chapters.map(chapter => (
            <div 
              key={chapter.id} 
              onClick={() => { setSelectedChapter(chapter); setView('tests'); }}
              className="bg-white dark:bg-[#1E1E2D] p-6 rounded-2xl border border-gray-100 dark:border-[#3A3A4D] hover:border-[#5B5FFB] hover:shadow-md transition-all cursor-pointer group flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                  <Layers className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white">{chapter.name}</h3>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-[#5B5FFB] transition-colors" />
            </div>
          ))}
          {chapters.length === 0 && !loading && (
            <div className="col-span-full p-12 text-center text-gray-500 dark:text-gray-400 bg-white dark:bg-[#1E1E2D] rounded-2xl border border-gray-100 dark:border-[#3A3A4D]">
              No chapters found. Click "Add Chapter" to create one.
            </div>
          )}
        </div>
      )}

      {/* Tests View */}
      {view === 'tests' && (
        <div className="bg-white dark:bg-[#1E1E2D] rounded-2xl border border-gray-100 dark:border-[#3A3A4D] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-[#2A2A3D] border-b border-gray-100 dark:border-[#3A3A4D]">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Test Title</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Questions</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Marks</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Duration</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {tests.map(test => (
                  <tr key={test.id} className="hover:bg-gray-50 dark:bg-[#2A2A3D] transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-semibold text-gray-900 dark:text-white">{test.title}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{test.status}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">{test.questionsCount}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">{test.marks}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">{test.durationMinutes} mins</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEditTestModal(test)} className="p-2 bg-yellow-50 text-yellow-600 rounded-md hover:bg-yellow-100 transition-colors" title="Edit Test Metadata">
                          <Edit2 className="w-4 h-4" /> Edit
                        </button>
                        <button onClick={() => navigate(`/admin/tests/${test.id}/questions`)} className="p-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors" title="Manage Questions">
                          <Settings className="w-4 h-4" /> Manage Questions
                        </button>
                        <button onClick={() => handleDeleteTest(test.id)} className="p-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {tests.length === 0 && !loading && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                      No tests added yet. Click "Add Test" to create one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      
      {/* Subject Modal */}
      {isSubjectModalOpen && (
        <div className="fixed inset-0 bg-gray-900/60 dark:bg-gray-900/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E1E2D] rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 dark:border-[#3A3A4D] flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Add Subject</h3>
              <button onClick={() => setIsSubjectModalOpen(false)} className="p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-[#2A2A3D] rounded-full transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">Subject Name *</label>
                <input required type="text" value={subjectFormData.name} onChange={e => setSubjectFormData({...subjectFormData, name: e.target.value})} className="w-full border border-gray-200 dark:border-[#3A3A4D] rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-[#5B5FFB]" placeholder="e.g. Mathematics" />
              </div>
              <div className="mt-6 flex gap-3 justify-end">
                <button type="button" onClick={() => setIsSubjectModalOpen(false)} className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-[#2A2A3D] text-gray-700 dark:text-white font-semibold">Cancel</button>
                <button 
                  onClick={async () => {
                    if(!subjectFormData.name) return toast.error("Name required");
                    setSaving(true);
                    try {
                      await addDoc(collection(db, 'subjects'), { ...subjectFormData, examId: selectedExam.id, isActive: true });
                      toast.success("Subject Added");
                      setIsSubjectModalOpen(false);
                      setSubjectFormData({name: '', displayOrder: 0});
                    } catch(e) { toast.error("Error"); }
                    setSaving(false);
                  }} 
                  disabled={saving} className="px-4 py-2 rounded-xl bg-[#5B5FFB] text-white font-semibold flex items-center gap-2">
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />} Save Subject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chapter Modal */}
      {isChapterModalOpen && (
        <div className="fixed inset-0 bg-gray-900/60 dark:bg-gray-900/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E1E2D] rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 dark:border-[#3A3A4D] flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Add Chapter</h3>
              <button onClick={() => setIsChapterModalOpen(false)} className="p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-[#2A2A3D] rounded-full transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">Chapter Name *</label>
                <input required type="text" value={chapterFormData.name} onChange={e => setChapterFormData({...chapterFormData, name: e.target.value})} className="w-full border border-gray-200 dark:border-[#3A3A4D] rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-[#5B5FFB]" placeholder="e.g. Algebra" />
              </div>
              <div className="mt-6 flex gap-3 justify-end">
                <button type="button" onClick={() => setIsChapterModalOpen(false)} className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-[#2A2A3D] text-gray-700 dark:text-white font-semibold">Cancel</button>
                <button 
                  onClick={async () => {
                    if(!chapterFormData.name) return toast.error("Name required");
                    setSaving(true);
                    try {
                      await addDoc(collection(db, 'chapters'), { ...chapterFormData, examId: selectedExam.id, subjectId: selectedSubject.id });
                      toast.success("Chapter Added");
                      setIsChapterModalOpen(false);
                      setChapterFormData({name: '', displayOrder: 0});
                    } catch(e) { toast.error("Error"); }
                    setSaving(false);
                  }} 
                  disabled={saving} className="px-4 py-2 rounded-xl bg-[#5B5FFB] text-white font-semibold flex items-center gap-2">
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />} Save Chapter
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Test & Question Builder Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/60 dark:bg-gray-900/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E1E2D] rounded-2xl shadow-xl w-full max-w-5xl max-h-[98vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-[#3A3A4D] flex flex-col sm:flex-row sm:items-center justify-between shrink-0 bg-white dark:bg-[#1E1E2D] z-20 sticky top-0 rounded-t-2xl gap-4">
              <div className="flex items-center justify-between sm:w-auto sm:flex-1 min-w-0">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate">
                    {editingTestId ? 'Edit Test' : 'Add Test'}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">{selectedTestType} for {selectedExam?.examName} • {testQuestions.length} Qs</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="sm:hidden p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-[#2A2A3D] rounded-full transition-colors"><X className="w-5 h-5" /></button>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 shrink-0 w-full sm:w-auto">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#3A3A4D] text-gray-700 dark:text-white font-bold hover:bg-gray-50 dark:hover:bg-[#2A2A3D] transition-colors text-sm">Cancel</button>
                <button type="button" onClick={handleSaveTest} disabled={saving} className="flex-[2] sm:flex-none px-4 sm:px-6 py-2.5 rounded-xl bg-[#5B5FFB] text-white font-bold flex items-center justify-center gap-2 hover:bg-[#4A4DE0] disabled:opacity-70 transition-colors text-sm whitespace-nowrap shadow-sm">
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />} Save Test
                </button>
                <button onClick={() => setIsModalOpen(false)} className="hidden sm:block p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-[#2A2A3D] rounded-full transition-colors"><X className="w-5 h-5" /></button>
              </div>
            </div>
            
            <div className="overflow-y-auto flex-1 p-6 space-y-8 bg-gray-50 dark:bg-[#2A2A3D] min-h-0">
              
              {/* Test Details Section */}
              <div className="bg-white dark:bg-[#1E1E2D] p-6 rounded-2xl border border-gray-200 dark:border-[#3A3A4D] shadow-sm">
                <h4 className="text-lg font-bold text-gray-900  mb-4 border-b pb-2 dark:text-white">Test Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="lg:col-span-3">
                    <label className="block text-sm font-medium text-gray-700  mb-1 dark:text-white">Test Title</label>
                    <input type="text" value={testFormData.title} onChange={e => setTestFormData({...testFormData, title: e.target.value})} className="w-full border border-gray-200 dark:border-[#3A3A4D] rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-[#5B5FFB]" placeholder="e.g. SSC CGL Full Mock Test 1" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700  mb-1 dark:text-white">Total Questions (Auto)</label>
                    <input type="number" disabled value={testQuestions.length} className="w-full border border-gray-200 dark:border-[#3A3A4D] rounded-xl px-4 py-2.5 outline-none bg-gray-50  text-gray-500  cursor-not-allowed dark:bg-[#2A2A3D] dark:text-white dark:placeholder-[#B0B0B0]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700  mb-1 dark:text-white">Total Marks (Auto)</label>
                    <input type="number" disabled value={testQuestions.reduce((sum, q) => sum + (Number(q.marks) || 0), 0)} className="w-full border border-gray-200 dark:border-[#3A3A4D] rounded-xl px-4 py-2.5 outline-none bg-gray-50 dark:bg-[#2A2A3D] text-gray-500 dark:text-white cursor-not-allowed" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700  mb-1 dark:text-white">Duration (Minutes)</label>
                    <input type="number" value={testFormData.durationMinutes} onChange={e => setTestFormData({...testFormData, durationMinutes: Number(e.target.value)})} className="w-full border border-gray-200 dark:border-[#3A3A4D] rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-[#5B5FFB]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700  mb-1 dark:text-white">Negative Marking</label>
                    <input type="number" step="0.1" value={testFormData.negativeMarking} onChange={e => setTestFormData({...testFormData, negativeMarking: Number(e.target.value)})} className="w-full border border-gray-200 dark:border-[#3A3A4D] rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-[#5B5FFB]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700  mb-1 dark:text-white">Language</label>
                    <select value={testFormData.language} onChange={e => setTestFormData({...testFormData, language: e.target.value})} className="w-full border border-gray-200 dark:border-[#3A3A4D] rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-[#5B5FFB] bg-white dark:bg-[#1E1E2D]">
                      <option value="Hindi">Hindi</option>
                      <option value="English">English</option>
                      <option value="Bilingual">Bilingual (Hindi + English)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700  mb-1 dark:text-white">Show Result Immediately</label>
                    <select value={testFormData.showResultImmediately ? 'Yes' : 'No'} onChange={e => setTestFormData({...testFormData, showResultImmediately: e.target.value === 'Yes'})} className="w-full border border-gray-200 dark:border-[#3A3A4D] rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-[#5B5FFB] bg-white dark:bg-[#1E1E2D]">
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700  mb-1 dark:text-white">Status</label>
                    <select value={testFormData.status} onChange={e => setTestFormData({...testFormData, status: e.target.value})} className="w-full border border-gray-200 dark:border-[#3A3A4D] rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-[#5B5FFB] bg-white dark:bg-[#1E1E2D]">
                      <option value="Draft">Draft</option>
                      <option value="Published">Published</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Question Builder Section */}
              {!editingTestId && (
                <div className="bg-white dark:bg-[#1E1E2D] p-6 rounded-2xl border border-gray-200 dark:border-[#3A3A4D] shadow-sm">
                <div className="flex items-center justify-between mb-4 border-b pb-2">
                  <h4 className="text-lg font-bold text-gray-900  flex items-center gap-2 dark:text-white">
                    <FileQuestion className="w-5 h-5 text-[#5B5FFB]" /> 
                    Question Builder ({testQuestions.length} added)
                  </h4>
                  {editingQuestionId && (
                    <button onClick={resetQuestionForm} className="text-sm font-semibold text-blue-600 hover:underline">
                      + Add New Instead
                    </button>
                  )}
                </div>

                {/* Question Form Tabs */}
                <div className="flex gap-3 mb-4">
                  <button onClick={() => setEntryMode('manual')} className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${entryMode === 'manual' ? 'bg-[#5B5FFB] text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700'}`}>Manual Entry</button>
                  <button onClick={() => setEntryMode('bulk')} className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${entryMode === 'bulk' ? 'bg-[#5B5FFB] text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700'}`}>Bulk Import</button>
                </div>

                {entryMode === 'bulk' && (
                  <div className="space-y-6 mb-8 bg-blue-50/50 dark:bg-blue-900/10 p-6 rounded-xl border border-blue-100 dark:border-blue-900/50 text-center">
                    <div className="max-w-md mx-auto space-y-4">
                      <div className="p-8 border-2 border-dashed border-blue-200 dark:border-blue-800/50 rounded-xl bg-white dark:bg-[#1E1E2D] hover:bg-blue-50/30 dark:hover:bg-blue-900/20 transition-colors">
                        <UploadCloud className="w-10 h-10 text-blue-500 mx-auto mb-3" />
                        <h5 className="font-bold text-gray-800  mb-1 dark:text-white">Upload Questions File</h5>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Excel (.xlsx, .xls) or CSV files supported</p>
                        <input type="file" accept=".xlsx,.xls,.csv" onChange={(e) => setBulkFile(e.target.files ? e.target.files[0] : null)} className="w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 outline-none" />
                      </div>
                      <div className="flex gap-3">
                        <button onClick={handleDownloadTemplate} className="flex-1 py-2.5 bg-white dark:bg-[#1E1E2D] border border-gray-200 dark:border-[#3A3A4D] text-gray-700 dark:text-white rounded-xl text-sm font-bold hover:bg-gray-50 dark:bg-[#2A2A3D] transition-colors flex items-center justify-center gap-2 shadow-sm">
                          <Download className="w-4 h-4" /> Template
                        </button>
                        <button onClick={handleBulkImport} disabled={!bulkFile || bulkProcessing} className="flex-[2] py-2.5 bg-[#5B5FFB] text-white rounded-xl text-sm font-bold hover:bg-[#4A4DE0] transition-colors disabled:opacity-70 flex items-center justify-center gap-2 shadow-sm">
                          {bulkProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />} Import Questions
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {entryMode === 'manual' && (
                <div className="space-y-4 mb-8 bg-blue-50/50 p-4 sm:p-6 rounded-xl border border-blue-100">
                  <div>
                    <label className="block text-sm font-medium text-gray-700  mb-1 dark:text-white">Question *</label>
                    <textarea rows={2} value={currentQuestion.text} onChange={e => setCurrentQuestion({...currentQuestion, text: e.target.value})} className="w-full border border-gray-200 dark:border-[#3A3A4D] rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#5B5FFB] resize-none" placeholder="Type question here..." />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700  mb-1 dark:text-white">Question Image URL (Optional)</label>
                    <input type="text" value={currentQuestion.image} onChange={e => setCurrentQuestion({...currentQuestion, image: e.target.value})} className="w-full border border-gray-200 dark:border-[#3A3A4D] rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-[#5B5FFB]" placeholder="https://..." />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700  mb-1 dark:text-white">Option A *</label>
                      <input type="text" value={currentQuestion.optionA} onChange={e => setCurrentQuestion({...currentQuestion, optionA: e.target.value})} className="w-full border border-gray-200 dark:border-[#3A3A4D] rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-[#5B5FFB]" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700  mb-1 dark:text-white">Option B *</label>
                      <input type="text" value={currentQuestion.optionB} onChange={e => setCurrentQuestion({...currentQuestion, optionB: e.target.value})} className="w-full border border-gray-200 dark:border-[#3A3A4D] rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-[#5B5FFB]" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700  mb-1 dark:text-white">Option C *</label>
                      <input type="text" value={currentQuestion.optionC} onChange={e => setCurrentQuestion({...currentQuestion, optionC: e.target.value})} className="w-full border border-gray-200 dark:border-[#3A3A4D] rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-[#5B5FFB]" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700  mb-1 dark:text-white">Option D *</label>
                      <input type="text" value={currentQuestion.optionD} onChange={e => setCurrentQuestion({...currentQuestion, optionD: e.target.value})} className="w-full border border-gray-200 dark:border-[#3A3A4D] rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-[#5B5FFB]" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700  mb-1 dark:text-white">Correct Answer *</label>
                      <select value={currentQuestion.correctAnswer} onChange={e => setCurrentQuestion({...currentQuestion, correctAnswer: e.target.value})} className="w-full border border-gray-200 dark:border-[#3A3A4D] rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-[#5B5FFB] bg-white dark:bg-[#1E1E2D]">
                        <option value="A">Option A</option>
                        <option value="B">Option B</option>
                        <option value="C">Option C</option>
                        <option value="D">Option D</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700  mb-1 dark:text-white">Marks *</label>
                      <input type="number" step="0.5" value={currentQuestion.marks} onChange={e => setCurrentQuestion({...currentQuestion, marks: Number(e.target.value)})} className="w-full border border-gray-200 dark:border-[#3A3A4D] rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-[#5B5FFB]" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700  mb-1 dark:text-white">Negative Marks</label>
                      <input type="number" step="0.1" value={currentQuestion.negativeMarks} onChange={e => setCurrentQuestion({...currentQuestion, negativeMarks: Number(e.target.value)})} className="w-full border border-gray-200 dark:border-[#3A3A4D] rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-[#5B5FFB]" />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700  mb-1 dark:text-white">Explanation</label>
                    <textarea rows={2} value={currentQuestion.explanation} onChange={e => setCurrentQuestion({...currentQuestion, explanation: e.target.value})} className="w-full border border-gray-200 dark:border-[#3A3A4D] rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-[#5B5FFB] resize-none" placeholder="Provide solution/explanation..." />
                  </div>

                  <div className="flex flex-wrap gap-3 pt-2">
                    <button type="button" onClick={handleSaveQuestion} className="px-5 py-2 rounded-xl bg-gray-900 text-gray-900 dark:text-white font-semibold text-sm hover:bg-gray-800 transition-colors flex items-center gap-1.5">
                      <Save className="w-4 h-4" /> {editingQuestionId ? 'Update Question' : 'Save Question'}
                    </button>
                    {!editingQuestionId && (
                      <button type="button" onClick={handleAddNextQuestion} className="px-5 py-2 rounded-xl bg-[#5B5FFB] text-white font-semibold text-sm hover:bg-[#4A4DE0] transition-colors flex items-center gap-1.5">
                        <PlusCircle className="w-4 h-4" /> Add Next Question
                      </button>
                    )}
                  </div>
                </div>
                )}

                {/* Added Questions List */}
                {testQuestions.length > 0 && (
                  <div className="space-y-3">
                    <h5 className="font-bold text-gray-800  dark:text-white">Added Questions</h5>
                    {testQuestions.map((q, idx) => (
                      <div key={q.id} className="p-4 rounded-xl border border-gray-200 dark:border-[#3A3A4D] flex justify-between gap-4 group">
                        <div className="flex-1">
                          <p className="font-semibold text-sm text-gray-900 dark:text-white mb-1">Q{idx + 1}. {q.text}</p>
                          <div className="text-xs text-gray-500 dark:text-gray-400 grid grid-cols-2 gap-1 mb-2">
                            <span>A) {q.optionA}</span>
                            <span>B) {q.optionB}</span>
                            <span>C) {q.optionC}</span>
                            <span>D) {q.optionD}</span>
                          </div>
                          <span className="inline-block px-2 py-1 bg-green-50 text-green-700 text-xs font-bold rounded">Ans: {q.correctAnswer}</span>
                        </div>
                        <div className="flex flex-col gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleEditQuestion(q)} className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-md transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                          <button onClick={() => handleDeleteQuestion(q.id)} className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-md transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              )}
            </div>

            
          </div>
        </div>
      )}
    </div>
  );
}
