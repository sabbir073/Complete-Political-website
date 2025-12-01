"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/providers/LanguageProvider";
import { useTheme } from "@/providers/ThemeProvider";

interface EventItem {
  id: string;
  title_en: string;
  title_bn?: string;
  slug: string;
  description_en?: string;
  description_bn?: string;
  event_date: string;
  featured_image?: string;
  location_en?: string;
  location_bn?: string;
  category?: {
    id: string;
    name_en: string;
    name_bn?: string;
  };
}

const Events: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { t, language } = useLanguage();
  const { isDark } = useTheme();

  // Helper function to get localized text
  const getText = (en?: string, bn?: string) => {
    if (language === 'bn' && bn) return bn;
    return en || '';
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'Asia/Dhaka' // Always show in Bangladesh time
    };
    return date.toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', options);
  };

  // Strip HTML tags
  const stripHtml = (html?: string) => {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '');
  };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch('/api/events?limit=7');
        const data = await res.json();
        if (data.data) {
          setEvents(data.data);
        }
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

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
          <Link href="/events" className="hidden md:inline-block">
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
          </Link>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        </div>
      )}

      {/* Empty State */}
      {!loading && events.length === 0 && (
        <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          {language === 'bn' ? 'কোনো ইভেন্ট পাওয়া যায়নি।' : 'No events found.'}
        </div>
      )}

      {/* Events Grid - 3 Column Layout */}
      {!loading && events.length > 0 && (
      <div className="hidden lg:grid lg:grid-cols-6 gap-6">
        {/* Large Square Event - Left Column */}
        {events[0] && (
          <Link href={`/events/${events[0].slug}`} className={`col-span-2 relative group cursor-pointer transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
            <div className={`relative overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] ${
              isDark ? "bg-gray-700 shadow-gray-900/50" : "bg-white shadow-gray-500/30"
            }`}>
              <div className="relative h-96">
                <Image
                  src={events[0].featured_image || '/events/event1.jpg'}
                  alt={getText(events[0].title_en, events[0].title_bn)}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  unoptimized={events[0].featured_image?.includes('cloudfront')}
                />
                <div className={`absolute inset-0 ${
                  isDark
                    ? "bg-gradient-to-t from-gray-900/80 via-gray-800/30 to-transparent"
                    : "bg-gradient-to-t from-black/70 via-black/20 to-transparent"
                }`}></div>
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="text-white">
                    <p className="text-sm opacity-90 mb-2">{formatDate(events[0].event_date)}</p>
                    <h3 className="text-xl font-bold mb-3 leading-tight">
                      {getText(events[0].title_en, events[0].title_bn)}
                    </h3>
                    <p className="text-sm opacity-90 leading-relaxed line-clamp-3">
                      {stripHtml(getText(events[0].description_en, events[0].description_bn))}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        )}

        {/* Middle Column - 3 Events */}
        <div className="col-span-2 space-y-4">
          {events.slice(1, 4).map((event, index) => (
            <Link href={`/events/${event.slug}`} key={event.id} className={`block group cursor-pointer transition-all duration-700 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`} style={{ transitionDelay: `${(index + 1) * 150 + 500}ms` }}>
              <div className={`rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] py-1 ${
                isDark ? "bg-gray-700 shadow-gray-900/50" : "bg-white shadow-gray-500/30"
              }`}>
                <div className="flex items-center min-h-20">
                  <div className="relative w-28 flex-shrink-0 overflow-hidden rounded-l-lg" style={{minHeight: '100px'}}>
                    <Image
                      src={event.featured_image || `/events/event${index + 2}.jpg`}
                      alt={getText(event.title_en, event.title_bn)}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                      unoptimized={event.featured_image?.includes('cloudfront')}
                    />
                  </div>
                  <div className="flex-1 p-3">
                    <p className={`text-xs mb-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                      {formatDate(event.event_date)}
                    </p>
                    <h4 className={`text-sm font-bold mb-1 leading-tight line-clamp-2 ${isDark ? "text-white" : "text-gray-900"}`}>
                      {getText(event.title_en, event.title_bn)}
                    </h4>
                    <p className={`text-xs leading-relaxed line-clamp-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                      {stripHtml(getText(event.description_en, event.description_bn)).substring(0, 80)}...
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Right Column - 3 Events */}
        <div className="col-span-2 space-y-4">
          {events.slice(4, 7).map((event, index) => (
            <Link href={`/events/${event.slug}`} key={event.id} className={`block group cursor-pointer transition-all duration-700 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`} style={{ transitionDelay: `${(index + 1) * 150 + 800}ms` }}>
              <div className={`rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] py-1 ${
                isDark ? "bg-gray-700 shadow-gray-900/50" : "bg-white shadow-gray-500/30"
              }`}>
                <div className="flex items-center min-h-20">
                  <div className="relative w-28 flex-shrink-0 overflow-hidden rounded-l-lg" style={{minHeight: '100px'}}>
                    <Image
                      src={event.featured_image || `/events/event${index + 5}.jpg`}
                      alt={getText(event.title_en, event.title_bn)}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                      unoptimized={event.featured_image?.includes('cloudfront')}
                    />
                  </div>
                  <div className="flex-1 p-3">
                    <p className={`text-xs mb-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                      {formatDate(event.event_date)}
                    </p>
                    <h4 className={`text-sm font-bold mb-1 leading-tight line-clamp-2 ${isDark ? "text-white" : "text-gray-900"}`}>
                      {getText(event.title_en, event.title_bn)}
                    </h4>
                    <p className={`text-xs leading-relaxed line-clamp-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                      {stripHtml(getText(event.description_en, event.description_bn)).substring(0, 80)}...
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
      )}

      {/* Mobile/Tablet Grid */}
      {!loading && events.length > 0 && (
      <div className="lg:hidden grid grid-cols-1 md:grid-cols-2 gap-6">
        {events.map((event, index) => (
          <Link href={`/events/${event.slug}`} key={event.id} className={`relative group cursor-pointer transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: `${index * 100 + 300}ms` }}>
            <div className={`relative overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] ${
              isDark ? "bg-gray-700 shadow-gray-900/50" : "bg-white shadow-gray-500/30"
            }`}>
              <div className="relative h-64">
                <Image
                  src={event.featured_image || `/events/event${index + 1}.jpg`}
                  alt={getText(event.title_en, event.title_bn)}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  unoptimized={event.featured_image?.includes('cloudfront')}
                />
                <div className={`absolute inset-0 ${
                  isDark
                    ? "bg-gradient-to-t from-gray-900/80 via-gray-800/30 to-transparent"
                    : "bg-gradient-to-t from-black/70 via-black/20 to-transparent"
                }`}></div>
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="text-white">
                    <p className="text-sm opacity-90 mb-2">{formatDate(event.event_date)}</p>
                    <h3 className="text-lg font-bold mb-2 leading-tight">
                      {getText(event.title_en, event.title_bn)}
                    </h3>
                    <p className="text-sm opacity-90 leading-relaxed line-clamp-2">
                      {stripHtml(getText(event.description_en, event.description_bn))}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
      )}

      {/* Mobile View All Button */}
      {!loading && events.length > 0 && (
      <div className="text-center mt-8 md:hidden">
        <Link href="/events">
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
        </Link>
      </div>
      )}
    </section>
  );
};

export default Events;
