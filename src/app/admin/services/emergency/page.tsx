'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/providers/ThemeProvider';

interface EmergencyRequest {
    id: string;
    name: string;
    phone: string;
    email: string | null;
    request_type: 'women_safety' | 'child_safety' | 'general';
    latitude: number | null;
    longitude: number | null;
    address: string | null;
    ward: string | null;
    audio_url: string | null;
    audio_duration: number | null;
    message: string | null;
    status: 'pending' | 'acknowledged' | 'responding' | 'resolved' | 'cancelled';
    priority: 'critical' | 'high' | 'medium' | 'low';
    admin_notes: string | null;
    created_at: string;
    updated_at: string;
}

const statusColors: Record<string, { bg: string; text: string }> = {
    pending: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-800 dark:text-yellow-400' },
    acknowledged: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-800 dark:text-blue-400' },
    responding: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-800 dark:text-purple-400' },
    resolved: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-800 dark:text-green-400' },
    cancelled: { bg: 'bg-gray-100 dark:bg-gray-900/30', text: 'text-gray-800 dark:text-gray-400' },
};

const priorityColors: Record<string, { bg: string; text: string }> = {
    critical: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-800 dark:text-red-400' },
    high: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-800 dark:text-orange-400' },
    medium: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-800 dark:text-yellow-400' },
    low: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-800 dark:text-green-400' },
};

const requestTypeLabels: Record<string, { en: string; icon: string }> = {
    women_safety: { en: 'Women Safety', icon: '👩' },
    child_safety: { en: 'Child Safety', icon: '👶' },
    general: { en: 'General Emergency', icon: '🆘' },
};

