"use client";

import { useEffect, useState } from 'react';
import { useTheme } from '@/providers/ThemeProvider';

interface UserStats {
  total: number;
  active: number;
  inactive: number;
  admins: number;
  moderators: number;
}

function AdminDashboardContent() {
  const { isDark } = useTheme();
  const [stats, setStats] = useState<UserStats>({
    total: 0,
    active: 0,
    inactive: 0,
    admins: 0,
    moderators: 0,
  });
  const [loading, setLoading] = useState(false);

  // Fetch user data and calculate stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        console.log('📊 Loading dashboard stats...');
        
        const response = await fetch('/api/admin/users');
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        const users = result.users || [];
        
        // Calculate stats
        const newStats = {
          total: users.length,
          active: users.filter((u: any) => u.is_active).length,
          inactive: users.filter((u: any) => !u.is_active).length,
          admins: users.filter((u: any) => u.role === 'admin').length,
          moderators: users.filter((u: any) => u.role === 'moderator').length,
        };
        
        setStats(newStats);
        console.log('✅ Dashboard stats loaded:', newStats);
      } catch (error: any) {
        console.error('💥 Failed to load dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: 'Total Users',
      value: stats.total,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      color: 'blue',
      bgColor: isDark ? 'bg-blue-500/10' : 'bg-blue-500/10',
      textColor: 'text-blue-500',
    },
    {
      title: 'Active Users',
      value: stats.active,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'green',
      bgColor: isDark ? 'bg-green-500/10' : 'bg-green-500/10',
      textColor: 'text-green-500',
    },
    {
      title: 'Inactive Users',
      value: stats.inactive,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'red',
      bgColor: isDark ? 'bg-red-500/10' : 'bg-red-500/10',
      textColor: 'text-red-500',
    },
    {
      title: 'Administrators',
      value: stats.admins,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      color: 'purple',
      bgColor: isDark ? 'bg-purple-500/10' : 'bg-purple-500/10',
      textColor: 'text-purple-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className={`p-6 rounded-xl shadow-lg transition-colors ${
          isDark ? 'bg-gray-800' : 'bg-white'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className={`text-2xl font-bold mb-2 transition-colors ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                Welcome to Admin Dashboard
              </h2>
              <p className={`transition-colors ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Manage your political campaign website from here
              </p>
            </div>
            <div className={`p-3 rounded-lg ${
              isDark ? 'bg-red-600/10' : 'bg-red-500/10'
            }`}>
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => (
            <div
              key={index}
              className={`p-6 rounded-xl shadow-lg transition-all duration-300 hover:scale-105 transform ${
                isDark ? 'bg-gray-800' : 'bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <div className={stat.textColor}>
                    {stat.icon}
                  </div>
                </div>
                <span className={`text-3xl font-bold transition-colors ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  {stat.value}
                </span>
              </div>
              <h3 className={`text-sm font-medium transition-colors ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {stat.title}
              </h3>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className={`p-6 rounded-xl shadow-lg transition-colors ${
          isDark ? 'bg-gray-800' : 'bg-white'
        }`}>
          <h3 className={`text-xl font-bold mb-6 transition-colors ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {/* User Management */}
            <a
              href="/admin/users"
              className={`group p-6 rounded-lg border-2 border-dashed transition-all duration-200 hover:scale-105 text-center ${
                isDark 
                  ? 'border-gray-600 hover:border-red-600 hover:bg-gray-700' 
                  : 'border-gray-300 hover:border-red-500 hover:bg-gray-50'
              }`}
            >
              <svg className={`w-8 h-8 mx-auto mb-3 transition-colors ${
                isDark ? 'text-gray-400 group-hover:text-red-500' : 'text-gray-600 group-hover:text-red-500'
              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <span className={`font-medium transition-colors ${
                isDark ? 'text-gray-300 group-hover:text-red-500' : 'text-gray-700 group-hover:text-red-500'
              }`}>
                Manage Users
              </span>
              <p className={`text-sm mt-2 transition-colors ${
                isDark ? 'text-gray-500' : 'text-gray-500'
              }`}>
                Add, edit, and manage user accounts
              </p>
            </a>

            {/* Content Management */}
            <a
              href="/admin/content"
              className={`group p-6 rounded-lg border-2 border-dashed transition-all duration-200 hover:scale-105 text-center ${
                isDark 
                  ? 'border-gray-600 hover:border-green-600 hover:bg-gray-700' 
                  : 'border-gray-300 hover:border-green-500 hover:bg-gray-50'
              }`}
            >
              <svg className={`w-8 h-8 mx-auto mb-3 transition-colors ${
                isDark ? 'text-gray-400 group-hover:text-green-500' : 'text-gray-600 group-hover:text-green-500'
              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span className={`font-medium transition-colors ${
                isDark ? 'text-gray-300 group-hover:text-green-500' : 'text-gray-700 group-hover:text-green-500'
              }`}>
                Content Management
              </span>
              <p className={`text-sm mt-2 transition-colors ${
                isDark ? 'text-gray-500' : 'text-gray-500'
              }`}>
                Manage news, events, and gallery
              </p>
            </a>

            {/* Analytics */}
            <a
              href="/admin/analytics"
              className={`group p-6 rounded-lg border-2 border-dashed transition-all duration-200 hover:scale-105 text-center ${
                isDark 
                  ? 'border-gray-600 hover:border-blue-600 hover:bg-gray-700' 
                  : 'border-gray-300 hover:border-blue-500 hover:bg-gray-50'
              }`}
            >
              <svg className={`w-8 h-8 mx-auto mb-3 transition-colors ${
                isDark ? 'text-gray-400 group-hover:text-blue-500' : 'text-gray-600 group-hover:text-blue-500'
              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className={`font-medium transition-colors ${
                isDark ? 'text-gray-300 group-hover:text-blue-500' : 'text-gray-700 group-hover:text-blue-500'
              }`}>
                Analytics
              </span>
              <p className={`text-sm mt-2 transition-colors ${
                isDark ? 'text-gray-500' : 'text-gray-500'
              }`}>
                View website statistics and reports
              </p>
            </a>

          </div>
        </div>

        {/* Recent Activity */}
        <div className={`p-6 rounded-xl shadow-lg transition-colors ${
          isDark ? 'bg-gray-800' : 'bg-white'
        }`}>
          <h3 className={`text-xl font-bold mb-4 transition-colors ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            System Status
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Database Connection
                </span>
              </div>
              <span className="text-green-500 text-sm font-medium">Online</span>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Authentication Service
                </span>
              </div>
              <span className="text-green-500 text-sm font-medium">Active</span>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-lg bg-blue-500/10">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Last Backup
                </span>
              </div>
              <span className="text-blue-500 text-sm font-medium">24 hours ago</span>
            </div>
          </div>
        </div>
      </div>
  );
}

export default function AdminDashboard() {
  return <AdminDashboardContent />;
}