import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, doc, getDoc, addDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, Clock, ChevronLeft, ChevronRight, AlertCircle, LayoutGrid, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'motion/react';

interface Test {
  id: string;
  title: string;
  durationMinutes: number;
  showResultImmediately?: boolean;
  language?: 'Hindi' | 'English' | 'Bilingual';
  examId?: string;
  examName?: string;
}

interface Question {
  id: string;
  text: string;
  textHindi?: string;
  image?: string;
  optionA: string;
  optionAHindi?: string;
  optionAImage?: string;
  optionB: string;
  optionBHindi?: string;
  optionBImage?: string;
  optionC: string;
  optionCHindi?: string;
  optionCImage?: string;
  optionD: string;
  optionDHindi?: string;
  optionDImage?: string;
  correctAnswer: string;
  marks: number;
  negativeMarks: number;
}

export default function TakeTest() {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const { currentUser, isAdmin } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [test, setTest] = useState<Test | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({}); // questionId -> Option (A, B, C, D)
  const [markedForReview, setMarkedForReview] = useState<Record<string, boolean>>({});
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);
  const [showPalette, setShowPalette] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [lastSaved, setLastSaved] = useState<number | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<'English' | 'Hindi'>('English');

  // Fetch previous progress if any
  useEffect(() => {
    if (!testId || !currentUser) return;
    
    const fetchProgress = async () => {
      try {
        const docRef = doc(db, 'activeTests', `${currentUser.uid}_${testId}`);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.answers) setAnswers(data.answers);
          if (data.markedForReview) setMarkedForReview(data.markedForReview);
          // Don't override timeLeft from DB if it's already running, but could be useful
          if (data.timeLeft && data.timeLeft > 0) setTimeLeft(data.timeLeft);
        }
      } catch (err) {
        console.error('Error fetching progress:', err);
      }
    };
    fetchProgress();
  }, [testId, currentUser]);

  // Auto-save answers
  useEffect(() => {
    if (!testId || !currentUser || loading || submitting) return;

    const autoSave = async () => {
      try {
        const docRef = doc(db, 'activeTests', `${currentUser.uid}_${testId}`);
        await setDoc(docRef, {
          userId: currentUser.uid,
          testId: testId,
          answers: answers,
          markedForReview: markedForReview,
          timeLeft: timeLeft,
          updatedAt: Date.now()
        }, { merge: true });
        setLastSaved(Date.now());
      } catch (err) {
        console.error('Auto-save error:', err);
      }
    };

    const timer = setTimeout(autoSave, 5000); // Debounce auto-save
    return () => clearTimeout(timer);
  }, [answers, markedForReview, testId, currentUser, loading, submitting]);

  useEffect(() => {
    if (!testId || !currentUser) {
      if (!currentUser) {
        toast.error('Please login to take the test');
        navigate('/login');
      }
      setLoading(false);
      return;
    }

    const fetchTestAndQuestions = async () => {
      try {
        const testSnap = await getDoc(doc(db, 'tests', testId));
        if (!testSnap.exists()) {
          toast.error('Test not found');
          navigate('/');
          return;
        }
        const tData = testSnap.data() as Test;
        if (tData.examId) {
          try {
            const examSnap = await getDoc(doc(db, 'exams', tData.examId));
            if (examSnap.exists()) {
              tData.examName = examSnap.data().name || examSnap.data().title || 'Unknown Exam';
            }
          } catch (e) {
            console.error('Failed to fetch exam for test:', e);
          }
        }
        setTest({ id: testSnap.id, ...tData });
        setTimeLeft(tData.durationMinutes * 60);
        
        if (tData.language === 'Hindi') {
          setSelectedLanguage('Hindi');
        } else {
          setSelectedLanguage('English'); // Default to English for English and Bilingual initially
        }

        const qSnap = await getDocs(collection(db, 'tests', testId, 'Questions'));
        const qList: Question[] = [];
        qSnap.forEach(d => qList.push({ id: d.id, ...d.data() } as Question));
        
        // Optional: Sort questions if needed, or leave random
        setQuestions(qList);
        setLoading(false);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load test');
        setLoading(false);
      }
    };

    fetchTestAndQuestions();
  }, [testId, currentUser, navigate]);

  useEffect(() => {
    if (loading || !test || timeLeft <= 0 || submitting) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [loading, test, submitting, timeLeft]);

  const handleSelectOption = (qId: string, option: string) => {
    setAnswers(prev => ({ ...prev, [qId]: option }));
  };

  const handleClearResponse = (qId: string) => {
    setAnswers(prev => {
      const next = { ...prev };
      delete next[qId];
      return next;
    });
  };

  const handleMarkForReview = (qId: string) => {
    setMarkedForReview(prev => ({ ...prev, [qId]: !prev[qId] }));
  };

  const handleSaveAndNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(prev => prev + 1);
    } else {
      setShowConfirmModal(true);
    }
  };

  const handleSubmit = async () => {
    if (submitting || !testId || !currentUser) return;
    setSubmitting(true);
    
    try {
      let score = 0;
      let totalMarks = 0;
      let correct = 0;
      let incorrect = 0;
      
      const subjectAnalysis: Record<string, { total: number, correct: number, incorrect: number, skipped: number, score: number }> = {};
      
      questions.forEach(q => {
        const sub = q.subject || 'General';
        if (!subjectAnalysis[sub]) {
          subjectAnalysis[sub] = { total: 0, correct: 0, incorrect: 0, skipped: 0, score: 0 };
        }
        subjectAnalysis[sub].total++;

        const qMarks = Number(q.marks) || 1;
        const qNegMarks = Number(q.negativeMarks) || 0;
        totalMarks += qMarks;
        
        const ans = answers[q.id];
        if (ans) {
          if (ans === q.correctAnswer) {
            score += qMarks;
            correct++;
            subjectAnalysis[sub].correct++;
            subjectAnalysis[sub].score += qMarks;
          } else {
            score -= qNegMarks;
            incorrect++;
            subjectAnalysis[sub].incorrect++;
            subjectAnalysis[sub].score -= qNegMarks;
          }
        } else {
          subjectAnalysis[sub].skipped++;
        }
      });
      
      const attempted = correct + incorrect;
      const accuracy = attempted > 0 ? (correct / attempted) * 100 : 0;
      const timeTaken = test?.durationMinutes ? (test.durationMinutes * 60) - timeLeft : 0;

      // Get attempt number
      const qAttempts = query(
        collection(db, 'results'),
        where('userId', '==', currentUser.uid),
        where('testId', '==', testId)
      );
      const attemptsSnap = await getDocs(qAttempts);
      const attemptNumber = attemptsSnap.size + 1;

      // Save result to DB
      const resultData = {
        userId: currentUser.uid,
        userName: currentUser.displayName || currentUser.email?.split('@')[0] || 'Student',
        userEmail: currentUser.email || '',
        testId: testId,
        testTitle: test?.title || 'Unknown Test',
        answers: answers,
        submittedAt: Date.now(),
        timeTaken,
        score: parseFloat(score.toFixed(2)),
        subjectAnalysis,
        totalMarks,
        correct,
        incorrect,
        skipped: questions.length - attempted,
        accuracy: parseFloat(accuracy.toFixed(2)),
        attemptNumber,
        status: test?.showResultImmediately === false ? 'pending' : 'published',
        examName: test?.examName || 'Unknown Exam' // Might need to fetch Exam name if possible, or just default. Wait, test object has examId, we can maybe add it later or just leave 'Unknown Exam' for now.
      };

      await addDoc(collection(db, 'results'), resultData);

      // Delete active test session after successful submission
      try {
        const { deleteDoc } = await import('firebase/firestore');
        await deleteDoc(doc(db, 'activeTests', `${currentUser.uid}_${testId}`));
      } catch (e) {
        console.warn('Failed to clean up active test session:', e);
      }
      
      toast.success('Test submitted successfully!');
      navigate(`/test-result/${testId}`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to submit test');
      setSubmitting(false);
      setShowConfirmModal(false);
    }
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]"><Loader2 className="w-8 h-8 animate-spin text-[#5B5FFB]" /></div>;
  }
  if (!test || questions.length === 0) {
    if (isAdmin) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC] gap-4">
          <p className="text-gray-500">No questions available for this test.</p>
          <button onClick={() => navigate('/admin/tests')} className="px-6 py-2 bg-[#5B5FFB] text-white rounded-xl font-bold flex items-center gap-2">
            <LayoutGrid className="w-5 h-5" /> Manage Questions
          </button>
        </div>
      );
    }
    return <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC]">
      <p className="text-gray-500">No questions available for this test.</p>
    </div>;
  }

  const currentQ = questions[currentIdx];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <h1 className="font-bold text-gray-900 line-clamp-1 mr-4">{test.title}</h1>
        <div className="flex items-center gap-4 shrink-0">
          {test.language === 'Bilingual' && (
            <select 
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value as 'English' | 'Hindi')}
              className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-[#5B5FFB] focus:border-[#5B5FFB] block p-2 outline-none font-medium"
            >
              <option value="English">English</option>
              <option value="Hindi">Hindi</option>
            </select>
          )}
          {lastSaved && (
            <span className="hidden sm:flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-2.5 py-1 rounded-full border border-gray-100">
              <CheckCircle2 className="w-3 h-3 text-green-500" /> Auto-saved
            </span>
          )}
          <div className="flex items-center gap-2 bg-red-50 text-red-600 px-3 py-1.5 rounded-lg font-mono font-bold">
            <Clock className="w-4 h-4" />
            {formatTime(timeLeft)}
          </div>
          <button onClick={() => setShowPalette(!showPalette)} className="lg:hidden p-2 bg-gray-100 rounded-lg text-gray-700">
            <LayoutGrid className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden max-w-7xl mx-auto w-full">
        {/* Main Area */}
        <div className="flex-1 flex flex-col h-full overflow-y-auto">
          <div className="p-4 sm:p-8 flex-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
              <div className="flex justify-between items-start mb-6">
                <span className="bg-blue-50 text-blue-600 font-bold px-3 py-1 rounded-lg text-sm">Question {currentIdx + 1} of {questions.length}</span>
                <div className="flex items-center gap-3">
                  {markedForReview[currentQ.id] && (
                    <span className="bg-purple-50 text-purple-600 font-bold px-2 py-1 rounded text-[10px] uppercase tracking-wider border border-purple-100">
                      Marked for Review
                    </span>
                  )}
                  <div className="flex gap-2 text-xs font-semibold">
                    <span className="text-green-600 bg-green-50 px-2 py-1 rounded">+{currentQ.marks}</span>
                    <span className="text-red-600 bg-red-50 px-2 py-1 rounded">-{currentQ.negativeMarks}</span>
                  </div>
                </div>
              </div>
              
              <div className="prose max-w-none mb-8">
                <div 
                  className="text-lg text-gray-900 font-medium whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{ 
                    __html: selectedLanguage === 'Hindi' && currentQ.textHindi 
                      ? currentQ.textHindi 
                      : currentQ.text 
                  }} 
                />
                {currentQ.image && <img loading="lazy" src={currentQ.image} alt="Question" className="mt-4 max-h-64 rounded-xl border border-gray-200" />}
              </div>

              <div className="space-y-3">
                {['A', 'B', 'C', 'D'].map((opt) => {
                  const textEng = currentQ[`option${opt}` as keyof Question] as string;
                  const textHin = currentQ[`option${opt}Hindi` as keyof Question] as string | undefined;
                  const text = (selectedLanguage === 'Hindi' && textHin) ? textHin : textEng;
                  const image = currentQ[`option${opt}Image` as keyof Question] as string | undefined;
                  const isSelected = answers[currentQ.id] === opt;
                  
                  return (
                    <div 
                      key={opt}
                      onClick={() => handleSelectOption(currentQ.id, opt)}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex gap-3 ${isSelected ? 'border-[#5B5FFB] bg-[#5B5FFB]/5' : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'}`}
                    >
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${isSelected ? 'border-[#5B5FFB] bg-[#5B5FFB]' : 'border-gray-300'}`}>
                        {isSelected && <div className="w-2.5 h-2.5 bg-white rounded-full"></div>}
                      </div>
                      <div className="flex-1">
                        <span className="font-bold mr-2 text-gray-900">{opt}.</span>
                        <span className="text-gray-700" dangerouslySetInnerHTML={{ __html: text }} />
                        {image && <img loading="lazy" src={image} alt={`Option ${opt}`} className="mt-2 max-h-32 rounded-lg border border-gray-200" />}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-3 pt-6 border-t border-gray-100">
                <button 
                  onClick={() => handleMarkForReview(currentQ.id)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold border transition-colors ${markedForReview[currentQ.id] ? 'bg-purple-600 text-gray-900 dark:text-white border-purple-600' : 'bg-white text-purple-600 border-purple-200 hover:bg-purple-50'}`}
                >
                  Mark for Review
                </button>
                <button 
                  onClick={() => handleClearResponse(currentQ.id)}
                  className="px-4 py-2 bg-white text-gray-500 border border-gray-200 rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors"
                >
                  Clear Response
                </button>
                <div className="ml-auto">
                   <button 
                    onClick={handleSaveAndNext}
                    className="px-6 py-2 bg-[#5B5FFB] text-white rounded-xl text-sm font-bold hover:bg-[#4A4DE0] transition-colors shadow-lg shadow-[#5B5FFB]/20"
                  >
                    Save & Next
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="bg-white border-t border-gray-200 p-4 sm:px-8 flex items-center justify-between shrink-0">
            <button 
              disabled={currentIdx === 0}
              onClick={() => setCurrentIdx(prev => prev - 1)}
              className="px-4 py-2 flex items-center gap-2 text-gray-600 font-semibold disabled:opacity-50 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" /> <span className="hidden sm:inline">Previous</span>
            </button>

            <button 
              onClick={() => setShowConfirmModal(true)}
              className="px-6 py-2.5 bg-green-600 text-gray-900 dark:text-white font-bold rounded-xl hover:bg-green-700 transition-colors shadow-sm"
            >
              Submit Test
            </button>

            <button 
              disabled={currentIdx === questions.length - 1}
              onClick={() => setCurrentIdx(prev => prev + 1)}
              className="px-4 py-2 flex items-center gap-2 text-gray-600 font-semibold disabled:opacity-50 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <span className="hidden sm:inline">Next</span> <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sidebar / Palette */}
        <div className={`w-72 bg-white border-l border-gray-200 flex flex-col absolute lg:relative right-0 h-full lg:h-auto z-20 transition-transform ${showPalette ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}`}>
          <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
            <h3 className="font-bold text-gray-900">Question Palette</h3>
            <button onClick={() => setShowPalette(false)} className="lg:hidden p-1 text-gray-500 hover:bg-gray-200 rounded">✕</button>
          </div>
          <div className="p-4 flex-1 overflow-y-auto">
            <div className="grid grid-cols-4 gap-2">
              {questions.map((q, idx) => {
                const isAnswered = !!answers[q.id];
                const isMarked = !!markedForReview[q.id];
                const isCurrent = currentIdx === idx;
                
                let bgColor = 'bg-white border-gray-200 text-gray-600 hover:border-gray-300';
                if (isAnswered && isMarked) bgColor = 'bg-purple-600 border-purple-600 text-gray-900 dark:text-white';
                else if (isAnswered) bgColor = 'bg-[#5B5FFB] border-[#5B5FFB] text-white';
                else if (isMarked) bgColor = 'bg-amber-400 border-amber-400 text-gray-900 dark:text-white';

                return (
                  <button
                    key={q.id}
                    onClick={() => { setCurrentIdx(idx); setShowPalette(false); }}
                    className={`w-12 h-12 rounded-xl text-sm font-bold flex items-center justify-center transition-colors border-2 
                      ${isCurrent ? 'ring-2 ring-[#5B5FFB] ring-offset-2 scale-110 z-10 shadow-md' : ''}
                      ${bgColor}`}
                  >
                    {idx + 1}
                  </button>
                )
              })}
            </div>
            <div className="mt-8 space-y-3 text-xs text-gray-600 font-bold border-t pt-6 border-gray-100">
              <div className="flex items-center gap-3 uppercase tracking-wider">
                <div className="w-5 h-5 rounded bg-[#5B5FFB]"></div> Answered ({Object.keys(answers).length})
              </div>
              <div className="flex items-center gap-3 uppercase tracking-wider">
                <div className="w-5 h-5 rounded bg-purple-600"></div> Answered & Marked ({Object.values(markedForReview).filter((v, i) => v && !!answers[questions[i]?.id]).length})
              </div>
              <div className="flex items-center gap-3 uppercase tracking-wider">
                <div className="w-5 h-5 rounded bg-amber-400"></div> Marked only ({Object.values(markedForReview).filter((v, i) => v && !answers[questions[i]?.id]).length})
              </div>
              <div className="flex items-center gap-3 uppercase tracking-wider">
                <div className="w-5 h-5 rounded bg-white border-2 border-gray-200"></div> Not Visited ({questions.length - Object.keys(answers).length})
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 dark:bg-gray-900/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="p-8 text-center">
                <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Ready to Submit?</h3>
                <p className="text-gray-500 mb-8 leading-relaxed">
                  You have attempted <span className="font-bold text-gray-900">{Object.keys(answers).length}</span> out of <span className="font-bold text-gray-900">{questions.length}</span> questions.
                  Once submitted, you won't be able to change your answers.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <button 
                    disabled={submitting}
                    onClick={() => setShowConfirmModal(false)}
                    className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 font-bold rounded-2xl hover:bg-gray-200 transition-colors disabled:opacity-50"
                  >
                    Go Back
                  </button>
                  <button 
                    disabled={submitting}
                    onClick={handleSubmit}
                    className="flex-1 px-6 py-3 bg-green-600 text-gray-900 dark:text-white font-bold rounded-2xl hover:bg-green-700 transition-colors shadow-lg shadow-green-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Yes, Submit'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
