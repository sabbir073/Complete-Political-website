"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Lightbox from "yet-another-react-lightbox";
import Captions from "yet-another-react-lightbox/plugins/captions";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/captions.css";
import { useLanguage } from '@/providers/LanguageProvider';
import { useTheme } from '@/providers/ThemeProvider';

interface Photo {
    id: string;
    image_url: string;
    title_en?: string;
    title_bn?: string;
    caption_en?: string;
    caption_bn?: string;
    alt_text_en?: string;
    alt_text_bn?: string;
}

interface Album {
    id: string;
    name_en: string;
    name_bn?: string;
    slug: string;
    cover_image?: string;
    description_en?: string;
    description_bn?: string;
    photos?: Photo[];
    category?: {
        id: string;
        name_en: string;
        name_bn?: string;
    };
    created_at?: string;
}

export default function AlbumDetailPage() {
    const params = useParams();
    const slug = params.slug as string;
    const [album, setAlbum] = useState<Album | null>(null);
    const [loading, setLoading] = useState(true);
    const [notFoundState, setNotFoundState] = useState(false);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);
    const { language } = useLanguage();
    const { isDark } = useTheme();

    const getText = (en?: string, bn?: string) => {
        if (language === 'bn' && bn) return bn;
        return en || '';
    };

    useEffect(() => {
        const fetchAlbum = async () => {
            try {
                const res = await fetch(`/api/photo-gallery?album=${slug}`);
                if (!res.ok) {
                    setNotFoundState(true);
                    return;
                }
                const data = await res.json();
                if (data.error) {
                    setNotFoundState(true);
                    return;
                }
                setAlbum(data);
            } catch (error) {
                console.error('Error fetching album:', error);
                setNotFoundState(true);
            } finally {
                setLoading(false);
            }
        };

        if (slug) {
            fetchAlbum();
        }
    }, [slug]);

    const openLightbox = (index: number) => {
        setLightboxIndex(index);
        setLightboxOpen(true);
    };

    // Prepare slides for lightbox
    const lightboxSlides = album?.photos?.map(photo => ({
        src: photo.image_url,
        alt: getText(photo.alt_text_en, photo.alt_text_bn) || getText(photo.title_en, photo.title_bn) || 'Photo',
        title: getText(photo.title_en, photo.title_bn) || '',
        description: getText(photo.caption_en, photo.caption_bn) || '',
    })) || [];

    if (loading) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            </div>
        );
    }

    if (notFoundState || !album) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
                <div className="text-center px-4">
                    <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                        <svg className={`w-10 h-10 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <h1 className={`text-3xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {language === 'bn' ? 'অ্যালবাম পাওয়া যায়নি' : 'Album Not Found'}
                    </h1>
                    <p className={`mb-8 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        {language === 'bn' ? 'দুঃখিত, এই অ্যালবামটি খুঁজে পাওয়া যায়নি।' : 'Sorry, this album could not be found.'}
                    </p>
                    <Link href="/gallery/photos">
                        <button className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium">
                            {language === 'bn' ? 'সব অ্যালবাম দেখুন' : 'View All Albums'}
                        </button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
            {/* Hero Section with Cover Image */}
            <div className="relative">
                {album.cover_image ? (
                    <div className="relative h-[400px] md:h-[500px]">
                        <Image
                            src={album.cover_image}
                            alt={getText(album.name_en, album.name_bn)}
                            fill
                            className="object-cover"
                            priority
                            unoptimized={album.cover_image?.includes('cloudfront') || album.cover_image?.includes('s3.')}
                        />
                        <div className={`absolute inset-0 ${isDark ? 'bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent' : 'bg-gradient-to-t from-black/80 via-black/40 to-transparent'}`}></div>

                        {/* Title Overlay */}
                        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
                            <div className="max-w-5xl mx-auto">
                                {/* Category Badge */}
                                {album.category && (
                                    <span className="inline-block px-4 py-1.5 rounded-full text-sm font-semibold bg-white/20 backdrop-blur-sm text-white mb-4">
                                        {getText(album.category.name_en, album.category.name_bn)}
                                    </span>
                                )}
                                <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">
                                    {getText(album.name_en, album.name_bn)}
                                </h1>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className={`h-[200px] ${isDark ? 'bg-gray-800' : 'bg-gradient-to-r from-red-600 to-red-700'}`}>
                        <div className="max-w-5xl mx-auto px-6 py-12 flex items-end h-full">
                            <div>
                                {album.category && (
                                    <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-semibold ${isDark ? 'bg-red-900/50 text-red-400' : 'bg-white/20 text-white'} mb-4`}>
                                        {getText(album.category.name_en, album.category.name_bn)}
                                    </span>
                                )}
                                <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight">
                                    {getText(album.name_en, album.name_bn)}
                                </h1>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Content Section */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content - Photo Grid */}
                    <div className="lg:col-span-2">
                        {album.photos && album.photos.length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {album.photos.map((photo, index) => (
                                    <div
                                        key={photo.id}
                                        className={`relative aspect-square group cursor-pointer overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 ${
                                            isDark ? 'shadow-gray-900/50' : 'shadow-gray-500/30'
                                        }`}
                                        onClick={() => openLightbox(index)}
                                    >
                                        <Image
                                            src={photo.image_url}
                                            alt={getText(photo.alt_text_en, photo.alt_text_bn) || getText(photo.title_en, photo.title_bn) || 'Photo'}
                                            fill
                                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                                            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                            unoptimized={photo.image_url?.includes('cloudfront') || photo.image_url?.includes('s3.')}
                                        />
                                        <div className={`absolute inset-0 transition-all duration-300 ${
                                            isDark
                                                ? "bg-black/20 group-hover:bg-black/40"
                                                : "bg-black/10 group-hover:bg-black/30"
                                        }`}></div>

                                        {/* Hover Zoom Icon */}
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <div className={`rounded-full p-3 ${isDark ? "bg-gray-800/90" : "bg-white/90"}`}>
                                                <svg className={`w-6 h-6 ${isDark ? "text-white" : "text-gray-700"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                                </svg>
                                            </div>
                                        </div>

                                        {/* Photo Title on Hover */}
                                        {(photo.title_en || photo.title_bn) && (
                                            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                <p className="text-white text-sm font-medium truncate">
                                                    {getText(photo.title_en, photo.title_bn)}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className={`text-center py-16 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <p>{language === 'bn' ? 'এই অ্যালবামে কোনো ছবি নেই।' : 'No photos in this album.'}</p>
                            </div>
                        )}
                    </div>

                    {/* Sidebar - Album Details */}
                    <div className="lg:col-span-1">
                        <div className={`sticky top-24 rounded-2xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white shadow-lg'}`}>
                            <h3 className={`text-lg font-bold mb-6 pb-4 border-b ${isDark ? 'text-white border-gray-700' : 'text-gray-900 border-gray-200'}`}>
                                {language === 'bn' ? 'অ্যালবাম বিবরণ' : 'Album Details'}
                            </h3>

                            {/* Photo Count */}
                            <div className="mb-6">
                                <div className="flex items-start gap-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${isDark ? 'bg-red-900/30' : 'bg-red-50'}`}>
                                        <svg className={`w-6 h-6 ${isDark ? 'text-red-400' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                            {language === 'bn' ? 'মোট ছবি' : 'Total Photos'}
                                        </p>
                                        <p className={`text-2xl font-bold mt-1 ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                                            {album.photos?.length || 0}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Date */}
                            {album.created_at && (
                                <div className="mb-6">
                                    <div className="flex items-start gap-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${isDark ? 'bg-red-900/30' : 'bg-red-50'}`}>
                                            <svg className={`w-6 h-6 ${isDark ? 'text-red-400' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                                {language === 'bn' ? 'তারিখ' : 'Date'}
                                            </p>
                                            <p className={`text-sm mt-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                                {new Date(album.created_at).toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                    timeZone: 'Asia/Dhaka'
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Category */}
                            {album.category && (
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
                                                {getText(album.category.name_en, album.category.name_bn)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Description */}
                            {(album.description_en || album.description_bn) && (
                                <div className="mb-6">
                                    <p className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                        {language === 'bn' ? 'বিবরণ' : 'Description'}
                                    </p>
                                    <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-200' : 'text-gray-600'}`}>
                                        {getText(album.description_en, album.description_bn)}
                                    </p>
                                </div>
                            )}

                            {/* Back to Gallery */}
                            <Link href="/gallery/photos" className="block mt-6">
                                <button className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${isDark ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-red-600 hover:bg-red-700 text-white'}`}>
                                    {language === 'bn' ? '← সব অ্যালবাম দেখুন' : '← View All Albums'}
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Lightbox Component with Captions */}
            <Lightbox
                open={lightboxOpen}
                close={() => setLightboxOpen(false)}
                index={lightboxIndex}
                slides={lightboxSlides}
                plugins={[Captions]}
                controller={{
                    closeOnBackdropClick: true,
                    closeOnPullUp: true,
                    closeOnPullDown: true
                }}
                carousel={{
                    finite: false,
                    preload: 2,
                }}
                styles={{
                    container: {
                        backgroundColor: isDark ? "rgba(0, 0, 0, 0.95)" : "rgba(0, 0, 0, 0.9)"
                    },
                    navigationPrev: {
                        backgroundColor: isDark ? "rgba(55, 65, 81, 0.9)" : "rgba(255, 255, 255, 0.9)",
                        borderRadius: "50%",
                        width: "48px",
                        height: "48px",
                        left: "20px",
                        color: isDark ? "#f3f4f6" : "#374151",
                    },
                    navigationNext: {
                        backgroundColor: isDark ? "rgba(55, 65, 81, 0.9)" : "rgba(255, 255, 255, 0.9)",
                        borderRadius: "50%",
                        width: "48px",
                        height: "48px",
                        right: "20px",
                        color: isDark ? "#f3f4f6" : "#374151",
                    },
                    captionsTitle: {
                        fontSize: "20px",
                        fontWeight: "600",
                        color: isDark ? "#f3f4f6" : "#ffffff",
                        textAlign: "center",
                        marginBottom: "8px"
                    },
                    captionsDescription: {
                        fontSize: "16px",
                        color: isDark ? "#d1d5db" : "#e5e7eb",
                        textAlign: "center"
                    },
                }}
                captions={{
                    descriptionTextAlign: "center",
                    descriptionMaxLines: 2,
                }}
            />
        </div>
    );
}
