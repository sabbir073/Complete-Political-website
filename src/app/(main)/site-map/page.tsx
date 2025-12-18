'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/providers/ThemeProvider';
import { useLanguage } from '@/providers/LanguageProvider';
import Link from 'next/link';
import {
  FaHome, FaUser, FaNewspaper, FaCalendarAlt, FaImages, FaVideo,
  FaUsers, FaQuestionCircle, FaPoll, FaCheckCircle, FaTrophy,
  FaComments, FaTint, FaHandsHelping, FaExclamationTriangle,
  FaPhone, FaShieldAlt, FaStore, FaGamepad, FaInfoCircle,
  FaLock, FaFileContract, FaUniversalAccess, FaSitemap, FaMapMarkerAlt,
  FaChevronDown, FaChevronRight, FaExternalLinkAlt
} from 'react-icons/fa';

interface SitemapSection {
  title: { en: string; bn: string };
  icon: React.ReactNode;
  links: {
    title: { en: string; bn: string };
    href: string;
    description?: { en: string; bn: string };
  }[];
}

const sitemapData: SitemapSection[] = [
  {
    title: { en: 'Main Pages', bn: 'প্রধান পৃষ্ঠাসমূহ' },
    icon: <FaHome className="w-5 h-5" />,
    links: [
      { title: { en: 'Home', bn: 'হোম' }, href: '/', description: { en: 'Welcome page', bn: 'স্বাগত পৃষ্ঠা' } },
      { title: { en: 'About', bn: 'পরিচিতি' }, href: '/about', description: { en: 'About S M Jahangir Hossain', bn: 'এস এম জাহাঙ্গীর হোসেন সম্পর্কে' } },
      { title: { en: 'Contact', bn: 'যোগাযোগ' }, href: '/contact', description: { en: 'Get in touch', bn: 'যোগাযোগ করুন' } },
      { title: { en: 'Election 2026', bn: 'নির্বাচন ২০২৬' }, href: '/election-2026', description: { en: 'National Election 2026', bn: 'জাতীয় নির্বাচন ২০২৬' } },
    ]
  },
  {
    title: { en: 'News & Events', bn: 'সংবাদ ও ইভেন্ট' },
    icon: <FaNewspaper className="w-5 h-5" />,
    links: [
      { title: { en: 'All News', bn: 'সকল সংবাদ' }, href: '/news', description: { en: 'Latest news and updates', bn: 'সর্বশেষ সংবাদ এবং আপডেট' } },
      { title: { en: 'All Events', bn: 'সকল ইভেন্ট' }, href: '/events', description: { en: 'Upcoming and past events', bn: 'আসন্ন এবং পূর্ববর্তী ইভেন্ট' } },
      { title: { en: 'Upcoming Events', bn: 'আসন্ন ইভেন্ট' }, href: '/events/upcoming' },
      { title: { en: 'Past Events', bn: 'পূর্ববর্তী ইভেন্ট' }, href: '/events/archive' },
      { title: { en: 'Event Calendar', bn: 'ইভেন্ট ক্যালেন্ডার' }, href: '/events/calendar' },
      { title: { en: 'Virtual Town Hall', bn: 'ভার্চুয়াল টাউন হল' }, href: '/events/town-hall' },
    ]
  },
  {
    title: { en: 'Media Gallery', bn: 'মিডিয়া গ্যালারি' },
    icon: <FaImages className="w-5 h-5" />,
    links: [
      { title: { en: 'Photo Gallery', bn: 'ফটো গ্যালারি' }, href: '/gallery/photos', description: { en: 'Photos from events and activities', bn: 'ইভেন্ট এবং কার্যক্রমের ছবি' } },
      { title: { en: 'Video Gallery', bn: 'ভিডিও গ্যালারি' }, href: '/gallery/videos', description: { en: 'Video stories and speeches', bn: 'ভিডিও গল্প এবং বক্তৃতা' } },
    ]
  },
  {
    title: { en: 'Leadership & Team', bn: 'নেতৃত্ব ও দল' },
    icon: <FaUsers className="w-5 h-5" />,
    links: [
      { title: { en: 'Leadership', bn: 'নেতৃত্ব' }, href: '/leadership', description: { en: 'Meet our leadership team', bn: 'আমাদের নেতৃত্ব দলের সাথে পরিচিত হন' } },
      { title: { en: 'Volunteer Hub', bn: 'স্বেচ্ছাসেবক হাব' }, href: '/volunteer-hub', description: { en: 'Join our volunteer network', bn: 'আমাদের স্বেচ্ছাসেবক নেটওয়ার্কে যোগ দিন' } },
    ]
  },
  {
    title: { en: 'Public Participation', bn: 'জনগণের অংশগ্রহণ' },
    icon: <FaPoll className="w-5 h-5" />,
    links: [
      { title: { en: 'Ask Me Anything', bn: 'আমাকে কিছু জিজ্ঞাসা করুন' }, href: '/ama', description: { en: 'Submit your questions', bn: 'আপনার প্রশ্ন জমা দিন' } },
      { title: { en: 'Polls & Surveys', bn: 'পোল ও সার্ভে' }, href: '/polls', description: { en: 'Participate in public polls', bn: 'জনমত জরিপে অংশ নিন' } },
      { title: { en: 'Community Forum', bn: 'কমিউনিটি ফোরাম' }, href: '/community-forum', description: { en: 'Discuss with the community', bn: 'সম্প্রদায়ের সাথে আলোচনা করুন' } },
    ]
  },
  {
    title: { en: 'Progress & Achievements', bn: 'অগ্রগতি ও অর্জন' },
    icon: <FaTrophy className="w-5 h-5" />,
    links: [
      { title: { en: 'Promise Tracker', bn: 'প্রতিশ্রুতি ট্র্যাকার' }, href: '/promises', description: { en: 'Track campaign promises', bn: 'প্রচারণার প্রতিশ্রুতি ট্র্যাক করুন' } },
      { title: { en: 'Achievements', bn: 'অর্জন' }, href: '/achievements', description: { en: 'View our achievements', bn: 'আমাদের অর্জন দেখুন' } },
      { title: { en: 'Testimonials', bn: 'প্রশংসাপত্র' }, href: '/testimonials', description: { en: 'What people say', bn: 'মানুষ কি বলে' } },
    ]
  },
  {
    title: { en: 'Services', bn: 'সেবাসমূহ' },
    icon: <FaHandsHelping className="w-5 h-5" />,
    links: [
      { title: { en: 'Complaint Box', bn: 'অভিযোগ বাক্স' }, href: '/complaints', description: { en: 'Submit complaints', bn: 'অভিযোগ জমা দিন' } },
      { title: { en: 'Area Problems', bn: 'এলাকার সমস্যা' }, href: '/area-problems', description: { en: 'Report local issues', bn: 'স্থানীয় সমস্যা রিপোর্ট করুন' } },
      { title: { en: 'Blood Hub', bn: 'ব্লাড হাব' }, href: '/blood-hub', description: { en: 'Blood donation network', bn: 'রক্তদান নেটওয়ার্ক' } },
    ]
  },
  {
    title: { en: 'Emergency', bn: 'জরুরি' },
    icon: <FaExclamationTriangle className="w-5 h-5" />,
    links: [
      { title: { en: 'Emergency Contacts', bn: 'জরুরি যোগাযোগ' }, href: '/emergency/contacts' },
      { title: { en: 'Safety Resources', bn: 'নিরাপত্তা সম্পদ' }, href: '/emergency/safety' },
      { title: { en: 'Emergency SOS', bn: 'জরুরি এসওএস' }, href: '/emergency/sos' },
    ]
  },
  {
    title: { en: 'Store', bn: 'স্টোর' },
    icon: <FaStore className="w-5 h-5" />,
    links: [
      { title: { en: 'Shop', bn: 'দোকান' }, href: '/store', description: { en: 'Campaign merchandise', bn: 'প্রচারণার পণ্য' } },
    ]
  },
  {
    title: { en: 'Digital Tools', bn: 'ডিজিটাল সরঞ্জাম' },
    icon: <FaGamepad className="w-5 h-5" />,
    links: [
      { title: { en: 'Challenges', bn: 'চ্যালেঞ্জ' }, href: '/challenges' },
      { title: { en: 'Gamification', bn: 'গেমিফিকেশন' }, href: '/gamification' },
    ]
  },
  {
    title: { en: 'Help & Legal', bn: 'সাহায্য ও আইনি' },
    icon: <FaInfoCircle className="w-5 h-5" />,
    links: [
      { title: { en: 'Help Center', bn: 'সাহায্য কেন্দ্র' }, href: '/help', description: { en: 'FAQ and support', bn: 'FAQ এবং সহায়তা' } },
      { title: { en: 'Privacy Policy', bn: 'গোপনীয়তা নীতি' }, href: '/privacy' },
      { title: { en: 'Terms of Service', bn: 'সেবার শর্তাবলী' }, href: '/terms' },
      { title: { en: 'Accessibility', bn: 'অ্যাক্সেসিবিলিটি' }, href: '/accessibility' },
    ]
  },
];

