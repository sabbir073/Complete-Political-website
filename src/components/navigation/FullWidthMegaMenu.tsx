'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { FaTimes } from 'react-icons/fa';
import { FaChevronDown } from 'react-icons/fa6';
import {
  mainNavItems,
  megaMenuCategories,
  getNavLabel,
  getNavDescription,
  MainNavItem,
  MegaMenuCategory,
  MegaMenuItem,
  MegaMenuSubCategory,
} from './NavigationConfig';

// BeforeInstallPromptEvent interface for TypeScript
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface FullWidthMegaMenuProps {
  language: 'en' | 'bn';
  isDark: boolean;
  deferredPrompt?: BeforeInstallPromptEvent | null;
  onInstallClick?: () => void;
}

export default function FullWidthMegaMenu({ language, isDark, deferredPrompt, onInstallClick }: FullWidthMegaMenuProps) {
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close mega menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMegaMenuOpen(false);
      }
    };

    if (isMegaMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMegaMenuOpen]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isMegaMenuOpen) {
        setIsMegaMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isMegaMenuOpen]);

  // Toggle mega menu on click
  const handleMegaMenuToggle = () => {
    setIsMegaMenuOpen(!isMegaMenuOpen);
  };

  const renderNavItem = (item: MainNavItem) => {
    const Icon = item.icon;

    // Direct link item
    if (!item.isMegaMenu) {
      return (
        <Link
          key={item.key}
          href={item.href}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
            isDark
              ? 'text-gray-200 hover:text-white hover:bg-gray-800'
              : 'text-gray-700 hover:text-green-600 hover:bg-gray-50'
          }`}
        >
          <Icon className="w-4 h-4" />
          <span>{getNavLabel(item, language)}</span>
        </Link>
      );
    }

    // Mega menu trigger - click to toggle
    return (
      <button
        key={item.key}
        onClick={handleMegaMenuToggle}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
          isMegaMenuOpen
            ? isDark
              ? 'text-white bg-gray-800'
              : 'text-green-600 bg-green-50'
            : isDark
            ? 'text-gray-200 hover:text-white hover:bg-gray-800'
            : 'text-gray-700 hover:text-green-600 hover:bg-gray-50'
        }`}
        aria-expanded={isMegaMenuOpen}
        aria-haspopup="menu"
      >
        <Icon className="w-4 h-4" />
        <span>{getNavLabel(item, language)}</span>
        <FaChevronDown
          className={`w-3 h-3 transition-transform duration-300 ${
            isMegaMenuOpen ? 'rotate-180' : ''
          }`}
        />
      </button>
    );
  };

  const renderMegaMenuItem = (item: MegaMenuItem) => {
    const Icon = item.icon;

    const itemContent = (
      <>
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors duration-200 ${
            isDark
              ? 'bg-gray-700 text-green-400 group-hover:bg-green-500/20'
              : 'bg-green-50 text-green-600 group-hover:bg-green-100'
          }`}
        >
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <span
            className={`text-[15px] font-semibold block leading-tight transition-colors duration-200 ${
              isDark
                ? 'text-gray-200 group-hover:text-white'
                : 'text-gray-800 group-hover:text-green-600'
            }`}
          >
            {getNavLabel(item, language)}
          </span>
          <span
            className={`text-[13px] leading-tight block mt-0.5 ${
              isDark ? 'text-gray-400' : 'text-gray-500'
            }`}
          >
            {getNavDescription(item, language)}
          </span>
        </div>
      </>
    );

    // Handle Install App action
    if (item.isInstallAction) {
      return (
        <button
          key={item.key}
          onClick={() => {
            setIsMegaMenuOpen(false);
            if (onInstallClick) {
              onInstallClick();
            }
          }}
          disabled={!deferredPrompt}
          className={`group flex items-start gap-3 p-3 rounded-xl transition-all duration-200 w-full text-left ${
            isDark
              ? 'hover:bg-gray-700/50'
              : 'hover:bg-gray-50'
          } ${!deferredPrompt ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {itemContent}
        </button>
      );
    }

    return (
      <Link
        key={item.key}
        href={item.href}
        onClick={() => setIsMegaMenuOpen(false)}
        className={`group flex items-start gap-3 p-3 rounded-xl transition-all duration-200 ${
          isDark
            ? 'hover:bg-gray-700/50'
            : 'hover:bg-gray-50'
        }`}
      >
        {itemContent}
      </Link>
    );
  };

  const renderSubCategory = (subCategory: MegaMenuSubCategory) => {
    return (
      <div key={subCategory.key} className="mt-8">
        {/* Same title styling as main categories */}
        <h3
          className={`text-sm font-bold uppercase tracking-wider px-3 py-2 border-b-2 ${
            isDark ? 'text-gray-300 border-gray-700' : 'text-gray-600 border-gray-200'
          }`}
        >
          {getNavLabel(subCategory, language)}
        </h3>
        <div className="space-y-1 mt-2">
          {subCategory.items.map(renderMegaMenuItem)}
        </div>
      </div>
    );
  };

  const renderMegaMenuCategory = (category: MegaMenuCategory) => {
    return (
      <div key={category.key}>
        {/* Main Category - only show title and items if items exist */}
        {category.items.length > 0 && (
          <div className="space-y-2">
            <h3
              className={`text-sm font-bold uppercase tracking-wider px-3 py-2 border-b-2 ${
                isDark ? 'text-gray-300 border-gray-700' : 'text-gray-600 border-gray-200'
              }`}
            >
              {getNavLabel(category, language)}
            </h3>
            <div className="space-y-1">
              {category.items.map(renderMegaMenuItem)}
            </div>
          </div>
        )}

        {/* Sub Categories (like Gallery under Participate) */}
        {category.subCategories?.map(renderSubCategory)}
      </div>
    );
  };

  return (
    <div ref={menuRef} className="relative">
      {/* Main Navigation */}
      <nav
        className="hidden lg:flex items-center gap-1"
        role="menubar"
        aria-label="Main navigation"
      >
        {mainNavItems.map(renderNavItem)}
      </nav>

      {/* Overlay for closing - rendered first so it's behind the menu */}
      {isMegaMenuOpen && (
        <div
          className="fixed inset-0 z-[9998] bg-black/20"
          onClick={() => setIsMegaMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Full Width Mega Menu Panel */}
      <div
        className={`fixed left-0 right-0 top-[72px] z-[9999] transition-all duration-300 ease-out ${
          isMegaMenuOpen
            ? 'opacity-100 visible translate-y-0'
            : 'opacity-0 invisible -translate-y-4 pointer-events-none'
        }`}
        role="menu"
        aria-label={language === 'bn' ? 'মেগা মেনু' : 'Mega menu'}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 ${
            isDark ? 'bg-gray-900/98' : 'bg-white/98'
          } backdrop-blur-md shadow-2xl border-t ${
            isDark ? 'border-gray-800' : 'border-gray-100'
          }`}
        />

        {/* Content Container */}
        <div className="relative max-w-[1400px] mx-auto px-10 py-8">
          {/* Close Button */}
          <button
            onClick={() => setIsMegaMenuOpen(false)}
            className={`absolute top-4 right-10 p-2.5 rounded-full transition-all duration-200 ${
              isDark
                ? 'text-gray-400 hover:text-white hover:bg-gray-800'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
            }`}
            aria-label={language === 'bn' ? 'বন্ধ করুন' : 'Close menu'}
          >
            <FaTimes className="w-5 h-5" />
          </button>

          {/* Categories Grid - 5 columns with good gap */}
          <div className="grid grid-cols-5 gap-10">
            {megaMenuCategories.map(renderMegaMenuCategory)}
          </div>
        </div>
      </div>
    </div>
  );
}
