"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/providers/LanguageProvider';
import { useTheme } from '@/providers/ThemeProvider';

interface Album {
    id: string;
    name_en: string;
    name_bn?: string;
    slug: string;
    cover_image?: string;
    description_en?: string;
    description_bn?: string;
    created_at?: string;
    photos?: { id: string }[];
    category?: {
        name_en: string;
        name_bn?: string;
    };
}

export default function PhotoGalleryPage() {
    const [albums, setAlbums] = useState<Album[]>([]);
    const [loading, setLoading] = useState(true);
    const { language } = useLanguage();
    const { isDark } = useTheme();

    const getText = (en?: string, bn?: string) => {
        if (language === 'bn' && bn) return bn;
        return en || '';
    };

    useEffect(() => {
        const fetchAlbums = async () => {
            try {
                const res = await fetch('/api/photo-gallery?limit=50');
                const data = await res.json();
                if (data.data) {
                    setAlbums(data.data);
                }
            } catch (error) {
                console.error('Error fetching albums:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAlbums();
    }, []);

    if (loading) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
            {/* Hero Section */}
            <div className={`relative py-16 md:py-24 ${isDark ? 'bg-gray-800' : 'bg-gradient-to-r from-red-600 to-red-700'}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        {language === 'bn' ? 'ফটো গ্যালারি' : 'Photo Gallery'}
                    </h1>
                    <p className="text-lg text-white/80 max-w-2xl mx-auto">
                        {language === 'bn'
                            ? 'আমাদের স্মৃতি এবং ইভেন্টের মুহূর্তগুলো দেখুন'
                            : 'Browse through our memorable moments and events'}
                    </p>
                </div>
            </div>

            {/* Albums Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {albums.length === 0 ? (
                    <div className={`text-center py-16 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        <svg className="w-20 h-20 mx-auto mb-6 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-xl">
                            {language === 'bn' ? 'কোনো অ্যালবাম পাওয়া যায়নি।' : 'No albums found.'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {albums.map((album) => (
                            <Link
                                key={album.id}
                                href={`/gallery/photos/${album.slug}`}
                                className="group"
                            >
                                <div className={`rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${
                                    isDark ? 'bg-gray-800' : 'bg-white'
                                }`}>
                                    {/* Album Cover */}
                                    <div className="relative h-64 overflow-hidden">
                                        {album.cover_image ? (
                                            <Image
                                                src={album.cover_image}
                                                alt={getText(album.name_en, album.name_bn)}
                                                fill
                                                className="object-cover transition-transform duration-500 group-hover:scale-110"
                                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                                unoptimized={album.cover_image?.includes('cloudfront') || album.cover_image?.includes('s3.')}
                                            />
                                        ) : (
                                            <div className={`w-full h-full flex items-center justify-center ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                                                <svg className={`w-16 h-16 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                        )}

                                        {/* Overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                                        {/* Photo Count Badge */}
                                        <div className="absolute top-4 right-4">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${
                                                isDark ? 'bg-gray-900/80 text-white' : 'bg-white/90 text-gray-800'
                                            } backdrop-blur-sm`}>
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                {album.photos?.length || 0}
                                            </span>
                                        </div>

                                        {/* View Album Overlay */}
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <span className="px-6 py-3 bg-red-600 text-white rounded-lg font-semibold shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                                {language === 'bn' ? 'অ্যালবাম দেখুন' : 'View Album'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Album Info */}
                                    <div className="p-5">
                                        <h2 className={`text-xl font-bold mb-1 line-clamp-1 transition-colors ${
                                            isDark
                                                ? 'text-white group-hover:text-red-400'
                                                : 'text-gray-900 group-hover:text-red-600'
                                        }`}>
                                            {getText(album.name_en, album.name_bn)}
                                        </h2>

                                        {/* Date */}
                                        {album.created_at && (
                                            <p className={`text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                                {new Date(album.created_at).toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                    timeZone: 'Asia/Dhaka'
                                                })}
                                            </p>
                                        )}

                                        {album.category && (
                                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                                                isDark
                                                    ? 'bg-red-900/30 text-red-400'
                                                    : 'bg-red-100 text-red-600'
                                            }`}>
                                                {getText(album.category.name_en, album.category.name_bn)}
                                            </span>
                                        )}

                                        {(album.description_en || album.description_bn) && (
                                            <p className={`mt-3 text-sm line-clamp-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                                {getText(album.description_en, album.description_bn)}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
