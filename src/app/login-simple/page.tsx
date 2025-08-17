/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/providers/ThemeProvider';
import { useAuth, useAuthActions } from '@/stores/auth-fixed';
import { useUIStore } from '@/stores/ui';
import Image from 'next/image';

export default function SimpleLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  
  const { isDark } = useTheme();
  const { user, profile, isAuthenticated, initialized, loading } = useAuth();
  const { signIn } = useAuthActions();
  const { loading: uiLoading, setLoading, addNotification } = useUIStore();

  // Debug current auth state
  useEffect(() => {
    console.log('🔍 Simple Login - Auth State:', {
      initialized,
      loading,
      isAuthenticated,
      hasUser: !!user,
      hasProfile: !!profile,
      profileActive: profile?.is_active,
      userEmail: user?.email,
      profileRole: profile?.role
    });
  }, [initialized, loading, isAuthenticated, user, profile]);

  // Handle redirect after auth is initialized
  useEffect(() => {
    console.log('🔄 Simple Login - Checking redirect conditions...');
    
    if (initialized && !loading) {
      console.log('✅ Auth initialized and not loading');
      
      if (isAuthenticated && profile?.is_active) {
        console.log('🚀 User is authenticated and active - redirecting to admin');
        router.push('/admin');
      } else if (isAuthenticated && profile && !profile.is_active) {
        console.log('❌ User is authenticated but inactive');
        setError('Your account is inactive. Please contact an administrator.');
      } else {
        console.log('👤 User not authenticated or no profile');
      }
    } else {
      console.log('⏳ Auth not yet initialized or still loading');
    }
  }, [initialized, loading, isAuthenticated, profile, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🔐 Simple Login - Starting login process...');
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setError('');
      setLoading('login', true);
      
      console.log('🔑 Attempting to sign in with:', email);
      await signIn(email, password);
      
      console.log('✅ Sign in completed successfully');
      
      addNotification({
        type: 'success',
        message: 'Login successful! Redirecting...',
        duration: 2000,
      });
      
      // The auth listener should handle state updates and trigger redirect
      
    } catch (err: any) {
      console.error('❌ Login error:', err);
      setError(err.message || 'Login failed');
      addNotification({
        type: 'error',
        message: err.message || 'Login failed',
      });
    } finally {
      setLoading('login', false);
    }
  };

  // Show current state for debugging
  if (!initialized || loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${
        isDark ? 'bg-gray-900' : 'bg-gradient-to-br from-gray-50 to-gray-100'
      }`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Initializing authentication... (init: {String(initialized)}, loading: {String(loading)})
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${
      isDark ? 'bg-gray-900' : 'bg-gradient-to-br from-gray-50 to-gray-100'
    }`}>
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
              Simple Login Test
            </h1>
            <p className={`text-sm transition-colors ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Auth State: {initialized ? 'Initialized' : 'Not Init'} | {isAuthenticated ? 'Authenticated' : 'Not Auth'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
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
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={uiLoading.login}
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
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={uiLoading.login}
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
              {uiLoading.login ? 'Signing in...' : 'Sign In'}
            </button>

            <div className="text-center">
              <a 
                href="/auth-test" 
                className={`text-sm hover:underline transition-colors ${
                  isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-700'
                }`}
              >
                Go to Auth Test
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}