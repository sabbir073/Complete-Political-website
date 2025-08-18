"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/stores/auth-clean';
import { useTheme } from '@/providers/ThemeProvider';
import { UserRole } from '@/types/database.types';
import Swal from 'sweetalert2';
// Heroicons replaced with inline SVG

interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_sign_in_at?: string;
  email_confirmed_at?: string;
}

interface FormData {
  email: string;
  password: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [passwordError, setPasswordError] = useState('');
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    full_name: '',
    role: 'user',
    is_active: true,
  });

  const { isAuthenticated, canAccessUserManagement } = useAuth();
  const { isDark } = useTheme();
  const router = useRouter();

  // Password validation function
  const validatePassword = (password: string): string => {
    if (!password) {
      // Empty password is okay for updates (keeps existing)
      if (selectedUser) return '';
      return 'Password is required';
    }
    
    // Check minimum length
    if (password.length < 6) {
      return 'Password must be at least 6 characters long';
    }
    
    // Check for strong password requirements
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    const strengthScore = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar].filter(Boolean).length;
    
    if (strengthScore < 2) {
      return 'Password must contain at least 2 of: uppercase, lowercase, numbers, special characters';
    }
    
    return ''; // No error
  };

  // Handle password change
  const handlePasswordChange = (password: string) => {
    setFormData({...formData, password});
    const error = validatePassword(password);
    setPasswordError(error);
  };

  // Check if form is valid for submission
  const isFormValid = () => {
    // For create user, password is required and must be valid
    if (!selectedUser) {
      return formData.email && formData.full_name && formData.password && !passwordError;
    }
    
    // For update user, if password is provided, it must be valid
    if (formData.password.trim()) {
      return formData.full_name && !passwordError;
    }
    
    // For update user without password change
    return formData.full_name;
  };

  // Redirect if not authenticated or no permission
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    } else if (!canAccessUserManagement) {
      router.replace('/admin');
    }
  }, [isAuthenticated, canAccessUserManagement, router]);

  // Fetch users from API
  const fetchUsers = async () => {
    try {
      setLoading(true);
      console.log('👥 Fetching users...');
      
      const response = await fetch('/api/admin/users');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      setUsers(result.users || []);
      console.log(`✅ Loaded ${result.users?.length || 0} users`);
    } catch (error: unknown) {
      console.error('💥 Failed to fetch users:', error);
      
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Failed to load users: ' + (error instanceof Error ? error.message : String(error)),
        confirmButtonText: 'OK',
        confirmButtonColor: '#dc2626'
      });
    } finally {
      setLoading(false);
    }
  };

  // Create new user
  const createUser = async () => {
    
    try {
      setLoading(true);
      console.log('🏗️ Creating user:', formData.email);
      
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create user');
      }
      
      console.log('✅ User created successfully');
      await fetchUsers(); // Reload users
      resetForm();
      setShowModal(false);
      
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'User created successfully!',
        confirmButtonText: 'OK',
        confirmButtonColor: '#dc2626'
      });
    } catch (error: unknown) {
      console.error('💥 User creation failed:', error);
      
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Failed to create user: ' + (error instanceof Error ? error.message : String(error)),
        confirmButtonText: 'OK',
        confirmButtonColor: '#dc2626'
      });
    } finally {
      setLoading(false);
    }
  };

  // Edit user
  const editUser = (user: User) => {
    setSelectedUser(user);
    setFormData({
      email: user.email,
      password: '', // Don't pre-fill password for security
      full_name: user.full_name,
      role: user.role,
      is_active: user.is_active,
    });
    setPasswordError(''); // Clear any previous password errors
    setShowModal(true);
  };

  // Update user
  const updateUser = async () => {
    if (!selectedUser) return;
    
    try {
      setLoading(true);
      console.log('🔄 Updating user:', selectedUser.id);
      
      const updateData: Record<string, unknown> = {
        full_name: formData.full_name,
        role: formData.role,
        is_active: formData.is_active,
      };

      // Only include password if it's provided
      if (formData.password.trim()) {
        updateData.password = formData.password;
      }

      const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });
      
      if (!response.ok) {
        let errorMessage = 'Failed to update user';
        
        // Clone the response to read it multiple times if needed
        const responseClone = response.clone();
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          try {
            const textResponse = await responseClone.text();
            console.error('Response was not JSON:', textResponse);
            errorMessage = `HTTP ${response.status}: ${response.statusText}`;
          } catch {
            errorMessage = `HTTP ${response.status}: ${response.statusText}`;
          }
        }
        throw new Error(errorMessage);
      }
      
      const result = await response.json();
      console.log('✅ User updated successfully:', result);
      
      setShowModal(false);
      resetForm();
      await fetchUsers(); // Reload users
      
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'User updated successfully!',
        confirmButtonText: 'OK',
        confirmButtonColor: '#dc2626'
      });
    } catch (error: unknown) {
      console.error('💥 User update failed:', error);
      
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Failed to update user: ' + (error instanceof Error ? error.message : String(error)),
        confirmButtonText: 'OK',
        confirmButtonColor: '#dc2626'
      });
    } finally {
      setLoading(false);
    }
  };

  // Logout user from all devices
  const logoutUser = async (userId: string, userEmail: string) => {
    const result = await Swal.fire({
      title: 'Force Logout User?',
      html: `
        <p>This will immediately sign out <strong>${userEmail}</strong> from all devices.</p>
        <p><strong>Important:</strong> Their password will be reset as part of the logout process.</p>
        <p>You will need to set a new password for them afterward.</p>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, logout & reset password!'
    });

    if (!result.isConfirmed) return;
    
    try {
      setLoading(true);
      console.log('🚪 Logging out user:', userId);
      
      const response = await fetch(`/api/admin/users/${userId}/logout`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        let errorMessage = 'Failed to logout user';
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }
      
      const result = await response.json();
      console.log('✅ User logged out successfully:', result);
      
      // Show appropriate success message based on whether password was reset
      if (result.requires_password_reset) {
        Swal.fire({
          icon: 'success',
          title: 'User Logged Out!',
          html: `
            <p><strong>${userEmail}</strong> has been signed out from all devices.</p>
            <p><strong>Password Reset:</strong> Their password has been changed.</p>
            <p>You can now set a new password using the Edit button.</p>
          `,
          confirmButtonText: 'OK',
          confirmButtonColor: '#dc2626'
        });
      } else {
        Swal.fire({
          icon: 'success',
          title: 'Logged Out!',
          text: 'User has been signed out from all devices.',
          confirmButtonText: 'OK',
          confirmButtonColor: '#dc2626'
        });
      }
    } catch (error: unknown) {
      console.error('💥 User logout failed:', error);
      
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Failed to logout user: ' + (error instanceof Error ? error.message : String(error)),
        confirmButtonText: 'OK',
        confirmButtonColor: '#dc2626'
      });
    } finally {
      setLoading(false);
    }
  };

  // Delete user
  const deleteUser = async (userId: string) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "This action cannot be undone!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!'
    });

    if (!result.isConfirmed) return;
    
    try {
      setLoading(true);
      console.log('🗑️ Deleting user:', userId);
      
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        let errorMessage = 'Failed to delete user';
        
        // Clone the response to read it multiple times if needed
        const responseClone = response.clone();
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          // If we can't parse JSON, try to read as text
          try {
            const textResponse = await responseClone.text();
            console.error('Response was not JSON:', textResponse);
            errorMessage = `HTTP ${response.status}: ${response.statusText}`;
          } catch {
            errorMessage = `HTTP ${response.status}: ${response.statusText}`;
          }
        }
        throw new Error(errorMessage);
      }
      
      const result = await response.json();
      console.log('✅ User deleted successfully:', result);
      await fetchUsers(); // Reload users
      
      Swal.fire({
        icon: 'success',
        title: 'Deleted!',
        text: 'User has been deleted successfully.',
        confirmButtonText: 'OK',
        confirmButtonColor: '#dc2626'
      });
    } catch (error: unknown) {
      console.error('💥 User deletion failed:', error);
      
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Failed to delete user: ' + (error instanceof Error ? error.message : String(error)),
        confirmButtonText: 'OK',
        confirmButtonColor: '#dc2626'
      });
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      full_name: '',
      role: 'user',
      is_active: true,
    });
    setSelectedUser(null);
    setShowPassword(false);
    setPasswordError('');
  };

  // Helper function to check if user is logged in
  const isUserLoggedIn = (user: User): boolean => {
    // More realistic online detection:
    // Users are considered "online" if they logged in recently
    
    if (!user.last_sign_in_at) {
      // User has never logged in
      return false;
    }
    
    const lastSignIn = new Date(user.last_sign_in_at);
    const now = new Date();
    
    // Consider user online if they logged in within the last 30 minutes
    const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);
    const isRecent = lastSignIn > thirtyMinutesAgo;
    
    return isRecent;
  };

  // Filter users
  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Load users on mount
  useEffect(() => {
    if (isAuthenticated && canAccessUserManagement) {
      fetchUsers();
    }
  }, [isAuthenticated, canAccessUserManagement]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUser) {
      await updateUser();
    } else {
      await createUser();
    }
  };

  if (!isAuthenticated || !canAccessUserManagement) {
    return null; // Will redirect
  }

  return (
    <div className="space-y-6">
      {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-3xl font-bold transition-colors ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              User Management
            </h1>
            <p className={`text-sm mt-1 transition-colors ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Manage user accounts and permissions
            </p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            disabled={loading}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 cursor-pointer"
          >
            Add User
          </button>
        </div>

        {/* Search */}
        <div className={`p-6 rounded-xl shadow-lg transition-colors ${
          isDark ? 'bg-gray-800' : 'bg-white'
        }`}>
          <input
            type="text"
            placeholder="Search users by email or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full px-4 py-3 rounded-lg border transition-colors ${
              isDark 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          />
        </div>

        {/* Users Table */}
        <div className={`rounded-xl shadow-lg overflow-hidden transition-colors ${
          isDark ? 'bg-gray-800' : 'bg-white'
        }`}>
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full mx-auto"></div>
              <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Loading users...
              </p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-8 text-center">
              <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {users.length === 0 ? 'No users yet' : 'No users match your search'}
              </p>
              {users.length === 0 && (
                <p className={`text-sm mt-2 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                  Get started by adding your first user
                </p>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                  <tr>
                    <th className={`px-6 py-4 text-left text-sm font-medium ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>User</th>
                    <th className={`px-6 py-4 text-left text-sm font-medium ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>Role</th>
                    <th className={`px-6 py-4 text-left text-sm font-medium ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>Status</th>
                    <th className={`px-6 py-4 text-left text-sm font-medium ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>Login Status</th>
                    <th className={`px-6 py-4 text-left text-sm font-medium ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>Created</th>
                    <th className={`px-6 py-4 text-left text-sm font-medium ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>Actions</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className={`hover:${isDark ? 'bg-gray-700' : 'bg-gray-50'} transition-colors`}>
                      <td className="px-6 py-4">
                        <div>
                          <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {user.full_name}
                          </div>
                          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {user.email}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.role === 'admin' 
                            ? 'bg-red-500/10 text-red-500' 
                            : user.role === 'moderator'
                            ? 'bg-blue-500/10 text-blue-500'
                            : 'bg-gray-500/10 text-gray-500'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.is_active 
                            ? 'bg-green-500/10 text-green-500' 
                            : 'bg-red-500/10 text-red-500'
                        }`}>
                          {user.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          isUserLoggedIn(user)
                            ? 'bg-green-500/10 text-green-500' 
                            : 'bg-gray-500/10 text-gray-500'
                        }`}>
                          {isUserLoggedIn(user) ? 'Online' : 'Offline'}
                        </span>
                        {user.last_sign_in_at && (
                          <div className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                            Last: {new Date(user.last_sign_in_at).toLocaleDateString()}
                          </div>
                        )}
                      </td>
                      <td className={`px-6 py-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => editUser(user)}
                            disabled={loading}
                            className="text-blue-500 hover:text-blue-700 text-sm font-medium disabled:opacity-50 transition-colors cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => logoutUser(user.id, user.email)}
                            disabled={loading}
                            className="text-orange-500 hover:text-orange-700 text-sm font-medium disabled:opacity-50 transition-colors cursor-pointer"
                            title="Force logout user from all devices"
                          >
                            Logout
                          </button>
                          <button
                            onClick={() => deleteUser(user.id)}
                            disabled={loading}
                            className="text-red-500 hover:text-red-700 text-sm font-medium disabled:opacity-50 transition-colors cursor-pointer"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      {/* Add User Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[9999] overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center px-4 py-6">
            <div 
              className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
              onClick={() => setShowModal(false)}
            />
            
            <div className={`relative w-full max-w-md transform rounded-2xl shadow-2xl transition-all ${
              isDark ? 'bg-gray-800' : 'bg-white'
            }`}>
              {/* Modal Header */}
              <div className={`px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {selectedUser ? 'Edit User' : 'Add New User'}
                </h3>
                <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {selectedUser ? 'Update user information' : 'Create a new user account'}
                </p>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {/* Email */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                    disabled={loading || !!selectedUser}
                    className={`w-full px-4 py-3 rounded-xl border transition-all ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } ${selectedUser ? 'opacity-50' : ''}`}
                    placeholder="user@example.com"
                  />
                  {selectedUser && (
                    <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Email cannot be changed for existing users
                    </p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Password {selectedUser && <span className="text-sm font-normal">(leave empty to keep current)</span>}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => handlePasswordChange(e.target.value)}
                      required={!selectedUser}
                      disabled={loading}
                      className={`w-full px-4 py-3 pr-12 rounded-xl border transition-all ${
                        passwordError 
                          ? (isDark ? 'bg-gray-700 border-red-500 text-white' : 'bg-white border-red-500 text-gray-900')
                          : (isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900')
                      }`}
                      placeholder={selectedUser ? "Enter new password (optional)" : "Enter password"}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={`absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer ${
                        isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {showPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  
                  {/* Password Error Message */}
                  {passwordError && (
                    <p className="text-xs mt-1 text-red-500">
                      {passwordError}
                    </p>
                  )}
                  
                  {/* Password Strength Indicator */}
                  {formData.password && !passwordError && (
                    <div className="mt-2">
                      <div className="flex items-center space-x-2">
                        <div className="flex-1">
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-300 ${
                                formData.password.length >= 12 ? 'bg-green-500 w-full' :
                                formData.password.length >= 8 ? 'bg-yellow-500 w-3/4' :
                                formData.password.length >= 6 ? 'bg-orange-500 w-1/2' :
                                'bg-red-500 w-1/4'
                              }`}
                            />
                          </div>
                        </div>
                        <span className={`text-xs ${
                          formData.password.length >= 12 ? 'text-green-500' :
                          formData.password.length >= 8 ? 'text-yellow-500' :
                          formData.password.length >= 6 ? 'text-orange-500' :
                          'text-red-500'
                        }`}>
                          {formData.password.length >= 12 ? 'Strong' :
                           formData.password.length >= 8 ? 'Good' :
                           formData.password.length >= 6 ? 'Fair' :
                           'Weak'}
                        </span>
                      </div>
                      <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        Requirements: 6+ characters, mix of uppercase, lowercase, numbers, or symbols
                      </p>
                    </div>
                  )}
                  
                  {selectedUser && !formData.password && (
                    <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Only enter a password if you want to change it
                    </p>
                  )}
                </div>

                {/* Full Name */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                    required
                    disabled={loading}
                    className={`w-full px-4 py-3 rounded-xl border transition-all ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="John Doe"
                  />
                </div>

                {/* Role */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Role
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value as UserRole})}
                    disabled={loading}
                    className={`w-full px-4 py-3 rounded-xl border transition-all ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="user">User</option>
                    <option value="moderator">Moderator</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                {/* Status */}
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                    disabled={loading}
                    className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                  />
                  <label htmlFor="is_active" className={`text-sm font-medium ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Active user
                  </label>
                </div>

                {/* Modal Footer */}
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    disabled={loading}
                    className={`flex-1 px-4 py-3 rounded-xl font-medium transition-colors disabled:opacity-50 cursor-pointer ${
                      isDark 
                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !isFormValid()}
                    className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {loading 
                      ? (selectedUser ? 'Updating...' : 'Creating...') 
                      : (selectedUser ? 'Update User' : 'Create User')
                    }
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}