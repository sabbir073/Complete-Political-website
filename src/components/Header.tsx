/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useLanguage } from "../providers/LanguageProvider";
import { useTheme } from "../providers/ThemeProvider";

const menuItems = [
  { href: "/", key: "home" },
  {
    href: "/about",
    key: "about",
    dropdown: [
      { href: "/about", key: "personalInfo" },
      { href: "/about#journey", key: "politicalJourney" },
      { href: "/about#education", key: "education" },
      { href: "/about#position", key: "partyPosition" },
      { href: "/about#achievements", key: "awards" },
    ],
  },
  {
    href: "/activities",
    key: "activities",
    dropdown: [
      {
        href: "/events",
        key: "events",
        submenu: [
          { href: "/events", key: "upcomingEvents" },
          { href: "/events/archive", key: "pastEvents" },
          { href: "/events/calendar", key: "meetingCalendar" },
          { href: "/events/town-hall", key: "virtualTownHall" },
        ],
      },
      {
        href: "/news",
        key: "news",
        submenu: [
          { href: "/news", key: "latestNews" },
          { href: "/news/press-releases", key: "pressReleases" },
          { href: "/news/announcements", key: "announcements" },
          { href: "/news/media", key: "mediaCoverage" },
        ],
      },
      {
        href: "/gallery",
        key: "gallery",
        submenu: [
          { href: "/gallery", key: "photoGallery" },
          { href: "/gallery/videos", key: "videoStories" },
          { href: "/gallery/events", key: "eventPhotos" },
          { href: "/gallery/downloads", key: "downloads" },
        ],
      },
      { href: "/leaders", key: "leadership" },
    ],
  },
  {
    href: "/services",
    key: "services",
    dropdown: [
      {
        href: "/contact",
        key: "contactComplaints",
        submenu: [
          { href: "/contact", key: "contactUs" },
          { href: "/contact/complaints", key: "complaintBox" },
          { href: "/contact/area-problems", key: "areaProblems" },
          { href: "/emergency", key: "emergencyHelp" },
        ],
      },
      {
        href: "/participation",
        key: "publicParticipation",
        submenu: [
          { href: "/polls", key: "pollsSurveys" },
          { href: "/ama", key: "askMeAnything" },
          { href: "/forum", key: "communityForum" },
          { href: "/volunteer", key: "volunteer" },
        ],
      },
      {
        href: "/promises",
        key: "promisesProgress",
        submenu: [
          { href: "/promises", key: "promiseTracker" },
          { href: "/achievements", key: "achievements" },
          { href: "/testimonials", key: "testimonials" },
        ],
      },
    ],
  },
  {
    href: "/more",
    key: "more",
    dropdown: [
      {
        href: "/tools",
        key: "digitalTools",
        submenu: [
          { href: "/polls/live", key: "livePolling" },
          { href: "/challenges", key: "challenges" },
          { href: "/gamification", key: "gamification" },
          { href: "/store", key: "store" },
        ],
      },
      {
        href: "/support",
        key: "helpInfo",
        submenu: [
          { href: "/help", key: "help" },
          { href: "/privacy", key: "privacy" },
          { href: "/terms", key: "terms" },
          { href: "/accessibility", key: "accessibility" },
        ],
      },
      { href: "/sitemap", key: "siteMap" },
      { href: "/install", key: "installApp" },
    ],
  },
];

