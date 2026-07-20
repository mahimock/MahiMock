import React, { useState } from 'react';
import { 
  BrainCircuit, 
  Upload, 
  Loader2, 
  CheckCircle, 
  AlertCircle, 
  FileText, 
  Save, 
  Trash2, 
  Plus, 
  Download,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { db } from '../../firebase';
import { collection, addDoc, writeBatch, doc } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'motion/react';
import Papa from 'papaparse';

interface Question {
  question: string;
  options: string[];
  correctOption: number;
  explanation: string;
}

export default function AIQuestionGenerator() {
  const [inputText, setInputText] = useState('');
  const [count, setCount] = useState(5);
  const [difficulty, setDifficulty] = useState('Medium');
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [saving, setSaving] = useState(false);

  const generateQuestions = async () => {
    if (!inputText.trim()) {
      toast.error('Please enter some text to generate questions from.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/ai/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText, count, difficulty }),
      });

      if (!response.ok) throw new Error('Failed to generate questions');
      const data = await response.json();
      setQuestions(data);
      toast.success(`Generated ${data.length} questions!`);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToFirestore = async () => {
    if (questions.length === 0) return;
    setSaving(true);
    try {
      const batch = writeBatch(db);
      questions.forEach((q) => {
        const newRef = doc(collection(db, 'questionBank'));
        batch.set(newRef, {
          text: q.question,
          optionA: q.options[0],
          optionB: q.options[1],
          optionC: q.options[2],
          optionD: q.options[3],
          correctAnswer: String.fromCharCode(65 + q.correctOption), // 0 -> A, 1 -> B, etc.
          explanation: q.explanation,
          status: 'Draft',
          createdAt: new Date().getTime(),
          source: 'AI Generator',
          difficulty: difficulty,
          marks: 2,
          negativeMarks: 0.5
        });
      });
      await batch.commit();
      toast.success('All questions saved to Question Bank!');
      setQuestions([]);
    } catch (error: any) {
      toast.error('Failed to save questions');
    } finally {
      setSaving(false);
    }
  };

  const exportToCSV = () => {
    const csv = Papa.unparse(questions.map(q => ({
      Question: q.question,
      Option1: q.options[0],
      Option2: q.options[1],
      Option3: q.options[2],
      Option4: q.options[3],
      CorrectIndex: q.correctOption,
      Explanation: q.explanation
    })));
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `MahiMock_AI_Questions_${new Date().getTime()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const deleteQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  return (
    <div className="p-6 sm:p-8 bg-[#F8FAFC] min-h-screen">
      <header className="mb-8">
         <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center text-gray-900 dark:text-white shadow-lg shadow-purple-600/20">
              <Sparkles className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">AI Question Generator</h1>
         </div>
         <p className="text-gray-500">Extract knowledge from your notes and generate exam-ready MCQs in seconds.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Input Panel */}
        <div className="lg:col-span-5 space-y-6">
           <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <label className="block text-sm font-bold text-gray-700 mb-2">Input Content</label>
              <textarea 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Paste book text, notes, or any educational content here..."
                className="w-full h-80 p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-purple-600 focus:bg-white transition-all outline-none resize-none text-sm"
              />
              
              <div className="grid grid-cols-2 gap-4 mt-6">
                 <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Question Count</label>
                    <select 
                      value={count} 
                      onChange={(e) => setCount(Number(e.target.value))}
                      className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl font-bold text-gray-700 outline-none"
                    >
                      <option value={5}>5 Questions</option>
                      <option value={10}>10 Questions</option>
                      <option value={20}>20 Questions</option>
                    </select>
                 </div>
                 <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Difficulty</label>
                    <select 
                      value={difficulty} 
                      onChange={(e) => setDifficulty(e.target.value)}
                      className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl font-bold text-gray-700 outline-none"
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                 </div>
              </div>

              <button 
                onClick={generateQuestions}
                disabled={loading}
                className="w-full mt-8 py-4 bg-purple-600 text-gray-900 dark:text-white font-bold rounded-2xl shadow-xl shadow-purple-600/20 hover:bg-purple-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
                {loading ? 'Generating...' : 'Generate Questions'}
              </button>
           </div>
           
           <div className="bg-blue-50 border border-blue-100 p-6 rounded-3xl">
              <div className="flex gap-4">
                 <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shrink-0 shadow-sm">
                   <AlertCircle className="w-5 h-5" />
                 </div>
                 <div>
                   <h4 className="font-bold text-blue-900 text-sm mb-1">Pro Tip</h4>
                   <p className="text-xs text-blue-700 leading-relaxed font-medium">For best results, provide structured text like chapters or detailed notes. Avoid very short sentences or purely factual lists.</p>
                 </div>
              </div>
           </div>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-7">
           <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full min-h-[600px]">
              <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                 <h3 className="font-bold text-gray-900">Generated Results ({questions.length})</h3>
                 <div className="flex gap-2">
                    {questions.length > 0 && (
                      <>
                        <button 
                          onClick={exportToCSV}
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Export to CSV"
                        >
                          <Download className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={handleSaveToFirestore}
                          disabled={saving}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-gray-900 dark:text-white font-bold rounded-xl hover:bg-green-700 transition-all disabled:opacity-50 shadow-lg shadow-green-600/10"
                        >
                          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                          Save All
                        </button>
                      </>
                    )}
                 </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                 <AnimatePresence mode="popLayout">
                   {questions.length === 0 ? (
                     <div className="h-full flex flex-col items-center justify-center text-center py-20">
                        <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-200 mb-4">
                          <BrainCircuit className="w-8 h-8" />
                        </div>
                        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No questions generated yet</p>
                     </div>
                   ) : (
                     questions.map((q, idx) => (
                       <motion.div 
                         key={idx}
                         initial={{ opacity: 0, y: 10 }}
                         animate={{ opacity: 1, y: 0 }}
                         exit={{ opacity: 0, x: -20 }}
                         className="p-5 bg-gray-50 rounded-2xl border border-gray-100 relative group"
                       >
                          <button 
                            onClick={() => deleteQuestion(idx)}
                            className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          
                          <div className="flex gap-3 mb-4">
                             <span className="w-6 h-6 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center text-xs font-black shrink-0">{idx + 1}</span>
                             <h4 className="font-bold text-gray-900 leading-relaxed pr-6">{q.question}</h4>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                             {q.options.map((opt, i) => (
                               <div key={i} className={`p-3 rounded-xl border text-sm font-medium ${i === q.correctOption ? 'bg-green-50 border-green-200 text-green-700' : 'bg-white border-gray-200 text-gray-600'}`}>
                                  {String.fromCharCode(65 + i)}. {opt}
                               </div>
                             ))}
                          </div>
                          
                          <div className="bg-white/50 p-4 rounded-xl border border-gray-100">
                             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                               <CheckCircle className="w-3 h-3" /> Explanation
                             </p>
                             <p className="text-xs text-gray-500 font-medium leading-relaxed">{q.explanation}</p>
                          </div>
                       </motion.div>
                     ))
                   )}
                 </AnimatePresence>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
