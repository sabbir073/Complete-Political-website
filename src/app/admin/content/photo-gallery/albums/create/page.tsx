'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { generateSlug } from '@/lib/cms-utils';
import MediaPicker from '@/components/media/MediaPicker';
import toast from 'react-hot-toast';

interface PendingPhoto {
    id: string;
    title_en: string;
    title_bn: string;
    caption_en: string;
    caption_bn: string;
    image_url: string;
    alt_text_en: string;
    alt_text_bn: string;
}

export default function CreateAlbumPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);
    const [pendingPhotos, setPendingPhotos] = useState<PendingPhoto[]>([]);
    const [showAddPhoto, setShowAddPhoto] = useState(false);
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch('/api/admin/photo-gallery/albums', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const result = await response.json();

            if (response.ok) {
                const albumId = result.id;

                // If there are pending photos, add them to the album
                if (pendingPhotos.length > 0) {
                    let photosAdded = 0;
                    for (const photo of pendingPhotos) {
                        try {
                            const photoResponse = await fetch('/api/admin/photo-gallery/photos', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    ...photo,
                                    album_id: albumId,
                                    category_id: formData.category_id,
                                }),
                            });
                            if (photoResponse.ok) {
                                photosAdded++;
                            }
                        } catch (error) {
                            console.error('Error adding photo:', error);
                        }
                    }
                    toast.success(`Album created with ${photosAdded} photo(s)`);
                } else {
                    toast.success('Album created successfully');
                }

                router.push('/admin/content/photo-gallery/albums');
            } else {
                toast.error(result.error || 'Failed to create album');
            }
        } catch (error) {
            console.error('Error creating album:', error);
            toast.error('Failed to create album');
        } finally {
            setLoading(false);
        }
    };

    const handleAddPendingPhoto = () => {
        if (!photoForm.image_url) {
            toast.error('Please select an image');
            return;
        }

        const newPhoto: PendingPhoto = {
            id: Date.now().toString(),
            ...photoForm,
        };

        setPendingPhotos(prev => [...prev, newPhoto]);
        setPhotoForm({
            title_en: '',
            title_bn: '',
            caption_en: '',
            caption_bn: '',
            image_url: '',
            alt_text_en: '',
            alt_text_bn: '',
        });
        setShowAddPhoto(false);
        toast.success('Photo added to queue');
    };

    const handleRemovePendingPhoto = (id: string) => {
        setPendingPhotos(prev => prev.filter(photo => photo.id !== id));
        toast.success('Photo removed from queue');
    };

    const handleNameChange = (value: string, lang: 'en' | 'bn') => {
        setFormData(prev => ({
            ...prev,
            [`name_${lang}`]: value,
            ...(lang === 'en' ? { slug: generateSlug(value) } : {}),
        }));
    };

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold">Create Album</h1>
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
                            Album Photos {pendingPhotos.length > 0 && `(${pendingPhotos.length})`}
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
                                    onClick={handleAddPendingPhoto}
                                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition"
                                >
                                    Add to Album
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

                    {/* Pending Photos Grid */}
                    {pendingPhotos.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                            <p>No photos added yet.</p>
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
                            {pendingPhotos.map((photo) => (
                                <div
                                    key={photo.id}
                                    className="relative group border dark:border-gray-700 rounded-lg overflow-hidden"
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
                                    <div className="absolute top-1 right-1">
                                        <button
                                            type="button"
                                            onClick={() => handleRemovePendingPhoto(photo.id)}
                                            className="bg-red-600 hover:bg-red-700 text-white p-1 rounded-full text-xs"
                                            title="Remove photo"
                                        >
                                            ✕
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
                        disabled={loading}
                        className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                        {loading ? 'Creating...' : pendingPhotos.length > 0 ? `Create Album with ${pendingPhotos.length} Photo(s)` : 'Create Album'}
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
        </div>
    );
}
