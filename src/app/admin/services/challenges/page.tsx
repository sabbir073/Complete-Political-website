'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/providers/ThemeProvider';
import { useSweetAlert } from '@/hooks/useSweetAlert';
import { format } from 'date-fns';
import Link from 'next/link';
import MediaPicker from '@/components/admin/settings/MediaPicker';

interface Challenge {
  id: string;
  title_en: string;
  title_bn: string;
  description_en?: string;
  description_bn?: string;
  rules_en?: string;
  rules_bn?: string;
  cover_image?: string;
  start_date: string;
  end_date: string;
  status: string;
  computed_status?: string;
  created_at: string;
}

interface Winner {
  id: string;
  challenge_id: string;
  rank: number;
  name: string;
  image?: string;
}

const emptyForm = {
  title_en: '',
  title_bn: '',
  description_en: '',
  description_bn: '',
  rules_en: '',
  rules_bn: '',
  cover_image: '',
  start_date: '',
  end_date: '',
  status: 'draft',
};

const RANK_LABELS: Record<number, { label: string; medal: string; color: string }> = {
  1: { label: '1st Place', medal: '🥇', color: 'text-yellow-500' },
  2: { label: '2nd Place', medal: '🥈', color: 'text-gray-400' },
  3: { label: '3rd Place', medal: '🥉', color: 'text-amber-600' },
};

