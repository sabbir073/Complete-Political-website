"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from '@/providers/LanguageProvider';
import { useTheme } from '@/providers/ThemeProvider';
import { getReadTimeText, stripHtml } from '@/lib/cms-utils';

interface NewsItem {
    id: string;
    title_en: string;
    title_bn?: string;
    slug: string;
    excerpt_en?: string;
    excerpt_bn?: string;
    content_en?: string;
    content_bn?: string;
    published_at: string;
    featured_image?: string;
    featured_image_alt_en?: string;
    featured_image_alt_bn?: string;
    author_name?: string;
    is_featured?: boolean;
    category?: {
        id: string;
        name_en: string;
        name_bn?: string;
    };
}

export default function NewsPage() {
    const [news, setNews] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [totalCount, setTotalCount] = useState(0);
    const { language } = useLanguage();
    const { isDark } = useTheme();
    const ITEMS_PER_PAGE = 9;

    const getText = (en?: string, bn?: string) => {
        if (language === 'bn' && bn) return bn;
        return en || '';
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

    const fetchNews = async (pageNum: number, append: boolean = false) => {
        try {
            if (append) {
                setLoadingMore(true);
            } else {
                setLoading(true);
            }

            const res = await fetch(`/api/news?page=${pageNum}&limit=${ITEMS_PER_PAGE}`);
            const data = await res.json();

            if (data.data) {
                if (append) {
                    setNews(prev => [...prev, ...data.data]);
                } else {
                    setNews(data.data);
                }
                setTotalCount(data.pagination?.total || 0);
                setHasMore(data.data.length === ITEMS_PER_PAGE &&
                    (pageNum * ITEMS_PER_PAGE) < (data.pagination?.total || 0));
            }
        } catch (error) {
            console.error('Error fetching news:', error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    useEffect(() => {
        fetchNews(1);
    }, []);

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchNews(nextPage, true);
    };

    if (loading) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
            {/* Hero Header */}
            <div className={`relative py-16 md:py-24 ${isDark ? 'bg-gray-800' : 'bg-gradient-to-br from-red-600 to-red-700'}`}>
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
                    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
                </div>
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
                        {language === 'bn' ? 'সর্বশেষ সংবাদ' : 'Latest News'}
                    </h1>
                    <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto">
                        {language === 'bn'
                            ? 'আমাদের সাম্প্রতিক আপডেট এবং ঘোষণাগুলি দেখুন'
                            : 'Stay updated with our latest announcements and updates'}
                    </p>
                    <div className="mt-6 flex items-center justify-center gap-2 text-white/70">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                        </svg>
                        <span>
                            {language === 'bn'
                                ? `মোট ${totalCount} টি সংবাদ`
                                : `${totalCount} articles`}
                        </span>
                    </div>
                </div>
            </div>

            {/* News Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {news.length === 0 ? (
                    <div className={`text-center py-16 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                        </svg>
                        <p className="text-lg">
                            {language === 'bn' ? 'কোনো সংবাদ পাওয়া যায়নি।' : 'No news articles found.'}
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {news.map((item, index) => (
                                <article
                                    key={item.id}
                                    className={`group rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${
                                        isDark
                                            ? 'bg-gray-800 shadow-lg shadow-gray-900/50'
                                            : 'bg-white shadow-lg shadow-gray-200/50'
                                    }`}
                                >
                                    <Link href={`/news/${item.slug}`}>
                                        {/* Image */}
                                        <div className="relative h-52 overflow-hidden">
                                            {item.featured_image ? (
                                                <Image
                                                    src={item.featured_image}
                                                    alt={getText(item.featured_image_alt_en, item.featured_image_alt_bn) || getText(item.title_en, item.title_bn)}
                                                    fill
                                                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                                                    unoptimized={item.featured_image?.includes('cloudfront')}
                                                />
                                            ) : (
                                                <div className={`w-full h-full flex items-center justify-center ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                                                    <svg className={`w-16 h-16 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                                                    </svg>
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>

                                            {/* Featured Badge */}
                                            {item.is_featured && (
                                                <div className="absolute top-3 left-3">
                                                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-yellow-500 text-white shadow-lg">
                                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                        </svg>
                                                        {language === 'bn' ? 'বিশেষ' : 'Featured'}
                                                    </span>
                                                </div>
                                            )}

                                            {/* Category Badge */}
                                            {item.category && (
                                                <div className="absolute bottom-3 left-3">
                                                    <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-red-600 text-white">
                                                        {getText(item.category.name_en, item.category.name_bn)}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="p-6">
                                            {/* Meta */}
                                            <div className={`flex items-center gap-3 text-sm mb-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                                <span className="flex items-center gap-1">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                    {formatDate(item.published_at)}
                                                </span>
                                                <span>•</span>
                                                <span className="flex items-center gap-1">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    {getReadTimeText(item.content_en, item.content_bn, language as 'en' | 'bn').replace(' read', '').replace(' পড়া', '')}
                                                </span>
                                            </div>

                                            {/* Title */}
                                            <h2 className={`text-xl font-bold mb-3 line-clamp-2 transition-colors duration-300 ${
                                                isDark
                                                    ? 'text-white group-hover:text-red-400'
                                                    : 'text-gray-900 group-hover:text-red-600'
                                            }`}>
                                                {getText(item.title_en, item.title_bn)}
                                            </h2>

                                            {/* Excerpt */}
                                            <p className={`text-sm line-clamp-3 mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                                {getText(item.excerpt_en, item.excerpt_bn) ||
                                                    stripHtml(getText(item.content_en, item.content_bn) || '').substring(0, 150) + '...'}
                                            </p>

                                            {/* Author & Read More */}
                                            <div className={`flex items-center justify-between pt-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                                                {item.author_name && (
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center">
                                                            <span className="text-white text-xs font-bold">
                                                                {item.author_name.charAt(0).toUpperCase()}
                                                            </span>
                                                        </div>
                                                        <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                                            {item.author_name}
                                                        </span>
                                                    </div>
                                                )}
                                                <span className={`text-sm font-semibold flex items-center gap-1 transition-colors ${
                                                    isDark ? 'text-red-400 group-hover:text-red-300' : 'text-red-600 group-hover:text-red-700'
                                                }`}>
                                                    {language === 'bn' ? 'বিস্তারিত' : 'Read More'}
                                                    <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                </article>
                            ))}
                        </div>

                        {/* Load More Button */}
                        {hasMore && (
                            <div className="text-center mt-12">
                                <button
                                    onClick={handleLoadMore}
                                    disabled={loadingMore}
                                    className={`inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
                                        isDark
                                            ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-900/30'
                                            : 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/30'
                                    }`}
                                >
                                    {loadingMore ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            {language === 'bn' ? 'লোড হচ্ছে...' : 'Loading...'}
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                            {language === 'bn' ? 'আরো দেখুন' : 'Load More'}
                                        </>
                                    )}
                                </button>
                                <p className={`mt-4 text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                    {language === 'bn'
                                        ? `${news.length} / ${totalCount} টি সংবাদ দেখানো হচ্ছে`
                                        : `Showing ${news.length} of ${totalCount} articles`}
                                </p>
                            </div>
                        )}

                        {/* All loaded message */}
                        {!hasMore && news.length > 0 && (
                            <div className={`text-center mt-12 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                <p className="text-sm">
                                    {language === 'bn'
                                        ? `সব ${totalCount} টি সংবাদ দেখানো হয়েছে`
                                        : `All ${totalCount} articles loaded`}
                                </p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
