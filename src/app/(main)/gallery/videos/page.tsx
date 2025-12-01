"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useLanguage } from '@/providers/LanguageProvider';
import { useTheme } from '@/providers/ThemeProvider';

interface VideoItem {
  id: string;
  title_en: string;
  title_bn?: string;
  youtube_url?: string;
  custom_thumbnail?: string;
  duration?: string;
  created_at?: string;
  category?: {
    id: string;
    name_en: string;
    name_bn?: string;
  };
}

// Helper function to extract YouTube video ID
const getYouTubeId = (url?: string): string | null => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

// Get YouTube thumbnail
const getYouTubeThumbnail = (url?: string): string | null => {
  if (!url) return null;
  const videoId = getYouTubeId(url);
  if (videoId) {
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  }
  return null;
};

const VIDEOS_PER_PAGE = 9;

export default function VideoGalleryPage() {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [displayedVideos, setDisplayedVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const { language } = useLanguage();
  const { isDark } = useTheme();

  const getText = (en?: string, bn?: string) => {
    if (language === 'bn' && bn) return bn;
    return en || '';
  };

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        // Fetch all published videos
        const res = await fetch('/api/video-gallery?limit=100');
        const data = await res.json();
        if (data.data) {
          setVideos(data.data);
          // Initially display first batch
          setDisplayedVideos(data.data.slice(0, VIDEOS_PER_PAGE));
          setHasMore(data.data.length > VIDEOS_PER_PAGE);
        }
      } catch (error) {
        console.error('Error fetching videos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  const loadMore = () => {
    setLoadingMore(true);
    setTimeout(() => {
      const currentLength = displayedVideos.length;
      const nextVideos = videos.slice(currentLength, currentLength + VIDEOS_PER_PAGE);
      setDisplayedVideos([...displayedVideos, ...nextVideos]);
      setHasMore(currentLength + nextVideos.length < videos.length);
      setLoadingMore(false);
    }, 300);
  };

  const openVideo = (videoUrl: string) => {
    setActiveVideo(videoUrl);
    document.body.style.overflow = 'hidden';
  };

  const closeVideo = () => {
    setActiveVideo(null);
    document.body.style.overflow = 'unset';
  };

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
            {language === 'bn' ? 'ভিডিও গ্যালারি' : 'Video Gallery'}
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            {language === 'bn'
              ? 'আমাদের ইভেন্ট এবং কার্যক্রমের ভিডিও সংকলন দেখুন'
              : 'Watch collection of videos from our events and activities'}
          </p>
        </div>
      </div>

      {/* Videos Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {videos.length === 0 ? (
          <div className={`text-center py-16 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            <svg className="w-20 h-20 mx-auto mb-6 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <p className="text-xl">
              {language === 'bn' ? 'কোনো ভিডিও পাওয়া যায়নি।' : 'No videos found.'}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {displayedVideos.map((video) => {
                const videoUrl = video.youtube_url || '';
                const thumbnailUrl = video.custom_thumbnail ||
                  getYouTubeThumbnail(videoUrl) ||
                  '/events/event1.jpg';

                return (
                  <div
                    key={video.id}
                    onClick={() => openVideo(videoUrl)}
                    className={`group cursor-pointer rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${
                      isDark ? 'bg-gray-800' : 'bg-white'
                    }`}
                  >
                    {/* Thumbnail */}
                    <div className="relative h-52 overflow-hidden">
                      <Image
                        src={thumbnailUrl}
                        alt={getText(video.title_en, video.title_bn)}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        unoptimized={thumbnailUrl?.includes('youtube') || thumbnailUrl?.includes('cloudfront') || thumbnailUrl?.includes('s3.')}
                      />

                      {/* Play Button Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-all">
                        <div className="relative">
                          {/* Pulsing Ring */}
                          <div className="absolute inset-0 rounded-full border-4 border-white border-opacity-30 animate-ping"></div>

                          <div className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-transform group-hover:scale-110 ${
                            isDark ? 'bg-gray-800/90' : 'bg-white/90'
                          }`}>
                            <svg className={`w-7 h-7 ml-1 ${isDark ? 'text-red-400' : 'text-red-600'}`} fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z"/>
                            </svg>
                          </div>
                        </div>
                      </div>

                      {/* Duration Badge */}
                      {video.duration && (
                        <div className="absolute bottom-3 right-3 bg-black/75 text-white text-xs px-2 py-1 rounded">
                          {video.duration}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <h3 className={`text-lg font-bold mb-1 line-clamp-2 transition-colors ${
                        isDark ? 'text-white group-hover:text-red-400' : 'text-gray-900 group-hover:text-red-600'
                      }`}>
                        {getText(video.title_en, video.title_bn)}
                      </h3>

                      {/* Date */}
                      {video.created_at && (
                        <p className={`text-sm mb-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {new Date(video.created_at).toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            timeZone: 'Asia/Dhaka'
                          })}
                        </p>
                      )}

                      {video.category && (
                        <span className={`inline-block text-xs px-3 py-1 rounded-full ${
                          isDark ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-600'
                        }`}>
                          {getText(video.category.name_en, video.category.name_bn)}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Load More Button */}
            {hasMore && (
              <div className="text-center mt-12">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className={`relative px-8 py-3 rounded-lg cursor-pointer group transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed ${
                    isDark
                      ? "bg-red-600 hover:bg-red-700 text-white"
                      : "bg-red-600 hover:bg-red-700 text-white"
                  }`}
                >
                  {loadingMore ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      {language === 'bn' ? 'লোড হচ্ছে...' : 'Loading...'}
                    </span>
                  ) : (
                    <span className="font-semibold">
                      {language === 'bn' ? 'আরো দেখুন' : 'Load More'}
                    </span>
                  )}
                </button>
              </div>
            )}

            {/* Showing count */}
            <div className={`text-center mt-6 text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
              {language === 'bn'
                ? `${videos.length} টির মধ্যে ${displayedVideos.length} টি ভিডিও দেখাচ্ছে`
                : `Showing ${displayedVideos.length} of ${videos.length} videos`
              }
            </div>
          </>
        )}
      </div>

      {/* Video Player Modal */}
      {activeVideo && (
        <div
          className="fixed inset-0 z-[9999999] flex items-center justify-center bg-black/90 p-4"
          onClick={closeVideo}
        >
          <div
            className="relative w-full max-w-4xl mx-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={closeVideo}
              className="absolute -top-12 right-0 text-white hover:text-red-500 transition-colors"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Video Container */}
            <div className="relative rounded-lg overflow-hidden shadow-2xl bg-black">
              <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                {getYouTubeId(activeVideo) ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${getYouTubeId(activeVideo)}?autoplay=1&rel=0&modestbranding=1`}
                    className="absolute inset-0 w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video
                    src={activeVideo}
                    className="absolute inset-0 w-full h-full"
                    controls
                    autoPlay
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