export default function Header() {
  const [isSticky, setIsSticky] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [openMobileDropdown, setOpenMobileDropdown] = useState<string | null>(null);
  const { language, changeLanguage, t } = useLanguage();
  const { theme, toggleTheme, isDark } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const headerHeight = 250;
      setIsSticky(scrollPosition > headerHeight);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
  }, [isMenuOpen]);

  const getTranslation = (section: string, key: string) => {
    return (t as any)[section]?.[key] || key;
  };

  const closeAllMenus = () => {
    setIsMenuOpen(false);
    setOpenDropdown(null);
    setOpenMobileDropdown(null);
  };

  return (
    <>
      <header
        className={`${
          isDark ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"
        } border-b backdrop-blur-lg transition-all duration-500 ease-in-out z-[9999] ${
          isSticky 
            ? "fixed top-0 left-0 right-0 shadow-lg animate-fadeInDown" 
            : "relative shadow-sm"
        }`}
      >
        <div className="container mx-auto">
          <div className="flex justify-between items-center px-6 py-4">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0 transition-transform duration-300 hover:scale-105">
              <Image 
                src="/logo.png" 
                alt="S M Jahangir Hossain Logo" 
                width={90} 
                height={60} 
                className="h-auto max-h-14" 
                priority
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-4">
              {menuItems.map((item) => (
                <div
                  key={item.href}
                  className="relative group"
                  onMouseEnter={() => item.dropdown && setOpenDropdown(item.href)}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  <Link
                    href={item.href}
                    className={`text-base font-semibold px-4 py-2 rounded-lg transition-all duration-300 flex items-center whitespace-nowrap ${
                      isDark
                        ? "text-gray-200 hover:text-white hover:bg-gray-800"
                        : "text-gray-700 hover:text-red-600 hover:bg-gray-50"
                    }`}
                  >
                    {getTranslation("navigation", item.key)}
                    {item.dropdown && (
                      <svg
                        className={`ml-2 w-4 h-4 transition-transform duration-300 ${
                          openDropdown === item.href ? "rotate-180" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </Link>

                  {/* Dropdown Menu */}
                  {item.dropdown && openDropdown === item.href && (
                    <div className={`absolute top-full left-0 w-80 rounded-xl shadow-2xl border z-[99999] transform transition-all duration-300 ${
                      isDark 
                        ? "bg-gray-800 border-gray-700" 
                        : "bg-white border-gray-200"
                    }`}>
                      <div className="py-3">
                        {item.dropdown.map((subItem) => (
                          <div key={subItem.href} className="relative group/sub">
                            <Link
                              href={subItem.href}
                              className={`flex items-center justify-between px-6 py-3 text-sm font-medium transition-all duration-200 ${
                                isDark
                                  ? "text-gray-300 hover:text-white hover:bg-gray-700"
                                  : "text-gray-700 hover:text-red-600 hover:bg-gray-50"
                              }`}
                            >
                              <span>{getTranslation(item.key, subItem.key)}</span>
                              {subItem.submenu && (
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              )}
                            </Link>

                            {/* Submenu */}
                            {subItem.submenu && (
                              <div className={`absolute left-full top-0 w-72 rounded-xl shadow-xl border opacity-0 invisible group-hover/sub:opacity-100 group-hover/sub:visible transition-all duration-300 z-[999999] ${
                                isDark 
                                  ? "bg-gray-800 border-gray-700" 
                                  : "bg-white border-gray-200"
                              }`}>
                                <div className="py-2">
                                  {subItem.submenu.map((subSubItem) => (
                                    <Link
                                      key={subSubItem.href}
                                      href={subSubItem.href}
                                      className={`block px-6 py-2 text-sm transition-all duration-200 ${
                                        isDark
                                          ? "text-gray-400 hover:text-white hover:bg-gray-700"
                                          : "text-gray-600 hover:text-red-600 hover:bg-gray-50"
                                      }`}
                                    >
                                      {getTranslation(item.key, subSubItem.key)}
                                    </Link>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </nav>

            {/* Desktop Controls */}
            <div className="hidden lg:flex items-center space-x-4">
              {/* Language Toggle */}
              <button
                onClick={() => changeLanguage(language === 'bn' ? 'en' : 'bn')}
                className={`px-4 py-2 text-sm font-semibold rounded-lg border transition-all duration-300 ${
                  isDark
                    ? "text-gray-300 border-gray-600 hover:bg-gray-700 hover:text-white"
                    : "text-gray-700 border-gray-300 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                {language === 'bn' ? 'English' : 'বাংলা'}
              </button>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className={`p-3 rounded-lg transition-all duration-300 ${
                  isDark
                    ? "text-gray-300 hover:bg-gray-700 hover:text-white"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
                title={getTranslation("theme", "toggle")}
              >
                {isDark ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>

              {/* WhatsApp Button */}
              <a
                href="https://wa.me/+8801700000000"
                target="_blank"
                rel="noopener noreferrer"
                className="relative bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:from-green-600 hover:to-green-700 hover:scale-105 shadow-lg hover:shadow-xl flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 2.006c-5.516 0-9.999 4.481-9.999 9.996 0 1.746.444 3.388 1.234 4.815L2.003 21.99l5.245-1.238c1.391.745 2.977 1.143 4.769 1.143 5.515 0 9.998-4.481 9.998-9.996S17.532 2.006 12.017 2.006zm5.818 14.186c-.244.687-1.213 1.266-1.973 1.43-.511.11-1.18.195-3.426-.731-2.871-1.184-4.727-4.073-4.871-4.26-.144-.187-1.174-1.563-1.174-2.982 0-1.419.744-2.118 1.008-2.407.264-.289.576-.361.768-.361.192 0 .384.009.552.017.177.008.414-.067.648.495.239.576.816 1.991.888 2.135.072.144.12.313.024.5-.096.187-.144.304-.288.472-.144.168-.304.374-.433.5-.144.144-.288.304-.12.6.168.296.744 1.227 1.596 1.986 1.092.973 2.016 1.274 2.304 1.418.288.144.456.12.624-.072.168-.192.72-.839.912-1.127.192-.288.384-.24.648-.144.264.096 1.68.792 1.968.936.288.144.48.216.552.336.072.12.072.697-.168 1.385z"/>
                </svg>
                <span>{getTranslation("buttons", "whatsapp")}</span>
              </a>

              {/* Contact Button */}
              <Link
                href="/contact"
                className="relative bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:from-red-700 hover:to-red-800 hover:scale-105 shadow-lg hover:shadow-xl"
              >
                {getTranslation("buttons", "contact")}
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              className={`lg:hidden p-2 rounded-lg transition-all duration-300 ${
                isDark
                  ? "text-gray-300 hover:bg-gray-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
              onClick={() => setIsMenuOpen(true)}
              aria-label={getTranslation("buttons", "menu")}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-[9998] transition-opacity duration-300 ${
          isMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={closeAllMenus}
      />

      {/* Mobile Menu */}
      <div
        className={`fixed top-0 right-0 w-80 h-full z-[9999] transform transition-transform duration-300 ${
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        } ${
          isDark ? "bg-gray-900" : "bg-white"
        } shadow-2xl`}
      >
        <div className="p-6">
          {/* Mobile Header */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-3">
              <Image src="/logo.png" alt="Logo" width={40} height={30} className="h-auto" />
              <span className={`font-bold text-lg ${isDark ? "text-white" : "text-gray-900"}`}>
                মেনু
              </span>
            </div>
            <button
              className={`p-2 rounded-lg ${
                isDark
                  ? "text-gray-300 hover:bg-gray-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
              onClick={closeAllMenus}
              aria-label={getTranslation("buttons", "close")}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Mobile Controls */}
          <div className="flex items-center justify-between mb-6 p-4 rounded-lg border">
            <button
              onClick={() => changeLanguage(language === 'bn' ? 'en' : 'bn')}
              className={`px-4 py-2 text-sm font-semibold rounded-lg border transition-all duration-300 ${
                isDark
                  ? "text-gray-300 border-gray-600 hover:bg-gray-700"
                  : "text-gray-700 border-gray-300 hover:bg-gray-100"
              }`}
            >
              {language === 'bn' ? 'English' : 'বাংলা'}
            </button>
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-all duration-300 ${
                isDark
                  ? "text-gray-300 hover:bg-gray-700"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
              title={getTranslation("theme", "toggle")}
            >
              {isDark ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
          </div>

          {/* Mobile Navigation */}
          <nav className="flex flex-col space-y-2 max-h-80 overflow-y-auto">
            {menuItems.map((item) => (
              <div key={item.href} className="border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                <div className="flex items-center justify-between">
                  <Link
                    href={item.href}
                    className={`flex-1 text-lg font-medium py-3 transition-colors ${
                      isDark
                        ? "text-gray-200 hover:text-white"
                        : "text-gray-800 hover:text-red-600"
                    }`}
                    onClick={closeAllMenus}
                  >
                    {getTranslation("navigation", item.key)}
                  </Link>
                  {item.dropdown && (
                    <button
                      onClick={() => setOpenMobileDropdown(
                        openMobileDropdown === item.href ? null : item.href
                      )}
                      className={`p-2 transition-colors ${
                        isDark
                          ? "text-gray-400 hover:text-white"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      <svg
                        className={`w-4 h-4 transition-transform ${
                          openMobileDropdown === item.href ? "rotate-180" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  )}
                </div>

                {/* Mobile Dropdown */}
                {item.dropdown && openMobileDropdown === item.href && (
                  <div className="ml-4 pb-3 space-y-2">
                    {item.dropdown.map((subItem) => (
                      <div key={subItem.href}>
                        <Link
                          href={subItem.href}
                          className={`block text-sm py-2 transition-colors ${
                            isDark
                              ? "text-gray-400 hover:text-white"
                              : "text-gray-600 hover:text-red-600"
                          }`}
                          onClick={closeAllMenus}
                        >
                          {getTranslation(item.key, subItem.key)}
                        </Link>
                        {subItem.submenu && (
                          <div className="ml-4 mt-1 space-y-1">
                            {subItem.submenu.map((subSubItem) => (
                              <Link
                                key={subSubItem.href}
                                href={subSubItem.href}
                                className={`block text-xs py-1 transition-colors ${
                                  isDark
                                    ? "text-gray-500 hover:text-gray-300"
                                    : "text-gray-500 hover:text-red-600"
                                }`}
                                onClick={closeAllMenus}
                              >
                                {getTranslation(item.key, subSubItem.key)}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Mobile Action Buttons */}
          <div className="mt-6 space-y-3">
            <a
              href="https://wa.me/+8801700000000"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg font-semibold text-center transition-all duration-300 hover:from-green-600 hover:to-green-700"
            >
              <div className="flex items-center justify-center space-x-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 2.006c-5.516 0-9.999 4.481-9.999 9.996 0 1.746.444 3.388 1.234 4.815L2.003 21.99l5.245-1.238c1.391.745 2.977 1.143 4.769 1.143 5.515 0 9.998-4.481 9.998-9.996S17.532 2.006 12.017 2.006zm5.818 14.186c-.244.687-1.213 1.266-1.973 1.43-.511.11-1.18.195-3.426-.731-2.871-1.184-4.727-4.073-4.871-4.26-.144-.187-1.174-1.563-1.174-2.982 0-1.419.744-2.118 1.008-2.407.264-.289.576-.361.768-.361.192 0 .384.009.552.017.177.008.414-.067.648.495.239.576.816 1.991.888 2.135.072.144.12.313.024.5-.096.187-.144.304-.288.472-.144.168-.304.374-.433.5-.144.144-.288.304-.12.6.168.296.744 1.227 1.596 1.986 1.092.973 2.016 1.274 2.304 1.418.288.144.456.12.624-.072.168-.192.72-.839.912-1.127.192-.288.384-.24.648-.144.264.096 1.68.792 1.968.936.288.144.48.216.552.336.072.12.072.697-.168 1.385z"/>
                </svg>
                <span>{getTranslation("buttons", "whatsapp")}</span>
              </div>
            </a>
            <Link
              href="/contact"
              className="block w-full bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-lg font-semibold text-center transition-all duration-300 hover:from-red-700 hover:to-red-800"
              onClick={closeAllMenus}
            >
              {getTranslation("buttons", "contact")}
            </Link>
          </div>
        </div>
      </div>

      {/* Spacer for sticky header */}
      {isSticky && <div className="h-20" />}
    </>
  );
}