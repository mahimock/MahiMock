import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { Trophy, Share2, Users, Gift, Copy, CheckCircle, Loader2, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import toast from 'react-hot-toast';

export default function ReferralDashboard() {
  const { currentUser, userProfile } = useAuth();
  const [referralCode, setReferralCode] = useState('');
  const [referrals, setReferrals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchReferralData = async () => {
      if (!currentUser) return;
      
      try {
        // Get or Generate Referral Code
        const userRef = doc(db, 'users', currentUser.uid);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          const data = userSnap.data();
          if (data.referralCode) {
            setReferralCode(data.referralCode);
          } else {
            // Generate simple code
            const newCode = (userProfile?.name?.substring(0, 3).toUpperCase() || 'VED') + Math.floor(1000 + Math.random() * 9000);
            await updateDoc(userRef, { referralCode: newCode });
            setReferralCode(newCode);
          }
        }

        // Fetch referred users
        const q = query(collection(db, 'users'), where('referredBy', '==', referralCode));
        const snap = await getDocs(q);
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setReferrals(list);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchReferralData();
  }, [currentUser, referralCode, userProfile]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    toast.success('Referral code copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const shareReferral = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Join MahiMock',
        text: `Prepare for government exams with MahiMock. Use my referral code: ${referralCode}`,
        url: window.location.origin + '/signup?ref=' + referralCode,
      });
    } else {
      copyToClipboard();
    }
  };

  if (loading) return <div className="flex justify-center items-center h-[50vh]"><Loader2 className="w-8 h-8 animate-spin text-[#5B5FFB]" /></div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-3xl font-black text-gray-900 mb-4 tracking-tight italic">REFER & EARN</h1>
          <p className="text-gray-500 font-medium max-w-lg mx-auto">Invite your friends to MahiMock and earn exclusive rewards and premium access together!</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Main Referral Card */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 p-8 flex flex-col items-center text-center relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-full -mr-16 -mt-16"></div>
            
            <div className="w-20 h-20 bg-blue-50 text-[#5B5FFB] rounded-[2rem] flex items-center justify-center mb-6 relative">
              <Gift className="w-10 h-10" />
            </div>
            
            <h3 className="text-xl font-black text-gray-900 mb-2">Your Referral Code</h3>
            <p className="text-sm text-gray-400 font-bold uppercase tracking-widest mb-8">Share this with your friends</p>
            
            <div className="w-full bg-[#F8FAFC] border-2 border-dashed border-gray-200 rounded-2xl p-6 flex items-center justify-between gap-4 mb-8">
              <span className="text-2xl font-black text-[#5B5FFB] tracking-[0.2em]">{referralCode}</span>
              <button 
                onClick={copyToClipboard}
                className="w-12 h-12 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center text-gray-400 hover:text-[#5B5FFB] transition-colors"
              >
                {copied ? <CheckCircle className="w-6 h-6 text-green-500" /> : <Copy className="w-6 h-6" />}
              </button>
            </div>
            
            <button 
              onClick={shareReferral}
              className="w-full py-4 bg-[#5B5FFB] text-white font-black rounded-2xl shadow-lg shadow-[#5B5FFB]/20 flex items-center justify-center gap-3 hover:-translate-y-1 transition-all"
            >
              <Share2 className="w-5 h-5" /> Share Now
            </button>
          </motion.div>

          {/* Stats & Info */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="bg-[#111827] rounded-[2.5rem] p-8 text-gray-900 dark:text-white relative overflow-hidden">
               <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-gray-100 dark:bg-white/5 rounded-full"></div>
               <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-gray-200 dark:bg-white/10 rounded-2xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-[#5B5FFB]" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Total Referrals</p>
                    <h4 className="text-3xl font-black">{referrals.length}</h4>
                  </div>
               </div>
               
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-200 dark:bg-white/10 rounded-2xl flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-yellow-500" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Rewards Earned</p>
                    <h4 className="text-3xl font-black">₹{referrals.length * 50}</h4>
                  </div>
               </div>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8">
               <h4 className="font-black text-gray-900 mb-6 flex items-center gap-2">
                 <Gift className="w-5 h-5 text-[#5B5FFB]" /> How it works
               </h4>
               <ul className="space-y-6">
                 <li className="flex items-start gap-4">
                   <div className="w-8 h-8 rounded-full bg-blue-50 text-[#5B5FFB] flex items-center justify-center font-black text-xs shrink-0">1</div>
                   <p className="text-sm text-gray-500 font-medium leading-relaxed">Share your unique referral code or link with your fellow aspirants.</p>
                 </li>
                 <li className="flex items-start gap-4">
                   <div className="w-8 h-8 rounded-full bg-blue-50 text-[#5B5FFB] flex items-center justify-center font-black text-xs shrink-0">2</div>
                   <p className="text-sm text-gray-500 font-medium leading-relaxed">They sign up and attempt their first mock test using your code.</p>
                 </li>
                 <li className="flex items-start gap-4">
                   <div className="w-8 h-8 rounded-full bg-blue-50 text-[#5B5FFB] flex items-center justify-center font-black text-xs shrink-0">3</div>
                   <p className="text-sm text-gray-500 font-medium leading-relaxed">Both of you earn 50 credit points which can be redeemed for premium tests.</p>
                 </li>
               </ul>
            </div>
          </motion.div>
        </div>

        {/* History */}
        <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm">
           <h3 className="text-xl font-black text-gray-900 mb-8">Referral History</h3>
           {referrals.length === 0 ? (
             <div className="py-12 text-center">
                <Users className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No referrals yet</p>
             </div>
           ) : (
             <div className="space-y-4">
                {referrals.map((ref) => (
                  <div key={ref.id} className="flex items-center justify-between p-4 bg-[#F8FAFC] rounded-2xl border border-gray-50">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center font-bold text-[#5B5FFB]">
                        {ref.name?.[0].toUpperCase() || 'S'}
                      </div>
                      <div>
                        <h5 className="font-bold text-gray-900">{ref.name}</h5>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Joined: {ref.createdAt?.toDate?.().toLocaleDateString() || 'Recent'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-green-600 font-black text-sm bg-green-50 px-3 py-1 rounded-lg">
                      <Gift className="w-4 h-4" /> +₹50
                    </div>
                  </div>
                ))}
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
