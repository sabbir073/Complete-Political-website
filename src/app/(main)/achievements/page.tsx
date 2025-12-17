'use client';

import { useState, useEffect, useRef } from 'react';
import { useTheme } from '@/providers/ThemeProvider';
import { useLanguage } from '@/providers/LanguageProvider';
import { format } from 'date-fns';
import Image from 'next/image';
import SocialShare from '@/components/SocialShare';
import { siteConfig } from '@/lib/seo';
import {
  FaBuilding,
  FaGraduationCap,
  FaHeart,
  FaBriefcase,
  FaLeaf,
  FaUsers,
  FaHome,
  FaCar,
  FaBolt,
  FaShieldAlt,
  FaGlobe,
  FaStar,
  FaCommentDots
} from 'react-icons/fa';

// Icon mapping for dynamic icon rendering
const iconMap: { [key: string]: React.ComponentType<{ className?: string }> } = {
  Building: FaBuilding,
  GraduationCap: FaGraduationCap,
  Heart: FaHeart,
  Briefcase: FaBriefcase,
  Leaf: FaLeaf,
  Users: FaUsers,
  Home: FaHome,
  Car: FaCar,
  Zap: FaBolt,
  Shield: FaShieldAlt,
  Globe: FaGlobe,
  Star: FaStar,
  MessageCircle: FaCommentDots,
};

const DynamicIcon = ({ name, className }: { name: string; className?: string }) => {
  const IconComponent = iconMap[name];
  if (!IconComponent) return null;
  return <IconComponent className={className} />;
};

interface Category {
  id: string;
  name_en: string;
  name_bn: string;
  slug: string;
  icon: string;
  color: string;
}

interface Achievement {
  id: string;
  category_id: string | null;
  title_en: string;
  title_bn: string;
  description_en: string;
  description_bn: string;
  achievement_date: string | null;
  location_en: string | null;
  location_bn: string | null;
  impact_metrics: {
    people_helped?: number;
    investment?: number;
  };
  featured_image: string | null;
  images: string[];
  videos: string[];
  news_links: string[];
  featured: boolean;
  created_at: string;
  achievement_categories: Category | null;
}

interface Stats {
  totalProjects: number;
  totalPeopleHelped: number;
  totalInvestment: number;
  yearsOfService: number;
}

function AnimatedCounter({ end, duration = 2000, suffix = '' }: { end: number; duration?: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const countRef = useRef<HTMLSpanElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          let start = 0;
          const step = Math.ceil(end / (duration / 16));
          const timer = setInterval(() => {
            start += step;
            if (start >= end) {
              setCount(end);
              clearInterval(timer);
            } else {
              setCount(start);
            }
          }, 16);
        }
      },
      { threshold: 0.5 }
    );

    if (countRef.current) {
      observer.observe(countRef.current);
    }

    return () => observer.disconnect();
  }, [end, duration, hasAnimated]);

  return <span ref={countRef}>{count.toLocaleString()}{suffix}</span>;
}

