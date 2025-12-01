'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/providers/ThemeProvider';
import { useLanguage } from '@/providers/LanguageProvider';
import Dhaka18Map from '@/components/Dhaka18Map';
import Link from 'next/link';

interface WardStats {
    ward: string;
    total: number;
    pending: number;
    in_progress: number;
    under_review: number;
    responded: number;
    resolved: number;
    rejected: number;
    intensity: number;
}

interface StatsResponse {
    success: boolean;
    data: WardStats[];
    summary: {
        totalComplaints: number;
        maxComplaintsPerWard: number;
        wardCount: number;
    };
}

// Ward area names
const wardAreaNames: Record<string, { en: string; bn: string }> = {
    '01': { en: 'Uttara 3, 4, 6, 7, 8, 9', bn: 'উত্তরা ৩, ৪, ৬, ৭, ৮, ৯' },
    '17': { en: 'Khilkhet, Joar Sahara', bn: 'খিলক্ষেত, জোয়ার সাহারা' },
    '43': { en: 'Dumni, Patira', bn: 'দুমনি, পাটিরা' },
    '44': { en: 'Kachkura, Bhaturia', bn: 'কাচকুড়া, ভাটুরিয়া' },
    '45': { en: 'Uttarkhan, Sarkaar Parra', bn: 'উত্তরখান, সরকার পাড়া' },
    '46': { en: 'Munda, Moynar Tek', bn: 'মুন্ডা, ময়নার টেক' },
    '47': { en: 'Faydabad, Azampur', bn: 'ফায়দাবাদ, আজমপুর' },
    '48': { en: 'Halan, Kazi Bari', bn: 'হালান, কাজী বাড়ি' },
    '49': { en: 'Kawla, Dakshinkhan', bn: 'কাওলা, দক্ষিণখান' },
    '50': { en: 'Mollartek, Dakshinkhan', bn: 'মোল্লারটেক, দক্ষিণখান' },
    '51': { en: 'Balijurri, Uttara 12, 13, 14', bn: 'বালিজুড়ি, উত্তরা ১২, ১৩, ১৪' },
    '52': { en: 'Turag, Uttara 12-13 (part)', bn: 'তুরাগ, উত্তরা ১২-১৩ (অংশ)' },
    '53': { en: 'Diabari', bn: 'দিয়াবাড়ি' },
    '54': { en: 'Kamarpara, Dhaur', bn: 'কামারপাড়া, ধউর' },
};