export default function AdminEmergencyPage() {
    const { isDark } = useTheme();
    const [requests, setRequests] = useState<EmergencyRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState<EmergencyRequest | null>(null);
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [filterType, setFilterType] = useState<string>('all');
    const [filterPriority, setFilterPriority] = useState<string>('all');
    const [adminNotes, setAdminNotes] = useState('');
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        fetchRequests();
        // Auto-refresh every 30 seconds
        const interval = setInterval(fetchRequests, 30000);
        return () => clearInterval(interval);
    }, [filterStatus, filterType, filterPriority]);

    const fetchRequests = async () => {
        try {
            let url = '/api/emergency/sos?limit=100';
            if (filterStatus !== 'all') url += `&status=${filterStatus}`;
            if (filterType !== 'all') url += `&request_type=${filterType}`;
            if (filterPriority !== 'all') url += `&priority=${filterPriority}`;

            const response = await fetch(url);
            const data = await response.json();
            if (data.success) {
                setRequests(data.data);
            }
        } catch (error) {
            console.error('Error fetching requests:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateRequestStatus = async (requestId: string, newStatus: string) => {
        setUpdating(true);
        try {
            const response = await fetch(`/api/admin/emergency/${requestId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: newStatus,
                    admin_notes: adminNotes,
                }),
            });

            const data = await response.json();
            if (data.success) {
                fetchRequests();
                if (selectedRequest?.id === requestId) {
                    setSelectedRequest({ ...selectedRequest, status: newStatus as EmergencyRequest['status'], admin_notes: adminNotes });
                }
            }
        } catch (error) {
            console.error('Error updating request:', error);
        } finally {
            setUpdating(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getTimeSince = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        return `${diffDays}d ago`;
    };

    const openInMaps = (lat: number, lng: number) => {
        window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
    };

    // Count stats
    const pendingCount = requests.filter(r => r.status === 'pending').length;
    const criticalCount = requests.filter(r => r.priority === 'critical' && r.status !== 'resolved').length;
    const todayCount = requests.filter(r => {
        const date = new Date(r.created_at);
        const today = new Date();
        return date.toDateString() === today.toDateString();
    }).length;

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white shadow'}`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Requests</p>
                            <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{requests.length}</p>
                        </div>
                        <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </div>
                    </div>
                </div>
                <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white shadow'}`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Pending</p>
                            <p className={`text-3xl font-bold text-yellow-600`}>{pendingCount}</p>
                        </div>
                        <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900/30">
                            <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                </div>
                <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white shadow'}`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Critical</p>
                            <p className={`text-3xl font-bold text-red-600`}>{criticalCount}</p>
                        </div>
                        <div className="p-3 rounded-full bg-red-100 dark:bg-red-900/30">
                            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                    </div>
                </div>
                <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white shadow'}`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Today</p>
                            <p className={`text-3xl font-bold text-green-600`}>{todayCount}</p>
                        </div>
                        <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30">
                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white shadow'}`}>
                <div className="flex flex-wrap gap-4">
                    <div>
                        <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            Status
                        </label>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className={`px-3 py-2 rounded-lg border ${
                                isDark
                                    ? 'bg-gray-700 border-gray-600 text-white'
                                    : 'bg-white border-gray-300 text-gray-900'
                            }`}
                        >
                            <option value="all">All</option>
                            <option value="pending">Pending</option>
                            <option value="acknowledged">Acknowledged</option>
                            <option value="responding">Responding</option>
                            <option value="resolved">Resolved</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>
                    <div>
                        <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            Type
                        </label>
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className={`px-3 py-2 rounded-lg border ${
                                isDark
                                    ? 'bg-gray-700 border-gray-600 text-white'
                                    : 'bg-white border-gray-300 text-gray-900'
                            }`}
                        >
                            <option value="all">All</option>
                            <option value="women_safety">Women Safety</option>
                            <option value="child_safety">Child Safety</option>
                            <option value="general">General</option>
                        </select>
                    </div>
                    <div>
                        <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            Priority
                        </label>
                        <select
                            value={filterPriority}
                            onChange={(e) => setFilterPriority(e.target.value)}
                            className={`px-3 py-2 rounded-lg border ${
                                isDark
                                    ? 'bg-gray-700 border-gray-600 text-white'
                                    : 'bg-white border-gray-300 text-gray-900'
                            }`}
                        >
                            <option value="all">All</option>
                            <option value="critical">Critical</option>
                            <option value="high">High</option>
                            <option value="medium">Medium</option>
                            <option value="low">Low</option>
                        </select>
                    </div>
                    <div className="flex items-end">
                        <button
                            onClick={fetchRequests}
                            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                        >
                            Refresh
                        </button>
                    </div>
                </div>
            </div>

            {/* Requests List */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Requests Table */}
                <div className={`lg:col-span-2 rounded-xl overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-white shadow'}`}>
                    <div className={`p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                        <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            Emergency Requests
                        </h2>
                    </div>
                    <div className="overflow-x-auto">
                        {loading ? (
                            <div className="flex items-center justify-center p-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
                            </div>
                        ) : requests.length === 0 ? (
                            <div className={`p-8 text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                No emergency requests found
                            </div>
                        ) : (
                            <table className="w-full">
                                <thead className={isDark ? 'bg-gray-700' : 'bg-gray-50'}>
                                    <tr>
                                        <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                            Request
                                        </th>
                                        <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                            Type
                                        </th>
                                        <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                            Status
                                        </th>
                                        <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                            Time
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                                    {requests.map((request) => (
                                        <tr
                                            key={request.id}
                                            onClick={() => {
                                                setSelectedRequest(request);
                                                setAdminNotes(request.admin_notes || '');
                                            }}
                                            className={`cursor-pointer transition-colors ${
                                                selectedRequest?.id === request.id
                                                    ? isDark ? 'bg-gray-700' : 'bg-blue-50'
                                                    : isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                                            }`}
                                        >
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2 rounded-full ${priorityColors[request.priority].bg}`}>
                                                        <span>{requestTypeLabels[request.request_type]?.icon || '🆘'}</span>
                                                    </div>
                                                    <div>
                                                        <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                                            {request.name}
                                                        </p>
                                                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                                            {request.phone}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className={`px-2 py-1 rounded text-xs font-medium ${priorityColors[request.priority].bg} ${priorityColors[request.priority].text}`}>
                                                    {request.priority}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[request.status].bg} ${statusColors[request.status].text}`}>
                                                    {request.status}
                                                </span>
                                            </td>
                                            <td className={`px-4 py-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                                {getTimeSince(request.created_at)}
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
                        <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            Request Details
                        </h2>
                    </div>
                    {selectedRequest ? (
                        <div className="p-4 space-y-4">
                            {/* Header */}
                            <div className="flex items-center gap-3">
                                <div className={`p-3 rounded-full ${priorityColors[selectedRequest.priority].bg}`}>
                                    <span className="text-2xl">{requestTypeLabels[selectedRequest.request_type]?.icon || '🆘'}</span>
                                </div>
                                <div>
                                    <h3 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                        {selectedRequest.name}
                                    </h3>
                                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                        {requestTypeLabels[selectedRequest.request_type]?.en}
                                    </p>
                                </div>
                            </div>

                            {/* Contact */}
                            <div>
                                <label className={`text-xs font-medium uppercase ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                    Contact
                                </label>
                                <div className="flex items-center gap-2 mt-1">
                                    <a
                                        href={`tel:${selectedRequest.phone}`}
                                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-600 text-white text-sm hover:bg-green-700 transition-colors"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                        {selectedRequest.phone}
                                    </a>
                                </div>
                            </div>

                            {/* Location */}
                            {selectedRequest.latitude && selectedRequest.longitude && (
                                <div>
                                    <label className={`text-xs font-medium uppercase ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                        Location
                                    </label>
                                    <button
                                        onClick={() => openInMaps(selectedRequest.latitude!, selectedRequest.longitude!)}
                                        className="mt-1 w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700 transition-colors"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        View on Map
                                    </button>
                                    {selectedRequest.address && (
                                        <p className={`mt-1 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                            {selectedRequest.address}
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Audio Recording */}
                            {selectedRequest.audio_url && (
                                <div>
                                    <label className={`text-xs font-medium uppercase ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                        Audio Recording
                                    </label>
                                    <audio src={selectedRequest.audio_url} controls className="w-full mt-1" />
                                </div>
                            )}

                            {/* Message */}
                            {selectedRequest.message && (
                                <div>
                                    <label className={`text-xs font-medium uppercase ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                        Message
                                    </label>
                                    <p className={`mt-1 p-3 rounded-lg text-sm ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                                        {selectedRequest.message}
                                    </p>
                                </div>
                            )}

                            {/* Timestamps */}
                            <div>
                                <label className={`text-xs font-medium uppercase ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                    Submitted
                                </label>
                                <p className={`mt-1 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                    {formatDate(selectedRequest.created_at)}
                                </p>
                            </div>

                            {/* Admin Notes */}
                            <div>
                                <label className={`text-xs font-medium uppercase ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                    Admin Notes
                                </label>
                                <textarea
                                    value={adminNotes}
                                    onChange={(e) => setAdminNotes(e.target.value)}
                                    rows={3}
                                    className={`mt-1 w-full px-3 py-2 rounded-lg border text-sm ${
                                        isDark
                                            ? 'bg-gray-700 border-gray-600 text-white'
                                            : 'bg-white border-gray-300 text-gray-900'
                                    }`}
                                    placeholder="Add notes..."
                                />
                            </div>

                            {/* Update Status */}
                            <div>
                                <label className={`text-xs font-medium uppercase ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                    Update Status
                                </label>
                                <div className="mt-2 grid grid-cols-2 gap-2">
                                    {selectedRequest.status === 'pending' && (
                                        <button
                                            onClick={() => updateRequestStatus(selectedRequest.id, 'acknowledged')}
                                            disabled={updating}
                                            className="px-3 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700 disabled:opacity-50 transition-colors"
                                        >
                                            Acknowledge
                                        </button>
                                    )}
                                    {(selectedRequest.status === 'pending' || selectedRequest.status === 'acknowledged') && (
                                        <button
                                            onClick={() => updateRequestStatus(selectedRequest.id, 'responding')}
                                            disabled={updating}
                                            className="px-3 py-2 rounded-lg bg-purple-600 text-white text-sm hover:bg-purple-700 disabled:opacity-50 transition-colors"
                                        >
                                            Responding
                                        </button>
                                    )}
                                    {selectedRequest.status !== 'resolved' && selectedRequest.status !== 'cancelled' && (
                                        <button
                                            onClick={() => updateRequestStatus(selectedRequest.id, 'resolved')}
                                            disabled={updating}
                                            className="px-3 py-2 rounded-lg bg-green-600 text-white text-sm hover:bg-green-700 disabled:opacity-50 transition-colors"
                                        >
                                            Resolved
                                        </button>
                                    )}
                                    {selectedRequest.status !== 'cancelled' && selectedRequest.status !== 'resolved' && (
                                        <button
                                            onClick={() => updateRequestStatus(selectedRequest.id, 'cancelled')}
                                            disabled={updating}
                                            className="px-3 py-2 rounded-lg bg-gray-600 text-white text-sm hover:bg-gray-700 disabled:opacity-50 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    )}
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
        </div>
    );
}
