"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useLanguage } from "@/providers/LanguageProvider";
import { useTheme } from "@/providers/ThemeProvider";

const Events: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { t } = useLanguage();
  const { isDark } = useTheme();

  // Fallback events data in case translations are not loaded
  const fallbackEvents = [
    {
      id: 1,
      image: "/events/event1.jpg",
      title: "National Unity Rally: Standing Together for Bangladesh",
      description: "A massive gathering bringing together citizens from all walks of life to demonstrate unity and solidarity for our beloved nation.",
      date: "December 15, 2024",
      category: "Political Rally"
    },
    {
      id: 2,
      image: "/events/event2.jpg", 
      title: "Community Development Initiative Launch",
      description: "Launching new programs focused on grassroots development and empowering local communities.",
      date: "December 10, 2024",
      category: "Community Program"
    },
    {
      id: 3,
      image: "/events/event3.jpg",
      title: "Youth Leadership Summit 2024",
      description: "Engaging young leaders in meaningful dialogue about the future of our country.",
      date: "December 8, 2024",
      category: "Youth Program"
    },
    {
      id: 4,
      image: "/events/event4.jpg",
      title: "Economic Development Forum",
      description: "Discussing strategies for sustainable economic growth and prosperity.",
      date: "December 5, 2024",
      category: "Economic Forum"
    },
    {
      id: 5,
      image: "/events/event5.jpg",
      title: "Rural Development Conference",
      description: "Focusing on improving infrastructure and opportunities in rural areas.",
      date: "December 3, 2024",
      category: "Rural Development"
    },
    {
      id: 6,
      image: "/events/event6.jpg",
      title: "Education Reform Summit",
      description: "Addressing educational challenges and proposing innovative solutions.",
      date: "November 30, 2024",
      category: "Education"
    },
    {
      id: 7,
      image: "/events/event7.jpg",
      title: "Healthcare Initiative Launch",
      description: "Introducing new healthcare programs for underserved communities.",
      date: "November 28, 2024",
      category: "Healthcare"
    },
  ];

  // Use translated events or fallback
  const events = t.events?.eventList?.map((event, index) => ({
    id: index + 1,
    image: `/events/event${index + 1}.jpg`,
    ...event
  })) || fallbackEvents;

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const section = document.getElementById('events-section');
    if (section) {
      observer.observe(section);
    }

    return () => {
      if (section) {
        observer.unobserve(section);
      }
    };
  }, []);

  return (
    <section 
      id="events-section" 
      className={`w-full px-6 md:px-16 py-16 overflow-hidden transition-colors duration-300 ${
        isDark ? "bg-gray-800" : "bg-gray-50"
      }`}
    >
      {/* Header */}
      <div className={`text-center md:text-left mb-12 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <p className={`text-sm font-semibold ${
          isDark ? "text-red-400" : "text-red-600"
        }`}>
          {t.events?.sectionLabel || "Humanity & Country"}
        </p>
        <div className={`w-10 h-[2px] mt-1 mb-4 mx-auto md:mx-0 rounded-full ${
          isDark ? "bg-red-400" : "bg-red-600"
        }`} />
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <h2 className={`text-3xl md:text-4xl font-bold mb-6 md:mb-0 ${
            isDark ? "text-white" : "text-gray-900"
          }`}>
            {t.events?.title || "Recent Events & Activities"}
          </h2>
          <a href="https://www.bnpbd.org/events" target="_blank" rel="noopener noreferrer" className="hidden md:inline-block">
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
                {t.events?.viewAll || "View All"}
              </span>
            </button>
          </a>
        </div>
      </div>

      {/* Events Grid - 3 Column Layout */}
      <div className="hidden lg:grid lg:grid-cols-6 gap-6">
        {/* Large Square Event - Left Column */}
        <div className={`col-span-2 relative group cursor-pointer transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
          <div className={`relative overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] ${
            isDark ? "bg-gray-700 shadow-gray-900/50" : "bg-white shadow-gray-500/30"
          }`}>
            <div className="relative h-96">
              <Image
                src={events[0].image}
                alt={events[0].title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                unoptimized={true}
              />
              <div className={`absolute inset-0 ${
                isDark 
                  ? "bg-gradient-to-t from-gray-900/80 via-gray-800/30 to-transparent" 
                  : "bg-gradient-to-t from-black/70 via-black/20 to-transparent"
              }`}></div>
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="text-white">
                  <p className="text-sm opacity-90 mb-2">{events[0].date}</p>
                  <h3 className="text-xl font-bold mb-3 leading-tight">
                    {events[0].title}
                  </h3>
                  <p className="text-sm opacity-90 leading-relaxed">
                    {events[0].description}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Middle Column - 3 Events */}
        <div className="col-span-2 space-y-4">
          {events.slice(1, 4).map((event, index) => (
            <div key={event.id} className={`group cursor-pointer transition-all duration-700 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`} style={{ transitionDelay: `${(index + 1) * 150 + 500}ms` }}>
              <div className={`rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] py-1 ${
                isDark ? "bg-gray-700 shadow-gray-900/50" : "bg-white shadow-gray-500/30"
              }`}>
                <div className="flex items-center min-h-20">
                  {/* Image Section */}
                  <div className="relative w-28 flex-shrink-0 overflow-hidden rounded-l-lg" style={{minHeight: '100px'}}>
                    <Image
                      src={event.image}
                      alt={event.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                      unoptimized={true}
                    />
                  </div>
                  
                  {/* Content Section */}
                  <div className="flex-1 p-3">
                    <p className={`text-xs mb-1 ${
                      isDark ? "text-gray-400" : "text-gray-600"
                    }`}>
                      {event.date}
                    </p>
                    <h4 className={`text-sm font-bold mb-1 leading-tight line-clamp-2 ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}>
                      {event.title}
                    </h4>
                    <p className={`text-xs leading-relaxed ${
                      isDark ? "text-gray-300" : "text-gray-700"
                    }`}>
                      {event.description.length > 50 
                        ? `${event.description.substring(0, 50)}...` 
                        : event.description
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right Column - 3 Events */}
        <div className="col-span-2 space-y-4">
          {events.slice(4, 7).map((event, index) => (
            <div key={event.id} className={`group cursor-pointer transition-all duration-700 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`} style={{ transitionDelay: `${(index + 1) * 150 + 800}ms` }}>
              <div className={`rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] py-1 ${
                isDark ? "bg-gray-700 shadow-gray-900/50" : "bg-white shadow-gray-500/30"
              }`}>
                <div className="flex items-center min-h-20">
                  {/* Image Section */}
                  <div className="relative w-28 flex-shrink-0 overflow-hidden rounded-l-lg" style={{minHeight: '100px'}}>
                    <Image
                      src={event.image}
                      alt={event.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                      unoptimized={true}
                    />
                  </div>
                  
                  {/* Content Section */}
                  <div className="flex-1 p-3">
                    <p className={`text-xs mb-1 ${
                      isDark ? "text-gray-400" : "text-gray-600"
                    }`}>
                      {event.date}
                    </p>
                    <h4 className={`text-sm font-bold mb-1 leading-tight line-clamp-2 ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}>
                      {event.title}
                    </h4>
                    <p className={`text-xs leading-relaxed ${
                      isDark ? "text-gray-300" : "text-gray-700"
                    }`}>
                      {event.description.length > 50 
                        ? `${event.description.substring(0, 50)}...` 
                        : event.description
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile/Tablet Grid */}
      <div className="lg:hidden grid grid-cols-1 md:grid-cols-2 gap-6">
        {events.map((event, index) => (
          <div key={event.id} className={`relative group cursor-pointer transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: `${index * 100 + 300}ms` }}>
            <div className={`relative overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] ${
              isDark ? "bg-gray-700 shadow-gray-900/50" : "bg-white shadow-gray-500/30"
            }`}>
              <div className="relative h-64">
                <Image
                  src={event.image}
                  alt={event.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  unoptimized={true}
                />
                <div className={`absolute inset-0 ${
                  isDark 
                    ? "bg-gradient-to-t from-gray-900/80 via-gray-800/30 to-transparent" 
                    : "bg-gradient-to-t from-black/70 via-black/20 to-transparent"
                }`}></div>
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="text-white">
                    <p className="text-sm opacity-90 mb-2">{event.date}</p>
                    <h3 className="text-lg font-bold mb-2 leading-tight">
                      {event.title}
                    </h3>
                    <p className="text-sm opacity-90 leading-relaxed line-clamp-2">
                      {event.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Mobile View All Button */}
      <div className="text-center mt-8 md:hidden">
        <a href="https://www.bnpbd.org/events" target="_blank" rel="noopener noreferrer">
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
              {t.events?.viewAllEvents || "View All Events"}
            </span>
          </button>
        </a>
      </div>
    </section>
  );
};

export default Events;