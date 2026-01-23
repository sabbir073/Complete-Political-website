'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
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

// Helper function to flatten categories for mobile (subCategories become separate categories)
const getMobileMegaMenuCategories = (): (MegaMenuCategory | MegaMenuSubCategory)[] => {
  const flattenedCategories: (MegaMenuCategory | MegaMenuSubCategory)[] = [];

  megaMenuCategories.forEach((category) => {
    // Add the main category (without subCategories in the object we push)
    flattenedCategories.push({
      key: category.key,
      labelEn: category.labelEn,
      labelBn: category.labelBn,
      items: category.items,
    });

    // Add subCategories as separate categories
    if (category.subCategories) {
      category.subCategories.forEach((subCategory) => {
        flattenedCategories.push(subCategory);
      });
    }
  });

  return flattenedCategories;
};

interface MobileMegaMenuProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'en' | 'bn';
  isDark: boolean;
  logoSrc: string;
  logoAlt: string;
  showWhatsAppButton?: boolean;
  whatsAppNumber?: string;
  whatsAppButtonText?: string;
  showContactButton?: boolean;
  contactButtonLink?: string;
  contactButtonText?: string;
  contactButtonBackground?: string;
}

export default function MobileMegaMenu({
  isOpen,
  onClose,
  language,
  isDark,
  logoSrc,
  logoAlt,
  showWhatsAppButton,
  whatsAppNumber,
  whatsAppButtonText,
  showContactButton,
  contactButtonLink,
  contactButtonText,
  contactButtonBackground,
}: MobileMegaMenuProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [showMegaMenuContent, setShowMegaMenuContent] = useState(false);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [isOpen]);

  // Reset states when menu closes
  useEffect(() => {
    if (!isOpen) {
      setExpandedCategory(null);
      setShowMegaMenuContent(false);
    }
  }, [isOpen]);

  const handleToggleCategory = (key: string) => {
    setExpandedCategory(expandedCategory === key ? null : key);
  };

  const handleNavigate = () => {
    onClose();
    setExpandedCategory(null);
    setShowMegaMenuContent(false);
  };

  const handleMoreClick = () => {
    setShowMegaMenuContent(true);
  };

  const handleBackToMain = () => {
    setShowMegaMenuContent(false);
    setExpandedCategory(null);
  };

  const renderMainNavItem = (item: MainNavItem) => {
    const Icon = item.icon;

    // Mega menu trigger - opens full mega menu content
    if (item.isMegaMenu) {
      return (
        <button
          key={item.key}
          onClick={handleMoreClick}
          className={`w-full flex items-center justify-between px-5 py-4 border-b transition-all duration-200 ${
            isDark
              ? 'border-gray-800 text-gray-200 hover:bg-gray-800 hover:text-white'
              : 'border-gray-100 text-gray-800 hover:bg-gray-50 hover:text-green-600'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                isDark ? 'bg-gray-800 text-green-400' : 'bg-green-50 text-green-600'
              }`}
            >
              <Icon className="w-5 h-5" />
            </div>
            <span className="text-[15px] font-semibold">{getNavLabel(item, language)}</span>
          </div>
          <FaChevronDown className={`w-4 h-4 -rotate-90 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
        </button>
      );
    }

    // Direct link item
    return (
      <Link
        key={item.key}
        href={item.href}
        onClick={handleNavigate}
        className={`flex items-center gap-3 px-5 py-4 border-b transition-all duration-200 ${
          isDark
            ? 'border-gray-800 text-gray-200 hover:bg-gray-800 hover:text-white'
            : 'border-gray-100 text-gray-800 hover:bg-gray-50 hover:text-green-600'
        }`}
      >
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            isDark ? 'bg-gray-800 text-green-400' : 'bg-green-50 text-green-600'
          }`}
        >
          <Icon className="w-5 h-5" />
        </div>
        <span className="text-[15px] font-semibold">{getNavLabel(item, language)}</span>
      </Link>
    );
  };

  const renderMegaMenuItem = (item: MegaMenuItem) => {
    const Icon = item.icon;

    return (
      <Link
        key={item.key}
        href={item.href}
        onClick={handleNavigate}
        className={`flex items-center gap-3 px-5 py-3 pl-8 transition-all duration-200 ${
          isDark
            ? 'text-gray-300 hover:text-white hover:bg-gray-800'
            : 'text-gray-600 hover:text-green-600 hover:bg-gray-100'
        }`}
      >
        <div
          className={`w-9 h-9 rounded-lg flex items-center justify-center ${
            isDark ? 'bg-gray-700 text-green-400' : 'bg-white text-green-500 shadow-sm'
          }`}
        >
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-[14px] font-medium block">{getNavLabel(item, language)}</span>
          <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            {getNavDescription(item, language)}
          </span>
        </div>
      </Link>
    );
  };

  const renderMegaMenuCategory = (category: MegaMenuCategory | MegaMenuSubCategory) => {
    const isExpanded = expandedCategory === category.key;

    return (
      <div key={category.key} className={`border-b ${isDark ? 'border-gray-800' : 'border-gray-100'}`}>
        {/* Category Header */}
        <button
          onClick={() => handleToggleCategory(category.key)}
          className={`w-full flex items-center justify-between px-5 py-4 transition-all duration-200 ${
            isExpanded
              ? isDark
                ? 'bg-gray-800 text-white'
                : 'bg-green-50 text-green-600'
              : isDark
              ? 'text-gray-200 hover:bg-gray-800'
              : 'text-gray-800 hover:bg-gray-50'
          }`}
          aria-expanded={isExpanded}
        >
          <span className="text-[15px] font-semibold">{getNavLabel(category, language)}</span>
          <FaChevronDown
            className={`w-4 h-4 transition-transform duration-300 ${
              isExpanded ? 'rotate-180' : ''
            } ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
          />
        </button>

        {/* Category Items */}
        <div
          className={`overflow-hidden transition-all duration-300 ${
            isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className={`py-2 ${isDark ? 'bg-gray-800/30' : 'bg-gray-50/50'}`}>
            {category.items.map(renderMegaMenuItem)}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[99998] transition-all duration-300 lg:hidden ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Mobile Menu Panel */}
      <div
        className={`fixed top-0 left-0 right-0 bottom-0 w-screen max-w-[100vw] overflow-x-hidden z-[99999] transform transition-transform duration-300 ease-out lg:hidden ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        } ${isDark ? 'bg-gray-900' : 'bg-white'}`}
        role="dialog"
        aria-modal="true"
        aria-label={language === 'bn' ? 'মোবাইল মেনু' : 'Mobile menu'}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-5 py-4 border-b ${
            isDark ? 'border-gray-800' : 'border-gray-100'
          }`}
        >
          <div className="flex items-center gap-3">
            {showMegaMenuContent && (
              <button
                onClick={handleBackToMain}
                className={`p-2 mr-2 rounded-full transition-all duration-300 ${
                  isDark
                    ? 'text-gray-400 hover:text-white hover:bg-gray-800'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                }`}
                aria-label={language === 'bn' ? 'পিছনে যান' : 'Go back'}
              >
                <FaChevronDown className="w-5 h-5 rotate-90" />
              </button>
            )}
            <Image
              src={logoSrc}
              alt={logoAlt}
              width={36}
              height={28}
              className="h-auto"
            />
            <span className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {showMegaMenuContent
                ? language === 'bn'
                  ? 'আরও'
                  : 'More'
                : language === 'bn'
                ? 'মেনু'
                : 'Menu'}
            </span>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-full transition-all duration-300 ${
              isDark
                ? 'text-gray-400 hover:text-white hover:bg-gray-800'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
            }`}
            aria-label={language === 'bn' ? 'বন্ধ করুন' : 'Close menu'}
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Content */}
        <div className="h-[calc(100%-140px)] overflow-y-auto">
          {!showMegaMenuContent ? (
            // Main Navigation Items
            <nav role="navigation" aria-label="Mobile navigation">
              {mainNavItems.map(renderMainNavItem)}
            </nav>
          ) : (
            // Mega Menu Categories (flattened for mobile - subCategories shown separately)
            <nav role="navigation" aria-label="More menu">
              {getMobileMegaMenuCategories().map(renderMegaMenuCategory)}
            </nav>
          )}
        </div>

        {/* Footer - Action Buttons */}
        <div
          className={`absolute bottom-0 left-0 right-0 p-4 border-t ${
            isDark ? 'border-gray-800 bg-gray-900' : 'border-gray-100 bg-white'
          }`}
        >
          <div className="space-y-3">
            {showWhatsAppButton && whatsAppNumber && (
              <a
                href={`https://wa.me/${whatsAppNumber.replace(/[^\d+]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-green-500 to-green-600 text-white px-5 py-3 rounded-xl font-semibold text-[15px] transition-all duration-300 hover:from-green-600 hover:to-green-700 shadow-lg"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 2.006c-5.516 0-9.999 4.481-9.999 9.996 0 1.746.444 3.388 1.234 4.815L2.003 21.99l5.245-1.238c1.391.745 2.977 1.143 4.769 1.143 5.515 0 9.998-4.481 9.998-9.996S17.532 2.006 12.017 2.006zm5.818 14.186c-.244.687-1.213 1.266-1.973 1.43-.511.11-1.18.195-3.426-.731-2.871-1.184-4.727-4.073-4.871-4.26-.144-.187-1.174-1.563-1.174-2.982 0-1.419.744-2.118 1.008-2.407.264-.289.576-.361.768-.361.192 0 .384.009.552.017.177.008.414-.067.648.495.239.576.816 1.991.888 2.135.072.144.12.313.024.5-.096.187-.144.304-.288.472-.144.168-.304.374-.433.5-.144.144-.288.304-.12.6.168.296.744 1.227 1.596 1.986 1.092.973 2.016 1.274 2.304 1.418.288.144.456.12.624-.072.168-.192.72-.839.912-1.127.192-.288.384-.24.648-.144.264.096 1.68.792 1.968.936.288.144.48.216.552.336.072.12.072.697-.168 1.385z" />
                </svg>
                <span>{whatsAppButtonText}</span>
              </a>
            )}
            {showContactButton && contactButtonLink && (
              <Link
                href={contactButtonLink}
                onClick={handleNavigate}
                className={`block w-full text-center bg-gradient-to-r ${
                  contactButtonBackground || 'from-red-500 to-red-600'
                } text-white px-5 py-3 rounded-xl font-semibold text-[15px] transition-all duration-300 shadow-lg`}
              >
                {contactButtonText}
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