export default function AdminChallengesPage() {
  const { isDark } = useTheme();
  const { showDeleteConfirm, showSuccess, showError } = useSweetAlert();

  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState<Challenge | null>(null);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [formData, setFormData] = useState(emptyForm);

  // Winners modal state
  const [showWinnersModal, setShowWinnersModal] = useState(false);
  const [winnersChallenge, setWinnersChallenge] = useState<Challenge | null>(null);
  const [winners, setWinners] = useState<Winner[]>([]);
  const [winnersLoading, setWinnersLoading] = useState(false);
  const [addingWinner, setAddingWinner] = useState(false);
  const [newWinner, setNewWinner] = useState({ rank: 1, name: '', image: '' });

  useEffect(() => { fetchChallenges(); }, [filter, search]);

  const fetchChallenges = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter !== 'all') params.append('status', filter);
      if (search) params.append('search', search);
      const response = await fetch(`/api/admin/challenges?${params}`);
      const data = await response.json();
      if (data.success) setChallenges(data.data || []);
      else showError('Error', data.error || 'Failed to fetch challenges');
    } catch {
      showError('Error', 'Failed to fetch challenges');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingChallenge(null);
    setFormData(emptyForm);
    setShowModal(true);
  };

  const openEditModal = (challenge: Challenge) => {
    setEditingChallenge(challenge);
    setFormData({
      title_en: challenge.title_en,
      title_bn: challenge.title_bn,
      description_en: challenge.description_en || '',
      description_bn: challenge.description_bn || '',
      rules_en: challenge.rules_en || '',
      rules_bn: challenge.rules_bn || '',
      cover_image: challenge.cover_image || '',
      start_date: challenge.start_date ? format(new Date(challenge.start_date), "yyyy-MM-dd'T'HH:mm") : '',
      end_date: challenge.end_date ? format(new Date(challenge.end_date), "yyyy-MM-dd'T'HH:mm") : '',
      status: challenge.status,
    });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!formData.title_en || !formData.title_bn) {
      showError('Validation Error', 'Title is required in both languages');
      return;
    }
    if (!formData.start_date || !formData.end_date) {
      showError('Validation Error', 'Start and end date are required');
      return;
    }

    setSaving(true);
    try {
      const url = editingChallenge ? `/api/admin/challenges/${editingChallenge.id}` : '/api/admin/challenges';
      const method = editingChallenge ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          start_date: new Date(formData.start_date).toISOString(),
          end_date: new Date(formData.end_date).toISOString(),
        }),
      });
      const data = await response.json();
      if (data.success) {
        showSuccess('Success', editingChallenge ? 'Challenge updated!' : 'Challenge created!');
        setShowModal(false);
        fetchChallenges();
      } else {
        showError('Error', data.error || 'Failed to save');
      }
    } catch {
      showError('Error', 'Failed to save challenge');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (challenge: Challenge) => {
    const result = await showDeleteConfirm(challenge.title_en);
    if (!result.isConfirmed) return;
    try {
      const response = await fetch(`/api/admin/challenges/${challenge.id}`, { method: 'DELETE' });
      const data = await response.json();
      if (data.success) {
        showSuccess('Deleted', 'Challenge deleted successfully');
        fetchChallenges();
      } else {
        showError('Error', data.error || 'Failed to delete');
      }
    } catch {
      showError('Error', 'Failed to delete challenge');
    }
  };

  // Winners management
  const openWinnersModal = async (challenge: Challenge) => {
    setWinnersChallenge(challenge);
    setNewWinner({ rank: 1, name: '', image: '' });
    setShowWinnersModal(true);
    await fetchWinners(challenge.id);
  };

  const fetchWinners = async (challengeId: string) => {
    try {
      setWinnersLoading(true);
      const res = await fetch(`/api/admin/challenges/winners?challenge_id=${challengeId}`);
      const data = await res.json();
      if (data.success) {
        const fetched = data.data || [];
        setWinners(fetched);
        // Pre-fill form with rank 1 data if it exists
        const rank1 = fetched.find((w: Winner) => w.rank === 1);
        if (rank1) setNewWinner({ rank: 1, name: rank1.name, image: rank1.image || '' });
      }
    } catch {
      showError('Error', 'Failed to fetch winners');
    } finally {
      setWinnersLoading(false);
    }
  };

  const handleAddWinner = async () => {
    if (!winnersChallenge) return;
    if (!newWinner.name.trim()) {
      showError('Validation', 'Winner name is required');
      return;
    }
    setAddingWinner(true);
    try {
      const res = await fetch('/api/admin/challenges/winners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challenge_id: winnersChallenge.id,
          rank: newWinner.rank,
          name: newWinner.name,
          image: newWinner.image || null,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showSuccess('Saved', 'Winner saved successfully');
        setNewWinner({ rank: 1, name: '', image: '' });
        fetchWinners(winnersChallenge.id);
      } else {
        showError('Error', data.error || 'Failed to save winner');
      }
    } catch {
      showError('Error', 'Failed to save winner');
    } finally {
      setAddingWinner(false);
    }
  };

  const handleDeleteWinner = async (winnerId: string) => {
    if (!winnersChallenge) return;
    const result = await showDeleteConfirm('this winner');
    if (!result.isConfirmed) return;
    try {
      const res = await fetch(`/api/admin/challenges/winners?id=${winnerId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showSuccess('Removed', 'Winner removed');
        fetchWinners(winnersChallenge.id);
      } else {
        showError('Error', data.error || 'Failed to remove winner');
      }
    } catch {
      showError('Error', 'Failed to remove winner');
    }
  };

  const getStatusBadge = (challenge: Challenge) => {
    const status = challenge.computed_status || challenge.status;
    const map: Record<string, { bg: string; label: string }> = {
      draft: { bg: 'bg-gray-500', label: 'Draft' },
      upcoming: { bg: 'bg-blue-500', label: 'Upcoming' },
      active: { bg: 'bg-green-500', label: 'Active' },
      ended: { bg: 'bg-orange-500', label: 'Ended' },
      archived: { bg: 'bg-gray-400', label: 'Archived' },
    };
    const badge = map[status] || map.draft;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${badge.bg}`}>
        {badge.label}
      </span>
    );
  };

  // Get used ranks so we can show which are already assigned
  const usedRanks = winners.map(w => w.rank);
  const availableRanks = Array.from({ length: 10 }, (_, i) => i + 1);

  const inputClass = `w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'}`;
  const labelClass = `block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Challenges</h1>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Create and manage public challenges
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/services/challenges/submissions"
            className={`px-4 py-2 rounded-lg border flex items-center gap-2 text-sm font-medium ${isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            View Submissions
          </Link>
          <button
            onClick={openCreateModal}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Challenge
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow`}>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search challenges..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={inputClass}
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className={`px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="ended">Ended</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className={`rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow overflow-hidden`}>
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
          </div>
        ) : challenges.length === 0 ? (
          <div className="p-8 text-center">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
            <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>No challenges found</p>
            <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Create your first challenge to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={isDark ? 'bg-gray-700' : 'bg-gray-50'}>
                <tr>
                  {['Challenge', 'Status', 'Duration', 'Actions'].map(h => (
                    <th key={h} className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'} ${h === 'Actions' ? 'text-right' : ''}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {challenges.map((challenge) => (
                  <tr key={challenge.id} className={isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                    <td className="px-6 py-4">
                      <div>
                        <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{challenge.title_en}</p>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{challenge.title_bn}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(challenge)}</td>
                    <td className="px-6 py-4">
                      <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        <p>{format(new Date(challenge.start_date), 'MMM d, yyyy')}</p>
                        <p className="text-xs">to {format(new Date(challenge.end_date), 'MMM d, yyyy')}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {/* Winners button */}
                      <button
                        onClick={() => openWinnersModal(challenge)}
                        className="text-yellow-500 hover:text-yellow-600 inline-block"
                        title="Manage Winners"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </button>
                      <Link
                        href={`/admin/services/challenges/submissions?challenge_id=${challenge.id}`}
                        className="text-green-500 hover:text-green-600 inline-block"
                        title="View Submissions"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </Link>
                      <button onClick={() => openEditModal(challenge)} className="text-blue-500 hover:text-blue-600" title="Edit">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button onClick={() => handleDelete(challenge)} className="text-red-500 hover:text-red-600" title="Delete">
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
                  {editingChallenge ? 'Edit Challenge' : 'Create New Challenge'}
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
                  <label className={labelClass}>Title (English) *</label>
                  <input type="text" value={formData.title_en} onChange={(e) => setFormData(p => ({ ...p, title_en: e.target.value }))} className={inputClass} placeholder="Challenge title in English" />
                </div>
                <div>
                  <label className={labelClass}>Title (Bengali) *</label>
                  <input type="text" value={formData.title_bn} onChange={(e) => setFormData(p => ({ ...p, title_bn: e.target.value }))} className={inputClass} placeholder="বাংলায় শিরোনাম" />
                </div>
              </div>

              {/* Description */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Description (English)</label>
                  <textarea rows={3} value={formData.description_en} onChange={(e) => setFormData(p => ({ ...p, description_en: e.target.value }))} className={inputClass} placeholder="Challenge description" />
                </div>
                <div>
                  <label className={labelClass}>Description (Bengali)</label>
                  <textarea rows={3} value={formData.description_bn} onChange={(e) => setFormData(p => ({ ...p, description_bn: e.target.value }))} className={inputClass} placeholder="চ্যালেঞ্জের বিবরণ" />
                </div>
              </div>

              {/* Rules */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Rules (English)</label>
                  <textarea rows={4} value={formData.rules_en} onChange={(e) => setFormData(p => ({ ...p, rules_en: e.target.value }))} className={inputClass} placeholder="Challenge rules and guidelines" />
                </div>
                <div>
                  <label className={labelClass}>Rules (Bengali)</label>
                  <textarea rows={4} value={formData.rules_bn} onChange={(e) => setFormData(p => ({ ...p, rules_bn: e.target.value }))} className={inputClass} placeholder="চ্যালেঞ্জের নিয়মাবলী" />
                </div>
              </div>

              {/* Cover Image */}
              <div>
                <MediaPicker
                  value={formData.cover_image}
                  onChange={(url) => setFormData(p => ({ ...p, cover_image: url }))}
                  label="Cover Image"
                  description="Choose a cover image from the media library"
                  fileType="image"
                />
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Start Date & Time *</label>
                  <input type="datetime-local" value={formData.start_date} onChange={(e) => setFormData(p => ({ ...p, start_date: e.target.value }))} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>End Date & Time *</label>
                  <input type="datetime-local" value={formData.end_date} onChange={(e) => setFormData(p => ({ ...p, end_date: e.target.value }))} className={inputClass} />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className={labelClass}>Status</label>
                <select value={formData.status} onChange={(e) => setFormData(p => ({ ...p, status: e.target.value }))} className={inputClass}>
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="ended">Ended</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>

            {/* Modal Footer */}
            <div className={`sticky bottom-0 px-6 py-4 border-t ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <div className="flex justify-end gap-3">
                <button onClick={() => setShowModal(false)} className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
                  Cancel
                </button>
                <button onClick={handleSubmit} disabled={saving} className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2">
                  {saving && <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>}
                  {editingChallenge ? 'Update Challenge' : 'Create Challenge'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Winners Management Modal */}
      {showWinnersModal && winnersChallenge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowWinnersModal(false)} />
          <div className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            {/* Modal Header */}
            <div className={`sticky top-0 z-10 px-6 py-4 border-b ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <div className="flex justify-between items-center">
                <div>
                  <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Manage Winners
                  </h2>
                  <p className={`text-sm mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {winnersChallenge.title_en}
                  </p>
                </div>
                <button onClick={() => setShowWinnersModal(false)} className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Add Winner Form */}
              <div className={`p-4 rounded-xl border-2 border-dashed ${isDark ? 'border-gray-600 bg-gray-700/30' : 'border-gray-200 bg-gray-50'}`}>
                <h3 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Add / Update Winner</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                  {/* Rank */}
                  <div>
                    <label className={labelClass}>Rank</label>
                    <select
                      value={newWinner.rank}
                      onChange={(e) => {
                        const rank = parseInt(e.target.value);
                        const existing = winners.find(w => w.rank === rank);
                        setNewWinner({ rank, name: existing?.name || '', image: existing?.image || '' });
                      }}
                      className={inputClass}
                    >
                      {availableRanks.map(r => (
                        <option key={r} value={r}>
                          {r === 1 ? '🥇 1st' : r === 2 ? '🥈 2nd' : r === 3 ? '🥉 3rd' : `#${r}`}
                          {usedRanks.includes(r) ? ' (update)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                  {/* Name */}
                  <div className="sm:col-span-2">
                    <label className={labelClass}>Winner Name *</label>
                    <input
                      type="text"
                      value={newWinner.name}
                      onChange={(e) => setNewWinner(p => ({ ...p, name: e.target.value }))}
                      placeholder="Enter winner's name"
                      className={inputClass}
                    />
                  </div>
                </div>
                {/* Image */}
                <div className="mb-4">
                  <MediaPicker
                    value={newWinner.image}
                    onChange={(url) => setNewWinner(p => ({ ...p, image: url }))}
                    label="Winner Photo (optional)"
                    description="Select a photo for this winner"
                    fileType="image"
                  />
                </div>
                <button
                  onClick={handleAddWinner}
                  disabled={addingWinner || !newWinner.name.trim()}
                  className="w-full py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium flex items-center justify-center gap-2"
                >
                  {addingWinner ? (
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  )}
                  {usedRanks.includes(newWinner.rank) ? 'Update Winner' : 'Add Winner'}
                </button>
              </div>

              {/* Winners List */}
              <div>
                <h3 className={`font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Current Winners ({winners.length})
                </h3>
                {winnersLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500" />
                  </div>
                ) : winners.length === 0 ? (
                  <div className={`text-center py-8 rounded-xl ${isDark ? 'bg-gray-700/30' : 'bg-gray-50'}`}>
                    <svg className="w-12 h-12 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>No winners added yet</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {winners.map((winner) => {
                      const rankInfo = RANK_LABELS[winner.rank];
                      return (
                        <div key={winner.id} className={`flex items-center gap-3 p-3 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                          {/* Rank */}
                          <div className="w-10 text-center flex-shrink-0">
                            {rankInfo ? (
                              <span className="text-2xl">{rankInfo.medal}</span>
                            ) : (
                              <span className={`text-lg font-bold ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>#{winner.rank}</span>
                            )}
                          </div>
                          {/* Image */}
                          <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-gray-200 dark:bg-gray-600">
                            {winner.image ? (
                              <img src={winner.image} alt={winner.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                              </div>
                            )}
                          </div>
                          {/* Name */}
                          <div className="flex-1">
                            <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{winner.name}</p>
                            <p className={`text-xs ${rankInfo ? rankInfo.color : isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                              {rankInfo ? rankInfo.label : `Rank #${winner.rank}`}
                            </p>
                          </div>
                          {/* Delete */}
                          <button
                            onClick={() => handleDeleteWinner(winner.id)}
                            className="text-red-500 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                            title="Remove winner"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className={`sticky bottom-0 px-6 py-4 border-t ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <div className="flex justify-end">
                <button
                  onClick={() => setShowWinnersModal(false)}
                  className={`px-6 py-2 rounded-lg font-medium ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
