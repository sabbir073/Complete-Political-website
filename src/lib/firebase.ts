/**
 * Firebase Configuration
 *
 * This module initializes Firebase for phone authentication.
 * Used for secure voting in polls, AMA, and forum features.
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';

// Firebase configuration - these values should be in environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Check if Firebase is configured
const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.authDomain &&
  firebaseConfig.projectId &&
  firebaseConfig.appId
);

if (!isFirebaseConfigured && typeof window !== 'undefined') {
  console.warn('Firebase is not properly configured. Phone authentication will not work.');
}

// Initialize Firebase (singleton pattern)
let app: any = null;
let auth: any = null;

if (isFirebaseConfigured) {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(app);
}

// Store confirmation result globally for OTP verification
let confirmationResult: ConfirmationResult | null = null;

/**
 * Initialize invisible reCAPTCHA verifier
 * @param buttonId - The ID of the button element to attach reCAPTCHA to
 */
export function initRecaptchaVerifier(buttonId: string): RecaptchaVerifier | null {
  if (typeof window === 'undefined') return null;

  if (!auth) {
    console.error('Firebase Auth not initialized');
    return null;
  }

  try {
    const verifier = new RecaptchaVerifier(auth, buttonId, {
      size: 'invisible',
      callback: () => {
        // reCAPTCHA solved - will proceed with phone auth
        console.log('reCAPTCHA verified');
      },
      'expired-callback': () => {
        // Response expired - user needs to re-verify
        console.log('reCAPTCHA expired');
      }
    });

    return verifier;
  } catch (error) {
    console.error('Error initializing reCAPTCHA:', error);
    return null;
  }
}

/**
 * Send OTP to phone number
 * @param phoneNumber - Phone number in E.164 format (e.g., +8801712345678)
 * @param recaptchaVerifier - The reCAPTCHA verifier instance
 */
export async function sendOTP(
  phoneNumber: string,
  recaptchaVerifier: RecaptchaVerifier
): Promise<{ success: boolean; error?: string }> {
  if (!auth) {
    return { success: false, error: 'Firebase Auth not configured. Please contact support.' };
  }

  try {
    // Format phone number for Bangladesh if not already formatted
    let formattedPhone = phoneNumber;
    if (!phoneNumber.startsWith('+')) {
      // Assume Bangladesh number
      if (phoneNumber.startsWith('0')) {
        formattedPhone = '+88' + phoneNumber;
      } else {
        formattedPhone = '+880' + phoneNumber;
      }
    }

    confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, recaptchaVerifier);
    return { success: true };
  } catch (error: any) {
    console.error('Error sending OTP:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);

    // Handle specific Firebase errors
    let errorMessage = 'Failed to send OTP. Please try again.';
    if (error.code === 'auth/invalid-phone-number') {
      errorMessage = 'Invalid phone number. Please enter a valid Bangladeshi number.';
    } else if (error.code === 'auth/too-many-requests') {
      errorMessage = 'Too many requests. Please try again later.';
    } else if (error.code === 'auth/quota-exceeded') {
      errorMessage = 'SMS quota exceeded. Please try again tomorrow.';
    } else if (error.code === 'auth/internal-error') {
      // Check if it's actually a network/CORS issue
      if (error.message?.includes('CORS') || error.message?.includes('network')) {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (error.message?.includes('reCAPTCHA')) {
        errorMessage = 'reCAPTCHA verification failed. Please refresh and try again.';
      } else {
        errorMessage = `Authentication error: ${error.message || 'Please try again later.'}`;
      }
    } else if (error.code === 'auth/operation-not-allowed') {
      errorMessage = 'Phone sign-in is not enabled. Please enable it in Firebase Console.';
    } else if (error.code === 'auth/captcha-check-failed') {
      errorMessage = 'reCAPTCHA verification failed. Please refresh and try again.';
    } else if (error.code === 'auth/missing-client-identifier') {
      errorMessage = 'App verification failed. Please refresh the page.';
    }

    return { success: false, error: errorMessage };
  }
}

/**
 * Verify OTP code
 * @param code - The 6-digit OTP code entered by user
 */
export async function verifyOTP(
  code: string
): Promise<{ success: boolean; phoneNumber?: string; uid?: string; error?: string }> {
  if (!confirmationResult) {
    return { success: false, error: 'No OTP request found. Please request a new OTP.' };
  }

  try {
    const result = await confirmationResult.confirm(code);
    const user = result.user;

    // Get the phone number from the user object
    const phoneNumber = user.phoneNumber || '';
    const uid = user.uid;

    // Sign out after verification (we only need to verify, not maintain session)
    await auth.signOut();

    // Clear the confirmation result
    confirmationResult = null;

    return {
      success: true,
      phoneNumber,
      uid
    };
  } catch (error: any) {
    console.error('Error verifying OTP:', error);

    let errorMessage = 'Invalid verification code. Please try again.';
    if (error.code === 'auth/invalid-verification-code') {
      errorMessage = 'Invalid verification code. Please check and try again.';
    } else if (error.code === 'auth/code-expired') {
      errorMessage = 'Verification code has expired. Please request a new OTP.';
    }

    return { success: false, error: errorMessage };
  }
}

/**
 * Format phone number for display
 * @param phone - Phone number in any format
 */
export function formatPhoneDisplay(phone: string): string {
  // Remove all non-digits
  const digits = phone.replace(/\D/g, '');

  // Format as: 01XXX-XXXXXX
  if (digits.length === 11 && digits.startsWith('01')) {
    return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  }

  // Format as: +880 1XXX-XXXXXX
  if (digits.length === 13 && digits.startsWith('880')) {
    return `+880 ${digits.slice(3, 8)}-${digits.slice(8)}`;
  }

  return phone;
}

/**
 * Validate Bangladeshi phone number
 * @param phone - Phone number to validate
 */
export function validateBDPhone(phone: string): boolean {
  // Remove all non-digits
  const digits = phone.replace(/\D/g, '');

  // Valid formats: 01XXXXXXXXX (11 digits) or 8801XXXXXXXXX (13 digits)
  if (digits.length === 11 && digits.startsWith('01')) {
    return true;
  }
  if (digits.length === 13 && digits.startsWith('8801')) {
    return true;
  }
  if (digits.length === 14 && digits.startsWith('8801')) {
    return true;
  }

  return false;
}

/**
 * Hash phone number for storage (privacy)
 * Uses SHA-256 hash
 */
export async function hashPhoneNumber(phone: string): Promise<string> {
  // Normalize phone number
  const normalized = phone.replace(/\D/g, '');

  // Use Web Crypto API for hashing
  const encoder = new TextEncoder();
  const data = encoder.encode(normalized);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  return hashHex;
}

export { auth, app };
