/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useLanguage } from "../providers/LanguageProvider";
import { useTheme } from "../providers/ThemeProvider";
import { useHeaderSettings } from "../hooks/useHeaderSettings";

const menuItems = [
  { href: "/", key: "home" },
  { href: "/about", key: "about" },
  {
    href: "#",
    key: "activities",
    noLink: true,
    dropdown: [
      {
        href: "/events",
        key: "events",
        submenu: [
          { href: "/events/upcoming", key: "upcomingEvents" },
          { href: "/events/archive", key: "pastEvents" },
          { href: "/events/calendar", key: "meetingCalendar" },
          { href: "/events/town-hall", key: "virtualTownHall" },
        ],
      },
      {
        href: "/news",
        key: "news",
        submenu: [
          { href: "/news/category/latest-news", key: "latestNews" },
          { href: "/news/category/press-releases", key: "pressReleases" },
          { href: "/news/category/announcements", key: "announcements" },
          { href: "/news/category/media-coverage", key: "mediaCoverage" },
          { href: "/news/category/interviews", key: "interviews" },
        ],
      },
      { href: "/gallery/photos", key: "photoGallery" },
      { href: "/gallery/videos", key: "videoStories" },
      { href: "/leadership", key: "leadership" },
    ],
  },
  {
    href: "#",
    key: "services",
    noLink: true,
    dropdown: [
      {
        href: "/contact",
        key: "contactComplaints",
        submenu: [
          { href: "/contact", key: "contactUs" },
          { href: "/complaints", key: "complaintBox" },
          { href: "/area-problems", key: "areaProblems" },
          { href: "/emergency/contacts", key: "emergencyContacts" },
          { href: "/emergency/sos", key: "emergencySOS" },
          { href: "/emergency/safety", key: "safetyResources" },
        ],
      },
      { href: "/blood-hub", key: "bloodHub" },
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
    href: "#",
    key: "more",
    noLink: true,
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

interface HeaderProps {
  initialSettings?: any;
}

export default function Header({ initialSettings }: HeaderProps = {}) {
  const [isSticky, setIsSticky] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [openMobileDropdown, setOpenMobileDropdown] = useState<string | null>(null);
  const [logoAltText, setLogoAltText] = useState('');
  const navRef = useRef<HTMLElement>(null);
  const { language, changeLanguage, t } = useLanguage();
  const { theme, toggleTheme, isDark } = useTheme();
  const { settings, loading, error, getText } = useHeaderSettings(initialSettings);

  // Fetch alt text from media library
  useEffect(() => {
    const fetchLogoAltText = async () => {
      const logoSrc = isDark ? settings?.header_logo_dark : settings?.header_logo_light;
      if (!logoSrc) return;
      
      try {
        const response = await fetch(`/api/media/alt-text?url=${encodeURIComponent(logoSrc)}`);
        const data = await response.json();
        
        if (data.success && data.alt_text) {
          setLogoAltText(data.alt_text);
        } else {
          setLogoAltText('Header Logo');
        }
      } catch (error) {
        console.error('Error fetching logo alt text:', error);
        setLogoAltText('Header Logo');
      }
    };

    fetchLogoAltText();
  }, [settings?.header_logo_light, settings?.header_logo_dark, isDark]);

  useEffect(() => {
    // Safety check for settings
    if (!settings) return;
    
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const headerHeight = 250;
      // Only make sticky if header position is set to sticky
      setIsSticky(settings.header_position === 'sticky' && scrollPosition > headerHeight);
    };

    if (settings.header_position === 'sticky') {
      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    } else {
      // For non-sticky positions, ensure isSticky is false
      setIsSticky(false);
    }
  }, [settings]);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
  }, [isMenuOpen]);

  // Close dropdown when clicking outside (for noLink items with click-to-toggle)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };

    if (openDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openDropdown]);

  const getTranslation = (section: string, key: string) => {
    return (t as any)[section]?.[key] || key;
  };

  const closeAllMenus = () => {
    setIsMenuOpen(false);
    setOpenDropdown(null);
    setOpenMobileDropdown(null);
  };

  // Show loading or fallback if settings are not available
  if (!settings) {
    return (
      <header className="public-header bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 relative shadow-sm z-[9999]">
        <div className="container mx-auto">
          <div className="flex justify-between items-center px-6 py-4">
            <Link href="/" className="flex-shrink-0">
              <Image src="/logo.png" alt="Logo" width={90} height={60} className="h-auto max-h-14" priority />
            </Link>
            <div className="text-sm text-gray-500 dark:text-gray-400">Loading...</div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <>
      <header
        className={`public-header border-b backdrop-blur-lg transition-all duration-500 ease-in-out z-[9999] ${
          settings.header_position === 'fixed' 
            ? "fixed top-0 left-0 right-0 shadow-lg"
            : isSticky 
            ? "fixed top-0 left-0 right-0 shadow-lg animate-fadeInDown" 
            : settings.header_position === 'static'
            ? "static shadow-sm"
            : "relative shadow-sm"
        }`}
        style={{
          backgroundColor: isDark ? settings.header_background_dark : settings.header_background_light,
          borderColor: isDark ? "#374151" : "#e5e7eb"
        }}
      >
        <div className="container mx-auto">
          <div className="flex justify-between items-center px-6 py-4">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0 transition-transform duration-300 hover:scale-105">
              <Image 
                src={isDark ? settings.header_logo_dark : settings.header_logo_light} 
                alt={logoAltText || 'Header Logo'} 
                width={settings.header_logo_width} 
                height={settings.header_logo_height} 
                className="h-auto max-h-14" 
                priority
              />
            </Link>

            {/* Desktop Navigation */}
            <nav ref={navRef} className="hidden lg:flex items-center space-x-4">
              {menuItems.map((item) => (
                <div
                  key={item.key}
                  className="relative group"
                  onMouseEnter={() => !item.noLink && item.dropdown && setOpenDropdown(item.key)}
                  onMouseLeave={() => !item.noLink && setOpenDropdown(null)}
                >
                  {item.noLink ? (
                    <button
                      onClick={() => item.dropdown && setOpenDropdown(openDropdown === item.key ? null : item.key)}
                      className={`text-base font-semibold px-4 py-2 rounded-lg transition-all duration-300 flex items-center whitespace-nowrap cursor-pointer ${
                        isDark
                          ? "text-gray-200 hover:text-white hover:bg-gray-800"
                          : "text-gray-700 hover:text-red-600 hover:bg-gray-50"
                      }`}
                    >
                      {getTranslation("navigation", item.key)}
                      {item.dropdown && (
                        <svg
                          className={`ml-2 w-4 h-4 transition-transform duration-300 ${
                            openDropdown === item.key ? "rotate-180" : ""
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      )}
                    </button>
                  ) : (
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
                            openDropdown === item.key ? "rotate-180" : ""
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      )}
                    </Link>
                  )}

                  {/* Dropdown Menu */}
                  {item.dropdown && openDropdown === item.key && (
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
              {settings.header_show_language_toggle && (
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
              )}

              {/* Theme Toggle */}
              {settings.header_show_theme_toggle && (
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
              )}

              {/* WhatsApp Button */}
              {settings.header_show_whatsapp_button && (
                <a
                  href={`https://wa.me/${settings.whatsapp_phone_number.replace(/[^\d+]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:from-green-600 hover:to-green-700 hover:scale-105 shadow-lg hover:shadow-xl flex items-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 2.006c-5.516 0-9.999 4.481-9.999 9.996 0 1.746.444 3.388 1.234 4.815L2.003 21.99l5.245-1.238c1.391.745 2.977 1.143 4.769 1.143 5.515 0 9.998-4.481 9.998-9.996S17.532 2.006 12.017 2.006zm5.818 14.186c-.244.687-1.213 1.266-1.973 1.43-.511.11-1.18.195-3.426-.731-2.871-1.184-4.727-4.073-4.871-4.26-.144-.187-1.174-1.563-1.174-2.982 0-1.419.744-2.118 1.008-2.407.264-.289.576-.361.768-.361.192 0 .384.009.552.017.177.008.414-.067.648.495.239.576.816 1.991.888 2.135.072.144.12.313.024.5-.096.187-.144.304-.288.472-.144.168-.304.374-.433.5-.144.144-.288.304-.12.6.168.296.744 1.227 1.596 1.986 1.092.973 2.016 1.274 2.304 1.418.288.144.456.12.624-.072.168-.192.72-.839.912-1.127.192-.288.384-.24.648-.144.264.096 1.68.792 1.968.936.288.144.48.216.552.336.072.12.072.697-.168 1.385z"/>
                  </svg>
                  <span>{getText(settings.whatsapp_button_text)}</span>
                </a>
              )}

              {/* Contact Button */}
              {settings.header_show_contact_button && (
                <Link
                  href={settings.contact_button_link}
                  className={`relative bg-gradient-to-r ${settings.contact_button_background} text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:${settings.contact_button_hover_background} hover:scale-105 shadow-lg hover:shadow-xl`}
                >
                  {getText(settings.contact_button_text)}
                </Link>
              )}
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
              <Image 
                src={isDark ? settings.header_logo_dark : settings.header_logo_light} 
                alt={logoAltText || 'Header Logo'} 
                width={40} 
                height={30} 
                className="h-auto" 
              />
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
          {(settings.header_show_language_toggle || settings.header_show_theme_toggle) && (
            <div className="flex items-center justify-between mb-6 p-4 rounded-lg border">
              {settings.header_show_language_toggle && (
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
              )}
              {settings.header_show_theme_toggle && (
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
              )}
            </div>
          )}

          {/* Mobile Navigation */}
          <nav className="flex flex-col space-y-2 max-h-80 overflow-y-auto">
            {menuItems.map((item) => (
              <div key={item.key} className="border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                <div className="flex items-center justify-between">
                  {item.noLink ? (
                    <button
                      onClick={() => item.dropdown && setOpenMobileDropdown(
                        openMobileDropdown === item.key ? null : item.key
                      )}
                      className={`flex-1 text-lg font-medium py-3 text-left flex items-center justify-between ${
                        isDark
                          ? "text-gray-200"
                          : "text-gray-800"
                      }`}
                    >
                      <span>{getTranslation("navigation", item.key)}</span>
                      {item.dropdown && (
                        <svg
                          className={`w-4 h-4 transition-transform ${
                            openMobileDropdown === item.key ? "rotate-180" : ""
                          } ${isDark ? "text-gray-400" : "text-gray-500"}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      )}
                    </button>
                  ) : (
                    <>
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
                            openMobileDropdown === item.key ? null : item.key
                          )}
                          className={`p-2 transition-colors ${
                            isDark
                              ? "text-gray-400 hover:text-white"
                              : "text-gray-500 hover:text-gray-700"
                          }`}
                        >
                          <svg
                            className={`w-4 h-4 transition-transform ${
                              openMobileDropdown === item.key ? "rotate-180" : ""
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      )}
                    </>
                  )}
                </div>

                {/* Mobile Dropdown */}
                {item.dropdown && openMobileDropdown === item.key && (
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
          {(settings.header_show_whatsapp_button || settings.header_show_contact_button) && (
            <div className="mt-6 space-y-3">
              {settings.header_show_whatsapp_button && (
                <a
                  href={`https://wa.me/${settings.whatsapp_phone_number.replace(/[^\d+]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg font-semibold text-center transition-all duration-300 hover:from-green-600 hover:to-green-700"
                >
                  <div className="flex items-center justify-center space-x-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.017 2.006c-5.516 0-9.999 4.481-9.999 9.996 0 1.746.444 3.388 1.234 4.815L2.003 21.99l5.245-1.238c1.391.745 2.977 1.143 4.769 1.143 5.515 0 9.998-4.481 9.998-9.996S17.532 2.006 12.017 2.006zm5.818 14.186c-.244.687-1.213 1.266-1.973 1.43-.511.11-1.18.195-3.426-.731-2.871-1.184-4.727-4.073-4.871-4.26-.144-.187-1.174-1.563-1.174-2.982 0-1.419.744-2.118 1.008-2.407.264-.289.576-.361.768-.361.192 0 .384.009.552.017.177.008.414-.067.648.495.239.576.816 1.991.888 2.135.072.144.12.313.024.5-.096.187-.144.304-.288.472-.144.168-.304.374-.433.5-.144.144-.288.304-.12.6.168.296.744 1.227 1.596 1.986 1.092.973 2.016 1.274 2.304 1.418.288.144.456.12.624-.072.168-.192.72-.839.912-1.127.192-.288.384-.24.648-.144.264.096 1.68.792 1.968.936.288.144.48.216.552.336.072.12.072.697-.168 1.385z"/>
                    </svg>
                    <span>{getText(settings.whatsapp_button_text)}</span>
                  </div>
                </a>
              )}
              {settings.header_show_contact_button && (
                <Link
                  href={settings.contact_button_link}
                  className={`block w-full bg-gradient-to-r ${settings.contact_button_background} text-white px-6 py-3 rounded-lg font-semibold text-center transition-all duration-300 hover:${settings.contact_button_hover_background}`}
                  onClick={closeAllMenus}
                >
                  {getText(settings.contact_button_text)}
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Spacer for fixed/sticky header */}
      {(isSticky || settings.header_position === 'fixed') && <div className="h-20" />}
    </>
  );
}