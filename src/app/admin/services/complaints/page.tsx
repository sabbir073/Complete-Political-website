'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useTheme } from '@/providers/ThemeProvider';
import toast from 'react-hot-toast';

interface Attachment {
    url: string;
    s3Key: string;
    filename: string;
    fileType: string;
    fileSize: number;
}

interface Complaint {
    id: string;
    tracking_id: string;
    is_anonymous: boolean;
    name: string | null;
    email: string | null;
    phone: string | null;
    ward: string | null;
    category: string;
    priority: string;
    location: string | null;
    subject: string;
    message: string;
    attachments: Attachment[];
    status: string;
    admin_notes: string | null;
    admin_response: string | null;
    responded_at: string | null;
    created_at: string;
    updated_at: string;
}

interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export default function ComplaintsPage() {
    const { isDark } = useTheme();
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState<Pagination>({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
    });
    const [filters, setFilters] = useState({
        status: 'all',
        category: 'all',
        priority: 'all',
        ward: 'all',
        search: '',
    });
    const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [responseText, setResponseText] = useState('');

    const categories = [
        { value: 'infrastructure', label: 'Infrastructure' },
        { value: 'corruption', label: 'Corruption' },
        { value: 'public-service', label: 'Public Service' },
        { value: 'law-order', label: 'Law & Order' },
        { value: 'education', label: 'Education' },
        { value: 'healthcare', label: 'Healthcare' },
        { value: 'environment', label: 'Environment' },
        { value: 'other', label: 'Other' },
    ];

    // Dhaka-18 Constituency Wards
    const wards = [
        { value: '01', label: 'Ward 01' },
        { value: '17', label: 'Ward 17' },
        { value: '43', label: 'Ward 43' },
        { value: '44', label: 'Ward 44' },
        { value: '45', label: 'Ward 45' },
        { value: '46', label: 'Ward 46' },
        { value: '47', label: 'Ward 47' },
        { value: '48', label: 'Ward 48' },
        { value: '49', label: 'Ward 49' },
        { value: '50', label: 'Ward 50' },
        { value: '51', label: 'Ward 51' },
        { value: '52', label: 'Ward 52' },
        { value: '53', label: 'Ward 53' },
        { value: '54', label: 'Ward 54' },
    ];

    const priorities = [
        { value: 'low', label: 'Low', color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' },
        { value: 'medium', label: 'Medium', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
        { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' },
        { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
    ];

    const statuses = [
        { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
        { value: 'in_progress', label: 'In Progress', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
        { value: 'under_review', label: 'Under Review', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' },
        { value: 'responded', label: 'Responded', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
        { value: 'resolved', label: 'Resolved', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
        { value: 'rejected', label: 'Rejected', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
    ];

    useEffect(() => {
        fetchComplaints();
    }, [pagination.page, filters]);

    const fetchComplaints = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: pagination.page.toString(),
                limit: pagination.limit.toString(),
            });

            if (filters.status !== 'all') params.append('status', filters.status);
            if (filters.category !== 'all') params.append('category', filters.category);
            if (filters.priority !== 'all') params.append('priority', filters.priority);
            if (filters.ward !== 'all') params.append('ward', filters.ward);
            if (filters.search) params.append('search', filters.search);

            const response = await fetch(`/api/admin/complaints?${params}`);
            const result = await response.json();

            if (response.ok) {
                setComplaints(result.data);
                setPagination(prev => ({ ...prev, ...result.pagination }));
            } else {
                toast.error('Failed to fetch complaints');
            }
        } catch (error) {
            console.error('Error fetching complaints:', error);
            toast.error('Failed to fetch complaints');
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id: string, status: string) => {
        try {
            setUpdating(true);
            const response = await fetch(`/api/admin/complaints/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
            });

            if (response.ok) {
                toast.success('Status updated successfully');
                fetchComplaints();
                if (selectedComplaint?.id === id) {
                    setSelectedComplaint(prev => prev ? { ...prev, status } : null);
                }
            } else {
                toast.error('Failed to update status');
            }
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Failed to update status');
        } finally {
            setUpdating(false);
        }
    };

    const sendResponse = async () => {
        if (!selectedComplaint || !responseText.trim()) return;

        try {
            setUpdating(true);
            const response = await fetch(`/api/admin/complaints/${selectedComplaint.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    admin_response: responseText,
                    status: 'responded',
                }),
            });

            if (response.ok) {
                toast.success('Response sent successfully');
                setResponseText('');
                fetchComplaints();
                const updatedComplaint = await response.json();
                setSelectedComplaint(updatedComplaint);
            } else {
                toast.error('Failed to send response');
            }
        } catch (error) {
            console.error('Error sending response:', error);
            toast.error('Failed to send response');
        } finally {
            setUpdating(false);
        }
    };

    const deleteComplaint = async (id: string) => {
        if (!confirm('Are you sure you want to delete this complaint?')) return;

        try {
            const response = await fetch(`/api/admin/complaints/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                toast.success('Complaint deleted successfully');
                setIsModalOpen(false);
                setSelectedComplaint(null);
                fetchComplaints();
            } else {
                toast.error('Failed to delete complaint');
            }
        } catch (error) {
            console.error('Error deleting complaint:', error);
            toast.error('Failed to delete complaint');
        }
    };

    const openModal = (complaint: Complaint) => {
        setSelectedComplaint(complaint);
        setResponseText(complaint.admin_response || '');
        setIsModalOpen(true);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getStatusColor = (status: string) => {
        return statuses.find(s => s.value === status)?.color || 'bg-gray-100 text-gray-800';
    };

    const getPriorityColor = (priority: string) => {
        return priorities.find(p => p.value === priority)?.color || 'bg-gray-100 text-gray-800';
    };

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-8">
                <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Complaints
                </h1>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Manage and respond to user complaints
                </p>
            </div>

            {/* Filters */}
            <div className={`mb-6 p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white shadow-lg'}`}>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <div>
                        <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            Search
                        </label>
                        <input
                            type="text"
                            value={filters.search}
                            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                            placeholder="Search..."
                            className={`w-full px-3 py-2 rounded-lg border ${
                                isDark
                                    ? 'bg-gray-700 border-gray-600 text-white'
                                    : 'bg-white border-gray-300 text-gray-900'
                            }`}
                        />
                    </div>
                    <div>
                        <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            Status
                        </label>
                        <select
                            value={filters.status}
                            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                            className={`w-full px-3 py-2 rounded-lg border ${
                                isDark
                                    ? 'bg-gray-700 border-gray-600 text-white'
                                    : 'bg-white border-gray-300 text-gray-900'
                            }`}
                        >
                            <option value="all">All Status</option>
                            {statuses.map(s => (
                                <option key={s.value} value={s.value}>{s.label}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            Category
                        </label>
                        <select
                            value={filters.category}
                            onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                            className={`w-full px-3 py-2 rounded-lg border ${
                                isDark
                                    ? 'bg-gray-700 border-gray-600 text-white'
                                    : 'bg-white border-gray-300 text-gray-900'
                            }`}
                        >
                            <option value="all">All Categories</option>
                            {categories.map(c => (
                                <option key={c.value} value={c.value}>{c.label}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            Priority
                        </label>
                        <select
                            value={filters.priority}
                            onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                            className={`w-full px-3 py-2 rounded-lg border ${
                                isDark
                                    ? 'bg-gray-700 border-gray-600 text-white'
                                    : 'bg-white border-gray-300 text-gray-900'
                            }`}
                        >
                            <option value="all">All Priorities</option>
                            {priorities.map(p => (
                                <option key={p.value} value={p.value}>{p.label}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            Ward
                        </label>
                        <select
                            value={filters.ward}
                            onChange={(e) => setFilters(prev => ({ ...prev, ward: e.target.value }))}
                            className={`w-full px-3 py-2 rounded-lg border ${
                                isDark
                                    ? 'bg-gray-700 border-gray-600 text-white'
                                    : 'bg-white border-gray-300 text-gray-900'
                            }`}
                        >
                            <option value="all">All Wards</option>
                            {wards.map(w => (
                                <option key={w.value} value={w.value}>{w.label}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-end">
                        <button
                            onClick={() => setFilters({ status: 'all', category: 'all', priority: 'all', ward: 'all', search: '' })}
                            className={`px-4 py-2 rounded-lg ${
                                isDark
                                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                            }`}
                        >
                            Clear Filters
                        </button>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className={`rounded-xl overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-white shadow-lg'}`}>
                {loading ? (
                    <div className="p-12 text-center">
                        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                        <p className={`mt-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Loading complaints...</p>
                    </div>
                ) : complaints.length === 0 ? (
                    <div className="p-12 text-center">
                        <svg className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>No complaints found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className={isDark ? 'bg-gray-700/50' : 'bg-gray-50'}>
                                <tr>
                                    <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                        Tracking ID
                                    </th>
                                    <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                        Complainant
                                    </th>
                                    <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                        Ward
                                    </th>
                                    <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                        Category
                                    </th>
                                    <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                        Subject
                                    </th>
                                    <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                        Priority
                                    </th>
                                    <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                        Status
                                    </th>
                                    <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                        Date
                                    </th>
                                    <th className={`px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                                {complaints.map((complaint) => (
                                    <tr
                                        key={complaint.id}
                                        className={`${isDark ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'} transition-colors`}
                                    >
                                        <td className={`px-6 py-4 ${isDark ? 'text-orange-400' : 'text-orange-600'} font-mono font-medium`}>
                                            {complaint.tracking_id}
                                        </td>
                                        <td className="px-6 py-4">
                                            {complaint.is_anonymous ? (
                                                <span className={`italic ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                                    Anonymous
                                                </span>
                                            ) : (
                                                <div>
                                                    <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                                        {complaint.name}
                                                    </p>
                                                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                                        {complaint.email}
                                                    </p>
                                                </div>
                                            )}
                                        </td>
                                        <td className={`px-6 py-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                            {complaint.ward ? (
                                                <span className="px-2 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400">
                                                    Ward {complaint.ward}
                                                </span>
                                            ) : (
                                                <span className={`text-sm italic ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>N/A</span>
                                            )}
                                        </td>
                                        <td className={`px-6 py-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                            {categories.find(c => c.value === complaint.category)?.label || complaint.category}
                                        </td>
                                        <td className={`px-6 py-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                            <span className="line-clamp-1">{complaint.subject}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(complaint.priority)}`}>
                                                {priorities.find(p => p.value === complaint.priority)?.label || complaint.priority}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(complaint.status)}`}>
                                                {statuses.find(s => s.value === complaint.status)?.label || complaint.status}
                                            </span>
                                        </td>
                                        <td className={`px-6 py-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                            {formatDate(complaint.created_at)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => openModal(complaint)}
                                                className="text-orange-500 hover:text-orange-600 font-medium"
                                            >
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className={`px-6 py-4 border-t flex items-center justify-between ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} complaints
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                                disabled={pagination.page === 1}
                                className={`px-3 py-1 rounded ${
                                    pagination.page === 1
                                        ? 'opacity-50 cursor-not-allowed'
                                        : 'hover:bg-gray-700'
                                } ${isDark ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-700'}`}
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                                disabled={pagination.page === pagination.totalPages}
                                className={`px-3 py-1 rounded ${
                                    pagination.page === pagination.totalPages
                                        ? 'opacity-50 cursor-not-allowed'
                                        : 'hover:bg-gray-700'
                                } ${isDark ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-700'}`}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && selectedComplaint && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50">
                    <div className={`w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                        {/* Modal Header */}
                        <div className={`sticky top-0 z-10 px-6 py-4 border-b flex items-center justify-between ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                            <div>
                                <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    Complaint Details
                                </h2>
                                <p className={`text-sm font-mono ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>
                                    {selectedComplaint.tracking_id}
                                </p>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-6">
                            {/* Status & Priority */}
                            <div className="flex items-center gap-4 flex-wrap">
                                <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(selectedComplaint.status)}`}>
                                    {statuses.find(s => s.value === selectedComplaint.status)?.label || selectedComplaint.status}
                                </span>
                                <span className={`px-3 py-1 text-sm font-medium rounded-full ${getPriorityColor(selectedComplaint.priority)}`}>
                                    {priorities.find(p => p.value === selectedComplaint.priority)?.label || selectedComplaint.priority} Priority
                                </span>
                                {selectedComplaint.is_anonymous && (
                                    <span className="px-3 py-1 text-sm font-medium rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                        Anonymous
                                    </span>
                                )}
                            </div>

                            {/* Complainant Info */}
                            {!selectedComplaint.is_anonymous && (
                                <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                                    <h3 className={`font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                        Complainant Information
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Name</p>
                                            <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                                {selectedComplaint.name}
                                            </p>
                                        </div>
                                        <div>
                                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Email</p>
                                            <a href={`mailto:${selectedComplaint.email}`} className="text-orange-500 hover:text-orange-600 font-medium">
                                                {selectedComplaint.email}
                                            </a>
                                        </div>
                                        {selectedComplaint.phone && (
                                            <div>
                                                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Phone</p>
                                                <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                                    {selectedComplaint.phone}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Complaint Details */}
                            <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                                <h3 className={`font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    Complaint Details
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                                    <div>
                                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Ward</p>
                                        <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                            {selectedComplaint.ward ? (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400">
                                                    Ward {selectedComplaint.ward}
                                                </span>
                                            ) : (
                                                <span className="text-gray-400 italic">Not specified</span>
                                            )}
                                        </p>
                                    </div>
                                    <div>
                                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Category</p>
                                        <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                            {categories.find(c => c.value === selectedComplaint.category)?.label || selectedComplaint.category}
                                        </p>
                                    </div>
                                    {selectedComplaint.location && (
                                        <div>
                                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Location</p>
                                            <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                                {selectedComplaint.location}
                                            </p>
                                        </div>
                                    )}
                                    <div>
                                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Submitted</p>
                                        <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                            {formatDate(selectedComplaint.created_at)}
                                        </p>
                                    </div>
                                </div>
                                <div>
                                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Subject</p>
                                    <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                        {selectedComplaint.subject}
                                    </p>
                                </div>
                                <div className="mt-4">
                                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Message</p>
                                    <p className={`mt-1 whitespace-pre-wrap ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                        {selectedComplaint.message}
                                    </p>
                                </div>
                            </div>

                            {/* Attachments */}
                            {selectedComplaint.attachments && selectedComplaint.attachments.length > 0 && (
                                <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                                    <h3 className={`font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                        Attachments ({selectedComplaint.attachments.length})
                                    </h3>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {selectedComplaint.attachments.map((att, index) => (
                                            <a
                                                key={index}
                                                href={att.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={`block rounded-lg overflow-hidden border ${isDark ? 'border-gray-600 hover:border-orange-500' : 'border-gray-200 hover:border-orange-500'} transition-colors`}
                                            >
                                                {att.fileType.startsWith('video/') ? (
                                                    <div className={`aspect-video flex items-center justify-center ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                                                        <div className="text-center">
                                                            <svg className={`w-10 h-10 mx-auto ${isDark ? 'text-purple-400' : 'text-purple-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                            </svg>
                                                            <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Video</span>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="aspect-video relative">
                                                        <Image
                                                            src={att.url}
                                                            alt={att.filename}
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    </div>
                                                )}
                                                <div className={`p-2 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                                                    <p className={`text-xs truncate ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                                        {att.filename}
                                                    </p>
                                                    <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                                        {(att.fileSize / 1024 / 1024).toFixed(2)} MB
                                                    </p>
                                                </div>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Update Status */}
                            <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                                <h3 className={`font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    Update Status
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {statuses.map(s => (
                                        <button
                                            key={s.value}
                                            onClick={() => updateStatus(selectedComplaint.id, s.value)}
                                            disabled={updating || selectedComplaint.status === s.value}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                                selectedComplaint.status === s.value
                                                    ? s.color + ' cursor-default'
                                                    : isDark
                                                        ? 'bg-gray-600 hover:bg-gray-500 text-white'
                                                        : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                                            }`}
                                        >
                                            {s.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Admin Response */}
                            <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                                <h3 className={`font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    Admin Response
                                </h3>
                                {selectedComplaint.admin_response && (
                                    <div className={`mb-4 p-3 rounded-lg ${isDark ? 'bg-green-900/30 border border-green-800' : 'bg-green-50 border border-green-200'}`}>
                                        <p className={`text-sm mb-1 ${isDark ? 'text-green-400' : 'text-green-700'}`}>
                                            Previous Response ({selectedComplaint.responded_at ? formatDate(selectedComplaint.responded_at) : 'Unknown'}):
                                        </p>
                                        <p className={`${isDark ? 'text-green-200/80' : 'text-green-800'}`}>
                                            {selectedComplaint.admin_response}
                                        </p>
                                    </div>
                                )}
                                <textarea
                                    value={responseText}
                                    onChange={(e) => setResponseText(e.target.value)}
                                    rows={4}
                                    placeholder="Write your response to the complainant..."
                                    className={`w-full px-4 py-3 rounded-lg border resize-none ${
                                        isDark
                                            ? 'bg-gray-700 border-gray-600 text-white'
                                            : 'bg-white border-gray-300 text-gray-900'
                                    }`}
                                />
                                <button
                                    onClick={sendResponse}
                                    disabled={updating || !responseText.trim()}
                                    className="mt-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-medium"
                                >
                                    {updating ? 'Sending...' : 'Send Response'}
                                </button>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className={`sticky bottom-0 px-6 py-4 border-t flex items-center justify-between ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                            <button
                                onClick={() => deleteComplaint(selectedComplaint.id)}
                                className="text-red-500 hover:text-red-600 font-medium"
                            >
                                Delete Complaint
                            </button>
                            {!selectedComplaint.is_anonymous && selectedComplaint.email && (
                                <a
                                    href={`mailto:${selectedComplaint.email}?subject=Re: ${selectedComplaint.subject}`}
                                    className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg font-medium inline-flex items-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    Reply via Email
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
