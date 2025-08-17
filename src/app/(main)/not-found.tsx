"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/providers/LanguageProvider";
import { useTheme } from "@/providers/ThemeProvider";

const popularPages = [
  { href: "/", key: "home" },
  { href: "/about", key: "about" },
  { href: "/contact", key: "contact" },
  { href: "/news", key: "news" },
  { href: "/events", key: "events" },
  { href: "/gallery", key: "gallery" },
];

export default function NotFound() {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const { language, t } = useLanguage();
  const { isDark } = useTheme();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const getPopularPageText = (key: string) => {
    const navigationMap: { [key: string]: string } = {
      home: t.navigation?.home || "Home",
      about: t.navigation?.about || "About", 
      contact: t.services?.contactUs || "Contact",
      news: t.activities?.latestNews || "News",
      events: t.activities?.upcomingEvents || "Events",
      gallery: t.activities?.gallery || "Gallery",
    };
    return navigationMap[key] || key;
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDark ? "bg-gray-900" : "bg-gradient-to-br from-gray-50 to-white"
    }`}>
      
      <div className="relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className={`absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-20 ${
            isDark ? "bg-red-500" : "bg-red-200"
          }`} />
          <div className={`absolute -bottom-40 -left-40 w-80 h-80 rounded-full opacity-20 ${
            isDark ? "bg-blue-500" : "bg-blue-200"
          }`} />
          <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-10 ${
            isDark ? "bg-green-500" : "bg-green-200"
          }`} />
        </div>

        <div className="relative z-10 container mx-auto px-6 py-8 min-h-[calc(100vh-80px)] flex items-center">
          <div className="max-w-4xl mx-auto text-center">
            {/* Animated 404 */}
            <div className="mb-8">
              <div className={`text-8xl md:text-9xl font-bold mb-4 ${
                isDark ? "text-red-400" : "text-red-500"
              } animate-bounce`}>
                404
              </div>
              <div className={`text-xl md:text-2xl font-semibold mb-2 ${
                isDark ? "text-gray-200" : "text-gray-700"
              }`}>
                {t["404"]?.subtitle || "404 Error"}
              </div>
            </div>

            {/* Main Content */}
            <div className="mb-12">
              <h1 className={`text-3xl md:text-4xl font-bold mb-6 ${
                isDark ? "text-white" : "text-gray-900"
              }`}>
                {t["404"]?.title || "Page Not Found"}
              </h1>
              
              <p className={`text-lg md:text-xl mb-8 max-w-2xl mx-auto leading-relaxed ${
                isDark ? "text-gray-300" : "text-gray-600"
              }`}>
                {t["404"]?.description || "Sorry, the page you are looking for doesn't exist or has been moved."}
              </p>

              {/* Search Box */}
              <form onSubmit={handleSearch} className="max-w-md mx-auto mb-8">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t["404"]?.searchPlaceholder || "Search for something..."}
                    className={`w-full px-6 py-4 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-4 ${
                      isDark
                        ? "bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-red-400 focus:ring-red-400/20"
                        : "bg-white border-gray-200 text-gray-900 placeholder-gray-500 focus:border-red-500 focus:ring-red-500/20"
                    }`}
                  />
                  <button
                    type="submit"
                    className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-lg transition-all duration-300 ${
                      isDark
                        ? "text-gray-400 hover:text-white hover:bg-gray-700"
                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                </div>
              </form>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                <Link
                  href="/"
                  className="bg-gradient-to-r from-red-600 to-red-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:from-red-700 hover:to-red-800 hover:scale-105 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    <span>{t["404"]?.homeButton || "Go Back Home"}</span>
                  </div>
                </Link>
                
                <Link
                  href="/contact"
                  className={`px-8 py-4 rounded-xl font-semibold text-lg border-2 transition-all duration-300 hover:scale-105 transform hover:-translate-y-1 ${
                    isDark
                      ? "border-gray-600 text-gray-300 hover:border-gray-400 hover:text-white hover:bg-gray-800"
                      : "border-gray-300 text-gray-700 hover:border-gray-500 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span>{t["404"]?.contactButton || "Contact Us"}</span>
                  </div>
                </Link>
              </div>
            </div>

            {/* Popular Pages */}
            <div className={`max-w-2xl mx-auto p-6 rounded-2xl border ${
              isDark 
                ? "bg-gray-800/50 border-gray-700" 
                : "bg-white/70 border-gray-200"
            } backdrop-blur-sm`}>
              <h3 className={`text-xl font-semibold mb-4 ${
                isDark ? "text-white" : "text-gray-900"
              }`}>
                {t["404"]?.popularPages || "Popular Pages"}
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {popularPages.map((page) => (
                  <Link
                    key={page.href}
                    href={page.href}
                    className={`p-3 rounded-lg text-center font-medium transition-all duration-300 hover:scale-105 ${
                      isDark
                        ? "text-gray-300 hover:text-white hover:bg-gray-700"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    }`}
                  >
                    {getPopularPageText(page.key)}
                  </Link>
                ))}
              </div>
            </div>

            {/* Help Text */}
            <p className={`mt-8 text-sm ${
              isDark ? "text-gray-400" : "text-gray-500"
            }`}>
              {t["404"]?.helpText || "If you think this is an error, please contact us."}
            </p>

            {/* Decorative Image/Icon */}
            <div className="mt-12 flex justify-center">
              <div className={`w-32 h-32 rounded-full flex items-center justify-center ${
                isDark ? "bg-gray-800" : "bg-gray-100"
              }`}>
                <svg 
                  className={`w-16 h-16 ${isDark ? "text-gray-600" : "text-gray-400"}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={1.5} 
                    d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 0a6 6 0 116 0m-6 0H3m16 0h-4"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer Spacing */}
      <div className="h-24"></div>
    </div>
  );
}