/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useKeenSlider } from "keen-slider/react";
import { useLanguage } from "@/providers/LanguageProvider";
import { useTheme } from "@/providers/ThemeProvider";
import "keen-slider/keen-slider.min.css";

interface LeadersSetting {
  id: string;
  setting_key: string;
  setting_value: any;
  setting_type: string;
  is_multilingual: boolean;
  description: string;
}

interface Leader {
  name: string | { en: string; bn: string };
  image: string;
}

const GreatLeader: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [settings, setSettings] = useState<LeadersSetting[]>([]);
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [loading, setLoading] = useState(false); // Start with false to prevent loading state issues
  const { language, t } = useLanguage();
  const { isDark } = useTheme();

  // Fetch settings from API
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/settings/leaders');
        const data = await response.json();
        
        if (data.success) {
          setSettings(data.data.settings);
          processLeadersData(data.data.settings);
        }
      } catch (error) {
        console.error('Error fetching leaders settings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  // Process settings to extract leaders data
  const processLeadersData = (settingsData: LeadersSetting[]) => {
    const leadersData: Leader[] = [];
    const leaderCount = getSettingValue(settingsData, 'home_leader_count', 3);

    for (let i = 1; i <= leaderCount; i++) {
      const nameKey = `home_leader_${i}_name`;
      const imageKey = `home_leader_${i}_image`;
      
      const name = getSettingValue(settingsData, nameKey, `Leader ${i}`);
      const image = getSettingValue(settingsData, imageKey, `/leader/zia.png`);

      leadersData.push({ name, image });
    }

    setLeaders(leadersData);
  };

  // Helper function to get setting value
  const getSettingValue = (settingsData: LeadersSetting[] | string, key?: string, defaultValue: any = '') => {
    // If called with just a key (backwards compatibility)
    if (typeof settingsData === 'string') {
      const setting = settings.find(s => s.setting_key === settingsData);
      if (!setting) return key || defaultValue;
      return setting.setting_value !== null && setting.setting_value !== '' 
        ? setting.setting_value 
        : (key || defaultValue);
    }
    
    // If called with settingsData array
    const setting = settingsData.find(s => s.setting_key === key);
    if (!setting) return defaultValue;
    
    return setting.setting_value !== null && setting.setting_value !== '' 
      ? setting.setting_value 
      : defaultValue;
  };

  // Helper function to get multilingual text
  const getText = (value: any, fallback: string = '') => {
    if (typeof value === 'object' && value !== null) {
      return value[language] || value.en || fallback;
    }
    return value || fallback;
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const section = document.getElementById('leaders-section');
    if (section) {
      observer.observe(section);
    }

    return () => {
      if (section) {
        observer.unobserve(section);
      }
    };
  }, []);

  const [sliderRef] = useKeenSlider<HTMLDivElement>(
    {
      loop: leaders.length > 1,
      mode: "free-snap",
      slides: {
        perView: 1.2,
        spacing: 20,
      },
      breakpoints: {
        "(max-width: 480px)": {
          slides: {
            perView: 1.1,
            spacing: 16,
          },
        },
      },
      drag: leaders.length > 1,
      initial: 0,
      created(s) {
        s.moveToIdx(0, true, { duration: 0 });
      },
    },
    [
      (slider) => {
        if (leaders.length <= 1) return;
        
        let timeout: any;
        let mouseOver = false;

        function clearNextTimeout() {
          clearTimeout(timeout);
        }

        function nextTimeout() {
          clearTimeout(timeout);
          if (mouseOver) return;
          timeout = setTimeout(() => {
            if (slider.track.details?.rel === slider.track.details?.maxIdx) {
              slider.moveToIdx(0, true, { duration: 1000 });
            } else {
              slider.next();
            }
          }, 2500);
        }

        slider.on("created", () => {
          slider.container.addEventListener("mouseover", () => {
            mouseOver = true;
            clearNextTimeout();
          });
          slider.container.addEventListener("mouseout", () => {
            mouseOver = false;
            nextTimeout();
          });
          nextTimeout();
        });

        slider.on("dragStarted", clearNextTimeout);
        slider.on("animationEnded", nextTimeout);
        slider.on("updated", nextTimeout);
      },
    ],
    [leaders]
  );

  // Show loading state - TEMPORARILY DISABLED FOR DEBUGGING
  // if (loading) {
  //   return (
  //     <section className={`w-full px-6 md:px-16 py-16 transition-colors duration-300 ${
  //       isDark ? "bg-gray-900" : "bg-white"
  //     }`}>
  //       <div className="flex items-center justify-center min-h-96">
  //         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
  //       </div>
  //     </section>
  //   );
  // }

  return (
    <section 
      id="leaders-section" 
      className={`w-full px-6 md:px-16 py-16 overflow-hidden transition-colors duration-300 ${
        isDark ? "bg-gray-900" : "bg-white"
      }`}
    >
      {/* Header */}
      <div className={`text-center md:text-left md:flex md:justify-between md:items-center mb-8 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div>
          <p className={`text-sm font-semibold ${
            isDark ? "text-red-400" : "text-red-600"
          }`}>
            {getText(getSettingValue('home_leader_section_subtitle'), "Our Leaders")}
          </p>
          <div className={`w-10 h-[2px] mt-1 mb-4 mx-auto md:mx-0 rounded-full ${
            isDark ? "bg-red-400" : "bg-red-600"
          }`} />
          <h2 className={`text-3xl font-bold ${
            isDark ? "text-white" : "text-gray-900"
          }`}>
            {getText(getSettingValue('home_leader_section_title'), "The Great Leaders")}
          </h2>
        </div>

        {/* Desktop Button */}
        <div className="hidden md:block">
          <a href="https://www.bnpbd.org/our-leaders" target="_blank" rel="noopener noreferrer">
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
                {t.leaders?.viewMore || "View More"}
              </span>
            </button>
          </a>
        </div>
      </div>

      {/* Mobile Auto-Scrolling Carousel */}
      <div className={`md:hidden mb-6 overflow-hidden transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}>
        <div ref={sliderRef} className="keen-slider">
          {leaders.map((leader, index) => (
            <div
              key={index}
              className="keen-slider__slide flex justify-center"
            >
              <div className={`relative rounded-xl overflow-hidden shadow-lg transform transition-all duration-300 hover:scale-105 w-full max-w-sm ${
                isDark ? "shadow-gray-800/50" : "shadow-gray-500/30"
              }`}>
                <Image
                  src={leader.image}
                  alt={getText(leader.name, `Leader ${index + 1}`)}
                  width={320}
                  height={400}
                  loading="lazy"
                  className="w-full h-80 object-cover grayscale hover:grayscale-0 transition-all duration-500"
                />
                <div className={`absolute inset-0 ${
                  isDark 
                    ? "bg-gradient-to-t from-gray-900/60 via-transparent to-transparent" 
                    : "bg-gradient-to-t from-black/40 via-transparent to-transparent"
                }`}></div>
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-white font-bold text-lg text-center drop-shadow-lg">
                    {getText(leader.name, `Leader ${index + 1}`)}
                  </h3>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile Button at Bottom */}
        <div className="text-center mt-6">
          <a href="https://www.bnpbd.org/our-leaders" target="_blank" rel="noopener noreferrer">
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
                {t.leaders?.viewMore || "View More"}
              </span>
            </button>
          </a>
        </div>
      </div>

      {/* Desktop Grid */}
      <div className="hidden md:grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {leaders.map((leader, index) => (
          <div
            key={index}
            className={`relative w-full rounded-xl overflow-hidden shadow-lg transform transition-all duration-700 hover:scale-105 group ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
            } ${
              isDark ? "shadow-gray-800/50" : "shadow-gray-500/30"
            }`}
            style={{ 
              transitionDelay: `${(index + 1) * 200 + 400}ms` 
            }}
          >
            <Image
              src={leader.image}
              alt={getText(leader.name, `Leader ${index + 1}`)}
              width={400}
              height={500}
              loading="lazy"
              className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500 w-full h-auto"
            />
            <div className={`absolute inset-0 ${
              isDark 
                ? "bg-gradient-to-t from-gray-900/70 via-transparent to-transparent" 
                : "bg-gradient-to-t from-black/50 via-transparent to-transparent"
            }`}></div>
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <h3 className="text-white font-bold text-xl text-center drop-shadow-lg">
                {getText(leader.name, `Leader ${index + 1}`)}
              </h3>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default GreatLeader;