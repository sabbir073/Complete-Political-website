'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/providers/ThemeProvider';
import { useSweetAlert } from '@/hooks/useSweetAlert';
import { format } from 'date-fns';
import MediaPicker from '@/components/media/MediaPicker';
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

interface Category {
  id: string;
  name_en: string;
  name_bn: string;
  slug: string;
  icon: string;
  color: string;
}

interface Promise {
  id: string;
  category_id: string | null;
  title_en: string;
  title_bn: string;
  description_en: string;
  description_bn: string;
  target_date: string | null;
  completion_date: string | null;
  status: 'not_started' | 'in_progress' | 'completed' | 'delayed';
  progress: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  featured: boolean;
  featured_image: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  promise_categories: Category | null;
}

interface PromiseUpdate {
  id: string;
  promise_id: string;
  title_en: string;
  title_bn: string | null;
  description_en: string | null;
  description_bn: string | null;
  progress_change: number;
  new_progress: number | null;
  images: string[];
  documents: string[];
  news_link: string | null;
  created_at: string;
}

export default function AdminPromisesPage() {
  const { isDark } = useTheme();
  const { showDeleteConfirm, showSuccess, showError } = useSweetAlert();

  const [promises, setPromises] = useState<Promise[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showUpdatesListModal, setShowUpdatesListModal] = useState(false);
  const [editingPromise, setEditingPromise] = useState<Promise | null>(null);
  const [selectedPromiseForUpdate, setSelectedPromiseForUpdate] = useState<Promise | null>(null);
  const [promiseUpdates, setPromiseUpdates] = useState<PromiseUpdate[]>([]);
  const [loadingUpdates, setLoadingUpdates] = useState(false);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState('all');

  const [formData, setFormData] = useState<{
    category_id: string;
    title_en: string;
    title_bn: string;
    description_en: string;
    description_bn: string;
    target_date: string;
    status: 'not_started' | 'in_progress' | 'completed' | 'delayed';
    progress: number;
    priority: 'low' | 'medium' | 'high' | 'critical';
    featured: boolean;
    featured_image: string;
    display_order: number;
  }>({
    category_id: '',
    title_en: '',
    title_bn: '',
    description_en: '',
    description_bn: '',
    target_date: '',
    status: 'not_started',
    progress: 0,
    priority: 'medium',
    featured: false,
    featured_image: '',
    display_order: 0
  });

  const [categoryForm, setCategoryForm] = useState({
    name_en: '',
    name_bn: '',
    slug: '',
    icon: '📋',
    color: '#10B981',
    display_order: 0
  });

  const [updateForm, setUpdateForm] = useState({
    title_en: '',
    title_bn: '',
    description_en: '',
    description_bn: '',
    new_progress: 0,
    news_link: ''
  });

  useEffect(() => {
    fetchPromises();
    fetchCategories();
  }, [filter]);

  const fetchPromises = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/promises');
      const data = await response.json();
      if (data.success) {
        let filtered = data.data || [];
        if (filter !== 'all') {
          filtered = filtered.filter((p: Promise) => p.status === filter);
        }
        setPromises(filtered);
      }
    } catch (error) {
      showError('Error', 'Failed to fetch promises');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/promises/categories');
      const data = await response.json();
      if (data.success) {
        setCategories(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const openCreateModal = () => {
    setEditingPromise(null);
    setFormData({
      category_id: '',
      title_en: '',
      title_bn: '',
      description_en: '',
      description_bn: '',
      target_date: '',
      status: 'not_started',
      progress: 0,
      priority: 'medium',
      featured: false,
      featured_image: '',
      display_order: 0
    });
    setShowModal(true);
  };

  const openEditModal = (promise: Promise) => {
    setEditingPromise(promise);
    setFormData({
      category_id: promise.category_id || '',
      title_en: promise.title_en,
      title_bn: promise.title_bn || '',
      description_en: promise.description_en || '',
      description_bn: promise.description_bn || '',
      target_date: promise.target_date || '',
      status: promise.status,
      progress: promise.progress,
      priority: promise.priority,
      featured: promise.featured,
      featured_image: promise.featured_image || '',
      display_order: promise.display_order
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
      const url = '/api/admin/promises';
      const method = editingPromise ? 'PUT' : 'POST';
      const body = editingPromise
        ? { id: editingPromise.id, ...formData }
        : formData;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await response.json();
      if (data.success) {
        showSuccess('Success', editingPromise ? 'Promise updated!' : 'Promise created!');
        setShowModal(false);
        fetchPromises();
      } else {
        showError('Error', data.error || 'Failed to save promise');
      }
    } catch (error) {
      showError('Error', 'Failed to save promise');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const result = await showDeleteConfirm('this promise');
    if (!result.isConfirmed) return;

    try {
      const response = await fetch(`/api/admin/promises?id=${id}`, { method: 'DELETE' });
      const data = await response.json();
      if (data.success) {
        showSuccess('Deleted', 'Promise deleted successfully');
        fetchPromises();
      } else {
        showError('Error', data.error || 'Failed to delete');
      }
    } catch (error) {
      showError('Error', 'Failed to delete promise');
    }
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryForm.name_en.trim() || !categoryForm.slug.trim()) {
      showError('Error', 'Name and slug are required');
      return;
    }

    try {
      const response = await fetch('/api/admin/promises/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryForm)
      });

      const data = await response.json();
      if (data.success) {
        showSuccess('Success', 'Category created!');
        setShowCategoryModal(false);
        setCategoryForm({ name_en: '', name_bn: '', slug: '', icon: '📋', color: '#10B981', display_order: 0 });
        fetchCategories();
      } else {
        showError('Error', data.error || 'Failed to create category');
      }
    } catch (error) {
      showError('Error', 'Failed to create category');
    }
  };

  // Update-related functions
  const openAddUpdateModal = (promise: Promise) => {
    setSelectedPromiseForUpdate(promise);
    setUpdateForm({
      title_en: '',
      title_bn: '',
      description_en: '',
      description_bn: '',
      new_progress: promise.progress,
      news_link: ''
    });
    setShowUpdateModal(true);
  };

  const openUpdatesListModal = async (promise: Promise) => {
    setSelectedPromiseForUpdate(promise);
    setShowUpdatesListModal(true);
    await fetchPromiseUpdates(promise.id);
  };

  const fetchPromiseUpdates = async (promiseId: string) => {
    try {
      setLoadingUpdates(true);
      const response = await fetch(`/api/admin/promises/updates?promise_id=${promiseId}`);
      const data = await response.json();
      if (data.success) {
        setPromiseUpdates(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch updates:', error);
    } finally {
      setLoadingUpdates(false);
    }
  };

  const handleSubmitUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPromiseForUpdate || !updateForm.title_en.trim()) {
      showError('Error', 'Title is required');
      return;
    }

    setSaving(true);
    try {
      const progressChange = updateForm.new_progress - selectedPromiseForUpdate.progress;

      const response = await fetch('/api/admin/promises/updates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          promise_id: selectedPromiseForUpdate.id,
          title_en: updateForm.title_en,
          title_bn: updateForm.title_bn,
          description_en: updateForm.description_en,
          description_bn: updateForm.description_bn,
          progress_change: progressChange,
          new_progress: updateForm.new_progress,
          news_link: updateForm.news_link || null
        })
      });

      const data = await response.json();
      if (data.success) {
        showSuccess('Success', 'Update added successfully!');
        setShowUpdateModal(false);
        fetchPromises(); // Refresh promises to get updated progress
      } else {
        showError('Error', data.error || 'Failed to add update');
      }
    } catch (error) {
      showError('Error', 'Failed to add update');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUpdate = async (updateId: string) => {
    const result = await showDeleteConfirm('this update');
    if (!result.isConfirmed) return;

    try {
      const response = await fetch(`/api/admin/promises/updates?id=${updateId}`, { method: 'DELETE' });
      const data = await response.json();
      if (data.success) {
        showSuccess('Deleted', 'Update deleted successfully');
        if (selectedPromiseForUpdate) {
          fetchPromiseUpdates(selectedPromiseForUpdate.id);
        }
      } else {
        showError('Error', data.error || 'Failed to delete');
      }
    } catch (error) {
      showError('Error', 'Failed to delete update');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'in_progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'delayed': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      default: return 'bg-gray-400';
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Promise Tracker
          </h1>
          <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Manage campaign promises and track progress
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
            className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            + Add Promise
          </button>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {['all', 'not_started', 'in_progress', 'completed', 'delayed'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              filter === status
                ? 'bg-green-600 text-white'
                : isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {status === 'all' ? 'All' : status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </button>
        ))}
      </div>

      {/* Promises List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-green-500 border-t-transparent"></div>
        </div>
      ) : promises.length === 0 ? (
        <div className={`text-center py-12 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>No promises found</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {promises.map((promise) => (
            <div
              key={promise.id}
              className={`p-5 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {promise.promise_categories && (
                      <span className="text-lg text-green-600">
                        <DynamicIcon name={promise.promise_categories.icon} className="w-5 h-5" />
                      </span>
                    )}
                    <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {promise.title_en}
                    </h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(promise.status)}`}>
                      {promise.status.replace('_', ' ')}
                    </span>
                    <div className={`w-2 h-2 rounded-full ${getPriorityColor(promise.priority)}`} title={promise.priority} />
                    {promise.featured && (
                      <span className="text-yellow-500">⭐</span>
                    )}
                  </div>
                  {promise.description_en && (
                    <p className={`text-sm mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {promise.description_en.substring(0, 150)}...
                    </p>
                  )}
                  <div className="flex items-center gap-4">
                    <div className="flex-1 max-w-xs">
                      <div className={`h-2 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                        <div
                          className="h-full rounded-full bg-green-500 transition-all"
                          style={{ width: `${promise.progress}%` }}
                        />
                      </div>
                    </div>
                    <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {promise.progress}%
                    </span>
                    {promise.target_date && (
                      <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                        Target: {format(new Date(promise.target_date), 'MMM d, yyyy')}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openAddUpdateModal(promise)}
                    className="px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    title="Add Update"
                  >
                    + Update
                  </button>
                  <button
                    onClick={() => openUpdatesListModal(promise)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                      isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                    title="View Updates"
                  >
                    📋 History
                  </button>
                  <button
                    onClick={() => openEditModal(promise)}
                    className={`p-2 rounded-lg transition-colors ${
                      isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                    }`}
                    title="Edit Promise"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(promise.id)}
                    className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    title="Delete Promise"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Promise Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowModal(false)} />
          <div className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className={`sticky top-0 p-6 border-b ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
              <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {editingPromise ? 'Edit Promise' : 'Create Promise'}
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
                    rows={3}
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
                    rows={3}
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
                    Target Date
                  </label>
                  <input
                    type="date"
                    value={formData.target_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, target_date: e.target.value }))}
                    className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as any }))}
                    className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                    className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  >
                    <option value="not_started">Not Started</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="delayed">Delayed</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Progress: {formData.progress}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={formData.progress}
                    onChange={(e) => setFormData(prev => ({ ...prev, progress: parseInt(e.target.value) }))}
                    className="w-full"
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

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
                  className="w-4 h-4 rounded"
                />
                <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>Featured Promise</span>
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
                  className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingPromise ? 'Update' : 'Create'}
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
                  className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Update Modal */}
      {showUpdateModal && selectedPromiseForUpdate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowUpdateModal(false)} />
          <div className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className={`sticky top-0 p-6 border-b ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
              <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Add Progress Update
              </h2>
              <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                For: {selectedPromiseForUpdate.title_en}
              </p>
            </div>
            <form onSubmit={handleSubmitUpdate} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Update Title (English) *
                  </label>
                  <input
                    type="text"
                    value={updateForm.title_en}
                    onChange={(e) => setUpdateForm(prev => ({ ...prev, title_en: e.target.value }))}
                    placeholder="e.g., Phase 1 Completed"
                    className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    required
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Update Title (Bengali)
                  </label>
                  <input
                    type="text"
                    value={updateForm.title_bn}
                    onChange={(e) => setUpdateForm(prev => ({ ...prev, title_bn: e.target.value }))}
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
                    value={updateForm.description_en}
                    onChange={(e) => setUpdateForm(prev => ({ ...prev, description_en: e.target.value }))}
                    placeholder="Describe what progress was made..."
                    className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Description (Bengali)
                  </label>
                  <textarea
                    rows={4}
                    value={updateForm.description_bn}
                    onChange={(e) => setUpdateForm(prev => ({ ...prev, description_bn: e.target.value }))}
                    className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  New Progress: {updateForm.new_progress}% (Current: {selectedPromiseForUpdate.progress}%)
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={updateForm.new_progress}
                  onChange={(e) => setUpdateForm(prev => ({ ...prev, new_progress: parseInt(e.target.value) }))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs mt-1">
                  <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>0%</span>
                  <span className={`font-medium ${
                    updateForm.new_progress > selectedPromiseForUpdate.progress
                      ? 'text-green-500'
                      : updateForm.new_progress < selectedPromiseForUpdate.progress
                        ? 'text-red-500'
                        : isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {updateForm.new_progress > selectedPromiseForUpdate.progress && '+'}
                    {updateForm.new_progress - selectedPromiseForUpdate.progress}% change
                  </span>
                  <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>100%</span>
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Related News Link (Optional)
                </label>
                <input
                  type="url"
                  value={updateForm.news_link}
                  onChange={(e) => setUpdateForm(prev => ({ ...prev, news_link: e.target.value }))}
                  placeholder="https://example.com/news-article"
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowUpdateModal(false)}
                  className={`px-6 py-2 rounded-lg font-medium ${isDark ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-800'}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? 'Adding...' : 'Add Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Updates List Modal */}
      {showUpdatesListModal && selectedPromiseForUpdate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowUpdatesListModal(false)} />
          <div className={`relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className={`sticky top-0 p-6 border-b ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Update History
                  </h2>
                  <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {selectedPromiseForUpdate.title_en}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowUpdatesListModal(false);
                    openAddUpdateModal(selectedPromiseForUpdate);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 text-sm"
                >
                  + Add Update
                </button>
              </div>
            </div>
            <div className="p-6">
              {loadingUpdates ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
                </div>
              ) : promiseUpdates.length === 0 ? (
                <div className={`text-center py-12 rounded-xl ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                  <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>No updates yet</p>
                  <p className={`text-sm mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    Click &quot;Add Update&quot; to document progress
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {promiseUpdates.map((update, index) => (
                    <div
                      key={update.id}
                      className={`relative pl-6 pb-6 ${index !== promiseUpdates.length - 1 ? 'border-l-2' : ''} ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
                    >
                      {/* Timeline dot */}
                      <div className={`absolute left-0 -translate-x-1/2 w-3 h-3 rounded-full ${
                        update.new_progress === 100 ? 'bg-green-500' : 'bg-blue-500'
                      }`} />

                      <div className={`ml-4 p-4 rounded-xl ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {update.title_en}
                            </h4>
                            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                              {format(new Date(update.created_at), 'MMM d, yyyy • h:mm a')}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {update.new_progress !== null && (
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                update.progress_change > 0
                                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                  : update.progress_change < 0
                                    ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                              }`}>
                                {update.progress_change > 0 && '+'}{update.progress_change}% → {update.new_progress}%
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => handleDeleteUpdate(update.id)}
                              className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                              title="Delete update"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                        {update.description_en && (
                          <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                            {update.description_en}
                          </p>
                        )}
                        {update.news_link && (
                          <a
                            href={update.news_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 mt-2 text-sm text-blue-500 hover:text-blue-600"
                          >
                            🔗 Related News
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className={`sticky bottom-0 p-4 border-t ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
              <button
                type="button"
                onClick={() => setShowUpdatesListModal(false)}
                className={`w-full px-4 py-2 rounded-lg font-medium ${isDark ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
