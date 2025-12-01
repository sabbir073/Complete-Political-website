"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
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
        slug: string;
    };
}

interface CategoryInfo {
    name_en: string;
    name_bn?: string;
    slug: string;
    description_en?: string;
    description_bn?: string;
}

// Category configurations with colors and icons
const categoryConfig: Record<string, { color: string; darkColor: string; icon: React.ReactNode }> = {
    'press-releases': {
        color: 'from-blue-600 to-blue-700',
        darkColor: 'bg-blue-900/30',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
        )
    },
    'announcements': {
        color: 'from-green-600 to-green-700',
        darkColor: 'bg-green-900/30',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
            </svg>
        )
    },
    'media-coverage': {
        color: 'from-purple-600 to-purple-700',
        darkColor: 'bg-purple-900/30',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
        )
    },
    'interviews': {
        color: 'from-orange-600 to-orange-700',
        darkColor: 'bg-orange-900/30',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
        )
    },
    'latest-news': {
        color: 'from-red-600 to-red-700',
        darkColor: 'bg-red-900/30',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
        )
    }
};

export default function NewsCategoryPage() {
    const params = useParams();
    const categorySlug = params.slug as string;

    const [news, setNews] = useState<NewsItem[]>([]);
    const [categoryInfo, setCategoryInfo] = useState<CategoryInfo | null>(null);
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
            timeZone: 'Asia/Dhaka'
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

            const res = await fetch(`/api/news?category_slug=${categorySlug}&page=${pageNum}&limit=${ITEMS_PER_PAGE}`);
            const data = await res.json();

            if (data.data) {
                if (append) {
                    setNews(prev => [...prev, ...data.data]);
                } else {
                    setNews(data.data);
                    // Get category info from first item
                    if (data.data.length > 0 && data.data[0].category) {
                        setCategoryInfo(data.data[0].category);
                    }
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

    // Fetch category info separately if no news found
    useEffect(() => {
        const fetchCategoryInfo = async () => {
            try {
                const res = await fetch(`/api/categories?slug=${categorySlug}&content_type=news`);
                const data = await res.json();
                if (data.data && data.data.length > 0) {
                    setCategoryInfo(data.data[0]);
                }
            } catch (error) {
                console.error('Error fetching category:', error);
            }
        };

        if (!categoryInfo && !loading) {
            fetchCategoryInfo();
        }
    }, [categorySlug, categoryInfo, loading]);

    useEffect(() => {
        setPage(1);
        fetchNews(1);
    }, [categorySlug]);

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchNews(nextPage, true);
    };

    const config = categoryConfig[categorySlug] || {
        color: 'from-red-600 to-red-700',
        darkColor: 'bg-red-900/30',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
        )
    };

    if (loading) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            </div>
        );
    }

    const categoryName = categoryInfo ? getText(categoryInfo.name_en, categoryInfo.name_bn) : categorySlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

    return (
        <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
            {/* Hero Header */}
            <div className={`relative py-16 md:py-24 ${isDark ? 'bg-gray-800' : `bg-gradient-to-br ${config.color}`}`}>
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
                    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
                </div>
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-white text-sm font-medium mb-4">
                        {config.icon}
                        {language === 'bn' ? 'সংবাদ বিভাগ' : 'News Category'}
                    </div>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
                        {categoryName}
                    </h1>
                    {categoryInfo?.description_en && (
                        <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto">
                            {getText(categoryInfo.description_en, categoryInfo.description_bn)}
                        </p>
                    )}
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

            {/* Breadcrumb */}
            <div className={`${isDark ? 'bg-gray-800/50' : 'bg-white'} border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <nav className="flex items-center gap-2 text-sm">
                        <Link href="/" className={`${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'} transition-colors`}>
                            {language === 'bn' ? 'হোম' : 'Home'}
                        </Link>
                        <span className={isDark ? 'text-gray-600' : 'text-gray-400'}>/</span>
                        <Link href="/news" className={`${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'} transition-colors`}>
                            {language === 'bn' ? 'সংবাদ' : 'News'}
                        </Link>
                        <span className={isDark ? 'text-gray-600' : 'text-gray-400'}>/</span>
                        <span className={isDark ? 'text-red-400' : 'text-red-600'}>
                            {categoryName}
                        </span>
                    </nav>
                </div>
            </div>

            {/* News Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {news.length === 0 ? (
                    <div className={`text-center py-16 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                        </svg>
                        <p className="text-lg mb-4">
                            {language === 'bn' ? 'এই বিভাগে কোনো সংবাদ পাওয়া যায়নি।' : 'No news articles found in this category.'}
                        </p>
                        <Link
                            href="/news"
                            className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                                isDark ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-red-600 hover:bg-red-700 text-white'
                            }`}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            {language === 'bn' ? 'সব সংবাদ দেখুন' : 'View All News'}
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {news.map((item) => (
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
