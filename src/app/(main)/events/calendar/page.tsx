"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/providers/LanguageProvider';
import { useTheme } from '@/providers/ThemeProvider';

interface EventItem {
    id: string;
    title_en: string;
    title_bn?: string;
    slug: string;
    event_date: string;
    event_end_date?: string;
    location_en?: string;
    location_bn?: string;
    category?: {
        id: string;
        name_en: string;
        name_bn?: string;
    };
}

interface DayEvents {
    [key: string]: EventItem[];
}

export default function MeetingCalendarPage() {
    const [events, setEvents] = useState<EventItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [showMonthPicker, setShowMonthPicker] = useState(false);
    const [showYearPicker, setShowYearPicker] = useState(false);
    const { language } = useLanguage();
    const { isDark } = useTheme();

    const getText = (en?: string, bn?: string) => {
        if (language === 'bn' && bn) return bn;
        return en || '';
    };

    // Fetch all events
    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const res = await fetch('/api/events?limit=500');
                const data = await res.json();
                if (data.data) {
                    setEvents(data.data);
                }
            } catch (error) {
                console.error('Error fetching events:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, []);

    // Group events by date
    const eventsByDate: DayEvents = events.reduce((acc, event) => {
        const dateKey = new Date(event.event_date).toISOString().split('T')[0];
        if (!acc[dateKey]) {
            acc[dateKey] = [];
        }
        acc[dateKey].push(event);
        return acc;
    }, {} as DayEvents);

    // Calendar helpers
    const getDaysInMonth = (year: number, month: number) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (year: number, month: number) => {
        return new Date(year, month, 1).getDay();
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString(language === 'bn' ? 'bn-BD' : 'en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
            timeZone: 'Asia/Dhaka'
        });
    };

    // Navigation
    const goToPreviousMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
        setSelectedDate(null);
    };

    const goToNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
        setSelectedDate(null);
    };

    const goToToday = () => {
        setCurrentDate(new Date());
        setSelectedDate(null);
    };

    const goToYear = (year: number) => {
        setCurrentDate(new Date(year, currentDate.getMonth(), 1));
        setShowYearPicker(false);
    };

    const goToMonth = (month: number) => {
        setCurrentDate(new Date(currentDate.getFullYear(), month, 1));
        setShowMonthPicker(false);
    };

    // Handle date click
    const handleDateClick = (dateKey: string) => {
        if (eventsByDate[dateKey] && eventsByDate[dateKey].length > 0) {
            setSelectedDate(dateKey);
        }
    };

    // Close modal
    const closeModal = () => {
        setSelectedDate(null);
    };

    // Generate calendar grid
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const today = new Date();
    const todayKey = today.toISOString().split('T')[0];

    // Day names
    const dayNames = language === 'bn'
        ? ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহঃ', 'শুক্র', 'শনি']
        : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Month names
    const monthNames = language === 'bn'
        ? ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর']
        : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    // Generate year options (50 years back and 20 years forward)
    const currentYear = new Date().getFullYear();
    const yearOptions = Array.from({ length: 71 }, (_, i) => currentYear - 50 + i);

    // Generate calendar days
    const calendarDays = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
        calendarDays.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        calendarDays.push({
            day,
            dateKey,
            events: eventsByDate[dateKey] || [],
            isToday: dateKey === todayKey
        });
    }

    return (
        <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
            {/* Hero Header */}
            <div className={`relative py-16 md:py-24 ${isDark ? 'bg-gray-800' : 'bg-gradient-to-r from-blue-600 to-blue-700'}`}>
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute inset-0 bg-black/20"></div>
                    <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
                    <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
                </div>
                <div className="relative max-w-7xl mx-auto px-6 md:px-16 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-white text-sm font-medium mb-4">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {language === 'bn' ? 'ইভেন্ট ক্যালেন্ডার' : 'Event Calendar'}
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        {language === 'bn' ? 'মিটিং ক্যালেন্ডার' : 'Meeting Calendar'}
                    </h1>
                    <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
                        {language === 'bn'
                            ? 'ক্যালেন্ডারে তারিখে ক্লিক করে সেদিনের ইভেন্ট দেখুন'
                            : 'Click on a date to see events scheduled for that day'
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
                        <span className={isDark ? 'text-blue-400' : 'text-blue-600'}>
                            {language === 'bn' ? 'ক্যালেন্ডার' : 'Calendar'}
                        </span>
                    </nav>
                </div>
            </div>

            {/* Calendar Content */}
            <div className="max-w-5xl mx-auto px-6 md:px-16 py-12">
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : (
                    <div className={`rounded-2xl shadow-xl overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                        {/* Calendar Header */}
                        <div className={`p-4 md:p-6 ${isDark ? 'bg-gray-700' : 'bg-blue-600'}`}>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                {/* Month/Year Navigation */}
                                <div className="flex items-center gap-2 sm:gap-3">
                                    <button
                                        onClick={goToPreviousMonth}
                                        className="p-2 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                        </svg>
                                    </button>

                                    <div className="flex items-center gap-2">
                                        {/* Month Button */}
                                        <div className="relative">
                                            <button
                                                onClick={() => {
                                                    setShowMonthPicker(!showMonthPicker);
                                                    setShowYearPicker(false);
                                                }}
                                                className={`px-3 py-2 rounded-lg font-semibold text-base md:text-lg bg-white text-blue-600 hover:bg-blue-50 transition-colors flex items-center gap-1`}
                                            >
                                                {monthNames[month]}
                                                <svg className={`w-4 h-4 transition-transform ${showMonthPicker ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </button>

                                            {/* Month Picker Dropdown */}
                                            {showMonthPicker && (
                                                <div className={`absolute top-full left-0 mt-2 w-48 rounded-xl shadow-xl border z-50 ${
                                                    isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                                                }`}>
                                                    <div className="grid grid-cols-3 gap-1 p-2">
                                                        {monthNames.map((name, idx) => (
                                                            <button
                                                                key={idx}
                                                                onClick={() => goToMonth(idx)}
                                                                className={`px-2 py-2 rounded-lg text-sm font-medium transition-colors ${
                                                                    month === idx
                                                                        ? 'bg-blue-600 text-white'
                                                                        : isDark
                                                                            ? 'text-gray-300 hover:bg-gray-700'
                                                                            : 'text-gray-700 hover:bg-gray-100'
                                                                }`}
                                                            >
                                                                {name.substring(0, 3)}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Year Button */}
                                        <div className="relative">
                                            <button
                                                onClick={() => {
                                                    setShowYearPicker(!showYearPicker);
                                                    setShowMonthPicker(false);
                                                }}
                                                className={`px-3 py-2 rounded-lg font-semibold text-base md:text-lg bg-white text-blue-600 hover:bg-blue-50 transition-colors flex items-center gap-1`}
                                            >
                                                {language === 'bn' ? year.toLocaleString('bn-BD', { useGrouping: false }) : year}
                                                <svg className={`w-4 h-4 transition-transform ${showYearPicker ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </button>

                                            {/* Year Picker Dropdown */}
                                            {showYearPicker && (
                                                <div className={`absolute top-full left-0 mt-2 w-64 max-h-72 overflow-y-auto rounded-xl shadow-xl border z-50 ${
                                                    isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                                                }`}>
                                                    <div className="grid grid-cols-4 gap-1 p-2">
                                                        {yearOptions.map((y) => (
                                                            <button
                                                                key={y}
                                                                onClick={() => goToYear(y)}
                                                                className={`px-2 py-2 rounded-lg text-sm font-medium transition-colors ${
                                                                    year === y
                                                                        ? 'bg-blue-600 text-white'
                                                                        : isDark
                                                                            ? 'text-gray-300 hover:bg-gray-700'
                                                                            : 'text-gray-700 hover:bg-gray-100'
                                                                }`}
                                                            >
                                                                {language === 'bn' ? y.toLocaleString('bn-BD', { useGrouping: false }) : y}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <button
                                        onClick={goToNextMonth}
                                        className="p-2 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                </div>

                                {/* Today Button */}
                                <button
                                    onClick={goToToday}
                                    className="px-4 py-2 rounded-lg bg-white text-blue-600 font-semibold hover:bg-blue-50 transition-colors"
                                >
                                    {language === 'bn' ? 'আজ' : 'Today'}
                                </button>
                            </div>
                        </div>

                        {/* Calendar Grid */}
                        <div className="p-4 md:p-6">
                            {/* Day Headers */}
                            <div className="grid grid-cols-7 gap-1 mb-2">
                                {dayNames.map((day, index) => (
                                    <div
                                        key={day}
                                        className={`text-center py-3 text-sm font-semibold ${
                                            index === 5 || index === 6
                                                ? isDark ? 'text-red-400' : 'text-red-500'
                                                : isDark ? 'text-gray-400' : 'text-gray-600'
                                        }`}
                                    >
                                        {day}
                                    </div>
                                ))}
                            </div>

                            {/* Calendar Days */}
                            <div className="grid grid-cols-7 gap-1">
                                {calendarDays.map((dayData, index) => (
                                    <div key={index} className="aspect-square p-0.5 md:p-1">
                                        {dayData ? (
                                            <button
                                                onClick={() => handleDateClick(dayData.dateKey)}
                                                disabled={dayData.events.length === 0}
                                                className={`w-full h-full rounded-lg flex flex-col items-center justify-center relative transition-all ${
                                                    dayData.isToday
                                                        ? isDark
                                                            ? 'bg-blue-600 text-white ring-2 ring-blue-400'
                                                            : 'bg-blue-600 text-white ring-2 ring-blue-300'
                                                        : dayData.events.length > 0
                                                            ? isDark
                                                                ? 'bg-green-900/50 hover:bg-green-800/70 text-green-300 cursor-pointer hover:scale-105'
                                                                : 'bg-green-100 hover:bg-green-200 text-green-800 cursor-pointer hover:scale-105'
                                                            : isDark
                                                                ? 'text-gray-400'
                                                                : 'text-gray-500'
                                                }`}
                                            >
                                                <span className={`text-sm md:text-base font-medium ${
                                                    dayData.isToday ? 'font-bold' : ''
                                                }`}>
                                                    {language === 'bn' ? dayData.day.toLocaleString('bn-BD') : dayData.day}
                                                </span>

                                                {/* Event indicator dots */}
                                                {dayData.events.length > 0 && (
                                                    <div className="flex gap-0.5 mt-0.5 md:mt-1">
                                                        {dayData.events.slice(0, 3).map((_, i) => (
                                                            <div
                                                                key={i}
                                                                className={`w-1 h-1 md:w-1.5 md:h-1.5 rounded-full ${
                                                                    dayData.isToday
                                                                        ? 'bg-white'
                                                                        : isDark ? 'bg-green-400' : 'bg-green-600'
                                                                }`}
                                                            />
                                                        ))}
                                                        {dayData.events.length > 3 && (
                                                            <span className={`text-[8px] md:text-[10px] ml-0.5 ${
                                                                dayData.isToday
                                                                    ? 'text-white'
                                                                    : isDark ? 'text-green-400' : 'text-green-600'
                                                            }`}>
                                                                +{dayData.events.length - 3}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </button>
                                        ) : (
                                            <div className="w-full h-full" />
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Legend */}
                            <div className={`mt-6 pt-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'} flex flex-wrap gap-4 text-sm`}>
                                <div className="flex items-center gap-2">
                                    <div className={`w-4 h-4 rounded ${isDark ? 'bg-blue-600' : 'bg-blue-600'}`}></div>
                                    <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                                        {language === 'bn' ? 'আজ' : 'Today'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className={`w-4 h-4 rounded ${isDark ? 'bg-green-900/50' : 'bg-green-100'}`}></div>
                                    <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                                        {language === 'bn' ? 'ইভেন্ট আছে (ক্লিক করুন)' : 'Has Events (Click)'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Events Modal */}
            {selectedDate && eventsByDate[selectedDate] && (
                <div
                    className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    onClick={closeModal}
                >
                    <div
                        className={`w-full max-w-md max-h-[80vh] overflow-hidden rounded-2xl shadow-2xl ${
                            isDark ? 'bg-gray-800' : 'bg-white'
                        }`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className={`p-5 border-b ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-blue-600 border-blue-500'}`}>
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="text-lg font-bold text-white">
                                        {new Date(selectedDate + 'T00:00:00').toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            timeZone: 'Asia/Dhaka'
                                        })}
                                    </h3>
                                    <p className="text-sm mt-1 text-white/80">
                                        {eventsByDate[selectedDate].length} {language === 'bn' ? 'টি ইভেন্ট' : eventsByDate[selectedDate].length === 1 ? 'event' : 'events'}
                                    </p>
                                </div>
                                <button
                                    onClick={closeModal}
                                    className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Events List */}
                        <div className="p-4 overflow-y-auto max-h-[60vh]">
                            {eventsByDate[selectedDate].map((event) => (
                                <Link
                                    key={event.id}
                                    href={`/events/${event.slug}`}
                                    onClick={closeModal}
                                    className={`block p-4 rounded-xl mb-3 last:mb-0 transition-all hover:scale-[1.02] ${
                                        isDark
                                            ? 'bg-gray-700/50 hover:bg-gray-700 border border-gray-600'
                                            : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                                    }`}
                                >
                                    <h4 className={`font-semibold mb-2 ${
                                        isDark ? 'text-white' : 'text-gray-900'
                                    }`}>
                                        {getText(event.title_en, event.title_bn)}
                                    </h4>

                                    <div className="flex flex-wrap items-center gap-3 text-sm">
                                        <span className={`flex items-center gap-1.5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            {formatTime(event.event_date)}
                                        </span>

                                        {(event.location_en || event.location_bn) && (
                                            <span className={`flex items-center gap-1.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                </svg>
                                                <span className="truncate">{getText(event.location_en, event.location_bn)}</span>
                                            </span>
                                        )}
                                    </div>

                                    {event.category && (
                                        <span className={`inline-block mt-3 px-3 py-1 rounded-full text-xs font-medium ${
                                            isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-600'
                                        }`}>
                                            {getText(event.category.name_en, event.category.name_bn)}
                                        </span>
                                    )}

                                    <div className={`mt-3 pt-3 border-t flex items-center justify-between ${
                                        isDark ? 'border-gray-600' : 'border-gray-200'
                                    }`}>
                                        <span className={`text-sm font-medium ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                                            {language === 'bn' ? 'বিস্তারিত দেখুন' : 'View Details'}
                                        </span>
                                        <svg className={`w-4 h-4 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Click outside to close dropdowns */}
            {(showMonthPicker || showYearPicker) && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => {
                        setShowMonthPicker(false);
                        setShowYearPicker(false);
                    }}
                />
            )}
        </div>
    );
}
