"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useLanguage } from '@/providers/LanguageProvider';
import { useTheme } from '@/providers/ThemeProvider';

interface EventDetail {
    id: string;
    title_en: string;
    title_bn?: string;
    slug: string;
    event_date: string;
    event_end_date?: string;
    location_en?: string;
    location_bn?: string;
    description_en?: string;
    description_bn?: string;
    excerpt_en?: string;
    excerpt_bn?: string;
    featured_image?: string;
    featured_image_alt_en?: string;
    featured_image_alt_bn?: string;
    category?: {
        id: string;
        name_en: string;
        name_bn?: string;
    };
    published_at?: string;
}

type EventStatus = 'upcoming' | 'today' | 'past';

export default function EventDetailPage() {
    const params = useParams();
    const slug = params.slug as string;
    const [event, setEvent] = useState<EventDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [notFoundState, setNotFoundState] = useState(false);
    const { language } = useLanguage();
    const { isDark } = useTheme();

    const getText = (en?: string, bn?: string) => {
        if (language === 'bn' && bn) return bn;
        return en || '';
    };

    // Get event status (upcoming, today, or past)
    const getEventStatus = (eventDate: string, eventEndDate?: string): EventStatus => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

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
                    text: language === 'bn' ? 'আসন্ন ইভেন্ট' : 'Upcoming Event',
                    bgClass: 'bg-green-500',
                    textClass: 'text-white'
                };
            case 'today':
                return {
                    text: language === 'bn' ? 'আজকের ইভেন্ট' : "Today's Event",
                    bgClass: 'bg-red-500',
                    textClass: 'text-white'
                };
            case 'past':
                return {
                    text: language === 'bn' ? 'অতীত ইভেন্ট' : 'Past Event',
                    bgClass: 'bg-gray-500',
                    textClass: 'text-white'
                };
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const options: Intl.DateTimeFormatOptions = {
            weekday: 'long',
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

    // Check if two dates are on the same day (in Bangladesh timezone)
    const isSameDay = (date1: string, date2: string) => {
        const d1 = new Date(date1);
        const d2 = new Date(date2);
        const options: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            timeZone: 'Asia/Dhaka'
        };
        return d1.toLocaleDateString('en-US', options) === d2.toLocaleDateString('en-US', options);
    };

    // Format date and time combined for cleaner display
    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString);
        const dateOptions: Intl.DateTimeFormatOptions = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            timeZone: 'Asia/Dhaka'
        };
        const timeOptions: Intl.DateTimeFormatOptions = {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
            timeZone: 'Asia/Dhaka'
        };
        const locale = language === 'bn' ? 'bn-BD' : 'en-US';
        const formattedDate = date.toLocaleDateString(locale, dateOptions);
        const formattedTime = date.toLocaleTimeString(locale, timeOptions);
        return { date: formattedDate, time: formattedTime };
    };

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const res = await fetch(`/api/events/${slug}`);
                if (!res.ok) {
                    setNotFoundState(true);
                    return;
                }
                const data = await res.json();
                setEvent(data);
            } catch (error) {
                console.error('Error fetching event:', error);
                setNotFoundState(true);
            } finally {
                setLoading(false);
            }
        };

        if (slug) {
            fetchEvent();
        }
    }, [slug]);

    if (loading) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            </div>
        );
    }

    if (notFoundState || !event) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
                <div className="text-center px-4">
                    <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                        <svg className={`w-10 h-10 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <h1 className={`text-3xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {language === 'bn' ? 'ইভেন্ট পাওয়া যায়নি' : 'Event Not Found'}
                    </h1>
                    <p className={`mb-8 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        {language === 'bn' ? 'দুঃখিত, এই ইভেন্টটি খুঁজে পাওয়া যায়নি।' : 'Sorry, this event could not be found.'}
                    </p>
                    <Link href="/events">
                        <button className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium">
                            {language === 'bn' ? 'সব ইভেন্ট দেখুন' : 'View All Events'}
                        </button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
            {/* Hero Section with Featured Image */}
            <div className="relative">
                {event.featured_image ? (
                    <div className="relative h-[400px] md:h-[500px]">
                        <Image
                            src={event.featured_image}
                            alt={getText(event.featured_image_alt_en, event.featured_image_alt_bn) || getText(event.title_en, event.title_bn)}
                            fill
                            className="object-cover"
                            priority
                            unoptimized={event.featured_image?.includes('cloudfront')}
                        />
                        <div className={`absolute inset-0 ${isDark ? 'bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent' : 'bg-gradient-to-t from-black/80 via-black/40 to-transparent'}`}></div>

                        {/* Title Overlay */}
                        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
                            <div className="max-w-5xl mx-auto">
                                {/* Status and Category Badges */}
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {(() => {
                                        const status = getEventStatus(event.event_date, event.event_end_date);
                                        const badge = getStatusBadge(status);
                                        return (
                                            <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wide ${badge.bgClass} ${badge.textClass}`}>
                                                {badge.text}
                                            </span>
                                        );
                                    })()}
                                    {event.category && (
                                        <span className="inline-block px-4 py-1.5 rounded-full text-sm font-semibold bg-white/20 backdrop-blur-sm text-white">
                                            {getText(event.category.name_en, event.category.name_bn)}
                                        </span>
                                    )}
                                </div>
                                <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">
                                    {getText(event.title_en, event.title_bn)}
                                </h1>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className={`h-[200px] ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`}>
                        <div className="max-w-5xl mx-auto px-6 py-12">
                            {/* Status and Category Badges */}
                            <div className="flex flex-wrap gap-2 mb-4">
                                {(() => {
                                    const status = getEventStatus(event.event_date, event.event_end_date);
                                    const badge = getStatusBadge(status);
                                    return (
                                        <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wide ${badge.bgClass} ${badge.textClass}`}>
                                            {badge.text}
                                        </span>
                                    );
                                })()}
                                {event.category && (
                                    <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-semibold ${isDark ? 'bg-red-900/50 text-red-400' : 'bg-red-100 text-red-600'}`}>
                                        {getText(event.category.name_en, event.category.name_bn)}
                                    </span>
                                )}
                            </div>
                            <h1 className={`text-3xl md:text-5xl font-bold leading-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {getText(event.title_en, event.title_bn)}
                            </h1>
                        </div>
                    </div>
                )}
            </div>

            {/* Content Section */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        {/* Excerpt */}
                        {(event.excerpt_en || event.excerpt_bn) && (
                            <p className={`text-xl md:text-2xl font-medium mb-8 leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                {getText(event.excerpt_en, event.excerpt_bn)}
                            </p>
                        )}

                        {/* Description */}
                        {(event.description_en || event.description_bn) && (
                            <div
                                className={`prose prose-lg max-w-none ${isDark ? 'prose-invert' : 'prose-p:text-gray-700 prose-headings:text-gray-900'}`}
                                style={isDark ? { color: '#e5e7eb' } : undefined}
                            >
                                <div
                                    dangerouslySetInnerHTML={{ __html: getText(event.description_en, event.description_bn) || '' }}
                                    style={isDark ? { color: '#e5e7eb' } : undefined}
                                    className={isDark ? '[&_*]:!text-gray-200 [&_h1]:!text-white [&_h2]:!text-white [&_h3]:!text-white [&_h4]:!text-white [&_h5]:!text-white [&_h6]:!text-white [&_strong]:!text-white [&_b]:!text-white [&_a]:!text-red-400 [&_p]:!text-gray-200 [&_li]:!text-gray-200 [&_span]:!text-gray-200' : ''}
                                />
                            </div>
                        )}

                        {/* No Description Message */}
                        {!event.description_en && !event.description_bn && !event.excerpt_en && !event.excerpt_bn && (
                            <div className={`text-center py-12 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <p>{language === 'bn' ? 'এই ইভেন্টের জন্য কোনো বিবরণ নেই।' : 'No description available for this event.'}</p>
                            </div>
                        )}
                    </div>

                    {/* Sidebar - Event Details */}
                    <div className="lg:col-span-1">
                        <div className={`sticky top-24 rounded-2xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white shadow-lg'}`}>
                            <h3 className={`text-lg font-bold mb-6 pb-4 border-b ${isDark ? 'text-white border-gray-700' : 'text-gray-900 border-gray-200'}`}>
                                {language === 'bn' ? 'ইভেন্ট বিবরণ' : 'Event Details'}
                            </h3>

                            {/* Event Status */}
                            <div className="mb-6">
                                <div className="flex items-start gap-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${isDark ? 'bg-red-900/30' : 'bg-red-50'}`}>
                                        <svg className={`w-6 h-6 ${isDark ? 'text-red-400' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                            {language === 'bn' ? 'অবস্থা' : 'Status'}
                                        </p>
                                        {(() => {
                                            const status = getEventStatus(event.event_date, event.event_end_date);
                                            const badge = getStatusBadge(status);
                                            return (
                                                <span className={`inline-block px-3 py-1 mt-1 rounded-full text-xs font-bold ${badge.bgClass} ${badge.textClass}`}>
                                                    {badge.text}
                                                </span>
                                            );
                                        })()}
                                    </div>
                                </div>
                            </div>

                            {/* Date & Time - New Clean Design */}
                            <div className="mb-6">
                                <p className={`font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    {language === 'bn' ? 'তারিখ ও সময়' : 'Date & Time'}
                                </p>
                                {(() => {
                                    const start = formatDateTime(event.event_date);
                                    const hasEndDate = event.event_end_date;
                                    const sameDay = hasEndDate && isSameDay(event.event_date, event.event_end_date!);
                                    const startDate = new Date(event.event_date);
                                    const endDate = hasEndDate ? new Date(event.event_end_date!) : null;

                                    // Get short month and day for the calendar-style display
                                    const getShortMonth = (date: Date) => {
                                        return date.toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', {
                                            month: 'short',
                                            timeZone: 'Asia/Dhaka'
                                        });
                                    };
                                    const getDay = (date: Date) => {
                                        return date.toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', {
                                            day: 'numeric',
                                            timeZone: 'Asia/Dhaka'
                                        });
                                    };
                                    const getWeekday = (date: Date) => {
                                        return date.toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', {
                                            weekday: 'short',
                                            timeZone: 'Asia/Dhaka'
                                        });
                                    };

                                    return (
                                        <div className={`rounded-xl overflow-hidden ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                                            {/* Start Date/Time */}
                                            <div className="flex items-center">
                                                {/* Calendar Icon Style Date */}
                                                <div className={`w-16 h-16 flex flex-col items-center justify-center ${isDark ? 'bg-red-600' : 'bg-red-600'} text-white flex-shrink-0`}>
                                                    <span className="text-xs font-medium uppercase">{getShortMonth(startDate)}</span>
                                                    <span className="text-2xl font-bold leading-none">{getDay(startDate)}</span>
                                                    <span className="text-xs">{getWeekday(startDate)}</span>
                                                </div>
                                                {/* Time Info */}
                                                <div className="flex-1 px-4 py-3">
                                                    <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                                        {language === 'bn' ? 'শুরু' : 'Starts'}
                                                    </p>
                                                    <p className={`text-lg font-semibold ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                                                        {start.time}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* End Date/Time (if exists) */}
                                            {hasEndDate && endDate && (
                                                <>
                                                    <div className={`border-t ${isDark ? 'border-gray-600' : 'border-gray-200'}`}></div>
                                                    <div className="flex items-center">
                                                        {/* Calendar Icon Style Date */}
                                                        <div className={`w-16 h-16 flex flex-col items-center justify-center ${isDark ? 'bg-gray-600' : 'bg-gray-400'} text-white flex-shrink-0`}>
                                                            <span className="text-xs font-medium uppercase">{getShortMonth(endDate)}</span>
                                                            <span className="text-2xl font-bold leading-none">{getDay(endDate)}</span>
                                                            <span className="text-xs">{getWeekday(endDate)}</span>
                                                        </div>
                                                        {/* Time Info */}
                                                        <div className="flex-1 px-4 py-3">
                                                            <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                                                {language === 'bn' ? 'শেষ' : 'Ends'}
                                                            </p>
                                                            <p className={`text-lg font-semibold ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                                                {formatDateTime(event.event_end_date!).time}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    );
                                })()}
                            </div>

                            {/* Location */}
                            {(event.location_en || event.location_bn) && (
                                <div className="mb-6">
                                    <div className="flex items-start gap-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${isDark ? 'bg-red-900/30' : 'bg-red-50'}`}>
                                            <svg className={`w-6 h-6 ${isDark ? 'text-red-400' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                                {language === 'bn' ? 'স্থান' : 'Location'}
                                            </p>
                                            <p className={`text-sm mt-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                                {getText(event.location_en, event.location_bn)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Category */}
                            {event.category && (
                                <div className="mb-6">
                                    <div className="flex items-start gap-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${isDark ? 'bg-red-900/30' : 'bg-red-50'}`}>
                                            <svg className={`w-6 h-6 ${isDark ? 'text-red-400' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                                {language === 'bn' ? 'বিভাগ' : 'Category'}
                                            </p>
                                            <p className={`text-sm mt-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                                {getText(event.category.name_en, event.category.name_bn)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Back to Events */}
                            <Link href="/events" className="block mt-6">
                                <button className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${isDark ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-red-600 hover:bg-red-700 text-white'}`}>
                                    {language === 'bn' ? '← সব ইভেন্ট দেখুন' : '← View All Events'}
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
