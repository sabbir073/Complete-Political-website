'use client';

import { useTheme } from '@/providers/ThemeProvider';
import { useLanguage } from '@/providers/LanguageProvider';
import Link from 'next/link';
import { FaGamepad, FaArrowLeft, FaBell, FaStar, FaMedal, FaCrown } from 'react-icons/fa';

export default function GamificationPage() {
  const { isDark } = useTheme();
  const { language } = useLanguage();

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-purple-600 to-indigo-700 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M50 50c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10s-10-4.477-10-10 4.477-10 10-10zM10 10c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10S0 25.523 0 20s4.477-10 10-10zm10 8c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8zm40 40c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8z' /%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 py-20 text-center">
          <FaGamepad className="w-20 h-20 mx-auto mb-6 opacity-90" />
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {language === 'bn' ? 'গ্যামিফিকেশন' : 'Gamification'}
          </h1>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            {language === 'bn'
              ? 'পয়েন্ট অর্জন করুন, লেভেল আপ করুন এবং আপনার অংশগ্রহণের জন্য পুরস্কার পান'
              : 'Earn points, level up, and get rewarded for your participation'}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Back Link */}
        <Link
          href="/"
          className={`inline-flex items-center gap-2 mb-8 ${isDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
        >
          <FaArrowLeft /> {language === 'bn' ? 'হোমে ফিরুন' : 'Back to Home'}
        </Link>

        {/* Coming Soon Card */}
        <div className={`text-center py-16 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-xl`}>
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center">
            <FaGamepad className="w-12 h-12 text-white" />
          </div>

          <div className="inline-block px-4 py-2 mb-6 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-sm font-bold">
            {language === 'bn' ? 'শীঘ্রই আসছে' : 'Coming Soon'}
          </div>

          <h2 className={`text-3xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {language === 'bn' ? 'রিওয়ার্ড সিস্টেম' : 'Rewards System'}
          </h2>

          <p className={`text-lg max-w-xl mx-auto mb-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {language === 'bn'
              ? 'আমরা একটি গ্যামিফিকেশন সিস্টেম তৈরি করছি যেখানে আপনি বিভিন্ন কার্যকলাপের জন্য পয়েন্ট অর্জন করতে পারবেন, লেভেল আপ করতে পারবেন এবং বিশেষ পুরস্কার পেতে পারবেন।'
              : 'We are building a gamification system where you can earn points for various activities, level up, and receive special rewards for your engagement.'}
          </p>

          {/* Levels Preview */}
          <div className="flex flex-wrap justify-center gap-4 mb-8 px-4">
            <div className={`px-6 py-4 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <FaStar className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {language === 'bn' ? 'সমর্থক' : 'Supporter'}
              </h3>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Level 1
              </p>
            </div>
            <div className={`px-6 py-4 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <FaMedal className="w-8 h-8 mx-auto mb-2 text-blue-500" />
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {language === 'bn' ? 'অ্যাডভোকেট' : 'Advocate'}
              </h3>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Level 2
              </p>
            </div>
            <div className={`px-6 py-4 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <FaCrown className="w-8 h-8 mx-auto mb-2 text-orange-500" />
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {language === 'bn' ? 'চ্যাম্পিয়ন' : 'Champion'}
              </h3>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Level 3
              </p>
            </div>
          </div>

          {/* Features Preview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg mx-auto mb-8 px-4 text-left">
            <div className={`p-4 rounded-xl flex items-start gap-3 ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <span className="text-2xl">⭐</span>
              <div>
                <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {language === 'bn' ? 'পয়েন্ট সিস্টেম' : 'Point System'}
                </h4>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {language === 'bn' ? 'কার্যকলাপের জন্য পয়েন্ট অর্জন করুন' : 'Earn points for activities'}
                </p>
              </div>
            </div>
            <div className={`p-4 rounded-xl flex items-start gap-3 ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <span className="text-2xl">🏅</span>
              <div>
                <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {language === 'bn' ? 'ব্যাজ' : 'Badges'}
                </h4>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {language === 'bn' ? 'অর্জনের জন্য ব্যাজ পান' : 'Unlock achievement badges'}
                </p>
              </div>
            </div>
            <div className={`p-4 rounded-xl flex items-start gap-3 ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <span className="text-2xl">📊</span>
              <div>
                <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {language === 'bn' ? 'লিডারবোর্ড' : 'Leaderboard'}
                </h4>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {language === 'bn' ? 'শীর্ষ অংশগ্রহণকারীদের দেখুন' : 'See top participants'}
                </p>
              </div>
            </div>
            <div className={`p-4 rounded-xl flex items-start gap-3 ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <span className="text-2xl">🎁</span>
              <div>
                <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {language === 'bn' ? 'পুরস্কার' : 'Rewards'}
                </h4>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {language === 'bn' ? 'বিশেষ পুরস্কার উপার্জন করুন' : 'Earn special rewards'}
                </p>
              </div>
            </div>
          </div>

          {/* Notify Me Button */}
          <button
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full font-medium hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
          >
            <FaBell /> {language === 'bn' ? 'লঞ্চ হলে জানাবেন' : 'Notify Me on Launch'}
          </button>
        </div>
      </div>
    </div>
  );
}
