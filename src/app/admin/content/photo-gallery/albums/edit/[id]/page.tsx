'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { generateSlug } from '@/lib/cms-utils';
import MediaPicker from '@/components/media/MediaPicker';
import toast from 'react-hot-toast';

export default function EditAlbumPage() {
    const router = useRouter();
    const params = useParams();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);
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
            const result = await response.json();
            if (response.ok) {
                const data = result.data;
                setFormData({
                    name_en: data.name_en,
                    name_bn: data.name_bn,
                    description_en: data.description_en || '',
                    description_bn: data.description_bn || '',
                    cover_image: data.cover_image || '',
                    category_id: data.category_id || '',
                    status: data.status,
                    display_order: data.display_order || 0,
                    slug: data.slug,
                });
            } else {
                toast.error('Failed to fetch album details');
                router.push('/admin/content/photo-gallery/albums');
            }
        } catch (error) {
            console.error('Error fetching album:', error);
            toast.error('Failed to fetch album details');
        } finally {
            setLoading(false);
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
        </div>
    );
}
