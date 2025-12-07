"use client";

import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/providers/LanguageProvider';
import { useTheme } from '@/providers/ThemeProvider';
import html2canvas from 'html2canvas';

// Random profile images of SM Jahangir
const profileImages = [
  '/supportcard/proffile/1.jpg',
  '/supportcard/proffile/2.jpg',
  '/supportcard/proffile/1.png',
  '/supportcard/proffile/2.png',
];

// Random inspirational messages - focused on voting for SM Jahangir
const inspirationalMessages = {
  bn: [
    'আপনার একটি ভোটই বদলে দিতে পারে একটি প্রজন্মের ভাগ্য',
    'ধানের শীষে ভোট দিন, জাহাঙ্গীরকে এমপি করুন',
    'ঢাকা-১৮ এর উন্নয়নে ভোট দিন এস এম জাহাঙ্গীরকে',
    'গণতন্ত্র পুনরুদ্ধারে ভোট দিন ধানের শীষে',
  ],
  en: [
    'Your one vote can change the destiny of a generation',
    'Vote for Sheaf of Paddy, Make Jahangir the MP',
    'Vote for S M Jahangir for the development of Dhaka-18',
    'Vote for Sheaf of Paddy to restore democracy',
  ],
};

// Social media sharing captions
const socialCaptions = {
  bn: [
    'আমি এস এম জাহাঙ্গীর হোসেনকে সমর্থন করি! ঢাকা-১৮ এর জন্য সঠিক নেতা। আপনিও সমর্থন দিন! 🌾',
    'ঢাকা-১৮ এর উন্নয়নে এস এম জাহাঙ্গীর হোসেন - আমি তাঁর পাশে আছি! 💚',
    'গণতন্ত্র পুনরুদ্ধারে ধানের শীষ প্রতীক! এস এম জাহাঙ্গীর হোসেনকে সমর্থন করুন 🇧🇩',
    'ঢাকা-১৮ বদলে যাবে - এস এম জাহাঙ্গীর হোসেনের নেতৃত্বে! সমর্থন করুন 🌾',
    'আমি গর্বিত এস এম জাহাঙ্গীর হোসেনের সমর্থক! ঢাকা-১৮ এর ভবিষ্যৎ উজ্জ্বল 💚',
    'পরিবর্তন আসছে ঢাকা-১৮তে! এস এম জাহাঙ্গীর হোসেনকে সমর্থন দিন 🌾🇧🇩',
  ],
  en: [
    'I support S M Jahangir Hossain! The right leader for Dhaka-18. Join me! 🌾',
    'For the development of Dhaka-18 - S M Jahangir Hossain! I stand with him 💚',
    'Sheaf of Paddy for democracy! Support S M Jahangir Hossain 🇧🇩',
    'Dhaka-18 will transform under S M Jahangir Hossain\'s leadership! Show your support 🌾',
    'Proud supporter of S M Jahangir Hossain! Bright future for Dhaka-18 💚',
    'Change is coming to Dhaka-18! Support S M Jahangir Hossain 🌾🇧🇩',
  ],
};

interface PledgeData {
  pledge_id: string;
  name: string;
  created_at: string;
}

interface Stats {
  total: number;
  today: number;
  recentPledges: { name: string; thana: string; created_at: string }[];
}

