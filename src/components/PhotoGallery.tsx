"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

const PhotoGallery: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

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
      alt: "Community Meeting"
    },
    {
      id: 2,
      src: "/events/event2.jpg", 
      alt: "Public Address"
    },
    {
      id: 3,
      src: "/events/event3.jpg",
      alt: "Rally Event"
    },
    {
      id: 4,
      src: "/events/event4.jpg",
      alt: "Community Service"
    },
    {
      id: 5,
      src: "/events/event5.jpg",
      alt: "Leadership Meeting"
    },
    {
      id: 6,
      src: "/events/event6.jpg",
      alt: "Public Event"
    },
    {
      id: 7,
      src: "/events/event7.jpg",
      alt: "Community Event"
    },
    {
      id: 8,
      src: "/events/event1.jpg",
      alt: "Leadership Address"
    },
    {
      id: 9,
      src: "/events/event2.jpg",
      alt: "Public Rally"
    }
  ];

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const lightboxSlides = galleryImages.map(image => ({
    src: image.src,
    alt: image.alt,
    width: 1200,
    height: 800,
  }));

  return (
    <section id="photo-gallery-section" className="w-full px-6 md:px-16 py-16 bg-gray-50 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className={`text-center md:text-left mb-12 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <p className="text-sm text-red-600 font-semibold mb-2">Visual Chapters</p>
          <div className="w-10 h-[2px] bg-red-600 mb-4 mx-auto md:mx-0 rounded-full" />
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 md:mb-0">
              Photo Gallery
            </h2>
            <button className="hidden md:inline-block relative bg-primaryRed text-white px-5 py-2 rounded cursor-pointer group">
              <span className="absolute inset-0 bg-gradient-to-r from-primaryRed to-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              <span className="relative z-10">View All</span>
            </button>
          </div>
        </div>

        {/* Perfect Homepage Gallery - 9 Images in Strategic Layout */}
        <div className="hidden md:grid grid-cols-4 gap-4 h-96">
          {/* Large Feature Image - Top Left (2x2) */}
          <div
            className={`col-span-2 row-span-2 relative group cursor-pointer overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-500 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
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
            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-all duration-300"></div>
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="bg-white/90 rounded-full p-3">
                <svg className="w-8 h-8 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Small Images - Indices 1-4 */}
          {galleryImages.slice(1, 5).map((image, index) => (
            <div
              key={image.id}
              className={`col-span-1 row-span-1 relative group cursor-pointer overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-500 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
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
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-all duration-300"></div>
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="bg-white/90 rounded-full p-2">
                  <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              className={`relative group cursor-pointer overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-500 aspect-[4/3] ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
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
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-all duration-300"></div>
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="bg-white/90 rounded-full p-2">
                  <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              className={`relative group cursor-pointer overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-500 aspect-square ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
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
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-all duration-300"></div>
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="bg-white/90 rounded-full p-2">
                  <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile View More Button */}
        <div className="md:hidden text-center mt-8">
          <button className="relative bg-primaryRed text-white px-6 py-3 rounded cursor-pointer group">
            <span className="absolute inset-0 bg-gradient-to-r from-primaryRed to-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            <span className="relative z-10">View All Photos</span>
          </button>
        </div>
      </div>

      {/* Lightbox Component */}
      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        index={lightboxIndex}
        slides={lightboxSlides}
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
          container: { backgroundColor: "rgba(0, 0, 0, 0.9)" },
          navigationPrev: {
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            borderRadius: "50%",
            width: "48px",
            height: "48px",
            left: "20px",
            color: "#374151",
          },
          navigationNext: {
            backgroundColor: "rgba(255, 255, 255, 0.9)", 
            borderRadius: "50%",
            width: "48px", 
            height: "48px",
            right: "20px",
            color: "#374151",
          },
        }}
      />
    </section>
  );
};

export default PhotoGallery;