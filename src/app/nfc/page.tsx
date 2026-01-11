"use client";

import { useState, useEffect } from 'react';
import { useLanguage } from '@/providers/LanguageProvider';
import { useTheme } from '@/providers/ThemeProvider';
import Link from 'next/link';

// Link configuration with icons and descriptions
const links = [
  {
    id: 'website',
    nameEn: 'Official Website',
    nameBn: 'অফিসিয়াল ওয়েবসাইট',
    descEn: 'Visit our main website',
    descBn: 'আমাদের প্রধান ওয়েবসাইট দেখুন',
    url: 'https://smjahangir.com',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
    color: 'from-green-600 to-green-700',
  },
  {
    id: 'complaints',
    nameEn: 'Complain Box',
    nameBn: 'অভিযোগ বক্স',
    descEn: 'Submit your complaints',
    descBn: 'আপনার অভিযোগ জমা দিন',
    url: 'https://smjahangir.com/complaints',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
      </svg>
    ),
    color: 'from-red-600 to-red-700',
  },
  {
    id: 'blood-hub',
    nameEn: 'Blood Hub',
    nameBn: 'রক্ত হাব',
    descEn: 'Find blood donors',
    descBn: 'রক্তদাতা খুঁজুন',
    url: 'https://smjahangir.com/blood-hub',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
    color: 'from-red-500 to-pink-600',
  },
  {
    id: 'volunteer-hub',
    nameEn: 'Volunteer Hub',
    nameBn: 'স্বেচ্ছাসেবক হাব',
    descEn: 'Join as a volunteer',
    descBn: 'স্বেচ্ছাসেবক হিসেবে যোগ দিন',
    url: 'https://smjahangir.com/volunteer-hub',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    color: 'from-blue-600 to-blue-700',
  },
  {
    id: 'ama',
    nameEn: 'Ask Any Question',
    nameBn: 'যেকোনো প্রশ্ন করুন',
    descEn: 'Get your questions answered',
    descBn: 'আপনার প্রশ্নের উত্তর পান',
    url: 'https://smjahangir.com/ama',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    color: 'from-purple-600 to-purple-700',
  },
  {
    id: 'election-2026',
    nameEn: 'Supporter Card',
    nameBn: 'সমর্থক কার্ড',
    descEn: 'Generate your support card',
    descBn: 'আপনার সমর্থন কার্ড তৈরি করুন',
    url: 'https://smjahangir.com/election-2026',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
      </svg>
    ),
    color: 'from-green-600 to-emerald-700',
  },
  {
    id: 'testimonials',
    nameEn: 'Public Opinion',
    nameBn: 'জনমত',
    descEn: 'Read public testimonials',
    descBn: 'জনগণের মতামত পড়ুন',
    url: 'https://smjahangir.com/testimonials',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
      </svg>
    ),
    color: 'from-orange-600 to-orange-700',
  },
];

export default function NFCPage() {
  const { language } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [visitId, setVisitId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string>('');

  useEffect(() => {
    // Generate or retrieve session ID
    let sid = localStorage.getItem('nfc_session_id');
    if (!sid) {
      sid = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('nfc_session_id', sid);
    }
    setSessionId(sid);

    // Track page visit
    trackVisit(sid);
  }, []);

  const trackVisit = async (sid: string) => {
    try {
      const response = await fetch('/api/nfc/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'visit',
          sessionId: sid,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setVisitId(data.visitId);
      }
    } catch (error) {
      console.error('Failed to track visit:', error);
    }
  };

  const trackClick = async (linkName: string, linkUrl: string) => {
    try {
      await fetch('/api/nfc/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'click',
          visitId,
          linkName,
          linkUrl,
        }),
      });
    } catch (error) {
      console.error('Failed to track click:', error);
    }
  };

  const handleLinkClick = (link: typeof links[0]) => {
    trackClick(link.id, link.url);
  };

  const t = {
    title: language === 'bn' ? 'এস এম জাহাঙ্গীর হোসেন' : 'S M Jahangir Hossain',
    subtitle: language === 'bn' ? 'বিএনপি মনোনীত প্রার্থী, ঢাকা-১৮' : 'BNP Nominated Candidate for Dhaka-18',
    description: language === 'bn'
      ? 'আমাদের সাথে যুক্ত হন এবং পরিবর্তনের অংশীদার হন'
      : 'Connect with us and be part of the change',
    quickLinks: language === 'bn' ? 'দ্রুত লিংক' : 'Quick Links',
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gradient-to-br from-gray-50 to-gray-100'}`}>
      {/* Digital vCard Container */}
      <div className="min-h-screen flex items-center justify-center p-4 py-12">
        <div className="w-full max-w-2xl">
          {/* Profile Card */}
          <div className={`relative rounded-3xl overflow-hidden shadow-2xl mb-6 ${
            isDark ? 'bg-gray-800' : 'bg-white'
          }`}>
            {/* Header Background with Gradient */}
            <div className="relative h-40 bg-gradient-to-r from-green-600 via-green-500 to-red-500">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/30 mb-2">
                    <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Content */}
            <div className="px-6 pt-8 pb-6 text-center">
              <h1 className={`text-3xl font-bold mb-2 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                {t.title}
              </h1>
              <p className={`text-lg mb-3 ${
                isDark ? 'text-green-400' : 'text-green-600'
              }`}>
                {t.subtitle}
              </p>
              <p className={`text-sm ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {t.description}
              </p>
            </div>
          </div>

          {/* Quick Links Section */}
          <div className={`rounded-2xl p-6 shadow-xl ${
            isDark ? 'bg-gray-800' : 'bg-white'
          }`}>
            <h2 className={`text-xl font-bold mb-4 text-center ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              {t.quickLinks}
            </h2>

            <div className="space-y-3">
              {links.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  onClick={() => handleLinkClick(link)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`block group relative overflow-hidden rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-lg ${
                    isDark
                      ? 'bg-gray-700 hover:bg-gray-650'
                      : 'bg-gradient-to-r ' + link.color + ' hover:shadow-xl'
                  }`}
                >
                  <div className="flex items-center p-4">
                    {/* Icon */}
                    <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${
                      isDark
                        ? 'bg-gray-600 text-green-400'
                        : 'bg-white/20 text-white'
                    }`}>
                      {link.icon}
                    </div>

                    {/* Text Content */}
                    <div className="flex-1 ml-4">
                      <h3 className={`font-bold text-base ${
                        isDark ? 'text-white' : 'text-white'
                      }`}>
                        {language === 'bn' ? link.nameBn : link.nameEn}
                      </h3>
                      <p className={`text-sm ${
                        isDark ? 'text-gray-300' : 'text-white/90'
                      }`}>
                        {language === 'bn' ? link.descBn : link.descEn}
                      </p>
                    </div>

                    {/* Arrow Icon */}
                    <div className={`flex-shrink-0 ml-3 ${
                      isDark ? 'text-gray-400' : 'text-white/80'
                    } group-hover:translate-x-1 transition-transform`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>

                  {/* Hover Effect Overlay */}
                  <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors pointer-events-none"></div>
                </a>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-6 px-4">
            <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
              {language === 'bn'
                ? '© ২০২৬ এস এম জাহাঙ্গীর হোসেন। সর্বস্বত্ব সংরক্ষিত।'
                : '© 2026 S M Jahangir Hossain. All rights reserved.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