export default function AreaProblemsPage() {
    const { isDark } = useTheme();
    const { language } = useLanguage();
    const [stats, setStats] = useState<WardStats[]>([]);
    const [summary, setSummary] = useState({ totalComplaints: 0, maxComplaintsPerWard: 0, wardCount: 14 });
    const [loading, setLoading] = useState(true);
    const [selectedWard, setSelectedWard] = useState<string | null>(null);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await fetch('/api/complaints/stats');
            const result: StatsResponse = await response.json();

            if (result.success) {
                setStats(result.data);
                setSummary(result.summary);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleWardClick = (ward: string) => {
        setSelectedWard(selectedWard === ward ? null : ward);
    };

    const selectedWardStats = selectedWard ? stats.find(s => s.ward === selectedWard) : null;

    // Get heat color for stats cards
    const getHeatColor = (intensity: number) => {
        if (intensity === 0) return isDark ? 'bg-gray-700' : 'bg-gray-100';
        if (intensity < 0.25) return 'bg-red-100 dark:bg-red-900/30';
        if (intensity < 0.5) return 'bg-red-200 dark:bg-red-900/50';
        if (intensity < 0.75) return 'bg-red-300 dark:bg-red-800/60';
        return 'bg-red-400 dark:bg-red-700/70';
    };

    return (
        <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
            {/* Hero Section */}
            <section className={`py-12 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                <div className="container mx-auto px-4">
                    <div className="text-center max-w-3xl mx-auto">
                        <h1 className={`text-3xl md:text-4xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {language === 'bn' ? 'এলাকাভিত্তিক সমস্যা' : 'Area-wise Problems'}
                        </h1>
                        <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {language === 'bn'
                                ? 'ঢাকা-১৮ নির্বাচনী এলাকার ১৪টি ওয়ার্ডের সমস্যা ও তার বর্তমান অবস্থা দেখুন'
                                : 'View problems and their current status across all 14 wards of Dhaka-18 constituency'}
                        </p>
                    </div>
                </div>
            </section>

            {/* Summary Cards */}
            <section className="py-8">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white shadow-lg'}`}>
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                {language === 'bn' ? 'মোট সমস্যা' : 'Total Problems'}
                            </p>
                            <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {loading ? '...' : summary.totalComplaints}
                            </p>
                        </div>
                        <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white shadow-lg'}`}>
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                {language === 'bn' ? 'মোট ওয়ার্ড' : 'Total Wards'}
                            </p>
                            <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {summary.wardCount}
                            </p>
                        </div>
                        <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white shadow-lg'}`}>
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                {language === 'bn' ? 'অমীমাংসিত' : 'Pending'}
                            </p>
                            <p className={`text-3xl font-bold text-yellow-500`}>
                                {loading ? '...' : stats.reduce((acc, s) => acc + s.pending, 0)}
                            </p>
                        </div>
                        <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white shadow-lg'}`}>
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                {language === 'bn' ? 'সমাধান' : 'Resolved'}
                            </p>
                            <p className={`text-3xl font-bold text-green-500`}>
                                {loading ? '...' : stats.reduce((acc, s) => acc + s.resolved, 0)}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Map Section */}
            <section className="py-8">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Map */}
                        <div className={`lg:col-span-2 p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white shadow-lg'}`}>
                            <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {language === 'bn' ? 'ইন্টারেক্টিভ ম্যাপ' : 'Interactive Map'}
                            </h2>
                            {loading ? (
                                <div className="flex items-center justify-center h-96">
                                    <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            ) : (
                                <Dhaka18Map
                                    stats={stats}
                                    language={language}
                                    onWardClick={handleWardClick}
                                />
                            )}
                        </div>

                        {/* Selected Ward Details or Instructions */}
                        <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white shadow-lg'}`}>
                            {selectedWard && selectedWardStats ? (
                                <>
                                    <h2 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                        {language === 'bn' ? `ওয়ার্ড ${selectedWard}` : `Ward ${selectedWard}`}
                                    </h2>
                                    <p className={`text-sm mb-6 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                        {language === 'bn' ? wardAreaNames[selectedWard]?.bn : wardAreaNames[selectedWard]?.en}
                                    </p>

                                    {/* Stats */}
                                    <div className="space-y-4">
                                        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                            <div className="flex justify-between items-center mb-2">
                                                <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                                                    {language === 'bn' ? 'মোট সমস্যা' : 'Total Problems'}
                                                </span>
                                                <span className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                                    {selectedWardStats.total}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div className={`p-3 rounded-lg ${isDark ? 'bg-yellow-900/30' : 'bg-yellow-50'}`}>
                                                <p className="text-yellow-500 text-sm">
                                                    {language === 'bn' ? 'অমীমাংসিত' : 'Pending'}
                                                </p>
                                                <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                                    {selectedWardStats.pending}
                                                </p>
                                            </div>
                                            <div className={`p-3 rounded-lg ${isDark ? 'bg-blue-900/30' : 'bg-blue-50'}`}>
                                                <p className="text-blue-500 text-sm">
                                                    {language === 'bn' ? 'চলমান' : 'In Progress'}
                                                </p>
                                                <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                                    {selectedWardStats.in_progress}
                                                </p>
                                            </div>
                                            <div className={`p-3 rounded-lg ${isDark ? 'bg-purple-900/30' : 'bg-purple-50'}`}>
                                                <p className="text-purple-500 text-sm">
                                                    {language === 'bn' ? 'পর্যালোচনায়' : 'Under Review'}
                                                </p>
                                                <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                                    {selectedWardStats.under_review}
                                                </p>
                                            </div>
                                            <div className={`p-3 rounded-lg ${isDark ? 'bg-green-900/30' : 'bg-green-50'}`}>
                                                <p className="text-green-500 text-sm">
                                                    {language === 'bn' ? 'সমাধান' : 'Resolved'}
                                                </p>
                                                <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                                    {selectedWardStats.resolved}
                                                </p>
                                            </div>
                                        </div>

                                        {/* CTA Button */}
                                        <Link
                                            href="/complaints"
                                            className="block w-full mt-6 bg-orange-600 hover:bg-orange-700 text-white text-center py-3 rounded-lg font-medium transition-colors"
                                        >
                                            {language === 'bn' ? 'সমস্যা জানান' : 'Report a Problem'}
                                        </Link>
                                    </div>
                                </>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-center">
                                    <svg className={`w-16 h-16 mb-4 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                    </svg>
                                    <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                        {language === 'bn' ? 'একটি ওয়ার্ড নির্বাচন করুন' : 'Select a Ward'}
                                    </h3>
                                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                        {language === 'bn'
                                            ? 'ম্যাপে যেকোনো ওয়ার্ডে ক্লিক করে বিস্তারিত দেখুন'
                                            : 'Click on any ward in the map to see details'}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* All Wards Grid */}
            <section className="py-8">
                <div className="container mx-auto px-4">
                    <h2 className={`text-xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {language === 'bn' ? 'সব ওয়ার্ডের সমস্যা' : 'Problems by All Wards'}
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                        {stats.map(stat => (
                            <button
                                key={stat.ward}
                                onClick={() => handleWardClick(stat.ward)}
                                className={`p-4 rounded-xl text-center transition-all ${
                                    selectedWard === stat.ward
                                        ? 'ring-2 ring-orange-500'
                                        : ''
                                } ${getHeatColor(stat.intensity)} ${
                                    isDark ? 'hover:ring-2 hover:ring-gray-600' : 'hover:shadow-lg'
                                }`}
                            >
                                <p className={`font-bold text-lg ${stat.intensity > 0.5 ? 'text-white' : (isDark ? 'text-white' : 'text-gray-900')}`}>
                                    {language === 'bn' ? `ওয়ার্ড ${stat.ward}` : `Ward ${stat.ward}`}
                                </p>
                                <p className={`text-2xl font-bold mt-1 ${stat.intensity > 0.5 ? 'text-white' : (isDark ? 'text-orange-400' : 'text-orange-600')}`}>
                                    {stat.total}
                                </p>
                                <p className={`text-xs mt-1 ${stat.intensity > 0.5 ? 'text-white/80' : (isDark ? 'text-gray-400' : 'text-gray-500')}`}>
                                    {language === 'bn' ? 'সমস্যা' : 'issues'}
                                </p>
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className={`py-12 ${isDark ? 'bg-gray-800' : 'bg-orange-50'}`}>
                <div className="container mx-auto px-4 text-center">
                    <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {language === 'bn' ? 'আপনার এলাকায় কোনো সমস্যা আছে?' : 'Have a problem in your area?'}
                    </h2>
                    <p className={`mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {language === 'bn'
                            ? 'এখনই আপনার সমস্যা জানান এবং একটি ট্র্যাকিং আইডি পান'
                            : 'Report your problem now and get a tracking ID'}
                    </p>
                    <Link
                        href="/complaints"
                        className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-lg font-medium transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        {language === 'bn' ? 'সমস্যা জানান' : 'Report Problem'}
                    </Link>
                </div>
            </section>
        </div>
    );
}
