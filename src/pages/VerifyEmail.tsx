import React, { useState, useEffect } from 'react';
import { Mail, Loader2, ArrowLeft, RefreshCw, CheckCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { auth } from '../firebase';
import { sendEmailVerification } from 'firebase/auth';
import toast from 'react-hot-toast';
import MahiMockLogo from '../components/MahiMockLogo';

export default function VerifyEmail() {
  const { currentUser, signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    if (currentUser.emailVerified) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  const handleResendEmail = async () => {
    if (!currentUser || loading) return;
    setLoading(true);
    try {
      await sendEmailVerification(currentUser);
      toast.success('Verification email resent!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send email');
    } finally {
      setLoading(false);
    }
  };

  const checkVerificationStatus = async () => {
    if (!currentUser || checking) return;
    setChecking(true);
    try {
      await currentUser.reload();
      if (auth.currentUser?.emailVerified) {
        toast.success('Email verified successfully!');
        navigate('/');
      } else {
        toast.error('Email not verified yet. Please check your inbox.');
      }
    } catch (error) {
      toast.error('Failed to refresh status');
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-[#0B1020]">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-[#1E1E2D] p-8 rounded-[2rem] shadow-xl border border-gray-100 dark:border-white/5 text-center">
        <div className="flex justify-center mb-6">
          <MahiMockLogo size="xl" showText={false} />
        </div>
        
        <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Mail className="w-10 h-10 text-[#5B5FFB]" />
        </div>

        <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Verify your email</h2>
        <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium">
          We've sent a verification email to <br />
          <span className="font-black text-gray-900 dark:text-white">{currentUser?.email}</span>
        </p>

        <div className="mt-8 space-y-4">
          <button
            onClick={checkVerificationStatus}
            disabled={checking}
            className="w-full flex justify-center items-center gap-2 py-3.5 px-4 bg-gradient-to-r from-[#5B5FFB] to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50"
          >
            {checking ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
            I've Verified My Email
          </button>

          <button
            onClick={handleResendEmail}
            disabled={loading}
            className="w-full flex justify-center items-center gap-2 py-3.5 px-4 bg-gray-100 dark:bg-white/5 text-gray-900 dark:text-white rounded-xl font-bold transition-all hover:bg-gray-200 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
            Resend Email
          </button>
        </div>

        <div className="pt-6 border-t border-gray-200 dark:border-white/5">
          <button 
            onClick={() => signOut()}
            className="text-sm font-bold text-gray-500 hover:text-rose-500 transition-colors flex items-center gap-2 mx-auto"
          >
            <ArrowLeft className="w-4 h-4" /> Sign out and use another email
          </button>
        </div>
      </div>
    </div>
  );
}
