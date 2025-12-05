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
        slug?: string;
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
            timeZone: 'Asia/Dhaka'
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

    // Loading State - WordPress Style Skeleton
    if (loading) {
        return (
            <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="max-w-4xl mx-auto">
                        {/* Skeleton Breadcrumb */}
                        <div className={`h-4 w-48 rounded mb-8 ${isDark ? 'bg-gray-800' : 'bg-gray-200'} animate-pulse`} />

                        {/* Skeleton Title */}
                        <div className={`h-10 sm:h-12 w-full rounded-lg mb-4 ${isDark ? 'bg-gray-800' : 'bg-gray-200'} animate-pulse`} />
                        <div className={`h-10 sm:h-12 w-3/4 rounded-lg mb-6 ${isDark ? 'bg-gray-800' : 'bg-gray-200'} animate-pulse`} />

                        {/* Skeleton Meta */}
                        <div className="flex flex-wrap gap-4 mb-8">
                            <div className={`h-6 w-32 rounded ${isDark ? 'bg-gray-800' : 'bg-gray-200'} animate-pulse`} />
                            <div className={`h-6 w-40 rounded ${isDark ? 'bg-gray-800' : 'bg-gray-200'} animate-pulse`} />
                            <div className={`h-6 w-24 rounded ${isDark ? 'bg-gray-800' : 'bg-gray-200'} animate-pulse`} />
                        </div>

                        {/* Skeleton Featured Image */}
                        <div className={`w-full aspect-video rounded-xl mb-8 ${isDark ? 'bg-gray-800' : 'bg-gray-200'} animate-pulse`} />

                        {/* Skeleton Content */}
                        <div className="space-y-4">
                            {[100, 95, 88, 100, 75, 92, 85, 100, 78, 90].map((width, i) => (
                                <div key={i} className={`h-4 rounded ${isDark ? 'bg-gray-800' : 'bg-gray-200'} animate-pulse`} style={{ width: `${width}%` }} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Not Found State
    if (notFoundState || !news) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
                <div className="text-center px-4 max-w-md">
                    <div className={`w-24 h-24 mx-auto mb-8 rounded-full flex items-center justify-center ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                        <svg className={`w-12 h-12 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                        </svg>
                    </div>
                    <h1 className={`text-3xl md:text-4xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {language === 'bn' ? 'সংবাদ পাওয়া যায়নি' : 'News Not Found'}
                    </h1>
                    <p className={`text-lg mb-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {language === 'bn' ? 'দুঃখিত, এই সংবাদটি খুঁজে পাওয়া যায়নি বা মুছে ফেলা হয়েছে।' : 'Sorry, this news article could not be found or has been removed.'}
                    </p>
                    <Link href="/news">
                        <button className="inline-flex items-center gap-2 px-8 py-4 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            {language === 'bn' ? 'সব সংবাদ দেখুন' : 'View All News'}
                        </button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
            {/* Main Container - WordPress Style */}
            <article className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
                <div className="max-w-4xl mx-auto">

                    {/* Breadcrumb */}
                    <nav className="flex items-center gap-2 text-sm mb-6 sm:mb-8 overflow-x-auto whitespace-nowrap pb-2">
                        <Link href="/" className={`hover:text-red-600 transition-colors flex-shrink-0 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            {language === 'bn' ? 'হোম' : 'Home'}
                        </Link>
                        <svg className={`w-4 h-4 flex-shrink-0 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        <Link href="/news" className={`hover:text-red-600 transition-colors flex-shrink-0 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            {language === 'bn' ? 'সংবাদ' : 'News'}
                        </Link>
                        {news.category && (
                            <>
                                <svg className={`w-4 h-4 flex-shrink-0 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                                <Link
                                    href={`/news/category/${news.category.slug || news.category.id}`}
                                    className={`hover:text-red-600 transition-colors flex-shrink-0 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
                                >
                                    {getText(news.category.name_en, news.category.name_bn)}
                                </Link>
                            </>
                        )}
                    </nav>

                    {/* Category & Featured Badges */}
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                        {news.category && (
                            <Link
                                href={`/news/category/${news.category.slug || news.category.id}`}
                                className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold bg-red-600 text-white hover:bg-red-700 transition-colors"
                            >
                                {getText(news.category.name_en, news.category.name_bn)}
                            </Link>
                        )}
                        {news.is_featured && (
                            <span className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold bg-gradient-to-r from-yellow-500 to-amber-500 text-white">
                                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                </svg>
                                {language === 'bn' ? 'বিশেষ' : 'Featured'}
                            </span>
                        )}
                    </div>

                    {/* Title - Large & Bold like WordPress */}
                    <h1 className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-6 sm:mb-8 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {getText(news.title_en, news.title_bn)}
                    </h1>

                    {/* Meta Info Bar - WordPress Style */}
                    <div className={`flex flex-wrap items-center gap-x-4 sm:gap-x-6 gap-y-3 mb-6 sm:mb-8 pb-6 sm:pb-8 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                        {/* Author */}
                        {news.author_name && (
                            <div className="flex items-center gap-2 sm:gap-3">
                                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-sm sm:text-base ${isDark ? 'bg-red-900/50 text-red-400' : 'bg-red-100 text-red-600'}`}>
                                    {news.author_name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <span className={`text-sm sm:text-base font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                        {news.author_name}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Separator */}
                        {news.author_name && (
                            <span className={`hidden sm:inline ${isDark ? 'text-gray-600' : 'text-gray-300'}`}>|</span>
                        )}

                        {/* Date */}
                        <div className="flex items-center gap-2">
                            <svg className={`w-4 h-4 sm:w-5 sm:h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className={`text-sm sm:text-base ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                {formatDate(news.published_at)}
                            </span>
                        </div>

                        {/* Separator */}
                        <span className={`hidden sm:inline ${isDark ? 'text-gray-600' : 'text-gray-300'}`}>|</span>

                        {/* Read Time */}
                        <div className="flex items-center gap-2">
                            <svg className={`w-4 h-4 sm:w-5 sm:h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className={`text-sm sm:text-base ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                {getReadTimeText(news.content_en, news.content_bn, language as 'en' | 'bn')}
                            </span>
                        </div>
                    </div>

                    {/* Featured Image - Full Width with Caption Style */}
                    {news.featured_image && (
                        <figure className="mb-8 sm:mb-10">
                            <div className="relative w-full aspect-video sm:aspect-[16/9] rounded-xl sm:rounded-2xl overflow-hidden shadow-lg">
                                <Image
                                    src={news.featured_image}
                                    alt={getText(news.featured_image_alt_en, news.featured_image_alt_bn) || getText(news.title_en, news.title_bn)}
                                    fill
                                    className="object-cover"
                                    priority
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 896px"
                                    unoptimized={news.featured_image?.includes('cloudfront')}
                                />
                            </div>
                            {(news.featured_image_alt_en || news.featured_image_alt_bn) && (
                                <figcaption className={`mt-3 text-sm text-center italic ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                    {getText(news.featured_image_alt_en, news.featured_image_alt_bn)}
                                </figcaption>
                            )}
                        </figure>
                    )}

                    {/* Excerpt - Lead Paragraph */}
                    {(news.excerpt_en || news.excerpt_bn) && (
                        <p className={`text-lg sm:text-xl md:text-2xl font-medium leading-relaxed mb-8 sm:mb-10 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            {getText(news.excerpt_en, news.excerpt_bn)}
                        </p>
                    )}

                    {/* Article Content - WordPress Style Prose */}
                    <div className={`
                        prose prose-base sm:prose-lg lg:prose-xl max-w-none
                        prose-headings:font-bold prose-headings:leading-tight prose-headings:mt-8 prose-headings:mb-4
                        prose-h2:text-2xl sm:prose-h2:text-3xl prose-h2:border-b prose-h2:pb-2 ${isDark ? 'prose-h2:border-gray-700' : 'prose-h2:border-gray-200'}
                        prose-h3:text-xl sm:prose-h3:text-2xl
                        prose-p:leading-relaxed prose-p:mb-6
                        prose-a:text-red-600 prose-a:no-underline hover:prose-a:underline prose-a:font-medium
                        prose-img:rounded-xl prose-img:shadow-lg prose-img:my-8
                        prose-blockquote:border-l-4 prose-blockquote:border-red-500 prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:my-8
                        prose-blockquote:bg-gray-50 dark:prose-blockquote:bg-gray-800/50 prose-blockquote:py-4 prose-blockquote:pr-4 prose-blockquote:rounded-r-lg
                        prose-ul:list-disc prose-ol:list-decimal prose-li:mb-2
                        prose-hr:my-8 ${isDark ? 'prose-hr:border-gray-700' : 'prose-hr:border-gray-200'}
                        prose-figure:my-8
                        prose-figcaption:text-center prose-figcaption:italic prose-figcaption:mt-2
                        prose-video:w-full prose-video:rounded-xl prose-video:my-8
                        ${isDark
                            ? 'prose-invert prose-headings:text-white prose-p:text-gray-300 prose-strong:text-white prose-blockquote:text-gray-400 prose-li:text-gray-300 prose-figcaption:text-gray-400'
                            : 'prose-headings:text-gray-900 prose-p:text-gray-700 prose-strong:text-gray-900 prose-blockquote:text-gray-600 prose-li:text-gray-700 prose-figcaption:text-gray-500'
                        }
                    `}>
                        {(news.content_en || news.content_bn) ? (
                            <div
                                dangerouslySetInnerHTML={{ __html: getText(news.content_en, news.content_bn) || '' }}
                                className={`
                                    [&_iframe]:w-full [&_iframe]:aspect-video [&_iframe]:rounded-xl [&_iframe]:my-8 [&_iframe]:shadow-lg
                                    [&_video]:w-full [&_video]:aspect-video [&_video]:rounded-xl [&_video]:my-8 [&_video]:shadow-lg
                                    [&_.video-container]:relative [&_.video-container]:w-full [&_.video-container]:pb-[56.25%] [&_.video-container]:my-8
                                    [&_.video-container_iframe]:absolute [&_.video-container_iframe]:top-0 [&_.video-container_iframe]:left-0 [&_.video-container_iframe]:w-full [&_.video-container_iframe]:h-full
                                    [&_embed]:w-full [&_embed]:aspect-video [&_embed]:rounded-xl [&_embed]:my-8
                                    [&_object]:w-full [&_object]:aspect-video [&_object]:rounded-xl [&_object]:my-8
                                    ${isDark
                                        ? '[&_*]:!text-gray-300 [&_h1]:!text-white [&_h2]:!text-white [&_h3]:!text-white [&_h4]:!text-white [&_h5]:!text-white [&_h6]:!text-white [&_strong]:!text-white [&_b]:!text-white [&_a]:!text-red-400 hover:[&_a]:!text-red-300'
                                        : ''
                                    }
                                `}
                            />
                        ) : (
                            <div className={`text-center py-12 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <p className="text-lg">{language === 'bn' ? 'এই সংবাদের জন্য কোনো বিস্তারিত বিবরণ নেই।' : 'No detailed content available for this news article.'}</p>
                            </div>
                        )}
                    </div>

                    {/* Tags / Category Section */}
                    {news.category && (
                        <div className={`mt-10 pt-8 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                            <div className="flex flex-wrap items-center gap-2">
                                <span className={`font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                    {language === 'bn' ? 'বিভাগ:' : 'Category:'}
                                </span>
                                <Link
                                    href={`/news/category/${news.category.slug || news.category.id}`}
                                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900'}`}
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                    </svg>
                                    {getText(news.category.name_en, news.category.name_bn)}
                                </Link>
                            </div>
                        </div>
                    )}

                    {/* Share Section - WordPress Style */}
                    <div className={`mt-8 pt-8 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {language === 'bn' ? 'এই সংবাদ শেয়ার করুন:' : 'Share this article:'}
                            </p>
                            <div className="flex items-center gap-2 sm:gap-3">
                                {/* Facebook */}
                                <a
                                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-all duration-300 ${isDark ? 'bg-gray-800 hover:bg-blue-600 text-gray-400 hover:text-white' : 'bg-gray-100 hover:bg-blue-600 text-gray-600 hover:text-white'}`}
                                    title="Share on Facebook"
                                >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M18.77 7.46H14.5v-1.9c0-.9.6-1.1 1-1.1h3V.5h-4.33C10.24.5 9.5 3.44 9.5 5.32v2.15h-3v4h3v12h5v-12h3.85l.42-4z" />
                                    </svg>
                                </a>
                                {/* Twitter/X */}
                                <a
                                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(getText(news.title_en, news.title_bn))}&url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-all duration-300 ${isDark ? 'bg-gray-800 hover:bg-black text-gray-400 hover:text-white' : 'bg-gray-100 hover:bg-black text-gray-600 hover:text-white'}`}
                                    title="Share on X"
                                >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                    </svg>
                                </a>
                                {/* LinkedIn */}
                                <a
                                    href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}&title=${encodeURIComponent(getText(news.title_en, news.title_bn))}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-all duration-300 ${isDark ? 'bg-gray-800 hover:bg-blue-700 text-gray-400 hover:text-white' : 'bg-gray-100 hover:bg-blue-700 text-gray-600 hover:text-white'}`}
                                    title="Share on LinkedIn"
                                >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                    </svg>
                                </a>
                                {/* WhatsApp */}
                                <a
                                    href={`https://wa.me/?text=${encodeURIComponent(getText(news.title_en, news.title_bn) + ' ' + (typeof window !== 'undefined' ? window.location.href : ''))}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-all duration-300 ${isDark ? 'bg-gray-800 hover:bg-green-600 text-gray-400 hover:text-white' : 'bg-gray-100 hover:bg-green-600 text-gray-600 hover:text-white'}`}
                                    title="Share on WhatsApp"
                                >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                    </svg>
                                </a>
                                {/* Copy Link */}
                                <button
                                    onClick={() => {
                                        if (typeof window !== 'undefined') {
                                            navigator.clipboard.writeText(window.location.href);
                                            alert(language === 'bn' ? 'লিঙ্ক কপি হয়েছে!' : 'Link copied!');
                                        }
                                    }}
                                    className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-all duration-300 ${isDark ? 'bg-gray-800 hover:bg-red-600 text-gray-400 hover:text-white' : 'bg-gray-100 hover:bg-red-600 text-gray-600 hover:text-white'}`}
                                    title={language === 'bn' ? 'লিঙ্ক কপি করুন' : 'Copy Link'}
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Back to News - Full Width Button */}
                    <div className="mt-10 sm:mt-12">
                        <Link href="/news" className="block">
                            <button className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${isDark ? 'bg-gray-800 hover:bg-gray-700 text-white border border-gray-700' : 'bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 shadow-sm hover:shadow'}`}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                {language === 'bn' ? 'সব সংবাদ দেখুন' : 'View All News'}
                            </button>
                        </Link>
                    </div>
                </div>
            </article>

            {/* Bottom Spacing */}
            <div className="h-8 sm:h-12 lg:h-16" />
        </div>
    );
}
