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

const AboutMe: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  // Sample YouTube video ID - replace with actual video
  const videoId = "dQw4w9WgXcQ"; // Sample video ID

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
      <section id="about-section" className="w-full px-6 md:px-16 py-16 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}>
              {/* Header */}
              <div className="mb-8">
                <p className="text-sm text-red-600 font-semibold mb-2">About Me</p>
                <div className="w-10 h-[2px] bg-red-600 mb-4 rounded-full" />
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                  Foundations for a <br />
                  <span className="text-red-600">Thriving Community</span>
                </h2>
              </div>

              {/* Content */}
              <div className="space-y-6">
                <p className="text-gray-700 text-lg leading-relaxed">
                  Our commitment to building stronger communities starts with understanding the needs of every citizen. Through decades of dedicated service, we have worked tirelessly to create opportunities, foster growth, and ensure prosperity for all.
                </p>
                
                <p className="text-gray-700 text-lg leading-relaxed">
                  From rural development initiatives to urban infrastructure projects, our vision encompasses comprehensive progress that touches every aspect of community life. We believe in transparent governance, inclusive policies, and sustainable development that benefits future generations.
                </p>

                <div className="pt-6">
                  <button className="relative bg-primaryRed text-white px-8 py-3 rounded-lg cursor-pointer group font-semibold">
                    <span className="absolute inset-0 bg-gradient-to-r from-primaryRed to-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></span>
                    <span className="relative z-10">Learn More</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Video Section */}
            <div className={`transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}>
              <div className="relative">
                {/* Video Thumbnail */}
                <div className="relative rounded-2xl overflow-hidden shadow-2xl group cursor-pointer h-full" onClick={openVideo}>
                  <div className="relative h-96 bg-white">
                    <Image
                      src="/events/event1.jpg"
                      alt="About Video Thumbnail"
                      width={800}
                      height={600}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      unoptimized={true}
                    />
                    
                    {/* Play Button */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="relative">
                        {/* Pulsing Ring */}
                        <div className="absolute inset-0 rounded-full border-4 border-white border-opacity-30 animate-ping"></div>
                        <div className="absolute inset-2 rounded-full border-2 border-white border-opacity-50 animate-pulse"></div>
                        
                        {/* Play Button */}
                        <div className="relative w-20 h-20 bg-white bg-opacity-90 rounded-full flex items-center justify-center group-hover:bg-opacity-100 transition-all duration-300 transform group-hover:scale-110">
                          <svg className="w-8 h-8 text-red-600 ml-1" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z"/>
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Video Info */}
                <div className="mt-6 text-center">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Watch Our Story</h3>
                  <p className="text-gray-600">Discover the journey of community transformation</p>
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
        videoId={videoId}
      />
    </>
  );
};

export default AboutMe;