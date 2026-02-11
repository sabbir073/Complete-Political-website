'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from '@/providers/LanguageProvider';
import { useTheme } from '@/providers/ThemeProvider';
import dynamic from 'next/dynamic';
import Image from 'next/image';

// Dynamically import the flipbook component to avoid SSR issues with canvas/window
const ManifestoFlipbook = dynamic(() => import('@/components/ManifestoFlipbook'), {
    ssr: false,
    loading: () => (
        <div className="w-full h-[60vh] flex items-center justify-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-600"></div>
        </div>
    ),
});

export default function ManifestoPage() {
    const { language } = useLanguage();
    const { isDark } = useTheme();
    const [pdfUrl, setPdfUrl] = useState('');

    useEffect(() => {
        // Set PDF URL based on language
        if (language === 'bn') {
            setPdfUrl('/Manifesto Bangla.pdf');
        } else {
            setPdfUrl('/Election Manifesto - English.pdf');
        }
    }, [language]);

    // Suppress react-pdf AbortException warning
    useEffect(() => {
        const originalError = console.error;
        console.error = (...args) => {
            if (args[0]?.toString().includes('AbortException') || args[0]?.message?.includes('AbortException')) {
                return;
            }
            originalError(...args);
        };
        return () => {
            console.error = originalError;
        };
    }, []);

    return (
        <div className={`min-h-screen pt-20 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
            {/* Hero Section */}
            <div className={`relative py-2 ${isDark ? 'bg-gray-800' : 'bg-white shadow-sm'}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className={`text-xl md:text-3xl font-bold mb-1 ${isDark ? 'text-white' : 'text-[#1e5631]'}`}>
                        {language === 'bn' ? 'নির্বাচনী ইশতেহার' : 'Election Manifesto'}
                    </h1>
                    <p className={`max-w-3xl mx-auto text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        {language === 'bn'
                            ? 'আমাদের ভিশন এবং প্রতিশ্রুতি - একটি উন্নত ঢাকা-১৮ আসনের জন্য'
                            : 'Our Vision and Commitments - For a Better Dhaka-18 Constituency'}
                    </p>
                </div>
            </div>

            {/* Warning/Note for Mobile */}
            <div className="md:hidden px-4 py-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-700 text-sm text-center">
                {language === 'bn'
                    ? 'সেরা অভিজ্ঞতার জন্য ল্যান্ডস্কেপ মোড ব্যবহার করুন'
                    : 'For best experience, please use landscape mode'}
            </div>

            {/* Flipbook Container - Full Width */}
            <div className="w-full flex-grow relative">
                {/* Fit to screen height (100vh - header/title - margins) to avoid scrolling */}
                <div className={`w-full h-[calc(100vh-140px)] min-h-[500px] overflow-hidden border-t border-b ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                    {pdfUrl && <ManifestoFlipbook key={pdfUrl} pdfUrl={pdfUrl} />}
                </div>
            </div>

            {/* Download Section */}
            <div className={`py-12 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <h3 className="text-xl font-bold mb-6">
                        {language === 'bn' ? 'ইশতেহার ডাউনলোড করুন' : 'Download Manifesto'}
                    </h3>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <a
                            href="/Manifesto Bangla.pdf"
                            download
                            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 md:py-4 md:text-lg md:px-10"
                        >
                            {language === 'bn' ? 'বাংলা সংস্করণ (পিডিএফ)' : 'Bangla Version (PDF)'}
                        </a>
                        <a
                            href="/Election Manifesto - English.pdf"
                            download
                            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 md:py-4 md:text-lg md:px-10"
                        >
                            {language === 'bn' ? 'ইংরেজি সংস্করণ (পিডিএফ)' : 'English Version (PDF)'}
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
