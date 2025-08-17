"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useAuthActions } from '@/stores/auth-fixed';
import { useUIStore } from '@/stores/ui';
import { useTheme } from '@/providers/ThemeProvider';

export default function AdminSettings() {
  const { user, profile, isAuthenticated, canAccessSettings } = useAuth();
  const { updateProfile } = useAuthActions();
  const { 
    loading: uiLoading, 
    setLoading, 
    addNotification 
  } = useUIStore();
  const { isDark } = useTheme();
  const router = useRouter();

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Redirect if not authenticated or no permission
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    } else if (!canAccessSettings) {
      router.replace('/admin'); // Redirect to dashboard if no permission
    }
  }, [isAuthenticated, canAccessSettings, router]);

  // Initialize form data
  useEffect(() => {
    if (profile && user) {
      setFormData(prev => ({
        ...prev,
        full_name: profile.full_name || '',
        email: user.email || '',
      }));
    }
  }, [profile, user]);

  // Don't render if not authenticated or no permission
  if (!isAuthenticated || !canAccessSettings) {
    return null;
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.full_name.trim()) {
      addNotification({
        type: 'error',
        message: 'Full name is required',
      });
      return;
    }

    try {
      setLoading('global', true);
      
      // Use enterprise API endpoint
      const response = await fetch('/api/admin/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user!.id,
          full_name: formData.full_name.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }

      const result = await response.json();

      // Update local state
      updateProfile({
        full_name: formData.full_name.trim(),
      });

      addNotification({
        type: 'success',
        message: 'Profile updated successfully!',
      });

    } catch (error: any) {
      console.error('Profile update error:', error);
      addNotification({
        type: 'error',
        message: error.message || 'Failed to update profile',
      });
    } finally {
      setLoading('global', false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      addNotification({
        type: 'error',
        message: 'All password fields are required',
      });
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      addNotification({
        type: 'error',
        message: 'New passwords do not match',
      });
      return;
    }

    if (formData.newPassword.length < 6) {
      addNotification({
        type: 'error',
        message: 'New password must be at least 6 characters',
      });
      return;
    }

    try {
      setLoading('global', true);
      
      // Note: Password updates still require client-side Supabase for security
      // This is the only acceptable direct Supabase call for user authentication
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      
      // Update password
      const { error } = await supabase.auth.updateUser({
        password: formData.newPassword
      });

      if (error) throw error;

      // Clear password fields
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));

      addNotification({
        type: 'success',
        message: 'Password updated successfully!',
      });

    } catch (error: any) {
      console.error('Password update error:', error);
      addNotification({
        type: 'error',
        message: error.message || 'Failed to update password',
      });
    } finally {
      setLoading('global', false);
    }
  };

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className={`p-6 rounded-xl shadow-lg transition-colors ${
          isDark ? 'bg-gray-800' : 'bg-white'
        }`}>
          <h2 className={`text-2xl font-bold mb-2 transition-colors ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            Admin Settings
          </h2>
          <p className={`transition-colors ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Manage your admin profile and account settings
          </p>
        </div>

        {/* Profile Information */}
        <div className={`p-6 rounded-xl shadow-lg transition-colors ${
          isDark ? 'bg-gray-800' : 'bg-white'
        }`}>
          <h3 className={`text-xl font-bold mb-6 transition-colors ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            Profile Information
          </h3>
          
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-2 transition-colors ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Full Name
              </label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white focus:ring-red-500/50' 
                    : 'bg-white border-gray-300 text-gray-900 focus:ring-red-500/50'
                }`}
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 transition-colors ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                disabled
                className={`w-full px-4 py-3 rounded-lg border opacity-50 cursor-not-allowed transition-colors ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-gray-100 border-gray-300 text-gray-900'
                }`}
              />
              <p className={`text-xs mt-1 transition-colors ${
                isDark ? 'text-gray-500' : 'text-gray-500'
              }`}>
                Email cannot be changed
              </p>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={uiLoading.global}
                className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:transform-none cursor-pointer ${
                  isDark 
                    ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/30' 
                    : 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/30'
                }`}
              >
                {uiLoading.global ? 'Updating...' : 'Update Profile'}
              </button>
            </div>
          </form>
        </div>

        {/* Change Password */}
        <div className={`p-6 rounded-xl shadow-lg transition-colors ${
          isDark ? 'bg-gray-800' : 'bg-white'
        }`}>
          <h3 className={`text-xl font-bold mb-6 transition-colors ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            Change Password
          </h3>
          
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-2 transition-colors ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Current Password
              </label>
              <input
                type="password"
                value={formData.currentPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, currentPassword: e.target.value }))}
                className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white focus:ring-red-500/50' 
                    : 'bg-white border-gray-300 text-gray-900 focus:ring-red-500/50'
                }`}
                placeholder="Enter current password"
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 transition-colors ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                New Password
              </label>
              <input
                type="password"
                value={formData.newPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white focus:ring-red-500/50' 
                    : 'bg-white border-gray-300 text-gray-900 focus:ring-red-500/50'
                }`}
                placeholder="Enter new password"
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 transition-colors ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Confirm New Password
              </label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white focus:ring-red-500/50' 
                    : 'bg-white border-gray-300 text-gray-900 focus:ring-red-500/50'
                }`}
                placeholder="Confirm new password"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={uiLoading.global}
                className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:transform-none cursor-pointer ${
                  isDark 
                    ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/30' 
                    : 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/30'
                }`}
              >
                {uiLoading.global ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>

        {/* Account Information */}
        <div className={`p-6 rounded-xl shadow-lg transition-colors ${
          isDark ? 'bg-gray-800' : 'bg-white'
        }`}>
          <h3 className={`text-xl font-bold mb-6 transition-colors ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            Account Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={`p-4 rounded-lg ${
              isDark ? 'bg-gray-700' : 'bg-gray-50'
            }`}>
              <p className={`text-sm font-medium transition-colors ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Role
              </p>
              <p className={`text-lg font-bold transition-colors ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                Administrator
              </p>
            </div>

            <div className={`p-4 rounded-lg ${
              isDark ? 'bg-gray-700' : 'bg-gray-50'
            }`}>
              <p className={`text-sm font-medium transition-colors ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Account Status
              </p>
              <p className="text-lg font-bold text-green-500">
                Active
              </p>
            </div>

            <div className={`p-4 rounded-lg ${
              isDark ? 'bg-gray-700' : 'bg-gray-50'
            }`}>
              <p className={`text-sm font-medium transition-colors ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Last Login
              </p>
              <p className={`text-lg font-bold transition-colors ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                Just now
              </p>
            </div>

            <div className={`p-4 rounded-lg ${
              isDark ? 'bg-gray-700' : 'bg-gray-50'
            }`}>
              <p className={`text-sm font-medium transition-colors ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                User ID
              </p>
              <p className={`text-sm font-mono transition-colors ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {user?.id?.slice(0, 8)}...
              </p>
            </div>
          </div>
        </div>
      </div>
  );
}