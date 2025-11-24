'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { generateSlug, extractYouTubeId } from '@/lib/cms-utils';
import MediaPicker from '@/components/media/MediaPicker';
import toast from 'react-hot-toast';

export default function EditVideoPage() {
    const router = useRouter();
    const params = useParams();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        title_en: '',
        title_bn: '',
        description_en: '',
        description_bn: '',
        youtube_url: '',
        custom_thumbnail: '',
        category_id: '',
        status: 'draft' as 'draft' | 'published',
        is_featured: false,
        display_order: 0,
        slug: '',
        meta_title_en: '',
        meta_title_bn: '',
        meta_description_en: '',
        meta_description_bn: '',
    });

    useEffect(() => {
        fetchCategories();
        fetchVideo();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await fetch('/api/admin/categories?content_type=videos');
            const result = await response.json();
            if (response.ok) {
                setCategories(result.data || []);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchVideo = async () => {
        try {
            const response = await fetch(`/api/admin/video-gallery/${params.id}`);
            const result = await response.json();
            if (response.ok) {
                const data = result.data;
                setFormData({
                    title_en: data.title_en,
                    title_bn: data.title_bn,
                    description_en: data.description_en || '',
                    description_bn: data.description_bn || '',
                    youtube_url: data.youtube_url || '',
                    custom_thumbnail: data.custom_thumbnail || '',
                    category_id: data.category_id || '',
                    status: data.status,
                    is_featured: data.is_featured || false,
                    display_order: data.display_order || 0,
                    slug: data.slug,
                    meta_title_en: data.meta_title_en || '',
                    meta_title_bn: data.meta_title_bn || '',
                    meta_description_en: data.meta_description_en || '',
                    meta_description_bn: data.meta_description_bn || '',
                });
            } else {
                toast.error('Failed to fetch video details');
                router.push('/admin/content/video-gallery');
            }
        } catch (error) {
            console.error('Error fetching video:', error);
            toast.error('Failed to fetch video details');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            // Validate YouTube URL
            const youtubeId = extractYouTubeId(formData.youtube_url);
            if (!youtubeId) {
                toast.error('Invalid YouTube URL');
                setSaving(false);
                return;
            }

            const response = await fetch(`/api/admin/video-gallery/${params.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const result = await response.json();

            if (response.ok) {
                toast.success('Video updated successfully');
                router.push('/admin/content/video-gallery');
            } else {
                toast.error(result.error || 'Failed to update video');
            }
        } catch (error) {
            console.error('Error updating video:', error);
            toast.error('Failed to update video');
        } finally {
            setSaving(false);
        }
    };

    const handleTitleChange = (value: string, lang: 'en' | 'bn') => {
        setFormData(prev => ({
            ...prev,
            [`title_${lang}`]: value,
            ...(lang === 'en' ? { slug: generateSlug(value) } : {}),
        }));
    };

    if (loading) {
        return (
            <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
                <p className="mt-4 text-gray-600 dark:text-gray-400">Loading video details...</p>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold">Edit Video</h1>
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="text-gray-600 hover:text-gray-800 dark:text-gray-400"
                >
                    ← Back
                </button>
            </div>

            <form onSubmit={handleSubmit} className="max-w-5xl">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">Video Details</h2>

                    <div className="mb-4">
                        <label className="block mb-2 font-medium">YouTube URL *</label>
                        <input
                            type="url"
                            value={formData.youtube_url}
                            onChange={(e) => setFormData(prev => ({ ...prev, youtube_url: e.target.value }))}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                            placeholder="https://www.youtube.com/watch?v=..."
                            required
                        />
                        {formData.youtube_url && extractYouTubeId(formData.youtube_url) && (
                            <p className="text-sm text-green-600 mt-1">
                                ✓ Valid YouTube URL - ID: {extractYouTubeId(formData.youtube_url)}
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block mb-2 font-medium">Title (English) *</label>
                            <input
                                type="text"
                                value={formData.title_en}
                                onChange={(e) => handleTitleChange(e.target.value, 'en')}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                                required
                            />
                        </div>
                        <div>
                            <label className="block mb-2 font-medium">Title (Bengali) *</label>
                            <input
                                type="text"
                                value={formData.title_bn}
                                onChange={(e) => handleTitleChange(e.target.value, 'bn')}
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
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white h-32"
                            />
                        </div>
                        <div>
                            <label className="block mb-2 font-medium">Description (Bengali)</label>
                            <textarea
                                value={formData.description_bn}
                                onChange={(e) => setFormData(prev => ({ ...prev, description_bn: e.target.value }))}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white h-32"
                            />
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="block mb-2 font-medium">Custom Thumbnail (Optional)</label>
                        <p className="text-sm text-gray-500 mb-2">Leave empty to use YouTube's default thumbnail</p>
                        <MediaPicker
                            value={formData.custom_thumbnail}
                            onChange={(media) => {
                                const url = Array.isArray(media)
                                    ? media[0]?.cloudfront_url || media[0]?.s3_url
                                    : (media as any)?.cloudfront_url || (media as any)?.s3_url;
                                setFormData(prev => ({ ...prev, custom_thumbnail: url || '' }));
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

                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center px-4 py-2">
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.is_featured}
                                    onChange={(e) => setFormData(prev => ({ ...prev, is_featured: e.target.checked }))}
                                    className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                                />
                                <span className="ml-2 font-medium">Featured Video</span>
                            </label>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">SEO Settings</h2>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block mb-2 font-medium">Meta Title (English)</label>
                            <input
                                type="text"
                                value={formData.meta_title_en}
                                onChange={(e) => setFormData(prev => ({ ...prev, meta_title_en: e.target.value }))}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block mb-2 font-medium">Meta Title (Bengali)</label>
                            <input
                                type="text"
                                value={formData.meta_title_bn}
                                onChange={(e) => setFormData(prev => ({ ...prev, meta_title_bn: e.target.value }))}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block mb-2 font-medium">Meta Description (English)</label>
                            <textarea
                                value={formData.meta_description_en}
                                onChange={(e) => setFormData(prev => ({ ...prev, meta_description_en: e.target.value }))}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white h-20"
                            />
                        </div>
                        <div>
                            <label className="block mb-2 font-medium">Meta Description (Bengali)</label>
                            <textarea
                                value={formData.meta_description_bn}
                                onChange={(e) => setFormData(prev => ({ ...prev, meta_description_bn: e.target.value }))}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white h-20"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex gap-4">
                    <button
                        type="submit"
                        disabled={saving}
                        className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                        {saving ? 'Updating...' : 'Update Video'}
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
