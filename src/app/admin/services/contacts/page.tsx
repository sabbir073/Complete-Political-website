'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/providers/ThemeProvider';
import toast from 'react-hot-toast';

interface ContactSubmission {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    subject: string;
    message: string;
    status: 'pending' | 'read' | 'responded' | 'closed';
    admin_notes: string | null;
    responded_at: string | null;
    created_at: string;
    updated_at: string;
}

export default function ContactsPage() {
    const { isDark } = useTheme();
    const [contacts, setContacts] = useState<ContactSubmission[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedContact, setSelectedContact] = useState<ContactSubmission | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
    });

    useEffect(() => {
        fetchContacts();
    }, [statusFilter, pagination.page]);

    const fetchContacts = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: pagination.page.toString(),
                limit: pagination.limit.toString(),
            });

            if (statusFilter !== 'all') {
                params.append('status', statusFilter);
            }

            if (searchQuery) {
                params.append('search', searchQuery);
            }

            const response = await fetch(`/api/admin/contacts?${params}`);
            const result = await response.json();

            if (response.ok) {
                setContacts(result.data || []);
                setPagination(prev => ({
                    ...prev,
                    total: result.pagination.total,
                    totalPages: result.pagination.totalPages,
                }));
            } else {
                toast.error(result.error || 'Failed to fetch contacts');
            }
        } catch (error) {
            console.error('Error fetching contacts:', error);
            toast.error('Failed to fetch contacts');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPagination(prev => ({ ...prev, page: 1 }));
        fetchContacts();
    };

    const openViewModal = (contact: ContactSubmission) => {
        setSelectedContact(contact);
        setShowModal(true);

        // Mark as read if pending
        if (contact.status === 'pending') {
            updateContactStatus(contact.id, 'read');
        }
    };

    const updateContactStatus = async (id: string, status: string) => {
        try {
            const response = await fetch(`/api/admin/contacts/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
            });

            if (response.ok) {
                setContacts(prev =>
                    prev.map(c => (c.id === id ? { ...c, status: status as ContactSubmission['status'] } : c))
                );
                if (selectedContact?.id === id) {
                    setSelectedContact(prev => prev ? { ...prev, status: status as ContactSubmission['status'] } : null);
                }
                toast.success('Status updated');
            }
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const deleteContact = async (id: string) => {
        if (!confirm('Are you sure you want to delete this contact submission?')) return;

        try {
            const response = await fetch(`/api/admin/contacts/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setContacts(prev => prev.filter(c => c.id !== id));
                setShowModal(false);
                toast.success('Contact deleted');
            } else {
                toast.error('Failed to delete contact');
            }
        } catch (error) {
            console.error('Error deleting contact:', error);
            toast.error('Failed to delete contact');
        }
    };

    const getStatusBadge = (status: string) => {
        const statusClasses: Record<string, string> = {
            pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
            read: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
            responded: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
            closed: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400',
        };

        const statusLabels: Record<string, string> = {
            pending: 'Pending',
            read: 'Read',
            responded: 'Responded',
            closed: 'Closed',
        };

        return (
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusClasses[status]}`}>
                {statusLabels[status]}
            </span>
        );
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

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Contact Submissions
                    </h1>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        View and manage contact form submissions
                    </p>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-3">
                    <form onSubmit={handleSearch} className="flex gap-2">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search..."
                            className={`px-4 py-2 rounded-lg border ${
                                isDark
                                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                            } focus:outline-none focus:ring-2 focus:ring-red-500`}
                        />
                        <button
                            type="submit"
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                        >
                            Search
                        </button>
                    </form>

                    <select
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value);
                            setPagination(prev => ({ ...prev, page: 1 }));
                        }}
                        className={`px-4 py-2 rounded-lg border ${
                            isDark
                                ? 'bg-gray-700 border-gray-600 text-white'
                                : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-red-500`}
                    >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="read">Read</option>
                        <option value="responded">Responded</option>
                        <option value="closed">Closed</option>
                    </select>
                </div>
            </div>

            {/* Data Table */}
            <div className={`rounded-xl overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-white shadow-lg'}`}>
                {loading ? (
                    <div className="p-12 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
                        <p className={`mt-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Loading...</p>
                    </div>
                ) : contacts.length === 0 ? (
                    <div className="p-12 text-center">
                        <svg className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <p className={`text-lg font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            No contact submissions found
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className={isDark ? 'bg-gray-700' : 'bg-gray-50'}>
                                <tr>
                                    <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                        Name
                                    </th>
                                    <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                        Email
                                    </th>
                                    <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                        Subject
                                    </th>
                                    <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                        Status
                                    </th>
                                    <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                        Date
                                    </th>
                                    <th className={`px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                                {contacts.map((contact) => (
                                    <tr
                                        key={contact.id}
                                        className={`${isDark ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'} transition-colors`}
                                    >
                                        <td className={`px-6 py-4 whitespace-nowrap ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                                                    <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                                        {contact.name[0].toUpperCase()}
                                                    </span>
                                                </div>
                                                <div>
                                                    <div className="font-medium">{contact.name}</div>
                                                    {contact.phone && (
                                                        <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                                            {contact.phone}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className={`px-6 py-4 whitespace-nowrap ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                            {contact.email}
                                        </td>
                                        <td className={`px-6 py-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                            <div className="max-w-xs truncate">{contact.subject}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(contact.status)}
                                        </td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                            {formatDate(contact.created_at)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <button
                                                onClick={() => openViewModal(contact)}
                                                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
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
                    <div className={`flex items-center justify-between px-6 py-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                        <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                                disabled={pagination.page === 1}
                                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                                    pagination.page === 1
                                        ? 'opacity-50 cursor-not-allowed'
                                        : isDark
                                            ? 'bg-gray-700 text-white hover:bg-gray-600'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                                disabled={pagination.page === pagination.totalPages}
                                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                                    pagination.page === pagination.totalPages
                                        ? 'opacity-50 cursor-not-allowed'
                                        : isDark
                                            ? 'bg-gray-700 text-white hover:bg-gray-600'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* View Modal */}
            {showModal && selectedContact && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                    onClick={() => setShowModal(false)}
                >
                    <div
                        className={`w-full max-w-2xl rounded-2xl shadow-2xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className={`flex items-center justify-between p-6 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                            <div>
                                <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    Contact Details
                                </h2>
                                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                    Submitted on {formatDate(selectedContact.created_at)}
                                </p>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 max-h-[60vh] overflow-y-auto">
                            <div className="grid grid-cols-2 gap-6 mb-6">
                                <div>
                                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                        Name
                                    </label>
                                    <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                        {selectedContact.name}
                                    </p>
                                </div>
                                <div>
                                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                        Email
                                    </label>
                                    <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                        <a href={`mailto:${selectedContact.email}`} className="text-blue-600 hover:underline">
                                            {selectedContact.email}
                                        </a>
                                    </p>
                                </div>
                                <div>
                                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                        Phone
                                    </label>
                                    <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                        {selectedContact.phone || 'Not provided'}
                                    </p>
                                </div>
                                <div>
                                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                        Status
                                    </label>
                                    <div className="flex items-center gap-2">
                                        {getStatusBadge(selectedContact.status)}
                                    </div>
                                </div>
                            </div>

                            <div className="mb-6">
                                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                    Subject
                                </label>
                                <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    {selectedContact.subject}
                                </p>
                            </div>

                            <div className="mb-6">
                                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                    Message
                                </label>
                                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                    <p className={`whitespace-pre-wrap ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                                        {selectedContact.message}
                                    </p>
                                </div>
                            </div>

                            {/* Status Update */}
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                    Update Status
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {['pending', 'read', 'responded', 'closed'].map((status) => (
                                        <button
                                            key={status}
                                            onClick={() => updateContactStatus(selectedContact.id, status)}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                                selectedContact.status === status
                                                    ? 'bg-red-600 text-white'
                                                    : isDark
                                                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                        >
                                            {status.charAt(0).toUpperCase() + status.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className={`flex items-center justify-between p-6 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                            <button
                                onClick={() => deleteContact(selectedContact.id)}
                                className="px-4 py-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium transition-colors"
                            >
                                Delete
                            </button>
                            <div className="flex gap-3">
                                <a
                                    href={`mailto:${selectedContact.email}?subject=Re: ${selectedContact.subject}`}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                                >
                                    Reply via Email
                                </a>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                        isDark
                                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
