"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Pagination } from "swiper/modules";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/providers/LanguageProvider";
import { useTheme } from "@/providers/ThemeProvider";
import { useHomeSettings } from "@/hooks/useHomeSettings";
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/pagination";


export default function Hero() {
  const { t, language } = useLanguage();
  const { isDark } = useTheme();
  const { homeSettings, loading } = useHomeSettings();

  // Create our own getText function that uses current language
  const getText = (multilingualText: { en: string; bn: string } | string | undefined): string => {
    if (!multilingualText) return '';
    if (typeof multilingualText === 'string') {
      return multilingualText;
    }
    if (typeof multilingualText === 'object' && multilingualText !== null) {
      return multilingualText[language] || multilingualText.en || '';
    }
    return '';
  };

  // Show loading state
  if (loading) {
    return (
      <section className={`relative w-full h-[70vh] sm:h-[80vh] lg:h-screen overflow-hidden ${isDark ? 'bg-gray-900' : 'bg-gray-100'}`}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className={`animate-spin rounded-full h-12 w-12 border-b-2 mx-auto ${isDark ? 'border-red-400' : 'border-red-600'}`}></div>
            <p className={`mt-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Loading hero section...</p>
          </div>
        </div>
      </section>
    );
  }

  // Check if hero section should be shown
  if (!homeSettings?.home_hero_section_show) {
    return null;
  }

  // Get hero items from settings
  const heroItemCount = homeSettings?.home_hero_item_count || 1;
  
  // Build slides data from dynamic settings
  const slidesData = [];
  for (let i = 1; i <= heroItemCount; i++) {
    // Get image values, handling empty strings
    const backgroundImageFromSettings = homeSettings?.[`home_hero_item_${i}_background_image`];
    const personImageFromSettings = homeSettings?.[`home_hero_item_${i}_person_image`];

    const backgroundImage = (backgroundImageFromSettings && backgroundImageFromSettings.trim() !== '')
      ? backgroundImageFromSettings
      : `/slider/${i === 1 ? '1' : i === 2 ? 'hero-bg-1' : i === 3 ? 'bg2' : 'hero-bg-2'}.jpg`;

    const personImage = (personImageFromSettings && personImageFromSettings.trim() !== '')
      ? personImageFromSettings
      : `/slider/leader.png`;

    // Debug logging
    console.log(`Hero Item ${i}:`, {
      backgroundImage,
      personImage,
      backgroundImageFromSettings,
      personImageFromSettings
    });
      
    // Store settings for dynamic language switching
    const titleSetting = homeSettings?.[`home_hero_item_${i}_title`];
    const descriptionSetting = homeSettings?.[`home_hero_item_${i}_description`];
    
    slidesData.push({
      backgroundImage,
      personImage,
      titleSetting,
      descriptionSetting,
      fallbackTitle: t.hero?.slides?.[i-1]?.title || `Welcome to Our Platform`,
      fallbackDescription: t.hero?.slides?.[i-1]?.subtitle || `Discover amazing content and experiences`
    });
  }

  // Ensure we have at least one slide
  if (slidesData.length === 0) {
    slidesData.push({
      backgroundImage: '/slider/1.jpg',
      personImage: '/slider/leader.png',
      title: 'Welcome to Our Platform',
      description: 'Discover amazing content and experiences'
    });
  }

  // Default height - removed hero height setting
  const heightClass = 'h-[70vh] sm:h-[80vh] lg:h-screen';

  return (
    <section className={`relative w-full ${heightClass} overflow-hidden`}>
      <Swiper
        modules={[Autoplay, EffectFade, Pagination]}
        effect="fade"
        autoplay={{ delay: 5000 }}
        loop={true}
        pagination={heroItemCount > 1 && homeSettings?.home_hero_show_pagination ? { 
          clickable: true,
          bulletClass: 'swiper-pagination-bullet custom-bullet',
          bulletActiveClass: 'swiper-pagination-bullet-active custom-bullet-active'
        } : false}
        className="w-full h-full"
      >
        {slidesData.map((slide, index) => {
          return (
            <SwiperSlide key={index}>
              <div 
                className="relative w-full h-full bg-cover bg-center bg-no-repeat animate-bg-entrance"
                style={{
                  backgroundImage: `url('${slide.backgroundImage}')`,
                  backgroundColor: isDark ? '#0f172a' : '#1e293b'
                }}
                key={`bg-${index}`}
              >
                <div 
                  className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-black"
                  style={{
                    opacity: homeSettings?.home_hero_overlay_opacity || 0.7
                  }}
                ></div>
                
                <div className="relative z-10 h-full flex">
                  <div className="container mx-auto flex items-center h-full">
                    <div className="w-full h-full flex flex-col lg:flex-row items-center">
                      {/* Content Section - Left */}
                      <div className="flex-1 flex items-center justify-center lg:justify-start px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
                        <div 
                          className="text-center lg:text-left space-y-4 sm:space-y-6 max-w-2xl"
                          key={`content-${index}`}
                        >
                          <h1 
                            className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight animate-title-entrance ${
                              isDark ? "text-white" : "text-white"
                            }`}
                            style={{ animationDelay: '0.6s' }}
                          >
                            {getText(slide.titleSetting) || slide.fallbackTitle}
                          </h1>
                          
                          <p 
                            className={`text-base sm:text-lg md:text-xl lg:text-2xl leading-relaxed animate-subtitle-entrance ${
                              isDark ? "text-gray-100" : "text-gray-200"
                            }`}
                            style={{ animationDelay: '0.9s' }}
                          >
                            {getText(slide.descriptionSetting) || slide.fallbackDescription}
                          </p>
                          
                          {homeSettings?.home_hero_button_show && (
                            <div 
                              className="pt-2 sm:pt-4 animate-button-entrance"
                              style={{ animationDelay: '1.2s' }}
                            >
                              <Link
                                href={homeSettings?.home_hero_button_url || "/about"}
                                className={`relative inline-block px-6 sm:px-8 lg:px-10 py-2.5 sm:py-3 lg:py-4 text-sm sm:text-base lg:text-lg rounded cursor-pointer group transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl ${
                                  isDark 
                                    ? "bg-red-600 hover:bg-red-700 text-white" 
                                    : "bg-primaryRed hover:bg-red-600 text-white"
                                }`}
                              >
                                <span className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded ${
                                  isDark 
                                    ? "bg-gradient-to-r from-red-700 to-red-800" 
                                    : "bg-gradient-to-r from-primaryRed to-red-600"
                                }`}></span>
                                <span className="relative z-10 font-semibold">
                                  {getText(homeSettings?.home_hero_button_text) || t.hero?.learnMore || "Learn More"}
                                </span>
                              </Link>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Person Image Section - Right */}
                      {homeSettings?.home_hero_show_person_image && (
                        <div className="hidden lg:flex flex-1 items-center justify-center lg:justify-end">
                        <div 
                          className="relative animate-image-entrance"
                          key={`image-${index}`}
                          style={{ animationDelay: '0.1s' }}
                        >
                          {/* Desktop: Contained height similar to content */}
                          <div className="relative">
                            <div 
                              className={`relative w-80 h-96 xl:w-96 xl:h-[500px] rounded-t-3xl backdrop-blur-lg border shadow-2xl ${
                                isDark 
                                  ? "bg-gradient-to-br from-gray-800/80 via-gray-700/60 to-gray-800/70 border-gray-600/50" 
                                  : "bg-gradient-to-br from-white/60 via-white/50 to-white/40 border-white/60"
                              }`} 
                              style={{ padding: '15px 15px 0px 15px' }}
                            >
                              <div className="relative w-full h-full">
                                <Image
                                  src={slide.personImage}
                                  alt={`S M Jahangir Hossain ${index + 1}`}
                                  fill
                                  className="object-cover object-top rounded-t-2xl"
                                  priority={index === 0}
                                  unoptimized={true}
                                  sizes="(min-width: 1024px) 400px, 500px"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>
      
      <style jsx global>{`
        .swiper-pagination {
          bottom: 30px !important;
        }
        
        .custom-bullet {
          width: 12px !important;
          height: 12px !important;
          background: ${isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.5)'} !important;
          opacity: 1 !important;
          margin: 0 6px !important;
          border-radius: 50% !important;
          transition: all 0.3s ease !important;
        }
        
        .custom-bullet-active {
          background: ${isDark ? '#dc2626' : '#dc2626'} !important;
          transform: scale(1.2) !important;
        }
        
        .custom-bullet:hover {
          background: ${isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(255, 255, 255, 0.8)'} !important;
          transform: scale(1.1) !important;
        }
        
        @keyframes titleEntrance {
          0% {
            opacity: 0;
            transform: translateX(-60px) translateY(-10px);
            filter: blur(10px);
          }
          60% {
            opacity: 0.8;
            transform: translateX(5px) translateY(0px);
            filter: blur(2px);
          }
          100% {
            opacity: 1;
            transform: translateX(0) translateY(0);
            filter: blur(0px);
          }
        }
        
        @keyframes subtitleEntrance {
          0% {
            opacity: 0;
            transform: translateY(40px);
            filter: blur(5px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
            filter: blur(0px);
          }
        }
        
        @keyframes buttonEntrance {
          0% {
            opacity: 0;
            transform: translateY(30px) scale(0.8);
          }
          70% {
            opacity: 1;
            transform: translateY(-5px) scale(1.05);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        @keyframes imageEntrance {
          0% {
            opacity: 0;
            transform: translateX(80px) scale(0.9) rotate(5deg);
            filter: blur(8px);
          }
          60% {
            opacity: 0.7;
            transform: translateX(-5px) scale(1.02) rotate(-1deg);
            filter: blur(2px);
          }
          100% {
            opacity: 1;
            transform: translateX(0) scale(1) rotate(0deg);
            filter: blur(0px);
          }
        }
        
        .animate-title-entrance {
          animation: titleEntrance 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
        }
        
        .animate-subtitle-entrance {
          animation: subtitleEntrance 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
        }
        
        .animate-button-entrance {
          animation: buttonEntrance 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          opacity: 0;
        }
        
        .animate-image-entrance {
          animation: imageEntrance 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
        }
        
        @keyframes bgEntrance {
          0% {
            opacity: 0;
            transform: scale(1.1);
            filter: blur(15px) brightness(0.3);
          }
          50% {
            opacity: 0.7;
            transform: scale(1.05);
            filter: blur(5px) brightness(0.6);
          }
          100% {
            opacity: 1;
            transform: scale(1);
            filter: blur(0px) brightness(1);
          }
        }
        
        .animate-bg-entrance {
          animation: bgEntrance 2s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
          opacity: 0;
        }
        
        @media (max-width: 1024px) {
          .swiper-pagination {
            bottom: 20px !important;
          }
        }
        
        @media (max-width: 640px) {
          .swiper-pagination {
            bottom: 15px !important;
          }
          
          .custom-bullet {
            width: 10px !important;
            height: 10px !important;
            margin: 0 4px !important;
          }
        }
      `}</style>
    </section>
  );
}