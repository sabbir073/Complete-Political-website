'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/providers/ThemeProvider';

interface Volunteer {
  id: string;
  volunteer_id: string;
  name: string;
  name_bn: string | null;
  phone: string;
  email: string | null;
  age: number;
  thana: string;
  thana_label: { en: string; bn: string };
  ward: string;
  address: string;
  categories: string[];
  categories_with_labels: Array<{ key: string; label: { en: string; bn: string } }>;
  why_sm_jahangir: string;
  status: string;
  badges: Array<{ key: string; name_en: string; name_bn: string; icon: string; color: string; assigned_at?: string }>;
  admin_notes: string | null;
  photo_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface Badge {
  id: string;
  key: string;
  name_en: string;
  name_bn: string;
  description_en: string | null;
  description_bn: string | null;
  icon: string;
  color: string;
}

interface Stats {
  overview: {
    total: number;
    verified: number;
    pending: number;
    suspended: number;
    rejected: number;
    recentRegistrations: number;
  };
  byThana: Array<{ key: string; label: { en: string; bn: string }; total: number; verified: number; pending: number }>;
  byCategory: Array<{ key: string; label: { en: string; bn: string }; count: number }>;
  pendingVolunteers: Array<{
    id: string;
    volunteer_id: string;
    name: string;
    phone: string;
    thana: string;
    thana_label: { en: string; bn: string };
    created_at: string;
  }>;
}

const statusColors: Record<string, { bg: string; text: string }> = {
  pending: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-800 dark:text-yellow-400' },
  verified: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-800 dark:text-green-400' },
  suspended: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-800 dark:text-red-400' },
  rejected: { bg: 'bg-gray-100 dark:bg-gray-900/30', text: 'text-gray-800 dark:text-gray-400' },
};

const thanaList = [
  { key: 'uttara_east', label: 'Uttara East' },
  { key: 'uttara_west', label: 'Uttara West' },
  { key: 'turag', label: 'Turag' },
  { key: 'dakshinkhan', label: 'Dakshinkhan' },
  { key: 'uttarkhan', label: 'Uttarkhan' },
  { key: 'khilkhet', label: 'Khilkhet' },
  { key: 'airport', label: 'Airport' },
  { key: 'vatara', label: 'Vatara' },
];

export default function AdminVolunteerHubPage() {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<'overview' | 'volunteers' | 'badges'>('overview');

  // State
  const [stats, setStats] = useState<Stats | null>(null);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [volunteersLoading, setVolunteersLoading] = useState(false);

  // Filters
  const [filters, setFilters] = useState({
    status: 'all',
    thana: 'all',
    category: 'all',
    search: '',
  });

  // Selected volunteer
  const [selectedVolunteer, setSelectedVolunteer] = useState<Volunteer | null>(null);
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    name_bn: '',
    phone: '',
    age: 0,
    thana: '',
    ward: '',
    address: '',
    admin_notes: '',
    photo_url: '',
  });
  const [photoUploading, setPhotoUploading] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchStats();
    fetchBadges();
  }, []);

  useEffect(() => {
    if (activeTab === 'volunteers') {
      fetchVolunteers();
    }
  }, [activeTab, filters, page]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/volunteer-hub/stats');
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVolunteers = async () => {
    try {
      setVolunteersLoading(true);
      let url = `/api/admin/volunteer-hub/volunteers?page=${page}&limit=20`;
      if (filters.status !== 'all') url += `&status=${filters.status}`;
      if (filters.thana !== 'all') url += `&thana=${filters.thana}`;
      if (filters.category !== 'all') url += `&category=${filters.category}`;
      if (filters.search) url += `&search=${encodeURIComponent(filters.search)}`;

      const response = await fetch(url);
      const data = await response.json();
      if (data.success) {
        setVolunteers(data.volunteers);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Error fetching volunteers:', error);
    } finally {
      setVolunteersLoading(false);
    }
  };

  const fetchBadges = async () => {
    try {
      const response = await fetch('/api/admin/volunteer-hub/badges');
      const data = await response.json();
      if (data.success) {
        setBadges(data.badges);
      }
    } catch (error) {
      console.error('Error fetching badges:', error);
    }
  };

  const updateVolunteer = async (id: string, action: string, data?: Record<string, unknown>) => {
    try {
      const response = await fetch('/api/admin/volunteer-hub/volunteers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action, data }),
      });
      const result = await response.json();
      if (result.success) {
        fetchVolunteers();
        fetchStats();
        if (selectedVolunteer?.id === id) {
          setSelectedVolunteer(result.volunteer);
        }
      } else {
        alert(result.error || 'Failed to update volunteer');
      }
    } catch (error) {
      console.error('Error updating volunteer:', error);
    }
  };

  const deleteVolunteer = async (id: string) => {
    if (!confirm('Are you sure you want to delete this volunteer? This action cannot be undone.')) return;

    try {
      const response = await fetch(`/api/admin/volunteer-hub/volunteers?id=${id}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      if (result.success) {
        fetchVolunteers();
        fetchStats();
        if (selectedVolunteer?.id === id) {
          setSelectedVolunteer(null);
        }
      }
    } catch (error) {
      console.error('Error deleting volunteer:', error);
    }
  };

  const assignBadge = async (badge: Badge) => {
    if (!selectedVolunteer) return;

    await updateVolunteer(selectedVolunteer.id, 'assign_badge', {
      badge: {
        key: badge.key,
        name_en: badge.name_en,
        name_bn: badge.name_bn,
        icon: badge.icon,
        color: badge.color,
      },
    });
    setShowBadgeModal(false);
  };

  const removeBadge = async (badgeKey: string) => {
    if (!selectedVolunteer) return;
    await updateVolunteer(selectedVolunteer.id, 'remove_badge', { badgeKey });
  };

  const openEditModal = () => {
    if (!selectedVolunteer) return;
    setEditForm({
      name: selectedVolunteer.name,
      name_bn: selectedVolunteer.name_bn || '',
      phone: selectedVolunteer.phone,
      age: selectedVolunteer.age,
      thana: selectedVolunteer.thana,
      ward: selectedVolunteer.ward,
      address: selectedVolunteer.address,
      admin_notes: selectedVolunteer.admin_notes || '',
      photo_url: selectedVolunteer.photo_url || '',
    });
    setShowEditModal(true);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Only images are allowed');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    setPhotoUploading(true);

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);

      const res = await fetch('/api/volunteer-hub/upload', {
        method: 'POST',
        body: uploadFormData
      });
      const data = await res.json();

      if (data.success) {
        setEditForm(prev => ({ ...prev, photo_url: data.url }));
      } else {
        alert(data.error || 'Failed to upload photo');
      }
    } catch {
      alert('Failed to upload photo');
    } finally {
      setPhotoUploading(false);
    }
  };

  const saveEdit = async () => {
    if (!selectedVolunteer) return;
    await updateVolunteer(selectedVolunteer.id, 'update', editForm);
    setShowEditModal(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDateShort = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white shadow'}`}>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Volunteers</p>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.overview.total}</p>
          </div>
          <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white shadow'}`}>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Verified</p>
            <p className="text-2xl font-bold text-green-600">{stats.overview.verified}</p>
          </div>
          <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white shadow'}`}>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Pending</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.overview.pending}</p>
          </div>
          <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white shadow'}`}>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Suspended</p>
            <p className="text-2xl font-bold text-red-600">{stats.overview.suspended}</p>
          </div>
          <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white shadow'}`}>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Rejected</p>
            <p className="text-2xl font-bold text-gray-600">{stats.overview.rejected}</p>
          </div>
          <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white shadow'}`}>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Last 7 Days</p>
            <p className="text-2xl font-bold text-blue-600">{stats.overview.recentRegistrations}</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2">
        {(['overview', 'volunteers', 'badges'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2 rounded-lg font-medium transition-colors capitalize ${
              activeTab === tab
                ? 'bg-green-600 text-white'
                : isDark
                  ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  : 'bg-white text-gray-700 hover:bg-gray-100 shadow'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Thana-wise Stats */}
          <div className={`rounded-xl overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-white shadow'}`}>
            <div className={`p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Volunteers by Thana</h2>
            </div>
            <div className="p-4 space-y-3">
              {stats.byThana.map((thana) => (
                <div key={thana.key} className="flex items-center justify-between">
                  <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{thana.label.en}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-green-600 text-sm">{thana.verified} verified</span>
                    <span className="text-yellow-600 text-sm">{thana.pending} pending</span>
                    <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{thana.total}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Category-wise Stats */}
          <div className={`rounded-xl overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-white shadow'}`}>
            <div className={`p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Volunteers by Category</h2>
            </div>
            <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
              {stats.byCategory.map((cat) => (
                <div key={cat.key} className="flex items-center justify-between">
                  <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{cat.label.en}</span>
                  <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{cat.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pending Verification */}
          <div className={`lg:col-span-2 rounded-xl overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-white shadow'}`}>
            <div className={`p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Pending Verification</h2>
            </div>
            {stats.pendingVolunteers.length === 0 ? (
              <div className={`p-8 text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                No pending verifications
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className={isDark ? 'bg-gray-700' : 'bg-gray-50'}>
                    <tr>
                      <th className={`px-4 py-3 text-left text-xs font-medium uppercase ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>ID</th>
                      <th className={`px-4 py-3 text-left text-xs font-medium uppercase ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Name</th>
                      <th className={`px-4 py-3 text-left text-xs font-medium uppercase ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Phone</th>
                      <th className={`px-4 py-3 text-left text-xs font-medium uppercase ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Thana</th>
                      <th className={`px-4 py-3 text-left text-xs font-medium uppercase ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Registered</th>
                      <th className={`px-4 py-3 text-left text-xs font-medium uppercase ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Actions</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                    {stats.pendingVolunteers.map((volunteer) => (
                      <tr key={volunteer.id}>
                        <td className="px-4 py-3">
                          <span className="font-mono text-green-600">{volunteer.volunteer_id}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={isDark ? 'text-white' : 'text-gray-900'}>{volunteer.name}</span>
                        </td>
                        <td className="px-4 py-3">
                          <a href={`tel:${volunteer.phone}`} className="text-blue-500 hover:underline">{volunteer.phone}</a>
                        </td>
                        <td className="px-4 py-3">
                          <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{volunteer.thana_label.en}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{formatDateShort(volunteer.created_at)}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => { setActiveTab('volunteers'); setFilters({ ...filters, search: volunteer.volunteer_id }); }}
                              className="px-2 py-1 rounded bg-blue-600 text-white text-xs hover:bg-blue-700"
                            >
                              View
                            </button>
                            <button
                              onClick={() => updateVolunteer(volunteer.id, 'verify')}
                              className="px-2 py-1 rounded bg-green-600 text-white text-xs hover:bg-green-700"
                            >
                              Verify
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
        </div>
      )}

      {/* Volunteers Tab */}
      {activeTab === 'volunteers' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Volunteers List */}
          <div className={`lg:col-span-2 rounded-xl overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-white shadow'}`}>
            {/* Filters */}
            <div className={`p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex flex-wrap gap-3">
                <select
                  value={filters.status}
                  onChange={(e) => { setFilters({ ...filters, status: e.target.value }); setPage(1); }}
                  className={`px-3 py-2 rounded-lg border text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="verified">Verified</option>
                  <option value="suspended">Suspended</option>
                  <option value="rejected">Rejected</option>
                </select>
                <select
                  value={filters.thana}
                  onChange={(e) => { setFilters({ ...filters, thana: e.target.value }); setPage(1); }}
                  className={`px-3 py-2 rounded-lg border text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                >
                  <option value="all">All Thanas</option>
                  {thanaList.map((t) => (
                    <option key={t.key} value={t.key}>{t.label}</option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Search ID, name, phone..."
                  value={filters.search}
                  onChange={(e) => { setFilters({ ...filters, search: e.target.value }); setPage(1); }}
                  className={`px-3 py-2 rounded-lg border text-sm flex-1 min-w-[200px] ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              {volunteersLoading ? (
                <div className="flex justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                </div>
              ) : volunteers.length === 0 ? (
                <div className={`p-8 text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  No volunteers found
                </div>
              ) : (
                <table className="w-full">
                  <thead className={isDark ? 'bg-gray-700' : 'bg-gray-50'}>
                    <tr>
                      <th className={`px-4 py-3 text-left text-xs font-medium uppercase ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Volunteer</th>
                      <th className={`px-4 py-3 text-left text-xs font-medium uppercase ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Location</th>
                      <th className={`px-4 py-3 text-left text-xs font-medium uppercase ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Status</th>
                      <th className={`px-4 py-3 text-left text-xs font-medium uppercase ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Actions</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                    {volunteers.map((volunteer) => (
                      <tr
                        key={volunteer.id}
                        onClick={() => setSelectedVolunteer(volunteer)}
                        className={`cursor-pointer transition-colors ${
                          selectedVolunteer?.id === volunteer.id
                            ? isDark ? 'bg-gray-700' : 'bg-green-50'
                            : isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                        }`}
                      >
                        <td className="px-4 py-3">
                          <div>
                            <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{volunteer.name}</p>
                            <p className="text-sm text-green-600 font-mono">{volunteer.volunteer_id}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <p className={isDark ? 'text-gray-300' : 'text-gray-700'}>{volunteer.thana_label.en}</p>
                            <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Ward {volunteer.ward}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[volunteer.status]?.bg} ${statusColors[volunteer.status]?.text}`}>
                            {volunteer.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            {volunteer.status === 'pending' && (
                              <button
                                onClick={(e) => { e.stopPropagation(); updateVolunteer(volunteer.id, 'verify'); }}
                                className="px-2 py-1 rounded bg-green-600 text-white text-xs hover:bg-green-700"
                              >
                                Verify
                              </button>
                            )}
                            <button
                              onClick={(e) => { e.stopPropagation(); deleteVolunteer(volunteer.id); }}
                              className="px-2 py-1 rounded bg-red-600 text-white text-xs hover:bg-red-700"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className={`p-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'} flex justify-center gap-2`}>
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className={`px-3 py-1 rounded ${page === 1 ? 'opacity-50 cursor-not-allowed' : ''} ${isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-700'}`}
                >
                  Previous
                </button>
                <span className={`px-3 py-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className={`px-3 py-1 rounded ${page === totalPages ? 'opacity-50 cursor-not-allowed' : ''} ${isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-700'}`}
                >
                  Next
                </button>
              </div>
            )}
          </div>

          {/* Volunteer Details */}
          <div className={`rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white shadow'}`}>
            <div className={`p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Volunteer Details</h2>
            </div>
            {selectedVolunteer ? (
              <div className="p-4 space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto">
                {/* Photo & Volunteer ID */}
                <div className="text-center">
                  {selectedVolunteer.photo_url && (
                    <div className="w-20 h-20 mx-auto mb-3 rounded-full overflow-hidden border-3 border-green-500">
                      <img
                        src={selectedVolunteer.photo_url}
                        alt={selectedVolunteer.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <span className="inline-block px-4 py-2 rounded-full bg-gradient-to-r from-green-500 to-green-600 text-white text-xl font-bold font-mono">
                    {selectedVolunteer.volunteer_id}
                  </span>
                </div>

                {/* Basic Info */}
                <div>
                  <label className={`text-xs font-medium uppercase ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Name</label>
                  <p className={isDark ? 'text-white' : 'text-gray-900'}>{selectedVolunteer.name}</p>
                  {selectedVolunteer.name_bn && (
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{selectedVolunteer.name_bn}</p>
                  )}
                </div>

                <div>
                  <label className={`text-xs font-medium uppercase ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Phone</label>
                  <a href={`tel:${selectedVolunteer.phone}`} className="block text-blue-500 hover:underline">
                    {selectedVolunteer.phone}
                  </a>
                </div>

                {selectedVolunteer.email && (
                  <div>
                    <label className={`text-xs font-medium uppercase ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Email</label>
                    <p className={isDark ? 'text-white' : 'text-gray-900'}>{selectedVolunteer.email}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`text-xs font-medium uppercase ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Age</label>
                    <p className={isDark ? 'text-white' : 'text-gray-900'}>{selectedVolunteer.age}</p>
                  </div>
                  <div>
                    <label className={`text-xs font-medium uppercase ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Ward</label>
                    <p className={isDark ? 'text-white' : 'text-gray-900'}>{selectedVolunteer.ward}</p>
                  </div>
                </div>

                <div>
                  <label className={`text-xs font-medium uppercase ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Thana</label>
                  <p className={isDark ? 'text-white' : 'text-gray-900'}>{selectedVolunteer.thana_label.en}</p>
                </div>

                <div>
                  <label className={`text-xs font-medium uppercase ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Address</label>
                  <p className={isDark ? 'text-white' : 'text-gray-900'}>{selectedVolunteer.address}</p>
                </div>

                {/* Categories */}
                <div>
                  <label className={`text-xs font-medium uppercase ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Categories</label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedVolunteer.categories_with_labels.map((cat) => (
                      <span
                        key={cat.key}
                        className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded text-xs"
                      >
                        {cat.label.en}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Why SM Jahangir */}
                <div>
                  <label className={`text-xs font-medium uppercase ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Why SM Jahangir?</label>
                  <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{selectedVolunteer.why_sm_jahangir}</p>
                </div>

                {/* Badges */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className={`text-xs font-medium uppercase ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Badges</label>
                    <button
                      onClick={() => setShowBadgeModal(true)}
                      className="text-xs text-green-600 hover:text-green-700"
                    >
                      + Add Badge
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {selectedVolunteer.badges.length === 0 ? (
                      <span className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>No badges</span>
                    ) : (
                      selectedVolunteer.badges.map((badge) => (
                        <span
                          key={badge.key}
                          className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded text-xs group"
                        >
                          <span>{badge.icon}</span>
                          <span>{badge.name_en}</span>
                          <button
                            onClick={() => removeBadge(badge.key)}
                            className="ml-1 text-red-500 opacity-0 group-hover:opacity-100"
                          >
                            ×
                          </button>
                        </span>
                      ))
                    )}
                  </div>
                </div>

                {/* Registration Date */}
                <div>
                  <label className={`text-xs font-medium uppercase ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Registered</label>
                  <p className={isDark ? 'text-white' : 'text-gray-900'}>{formatDate(selectedVolunteer.created_at)}</p>
                </div>

                {/* Status Actions */}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <label className={`text-xs font-medium uppercase ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Actions</label>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {selectedVolunteer.status === 'pending' && (
                      <>
                        <button
                          onClick={() => updateVolunteer(selectedVolunteer.id, 'verify')}
                          className="px-3 py-2 rounded-lg bg-green-600 text-white text-sm hover:bg-green-700"
                        >
                          Verify
                        </button>
                        <button
                          onClick={() => updateVolunteer(selectedVolunteer.id, 'reject')}
                          className="px-3 py-2 rounded-lg bg-gray-600 text-white text-sm hover:bg-gray-700"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {selectedVolunteer.status === 'verified' && (
                      <button
                        onClick={() => updateVolunteer(selectedVolunteer.id, 'suspend')}
                        className="px-3 py-2 rounded-lg bg-red-600 text-white text-sm hover:bg-red-700"
                      >
                        Suspend
                      </button>
                    )}
                    {(selectedVolunteer.status === 'suspended' || selectedVolunteer.status === 'rejected') && (
                      <button
                        onClick={() => updateVolunteer(selectedVolunteer.id, 'reactivate')}
                        className="px-3 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700"
                      >
                        Reactivate
                      </button>
                    )}
                    <button
                      onClick={openEditModal}
                      className="px-3 py-2 rounded-lg bg-purple-600 text-white text-sm hover:bg-purple-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteVolunteer(selectedVolunteer.id)}
                      className="px-3 py-2 rounded-lg bg-red-600 text-white text-sm hover:bg-red-700"
                    >
                      Delete
                    </button>
                    <a
                      href={`/volunteer-hub/profile/${selectedVolunteer.volunteer_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700 text-center"
                    >
                      View Profile
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              <div className={`p-8 text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Select a volunteer to view details
              </div>
            )}
          </div>
        </div>
      )}

      {/* Badges Tab */}
      {activeTab === 'badges' && (
        <div className={`rounded-xl overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-white shadow'}`}>
          <div className={`p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Available Badges</h2>
          </div>
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {badges.map((badge) => (
              <div
                key={badge.id}
                className={`p-4 rounded-lg border ${isDark ? 'border-gray-700 bg-gray-700/50' : 'border-gray-200 bg-gray-50'}`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{badge.icon}</span>
                  <div>
                    <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{badge.name_en}</p>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{badge.name_bn}</p>
                  </div>
                </div>
                {badge.description_en && (
                  <p className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{badge.description_en}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Badge Assignment Modal */}
      {showBadgeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className={`w-full max-w-md rounded-xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Assign Badge</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {badges.map((badge) => {
                const isAssigned = selectedVolunteer?.badges.some(b => b.key === badge.key);
                return (
                  <button
                    key={badge.id}
                    onClick={() => !isAssigned && assignBadge(badge)}
                    disabled={isAssigned}
                    className={`w-full p-3 rounded-lg border text-left flex items-center gap-3 transition-colors ${
                      isAssigned
                        ? 'opacity-50 cursor-not-allowed border-gray-300 dark:border-gray-600'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-600'
                    }`}
                  >
                    <span className="text-2xl">{badge.icon}</span>
                    <div>
                      <p className={isDark ? 'text-white' : 'text-gray-900'}>{badge.name_en}</p>
                      <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {isAssigned ? 'Already assigned' : badge.name_bn}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setShowBadgeModal(false)}
              className={`mt-4 w-full py-2 rounded-lg ${isDark ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedVolunteer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-lg rounded-xl p-6 max-h-[90vh] overflow-y-auto ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Edit Volunteer - {selectedVolunteer.volunteer_id}
            </h3>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Name (English)</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Name (Bengali)</label>
                <input
                  type="text"
                  value={editForm.name_bn}
                  onChange={(e) => setEditForm({ ...editForm, name_bn: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Phone</label>
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Age</label>
                  <input
                    type="number"
                    value={editForm.age}
                    onChange={(e) => setEditForm({ ...editForm, age: parseInt(e.target.value) || 0 })}
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Ward</label>
                  <input
                    type="text"
                    value={editForm.ward}
                    onChange={(e) => setEditForm({ ...editForm, ward: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Thana</label>
                <select
                  value={editForm.thana}
                  onChange={(e) => setEditForm({ ...editForm, thana: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                >
                  {thanaList.map((t) => (
                    <option key={t.key} value={t.key}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Address</label>
                <textarea
                  value={editForm.address}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  rows={2}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Photo</label>
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-full overflow-hidden border-2 flex-shrink-0 ${
                    isDark ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-gray-100'
                  }`}>
                    {editForm.photo_url ? (
                      <img src={editForm.photo_url} alt="Photo" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-2xl">👤</span>
                      </div>
                    )}
                  </div>
                  <label className={`cursor-pointer inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm ${
                    isDark ? 'border-gray-600 bg-gray-700 text-gray-300' : 'border-gray-300 bg-white text-gray-700'
                  } ${photoUploading ? 'opacity-50' : ''}`}>
                    {photoUploading ? 'Uploading...' : 'Change Photo'}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      disabled={photoUploading}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Admin Notes</label>
                <textarea
                  value={editForm.admin_notes}
                  onChange={(e) => setEditForm({ ...editForm, admin_notes: e.target.value })}
                  rows={2}
                  placeholder="Internal notes (not visible to volunteer)"
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={saveEdit}
                className="flex-1 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
              >
                Save Changes
              </button>
              <button
                onClick={() => setShowEditModal(false)}
                className={`flex-1 py-2 rounded-lg ${isDark ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-700'}`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
