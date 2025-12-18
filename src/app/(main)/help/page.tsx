'use client';

import { useState } from 'react';
import { useTheme } from '@/providers/ThemeProvider';
import { useLanguage } from '@/providers/LanguageProvider';
import Link from 'next/link';
import { FaQuestionCircle, FaChevronDown, FaChevronUp, FaArrowLeft, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';

interface FAQItem {
  question: { en: string; bn: string };
  answer: { en: string; bn: string };
}

const FAQ_ITEMS: FAQItem[] = [
  {
    question: {
      en: 'Who is S M Jahangir Hossain?',
      bn: 'এস এম জাহাঙ্গীর হোসেন কে?',
    },
    answer: {
      en: 'S M Jahangir Hossain is a political leader and candidate representing Dhaka-18 constituency. He is committed to serving the people and bringing positive change to the community through democratic processes.',
      bn: 'এস এম জাহাঙ্গীর হোসেন ঢাকা-১৮ আসনের প্রতিনিধিত্বকারী একজন রাজনৈতিক নেতা এবং প্রার্থী। তিনি জনগণের সেবা করতে এবং গণতান্ত্রিক প্রক্রিয়ার মাধ্যমে সম্প্রদায়ে ইতিবাচক পরিবর্তন আনতে প্রতিশ্রুতিবদ্ধ।',
    },
  },
  {
    question: {
      en: 'How can I contact the office?',
      bn: 'আমি কিভাবে অফিসে যোগাযোগ করতে পারি?',
    },
    answer: {
      en: 'You can contact us through the contact page on our website, call our office directly, or visit us at our constituency office in Dhaka-18. Our team is available to assist you with any queries.',
      bn: 'আপনি আমাদের ওয়েবসাইটের যোগাযোগ পৃষ্ঠার মাধ্যমে, সরাসরি আমাদের অফিসে কল করে বা ঢাকা-১৮ এ আমাদের নির্বাচনী এলাকার অফিসে গিয়ে যোগাযোগ করতে পারেন। আমাদের দল যেকোনো প্রশ্নে আপনাকে সাহায্য করতে প্রস্তুত।',
    },
  },
  {
    question: {
      en: 'How can I volunteer or get involved?',
      bn: 'আমি কিভাবে স্বেচ্ছাসেবক হতে বা জড়িত হতে পারি?',
    },
    answer: {
      en: 'We welcome volunteers! You can sign up through our website, attend community events, or contact our office directly. There are many ways to contribute, from door-to-door campaigning to helping with events.',
      bn: 'আমরা স্বেচ্ছাসেবকদের স্বাগত জানাই! আপনি আমাদের ওয়েবসাইটের মাধ্যমে সাইন আপ করতে পারেন, সম্প্রদায়ের ইভেন্টে অংশ নিতে পারেন বা সরাসরি আমাদের অফিসে যোগাযোগ করতে পারেন। বাড়ি বাড়ি প্রচার থেকে ইভেন্টে সাহায্য করা পর্যন্ত অবদান রাখার অনেক উপায় আছে।',
    },
  },
  {
    question: {
      en: 'How can I donate to support the campaign?',
      bn: 'আমি কিভাবে প্রচারাভিযানে সমর্থন করতে দান করতে পারি?',
    },
    answer: {
      en: 'You can make donations through our official website or by contacting our office. All donations are handled transparently and in accordance with electoral laws.',
      bn: 'আপনি আমাদের অফিসিয়াল ওয়েবসাইটের মাধ্যমে বা আমাদের অফিসে যোগাযোগ করে দান করতে পারেন। সমস্ত দান স্বচ্ছভাবে এবং নির্বাচনী আইন অনুযায়ী পরিচালিত হয়।',
    },
  },
  {
    question: {
      en: 'Where can I find information about upcoming events?',
      bn: 'আসন্ন ইভেন্ট সম্পর্কে তথ্য কোথায় পাব?',
    },
    answer: {
      en: 'All upcoming events are listed on our Events page. You can also follow our social media channels and subscribe to our newsletter for the latest updates.',
      bn: 'সমস্ত আসন্ন ইভেন্ট আমাদের ইভেন্ট পৃষ্ঠায় তালিকাভুক্ত। আপনি সর্বশেষ আপডেটের জন্য আমাদের সোশ্যাল মিডিয়া চ্যানেলগুলো অনুসরণ করতে এবং আমাদের নিউজলেটারে সাবস্ক্রাইব করতে পারেন।',
    },
  },
  {
    question: {
      en: 'How do I use the online store?',
      bn: 'আমি কিভাবে অনলাইন স্টোর ব্যবহার করব?',
    },
    answer: {
      en: 'Visit our Store page, browse products, select your preferred size and color, add items to cart, and proceed to checkout. We offer Cash on Delivery for the Dhaka-18 area.',
      bn: 'আমাদের স্টোর পৃষ্ঠায় যান, পণ্য ব্রাউজ করুন, আপনার পছন্দের সাইজ এবং রং নির্বাচন করুন, কার্টে আইটেম যোগ করুন এবং চেকআউট করুন। আমরা ঢাকা-১৮ এলাকার জন্য ক্যাশ অন ডেলিভারি অফার করি।',
    },
  },
  {
    question: {
      en: 'How can I track my order?',
      bn: 'আমি কিভাবে আমার অর্ডার ট্র্যাক করব?',
    },
    answer: {
      en: 'After placing an order, you will receive an order number. Use this number along with your phone number on our Order Track page to check your order status.',
      bn: 'অর্ডার দেওয়ার পর আপনি একটি অর্ডার নম্বর পাবেন। আপনার অর্ডারের স্থিতি চেক করতে আমাদের অর্ডার ট্র্যাক পৃষ্ঠায় আপনার ফোন নম্বর সহ এই নম্বরটি ব্যবহার করুন।',
    },
  },
  {
    question: {
      en: 'What is the Ask Me Anything (AMA) feature?',
      bn: 'আস্ক মি এনিথিং (AMA) ফিচার কি?',
    },
    answer: {
      en: 'AMA is an interactive feature where you can submit questions directly. Questions are reviewed and answered, fostering direct communication between the leadership and the community.',
      bn: 'AMA একটি ইন্টারেক্টিভ ফিচার যেখানে আপনি সরাসরি প্রশ্ন জমা দিতে পারেন। প্রশ্নগুলো পর্যালোচনা করে উত্তর দেওয়া হয়, যা নেতৃত্ব এবং সম্প্রদায়ের মধ্যে সরাসরি যোগাযোগ বৃদ্ধি করে।',
    },
  },
];

export default function HelpPage() {
  const { isDark } = useTheme();
  const { language } = useLanguage();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const getText = (text: { en: string; bn: string }) => {
    return language === 'bn' ? text.bn : text.en;
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
        <div className="relative max-w-4xl mx-auto px-4 py-20 text-center">
          <FaQuestionCircle className="w-16 h-16 mx-auto mb-6 opacity-90" />
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {language === 'bn' ? 'সাহায্য কেন্দ্র' : 'Help Center'}
          </h1>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            {language === 'bn'
              ? 'সাধারণ প্রশ্নের উত্তর খুঁজুন এবং আমাদের সাথে যোগাযোগ করুন'
              : 'Find answers to common questions and get in touch with us'}
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

        {/* FAQ Section */}
        <section className="mb-12">
          <h2 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {language === 'bn' ? 'সাধারণ প্রশ্নাবলী' : 'Frequently Asked Questions'}
          </h2>

          <div className="space-y-3">
            {FAQ_ITEMS.map((item, index) => (
              <div
                key={index}
                className={`rounded-xl overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-white'} shadow`}
              >
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className={`w-full flex items-center justify-between p-5 text-left transition-colors ${
                    isDark ? 'hover:bg-gray-750' : 'hover:bg-gray-50'
                  }`}
                >
                  <span className={`font-medium pr-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {getText(item.question)}
                  </span>
                  {openIndex === index ? (
                    <FaChevronUp className={`flex-shrink-0 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  ) : (
                    <FaChevronDown className={`flex-shrink-0 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  )}
                </button>
                {openIndex === index && (
                  <div className={`px-5 pb-5 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    {getText(item.answer)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Contact Section */}
        <section>
          <h2 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {language === 'bn' ? 'এখনও সাহায্য দরকার?' : 'Still Need Help?'}
          </h2>

          <div className={`rounded-xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow`}>
            <p className={`mb-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              {language === 'bn'
                ? 'আপনার প্রশ্নের উত্তর খুঁজে না পেলে আমাদের সাথে যোগাযোগ করুন।'
                : "Can't find what you're looking for? Get in touch with us."}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg ${isDark ? 'bg-blue-900/30' : 'bg-blue-50'}`}>
                  <FaEnvelope className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                </div>
                <div>
                  <h3 className={`font-medium mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {language === 'bn' ? 'ইমেইল' : 'Email'}
                  </h3>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    contact@smjahangir.com
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg ${isDark ? 'bg-green-900/30' : 'bg-green-50'}`}>
                  <FaPhone className={`w-5 h-5 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
                </div>
                <div>
                  <h3 className={`font-medium mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {language === 'bn' ? 'ফোন' : 'Phone'}
                  </h3>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    +880 1XX-XXXXXXX
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg ${isDark ? 'bg-red-900/30' : 'bg-red-50'}`}>
                  <FaMapMarkerAlt className={`w-5 h-5 ${isDark ? 'text-red-400' : 'text-red-600'}`} />
                </div>
                <div>
                  <h3 className={`font-medium mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {language === 'bn' ? 'অফিস' : 'Office'}
                  </h3>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Dhaka-18, Bangladesh
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
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
