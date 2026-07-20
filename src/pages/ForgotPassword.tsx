import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Loader2, ArrowLeft } from 'lucide-react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    try {
      setLoading(true);
      await sendPasswordResetEmail(auth, email);
      setSent(true);
      toast.success('Password reset email sent!');
    } catch (error: any) {
      console.error('Password reset error:', error);
      toast.error(error.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white/80 backdrop-blur-xl p-8 rounded-[2rem] shadow-xl border border-white">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-[#5B5FFB] to-purple-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg mb-4 text-gray-900 dark:text-white text-2xl font-bold">
            V
          </div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Reset password</h2>
          <p className="mt-2 text-sm text-gray-500">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        {!sent ? (
          <form className="mt-8 space-y-6" onSubmit={handleReset}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5B5FFB]/20 focus:border-[#5B5FFB] bg-white/50 transition-all text-gray-900"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-gray-900 dark:text-white bg-gradient-to-r from-[#5B5FFB] to-purple-600 hover:from-[#4A4DE0] hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5B5FFB] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send reset link'}
            </button>
          </form>
        ) : (
          <div className="mt-8 bg-green-50 text-green-700 p-4 rounded-xl text-center text-sm font-medium border border-green-100">
            Reset link sent! Check your inbox.
          </div>
        )}

        <div className="mt-6 flex justify-center">
          <Link to="/login" className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
