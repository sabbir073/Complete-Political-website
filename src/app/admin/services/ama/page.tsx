'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTheme } from '@/providers/ThemeProvider';
import { format } from 'date-fns';

interface Category {
  id: string;
  name_en: string;
  name_bn: string;
  slug: string;
  icon: string;
  description_en?: string;
  description_bn?: string;
  display_order: number;
  is_active: boolean;
}

interface Question {
  id: string;
  category_id: string | null;
  submitter_name_en: string | null;
  submitter_name_bn: string | null;
  submitter_address_en: string | null;
  submitter_address_bn: string | null;
  is_anonymous: boolean;
  submitter_ip: string;
  question_en: string;
  question_bn: string | null;
  answer_en: string | null;
  answer_bn: string | null;
  answered_at: string | null;
  status: 'pending' | 'approved' | 'answered' | 'flagged';
  upvotes: number;
  downvotes: number;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
  ama_categories: Category | null;
}

interface Stats {
  total: number;
  pending: number;
  approved: number;
  answered: number;
  flagged: number;
}

export default function AdminAMAPage() {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<'questions' | 'categories'>('questions');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Edit Modal
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [editForm, setEditForm] = useState({
    category_id: '',
    submitter_name_en: '',
    submitter_name_bn: '',
    submitter_address_en: '',
    submitter_address_bn: '',
    question_en: '',
    question_bn: '',
    answer_en: '',
    answer_bn: '',
    admin_notes: '',
    is_anonymous: false
  });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  // Category Modal
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryForm, setCategoryForm] = useState({
    name_en: '',
    name_bn: '',
    slug: '',
    description_en: '',
    description_bn: '',
    icon: '💬',
    display_order: 0,
    is_active: true
  });
  const [savingCategory, setSavingCategory] = useState(false);

  // Fetch categories
  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch('/api/admin/ama/categories');
        const data = await res.json();
        if (data.success) {
          setCategories(data.data);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    }
    fetchCategories();
  }, []);

  // Fetch questions
  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (categoryFilter !== 'all') params.append('category', categoryFilter);
      if (searchQuery) params.append('search', searchQuery);
      params.append('page', page.toString());
      params.append('limit', '20');

      const res = await fetch(`/api/admin/ama/questions?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        setQuestions(data.data);
        setStats(data.stats);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, categoryFilter, searchQuery, page]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  // Open edit modal
  const openEditModal = (question: Question) => {
    setEditingQuestion(question);
    setEditForm({
      category_id: question.category_id || '',
      submitter_name_en: question.submitter_name_en || '',
      submitter_name_bn: question.submitter_name_bn || '',
      submitter_address_en: question.submitter_address_en || '',
      submitter_address_bn: question.submitter_address_bn || '',
      question_en: question.question_en || '',
      question_bn: question.question_bn || '',
      answer_en: question.answer_en || '',
      answer_bn: question.answer_bn || '',
      admin_notes: question.admin_notes || '',
      is_anonymous: question.is_anonymous
    });
    setSaveError('');
  };

  // Save question
  const saveQuestion = async (newStatus?: string) => {
    if (!editingQuestion) return;

    setSaving(true);
    setSaveError('');

    try {
      const res = await fetch(`/api/admin/ama/questions/${editingQuestion.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editForm,
          status: newStatus || editingQuestion.status
        })
      });

      const data = await res.json();
      if (data.success) {
        setEditingQuestion(null);
        fetchQuestions();
      } else {
        setSaveError(data.error || 'Failed to save');
      }
    } catch (error) {
      setSaveError('Failed to save question');
    } finally {
      setSaving(false);
    }
  };

  // Quick status change
  const updateStatus = async (questionId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/ama/questions/${questionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        fetchQuestions();
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  // Delete question
  const deleteQuestion = async (questionId: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return;

    try {
      const res = await fetch(`/api/admin/ama/questions/${questionId}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        fetchQuestions();
      }
    } catch (error) {
      console.error('Error deleting question:', error);
    }
  };

  // Category CRUD
  const openCategoryModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setCategoryForm({
        name_en: category.name_en,
        name_bn: category.name_bn,
        slug: category.slug,
        description_en: category.description_en || '',
        description_bn: category.description_bn || '',
        icon: category.icon,
        display_order: category.display_order,
        is_active: category.is_active
      });
    } else {
      setEditingCategory({} as Category); // New category
      setCategoryForm({
        name_en: '',
        name_bn: '',
        slug: '',
        description_en: '',
        description_bn: '',
        icon: '💬',
        display_order: categories.length,
        is_active: true
      });
    }
  };

  const saveCategory = async () => {
    setSavingCategory(true);
    try {
      const isNew = !editingCategory?.id;
      const url = isNew
        ? '/api/admin/ama/categories'
        : `/api/admin/ama/categories/${editingCategory?.id}`;

      const res = await fetch(url, {
        method: isNew ? 'POST' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryForm)
      });

      const data = await res.json();
      if (data.success) {
        setEditingCategory(null);
        // Refresh categories
        const catRes = await fetch('/api/admin/ama/categories');
        const catData = await catRes.json();
        if (catData.success) setCategories(catData.data);
      } else {
        alert(data.error || 'Failed to save category');
      }
    } catch (error) {
      alert('Failed to save category');
    } finally {
      setSavingCategory(false);
    }
  };

  const deleteCategory = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
      const res = await fetch(`/api/admin/ama/categories/${categoryId}`, {
        method: 'DELETE'
      });

      const data = await res.json();
      if (data.success) {
        const catRes = await fetch('/api/admin/ama/categories');
        const catData = await catRes.json();
        if (catData.success) setCategories(catData.data);
      } else {
        alert(data.error || 'Failed to delete category');
      }
    } catch (error) {
      alert('Failed to delete category');
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-500 text-white',
      approved: 'bg-blue-500 text-white',
      answered: 'bg-green-500 text-white',
      flagged: 'bg-red-500 text-white'
    };
    return styles[status] || 'bg-gray-500 text-white';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Ask Me Anything (AMA)
          </h1>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Manage questions and answers from the public
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className={`rounded-xl p-4 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow`}>
            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.total}</div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Total</div>
          </div>
          <div className={`rounded-xl p-4 ${isDark ? 'bg-yellow-900/30 border border-yellow-700' : 'bg-yellow-50 border border-yellow-200'}`}>
            <div className={`text-2xl font-bold ${isDark ? 'text-yellow-400' : 'text-yellow-700'}`}>{stats.pending}</div>
            <div className={`text-sm ${isDark ? 'text-yellow-500' : 'text-yellow-600'}`}>Pending</div>
          </div>
          <div className={`rounded-xl p-4 ${isDark ? 'bg-blue-900/30 border border-blue-700' : 'bg-blue-50 border border-blue-200'}`}>
            <div className={`text-2xl font-bold ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>{stats.approved}</div>
            <div className={`text-sm ${isDark ? 'text-blue-500' : 'text-blue-600'}`}>Approved</div>
          </div>
          <div className={`rounded-xl p-4 ${isDark ? 'bg-green-900/30 border border-green-700' : 'bg-green-50 border border-green-200'}`}>
            <div className={`text-2xl font-bold ${isDark ? 'text-green-400' : 'text-green-700'}`}>{stats.answered}</div>
            <div className={`text-sm ${isDark ? 'text-green-500' : 'text-green-600'}`}>Answered</div>
          </div>
          <div className={`rounded-xl p-4 ${isDark ? 'bg-red-900/30 border border-red-700' : 'bg-red-50 border border-red-200'}`}>
            <div className={`text-2xl font-bold ${isDark ? 'text-red-400' : 'text-red-700'}`}>{stats.flagged}</div>
            <div className={`text-sm ${isDark ? 'text-red-500' : 'text-red-600'}`}>Flagged</div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('questions')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'questions'
              ? 'bg-green-600 text-white'
              : isDark
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Questions
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'categories'
              ? 'bg-green-600 text-white'
              : isDark
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Categories
        </button>
      </div>

      {activeTab === 'questions' ? (
        <>
          {/* Filters */}
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow`}>
            <div className="flex flex-wrap gap-4">
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                className={`px-4 py-2 rounded-lg border ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="answered">Answered</option>
                <option value="flagged">Flagged</option>
              </select>

              <select
                value={categoryFilter}
                onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
                className={`px-4 py-2 rounded-lg border ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.icon} {cat.name_en}</option>
                ))}
              </select>

              <input
                type="text"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                placeholder="Search questions..."
                className={`flex-1 min-w-[200px] px-4 py-2 rounded-lg border ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
              />
            </div>
          </div>

          {/* Questions Table */}
          <div className={`rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow overflow-hidden`}>
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
              </div>
            ) : questions.length === 0 ? (
              <div className="p-8 text-center">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>No questions found</p>
                <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Questions will appear here when submitted</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className={isDark ? 'bg-gray-700' : 'bg-gray-50'}>
                    <tr>
                      <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>Question</th>
                      <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>Submitter</th>
                      <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>Category</th>
                      <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>Status</th>
                      <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>Votes</th>
                      <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>Date</th>
                      <th className={`px-4 py-3 text-right text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>Actions</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                    {questions.map((q) => (
                      <tr key={q.id} className={isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                        <td className="px-4 py-3">
                          <div className={`max-w-xs truncate text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {q.question_en}
                          </div>
                          {q.answer_en && (
                            <div className="text-xs text-green-500 mt-1">Has answer</div>
                          )}
                        </td>
                        <td className={`px-4 py-3 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                          {q.is_anonymous ? (
                            <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>Anonymous</span>
                          ) : (
                            q.submitter_name_en || 'N/A'
                          )}
                        </td>
                        <td className={`px-4 py-3 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                          {q.ama_categories ? (
                            <span>{q.ama_categories.icon} {q.ama_categories.name_en}</span>
                          ) : (
                            <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>None</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(q.status)}`}>
                            {q.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className="text-green-500">↑{q.upvotes}</span>
                          {' / '}
                          <span className="text-red-500">↓{q.downvotes}</span>
                        </td>
                        <td className={`px-4 py-3 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {format(new Date(q.created_at), 'MMM d, yyyy')}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEditModal(q)}
                              className="p-1 text-blue-500 hover:bg-blue-500/10 rounded"
                              title="Edit"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>

                            {q.status === 'pending' && (
                              <button
                                onClick={() => updateStatus(q.id, 'approved')}
                                className="p-1 text-green-500 hover:bg-green-500/10 rounded"
                                title="Approve"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              </button>
                            )}

                            {q.status !== 'flagged' && (
                              <button
                                onClick={() => updateStatus(q.id, 'flagged')}
                                className="p-1 text-orange-500 hover:bg-orange-500/10 rounded"
                                title="Flag"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                                </svg>
                              </button>
                            )}

                            <button
                              onClick={() => deleteQuestion(q.id)}
                              className="p-1 text-red-500 hover:bg-red-500/10 rounded"
                              title="Delete"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className={`px-4 py-2 rounded-lg disabled:opacity-50 ${
                  isDark
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Previous
              </button>
              <span className={`px-4 py-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className={`px-4 py-2 rounded-lg disabled:opacity-50 ${
                  isDark
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Next
              </button>
            </div>
          )}
        </>
      ) : (
        /* Categories Tab */
        <>
          {/* Header Bar - matching filter box style */}
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow`}>
            <div className="flex justify-between items-center">
              <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Manage Categories</h2>
              <button
                onClick={() => openCategoryModal()}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Category
              </button>
            </div>
          </div>

          {/* Categories Table */}
          <div className={`rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow overflow-hidden`}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={isDark ? 'bg-gray-700' : 'bg-gray-50'}>
                  <tr>
                    <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>Order</th>
                    <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>Icon</th>
                    <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>Name (EN)</th>
                    <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>Name (BN)</th>
                    <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>Slug</th>
                    <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>Status</th>
                    <th className={`px-4 py-3 text-right text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>Actions</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                  {categories.map((cat) => (
                    <tr key={cat.id} className={isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                      <td className={`px-4 py-3 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{cat.display_order}</td>
                      <td className="px-4 py-3 text-2xl">{cat.icon}</td>
                      <td className={`px-4 py-3 text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{cat.name_en}</td>
                      <td className={`px-4 py-3 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{cat.name_bn}</td>
                      <td className={`px-4 py-3 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{cat.slug}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          cat.is_active ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'
                        }`}>
                          {cat.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => openCategoryModal(cat)}
                          className="p-1 text-blue-500 hover:bg-blue-500/10 rounded mr-2"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteCategory(cat.id)}
                          className="p-1 text-red-500 hover:bg-red-500/10 rounded"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {categories.length === 0 && (
              <div className="p-8 text-center">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>No categories found</p>
                <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Create your first category to get started</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Edit Question Modal */}
      {editingQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setEditingQuestion(null)} />
          <div className={`relative w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-xl shadow-2xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            {/* Header */}
            <div className={`sticky top-0 z-10 px-6 py-4 border-b ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <div className="flex justify-between items-center">
                <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Edit Question</h2>
                <button onClick={() => setEditingQuestion(null)} className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 max-h-[calc(90vh-140px)]">
              {saveError && (
                <div className="p-3 bg-red-500/20 text-red-500 rounded-lg">{saveError}</div>
              )}

              {/* Category */}
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Category</label>
                <select
                  value={editForm.category_id}
                  onChange={(e) => setEditForm(prev => ({ ...prev, category_id: e.target.value }))}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="">No Category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.icon} {cat.name_en}</option>
                  ))}
                </select>
              </div>

              {/* Anonymous toggle */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editForm.is_anonymous}
                  onChange={(e) => setEditForm(prev => ({ ...prev, is_anonymous: e.target.checked }))}
                  className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Anonymous submission</span>
              </label>

              {/* Submitter Name */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Name (English)</label>
                  <input
                    type="text"
                    value={editForm.submitter_name_en}
                    onChange={(e) => setEditForm(prev => ({ ...prev, submitter_name_en: e.target.value }))}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Name (বাংলা)</label>
                  <input
                    type="text"
                    value={editForm.submitter_name_bn}
                    onChange={(e) => setEditForm(prev => ({ ...prev, submitter_name_bn: e.target.value }))}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
              </div>

              {/* Submitter Address */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Address (English)</label>
                  <input
                    type="text"
                    value={editForm.submitter_address_en}
                    onChange={(e) => setEditForm(prev => ({ ...prev, submitter_address_en: e.target.value }))}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Address (বাংলা)</label>
                  <input
                    type="text"
                    value={editForm.submitter_address_bn}
                    onChange={(e) => setEditForm(prev => ({ ...prev, submitter_address_bn: e.target.value }))}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
              </div>

              {/* Question */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Question (English) *</label>
                  <textarea
                    value={editForm.question_en}
                    onChange={(e) => setEditForm(prev => ({ ...prev, question_en: e.target.value }))}
                    rows={3}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Question (বাংলা)</label>
                  <textarea
                    value={editForm.question_bn}
                    onChange={(e) => setEditForm(prev => ({ ...prev, question_bn: e.target.value }))}
                    rows={3}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
              </div>

              {/* Answer */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Answer (English)</label>
                  <textarea
                    value={editForm.answer_en}
                    onChange={(e) => setEditForm(prev => ({ ...prev, answer_en: e.target.value }))}
                    rows={4}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="Write the answer here..."
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Answer (বাংলা)</label>
                  <textarea
                    value={editForm.answer_bn}
                    onChange={(e) => setEditForm(prev => ({ ...prev, answer_bn: e.target.value }))}
                    rows={4}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="উত্তর লিখুন..."
                  />
                </div>
              </div>

              {/* Admin Notes */}
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Admin Notes (Internal)</label>
                <textarea
                  value={editForm.admin_notes}
                  onChange={(e) => setEditForm(prev => ({ ...prev, admin_notes: e.target.value }))}
                  rows={2}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder="Internal notes, not visible to public..."
                />
              </div>
            </div>

            {/* Footer */}
            <div className={`sticky bottom-0 px-6 py-4 border-t ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  {editingQuestion.status === 'pending' && (
                    <button
                      onClick={() => saveQuestion('approved')}
                      disabled={saving}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      Approve & Save
                    </button>
                  )}
                  {editingQuestion.status !== 'flagged' && (
                    <button
                      onClick={() => saveQuestion('flagged')}
                      disabled={saving}
                      className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
                    >
                      Flag
                    </button>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingQuestion(null)}
                    className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => saveQuestion()}
                    disabled={saving}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  {(editForm.answer_en || editForm.answer_bn) && editingQuestion.status !== 'answered' && (
                    <button
                      onClick={() => saveQuestion('answered')}
                      disabled={saving}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                    >
                      Save & Mark Answered
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setEditingCategory(null)} />
          <div className={`relative w-full max-w-md rounded-xl shadow-2xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className={`px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex justify-between items-center">
                <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {editingCategory.id ? 'Edit Category' : 'Add Category'}
                </h2>
                <button onClick={() => setEditingCategory(null)} className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Name (English) *</label>
                  <input
                    type="text"
                    value={categoryForm.name_en}
                    onChange={(e) => setCategoryForm(prev => ({ ...prev, name_en: e.target.value }))}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Name (বাংলা) *</label>
                  <input
                    type="text"
                    value={categoryForm.name_bn}
                    onChange={(e) => setCategoryForm(prev => ({ ...prev, name_bn: e.target.value }))}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Slug *</label>
                  <input
                    type="text"
                    value={categoryForm.slug}
                    onChange={(e) => setCategoryForm(prev => ({ ...prev, slug: e.target.value }))}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="e.g., healthcare"
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Icon (Emoji)</label>
                  <input
                    type="text"
                    value={categoryForm.icon}
                    onChange={(e) => setCategoryForm(prev => ({ ...prev, icon: e.target.value }))}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="💬"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Order</label>
                  <input
                    type="number"
                    value={categoryForm.display_order}
                    onChange={(e) => setCategoryForm(prev => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div className="flex items-end pb-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={categoryForm.is_active}
                      onChange={(e) => setCategoryForm(prev => ({ ...prev, is_active: e.target.checked }))}
                      className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Active</span>
                  </label>
                </div>
              </div>
            </div>

            <div className={`px-6 py-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setEditingCategory(null)}
                  className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                  Cancel
                </button>
                <button
                  onClick={saveCategory}
                  disabled={savingCategory || !categoryForm.name_en || !categoryForm.name_bn || !categoryForm.slug}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {savingCategory ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
