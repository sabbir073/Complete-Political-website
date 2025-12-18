'use client';

import { useTheme } from '@/providers/ThemeProvider';
import { useLanguage } from '@/providers/LanguageProvider';
import Link from 'next/link';
import { FaFileContract, FaArrowLeft } from 'react-icons/fa';

export default function TermsPage() {
  const { isDark } = useTheme();
  const { language } = useLanguage();

  const lastUpdated = 'December 2024';

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-purple-600 to-purple-800 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 py-20 text-center">
          <FaFileContract className="w-16 h-16 mx-auto mb-6 opacity-90" />
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {language === 'bn' ? 'সেবার শর্তাবলী' : 'Terms of Service'}
          </h1>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            {language === 'bn'
              ? 'আমাদের ওয়েবসাইট ব্যবহারের নিয়ম ও শর্তাবলী'
              : 'Rules and conditions for using our website'}
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

            {/* Acceptance of Terms */}
            <section>
              <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {language === 'bn' ? 'শর্তাবলী স্বীকার' : 'Acceptance of Terms'}
              </h2>
              <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                {language === 'bn'
                  ? 'এস এম জাহাঙ্গীর হোসেনের অফিসিয়াল ওয়েবসাইট অ্যাক্সেস এবং ব্যবহার করে, আপনি এই সেবার শর্তাবলী মেনে চলতে এবং এতে আবদ্ধ থাকতে সম্মত হচ্ছেন। যদি আপনি এই শর্তাবলীর সাথে একমত না হন, তাহলে অনুগ্রহ করে আমাদের ওয়েবসাইট ব্যবহার করবেন না।'
                  : 'By accessing and using the official website of S M Jahangir Hossain, you agree to comply with and be bound by these Terms of Service. If you do not agree with these terms, please do not use our website.'}
              </p>
            </section>

            {/* Use of Website */}
            <section>
              <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {language === 'bn' ? 'ওয়েবসাইট ব্যবহার' : 'Use of Website'}
              </h2>
              <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                {language === 'bn' ? 'আপনি এই ওয়েবসাইট ব্যবহার করার সময় সম্মত হচ্ছেন যে:' : 'When using this website, you agree to:'}
              </p>
              <ul className={`list-disc pl-6 space-y-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                <li>{language === 'bn' ? 'ওয়েবসাইট শুধুমাত্র বৈধ উদ্দেশ্যে ব্যবহার করবেন' : 'Use the website only for lawful purposes'}</li>
                <li>{language === 'bn' ? 'মিথ্যা বা বিভ্রান্তিকর তথ্য প্রদান করবেন না' : 'Not provide false or misleading information'}</li>
                <li>{language === 'bn' ? 'ওয়েবসাইটের নিরাপত্তা লঙ্ঘন করার চেষ্টা করবেন না' : 'Not attempt to breach the website\'s security'}</li>
                <li>{language === 'bn' ? 'অন্যদের অধিকার লঙ্ঘন করবেন না' : 'Not violate the rights of others'}</li>
                <li>{language === 'bn' ? 'কোনো আপত্তিকর বা অবৈধ কন্টেন্ট আপলোড করবেন না' : 'Not upload any offensive or illegal content'}</li>
              </ul>
            </section>

            {/* Intellectual Property */}
            <section>
              <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {language === 'bn' ? 'বুদ্ধিবৃত্তিক সম্পত্তি' : 'Intellectual Property'}
              </h2>
              <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                {language === 'bn'
                  ? 'এই ওয়েবসাইটের সমস্ত কন্টেন্ট, যার মধ্যে রয়েছে টেক্সট, গ্রাফিক্স, লোগো, ছবি, ভিডিও এবং সফটওয়্যার, এস এম জাহাঙ্গীর হোসেন বা তাঁর লাইসেন্সদাতাদের সম্পত্তি এবং কপিরাইট আইন দ্বারা সুরক্ষিত। পূর্ব লিখিত অনুমতি ছাড়া কোনো কন্টেন্ট পুনরুত্পাদন, বিতরণ বা প্রকাশ করা যাবে না।'
                  : 'All content on this website, including text, graphics, logos, images, videos, and software, is the property of S M Jahangir Hossain or his licensors and is protected by copyright laws. No content may be reproduced, distributed, or published without prior written permission.'}
              </p>
            </section>

            {/* Store Terms */}
            <section>
              <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {language === 'bn' ? 'স্টোর শর্তাবলী' : 'Store Terms'}
              </h2>
              <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                {language === 'bn' ? 'আমাদের অনলাইন স্টোর থেকে কেনাকাটা করলে:' : 'When purchasing from our online store:'}
              </p>
              <ul className={`list-disc pl-6 space-y-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                <li>{language === 'bn' ? 'মূল্য বাংলাদেশী টাকায় (৳) প্রদর্শিত' : 'Prices are displayed in Bangladeshi Taka (৳)'}</li>
                <li>{language === 'bn' ? 'শুধুমাত্র ঢাকা-১৮ এলাকায় ডেলিভারি পাওয়া যায়' : 'Delivery is available only in Dhaka-18 area'}</li>
                <li>{language === 'bn' ? 'পেমেন্ট ক্যাশ অন ডেলিভারি' : 'Payment is Cash on Delivery'}</li>
                <li>{language === 'bn' ? 'অর্ডার দেওয়ার পর বাতিল করা যেতে পারে যদি এখনো শিপ না হয়ে থাকে' : 'Orders can be cancelled if not yet shipped'}</li>
                <li>{language === 'bn' ? 'পণ্য ফেরত নির্দিষ্ট শর্ত সাপেক্ষে গৃহীত হয়' : 'Returns are accepted under specific conditions'}</li>
              </ul>
            </section>

            {/* User Content */}
            <section>
              <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {language === 'bn' ? 'ব্যবহারকারীর কন্টেন্ট' : 'User Content'}
              </h2>
              <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                {language === 'bn'
                  ? 'এই ওয়েবসাইটে কন্টেন্ট জমা দিয়ে (যেমন AMA প্রশ্ন, মন্তব্য বা ফিডব্যাক), আপনি আমাদের সেই কন্টেন্ট ব্যবহার, প্রদর্শন এবং বিতরণ করার অধিকার প্রদান করছেন। আপনি নিশ্চিত করছেন যে আপনার কন্টেন্ট কোনো তৃতীয় পক্ষের অধিকার লঙ্ঘন করে না।'
                  : 'By submitting content to this website (such as AMA questions, comments, or feedback), you grant us the right to use, display, and distribute that content. You confirm that your content does not violate any third-party rights.'}
              </p>
            </section>

            {/* Disclaimer */}
            <section>
              <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {language === 'bn' ? 'দায়িত্ব সীমাবদ্ধতা' : 'Disclaimer'}
              </h2>
              <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                {language === 'bn'
                  ? 'এই ওয়েবসাইট "যেমন আছে" ভিত্তিতে প্রদান করা হয়। আমরা ওয়েবসাইটের বিষয়বস্তুর সম্পূর্ণতা, নির্ভুলতা বা নির্ভরযোগ্যতার কোনো ওয়ারেন্টি প্রদান করি না। ওয়েবসাইট ব্যবহার থেকে উদ্ভূত কোনো ক্ষতির জন্য আমরা দায়ী নই।'
                  : 'This website is provided on an "as is" basis. We make no warranties regarding the completeness, accuracy, or reliability of the website content. We are not liable for any damages arising from the use of this website.'}
              </p>
            </section>

            {/* Changes to Terms */}
            <section>
              <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {language === 'bn' ? 'শর্তাবলীর পরিবর্তন' : 'Changes to Terms'}
              </h2>
              <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                {language === 'bn'
                  ? 'আমরা যেকোনো সময় এই শর্তাবলী পরিবর্তন করার অধিকার সংরক্ষণ করি। পরিবর্তনগুলো এই পৃষ্ঠায় পোস্ট করা হলে কার্যকর হবে। আপডেটের জন্য নিয়মিত এই পৃষ্ঠা পর্যালোচনা করুন।'
                  : 'We reserve the right to modify these terms at any time. Changes will become effective when posted on this page. Please review this page regularly for updates.'}
              </p>
            </section>

            {/* Governing Law */}
            <section>
              <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {language === 'bn' ? 'প্রযোজ্য আইন' : 'Governing Law'}
              </h2>
              <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                {language === 'bn'
                  ? 'এই শর্তাবলী বাংলাদেশের আইন দ্বারা পরিচালিত এবং ব্যাখ্যা করা হবে।'
                  : 'These terms shall be governed by and construed in accordance with the laws of Bangladesh.'}
              </p>
            </section>

            {/* Contact */}
            <section>
              <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {language === 'bn' ? 'যোগাযোগ' : 'Contact'}
              </h2>
              <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                {language === 'bn'
                  ? 'এই শর্তাবলী সম্পর্কে কোনো প্রশ্ন থাকলে, অনুগ্রহ করে contact@smjahangir.com এ যোগাযোগ করুন।'
                  : 'If you have any questions about these terms, please contact us at contact@smjahangir.com.'}
              </p>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}
