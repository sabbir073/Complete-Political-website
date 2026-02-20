'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/providers/LanguageProvider';
import { useTheme } from '@/providers/ThemeProvider';
import Link from 'next/link';
import { format } from 'date-fns';

interface Challenge {
  id: string;
  title_en: string;
  title_bn: string;
  description_en?: string;
  description_bn?: string;
  cover_image?: string;
  start_date: string;
  end_date: string;
  status: string;
  computed_status: string;
  created_at: string;
}

const PAGE_SIZE = 12;

export default function ChallengesPage() {
  const { language } = useLanguage();
  const { isDark } = useTheme();

  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<'all' | 'active' | 'upcoming' | 'ended'>('all');

  const getText = useCallback((en: string, bn?: string) => {
    if (language === 'bn' && bn) return bn;
    return en;
  }, [language]);

  const fetchChallenges = useCallback(async (pageNum: number, currentFilter: string, replace: boolean) => {
    try {
      if (replace) setLoading(true);
      else setLoadingMore(true);

      const params = new URLSearchParams();
      params.set('limit', String(PAGE_SIZE));
      params.set('page', String(pageNum));
      if (currentFilter !== 'all') params.set('status', currentFilter);

      const res = await fetch(`/api/challenges?${params}`);
      const data = await res.json();
      if (data.success) {
        const fetched: Challenge[] = data.data || [];
        setChallenges(prev => replace ? fetched : [...prev, ...fetched]);
        setHasMore(fetched.length === PAGE_SIZE);
      }
    } catch (error) {
      console.error('Failed to fetch challenges:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  // Reset and fetch when filter changes
  useEffect(() => {
    setPage(1);
    fetchChallenges(1, filter, true);
  }, [filter, fetchChallenges]);

  const handleLoadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchChallenges(next, filter, false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">{getText('Active', 'চলমান')}</span>;
      case 'upcoming':
        return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">{getText('Upcoming', 'আসন্ন')}</span>;
      case 'ended':
        return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">{getText('Ended', 'সমাপ্ত')}</span>;
      default:
        return null;
    }
  };

  const getDaysLeft = (endDate: string, startDate: string, status: string) => {
    const now = new Date();
    const end = new Date(endDate);
    const start = new Date(startDate);
    if (status === 'ended' || now > end) return null;
    if (now < start) {
      const diff = Math.ceil((start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return { label: getText(`Starts in ${diff}d`, `${diff}দিনে শুরু`), color: 'bg-blue-500/70' };
    }
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diff <= 0) return null;
    return { label: getText(`${diff}d left`, `${diff}দিন বাকি`), color: 'bg-black/50' };
  };

  const FILTER_OPTIONS: Array<['all' | 'active' | 'upcoming' | 'ended', string, string]> = [
    ['all', 'All', 'সব'],
    ['active', 'Active', 'চলমান'],
    ['upcoming', 'Upcoming', 'আসন্ন'],
    ['ended', 'Ended', 'সমাপ্ত'],
  ];

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Hero Section */}
      <div className={`relative py-16 ${isDark ? 'bg-gradient-to-r from-green-900 via-green-800 to-green-900' : 'bg-gradient-to-r from-green-600 via-green-500 to-green-600'}`}>
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {getText('Challenges', 'চ্যালেঞ্জ')}
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            {getText(
              'Join our challenges, showcase your participation, and make a difference in the community.',
              'আমাদের চ্যালেঞ্জে অংশ নিন, আপনার অংশগ্রহণ প্রদর্শন করুন এবং সমাজে পরিবর্তন আনুন।'
            )}
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className={`flex gap-1 p-1 rounded-xl w-fit ${isDark ? 'bg-gray-800' : 'bg-white shadow'}`}>
          {FILTER_OPTIONS.map(([val, en, bn]) => (
            <button
              key={val}
              onClick={() => setFilter(val)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === val
                  ? 'bg-green-600 text-white shadow'
                  : isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {getText(en, bn)}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
          </div>
        ) : challenges.length === 0 ? (
          <div className={`text-center py-20 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
            <p className="text-lg">{getText('No challenges found', 'কোনো চ্যালেঞ্জ পাওয়া যায়নি')}</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {challenges.map((challenge) => {
                const daysInfo = getDaysLeft(challenge.end_date, challenge.start_date, challenge.computed_status);
                return (
                  <div key={challenge.id} className={`rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                    {/* Cover */}
                    {challenge.cover_image ? (
                      <div className="relative h-48 overflow-hidden">
                        <img src={challenge.cover_image} alt={getText(challenge.title_en, challenge.title_bn)} className="w-full h-full object-cover" />
                        <div className="absolute top-3 left-3">{getStatusBadge(challenge.computed_status)}</div>
                        {daysInfo && (
                          <div className={`absolute top-3 right-3 ${daysInfo.color} text-white text-xs font-medium px-2 py-1 rounded-full`}>
                            {daysInfo.label}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className={`h-32 flex items-center justify-center relative ${
                        challenge.computed_status === 'active' ? 'bg-gradient-to-r from-green-500 to-green-600'
                        : challenge.computed_status === 'upcoming' ? 'bg-gradient-to-r from-blue-500 to-blue-600'
                        : 'bg-gradient-to-r from-gray-400 to-gray-500'
                      }`}>
                        <svg className="w-12 h-12 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                        </svg>
                        <div className="absolute top-3 left-3">{getStatusBadge(challenge.computed_status)}</div>
                        {daysInfo && (
                          <div className={`absolute top-3 right-3 ${daysInfo.color} text-white text-xs font-medium px-2 py-1 rounded-full`}>
                            {daysInfo.label}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Card Body */}
                    <div className="p-5">
                      <h3 className={`text-lg font-bold mb-2 line-clamp-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {getText(challenge.title_en, challenge.title_bn)}
                      </h3>
                      {(challenge.description_en || challenge.description_bn) && (
                        <p className={`text-sm mb-4 line-clamp-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {getText(challenge.description_en || '', challenge.description_bn)}
                        </p>
                      )}
                      <div className={`text-xs space-y-1 mb-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                        <div className="flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>{format(new Date(challenge.start_date), 'MMM d')} – {format(new Date(challenge.end_date), 'MMM d, yyyy')}</span>
                        </div>
                      </div>
                      <Link
                        href={`/challenges/${challenge.id}`}
                        className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-medium text-sm transition-colors ${
                          challenge.computed_status === 'active'
                            ? 'bg-green-600 hover:bg-green-700 text-white'
                            : isDark ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                        }`}
                      >
                        {challenge.computed_status === 'active'
                          ? getText('Join Challenge', 'চ্যালেঞ্জে যোগ দিন')
                          : getText('View Details', 'বিস্তারিত দেখুন')}
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Load More */}
            {hasMore && (
              <div className="mt-10 flex justify-center">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className={`inline-flex items-center gap-3 px-8 py-3 rounded-xl font-semibold text-sm transition-all shadow-md hover:shadow-lg disabled:opacity-60 ${
                    isDark
                      ? 'bg-gray-800 border border-gray-700 text-white hover:bg-gray-700'
                      : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {loadingMore ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-green-500" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      {getText('Loading...', 'লোড হচ্ছে...')}
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                      {getText('Load More Challenges', 'আরো চ্যালেঞ্জ দেখুন')}
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Count info */}
            <p className={`text-center mt-4 text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              {getText(`Showing ${challenges.length} challenge${challenges.length !== 1 ? 's' : ''}`, `${challenges.length}টি চ্যালেঞ্জ দেখাচ্ছে`)}
              {!hasMore && challenges.length > 0 && getText(' · All caught up!', ' · সব দেখা হয়েছে!')}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
