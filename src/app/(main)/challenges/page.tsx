'use client';

import { useTheme } from '@/providers/ThemeProvider';
import { useLanguage } from '@/providers/LanguageProvider';
import Link from 'next/link';
import { FaTrophy, FaArrowLeft, FaBell } from 'react-icons/fa';

export default function ChallengesPage() {
  const { isDark } = useTheme();
  const { language } = useLanguage();

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-orange-600 to-red-700 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 py-20 text-center">
          <FaTrophy className="w-20 h-20 mx-auto mb-6 opacity-90" />
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {language === 'bn' ? 'চ্যালেঞ্জ' : 'Challenges'}
          </h1>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            {language === 'bn'
              ? 'সামাজিক চ্যালেঞ্জে অংশ নিন এবং আপনার এলাকার উন্নয়নে অবদান রাখুন'
              : 'Participate in community challenges and contribute to your area\'s development'}
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
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-r from-orange-500 to-red-600 flex items-center justify-center">
            <FaTrophy className="w-12 h-12 text-white" />
          </div>

          <div className="inline-block px-4 py-2 mb-6 rounded-full bg-gradient-to-r from-orange-500 to-red-600 text-white text-sm font-bold">
            {language === 'bn' ? 'শীঘ্রই আসছে' : 'Coming Soon'}
          </div>

          <h2 className={`text-3xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {language === 'bn' ? 'কমিউনিটি চ্যালেঞ্জ' : 'Community Challenges'}
          </h2>

          <p className={`text-lg max-w-xl mx-auto mb-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {language === 'bn'
              ? 'আমরা একটি উত্তেজনাপূর্ণ চ্যালেঞ্জ প্ল্যাটফর্ম তৈরি করছি যেখানে আপনি সামাজিক কাজে অংশ নিতে পারবেন, পয়েন্ট অর্জন করতে পারবেন এবং আপনার এলাকার উন্নয়নে অবদান রাখতে পারবেন।'
              : 'We are building an exciting challenge platform where you can participate in community activities, earn points, and contribute to your area\'s development.'}
          </p>

          {/* Features Preview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto mb-8 px-4">
            <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className="text-3xl mb-2">🌱</div>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {language === 'bn' ? 'পরিবেশ চ্যালেঞ্জ' : 'Green Challenges'}
              </h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {language === 'bn' ? 'গাছ লাগান, পরিষ্কার রাখুন' : 'Plant trees, keep clean'}
              </p>
            </div>
            <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className="text-3xl mb-2">🤝</div>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {language === 'bn' ? 'সেবা চ্যালেঞ্জ' : 'Service Challenges'}
              </h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {language === 'bn' ? 'প্রতিবেশীদের সাহায্য করুন' : 'Help your neighbors'}
              </p>
            </div>
            <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className="text-3xl mb-2">🏆</div>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {language === 'bn' ? 'পুরস্কার' : 'Rewards'}
              </h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {language === 'bn' ? 'পয়েন্ট এবং ব্যাজ অর্জন করুন' : 'Earn points and badges'}
              </p>
            </div>
          </div>

          {/* Notify Me Button */}
          <button
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-full font-medium hover:from-orange-700 hover:to-red-700 transition-all shadow-lg hover:shadow-xl"
          >
            <FaBell /> {language === 'bn' ? 'লঞ্চ হলে জানাবেন' : 'Notify Me on Launch'}
          </button>
        </div>
      </div>
    </div>
  );
}
