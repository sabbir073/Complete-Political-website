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

    return (
        <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
            {/* Hero Section */}
            <section className={`py-8 md:py-12 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                <div className="container mx-auto px-4">
                    <div className="text-center max-w-3xl mx-auto">
                        <h1 className={`text-2xl sm:text-3xl md:text-4xl font-bold mb-3 md:mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {language === 'bn' ? 'এলাকাভিত্তিক সমস্যা' : 'Area-wise Problems'}
                        </h1>
                        <p className={`text-sm sm:text-base md:text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {language === 'bn'
                                ? 'ঢাকা-১৮ নির্বাচনী এলাকার ১৪টি ওয়ার্ডের সমস্যা ও তার বর্তমান অবস্থা দেখুন'
                                : 'View problems and their current status across all 14 wards of Dhaka-18 constituency'}
                        </p>
                    </div>
                </div>
            </section>

            {/* Summary Cards */}
            <section className="py-4 md:py-8">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                        <div className={`p-4 md:p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white shadow-lg'}`}>
                            <p className={`text-xs md:text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                {language === 'bn' ? 'মোট সমস্যা' : 'Total Problems'}
                            </p>
                            <p className={`text-2xl md:text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {loading ? '...' : summary.totalComplaints}
                            </p>
                        </div>
                        <div className={`p-4 md:p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white shadow-lg'}`}>
                            <p className={`text-xs md:text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                {language === 'bn' ? 'মোট ওয়ার্ড' : 'Total Wards'}
                            </p>
                            <p className={`text-2xl md:text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {summary.wardCount}
                            </p>
                        </div>
                        <div className={`p-4 md:p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white shadow-lg'}`}>
                            <p className={`text-xs md:text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                {language === 'bn' ? 'অমীমাংসিত' : 'Pending'}
                            </p>
                            <p className={`text-2xl md:text-3xl font-bold text-yellow-500`}>
                                {loading ? '...' : stats.reduce((acc, s) => acc + s.pending, 0)}
                            </p>
                        </div>
                        <div className={`p-4 md:p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white shadow-lg'}`}>
                            <p className={`text-xs md:text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                {language === 'bn' ? 'সমাধান' : 'Resolved'}
                            </p>
                            <p className={`text-2xl md:text-3xl font-bold text-green-500`}>
                                {loading ? '...' : stats.reduce((acc, s) => acc + s.resolved, 0)}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Map Section */}
            <section className="py-4 md:py-8">
                <div className="container mx-auto px-4">
                    {/* On mobile, show selected ward details first if a ward is selected */}
                    <div className="flex flex-col lg:grid lg:grid-cols-3 gap-4 md:gap-8">
                        {/* Selected Ward Details - Shows first on mobile when ward is selected */}
                        {selectedWard && selectedWardStats && (
                            <div className={`lg:hidden p-4 md:p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white shadow-lg'}`}>
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                            {language === 'bn' ? `ওয়ার্ড ${selectedWard}` : `Ward ${selectedWard}`}
                                        </h2>
                                        <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                            {language === 'bn' ? wardAreaNames[selectedWard]?.bn : wardAreaNames[selectedWard]?.en}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setSelectedWard(null)}
                                        className={`p-2 rounded-lg ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>

                                <div className="grid grid-cols-4 gap-2 mb-4">
                                    <div className={`p-2 rounded-lg text-center ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                        <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedWardStats.total}</p>
                                        <p className={`text-[10px] ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{language === 'bn' ? 'মোট' : 'Total'}</p>
                                    </div>
                                    <div className={`p-2 rounded-lg text-center ${isDark ? 'bg-yellow-900/30' : 'bg-yellow-50'}`}>
                                        <p className="text-lg font-bold text-yellow-500">{selectedWardStats.pending}</p>
                                        <p className={`text-[10px] ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{language === 'bn' ? 'অপেক্ষায়' : 'Pending'}</p>
                                    </div>
                                    <div className={`p-2 rounded-lg text-center ${isDark ? 'bg-blue-900/30' : 'bg-blue-50'}`}>
                                        <p className="text-lg font-bold text-blue-500">{selectedWardStats.in_progress}</p>
                                        <p className={`text-[10px] ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{language === 'bn' ? 'চলমান' : 'Progress'}</p>
                                    </div>
                                    <div className={`p-2 rounded-lg text-center ${isDark ? 'bg-green-900/30' : 'bg-green-50'}`}>
                                        <p className="text-lg font-bold text-green-500">{selectedWardStats.resolved}</p>
                                        <p className={`text-[10px] ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{language === 'bn' ? 'সমাধান' : 'Resolved'}</p>
                                    </div>
                                </div>

                                <Link
                                    href="/complaints"
                                    className="block w-full bg-orange-600 hover:bg-orange-700 text-white text-center py-2.5 rounded-lg font-medium text-sm transition-colors"
                                >
                                    {language === 'bn' ? 'সমস্যা জানান' : 'Report a Problem'}
                                </Link>
                            </div>
                        )}

                        {/* Map */}
                        <div className={`lg:col-span-2 p-4 md:p-6 rounded-xl order-1 lg:order-none ${isDark ? 'bg-gray-800' : 'bg-white shadow-lg'}`}>
                            <h2 className={`text-lg md:text-xl font-bold mb-3 md:mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {language === 'bn' ? 'ইন্টারেক্টিভ ম্যাপ' : 'Interactive Map'}
                            </h2>
                            <p className={`text-xs mb-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                {language === 'bn' ? 'ওয়ার্ডে ক্লিক করুন বিস্তারিত দেখতে' : 'Tap on a ward to see details'}
                            </p>
                            {loading ? (
                                <div className="flex items-center justify-center h-64 md:h-96">
                                    <div className="w-10 h-10 md:w-12 md:h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            ) : (
                                <div className="w-full overflow-hidden">
                                    <Dhaka18Map
                                        stats={stats}
                                        language={language}
                                        onWardClick={handleWardClick}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Selected Ward Details - Desktop only sidebar */}
                        <div className={`hidden lg:block p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white shadow-lg'}`}>
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

            {/* CTA Section */}
            <section className={`py-8 md:py-12 ${isDark ? 'bg-gray-800' : 'bg-orange-50'}`}>
                <div className="container mx-auto px-4 text-center">
                    <h2 className={`text-xl md:text-2xl font-bold mb-3 md:mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {language === 'bn' ? 'আপনার এলাকায় কোনো সমস্যা আছে?' : 'Have a problem in your area?'}
                    </h2>
                    <p className={`text-sm md:text-base mb-4 md:mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {language === 'bn'
                            ? 'এখনই আপনার সমস্যা জানান এবং একটি ট্র্যাকিং আইডি পান'
                            : 'Report your problem now and get a tracking ID'}
                    </p>
                    <Link
                        href="/complaints"
                        className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-6 md:px-8 py-2.5 md:py-3 rounded-lg font-medium text-sm md:text-base transition-colors"
                    >
                        <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        {language === 'bn' ? 'সমস্যা জানান' : 'Report Problem'}
                    </Link>
                </div>
            </section>
        </div>
    );
}
