"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from '@/providers/LanguageProvider';
import { useTheme } from '@/providers/ThemeProvider';

interface EventItem {
    id: string;
    title_en: string;
    title_bn?: string;
    slug: string;
    description_en?: string;
    description_bn?: string;
    event_date: string;
    event_end_date?: string;
    featured_image?: string;
    location_en?: string;
    location_bn?: string;
    category?: {
        id: string;
        name_en: string;
        name_bn?: string;
    };
}

type EventStatus = 'upcoming' | 'today' | 'past';

export default function EventsPage() {
    const [events, setEvents] = useState<EventItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all');
    const { language } = useLanguage();
    const { isDark } = useTheme();

    const EVENTS_PER_PAGE = 9;

    const getText = (en?: string, bn?: string) => {
        if (language === 'bn' && bn) return bn;
        return en || '';
    };

    const stripHtml = (html?: string) => {
        if (!html) return '';
        return html.replace(/<[^>]*>/g, '');
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const options: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            timeZone: 'Asia/Dhaka' // Always show in Bangladesh time
        };
        return date.toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', options);
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString(language === 'bn' ? 'bn-BD' : 'en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
            timeZone: 'Asia/Dhaka' // Always show in Bangladesh time
        });
    };

    // Get event status (upcoming, today, or past)
    const getEventStatus = (eventDate: string, eventEndDate?: string): EventStatus => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const start = new Date(eventDate);
        const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate());

        const end = eventEndDate ? new Date(eventEndDate) : start;
        const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate());

        // Check if today falls within the event range
        if (today >= startDay && today <= endDay) {
            return 'today';
        }

        // Check if event is in the future
        if (startDay > today) {
            return 'upcoming';
        }

        return 'past';
    };

    // Get status badge text and colors
    const getStatusBadge = (status: EventStatus) => {
        switch (status) {
            case 'upcoming':
                return {
                    text: language === 'bn' ? 'আসন্ন' : 'Upcoming',
                    bgClass: isDark ? 'bg-green-600' : 'bg-green-500',
                    textClass: 'text-white'
                };
            case 'today':
                return {
                    text: language === 'bn' ? 'আজ' : 'Today',
                    bgClass: isDark ? 'bg-red-600' : 'bg-red-500',
                    textClass: 'text-white'
                };
            case 'past':
                return {
                    text: language === 'bn' ? 'অতীত' : 'Past',
                    bgClass: isDark ? 'bg-gray-600' : 'bg-gray-500',
                    textClass: 'text-white'
                };
        }
    };

    const fetchEvents = async (pageNum: number, isLoadMore: boolean = false) => {
        try {
            if (isLoadMore) {
                setLoadingMore(true);
            } else {
                setLoading(true);
            }

            const filterParam = filter === 'all' ? '' : `&filter=${filter}`;
            const res = await fetch(`/api/events?page=${pageNum}&limit=${EVENTS_PER_PAGE}${filterParam}`);
            const data = await res.json();

            if (data.data) {
                if (isLoadMore) {
                    setEvents(prev => [...prev, ...data.data]);
                } else {
                    setEvents(data.data);
                }
                setHasMore(data.pagination.page < data.pagination.totalPages);
            }
        } catch (error) {
            console.error('Error fetching events:', error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    useEffect(() => {
        setPage(1);
        fetchEvents(1, false);
    }, [filter]);

    const loadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchEvents(nextPage, true);
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
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        {language === 'bn' ? 'ইভেন্ট সমূহ' : 'Events'}
                    </h1>
                    <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
                        {language === 'bn'
                            ? 'আমাদের সকল অনুষ্ঠান ও কার্যক্রম দেখুন'
                            : 'Discover all our events and activities'
                        }
                    </p>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className={`sticky top-0 z-20 ${isDark ? 'bg-gray-900/95 backdrop-blur-sm border-b border-gray-700' : 'bg-white/95 backdrop-blur-sm border-b border-gray-200'}`}>
                <div className="max-w-7xl mx-auto px-6 md:px-16">
                    <div className="flex gap-2 py-4 overflow-x-auto">
                        {[
                            { key: 'all', label: language === 'bn' ? 'সকল' : 'All' },
                            { key: 'upcoming', label: language === 'bn' ? 'আসন্ন' : 'Upcoming' },
                            { key: 'past', label: language === 'bn' ? 'অতীত' : 'Past' }
                        ].map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setFilter(tab.key as 'all' | 'upcoming' | 'past')}
                                className={`px-6 py-2.5 rounded-full font-semibold transition-all duration-300 whitespace-nowrap ${
                                    filter === tab.key
                                        ? isDark
                                            ? 'bg-red-600 text-white shadow-lg'
                                            : 'bg-red-600 text-white shadow-lg'
                                        : isDark
                                            ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Events Content */}
            <div className="max-w-7xl mx-auto px-6 md:px-16 py-12">
                {/* Loading State */}
                {loading && (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
                    </div>
                )}

                {/* Empty State */}
                {!loading && events.length === 0 && (
                    <div className={`text-center py-16 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                            <svg className={`w-10 h-10 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {language === 'bn' ? 'কোনো ইভেন্ট পাওয়া যায়নি' : 'No Events Found'}
                        </h3>
                        <p>
                            {language === 'bn'
                                ? 'এই বিভাগে কোনো ইভেন্ট নেই।'
                                : 'There are no events in this category.'
                            }
                        </p>
                    </div>
                )}

                {/* Events Grid */}
                {!loading && events.length > 0 && (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {events.map((event, index) => {
                                const status = getEventStatus(event.event_date, event.event_end_date);
                                const badge = getStatusBadge(status);

                                return (
                                    <Link
                                        href={`/events/${event.slug}`}
                                        key={event.id}
                                        className="group"
                                    >
                                        <div className={`h-full rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.02] ${
                                            isDark
                                                ? 'bg-gray-800 shadow-gray-900/50'
                                                : 'bg-white shadow-gray-200/50'
                                        }`}>
                                            {/* Image Container */}
                                            <div className="relative h-56 overflow-hidden">
                                                <Image
                                                    src={event.featured_image || '/events/event1.jpg'}
                                                    alt={getText(event.title_en, event.title_bn)}
                                                    fill
                                                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                                                    unoptimized={event.featured_image?.includes('cloudfront')}
                                                />
                                                <div className={`absolute inset-0 ${
                                                    isDark
                                                        ? 'bg-gradient-to-t from-gray-900/60 via-transparent to-transparent'
                                                        : 'bg-gradient-to-t from-black/40 via-transparent to-transparent'
                                                }`}></div>

                                                {/* Status Badge */}
                                                <div className="absolute top-4 left-4">
                                                    <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide ${badge.bgClass} ${badge.textClass}`}>
                                                        {badge.text}
                                                    </span>
                                                </div>

                                                {/* Category Badge */}
                                                {event.category && (
                                                    <div className="absolute top-4 right-4">
                                                        <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                                                            isDark ? 'bg-gray-900/80 text-white' : 'bg-white/90 text-gray-900'
                                                        }`}>
                                                            {getText(event.category.name_en, event.category.name_bn)}
                                                        </span>
                                                    </div>
                                                )}

                                                {/* Date Badge */}
                                                <div className="absolute bottom-4 left-4 flex items-center gap-2">
                                                    <div className={`px-3 py-2 rounded-lg text-center ${
                                                        isDark ? 'bg-gray-900/90' : 'bg-white/95'
                                                    }`}>
                                                        <p className={`text-xs font-semibold ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                                                            {new Date(event.event_date).toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', { month: 'short', timeZone: 'Asia/Dhaka' }).toUpperCase()}
                                                        </p>
                                                        <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                                            {new Date(event.event_date).toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', { day: 'numeric', timeZone: 'Asia/Dhaka' })}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Content */}
                                            <div className="p-6">
                                                <h3 className={`text-xl font-bold mb-3 line-clamp-2 transition-colors duration-300 ${
                                                    isDark
                                                        ? 'text-white group-hover:text-red-400'
                                                        : 'text-gray-900 group-hover:text-red-600'
                                                }`}>
                                                    {getText(event.title_en, event.title_bn)}
                                                </h3>

                                                {/* Description */}
                                                {(event.description_en || event.description_bn) && (
                                                    <p className={`text-sm mb-4 line-clamp-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                                        {stripHtml(getText(event.description_en, event.description_bn))}
                                                    </p>
                                                )}

                                                {/* Meta Info */}
                                                <div className="space-y-2">
                                                    {/* Time */}
                                                    <div className="flex items-center gap-2">
                                                        <svg className={`w-4 h-4 ${isDark ? 'text-red-400' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                                            {formatTime(event.event_date)}
                                                        </span>
                                                    </div>

                                                    {/* Location */}
                                                    {(event.location_en || event.location_bn) && (
                                                        <div className="flex items-center gap-2">
                                                            <svg className={`w-4 h-4 ${isDark ? 'text-red-400' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            </svg>
                                                            <span className={`text-sm line-clamp-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                                                {getText(event.location_en, event.location_bn)}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* View Details Link */}
                                                <div className={`mt-4 pt-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                                                    <span className={`text-sm font-semibold transition-colors duration-300 ${
                                                        isDark
                                                            ? 'text-red-400 group-hover:text-red-300'
                                                            : 'text-red-600 group-hover:text-red-700'
                                                    }`}>
                                                        {language === 'bn' ? 'বিস্তারিত দেখুন' : 'View Details'} →
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Load More Button */}
                        {hasMore && (
                            <div className="text-center mt-12">
                                <button
                                    onClick={loadMore}
                                    disabled={loadingMore}
                                    className={`px-8 py-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed ${
                                        isDark
                                            ? 'bg-red-600 hover:bg-red-700 text-white'
                                            : 'bg-red-600 hover:bg-red-700 text-white'
                                    }`}
                                >
                                    {loadingMore ? (
                                        <span className="flex items-center gap-2">
                                            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            {language === 'bn' ? 'লোড হচ্ছে...' : 'Loading...'}
                                        </span>
                                    ) : (
                                        language === 'bn' ? 'আরও দেখুন' : 'Load More'
                                    )}
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
