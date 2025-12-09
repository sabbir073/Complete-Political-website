'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/providers/ThemeProvider';
import { useSweetAlert } from '@/hooks/useSweetAlert';
import { format } from 'date-fns';

interface PollOption {
  id?: string;
  option_en: string;
  option_bn: string;
  display_order: number;
  vote_count?: number;
}

interface Poll {
  id: string;
  title_en: string;
  title_bn: string;
  description_en?: string;
  description_bn?: string;
  start_datetime: string;
  end_datetime: string;
  timezone: string;
  status: string;
  computed_status?: string;
  allow_multiple_votes: boolean;
  show_results_before_end: boolean;
  require_verification: boolean;
  created_at: string;
  total_votes?: number;
  poll_options?: PollOption[];
}

export default function AdminPollsPage() {
  const { isDark } = useTheme();
  const { showDeleteConfirm, showSuccess, showError } = useSweetAlert();

  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPoll, setEditingPoll] = useState<Poll | null>(null);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    title_en: '',
    title_bn: '',
    description_en: '',
    description_bn: '',
    start_datetime: '',
    end_datetime: '',
    timezone: 'Asia/Dhaka',
    status: 'draft',
    allow_multiple_votes: false,
    show_results_before_end: false,
    require_verification: true,
    options: [
      { option_en: '', option_bn: '' },
      { option_en: '', option_bn: '' }
    ] as { option_en: string; option_bn: string }[]
  });

  useEffect(() => {
    fetchPolls();
  }, [filter, search]);

  const fetchPolls = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter !== 'all') params.append('status', filter);
      if (search) params.append('search', search);

      const response = await fetch(`/api/admin/polls?${params}`);
      const data = await response.json();

      if (data.success) {
        setPolls(data.data || []);
      } else {
        showError('Error', data.error || 'Failed to fetch polls');
      }
    } catch (error) {
      showError('Error', 'Failed to fetch polls');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingPoll(null);
    setFormData({
      title_en: '',
      title_bn: '',
      description_en: '',
      description_bn: '',
      start_datetime: '',
      end_datetime: '',
      timezone: 'Asia/Dhaka',
      status: 'draft',
      allow_multiple_votes: false,
      show_results_before_end: false,
      require_verification: true,
      options: [
        { option_en: '', option_bn: '' },
        { option_en: '', option_bn: '' }
      ]
    });
    setShowModal(true);
  };

  const openEditModal = (poll: Poll) => {
    setEditingPoll(poll);
    setFormData({
      title_en: poll.title_en,
      title_bn: poll.title_bn,
      description_en: poll.description_en || '',
      description_bn: poll.description_bn || '',
      start_datetime: poll.start_datetime ? format(new Date(poll.start_datetime), "yyyy-MM-dd'T'HH:mm") : '',
      end_datetime: poll.end_datetime ? format(new Date(poll.end_datetime), "yyyy-MM-dd'T'HH:mm") : '',
      timezone: poll.timezone || 'Asia/Dhaka',
      status: poll.status,
      allow_multiple_votes: poll.allow_multiple_votes,
      show_results_before_end: poll.show_results_before_end,
      require_verification: poll.require_verification,
      options: poll.poll_options?.map(opt => ({
        id: opt.id,
        option_en: opt.option_en,
        option_bn: opt.option_bn
      })) || [{ option_en: '', option_bn: '' }, { option_en: '', option_bn: '' }]
    });
    setShowModal(true);
  };

  const addOption = () => {
    setFormData(prev => ({
      ...prev,
      options: [...prev.options, { option_en: '', option_bn: '' }]
    }));
  };

  const removeOption = (index: number) => {
    if (formData.options.length <= 2) return;
    setFormData(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index)
    }));
  };

  const updateOption = (index: number, field: 'option_en' | 'option_bn', value: string) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => i === index ? { ...opt, [field]: value } : opt)
    }));
  };

  const handleSubmit = async () => {
    // Validate
    if (!formData.title_en || !formData.title_bn) {
      showError('Validation Error', 'Title is required in both languages');
      return;
    }
    if (!formData.start_datetime || !formData.end_datetime) {
      showError('Validation Error', 'Start and end date/time are required');
      return;
    }
    if (formData.options.some(opt => !opt.option_en || !opt.option_bn)) {
      showError('Validation Error', 'All options must have both English and Bengali text');
      return;
    }

    setSaving(true);
    try {
      const url = editingPoll ? `/api/admin/polls/${editingPoll.id}` : '/api/admin/polls';
      const method = editingPoll ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          start_datetime: new Date(formData.start_datetime).toISOString(),
          end_datetime: new Date(formData.end_datetime).toISOString()
        })
      });

      const data = await response.json();

      if (data.success) {
        showSuccess('Success', editingPoll ? 'Poll updated successfully' : 'Poll created successfully');
        setShowModal(false);
        fetchPolls();
      } else {
        showError('Error', data.error || 'Failed to save poll');
      }
    } catch (error) {
      showError('Error', 'Failed to save poll');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (poll: Poll) => {
    const result = await showDeleteConfirm(poll.title_en);
    if (!result.isConfirmed) return;

    try {
      const response = await fetch(`/api/admin/polls/${poll.id}`, { method: 'DELETE' });
      const data = await response.json();

      if (data.success) {
        showSuccess('Deleted', 'Poll deleted successfully');
        fetchPolls();
      } else {
        showError('Error', data.error || 'Failed to delete poll');
      }
    } catch (error) {
      showError('Error', 'Failed to delete poll');
    }
  };

  const getStatusBadge = (poll: Poll) => {
    const status = poll.computed_status || poll.status;
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      draft: { bg: 'bg-gray-500', text: 'text-white', label: 'Draft' },
      scheduled: { bg: 'bg-blue-500', text: 'text-white', label: 'Scheduled' },
      active: { bg: 'bg-green-500', text: 'text-white', label: 'Active' },
      closed: { bg: 'bg-red-500', text: 'text-white', label: 'Closed' },
      archived: { bg: 'bg-gray-400', text: 'text-white', label: 'Archived' }
    };
    const badge = badges[status] || badges.draft;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Polls & Surveys
          </h1>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Create and manage polls for public participation
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Poll
        </button>
      </div>

      {/* Filters */}
      <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow`}>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search polls..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className={`px-4 py-2 rounded-lg border ${
              isDark
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="closed">Closed</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Polls Table */}
      <div className={`rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow overflow-hidden`}>
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
          </div>
        ) : polls.length === 0 ? (
          <div className="p-8 text-center">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>No polls found</p>
            <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Create your first poll to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={isDark ? 'bg-gray-700' : 'bg-gray-50'}>
                <tr>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                    Poll
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                    Status
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                    Duration
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                    Votes
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                    Options
                  </th>
                  <th className={`px-6 py-3 text-right text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {polls.map((poll) => (
                  <tr key={poll.id} className={isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                    <td className="px-6 py-4">
                      <div>
                        <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{poll.title_en}</p>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{poll.title_bn}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(poll)}
                    </td>
                    <td className="px-6 py-4">
                      <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        <p>{format(new Date(poll.start_datetime), 'MMM d, yyyy')}</p>
                        <p className="text-xs">to {format(new Date(poll.end_datetime), 'MMM d, yyyy')}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {poll.total_votes || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        {poll.poll_options?.length || 0} options
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(poll)}
                        className="text-blue-500 hover:text-blue-600"
                        title="Edit"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(poll)}
                        className="text-red-500 hover:text-red-600"
                        title="Delete"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowModal(false)} />
          <div className={`relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            {/* Modal Header */}
            <div className={`sticky top-0 z-10 px-6 py-4 border-b ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <div className="flex justify-between items-center">
                <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {editingPoll ? 'Edit Poll' : 'Create New Poll'}
                </h2>
                <button onClick={() => setShowModal(false)} className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Title */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Title (English) *
                  </label>
                  <input
                    type="text"
                    value={formData.title_en}
                    onChange={(e) => setFormData(prev => ({ ...prev, title_en: e.target.value }))}
                    className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    placeholder="Enter poll title in English"
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Title (Bengali) *
                  </label>
                  <input
                    type="text"
                    value={formData.title_bn}
                    onChange={(e) => setFormData(prev => ({ ...prev, title_bn: e.target.value }))}
                    className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    placeholder="বাংলায় শিরোনাম লিখুন"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Description (English)
                  </label>
                  <textarea
                    value={formData.description_en}
                    onChange={(e) => setFormData(prev => ({ ...prev, description_en: e.target.value }))}
                    rows={3}
                    className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    placeholder="Optional description"
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Description (Bengali)
                  </label>
                  <textarea
                    value={formData.description_bn}
                    onChange={(e) => setFormData(prev => ({ ...prev, description_bn: e.target.value }))}
                    rows={3}
                    className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    placeholder="ঐচ্ছিক বিবরণ"
                  />
                </div>
              </div>

              {/* Date/Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Start Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.start_datetime}
                    onChange={(e) => setFormData(prev => ({ ...prev, start_datetime: e.target.value }))}
                    className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    End Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.end_datetime}
                    onChange={(e) => setFormData(prev => ({ ...prev, end_datetime: e.target.value }))}
                    className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                >
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              {/* Options */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Poll Options *
                  </label>
                  <button
                    onClick={addOption}
                    className="text-sm text-green-600 hover:text-green-700 flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Option
                  </button>
                </div>
                <div className="space-y-3">
                  {formData.options.map((option, index) => (
                    <div key={index} className={`p-4 rounded-lg border ${isDark ? 'border-gray-600 bg-gray-700/50' : 'border-gray-200 bg-gray-50'}`}>
                      <div className="flex items-start gap-3">
                        <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium ${isDark ? 'bg-gray-600 text-white' : 'bg-gray-300 text-gray-700'}`}>
                          {index + 1}
                        </span>
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                          <input
                            type="text"
                            value={option.option_en}
                            onChange={(e) => updateOption(index, 'option_en', e.target.value)}
                            placeholder="Option in English"
                            className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                          />
                          <input
                            type="text"
                            value={option.option_bn}
                            onChange={(e) => updateOption(index, 'option_bn', e.target.value)}
                            placeholder="বাংলায় অপশন"
                            className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                          />
                        </div>
                        {formData.options.length > 2 && (
                          <button
                            onClick={() => removeOption(index)}
                            className="flex-shrink-0 p-2 text-red-500 hover:bg-red-500/10 rounded"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Settings */}
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                <h3 className={`font-medium mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Settings</h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.require_verification}
                      onChange={(e) => setFormData(prev => ({ ...prev, require_verification: e.target.checked }))}
                      className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Require phone verification to vote (recommended)
                    </span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.show_results_before_end}
                      onChange={(e) => setFormData(prev => ({ ...prev, show_results_before_end: e.target.checked }))}
                      className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Show results before poll ends
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className={`sticky bottom-0 px-6 py-4 border-t ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={saving}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {saving && (
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  )}
                  {editingPoll ? 'Update Poll' : 'Create Poll'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
