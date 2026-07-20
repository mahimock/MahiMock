import React, { useEffect, useState } from 'react';
import { ArrowLeft, CheckCircle2, Loader2, Clock, FileText, CheckCircle } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs, deleteDoc, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

interface Test {
  id: string;
  title: string;
  questionsCount: number;
  durationMinutes: number;
  marks?: number;
  negativeMarking?: string;
}

export default function TestInstructions() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { testId } = useParams<{ testId: string }>();
  const [test, setTest] = useState<Test | null>(null);
  const [loading, setLoading] = useState(true);
  const [attempted, setAttempted] = useState(false);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    if (!testId) {
      setLoading(false);
      return;
    }

    const fetchTestData = async () => {
      try {
        const testSnap = await getDoc(doc(db, 'tests', testId));
        if (testSnap.exists()) {
          setTest({ id: testSnap.id, ...testSnap.data() } as Test);
        }

        if (currentUser) {
          const resultsQ = query(
            collection(db, 'results'),
            where('userId', '==', currentUser.uid),
            where('testId', '==', testId),
            limit(1)
          );
          const resultsSnap = await getDocs(resultsQ);
          setAttempted(!resultsSnap.empty);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTestData();
  }, [testId, currentUser]);

  const handleStart = async () => {
    if (!testId || !currentUser) return;
    
    // If it's a reattempt or just a fresh start, we might want to clear active progress
    // The user said "Reattempt" should start a fresh attempt.
    if (attempted) {
      setClearing(true);
      try {
        await deleteDoc(doc(db, 'activeTests', `${currentUser.uid}_${testId}`));
      } catch (e) {
        console.warn('No active session to clear');
      } finally {
        setClearing(false);
      }
    }
    
    navigate(`/take-test/${testId}`);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-[50vh]"><Loader2 className="w-8 h-8 animate-spin text-[#5B5FFB]" /></div>;
  }

  if (!test) {
    return <div className="p-8 text-center text-gray-500">Test not found.</div>;
  }

  return (
    <div className="bg-[#F8FAFC] min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-200 rounded-full transition-colors bg-white shadow-sm border border-gray-100">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Test Instructions</h1>
        </div>
        
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 mb-6 flex flex-wrap gap-6 items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-xl font-bold text-gray-900">{test.title}</h2>
              {attempted && (
                <span className="bg-green-50 text-green-600 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase border border-green-100 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Attempted
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-gray-600 font-semibold">
              <span className="flex items-center gap-1.5"><FileText className="w-4 h-4" /> {test.questionsCount} Questions</span>
              <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {test.durationMinutes} Minutes</span>
              <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4" /> {test.marks || (test.questionsCount * 1)} Marks</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Please read the following instructions carefully:</h2>
          <ul className="space-y-4 mb-8">
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#5B5FFB] mt-0.5 shrink-0" />
              <span className="text-gray-700">The total duration of this test is {test.durationMinutes} minutes.</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#5B5FFB] mt-0.5 shrink-0" />
              <span className="text-gray-700">You can navigate between questions using the Next and Previous buttons, or jump directly using the question palette.</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#5B5FFB] mt-0.5 shrink-0" />
              <span className="text-gray-700">Do not refresh the page or press the back button while taking the test. Doing so may auto-submit your test.</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#5B5FFB] mt-0.5 shrink-0" />
              <span className="text-gray-700">The test will automatically submit when the timer runs out.</span>
            </li>
            {test.negativeMarking && test.negativeMarking !== '0' && (
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#5B5FFB] mt-0.5 shrink-0" />
                <span className="text-gray-700">Negative marking is applicable. Incorrect answers may result in penalty marks.</span>
              </li>
            )}
          </ul>
          
          <div className="flex justify-center border-t border-gray-100 pt-8">
            <button 
              onClick={handleStart}
              disabled={clearing}
              className={`text-gray-900 dark:text-white px-8 py-3 rounded-xl font-bold transition-all shadow-sm flex items-center gap-2 ${
                attempted ? 'bg-[#5B5FFB] hover:bg-[#4A4DE0]' : 'bg-[#5B5FFB] hover:bg-[#4A4DE0]'
              }`}
            >
              {clearing && <Loader2 className="w-5 h-5 animate-spin" />}
              {attempted ? 'Reattempt Test Now' : 'Start Test Now'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
