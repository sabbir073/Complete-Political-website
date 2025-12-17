'use client';

import { useState, useEffect } from 'react';
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

interface PromiseUpdate {
  id: string;
  title_en: string;
  title_bn: string;
  description_en: string;
  description_bn: string;
  progress_change: number;
  new_progress: number;
  images: string[];
  created_at: string;
}

interface Promise {
  id: string;
  category_id: string | null;
  title_en: string;
  title_bn: string;
  description_en: string;
  description_bn: string;
  target_date: string | null;
  completion_date: string | null;
  status: 'not_started' | 'in_progress' | 'completed' | 'delayed';
  progress: number;
  priority: string;
  featured: boolean;
  featured_image: string | null;
  created_at: string;
  promise_categories: Category | null;
  promise_updates: PromiseUpdate[];
}

interface Stats {
  total: number;
  completed: number;
  inProgress: number;
  notStarted: number;
  delayed: number;
  averageProgress: number;
}

export default function PromisesPage() {
  const { isDark } = useTheme();
  const { language } = useLanguage();

  const [promises, setPromises] = useState<Promise[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeStatus, setActiveStatus] = useState('all');
  const [expandedPromise, setExpandedPromise] = useState<string | null>(null);

  const getText = (en: string | null | undefined, bn: string | null | undefined) => {
    if (language === 'bn' && bn) return bn;
    return en || '';
  };

  useEffect(() => {
    fetchData();
  }, [activeCategory, activeStatus]);

  const fetchData = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      if (activeCategory !== 'all') params.append('category', activeCategory);
      if (activeStatus !== 'all') params.append('status', activeStatus);

      const [promisesRes, categoriesRes, statsRes] = await window.Promise.all([
        fetch(`/api/promises?${params}`),
        fetch('/api/promises/categories'),
        fetch('/api/promises/stats')
      ]);

      const [promisesData, categoriesData, statsData] = await window.Promise.all([
        promisesRes.json(),
        categoriesRes.json(),
        statsRes.json()
      ]);

      if (promisesData.success) setPromises(promisesData.data || []);
      if (categoriesData.success) setCategories(categoriesData.data || []);
      if (statsData.success) setStats(statsData.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'completed':
        return { label: language === 'bn' ? 'সম্পন্ন' : 'Completed', color: 'bg-green-500', textColor: 'text-green-600', bgLight: 'bg-green-100 dark:bg-green-900/30' };
      case 'in_progress':
        return { label: language === 'bn' ? 'চলমান' : 'In Progress', color: 'bg-blue-500', textColor: 'text-blue-600', bgLight: 'bg-blue-100 dark:bg-blue-900/30' };
      case 'delayed':
        return { label: language === 'bn' ? 'বিলম্বিত' : 'Delayed', color: 'bg-red-500', textColor: 'text-red-600', bgLight: 'bg-red-100 dark:bg-red-900/30' };
      default:
        return { label: language === 'bn' ? 'শুরু হয়নি' : 'Not Started', color: 'bg-gray-400', textColor: 'text-gray-600', bgLight: 'bg-gray-100 dark:bg-gray-700' };
    }
  };

  const completionRate = stats ? Math.round((stats.completed / stats.total) * 100) || 0 : 0;

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Hero Section */}
      <div className={`relative py-16 ${isDark ? 'bg-gradient-to-br from-green-900 via-gray-900 to-gray-900' : 'bg-gradient-to-br from-green-600 via-green-700 to-green-800'}`}>
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {language === 'bn' ? 'প্রতিশ্রুতি ট্র্যাকার' : 'Promise Tracker'}
          </h1>
          <p className="text-lg text-white/90 max-w-2xl mx-auto mb-8">
            {language === 'bn'
              ? 'আমাদের প্রতিশ্রুতি এবং অগ্রগতি স্বচ্ছভাবে ট্র্যাক করুন। আমরা জবাবদিহিতায় বিশ্বাস করি।'
              : 'Track our commitments and progress transparently. We believe in accountability.'}
          </p>

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 text-white">
                <div className="text-3xl font-bold">{stats.total}</div>
                <div className="text-sm opacity-80">{language === 'bn' ? 'মোট প্রতিশ্রুতি' : 'Total Promises'}</div>
              </div>
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 text-white">
                <div className="text-3xl font-bold text-green-300">{stats.completed}</div>
                <div className="text-sm opacity-80">{language === 'bn' ? 'সম্পন্ন' : 'Completed'}</div>
              </div>
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 text-white">
                <div className="text-3xl font-bold text-blue-300">{stats.inProgress}</div>
                <div className="text-sm opacity-80">{language === 'bn' ? 'চলমান' : 'In Progress'}</div>
              </div>
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 text-white">
                <div className="text-3xl font-bold">{completionRate}%</div>
                <div className="text-sm opacity-80">{language === 'bn' ? 'সম্পূর্ণতার হার' : 'Completion Rate'}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-6 justify-center">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeCategory === 'all'
                ? 'bg-green-600 text-white shadow-lg'
                : isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            {language === 'bn' ? 'সব' : 'All'}
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.slug)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                activeCategory === cat.slug
                  ? 'bg-green-600 text-white shadow-lg'
                  : isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              <DynamicIcon name={cat.icon} className="w-4 h-4" />
              {getText(cat.name_en, cat.name_bn)}
            </button>
          ))}
        </div>

        {/* Status Filter */}
        <div className="flex gap-2 mb-8 justify-center">
          {[
            { key: 'all', en: 'All', bn: 'সব' },
            { key: 'completed', en: 'Completed', bn: 'সম্পন্ন' },
            { key: 'in_progress', en: 'In Progress', bn: 'চলমান' },
            { key: 'not_started', en: 'Not Started', bn: 'শুরু হয়নি' },
            { key: 'delayed', en: 'Delayed', bn: 'বিলম্বিত' }
          ].map(status => (
            <button
              key={status.key}
              onClick={() => setActiveStatus(status.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeStatus === status.key
                  ? isDark ? 'bg-green-600 text-white' : 'bg-green-600 text-white'
                  : isDark ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-600'
              }`}
            >
              {language === 'bn' ? status.bn : status.en}
            </button>
          ))}
        </div>

        {/* Promises List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent" />
          </div>
        ) : promises.length === 0 ? (
          <div className={`text-center py-16 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="text-6xl mb-4">📋</div>
            <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {language === 'bn' ? 'কোনো প্রতিশ্রুতি পাওয়া যায়নি' : 'No promises found'}
            </h3>
          </div>
        ) : (
          <div className="space-y-4">
            {promises.map((promise) => {
              const statusConfig = getStatusConfig(promise.status);
              const isExpanded = expandedPromise === promise.id;

              return (
                <div
                  key={promise.id}
                  className={`rounded-2xl overflow-hidden transition-all ${
                    isDark ? 'bg-gray-800' : 'bg-white'
                  } ${promise.status === 'completed' ? 'ring-2 ring-green-500/30' : ''}`}
                >
                  {/* Main Card */}
                  <div className="p-6">
                    <div className="flex items-start gap-4">
                      {/* Progress Ring */}
                      <div className="flex-shrink-0 relative">
                        <svg className="w-16 h-16 transform -rotate-90">
                          <circle
                            cx="32"
                            cy="32"
                            r="28"
                            stroke={isDark ? '#374151' : '#E5E7EB'}
                            strokeWidth="6"
                            fill="none"
                          />
                          <circle
                            cx="32"
                            cy="32"
                            r="28"
                            stroke={promise.status === 'completed' ? '#10B981' : promise.status === 'delayed' ? '#EF4444' : '#3B82F6'}
                            strokeWidth="6"
                            fill="none"
                            strokeLinecap="round"
                            strokeDasharray={`${2 * Math.PI * 28}`}
                            strokeDashoffset={`${2 * Math.PI * 28 * (1 - promise.progress / 100)}`}
                            className="transition-all duration-500"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {promise.progress}%
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center flex-wrap gap-2 mb-2">
                          {promise.promise_categories && (
                            <span className={`${isDark ? 'text-green-400' : 'text-green-600'}`}>
                              <DynamicIcon name={promise.promise_categories.icon} className="w-5 h-5" />
                            </span>
                          )}
                          <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {getText(promise.title_en, promise.title_bn)}
                          </h3>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusConfig.bgLight} ${statusConfig.textColor}`}>
                            {statusConfig.label}
                          </span>
                          {promise.featured && <span className="text-yellow-500">⭐</span>}
                        </div>

                        {promise.description_en && (
                          <p className={`text-sm mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {getText(promise.description_en, promise.description_bn)}
                          </p>
                        )}

                        <div className="flex flex-wrap items-center gap-4 text-xs">
                          {promise.target_date && (
                            <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>
                              🎯 {language === 'bn' ? 'লক্ষ্য:' : 'Target:'} {format(new Date(promise.target_date), 'MMM yyyy')}
                            </span>
                          )}
                          {promise.completion_date && (
                            <span className="text-green-500">
                              ✅ {language === 'bn' ? 'সম্পন্ন:' : 'Completed:'} {format(new Date(promise.completion_date), 'MMM d, yyyy')}
                            </span>
                          )}
                          {promise.promise_updates?.length > 0 && (
                            <button
                              onClick={() => setExpandedPromise(isExpanded ? null : promise.id)}
                              className={`flex items-center gap-1 ${isDark ? 'text-green-400 hover:text-green-300' : 'text-green-600 hover:text-green-700'}`}
                            >
                              📰 {promise.promise_updates.length} {language === 'bn' ? 'আপডেট' : 'updates'}
                              <svg className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Featured Image */}
                      {promise.featured_image && (
                        <div className="hidden md:block flex-shrink-0 w-24 h-24 relative rounded-xl overflow-hidden">
                          <Image
                            src={promise.featured_image}
                            alt=""
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Updates Section */}
                  {isExpanded && promise.promise_updates?.length > 0 && (
                    <div className={`border-t ${isDark ? 'border-gray-700 bg-gray-800/50' : 'border-gray-100 bg-gray-50'} p-6`}>
                      <h4 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {language === 'bn' ? 'অগ্রগতি আপডেট' : 'Progress Updates'}
                      </h4>
                      <div className="space-y-4">
                        {promise.promise_updates.map((update, idx) => (
                          <div
                            key={update.id}
                            className={`relative pl-6 ${idx !== promise.promise_updates.length - 1 ? 'pb-4 border-l-2 border-green-500/30' : ''}`}
                          >
                            <div className="absolute left-0 top-0 w-3 h-3 rounded-full bg-green-500 -translate-x-[5px]" />
                            <div className={`text-xs mb-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                              {format(new Date(update.created_at), 'MMM d, yyyy')}
                              {update.progress_change > 0 && (
                                <span className="ml-2 text-green-500">+{update.progress_change}%</span>
                              )}
                            </div>
                            <h5 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {getText(update.title_en, update.title_bn)}
                            </h5>
                            {update.description_en && (
                              <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                {getText(update.description_en, update.description_bn)}
                              </p>
                            )}
                            {update.images?.length > 0 && (
                              <div className="flex gap-2 mt-2">
                                {update.images.slice(0, 3).map((img, i) => (
                                  <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden">
                                    <Image src={img} alt="" fill className="object-cover" />
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Share Section */}
                  <div className={`border-t ${isDark ? 'border-gray-700' : 'border-gray-100'} px-6 py-3`}>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                        {language === 'bn' ? 'শেয়ার করুন:' : 'Share:'}
                      </span>
                      <SocialShare
                        url={`${siteConfig.url}/promises#${promise.id}`}
                        title={getText(promise.title_en, promise.title_bn)}
                        description={getText(promise.description_en, promise.description_bn)?.substring(0, 150)}
                        variant="icons"
                        size="sm"
                        showLabel={false}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
