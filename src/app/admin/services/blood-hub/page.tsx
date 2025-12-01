'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/providers/ThemeProvider';

interface BloodDonor {
    id: string;
    name: string;
    phone: string;
    email: string | null;
    blood_group: string;
    date_of_birth: string | null;
    gender: string | null;
    weight: number | null;
    address: string | null;
    ward: string | null;
    area: string | null;
    last_donation_date: string | null;
    is_available: boolean;
    is_verified: boolean;
    total_donations: number;
    medical_conditions: string | null;
    created_at: string;
}

interface BloodRequest {
    id: string;
    contact_person: string;
    contact_phone: string;
    contact_email: string | null;
    patient_name: string | null;
    blood_group: string;
    units_needed: number;
    hospital_name: string;
    hospital_address: string | null;
    ward: string | null;
    needed_by: string;
    urgency: string;
    reason: string | null;
    status: string;
    admin_notes: string | null;
    created_at: string;
}

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const statusColors: Record<string, { bg: string; text: string }> = {
    pending: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-800 dark:text-yellow-400' },
    in_progress: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-800 dark:text-blue-400' },
    fulfilled: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-800 dark:text-green-400' },
    cancelled: { bg: 'bg-gray-100 dark:bg-gray-900/30', text: 'text-gray-800 dark:text-gray-400' },
    expired: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-800 dark:text-red-400' },
};

const urgencyColors: Record<string, { bg: string; text: string }> = {
    emergency: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-800 dark:text-red-400' },
    urgent: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-800 dark:text-orange-400' },
    normal: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-800 dark:text-green-400' },
};

