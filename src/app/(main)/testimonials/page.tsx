'use client';

import { useState, useEffect, useRef } from 'react';
import { useTheme } from '@/providers/ThemeProvider';
import { useLanguage } from '@/providers/LanguageProvider';
import { format } from 'date-fns';
import Image from 'next/image';
import {
  FaBuilding,
  FaGraduationCap,
  FaHeart,
  FaBriefcase,
  FaLeaf,
  FaUsers,
  FaHome,
  FaCar,
  FaBolt,
  FaShieldAlt,
  FaGlobe,
  FaStar,
  FaCommentDots
} from 'react-icons/fa';

// Icon mapping for dynamic icon rendering
const iconMap: { [key: string]: React.ComponentType<{ className?: string }> } = {
  Building: FaBuilding,
  GraduationCap: FaGraduationCap,
  Heart: FaHeart,
  Briefcase: FaBriefcase,
  Leaf: FaLeaf,
  Users: FaUsers,
  Home: FaHome,
  Car: FaCar,
  Zap: FaBolt,
  Shield: FaShieldAlt,
  Globe: FaGlobe,
  Star: FaStar,
  MessageCircle: FaCommentDots,
};

const DynamicIcon = ({ name, className }: { name: string; className?: string }) => {
  const IconComponent = iconMap[name];
  if (!IconComponent) return null;
  return <IconComponent className={className} />;
};

// Helper function to extract YouTube video ID
const getYouTubeId = (url?: string): string | null => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

// Helper function to extract Vimeo video ID
const getVimeoId = (url?: string): string | null => {
  if (!url) return null;
  const match = url.match(/vimeo\.com\/(\d+)/);
  return match ? match[1] : null;
};

// Check if URL is a direct video file
const isDirectVideoUrl = (url?: string): boolean => {
  if (!url) return false;
  const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi'];
  const lowerUrl = url.toLowerCase();
  return videoExtensions.some(ext => lowerUrl.includes(ext)) ||
         url.includes('cloudfront.net') ||
         url.includes('/videos/');
};

// Video Player Component
interface VideoPlayerProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ isOpen, onClose, videoUrl }) => {
  const [isLoading, setIsLoading] = useState(true);
  const { isDark } = useTheme();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setIsLoading(true);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, videoUrl]);

  // Auto-hide loading after 3 seconds for direct videos
  useEffect(() => {
    if (isOpen && videoUrl && !getYouTubeId(videoUrl) && !getVimeoId(videoUrl)) {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, videoUrl]);

  if (!isOpen || !videoUrl) return null;

  const youtubeId = getYouTubeId(videoUrl);
  const vimeoId = getVimeoId(videoUrl);

  const renderVideo = () => {
    if (youtubeId) {
      return (
        <iframe
          src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1`}
          className="absolute inset-0 w-full h-full"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          onLoad={() => setIsLoading(false)}
        />
      );
    }

    if (vimeoId) {
      return (
        <iframe
          src={`https://player.vimeo.com/video/${vimeoId}?autoplay=1`}
          className="absolute inset-0 w-full h-full"
          frameBorder="0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          onLoad={() => setIsLoading(false)}
        />
      );
    }

    // Direct video file (mp4, webm, CloudFront URLs, etc.)
    return (
      <video
        ref={videoRef}
        key={videoUrl}
        src={videoUrl}
        className="absolute inset-0 w-full h-full object-contain bg-black"
        controls
        autoPlay
        playsInline
        preload="auto"
        onLoadedData={() => setIsLoading(false)}
        onCanPlay={() => setIsLoading(false)}
        onPlay={() => setIsLoading(false)}
      />
    );
  };

  return (
    <div className="fixed inset-0 z-[100001] flex items-center justify-center bg-black bg-opacity-90 p-4">
      <div className="relative w-full max-w-4xl mx-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-white hover:text-red-500 transition-colors duration-300 z-10"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Video Container */}
        <div className={`relative rounded-lg overflow-hidden shadow-2xl ${
          isDark ? "bg-gray-900" : "bg-black"
        }`}>
          <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
            {isLoading && (
              <div className={`absolute inset-0 flex items-center justify-center z-10 ${
                isDark ? "bg-gray-800" : "bg-gray-900"
              }`}>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
              </div>
            )}
            {renderVideo()}
          </div>
        </div>
      </div>
    </div>
  );
};

