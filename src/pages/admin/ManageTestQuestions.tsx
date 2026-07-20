import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import AdminQuestionManager from './AdminQuestionManager';
import { Loader2 } from 'lucide-react';

export default function ManageTestQuestions() {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const [testTitle, setTestTitle] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!testId) return;
    getDoc(doc(db, 'tests', testId)).then((snap) => {
      if (snap.exists()) {
        setTestTitle(snap.data().title || 'Mock Test');
      }
      setLoading(false);
    });
  }, [testId]);

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-[#5B5FFB]" /></div>;

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      <AdminQuestionManager 
        testId={testId!}
        testTitle={testTitle}
        catName=""
        examName=""
        typeCollection=""
        onBack={() => navigate(-1)}
      />
    </div>
  );
}
