'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTheme } from '@/providers/ThemeProvider';

export default function ContentOverviewPage() {
    const { isDark } = useTheme();
    const [stats, setStats] = useState({
        events: 0,
        news: 0,
        videos: 0,
        albums: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            // Fetch counts from each endpoint
            const [eventsRes, newsRes, videosRes, albumsRes] = await Promise.all([
                fetch('/api/admin/events?limit=1'),
                fetch('/api/admin/news?limit=1'),
                fetch('/api/admin/video-gallery?limit=1'),
                fetch('/api/admin/photo-gallery/albums?limit=1'),
            ]);

            const [events, news, videos, albums] = await Promise.all([
                eventsRes.json(),
                newsRes.json(),
                videosRes.json(),
                albumsRes.json(),
            ]);

            setStats({
                events: events.pagination?.total || 0,
                news: news.pagination?.total || 0,
                videos: videos.pagination?.total || 0,
                albums: albums.pagination?.total || 0,
            });
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const contentTypes = [
        {
            title: 'Events',
            description: 'Manage campaign events, rallies, and public gatherings',
            icon: (
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            ),
            count: stats.events,
            href: '/admin/content/events',
            createHref: '/admin/content/events/create',
            color: 'blue',
            features: ['Past & Upcoming', 'Location Tracking', 'SEO Optimized', 'Multilingual'],
        },
        {
            title: 'News',
            description: 'Publish news articles, press releases, and updates',
            icon: (
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
            ),
            count: stats.news,
            href: '/admin/content/news',
            createHref: '/admin/content/news/create',
            color: 'green',
            features: ['Featured Articles', 'Auto Read Time', 'Categories', 'Rich Content'],
        },
        {
            title: 'Photo Gallery',
            description: 'Create photo albums and manage campaign images',
            icon: (
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            ),
            count: stats.albums,
            href: '/admin/content/photo-gallery/albums',
            createHref: '/admin/content/photo-gallery/albums/create',
            color: 'purple',
            features: ['Album System', 'Bulk Upload', 'Auto Counting', 'Organized View'],
        },
        {
            title: 'Video Gallery',
            description: 'Embed YouTube videos and manage video content',
            icon: (
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
            ),
            count: stats.videos,
            href: '/admin/content/video-gallery',
            createHref: '/admin/content/video-gallery/create',
            color: 'red',
            features: ['YouTube Integration', 'Auto Thumbnails', 'Featured Videos', 'Easy Embed'],
        },
    ];

    const getColorClasses = (color: string) => {
        const colors = {
            blue: 'border-blue-500 bg-blue-50 dark:bg-blue-900/20',
            green: 'border-green-500 bg-green-50 dark:bg-green-900/20',
            purple: 'border-purple-500 bg-purple-50 dark:bg-purple-900/20',
            red: 'border-red-500 bg-red-50 dark:bg-red-900/20',
        };
        return colors[color as keyof typeof colors] || colors.blue;
    };

    const getIconColorClasses = (color: string) => {
        const colors = {
            blue: 'text-blue-600 dark:text-blue-400',
            green: 'text-green-600 dark:text-green-400',
            purple: 'text-purple-600 dark:text-purple-400',
            red: 'text-red-600 dark:text-red-400',
        };
        return colors[color as keyof typeof colors] || colors.blue;
    };

    return (
        <div className="p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Content Management</h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Manage all your website content from one central location
                </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className={`rounded-lg p-4 border-l-4 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Total Events</p>
                            <p className="text-2xl font-bold">{loading ? '...' : stats.events}</p>
                        </div>
                        <div className="text-blue-600 dark:text-blue-400">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className={`rounded-lg p-4 border-l-4 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">News Articles</p>
                            <p className="text-2xl font-bold">{loading ? '...' : stats.news}</p>
                        </div>
                        <div className="text-green-600 dark:text-green-400">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className={`rounded-lg p-4 border-l-4 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Photo Albums</p>
                            <p className="text-2xl font-bold">{loading ? '...' : stats.albums}</p>
                        </div>
                        <div className="text-purple-600 dark:text-purple-400">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className={`rounded-lg p-4 border-l-4 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Videos</p>
                            <p className="text-2xl font-bold">{loading ? '...' : stats.videos}</p>
                        </div>
                        <div className="text-red-600 dark:text-red-400">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Type Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {contentTypes.map((type, index) => (
                    <div
                        key={index}
                        className={`rounded-xl border-l-4 ${getColorClasses(type.color)} ${isDark ? 'bg-gray-800' : 'bg-white'
                            } shadow-lg hover:shadow-xl transition-shadow p-6`}
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className={getIconColorClasses(type.color)}>
                                {type.icon}
                            </div>
                            <div className={`text-3xl font-bold ${getIconColorClasses(type.color)}`}>
                                {loading ? '...' : type.count}
                            </div>
                        </div>

                        <h3 className="text-xl font-bold mb-2">{type.title}</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
                            {type.description}
                        </p>

                        <div className="mb-4">
                            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">Features:</p>
                            <div className="flex flex-wrap gap-2">
                                {type.features.map((feature, idx) => (
                                    <span
                                        key={idx}
                                        className={`text-xs px-2 py-1 rounded-full ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                                            }`}
                                    >
                                        {feature}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Link
                                href={type.href}
                                className={`flex-1 text-center py-2 px-4 rounded-lg font-medium transition ${isDark
                                        ? 'bg-gray-700 hover:bg-gray-600 text-white'
                                        : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                                    }`}
                            >
                                View All
                            </Link>
                            <Link
                                href={type.createHref}
                                className={`flex-1 text-center py-2 px-4 rounded-lg font-medium transition text-white ${type.color === 'blue' ? 'bg-blue-600 hover:bg-blue-700' :
                                        type.color === 'green' ? 'bg-green-600 hover:bg-green-700' :
                                            type.color === 'purple' ? 'bg-purple-600 hover:bg-purple-700' :
                                                'bg-red-600 hover:bg-red-700'
                                    }`}
                            >
                                Create New
                            </Link>
                        </div>
                    </div>
                ))}
            </div>

            {/* Help Section */}
            <div className={`mt-8 rounded-lg p-6 ${isDark ? 'bg-gray-800' : 'bg-blue-50'}`}>
                <h3 className="text-lg font-bold mb-2">💡 Quick Tips</h3>
                <ul className="list-disc list-inside space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <li><strong>Events:</strong> Create events with dates to automatically organize as Past or Upcoming</li>
                    <li><strong>News:</strong> Articles calculate reading time automatically based on content length</li>
                    <li><strong>Photos:</strong> Create albums first, then add multiple photos to each album</li>
                    <li><strong>Videos:</strong> Just paste YouTube URLs - thumbnails and IDs are extracted automatically</li>
                    <li><strong>SEO:</strong> All content types include meta fields for better search engine optimization</li>
                    <li><strong>Languages:</strong> Every content supports both English and Bengali for bilingual website</li>
                </ul>
            </div>
        </div>
    );
}
