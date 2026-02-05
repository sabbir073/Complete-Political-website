"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useLanguage } from "@/providers/LanguageProvider";
import { useTheme } from "@/providers/ThemeProvider";

interface VideoPlayerProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ isOpen, onClose, videoUrl }) => {
  const [isLoading, setIsLoading] = useState(true);
  const { isDark } = useTheme();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999999] modal-overlay flex items-center justify-center bg-black bg-opacity-90 p-4">
      <div className="relative w-full max-w-4xl mx-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-white hover:text-red-500 transition-colors duration-300 z-10"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Video Container */}
        <div className={`relative rounded-lg overflow-hidden shadow-2xl ${
          isDark ? "bg-gray-900" : "bg-black"
        }`}>
          <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
            {isLoading && (
              <div className={`absolute inset-0 flex items-center justify-center ${
                isDark ? "bg-gray-800" : "bg-gray-900"
              }`}>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
              </div>
            )}
            <video
              src={videoUrl}
              className="absolute inset-0 w-full h-full"
              controls
              autoPlay
              onLoadedData={() => setIsLoading(false)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const AboutMe: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [thumbnailLoaded, setThumbnailLoaded] = useState(false);
  const thumbnailRef = useRef<HTMLVideoElement>(null);
  const { t } = useLanguage();
  const { isDark } = useTheme();

  // MP4 video URL from CloudFront
  const videoUrl = "https://dahf45b8zc9m5.cloudfront.net/media/videos/2026/02/1770271780596-100618f1-TVC-Final-with-Color-Correction.mp4";

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const section = document.getElementById('about-section');
    if (section) {
      observer.observe(section);
    }

    return () => {
      if (section) {
        observer.unobserve(section);
      }
    };
  }, []);

  const openVideo = () => {
    setIsVideoOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeVideo = () => {
    setIsVideoOpen(false);
    document.body.style.overflow = 'unset';
  };

  return (
    <>
      <section 
        id="about-section" 
        className={`w-full px-6 md:px-16 py-16 overflow-hidden transition-colors duration-300 ${
          isDark ? "bg-gray-900" : "bg-white"
        }`}
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className={`text-center lg:text-left transition-all duration-1000 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}>
              {/* Header */}
              <div className="mb-8">
                <p className={`text-sm font-semibold mb-2 ${
                  isDark ? "text-red-400" : "text-red-600"
                }`}>
                  {t.aboutMe?.sectionLabel || "About Me"}
                </p>
                <div className={`w-10 h-[2px] mb-4 mx-auto lg:mx-0 rounded-full ${
                  isDark ? "bg-red-400" : "bg-red-600"
                }`} />
                <h2 className={`text-3xl md:text-4xl font-bold mb-6 ${
                  isDark ? "text-white" : "text-gray-900"
                }`}>
                  {t.aboutMe?.title || "Foundations for a"} <br />
                  <span className={isDark ? "text-red-400" : "text-red-600"}>
                    {t.aboutMe?.titleHighlight || "Thriving Community"}
                  </span>
                </h2>
              </div>

              {/* Content */}
              <div className="space-y-6">
                <p className={`text-lg leading-relaxed ${
                  isDark ? "text-gray-300" : "text-gray-700"
                }`}>
                  {t.aboutMe?.paragraph1 || "Our commitment to building stronger communities starts with understanding the needs of every citizen. Through decades of dedicated service, we have worked tirelessly to create opportunities, foster growth, and ensure prosperity for all."}
                </p>
                
                <p className={`text-lg leading-relaxed ${
                  isDark ? "text-gray-300" : "text-gray-700"
                }`}>
                  {t.aboutMe?.paragraph2 || "From rural development initiatives to urban infrastructure projects, our vision encompasses comprehensive progress that touches every aspect of community life. We believe in transparent governance, inclusive policies, and sustainable development that benefits future generations."}
                </p>

                <div className="pt-6">
                  <Link href="/about">
                    <button className={`relative px-8 py-3 rounded-lg cursor-pointer group font-semibold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl ${
                      isDark 
                        ? "bg-red-600 hover:bg-red-700 text-white" 
                        : "bg-primaryRed hover:bg-red-600 text-white"
                    }`}>
                      <span className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg ${
                        isDark 
                          ? "bg-gradient-to-r from-red-700 to-red-800" 
                          : "bg-gradient-to-r from-primaryRed to-red-600"
                      }`}></span>
                      <span className="relative z-10">
                        {t.aboutMe?.learnMore || "Learn More"}
                      </span>
                    </button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Right Video Section */}
            <div className={`transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}>
              <div className="relative">
                {/* Video Thumbnail - Generated from video */}
                <div
                  className={`relative rounded-2xl overflow-hidden shadow-2xl group cursor-pointer h-full ${
                    isDark ? "shadow-gray-800/50" : "shadow-gray-500/30"
                  }`}
                  onClick={openVideo}
                >
                  <div className={`relative h-96 ${
                    isDark ? "bg-gray-800" : "bg-gray-200"
                  }`}>
                    {/* Loading spinner while video thumbnail loads */}
                    {!thumbnailLoaded && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
                      </div>
                    )}

                    {/* Video element as thumbnail - paused at first frame */}
                    <video
                      ref={thumbnailRef}
                      src={videoUrl}
                      className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
                        thumbnailLoaded ? 'opacity-100' : 'opacity-0'
                      }`}
                      muted
                      playsInline
                      preload="metadata"
                      onLoadedData={() => {
                        setThumbnailLoaded(true);
                        // Seek to 1 second to get a better frame (skip black intro if any)
                        if (thumbnailRef.current) {
                          thumbnailRef.current.currentTime = 1;
                        }
                      }}
                    />

                    {/* Play Button */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="relative">
                        {/* Pulsing Ring */}
                        <div className="absolute inset-0 rounded-full border-4 border-white border-opacity-30 animate-ping"></div>
                        <div className="absolute inset-2 rounded-full border-2 border-white border-opacity-50 animate-pulse"></div>

                        {/* Play Button */}
                        <div className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 transform group-hover:scale-110 ${
                          isDark
                            ? "bg-gray-800 bg-opacity-90 group-hover:bg-opacity-100"
                            : "bg-white bg-opacity-90 group-hover:bg-opacity-100"
                        }`}>
                          <svg className={`w-8 h-8 ml-1 ${
                            isDark ? "text-red-400" : "text-red-600"
                          }`} fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z"/>
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Video Info */}
                <div className="mt-6 text-center">
                  <h3 className={`text-xl font-bold mb-2 ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}>
                    {t.aboutMe?.videoTitle ?? "Watch Our Story"}
                  </h3>
                  {t.aboutMe?.videoSubtitle && (
                    <p className={isDark ? "text-gray-400" : "text-gray-600"}>
                      {t.aboutMe.videoSubtitle}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Video Player Modal */}
      <VideoPlayer
        isOpen={isVideoOpen}
        onClose={closeVideo}
        videoUrl={videoUrl}
      />
    </>
  );
};

export default AboutMe;