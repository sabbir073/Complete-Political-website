'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/providers/LanguageProvider';
import { useTheme } from '@/providers/ThemeProvider';

interface EmergencyContact {
    id: string;
    name_en: string;
    name_bn: string;
    phone: string;
    description_en: string | null;
    description_bn: string | null;
    category: string;
    icon: string | null;
    is_featured: boolean;
}

const categoryIcons: Record<string, React.ReactNode> = {
    emergency: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
    ),
    helpline: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
    ),
    police: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
    ),
    fire: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
        </svg>
    ),
    ambulance: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
    ),
    utility: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
    ),
};

const categoryColors: Record<string, string> = {
    emergency: 'from-red-500 to-red-600',
    helpline: 'from-purple-500 to-purple-600',
    police: 'from-blue-500 to-blue-600',
    fire: 'from-orange-500 to-orange-600',
    ambulance: 'from-green-500 to-green-600',
    utility: 'from-yellow-500 to-yellow-600',
};

export default function EmergencyContactsPage() {
    const { language } = useLanguage();
    const { isDark } = useTheme();
    const [contacts, setContacts] = useState<EmergencyContact[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    useEffect(() => {
        fetchContacts();
    }, []);

    const fetchContacts = async () => {
        try {
            const response = await fetch('/api/emergency/contacts');
            const data = await response.json();
            if (data.success) {
                setContacts(data.data);
            }
        } catch (error) {
            console.error('Error fetching contacts:', error);
        } finally {
            setLoading(false);
        }
    };

    const getText = (en: string | null, bn: string | null) => {
        if (language === 'bn') return bn || en || '';
        return en || bn || '';
    };

    const categories = ['all', ...Array.from(new Set(contacts.map(c => c.category)))];
    const filteredContacts = selectedCategory === 'all'
        ? contacts
        : contacts.filter(c => c.category === selectedCategory);

    const featuredContacts = contacts.filter(c => c.is_featured);

    const handleCall = (phone: string) => {
        window.location.href = `tel:${phone}`;
    };

    if (loading) {
        return (
            <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
            </div>
        );
    }

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
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        {language === 'bn' ? 'জরুরি' : 'Emergency'}
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        {language === 'bn' ? 'জরুরি যোগাযোগ' : 'Emergency Contacts'}
                    </h1>
                    <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
                        {language === 'bn'
                            ? 'জরুরি অবস্থায় সাহায্যের জন্য নিচের নম্বরগুলোতে কল করুন'
                            : 'Call these numbers in case of emergency for immediate assistance'}
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
                            {language === 'bn' ? 'জরুরি যোগাযোগ' : 'Emergency Contacts'}
                        </span>
                    </nav>
                </div>
            </div>

            {/* Featured Emergency Numbers */}
            {featuredContacts.length > 0 && (
                <div className="max-w-7xl mx-auto px-6 md:px-16 pt-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {featuredContacts.map((contact) => (
                            <button
                                key={contact.id}
                                onClick={() => handleCall(contact.phone)}
                                className={`group relative overflow-hidden rounded-2xl p-6 text-white bg-gradient-to-br ${categoryColors[contact.category] || 'from-gray-500 to-gray-600'} shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300`}
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                                <div className="relative z-10">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="p-3 bg-white/20 rounded-xl">
                                            {categoryIcons[contact.category] || categoryIcons.emergency}
                                        </div>
                                        <span className="text-3xl font-bold">{contact.phone}</span>
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">
                                        {getText(contact.name_en, contact.name_bn)}
                                    </h3>
                                    <p className="text-white/80 text-sm">
                                        {getText(contact.description_en, contact.description_bn)}
                                    </p>
                                    <div className="mt-4 flex items-center text-white/90">
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                        {language === 'bn' ? 'কল করুন' : 'Tap to Call'}
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Category Filter */}
            <div className="max-w-7xl mx-auto px-6 md:px-16 py-8">
                <div className="flex flex-wrap justify-center gap-3 mb-8">
                    {categories.map((category) => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${
                                selectedCategory === category
                                    ? 'bg-red-600 text-white shadow-lg'
                                    : isDark
                                        ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                        : 'bg-white text-gray-700 hover:bg-gray-100 shadow'
                            }`}
                        >
                            {category === 'all'
                                ? (language === 'bn' ? 'সব' : 'All')
                                : category.charAt(0).toUpperCase() + category.slice(1)
                            }
                        </button>
                    ))}
                </div>

                {/* Contacts Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredContacts.map((contact) => (
                        <div
                            key={contact.id}
                            className={`rounded-xl p-6 ${
                                isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white shadow-lg'
                            } hover:shadow-xl transition-all duration-300`}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className={`p-3 rounded-xl bg-gradient-to-br ${categoryColors[contact.category] || 'from-gray-500 to-gray-600'} text-white`}>
                                    {categoryIcons[contact.category] || categoryIcons.emergency}
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                    isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                                }`}>
                                    {contact.category}
                                </span>
                            </div>

                            <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {getText(contact.name_en, contact.name_bn)}
                            </h3>

                            <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                {getText(contact.description_en, contact.description_bn)}
                            </p>

                            <button
                                onClick={() => handleCall(contact.phone)}
                                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-300"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                <span>{contact.phone}</span>
                            </button>
                        </div>
                    ))}
                </div>

                {filteredContacts.length === 0 && (
                    <div className={`text-center py-16 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 12h.01M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p>{language === 'bn' ? 'কোনো যোগাযোগ পাওয়া যায়নি' : 'No contacts found'}</p>
                    </div>
                )}
            </div>

            {/* Important Notice */}
            <div className="max-w-7xl mx-auto px-6 md:px-16 pb-16">
                <div className={`rounded-2xl p-6 ${isDark ? 'bg-yellow-900/30 border border-yellow-700' : 'bg-yellow-50 border border-yellow-200'}`}>
                    <div className="flex items-start gap-4">
                        <div className="p-2 rounded-full bg-yellow-500/20">
                            <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className={`font-bold mb-2 ${isDark ? 'text-yellow-400' : 'text-yellow-800'}`}>
                                {language === 'bn' ? 'গুরুত্বপূর্ণ তথ্য' : 'Important Information'}
                            </h3>
                            <p className={isDark ? 'text-yellow-300/80' : 'text-yellow-700'}>
                                {language === 'bn'
                                    ? 'জরুরি অবস্থায় প্রথমে ৯৯৯ নম্বরে কল করুন। এই সেবা ২৪/৭ পাওয়া যায়। মিথ্যা কল করলে আইনানুগ ব্যবস্থা নেওয়া হতে পারে।'
                                    : 'In case of emergency, call 999 first. This service is available 24/7. False calls may result in legal action.'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
