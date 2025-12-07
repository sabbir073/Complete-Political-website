"use client";

import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/providers/LanguageProvider';
import { useTheme } from '@/providers/ThemeProvider';
import html2canvas from 'html2canvas';

// Thana options for Dhaka-18
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
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    thana: '',
    message: '',
    is_public: true
  });
  const [submitting, setSubmitting] = useState(false);
  const [pledgeSuccess, setPledgeSuccess] = useState<PledgeData | null>(null);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  // Translations
  const t = {
    title: language === 'bn' ? 'নির্বাচন ২০২৬' : 'Election 2026',
    subtitle: language === 'bn' ? 'এস এম জাহাঙ্গীর হোসেনের পাশে দাঁড়ান' : 'Stand with S M Jahangir Hossain',
    pledgeTitle: language === 'bn' ? 'আমি সমর্থন করি' : 'I Support',
    pledgeSubtitle: language === 'bn' ? 'ঢাকা-১৮ এর পরিবর্তনের জন্য আপনার সমর্থন জানান' : 'Show your support for change in Dhaka-18',
    totalSupporters: language === 'bn' ? 'জন সমর্থক' : 'Supporters',
    todaySupporters: language === 'bn' ? 'আজকে যোগ দিয়েছেন' : 'Joined Today',
    name: language === 'bn' ? 'আপনার নাম' : 'Your Name',
    phone: language === 'bn' ? 'ফোন নম্বর (ঐচ্ছিক)' : 'Phone Number (Optional)',
    thana: language === 'bn' ? 'থানা (ঐচ্ছিক)' : 'Thana (Optional)',
    selectThana: language === 'bn' ? 'থানা নির্বাচন করুন' : 'Select Thana',
    message: language === 'bn' ? 'সমর্থন বার্তা (ঐচ্ছিক)' : 'Support Message (Optional)',
    showPublicly: language === 'bn' ? 'আমার নাম প্রকাশ্যে দেখানো যাবে' : 'Show my name publicly',
    submitBtn: language === 'bn' ? 'আমি সমর্থন করি' : 'I Support S M Jahangir',
    submitting: language === 'bn' ? 'জমা হচ্ছে...' : 'Submitting...',
    successTitle: language === 'bn' ? 'ধন্যবাদ!' : 'Thank You!',
    successMessage: language === 'bn' ? 'আপনার সমর্থনের জন্য ধন্যবাদ। নিচে আপনার সমর্থন কার্ড ডাউনলোড করুন এবং শেয়ার করুন!' : 'Thank you for your support. Download and share your support card below!',
    downloadCard: language === 'bn' ? 'সাপোর্ট কার্ড ডাউনলোড করুন' : 'Download Support Card',
    downloading: language === 'bn' ? 'ডাউনলোড হচ্ছে...' : 'Downloading...',
    shareOn: language === 'bn' ? 'শেয়ার করুন' : 'Share on',
    pledgeAnother: language === 'bn' ? 'আরেকজনের সমর্থন নিবন্ধন করুন' : 'Register Another Support',
    recentSupporters: language === 'bn' ? 'সাম্প্রতিক সমর্থকগণ' : 'Recent Supporters',
    cardTitle: language === 'bn' ? 'আমি সমর্থন করি' : 'I SUPPORT',
    cardSubtitle: language === 'bn' ? 'ঢাকা-১৮ | নির্বাচন ২০২৬' : 'Dhaka-18 | Election 2026',
    cardFooter: language === 'bn' ? 'পরিবর্তনের জন্য ভোট দিন' : 'Vote for Change',
    joinMovement: language === 'bn' ? 'আন্দোলনে যোগ দিন' : 'Join the Movement'
  };

  useEffect(() => {
    fetchStats();
  }, []);

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
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/election-2026/pledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
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
      link.download = `support-card-${pledgeSuccess?.pledge_id || 'smj'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Failed to download card:', error);
    } finally {
      setDownloading(false);
    }
  };

  const shareOnFacebook = () => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(language === 'bn'
      ? 'আমি এস এম জাহাঙ্গীর হোসেনকে সমর্থন করি - ঢাকা-১৮ নির্বাচন ২০২৬'
      : 'I support S M Jahangir Hossain - Dhaka-18 Election 2026');
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`, '_blank');
  };

  const shareOnTwitter = () => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(language === 'bn'
      ? 'আমি এস এম জাহাঙ্গীর হোসেনকে সমর্থন করি - ঢাকা-১৮ #Election2026 #Dhaka18'
      : 'I support S M Jahangir Hossain - Dhaka-18 #Election2026 #Dhaka18');
    window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank');
  };

  const shareOnWhatsApp = () => {
    const url = window.location.href;
    const text = language === 'bn'
      ? `আমি এস এম জাহাঙ্গীর হোসেনকে সমর্থন করি - ঢাকা-১৮ নির্বাচন ২০২৬\n\n${url}`
      : `I support S M Jahangir Hossain - Dhaka-18 Election 2026\n\n${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const resetForm = () => {
    setFormData({ name: '', phone: '', thana: '', message: '', is_public: true });
    setPledgeSuccess(null);
    setError('');
  };

  const getThanaLabel = (key: string) => {
    const thana = thanaOptions.find(t => t.value === key);
    return thana ? (language === 'bn' ? thana.label.bn : thana.label.en) : key;
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Hero Section */}
      <div className="relative py-16 md:py-24 bg-gradient-to-br from-green-700 via-green-600 to-red-600 overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full translate-x-1/3 translate-y-1/3"></div>

        <div className="relative container mx-auto px-4 text-center text-white">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-sm font-medium mb-6">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            {t.joinMovement}
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4">{t.title}</h1>
          <p className="text-xl md:text-2xl opacity-90 max-w-2xl mx-auto">{t.subtitle}</p>

          {/* Live Counter */}
          <div className="mt-8 inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/20 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <span className="text-3xl md:text-4xl font-bold">{loading ? '...' : totalCount.toLocaleString()}</span>
              <span className="text-lg opacity-90">{t.totalSupporters}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="container mx-auto px-4 -mt-8 relative z-10">
        <div className="grid grid-cols-2 gap-4 max-w-xl mx-auto">
          <div className={`rounded-xl p-6 text-center shadow-lg ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white'}`}>
            <div className="text-3xl font-bold text-green-500 mb-1">
              {loading ? '...' : (stats?.total || 0).toLocaleString()}
            </div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {t.totalSupporters}
            </div>
          </div>
          <div className={`rounded-xl p-6 text-center shadow-lg ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white'}`}>
            <div className="text-3xl font-bold text-red-500 mb-1">
              {loading ? '...' : (stats?.today || 0).toLocaleString()}
            </div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {t.todaySupporters}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Pledge Form */}
            <div className={`rounded-2xl p-6 md:p-8 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-xl`}>
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-green-500 to-green-600 text-white mb-4">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                </div>
                <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t.pledgeTitle}
                </h2>
                <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t.pledgeSubtitle}
                </p>
              </div>

              {pledgeSuccess ? (
                /* Success State with Card */
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 text-green-500 mb-4">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {t.successTitle}
                  </h3>
                  <p className={`mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t.successMessage}
                  </p>

                  {/* Support Card Preview */}
                  <div className="mb-6 flex justify-center">
                    <div
                      ref={cardRef}
                      style={{
                        width: '350px',
                        backgroundColor: '#ffffff',
                        borderRadius: '16px',
                        overflow: 'hidden',
                        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)'
                      }}
                    >
                      {/* Card Header with gradient */}
                      <div style={{
                        background: 'linear-gradient(135deg, #16a34a 0%, #15803d 50%, #dc2626 100%)',
                        padding: '20px',
                        textAlign: 'center',
                        color: 'white'
                      }}>
                        <p style={{ fontSize: '12px', opacity: 0.9, margin: 0, letterSpacing: '2px' }}>
                          ELECTION 2026
                        </p>
                        <h2 style={{ fontSize: '28px', fontWeight: 'bold', margin: '8px 0', letterSpacing: '1px' }}>
                          {t.cardTitle}
                        </h2>
                        <p style={{ fontSize: '14px', opacity: 0.9, margin: 0 }}>
                          {t.cardSubtitle}
                        </p>
                      </div>

                      {/* Card Body */}
                      <div style={{ padding: '24px', textAlign: 'center' }}>
                        {/* SM Jahangir Photo Placeholder */}
                        <div style={{
                          width: '100px',
                          height: '100px',
                          borderRadius: '50%',
                          margin: '0 auto 16px',
                          background: 'linear-gradient(135deg, #16a34a, #15803d)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: '36px',
                          fontWeight: 'bold',
                          border: '4px solid #e5e7eb'
                        }}>
                          SMJ
                        </div>

                        <h3 style={{
                          fontSize: '20px',
                          fontWeight: 'bold',
                          color: '#111827',
                          margin: '0 0 4px 0'
                        }}>
                          S M Jahangir Hossain
                        </h3>
                        <p style={{
                          fontSize: '14px',
                          color: '#6b7280',
                          margin: '0 0 16px 0'
                        }}>
                          Dhaka-18 | BNP
                        </p>

                        {/* Divider */}
                        <div style={{
                          width: '60px',
                          height: '3px',
                          background: 'linear-gradient(90deg, #16a34a, #dc2626)',
                          margin: '0 auto 16px',
                          borderRadius: '2px'
                        }}></div>

                        {/* Supporter Name */}
                        <p style={{
                          fontSize: '12px',
                          color: '#9ca3af',
                          margin: '0 0 4px 0',
                          textTransform: 'uppercase',
                          letterSpacing: '1px'
                        }}>
                          Supported by
                        </p>
                        <p style={{
                          fontSize: '22px',
                          fontWeight: 'bold',
                          color: '#16a34a',
                          margin: '0 0 8px 0'
                        }}>
                          {pledgeSuccess.name}
                        </p>
                        <p style={{
                          fontSize: '12px',
                          color: '#9ca3af',
                          margin: '0'
                        }}>
                          {new Date(pledgeSuccess.created_at).toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>

                      {/* Card Footer */}
                      <div style={{
                        background: '#f3f4f6',
                        padding: '12px 20px',
                        textAlign: 'center',
                        borderTop: '1px solid #e5e7eb'
                      }}>
                        <p style={{
                          fontSize: '13px',
                          color: '#16a34a',
                          margin: 0,
                          fontWeight: '600'
                        }}>
                          {t.cardFooter}
                        </p>
                        <p style={{
                          fontSize: '11px',
                          color: '#9ca3af',
                          margin: '4px 0 0 0'
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
                    className="w-full max-w-xs mx-auto flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
                  >
                    {downloading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>{t.downloading}</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        <span>{t.downloadCard}</span>
                      </>
                    )}
                  </button>

                  {/* Social Share Buttons */}
                  <div className="mt-6">
                    <p className={`text-sm mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {t.shareOn}:
                    </p>
                    <div className="flex justify-center gap-3">
                      <button
                        onClick={shareOnFacebook}
                        className="p-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                        title="Facebook"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M18.77,7.46H14.5v-1.9c0-.9.6-1.1,1-1.1h3V.5h-4.33C10.24.5,9.5,3.44,9.5,5.32v2.15h-3v4h3v12h5v-12h3.85l.42-4Z"/>
                        </svg>
                      </button>
                      <button
                        onClick={shareOnTwitter}
                        className="p-3 rounded-full bg-black hover:bg-gray-800 text-white transition-colors"
                        title="X (Twitter)"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                        </svg>
                      </button>
                      <button
                        onClick={shareOnWhatsApp}
                        className="p-3 rounded-full bg-green-500 hover:bg-green-600 text-white transition-colors"
                        title="WhatsApp"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Register Another */}
                  <button
                    onClick={resetForm}
                    className={`mt-6 px-6 py-2 rounded-lg font-medium transition-colors ${
                      isDark
                        ? 'bg-gray-700 hover:bg-gray-600 text-white'
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                    }`}
                  >
                    {t.pledgeAnother}
                  </button>
                </div>
              ) : (
                /* Pledge Form */
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-center">
                      {error}
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
                      placeholder={language === 'bn' ? 'আপনার পূর্ণ নাম' : 'Your full name'}
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t.phone}
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className={`w-full px-4 py-3 rounded-xl border ${
                        isDark
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-gray-50 border-gray-300 text-gray-900'
                      }`}
                      placeholder="01XXXXXXXXX"
                    />
                  </div>

                  {/* Thana */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t.thana}
                    </label>
                    <select
                      value={formData.thana}
                      onChange={(e) => setFormData({ ...formData, thana: e.target.value })}
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

                  {/* Message */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t.message}
                    </label>
                    <textarea
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      rows={2}
                      className={`w-full px-4 py-3 rounded-xl border ${
                        isDark
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-gray-50 border-gray-300 text-gray-900'
                      }`}
                      placeholder={language === 'bn' ? 'আপনার সমর্থন বার্তা...' : 'Your support message...'}
                    />
                  </div>

                  {/* Public Toggle */}
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_public}
                      onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
                      className="w-5 h-5 rounded text-green-600"
                    />
                    <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t.showPublicly}
                    </span>
                  </label>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-xl font-bold text-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>{t.submitting}</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                        </svg>
                        <span>{t.submitBtn}</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Recent Supporters */}
            <div className={`rounded-2xl p-6 md:p-8 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-xl h-fit`}>
              <h3 className={`text-xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t.recentSupporters}
              </h3>

              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                </div>
              ) : stats?.recentPledges && stats.recentPledges.length > 0 ? (
                <div className="space-y-3">
                  {stats.recentPledges.map((pledge, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center gap-3 p-3 rounded-lg ${
                        isDark ? 'bg-gray-700/50' : 'bg-gray-50'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center text-white font-bold">
                        {pledge.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {pledge.name}
                        </p>
                        <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {pledge.thana ? getThanaLabel(pledge.thana) : 'Dhaka-18'} • {new Date(pledge.created_at).toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US')}
                        </p>
                      </div>
                      <span className="text-green-500">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                        </svg>
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className={`text-center py-8 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  {language === 'bn' ? 'এখনো কোনো সমর্থক নেই। প্রথম হোন!' : 'No supporters yet. Be the first!'}
                </p>
              )}

              {/* Animated Counter */}
              <div className={`mt-6 p-4 rounded-xl text-center ${
                isDark ? 'bg-gradient-to-r from-green-900/50 to-green-800/50' : 'bg-gradient-to-r from-green-50 to-green-100'
              }`}>
                <p className={`text-sm ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                  {language === 'bn' ? 'মোট সমর্থক' : 'Total Supporters'}
                </p>
                <p className="text-4xl font-bold text-green-500 mt-1">
                  {totalCount.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
