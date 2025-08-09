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
              className="relative w-full h-full bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: `url('${slide.backgroundImage}')`,
                backgroundColor: '#1e293b' // fallback color
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-black/70"></div>
              
              <div className="relative z-10 h-full flex">
                <div className="container mx-auto flex items-center h-full">
                  <div className="w-full h-full flex flex-col lg:flex-row items-center">
                    {/* Content Section - Left */}
                    <div className="flex-1 flex items-center justify-center lg:justify-start px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
                      <div className="text-center lg:text-left space-y-4 sm:space-y-6 max-w-2xl">
                        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight">
                          {slide.title}
                        </h1>
                        
                        <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-200 leading-relaxed">
                          {slide.subtitle}
                        </p>
                        
                        <div className="pt-2 sm:pt-4">
                          <button className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 sm:px-8 lg:px-10 py-2.5 sm:py-3 lg:py-4 text-sm sm:text-base lg:text-lg rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                            Learn More
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Person Image Section - Right */}
                    <div className="hidden lg:flex flex-1 items-center justify-center lg:justify-end">
                      <div className="relative">
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