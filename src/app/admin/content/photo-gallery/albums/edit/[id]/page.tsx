'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { generateSlug } from '@/lib/cms-utils';
import MediaPicker from '@/components/media/MediaPicker';
import ConfirmModal from '@/components/ui/ConfirmModal';
import toast from 'react-hot-toast';

interface Photo {
    id: string;
    title_en: string;
    title_bn: string;
    caption_en: string;
    caption_bn: string;
    image_url: string;
    alt_text_en: string;
    alt_text_bn: string;
}

export default function EditAlbumPage() {
    const router = useRouter();
    const params = useParams();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [showAddPhoto, setShowAddPhoto] = useState(false);
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: string; title: string }>({
        isOpen: false,
        id: '',
        title: '',
    });
    const [isDeleting, setIsDeleting] = useState(false);
    const [photoForm, setPhotoForm] = useState({
        title_en: '',
        title_bn: '',
        caption_en: '',
        caption_bn: '',
        image_url: '',
        alt_text_en: '',
        alt_text_bn: '',
    });
    const [formData, setFormData] = useState({
        name_en: '',
        name_bn: '',
        description_en: '',
        description_bn: '',
        cover_image: '',
        category_id: '',
        status: 'draft' as 'draft' | 'published',
        display_order: 0,
        slug: '',
    });

    useEffect(() => {
        fetchCategories();
        fetchAlbum();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await fetch('/api/admin/categories?content_type=photos');
            const result = await response.json();
            if (response.ok) {
                setCategories(result.data || []);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchAlbum = async () => {
        try {
            const response = await fetch(`/api/admin/photo-gallery/albums/${params.id}`);
            const data = await response.json();
            if (response.ok && data && !data.error) {
                setFormData({
                    name_en: data.name_en || '',
                    name_bn: data.name_bn || '',
                    description_en: data.description_en || '',
                    description_bn: data.description_bn || '',
                    cover_image: data.cover_image || '',
                    category_id: data.category_id || '',
                    status: data.status || 'draft',
                    display_order: data.display_order || 0,
                    slug: data.slug || '',
                });
                setPhotos(data.photos || []);
            } else {
                toast.error(data.error || 'Failed to fetch album details');
                router.push('/admin/content/photo-gallery/albums');
            }
        } catch (error) {
            console.error('Error fetching album:', error);
            toast.error('Failed to fetch album details');
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
                    album_id: params.id as string,
                    category_id: formData.category_id,
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

    const openDeleteModal = (id: string, title: string) => {
        setDeleteModal({ isOpen: true, id, title: title || 'this photo' });
    };

    const closeDeleteModal = () => {
        setDeleteModal({ isOpen: false, id: '', title: '' });
    };

    const handleDeletePhoto = async () => {
        if (!deleteModal.id) return;
        setIsDeleting(true);

        try {
            const response = await fetch(`/api/admin/photo-gallery/photos/${deleteModal.id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                toast.success('Photo deleted successfully');
                closeDeleteModal();
                fetchAlbum();
            } else {
                toast.error('Failed to delete photo');
            }
        } catch (error) {
            console.error('Error deleting photo:', error);
            toast.error('Failed to delete photo');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const response = await fetch(`/api/admin/photo-gallery/albums/${params.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const result = await response.json();

            if (response.ok) {
                toast.success('Album updated successfully');
                router.push('/admin/content/photo-gallery/albums');
            } else {
                toast.error(result.error || 'Failed to update album');
            }
        } catch (error) {
            console.error('Error updating album:', error);
            toast.error('Failed to update album');
        } finally {
            setSaving(false);
        }
    };

    const handleNameChange = (value: string, lang: 'en' | 'bn') => {
        setFormData(prev => ({
            ...prev,
            [`name_${lang}`]: value,
            ...(lang === 'en' ? { slug: generateSlug(value) } : {}),
        }));
    };

    if (loading) {
        return (
            <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
                <p className="mt-4 text-gray-600 dark:text-gray-400">Loading album details...</p>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold">Edit Album</h1>
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="text-gray-600 hover:text-gray-800 dark:text-gray-400"
                >
                    ← Back
                </button>
            </div>

            <form onSubmit={handleSubmit} className="max-w-3xl">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">Album Details</h2>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block mb-2 font-medium">Album Name (English) *</label>
                            <input
                                type="text"
                                value={formData.name_en}
                                onChange={(e) => handleNameChange(e.target.value, 'en')}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                                required
                            />
                        </div>
                        <div>
                            <label className="block mb-2 font-medium">Album Name (Bengali) *</label>
                            <input
                                type="text"
                                value={formData.name_bn}
                                onChange={(e) => handleNameChange(e.target.value, 'bn')}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block mb-2 font-medium">Description (English)</label>
                            <textarea
                                value={formData.description_en}
                                onChange={(e) => setFormData(prev => ({ ...prev, description_en: e.target.value }))}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white h-24"
                            />
                        </div>
                        <div>
                            <label className="block mb-2 font-medium">Description (Bengali)</label>
                            <textarea
                                value={formData.description_bn}
                                onChange={(e) => setFormData(prev => ({ ...prev, description_bn: e.target.value }))}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white h-24"
                            />
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="block mb-2 font-medium">Cover Image</label>
                        <MediaPicker
                            value={formData.cover_image}
                            onChange={(media) => {
                                const url = Array.isArray(media)
                                    ? media[0]?.cloudfront_url || media[0]?.s3_url
                                    : (media as any)?.cloudfront_url || (media as any)?.s3_url;
                                setFormData(prev => ({ ...prev, cover_image: url || '' }));
                            }}
                        />
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-4">
                        <div>
                            <label className="block mb-2 font-medium">Category</label>
                            <select
                                value={formData.category_id}
                                onChange={(e) => setFormData(prev => ({ ...prev, category_id: e.target.value }))}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                            >
                                <option value="">-- Select Category --</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name_en}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block mb-2 font-medium">Display Order</label>
                            <input
                                type="number"
                                value={formData.display_order}
                                onChange={(e) => setFormData(prev => ({ ...prev, display_order: parseInt(e.target.value) }))}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                                min="0"
                            />
                        </div>
                        <div>
                            <label className="block mb-2 font-medium">Status *</label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'draft' | 'published' }))}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                            >
                                <option value="draft">Draft</option>
                                <option value="published">Published</option>
                            </select>
                        </div>
                    </div>


                </div>

                {/* Photos Section */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">
                            Album Photos {photos.length > 0 && `(${photos.length})`}
                        </h2>
                        <button
                            type="button"
                            onClick={() => setShowAddPhoto(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
                        >
                            + Add Photo
                        </button>
                    </div>

                    {/* Add Photo Form */}
                    {showAddPhoto && (
                        <div className="border dark:border-gray-700 rounded-lg p-4 mb-4 bg-gray-50 dark:bg-gray-900">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-medium">Add Photo to Album</h3>
                                <button
                                    type="button"
                                    onClick={() => setShowAddPhoto(false)}
                                    className="text-gray-600 dark:text-gray-400 hover:text-gray-800"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="mb-4">
                                <label className="block mb-2 font-medium">Select Image *</label>
                                <MediaPicker
                                    value={photoForm.image_url}
                                    onChange={(media) => {
                                        const url = media
                                            ? Array.isArray(media)
                                                ? media[0]?.cloudfront_url || media[0]?.s3_url || ''
                                                : (media as any)?.cloudfront_url || (media as any)?.s3_url || ''
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
                                    type="button"
                                    onClick={handleAddPhoto}
                                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition"
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
                        </div>
                    )}

                    {/* Photos Grid */}
                    {photos.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                            <p>No photos in this album yet.</p>
                            <button
                                type="button"
                                onClick={() => setShowAddPhoto(true)}
                                className="text-blue-600 hover:underline mt-2"
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
                                    <div className="relative w-full h-32">
                                        <Image
                                            src={photo.image_url}
                                            alt={photo.alt_text_en || photo.title_en || 'Photo'}
                                            fill
                                            className="object-cover"
                                            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                            unoptimized={photo.image_url?.includes('s3.') || photo.image_url?.includes('cloudfront')}
                                        />
                                    </div>
                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition flex items-center justify-center opacity-0 group-hover:opacity-100">
                                        <button
                                            type="button"
                                            onClick={() => openDeleteModal(photo.id, photo.title_en)}
                                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                    {photo.title_en && (
                                        <div className="p-2 bg-white dark:bg-gray-900">
                                            <p className="text-xs font-medium truncate">{photo.title_en}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex gap-4">
                    <button
                        type="submit"
                        disabled={saving}
                        className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                        {saving ? 'Updating...' : 'Update Album'}
                    </button>
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white px-8 py-3 rounded-lg font-semibold transition"
                    >
                        Cancel
                    </button>
                </div>
            </form>

            {/* Delete Photo Confirmation Modal */}
            <ConfirmModal
                isOpen={deleteModal.isOpen}
                onClose={closeDeleteModal}
                onConfirm={handleDeletePhoto}
                title="Delete Photo"
                message={`Are you sure you want to delete "${deleteModal.title}"? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                isLoading={isDeleting}
                variant="danger"
            />
        </div>
    );
}
