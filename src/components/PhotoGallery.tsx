"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Lightbox from "yet-another-react-lightbox";
import Captions from "yet-another-react-lightbox/plugins/captions";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/captions.css";
import { useLanguage } from "@/providers/LanguageProvider";
import { useTheme } from "@/providers/ThemeProvider";

const PhotoGallery: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const { t } = useLanguage();
  const { isDark } = useTheme();

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

  // Homepage Gallery - Fixed 9 images for perfect layout
  const galleryImages = [
    {
      id: 1,
      src: "/events/event1.jpg",
      alt: t.photoGallery?.images?.[0]?.alt || "Community Meeting",
      caption: t.photoGallery?.images?.[0]?.caption || "Discussion meeting with local community"
    },
    {
      id: 2,
      src: "/events/event2.jpg", 
      alt: t.photoGallery?.images?.[1]?.alt || "Public Address",
      caption: t.photoGallery?.images?.[1]?.caption || "Addressing the public gathering"
    },
    {
      id: 3,
      src: "/events/event3.jpg",
      alt: t.photoGallery?.images?.[2]?.alt || "Rally Event",
      caption: t.photoGallery?.images?.[2]?.caption || "Participating in political rally"
    },
    {
      id: 4,
      src: "/events/event4.jpg",
      alt: t.photoGallery?.images?.[3]?.alt || "Community Service",
      caption: t.photoGallery?.images?.[3]?.caption || "Engaged in community service"
    },
    {
      id: 5,
      src: "/events/event5.jpg",
      alt: t.photoGallery?.images?.[4]?.alt || "Leadership Meeting",
      caption: t.photoGallery?.images?.[4]?.caption || "Consultation with party leaders"
    },
    {
      id: 6,
      src: "/events/event6.jpg",
      alt: t.photoGallery?.images?.[5]?.alt || "Public Event",
      caption: t.photoGallery?.images?.[5]?.caption || "Attending public welfare program"
    },
    {
      id: 7,
      src: "/events/event7.jpg",
      alt: t.photoGallery?.images?.[6]?.alt || "Community Event",
      caption: t.photoGallery?.images?.[6]?.caption || "Social development activities"
    },
    {
      id: 8,
      src: "/events/event1.jpg",
      alt: t.photoGallery?.images?.[7]?.alt || "Leadership Address",
      caption: t.photoGallery?.images?.[7]?.caption || "Providing guidance on important matters"
    },
    {
      id: 9,
      src: "/events/event2.jpg",
      alt: t.photoGallery?.images?.[8]?.alt || "Public Rally",
      caption: t.photoGallery?.images?.[8]?.caption || "Speaking at large public gathering"
    }
  ];

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const lightboxSlides = galleryImages.map(image => ({
    src: image.src,
    alt: image.alt,
    title: image.alt,
    description: image.caption,
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
            <button className={`hidden md:inline-block relative px-5 py-2 rounded cursor-pointer group transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl ${
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
          </div>
        </div>

        {/* Perfect Homepage Gallery - 9 Images in Strategic Layout */}
        <div className="hidden md:grid grid-cols-4 gap-4 h-96">
          {/* Large Feature Image - Top Left (2x2) */}
          <div
            className={`col-span-2 row-span-2 relative group cursor-pointer overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-500 ${
              isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            } ${isDark ? "shadow-gray-900/50" : "shadow-gray-500/30"}`}
            style={{ transitionDelay: '300ms' }}
            onClick={() => openLightbox(0)}
          >
            <Image
              src={galleryImages[0].src}
              alt={galleryImages[0].alt}
              width={400}
              height={400}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              unoptimized={true}
            />
            <div className={`absolute inset-0 transition-all duration-300 ${
              isDark 
                ? "bg-black/20 group-hover:bg-black/30" 
                : "bg-black/10 group-hover:bg-black/20"
            }`}></div>
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className={`rounded-full p-3 ${
                isDark ? "bg-gray-800/90" : "bg-white/90"
              }`}>
                <svg className={`w-8 h-8 ${isDark ? "text-white" : "text-gray-700"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Small Images - Indices 1-4 */}
          {galleryImages.slice(1, 5).map((image, index) => (
            <div
              key={image.id}
              className={`col-span-1 row-span-1 relative group cursor-pointer overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-500 ${
                isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
              } ${isDark ? "shadow-gray-900/50" : "shadow-gray-500/30"}`}
              style={{ transitionDelay: `${(index + 2) * 150 + 300}ms` }}
              onClick={() => openLightbox(index + 1)}
            >
              <Image
                src={image.src}
                alt={image.alt}
                width={200}
                height={200}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                unoptimized={true}
              />
              <div className={`absolute inset-0 transition-all duration-300 ${
                isDark 
                  ? "bg-black/20 group-hover:bg-black/30" 
                  : "bg-black/10 group-hover:bg-black/20"
              }`}></div>
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className={`rounded-full p-2 ${
                  isDark ? "bg-gray-800/90" : "bg-white/90"
                }`}>
                  <svg className={`w-5 h-5 ${isDark ? "text-white" : "text-gray-700"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Row - 4 Equal Images */}
        <div className="hidden md:grid grid-cols-4 gap-4 mt-4">
          {galleryImages.slice(5, 9).map((image, index) => (
            <div
              key={image.id}
              className={`relative group cursor-pointer overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-500 aspect-[4/3] ${
                isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
              } ${isDark ? "shadow-gray-900/50" : "shadow-gray-500/30"}`}
              style={{ 
                transitionDelay: `${(index + 6) * 150 + 300}ms` 
              }}
              onClick={() => openLightbox(index + 5)}
            >
              <Image
                src={image.src}
                alt={image.alt}
                width={300}
                height={225}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                unoptimized={true}
              />
              <div className={`absolute inset-0 transition-all duration-300 ${
                isDark 
                  ? "bg-black/20 group-hover:bg-black/30" 
                  : "bg-black/10 group-hover:bg-black/20"
              }`}></div>
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className={`rounded-full p-2 ${
                  isDark ? "bg-gray-800/90" : "bg-white/90"
                }`}>
                  <svg className={`w-5 h-5 ${isDark ? "text-white" : "text-gray-700"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Photo Grid - Mobile */}
        <div className="md:hidden grid grid-cols-2 gap-4">
          {galleryImages.slice(0, 6).map((image, index) => (
            <div
              key={image.id}
              className={`relative group cursor-pointer overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-500 aspect-square ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              } ${isDark ? "shadow-gray-900/50" : "shadow-gray-500/30"}`}
              style={{ 
                transitionDelay: `${index * 100 + 200}ms` 
              }}
              onClick={() => openLightbox(index)}
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                unoptimized={true}
              />
              <div className={`absolute inset-0 transition-all duration-300 ${
                isDark 
                  ? "bg-black/20 group-hover:bg-black/30" 
                  : "bg-black/10 group-hover:bg-black/20"
              }`}></div>
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className={`rounded-full p-2 ${
                  isDark ? "bg-gray-800/90" : "bg-white/90"
                }`}>
                  <svg className={`w-5 h-5 ${isDark ? "text-white" : "text-gray-700"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile View More Button */}
        <div className="md:hidden text-center mt-8">
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
    </section>
  );
};

export default PhotoGallery;