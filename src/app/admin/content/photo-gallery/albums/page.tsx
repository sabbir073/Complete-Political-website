'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PhotoAlbum } from '@/types/cms';
import { getStatusColor } from '@/lib/cms-utils';
import toast from 'react-hot-toast';

export default function PhotoAlbumsListPage() {
    const [albums, setAlbums] = useState<PhotoAlbum[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchAlbums();
    }, [page, statusFilter]);

    const fetchAlbums = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '10',
            });

            if (statusFilter) params.append('status', statusFilter);
            if (searchTerm) params.append('search', searchTerm);

            const response = await fetch(`/api/admin/photo-gallery/albums?${params}`);
            const result = await response.json();

            if (response.ok) {
                setAlbums(result.data);
                setTotal(result.pagination.total);
            } else {
                toast.error(result.error || 'Failed to fetch albums');
            }
        } catch (error) {
            console.error('Error fetching albums:', error);
            toast.error('Failed to fetch albums');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this album? All photos in this album will also be deleted.')) return;

        try {
            const response = await fetch(`/api/admin/photo-gallery/albums/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                toast.success('Album deleted successfully');
                fetchAlbums();
            } else {
                const result = await response.json();
                toast.error(result.error || 'Failed to delete album');
            }
        } catch (error) {
            console.error('Error deleting album:', error);
            toast.error('Failed to delete album');
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        fetchAlbums();
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Photo Albums</h1>
                <Link
                    href="/admin/content/photo-gallery/albums/create"
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition"
                >
                    Create Album
                </Link>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
                <form onSubmit={handleSearch} className="flex gap-4">
                    <input
                        type="text"
                        placeholder="Search albums..."
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

            {/* Albums Grid */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading albums...</p>
                    </div>
                ) : albums.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                        <p>No albums found.</p>
                        <Link
                            href="/admin/content/photo-gallery/albums/create"
                            className="text-red-600 hover:underline mt-2 inline-block"
                        >
                            Create your first album
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                            {albums.map((album) => (
                                <div
                                    key={album.id}
                                    className="border dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-lg transition"
                                >
                                    {album.cover_image && (
                                        <div className="h-48 bg-gray-200 dark:bg-gray-700">
                                            <img
                                                src={album.cover_image}
                                                alt={album.name_en}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    )}
                                    <div className="p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-semibold text-lg">{album.name_en}</h3>
                                            <span
                                                className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                                                    album.status
                                                )}`}
                                            >
                                                {album.status}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{album.name_bn}</p>
                                        <p className="text-sm text-gray-500 mb-4">
                                            📷 {album.photo_count} photos
                                        </p>
                                        <div className="flex gap-2">
                                            <Link
                                                href={`/admin/content/photo-gallery/albums/${album.id}`}
                                                className="flex-1 text-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm transition"
                                            >
                                                View Photos
                                            </Link>
                                            <Link
                                                href={`/admin/content/photo-gallery/albums/edit/${album.id}`}
                                                className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 px-4 py-2 rounded text-sm transition cursor-pointer flex items-center gap-1"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                                Edit
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(album.id)}
                                                className="bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800 text-red-600 dark:text-red-200 px-4 py-2 rounded text-sm transition cursor-pointer flex items-center gap-1"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        <div className="bg-gray-50 dark:bg-gray-900 px-6 py-4 flex items-center justify-between border-t border-gray-200 dark:border-gray-700">
                            <div className="text-sm text-gray-700 dark:text-gray-300">
                                Showing {albums.length} of {total} albums
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
        </div>
    );
}