export default function AdminBloodHubPage() {
    const { isDark } = useTheme();
    const [activeTab, setActiveTab] = useState<'donors' | 'requests'>('donors');

    // Donors state
    const [donors, setDonors] = useState<BloodDonor[]>([]);
    const [donorsLoading, setDonorsLoading] = useState(true);
    const [donorFilter, setDonorFilter] = useState({ bloodGroup: 'all', verified: 'all', available: 'all', search: '' });
    const [selectedDonor, setSelectedDonor] = useState<BloodDonor | null>(null);

    // Requests state
    const [requests, setRequests] = useState<BloodRequest[]>([]);
    const [requestsLoading, setRequestsLoading] = useState(true);
    const [requestFilter, setRequestFilter] = useState({ bloodGroup: 'all', status: 'all', urgency: 'all', search: '' });
    const [selectedRequest, setSelectedRequest] = useState<BloodRequest | null>(null);
    const [adminNotes, setAdminNotes] = useState('');

    // Stats
    const [stats, setStats] = useState({
        totalDonors: 0,
        verifiedDonors: 0,
        pendingVerification: 0,
        totalRequests: 0,
        pendingRequests: 0,
        fulfilledRequests: 0,
    });

    useEffect(() => {
        fetchDonors();
        fetchRequests();
        fetchStats();
    }, []);

    useEffect(() => {
        fetchDonors();
    }, [donorFilter]);

    useEffect(() => {
        fetchRequests();
    }, [requestFilter]);

    const fetchStats = async () => {
        try {
            const response = await fetch('/api/blood-hub/requests?stats=true');
            const data = await response.json();
            if (data.success) {
                setStats({
                    totalDonors: data.stats.donors.total,
                    verifiedDonors: data.stats.donors.available,
                    pendingVerification: data.stats.donors.total - data.stats.donors.available,
                    totalRequests: data.stats.requests.total,
                    pendingRequests: data.stats.requests.pending,
                    fulfilledRequests: data.stats.requests.fulfilled,
                });
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const fetchDonors = async () => {
        setDonorsLoading(true);
        try {
            let url = '/api/admin/blood-hub/donors?limit=100';
            if (donorFilter.bloodGroup !== 'all') url += `&blood_group=${donorFilter.bloodGroup}`;
            if (donorFilter.verified !== 'all') url += `&is_verified=${donorFilter.verified}`;
            if (donorFilter.available !== 'all') url += `&is_available=${donorFilter.available}`;
            if (donorFilter.search) url += `&search=${encodeURIComponent(donorFilter.search)}`;

            const response = await fetch(url);
            const data = await response.json();
            if (data.success) {
                setDonors(data.data);
            }
        } catch (error) {
            console.error('Error fetching donors:', error);
        } finally {
            setDonorsLoading(false);
        }
    };

    const fetchRequests = async () => {
        setRequestsLoading(true);
        try {
            let url = '/api/admin/blood-hub/requests?limit=100';
            if (requestFilter.bloodGroup !== 'all') url += `&blood_group=${requestFilter.bloodGroup}`;
            if (requestFilter.status !== 'all') url += `&status=${requestFilter.status}`;
            if (requestFilter.urgency !== 'all') url += `&urgency=${requestFilter.urgency}`;
            if (requestFilter.search) url += `&search=${encodeURIComponent(requestFilter.search)}`;

            const response = await fetch(url);
            const data = await response.json();
            if (data.success) {
                setRequests(data.data);
            }
        } catch (error) {
            console.error('Error fetching requests:', error);
        } finally {
            setRequestsLoading(false);
        }
    };

    const updateDonor = async (id: string, updates: Partial<BloodDonor>) => {
        try {
            const response = await fetch('/api/admin/blood-hub/donors', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, ...updates }),
            });
            const data = await response.json();
            if (data.success) {
                fetchDonors();
                fetchStats();
                if (selectedDonor?.id === id) {
                    setSelectedDonor({ ...selectedDonor, ...updates });
                }
            }
        } catch (error) {
            console.error('Error updating donor:', error);
        }
    };

    const deleteDonor = async (id: string) => {
        if (!confirm('Are you sure you want to delete this donor?')) return;
        try {
            const response = await fetch(`/api/admin/blood-hub/donors?id=${id}`, {
                method: 'DELETE',
            });
            const data = await response.json();
            if (data.success) {
                fetchDonors();
                fetchStats();
                if (selectedDonor?.id === id) {
                    setSelectedDonor(null);
                }
            }
        } catch (error) {
            console.error('Error deleting donor:', error);
        }
    };

    const updateRequest = async (id: string, updates: Partial<BloodRequest>) => {
        try {
            const response = await fetch('/api/admin/blood-hub/requests', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, ...updates }),
            });
            const data = await response.json();
            if (data.success) {
                fetchRequests();
                fetchStats();
                if (selectedRequest?.id === id) {
                    setSelectedRequest({ ...selectedRequest, ...updates });
                }
            }
        } catch (error) {
            console.error('Error updating request:', error);
        }
    };

    const deleteRequest = async (id: string) => {
        if (!confirm('Are you sure you want to delete this request?')) return;
        try {
            const response = await fetch(`/api/admin/blood-hub/requests?id=${id}`, {
                method: 'DELETE',
            });
            const data = await response.json();
            if (data.success) {
                fetchRequests();
                fetchStats();
                if (selectedRequest?.id === id) {
                    setSelectedRequest(null);
                }
            }
        } catch (error) {
            console.error('Error deleting request:', error);
        }
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

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white shadow'}`}>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Donors</p>
                    <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.totalDonors}</p>
                </div>
                <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white shadow'}`}>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Verified Donors</p>
                    <p className="text-2xl font-bold text-green-600">{stats.verifiedDonors}</p>
                </div>
                <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white shadow'}`}>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Pending Verification</p>
                    <p className="text-2xl font-bold text-yellow-600">{stats.pendingVerification}</p>
                </div>
                <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white shadow'}`}>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Requests</p>
                    <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.totalRequests}</p>
                </div>
                <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white shadow'}`}>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Pending Requests</p>
                    <p className="text-2xl font-bold text-orange-600">{stats.pendingRequests}</p>
                </div>
                <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white shadow'}`}>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Fulfilled</p>
                    <p className="text-2xl font-bold text-green-600">{stats.fulfilledRequests}</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2">
                <button
                    onClick={() => setActiveTab('donors')}
                    className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                        activeTab === 'donors'
                            ? 'bg-red-600 text-white'
                            : isDark
                                ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                : 'bg-white text-gray-700 hover:bg-gray-100 shadow'
                    }`}
                >
                    Donors
                </button>
                <button
                    onClick={() => setActiveTab('requests')}
                    className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                        activeTab === 'requests'
                            ? 'bg-red-600 text-white'
                            : isDark
                                ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                : 'bg-white text-gray-700 hover:bg-gray-100 shadow'
                    }`}
                >
                    Requests
                </button>
            </div>

            {/* Donors Tab */}
            {activeTab === 'donors' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Donors List */}
                    <div className={`lg:col-span-2 rounded-xl overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-white shadow'}`}>
                        {/* Filters */}
                        <div className={`p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                            <div className="flex flex-wrap gap-3">
                                <select
                                    value={donorFilter.bloodGroup}
                                    onChange={(e) => setDonorFilter({ ...donorFilter, bloodGroup: e.target.value })}
                                    className={`px-3 py-2 rounded-lg border text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                                >
                                    <option value="all">All Blood Groups</option>
                                    {bloodGroups.map((g) => (
                                        <option key={g} value={g}>{g}</option>
                                    ))}
                                </select>
                                <select
                                    value={donorFilter.verified}
                                    onChange={(e) => setDonorFilter({ ...donorFilter, verified: e.target.value })}
                                    className={`px-3 py-2 rounded-lg border text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                                >
                                    <option value="all">All Status</option>
                                    <option value="true">Verified</option>
                                    <option value="false">Pending</option>
                                </select>
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    value={donorFilter.search}
                                    onChange={(e) => setDonorFilter({ ...donorFilter, search: e.target.value })}
                                    className={`px-3 py-2 rounded-lg border text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                                />
                            </div>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                            {donorsLoading ? (
                                <div className="flex justify-center p-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
                                </div>
                            ) : donors.length === 0 ? (
                                <div className={`p-8 text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                    No donors found
                                </div>
                            ) : (
                                <table className="w-full">
                                    <thead className={isDark ? 'bg-gray-700' : 'bg-gray-50'}>
                                        <tr>
                                            <th className={`px-4 py-3 text-left text-xs font-medium uppercase ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Donor</th>
                                            <th className={`px-4 py-3 text-left text-xs font-medium uppercase ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Blood</th>
                                            <th className={`px-4 py-3 text-left text-xs font-medium uppercase ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Status</th>
                                            <th className={`px-4 py-3 text-left text-xs font-medium uppercase ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                                        {donors.map((donor) => (
                                            <tr
                                                key={donor.id}
                                                onClick={() => setSelectedDonor(donor)}
                                                className={`cursor-pointer transition-colors ${
                                                    selectedDonor?.id === donor.id
                                                        ? isDark ? 'bg-gray-700' : 'bg-blue-50'
                                                        : isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                                                }`}
                                            >
                                                <td className="px-4 py-3">
                                                    <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{donor.name}</p>
                                                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{donor.phone}</p>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="px-2 py-1 rounded bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-sm font-bold">
                                                        {donor.blood_group}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                        donor.is_verified
                                                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                                            : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                                                    }`}>
                                                        {donor.is_verified ? 'Verified' : 'Pending'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex gap-2">
                                                        {!donor.is_verified && (
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); updateDonor(donor.id, { is_verified: true }); }}
                                                                className="px-2 py-1 rounded bg-green-600 text-white text-xs hover:bg-green-700"
                                                            >
                                                                Verify
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); deleteDonor(donor.id); }}
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
                    </div>

                    {/* Donor Details */}
                    <div className={`rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white shadow'}`}>
                        <div className={`p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                            <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Donor Details</h2>
                        </div>
                        {selectedDonor ? (
                            <div className="p-4 space-y-4">
                                <div className="text-center">
                                    <span className="inline-block px-4 py-2 rounded-full bg-gradient-to-r from-red-500 to-red-600 text-white text-2xl font-bold">
                                        {selectedDonor.blood_group}
                                    </span>
                                </div>
                                <div>
                                    <label className={`text-xs font-medium uppercase ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Name</label>
                                    <p className={`${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedDonor.name}</p>
                                </div>
                                <div>
                                    <label className={`text-xs font-medium uppercase ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Phone</label>
                                    <p className={`${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedDonor.phone}</p>
                                </div>
                                {selectedDonor.email && (
                                    <div>
                                        <label className={`text-xs font-medium uppercase ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Email</label>
                                        <p className={`${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedDonor.email}</p>
                                    </div>
                                )}
                                {selectedDonor.address && (
                                    <div>
                                        <label className={`text-xs font-medium uppercase ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Address</label>
                                        <p className={`${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedDonor.address}</p>
                                    </div>
                                )}
                                {selectedDonor.gender && (
                                    <div>
                                        <label className={`text-xs font-medium uppercase ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Gender</label>
                                        <p className={`${isDark ? 'text-white' : 'text-gray-900'} capitalize`}>{selectedDonor.gender}</p>
                                    </div>
                                )}
                                {selectedDonor.last_donation_date && (
                                    <div>
                                        <label className={`text-xs font-medium uppercase ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Last Donation</label>
                                        <p className={`${isDark ? 'text-white' : 'text-gray-900'}`}>{new Date(selectedDonor.last_donation_date).toLocaleDateString()}</p>
                                    </div>
                                )}
                                <div>
                                    <label className={`text-xs font-medium uppercase ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Registered</label>
                                    <p className={`${isDark ? 'text-white' : 'text-gray-900'}`}>{formatDate(selectedDonor.created_at)}</p>
                                </div>
                                <div className="flex gap-2 pt-4">
                                    <button
                                        onClick={() => updateDonor(selectedDonor.id, { is_verified: !selectedDonor.is_verified })}
                                        className={`flex-1 py-2 rounded-lg text-white text-sm ${selectedDonor.is_verified ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-green-600 hover:bg-green-700'}`}
                                    >
                                        {selectedDonor.is_verified ? 'Unverify' : 'Verify'}
                                    </button>
                                    <button
                                        onClick={() => updateDonor(selectedDonor.id, { is_available: !selectedDonor.is_available })}
                                        className={`flex-1 py-2 rounded-lg text-white text-sm ${selectedDonor.is_available ? 'bg-gray-600 hover:bg-gray-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                                    >
                                        {selectedDonor.is_available ? 'Set Unavailable' : 'Set Available'}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className={`p-8 text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                Select a donor to view details
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Requests Tab */}
            {activeTab === 'requests' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Requests List */}
                    <div className={`lg:col-span-2 rounded-xl overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-white shadow'}`}>
                        {/* Filters */}
                        <div className={`p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                            <div className="flex flex-wrap gap-3">
                                <select
                                    value={requestFilter.bloodGroup}
                                    onChange={(e) => setRequestFilter({ ...requestFilter, bloodGroup: e.target.value })}
                                    className={`px-3 py-2 rounded-lg border text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                                >
                                    <option value="all">All Blood Groups</option>
                                    {bloodGroups.map((g) => (
                                        <option key={g} value={g}>{g}</option>
                                    ))}
                                </select>
                                <select
                                    value={requestFilter.status}
                                    onChange={(e) => setRequestFilter({ ...requestFilter, status: e.target.value })}
                                    className={`px-3 py-2 rounded-lg border text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                                >
                                    <option value="all">All Status</option>
                                    <option value="pending">Pending</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="fulfilled">Fulfilled</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                                <select
                                    value={requestFilter.urgency}
                                    onChange={(e) => setRequestFilter({ ...requestFilter, urgency: e.target.value })}
                                    className={`px-3 py-2 rounded-lg border text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                                >
                                    <option value="all">All Urgency</option>
                                    <option value="emergency">Emergency</option>
                                    <option value="urgent">Urgent</option>
                                    <option value="normal">Normal</option>
                                </select>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                            {requestsLoading ? (
                                <div className="flex justify-center p-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
                                </div>
                            ) : requests.length === 0 ? (
                                <div className={`p-8 text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                    No requests found
                                </div>
                            ) : (
                                <table className="w-full">
                                    <thead className={isDark ? 'bg-gray-700' : 'bg-gray-50'}>
                                        <tr>
                                            <th className={`px-4 py-3 text-left text-xs font-medium uppercase ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Request</th>
                                            <th className={`px-4 py-3 text-left text-xs font-medium uppercase ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Blood</th>
                                            <th className={`px-4 py-3 text-left text-xs font-medium uppercase ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Urgency</th>
                                            <th className={`px-4 py-3 text-left text-xs font-medium uppercase ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                                        {requests.map((request) => (
                                            <tr
                                                key={request.id}
                                                onClick={() => { setSelectedRequest(request); setAdminNotes(request.admin_notes || ''); }}
                                                className={`cursor-pointer transition-colors ${
                                                    selectedRequest?.id === request.id
                                                        ? isDark ? 'bg-gray-700' : 'bg-blue-50'
                                                        : isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                                                }`}
                                            >
                                                <td className="px-4 py-3">
                                                    <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{request.contact_person}</p>
                                                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{request.hospital_name}</p>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="px-2 py-1 rounded bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-sm font-bold">
                                                        {request.blood_group}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-1 rounded text-xs font-medium ${urgencyColors[request.urgency]?.bg} ${urgencyColors[request.urgency]?.text}`}>
                                                        {request.urgency}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[request.status]?.bg} ${statusColors[request.status]?.text}`}>
                                                        {request.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>

                    {/* Request Details */}
                    <div className={`rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white shadow'}`}>
                        <div className={`p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                            <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Request Details</h2>
                        </div>
                        {selectedRequest ? (
                            <div className="p-4 space-y-4">
                                <div className="text-center">
                                    <span className="inline-block px-4 py-2 rounded-full bg-gradient-to-r from-red-500 to-red-600 text-white text-2xl font-bold">
                                        {selectedRequest.blood_group}
                                    </span>
                                    <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                        {selectedRequest.units_needed} unit(s) needed
                                    </p>
                                </div>
                                <div>
                                    <label className={`text-xs font-medium uppercase ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Contact Person</label>
                                    <p className={`${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedRequest.contact_person}</p>
                                </div>
                                <div>
                                    <label className={`text-xs font-medium uppercase ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Phone</label>
                                    <a href={`tel:${selectedRequest.contact_phone}`} className="block text-blue-500 hover:underline">
                                        {selectedRequest.contact_phone}
                                    </a>
                                </div>
                                {selectedRequest.patient_name && (
                                    <div>
                                        <label className={`text-xs font-medium uppercase ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Patient</label>
                                        <p className={`${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedRequest.patient_name}</p>
                                    </div>
                                )}
                                <div>
                                    <label className={`text-xs font-medium uppercase ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Hospital</label>
                                    <p className={`${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedRequest.hospital_name}</p>
                                    {selectedRequest.hospital_address && (
                                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{selectedRequest.hospital_address}</p>
                                    )}
                                </div>
                                <div>
                                    <label className={`text-xs font-medium uppercase ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Needed By</label>
                                    <p className={`${isDark ? 'text-white' : 'text-gray-900'}`}>{formatDate(selectedRequest.needed_by)}</p>
                                </div>
                                {selectedRequest.reason && (
                                    <div>
                                        <label className={`text-xs font-medium uppercase ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Reason</label>
                                        <p className={`${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedRequest.reason}</p>
                                    </div>
                                )}
                                <div>
                                    <label className={`text-xs font-medium uppercase ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Admin Notes</label>
                                    <textarea
                                        value={adminNotes}
                                        onChange={(e) => setAdminNotes(e.target.value)}
                                        rows={2}
                                        className={`mt-1 w-full px-3 py-2 rounded-lg border text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                                        placeholder="Add notes..."
                                    />
                                    <button
                                        onClick={() => updateRequest(selectedRequest.id, { admin_notes: adminNotes })}
                                        className="mt-2 px-3 py-1 rounded bg-blue-600 text-white text-xs hover:bg-blue-700"
                                    >
                                        Save Notes
                                    </button>
                                </div>
                                <div>
                                    <label className={`text-xs font-medium uppercase ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Update Status</label>
                                    <div className="mt-2 grid grid-cols-2 gap-2">
                                        {selectedRequest.status === 'pending' && (
                                            <button
                                                onClick={() => updateRequest(selectedRequest.id, { status: 'in_progress' })}
                                                className="px-3 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700"
                                            >
                                                In Progress
                                            </button>
                                        )}
                                        {(selectedRequest.status === 'pending' || selectedRequest.status === 'in_progress') && (
                                            <button
                                                onClick={() => updateRequest(selectedRequest.id, { status: 'fulfilled' })}
                                                className="px-3 py-2 rounded-lg bg-green-600 text-white text-sm hover:bg-green-700"
                                            >
                                                Fulfilled
                                            </button>
                                        )}
                                        {selectedRequest.status !== 'cancelled' && selectedRequest.status !== 'fulfilled' && (
                                            <button
                                                onClick={() => updateRequest(selectedRequest.id, { status: 'cancelled' })}
                                                className="px-3 py-2 rounded-lg bg-gray-600 text-white text-sm hover:bg-gray-700"
                                            >
                                                Cancel
                                            </button>
                                        )}
                                        <button
                                            onClick={() => deleteRequest(selectedRequest.id)}
                                            className="px-3 py-2 rounded-lg bg-red-600 text-white text-sm hover:bg-red-700"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className={`p-8 text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                Select a request to view details
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
