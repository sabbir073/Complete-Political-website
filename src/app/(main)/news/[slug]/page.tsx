"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useLanguage } from '@/providers/LanguageProvider';
import { useTheme } from '@/providers/ThemeProvider';
import { getReadTimeText } from '@/lib/cms-utils';

interface NewsDetail {
    id: string;
    title_en: string;
    title_bn?: string;
    slug: string;
    published_at: string;
    excerpt_en?: string;
    excerpt_bn?: string;
    content_en?: string;
    content_bn?: string;
    featured_image?: string;
    featured_image_alt_en?: string;
    featured_image_alt_bn?: string;
    author_name?: string;
    read_time?: number;
    is_featured?: boolean;
    category?: {
        id: string;
        name_en: string;
        name_bn?: string;
    };
}

export default function NewsDetailPage() {
    const params = useParams();
    const slug = params.slug as string;
    const [news, setNews] = useState<NewsDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [notFoundState, setNotFoundState] = useState(false);
    const { language } = useLanguage();
    const { isDark } = useTheme();

    const getText = (en?: string, bn?: string) => {
        if (language === 'bn' && bn) return bn;
        return en || '';
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


    useEffect(() => {
        const fetchNews = async () => {
            try {
                const res = await fetch(`/api/news/${slug}`);
                if (!res.ok) {
                    setNotFoundState(true);
                    return;
                }
                const data = await res.json();
                setNews(data);
            } catch (error) {
                console.error('Error fetching news:', error);
                setNotFoundState(true);
            } finally {
                setLoading(false);
            }
        };

        if (slug) {
            fetchNews();
        }
    }, [slug]);

    if (loading) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            </div>
        );
    }

    if (notFoundState || !news) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
                <div className="text-center px-4">
                    <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                        <svg className={`w-10 h-10 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                        </svg>
                    </div>
                    <h1 className={`text-3xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {language === 'bn' ? 'সংবাদ পাওয়া যায়নি' : 'News Not Found'}
                    </h1>
                    <p className={`mb-8 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        {language === 'bn' ? 'দুঃখিত, এই সংবাদটি খুঁজে পাওয়া যায়নি।' : 'Sorry, this news article could not be found.'}
                    </p>
                    <Link href="/news">
                        <button className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium">
                            {language === 'bn' ? 'সব সংবাদ দেখুন' : 'View All News'}
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
                {news.featured_image ? (
                    <div className="relative h-[400px] md:h-[500px]">
                        <Image
                            src={news.featured_image}
                            alt={getText(news.featured_image_alt_en, news.featured_image_alt_bn) || getText(news.title_en, news.title_bn)}
                            fill
                            className="object-cover"
                            priority
                            unoptimized={news.featured_image?.includes('cloudfront')}
                        />
                        <div className={`absolute inset-0 ${isDark ? 'bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent' : 'bg-gradient-to-t from-black/80 via-black/40 to-transparent'}`}></div>

                        {/* Title Overlay */}
                        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
                            <div className="max-w-5xl mx-auto">
                                {/* Category Badge */}
                                {news.category && (
                                    <span className="inline-block px-4 py-1.5 rounded-full text-sm font-semibold mb-4 bg-red-600 text-white">
                                        {getText(news.category.name_en, news.category.name_bn)}
                                    </span>
                                )}
                                {news.is_featured && (
                                    <span className="inline-block px-4 py-1.5 rounded-full text-sm font-semibold mb-4 ml-2 bg-yellow-500 text-white">
                                        {language === 'bn' ? 'বিশেষ' : 'Featured'}
                                    </span>
                                )}
                                <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">
                                    {getText(news.title_en, news.title_bn)}
                                </h1>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className={`h-[200px] ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`}>
                        <div className="max-w-5xl mx-auto px-6 py-12">
                            <div className="flex flex-wrap gap-2 mb-4">
                                {news.category && (
                                    <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-semibold ${isDark ? 'bg-red-900/50 text-red-400' : 'bg-red-100 text-red-600'}`}>
                                        {getText(news.category.name_en, news.category.name_bn)}
                                    </span>
                                )}
                                {news.is_featured && (
                                    <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-semibold ${isDark ? 'bg-yellow-900/50 text-yellow-400' : 'bg-yellow-100 text-yellow-600'}`}>
                                        {language === 'bn' ? 'বিশেষ' : 'Featured'}
                                    </span>
                                )}
                            </div>
                            <h1 className={`text-3xl md:text-5xl font-bold leading-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {getText(news.title_en, news.title_bn)}
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
                        {(news.excerpt_en || news.excerpt_bn) && (
                            <p className={`text-xl md:text-2xl font-medium mb-8 leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                {getText(news.excerpt_en, news.excerpt_bn)}
                            </p>
                        )}

                        {/* Content */}
                        {(news.content_en || news.content_bn) && (
                            <div
                                className={`prose prose-lg max-w-none ${isDark ? 'prose-invert' : 'prose-p:text-gray-700 prose-headings:text-gray-900'}`}
                                style={isDark ? { color: '#e5e7eb' } : undefined}
                            >
                                <div
                                    dangerouslySetInnerHTML={{ __html: getText(news.content_en, news.content_bn) || '' }}
                                    style={isDark ? { color: '#e5e7eb' } : undefined}
                                    className={isDark ? '[&_*]:!text-gray-200 [&_h1]:!text-white [&_h2]:!text-white [&_h3]:!text-white [&_h4]:!text-white [&_h5]:!text-white [&_h6]:!text-white [&_strong]:!text-white [&_b]:!text-white [&_a]:!text-red-400 [&_p]:!text-gray-200 [&_li]:!text-gray-200 [&_span]:!text-gray-200' : ''}
                                />
                            </div>
                        )}

                        {/* No Content Message */}
                        {!news.content_en && !news.content_bn && !news.excerpt_en && !news.excerpt_bn && (
                            <div className={`text-center py-12 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <p>{language === 'bn' ? 'এই সংবাদের জন্য কোনো বিবরণ নেই।' : 'No content available for this news article.'}</p>
                            </div>
                        )}
                    </div>

                    {/* Sidebar - Article Details */}
                    <div className="lg:col-span-1">
                        <div className={`sticky top-24 rounded-2xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white shadow-lg'}`}>
                            <h3 className={`text-lg font-bold mb-6 pb-4 border-b ${isDark ? 'text-white border-gray-700' : 'text-gray-900 border-gray-200'}`}>
                                {language === 'bn' ? 'নিবন্ধ বিবরণ' : 'Article Details'}
                            </h3>

                            {/* Author */}
                            {news.author_name && (
                                <div className="mb-6">
                                    <div className="flex items-start gap-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${isDark ? 'bg-red-900/30' : 'bg-red-50'}`}>
                                            <span className={`text-lg font-bold ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                                                {news.author_name.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        <div>
                                            <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                                {language === 'bn' ? 'লেখক' : 'Author'}
                                            </p>
                                            <p className={`text-sm mt-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                                {news.author_name}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Published Date */}
                            <div className="mb-6">
                                <div className="flex items-start gap-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${isDark ? 'bg-red-900/30' : 'bg-red-50'}`}>
                                        <svg className={`w-6 h-6 ${isDark ? 'text-red-400' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                            {language === 'bn' ? 'প্রকাশিত' : 'Published'}
                                        </p>
                                        <p className={`text-sm mt-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                            {formatDate(news.published_at)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Read Time */}
                            <div className="mb-6">
                                <div className="flex items-start gap-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${isDark ? 'bg-red-900/30' : 'bg-red-50'}`}>
                                        <svg className={`w-6 h-6 ${isDark ? 'text-red-400' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                            {language === 'bn' ? 'পড়ার সময়' : 'Read Time'}
                                        </p>
                                        <p className={`text-sm mt-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                            {getReadTimeText(news.content_en, news.content_bn, language as 'en' | 'bn')}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Category */}
                            {news.category && (
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
                                                {getText(news.category.name_en, news.category.name_bn)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Back to News */}
                            <Link href="/news" className="block mt-6">
                                <button className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${isDark ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-red-600 hover:bg-red-700 text-white'}`}>
                                    {language === 'bn' ? '← সব সংবাদ দেখুন' : '← View All News'}
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
