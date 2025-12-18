'use client';

import { useTheme } from '@/providers/ThemeProvider';
import { useLanguage } from '@/providers/LanguageProvider';
import Link from 'next/link';
import { FaUniversalAccess, FaArrowLeft, FaKeyboard, FaEye, FaMobileAlt, FaVolumeUp, FaCheck } from 'react-icons/fa';

export default function AccessibilityPage() {
  const { isDark } = useTheme();
  const { language } = useLanguage();

  const features = [
    {
      icon: FaEye,
      title: { en: 'Visual Accessibility', bn: 'দৃষ্টি প্রতিবন্ধী সহায়তা' },
      description: {
        en: 'High contrast mode, adjustable text sizes, and clear visual hierarchy to ensure content is readable for users with visual impairments.',
        bn: 'উচ্চ কনট্রাস্ট মোড, সামঞ্জস্যযোগ্য টেক্সট সাইজ এবং পরিষ্কার ভিজ্যুয়াল হায়ারার্কি যাতে দৃষ্টি প্রতিবন্ধী ব্যবহারকারীদের জন্য কন্টেন্ট পড়া সহজ হয়।',
      },
      items: [
        { en: 'Dark/Light theme toggle', bn: 'ডার্ক/লাইট থিম টগল' },
        { en: 'Sufficient color contrast', bn: 'পর্যাপ্ত রঙের কনট্রাস্ট' },
        { en: 'Scalable text and images', bn: 'স্কেলযোগ্য টেক্সট এবং ছবি' },
        { en: 'Alt text for images', bn: 'ছবির জন্য অল্ট টেক্সট' },
      ],
    },
    {
      icon: FaKeyboard,
      title: { en: 'Keyboard Navigation', bn: 'কীবোর্ড নেভিগেশন' },
      description: {
        en: 'Full keyboard accessibility allows users to navigate the entire website without using a mouse.',
        bn: 'সম্পূর্ণ কীবোর্ড অ্যাক্সেসিবিলিটি ব্যবহারকারীদের মাউস ছাড়াই পুরো ওয়েবসাইট নেভিগেট করতে দেয়।',
      },
      items: [
        { en: 'Tab key navigation', bn: 'Tab কী নেভিগেশন' },
        { en: 'Focus indicators', bn: 'ফোকাস ইন্ডিকেটর' },
        { en: 'Skip navigation links', bn: 'স্কিপ নেভিগেশন লিঙ্ক' },
        { en: 'Keyboard shortcuts', bn: 'কীবোর্ড শর্টকাট' },
      ],
    },
    {
      icon: FaMobileAlt,
      title: { en: 'Responsive Design', bn: 'রেসপনসিভ ডিজাইন' },
      description: {
        en: 'Our website adapts to all screen sizes and devices, ensuring a consistent experience across desktop, tablet, and mobile.',
        bn: 'আমাদের ওয়েবসাইট সব স্ক্রিন সাইজ এবং ডিভাইসে অ্যাডাপ্ট হয়, ডেস্কটপ, ট্যাবলেট এবং মোবাইলে একই রকম অভিজ্ঞতা নিশ্চিত করে।',
      },
      items: [
        { en: 'Mobile-friendly interface', bn: 'মোবাইল-বান্ধব ইন্টারফেস' },
        { en: 'Touch-friendly buttons', bn: 'টাচ-বান্ধব বাটন' },
        { en: 'Flexible layouts', bn: 'নমনীয় লেআউট' },
        { en: 'Readable on all devices', bn: 'সব ডিভাইসে পড়ার উপযোগী' },
      ],
    },
    {
      icon: FaVolumeUp,
      title: { en: 'Screen Reader Support', bn: 'স্ক্রিন রিডার সাপোর্ট' },
      description: {
        en: 'Semantic HTML and ARIA labels ensure compatibility with screen readers and assistive technologies.',
        bn: 'সিমান্টিক HTML এবং ARIA লেবেল স্ক্রিন রিডার এবং সহায়ক প্রযুক্তির সাথে সামঞ্জস্যতা নিশ্চিত করে।',
      },
      items: [
        { en: 'Semantic HTML structure', bn: 'সিমান্টিক HTML স্ট্রাকচার' },
        { en: 'ARIA labels and roles', bn: 'ARIA লেবেল এবং রোল' },
        { en: 'Descriptive link text', bn: 'বর্ণনামূলক লিঙ্ক টেক্সট' },
        { en: 'Form field labels', bn: 'ফর্ম ফিল্ড লেবেল' },
      ],
    },
  ];

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-teal-600 to-teal-800 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 py-20 text-center">
          <FaUniversalAccess className="w-16 h-16 mx-auto mb-6 opacity-90" />
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {language === 'bn' ? 'অ্যাক্সেসিবিলিটি' : 'Accessibility'}
          </h1>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            {language === 'bn'
              ? 'আমরা সবার জন্য একটি অন্তর্ভুক্তিমূলক ওয়েব অভিজ্ঞতা তৈরি করতে প্রতিশ্রুতিবদ্ধ'
              : 'We are committed to creating an inclusive web experience for everyone'}
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

        {/* Commitment Statement */}
        <section className="mb-12">
          <div className={`rounded-xl p-8 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow`}>
            <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {language === 'bn' ? 'আমাদের প্রতিশ্রুতি' : 'Our Commitment'}
            </h2>
            <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              {language === 'bn'
                ? 'এস এম জাহাঙ্গীর হোসেনের অফিসিয়াল ওয়েবসাইট সবার জন্য অ্যাক্সেসযোগ্য করতে প্রতিশ্রুতিবদ্ধ, যার মধ্যে প্রতিবন্ধী ব্যক্তিরাও অন্তর্ভুক্ত। আমরা Web Content Accessibility Guidelines (WCAG) 2.1 অনুসরণ করি এবং ক্রমাগত আমাদের ওয়েবসাইটের অ্যাক্সেসিবিলিটি উন্নত করার চেষ্টা করি। গণতন্ত্র সবার জন্য, এবং তাই আমাদের ডিজিটাল উপস্থিতিও সবার জন্য হওয়া উচিত।'
                : 'The official website of S M Jahangir Hossain is committed to being accessible to everyone, including people with disabilities. We follow the Web Content Accessibility Guidelines (WCAG) 2.1 and continuously strive to improve the accessibility of our website. Democracy is for everyone, and so should be our digital presence.'}
            </p>
          </div>
        </section>

        {/* Accessibility Features */}
        <section className="mb-12">
          <h2 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {language === 'bn' ? 'অ্যাক্সেসিবিলিটি ফিচার' : 'Accessibility Features'}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className={`rounded-xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow`}
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`p-3 rounded-lg ${isDark ? 'bg-teal-900/30' : 'bg-teal-50'}`}>
                      <Icon className={`w-6 h-6 ${isDark ? 'text-teal-400' : 'text-teal-600'}`} />
                    </div>
                    <div>
                      <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {language === 'bn' ? feature.title.bn : feature.title.en}
                      </h3>
                    </div>
                  </div>
                  <p className={`mb-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {language === 'bn' ? feature.description.bn : feature.description.en}
                  </p>
                  <ul className="space-y-2">
                    {feature.items.map((item, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <FaCheck className={`w-3 h-3 flex-shrink-0 ${isDark ? 'text-teal-400' : 'text-teal-600'}`} />
                        <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          {language === 'bn' ? item.bn : item.en}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>

        {/* Language Support */}
        <section className="mb-12">
          <div className={`rounded-xl p-8 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow`}>
            <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {language === 'bn' ? 'ভাষা সমর্থন' : 'Language Support'}
            </h2>
            <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              {language === 'bn'
                ? 'আমাদের ওয়েবসাইট ইংরেজি এবং বাংলা উভয় ভাষায় উপলব্ধ। আপনি যেকোনো সময় হেডারের ভাষা সুইচার ব্যবহার করে ভাষা পরিবর্তন করতে পারেন। এটি নিশ্চিত করে যে আমাদের কন্টেন্ট সব ব্যবহারকারীর কাছে তাদের পছন্দের ভাষায় অ্যাক্সেসযোগ্য।'
                : 'Our website is available in both English and Bengali. You can switch languages at any time using the language switcher in the header. This ensures that our content is accessible to all users in their preferred language.'}
            </p>
          </div>
        </section>

        {/* Feedback Section */}
        <section>
          <div className={`rounded-xl p-8 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow`}>
            <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {language === 'bn' ? 'ফিডব্যাক এবং সহায়তা' : 'Feedback and Assistance'}
            </h2>
            <p className={`mb-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              {language === 'bn'
                ? 'আমরা ক্রমাগত আমাদের ওয়েবসাইটের অ্যাক্সেসিবিলিটি উন্নত করার চেষ্টা করছি। যদি আপনি আমাদের ওয়েবসাইটে কোনো অ্যাক্সেসিবিলিটি সমস্যার সম্মুখীন হন বা আপনার কোনো পরামর্শ থাকে, অনুগ্রহ করে আমাদের জানান।'
                : 'We are continuously working to improve the accessibility of our website. If you encounter any accessibility issues on our website or have suggestions, please let us know.'}
            </p>

            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <p className={`font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {language === 'bn' ? 'যোগাযোগ করুন:' : 'Contact us:'}
              </p>
              <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Email: contact@smjahangir.com
              </p>
            </div>

            <div className="mt-6">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors"
              >
                {language === 'bn' ? 'যোগাযোগ পৃষ্ঠায় যান' : 'Go to Contact Page'}
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
