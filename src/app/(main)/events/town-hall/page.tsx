"use client";

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/providers/LanguageProvider';
import { useTheme } from '@/providers/ThemeProvider';

export default function VirtualTownHallPage() {
    const { language } = useLanguage();
    const { isDark } = useTheme();

    return (
        <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
            {/* Hero Header */}
            <div className={`relative py-16 md:py-24 ${isDark ? 'bg-gray-800' : 'bg-gradient-to-r from-purple-600 to-purple-700'}`}>
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute inset-0 bg-black/20"></div>
                    <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
                    <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
                </div>
                <div className="relative max-w-7xl mx-auto px-6 md:px-16 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-white text-sm font-medium mb-4">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        {language === 'bn' ? 'ভার্চুয়াল মিটিং' : 'Virtual Meeting'}
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        {language === 'bn' ? 'ভার্চুয়াল টাউন হল' : 'Virtual Town Hall'}
                    </h1>
                    <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
                        {language === 'bn'
                            ? 'অনলাইনে আমাদের সাথে যোগ দিন এবং সরাসরি প্রশ্ন করুন'
                            : 'Join us online and ask questions directly'
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
                        <Link href="/events" className={`${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'} transition-colors`}>
                            {language === 'bn' ? 'ইভেন্ট' : 'Events'}
                        </Link>
                        <span className={isDark ? 'text-gray-600' : 'text-gray-400'}>/</span>
                        <span className={isDark ? 'text-purple-400' : 'text-purple-600'}>
                            {language === 'bn' ? 'ভার্চুয়াল টাউন হল' : 'Virtual Town Hall'}
                        </span>
                    </nav>
                </div>
            </div>

            {/* Coming Soon Content */}
            <div className="max-w-4xl mx-auto px-6 md:px-16 py-24">
                <div className={`text-center rounded-2xl p-12 ${isDark ? 'bg-gray-800' : 'bg-white shadow-xl'}`}>
                    {/* Icon */}
                    <div className={`w-24 h-24 mx-auto mb-8 rounded-full flex items-center justify-center ${
                        isDark ? 'bg-purple-900/30' : 'bg-purple-100'
                    }`}>
                        <svg className={`w-12 h-12 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                    </div>

                    {/* Title */}
                    <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {language === 'bn' ? 'শীঘ্রই আসছে' : 'Coming Soon'}
                    </h2>

                    {/* Description */}
                    <p className={`text-lg mb-8 max-w-xl mx-auto ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {language === 'bn'
                            ? 'আমরা ভার্চুয়াল টাউন হল ফিচারটি তৈরি করছি। শীঘ্রই আপনি অনলাইনে আমাদের মিটিংয়ে যোগ দিতে এবং সরাসরি প্রশ্ন করতে পারবেন।'
                            : 'We are building the Virtual Town Hall feature. Soon you will be able to join our meetings online and ask questions directly.'
                        }
                    </p>

                    {/* Features Preview */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                        <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                            <div className={`w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center ${
                                isDark ? 'bg-blue-900/30' : 'bg-blue-100'
                            }`}>
                                <svg className={`w-6 h-6 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                                </svg>
                            </div>
                            <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {language === 'bn' ? 'লাইভ প্রশ্নোত্তর' : 'Live Q&A'}
                            </h3>
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                {language === 'bn' ? 'সরাসরি প্রশ্ন করুন' : 'Ask questions directly'}
                            </p>
                        </div>

                        <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                            <div className={`w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center ${
                                isDark ? 'bg-green-900/30' : 'bg-green-100'
                            }`}>
                                <svg className={`w-6 h-6 ${isDark ? 'text-green-400' : 'text-green-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            </div>
                            <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {language === 'bn' ? 'লাইভ স্ট্রিমিং' : 'Live Streaming'}
                            </h3>
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                {language === 'bn' ? 'যেকোনো জায়গা থেকে দেখুন' : 'Watch from anywhere'}
                            </p>
                        </div>

                        <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                            <div className={`w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center ${
                                isDark ? 'bg-orange-900/30' : 'bg-orange-100'
                            }`}>
                                <svg className={`w-6 h-6 ${isDark ? 'text-orange-400' : 'text-orange-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {language === 'bn' ? 'রেকর্ডিং' : 'Recordings'}
                            </h3>
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                {language === 'bn' ? 'পরে দেখুন' : 'Watch later'}
                            </p>
                        </div>
                    </div>

                    {/* Back Button */}
                    <Link
                        href="/events"
                        className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                            isDark
                                ? 'bg-purple-600 hover:bg-purple-700 text-white'
                                : 'bg-purple-600 hover:bg-purple-700 text-white'
                        }`}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        {language === 'bn' ? 'ইভেন্ট পেজে ফিরে যান' : 'Back to Events'}
                    </Link>
                </div>
            </div>
        </div>
    );
}
