'use client';

import { useState, useEffect, useRef } from 'react';
import { RecaptchaVerifier } from 'firebase/auth';
import {
  initRecaptchaVerifier,
  sendOTP,
  verifyOTP,
  validateBDPhone,
  formatPhoneDisplay,
  hashPhoneNumber
} from '@/lib/firebase';
import { useTheme } from '@/providers/ThemeProvider';
import { useLanguage } from '@/providers/LanguageProvider';

// Development mode bypass - set to true to skip phone verification in development
const DEV_MODE_BYPASS = process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_SKIP_PHONE_AUTH === 'true';

interface PhoneVerificationProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified: (phoneHash: string, phoneNumber: string) => void;
  title?: { en: string; bn: string };
  description?: { en: string; bn: string };
}

export default function PhoneVerification({
  isOpen,
  onClose,
  onVerified,
  title = { en: 'Verify Your Phone', bn: 'আপনার ফোন যাচাই করুন' },
  description = { en: 'Enter your phone number to receive a verification code', bn: 'যাচাইকরণ কোড পেতে আপনার ফোন নম্বর দিন' }
}: PhoneVerificationProps) {
  const { isDark } = useTheme();
  const { language } = useLanguage();

  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);

  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);
  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Initialize reCAPTCHA when modal opens
  useEffect(() => {
    if (isOpen && !recaptchaVerifierRef.current) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        recaptchaVerifierRef.current = initRecaptchaVerifier('recaptcha-container');
      }, 300);
    }

    // Cleanup on close
    if (!isOpen) {
      setStep('phone');
      setPhoneNumber('');
      setOtpCode(['', '', '', '', '', '']);
      setError('');
      setCountdown(0);
      if (recaptchaVerifierRef.current) {
        try {
          recaptchaVerifierRef.current.clear();
        } catch (e) {
          // Ignore cleanup errors
        }
        recaptchaVerifierRef.current = null;
      }
    }
  }, [isOpen]);

  const getText = (text: { en: string; bn: string }) => text[language] || text.en;

  const handleSendOTP = async () => {
    setError('');

    // Validate phone number
    if (!validateBDPhone(phoneNumber)) {
      setError(language === 'bn'
        ? 'সঠিক বাংলাদেশী ফোন নম্বর দিন (যেমন: 01712345678)'
        : 'Enter a valid Bangladeshi phone number (e.g., 01712345678)');
      return;
    }

    if (!recaptchaVerifierRef.current) {
      recaptchaVerifierRef.current = initRecaptchaVerifier('recaptcha-container');
      if (!recaptchaVerifierRef.current) {
        setError(language === 'bn'
          ? 'যাচাইকরণ সিস্টেম লোড হয়নি। পেজ রিফ্রেশ করুন।'
          : 'Verification system not loaded. Please refresh the page.');
        return;
      }
    }

    setLoading(true);

    try {
      const result = await sendOTP(phoneNumber, recaptchaVerifierRef.current);

      if (result.success) {
        setStep('otp');
        setCountdown(60); // 60 seconds countdown for resend
        // Focus first OTP input
        setTimeout(() => {
          otpInputsRef.current[0]?.focus();
        }, 100);
      } else {
        setError(result.error || (language === 'bn' ? 'OTP পাঠাতে ব্যর্থ' : 'Failed to send OTP'));
        // Reset reCAPTCHA on error
        if (recaptchaVerifierRef.current) {
          try {
            recaptchaVerifierRef.current.clear();
          } catch (e) {
            // Ignore
          }
          recaptchaVerifierRef.current = null;
        }
      }
    } catch (err) {
      setError(language === 'bn' ? 'OTP পাঠাতে ব্যর্থ' : 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    // Only allow digits
    const digit = value.replace(/\D/g, '').slice(-1);

    const newOtp = [...otpCode];
    newOtp[index] = digit;
    setOtpCode(newOtp);

    // Auto-focus next input
    if (digit && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOtp = [...otpCode];
    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i];
    }
    setOtpCode(newOtp);

    // Focus the next empty input or the last one
    const nextEmptyIndex = newOtp.findIndex(d => !d);
    if (nextEmptyIndex !== -1) {
      otpInputsRef.current[nextEmptyIndex]?.focus();
    } else {
      otpInputsRef.current[5]?.focus();
    }
  };

  const handleVerifyOTP = async () => {
    setError('');

    const code = otpCode.join('');
    if (code.length !== 6) {
      setError(language === 'bn' ? '৬ সংখ্যার কোড দিন' : 'Enter the 6-digit code');
      return;
    }

    setLoading(true);

    try {
      const result = await verifyOTP(code);

      if (result.success && result.phoneNumber) {
        // Hash the phone number for storage
        const phoneHash = await hashPhoneNumber(result.phoneNumber);
        onVerified(phoneHash, result.phoneNumber);
        onClose();
      } else {
        setError(result.error || (language === 'bn' ? 'যাচাইকরণ ব্যর্থ' : 'Verification failed'));
      }
    } catch (err) {
      setError(language === 'bn' ? 'যাচাইকরণ ব্যর্থ' : 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;

    // Reset reCAPTCHA
    if (recaptchaVerifierRef.current) {
      try {
        recaptchaVerifierRef.current.clear();
      } catch (e) {
        // Ignore
      }
      recaptchaVerifierRef.current = null;
    }

    // Re-initialize and send
    recaptchaVerifierRef.current = initRecaptchaVerifier('recaptcha-container');
    if (recaptchaVerifierRef.current) {
      setLoading(true);
      const result = await sendOTP(phoneNumber, recaptchaVerifierRef.current);
      setLoading(false);

      if (result.success) {
        setCountdown(60);
        setOtpCode(['', '', '', '', '', '']);
        setError('');
      } else {
        setError(result.error || (language === 'bn' ? 'OTP পুনরায় পাঠাতে ব্যর্থ' : 'Failed to resend OTP'));
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100001] flex items-center justify-center p-4">
      {/* Hidden reCAPTCHA container */}
      <div id="recaptcha-container" />

      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className={`
        relative w-full max-w-md rounded-2xl shadow-2xl p-6 transform transition-all
        ${isDark ? 'bg-gray-800' : 'bg-white'}
      `}>
        {/* Close button */}
        <button
          onClick={onClose}
          className={`
            absolute top-4 right-4 p-2 rounded-full transition-colors
            ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}
          `}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Phone icon */}
        <div className="flex justify-center mb-4">
          <div className={`
            w-16 h-16 rounded-full flex items-center justify-center
            ${isDark ? 'bg-green-900/30' : 'bg-green-100'}
          `}>
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h2 className={`text-xl font-bold text-center mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {getText(title)}
        </h2>

        {/* Description */}
        <p className={`text-center text-sm mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          {step === 'phone'
            ? getText(description)
            : language === 'bn'
              ? `${formatPhoneDisplay(phoneNumber)} নম্বরে পাঠানো কোড দিন`
              : `Enter the code sent to ${formatPhoneDisplay(phoneNumber)}`
          }
        </p>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        {/* Development Mode Bypass */}
        {DEV_MODE_BYPASS && (
          <div className="mb-4 p-3 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-400">
            <p className="text-yellow-700 dark:text-yellow-300 text-sm font-medium mb-2">
              🔧 Development Mode - Skip Phone Verification
            </p>
            <button
              onClick={async () => {
                const testPhone = '+8801700000000';
                const testHash = await hashPhoneNumber(testPhone);
                onVerified(testHash, testPhone);
                onClose();
              }}
              className="w-full py-2 px-4 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Skip Verification (Dev Only)
            </button>
          </div>
        )}

        {step === 'phone' ? (
          /* Phone number input */
          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {language === 'bn' ? 'ফোন নম্বর' : 'Phone Number'}
              </label>
              <div className="flex">
                <span className={`
                  inline-flex items-center px-4 rounded-l-lg border border-r-0
                  ${isDark
                    ? 'bg-gray-700 border-gray-600 text-gray-300'
                    : 'bg-gray-100 border-gray-300 text-gray-600'
                  }
                `}>
                  🇧🇩 +88
                </span>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                  placeholder="01XXXXXXXXX"
                  maxLength={11}
                  className={`
                    flex-1 px-4 py-3 rounded-r-lg border focus:ring-2 focus:ring-green-500 outline-none transition-colors
                    ${isDark
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                    }
                  `}
                />
              </div>
            </div>

            <button
              id="send-otp-button"
              onClick={handleSendOTP}
              disabled={loading || phoneNumber.length < 10}
              className={`
                w-full py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2
                ${loading || phoneNumber.length < 10
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 text-white'
                }
              `}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  {language === 'bn' ? 'পাঠানো হচ্ছে...' : 'Sending...'}
                </>
              ) : (
                language === 'bn' ? 'OTP পাঠান' : 'Send OTP'
              )}
            </button>
          </div>
        ) : (
          /* OTP input */
          <div className="space-y-4">
            <div className="flex justify-center gap-2">
              {otpCode.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => { otpInputsRef.current[index] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  onPaste={handleOtpPaste}
                  className={`
                    w-12 h-14 text-center text-xl font-bold rounded-lg border-2 focus:ring-2 focus:ring-green-500 outline-none transition-all
                    ${isDark
                      ? 'bg-gray-700 border-gray-600 text-white focus:border-green-500'
                      : 'bg-white border-gray-300 text-gray-900 focus:border-green-500'
                    }
                  `}
                />
              ))}
            </div>

            <button
              onClick={handleVerifyOTP}
              disabled={loading || otpCode.join('').length !== 6}
              className={`
                w-full py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2
                ${loading || otpCode.join('').length !== 6
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 text-white'
                }
              `}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  {language === 'bn' ? 'যাচাই করা হচ্ছে...' : 'Verifying...'}
                </>
              ) : (
                language === 'bn' ? 'যাচাই করুন' : 'Verify'
              )}
            </button>

            {/* Resend OTP */}
            <div className="text-center">
              <button
                id="resend-otp-button"
                onClick={handleResendOTP}
                disabled={countdown > 0 || loading}
                className={`
                  text-sm transition-colors
                  ${countdown > 0 || loading
                    ? isDark ? 'text-gray-500' : 'text-gray-400'
                    : 'text-green-600 hover:text-green-700'
                  }
                `}
              >
                {countdown > 0
                  ? language === 'bn'
                    ? `${countdown} সেকেন্ড পর পুনরায় পাঠান`
                    : `Resend in ${countdown}s`
                  : language === 'bn'
                    ? 'কোড পাননি? পুনরায় পাঠান'
                    : "Didn't receive code? Resend"
                }
              </button>
            </div>

            {/* Back button */}
            <button
              onClick={() => {
                setStep('phone');
                setOtpCode(['', '', '', '', '', '']);
                setError('');
              }}
              className={`
                w-full py-2 text-sm transition-colors
                ${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-800'}
              `}
            >
              ← {language === 'bn' ? 'নম্বর পরিবর্তন করুন' : 'Change number'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
