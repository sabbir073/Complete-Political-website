"use client";

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth, useAuthActions } from '@/stores/auth-clean';
import { useTheme } from '@/providers/ThemeProvider';
import { useLanguage } from '@/providers/LanguageProvider';
import Image from 'next/image';
import Link from 'next/link';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<{ [key: string]: boolean }>({});
  const { user, profile, isAuthenticated, isAdmin, canAccessUserManagement, canAccessSettings, canAccessContent, initialized, loading } = useAuth();
  const { signOut } = useAuthActions();
  const { isDark, toggleTheme } = useTheme();
  const { language, changeLanguage } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();

  // Debug profile and permissions
  useEffect(() => {
    console.log('🔍 Admin Layout Debug:', {
      user: user?.email,
      profile: profile,
      role: profile?.role,
      isAdmin,
      canAccessUserManagement,
      canAccessSettings,
      canAccessContent
    });
  }, [user, profile, isAdmin, canAccessUserManagement, canAccessSettings, canAccessContent]);

  // Check auth status after initialization
  useEffect(() => {
    // Only check after auth is initialized
    if (initialized && !loading) {
      if (!isAuthenticated) {
        console.log('🔒 Not authenticated, redirecting to login');
        router.replace('/login');
      } else if (profile && !profile.is_active) {
        console.log('❌ User is inactive, signing out and redirecting to login');
        // Sign out the inactive user to clear session
        signOut().then(() => {
          router.replace('/login');
        });
      }
    }
  }, [initialized, loading, isAuthenticated, profile, router, signOut]);

  // Show loading while auth is being checked
  if (!initialized || loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${isDark ? 'bg-gray-900' : 'bg-gradient-to-br from-gray-50 to-gray-100'
        }`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Loading...
          </p>
        </div>
      </div>
    );
  }

  // Show loading while redirecting if not authenticated
  if (!isAuthenticated) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${isDark ? 'bg-gray-900' : 'bg-gradient-to-br from-gray-50 to-gray-100'
        }`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Redirecting to login...
          </p>
        </div>
      </div>
    );
  }

  // Show loading while signing out inactive user
  if (profile && !profile.is_active) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${isDark ? 'bg-gray-900' : 'bg-gradient-to-br from-gray-50 to-gray-100'
        }`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Account inactive. Signing out...
          </p>
        </div>
      </div>
    );
  }

  // Define menu items based on user role
  const allMenuItems = [
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      label: 'Dashboard',
      href: '/admin',
      access: 'all', // All authenticated users
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      label: 'User Management',
      href: '/admin/users',
      access: 'admin', // Admin only
      show: canAccessUserManagement,
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      label: 'Contents',
      href: '/admin/content',
      access: 'moderator+',
      show: canAccessContent,
      isDropdown: true,
      expandOnly: false,
      subItems: [
        {
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          ),
          label: 'Events',
          href: '/admin/content/events',
        },
        {
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
          ),
          label: 'News',
          href: '/admin/content/news',
        },
        {
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          ),
          label: 'Photo Gallery',
          href: '/admin/content/photo-gallery/albums',
        },
        {
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          ),
          label: 'Video Gallery',
          href: '/admin/content/video-gallery',
        },
        {
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          ),
          label: 'Categories',
          href: '/admin/content/categories',
        },
      ]
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      label: 'Services',
      href: '/admin/services',
      access: 'moderator+',
      show: canAccessContent,
      isDropdown: true,
      expandOnly: false,
      subItems: [
        {
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          ),
          label: 'Contacts',
          href: '/admin/services/contacts',
        },
        {
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          ),
          label: 'Complaints',
          href: '/admin/services/complaints',
        },
        {
          icon: (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          ),
          label: 'Blood Hub',
          href: '/admin/services/blood-hub',
        },
        {
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          ),
          label: 'Emergency SOS',
          href: '/admin/services/emergency',
        },
      ]
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      label: 'Media Manager',
      href: '/admin/media',
      access: 'moderator+', // Moderator and Admin
      show: canAccessContent,
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      label: 'Analytics',
      href: '/admin/analytics',
      access: 'all', // All authenticated users
      show: true,
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      label: 'Profile',
      href: '/admin/profile',
      access: 'all', // All authenticated users can access their profile
      show: true,
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      label: 'Settings',
      href: '/admin/settings',
      access: 'admin', // Admin only
      show: canAccessSettings,
      isDropdown: true,
      subItems: [
        {
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
            </svg>
          ),
          label: 'Header',
          href: '/admin/settings/header',
        },
        {
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          ),
          label: 'Footer',
          href: '/admin/settings/footer',
        },
        {
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          ),
          label: 'Homepage',
          href: null, // No page - expansion only
          isDropdown: true,
          expandOnly: true, // Flag to indicate this is expansion-only
          subItems: [
            { label: 'Hero Section', href: '/admin/settings/homepage/hero' },
            { label: 'Great Leaders', href: '/admin/settings/homepage/leaders' },
            { label: 'Events Section', href: '/admin/settings/homepage/events' },
            { label: 'About Section', href: '/admin/settings/homepage/about' },
            { label: 'Photo Gallery', href: '/admin/settings/homepage/gallery' },
            { label: 'Blog Section', href: '/admin/settings/homepage/blog' },
            { label: 'Video Gallery', href: '/admin/settings/homepage/videos' },
          ]
        },
        {
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
          ),
          label: 'System',
          href: null, // No page - expansion only
          isDropdown: true,
          expandOnly: true, // Flag to indicate this is expansion-only
          subItems: [
            { label: 'Global Theme', href: '/admin/settings/system/theme' },
            { label: 'Typography', href: '/admin/settings/system/typography' },
            { label: 'Colors', href: '/admin/settings/system/colors' },
            { label: 'Animations', href: '/admin/settings/system/animations' },
            { label: 'Layout & Spacing', href: '/admin/settings/system/layout' },
            { label: 'Responsive Breakpoints', href: '/admin/settings/system/responsive' },
            { label: 'Accessibility', href: '/admin/settings/system/accessibility' },
            { label: 'Performance', href: '/admin/settings/system/performance' },
            { label: 'Social Media', href: '/admin/settings/system/social' },
            { label: 'SEO Settings', href: '/admin/settings/system/seo' },
          ]
        },
        {
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          ),
          label: 'Menu Management',
          href: '/admin/settings/menu',
        },
      ]
    },
  ];

  // Filter menu items based on user permissions
  const menuItems = allMenuItems.filter(item => item.show !== false);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/login');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const toggleMenuExpansion = (menuLabel: string) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuLabel]: !prev[menuLabel]
    }));
  };

  return (
    <div className={`min-h-screen transition-colors ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Sidebar for desktop */}
      <aside className={`fixed inset-y-0 left-0 z-10 w-64 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 ${isDark ? 'bg-gray-800' : 'bg-white'
        } shadow-xl`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'
            }`}>
            <div className="flex items-center space-x-3">
              <Image
                src="/logo.png"
                alt="Logo"
                width={40}
                height={30}
                style={{ width: 'auto', height: '30px' }}
                priority
              />
              <span className={`font-bold text-lg transition-colors ${isDark ? 'text-white' : 'text-gray-900'
                }`}>
                Admin Panel
              </span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className={`lg:hidden p-1 rounded-lg transition-colors ${isDark ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {menuItems.map((item, index) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              const isExpanded = expandedMenus[item.label];

              if (item.isDropdown && item.subItems) {
                return (
                  <div key={index}>
                    <div className={`flex items-center px-4 py-3 rounded-lg transition-all duration-200 cursor-pointer ${isActive
                        ? isDark
                          ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                          : 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                        : isDark
                          ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}>
                      {item.expandOnly ? (
                        // Expansion only - clicking anywhere toggles
                        <div
                          className="flex-1 flex items-center space-x-3"
                          onClick={() => toggleMenuExpansion(item.label)}
                        >
                          {item.icon}
                          <span className="font-medium">{item.label}</span>
                        </div>
                      ) : (
                        // Normal navigation + expansion
                        <Link
                          href={item.href}
                          className="flex-1 flex items-center space-x-3"
                          onClick={() => setSidebarOpen(false)}
                        >
                          {item.icon}
                          <span className="font-medium">{item.label}</span>
                        </Link>
                      )}
                      <button
                        onClick={() => toggleMenuExpansion(item.label)}
                        className="p-1 -mr-1 hover:bg-black/10 rounded transition-colors duration-200"
                      >
                        <svg
                          className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''
                            }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>

                    {/* Dropdown Items */}
                    {isExpanded && (
                      <div className="mt-2 ml-4 space-y-1">
                        {item.subItems.map((subItem: any, subIndex: number) => {
                          const subIsActive = pathname === subItem.href || pathname.startsWith(subItem.href + '/');
                          const subIsExpanded = expandedMenus[subItem.label];

                          if (subItem.isDropdown && subItem.subItems) {
                            return (
                              <div key={subIndex}>
                                <div className={`flex items-center px-3 py-2 rounded-lg transition-all duration-200 cursor-pointer ${subIsActive
                                    ? isDark
                                      ? 'bg-red-600/80 text-white'
                                      : 'bg-red-600/80 text-white'
                                    : isDark
                                      ? 'text-gray-400 hover:bg-gray-700 hover:text-white'
                                      : 'text-gray-600 hover:bg-gray-100'
                                  }`}>
                                  {subItem.expandOnly ? (
                                    // Expansion only - clicking anywhere toggles
                                    <div
                                      className="flex-1 flex items-center space-x-2"
                                      onClick={() => toggleMenuExpansion(subItem.label)}
                                    >
                                      {subItem.icon && subItem.icon}
                                      <span className="font-medium">{subItem.label}</span>
                                    </div>
                                  ) : (
                                    // Normal navigation + expansion
                                    <Link
                                      href={subItem.href}
                                      className="flex-1 flex items-center space-x-2"
                                      onClick={() => setSidebarOpen(false)}
                                    >
                                      {subItem.icon && subItem.icon}
                                      <span className="font-medium">{subItem.label}</span>
                                    </Link>
                                  )}
                                  <button
                                    onClick={() => toggleMenuExpansion(subItem.label)}
                                    className="p-1 -mr-1 hover:bg-black/10 rounded transition-colors duration-200"
                                  >
                                    <svg
                                      className={`w-3 h-3 transition-transform duration-200 ${subIsExpanded ? 'rotate-180' : ''
                                        }`}
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                  </button>
                                </div>

                                {/* Third Level Items */}
                                {subIsExpanded && (
                                  <div className="mt-1 ml-6 space-y-1">
                                    {subItem.subItems.map((thirdItem: any, thirdIndex: number) => {
                                      const thirdIsActive = pathname === thirdItem.href;
                                      return (
                                        <Link
                                          key={thirdIndex}
                                          href={thirdItem.href}
                                          className={`block px-3 py-2 rounded-lg font-medium cursor-pointer transition-all duration-200 ${thirdIsActive
                                              ? isDark
                                                ? 'bg-red-600/60 text-white'
                                                : 'bg-red-600/60 text-white'
                                              : isDark
                                                ? 'text-gray-500 hover:bg-gray-700 hover:text-gray-300'
                                                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                                            }`}
                                          onClick={() => setSidebarOpen(false)}
                                        >
                                          {thirdItem.label}
                                        </Link>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            );
                          }

                          return (
                            <Link
                              key={subIndex}
                              href={subItem.href}
                              className={`flex items-center space-x-2 px-3 py-2 rounded-lg cursor-pointer transition-all duration-200 ${subIsActive
                                  ? isDark
                                    ? 'bg-red-600/80 text-white'
                                    : 'bg-red-600/80 text-white'
                                  : isDark
                                    ? 'text-gray-400 hover:bg-gray-700 hover:text-white'
                                    : 'text-gray-600 hover:bg-gray-100'
                                }`}
                              onClick={() => setSidebarOpen(false)}
                            >
                              {subItem.icon && subItem.icon}
                              <span className="font-medium">{subItem.label}</span>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <Link
                  key={index}
                  href={item.href}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive
                      ? isDark
                        ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                        : 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                      : isDark
                        ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  {item.icon}
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Info */}
          <div className={`p-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'
            }`}>
            <div className={`flex items-center justify-between p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'
              }`}>
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDark ? 'bg-red-600' : 'bg-red-600'
                  } text-white font-bold`}>
                  {profile?.email?.[0]?.toUpperCase() || 'A'}
                </div>
                <div>
                  <p className={`text-sm font-medium transition-colors ${isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                    {profile?.full_name || profile?.email || 'Admin'}
                  </p>
                  <p className={`text-xs transition-colors ${isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                    {profile?.role ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1) : 'User'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Top Bar */}
        <header className={`sticky top-0 z-30 transition-colors ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          } border-b shadow-sm`}>
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center space-x-4">
              {/* Mobile menu button */}
              <button
                onClick={() => setSidebarOpen(true)}
                className={`lg:hidden p-2 rounded-lg transition-colors ${isDark
                    ? 'text-gray-400 hover:bg-gray-700 hover:text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                  }`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              {/* Page Title */}
              <h1 className={`text-xl font-semibold transition-colors ${isDark ? 'text-white' : 'text-gray-900'
                }`}>
                {pathname === '/admin' ? 'Dashboard' :
                  pathname === '/admin/users' ? 'User Management' :
                    pathname === '/admin/content' ? 'Content Management' :
                      pathname === '/admin/media' ? 'Media Manager' :
                        pathname === '/admin/analytics' ? 'Analytics' :
                          pathname === '/admin/profile' ? 'My Profile' :
                            pathname.startsWith('/admin/settings') ? 'Settings' : 'Admin Panel'}
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-lg transition-colors ${isDark
                    ? 'text-gray-400 hover:bg-gray-700 hover:text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                  }`}
                title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDark ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>

              {/* Language Toggle */}
              <button
                onClick={() => changeLanguage(language === 'bn' ? 'en' : 'bn')}
                className={`px-3 py-1 rounded-lg font-medium transition-colors ${isDark
                    ? 'text-gray-400 hover:bg-gray-700 hover:text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                  }`}
                title="Switch language"
              >
                {language === 'bn' ? 'EN' : 'বাং'}
              </button>

              {/* Sign Out */}
              <button
                onClick={handleSignOut}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 cursor-pointer ${isDark
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-red-600 hover:bg-red-700 text-white'
                  }`}
                title="Sign out"
              >
                <span className="hidden sm:inline">Sign Out</span>
                <svg className="w-5 h-5 sm:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}