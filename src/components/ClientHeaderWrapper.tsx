 
 
"use client";
import { useState, useEffect, ReactNode } from "react";
import { useTheme } from "../providers/ThemeProvider";
import { HeaderSettings } from "@/lib/getHeaderSettings";

interface ClientHeaderWrapperProps {
  children: ReactNode;
  settings: HeaderSettings;
}

export default function ClientHeaderWrapper({ children, settings }: ClientHeaderWrapperProps) {
  const [isSticky, setIsSticky] = useState(false);
  const { isDark } = useTheme();

  useEffect(() => {
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

  return (
    <>
      <div
        className={`border-b backdrop-blur-lg transition-all duration-500 ease-in-out z-[9999] ${
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
        {children}
      </div>
      
      {/* Spacer for fixed/sticky header */}
      {(isSticky || settings.header_position === 'fixed') && <div className="h-20" />}
    </>
  );
}