'use client';

import { useTheme } from '@/providers/ThemeProvider';
import { useLanguage } from '@/providers/LanguageProvider';
import Link from 'next/link';
import { FaShieldAlt, FaArrowLeft } from 'react-icons/fa';

export default function PrivacyPage() {
  const { isDark } = useTheme();
  const { language } = useLanguage();

  const lastUpdated = 'December 2024';

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-green-600 to-green-800 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 py-20 text-center">
          <FaShieldAlt className="w-16 h-16 mx-auto mb-6 opacity-90" />
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {language === 'bn' ? 'গোপনীয়তা নীতি' : 'Privacy Policy'}
          </h1>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            {language === 'bn'
              ? 'আপনার গোপনীয়তা আমাদের কাছে গুরুত্বপূর্ণ'
              : 'Your privacy is important to us'}
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

        {/* Last Updated */}
        <p className={`mb-8 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          {language === 'bn' ? `সর্বশেষ আপডেট: ${lastUpdated}` : `Last Updated: ${lastUpdated}`}
        </p>

        {/* Content */}
        <div className={`prose max-w-none ${isDark ? 'prose-invert' : ''}`}>
          <div className={`rounded-xl p-8 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow space-y-8`}>

            {/* Introduction */}
            <section>
              <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {language === 'bn' ? 'ভূমিকা' : 'Introduction'}
              </h2>
              <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                {language === 'bn'
                  ? 'এস এম জাহাঙ্গীর হোসেনের অফিসিয়াল ওয়েবসাইটে স্বাগতম। এই গোপনীয়তা নীতিতে আমরা ব্যাখ্যা করি কিভাবে আমরা আপনার ব্যক্তিগত তথ্য সংগ্রহ, ব্যবহার এবং সুরক্ষিত রাখি। এই ওয়েবসাইট ব্যবহার করে আপনি এই নীতিতে বর্ণিত অনুশীলনগুলোতে সম্মত হন।'
                  : 'Welcome to the official website of S M Jahangir Hossain. This Privacy Policy explains how we collect, use, and protect your personal information. By using this website, you agree to the practices described in this policy.'}
              </p>
            </section>

            {/* Information We Collect */}
            <section>
              <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {language === 'bn' ? 'আমরা যে তথ্য সংগ্রহ করি' : 'Information We Collect'}
              </h2>
              <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                {language === 'bn' ? 'আমরা নিম্নলিখিত ধরনের তথ্য সংগ্রহ করতে পারি:' : 'We may collect the following types of information:'}
              </p>
              <ul className={`list-disc pl-6 space-y-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                <li>
                  <strong>{language === 'bn' ? 'ব্যক্তিগত তথ্য:' : 'Personal Information:'}</strong>{' '}
                  {language === 'bn'
                    ? 'নাম, ইমেইল ঠিকানা, ফোন নম্বর এবং ঠিকানা যখন আপনি স্বেচ্ছায় প্রদান করেন।'
                    : 'Name, email address, phone number, and address when you voluntarily provide them.'}
                </li>
                <li>
                  <strong>{language === 'bn' ? 'অর্ডার তথ্য:' : 'Order Information:'}</strong>{' '}
                  {language === 'bn'
                    ? 'আমাদের স্টোর থেকে কেনাকাটা করলে ডেলিভারি ঠিকানা এবং অর্ডার বিবরণ।'
                    : 'Delivery address and order details when you make purchases from our store.'}
                </li>
                <li>
                  <strong>{language === 'bn' ? 'ব্যবহারের তথ্য:' : 'Usage Data:'}</strong>{' '}
                  {language === 'bn'
                    ? 'আপনি কিভাবে আমাদের ওয়েবসাইট ব্যবহার করেন সে সম্পর্কে তথ্য, যেমন পরিদর্শন করা পৃষ্ঠা এবং ক্লিক করা লিঙ্ক।'
                    : 'Information about how you use our website, such as pages visited and links clicked.'}
                </li>
                <li>
                  <strong>{language === 'bn' ? 'ডিভাইস তথ্য:' : 'Device Information:'}</strong>{' '}
                  {language === 'bn'
                    ? 'ব্রাউজার টাইপ, আইপি অ্যাড্রেস এবং ডিভাইস শনাক্তকারী।'
                    : 'Browser type, IP address, and device identifiers.'}
                </li>
              </ul>
            </section>

            {/* How We Use Your Information */}
            <section>
              <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {language === 'bn' ? 'আমরা কিভাবে আপনার তথ্য ব্যবহার করি' : 'How We Use Your Information'}
              </h2>
              <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                {language === 'bn' ? 'আমরা আপনার তথ্য ব্যবহার করি:' : 'We use your information to:'}
              </p>
              <ul className={`list-disc pl-6 space-y-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                <li>{language === 'bn' ? 'অর্ডার প্রসেস এবং ডেলিভার করতে' : 'Process and deliver orders'}</li>
                <li>{language === 'bn' ? 'আপনার অনুসন্ধান এবং প্রশ্নের উত্তর দিতে' : 'Respond to your inquiries and questions'}</li>
                <li>{language === 'bn' ? 'আপডেট, ইভেন্ট এবং খবর পাঠাতে (আপনার অনুমতি নিয়ে)' : 'Send updates, events, and news (with your consent)'}</li>
                <li>{language === 'bn' ? 'আমাদের ওয়েবসাইট এবং সেবা উন্নত করতে' : 'Improve our website and services'}</li>
                <li>{language === 'bn' ? 'আইনি বাধ্যবাধকতা মেনে চলতে' : 'Comply with legal obligations'}</li>
              </ul>
            </section>

            {/* Data Protection */}
            <section>
              <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {language === 'bn' ? 'ডেটা সুরক্ষা' : 'Data Protection'}
              </h2>
              <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                {language === 'bn'
                  ? 'আমরা আপনার ব্যক্তিগত তথ্য সুরক্ষিত রাখতে যুক্তিসঙ্গত নিরাপত্তা ব্যবস্থা বাস্তবায়ন করি। এর মধ্যে রয়েছে এনক্রিপশন, নিরাপদ সার্ভার এবং অ্যাক্সেস নিয়ন্ত্রণ। তবে, কোনো ইন্টারনেট ট্রান্সমিশন সম্পূর্ণ নিরাপদ নয়।'
                  : 'We implement reasonable security measures to protect your personal information. This includes encryption, secure servers, and access controls. However, no internet transmission is completely secure.'}
              </p>
            </section>

            {/* Third-Party Sharing */}
            <section>
              <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {language === 'bn' ? 'তৃতীয় পক্ষের সাথে শেয়ারিং' : 'Third-Party Sharing'}
              </h2>
              <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                {language === 'bn'
                  ? 'আমরা আপনার ব্যক্তিগত তথ্য বিক্রি করি না। আমরা শুধুমাত্র নিম্নলিখিত ক্ষেত্রে তথ্য শেয়ার করতে পারি: অর্ডার ডেলিভারির জন্য ডেলিভারি পার্টনারদের সাথে, আইনি প্রয়োজনীয়তা মেনে চলতে এবং আপনার সম্মতিতে।'
                  : 'We do not sell your personal information. We may share information only in the following cases: with delivery partners for order fulfillment, to comply with legal requirements, and with your consent.'}
              </p>
            </section>

            {/* Cookies */}
            <section>
              <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {language === 'bn' ? 'কুকিজ' : 'Cookies'}
              </h2>
              <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                {language === 'bn'
                  ? 'আমাদের ওয়েবসাইট কুকিজ ব্যবহার করে আপনার ব্রাউজিং অভিজ্ঞতা উন্নত করতে। কুকিজ ছোট ফাইল যা আপনার ডিভাইসে সংরক্ষিত হয়। আপনি আপনার ব্রাউজার সেটিংসের মাধ্যমে কুকিজ পরিচালনা করতে পারেন।'
                  : 'Our website uses cookies to improve your browsing experience. Cookies are small files stored on your device. You can manage cookies through your browser settings.'}
              </p>
            </section>

            {/* Your Rights */}
            <section>
              <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {language === 'bn' ? 'আপনার অধিকার' : 'Your Rights'}
              </h2>
              <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                {language === 'bn' ? 'আপনার নিম্নলিখিত অধিকার রয়েছে:' : 'You have the right to:'}
              </p>
              <ul className={`list-disc pl-6 space-y-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                <li>{language === 'bn' ? 'আমরা আপনার সম্পর্কে যে তথ্য রাখি তা অ্যাক্সেস করতে' : 'Access the information we hold about you'}</li>
                <li>{language === 'bn' ? 'ভুল তথ্য সংশোধনের অনুরোধ করতে' : 'Request correction of inaccurate information'}</li>
                <li>{language === 'bn' ? 'আপনার তথ্য মুছে ফেলার অনুরোধ করতে' : 'Request deletion of your information'}</li>
                <li>{language === 'bn' ? 'মার্কেটিং যোগাযোগ থেকে অপ্ট-আউট করতে' : 'Opt-out of marketing communications'}</li>
              </ul>
            </section>

            {/* Contact Us */}
            <section>
              <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {language === 'bn' ? 'যোগাযোগ করুন' : 'Contact Us'}
              </h2>
              <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                {language === 'bn'
                  ? 'এই গোপনীয়তা নীতি সম্পর্কে আপনার কোনো প্রশ্ন থাকলে, অনুগ্রহ করে আমাদের সাথে যোগাযোগ করুন contact@smjahangir.com এ।'
                  : 'If you have any questions about this Privacy Policy, please contact us at contact@smjahangir.com.'}
              </p>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}
