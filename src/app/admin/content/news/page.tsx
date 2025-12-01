'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { News } from '@/types/cms';
import { getStatusColor } from '@/lib/cms-utils';
import ConfirmModal from '@/components/ui/ConfirmModal';
import toast from 'react-hot-toast';

export default function NewsListPage() {
    const [news, setNews] = useState<News[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: string; title: string }>({
        isOpen: false,
        id: '',
        title: '',
    });
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        fetchNews();
    }, [page, statusFilter]);

    const fetchNews = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '10',
            });

            if (statusFilter) params.append('status', statusFilter);
            if (searchTerm) params.append('search', searchTerm);

            const response = await fetch(`/api/admin/news?${params}`);
            const result = await response.json();

            if (response.ok) {
                setNews(result.data);
                setTotal(result.pagination.total);
            } else {
                toast.error(result.error || 'Failed to fetch news');
            }
        } catch (error) {
            console.error('Error fetching news:', error);
            toast.error('Failed to fetch news');
        } finally {
            setLoading(false);
        }
    };

    const openDeleteModal = (id: string, title: string) => {
        setDeleteModal({ isOpen: true, id, title });
    };

    const closeDeleteModal = () => {
        setDeleteModal({ isOpen: false, id: '', title: '' });
    };

    const handleDelete = async () => {
        if (!deleteModal.id) return;
        setIsDeleting(true);

        try {
            const response = await fetch(`/api/admin/news/${deleteModal.id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                toast.success('News deleted successfully');
                closeDeleteModal();
                fetchNews();
            } else {
                const result = await response.json();
                toast.error(result.error || 'Failed to delete news');
            }
        } catch (error) {
            console.error('Error deleting news:', error);
            toast.error('Failed to delete news');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        fetchNews();
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">News Articles</h1>
                <Link
                    href="/admin/content/news/create"
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition"
                >
                    Add New Article
                </Link>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
                <form onSubmit={handleSearch} className="flex gap-4">
                    <input
                        type="text"
                        placeholder="Search news..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-1 px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                    />
                    <select
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value);
                            setPage(1);
                        }}
                        className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                    >
                        <option value="">All Status</option>
                        <option value="published">Published</option>
                        <option value="draft">Draft</option>
                    </select>
                    <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
                    >
                        Search
                    </button>
                </form>
            </div>

            {/* News Table */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading news...</p>
                    </div>
                ) : news.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                        <p>No news articles found.</p>
                        <Link
                            href="/admin/content/news/create"
                            className="text-red-600 hover:underline mt-2 inline-block"
                        >
                            Create your first article
                        </Link>
                    </div>
                ) : (
                    <>
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-900">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Title
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Category
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Author
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {news.map((article) => (
                                    <tr key={article.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                {article.title_en}
                                            </div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                {article.title_bn}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {article.category?.name_en || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {article.author_name || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                                                    article.status
                                                )}`}
                                            >
                                                {article.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end gap-2">
                                                <Link
                                                    href={`/admin/content/news/edit/${article.id}`}
                                                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition cursor-pointer"
                                                    title="Edit"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </Link>
                                                <button
                                                    onClick={() => openDeleteModal(article.id, article.title_en)}
                                                    className="text-red-600 hover:text-red-900 dark:text-red-400 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition cursor-pointer"
                                                    title="Delete"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Pagination */}
                        <div className="bg-gray-50 dark:bg-gray-900 px-6 py-4 flex items-center justify-between border-t border-gray-200 dark:border-gray-700">
                            <div className="text-sm text-gray-700 dark:text-gray-300">
                                Showing {news.length} of {total} articles
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 dark:border-gray-600"
                                >
                                    Previous
                                </button>
                                <span className="px-4 py-2 dark:text-white">
                                    Page {page} of {Math.ceil(total / 10)}
                                </span>
                                <button
                                    onClick={() => setPage(p => p + 1)}
                                    disabled={page >= Math.ceil(total / 10)}
                                    className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 dark:border-gray-600"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={deleteModal.isOpen}
                onClose={closeDeleteModal}
                onConfirm={handleDelete}
                title="Delete News Article"
                message={`Are you sure you want to delete "${deleteModal.title}"? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                isLoading={isDeleting}
                variant="danger"
            />
        </div>
    );
}
