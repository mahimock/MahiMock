import React, { useState, useEffect } from 'react';
import { 
  RecaptchaVerifier, 
  signInWithPhoneNumber, 
  ConfirmationResult 
} from 'firebase/auth';
import { auth, db } from '../../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Phone, Loader2, MessageSquare } from 'lucide-react';
import { sendWelcomeNotification, sendWelcomeBackNotification } from '../../utils/sendWelcomeNotification';
import toast from 'react-hot-toast';

export default function OTPLogin({ onSuccess }: { onSuccess: () => void }) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  useEffect(() => {
    // Cleanup recaptcha on unmount
    return () => {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
      }
    };
  }, []);

  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': () => {}
      });
    }
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber) return;

    try {
      setLoading(true);
      setupRecaptcha();
      
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;
      const result = await signInWithPhoneNumber(auth, formattedPhone, window.recaptchaVerifier);
      
      setConfirmationResult(result);
      setStep('otp');
      toast.success('OTP sent successfully!');
    } catch (error: any) {
      console.error('Phone auth error:', error);
      toast.error(error.message || 'Failed to send OTP');
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || !confirmationResult) return;

    try {
      setLoading(true);
      const userCredential = await confirmationResult.confirm(otp);
      const user = userCredential.user;

      // Check if user exists in Firestore
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        // Create basic profile for first-time phone users
        await setDoc(userRef, {
          name: 'Student',
          phone: user.phoneNumber,
          createdAt: Date.now(),
          role: 'student',
          status: 'active'
        });
        await sendWelcomeNotification(user);
      } else {
        await sendWelcomeBackNotification(user);
      }

      toast.success('Login successful!');
      onSuccess();
    } catch (error: any) {
      console.error('OTP verification error:', error);
      toast.error('Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div id="recaptcha-container"></div>
      
      {step === 'phone' ? (
        <form onSubmit={handleSendOTP} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mobile Number</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Phone className="h-5 w-5" />
              </div>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-[#5B5FFB]/20 focus:border-[#5B5FFB] bg-white dark:bg-[#1E1E2D]/50 transition-all text-gray-900 dark:text-white"
                placeholder="10-digit mobile number"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading || !phoneNumber}
            className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-gray-900 dark:text-white bg-gradient-to-r from-[#5B5FFB] to-purple-600 hover:from-[#4A4DE0] hover:to-purple-700 transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send OTP'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOTP} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Enter OTP</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <MessageSquare className="h-5 w-5" />
              </div>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-[#5B5FFB]/20 focus:border-[#5B5FFB] bg-white dark:bg-[#1E1E2D]/50 transition-all text-gray-900 dark:text-white"
                placeholder="Enter 6-digit OTP"
                required
                maxLength={6}
              />
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <button
              type="submit"
              disabled={loading || otp.length < 6}
              className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-gray-900 dark:text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify & Login'}
            </button>
            <button
              type="button"
              onClick={() => setStep('phone')}
              className="text-sm font-medium text-[#5B5FFB] hover:underline text-center"
            >
              Change phone number
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

declare global {
  interface Window {
    recaptchaVerifier: any;
  }
}
