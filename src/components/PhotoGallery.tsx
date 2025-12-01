"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Lightbox from "yet-another-react-lightbox";
import Captions from "yet-another-react-lightbox/plugins/captions";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/captions.css";
import { useLanguage } from "@/providers/LanguageProvider";
import { useTheme } from "@/providers/ThemeProvider";

interface Photo {
  id: string;
  image_url: string;
  alt_text_en?: string;
  alt_text_bn?: string;
  title_en?: string;
  title_bn?: string;
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
}

const PhotoGallery: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [currentAlbumPhotos, setCurrentAlbumPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const { t, language } = useLanguage();
  const { isDark } = useTheme();

  // Helper function to get localized text
  const getText = (en?: string, bn?: string) => {
    if (language === 'bn' && bn) return bn;
    return en || '';
  };

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const res = await fetch('/api/photo-gallery?limit=9');
        const data = await res.json();
        if (data.data) {
          // Only keep albums that have cover images
          const albumsWithCovers = data.data.filter((album: Album) => album.cover_image);
          setAlbums(albumsWithCovers.slice(0, 9));
        }
      } catch (error) {
        console.error('Error fetching gallery:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGallery();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const section = document.getElementById('photo-gallery-section');
    if (section) {
      observer.observe(section);
    }

    return () => {
      if (section) {
        observer.unobserve(section);
      }
    };
  }, []);

  // Open lightbox with album's cover + all photos
  const openAlbumLightbox = (album: Album) => {
    const albumPhotos: Photo[] = [];

    // Add cover image first
    if (album.cover_image) {
      albumPhotos.push({
        id: `cover-${album.id}`,
        image_url: album.cover_image,
        alt_text_en: album.name_en,
        alt_text_bn: album.name_bn,
        title_en: album.name_en,
        title_bn: album.name_bn,
      });
    }

    // Add all album photos (skip if same as cover)
    if (album.photos && album.photos.length > 0) {
      album.photos.forEach(photo => {
        if (photo.image_url !== album.cover_image) {
          albumPhotos.push(photo);
        }
      });
    }

    setCurrentAlbumPhotos(albumPhotos);
    setLightboxIndex(0); // Start from cover
    setLightboxOpen(true);
  };

  // Generate lightbox slides from current album's photos
  const lightboxSlides = currentAlbumPhotos.map(photo => ({
    src: photo.image_url,
    alt: getText(photo.alt_text_en, photo.alt_text_bn) || 'Gallery Image',
    title: getText(photo.title_en, photo.title_bn) || '',
    description: getText(photo.alt_text_en, photo.alt_text_bn) || '',
    width: 1200,
    height: 800,
  }));

  return (
    <section
      id="photo-gallery-section"
      className={`w-full px-6 md:px-16 py-16 overflow-hidden transition-colors duration-300 ${
        isDark ? "bg-gray-800" : "bg-gray-50"
      }`}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className={`text-center md:text-left mb-12 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <p className={`text-sm font-semibold mb-2 ${
            isDark ? "text-red-400" : "text-red-600"
          }`}>
            {t.photoGallery?.sectionLabel || "Visual Chapters"}
          </p>
          <div className={`w-10 h-[2px] mb-4 mx-auto md:mx-0 rounded-full ${
            isDark ? "bg-red-400" : "bg-red-600"
          }`} />
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <h2 className={`text-3xl md:text-4xl font-bold mb-6 md:mb-0 ${
              isDark ? "text-white" : "text-gray-900"
            }`}>
              {t.photoGallery?.title || "Photo Gallery"}
            </h2>
            <Link href="/gallery/photos" className="hidden md:inline-block">
              <button className={`relative px-5 py-2 rounded cursor-pointer group transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl ${
                isDark
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : "bg-primaryRed hover:bg-red-600 text-white"
              }`}>
                <span className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded ${
                  isDark
                    ? "bg-gradient-to-r from-red-700 to-red-800"
                    : "bg-gradient-to-r from-primaryRed to-red-600"
                }`}></span>
                <span className="relative z-10 font-semibold">
                  {t.photoGallery?.viewAll || "View All"}
                </span>
              </button>
            </Link>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          </div>
        )}

        {/* Empty State */}
        {!loading && albums.length === 0 && (
          <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {language === 'bn' ? 'কোনো অ্যালবাম পাওয়া যায়নি।' : 'No albums found.'}
          </div>
        )}

        {/* Perfect Homepage Gallery - 9 Album Covers in Strategic Layout */}
        {!loading && albums.length > 0 && (
        <div className="hidden md:grid grid-cols-4 gap-4 h-96">
          {/* Large Feature Image - Top Left (2x2) - Album 1 Cover */}
          {albums[0] && (
            <div
              className={`col-span-2 row-span-2 relative group cursor-pointer overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-500 ${
                isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
              } ${isDark ? "shadow-gray-900/50" : "shadow-gray-500/30"}`}
              style={{ transitionDelay: '300ms' }}
              onClick={() => openAlbumLightbox(albums[0])}
            >
              <Image
                src={albums[0].cover_image!}
                alt={getText(albums[0].name_en, albums[0].name_bn) || 'Album'}
                width={400}
                height={400}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                unoptimized={albums[0].cover_image?.includes('cloudfront') || albums[0].cover_image?.includes('s3.')}
              />
              <div className={`absolute inset-0 transition-all duration-300 ${
                isDark
                  ? "bg-black/20 group-hover:bg-black/30"
                  : "bg-black/10 group-hover:bg-black/20"
              }`}></div>
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className={`rounded-full p-3 ${isDark ? "bg-gray-800/90" : "bg-white/90"}`}>
                  <svg className={`w-8 h-8 ${isDark ? "text-white" : "text-gray-700"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                  </svg>
                </div>
              </div>
            </div>
          )}

          {/* Small Images - Albums 2-5 Covers */}
          {albums.slice(1, 5).map((album, index) => (
            <div
              key={album.id}
              className={`col-span-1 row-span-1 relative group cursor-pointer overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-500 ${
                isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
              } ${isDark ? "shadow-gray-900/50" : "shadow-gray-500/30"}`}
              style={{ transitionDelay: `${(index + 2) * 150 + 300}ms` }}
              onClick={() => openAlbumLightbox(album)}
            >
              <Image
                src={album.cover_image!}
                alt={getText(album.name_en, album.name_bn) || 'Album'}
                width={200}
                height={200}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                unoptimized={album.cover_image?.includes('cloudfront') || album.cover_image?.includes('s3.')}
              />
              <div className={`absolute inset-0 transition-all duration-300 ${
                isDark
                  ? "bg-black/20 group-hover:bg-black/30"
                  : "bg-black/10 group-hover:bg-black/20"
              }`}></div>
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className={`rounded-full p-2 ${isDark ? "bg-gray-800/90" : "bg-white/90"}`}>
                  <svg className={`w-5 h-5 ${isDark ? "text-white" : "text-gray-700"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
        )}

        {/* Bottom Row - 4 Album Covers (Albums 6-9) */}
        {!loading && albums.length > 0 && (
        <div className="hidden md:grid grid-cols-4 gap-4 mt-4">
          {albums.slice(5, 9).map((album, index) => (
            <div
              key={album.id}
              className={`relative group cursor-pointer overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-500 aspect-[4/3] ${
                isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
              } ${isDark ? "shadow-gray-900/50" : "shadow-gray-500/30"}`}
              style={{ transitionDelay: `${(index + 6) * 150 + 300}ms` }}
              onClick={() => openAlbumLightbox(album)}
            >
              <Image
                src={album.cover_image!}
                alt={getText(album.name_en, album.name_bn) || 'Album'}
                width={300}
                height={225}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                unoptimized={album.cover_image?.includes('cloudfront') || album.cover_image?.includes('s3.')}
              />
              <div className={`absolute inset-0 transition-all duration-300 ${
                isDark
                  ? "bg-black/20 group-hover:bg-black/30"
                  : "bg-black/10 group-hover:bg-black/20"
              }`}></div>
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className={`rounded-full p-2 ${isDark ? "bg-gray-800/90" : "bg-white/90"}`}>
                  <svg className={`w-5 h-5 ${isDark ? "text-white" : "text-gray-700"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
        )}

        {/* Photo Grid - Mobile (6 Album Covers) */}
        {!loading && albums.length > 0 && (
        <div className="md:hidden grid grid-cols-2 gap-4">
          {albums.slice(0, 6).map((album, index) => (
            <div
              key={album.id}
              className={`relative group cursor-pointer overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-500 aspect-square ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              } ${isDark ? "shadow-gray-900/50" : "shadow-gray-500/30"}`}
              style={{ transitionDelay: `${index * 100 + 200}ms` }}
              onClick={() => openAlbumLightbox(album)}
            >
              <Image
                src={album.cover_image!}
                alt={getText(album.name_en, album.name_bn) || 'Album'}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                unoptimized={album.cover_image?.includes('cloudfront') || album.cover_image?.includes('s3.')}
              />
              <div className={`absolute inset-0 transition-all duration-300 ${
                isDark
                  ? "bg-black/20 group-hover:bg-black/30"
                  : "bg-black/10 group-hover:bg-black/20"
              }`}></div>
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className={`rounded-full p-2 ${isDark ? "bg-gray-800/90" : "bg-white/90"}`}>
                  <svg className={`w-5 h-5 ${isDark ? "text-white" : "text-gray-700"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
        )}

        {/* Mobile View More Button */}
        {!loading && albums.length > 0 && (
        <div className="md:hidden text-center mt-8">
          <Link href="/gallery/photos">
            <button className={`relative px-6 py-3 rounded cursor-pointer group transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl ${
              isDark
                ? "bg-red-600 hover:bg-red-700 text-white"
                : "bg-primaryRed hover:bg-red-600 text-white"
            }`}>
              <span className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded ${
                isDark
                  ? "bg-gradient-to-r from-red-700 to-red-800"
                  : "bg-gradient-to-r from-primaryRed to-red-600"
              }`}></span>
              <span className="relative z-10 font-semibold">
                {t.photoGallery?.viewAllPhotos || "View All Photos"}
              </span>
            </button>
          </Link>
        </div>
        )}
      </div>

      {/* Lightbox Component - Shows cover + album photos */}
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
    </section>
  );
};

export default PhotoGallery;
