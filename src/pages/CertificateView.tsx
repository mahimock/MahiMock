import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Download, Share2, Loader2, Award, ShieldCheck, GraduationCap, ArrowLeft, CheckCircle } from 'lucide-react';
import { jsPDF } from 'jspdf';
import * as htmlToImage from 'html-to-image';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'motion/react';
import toast from 'react-hot-toast';

export default function CertificateView() {
  const { resultId } = useParams<{ resultId: string }>();
  const { currentUser } = useAuth();
  const [result, setResult] = useState<any>(null);
  const [test, setTest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const certificateRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!resultId) return;
      try {
        const resSnap = await getDoc(doc(db, 'results', resultId));
        if (resSnap.exists()) {
          const resData = resSnap.data();
          setResult(resData);
          
          const testSnap = await getDoc(doc(db, 'tests', resData.testId));
          if (testSnap.exists()) {
            setTest(testSnap.data());
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [resultId]);

  const handleDownload = async () => {
    if (!certificateRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await htmlToImage.toPng(certificateRef.current, {
        pixelRatio: 3,
        backgroundColor: '#ffffff'
      });
      const imgData = dataUrl;
      const width = certificateRef.current.offsetWidth * 3;
      const height = certificateRef.current.offsetHeight * 3;
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [width, height]
      });
      pdf.addImage(imgData, 'PNG', 0, 0, width, height);
      pdf.save(`MahiMock_Certificate_${resultId}.pdf`);
      toast.success('Certificate downloaded successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to download certificate');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-[50vh]"><Loader2 className="w-8 h-8 animate-spin text-[#5B5FFB]" /></div>;
  if (!result || !test) return <div className="p-12 text-center text-gray-500">Certificate not found.</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <header className="flex items-center justify-between mb-8">
           <Link to="/performance" className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-bold transition-colors">
              <ArrowLeft className="w-5 h-5" /> Back to History
           </Link>
           <div className="flex gap-4">
             <button 
               onClick={handleDownload}
               disabled={downloading}
               className="flex items-center gap-2 px-6 py-3 bg-[#5B5FFB] text-white font-bold rounded-2xl shadow-lg hover:bg-[#4A4DE0] transition-all disabled:opacity-50"
             >
               {downloading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
               Download PDF
             </button>
           </div>
        </header>

        {/* Certificate Component (Captured) */}
        <div className="overflow-x-auto pb-8">
          <div 
            ref={certificateRef}
            className="w-[1000px] aspect-[1.414/1] bg-white mx-auto relative p-16 shadow-2xl border-[16px] border-[#5B5FFB] overflow-hidden"
          >
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#5B5FFB]/5 rounded-full -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#5B5FFB]/5 rounded-full -ml-32 -mb-32"></div>
            
            <div className="h-full border-2 border-gray-100 p-12 flex flex-col items-center justify-between relative z-10">
               {/* Header */}
               <div className="text-center">
                  <div className="flex items-center justify-center gap-3 mb-6">
                     <div className="w-14 h-14 bg-[#5B5FFB] rounded-2xl flex items-center justify-center text-white shadow-xl rotate-3">
                       <GraduationCap className="w-8 h-8" />
                     </div>
                     <span className="text-4xl font-black tracking-tighter text-gray-900 italic">MAHIMOCK</span>
                  </div>
                  <h1 className="text-5xl font-black text-gray-900 tracking-tight uppercase mb-4">CERTIFICATE OF ACHIEVEMENT</h1>
                  <p className="text-gray-500 font-bold tracking-[0.2em] uppercase text-sm">THIS CERTIFICATE IS PROUDLY PRESENTED TO</p>
               </div>

               {/* Recipient */}
               <div className="text-center w-full">
                  <div className="text-6xl font-black text-[#5B5FFB] mb-4 font-serif italic border-b-4 border-gray-100 inline-block px-12 py-4">
                     {result.userName || currentUser?.displayName || 'Scholar'}
                  </div>
                  <p className="text-gray-500 text-lg font-medium max-w-2xl mx-auto leading-relaxed mt-6">
                    For successfully completing the <span className="font-bold text-gray-900">"{test.title}"</span> with a remarkable score of <span className="font-bold text-gray-900">{result.score}/{result.totalMarks} ({result.accuracy}%)</span> on our advanced EdTech platform.
                  </p>
               </div>

               {/* Footer Info */}
               <div className="w-full flex items-end justify-between px-8">
                  <div className="flex flex-col items-center">
                     <div className="w-32 h-1 bg-gray-900 mb-2"></div>
                     <p className="text-xs font-black text-gray-900 uppercase tracking-widest">Managing Director</p>
                     <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">MahiMock EdTech Solutions</p>
                  </div>

                  <div className="flex flex-col items-center gap-2">
                     <div className="w-24 h-24 bg-gray-50 border border-gray-100 flex items-center justify-center p-2 rounded-xl">
                        {/* Mock QR Code */}
                        <div className="w-full h-full border-4 border-gray-900 p-1 opacity-20 flex flex-wrap gap-1">
                           {[...Array(64)].map((_, i) => <div key={i} className={`w-1 h-1 ${Math.random() > 0.5 ? 'bg-black' : 'bg-transparent'}`}></div>)}
                        </div>
                     </div>
                     <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Scan to verify</p>
                     <p className="text-[8px] text-gray-300">ID: {resultId}</p>
                  </div>

                  <div className="flex flex-col items-center">
                     <div className="text-xl font-black text-gray-900 mb-1">
                        {new Date(result.submittedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                     </div>
                     <div className="w-32 h-1 bg-gray-900 mb-2"></div>
                     <p className="text-xs font-black text-gray-900 uppercase tracking-widest">Date of Issue</p>
                  </div>
               </div>

               {/* Verified Badge */}
               <div className="absolute top-8 right-8 flex items-center gap-2 text-emerald-600 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100 shadow-sm">
                  <ShieldCheck className="w-5 h-5" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Verified Academic Achievement</span>
               </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm text-center">
           <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
             <Award className="w-6 h-6 text-yellow-500" /> Congratulations!
           </h3>
           <p className="text-gray-500 max-w-lg mx-auto mb-6">You have earned a professional certificate for your performance. Share it with your friends or add it to your LinkedIn profile.</p>
           <div className="flex flex-wrap justify-center gap-4">
              <button onClick={() => toast.success('Link copied!')} className="px-6 py-2.5 bg-gray-50 text-gray-600 font-bold rounded-xl border border-gray-100 hover:bg-gray-100 transition-colors flex items-center gap-2">
                <Share2 className="w-4 h-4" /> Copy Link
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
