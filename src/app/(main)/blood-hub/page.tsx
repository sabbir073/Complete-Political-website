'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/providers/LanguageProvider';
import { useTheme } from '@/providers/ThemeProvider';

interface Stats {
    donors: {
        total: number;
        available: number;
        byGroup: Record<string, number>;
    };
    requests: {
        total: number;
        pending: number;
        inProgress: number;
        fulfilled: number;
        emergency: number;
        byGroup: Record<string, number>;
    };
}

interface DonorFormData {
    name: string;
    phone: string;
    email: string;
    blood_group: string;
    date_of_birth: string;
    gender: string;
    weight: string;
    address: string;
    ward: string;
    area: string;
    last_donation_date: string;
    medical_conditions: string;
}

interface RequestFormData {
    contact_person: string;
    contact_phone: string;
    contact_email: string;
    patient_name: string;
    blood_group: string;
    units_needed: number;
    hospital_name: string;
    hospital_address: string;
    ward: string;
    needed_by: string;
    urgency: string;
    reason: string;
}

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const bloodGroupColors: Record<string, string> = {
    'A+': 'from-red-500 to-red-600',
    'A-': 'from-red-600 to-red-700',
    'B+': 'from-blue-500 to-blue-600',
    'B-': 'from-blue-600 to-blue-700',
    'AB+': 'from-purple-500 to-purple-600',
    'AB-': 'from-purple-600 to-purple-700',
    'O+': 'from-green-500 to-green-600',
    'O-': 'from-green-600 to-green-700',
};

