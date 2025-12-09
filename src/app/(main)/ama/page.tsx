'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTheme } from '@/providers/ThemeProvider';
import { useLanguage } from '@/providers/LanguageProvider';
import { format } from 'date-fns';

interface Category {
  id: string;
  name_en: string;
  name_bn: string;
  slug: string;
  icon: string;
  description_en?: string;
  description_bn?: string;
}

interface Question {
  id: string;
  category_id: string | null;
  submitter_name_en: string | null;
  submitter_name_bn: string | null;
  submitter_address_en: string | null;
  submitter_address_bn: string | null;
  is_anonymous: boolean;
  question_en: string;
  question_bn: string | null;
  answer_en: string | null;
  answer_bn: string | null;
  answered_at: string | null;
  status: 'approved' | 'answered';
  upvotes: number;
  downvotes: number;
  answer_upvotes: number;
  answer_downvotes: number;
  created_at: string;
  user_vote: 'upvote' | 'downvote' | null;
  user_answer_vote: 'upvote' | 'downvote' | null;
  ama_categories: Category | null;
}

export default function AMAPage() {
  const { isDark } = useTheme();
  const { language } = useLanguage();

  // State
  const [categories, setCategories] = useState<Category[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeStatus, setActiveStatus] = useState<'all' | 'answered' | 'pending'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Ask Question Modal
  const [showAskModal, setShowAskModal] = useState(false);
  const [askForm, setAskForm] = useState({
    name: '',
    address: '',
    question: '',
    category_id: '',
    is_anonymous: false
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const getText = (en: string | null, bn: string | null) => {
    if (language === 'bn' && bn) return bn;
    return en || bn || '';
  };

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch categories
  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch('/api/ama/categories');
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
  const fetchQuestions = useCallback(async (pageNum: number, append = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      const params = new URLSearchParams();
      if (activeCategory !== 'all') params.append('category', activeCategory);
      if (activeStatus !== 'all') params.append('status', activeStatus);
      if (debouncedSearch) params.append('search', debouncedSearch);
      params.append('page', pageNum.toString());
      params.append('limit', '12');

      const res = await fetch(`/api/ama/questions?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        if (append) {
          setQuestions(prev => [...prev, ...data.data]);
        } else {
          setQuestions(data.data);
        }
        setTotalPages(data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [activeCategory, activeStatus, debouncedSearch]);

  useEffect(() => {
    fetchQuestions(page, page > 1);
  }, [fetchQuestions, page]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [activeCategory, activeStatus, debouncedSearch]);

  // Handle vote on question or answer
  const handleVote = async (questionId: string, voteType: 'upvote' | 'downvote', voteTarget: 'question' | 'answer' = 'question') => {
    try {
      const res = await fetch('/api/ama/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question_id: questionId, vote_type: voteType, vote_target: voteTarget })
      });

      const data = await res.json();
      if (data.success) {
        // Update question in state based on vote target
        setQuestions(prev => prev.map(q => {
          if (q.id === questionId) {
            if (voteTarget === 'answer') {
              return {
                ...q,
                answer_upvotes: data.data.upvotes,
                answer_downvotes: data.data.downvotes,
                user_answer_vote: data.data.user_vote
              };
            } else {
              return {
                ...q,
                upvotes: data.data.upvotes,
                downvotes: data.data.downvotes,
                user_vote: data.data.user_vote
              };
            }
          }
          return q;
        }));
      }
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  // Handle ask question submit
  const handleAskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError('');

    try {
      const res = await fetch('/api/ama/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submitter_name: askForm.name,
          submitter_address: askForm.address,
          question: askForm.question,
          category_id: askForm.category_id || null,
          is_anonymous: askForm.is_anonymous
        })
      });

      const data = await res.json();
      if (data.success) {
        setSubmitSuccess(true);
        setAskForm({ name: '', address: '', question: '', category_id: '', is_anonymous: false });
        setTimeout(() => {
          setShowAskModal(false);
          setSubmitSuccess(false);
        }, 3000);
      } else {
        setSubmitError(data.error || 'Failed to submit question');
      }
    } catch (error) {
      setSubmitError('Failed to submit question. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (date: string) => {
    return format(new Date(date), 'MMM d, yyyy');
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Hero Section */}
      <div className={`relative py-16 ${isDark ? 'bg-gradient-to-br from-green-900 via-gray-900 to-gray-900' : 'bg-gradient-to-br from-green-600 via-green-700 to-green-800'}`}>
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {language === 'bn' ? 'জিজ্ঞাসা করুন' : 'Ask Me Anything'}
          </h1>
          <p className="text-lg text-white/90 max-w-2xl mx-auto mb-8">
            {language === 'bn'
              ? 'এস এম জাহাঙ্গীর হোসেনকে সরাসরি প্রশ্ন করুন। আপনার প্রশ্নের উত্তর পান।'
              : 'Ask S M Jahangir Hossain directly. Get answers to your questions.'}
          </p>
          <button
            onClick={() => setShowAskModal(true)}
            className="px-8 py-4 bg-white text-green-700 rounded-full font-bold text-lg hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg"
          >
            {language === 'bn' ? '❓ প্রশ্ন করুন' : '❓ Ask a Question'}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-xl mx-auto">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === 'bn' ? 'প্রশ্ন খুঁজুন...' : 'Search questions...'}
              className={`w-full px-5 py-3 pl-12 rounded-full border-2 focus:outline-none focus:ring-2 focus:ring-green-500 ${
                isDark
                  ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500'
                  : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
              }`}
            />
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Category Filter - Dropdown on mobile, Tabs on desktop */}
        <div className="mb-6">
          {/* Mobile: Dropdown */}
          <div className="md:hidden">
            <select
              value={activeCategory}
              onChange={(e) => setActiveCategory(e.target.value)}
              className={`w-full px-4 py-3 rounded-xl border-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-500 ${
                isDark
                  ? 'bg-gray-800 border-gray-700 text-white'
                  : 'bg-white border-gray-200 text-gray-900'
              }`}
            >
              <option value="all">{language === 'bn' ? '📋 সব ক্যাটাগরি' : '📋 All Categories'}</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.slug}>
                  {cat.icon} {getText(cat.name_en, cat.name_bn)}
                </option>
              ))}
            </select>
          </div>

          {/* Desktop: Tabs */}
          <div className="hidden md:flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeCategory === 'all'
                  ? 'bg-green-600 text-white shadow-md'
                  : isDark
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {language === 'bn' ? '📋 সব' : '📋 All'}
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.slug)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeCategory === cat.slug
                    ? 'bg-green-600 text-white shadow-md'
                    : isDark
                      ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {cat.icon} {getText(cat.name_en, cat.name_bn)}
              </button>
            ))}
          </div>
        </div>

        {/* Status Filter */}
        <div className="mb-8 flex gap-2 justify-center">
          {[
            { key: 'all', label_en: 'All', label_bn: 'সব' },
            { key: 'answered', label_en: 'Answered', label_bn: 'উত্তর দেওয়া হয়েছে' },
            { key: 'pending', label_en: 'Pending', label_bn: 'অপেক্ষমান' }
          ].map(status => (
            <button
              key={status.key}
              onClick={() => setActiveStatus(status.key as typeof activeStatus)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeStatus === status.key
                  ? isDark ? 'bg-green-600 text-white' : 'bg-green-600 text-white'
                  : isDark
                    ? 'bg-gray-800 text-gray-400 hover:text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {language === 'bn' ? status.label_bn : status.label_en}
            </button>
          ))}
        </div>

        {/* Questions List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent" />
          </div>
        ) : questions.length === 0 ? (
          <div className={`text-center py-16 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="text-6xl mb-4">🤔</div>
            <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {language === 'bn' ? 'কোনো প্রশ্ন পাওয়া যায়নি' : 'No questions found'}
            </h3>
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              {language === 'bn'
                ? 'প্রথম প্রশ্ন করুন!'
                : 'Be the first to ask a question!'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {questions.map((question) => (
              <div
                key={question.id}
                className={`rounded-2xl p-6 transition-all ${
                  isDark ? 'bg-gray-800 hover:bg-gray-750' : 'bg-white hover:shadow-lg'
                } ${question.status === 'answered' ? 'border-l-4 border-green-500' : ''}`}
              >
                {/* Question Header */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    {/* Category Badge */}
                    {question.ama_categories && (
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium mb-2 ${
                        isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {question.ama_categories.icon} {getText(question.ama_categories.name_en, question.ama_categories.name_bn)}
                      </span>
                    )}

                    {/* Question */}
                    <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {getText(question.question_en, question.question_bn)}
                    </h3>

                    {/* Submitter Info */}
                    <div className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {question.is_anonymous ? (
                        <span>{language === 'bn' ? '👤 বেনামী' : '👤 Anonymous'}</span>
                      ) : (
                        <span>
                          👤 {getText(question.submitter_name_en, question.submitter_name_bn)}
                          {question.submitter_address_en && (
                            <span className="ml-2">
                              📍 {getText(question.submitter_address_en, question.submitter_address_bn)}
                            </span>
                          )}
                        </span>
                      )}
                      <span className="ml-3">📅 {formatDate(question.created_at)}</span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    question.status === 'answered'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                  }`}>
                    {question.status === 'answered'
                      ? (language === 'bn' ? '✅ উত্তর দেওয়া হয়েছে' : '✅ Answered')
                      : (language === 'bn' ? '⏳ অপেক্ষমান' : '⏳ Pending')}
                  </span>
                </div>

                {/* Question Vote Buttons */}
                <div className="mt-4 flex items-center gap-4">
                  <span className={`text-xs font-medium ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    {language === 'bn' ? 'প্রশ্নে ভোট:' : 'Vote on question:'}
                  </span>
                  <button
                    onClick={() => handleVote(question.id, 'upvote', 'question')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all text-sm ${
                      question.user_vote === 'upvote'
                        ? 'bg-green-600 text-white'
                        : isDark
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                    <span className="font-medium">{question.upvotes}</span>
                  </button>

                  <button
                    onClick={() => handleVote(question.id, 'downvote', 'question')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all text-sm ${
                      question.user_vote === 'downvote'
                        ? 'bg-red-600 text-white'
                        : isDark
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                    <span className="font-medium">{question.downvotes}</span>
                  </button>
                </div>

                {/* Answer */}
                {question.status === 'answered' && (question.answer_en || question.answer_bn) && (
                  <div className={`mt-4 p-4 rounded-xl ${isDark ? 'bg-green-900/20 border border-green-800' : 'bg-green-50 border border-green-200'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-green-600 font-bold">
                        {language === 'bn' ? '💬 উত্তর:' : '💬 Answer:'}
                      </span>
                      {question.answered_at && (
                        <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                          {formatDate(question.answered_at)}
                        </span>
                      )}
                    </div>
                    <p className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                      {getText(question.answer_en, question.answer_bn)}
                    </p>

                    {/* Answer Vote Buttons */}
                    <div className="mt-4 flex items-center gap-4 pt-3 border-t border-green-300/30">
                      <span className={`text-xs font-medium ${isDark ? 'text-green-400/70' : 'text-green-600/70'}`}>
                        {language === 'bn' ? 'উত্তরে ভোট:' : 'Vote on answer:'}
                      </span>
                      <button
                        onClick={() => handleVote(question.id, 'upvote', 'answer')}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all text-sm ${
                          question.user_answer_vote === 'upvote'
                            ? 'bg-green-600 text-white'
                            : isDark
                              ? 'bg-green-900/40 text-green-300 hover:bg-green-900/60'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                        <span className="font-medium">{question.answer_upvotes || 0}</span>
                      </button>

                      <button
                        onClick={() => handleVote(question.id, 'downvote', 'answer')}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all text-sm ${
                          question.user_answer_vote === 'downvote'
                            ? 'bg-red-600 text-white'
                            : isDark
                              ? 'bg-green-900/40 text-green-300 hover:bg-green-900/60'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                        <span className="font-medium">{question.answer_downvotes || 0}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Load More */}
        {page < totalPages && !loading && (
          <div className="mt-8 text-center">
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={loadingMore}
              className={`px-8 py-3 rounded-full font-medium transition-all ${
                isDark
                  ? 'bg-gray-800 text-white hover:bg-gray-700'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {loadingMore ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  {language === 'bn' ? 'লোড হচ্ছে...' : 'Loading...'}
                </span>
              ) : (
                language === 'bn' ? 'আরো দেখুন' : 'Load More'
              )}
            </button>
          </div>
        )}
      </div>

      {/* Ask Question Modal */}
      {showAskModal && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => !submitting && setShowAskModal(false)}
          />

          <div className={`relative w-full max-w-lg max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col ${
            isDark ? 'bg-gray-800' : 'bg-white'
          }`}>
            {/* Modal Header */}
            <div className={`flex-shrink-0 p-6 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
              <button
                onClick={() => !submitting && setShowAskModal(false)}
                className={`absolute top-4 right-4 p-2 rounded-full transition-colors ${
                  isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
                }`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {language === 'bn' ? '❓ প্রশ্ন করুন' : '❓ Ask a Question'}
              </h2>
              <p className={`mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {language === 'bn'
                  ? 'আপনার প্রশ্ন জমা দিন। অ্যাডমিন পর্যালোচনার পর প্রকাশিত হবে।'
                  : 'Submit your question. It will be published after admin review.'}
              </p>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6">
              {submitSuccess ? (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">✅</div>
                  <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {language === 'bn' ? 'প্রশ্ন জমা হয়েছে!' : 'Question Submitted!'}
                  </h3>
                  <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                    {language === 'bn'
                      ? 'আপনার প্রশ্ন পর্যালোচনা করা হচ্ছে।'
                      : 'Your question is being reviewed.'}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleAskSubmit} className="space-y-4">
                  {submitError && (
                    <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm">
                      {submitError}
                    </div>
                  )}

                  {/* Anonymous Toggle */}
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={askForm.is_anonymous}
                      onChange={(e) => setAskForm(prev => ({ ...prev, is_anonymous: e.target.checked }))}
                      className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                      {language === 'bn' ? 'বেনামে জমা দিন' : 'Submit anonymously'}
                    </span>
                  </label>

                  {/* Name & Address (hidden if anonymous) */}
                  {!askForm.is_anonymous && (
                    <>
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          {language === 'bn' ? 'আপনার নাম *' : 'Your Name *'}
                        </label>
                        <input
                          type="text"
                          value={askForm.name}
                          onChange={(e) => setAskForm(prev => ({ ...prev, name: e.target.value }))}
                          required={!askForm.is_anonymous}
                          className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-green-500 outline-none ${
                            isDark
                              ? 'bg-gray-700 border-gray-600 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                          placeholder={language === 'bn' ? 'আপনার নাম লিখুন' : 'Enter your name'}
                        />
                      </div>

                      <div>
                        <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          {language === 'bn' ? 'ঠিকানা (ঐচ্ছিক)' : 'Address (Optional)'}
                        </label>
                        <input
                          type="text"
                          value={askForm.address}
                          onChange={(e) => setAskForm(prev => ({ ...prev, address: e.target.value }))}
                          className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-green-500 outline-none ${
                            isDark
                              ? 'bg-gray-700 border-gray-600 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                          placeholder={language === 'bn' ? 'থানা, ওয়ার্ড ইত্যাদি' : 'Thana, Ward, etc.'}
                        />
                      </div>
                    </>
                  )}

                  {/* Category */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {language === 'bn' ? 'ক্যাটাগরি' : 'Category'}
                    </label>
                    <select
                      value={askForm.category_id}
                      onChange={(e) => setAskForm(prev => ({ ...prev, category_id: e.target.value }))}
                      className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-green-500 outline-none ${
                        isDark
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      <option value="">{language === 'bn' ? 'ক্যাটাগরি নির্বাচন করুন' : 'Select a category'}</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>
                          {cat.icon} {getText(cat.name_en, cat.name_bn)}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Question */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {language === 'bn' ? 'আপনার প্রশ্ন *' : 'Your Question *'}
                    </label>
                    <textarea
                      value={askForm.question}
                      onChange={(e) => setAskForm(prev => ({ ...prev, question: e.target.value }))}
                      required
                      rows={4}
                      maxLength={2000}
                      className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-green-500 outline-none resize-none ${
                        isDark
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      placeholder={language === 'bn' ? 'আপনার প্রশ্ন লিখুন...' : 'Write your question...'}
                    />
                    <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      {askForm.question.length}/2000
                    </p>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={submitting || !askForm.question.trim()}
                    className={`w-full py-3 rounded-lg font-bold text-white transition-all ${
                      submitting || !askForm.question.trim()
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-green-600 hover:bg-green-700'
                    }`}
                  >
                    {submitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        {language === 'bn' ? 'জমা হচ্ছে...' : 'Submitting...'}
                      </span>
                    ) : (
                      language === 'bn' ? 'প্রশ্ন জমা দিন' : 'Submit Question'
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
