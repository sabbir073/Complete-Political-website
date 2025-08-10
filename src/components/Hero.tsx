"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Pagination } from "swiper/modules";
import Image from "next/image";
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/pagination";

const slidesData = [
  {
    backgroundImage: "/slider/1.jpg",
    personImage: "/slider/leader.png",
    title: "A Country That Belongs to Everyone",
    subtitle:
      "We fight for our citizen rights, so join us and make our country more beautiful & natural for all our citizen.",
  },
  {
    backgroundImage: "/slider/hero-bg-1.jpg",
    personImage: "/slider/leader.png",
    title: "Empowering the People",
    subtitle:
      "Together, we can create a nation where every voice is heard and every citizen matters.",
  },
  {
    backgroundImage: "/slider/bg2.jpg",
    personImage: "/slider/leader.png",
    title: "Unity in Diversity",
    subtitle:
      "Our strength lies in our diversity. Let's build a future where everyone belongs.",
  },
  {
    backgroundImage: "/slider/hero-bg-2.jpg",
    personImage: "/slider/leader.png",
    title: "A Vision for Tomorrow",
    subtitle:
      "Join us in shaping a brighter future for our country and its people.",
  },
];

export default function Hero() {
  return (
    <section className="relative w-full h-[70vh] sm:h-[80vh] lg:h-screen overflow-hidden">
      <Swiper
        modules={[Autoplay, EffectFade, Pagination]}
        effect="fade"
        autoplay={{ delay: 5000 }}
        loop={true}
        pagination={{ 
          clickable: true,
          bulletClass: 'swiper-pagination-bullet custom-bullet',
          bulletActiveClass: 'swiper-pagination-bullet-active custom-bullet-active'
        }}
        className="w-full h-full"
      >
        {slidesData.map((slide, index) => (
          <SwiperSlide key={index}>
            <div 
              className="relative w-full h-full bg-cover bg-center bg-no-repeat animate-bg-entrance"
              style={{
                backgroundImage: `url('${slide.backgroundImage}')`,
                backgroundColor: '#1e293b' // fallback color
              }}
              key={`bg-${index}`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-black/70"></div>
              
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
                          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight animate-title-entrance"
                          style={{ animationDelay: '0.6s' }}
                        >
                          {slide.title}
                        </h1>
                        
                        <p 
                          className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-200 leading-relaxed animate-subtitle-entrance"
                          style={{ animationDelay: '0.9s' }}
                        >
                          {slide.subtitle}
                        </p>
                        
                        <div 
                          className="pt-2 sm:pt-4 animate-button-entrance"
                          style={{ animationDelay: '1.2s' }}
                        >
                          <button className="relative bg-primaryRed text-white px-6 sm:px-8 lg:px-10 py-2.5 sm:py-3 lg:py-4 text-sm sm:text-base lg:text-lg rounded cursor-pointer group transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                            <span className="absolute inset-0 bg-gradient-to-r from-primaryRed to-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded"></span>
                            <span className="relative z-10 font-semibold">Learn More</span>
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Person Image Section - Right */}
                    <div className="hidden lg:flex flex-1 items-center justify-center lg:justify-end">
                      <div 
                        className="relative animate-image-entrance"
                        key={`image-${index}`}
                        style={{ animationDelay: '0.1s' }}
                      >
                        {/* Desktop: Contained height similar to content */}
                        <div className="relative">
                          <div className="relative w-80 h-96 xl:w-96 xl:h-[500px] bg-gradient-to-br from-white/60 via-white/50 to-white/40 rounded-t-3xl backdrop-blur-lg border border-white/60 shadow-2xl" style={{ padding: '15px 15px 0px 15px' }}>
                            <div className="relative w-full h-full">
                              <Image
                                src={slide.personImage}
                                alt={`Person ${index + 1}`}
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
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
      
      <style jsx global>{`
        .swiper-pagination {
          bottom: 30px !important;
        }
        
        .custom-bullet {
          width: 12px !important;
          height: 12px !important;
          background: rgba(255, 255, 255, 0.5) !important;
          opacity: 1 !important;
          margin: 0 6px !important;
          border-radius: 50% !important;
          transition: all 0.3s ease !important;
        }
        
        .custom-bullet-active {
          background: #dc2626 !important;
          transform: scale(1.2) !important;
        }
        
        .custom-bullet:hover {
          background: rgba(255, 255, 255, 0.8) !important;
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