interface DynamicContent {
  news: { title: string; slug: string; created_at: string }[];
  events: { title: string; slug: string; created_at: string }[];
  albums: { title: string; slug: string }[];
  products: { name: string; slug: string }[];
}

export default function SitemapPage() {
  const { isDark } = useTheme();
  const { language } = useLanguage();
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set([0]));
  const [dynamicContent, setDynamicContent] = useState<DynamicContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDynamicContent();
  }, []);

  const fetchDynamicContent = async () => {
    try {
      const response = await fetch('/api/sitemap/content');
      const data = await response.json();
      if (data.success) {
        setDynamicContent(data.data);
      }
    } catch (error) {
      console.error('Error fetching dynamic content:', error);
    } finally {
      setLoading(false);
    }
  };

  const getText = (text: { en: string; bn: string }) => {
    return language === 'bn' ? text.bn : text.en;
  };

  const toggleSection = (index: number) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedSections(newExpanded);
  };

  const expandAll = () => {
    setExpandedSections(new Set(sitemapData.map((_, i) => i)));
  };

  const collapseAll = () => {
    setExpandedSections(new Set());
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
        <div className="relative max-w-6xl mx-auto px-4 py-16 text-center">
          <FaSitemap className="w-16 h-16 mx-auto mb-6 opacity-90" />
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {language === 'bn' ? 'সাইটম্যাপ' : 'Sitemap'}
          </h1>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            {language === 'bn'
              ? 'আমাদের ওয়েবসাইটের সমস্ত পৃষ্ঠা এবং বিষয়বস্তু খুঁজুন'
              : 'Find all pages and content on our website'}
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* XML Sitemap Link */}
        <div className={`mb-8 p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {language === 'bn' ? 'XML সাইটম্যাপ' : 'XML Sitemap'}
              </h2>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {language === 'bn'
                  ? 'সার্চ ইঞ্জিনের জন্য মেশিন-রিডেবল সাইটম্যাপ'
                  : 'Machine-readable sitemap for search engines'}
              </p>
            </div>
            <a
              href="/sitemap.xml"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FaExternalLinkAlt className="w-4 h-4" />
              {language === 'bn' ? 'XML সাইটম্যাপ দেখুন' : 'View XML Sitemap'}
            </a>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-end gap-3 mb-6">
          <button
            onClick={expandAll}
            className={`px-4 py-2 text-sm rounded-lg transition-colors ${
              isDark
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {language === 'bn' ? 'সব খুলুন' : 'Expand All'}
          </button>
          <button
            onClick={collapseAll}
            className={`px-4 py-2 text-sm rounded-lg transition-colors ${
              isDark
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {language === 'bn' ? 'সব বন্ধ করুন' : 'Collapse All'}
          </button>
        </div>

        {/* Static Sitemap Sections */}
        <div className="space-y-4 mb-12">
          {sitemapData.map((section, sectionIndex) => (
            <div
              key={sectionIndex}
              className={`rounded-xl overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-white'} shadow`}
            >
              <button
                onClick={() => toggleSection(sectionIndex)}
                className={`w-full flex items-center justify-between p-4 text-left transition-colors ${
                  isDark ? 'hover:bg-gray-750' : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                    {section.icon}
                  </div>
                  <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {getText(section.title)}
                  </span>
                  <span className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    ({section.links.length})
                  </span>
                </div>
                {expandedSections.has(sectionIndex) ? (
                  <FaChevronDown className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                ) : (
                  <FaChevronRight className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                )}
              </button>

              {expandedSections.has(sectionIndex) && (
                <div className={`px-4 pb-4 ${isDark ? 'border-t border-gray-700' : 'border-t border-gray-100'}`}>
                  <ul className="divide-y divide-gray-100 dark:divide-gray-700">
                    {section.links.map((link, linkIndex) => (
                      <li key={linkIndex}>
                        <Link
                          href={link.href}
                          className={`flex items-center justify-between py-3 px-2 rounded-lg transition-colors ${
                            isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                          }`}
                        >
                          <div>
                            <span className={`font-medium ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                              {getText(link.title)}
                            </span>
                            {link.description && (
                              <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                                {getText(link.description)}
                              </p>
                            )}
                          </div>
                          <span className={`text-xs ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                            {link.href}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Dynamic Content Section */}
        {!loading && dynamicContent && (
          <div className="space-y-8">
            <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {language === 'bn' ? 'গতিশীল বিষয়বস্তু' : 'Dynamic Content'}
            </h2>

            {/* Recent News */}
            {dynamicContent.news.length > 0 && (
              <div className={`rounded-xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow`}>
                <div className="flex items-center gap-3 mb-4">
                  <FaNewspaper className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                  <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {language === 'bn' ? 'সাম্প্রতিক সংবাদ' : 'Recent News'} ({dynamicContent.news.length})
                  </h3>
                </div>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {dynamicContent.news.slice(0, 10).map((item, index) => (
                    <li key={index}>
                      <Link
                        href={`/news/${item.slug}`}
                        className={`block py-2 px-3 rounded-lg transition-colors ${
                          isDark ? 'hover:bg-gray-700 text-blue-400' : 'hover:bg-gray-50 text-blue-600'
                        }`}
                      >
                        {item.title}
                      </Link>
                    </li>
                  ))}
                </ul>
                {dynamicContent.news.length > 10 && (
                  <Link
                    href="/news"
                    className={`inline-block mt-4 text-sm ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
                  >
                    {language === 'bn' ? `আরও ${dynamicContent.news.length - 10}টি সংবাদ দেখুন →` : `View ${dynamicContent.news.length - 10} more news articles →`}
                  </Link>
                )}
              </div>
            )}

            {/* Recent Events */}
            {dynamicContent.events.length > 0 && (
              <div className={`rounded-xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow`}>
                <div className="flex items-center gap-3 mb-4">
                  <FaCalendarAlt className={`w-5 h-5 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
                  <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {language === 'bn' ? 'ইভেন্ট' : 'Events'} ({dynamicContent.events.length})
                  </h3>
                </div>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {dynamicContent.events.slice(0, 10).map((item, index) => (
                    <li key={index}>
                      <Link
                        href={`/events/${item.slug}`}
                        className={`block py-2 px-3 rounded-lg transition-colors ${
                          isDark ? 'hover:bg-gray-700 text-green-400' : 'hover:bg-gray-50 text-green-600'
                        }`}
                      >
                        {item.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Photo Albums */}
            {dynamicContent.albums.length > 0 && (
              <div className={`rounded-xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow`}>
                <div className="flex items-center gap-3 mb-4">
                  <FaImages className={`w-5 h-5 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
                  <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {language === 'bn' ? 'ফটো অ্যালবাম' : 'Photo Albums'} ({dynamicContent.albums.length})
                  </h3>
                </div>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {dynamicContent.albums.map((item, index) => (
                    <li key={index}>
                      <Link
                        href={`/gallery/photos/${item.slug}`}
                        className={`block py-2 px-3 rounded-lg transition-colors ${
                          isDark ? 'hover:bg-gray-700 text-purple-400' : 'hover:bg-gray-50 text-purple-600'
                        }`}
                      >
                        {item.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Store Products */}
            {dynamicContent.products.length > 0 && (
              <div className={`rounded-xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow`}>
                <div className="flex items-center gap-3 mb-4">
                  <FaStore className={`w-5 h-5 ${isDark ? 'text-orange-400' : 'text-orange-600'}`} />
                  <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {language === 'bn' ? 'স্টোর পণ্য' : 'Store Products'} ({dynamicContent.products.length})
                  </h3>
                </div>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {dynamicContent.products.map((item, index) => (
                    <li key={index}>
                      <Link
                        href={`/store/${item.slug}`}
                        className={`block py-2 px-3 rounded-lg transition-colors ${
                          isDark ? 'hover:bg-gray-700 text-orange-400' : 'hover:bg-gray-50 text-orange-600'
                        }`}
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Last Updated */}
        <div className={`mt-12 text-center text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
          {language === 'bn'
            ? 'সাইটম্যাপ স্বয়ংক্রিয়ভাবে আপডেট হয় যখন নতুন বিষয়বস্তু যোগ করা হয়'
            : 'Sitemap is automatically updated when new content is added'}
        </div>
      </div>
    </div>
  );
}
