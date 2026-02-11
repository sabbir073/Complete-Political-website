"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "@/providers/ThemeProvider";
import { FaLocationDot, FaArrowRight } from "react-icons/fa6";

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

  const handleButtonClick = () => {
    window.open("https://smjahangir.com/find-voter", "_blank");
    closePopup();
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
      className={`fixed inset-0 z-[99999] flex items-center justify-center p-4 transition-all duration-300 ${isAnimating ? "opacity-100" : "opacity-0"
        }`}
      onClick={closePopup}
    >
      {/* Simple dark backdrop */}
      <div
        className={`absolute inset-0 transition-opacity duration-300 ${isDark ? "bg-black/70" : "bg-black/60"
          }`}
      />

      {/* Popup Container */}
      <div
        className={`relative transform transition-all duration-300 w-full max-w-md ${isAnimating
          ? "scale-100 translate-y-0 opacity-100"
          : "scale-95 translate-y-4 opacity-0"
          }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Main content card */}
        <div
          className={`relative rounded-2xl overflow-hidden shadow-xl ${isDark ? "bg-gray-800" : "bg-white"
            }`}
        >
          {/* Close Button */}
          <button
            onClick={closePopup}
            className={`absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-200 ${isDark
              ? "bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white"
              : "bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700"
              }`}
          >
            <svg
              className="w-5 h-5"
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

          {/* Header with icon */}
          <div className={`pt-8 pb-4 px-6 text-center ${isDark ? "bg-gray-800" : "bg-white"}`}>
            {/* Icon */}
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${isDark ? "bg-green-600/20" : "bg-green-100"
              }`}>
              <FaLocationDot className={`w-8 h-8 ${isDark ? "text-green-400" : "text-green-600"}`} />
            </div>

            {/* Main Question */}
            <h2 className={`text-2xl font-bold mb-2 ${isDark ? "text-white" : "text-gray-900"
              }`}>
              আপনার ভোট কেন্দ্র খুঁজছেন?
            </h2>

            {/* Subtitle */}
            <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"
              }`}>
              সহজেই আপনার ভোট কেন্দ্রের তথ্য জানুন
            </p>
          </div>

          {/* Content Section */}
          <div className={`px-6 pb-6 text-center ${isDark ? "bg-gray-800" : "bg-white"}`}>
            {/* CTA Button */}
            <button
              onClick={handleButtonClick}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold text-base rounded-lg transition-colors duration-200"
            >
              ভোট কেন্দ্র খুঁজুন
              <FaArrowRight className="w-4 h-4" />
            </button>

            {/* Dhaka-18 Badge */}
            <p className={`mt-4 text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>
              ঢাকা-১৮ আসন
            </p>
          </div>

          {/* Bottom accent bar */}
          <div className="h-1 bg-gradient-to-r from-red-500 via-green-500 to-red-500" />
        </div>
      </div>
    </div>
  );
};

export default WelcomePopup;
