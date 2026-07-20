import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, CheckCircle, XCircle, ArrowLeft, Trophy, Target, TrendingUp, Award, BarChart3, AlertTriangle, Download, RotateCcw, MessageSquare } from 'lucide-react';
import jsPDF from 'jspdf';
import * as htmlToImage from 'html-to-image';
import { Link } from 'react-router-dom';
import QuestionDiscussion from '../components/QuestionDiscussion';

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
  explanation?: string;
  explanationImage?: string;
}

export default function TestResult() {
  const { testId, resultId } = useParams<{ testId: string, resultId?: string }>();
  const { currentUser, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<any>(null);
  const [questions, setQuestions] = useState<Record<string, Question>>({});
  const [isDownloading, setIsDownloading] = useState(false);
  const [testDetails, setTestDetails] = useState<any>(null);
  const [stats, setStats] = useState({ score: 0, total: 0, correct: 0, incorrect: 0, skipped: 0, rank: 1, totalParticipants: 1 });
  const [selectedLanguage, setSelectedLanguage] = useState<'English' | 'Hindi'>('English');
  const [subjectAnalysis, setSubjectAnalysis] = useState<Record<string, { total: number, correct: number, incorrect: number, skipped: number, marks: number }>>({});

  useEffect(() => {
    if (!testId || !currentUser) return;

    const fetchResult = async () => {
      try {
        const tSnap = await getDoc(doc(db, 'tests', testId));
        if (tSnap.exists()) {
          const tData = tSnap.data();
          setTestDetails(tData);
          if (tData.language === 'Hindi') {
            setSelectedLanguage('Hindi');
          } else {
            setSelectedLanguage('English');
          }
        }
        
        let latestResult: any = null;
        
        if (resultId) {
          const resDoc = await getDoc(doc(db, 'results', resultId));
          if (resDoc.exists()) {
            latestResult = { id: resDoc.id, ...resDoc.data() };
          }
        }
        
        if (!latestResult) {
          const resQuery = query(collection(db, 'results'), where('userId', '==', currentUser.uid), where('testId', '==', testId));
          const resSnap = await getDocs(resQuery);
          
          if (resSnap.empty) {
            navigate('/');
            return;
          }

          // Sort by submittedAt desc
          const resultsData = resSnap.docs.map(d => ({ id: d.id, ...d.data() } as any));
          resultsData.sort((a, b) => b.submittedAt - a.submittedAt);
          latestResult = resultsData[0];
        }

        setResult(latestResult);

        // Fetch questions to calculate score
        const qQuery = collection(db, 'tests', testId, 'Questions');
        const qSnap = await getDocs(qQuery);
        const qDict: Record<string, Question> = {};
        
        let score = 0;
        let totalMarks = 0;
        let correct = 0;
        let incorrect = 0;
        let skipped = 0;
        const subAnalysis: Record<string, { total: number, correct: number, incorrect: number, skipped: number, marks: number }> = {};

        qSnap.forEach(d => {
          const q = { id: d.id, ...d.data() } as any;
          qDict[d.id] = q;
          const qMarks = Number(q.marks) || 1;
          const qNegMarks = Number(q.negativeMarks) || 0;
          totalMarks += qMarks;

          const sub = q.subject || 'General';
          if (!subAnalysis[sub]) {
            subAnalysis[sub] = { total: 0, correct: 0, incorrect: 0, skipped: 0, marks: 0 };
          }
          subAnalysis[sub].total++;

          const userAnswer = latestResult.answers[q.id];
          if (!userAnswer) {
            skipped++;
            subAnalysis[sub].skipped++;
          } else if (userAnswer === q.correctAnswer) {
            correct++;
            subAnalysis[sub].correct++;
            score += qMarks;
            subAnalysis[sub].marks += qMarks;
          } else {
            incorrect++;
            subAnalysis[sub].incorrect++;
            score -= qNegMarks;
            subAnalysis[sub].marks -= qNegMarks;
          }
        });

        // Compute rank by fetching all results for this test
        const allResQuery = query(collection(db, 'results'), where('testId', '==', testId));
        const allResSnap = await getDocs(allResQuery);
        
        // Compute best score for each unique user
        const userBestScores = new Map<string, number>();
        allResSnap.forEach(d => {
           const res = d.data();
           const uid = res.userId;
           const s = Number(res.score) || 0;
           
           if (!userBestScores.has(uid) || s > userBestScores.get(uid)!) {
             userBestScores.set(uid, s);
           }
        });

        const myBestScore = userBestScores.get(currentUser.uid) || score;
        let rank = 1;
        userBestScores.forEach((s, uid) => {
           if (uid !== currentUser.uid && s > myBestScore) {
              rank++;
           }
        });

        setQuestions(qDict);
        setSubjectAnalysis(subAnalysis);
        setStats({ 
          score, 
          total: totalMarks, 
          correct, 
          incorrect, 
          skipped, 
          rank, 
          totalParticipants: Math.max(userBestScores.size, 1) 
        });
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };

    fetchResult();
  }, [testId, currentUser, navigate]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]"><Loader2 className="w-8 h-8 animate-spin text-[#5B5FFB]" /></div>;
  }

  
  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    try {
      const element = document.getElementById('result-pdf-container');
      if (!element) return;
      const dataUrl = await htmlToImage.toPng(element, { pixelRatio: 2 });
      const imgData = dataUrl;
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (element.offsetHeight * pdfWidth) / element.offsetWidth;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('Test_Result.pdf');
    } catch (err) {
      console.error('Failed to generate PDF', err);
    } finally {
      setIsDownloading(false);
    }
  };


  if (!result) return null;

  if (result.status === 'pending' && !isAdmin) {
    return (
      <div className="bg-[#F8FAFC] min-h-screen py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Your result is under review. Please wait for admin approval.</h1>
            <p className="text-gray-600 mb-8">The result for this test will be available once the admin publishes it.</p>
            <button onClick={() => navigate('/')} className="px-6 py-3 bg-[#5B5FFB] text-white rounded-xl font-bold hover:bg-[#4A4DE0] transition-colors">
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const percentage = stats.total > 0 ? (Math.max(0, stats.score) / stats.total) * 100 : 0;
  const accuracy = (stats.correct + stats.incorrect) > 0 ? (stats.correct / (stats.correct + stats.incorrect)) * 100 : 0;
  const attempted = stats.correct + stats.incorrect;

  return (
    <div className="bg-[#F8FAFC] min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/test-series')} className="p-2 hover:bg-gray-200 rounded-full transition-colors bg-white shadow-sm border border-gray-100">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Test Result</h1>
          </div>
          <div className="flex items-center gap-3">
            {testDetails?.language === 'Bilingual' && (
              <select 
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value as 'English' | 'Hindi')}
                className="bg-white border border-gray-200 text-gray-700 text-sm rounded-xl focus:ring-[#5B5FFB] focus:border-[#5B5FFB] block px-3 py-2 outline-none font-semibold shadow-sm"
              >
                <option value="English">English</option>
                <option value="Hindi">Hindi</option>
              </select>
            )}
            <button onClick={handleDownloadPDF} disabled={isDownloading} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50">
              {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} <span className="hidden sm:inline">{isDownloading ? 'Generating...' : 'Download PDF'}</span>
            </button>
            <button onClick={() => navigate(`/test-instructions/${testId}`)} className="flex items-center gap-2 px-4 py-2 bg-[#5B5FFB] text-white rounded-xl font-bold hover:bg-[#4A4DE0] transition-colors shadow-sm">
              <RotateCcw className="w-4 h-4" /> <span className="hidden sm:inline">Retake Test</span>
            </button>
          </div>
        </div>


        
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
                <p className="font-bold text-gray-900">{result.timeTaken ? `${Math.floor(result.timeTaken / 60)}m ${result.timeTaken % 60}s` : 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-500 font-medium mb-1">Test ID</p>
                <p className="font-bold text-gray-900 font-mono text-xs mt-0.5">{testId.slice(0,8).toUpperCase()}</p>
              </div>
            </div>
          </div>
  
        {/* Score Card & Performance Analysis */}
        <div className="flex flex-wrap gap-4 mb-8">
           <Link 
             to={`/certificate/${resultId}`} 
             className="flex-1 min-w-[200px] flex items-center justify-center gap-3 py-4 bg-emerald-600 text-gray-900 dark:text-white font-black rounded-2xl shadow-xl shadow-emerald-600/20 hover:-translate-y-1 transition-all"
           >
              <Award className="w-6 h-6" /> Get Professional Certificate
           </Link>
           <button 
             onClick={() => {
                const element = document.getElementById('discussion-section');
                element?.scrollIntoView({ behavior: 'smooth' });
             }}
             className="flex-1 min-w-[200px] flex items-center justify-center gap-3 py-4 bg-white text-[#5B5FFB] font-black rounded-2xl border-2 border-[#5B5FFB] hover:bg-[#5B5FFB]/5 transition-all"
           >
              <MessageSquare className="w-6 h-6" /> Join Question Discussion
           </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Main Score Card */}
          <div className="md:col-span-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center flex flex-col items-center justify-center relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 pointer-events-none"></div>
            <div className="inline-flex items-center justify-center w-20 h-20 bg-[#5B5FFB] text-white shadow-lg rounded-full mb-6 z-10">
              <Trophy className="w-10 h-10" />
            </div>
            <h2 className="text-5xl font-extrabold text-gray-900 mb-2 z-10">{Math.max(0, stats.score).toFixed(2)}</h2>
            <p className="text-gray-500 font-medium z-10 text-lg">out of {stats.total} Marks</p>
          </div>

          {/* Performance Analysis */}
          <div className="md:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
             <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
               <BarChart3 className="w-5 h-5 text-[#5B5FFB]" /> Performance Analysis
             </h3>
             <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 text-center">
                   <div className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Rank</div>
                   <div className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-1">
                      {stats.rank} <span className="text-sm text-gray-400 font-medium">/ {stats.totalParticipants}</span>
                   </div>
                </div>
                <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100 text-center">
                   <div className="text-blue-600 text-xs font-bold uppercase tracking-wider mb-1">Percentage</div>
                   <div className="text-2xl font-bold text-blue-700">{percentage.toFixed(1)}%</div>
                </div>
                <div className="bg-green-50/50 rounded-xl p-4 border border-green-100 text-center">
                   <div className="text-green-600 text-xs font-bold uppercase tracking-wider mb-1">Accuracy</div>
                   <div className="text-2xl font-bold text-green-700">{accuracy.toFixed(1)}%</div>
                </div>
                <div className="bg-purple-50/50 rounded-xl p-4 border border-purple-100 text-center">
                   <div className="text-purple-600 text-xs font-bold uppercase tracking-wider mb-1">Attempted</div>
                   <div className="text-2xl font-bold text-purple-700">{attempted}</div>
                </div>
             </div>

             <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.correct}</div>
                <div className="text-sm font-semibold text-gray-500 mt-1">Correct</div>
              </div>
              <div className="text-center border-x border-gray-100">
                <div className="text-2xl font-bold text-red-600">{stats.incorrect}</div>
                <div className="text-sm font-semibold text-gray-500 mt-1">Incorrect</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-400">{stats.skipped}</div>
                <div className="text-sm font-semibold text-gray-500 mt-1">Skipped</div>
              </div>
            </div>
          </div>
        </div>

        {/* Subject-wise Analysis */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
           <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
             <BarChart3 className="w-5 h-5 text-[#5B5FFB]" /> Subject-wise Performance
           </h3>
           <div className="overflow-x-auto">
             <table className="w-full text-sm">
               <thead>
                 <tr className="text-left text-gray-500 border-b border-gray-100">
                   <th className="pb-3 font-bold uppercase tracking-wider">Subject</th>
                   <th className="pb-3 text-center font-bold uppercase tracking-wider">Total</th>
                   <th className="pb-3 text-center font-bold uppercase tracking-wider">Correct</th>
                   <th className="pb-3 text-center font-bold uppercase tracking-wider">Wrong</th>
                   <th className="pb-3 text-center font-bold uppercase tracking-wider">Skipped</th>
                   <th className="pb-3 text-center font-bold uppercase tracking-wider">Marks</th>
                   <th className="pb-3 text-right font-bold uppercase tracking-wider">Accuracy</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-gray-50">
                 {Object.entries(subjectAnalysis).map(([subject, data]: [string, any]) => {
                   const subAccuracy = (data.correct + data.incorrect) > 0 ? (data.correct / (data.correct + data.incorrect)) * 100 : 0;
                   return (
                     <tr key={subject} className="group hover:bg-gray-50 transition-colors">
                       <td className="py-4 font-bold text-gray-900 group-hover:text-[#5B5FFB] transition-colors">{subject}</td>
                       <td className="py-4 text-center text-gray-600 font-medium">{data.total}</td>
                       <td className="py-4 text-center text-green-600 font-bold">{data.correct}</td>
                       <td className="py-4 text-center text-red-600 font-bold">{data.incorrect}</td>
                       <td className="py-4 text-center text-gray-400 font-medium">{data.skipped}</td>
                       <td className="py-4 text-center font-bold text-gray-900">{data.marks.toFixed(2)}</td>
                       <td className="py-4 text-right">
                         <div className="flex items-center justify-end gap-2">
                            <span className={`font-bold ${subAccuracy > 70 ? 'text-green-600' : subAccuracy > 40 ? 'text-orange-600' : 'text-red-600'}`}>
                              {subAccuracy.toFixed(1)}%
                            </span>
                            <div className="w-12 h-1.5 bg-gray-100 rounded-full overflow-hidden hidden sm:block">
                               <div 
                                 className={`h-full rounded-full ${subAccuracy > 70 ? 'bg-green-500' : subAccuracy > 40 ? 'bg-orange-500' : 'bg-red-500'}`}
                                 style={{ width: `${subAccuracy}%` }}
                               />
                            </div>
                         </div>
                       </td>
                     </tr>
                   );
                 })}
               </tbody>
             </table>
           </div>
        </div>

        {/* Detailed Analysis */}
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
           <Target className="w-5 h-5 text-gray-700" /> Detailed Solutions
        </h3>
        <div className="space-y-6">
          {(Object.values(questions) as Question[]).map((q: Question, index) => {
            const userAnswer = result.answers[q.id];
            const isCorrect = userAnswer === q.correctAnswer;
            const isSkipped = !userAnswer;

            return (
              <div key={q.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex gap-4 items-start">
                  <div className="shrink-0 mt-1">
                    {isSkipped ? (
                      <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">-</div>
                    ) : isCorrect ? (
                      <CheckCircle className="w-6 h-6 text-green-500" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-bold text-gray-900">Q{index + 1}.</span>
                      <div className="flex gap-2 text-xs font-semibold">
                        <span className="text-green-600 bg-green-50 px-2 py-1 rounded">+{q.marks}</span>
                        <span className="text-red-600 bg-red-50 px-2 py-1 rounded">-{q.negativeMarks}</span>
                      </div>
                    </div>
                    <div className="text-gray-800 font-medium mb-4 whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: (selectedLanguage === 'Hindi' && q.textHindi) ? q.textHindi : q.text }} />
                    {q.image && <img loading="lazy" src={q.image} alt="Question" className="mt-4 mb-4 max-h-64 rounded-xl border border-gray-200" />}
                    
                    <div className="space-y-3 mb-6">
                      {['A', 'B', 'C', 'D'].map((opt) => {
                        const textEng = q[`option${opt}` as keyof Question] as string;
                        const textHin = q[`option${opt}Hindi` as keyof Question] as string | undefined;
                        const text = (selectedLanguage === 'Hindi' && textHin) ? textHin : textEng;
                        const image = q[`option${opt}Image` as keyof Question] as string | undefined;
                        
                        const isSelected = userAnswer === opt;
                        const isActuallyCorrect = q.correctAnswer === opt;
                        
                        let borderClass = 'border-gray-100 bg-gray-50';
                        let dotClass = 'border-gray-300';
                        let icon = null;
                        
                        if (isActuallyCorrect) {
                          borderClass = 'border-green-500 bg-green-50';
                          dotClass = 'border-green-500 bg-green-500';
                          icon = <CheckCircle className="w-5 h-5 text-green-500" />;
                        } else if (isSelected && !isActuallyCorrect) {
                          borderClass = 'border-red-500 bg-red-50';
                          dotClass = 'border-red-500 bg-red-500';
                          icon = <XCircle className="w-5 h-5 text-red-500" />;
                        }

                        return (
                          <div key={opt} className={`p-4 rounded-xl border-2 flex items-center gap-3 ${borderClass}`}>
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${dotClass}`}>
                              {(isSelected || isActuallyCorrect) && <div className="w-2.5 h-2.5 bg-white rounded-full"></div>}
                            </div>
                            <div className="flex-1 flex items-center justify-between">
                              <div className="flex-1">
                                <span className="font-bold mr-2 text-gray-900">{opt}.</span>
                                <span className="text-gray-700" dangerouslySetInnerHTML={{ __html: text || `Option ${opt}` }} />
                                {image && <img loading="lazy" src={image} alt={`Option ${opt}`} className="mt-2 max-h-32 rounded-lg border border-gray-200" />}
                              </div>
                              {icon && <div className="shrink-0 ml-3">{icon}</div>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {q.explanation && (
                      <div className="bg-[#F8FAFC] rounded-xl p-5 border border-blue-100/50">
                        <h4 className="font-bold text-gray-900 text-sm mb-3 flex items-center gap-2">
                           <Award className="w-4 h-4 text-blue-500" /> Explanation
                        </h4>
                        <div className="text-sm text-gray-700 leading-relaxed max-w-none whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: q.explanation }} />
                        {q.explanationImage && (
                          <img loading="lazy" src={q.explanationImage} alt="Explanation" className="mt-4 max-h-64 rounded-xl border border-gray-200" />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        <div id="discussion-section">
           <QuestionDiscussion questionId={testId!} />
        </div>
        </div>
      </div>
    </div>
  );
}
