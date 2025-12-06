"use client";

import { useState, useEffect } from 'react';
import { useLanguage } from '@/providers/LanguageProvider';
import { useTheme } from '@/providers/ThemeProvider';
import Link from 'next/link';

// Types
interface ThanaStats {
  key: string;
  label: { en: string; bn: string };
  total: number;
  verified: number;
}

interface CategoryStats {
  key: string;
  label: { en: string; bn: string };
  count: number;
}

interface Stats {
  total: number;
  verified: number;
  pending: number;
  activeThanas: number;
  byThana: ThanaStats[];
  byCategory: CategoryStats[];
}

interface VolunteerProfile {
  volunteer_id: string;
  name: string;
  name_bn?: string;
  thana: { key: string; label: { en: string; bn: string } };
  ward: string;
  categories: { key: string; label: { en: string; bn: string } }[];
  badges: { key: string; name_en: string; name_bn: string; icon: string }[];
  status: string;
  member_since: string;
}

// Thana options
const thanaOptions = [
  { value: 'uttara_east', label: { en: 'Uttara East', bn: 'উত্তরা পূর্ব' } },
  { value: 'uttara_west', label: { en: 'Uttara West', bn: 'উত্তরা পশ্চিম' } },
  { value: 'turag', label: { en: 'Turag', bn: 'তুরাগ' } },
  { value: 'dakshinkhan', label: { en: 'Dakshinkhan', bn: 'দক্ষিণখান' } },
  { value: 'uttarkhan', label: { en: 'Uttarkhan', bn: 'উত্তরখান' } },
  { value: 'khilkhet', label: { en: 'Khilkhet', bn: 'খিলক্ষেত' } },
  { value: 'airport', label: { en: 'Airport', bn: 'বিমানবন্দর' } },
  { value: 'vatara', label: { en: 'Vatara', bn: 'ভাটারা' } },
];

// Category options
const categoryOptions = [
  { value: 'socialActivism', label: { en: 'Social Activism', bn: 'সামাজিক সক্রিয়তা' } },
  { value: 'disasterManagement', label: { en: 'Disaster Management', bn: 'দুর্যোগ ব্যবস্থাপনা' } },
  { value: 'socialMediaActivism', label: { en: 'Social Media Activism', bn: 'সোশ্যাল মিডিয়া সক্রিয়তা' } },
  { value: 'creativeWriting', label: { en: 'Creative Writing', bn: 'সৃজনশীল লেখালেখি' } },
  { value: 'itSupport', label: { en: 'IT Support', bn: 'আইটি সহায়তা' } },
  { value: 'healthcareSupport', label: { en: 'Healthcare Support', bn: 'স্বাস্থ্যসেবা সহায়তা' } },
  { value: 'educationTutoring', label: { en: 'Education & Tutoring', bn: 'শিক্ষা ও টিউটরিং' } },
  { value: 'legalAid', label: { en: 'Legal Aid', bn: 'আইনি সহায়তা' } },
  { value: 'eventManagement', label: { en: 'Event Management', bn: 'ইভেন্ট ম্যানেজমেন্ট' } },
  { value: 'securityDiscipline', label: { en: 'Security & Discipline', bn: 'নিরাপত্তা ও শৃঙ্খলা' } },
  { value: 'transportationLogistics', label: { en: 'Transportation & Logistics', bn: 'পরিবহন ও লজিস্টিক্স' } },
  { value: 'mediaPhotography', label: { en: 'Media & Photography', bn: 'মিডিয়া ও ফটোগ্রাফি' } },
  { value: 'financeAccounting', label: { en: 'Finance & Accounting', bn: 'অর্থ ও হিসাব' } },
  { value: 'womensAffairs', label: { en: "Women's Affairs", bn: 'নারী বিষয়ক' } },
  { value: 'youthMobilization', label: { en: 'Youth Mobilization', bn: 'যুব সংগঠন' } },
];

// Ward options for Dhaka-18
const wardOptions = ['01', '17', '43', '44', '45', '46', '47', '48', '49', '50', '51', '52', '53', '54'];