export default function Election2026Page() {
  const { language } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const cardRef = useRef<HTMLDivElement>(null);

  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [pledgeSuccess, setPledgeSuccess] = useState<PledgeData | null>(null);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  // Random selections for the card
  const [randomProfile, setRandomProfile] = useState('');
  const [randomMessage, setRandomMessage] = useState('');

  // Translations
  const t = {
    title: language === 'bn' ? 'জাতীয় সংসদ নির্বাচন ২০২৬' : 'National Election 2026',
    titleShort: language === 'bn' ? 'নির্বাচন ২০২৬' : 'Election 2026',
    subtitle: language === 'bn' ? 'বাংলাদেশ জাতীয় সংসদ নির্বাচন' : 'Bangladesh National Parliament Election',
    heroMessage: language === 'bn' ? 'ঢাকা-১৮ আসনে এস এম জাহাঙ্গীর হোসেনকে সমর্থন করুন' : 'Support S M Jahangir Hossain in Dhaka-18 Constituency',
    pledgeTitle: language === 'bn' ? 'আমি সমর্থন করি' : 'I Support',
    pledgeSubtitle: language === 'bn' ? 'ঢাকা-১৮ আসনে এস এম জাহাঙ্গীর হোসেনকে সমর্থন জানান' : 'Show your support for S M Jahangir Hossain in Dhaka-18',
    totalSupporters: language === 'bn' ? 'জন সমর্থক' : 'Supporters',
    todaySupporters: language === 'bn' ? 'আজকে যোগ দিয়েছেন' : 'Joined Today',
    name: language === 'bn' ? 'আপনার নাম' : 'Your Name',
    namePlaceholder: language === 'bn' ? 'আপনার পূর্ণ নাম লিখুন' : 'Enter your full name',
    submitBtn: language === 'bn' ? 'আমি সমর্থন করি' : 'I Support S M Jahangir',
    submitting: language === 'bn' ? 'জমা হচ্ছে...' : 'Submitting...',
    successTitle: language === 'bn' ? 'ধন্যবাদ!' : 'Thank You!',
    successMessage: language === 'bn' ? 'আপনার সমর্থনের জন্য ধন্যবাদ। নিচে আপনার সমর্থন কার্ড ডাউনলোড করুন এবং শেয়ার করুন!' : 'Thank you for your support. Download and share your support card below!',
    downloadCard: language === 'bn' ? 'সাপোর্ট কার্ড ডাউনলোড করুন' : 'Download Support Card',
    downloading: language === 'bn' ? 'ডাউনলোড হচ্ছে...' : 'Downloading...',
    shareOn: language === 'bn' ? 'শেয়ার করুন' : 'Share on',
    pledgeAnother: language === 'bn' ? 'আরেকজনের সমর্থন নিবন্ধন করুন' : 'Register Another Support',
    recentSupporters: language === 'bn' ? 'সাম্প্রতিক সমর্থকগণ' : 'Recent Supporters',
    joinMovement: language === 'bn' ? 'পরিবর্তনের আন্দোলনে যোগ দিন' : 'Join the Movement for Change',
    dhaka18: language === 'bn' ? 'ঢাকা-১৮' : 'Dhaka-18',
    smJahangir: language === 'bn' ? 'এস এম জাহাঙ্গীর হোসেন' : 'S M Jahangir Hossain',
    supportedBy: language === 'bn' ? 'সমর্থক' : 'Supported by',
    iSupport: language === 'bn' ? 'আমি সমর্থন করি' : 'I Support',
    paddySymbol: language === 'bn' ? 'ধানের শীষ' : 'Sheaf of Paddy',
    nationalElection: language === 'bn' ? 'বাংলাদেশ জাতীয় সংসদ নির্বাচন ২০২৬' : 'Bangladesh National Parliament Election 2026',
  };

  useEffect(() => {
    fetchStats();
    // Set random profile and message on mount
    setRandomProfile(profileImages[Math.floor(Math.random() * profileImages.length)]);
    setRandomMessage(language === 'bn'
      ? inspirationalMessages.bn[Math.floor(Math.random() * inspirationalMessages.bn.length)]
      : inspirationalMessages.en[Math.floor(Math.random() * inspirationalMessages.en.length)]
    );
  }, [language]);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/election-2026/pledge?action=stats');
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
        setTotalCount(data.stats.total);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError(language === 'bn' ? 'অনুগ্রহ করে আপনার নাম লিখুন' : 'Please enter your name');
      return;
    }

    setSubmitting(true);
    setError('');

    // Generate new random selections for the card
    setRandomProfile(profileImages[Math.floor(Math.random() * profileImages.length)]);
    setRandomMessage(language === 'bn'
      ? inspirationalMessages.bn[Math.floor(Math.random() * inspirationalMessages.bn.length)]
      : inspirationalMessages.en[Math.floor(Math.random() * inspirationalMessages.en.length)]
    );

    try {
      const res = await fetch('/api/election-2026/pledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), is_public: true })
      });
      const data = await res.json();

      if (data.success) {
        setPledgeSuccess(data.pledge);
        setTotalCount(data.totalCount);
        fetchStats();
      } else {
        setError(data.error);
      }
    } catch {
      setError(language === 'bn' ? 'একটি ত্রুটি হয়েছে' : 'An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const downloadCard = async () => {
    if (!cardRef.current) return;
    setDownloading(true);

    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      const link = document.createElement('a');
      link.download = `vote-for-jahangir-${pledgeSuccess?.pledge_id || 'smj'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Failed to download card:', error);
    } finally {
      setDownloading(false);
    }
  };

  // Get random social caption
  const getRandomCaption = () => {
    const captions = language === 'bn' ? socialCaptions.bn : socialCaptions.en;
    return captions[Math.floor(Math.random() * captions.length)];
  };

  const shareOnFacebook = () => {
    const url = encodeURIComponent(window.location.href);
    const caption = getRandomCaption();
    const text = encodeURIComponent(`${caption}\n\n#NationalElection2026 #Dhaka18 #SMJahangir #SheafOfPaddy`);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`, '_blank');
  };

  const shareOnTwitter = () => {
    const url = encodeURIComponent(window.location.href);
    const caption = getRandomCaption();
    const text = encodeURIComponent(`${caption} #NationalElection2026 #Dhaka18 #SMJahangir`);
    window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank');
  };

  const shareOnWhatsApp = () => {
    const url = window.location.href;
    const caption = getRandomCaption();
    const text = `${caption}\n\n🗳️ ${language === 'bn' ? 'বাংলাদেশ জাতীয় সংসদ নির্বাচন ২০২৬' : 'Bangladesh National Parliament Election 2026'}\n📍 ${language === 'bn' ? 'ঢাকা-১৮ আসন' : 'Dhaka-18 Constituency'}\n🌾 ${language === 'bn' ? 'ধানের শীষ প্রতীক' : 'Sheaf of Paddy Symbol'}\n\n${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const shareOnMessenger = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.facebook.com/dialog/send?link=${url}&app_id=291494419107518&redirect_uri=${url}`, '_blank');
  };

  const shareOnTelegram = () => {
    const url = encodeURIComponent(window.location.href);
    const caption = getRandomCaption();
    const text = encodeURIComponent(`${caption}\n\n🗳️ ${language === 'bn' ? 'বাংলাদেশ জাতীয় সংসদ নির্বাচন ২০২৬' : 'Bangladesh National Parliament Election 2026'}\n📍 ${language === 'bn' ? 'ঢাকা-১৮ আসন' : 'Dhaka-18 Constituency'}`);
    window.open(`https://t.me/share/url?url=${url}&text=${text}`, '_blank');
  };

  const shareOnLinkedIn = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
  };

  const copyLink = async () => {
    const caption = getRandomCaption();
    const text = `${caption}\n\n🗳️ ${language === 'bn' ? 'বাংলাদেশ জাতীয় সংসদ নির্বাচন ২০২৬' : 'Bangladesh National Parliament Election 2026'}\n📍 ${language === 'bn' ? 'ঢাকা-১৮ আসন' : 'Dhaka-18 Constituency'}\n🌾 ${language === 'bn' ? 'ধানের শীষ প্রতীক' : 'Sheaf of Paddy Symbol'}\n\n${window.location.href}`;
    try {
      await navigator.clipboard.writeText(text);
      alert(language === 'bn' ? 'লিংক ও ক্যাপশন কপি হয়েছে!' : 'Link & caption copied!');
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      alert(language === 'bn' ? 'লিংক ও ক্যাপশন কপি হয়েছে!' : 'Link & caption copied!');
    }
  };

  const resetForm = () => {
    setName('');
    setPledgeSuccess(null);
    setError('');
    // Generate new random selections
    setRandomProfile(profileImages[Math.floor(Math.random() * profileImages.length)]);
    setRandomMessage(language === 'bn'
      ? inspirationalMessages.bn[Math.floor(Math.random() * inspirationalMessages.bn.length)]
      : inspirationalMessages.en[Math.floor(Math.random() * inspirationalMessages.en.length)]
    );
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Hero Section */}
      <div className="relative py-12 sm:py-16 md:py-24 bg-gradient-to-br from-green-700 via-green-600 to-red-600 overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        {/* Decorative elements - hidden on very small screens */}
        <div className="hidden sm:block absolute top-0 left-0 w-48 md:w-64 h-48 md:h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        <div className="hidden sm:block absolute bottom-0 right-0 w-64 md:w-96 h-64 md:h-96 bg-white/10 rounded-full translate-x-1/3 translate-y-1/3"></div>

        <div className="relative container mx-auto px-3 sm:px-4 text-center text-white">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white/20 backdrop-blur-sm text-xs sm:text-sm font-medium mb-3 sm:mb-4">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            {t.subtitle}
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4 px-2">{t.title}</h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl opacity-95 max-w-3xl mx-auto mb-2 font-medium px-2">{t.heroMessage}</p>
          <p className="text-sm sm:text-base md:text-lg opacity-80 max-w-2xl mx-auto px-2">{t.joinMovement}</p>

          {/* Live Counter */}
          <div className="mt-6 sm:mt-8 inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-3 rounded-full bg-white/20 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <span className="text-2xl sm:text-3xl md:text-4xl font-bold">{loading ? '...' : totalCount.toLocaleString()}</span>
              <span className="text-sm sm:text-lg opacity-90">{t.totalSupporters}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="container mx-auto px-3 sm:px-4 -mt-6 sm:-mt-8 relative z-10">
        <div className="grid grid-cols-2 gap-2 sm:gap-4 max-w-xl mx-auto">
          <div className={`rounded-xl p-4 sm:p-6 text-center shadow-lg ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white'}`}>
            <div className="text-2xl sm:text-3xl font-bold text-green-500 mb-1">
              {loading ? '...' : (stats?.total || 0).toLocaleString()}
            </div>
            <div className={`text-xs sm:text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {t.totalSupporters}
            </div>
          </div>
          <div className={`rounded-xl p-4 sm:p-6 text-center shadow-lg ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white'}`}>
            <div className="text-2xl sm:text-3xl font-bold text-red-500 mb-1">
              {loading ? '...' : (stats?.today || 0).toLocaleString()}
            </div>
            <div className={`text-xs sm:text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {t.todaySupporters}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-3 sm:px-4 py-8 sm:py-12">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
            {/* Pledge Form */}
            <div className={`rounded-2xl p-4 sm:p-6 md:p-8 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-xl`}>
              <div className="text-center mb-4 sm:mb-6">
                {/* Paddy Icon */}
                <div className="inline-flex items-center justify-center w-16 sm:w-20 h-16 sm:h-20 rounded-full bg-gradient-to-r from-green-500 to-green-600 text-white mb-3 sm:mb-4">
                  <img
                    src="/supportcard/paddy.png"
                    alt="Paddy"
                    className="w-10 sm:w-12 h-10 sm:h-12 object-contain"
                  />
                </div>
                <h2 className={`text-xl sm:text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t.pledgeTitle}
                </h2>
                <p className={`mt-2 text-sm sm:text-base ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t.pledgeSubtitle}
                </p>
              </div>

              {pledgeSuccess ? (
                /* Success State with Card */
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 sm:w-16 h-12 sm:h-16 rounded-full bg-green-500/20 text-green-500 mb-3 sm:mb-4">
                    <svg className="w-6 sm:w-8 h-6 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className={`text-lg sm:text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {t.successTitle}
                  </h3>
                  <p className={`mb-4 sm:mb-6 text-sm sm:text-base ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t.successMessage}
                  </p>

                  {/* Beautiful Support Card - Responsive Version */}
                  <div className="mb-4 sm:mb-6 flex justify-center overflow-x-auto px-2 -mx-2">
                    <div
                      ref={cardRef}
                      className="transform scale-[0.85] sm:scale-100 origin-top"
                      style={{
                        width: '340px',
                        minWidth: '340px',
                        backgroundColor: '#ffffff',
                        borderRadius: '16px',
                        overflow: 'hidden',
                        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
                        fontFamily: 'system-ui, -apple-system, sans-serif',
                      }}
                    >
                      {/* Top Bar with BNP Logo and Slogan */}
                      <div style={{
                        background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                        padding: '10px 14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}>
                        <div style={{
                          width: '42px',
                          height: '42px',
                          flexShrink: 0,
                        }}>
                          <img
                            src="/supportcard/logo.png"
                            alt="BNP Logo"
                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                            crossOrigin="anonymous"
                          />
                        </div>
                        <div style={{ textAlign: 'right', color: 'white' }}>
                          <p style={{ fontSize: '10px', margin: 0, opacity: 0.9 }}>
                            {language === 'bn' ? 'বাংলাদেশ জাতীয়তাবাদী দল' : 'Bangladesh Nationalist Party'}
                          </p>
                          <p style={{ fontSize: '12px', fontWeight: 'bold', margin: '2px 0 0 0' }}>
                            {language === 'bn' ? 'দেশ বাঁচাও, মানুষ বাঁচাও' : 'Save the Country, Save the People'}
                          </p>
                        </div>
                      </div>

                      {/* National Election Banner */}
                      <div style={{
                        background: 'linear-gradient(90deg, #dc2626 0%, #b91c1c 100%)',
                        padding: '8px 14px',
                        textAlign: 'center',
                      }}>
                        <p style={{
                          color: 'white',
                          fontSize: '11px',
                          fontWeight: 'bold',
                          margin: 0,
                          letterSpacing: '0.5px',
                          textTransform: 'uppercase',
                        }}>
                          {language === 'bn' ? 'বাংলাদেশ জাতীয় সংসদ নির্বাচন ২০২৬' : 'BANGLADESH NATIONAL PARLIAMENT ELECTION 2026'}
                        </p>
                      </div>

                      {/* Inspirational Message */}
                      <div style={{
                        background: '#fef3c7',
                        padding: '8px 14px',
                        textAlign: 'center',
                        borderBottom: '1px solid #f59e0b',
                      }}>
                        <p style={{
                          color: '#92400e',
                          fontSize: '12px',
                          fontWeight: '600',
                          margin: 0,
                          fontStyle: 'italic',
                        }}>
                          &ldquo;{randomMessage}&rdquo;
                        </p>
                      </div>

                      {/* Main Content */}
                      <div style={{
                        padding: '16px',
                        textAlign: 'center',
                        background: 'linear-gradient(180deg, #f0fdf4 0%, #ffffff 100%)',
                      }}>
                        {/* SM Jahangir Photo */}
                        <div style={{
                          width: '100px',
                          height: '100px',
                          borderRadius: '50%',
                          margin: '0 auto 10px',
                          border: '4px solid #059669',
                          overflow: 'hidden',
                          boxShadow: '0 4px 15px rgba(5, 150, 105, 0.3)',
                        }}>
                          <img
                            src={randomProfile}
                            alt="S M Jahangir Hossain"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            crossOrigin="anonymous"
                          />
                        </div>

                        {/* I Support Text */}
                        <p style={{
                          fontSize: '11px',
                          color: '#6b7280',
                          margin: '0 0 2px 0',
                          textTransform: 'uppercase',
                          letterSpacing: '1.5px',
                        }}>
                          {t.iSupport}
                        </p>

                        {/* S M Jahangir Hossain Name */}
                        <h3 style={{
                          fontSize: '22px',
                          fontWeight: '800',
                          color: '#047857',
                          margin: '0 0 8px 0',
                        }}>
                          {t.smJahangir}
                        </h3>

                        {/* Dhaka-18 with Paddy */}
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          background: '#ecfdf5',
                          padding: '6px 14px',
                          borderRadius: '20px',
                          border: '1px solid #059669',
                          marginBottom: '12px',
                        }}>
                          <img
                            src="/supportcard/paddy.png"
                            alt="Paddy"
                            style={{ width: '24px', height: '24px', objectFit: 'contain' }}
                            crossOrigin="anonymous"
                          />
                          <div style={{ textAlign: 'center' }}>
                            <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#047857' }}>
                              {t.dhaka18}
                            </span>
                            <span style={{ fontSize: '10px', color: '#059669', marginLeft: '4px' }}>
                              {t.paddySymbol}
                            </span>
                          </div>
                          <img
                            src="/supportcard/paddy.png"
                            alt="Paddy"
                            style={{ width: '24px', height: '24px', objectFit: 'contain', transform: 'scaleX(-1)' }}
                            crossOrigin="anonymous"
                          />
                        </div>

                        {/* Supporter Name Only */}
                        <div style={{
                          background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
                          borderRadius: '10px',
                          padding: '10px 16px',
                          border: '1px dashed #059669',
                        }}>
                          <p style={{
                            fontSize: '16px',
                            fontWeight: '600',
                            color: '#059669',
                            margin: '0',
                          }}>
                            {pledgeSuccess.name}
                          </p>
                        </div>
                      </div>

                      {/* Footer */}
                      <div style={{
                        background: 'linear-gradient(135deg, #059669 0%, #047857 50%, #dc2626 100%)',
                        padding: '6px 12px',
                        textAlign: 'center',
                      }}>
                        <p style={{
                          color: 'white',
                          fontSize: '9px',
                          fontWeight: 'bold',
                          margin: 0,
                        }}>
                          smjahangir.com
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Download Button */}
                  <button
                    onClick={downloadCard}
                    disabled={downloading}
                    className="w-full max-w-xs mx-auto flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium text-sm sm:text-base transition-colors disabled:opacity-50"
                  >
                    {downloading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 sm:h-5 w-4 sm:w-5 border-b-2 border-white"></div>
                        <span>{t.downloading}</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 sm:w-5 h-4 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        <span>{t.downloadCard}</span>
                      </>
                    )}
                  </button>

                  {/* Social Share Buttons */}
                  <div className="mt-4 sm:mt-6">
                    <p className={`text-xs sm:text-sm mb-2 sm:mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {t.shareOn}:
                    </p>
                    <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
                      {/* Facebook */}
                      <button
                        onClick={shareOnFacebook}
                        className="p-2.5 sm:p-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer"
                        title="Facebook"
                      >
                        <svg className="w-4 sm:w-5 h-4 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M18.77,7.46H14.5v-1.9c0-.9.6-1.1,1-1.1h3V.5h-4.33C10.24.5,9.5,3.44,9.5,5.32v2.15h-3v4h3v12h5v-12h3.85l.42-4Z"/>
                        </svg>
                      </button>
                      {/* Messenger */}
                      <button
                        onClick={shareOnMessenger}
                        className="p-2.5 sm:p-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white transition-colors cursor-pointer"
                        title="Messenger"
                      >
                        <svg className="w-4 sm:w-5 h-4 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 0C5.373 0 0 4.974 0 11.111c0 3.498 1.744 6.614 4.469 8.654V24l4.088-2.242c1.092.301 2.246.464 3.443.464 6.627 0 12-4.974 12-11.111S18.627 0 12 0zm1.191 14.963l-3.055-3.26-5.963 3.26L10.732 8l3.131 3.259L19.752 8l-6.561 6.963z"/>
                        </svg>
                      </button>
                      {/* WhatsApp */}
                      <button
                        onClick={shareOnWhatsApp}
                        className="p-2.5 sm:p-3 rounded-full bg-green-500 hover:bg-green-600 text-white transition-colors cursor-pointer"
                        title="WhatsApp"
                      >
                        <svg className="w-4 sm:w-5 h-4 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                      </button>
                      {/* X (Twitter) */}
                      <button
                        onClick={shareOnTwitter}
                        className="p-2.5 sm:p-3 rounded-full bg-black hover:bg-gray-800 text-white transition-colors cursor-pointer"
                        title="X (Twitter)"
                      >
                        <svg className="w-4 sm:w-5 h-4 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                        </svg>
                      </button>
                      {/* Telegram */}
                      <button
                        onClick={shareOnTelegram}
                        className="p-2.5 sm:p-3 rounded-full bg-sky-500 hover:bg-sky-600 text-white transition-colors cursor-pointer"
                        title="Telegram"
                      >
                        <svg className="w-4 sm:w-5 h-4 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                        </svg>
                      </button>
                      {/* LinkedIn */}
                      <button
                        onClick={shareOnLinkedIn}
                        className="p-2.5 sm:p-3 rounded-full bg-blue-700 hover:bg-blue-800 text-white transition-colors cursor-pointer"
                        title="LinkedIn"
                      >
                        <svg className="w-4 sm:w-5 h-4 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                        </svg>
                      </button>
                      {/* Copy Link */}
                      <button
                        onClick={copyLink}
                        className="p-2.5 sm:p-3 rounded-full bg-gray-600 hover:bg-gray-700 text-white transition-colors cursor-pointer"
                        title={language === 'bn' ? 'লিংক কপি করুন' : 'Copy Link'}
                      >
                        <svg className="w-4 sm:w-5 h-4 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                        </svg>
                      </button>
                    </div>
                    <p className={`text-[10px] sm:text-xs mt-2 sm:mt-3 px-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      {language === 'bn' ? '💡 প্রথমে কার্ড ডাউনলোড করুন, তারপর শেয়ার করার সময় আপলোড করুন' : '💡 Download the card first, then upload when sharing'}
                    </p>
                  </div>

                  {/* Register Another */}
                  <button
                    onClick={resetForm}
                    className={`mt-4 sm:mt-6 px-4 sm:px-6 py-2 rounded-lg font-medium text-sm sm:text-base transition-colors ${
                      isDark
                        ? 'bg-gray-700 hover:bg-gray-600 text-white'
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                    }`}
                  >
                    {t.pledgeAnother}
                  </button>
                </div>
              ) : (
                /* Simple Name-only Pledge Form */
                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                  {error && (
                    <div className="p-3 sm:p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-center text-sm sm:text-base">
                      {error}
                    </div>
                  )}

                  {/* Name Input */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t.name} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className={`w-full px-3 sm:px-4 py-3 sm:py-4 text-base sm:text-lg rounded-xl border ${
                        isDark
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                      } focus:ring-2 focus:ring-green-500 focus:border-transparent transition`}
                      placeholder={t.namePlaceholder}
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 sm:py-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-xl font-bold text-base sm:text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2 sm:gap-3 shadow-lg hover:shadow-xl"
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 sm:h-5 w-4 sm:w-5 border-b-2 border-white"></div>
                        <span>{t.submitting}</span>
                      </>
                    ) : (
                      <>
                        <img
                          src="/supportcard/paddy.png"
                          alt="Paddy"
                          className="w-6 sm:w-7 h-6 sm:h-7 object-contain"
                        />
                        <span>{t.submitBtn}</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Recent Supporters */}
            <div className={`rounded-2xl p-4 sm:p-6 md:p-8 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-xl h-fit`}>
              <h3 className={`text-lg sm:text-xl font-bold mb-4 sm:mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t.recentSupporters}
              </h3>

              {loading ? (
                <div className="flex justify-center py-6 sm:py-8">
                  <div className="animate-spin rounded-full h-6 sm:h-8 w-6 sm:w-8 border-b-2 border-green-500"></div>
                </div>
              ) : stats?.recentPledges && stats.recentPledges.length > 0 ? (
                <div className="space-y-2 sm:space-y-3">
                  {stats.recentPledges.map((pledge, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg ${
                        isDark ? 'bg-gray-700/50' : 'bg-gray-50'
                      }`}
                    >
                      <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center text-white font-bold text-sm sm:text-base flex-shrink-0">
                        {pledge.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium truncate text-sm sm:text-base ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {pledge.name}
                        </p>
                        <p className={`text-[10px] sm:text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {t.dhaka18} • {new Date(pledge.created_at).toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US')}
                        </p>
                      </div>
                      <img
                        src="/supportcard/paddy.png"
                        alt="Paddy"
                        className="w-5 sm:w-6 h-5 sm:h-6 object-contain flex-shrink-0"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <p className={`text-center py-6 sm:py-8 text-sm sm:text-base ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  {language === 'bn' ? 'এখনো কোনো সমর্থক নেই। প্রথম হোন!' : 'No supporters yet. Be the first!'}
                </p>
              )}

              {/* Animated Counter */}
              <div className={`mt-4 sm:mt-6 p-3 sm:p-4 rounded-xl text-center ${
                isDark ? 'bg-gradient-to-r from-green-900/50 to-green-800/50' : 'bg-gradient-to-r from-green-50 to-green-100'
              }`}>
                <p className={`text-xs sm:text-sm ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                  {language === 'bn' ? 'মোট সমর্থক' : 'Total Supporters'}
                </p>
                <p className="text-3xl sm:text-4xl font-bold text-green-500 mt-1">
                  {totalCount.toLocaleString()}
                </p>
              </div>

              {/* Support Appeal Box */}
              <div className={`mt-3 sm:mt-4 p-3 sm:p-4 rounded-xl border-2 border-dashed ${
                isDark ? 'border-green-700 bg-green-900/20' : 'border-green-300 bg-green-50'
              }`}>
                <div className="flex items-center gap-2 sm:gap-3">
                  <img
                    src="/supportcard/paddy.png"
                    alt="Paddy"
                    className="w-8 sm:w-10 h-8 sm:h-10 object-contain flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <p className={`font-bold text-sm sm:text-base ${isDark ? 'text-green-400' : 'text-green-700'}`}>
                      {language === 'bn' ? 'এস এম জাহাঙ্গীর হোসেনকে সমর্থন করুন' : 'Support S M Jahangir Hossain'}
                    </p>
                    <p className={`text-xs sm:text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {language === 'bn' ? 'ঢাকা-১৮ আসন' : 'Dhaka-18 Constituency'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
