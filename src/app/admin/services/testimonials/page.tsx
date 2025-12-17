'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/providers/ThemeProvider';
import { useSweetAlert } from '@/hooks/useSweetAlert';
import { format } from 'date-fns';
import MediaPicker from '@/components/media/MediaPicker';
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
  FaCommentDots,
  FaPlay,
  FaTimes
} from 'react-icons/fa';

// Video Player Component
function VideoPlayer({ url, onClose }: { url: string; onClose: () => void }) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    // Auto-hide loading after 3 seconds for direct videos
    const isYouTube = url.includes('youtube.com') || url.includes('youtu.be');
    const isVimeo = url.includes('vimeo.com');
    if (!isYouTube && !isVimeo) {
      const timer = setTimeout(() => setIsLoading(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [url]);

  if (!url) return null;

  const getYouTubeId = (videoUrl: string) => {
    const match = videoUrl.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/watch\?.+&v=))([^&?]+)/);
    return match ? match[1] : null;
  };

  const getVimeoId = (videoUrl: string) => {
    const match = videoUrl.match(/vimeo\.com\/(\d+)/);
    return match ? match[1] : null;
  };

  const youtubeId = getYouTubeId(url);
  const vimeoId = getVimeoId(url);

  const renderVideo = () => {
    if (youtubeId) {
      return (
        <iframe
          src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1`}
          className="absolute inset-0 w-full h-full rounded-lg"
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
          className="absolute inset-0 w-full h-full rounded-lg"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          onLoad={() => setIsLoading(false)}
        />
      );
    }

    // Direct video file (mp4, webm, CloudFront URLs, etc.)
    return (
      <video
        key={url}
        src={url}
        className="absolute inset-0 w-full h-full rounded-lg object-contain bg-black"
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
    <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/90" onClick={onClose} />
      <div className="relative w-full max-w-4xl">
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors z-10"
        >
          <FaTimes className="w-8 h-8" />
        </button>
        <div className="relative w-full rounded-lg overflow-hidden bg-black" style={{ paddingBottom: '56.25%' }}>
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            </div>
          )}
          {renderVideo()}
        </div>
      </div>
    </div>
  );
}

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

// Helper to check if a string is a valid URL
const isValidUrl = (url: string | null | undefined): boolean => {
  if (!url || typeof url !== 'string' || url.trim() === '') return false;
  try {
    new URL(url);
    return true;
  } catch {
    // Check if it's a relative URL starting with /
    return url.startsWith('/');
  }
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
  status: 'pending' | 'approved' | 'rejected';
  display_order: number;
  submitted_at: string;
  testimonial_categories: Category | null;
}

export default function AdminTestimonialsPage() {
  const { isDark } = useTheme();
  const { showDeleteConfirm, showSuccess, showError } = useSweetAlert();

  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState('all');
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    category_id: '',
    person_name_en: '',
    person_name_bn: '',
    person_photo: '',
    location_en: '',
    location_bn: '',
    profession_en: '',
    profession_bn: '',
    content_en: '',
    content_bn: '',
    video_url: '',
    rating: 5,
    is_verified: false,
    is_featured: false,
    status: 'approved' as const,
    display_order: 0
  });

  const [categoryForm, setCategoryForm] = useState({
    name_en: '',
    name_bn: '',
    slug: '',
    icon: '💬',
    display_order: 0
  });

  useEffect(() => {
    fetchTestimonials();
    fetchCategories();
  }, [filter]);

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter !== 'all') params.append('status', filter);

      const response = await fetch(`/api/admin/testimonials?${params}`);
      const data = await response.json();
      if (data.success) {
        setTestimonials(data.data || []);
      }
    } catch (error) {
      showError('Error', 'Failed to fetch testimonials');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/testimonials/categories');
      const data = await response.json();
      if (data.success) {
        setCategories(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const openCreateModal = () => {
    setEditingTestimonial(null);
    setFormData({
      category_id: '',
      person_name_en: '',
      person_name_bn: '',
      person_photo: '',
      location_en: '',
      location_bn: '',
      profession_en: '',
      profession_bn: '',
      content_en: '',
      content_bn: '',
      video_url: '',
      rating: 5,
      is_verified: false,
      is_featured: false,
      status: 'approved',
      display_order: 0
    });
    setShowModal(true);
  };

  const openEditModal = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial);
    setFormData({
      category_id: testimonial.category_id || '',
      person_name_en: testimonial.person_name_en,
      person_name_bn: testimonial.person_name_bn || '',
      person_photo: testimonial.person_photo || '',
      location_en: testimonial.location_en || '',
      location_bn: testimonial.location_bn || '',
      profession_en: testimonial.profession_en || '',
      profession_bn: testimonial.profession_bn || '',
      content_en: testimonial.content_en,
      content_bn: testimonial.content_bn || '',
      video_url: testimonial.video_url || '',
      rating: testimonial.rating || 5,
      is_verified: testimonial.is_verified,
      is_featured: testimonial.is_featured,
      status: testimonial.status,
      display_order: testimonial.display_order
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.person_name_en.trim() || !formData.content_en.trim()) {
      showError('Error', 'Name and content are required');
      return;
    }

    setSaving(true);
    try {
      const url = '/api/admin/testimonials';
      const method = editingTestimonial ? 'PUT' : 'POST';
      const body = editingTestimonial
        ? { id: editingTestimonial.id, ...formData }
        : formData;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await response.json();
      if (data.success) {
        showSuccess('Success', editingTestimonial ? 'Testimonial updated!' : 'Testimonial created!');
        setShowModal(false);
        fetchTestimonials();
      } else {
        showError('Error', data.error || 'Failed to save testimonial');
      }
    } catch (error) {
      showError('Error', 'Failed to save testimonial');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await showDeleteConfirm('Delete Testimonial', 'Are you sure you want to delete this testimonial?');
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/admin/testimonials?id=${id}`, { method: 'DELETE' });
      const data = await response.json();
      if (data.success) {
        showSuccess('Deleted', 'Testimonial deleted successfully');
        fetchTestimonials();
      } else {
        showError('Error', data.error || 'Failed to delete');
      }
    } catch (error) {
      showError('Error', 'Failed to delete testimonial');
    }
  };

  const handleStatusChange = async (id: string, status: 'approved' | 'rejected') => {
    try {
      const response = await fetch('/api/admin/testimonials', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      });

      const data = await response.json();
      if (data.success) {
        showSuccess('Updated', `Testimonial ${status}`);
        fetchTestimonials();
      } else {
        showError('Error', data.error || 'Failed to update status');
      }
    } catch (error) {
      showError('Error', 'Failed to update status');
    }
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryForm.name_en.trim() || !categoryForm.slug.trim()) {
      showError('Error', 'Name and slug are required');
      return;
    }

    try {
      const response = await fetch('/api/admin/testimonials/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryForm)
      });

      const data = await response.json();
      if (data.success) {
        showSuccess('Success', 'Category created!');
        setShowCategoryModal(false);
        setCategoryForm({ name_en: '', name_bn: '', slug: '', icon: '💬', display_order: 0 });
        fetchCategories();
      } else {
        showError('Error', data.error || 'Failed to create category');
      }
    } catch (error) {
      showError('Error', 'Failed to create category');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
    }
  };

  const renderStars = (rating: number | null) => {
    if (!rating) return null;
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} className={star <= rating ? 'text-yellow-500' : 'text-gray-300'}>
            ★
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Testimonials
          </h1>
          <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Manage community testimonials and reviews
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowCategoryModal(true)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              isDark ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            + Category
          </button>
          <button
            onClick={openCreateModal}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
          >
            + Add Testimonial
          </button>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {['all', 'pending', 'approved', 'rejected'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              filter === status
                ? 'bg-purple-600 text-white'
                : isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
            {status === 'pending' && testimonials.filter(t => t.status === 'pending').length > 0 && (
              <span className="ml-2 px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full">
                {testimonials.filter(t => t.status === 'pending').length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Testimonials List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-purple-500 border-t-transparent"></div>
        </div>
      ) : testimonials.length === 0 ? (
        <div className={`text-center py-12 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>No testimonials found</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className={`p-5 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
            >
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <div className="relative w-14 h-14 rounded-full overflow-hidden">
                    <Image
                      src={isValidUrl(testimonial.person_photo) ? testimonial.person_photo! : '/user-default.jpg'}
                      alt={testimonial.person_name_en}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {testimonial.person_name_en}
                    </h3>
                    {testimonial.is_verified && (
                      <span className="text-blue-500" title="Verified">✓</span>
                    )}
                    {testimonial.is_featured && (
                      <span className="text-yellow-500">⭐</span>
                    )}
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(testimonial.status)}`}>
                      {testimonial.status}
                    </span>
                    {testimonial.video_url && (
                      <button
                        onClick={() => setActiveVideo(testimonial.video_url!)}
                        className="flex items-center gap-1 text-red-500 hover:text-red-600 transition-colors"
                        title="Play Video"
                      >
                        <FaPlay className="w-3 h-3" />
                        <span className="text-xs">Video</span>
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-sm mb-2">
                    {testimonial.profession_en && (
                      <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                        {testimonial.profession_en}
                      </span>
                    )}
                    {testimonial.location_en && (
                      <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>
                        📍 {testimonial.location_en}
                      </span>
                    )}
                    {testimonial.testimonial_categories && (
                      <span className={`px-2 py-0.5 rounded text-xs flex items-center gap-1 ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                        <DynamicIcon name={testimonial.testimonial_categories.icon} className="w-3 h-3" />
                        {testimonial.testimonial_categories.name_en}
                      </span>
                    )}
                  </div>
                  {renderStars(testimonial.rating)}
                  <p className={`mt-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    &ldquo;{testimonial.content_en}&rdquo;
                  </p>
                  <p className={`mt-2 text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    Submitted: {format(new Date(testimonial.submitted_at), 'MMM d, yyyy')}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  {testimonial.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleStatusChange(testimonial.id, 'approved')}
                        className="px-3 py-1.5 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleStatusChange(testimonial.id, 'rejected')}
                        className="px-3 py-1.5 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => openEditModal(testimonial)}
                    className={`p-2 rounded-lg transition-colors ${
                      isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(testimonial.id)}
                    className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Testimonial Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowModal(false)} />
          <div className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className={`sticky top-0 p-6 border-b ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
              <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {editingTestimonial ? 'Edit Testimonial' : 'Create Testimonial'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Name (English) *
                  </label>
                  <input
                    type="text"
                    value={formData.person_name_en}
                    onChange={(e) => setFormData(prev => ({ ...prev, person_name_en: e.target.value }))}
                    className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    required
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Name (Bengali)
                  </label>
                  <input
                    type="text"
                    value={formData.person_name_bn}
                    onChange={(e) => setFormData(prev => ({ ...prev, person_name_bn: e.target.value }))}
                    className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Photo
                </label>
                <MediaPicker
                  value={formData.person_photo}
                  onChange={(media) => {
                    if (!media) {
                      setFormData(prev => ({ ...prev, person_photo: '' }));
                      return;
                    }
                    const item = Array.isArray(media) ? media[0] : media;
                    const url = item?.cloudfront_url || item?.s3_url || '';
                    setFormData(prev => ({ ...prev, person_photo: url }));
                  }}
                  fileType="image"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Profession (English)
                  </label>
                  <input
                    type="text"
                    value={formData.profession_en}
                    onChange={(e) => setFormData(prev => ({ ...prev, profession_en: e.target.value }))}
                    placeholder="e.g., Business Owner"
                    className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Profession (Bengali)
                  </label>
                  <input
                    type="text"
                    value={formData.profession_bn}
                    onChange={(e) => setFormData(prev => ({ ...prev, profession_bn: e.target.value }))}
                    className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Address (English)
                  </label>
                  <input
                    type="text"
                    value={formData.location_en}
                    onChange={(e) => setFormData(prev => ({ ...prev, location_en: e.target.value }))}
                    placeholder="e.g., Ward 5, Jatrabari"
                    className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Address (Bengali)
                  </label>
                  <input
                    type="text"
                    value={formData.location_bn}
                    onChange={(e) => setFormData(prev => ({ ...prev, location_bn: e.target.value }))}
                    className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Testimonial (English) *
                  </label>
                  <textarea
                    rows={4}
                    value={formData.content_en}
                    onChange={(e) => setFormData(prev => ({ ...prev, content_en: e.target.value }))}
                    className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    required
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Testimonial (Bengali)
                  </label>
                  <textarea
                    rows={4}
                    value={formData.content_bn}
                    onChange={(e) => setFormData(prev => ({ ...prev, content_bn: e.target.value }))}
                    className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Category
                  </label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, category_id: e.target.value }))}
                    className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name_en}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Rating
                  </label>
                  <select
                    value={formData.rating}
                    onChange={(e) => setFormData(prev => ({ ...prev, rating: parseInt(e.target.value) }))}
                    className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  >
                    {[5, 4, 3, 2, 1].map(r => (
                      <option key={r} value={r}>{'★'.repeat(r)}{'☆'.repeat(5-r)} ({r})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                    className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>

              {/* Video Section */}
              <div className={`p-4 rounded-lg border ${isDark ? 'border-gray-700 bg-gray-700/50' : 'border-gray-200 bg-gray-50'}`}>
                <label className={`block text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Video Testimonial (Optional)
                </label>

                {/* Current Video Display */}
                {formData.video_url && (
                  <div className={`mb-4 p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Current Video
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setActiveVideo(formData.video_url)}
                          className="flex items-center gap-1 px-3 py-1 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700"
                        >
                          <FaPlay className="w-3 h-3" />
                          Play
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, video_url: '' }))}
                          className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700"
                        >
                          <FaTimes className="w-3 h-3" />
                          Remove
                        </button>
                      </div>
                    </div>
                    <a
                      href={formData.video_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`text-xs break-all hover:underline ${isDark ? 'text-blue-400' : 'text-blue-600'}`}
                    >
                      {formData.video_url}
                    </a>
                  </div>
                )}

                {/* Video URL Input - Single input for both uploaded and external URLs */}
                <div>
                  <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Video URL (YouTube, Vimeo, or Direct Video Link)
                  </label>
                  <input
                    type="url"
                    value={formData.video_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, video_url: e.target.value }))}
                    placeholder="https://youtube.com/watch?v=... or https://cdn.example.com/video.mp4"
                    className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                  <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    Paste a YouTube, Vimeo URL, or a direct video file link (mp4, webm)
                  </p>
                </div>
              </div>

              <div className="flex gap-6">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_verified}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_verified: e.target.checked }))}
                    className="w-4 h-4 rounded"
                  />
                  <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>Verified ✓</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_featured: e.target.checked }))}
                    className="w-4 h-4 rounded"
                  />
                  <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>Featured ⭐</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className={`px-6 py-2 rounded-lg font-medium ${isDark ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-800'}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingTestimonial ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowCategoryModal(false)} />
          <div className={`relative w-full max-w-md rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} p-6`}>
            <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Add Category
            </h2>
            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Name (English) *
                </label>
                <input
                  type="text"
                  value={categoryForm.name_en}
                  onChange={(e) => setCategoryForm(prev => ({ ...prev, name_en: e.target.value }))}
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  required
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Name (Bengali)
                </label>
                <input
                  type="text"
                  value={categoryForm.name_bn}
                  onChange={(e) => setCategoryForm(prev => ({ ...prev, name_bn: e.target.value }))}
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Slug *
                  </label>
                  <input
                    type="text"
                    value={categoryForm.slug}
                    onChange={(e) => setCategoryForm(prev => ({ ...prev, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') }))}
                    className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    required
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Icon
                  </label>
                  <input
                    type="text"
                    value={categoryForm.icon}
                    onChange={(e) => setCategoryForm(prev => ({ ...prev, icon: e.target.value }))}
                    className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className={`px-4 py-2 rounded-lg font-medium ${isDark ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-800'}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Video Player Modal */}
      {activeVideo && (
        <VideoPlayer url={activeVideo} onClose={() => setActiveVideo(null)} />
      )}
    </div>
  );
}
