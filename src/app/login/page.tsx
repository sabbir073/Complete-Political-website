/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/providers/ThemeProvider';
import { useAuth, useAuthActions } from '@/stores/auth-clean';
import { useUIStore } from '@/stores/ui';
import Image from 'next/image';
import Link from 'next/link';

function LoginPageContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  
  const { isDark } = useTheme();
  const { user, profile, isAuthenticated, initialized, loading } = useAuth();
  const { signIn } = useAuthActions();
  const { loading: uiLoading, setLoading, addNotification } = useUIStore();

  // Auth state tracking
  useEffect(() => {
    // Auth initialization tracking
  }, [initialized, loading, isAuthenticated, user, profile]);

  // Redirect to admin if authenticated and active
  useEffect(() => {
    if (initialized && !loading) {
      if (isAuthenticated && profile?.is_active) {
        router.replace('/admin');
      } else if (isAuthenticated && profile && !profile.is_active) {
        setError('Your account is inactive. Please contact an administrator.');
      }
    }
  }, [initialized, loading, isAuthenticated, profile, router]);

  // Show loading while auth is initializing or if authenticated (prevents flash)
  if (!initialized || loading || (isAuthenticated && profile?.is_active)) {
    const message = !initialized || loading 
      ? 'Checking authentication...' 
      : 'Redirecting to dashboard...';
    
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${
        isDark ? 'bg-gray-900' : 'bg-gradient-to-br from-gray-50 to-gray-100'
      }`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {message}
          </p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setError('');
      setLoading('login', true);
      
      await signIn(email, password);
      
      addNotification({
        type: 'success',
        message: 'Login successful! Redirecting...',
        duration: 2000,
      });
      
      // Small delay for user feedback
      setTimeout(() => {
        router.push('/admin');
      }, 500);
      
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed');
      addNotification({
        type: 'error',
        message: err.message || 'Login failed',
      });
    } finally {
      setLoading('login', false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${
      isDark ? 'bg-gray-900' : 'bg-gradient-to-br from-gray-50 to-gray-100'
    }`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className={`absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl opacity-20 ${
          isDark ? 'bg-red-600' : 'bg-red-500'
        }`}></div>
        <div className={`absolute -bottom-40 -left-40 w-80 h-80 rounded-full blur-3xl opacity-20 ${
          isDark ? 'bg-green-600' : 'bg-green-500'
        }`}></div>
      </div>

      <div className="relative z-10 w-full max-w-md px-6">
        <div className={`rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 ${
          isDark ? 'bg-gray-800 shadow-gray-950/50' : 'bg-white shadow-gray-500/30'
        }`}>
          {/* Header */}
          <div className={`px-8 pt-8 pb-6 text-center border-b ${
            isDark ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <div className="flex justify-center mb-4">
              <Image 
                src="/logo.png" 
                alt="Logo" 
                width={64} 
                height={48}
                style={{ width: 'auto', height: '48px' }}
                priority
              />
            </div>
            <h1 className={`text-2xl font-bold mb-2 transition-colors ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Admin Panel
            </h1>
            <p className={`text-sm transition-colors ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Sign in to access the dashboard
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 animate-in slide-in-from-top duration-300">
                <p className="text-red-500 text-sm text-center">{error}</p>
              </div>
            )}

            <div>
              <label className={`block text-sm font-medium mb-2 transition-colors ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={uiLoading.login}
                autoComplete="email"
                className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 disabled:opacity-50 ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white focus:ring-red-500/50 focus:border-red-500' 
                    : 'bg-white border-gray-300 text-gray-900 focus:ring-red-500/50 focus:border-red-500'
                }`}
                placeholder="admin@example.com"
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 transition-colors ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={uiLoading.login}
                autoComplete="current-password"
                className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 disabled:opacity-50 ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white focus:ring-red-500/50 focus:border-red-500' 
                    : 'bg-white border-gray-300 text-gray-900 focus:ring-red-500/50 focus:border-red-500'
                }`}
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={uiLoading.login || !email || !password}
              className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
                isDark 
                  ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-red-600/30' 
                  : 'bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-red-600/30'
              }`}
            >
              {uiLoading.login ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>

            <div className="text-center">
              <Link 
                href="/" 
                className={`text-sm hover:underline transition-colors ${
                  isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-700'
                }`}
              >
                ← Back to website
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return <LoginPageContent />;
}