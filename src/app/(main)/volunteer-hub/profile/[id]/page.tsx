'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useLanguage } from '@/providers/LanguageProvider';
import Link from 'next/link';
import QRCode from 'qrcode';
import html2canvas from 'html2canvas';

// Types
interface VolunteerProfile {
  volunteer_id: string;
  name: string;
  name_bn?: string;
  thana: {
    key: string;
    label: { en: string; bn: string };
  };
  ward: string;
  categories: Array<{
    key: string;
    label: { en: string; bn: string };
  }>;
  badges: Array<{
    key: string;
    name_en: string;
    name_bn: string;
    icon: string;
    color: string;
  }>;
  status: string;
  member_since: string;
  photo_url?: string;
}

// Translation keys
const translations = {
  en: {
    title: 'Volunteer Profile',
    notFound: 'Volunteer Not Found',
    notFoundDesc: 'No volunteer found with this ID. Please check the ID and try again.',
    backToHub: 'Back to Volunteer Hub',
    volunteerId: 'Volunteer ID',
    name: 'Name',
    thana: 'Thana',
    location: 'Location',
    ward: 'Ward',
    categories: 'Categories',
    badges: 'Badges',
    memberSince: 'Member Since',
    status: 'Status',
    verified: 'Verified',
    pending: 'Pending Verification',
    suspended: 'Suspended',
    rejected: 'Rejected',
    downloadCard: 'Download ID Card',
    idCard: {
      title: 'VOLUNTEER ID CARD',
      subtitle: 'স্বেচ্ছাসেবক পরিচয়পত্র',
      issueDate: 'Issue Date',
      organization: 'S M Jahangir Hossain',
      constituency: 'Dhaka-18 | BNP',
    },
    noBadges: 'No badges yet',
    scanQr: 'Scan to verify',
    loading: 'Loading...',
  },
  bn: {
    title: 'স্বেচ্ছাসেবক প্রোফাইল',
    notFound: 'স্বেচ্ছাসেবক পাওয়া যায়নি',
    notFoundDesc: 'এই আইডি দিয়ে কোনো স্বেচ্ছাসেবক পাওয়া যায়নি। আইডি যাচাই করে আবার চেষ্টা করুন।',
    backToHub: 'ভলান্টিয়ার হাবে ফিরুন',
    volunteerId: 'স্বেচ্ছাসেবক আইডি',
    name: 'নাম',
    thana: 'থানা',
    location: 'অবস্থান',
    ward: 'ওয়ার্ড',
    categories: 'ক্যাটাগরি',
    badges: 'ব্যাজ',
    memberSince: 'সদস্য হয়েছেন',
    status: 'স্ট্যাটাস',
    verified: 'যাচাইকৃত',
    pending: 'যাচাই অপেক্ষমান',
    suspended: 'স্থগিত',
    rejected: 'প্রত্যাখ্যাত',
    downloadCard: 'পরিচয়পত্র ডাউনলোড করুন',
    idCard: {
      title: 'VOLUNTEER ID CARD',
      subtitle: 'স্বেচ্ছাসেবক পরিচয়পত্র',
      issueDate: 'ইস্যু তারিখ',
      organization: 'এস এম জাহাঙ্গীর হোসেন',
      constituency: 'ঢাকা-১৮ | বিএনপি',
    },
    noBadges: 'এখনো কোনো ব্যাজ নেই',
    scanQr: 'যাচাই করতে স্ক্যান করুন',
    loading: 'লোড হচ্ছে...',
  },
};

// Category icons
const categoryIcons: Record<string, string> = {
  socialActivism: '✊',
  disasterManagement: '🚨',
  socialMediaActivism: '📱',
  creativeWriting: '✍️',
  itSupport: '💻',
  healthcareSupport: '🏥',
  educationTutoring: '📚',
  legalAid: '⚖️',
  eventManagement: '🎪',
  securityDiscipline: '🛡️',
  transportationLogistics: '🚗',
  mediaPhotography: '📸',
  financeAccounting: '💰',
  womensAffairs: '👩',
  youthMobilization: '🎯',
};

