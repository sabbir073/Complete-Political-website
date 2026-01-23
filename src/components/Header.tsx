/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useLanguage } from "../providers/LanguageProvider";
import { useTheme } from "../providers/ThemeProvider";
import { useHeaderSettings } from "../hooks/useHeaderSettings";
import FullWidthMegaMenu from "./navigation/FullWidthMegaMenu";
import MobileMegaMenu from "./navigation/MobileMegaMenu";

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
  const [logoAltText, setLogoAltText] = useState('');
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isAppInstalled, setIsAppInstalled] = useState(false);
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

  // Handle PWA install prompt
  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsAppInstalled(true);
      }
      setDeferredPrompt(null);
    } catch (error) {
      console.error('Install prompt error:', error);
    }
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

            {/* Desktop Navigation - New Mega Menu */}
            <FullWidthMegaMenu
              language={language}
              isDark={isDark}
              deferredPrompt={deferredPrompt}
              onInstallClick={handleInstallClick}
            />

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
                  title={language === 'bn' ? 'থিম পরিবর্তন করুন' : 'Toggle theme'}
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

      {/* Mobile Menu - New Full Page Mega Menu */}
      <MobileMegaMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        language={language}
        isDark={isDark}
        logoSrc={isDark ? settings.header_logo_dark : settings.header_logo_light}
        logoAlt={logoAltText || 'Logo'}
        showWhatsAppButton={settings.header_show_whatsapp_button}
        whatsAppNumber={settings.whatsapp_phone_number}
        whatsAppButtonText={getText(settings.whatsapp_button_text)}
        showContactButton={settings.header_show_contact_button}
        contactButtonLink={settings.contact_button_link}
        contactButtonText={getText(settings.contact_button_text)}
        contactButtonBackground={settings.contact_button_background}
        deferredPrompt={deferredPrompt}
        onInstallClick={handleInstallClick}
      />

      {/* Spacer for fixed/sticky header */}
      {(isSticky || settings.header_position === 'fixed') && <div className="h-16 lg:h-20" />}
    </>
  );
}
