"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/stores/auth-clean';
import { useTheme } from '@/providers/ThemeProvider';

export default function AdminSettingsOverview() {
  const { isAuthenticated, canAccessSettings } = useAuth();
  const { isDark } = useTheme();
  const router = useRouter();

  // Redirect if not authenticated or no permission
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    } else if (!canAccessSettings) {
      router.replace('/admin');
    }
  }, [isAuthenticated, canAccessSettings, router]);

  // Don't render if not authenticated or no permission
  if (!isAuthenticated || !canAccessSettings) {
    return null;
  }

  const settingsCategories = [
    // Main Categories
    {
      title: 'Header',
      description: 'Configure navigation menu, logo, and header controls',
      href: '/admin/settings/header',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
        </svg>
      ),
      color: 'bg-blue-500',
    },
    {
      title: 'Home Page',
      description: 'Configure all sections of the home page',
      href: '/admin/settings/home',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      color: 'bg-purple-500',
    },
    {
      title: 'Footer',
      description: 'Manage footer content, links, and social media',
      href: '/admin/settings/footer',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      color: 'bg-green-500',
    },
    {
      title: 'Menu Management',
      description: 'Create and organize navigation menus',
      href: '/admin/settings/menu',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      ),
      color: 'bg-red-500',
    },
    
    // Homepage Settings Sub-pages
    {
      title: 'Hero Section',
      description: 'Configure carousel, slides, animations, and CTA buttons',
      href: '/admin/settings/homepage/hero',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
      color: 'bg-pink-500',
      category: 'Homepage'
    },
    {
      title: 'Great Leaders',
      description: 'Manage leader profiles, carousel behavior, and visual effects',
      href: '/admin/settings/homepage/leaders',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      color: 'bg-indigo-500',
      category: 'Homepage'
    },
    {
      title: 'Events Section',
      description: 'Configure event display, categories, and visual styling',
      href: '/admin/settings/homepage/events',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      color: 'bg-yellow-500',
      category: 'Homepage'
    },
    {
      title: 'About Section',
      description: 'Customize about content, video settings, and layout',
      href: '/admin/settings/homepage/about',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'bg-teal-500',
      category: 'Homepage'
    },
    {
      title: 'Photo Gallery',
      description: 'Manage gallery images, lightbox, and grid layouts',
      href: '/admin/settings/homepage/gallery',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      color: 'bg-emerald-500',
      category: 'Homepage'
    },
    {
      title: 'Blog Section',
      description: 'Configure blog post display and categorization',
      href: '/admin/settings/homepage/blog',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
      ),
      color: 'bg-cyan-500',
      category: 'Homepage'
    },
    {
      title: 'Video Gallery',
      description: 'Manage video content and thumbnail settings',
      href: '/admin/settings/homepage/videos',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
      color: 'bg-violet-500',
      category: 'Homepage'
    },

    // System Settings Sub-pages
    {
      title: 'Global Theme',
      description: 'Configure overall theme colors and dark/light mode',
      href: '/admin/settings/system/theme',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
        </svg>
      ),
      color: 'bg-slate-500',
      category: 'System'
    },
    {
      title: 'Typography',
      description: 'Font families, sizes, weights, and text styling',
      href: '/admin/settings/system/typography',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 4h12M6 8h12m-6 4h6m-6 4h6" />
        </svg>
      ),
      color: 'bg-gray-500',
      category: 'System'
    },
    {
      title: 'Colors',
      description: 'Primary, secondary, and accent color palettes',
      href: '/admin/settings/system/colors',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
        </svg>
      ),
      color: 'bg-rose-500',
      category: 'System'
    },
    {
      title: 'Animations',
      description: 'Configure animation timing, effects, and transitions',
      href: '/admin/settings/system/animations',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      color: 'bg-amber-500',
      category: 'System'
    },
    {
      title: 'Layout & Spacing',
      description: 'Container widths, padding, margins, and grid systems',
      href: '/admin/settings/system/layout',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
        </svg>
      ),
      color: 'bg-lime-500',
      category: 'System'
    },
    {
      title: 'Responsive Breakpoints',
      description: 'Mobile, tablet, and desktop screen size settings',
      href: '/admin/settings/system/responsive',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
      color: 'bg-sky-500',
      category: 'System'
    },
    {
      title: 'Accessibility',
      description: 'Screen reader support, contrast ratios, and navigation',
      href: '/admin/settings/system/accessibility',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      color: 'bg-fuchsia-500',
      category: 'System'
    },
    {
      title: 'Performance',
      description: 'Image optimization, caching, and loading strategies',
      href: '/admin/settings/system/performance',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      color: 'bg-orange-600',
      category: 'System'
    },
    {
      title: 'Social Media',
      description: 'Social platform integration and sharing options',
      href: '/admin/settings/system/social',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
      ),
      color: 'bg-blue-600',
      category: 'System'
    },
    {
      title: 'SEO Settings',
      description: 'Meta tags, structured data, and search optimization',
      href: '/admin/settings/system/seo',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
      color: 'bg-green-600',
      category: 'System'
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`p-6 rounded-xl shadow-lg transition-colors ${
        isDark ? 'bg-gray-800' : 'bg-white'
      }`}>
        <h2 className={`text-2xl font-bold mb-2 transition-colors ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>
          Website Settings
        </h2>
        <p className={`transition-colors ${
          isDark ? 'text-gray-400' : 'text-gray-600'
        }`}>
          Configure all aspects of your website appearance and functionality
        </p>
      </div>

      {/* Main Categories */}
      <div className={`p-6 rounded-xl shadow-lg transition-colors ${
        isDark ? 'bg-gray-800' : 'bg-white'
      }`}>
        <h3 className={`text-xl font-bold mb-4 transition-colors ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>
          Main Settings Categories
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {settingsCategories.filter(category => !category.category).map((category, index) => (
            <Link
              key={index}
              href={category.href}
              className={`group relative overflow-hidden rounded-xl shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl ${
                isDark ? 'bg-gray-700' : 'bg-gray-50'
              }`}
            >
              <div className="p-6">
                <div className={`w-16 h-16 ${category.color} rounded-xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  {category.icon}
                </div>
                <h4 className={`text-lg font-bold mb-2 transition-colors ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  {category.title}
                </h4>
                <p className={`text-sm transition-colors ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {category.description}
                </p>
              </div>
              <div className={`absolute inset-x-0 bottom-0 h-1 ${category.color} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300`}></div>
            </Link>
          ))}
        </div>
      </div>

      {/* Homepage Settings */}
      <div className={`p-6 rounded-xl shadow-lg transition-colors ${
        isDark ? 'bg-gray-800' : 'bg-white'
      }`}>
        <h3 className={`text-xl font-bold mb-4 transition-colors ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>
          Homepage Settings
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {settingsCategories.filter(category => category.category === 'Homepage').map((category, index) => (
            <Link
              key={index}
              href={category.href}
              className={`group relative overflow-hidden rounded-xl shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl ${
                isDark ? 'bg-gray-700' : 'bg-gray-50'
              }`}
            >
              <div className="p-4">
                <div className={`w-12 h-12 ${category.color} rounded-lg flex items-center justify-center text-white mb-3 group-hover:scale-110 transition-transform duration-300`}>
                  {React.cloneElement(category.icon, { className: "w-6 h-6" })}
                </div>
                <h4 className={`text-base font-bold mb-2 transition-colors ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  {category.title}
                </h4>
                <p className={`text-xs transition-colors ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {category.description}
                </p>
              </div>
              <div className={`absolute inset-x-0 bottom-0 h-1 ${category.color} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300`}></div>
            </Link>
          ))}
        </div>
      </div>

      {/* System Settings */}
      <div className={`p-6 rounded-xl shadow-lg transition-colors ${
        isDark ? 'bg-gray-800' : 'bg-white'
      }`}>
        <h3 className={`text-xl font-bold mb-4 transition-colors ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>
          System Settings
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {settingsCategories.filter(category => category.category === 'System').map((category, index) => (
            <Link
              key={index}
              href={category.href}
              className={`group relative overflow-hidden rounded-xl shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl ${
                isDark ? 'bg-gray-700' : 'bg-gray-50'
              }`}
            >
              <div className="p-4">
                <div className={`w-12 h-12 ${category.color} rounded-lg flex items-center justify-center text-white mb-3 group-hover:scale-110 transition-transform duration-300`}>
                  {React.cloneElement(category.icon, { className: "w-6 h-6" })}
                </div>
                <h4 className={`text-base font-bold mb-2 transition-colors ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  {category.title}
                </h4>
                <p className={`text-xs transition-colors ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {category.description}
                </p>
              </div>
              <div className={`absolute inset-x-0 bottom-0 h-1 ${category.color} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300`}></div>
            </Link>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className={`p-6 rounded-xl shadow-lg transition-colors ${
        isDark ? 'bg-gray-800' : 'bg-white'
      }`}>
        <h3 className={`text-xl font-bold mb-4 transition-colors ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>
          Configuration Status
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className={`p-4 rounded-lg ${
            isDark ? 'bg-gray-700' : 'bg-gray-50'
          }`}>
            <p className={`text-sm font-medium transition-colors ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Total Settings Pages
            </p>
            <p className={`text-2xl font-bold transition-colors ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              {settingsCategories.length}
            </p>
          </div>
          <div className={`p-4 rounded-lg ${
            isDark ? 'bg-gray-700' : 'bg-gray-50'
          }`}>
            <p className={`text-sm font-medium transition-colors ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Main Categories
            </p>
            <p className="text-2xl font-bold text-blue-500">
              {settingsCategories.filter(category => !category.category).length}
            </p>
          </div>
          <div className={`p-4 rounded-lg ${
            isDark ? 'bg-gray-700' : 'bg-gray-50'
          }`}>
            <p className={`text-sm font-medium transition-colors ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Homepage Pages
            </p>
            <p className="text-2xl font-bold text-pink-500">
              {settingsCategories.filter(category => category.category === 'Homepage').length}
            </p>
          </div>
          <div className={`p-4 rounded-lg ${
            isDark ? 'bg-gray-700' : 'bg-gray-50'
          }`}>
            <p className={`text-sm font-medium transition-colors ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              System Pages
            </p>
            <p className="text-2xl font-bold text-orange-500">
              {settingsCategories.filter(category => category.category === 'System').length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}