export default function VolunteerHubPage() {
  const { language } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [activeTab, setActiveTab] = useState<'search' | 'register'>('register');
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  // Search state
  const [searchId, setSearchId] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResult, setSearchResult] = useState<VolunteerProfile | null>(null);
  const [searchError, setSearchError] = useState('');

  // Registration form state
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    age: '',
    thana: '',
    ward: '',
    address: '',
    categories: [] as string[],
    why_sm_jahangir: '',
    email: '',
    photo_url: ''
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [registrationSuccess, setRegistrationSuccess] = useState<{ volunteer_id: string } | null>(null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Translations
  const t = {
    title: language === 'bn' ? 'স্বেচ্ছাসেবক হাব' : 'Volunteer Hub',
    subtitle: language === 'bn' ? 'ঢাকা-১৮ এর পরিবর্তনের আন্দোলনে যোগ দিন' : 'Join the Movement for Change in Dhaka-18',
    searchTab: language === 'bn' ? 'স্বেচ্ছাসেবক খুঁজুন' : 'Find Volunteer',
    registerTab: language === 'bn' ? 'স্বেচ্ছাসেবক হন' : 'Become a Volunteer',
    totalVolunteers: language === 'bn' ? 'মোট স্বেচ্ছাসেবক' : 'Total Volunteers',
    verified: language === 'bn' ? 'যাচাইকৃত' : 'Verified',
    pending: language === 'bn' ? 'অপেক্ষমান' : 'Pending',
    thanasCovered: language === 'bn' ? 'থানা কভারেজ' : 'Thanas Covered',
    searchPlaceholder: language === 'bn' ? '৮ সংখ্যার আইডি দিন' : 'Enter 8-digit ID',
    searchBtn: language === 'bn' ? 'খুঁজুন' : 'Search',
    name: language === 'bn' ? 'পূর্ণ নাম' : 'Full Name',
    phone: language === 'bn' ? 'ফোন নম্বর' : 'Phone Number',
    age: language === 'bn' ? 'বয়স' : 'Age',
    thana: language === 'bn' ? 'থানা' : 'Thana',
    ward: language === 'bn' ? 'ওয়ার্ড' : 'Ward',
    address: language === 'bn' ? 'ঠিকানা' : 'Address',
    categories: language === 'bn' ? 'ক্যাটাগরি নির্বাচন করুন' : 'Select Categories',
    whyQuestion: language === 'bn' ? 'আপনি কেন মনে করেন এস এম জাহাঙ্গীর ঢাকা-১৮ এর এমপি হওয়া উচিত?' : 'Why do you think S M Jahangir should be MP for Dhaka-18?',
    email: language === 'bn' ? 'ইমেইল (ঐচ্ছিক)' : 'Email (Optional)',
    photo: language === 'bn' ? 'ছবি আপলোড করুন (ঐচ্ছিক)' : 'Upload Photo (Optional)',
    photoUploading: language === 'bn' ? 'ছবি আপলোড হচ্ছে...' : 'Uploading photo...',
    submit: language === 'bn' ? 'নিবন্ধন করুন' : 'Register',
    selectThana: language === 'bn' ? 'থানা নির্বাচন করুন' : 'Select Thana',
    selectWard: language === 'bn' ? 'ওয়ার্ড নির্বাচন করুন' : 'Select Ward',
    successTitle: language === 'bn' ? 'নিবন্ধন সফল!' : 'Registration Successful!',
    successMessage: language === 'bn' ? 'আপনার স্বেচ্ছাসেবক আইডি:' : 'Your Volunteer ID:',
    saveIdMessage: language === 'bn' ? 'এই আইডি সংরক্ষণ করুন। প্রোফাইল দেখতে এবং পরিচয়পত্র ডাউনলোড করতে এটি ব্যবহার করুন।' : 'Save this ID. Use it to view your profile and download your ID card.',
    viewProfile: language === 'bn' ? 'প্রোফাইল দেখুন' : 'View Profile',
    registerAnother: language === 'bn' ? 'আরেকজন নিবন্ধন করুন' : 'Register Another',
    thanaWise: language === 'bn' ? 'থানা ভিত্তিক স্বেচ্ছাসেবক' : 'Volunteers by Thana',
    categoryWise: language === 'bn' ? 'ক্যাটাগরি ভিত্তিক' : 'By Category',
    memberSince: language === 'bn' ? 'সদস্য হয়েছেন' : 'Member Since',
    notFound: language === 'bn' ? 'কোনো স্বেচ্ছাসেবক পাওয়া যায়নি' : 'No volunteer found',
    verifiedBadge: language === 'bn' ? 'যাচাইকৃত' : 'Verified',
    pendingBadge: language === 'bn' ? 'যাচাই অপেক্ষমান' : 'Pending Verification'
  };

  // Fetch stats on mount
  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/volunteer-hub/stats');
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchId || searchId.length !== 8) {
      setSearchError(language === 'bn' ? 'অনুগ্রহ করে ৮ সংখ্যার আইডি দিন' : 'Please enter a valid 8-digit ID');
      return;
    }

    setSearchLoading(true);
    setSearchError('');
    setSearchResult(null);

    try {
      const res = await fetch(`/api/volunteer-hub/search?id=${searchId}`);
      const data = await res.json();

      if (data.success) {
        setSearchResult(data.volunteer);
      } else {
        setSearchError(data.error || t.notFound);
      }
    } catch {
      setSearchError(language === 'bn' ? 'একটি ত্রুটি হয়েছে' : 'An error occurred');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleCategoryToggle = (category: string) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setFormError(language === 'bn' ? 'শুধুমাত্র ছবি আপলোড করা যাবে' : 'Only images are allowed');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setFormError(language === 'bn' ? 'ছবির সাইজ ৫MB এর বেশি হতে পারবে না' : 'Image size must be less than 5MB');
      return;
    }

    setPhotoUploading(true);
    setFormError('');

    try {
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload to S3
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);

      const res = await fetch('/api/volunteer-hub/upload', {
        method: 'POST',
        body: uploadFormData
      });
      const data = await res.json();

      if (data.success) {
        setFormData(prev => ({ ...prev, photo_url: data.url }));
      } else {
        setFormError(data.error || (language === 'bn' ? 'ছবি আপলোড ব্যর্থ হয়েছে' : 'Failed to upload photo'));
        setPhotoPreview(null);
      }
    } catch {
      setFormError(language === 'bn' ? 'ছবি আপলোড ব্যর্থ হয়েছে' : 'Failed to upload photo');
      setPhotoPreview(null);
    } finally {
      setPhotoUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');

    try {
      const res = await fetch('/api/volunteer-hub/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (data.success) {
        setRegistrationSuccess({ volunteer_id: data.data.volunteer_id });
        fetchStats(); // Refresh stats
      } else {
        setFormError(data.error);
      }
    } catch {
      setFormError(language === 'bn' ? 'একটি ত্রুটি হয়েছে। আবার চেষ্টা করুন।' : 'An error occurred. Please try again.');
    } finally {
      setFormLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      age: '',
      thana: '',
      ward: '',
      address: '',
      categories: [],
      why_sm_jahangir: '',
      email: '',
      photo_url: ''
    });
    setRegistrationSuccess(null);
    setFormError('');
    setPhotoPreview(null);
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Hero Section */}
      <div className={`relative py-16 md:py-24 ${isDark ? 'bg-gradient-to-br from-green-900 via-green-800 to-emerald-900' : 'bg-gradient-to-br from-green-600 via-green-500 to-emerald-600'}`}>
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative container mx-auto px-4 text-center text-white">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm mb-6">
            <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{t.title}</h1>
          <p className="text-xl md:text-2xl opacity-90 max-w-2xl mx-auto">{t.subtitle}</p>
        </div>
      </div>

      {/* Stats Section */}
      <div className="container mx-auto px-4 -mt-12 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: t.totalVolunteers, value: stats?.total || 0, color: 'green' },
            { label: t.verified, value: stats?.verified || 0, color: 'blue' },
            { label: t.pending, value: stats?.pending || 0, color: 'yellow' },
            { label: t.thanasCovered, value: stats?.activeThanas || 0, color: 'purple' }
          ].map((stat, idx) => (
            <div
              key={idx}
              className={`rounded-xl p-6 text-center shadow-lg ${
                isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white'
              }`}
            >
              <div className={`text-3xl md:text-4xl font-bold mb-2 ${
                stat.color === 'green' ? 'text-green-500' :
                stat.color === 'blue' ? 'text-blue-500' :
                stat.color === 'yellow' ? 'text-yellow-500' : 'text-purple-500'
              }`}>
                {loading ? '...' : stat.value}
              </div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className={`inline-flex rounded-xl p-1 ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`}>
            <button
              onClick={() => setActiveTab('search')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === 'search'
                  ? isDark
                    ? 'bg-green-600 text-white'
                    : 'bg-green-500 text-white'
                  : isDark
                  ? 'text-gray-400 hover:text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {t.searchTab}
            </button>
            <button
              onClick={() => setActiveTab('register')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === 'register'
                  ? isDark
                    ? 'bg-green-600 text-white'
                    : 'bg-green-500 text-white'
                  : isDark
                  ? 'text-gray-400 hover:text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {t.registerTab}
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className={`max-w-2xl mx-auto rounded-2xl p-6 md:p-8 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-xl`}>
          {activeTab === 'search' ? (
            /* Search Tab */
            <div>
              <div className="flex gap-3 mb-6">
                <input
                  type="text"
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value.replace(/\D/g, '').slice(0, 8))}
                  placeholder={t.searchPlaceholder}
                  className={`flex-1 px-4 py-3 rounded-xl border text-lg tracking-widest text-center font-mono ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                  maxLength={8}
                />
                <button
                  onClick={handleSearch}
                  disabled={searchLoading}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
                >
                  {searchLoading ? '...' : t.searchBtn}
                </button>
              </div>

              {searchError && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-center mb-6">
                  {searchError}
                </div>
              )}

              {searchResult && (
                <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {searchResult.name}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      searchResult.status === 'verified'
                        ? 'bg-green-500/20 text-green-500'
                        : 'bg-yellow-500/20 text-yellow-500'
                    }`}>
                      {searchResult.status === 'verified' ? t.verifiedBadge : t.pendingBadge}
                    </span>
                  </div>
                  <div className={`space-y-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    <p><strong>ID:</strong> {searchResult.volunteer_id}</p>
                    <p><strong>{t.thana}:</strong> {language === 'bn' ? searchResult.thana.label.bn : searchResult.thana.label.en}</p>
                    <p><strong>{t.ward}:</strong> {searchResult.ward}</p>
                    <p><strong>{t.memberSince}:</strong> {new Date(searchResult.member_since).toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US')}</p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {searchResult.categories.map(cat => (
                        <span key={cat.key} className={`px-2 py-1 rounded-md text-xs ${isDark ? 'bg-gray-600' : 'bg-gray-200'}`}>
                          {language === 'bn' ? cat.label.bn : cat.label.en}
                        </span>
                      ))}
                    </div>
                    {searchResult.badges.length > 0 && (
                      <div className="flex gap-2 mt-3">
                        {searchResult.badges.map((badge, idx) => (
                          <span key={idx} className="text-xl" title={language === 'bn' ? badge.name_bn : badge.name_en}>
                            {badge.icon}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <Link
                    href={`/volunteer-hub/profile/${searchResult.volunteer_id}`}
                    className="mt-4 inline-block px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    {t.viewProfile}
                  </Link>
                </div>
              )}
            </div>
          ) : registrationSuccess ? (
            /* Success State */
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/20 text-green-500 mb-6">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t.successTitle}
              </h2>
              <p className={`mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{t.successMessage}</p>
              <div className="text-4xl font-mono font-bold text-green-500 mb-4 tracking-widest">
                {registrationSuccess.volunteer_id}
              </div>
              <p className={`text-sm mb-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {t.saveIdMessage}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href={`/volunteer-hub/profile/${registrationSuccess.volunteer_id}`}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-colors"
                >
                  {t.viewProfile}
                </Link>
                <button
                  onClick={resetForm}
                  className={`px-6 py-3 rounded-xl font-medium transition-colors ${
                    isDark
                      ? 'bg-gray-700 hover:bg-gray-600 text-white'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                  }`}
                >
                  {t.registerAnother}
                </button>
              </div>
            </div>
          ) : (
            /* Registration Form */
            <form onSubmit={handleSubmit} className="space-y-6">
              {formError && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500">
                  {formError}
                </div>
              )}

              {/* Name */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t.name} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className={`w-full px-4 py-3 rounded-xl border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-gray-50 border-gray-300 text-gray-900'
                  }`}
                />
              </div>

              {/* Phone & Age */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t.phone} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="01XXXXXXXXX"
                    required
                    className={`w-full px-4 py-3 rounded-xl border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-gray-50 border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t.age} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    min="16"
                    max="100"
                    required
                    className={`w-full px-4 py-3 rounded-xl border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-gray-50 border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
              </div>

              {/* Thana & Ward */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t.thana} <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.thana}
                    onChange={(e) => setFormData({ ...formData, thana: e.target.value })}
                    required
                    className={`w-full px-4 py-3 rounded-xl border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-gray-50 border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="">{t.selectThana}</option>
                    {thanaOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>
                        {language === 'bn' ? opt.label.bn : opt.label.en}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t.ward} <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.ward}
                    onChange={(e) => setFormData({ ...formData, ward: e.target.value })}
                    required
                    className={`w-full px-4 py-3 rounded-xl border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-gray-50 border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="">{t.selectWard}</option>
                    {wardOptions.map(ward => (
                      <option key={ward} value={ward}>Ward {ward}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Address */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t.address} <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                  rows={2}
                  className={`w-full px-4 py-3 rounded-xl border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-gray-50 border-gray-300 text-gray-900'
                  }`}
                />
              </div>

              {/* Categories */}
              <div>
                <label className={`block text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t.categories} <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {categoryOptions.map(cat => (
                    <label
                      key={cat.value}
                      className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                        formData.categories.includes(cat.value)
                          ? isDark
                            ? 'bg-green-900/50 border-green-500'
                            : 'bg-green-50 border-green-500'
                          : isDark
                          ? 'bg-gray-700 border-gray-600'
                          : 'bg-gray-50 border-gray-200'
                      } border`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.categories.includes(cat.value)}
                        onChange={() => handleCategoryToggle(cat.value)}
                        className="w-4 h-4 rounded text-green-600"
                      />
                      <span className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {language === 'bn' ? cat.label.bn : cat.label.en}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Why SM Jahangir */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t.whyQuestion} <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.why_sm_jahangir}
                  onChange={(e) => setFormData({ ...formData, why_sm_jahangir: e.target.value })}
                  required
                  rows={4}
                  className={`w-full px-4 py-3 rounded-xl border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-gray-50 border-gray-300 text-gray-900'
                  }`}
                />
              </div>

              {/* Photo Upload */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t.photo}
                </label>
                <div className="flex items-center gap-4">
                  {/* Photo Preview */}
                  <div className={`w-20 h-20 rounded-full overflow-hidden border-2 flex-shrink-0 ${
                    isDark ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-gray-100'
                  }`}>
                    {photoPreview || formData.photo_url ? (
                      <img
                        src={photoPreview || formData.photo_url}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className={`w-8 h-8 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                        </svg>
                      </div>
                    )}
                  </div>
                  {/* Upload Button */}
                  <div className="flex-1">
                    <label className={`cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-lg border ${
                      isDark
                        ? 'border-gray-600 bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                    } ${photoUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                      {photoUploading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                          <span>{t.photoUploading}</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>{language === 'bn' ? 'ছবি নির্বাচন করুন' : 'Choose Photo'}</span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        disabled={photoUploading}
                        className="hidden"
                      />
                    </label>
                    <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      {language === 'bn' ? 'সর্বোচ্চ ৫MB' : 'Max 5MB'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Email */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t.email}
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full px-4 py-3 rounded-xl border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-gray-50 border-gray-300 text-gray-900'
                  }`}
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={formLoading}
                className="w-full py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-lg transition-colors disabled:opacity-50"
              >
                {formLoading ? '...' : t.submit}
              </button>
            </form>
          )}
        </div>

        {/* Thana-wise Stats */}
        <div className="mt-12">
          <h2 className={`text-2xl font-bold mb-6 text-center ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {t.thanaWise}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats?.byThana.map(thana => (
              <div
                key={thana.key}
                className={`p-4 rounded-xl text-center ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-md`}
              >
                <div className={`text-2xl font-bold mb-1 ${thana.total > 0 ? 'text-green-500' : isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  {thana.total}
                </div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {language === 'bn' ? thana.label.bn : thana.label.en}
                </div>
                {thana.verified > 0 && (
                  <div className="text-xs text-green-500 mt-1">
                    {thana.verified} {t.verified.toLowerCase()}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Category Stats */}
        {stats && stats.byCategory.length > 0 && (
          <div className="mt-12">
            <h2 className={`text-2xl font-bold mb-6 text-center ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t.categoryWise}
            </h2>
            <div className="flex flex-wrap justify-center gap-3">
              {stats.byCategory.slice(0, 10).map(cat => (
                <div
                  key={cat.key}
                  className={`px-4 py-2 rounded-full ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-md flex items-center gap-2`}
                >
                  <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {language === 'bn' ? cat.label.bn : cat.label.en}
                  </span>
                  <span className="text-xs font-bold text-green-500">{cat.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