export default function VolunteerProfilePage() {
  const params = useParams();
  const volunteerId = params.id as string;
  const { language } = useLanguage();
  const t = translations[language as keyof typeof translations] || translations.en;

  const [volunteer, setVolunteer] = useState<VolunteerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [photoBase64, setPhotoBase64] = useState<string>('');
  const [downloading, setDownloading] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);

  // Helper function to convert image URL to base64 using server proxy
  const imageToBase64 = async (url: string): Promise<string> => {
    try {
      // Use server-side proxy to avoid CORS issues
      const response = await fetch(`/api/volunteer-hub/image-proxy?url=${encodeURIComponent(url)}`);
      const data = await response.json();
      if (data.success && data.dataUrl) {
        return data.dataUrl;
      }
      console.error('Failed to convert image:', data.error);
      return '';
    } catch (err) {
      console.error('Failed to convert image to base64:', err);
      return '';
    }
  };

  // Fetch volunteer data
  useEffect(() => {
    const fetchVolunteer = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/volunteer-hub/search?id=${volunteerId}`);
        const data = await response.json();

        if (data.success) {
          setVolunteer(data.volunteer);

          // Generate QR code
          const profileUrl = `${window.location.origin}/volunteer-hub/profile/${data.volunteer.volunteer_id}`;
          const qrUrl = await QRCode.toDataURL(profileUrl, {
            width: 120,
            margin: 1,
            color: {
              dark: '#000000',
              light: '#ffffff',
            },
          });
          setQrCodeUrl(qrUrl);

          // Convert photo to base64 for ID card (avoids CORS issues with html2canvas)
          if (data.volunteer.photo_url) {
            const base64 = await imageToBase64(data.volunteer.photo_url);
            setPhotoBase64(base64);
          }
        } else {
          setError(data.error || 'Volunteer not found');
        }
      } catch (err) {
        console.error('Error fetching volunteer:', err);
        setError('Failed to load volunteer profile');
      } finally {
        setLoading(false);
      }
    };

    if (volunteerId) {
      fetchVolunteer();
    }
  }, [volunteerId]);

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  // Get status color and text
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'verified':
        return { color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', text: t.verified, icon: '✅' };
      case 'pending':
        return { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400', text: t.pending, icon: '⏳' };
      case 'suspended':
        return { color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', text: t.suspended, icon: '🚫' };
      case 'rejected':
        return { color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400', text: t.rejected, icon: '❌' };
      default:
        return { color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400', text: status, icon: '❓' };
    }
  };

  // Download ID card as image
  const downloadIdCard = async () => {
    if (!cardRef.current || !volunteer) return;

    setDownloading(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
        logging: false,
      });

      const link = document.createElement('a');
      link.download = `volunteer-id-${volunteer.volunteer_id}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Error downloading ID card:', err);
      alert('Failed to download ID card. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">{t.loading}</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !volunteer) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t.notFound}</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{t.notFoundDesc}</p>
          <Link
            href="/volunteer-hub"
            className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            ← {t.backToHub}
          </Link>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(volunteer.status);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back link */}
        <Link
          href="/volunteer-hub"
          className="inline-flex items-center text-green-600 hover:text-green-700 mb-6"
        >
          ← {t.backToHub}
        </Link>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Profile Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 text-white text-center">
              {/* Profile Photo */}
              <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden border-4 border-white/30 bg-white/20 flex items-center justify-center">
                {volunteer.photo_url ? (
                  <img
                    src={volunteer.photo_url}
                    alt={volunteer.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-4xl">👤</span>
                )}
              </div>

              <h1 className="text-2xl font-bold mb-1">
                {language === 'bn' && volunteer.name_bn ? volunteer.name_bn : volunteer.name}
              </h1>

              <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                volunteer.status === 'verified'
                  ? 'bg-white/20'
                  : 'bg-yellow-500/80'
              }`}>
                <span>{statusInfo.icon}</span>
                <span>{statusInfo.text}</span>
              </div>
            </div>

            {/* Profile Info */}
            <div className="p-6 space-y-4">
              {/* Volunteer ID */}
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center">
                <p className="text-sm text-green-600 dark:text-green-400 mb-1">{t.volunteerId}</p>
                <p className="text-3xl font-bold font-mono text-green-700 dark:text-green-300">
                  {volunteer.volunteer_id}
                </p>
              </div>

              {/* Location */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <span className="text-2xl">📍</span>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t.location}</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {language === 'bn' ? volunteer.thana.label.bn : volunteer.thana.label.en}
                  </p>
                </div>
              </div>

              {/* Ward */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <span className="text-2xl">🏘️</span>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t.ward}</p>
                  <p className="font-medium text-gray-900 dark:text-white">{volunteer.ward}</p>
                </div>
              </div>

              {/* Member Since */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <span className="text-2xl">📅</span>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t.memberSince}</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {formatDate(volunteer.member_since)}
                  </p>
                </div>
              </div>

              {/* Categories */}
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{t.categories}</p>
                <div className="flex flex-wrap gap-2">
                  {volunteer.categories.map((cat) => (
                    <span
                      key={cat.key}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm"
                    >
                      <span>{categoryIcons[cat.key] || '📌'}</span>
                      <span>{language === 'bn' ? cat.label.bn : cat.label.en}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Badges */}
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{t.badges}</p>
                {volunteer.badges && volunteer.badges.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {volunteer.badges.map((badge, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-full text-sm"
                      >
                        <span>{badge.icon}</span>
                        <span>{language === 'bn' ? badge.name_bn : badge.name_en}</span>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 dark:text-gray-500 text-sm italic">{t.noBadges}</p>
                )}
              </div>
            </div>
          </div>

          {/* ID Card Preview & Download */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t.downloadCard}
            </h2>

            {/* ID Card - Using inline styles for html2canvas compatibility */}
            <div
              ref={cardRef}
              style={{
                width: '350px',
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
              }}
            >
              {/* Card Header */}
              <div style={{
                background: 'linear-gradient(to right, #16a34a, #15803d)',
                padding: '16px 16px 18px 16px',
                textAlign: 'center',
                color: '#ffffff'
              }}>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', lineHeight: '1.4', margin: 0, paddingBottom: '2px' }}>{t.idCard.title}</h3>
                <p style={{ fontSize: '14px', lineHeight: '1.4', opacity: 0.9, margin: 0, paddingBottom: '2px' }}>{t.idCard.subtitle}</p>
              </div>

              {/* Card Body */}
              <div style={{ padding: '16px' }}>
                <div style={{ display: 'flex', gap: '16px' }}>
                  {/* Photo & QR Code Column */}
                  <div style={{ flexShrink: 0 }}>
                    {/* Photo - Using base64 for html2canvas compatibility */}
                    <div style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '50%',
                      overflow: 'hidden',
                      border: '3px solid #16a34a',
                      marginBottom: '8px',
                      backgroundColor: '#f3f4f6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {(photoBase64 || volunteer.photo_url) ? (
                        <img
                          src={photoBase64 || volunteer.photo_url}
                          alt={volunteer.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <svg style={{ width: '40px', height: '40px', color: '#9ca3af' }} fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                        </svg>
                      )}
                    </div>
                    {/* QR Code */}
                    {qrCodeUrl && (
                      <div style={{
                        backgroundColor: '#ffffff',
                        padding: '4px 4px 6px 4px',
                        borderRadius: '8px',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                      }}>
                        <img src={qrCodeUrl} alt="QR Code" style={{ width: '76px', height: '76px', display: 'block' }} />
                        <p style={{ fontSize: '10px', lineHeight: '1.4', color: '#6b7280', textAlign: 'center', margin: 0, paddingTop: '4px' }}>{t.scanQr}</p>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ marginBottom: '12px' }}>
                      <p style={{ fontSize: '11px', lineHeight: '1.4', color: '#6b7280', margin: 0, paddingBottom: '2px' }}>{t.name}</p>
                      <p style={{ fontSize: '14px', fontWeight: 'bold', lineHeight: '1.4', color: '#111827', margin: 0, paddingBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{volunteer.name}</p>
                      {volunteer.name_bn && (
                        <p style={{ fontSize: '13px', lineHeight: '1.4', color: '#4b5563', margin: 0, paddingBottom: '2px' }}>{volunteer.name_bn}</p>
                      )}
                    </div>

                    <div style={{ marginBottom: '12px' }}>
                      <p style={{ fontSize: '11px', lineHeight: '1.4', color: '#6b7280', margin: 0, paddingBottom: '2px' }}>{t.volunteerId}</p>
                      <p style={{ fontSize: '22px', fontWeight: 'bold', lineHeight: '1.3', fontFamily: 'monospace', color: '#16a34a', margin: 0, paddingBottom: '2px' }}>
                        {volunteer.volunteer_id}
                      </p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '11px' }}>
                      <div>
                        <p style={{ lineHeight: '1.4', color: '#6b7280', margin: 0, paddingBottom: '2px' }}>{t.thana}</p>
                        <p style={{ fontWeight: 500, lineHeight: '1.4', color: '#111827', margin: 0, paddingBottom: '2px' }}>{volunteer.thana.label.en}</p>
                      </div>
                      <div>
                        <p style={{ lineHeight: '1.4', color: '#6b7280', margin: 0, paddingBottom: '2px' }}>{t.ward}</p>
                        <p style={{ fontWeight: 500, lineHeight: '1.4', color: '#111827', margin: 0, paddingBottom: '2px' }}>Ward {volunteer.ward}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Categories */}
                <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #f3f4f6' }}>
                  <p style={{ fontSize: '11px', lineHeight: '1.4', color: '#6b7280', margin: 0, paddingBottom: '4px' }}>{t.categories}</p>
                  <p style={{ fontSize: '11px', lineHeight: '1.5', color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0, paddingBottom: '4px' }}>
                    {volunteer.categories.map(c => c.label.en).join(', ')}
                  </p>
                </div>
              </div>

              {/* Card Footer */}
              <div style={{
                backgroundColor: '#f9fafb',
                padding: '14px 16px',
                borderTop: '1px solid #f3f4f6'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px' }}>
                  <div>
                    <p style={{ fontWeight: 'bold', lineHeight: '1.4', color: '#111827', margin: 0, paddingBottom: '2px' }}>{t.idCard.organization}</p>
                    <p style={{ lineHeight: '1.4', color: '#6b7280', margin: 0, paddingBottom: '2px' }}>{t.idCard.constituency}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ lineHeight: '1.4', color: '#6b7280', margin: 0, paddingBottom: '2px' }}>{t.idCard.issueDate}</p>
                    <p style={{ fontWeight: 500, lineHeight: '1.4', color: '#111827', margin: 0, paddingBottom: '2px' }}>{formatDate(volunteer.member_since)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Download Button */}
            <button
              onClick={downloadIdCard}
              disabled={downloading}
              className="mt-4 w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {downloading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>{language === 'bn' ? 'ডাউনলোড হচ্ছে...' : 'Downloading...'}</span>
                </>
              ) : (
                <>
                  <span>📥</span>
                  <span>{t.downloadCard}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
