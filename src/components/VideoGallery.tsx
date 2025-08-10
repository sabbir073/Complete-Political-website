"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";

interface VideoPlayerProps {
  isOpen: boolean;
  onClose: () => void;
  videoId: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ isOpen, onClose, videoId }) => {
  const [isLoading, setIsLoading] = useState(true);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 p-4">
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
        <div className="relative bg-black rounded-lg overflow-hidden shadow-2xl">
          <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
              </div>
            )}
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
              className="absolute inset-0 w-full h-full"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              onLoad={() => setIsLoading(false)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const VideoGallery: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const section = document.getElementById('video-gallery-section');
    if (section) {
      observer.observe(section);
    }

    return () => {
      if (section) {
        observer.unobserve(section);
      }
    };
  }, []);

  const videos = [
    {
      id: 1,
      thumbnail: "/events/event1.jpg",
      title: "Community Leadership Address",
      description: "Key policy announcements and community engagement initiatives",
      videoId: "dQw4w9WgXcQ", // Sample YouTube video ID
      duration: "15:30"
    },
    {
      id: 2,
      thumbnail: "/events/event2.jpg", 
      title: "Economic Development Summit",
      description: "Strategies for sustainable growth and prosperity",
      videoId: "dQw4w9WgXcQ", // Sample YouTube video ID
      duration: "22:45"
    },
    {
      id: 3,
      thumbnail: "/events/event3.jpg",
      title: "Youth Empowerment Program",
      description: "Inspiring the next generation of leaders",
      videoId: "dQw4w9WgXcQ", // Sample YouTube video ID
      duration: "18:20"
    }
  ];

  const openVideo = (videoId: string) => {
    setActiveVideo(videoId);
    document.body.style.overflow = 'hidden';
  };

  const closeVideo = () => {
    setActiveVideo(null);
    document.body.style.overflow = 'unset';
  };

  return (
    <>
      <section id="video-gallery-section" className="w-full px-6 md:px-16 py-16 bg-gray-50 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className={`text-center md:text-left mb-12 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <p className="text-sm text-red-600 font-semibold mb-2">Media Center</p>
            <div className="w-10 h-[2px] bg-red-600 mb-4 mx-auto md:mx-0 rounded-full" />
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 md:mb-0">
                Showcase of Stories
              </h2>
              <button className="relative bg-primaryRed text-white px-5 py-2 rounded cursor-pointer group">
                <span className="absolute inset-0 bg-gradient-to-r from-primaryRed to-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                <span className="relative z-10">View All</span>
              </button>
            </div>
          </div>

          {/* Video Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {videos.map((video, index) => (
              <div
                key={video.id}
                className={`group cursor-pointer transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                style={{ 
                  transitionDelay: `${index * 200 + 300}ms` 
                }}
                onClick={() => openVideo(video.videoId)}
              >
                {/* Video Card */}
                <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] overflow-hidden">
                  {/* Video Thumbnail */}
                  <div className="relative h-48 overflow-hidden bg-white">
                    <Image
                      src={video.thumbnail}
                      alt={video.title}
                      width={400}
                      height={300}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      unoptimized={true}
                    />
                    
                    {/* Play Button */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="relative">
                        {/* Pulsing Ring */}
                        <div className="absolute inset-0 rounded-full border-4 border-white border-opacity-30 animate-ping"></div>
                        <div className="absolute inset-2 rounded-full border-2 border-white border-opacity-50 animate-pulse"></div>
                        
                        {/* Play Button */}
                        <div className="relative w-16 h-16 bg-white bg-opacity-90 rounded-full flex items-center justify-center group-hover:bg-opacity-100 transition-all duration-300 transform group-hover:scale-110">
                          <svg className="w-6 h-6 text-red-600 ml-1" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z"/>
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Duration */}
                    <div className="absolute bottom-3 right-3 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                      {video.duration}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    {/* Title */}
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-red-600 transition-colors duration-300 line-clamp-2">
                      {video.title}
                    </h3>

                    {/* Watch Now */}
                    <div className="mt-2 text-red-600 text-sm font-semibold group-hover:text-red-700 transition-colors duration-300">
                      Watch Now →
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Video Player Modal */}
      {activeVideo && (
        <VideoPlayer
          isOpen={!!activeVideo}
          onClose={closeVideo}
          videoId={activeVideo}
        />
      )}
    </>
  );
};

export default VideoGallery;