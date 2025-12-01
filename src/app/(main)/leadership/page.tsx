"use client";

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/providers/LanguageProvider';
import { useTheme } from '@/providers/ThemeProvider';

export default function LeadershipPage() {
    const { language } = useLanguage();
    const { isDark } = useTheme();

    return (
        <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
            {/* Hero Header */}
            <div className={`relative py-16 md:py-24 ${isDark ? 'bg-gray-800' : 'bg-gradient-to-r from-red-600 to-red-700'}`}>
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute inset-0 bg-black/20"></div>
                    <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
                    <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
                </div>
                <div className="relative max-w-7xl mx-auto px-6 md:px-16 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-white text-sm font-medium mb-4">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        {language === 'bn' ? 'নেতৃত্ব' : 'Leadership'}
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        {language === 'bn' ? 'নেতৃত্ব' : 'Leadership'}
                    </h1>
                    <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
                        {language === 'bn'
                            ? 'আমাদের দলের নেতৃত্ব এবং টিম মেম্বারদের সাথে পরিচিত হন'
                            : 'Meet our leadership and team members'
                        }
                    </p>
                </div>
            </div>

            {/* Breadcrumb */}
            <div className={`${isDark ? 'bg-gray-800/50' : 'bg-white'} border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="max-w-7xl mx-auto px-6 md:px-16 py-4">
                    <nav className="flex items-center gap-2 text-sm">
                        <Link href="/" className={`${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'} transition-colors`}>
                            {language === 'bn' ? 'হোম' : 'Home'}
                        </Link>
                        <span className={isDark ? 'text-gray-600' : 'text-gray-400'}>/</span>
                        <span className={isDark ? 'text-red-400' : 'text-red-600'}>
                            {language === 'bn' ? 'নেতৃত্ব' : 'Leadership'}
                        </span>
                    </nav>
                </div>
            </div>

            {/* Coming Soon Content */}
            <div className="max-w-4xl mx-auto px-6 md:px-16 py-24">
                <div className={`text-center rounded-2xl p-12 ${isDark ? 'bg-gray-800' : 'bg-white shadow-xl'}`}>
                    {/* Icon */}
                    <div className={`w-24 h-24 mx-auto mb-8 rounded-full flex items-center justify-center ${
                        isDark ? 'bg-red-900/30' : 'bg-red-100'
                    }`}>
                        <svg className={`w-12 h-12 ${isDark ? 'text-red-400' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    </div>

                    {/* Title */}
                    <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {language === 'bn' ? 'শীঘ্রই আসছে' : 'Coming Soon'}
                    </h2>

                    {/* Description */}
                    <p className={`text-lg mb-8 max-w-xl mx-auto ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {language === 'bn'
                            ? 'আমরা নেতৃত্ব পেজটি তৈরি করছি। শীঘ্রই আপনি আমাদের দলের নেতৃত্ব এবং টিম মেম্বারদের সম্পর্কে জানতে পারবেন।'
                            : 'We are building the Leadership page. Soon you will be able to learn about our team leadership and team members.'
                        }
                    </p>

                    {/* Features Preview */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                        <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                            <div className={`w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center ${
                                isDark ? 'bg-blue-900/30' : 'bg-blue-100'
                            }`}>
                                <svg className={`w-6 h-6 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {language === 'bn' ? 'প্রধান নেতা' : 'Key Leaders'}
                            </h3>
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                {language === 'bn' ? 'আমাদের প্রধান নেতৃবৃন্দ' : 'Our key leadership'}
                            </p>
                        </div>

                        <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                            <div className={`w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center ${
                                isDark ? 'bg-green-900/30' : 'bg-green-100'
                            }`}>
                                <svg className={`w-6 h-6 ${isDark ? 'text-green-400' : 'text-green-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            </div>
                            <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {language === 'bn' ? 'টিম মেম্বার' : 'Team Members'}
                            </h3>
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                {language === 'bn' ? 'আমাদের দল' : 'Our team'}
                            </p>
                        </div>

                        <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                            <div className={`w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center ${
                                isDark ? 'bg-orange-900/30' : 'bg-orange-100'
                            }`}>
                                <svg className={`w-6 h-6 ${isDark ? 'text-orange-400' : 'text-orange-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                            <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {language === 'bn' ? 'সংগঠন' : 'Organization'}
                            </h3>
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                {language === 'bn' ? 'আমাদের সংগঠন কাঠামো' : 'Our organizational structure'}
                            </p>
                        </div>
                    </div>

                    {/* Back Button */}
                    <Link
                        href="/"
                        className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                            isDark
                                ? 'bg-red-600 hover:bg-red-700 text-white'
                                : 'bg-red-600 hover:bg-red-700 text-white'
                        }`}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        {language === 'bn' ? 'হোম পেজে ফিরে যান' : 'Back to Home'}
                    </Link>
                </div>
            </div>
        </div>
    );
}