interface Category {
  id: string;
  name_en: string;
  name_bn: string;
  slug: string;
  icon: string;
}

interface Testimonial {
  id: string;
  category_id: string | null;
  person_name_en: string;
  person_name_bn: string | null;
  person_photo: string | null;
  location_en: string | null;
  location_bn: string | null;
  profession_en: string | null;
  profession_bn: string | null;
  content_en: string;
  content_bn: string | null;
  video_url: string | null;
  rating: number | null;
  is_verified: boolean;
  is_featured: boolean;
  submitted_at: string;
  testimonial_categories: Category | null;
}

interface Stats {
  total: number;
  verified: number;
  withVideo: number;
  averageRating: number;
}

export default function TestimonialsPage() {
  const { isDark } = useTheme();
  const { language } = useLanguage();
  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [showVideoOnly, setShowVideoOnly] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  // Upload states
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUploading, setVideoUploading] = useState(false);
  const [videoUploadProgress, setVideoUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    person_name_en: '',
    person_photo: '',
    location_en: '', // Address field
    profession_en: '',
    content_en: '',
    video_url: '',
    rating: 5,
    submitter_email: ''
  });

  const getText = (en: string | null | undefined, bn: string | null | undefined) => {
    if (language === 'bn' && bn) return bn;
    return en || '';
  };

  useEffect(() => {
    fetchData();
  }, [activeCategory, showVideoOnly]);

  const fetchData = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      if (activeCategory !== 'all') params.append('category', activeCategory);
      if (showVideoOnly) params.append('has_video', 'true');

      const [testimonialsRes, categoriesRes, statsRes] = await window.Promise.all([
        fetch(`/api/testimonials?${params}`),
        fetch('/api/testimonials/categories'),
        fetch('/api/testimonials/stats')
      ]);

      const [testimonialsData, categoriesData, statsData] = await window.Promise.all([
        testimonialsRes.json(),
        categoriesRes.json(),
        statsRes.json()
      ]);

      if (testimonialsData.success) setTestimonials(testimonialsData.data || []);
      if (categoriesData.success) setCategories(categoriesData.data || []);
      if (statsData.success) setStats(statsData.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle photo file selection
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadError(language === 'bn' ? 'দয়া করে একটি ছবি ফাইল নির্বাচন করুন' : 'Please select an image file');
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError(language === 'bn' ? 'ছবি ১০MB এর বেশি হতে পারবে না' : 'Photo must be less than 10MB');
      return;
    }

    setUploadError(null);
    setPhotoFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPhotoPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Handle video file selection
  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];
    if (!validTypes.includes(file.type)) {
      setUploadError(language === 'bn' ? 'MP4, WebM, MOV, বা AVI ভিডিও ফাইল নির্বাচন করুন' : 'Please select MP4, WebM, MOV, or AVI video file');
      return;
    }

    // Validate file size (200MB max)
    if (file.size > 200 * 1024 * 1024) {
      setUploadError(language === 'bn' ? 'ভিডিও ২০০MB এর বেশি হতে পারবে না' : 'Video must be less than 200MB');
      return;
    }

    setUploadError(null);
    setVideoFile(file);
    // Clear video URL if file is selected
    setFormData(prev => ({ ...prev, video_url: '' }));
  };

  // Upload photo to server
  const uploadPhoto = async (): Promise<string | null> => {
    if (!photoFile) return null;

    setPhotoUploading(true);
    try {
      const formDataObj = new FormData();
      formDataObj.append('file', photoFile);
      formDataObj.append('type', 'photo');

      const response = await fetch('/api/testimonials/upload', {
        method: 'POST',
        body: formDataObj
      });

      const data = await response.json();
      if (data.success) {
        return data.url;
      } else {
        setUploadError(data.error || 'Failed to upload photo');
        return null;
      }
    } catch (error) {
      console.error('Photo upload error:', error);
      setUploadError('Failed to upload photo');
      return null;
    } finally {
      setPhotoUploading(false);
    }
  };

  // Upload video using multipart upload for large files
  const uploadVideo = async (): Promise<string | null> => {
    if (!videoFile) return null;

    setVideoUploading(true);
    setVideoUploadProgress(0);

    try {
      const PART_SIZE = 5 * 1024 * 1024; // 5MB parts

      // For small files, use simple upload
      if (videoFile.size <= PART_SIZE * 2) {
        const formDataObj = new FormData();
        formDataObj.append('file', videoFile);
        formDataObj.append('type', 'video');

        const response = await fetch('/api/testimonials/upload', {
          method: 'POST',
          body: formDataObj
        });

        const data = await response.json();
        if (data.success) {
          setVideoUploadProgress(100);
          return data.url;
        } else {
          setUploadError(data.error || 'Failed to upload video');
          return null;
        }
      }

      // For large files, use multipart upload
      // Step 1: Initiate multipart upload
      const initResponse = await fetch('/api/testimonials/upload/multipart/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: videoFile.name,
          fileType: videoFile.type,
          fileSize: videoFile.size,
          partSize: PART_SIZE
        })
      });

      const initData = await initResponse.json();
      if (!initData.success) {
        setUploadError(initData.error || 'Failed to initiate upload');
        return null;
      }

      const { uploadId, s3Key, urls, totalParts } = initData;

      // Step 2: Upload each part
      const parts: { PartNumber: number; ETag: string }[] = [];

      for (let i = 0; i < totalParts; i++) {
        const start = i * PART_SIZE;
        const end = Math.min(start + PART_SIZE, videoFile.size);
        const blob = videoFile.slice(start, end);

        const partResponse = await fetch(urls[i], {
          method: 'PUT',
          body: blob
        });

        if (!partResponse.ok) {
          setUploadError(`Failed to upload part ${i + 1}`);
          return null;
        }

        const etag = partResponse.headers.get('ETag');
        if (etag) {
          parts.push({
            PartNumber: i + 1,
            ETag: etag.replace(/"/g, '')
          });
        }

        setVideoUploadProgress(Math.round(((i + 1) / totalParts) * 100));
      }

      // Step 3: Complete multipart upload
      const completeResponse = await fetch('/api/testimonials/upload/multipart/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uploadId,
          s3Key,
          parts
        })
      });

      const completeData = await completeResponse.json();
      if (completeData.success) {
        return completeData.url;
      } else {
        setUploadError(completeData.error || 'Failed to complete upload');
        return null;
      }

    } catch (error) {
      console.error('Video upload error:', error);
      setUploadError('Failed to upload video');
      return null;
    } finally {
      setVideoUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.person_name_en.trim() || !formData.content_en.trim()) return;

    setSubmitting(true);
    setUploadError(null);

    try {
      // Upload photo if selected
      let photoUrl = formData.person_photo;
      if (photoFile) {
        const uploadedPhotoUrl = await uploadPhoto();
        if (uploadedPhotoUrl) {
          photoUrl = uploadedPhotoUrl;
        }
      }

      // Upload video if selected (and no video URL provided)
      let videoUrl = formData.video_url;
      if (videoFile && !formData.video_url) {
        const uploadedVideoUrl = await uploadVideo();
        if (uploadedVideoUrl) {
          videoUrl = uploadedVideoUrl;
        }
      }

      const response = await fetch('/api/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          person_photo: photoUrl,
          video_url: videoUrl || null
        })
      });

      const data = await response.json();
      if (data.success) {
        setSubmitSuccess(true);
        // Reset form
        setFormData({
          person_name_en: '',
          person_photo: '',
          location_en: '',
          profession_en: '',
          content_en: '',
          video_url: '',
          rating: 5,
          submitter_email: ''
        });
        setPhotoFile(null);
        setPhotoPreview(null);
        setVideoFile(null);
        setVideoUploadProgress(0);

        setTimeout(() => {
          setShowSubmitModal(false);
          setSubmitSuccess(false);
        }, 3000);
      } else {
        setUploadError(data.error || 'Failed to submit testimonial');
      }
    } catch (error) {
      console.error('Error submitting:', error);
      setUploadError('Failed to submit testimonial');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      person_name_en: '',
      person_photo: '',
      location_en: '',
      profession_en: '',
      content_en: '',
      video_url: '',
      rating: 5,
      submitter_email: ''
    });
    setPhotoFile(null);
    setPhotoPreview(null);
    setVideoFile(null);
    setVideoUploadProgress(0);
    setUploadError(null);
  };

  const openVideoPlayer = (url: string) => {
    setActiveVideo(url);
  };

  const closeVideoPlayer = () => {
    setActiveVideo(null);
  };

  const renderStars = (rating: number | null, size: 'sm' | 'md' | 'lg' = 'md') => {
    if (!rating) return null;
    const sizeClass = size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-2xl' : 'text-lg';
    return (
      <div className={`flex gap-0.5 ${sizeClass}`}>
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} className={star <= rating ? 'text-yellow-500' : isDark ? 'text-gray-600' : 'text-gray-300'}>
            ★
          </span>
        ))}
      </div>
    );
  };

  const featuredTestimonials = testimonials.filter(t => t.is_featured);
  const regularTestimonials = testimonials.filter(t => !t.is_featured);

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Hero Section */}
      <div className={`relative py-16 ${isDark ? 'bg-gradient-to-br from-purple-900 via-gray-900 to-gray-900' : 'bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800'}`}>
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {language === 'bn' ? 'প্রশংসাপত্র' : 'Testimonials'}
          </h1>
          <p className="text-lg text-white/90 max-w-2xl mx-auto mb-8">
            {language === 'bn'
              ? 'জনগণের কণ্ঠস্বর শুনুন। আমাদের সম্প্রদায়ের সদস্যদের অভিজ্ঞতা এবং মতামত।'
              : 'Hear from the people. Real experiences and opinions from our community members.'}
          </p>

          {/* Stats */}
          {stats && (
            <div className="flex flex-wrap justify-center gap-6 mb-8">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-lg rounded-full px-5 py-2">
                <span className="text-2xl font-bold text-white">{stats.total}</span>
                <span className="text-white/80 text-sm">{language === 'bn' ? 'প্রশংসাপত্র' : 'Testimonials'}</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-lg rounded-full px-5 py-2">
                <span className="text-2xl font-bold text-white">{stats.verified}</span>
                <span className="text-white/80 text-sm">{language === 'bn' ? 'যাচাইকৃত' : 'Verified'}</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-lg rounded-full px-5 py-2">
                <span className="text-2xl font-bold text-yellow-400">{stats.averageRating}</span>
                <span className="text-yellow-400">★</span>
                <span className="text-white/80 text-sm">{language === 'bn' ? 'গড় রেটিং' : 'Avg Rating'}</span>
              </div>
            </div>
          )}

          <button
            onClick={() => setShowSubmitModal(true)}
            className="px-8 py-4 bg-white text-purple-700 rounded-full font-bold text-lg hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg"
          >
            {language === 'bn' ? '✍️ আপনার মতামত শেয়ার করুন' : '✍️ Share Your Feedback'}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeCategory === 'all'
                  ? 'bg-purple-600 text-white shadow-lg'
                  : isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {language === 'bn' ? 'সব' : 'All'}
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.slug)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                  activeCategory === cat.slug
                    ? 'bg-purple-600 text-white shadow-lg'
                    : isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                <DynamicIcon name={cat.icon} className="w-4 h-4" />
                {getText(cat.name_en, cat.name_bn)}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowVideoOnly(!showVideoOnly)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              showVideoOnly
                ? 'bg-red-600 text-white'
                : isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            🎥 {language === 'bn' ? 'ভিডিও' : 'Videos'}
          </button>
        </div>

        {/* Featured Testimonials */}
        {featuredTestimonials.length > 0 && (
          <div className="mb-12">
            <h2 className={`text-2xl font-bold mb-6 text-center ${isDark ? 'text-white' : 'text-gray-900'}`}>
              ⭐ {language === 'bn' ? 'বৈশিষ্ট্যযুক্ত প্রশংসাপত্র' : 'Featured Testimonials'}
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              {featuredTestimonials.map((testimonial) => (
                <div
                  key={testimonial.id}
                  className={`p-6 rounded-2xl border-2 border-purple-500/30 ${isDark ? 'bg-gray-800' : 'bg-white'}`}
                >
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="relative w-16 h-16 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-purple-500">
                      <Image
                        src={testimonial.person_photo || '/user-default.jpg'}
                        alt={testimonial.person_name_en}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {getText(testimonial.person_name_en, testimonial.person_name_bn)}
                        </h3>
                        {testimonial.is_verified && (
                          <span className="text-blue-500" title="Verified">✓</span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-sm mb-2">
                        {testimonial.profession_en && (
                          <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                            {getText(testimonial.profession_en, testimonial.profession_bn)}
                          </span>
                        )}
                        {testimonial.location_en && (
                          <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>
                            📍 {getText(testimonial.location_en, testimonial.location_bn)}
                          </span>
                        )}
                      </div>
                      {renderStars(testimonial.rating)}
                    </div>
                  </div>

                  <blockquote className={`mt-4 text-lg italic ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    &ldquo;{getText(testimonial.content_en, testimonial.content_bn)}&rdquo;
                  </blockquote>

                  {testimonial.video_url && (
                    <button
                      onClick={() => openVideoPlayer(testimonial.video_url!)}
                      className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors"
                    >
                      🎥 {language === 'bn' ? 'ভিডিও দেখুন' : 'Watch Video'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Regular Testimonials */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent" />
          </div>
        ) : regularTestimonials.length === 0 && featuredTestimonials.length === 0 ? (
          <div className={`text-center py-16 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="text-6xl mb-4">💬</div>
            <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {language === 'bn' ? 'কোনো প্রশংসাপত্র পাওয়া যায়নি' : 'No testimonials found'}
            </h3>
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              {language === 'bn' ? 'প্রথম হন আপনার মতামত শেয়ার করতে!' : 'Be the first to share your feedback!'}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {regularTestimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className={`p-5 rounded-2xl transition-all hover:shadow-lg ${isDark ? 'bg-gray-800 hover:bg-gray-750' : 'bg-white'}`}
              >
                <div className="flex items-center gap-3 mb-4">
                  {/* Avatar */}
                  <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                    <Image
                      src={testimonial.person_photo || '/user-default.jpg'}
                      alt={testimonial.person_name_en}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className={`font-semibold truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {getText(testimonial.person_name_en, testimonial.person_name_bn)}
                      </h4>
                      {testimonial.is_verified && (
                        <span className="text-blue-500 text-sm">✓</span>
                      )}
                      {testimonial.video_url && (
                        <span className="text-red-500 text-sm">🎥</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      {testimonial.profession_en && (
                        <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                          {getText(testimonial.profession_en, testimonial.profession_bn)}
                        </span>
                      )}
                      {testimonial.location_en && (
                        <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>
                          • {getText(testimonial.location_en, testimonial.location_bn)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {renderStars(testimonial.rating, 'sm')}

                <blockquote className={`mt-3 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  &ldquo;{getText(testimonial.content_en, testimonial.content_bn)}&rdquo;
                </blockquote>

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    {format(new Date(testimonial.submitted_at), 'MMM d, yyyy')}
                  </span>
                  {testimonial.video_url && (
                    <button
                      onClick={() => openVideoPlayer(testimonial.video_url!)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs hover:bg-red-700 transition-colors"
                    >
                      🎥 {language === 'bn' ? 'ভিডিও দেখুন' : 'Watch Video'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Submit Testimonial Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => { setShowSubmitModal(false); resetForm(); }} />
          <div className={`relative w-full max-w-2xl max-h-[90vh] rounded-2xl overflow-hidden flex flex-col ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className={`flex-shrink-0 p-6 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
              <button
                onClick={() => { setShowSubmitModal(false); resetForm(); }}
                className={`absolute top-4 right-4 p-2 rounded-full transition-colors ${
                  isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
                }`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {language === 'bn' ? '✍️ আপনার মতামত শেয়ার করুন' : '✍️ Share Your Feedback'}
              </h2>
              <p className={`mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {language === 'bn'
                  ? 'আপনার অভিজ্ঞতা অন্যদের সাথে শেয়ার করুন।'
                  : 'Share your experience with others.'}
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {submitSuccess ? (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">✅</div>
                  <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {language === 'bn' ? 'ধন্যবাদ!' : 'Thank You!'}
                  </h3>
                  <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                    {language === 'bn'
                      ? 'আপনার প্রশংসাপত্র পর্যালোচনা করা হচ্ছে।'
                      : 'Your testimonial is being reviewed.'}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Error Message */}
                  {uploadError && (
                    <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-sm">
                      {uploadError}
                    </div>
                  )}

                  {/* Photo Upload */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {language === 'bn' ? 'আপনার ছবি' : 'Your Photo'}
                    </label>
                    <div className="flex items-center gap-4">
                      {/* Photo Preview */}
                      <div
                        onClick={() => photoInputRef.current?.click()}
                        className={`w-20 h-20 rounded-full overflow-hidden flex items-center justify-center cursor-pointer border-2 border-dashed transition-colors ${
                          isDark
                            ? 'border-gray-600 hover:border-purple-500 bg-gray-700'
                            : 'border-gray-300 hover:border-purple-500 bg-gray-50'
                        }`}
                      >
                        {photoPreview ? (
                          <Image src={photoPreview} alt="Preview" width={80} height={80} className="w-full h-full object-cover" />
                        ) : (
                          <div className="text-center">
                            <svg className={`w-6 h-6 mx-auto ${isDark ? 'text-gray-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <input
                          ref={photoInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoSelect}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => photoInputRef.current?.click()}
                          className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                            isDark
                              ? 'bg-gray-700 hover:bg-gray-600 text-white'
                              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                          }`}
                        >
                          {photoFile ? (language === 'bn' ? 'ছবি পরিবর্তন করুন' : 'Change Photo') : (language === 'bn' ? 'ছবি আপলোড করুন' : 'Upload Photo')}
                        </button>
                        <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                          {language === 'bn' ? 'সর্বোচ্চ ১০MB, JPEG/PNG/WebP' : 'Max 10MB, JPEG/PNG/WebP'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Name */}
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {language === 'bn' ? 'আপনার নাম *' : 'Your Name *'}
                    </label>
                    <input
                      type="text"
                      value={formData.person_name_en}
                      onChange={(e) => setFormData(prev => ({ ...prev, person_name_en: e.target.value }))}
                      required
                      className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    />
                  </div>

                  {/* Profession & Address */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {language === 'bn' ? 'পেশা' : 'Profession'}
                      </label>
                      <input
                        type="text"
                        value={formData.profession_en}
                        onChange={(e) => setFormData(prev => ({ ...prev, profession_en: e.target.value }))}
                        className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {language === 'bn' ? 'ঠিকানা' : 'Address'}
                      </label>
                      <input
                        type="text"
                        value={formData.location_en}
                        onChange={(e) => setFormData(prev => ({ ...prev, location_en: e.target.value }))}
                        placeholder={language === 'bn' ? 'যেমন: ওয়ার্ড ৫, মিরপুর' : 'e.g., Ward 5, Mirpur'}
                        className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                      />
                    </div>
                  </div>

                  {/* Rating */}
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {language === 'bn' ? 'রেটিং' : 'Rating'}
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                          className={`text-3xl transition-colors ${star <= formData.rating ? 'text-yellow-500' : isDark ? 'text-gray-600' : 'text-gray-300'}`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Story */}
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {language === 'bn' ? 'আপনার গল্প *' : 'Your Story *'}
                    </label>
                    <textarea
                      rows={4}
                      value={formData.content_en}
                      onChange={(e) => setFormData(prev => ({ ...prev, content_en: e.target.value }))}
                      required
                      maxLength={2000}
                      placeholder={language === 'bn' ? 'আপনার অভিজ্ঞতা শেয়ার করুন...' : 'Share your experience...'}
                      className={`w-full px-4 py-2 rounded-lg border resize-none ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    />
                    <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      {formData.content_en.length}/2000
                    </p>
                  </div>

                  {/* Video Section */}
                  <div className={`p-4 rounded-lg border ${isDark ? 'border-gray-700 bg-gray-700/50' : 'border-gray-200 bg-gray-50'}`}>
                    <label className={`block text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      🎥 {language === 'bn' ? 'ভিডিও (ঐচ্ছিক)' : 'Video (Optional)'}
                    </label>

                    {/* Video Upload */}
                    <div className="space-y-3">
                      <div>
                        <input
                          ref={videoInputRef}
                          type="file"
                          accept="video/mp4,video/webm,video/quicktime,video/x-msvideo"
                          onChange={handleVideoSelect}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => videoInputRef.current?.click()}
                          disabled={!!formData.video_url}
                          className={`w-full px-4 py-3 rounded-lg border-2 border-dashed transition-colors ${
                            formData.video_url
                              ? 'opacity-50 cursor-not-allowed'
                              : isDark
                                ? 'border-gray-600 hover:border-red-500 text-gray-300'
                                : 'border-gray-300 hover:border-red-500 text-gray-600'
                          }`}
                        >
                          {videoFile ? (
                            <span className="flex items-center justify-center gap-2">
                              <span className="text-green-500">✓</span>
                              {videoFile.name} ({(videoFile.size / (1024 * 1024)).toFixed(1)}MB)
                            </span>
                          ) : (
                            <span className="flex items-center justify-center gap-2">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                              </svg>
                              {language === 'bn' ? 'ভিডিও আপলোড করুন (সর্বোচ্চ ২০০MB)' : 'Upload Video (max 200MB)'}
                            </span>
                          )}
                        </button>
                        <p className={`text-xs mt-1 text-center ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                          MP4, WebM, MOV, AVI
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className={`flex-1 h-px ${isDark ? 'bg-gray-600' : 'bg-gray-300'}`} />
                        <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                          {language === 'bn' ? 'অথবা' : 'OR'}
                        </span>
                        <div className={`flex-1 h-px ${isDark ? 'bg-gray-600' : 'bg-gray-300'}`} />
                      </div>

                      {/* Video URL */}
                      <div>
                        <input
                          type="url"
                          value={formData.video_url}
                          onChange={(e) => {
                            setFormData(prev => ({ ...prev, video_url: e.target.value }));
                            if (e.target.value) setVideoFile(null);
                          }}
                          disabled={!!videoFile}
                          placeholder={language === 'bn' ? 'YouTube বা ভিডিও লিঙ্ক পেস্ট করুন' : 'Paste YouTube or video link'}
                          className={`w-full px-4 py-2 rounded-lg border ${
                            videoFile
                              ? 'opacity-50 cursor-not-allowed'
                              : ''
                          } ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                        />
                      </div>
                    </div>

                    {/* Upload Progress */}
                    {videoUploading && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                            {language === 'bn' ? 'আপলোড হচ্ছে...' : 'Uploading...'}
                          </span>
                          <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                            {videoUploadProgress}%
                          </span>
                        </div>
                        <div className={`w-full h-2 rounded-full ${isDark ? 'bg-gray-600' : 'bg-gray-200'}`}>
                          <div
                            className="h-full bg-red-500 rounded-full transition-all duration-300"
                            style={{ width: `${videoUploadProgress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {language === 'bn' ? 'ইমেইল (ঐচ্ছিক)' : 'Email (Optional)'}
                    </label>
                    <input
                      type="email"
                      value={formData.submitter_email}
                      onChange={(e) => setFormData(prev => ({ ...prev, submitter_email: e.target.value }))}
                      placeholder={language === 'bn' ? 'যোগাযোগের জন্য' : 'For verification'}
                      className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={submitting || photoUploading || videoUploading || !formData.person_name_en.trim() || !formData.content_en.trim()}
                    className="w-full py-3 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {submitting || photoUploading || videoUploading
                      ? (language === 'bn' ? 'জমা হচ্ছে...' : 'Submitting...')
                      : (language === 'bn' ? 'জমা দিন' : 'Submit')}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Video Player Modal */}
      <VideoPlayer
        isOpen={!!activeVideo}
        onClose={closeVideoPlayer}
        videoUrl={activeVideo || ''}
      />
    </div>
  );
}