export default function AchievementsPage() {
  const { isDark } = useTheme();
  const { language } = useLanguage();

  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);

  const getText = (en: string | null | undefined, bn: string | null | undefined) => {
    if (language === 'bn' && bn) return bn;
    return en || '';
  };

  useEffect(() => {
    fetchData();
  }, [activeCategory]);

  const fetchData = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      if (activeCategory !== 'all') params.append('category', activeCategory);

      const [achievementsRes, categoriesRes, statsRes] = await window.Promise.all([
        fetch(`/api/achievements?${params}`),
        fetch('/api/achievements/categories'),
        fetch('/api/achievements/stats')
      ]);

      const [achievementsData, categoriesData, statsData] = await window.Promise.all([
        achievementsRes.json(),
        categoriesRes.json(),
        statsRes.json()
      ]);

      if (achievementsData.success) setAchievements(achievementsData.data || []);
      if (categoriesData.success) setCategories(categoriesData.data || []);
      if (statsData.success) setStats(statsData.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Hero Section */}
      <div className={`relative py-16 ${isDark ? 'bg-gradient-to-br from-amber-900 via-gray-900 to-gray-900' : 'bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600'}`}>
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {language === 'bn' ? 'অর্জনসমূহ' : 'Achievements'}
          </h1>
          <p className="text-lg text-white/90 max-w-2xl mx-auto mb-10">
            {language === 'bn'
              ? 'সম্প্রদায়ের জন্য আমাদের সম্পন্ন প্রকল্প এবং অর্জনসমূহ দেখুন।'
              : 'Explore our completed projects and accomplishments for the community.'}
          </p>

          {/* Impact Stats */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 text-white">
                <div className="text-4xl font-bold mb-1">
                  <AnimatedCounter end={stats.totalProjects} suffix="+" />
                </div>
                <div className="text-sm opacity-80">{language === 'bn' ? 'সম্পন্ন প্রকল্প' : 'Projects Completed'}</div>
              </div>
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 text-white">
                <div className="text-4xl font-bold mb-1">
                  <AnimatedCounter end={stats.totalPeopleHelped} />
                </div>
                <div className="text-sm opacity-80">{language === 'bn' ? 'সাহায্যপ্রাপ্ত' : 'People Helped'}</div>
              </div>
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 text-white">
                <div className="text-4xl font-bold mb-1">
                  ৳<AnimatedCounter end={Math.round(stats.totalInvestment / 100000)} suffix="L" />
                </div>
                <div className="text-sm opacity-80">{language === 'bn' ? 'বিনিয়োগ' : 'Investment'}</div>
              </div>
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 text-white">
                <div className="text-4xl font-bold mb-1">
                  <AnimatedCounter end={stats.yearsOfService} suffix="+" />
                </div>
                <div className="text-sm opacity-80">{language === 'bn' ? 'বছর সেবায়' : 'Years of Service'}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
              activeCategory === 'all'
                ? 'bg-amber-600 text-white shadow-lg'
                : isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-white text-gray-700 hover:bg-gray-100 shadow'
            }`}
          >
            {language === 'bn' ? '🏆 সব' : '🏆 All'}
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.slug)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                activeCategory === cat.slug
                  ? 'bg-amber-600 text-white shadow-lg'
                  : isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-white text-gray-700 hover:bg-gray-100 shadow'
              }`}
            >
              <DynamicIcon name={cat.icon} className="w-4 h-4" />
              {getText(cat.name_en, cat.name_bn)}
            </button>
          ))}
        </div>

        {/* Achievements Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-500 border-t-transparent" />
          </div>
        ) : achievements.length === 0 ? (
          <div className={`text-center py-16 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="text-6xl mb-4">🏆</div>
            <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {language === 'bn' ? 'কোনো অর্জন পাওয়া যায়নি' : 'No achievements found'}
            </h3>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`group rounded-2xl overflow-hidden cursor-pointer transition-all hover:shadow-xl ${
                  isDark ? 'bg-gray-800 hover:bg-gray-750' : 'bg-white'
                } ${achievement.featured ? 'ring-2 ring-amber-500/50' : ''}`}
                onClick={() => setSelectedAchievement(achievement)}
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  {achievement.featured_image ? (
                    <Image
                      src={achievement.featured_image}
                      alt={achievement.title_en}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className={`w-full h-full flex items-center justify-center text-6xl ${isDark ? 'bg-gray-700' : 'bg-amber-100'}`}>
                      {achievement.achievement_categories?.icon || '🏆'}
                    </div>
                  )}
                  {achievement.featured && (
                    <div className="absolute top-3 right-3 bg-amber-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                      ⭐ {language === 'bn' ? 'বৈশিষ্ট্যযুক্ত' : 'Featured'}
                    </div>
                  )}
                  {achievement.achievement_categories && (
                    <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs flex items-center gap-1.5">
                      <DynamicIcon name={achievement.achievement_categories.icon} className="w-3.5 h-3.5" />
                      {getText(achievement.achievement_categories.name_en, achievement.achievement_categories.name_bn)}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className={`font-bold text-lg mb-2 line-clamp-2 group-hover:text-amber-600 transition-colors ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {getText(achievement.title_en, achievement.title_bn)}
                  </h3>
                  {achievement.description_en && (
                    <p className={`text-sm mb-4 line-clamp-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {getText(achievement.description_en, achievement.description_bn)}
                    </p>
                  )}

                  {/* Meta */}
                  <div className="flex flex-wrap items-center gap-3 text-xs mb-4">
                    {achievement.achievement_date && (
                      <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>
                        📅 {format(new Date(achievement.achievement_date), 'MMM yyyy')}
                      </span>
                    )}
                    {achievement.location_en && (
                      <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>
                        📍 {getText(achievement.location_en, achievement.location_bn)}
                      </span>
                    )}
                  </div>

                  {/* Impact Metrics */}
                  {(achievement.impact_metrics?.people_helped || achievement.impact_metrics?.investment) && (
                    <div className="flex gap-2">
                      {achievement.impact_metrics.people_helped && achievement.impact_metrics.people_helped > 0 && (
                        <span className={`text-xs px-2.5 py-1 rounded-full ${isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700'}`}>
                          👥 {achievement.impact_metrics.people_helped.toLocaleString()} {language === 'bn' ? 'জন' : 'people'}
                        </span>
                      )}
                      {achievement.impact_metrics.investment && achievement.impact_metrics.investment > 0 && (
                        <span className={`text-xs px-2.5 py-1 rounded-full ${isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-700'}`}>
                          💰 ৳{(achievement.impact_metrics.investment / 100000).toFixed(1)}L
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Achievement Detail Modal */}
      {selectedAchievement && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setSelectedAchievement(null)} />
          <div className={`relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            {/* Close Button */}
            <button
              onClick={() => setSelectedAchievement(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Image Gallery */}
            {selectedAchievement.featured_image && (
              <div className="relative h-64 md:h-80">
                <Image
                  src={selectedAchievement.featured_image}
                  alt={selectedAchievement.title_en}
                  fill
                  className="object-cover"
                />
              </div>
            )}

            {/* Content */}
            <div className="p-6 md:p-8">
              {selectedAchievement.achievement_categories && (
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium mb-4 ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-amber-100 text-amber-700'}`}>
                  <DynamicIcon name={selectedAchievement.achievement_categories.icon} className="w-4 h-4" />
                  {getText(selectedAchievement.achievement_categories.name_en, selectedAchievement.achievement_categories.name_bn)}
                </span>
              )}

              <h2 className={`text-2xl md:text-3xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {getText(selectedAchievement.title_en, selectedAchievement.title_bn)}
              </h2>

              <div className="flex flex-wrap gap-4 mb-6 text-sm">
                {selectedAchievement.achievement_date && (
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                    📅 {format(new Date(selectedAchievement.achievement_date), 'MMMM d, yyyy')}
                  </span>
                )}
                {selectedAchievement.location_en && (
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                    📍 {getText(selectedAchievement.location_en, selectedAchievement.location_bn)}
                  </span>
                )}
              </div>

              {selectedAchievement.description_en && (
                <p className={`text-lg leading-relaxed mb-6 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {getText(selectedAchievement.description_en, selectedAchievement.description_bn)}
                </p>
              )}

              {/* Impact Metrics */}
              {(selectedAchievement.impact_metrics?.people_helped || selectedAchievement.impact_metrics?.investment) && (
                <div className={`p-4 rounded-xl mb-6 ${isDark ? 'bg-gray-700' : 'bg-amber-50'}`}>
                  <h4 className={`font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {language === 'bn' ? 'প্রভাব' : 'Impact'}
                  </h4>
                  <div className="flex gap-6">
                    {selectedAchievement.impact_metrics.people_helped && selectedAchievement.impact_metrics.people_helped > 0 && (
                      <div>
                        <div className={`text-2xl font-bold ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                          {selectedAchievement.impact_metrics.people_helped.toLocaleString()}
                        </div>
                        <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {language === 'bn' ? 'মানুষ সাহায্যপ্রাপ্ত' : 'People Helped'}
                        </div>
                      </div>
                    )}
                    {selectedAchievement.impact_metrics.investment && selectedAchievement.impact_metrics.investment > 0 && (
                      <div>
                        <div className={`text-2xl font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                          ৳{selectedAchievement.impact_metrics.investment.toLocaleString()}
                        </div>
                        <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {language === 'bn' ? 'বিনিয়োগ' : 'Investment'}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Gallery */}
              {selectedAchievement.images?.length > 0 && (
                <div className="mb-6">
                  <h4 className={`font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {language === 'bn' ? 'গ্যালারি' : 'Gallery'}
                  </h4>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedAchievement.images.map((img, idx) => (
                      <div key={idx} className="relative aspect-square rounded-lg overflow-hidden">
                        <Image src={img} alt="" fill className="object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* News Links */}
              {selectedAchievement.news_links?.length > 0 && (
                <div className="mb-6">
                  <h4 className={`font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {language === 'bn' ? 'সংবাদ কভারেজ' : 'News Coverage'}
                  </h4>
                  <div className="space-y-2">
                    {selectedAchievement.news_links.map((link, idx) => (
                      <a
                        key={idx}
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-center gap-2 text-sm ${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}
                      >
                        🔗 {link.substring(0, 50)}...
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Share */}
              <div className={`pt-6 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {language === 'bn' ? 'এই অর্জন শেয়ার করুন:' : 'Share this achievement:'}
                  </span>
                  <SocialShare
                    url={`${siteConfig.url}/achievements#${selectedAchievement.id}`}
                    title={getText(selectedAchievement.title_en, selectedAchievement.title_bn)}
                    description={getText(selectedAchievement.description_en, selectedAchievement.description_bn)?.substring(0, 150)}
                    variant="icons"
                    size="md"
                    showLabel={false}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
