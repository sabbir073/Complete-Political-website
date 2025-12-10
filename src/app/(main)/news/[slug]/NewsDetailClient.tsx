"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from '@/providers/LanguageProvider';
import { useTheme } from '@/providers/ThemeProvider';
import { getReadTimeText } from '@/lib/cms-utils';
import SocialShare from '@/components/SocialShare';
import { siteConfig } from '@/lib/seo';

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

interface Props {
    slug: string;
    initialNews: NewsDetail | null;
}

export default function NewsDetailClient({ slug, initialNews }: Props) {
    const [news, setNews] = useState<NewsDetail | null>(initialNews);
    const [loading, setLoading] = useState(!initialNews);
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
            if (initialNews) return;

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

        if (slug && !initialNews) {
            fetchNews();
        }
    }, [slug, initialNews]);

    const shareUrl = typeof window !== 'undefined' ? window.location.href : `${siteConfig.url}/news/${slug}`;

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

                    {/* Share Section */}
                    <div className={`mt-8 pt-8 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {language === 'bn' ? 'এই সংবাদ শেয়ার করুন:' : 'Share this article:'}
                            </p>
                            <SocialShare
                                url={shareUrl}
                                title={getText(news.title_en, news.title_bn)}
                                description={getText(news.excerpt_en, news.excerpt_bn) || ''}
                                image={news.featured_image}
                                hashtags={["SMJahangir", "Dhaka18", "News"]}
                                variant="icons"
                                size="md"
                            />
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
