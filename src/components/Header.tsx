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
      { href: "/volunteer-hub", key: "volunteerHub" },
      {
        href: "#",
        key: "publicParticipation",
        submenu: [
          { href: "/polls", key: "pollsSurveys" },
          { href: "/ama", key: "askMeAnything" },
          { href: "/community-forum", key: "communityForum" },
        ],
      },
      {
        href: "#",
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
      { href: "/site-map", key: "siteMap" },
      { href: "#install", key: "installApp", isInstallAction: true },
    ],
  },
  { href: "/election-2026", key: "election2026" },
];

interface HeaderProps {
  initialSettings?: any;
}

// BeforeInstallPromptEvent interface for TypeScript
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function Header({ initialSettings }: HeaderProps = {}) {
  const [isSticky, setIsSticky] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const [mobileSubmenu, setMobileSubmenu] = useState<string | null>(null);
  const [mobileSubSubmenu, setMobileSubSubmenu] = useState<string | null>(null);
  const [logoAltText, setLogoAltText] = useState('');
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isAppInstalled, setIsAppInstalled] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const { language, changeLanguage, t } = useLanguage();
  const { theme, toggleTheme, isDark } = useTheme();
  const { settings, loading, error, getText } = useHeaderSettings(initialSettings);

  // Listen for the beforeinstallprompt event
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsAppInstalled(true);
      setDeferredPrompt(null);
    };

    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsAppInstalled(true);
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Handle install app click
  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Show the install prompt
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else if (isAppInstalled) {
      // App is already installed
      alert(language === 'bn' ? 'অ্যাপটি ইতিমধ্যে ইনস্টল করা আছে!' : 'App is already installed!');
    } else {
      // Fallback for browsers that don't support beforeinstallprompt (iOS Safari, Firefox)
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

      if (isIOS || isSafari) {
        alert(language === 'bn'
          ? 'ইনস্টল করতে: Share বাটনে ক্লিক করুন → "Add to Home Screen" নির্বাচন করুন'
          : 'To install: Tap the Share button → Select "Add to Home Screen"');
      } else {
        alert(language === 'bn'
          ? 'ইনস্টল করতে: ব্রাউজার মেনু থেকে "Install App" বা "Add to Home Screen" নির্বাচন করুন'
          : 'To install: Select "Install App" or "Add to Home Screen" from browser menu');
      }
    }
    closeAllMenus();
  };

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
    if (!settings) return;

    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const headerHeight = 250;
      setIsSticky(settings.header_position === 'sticky' && scrollPosition > headerHeight);
    };

    if (settings.header_position === 'sticky') {
      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    } else {
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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
        setOpenSubmenu(null);
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
    setOpenSubmenu(null);
    setMobileSubmenu(null);
    setMobileSubSubmenu(null);
  };

  // Show loading or fallback if settings are not available
  if (!settings) {
    return (
      <header className="public-header bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 relative shadow-sm z-[9999]">
        <div className="container mx-auto">
          <div className="flex justify-between items-center px-6 py-4">
            <Link href="/" className="flex-shrink-0">
              <Image src="/Logo-PNG.png" alt="Logo" width={90} height={60} className="h-auto max-h-14" priority />
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
          <div className="flex justify-between items-center px-4 lg:px-6 py-3 lg:py-4">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0 transition-transform duration-300 hover:scale-105">
              <Image
                src={isDark ? settings.header_logo_dark : settings.header_logo_light}
                alt={logoAltText || 'Header Logo'}
                width={settings.header_logo_width}
                height={settings.header_logo_height}
                className="h-auto max-h-12 lg:max-h-14"
                priority
              />
            </Link>

            {/* Desktop Navigation */}
            <nav ref={navRef} className="hidden lg:flex items-center space-x-1">
              {menuItems.map((item) => (
                <div
                  key={item.key}
                  className="relative group"
                  onMouseEnter={() => {
                    if (item.dropdown) {
                      setOpenDropdown(item.key);
                    }
                  }}
                  onMouseLeave={() => {
                    setOpenDropdown(null);
                    setOpenSubmenu(null);
                  }}
                >
                  {item.noLink ? (
                    <button
                      className={`text-base font-semibold px-4 py-2.5 rounded-lg transition-all duration-300 flex items-center whitespace-nowrap cursor-pointer ${
                        openDropdown === item.key
                          ? isDark
                            ? "text-white bg-gray-800"
                            : "text-red-600 bg-red-50"
                          : isDark
                          ? "text-gray-200 hover:text-white hover:bg-gray-800"
                          : "text-gray-700 hover:text-red-600 hover:bg-gray-50"
                      }`}
                    >
                      {getTranslation("navigation", item.key)}
                      {item.dropdown && (
                        <svg
                          className={`ml-1.5 w-4 h-4 transition-transform duration-300 ${
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
                      className={`text-base font-semibold px-4 py-2.5 rounded-lg transition-all duration-300 flex items-center whitespace-nowrap ${
                        isDark
                          ? "text-gray-200 hover:text-white hover:bg-gray-800"
                          : "text-gray-700 hover:text-red-600 hover:bg-gray-50"
                      }`}
                    >
                      {getTranslation("navigation", item.key)}
                    </Link>
                  )}

                  {/* Desktop Mega Menu Dropdown */}
                  {item.dropdown && openDropdown === item.key && (
                    <div
                      className={`absolute top-full left-0 pt-1 min-w-[280px] z-[99999]`}
                    >
                      <div className={`rounded-xl shadow-2xl border overflow-visible ${
                        isDark
                          ? "bg-gray-900 border-gray-700"
                          : "bg-white border-gray-200"
                      }`}>
                        <div className="py-2">
                          {item.dropdown.map((subItem: any) => (
                            <div
                              key={subItem.key}
                              className="relative group/sub"
                              onMouseEnter={() => subItem.submenu && setOpenSubmenu(subItem.key)}
                            >
                              {subItem.isInstallAction ? (
                                <button
                                  onClick={handleInstallClick}
                                  className={`w-full flex items-center justify-between px-5 py-3 text-[15px] font-medium transition-all duration-200 ${
                                    isDark
                                      ? "text-gray-300 hover:text-white hover:bg-gray-800"
                                      : "text-gray-700 hover:text-red-600 hover:bg-gray-50"
                                  }`}
                                >
                                  <span className="flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                    {getTranslation(item.key, subItem.key)}
                                  </span>
                                </button>
                              ) : (
                              <Link
                                href={subItem.href}
                                className={`flex items-center justify-between px-5 py-3 text-[15px] font-medium transition-all duration-200 ${
                                  openSubmenu === subItem.key
                                    ? isDark
                                      ? "text-white bg-gray-800"
                                      : "text-red-600 bg-red-50"
                                    : isDark
                                    ? "text-gray-300 hover:text-white hover:bg-gray-800"
                                    : "text-gray-700 hover:text-red-600 hover:bg-gray-50"
                                }`}
                              >
                                <span>{getTranslation(item.key, subItem.key)}</span>
                                {subItem.submenu && (
                                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                  </svg>
                                )}
                              </Link>
                              )}

                              {/* Desktop Sub-submenu - CSS hover based */}
                              {subItem.submenu && (
                                <div
                                  className={`absolute left-full top-0 pl-1 min-w-[240px] z-[999999] ${
                                    openSubmenu === subItem.key ? 'block' : 'hidden'
                                  } group-hover/sub:block`}
                                >
                                  <div className={`rounded-xl shadow-2xl border overflow-hidden ${
                                    isDark
                                      ? "bg-gray-900 border-gray-700"
                                      : "bg-white border-gray-200"
                                  }`}>
                                    <div className="py-2">
                                      {subItem.submenu.map((subSubItem: any) => (
                                        <Link
                                          key={subSubItem.key}
                                          href={subSubItem.href}
                                          className={`block px-5 py-2.5 text-[14px] font-medium transition-all duration-200 ${
                                            isDark
                                              ? "text-gray-300 hover:text-white hover:bg-gray-800"
                                              : "text-gray-600 hover:text-red-600 hover:bg-red-50"
                                          }`}
                                        >
                                          {getTranslation(item.key, subSubItem.key)}
                                        </Link>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </nav>

            {/* Desktop Controls */}
            <div className="hidden lg:flex items-center space-x-3">
              {/* Language Toggle */}
              {settings.header_show_language_toggle && (
                <button
                  onClick={() => changeLanguage(language === 'bn' ? 'en' : 'bn')}
                  className={`px-3.5 py-2 text-sm font-semibold rounded-lg border transition-all duration-300 ${
                    isDark
                      ? "text-gray-300 border-gray-600 hover:bg-gray-700 hover:text-white"
                      : "text-gray-700 border-gray-300 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  {language === 'bn' ? 'EN' : 'বাং'}
                </button>
              )}

              {/* Theme Toggle */}
              {settings.header_show_theme_toggle && (
                <button
                  onClick={toggleTheme}
                  className={`p-2.5 rounded-lg transition-all duration-300 ${
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
                  className="bg-gradient-to-r from-green-500 to-green-600 text-white px-5 py-2.5 rounded-lg font-semibold text-sm transition-all duration-300 hover:from-green-600 hover:to-green-700 hover:scale-105 shadow-lg hover:shadow-xl flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 2.006c-5.516 0-9.999 4.481-9.999 9.996 0 1.746.444 3.388 1.234 4.815L2.003 21.99l5.245-1.238c1.391.745 2.977 1.143 4.769 1.143 5.515 0 9.998-4.481 9.998-9.996S17.532 2.006 12.017 2.006zm5.818 14.186c-.244.687-1.213 1.266-1.973 1.43-.511.11-1.18.195-3.426-.731-2.871-1.184-4.727-4.073-4.871-4.26-.144-.187-1.174-1.563-1.174-2.982 0-1.419.744-2.118 1.008-2.407.264-.289.576-.361.768-.361.192 0 .384.009.552.017.177.008.414-.067.648.495.239.576.816 1.991.888 2.135.072.144.12.313.024.5-.096.187-.144.304-.288.472-.144.168-.304.374-.433.5-.144.144-.288.304-.12.6.168.296.744 1.227 1.596 1.986 1.092.973 2.016 1.274 2.304 1.418.288.144.456.12.624-.072.168-.192.72-.839.912-1.127.192-.288.384-.24.648-.144.264.096 1.68.792 1.968.936.288.144.48.216.552.336.072.12.072.697-.168 1.385z"/>
                  </svg>
                  <span>{getText(settings.whatsapp_button_text)}</span>
                </a>
              )}

              {/* Contact Button */}
              {settings.header_show_contact_button && (
                <Link
                  href={settings.contact_button_link}
                  className={`bg-gradient-to-r ${settings.contact_button_background} text-white px-5 py-2.5 rounded-lg font-semibold text-sm transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl`}
                >
                  {getText(settings.contact_button_text)}
                </Link>
              )}
            </div>

            {/* Mobile Controls - Outside hamburger */}
            <div className="flex lg:hidden items-center space-x-2">
              {/* Mobile Language Toggle */}
              {settings.header_show_language_toggle && (
                <button
                  onClick={() => changeLanguage(language === 'bn' ? 'en' : 'bn')}
                  className={`px-2.5 py-1.5 text-xs font-bold rounded-md border transition-all duration-300 ${
                    isDark
                      ? "text-gray-300 border-gray-600 hover:bg-gray-700"
                      : "text-gray-700 border-gray-300 hover:bg-gray-100"
                  }`}
                >
                  {language === 'bn' ? 'EN' : 'বাং'}
                </button>
              )}

              {/* Mobile Theme Toggle */}
              {settings.header_show_theme_toggle && (
                <button
                  onClick={toggleTheme}
                  className={`p-2 rounded-lg transition-all duration-300 ${
                    isDark
                      ? "text-gray-300 hover:bg-gray-700"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
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

              {/* Mobile Menu Button */}
              <button
                className={`p-2 rounded-lg transition-all duration-300 ${
                  isDark
                    ? "text-gray-300 hover:bg-gray-700"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                onClick={() => setIsMenuOpen(true)}
                aria-label="Open menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[99998] transition-all duration-300 lg:hidden ${
          isMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={closeAllMenus}
      />

      {/* Mobile Menu - App Style Slide-in */}
      <div
        className={`fixed top-0 right-0 w-full max-w-[320px] h-full z-[99999] transform transition-transform duration-300 ease-out lg:hidden ${
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        } ${isDark ? "bg-gray-900" : "bg-white"}`}
      >
        {/* Mobile Menu Header */}
        <div className={`flex items-center justify-between px-5 py-4 border-b ${
          isDark ? "border-gray-800" : "border-gray-100"
        }`}>
          <div className="flex items-center space-x-3">
            <Image
              src={isDark ? settings.header_logo_dark : settings.header_logo_light}
              alt={logoAltText || 'Logo'}
              width={36}
              height={28}
              className="h-auto"
            />
            <span className={`font-bold text-lg ${isDark ? "text-white" : "text-gray-900"}`}>
              {language === 'bn' ? 'মেনু' : 'Menu'}
            </span>
          </div>
          <button
            className={`p-2 rounded-full transition-all duration-300 ${
              isDark
                ? "text-gray-400 hover:text-white hover:bg-gray-800"
                : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
            }`}
            onClick={closeAllMenus}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Mobile Menu Content */}
        <div className="h-[calc(100%-140px)] overflow-y-auto">
          <nav className="py-2">
            {menuItems.map((item) => (
              <div key={item.key}>
                {/* Main Menu Item */}
                <div className={`border-b ${isDark ? "border-gray-800" : "border-gray-50"}`}>
                  {item.dropdown ? (
                    <button
                      onClick={() => setMobileSubmenu(mobileSubmenu === item.key ? null : item.key)}
                      className={`w-full flex items-center justify-between px-5 py-4 text-[16px] font-semibold transition-all duration-200 ${
                        mobileSubmenu === item.key
                          ? isDark
                            ? "text-white bg-gray-800"
                            : "text-red-600 bg-red-50"
                          : isDark
                          ? "text-gray-200 hover:bg-gray-800"
                          : "text-gray-800 hover:bg-gray-50"
                      }`}
                    >
                      <span>{getTranslation("navigation", item.key)}</span>
                      <svg
                        className={`w-5 h-5 transition-transform duration-300 ${
                          mobileSubmenu === item.key ? "rotate-180" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  ) : (
                    <Link
                      href={item.href}
                      className={`block px-5 py-4 text-[16px] font-semibold transition-all duration-200 ${
                        isDark
                          ? "text-gray-200 hover:text-white hover:bg-gray-800"
                          : "text-gray-800 hover:text-red-600 hover:bg-gray-50"
                      }`}
                      onClick={closeAllMenus}
                    >
                      {getTranslation("navigation", item.key)}
                    </Link>
                  )}
                </div>

                {/* Submenu */}
                {item.dropdown && mobileSubmenu === item.key && (
                  <div className={`${isDark ? "bg-gray-800/50" : "bg-gray-50"}`}>
                    {item.dropdown.map((subItem) => (
                      <div key={subItem.key}>
                        {subItem.submenu ? (
                          <>
                            <button
                              onClick={() => setMobileSubSubmenu(
                                mobileSubSubmenu === subItem.key ? null : subItem.key
                              )}
                              className={`w-full flex items-center justify-between pl-8 pr-5 py-3.5 text-[15px] font-medium transition-all duration-200 ${
                                mobileSubSubmenu === subItem.key
                                  ? isDark
                                    ? "text-white bg-gray-700"
                                    : "text-red-600 bg-red-100"
                                  : isDark
                                  ? "text-gray-300 hover:text-white hover:bg-gray-700"
                                  : "text-gray-700 hover:text-red-600 hover:bg-gray-100"
                              }`}
                            >
                              <span>{getTranslation(item.key, subItem.key)}</span>
                              <svg
                                className={`w-4 h-4 transition-transform duration-300 ${
                                  mobileSubSubmenu === subItem.key ? "rotate-180" : ""
                                }`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>

                            {/* Sub-submenu */}
                            {mobileSubSubmenu === subItem.key && (
                              <div className={`${isDark ? "bg-gray-900/50" : "bg-white"}`}>
                                {subItem.submenu.map((subSubItem: any) => (
                                  <Link
                                    key={subSubItem.key}
                                    href={subSubItem.href}
                                    className={`block pl-12 pr-5 py-3 text-[14px] font-medium transition-all duration-200 ${
                                      isDark
                                        ? "text-gray-400 hover:text-white hover:bg-gray-800"
                                        : "text-gray-600 hover:text-red-600 hover:bg-red-50"
                                    }`}
                                    onClick={closeAllMenus}
                                  >
                                    {getTranslation(item.key, subSubItem.key)}
                                  </Link>
                                ))}
                              </div>
                            )}
                          </>
                        ) : subItem.isInstallAction ? (
                          <button
                            onClick={handleInstallClick}
                            className={`w-full text-left flex items-center gap-2 pl-8 pr-5 py-3.5 text-[15px] font-medium transition-all duration-200 ${
                              isDark
                                ? "text-gray-300 hover:text-white hover:bg-gray-700"
                                : "text-gray-700 hover:text-red-600 hover:bg-gray-100"
                            }`}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            {getTranslation(item.key, subItem.key)}
                          </button>
                        ) : (
                          <Link
                            href={subItem.href}
                            className={`block pl-8 pr-5 py-3.5 text-[15px] font-medium transition-all duration-200 ${
                              isDark
                                ? "text-gray-300 hover:text-white hover:bg-gray-700"
                                : "text-gray-700 hover:text-red-600 hover:bg-gray-100"
                            }`}
                            onClick={closeAllMenus}
                          >
                            {getTranslation(item.key, subItem.key)}
                          </Link>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>

        {/* Mobile Menu Footer - Action Buttons */}
        <div className={`absolute bottom-0 left-0 right-0 p-4 border-t ${
          isDark ? "border-gray-800 bg-gray-900" : "border-gray-100 bg-white"
        }`}>
          <div className="space-y-3">
            {settings.header_show_whatsapp_button && (
              <a
                href={`https://wa.me/${settings.whatsapp_phone_number.replace(/[^\d+]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center space-x-2 w-full bg-gradient-to-r from-green-500 to-green-600 text-white px-5 py-3 rounded-xl font-semibold text-[15px] transition-all duration-300 hover:from-green-600 hover:to-green-700 shadow-lg"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 2.006c-5.516 0-9.999 4.481-9.999 9.996 0 1.746.444 3.388 1.234 4.815L2.003 21.99l5.245-1.238c1.391.745 2.977 1.143 4.769 1.143 5.515 0 9.998-4.481 9.998-9.996S17.532 2.006 12.017 2.006zm5.818 14.186c-.244.687-1.213 1.266-1.973 1.43-.511.11-1.18.195-3.426-.731-2.871-1.184-4.727-4.073-4.871-4.26-.144-.187-1.174-1.563-1.174-2.982 0-1.419.744-2.118 1.008-2.407.264-.289.576-.361.768-.361.192 0 .384.009.552.017.177.008.414-.067.648.495.239.576.816 1.991.888 2.135.072.144.12.313.024.5-.096.187-.144.304-.288.472-.144.168-.304.374-.433.5-.144.144-.288.304-.12.6.168.296.744 1.227 1.596 1.986 1.092.973 2.016 1.274 2.304 1.418.288.144.456.12.624-.072.168-.192.72-.839.912-1.127.192-.288.384-.24.648-.144.264.096 1.68.792 1.968.936.288.144.48.216.552.336.072.12.072.697-.168 1.385z"/>
                </svg>
                <span>{getText(settings.whatsapp_button_text)}</span>
              </a>
            )}
            {settings.header_show_contact_button && (
              <Link
                href={settings.contact_button_link}
                className={`block w-full text-center bg-gradient-to-r ${settings.contact_button_background} text-white px-5 py-3 rounded-xl font-semibold text-[15px] transition-all duration-300 shadow-lg`}
                onClick={closeAllMenus}
              >
                {getText(settings.contact_button_text)}
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Spacer for fixed/sticky header */}
      {(isSticky || settings.header_position === 'fixed') && <div className="h-16 lg:h-20" />}
    </>
  );
}
