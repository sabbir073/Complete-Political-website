/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/providers/LanguageProvider";
import { useTheme } from "@/providers/ThemeProvider";

const popularPages = [
  { href: "/", key: "home", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  { href: "/about", key: "about", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
  { href: "/news", key: "news", icon: "M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" },
  { href: "/events", key: "events", icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
  { href: "/contact", key: "contact", icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
  { href: "/election-2026", key: "election", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
];

const translations = {
  en: {
    subtitle: "Oops! Page Not Found",
    title: "We couldn't find what you're looking for",
    description: "The page you requested might have been moved, deleted, or never existed. Let's get you back on track.",
    searchPlaceholder: "Search for content...",
    homeButton: "Back to Home",
    contactButton: "Report Issue",
    popularPages: "Quick Links",
    helpText: "Need help? Contact our support team for assistance.",
    home: "Home",
    about: "About",
    news: "News",
    events: "Events",
    contact: "Contact",
    election: "Election 2026",
  },
  bn: {
    subtitle: "ওহ! পৃষ্ঠা খুঁজে পাওয়া যায়নি",
    title: "আপনি যা খুঁজছেন তা আমরা খুঁজে পাইনি",
    description: "আপনার অনুরোধ করা পৃষ্ঠাটি সরানো, মুছে ফেলা বা কখনও ছিল না। আসুন আপনাকে সঠিক পথে ফিরিয়ে আনি।",
    searchPlaceholder: "কন্টেন্ট খুঁজুন...",
    homeButton: "হোমে ফিরে যান",
    contactButton: "সমস্যা রিপোর্ট করুন",
    popularPages: "দ্রুত লিঙ্ক",
    helpText: "সাহায্য দরকার? সহায়তার জন্য আমাদের সাপোর্ট টিমের সাথে যোগাযোগ করুন।",
    home: "হোম",
    about: "সম্পর্কে",
    news: "সংবাদ",
    events: "ইভেন্ট",
    contact: "যোগাযোগ",
    election: "নির্বাচন ২০২৬",
  },
};

export default function NotFound() {
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { language } = useLanguage();
  const { isDark } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const t = translations[language as keyof typeof translations] || translations.en;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const getPageText = (key: string) => {
    return t[key as keyof typeof t] || key;
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-500 ${
      isDark
        ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
        : "bg-gradient-to-br from-red-50 via-white to-green-50"
    }`}>

      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* BNP Colors - Red and Green accents */}
        <div className={`absolute -top-40 -right-40 w-96 h-96 rounded-full blur-3xl opacity-30 animate-pulse ${
          isDark ? "bg-red-600" : "bg-red-200"
        }`} style={{ animationDuration: '4s' }} />
        <div className={`absolute -bottom-40 -left-40 w-96 h-96 rounded-full blur-3xl opacity-30 animate-pulse ${
          isDark ? "bg-green-600" : "bg-green-200"
        }`} style={{ animationDuration: '5s', animationDelay: '1s' }} />
        <div className={`absolute top-1/3 left-1/4 w-64 h-64 rounded-full blur-2xl opacity-20 animate-pulse ${
          isDark ? "bg-red-500" : "bg-red-100"
        }`} style={{ animationDuration: '6s', animationDelay: '2s' }} />

        {/* Floating particles */}
        <div className="absolute inset-0">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className={`absolute w-2 h-2 rounded-full ${
                isDark ? "bg-red-400/20" : "bg-red-300/30"
              }`}
              style={{
                left: `${20 + i * 15}%`,
                top: `${30 + (i % 3) * 20}%`,
                animation: `float ${3 + i}s ease-in-out infinite`,
                animationDelay: `${i * 0.5}s`,
              }}
            />
          ))}
        </div>
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 py-8 min-h-screen flex items-center justify-center">
        <div className="max-w-3xl mx-auto text-center">

          {/* Logo */}
          <div className="mb-6">
            <Link href="/" className="inline-block">
              <Image
                src="/Logo-PNG.png"
                alt="S M Jahangir Hossain"
                width={80}
                height={80}
                className="mx-auto hover:scale-110 transition-transform duration-300"
              />
            </Link>
          </div>

          {/* Animated 404 Number */}
          <div className="relative mb-6">
            <div className={`text-[120px] sm:text-[160px] md:text-[200px] font-black leading-none select-none ${
              isDark
                ? "text-transparent bg-clip-text bg-gradient-to-br from-red-400 via-red-500 to-green-500"
                : "text-transparent bg-clip-text bg-gradient-to-br from-red-600 via-red-500 to-green-600"
            }`}
            style={{
              textShadow: isDark
                ? '0 0 80px rgba(239, 68, 68, 0.3)'
                : '0 0 80px rgba(239, 68, 68, 0.2)',
              animation: 'pulse 3s ease-in-out infinite',
            }}>
              404
            </div>

            {/* Decorative line */}
            <div className={`absolute left-1/2 -translate-x-1/2 bottom-4 w-32 h-1 rounded-full ${
              isDark
                ? "bg-gradient-to-r from-transparent via-red-500 to-transparent"
                : "bg-gradient-to-r from-transparent via-red-400 to-transparent"
            }`} />
          </div>

          {/* Subtitle */}
          <p className={`text-lg sm:text-xl font-medium mb-3 ${
            isDark ? "text-red-400" : "text-red-600"
          }`}>
            {t.subtitle}
          </p>

          {/* Main Title */}
          <h1 className={`text-2xl sm:text-3xl md:text-4xl font-bold mb-4 ${
            isDark ? "text-white" : "text-gray-900"
          }`}>
            {t.title}
          </h1>

          {/* Description */}
          <p className={`text-base sm:text-lg mb-8 max-w-xl mx-auto leading-relaxed ${
            isDark ? "text-gray-400" : "text-gray-600"
          }`}>
            {t.description}
          </p>

          {/* Search Box */}
          <form onSubmit={handleSearch} className="max-w-md mx-auto mb-8">
            <div className="relative group">
              <div className={`absolute -inset-0.5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur ${
                isDark
                  ? "bg-gradient-to-r from-red-600 to-green-600"
                  : "bg-gradient-to-r from-red-400 to-green-400"
              }`} />
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t.searchPlaceholder}
                  className={`w-full px-5 py-4 pr-12 rounded-xl border-2 transition-all duration-300 focus:outline-none ${
                    isDark
                      ? "bg-gray-800/90 border-gray-700 text-white placeholder-gray-500 focus:border-red-500"
                      : "bg-white/90 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-red-500"
                  }`}
                />
                <button
                  type="submit"
                  className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all duration-300 ${
                    isDark
                      ? "text-gray-400 hover:text-white hover:bg-gray-700"
                      : "text-gray-500 hover:text-red-600 hover:bg-red-50"
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </div>
          </form>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-10">
            <Link
              href="/"
              className="group relative inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-semibold text-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-red-500/30 hover:-translate-y-1"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-red-700 to-red-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <svg className="relative w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="relative">{t.homeButton}</span>
            </Link>

            <Link
              href="/contact"
              className={`group inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-lg border-2 transition-all duration-300 hover:-translate-y-1 ${
                isDark
                  ? "border-gray-600 text-gray-300 hover:border-green-500 hover:text-green-400 hover:bg-green-500/10"
                  : "border-gray-300 text-gray-700 hover:border-green-600 hover:text-green-600 hover:bg-green-50"
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{t.contactButton}</span>
            </Link>
          </div>

          {/* Quick Links */}
          <div className={`max-w-2xl mx-auto p-6 rounded-2xl backdrop-blur-md border ${
            isDark
              ? "bg-gray-800/50 border-gray-700/50"
              : "bg-white/60 border-gray-200/50"
          }`}>
            <h3 className={`text-lg font-semibold mb-4 ${
              isDark ? "text-white" : "text-gray-900"
            }`}>
              {t.popularPages}
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {popularPages.map((page) => (
                <Link
                  key={page.href}
                  href={page.href}
                  className={`group flex items-center gap-2 p-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 ${
                    isDark
                      ? "text-gray-400 hover:text-white hover:bg-gray-700/50"
                      : "text-gray-600 hover:text-red-600 hover:bg-red-50"
                  }`}
                >
                  <svg
                    className={`w-4 h-4 transition-colors ${
                      isDark ? "group-hover:text-red-400" : "group-hover:text-red-500"
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={page.icon} />
                  </svg>
                  <span>{getPageText(page.key)}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Help Text */}
          <p className={`mt-8 text-sm ${
            isDark ? "text-gray-500" : "text-gray-500"
          }`}>
            {t.helpText}
          </p>

          {/* Brand Footer */}
          <div className={`mt-8 pt-6 border-t ${
            isDark ? "border-gray-800" : "border-gray-200"
          }`}>
            <p className={`text-xs ${isDark ? "text-gray-600" : "text-gray-400"}`}>
              © {new Date().getFullYear()} S M Jahangir Hossain. All rights reserved.
            </p>
          </div>
        </div>
      </div>

      {/* CSS for floating animation */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
      `}</style>
    </div>
  );
}
