"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useTheme } from "@/providers/ThemeProvider";

const WelcomePopup: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const { isDark } = useTheme();

  useEffect(() => {
    // Check if popup has been shown in this session
    const hasSeenPopup = sessionStorage.getItem("welcomePopupSeen");

    if (!hasSeenPopup) {
      // Small delay for better UX
      const timer = setTimeout(() => {
        setIsOpen(true);
        setIsAnimating(true);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, []);

  const closePopup = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setIsOpen(false);
      sessionStorage.setItem("welcomePopupSeen", "true");
    }, 300);
  };

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") closePopup();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-[99999] flex items-center justify-center p-2 sm:p-4 md:p-8 transition-all duration-300 ${
        isAnimating ? "opacity-100" : "opacity-0"
      }`}
      onClick={closePopup}
    >
      {/* Backdrop with blur */}
      <div
        className={`absolute inset-0 transition-all duration-500 ${
          isAnimating ? "backdrop-blur-md" : "backdrop-blur-none"
        } ${isDark ? "bg-black/80" : "bg-black/70"}`}
      />

      {/* Animated particles/glow effect - hidden on small screens for performance */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none hidden sm:block">
        <div className="absolute top-1/4 left-1/4 w-48 md:w-96 h-48 md:h-96 bg-red-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-48 md:w-96 h-48 md:h-96 bg-green-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-gradient-to-r from-red-500/10 via-transparent to-green-500/10 rounded-full blur-3xl animate-spin-slow" />
      </div>

      {/* Popup Container - auto size based on image */}
      <div
        className={`relative transform transition-all duration-500 max-w-[95vw] sm:max-w-[90vw] ${
          isAnimating
            ? "scale-100 translate-y-0 opacity-100"
            : "scale-95 translate-y-8 opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glowing border effect */}
        <div className="absolute -inset-0.5 sm:-inset-1 bg-gradient-to-r from-red-600 via-green-500 to-red-600 rounded-xl sm:rounded-2xl blur-sm opacity-75 animate-gradient-x" />

        {/* Main content card */}
        <div
          className={`relative rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl ${
            isDark ? "bg-gray-900" : "bg-white"
          }`}
        >
          {/* Close Button */}
          <button
            onClick={closePopup}
            className={`absolute top-2 right-2 sm:top-3 sm:right-3 z-10 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 sm:hover:rotate-90 ${
              isDark
                ? "bg-gray-800/90 text-white hover:bg-red-600"
                : "bg-white/90 text-gray-900 hover:bg-red-600 hover:text-white"
            } shadow-lg backdrop-blur-sm`}
          >
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          {/* Image - responsive with max constraints using Next.js Image */}
          <div className="relative w-full" style={{ maxHeight: '85vh' }}>
            <Image
              src="/bnp-welcome.jpg"
              alt="Welcome - BNP"
              width={1200}
              height={800}
              className="w-full h-auto max-h-[75vh] sm:max-h-[80vh] md:max-h-[85vh] object-contain"
              priority
              unoptimized
            />
          </div>

          {/* Bottom bar with party colors */}
          <div className="h-1.5 sm:h-2 bg-gradient-to-r from-red-600 via-green-500 to-red-600 animate-gradient-x" />
        </div>

        {/* Decorative corner accents - smaller on mobile */}
        <div className="absolute -top-1.5 -left-1.5 sm:-top-2 sm:-left-2 w-5 h-5 sm:w-8 sm:h-8 border-t-2 sm:border-t-4 border-l-2 sm:border-l-4 border-red-500 rounded-tl-md sm:rounded-tl-lg" />
        <div className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 w-5 h-5 sm:w-8 sm:h-8 border-t-2 sm:border-t-4 border-r-2 sm:border-r-4 border-green-500 rounded-tr-md sm:rounded-tr-lg" />
        <div className="absolute -bottom-1.5 -left-1.5 sm:-bottom-2 sm:-left-2 w-5 h-5 sm:w-8 sm:h-8 border-b-2 sm:border-b-4 border-l-2 sm:border-l-4 border-green-500 rounded-bl-md sm:rounded-bl-lg" />
        <div className="absolute -bottom-1.5 -right-1.5 sm:-bottom-2 sm:-right-2 w-5 h-5 sm:w-8 sm:h-8 border-b-2 sm:border-b-4 border-r-2 sm:border-r-4 border-red-500 rounded-br-md sm:rounded-br-lg" />
      </div>

      {/* Click anywhere hint - hidden on mobile, shown on tablet+ */}
      <p className={`absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 text-xs sm:text-sm transition-all duration-500 hidden sm:block ${
        isAnimating ? "opacity-70 translate-y-0" : "opacity-0 translate-y-4"
      } ${isDark ? "text-gray-400" : "text-gray-300"}`}>
        Click anywhere or press ESC to close
      </p>

      {/* Tap to close hint - shown only on mobile */}
      <p className={`absolute bottom-3 left-1/2 -translate-x-1/2 text-xs transition-all duration-500 sm:hidden ${
        isAnimating ? "opacity-70 translate-y-0" : "opacity-0 translate-y-4"
      } ${isDark ? "text-gray-400" : "text-gray-300"}`}>
        Tap anywhere to close
      </p>
    </div>
  );
};

export default WelcomePopup;