export default function BloodHubPage() {
    const { language } = useLanguage();
    const { isDark } = useTheme();
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'search' | 'donate' | 'request'>('search');
    const [searchBloodGroup, setSearchBloodGroup] = useState<string>('');
    const [searchResult, setSearchResult] = useState<{ count: number; group: string } | null>(null);
    const [showRequestForm, setShowRequestForm] = useState(false);

    // Donor form
    const [donorForm, setDonorForm] = useState<DonorFormData>({
        name: '',
        phone: '',
        email: '',
        blood_group: '',
        date_of_birth: '',
        gender: '',
        weight: '',
        address: '',
        ward: '',
        area: '',
        last_donation_date: '',
        medical_conditions: '',
    });
    const [donorSubmitting, setDonorSubmitting] = useState(false);
    const [donorSuccess, setDonorSuccess] = useState(false);
    const [donorError, setDonorError] = useState<string | null>(null);

    // Request form
    const [requestForm, setRequestForm] = useState<RequestFormData>({
        contact_person: '',
        contact_phone: '',
        contact_email: '',
        patient_name: '',
        blood_group: '',
        units_needed: 1,
        hospital_name: '',
        hospital_address: '',
        ward: '',
        needed_by: '',
        urgency: 'normal',
        reason: '',
    });
    const [requestSubmitting, setRequestSubmitting] = useState(false);
    const [requestSuccess, setRequestSuccess] = useState(false);
    const [requestError, setRequestError] = useState<string | null>(null);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await fetch('/api/blood-hub/requests?stats=true');
            const data = await response.json();
            if (data.success) {
                setStats(data.stats);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        if (!searchBloodGroup) return;

        try {
            const response = await fetch(`/api/blood-hub/donors?blood_group=${encodeURIComponent(searchBloodGroup)}`);
            const data = await response.json();
            if (data.success) {
                setSearchResult({ count: data.count, group: searchBloodGroup });
                if (data.count > 0) {
                    setShowRequestForm(true);
                    setRequestForm(prev => ({ ...prev, blood_group: searchBloodGroup }));
                }
            }
        } catch (error) {
            console.error('Error searching:', error);
        }
    };

    const handleDonorSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setDonorSubmitting(true);
        setDonorError(null);

        try {
            const response = await fetch('/api/blood-hub/donors', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(donorForm),
            });

            const data = await response.json();
            if (data.success) {
                setDonorSuccess(true);
                setDonorForm({
                    name: '',
                    phone: '',
                    email: '',
                    blood_group: '',
                    date_of_birth: '',
                    gender: '',
                    weight: '',
                    address: '',
                    ward: '',
                    area: '',
                    last_donation_date: '',
                    medical_conditions: '',
                });
                fetchStats();
            } else {
                setDonorError(data.error || 'Failed to register');
            }
        } catch (error) {
            console.error('Error submitting donor:', error);
            setDonorError('Failed to submit. Please try again.');
        } finally {
            setDonorSubmitting(false);
        }
    };

    const handleRequestSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setRequestSubmitting(true);
        setRequestError(null);

        try {
            const response = await fetch('/api/blood-hub/requests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestForm),
            });

            const data = await response.json();
            if (data.success) {
                setRequestSuccess(true);
                setShowRequestForm(false);
                setRequestForm({
                    contact_person: '',
                    contact_phone: '',
                    contact_email: '',
                    patient_name: '',
                    blood_group: '',
                    units_needed: 1,
                    hospital_name: '',
                    hospital_address: '',
                    ward: '',
                    needed_by: '',
                    urgency: 'normal',
                    reason: '',
                });
                fetchStats();
            } else {
                setRequestError(data.error || 'Failed to submit request');
            }
        } catch (error) {
            console.error('Error submitting request:', error);
            setRequestError('Failed to submit. Please try again.');
        } finally {
            setRequestSubmitting(false);
        }
    };

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
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                        </svg>
                        {language === 'bn' ? 'রক্তদান' : 'Blood Donation'}
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        {language === 'bn' ? 'ব্লাড হাব' : 'Blood Hub'}
                    </h1>
                    <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
                        {language === 'bn'
                            ? 'রক্তদাতা হিসেবে যোগ দিন অথবা প্রয়োজনে রক্তের অনুরোধ করুন'
                            : 'Join as a blood donor or request blood when needed'}
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
                            {language === 'bn' ? 'ব্লাড হাব' : 'Blood Hub'}
                        </span>
                    </nav>
                </div>
            </div>

            {/* Statistics Section */}
            <div className="max-w-7xl mx-auto px-6 md:px-16 py-12">
                <h2 className={`text-2xl font-bold mb-8 text-center ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {language === 'bn' ? 'পরিসংখ্যান' : 'Statistics'}
                </h2>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
                    </div>
                ) : (
                    <>
                        {/* Main Stats Cards */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                            <div className={`p-6 rounded-2xl text-center ${isDark ? 'bg-gray-800' : 'bg-white shadow-lg'}`}>
                                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </div>
                                <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    {stats?.donors.total || 0}
                                </p>
                                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                    {language === 'bn' ? 'মোট রক্তদাতা' : 'Total Donors'}
                                </p>
                            </div>

                            <div className={`p-6 rounded-2xl text-center ${isDark ? 'bg-gray-800' : 'bg-white shadow-lg'}`}>
                                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    {stats?.requests.fulfilled || 0}
                                </p>
                                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                    {language === 'bn' ? 'সম্পন্ন অনুরোধ' : 'Fulfilled Requests'}
                                </p>
                            </div>

                            <div className={`p-6 rounded-2xl text-center ${isDark ? 'bg-gray-800' : 'bg-white shadow-lg'}`}>
                                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-r from-yellow-500 to-yellow-600 flex items-center justify-center">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    {stats?.requests.pending || 0}
                                </p>
                                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                    {language === 'bn' ? 'অপেক্ষমাণ অনুরোধ' : 'Pending Requests'}
                                </p>
                            </div>

                            <div className={`p-6 rounded-2xl text-center ${isDark ? 'bg-gray-800' : 'bg-white shadow-lg'}`}>
                                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                </div>
                                <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    {stats?.requests.emergency || 0}
                                </p>
                                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                    {language === 'bn' ? 'জরুরি অনুরোধ' : 'Emergency Requests'}
                                </p>
                            </div>
                        </div>

                        {/* Blood Group Stats */}
                        <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
                            {bloodGroups.map((group) => (
                                <div
                                    key={group}
                                    className={`p-4 rounded-xl text-center bg-gradient-to-br ${bloodGroupColors[group]} text-white shadow-lg`}
                                >
                                    <p className="text-2xl font-bold">{group}</p>
                                    <p className="text-sm opacity-90">
                                        {stats?.donors.byGroup[group] || 0} {language === 'bn' ? 'জন' : 'donors'}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Tabs Section */}
            <div className={`py-12 ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                <div className="max-w-4xl mx-auto px-6 md:px-16">
                    {/* Tab Buttons */}
                    <div className="flex justify-center gap-2 mb-8">
                        <button
                            onClick={() => setActiveTab('search')}
                            className={`px-6 py-3 rounded-xl font-medium transition-all ${
                                activeTab === 'search'
                                    ? 'bg-red-600 text-white shadow-lg'
                                    : isDark
                                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                        : 'bg-white text-gray-700 hover:bg-gray-50 shadow'
                            }`}
                        >
                            {language === 'bn' ? 'রক্ত খুঁজুন' : 'Find Blood'}
                        </button>
                        <button
                            onClick={() => setActiveTab('donate')}
                            className={`px-6 py-3 rounded-xl font-medium transition-all ${
                                activeTab === 'donate'
                                    ? 'bg-red-600 text-white shadow-lg'
                                    : isDark
                                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                        : 'bg-white text-gray-700 hover:bg-gray-50 shadow'
                            }`}
                        >
                            {language === 'bn' ? 'রক্তদাতা হন' : 'Become Donor'}
                        </button>
                        <button
                            onClick={() => setActiveTab('request')}
                            className={`px-6 py-3 rounded-xl font-medium transition-all ${
                                activeTab === 'request'
                                    ? 'bg-red-600 text-white shadow-lg'
                                    : isDark
                                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                        : 'bg-white text-gray-700 hover:bg-gray-50 shadow'
                            }`}
                        >
                            {language === 'bn' ? 'রক্তের অনুরোধ' : 'Request Blood'}
                        </button>
                    </div>

                    {/* Search Tab */}
                    {activeTab === 'search' && (
                        <div className={`rounded-2xl p-8 ${isDark ? 'bg-gray-900' : 'bg-white shadow-xl'}`}>
                            <h3 className={`text-xl font-bold mb-6 text-center ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {language === 'bn' ? 'রক্তের গ্রুপ অনুসন্ধান করুন' : 'Search for Blood Group'}
                            </h3>

                            <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-center mb-6">
                                <select
                                    value={searchBloodGroup}
                                    onChange={(e) => {
                                        setSearchBloodGroup(e.target.value);
                                        setSearchResult(null);
                                        setShowRequestForm(false);
                                    }}
                                    className={`w-full sm:w-auto px-4 py-3 rounded-xl border text-lg ${
                                        isDark
                                            ? 'bg-gray-800 border-gray-700 text-white'
                                            : 'bg-gray-50 border-gray-200 text-gray-900'
                                    }`}
                                >
                                    <option value="">{language === 'bn' ? 'রক্তের গ্রুপ নির্বাচন করুন' : 'Select Blood Group'}</option>
                                    {bloodGroups.map((group) => (
                                        <option key={group} value={group}>{group}</option>
                                    ))}
                                </select>
                                <button
                                    onClick={handleSearch}
                                    disabled={!searchBloodGroup}
                                    className="w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-medium hover:from-red-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    {language === 'bn' ? 'খুঁজুন' : 'Search'}
                                </button>
                            </div>

                            {searchResult && (
                                <div className={`text-center p-6 rounded-xl ${
                                    searchResult.count > 0
                                        ? 'bg-green-100 dark:bg-green-900/30'
                                        : 'bg-yellow-100 dark:bg-yellow-900/30'
                                }`}>
                                    <p className={`text-lg font-medium ${
                                        searchResult.count > 0
                                            ? 'text-green-700 dark:text-green-400'
                                            : 'text-yellow-700 dark:text-yellow-400'
                                    }`}>
                                        {searchResult.count > 0
                                            ? (language === 'bn'
                                                ? `${searchResult.group} গ্রুপের ${searchResult.count} জন রক্তদাতা পাওয়া গেছে!`
                                                : `Found ${searchResult.count} donors for ${searchResult.group}!`)
                                            : (language === 'bn'
                                                ? `${searchResult.group} গ্রুপের কোনো রক্তদাতা পাওয়া যায়নি`
                                                : `No donors found for ${searchResult.group}`)}
                                    </p>
                                    {searchResult.count > 0 && (
                                        <button
                                            onClick={() => {
                                                setShowRequestForm(true);
                                                setActiveTab('request');
                                                setRequestForm(prev => ({ ...prev, blood_group: searchBloodGroup }));
                                            }}
                                            className="mt-4 px-6 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition-colors"
                                        >
                                            {language === 'bn' ? 'রক্তের অনুরোধ করুন' : 'Request Blood'}
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Donate Tab */}
                    {activeTab === 'donate' && (
                        <div className={`rounded-2xl p-8 ${isDark ? 'bg-gray-900' : 'bg-white shadow-xl'}`}>
                            {donorSuccess ? (
                                <div className="text-center py-8">
                                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                        <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                        {language === 'bn' ? 'সফলভাবে নিবন্ধিত!' : 'Successfully Registered!'}
                                    </h3>
                                    <p className={`mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                        {language === 'bn'
                                            ? 'আপনার প্রোফাইল অ্যাডমিন দ্বারা যাচাই করা হবে'
                                            : 'Your profile will be verified by admin'}
                                    </p>
                                    <button
                                        onClick={() => setDonorSuccess(false)}
                                        className="px-6 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
                                    >
                                        {language === 'bn' ? 'আরেকজন নিবন্ধন করুন' : 'Register Another'}
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <h3 className={`text-xl font-bold mb-6 text-center ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                        {language === 'bn' ? 'রক্তদাতা হিসেবে নিবন্ধন করুন' : 'Register as Blood Donor'}
                                    </h3>

                                    {donorError && (
                                        <div className="mb-4 p-4 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
                                            {donorError}
                                        </div>
                                    )}

                                    <form onSubmit={handleDonorSubmit} className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                                    {language === 'bn' ? 'নাম *' : 'Name *'}
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={donorForm.name}
                                                    onChange={(e) => setDonorForm({ ...donorForm, name: e.target.value })}
                                                    className={`w-full px-4 py-2 rounded-lg border ${
                                                        isDark
                                                            ? 'bg-gray-800 border-gray-700 text-white'
                                                            : 'bg-gray-50 border-gray-200 text-gray-900'
                                                    }`}
                                                />
                                            </div>
                                            <div>
                                                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                                    {language === 'bn' ? 'ফোন *' : 'Phone *'}
                                                </label>
                                                <input
                                                    type="tel"
                                                    required
                                                    value={donorForm.phone}
                                                    onChange={(e) => setDonorForm({ ...donorForm, phone: e.target.value })}
                                                    className={`w-full px-4 py-2 rounded-lg border ${
                                                        isDark
                                                            ? 'bg-gray-800 border-gray-700 text-white'
                                                            : 'bg-gray-50 border-gray-200 text-gray-900'
                                                    }`}
                                                />
                                            </div>
                                            <div>
                                                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                                    {language === 'bn' ? 'ইমেইল' : 'Email'}
                                                </label>
                                                <input
                                                    type="email"
                                                    value={donorForm.email}
                                                    onChange={(e) => setDonorForm({ ...donorForm, email: e.target.value })}
                                                    className={`w-full px-4 py-2 rounded-lg border ${
                                                        isDark
                                                            ? 'bg-gray-800 border-gray-700 text-white'
                                                            : 'bg-gray-50 border-gray-200 text-gray-900'
                                                    }`}
                                                />
                                            </div>
                                            <div>
                                                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                                    {language === 'bn' ? 'রক্তের গ্রুপ *' : 'Blood Group *'}
                                                </label>
                                                <select
                                                    required
                                                    value={donorForm.blood_group}
                                                    onChange={(e) => setDonorForm({ ...donorForm, blood_group: e.target.value })}
                                                    className={`w-full px-4 py-2 rounded-lg border ${
                                                        isDark
                                                            ? 'bg-gray-800 border-gray-700 text-white'
                                                            : 'bg-gray-50 border-gray-200 text-gray-900'
                                                    }`}
                                                >
                                                    <option value="">{language === 'bn' ? 'নির্বাচন করুন' : 'Select'}</option>
                                                    {bloodGroups.map((group) => (
                                                        <option key={group} value={group}>{group}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                                    {language === 'bn' ? 'জন্ম তারিখ' : 'Date of Birth'}
                                                </label>
                                                <input
                                                    type="date"
                                                    value={donorForm.date_of_birth}
                                                    onChange={(e) => setDonorForm({ ...donorForm, date_of_birth: e.target.value })}
                                                    className={`w-full px-4 py-2 rounded-lg border ${
                                                        isDark
                                                            ? 'bg-gray-800 border-gray-700 text-white'
                                                            : 'bg-gray-50 border-gray-200 text-gray-900'
                                                    }`}
                                                />
                                            </div>
                                            <div>
                                                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                                    {language === 'bn' ? 'লিঙ্গ' : 'Gender'}
                                                </label>
                                                <select
                                                    value={donorForm.gender}
                                                    onChange={(e) => setDonorForm({ ...donorForm, gender: e.target.value })}
                                                    className={`w-full px-4 py-2 rounded-lg border ${
                                                        isDark
                                                            ? 'bg-gray-800 border-gray-700 text-white'
                                                            : 'bg-gray-50 border-gray-200 text-gray-900'
                                                    }`}
                                                >
                                                    <option value="">{language === 'bn' ? 'নির্বাচন করুন' : 'Select'}</option>
                                                    <option value="male">{language === 'bn' ? 'পুরুষ' : 'Male'}</option>
                                                    <option value="female">{language === 'bn' ? 'মহিলা' : 'Female'}</option>
                                                    <option value="other">{language === 'bn' ? 'অন্যান্য' : 'Other'}</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                                    {language === 'bn' ? 'ওজন (কেজি)' : 'Weight (kg)'}
                                                </label>
                                                <input
                                                    type="number"
                                                    min="40"
                                                    value={donorForm.weight}
                                                    onChange={(e) => setDonorForm({ ...donorForm, weight: e.target.value })}
                                                    className={`w-full px-4 py-2 rounded-lg border ${
                                                        isDark
                                                            ? 'bg-gray-800 border-gray-700 text-white'
                                                            : 'bg-gray-50 border-gray-200 text-gray-900'
                                                    }`}
                                                />
                                            </div>
                                            <div>
                                                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                                    {language === 'bn' ? 'শেষ রক্তদানের তারিখ' : 'Last Donation Date'}
                                                </label>
                                                <input
                                                    type="date"
                                                    value={donorForm.last_donation_date}
                                                    onChange={(e) => setDonorForm({ ...donorForm, last_donation_date: e.target.value })}
                                                    className={`w-full px-4 py-2 rounded-lg border ${
                                                        isDark
                                                            ? 'bg-gray-800 border-gray-700 text-white'
                                                            : 'bg-gray-50 border-gray-200 text-gray-900'
                                                    }`}
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                                {language === 'bn' ? 'ঠিকানা' : 'Address'}
                                            </label>
                                            <input
                                                type="text"
                                                value={donorForm.address}
                                                onChange={(e) => setDonorForm({ ...donorForm, address: e.target.value })}
                                                className={`w-full px-4 py-2 rounded-lg border ${
                                                    isDark
                                                        ? 'bg-gray-800 border-gray-700 text-white'
                                                        : 'bg-gray-50 border-gray-200 text-gray-900'
                                                }`}
                                            />
                                        </div>

                                        <div>
                                            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                                {language === 'bn' ? 'চিকিৎসা সংক্রান্ত তথ্য' : 'Medical Conditions (if any)'}
                                            </label>
                                            <textarea
                                                rows={2}
                                                value={donorForm.medical_conditions}
                                                onChange={(e) => setDonorForm({ ...donorForm, medical_conditions: e.target.value })}
                                                className={`w-full px-4 py-2 rounded-lg border ${
                                                    isDark
                                                        ? 'bg-gray-800 border-gray-700 text-white'
                                                        : 'bg-gray-50 border-gray-200 text-gray-900'
                                                }`}
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={donorSubmitting}
                                            className="w-full py-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-medium hover:from-red-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                        >
                                            {donorSubmitting
                                                ? (language === 'bn' ? 'জমা হচ্ছে...' : 'Submitting...')
                                                : (language === 'bn' ? 'রক্তদাতা হিসেবে নিবন্ধন করুন' : 'Register as Donor')}
                                        </button>
                                    </form>
                                </>
                            )}
                        </div>
                    )}

                    {/* Request Tab */}
                    {activeTab === 'request' && (
                        <div className={`rounded-2xl p-8 ${isDark ? 'bg-gray-900' : 'bg-white shadow-xl'}`}>
                            {requestSuccess ? (
                                <div className="text-center py-8">
                                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                        <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                        {language === 'bn' ? 'অনুরোধ জমা হয়েছে!' : 'Request Submitted!'}
                                    </h3>
                                    <p className={`mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                        {language === 'bn'
                                            ? 'আমরা শীঘ্রই সম্ভাব্য রক্তদাতাদের সাথে যোগাযোগ করব'
                                            : 'We will contact potential donors shortly'}
                                    </p>
                                    <button
                                        onClick={() => setRequestSuccess(false)}
                                        className="px-6 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
                                    >
                                        {language === 'bn' ? 'নতুন অনুরোধ' : 'New Request'}
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <h3 className={`text-xl font-bold mb-6 text-center ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                        {language === 'bn' ? 'রক্তের অনুরোধ করুন' : 'Request Blood'}
                                    </h3>

                                    {requestError && (
                                        <div className="mb-4 p-4 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
                                            {requestError}
                                        </div>
                                    )}

                                    <form onSubmit={handleRequestSubmit} className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                                    {language === 'bn' ? 'যোগাযোগকারীর নাম *' : 'Contact Person *'}
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={requestForm.contact_person}
                                                    onChange={(e) => setRequestForm({ ...requestForm, contact_person: e.target.value })}
                                                    className={`w-full px-4 py-2 rounded-lg border ${
                                                        isDark
                                                            ? 'bg-gray-800 border-gray-700 text-white'
                                                            : 'bg-gray-50 border-gray-200 text-gray-900'
                                                    }`}
                                                />
                                            </div>
                                            <div>
                                                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                                    {language === 'bn' ? 'ফোন *' : 'Phone *'}
                                                </label>
                                                <input
                                                    type="tel"
                                                    required
                                                    value={requestForm.contact_phone}
                                                    onChange={(e) => setRequestForm({ ...requestForm, contact_phone: e.target.value })}
                                                    className={`w-full px-4 py-2 rounded-lg border ${
                                                        isDark
                                                            ? 'bg-gray-800 border-gray-700 text-white'
                                                            : 'bg-gray-50 border-gray-200 text-gray-900'
                                                    }`}
                                                />
                                            </div>
                                            <div>
                                                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                                    {language === 'bn' ? 'রোগীর নাম' : 'Patient Name'}
                                                </label>
                                                <input
                                                    type="text"
                                                    value={requestForm.patient_name}
                                                    onChange={(e) => setRequestForm({ ...requestForm, patient_name: e.target.value })}
                                                    className={`w-full px-4 py-2 rounded-lg border ${
                                                        isDark
                                                            ? 'bg-gray-800 border-gray-700 text-white'
                                                            : 'bg-gray-50 border-gray-200 text-gray-900'
                                                    }`}
                                                />
                                            </div>
                                            <div>
                                                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                                    {language === 'bn' ? 'রক্তের গ্রুপ *' : 'Blood Group *'}
                                                </label>
                                                <select
                                                    required
                                                    value={requestForm.blood_group}
                                                    onChange={(e) => setRequestForm({ ...requestForm, blood_group: e.target.value })}
                                                    className={`w-full px-4 py-2 rounded-lg border ${
                                                        isDark
                                                            ? 'bg-gray-800 border-gray-700 text-white'
                                                            : 'bg-gray-50 border-gray-200 text-gray-900'
                                                    }`}
                                                >
                                                    <option value="">{language === 'bn' ? 'নির্বাচন করুন' : 'Select'}</option>
                                                    {bloodGroups.map((group) => (
                                                        <option key={group} value={group}>{group}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                                    {language === 'bn' ? 'প্রয়োজনীয় ইউনিট' : 'Units Needed'}
                                                </label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={requestForm.units_needed}
                                                    onChange={(e) => setRequestForm({ ...requestForm, units_needed: parseInt(e.target.value) || 1 })}
                                                    className={`w-full px-4 py-2 rounded-lg border ${
                                                        isDark
                                                            ? 'bg-gray-800 border-gray-700 text-white'
                                                            : 'bg-gray-50 border-gray-200 text-gray-900'
                                                    }`}
                                                />
                                            </div>
                                            <div>
                                                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                                    {language === 'bn' ? 'জরুরিতা' : 'Urgency'}
                                                </label>
                                                <select
                                                    value={requestForm.urgency}
                                                    onChange={(e) => setRequestForm({ ...requestForm, urgency: e.target.value })}
                                                    className={`w-full px-4 py-2 rounded-lg border ${
                                                        isDark
                                                            ? 'bg-gray-800 border-gray-700 text-white'
                                                            : 'bg-gray-50 border-gray-200 text-gray-900'
                                                    }`}
                                                >
                                                    <option value="normal">{language === 'bn' ? 'সাধারণ' : 'Normal'}</option>
                                                    <option value="urgent">{language === 'bn' ? 'জরুরি' : 'Urgent'}</option>
                                                    <option value="emergency">{language === 'bn' ? 'অতি জরুরি' : 'Emergency'}</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                                    {language === 'bn' ? 'হাসপাতালের নাম *' : 'Hospital Name *'}
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={requestForm.hospital_name}
                                                    onChange={(e) => setRequestForm({ ...requestForm, hospital_name: e.target.value })}
                                                    className={`w-full px-4 py-2 rounded-lg border ${
                                                        isDark
                                                            ? 'bg-gray-800 border-gray-700 text-white'
                                                            : 'bg-gray-50 border-gray-200 text-gray-900'
                                                    }`}
                                                />
                                            </div>
                                            <div>
                                                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                                    {language === 'bn' ? 'কখন প্রয়োজন *' : 'Needed By *'}
                                                </label>
                                                <input
                                                    type="datetime-local"
                                                    required
                                                    value={requestForm.needed_by}
                                                    onChange={(e) => setRequestForm({ ...requestForm, needed_by: e.target.value })}
                                                    className={`w-full px-4 py-2 rounded-lg border ${
                                                        isDark
                                                            ? 'bg-gray-800 border-gray-700 text-white'
                                                            : 'bg-gray-50 border-gray-200 text-gray-900'
                                                    }`}
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                                {language === 'bn' ? 'হাসপাতালের ঠিকানা' : 'Hospital Address'}
                                            </label>
                                            <input
                                                type="text"
                                                value={requestForm.hospital_address}
                                                onChange={(e) => setRequestForm({ ...requestForm, hospital_address: e.target.value })}
                                                className={`w-full px-4 py-2 rounded-lg border ${
                                                    isDark
                                                        ? 'bg-gray-800 border-gray-700 text-white'
                                                        : 'bg-gray-50 border-gray-200 text-gray-900'
                                                }`}
                                            />
                                        </div>

                                        <div>
                                            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                                {language === 'bn' ? 'কারণ / বিস্তারিত' : 'Reason / Details'}
                                            </label>
                                            <textarea
                                                rows={2}
                                                value={requestForm.reason}
                                                onChange={(e) => setRequestForm({ ...requestForm, reason: e.target.value })}
                                                className={`w-full px-4 py-2 rounded-lg border ${
                                                    isDark
                                                        ? 'bg-gray-800 border-gray-700 text-white'
                                                        : 'bg-gray-50 border-gray-200 text-gray-900'
                                                }`}
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={requestSubmitting}
                                            className="w-full py-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-medium hover:from-red-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                        >
                                            {requestSubmitting
                                                ? (language === 'bn' ? 'জমা হচ্ছে...' : 'Submitting...')
                                                : (language === 'bn' ? 'রক্তের অনুরোধ জমা দিন' : 'Submit Blood Request')}
                                        </button>
                                    </form>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Info Section */}
            <div className="max-w-7xl mx-auto px-6 md:px-16 py-12">
                <div className={`rounded-2xl p-6 ${isDark ? 'bg-red-900/30 border border-red-700' : 'bg-red-50 border border-red-200'}`}>
                    <div className="flex items-start gap-4">
                        <div className="p-2 rounded-full bg-red-500/20">
                            <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className={`font-bold mb-2 ${isDark ? 'text-red-400' : 'text-red-800'}`}>
                                {language === 'bn' ? 'রক্তদান সম্পর্কে' : 'About Blood Donation'}
                            </h3>
                            <p className={`text-sm ${isDark ? 'text-red-300' : 'text-red-700'}`}>
                                {language === 'bn'
                                    ? 'রক্তদান একটি মহৎ কাজ। একজন সুস্থ মানুষ প্রতি ৩ মাস পরপর রক্তদান করতে পারেন। রক্তদানে কোনো ক্ষতি নেই, বরং এটি শরীরের জন্য উপকারী।'
                                    : 'Blood donation is a noble act. A healthy person can donate blood every 3 months. There is no harm in donating blood; rather, it is beneficial for the body.'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
