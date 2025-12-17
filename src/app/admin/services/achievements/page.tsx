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
  color: string;
}

interface Achievement {
  id: string;
  category_id: string | null;
  title_en: string;
  title_bn: string;
  description_en: string;
  description_bn: string;
  achievement_date: string | null;
  location_en: string | null;
  location_bn: string | null;
  impact_metrics: {
    people_helped?: number;
    investment?: number;
    [key: string]: number | undefined;
  };
  featured_image: string | null;
  images: string[];
  videos: string[];
  news_links: string[];
  featured: boolean;
  display_order: number;
  is_active: boolean;
  created_at: string;
  achievement_categories: Category | null;
}

export default function AdminAchievementsPage() {
  const { isDark } = useTheme();
  const { showDeleteConfirm, showSuccess, showError } = useSweetAlert();

  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingAchievement, setEditingAchievement] = useState<Achievement | null>(null);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState('all');

  const [formData, setFormData] = useState({
    category_id: '',
    title_en: '',
    title_bn: '',
    description_en: '',
    description_bn: '',
    achievement_date: '',
    location_en: '',
    location_bn: '',
    people_helped: 0,
    investment: 0,
    featured_image: '',
    images: [] as string[],
    videos: [] as string[],
    news_links: [] as string[],
    featured: false,
    display_order: 0
  });

  const [categoryForm, setCategoryForm] = useState({
    name_en: '',
    name_bn: '',
    slug: '',
    icon: '🏆',
    color: '#F59E0B',
    display_order: 0
  });

  const [newNewsLink, setNewNewsLink] = useState('');

  useEffect(() => {
    fetchAchievements();
    fetchCategories();
  }, [filter]);

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/achievements');
      const data = await response.json();
      if (data.success) {
        let filtered = data.data || [];
        if (filter !== 'all') {
          filtered = filtered.filter((a: Achievement) => a.category_id === filter);
        }
        setAchievements(filtered);
      }
    } catch (error) {
      showError('Error', 'Failed to fetch achievements');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/achievements/categories');
      const data = await response.json();
      if (data.success) {
        setCategories(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const openCreateModal = () => {
    setEditingAchievement(null);
    setFormData({
      category_id: '',
      title_en: '',
      title_bn: '',
      description_en: '',
      description_bn: '',
      achievement_date: '',
      location_en: '',
      location_bn: '',
      people_helped: 0,
      investment: 0,
      featured_image: '',
      images: [],
      videos: [],
      news_links: [],
      featured: false,
      display_order: 0
    });
    setShowModal(true);
  };

  const openEditModal = (achievement: Achievement) => {
    setEditingAchievement(achievement);
    setFormData({
      category_id: achievement.category_id || '',
      title_en: achievement.title_en,
      title_bn: achievement.title_bn || '',
      description_en: achievement.description_en || '',
      description_bn: achievement.description_bn || '',
      achievement_date: achievement.achievement_date || '',
      location_en: achievement.location_en || '',
      location_bn: achievement.location_bn || '',
      people_helped: achievement.impact_metrics?.people_helped || 0,
      investment: achievement.impact_metrics?.investment || 0,
      featured_image: achievement.featured_image || '',
      images: achievement.images || [],
      videos: achievement.videos || [],
      news_links: achievement.news_links || [],
      featured: achievement.featured,
      display_order: achievement.display_order
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title_en.trim()) {
      showError('Error', 'Title (English) is required');
      return;
    }

    setSaving(true);
    try {
      const url = '/api/admin/achievements';
      const method = editingAchievement ? 'PUT' : 'POST';

      const body = {
        ...(editingAchievement ? { id: editingAchievement.id } : {}),
        category_id: formData.category_id || null,
        title_en: formData.title_en,
        title_bn: formData.title_bn,
        description_en: formData.description_en,
        description_bn: formData.description_bn,
        achievement_date: formData.achievement_date || null,
        location_en: formData.location_en,
        location_bn: formData.location_bn,
        impact_metrics: {
          people_helped: formData.people_helped,
          investment: formData.investment
        },
        featured_image: formData.featured_image,
        images: formData.images,
        videos: formData.videos,
        news_links: formData.news_links,
        featured: formData.featured,
        display_order: formData.display_order
      };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await response.json();
      if (data.success) {
        showSuccess('Success', editingAchievement ? 'Achievement updated!' : 'Achievement created!');
        setShowModal(false);
        fetchAchievements();
      } else {
        showError('Error', data.error || 'Failed to save achievement');
      }
    } catch (error) {
      showError('Error', 'Failed to save achievement');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await showDeleteConfirm('Delete Achievement', 'Are you sure you want to delete this achievement?');
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/admin/achievements?id=${id}`, { method: 'DELETE' });
      const data = await response.json();
      if (data.success) {
        showSuccess('Deleted', 'Achievement deleted successfully');
        fetchAchievements();
      } else {
        showError('Error', data.error || 'Failed to delete');
      }
    } catch (error) {
      showError('Error', 'Failed to delete achievement');
    }
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryForm.name_en.trim() || !categoryForm.slug.trim()) {
      showError('Error', 'Name and slug are required');
      return;
    }

    try {
      const response = await fetch('/api/admin/achievements/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryForm)
      });

      const data = await response.json();
      if (data.success) {
        showSuccess('Success', 'Category created!');
        setShowCategoryModal(false);
        setCategoryForm({ name_en: '', name_bn: '', slug: '', icon: '🏆', color: '#F59E0B', display_order: 0 });
        fetchCategories();
      } else {
        showError('Error', data.error || 'Failed to create category');
      }
    } catch (error) {
      showError('Error', 'Failed to create category');
    }
  };

  const addNewsLink = () => {
    if (newNewsLink.trim()) {
      setFormData(prev => ({ ...prev, news_links: [...prev.news_links, newNewsLink.trim()] }));
      setNewNewsLink('');
    }
  };

  const removeNewsLink = (index: number) => {
    setFormData(prev => ({ ...prev, news_links: prev.news_links.filter((_, i) => i !== index) }));
  };

  const addImage = (media: { cloudfront_url?: string; s3_url?: string } | { cloudfront_url?: string; s3_url?: string }[] | null) => {
    if (!media) return;
    const mediaItem = Array.isArray(media) ? media[0] : media;
    const url = mediaItem?.cloudfront_url || mediaItem?.s3_url;
    if (url) {
      setFormData(prev => ({ ...prev, images: [...prev.images, url] }));
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Achievements
          </h1>
          <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Showcase completed projects and accomplishments
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
            className="px-4 py-2 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition-colors"
          >
            + Add Achievement
          </button>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
            filter === 'all'
              ? 'bg-amber-600 text-white'
              : isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setFilter(cat.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              filter === cat.id
                ? 'bg-amber-600 text-white'
                : isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <DynamicIcon name={cat.icon} className="w-4 h-4 inline mr-1" /> {cat.name_en}
          </button>
        ))}
      </div>

      {/* Achievements Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-amber-500 border-t-transparent"></div>
        </div>
      ) : achievements.length === 0 ? (
        <div className={`text-center py-12 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>No achievements found</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`rounded-xl border overflow-hidden ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
            >
              {isValidUrl(achievement.featured_image) && (
                <div className="relative h-40">
                  <Image
                    src={achievement.featured_image!}
                    alt={achievement.title_en}
                    fill
                    className="object-cover"
                  />
                  {achievement.featured && (
                    <span className="absolute top-2 right-2 bg-amber-500 text-white text-xs px-2 py-1 rounded-full">
                      ⭐ Featured
                    </span>
                  )}
                </div>
              )}
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  {achievement.achievement_categories && (
                    <span className="text-lg text-amber-600">
                      <DynamicIcon name={achievement.achievement_categories.icon} className="w-5 h-5" />
                    </span>
                  )}
                  <h3 className={`font-semibold line-clamp-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {achievement.title_en}
                  </h3>
                </div>
                {achievement.description_en && (
                  <p className={`text-sm mb-3 line-clamp-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {achievement.description_en}
                  </p>
                )}
                <div className="flex items-center gap-4 text-xs mb-3">
                  {achievement.achievement_date && (
                    <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>
                      📅 {format(new Date(achievement.achievement_date), 'MMM yyyy')}
                    </span>
                  )}
                  {achievement.location_en && (
                    <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>
                      📍 {achievement.location_en}
                    </span>
                  )}
                </div>
                {(achievement.impact_metrics?.people_helped || achievement.impact_metrics?.investment) && (
                  <div className="flex gap-3 mb-3">
                    {achievement.impact_metrics.people_helped ? (
                      <span className={`text-xs px-2 py-1 rounded ${isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700'}`}>
                        👥 {achievement.impact_metrics.people_helped.toLocaleString()} helped
                      </span>
                    ) : null}
                    {achievement.impact_metrics.investment ? (
                      <span className={`text-xs px-2 py-1 rounded ${isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-700'}`}>
                        💰 ৳{(achievement.impact_metrics.investment / 100000).toFixed(1)}L
                      </span>
                    ) : null}
                  </div>
                )}
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => openEditModal(achievement)}
                    className={`p-2 rounded-lg transition-colors ${
                      isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(achievement.id)}
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

      {/* Achievement Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowModal(false)} />
          <div className={`relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className={`sticky top-0 p-6 border-b ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
              <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {editingAchievement ? 'Edit Achievement' : 'Create Achievement'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Title (English) *
                  </label>
                  <input
                    type="text"
                    value={formData.title_en}
                    onChange={(e) => setFormData(prev => ({ ...prev, title_en: e.target.value }))}
                    className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    required
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Title (Bengali)
                  </label>
                  <input
                    type="text"
                    value={formData.title_bn}
                    onChange={(e) => setFormData(prev => ({ ...prev, title_bn: e.target.value }))}
                    className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Description (English)
                  </label>
                  <textarea
                    rows={4}
                    value={formData.description_en}
                    onChange={(e) => setFormData(prev => ({ ...prev, description_en: e.target.value }))}
                    className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Description (Bengali)
                  </label>
                  <textarea
                    rows={4}
                    value={formData.description_bn}
                    onChange={(e) => setFormData(prev => ({ ...prev, description_bn: e.target.value }))}
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
                    Achievement Date
                  </label>
                  <input
                    type="date"
                    value={formData.achievement_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, achievement_date: e.target.value }))}
                    className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData(prev => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))}
                    className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Location (English)
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
                    Location (Bengali)
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
                    People Helped
                  </label>
                  <input
                    type="number"
                    value={formData.people_helped}
                    onChange={(e) => setFormData(prev => ({ ...prev, people_helped: parseInt(e.target.value) || 0 }))}
                    className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Investment (BDT)
                  </label>
                  <input
                    type="number"
                    value={formData.investment}
                    onChange={(e) => setFormData(prev => ({ ...prev, investment: parseInt(e.target.value) || 0 }))}
                    className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Featured Image
                </label>
                <MediaPicker
                  value={formData.featured_image}
                  onChange={(media) => {
                    if (!media) {
                      setFormData(prev => ({ ...prev, featured_image: '' }));
                      return;
                    }
                    const item = Array.isArray(media) ? media[0] : media;
                    const url = item?.cloudfront_url || item?.s3_url || '';
                    setFormData(prev => ({ ...prev, featured_image: url }));
                  }}
                  fileType="image"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Gallery Images
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.images.filter(img => isValidUrl(img)).map((img, idx) => (
                    <div key={idx} className="relative w-20 h-20">
                      <Image src={img} alt="" fill className="object-cover rounded-lg" />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <MediaPicker
                  value={null}
                  onChange={addImage}
                  fileType="image"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  News Links
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.news_links.map((link, idx) => (
                    <span
                      key={idx}
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs ${
                        isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      🔗 {link.substring(0, 30)}...
                      <button type="button" onClick={() => removeNewsLink(idx)} className="text-red-500">×</button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={newNewsLink}
                    onChange={(e) => setNewNewsLink(e.target.value)}
                    placeholder="https://example.com/news-article"
                    className={`flex-1 px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                  <button
                    type="button"
                    onClick={addNewsLink}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                  >
                    Add
                  </button>
                </div>
              </div>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
                  className="w-4 h-4 rounded"
                />
                <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>Featured Achievement</span>
              </label>

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
                  className="px-6 py-2 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingAchievement ? 'Update' : 'Create'}
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
                  className="px-4 py-2 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
