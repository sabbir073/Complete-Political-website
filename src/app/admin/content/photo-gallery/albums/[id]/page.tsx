'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import MediaPicker from '@/components/media/MediaPicker';
import { MediaItem } from '@/types/media.types';
import toast from 'react-hot-toast';

export default function ViewAlbumPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [album, setAlbum] = useState<any>(null);
    const [photos, setPhotos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddPhoto, setShowAddPhoto] = useState(false);
    const [photoForm, setPhotoForm] = useState({
        title_en: '',
        title_bn: '',
        caption_en: '',
        caption_bn: '',
        description_en: '',
        description_bn: '',
        image_url: '',
        alt_text_en: '',
        alt_text_bn: '',
    });

    useEffect(() => {
        fetchAlbum();
    }, []);

    const fetchAlbum = async () => {
        try {
            const response = await fetch(`/api/admin/photo-gallery/albums/${params.id}`);
            const data = await response.json();

            if (response.ok) {
                setAlbum(data);
                setPhotos(data.photos || []);
            } else {
                toast.error('Failed to load album');
                router.push('/admin/content/photo-gallery/albums');
            }
        } catch (error) {
            console.error('Error fetching album:', error);
            toast.error('Failed to load album');
        } finally {
            setLoading(false);
        }
    };

    const handleAddPhoto = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!photoForm.image_url) {
            toast.error('Please select an image');
            return;
        }

        try {
            const response = await fetch('/api/admin/photo-gallery/photos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...photoForm,
                    album_id: params.id,
                    category_id: album.category_id,
                }),
            });

            if (response.ok) {
                toast.success('Photo added successfully');
                setShowAddPhoto(false);
                setPhotoForm({
                    title_en: '',
                    title_bn: '',
                    caption_en: '',
                    caption_bn: '',
                    description_en: '',
                    description_bn: '',
                    image_url: '',
                    alt_text_en: '',
                    alt_text_bn: '',
                });
                fetchAlbum();
            } else {
                const result = await response.json();
                toast.error(result.error || 'Failed to add photo');
            }
        } catch (error) {
            console.error('Error adding photo:', error);
            toast.error('Failed to add photo');
        }
    };

    const handleDeletePhoto = async (photoId: string) => {
        if (!confirm('Are you sure you want to delete this photo?')) return;

        try {
            const response = await fetch(`/api/admin/photo-gallery/photos/${photoId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                toast.success('Photo deleted successfully');
                fetchAlbum();
            } else {
                toast.error('Failed to delete photo');
            }
        } catch (error) {
            console.error('Error deleting photo:', error);
            toast.error('Failed to delete photo');
        }
    };

    if (loading) {
        return (
            <div className="p-6">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <Link
                        href="/admin/content/photo-gallery/albums"
                        className="text-sm text-gray-600 dark:text-gray-400 hover:underline mb-2 inline-block"
                    >
                        ← Back to Albums
                    </Link>
                    <h1 className="text-3xl font-bold">{album?.name_en}</h1>
                    <p className="text-gray-600 dark:text-gray-400">{album?.name_bn}</p>
                </div>
                <div className="flex gap-3">
                    <Link
                        href={`/admin/content/photo-gallery/albums/edit/${params.id}`}
                        className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition"
                    >
                        Edit Album
                    </Link>
                    <button
                        onClick={() => setShowAddPhoto(true)}
                        className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition"
                    >
                        Add Photos
                    </button>
                </div>
            </div>

            {/* Album Info */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
                <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                        <span className="text-gray-500 dark:text-gray-400">Total Photos:</span>
                        <span className="ml-2 font-semibold">{photos.length}</span>
                    </div>
                    <div>
                        <span className="text-gray-500 dark:text-gray-400">Status:</span>
                        <span className={`ml-2 px-2 py-1 rounded text-xs font-semibold ${album?.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                            {album?.status}
                        </span>
                    </div>
                    <div>
                        <span className="text-gray-500 dark:text-gray-400">Category:</span>
                        <span className="ml-2">{album?.category?.name_en || 'Uncategorized'}</span>
                    </div>
                </div>
            </div>

            {/* Add Photo Form */}
            {showAddPhoto && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">Add Photos to Album</h2>
                        <button
                            onClick={() => setShowAddPhoto(false)}
                            className="text-gray-600 dark:text-gray-400 hover:text-gray-800"
                        >
                            ✕
                        </button>
                    </div>

                    <form onSubmit={handleAddPhoto}>
                        <div className="mb-4">
                            <label className="block mb-2 font-medium">Select Image *</label>
                            <MediaPicker
                                value={photoForm.image_url}
                                onChange={(media) => {
                                    const url = media
                                        ? Array.isArray(media)
                                            ? media[0]?.s3_url || ''
                                            : media.s3_url || ''
                                        : '';
                                    setPhotoForm(prev => ({ ...prev, image_url: url }));
                                }}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block mb-2 font-medium">Title (English)</label>
                                <input
                                    type="text"
                                    value={photoForm.title_en}
                                    onChange={(e) => setPhotoForm(prev => ({ ...prev, title_en: e.target.value }))}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block mb-2 font-medium">Title (Bengali)</label>
                                <input
                                    type="text"
                                    value={photoForm.title_bn}
                                    onChange={(e) => setPhotoForm(prev => ({ ...prev, title_bn: e.target.value }))}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block mb-2 font-medium">Caption (English)</label>
                                <input
                                    type="text"
                                    value={photoForm.caption_en}
                                    onChange={(e) => setPhotoForm(prev => ({ ...prev, caption_en: e.target.value }))}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block mb-2 font-medium">Caption (Bengali)</label>
                                <input
                                    type="text"
                                    value={photoForm.caption_bn}
                                    onChange={(e) => setPhotoForm(prev => ({ ...prev, caption_bn: e.target.value }))}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                type="submit"
                                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition"
                            >
                                Add Photo
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowAddPhoto(false)}
                                className="bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white px-6 py-2 rounded-lg transition"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Photos Grid */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Photos ({photos.length})</h2>

                {photos.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        <p>No photos in this album yet.</p>
                        <button
                            onClick={() => setShowAddPhoto(true)}
                            className="text-red-600 hover:underline mt-2"
                        >
                            Add your first photo
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {photos.map((photo) => (
                            <div
                                key={photo.id}
                                className="relative group border dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-lg transition"
                            >
                                <img
                                    src={photo.image_url}
                                    alt={photo.alt_text_en || photo.title_en}
                                    className="w-full h-48 object-cover"
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition flex items-center justify-center opacity-0 group-hover:opacity-100">
                                    <button
                                        onClick={() => handleDeletePhoto(photo.id)}
                                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                                    >
                                        Delete
                                    </button>
                                </div>
                                {photo.title_en && (
                                    <div className="p-2 bg-white dark:bg-gray-900">
                                        <p className="text-sm font-medium truncate">{photo.title_en}</p>
                                        {photo.caption_en && (
                                            <p className="text-xs text-gray-500 truncate">{photo.caption_en}</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
