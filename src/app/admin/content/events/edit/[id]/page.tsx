'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import MediaPicker from '@/components/media/MediaPicker';
import toast from 'react-hot-toast';

export default function EditEventPage() {
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
        excerpt_en: '',
        excerpt_bn: '',
        event_date: '',
        event_end_date: '',
        location_en: '',
        location_bn: '',
        featured_image: '',
        featured_image_alt_en: '',
        featured_image_alt_bn: '',
        category_id: '',
        status: 'draft' as 'draft' | 'published',
        slug: '',
        meta_title_en: '',
        meta_title_bn: '',
        meta_description_en: '',
        meta_description_bn: '',
    });

    useEffect(() => {
        fetchEvent();
        fetchCategories();
    }, []);

    // Helper function to format date for datetime-local input in Bangladesh timezone
    const formatDateForInput = (dateString: string | null): string => {
        if (!dateString) return '';
        const date = new Date(dateString);
        // Format in Bangladesh timezone (Asia/Dhaka)
        const options: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
            timeZone: 'Asia/Dhaka'
        };
        const parts = new Intl.DateTimeFormat('en-CA', options).formatToParts(date);
        const get = (type: string) => parts.find(p => p.type === type)?.value || '00';
        return `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}`;
    };

    const fetchEvent = async () => {
        try {
            const response = await fetch(`/api/admin/events/${params.id as string}`);
            const event = await response.json();

            if (response.ok) {
                // Format dates for datetime-local input (in Bangladesh timezone)
                const eventDate = formatDateForInput(event.event_date);
                const eventEndDate = formatDateForInput(event.event_end_date);

                setFormData({
                    title_en: event.title_en || '',
                    title_bn: event.title_bn || '',
                    description_en: event.description_en || '',
                    description_bn: event.description_bn || '',
                    excerpt_en: event.excerpt_en || '',
                    excerpt_bn: event.excerpt_bn || '',
                    event_date: eventDate,
                    event_end_date: eventEndDate,
                    location_en: event.location_en || '',
                    location_bn: event.location_bn || '',
                    featured_image: event.featured_image || '',
                    featured_image_alt_en: event.featured_image_alt_en || '',
                    featured_image_alt_bn: event.featured_image_alt_bn || '',
                    category_id: event.category_id || '',
                    status: event.status || 'draft',
                    slug: event.slug || '',
                    meta_title_en: event.meta_title_en || '',
                    meta_title_bn: event.meta_title_bn || '',
                    meta_description_en: event.meta_description_en || '',
                    meta_description_bn: event.meta_description_bn || '',
                });
                setLoading(false);
            } else {
                toast.error('Failed to load event');
                router.push('/admin/content/events');
            }
        } catch (error) {
            console.error('Error fetching event:', error);
            toast.error('Failed to load event');
            router.push('/admin/content/events');
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await fetch('/api/admin/categories?content_type=events');
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
        setSaving(true);

        try {
            const response = await fetch(`/api/admin/events/${params.id as string}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const result = await response.json();

            if (response.ok) {
                toast.success('Event updated successfully');
                router.push('/admin/content/events');
            } else {
                toast.error(result.error || 'Failed to update event');
            }
        } catch (error) {
            console.error('Error updating event:', error);
            toast.error('Failed to update event');
        } finally {
            setSaving(false);
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
                <h1 className="text-3xl font-bold">Edit Event</h1>
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="text-gray-600 hover:text-gray-800 dark:text-gray-400"
                >
                    ← Back
                </button>
            </div>

            <form onSubmit={handleSubmit} className="max-w-5xl">
                {/* Basic Information */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">Event Details</h2>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block mb-2 font-medium">Title (English) *</label>
                            <input
                                type="text"
                                value={formData.title_en}
                                onChange={(e) => setFormData(prev => ({ ...prev, title_en: e.target.value }))}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                                required
                            />
                        </div>
                        <div>
                            <label className="block mb-2 font-medium">Title (Bengali) *</label>
                            <input
                                type="text"
                                value={formData.title_bn}
                                onChange={(e) => setFormData(prev => ({ ...prev, title_bn: e.target.value }))}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block mb-2 font-medium">Description (English) *</label>
                            <textarea
                                value={formData.description_en}
                                onChange={(e) => setFormData(prev => ({ ...prev, description_en: e.target.value }))}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white h-32"
                                required
                            />
                        </div>
                        <div>
                            <label className="block mb-2 font-medium">Description (Bengali) *</label>
                            <textarea
                                value={formData.description_bn}
                                onChange={(e) => setFormData(prev => ({ ...prev, description_bn: e.target.value }))}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white h-32"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block mb-2 font-medium">Excerpt (English)</label>
                            <textarea
                                value={formData.excerpt_en}
                                onChange={(e) => setFormData(prev => ({ ...prev, excerpt_en: e.target.value }))}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white h-20"
                            />
                        </div>
                        <div>
                            <label className="block mb-2 font-medium">Excerpt (Bengali)</label>
                            <textarea
                                value={formData.excerpt_bn}
                                onChange={(e) => setFormData(prev => ({ ...prev, excerpt_bn: e.target.value }))}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white h-20"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block mb-2 font-medium">Event Date *</label>
                            <input
                                type="datetime-local"
                                value={formData.event_date}
                                onChange={(e) => setFormData(prev => ({ ...prev, event_date: e.target.value }))}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                                required
                            />
                        </div>
                        <div>
                            <label className="block mb-2 font-medium">Event End Date</label>
                            <input
                                type="datetime-local"
                                value={formData.event_end_date}
                                onChange={(e) => setFormData(prev => ({ ...prev, event_end_date: e.target.value }))}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block mb-2 font-medium">Location (English)</label>
                            <input
                                type="text"
                                value={formData.location_en}
                                onChange={(e) => setFormData(prev => ({ ...prev, location_en: e.target.value }))}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block mb-2 font-medium">Location (Bengali)</label>
                            <input
                                type="text"
                                value={formData.location_bn}
                                onChange={(e) => setFormData(prev => ({ ...prev, location_bn: e.target.value }))}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="block mb-2 font-medium">Featured Image</label>
                        <MediaPicker
                            value={formData.featured_image}
                            onChange={(media) => {
                                const url = Array.isArray(media)
                                    ? media[0]?.cloudfront_url || media[0]?.s3_url
                                    : (media as any)?.cloudfront_url || (media as any)?.s3_url;
                                setFormData(prev => ({ ...prev, featured_image: url || '' }));
                            }}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
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

                {/* SEO Section */}
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

                    <div className="grid grid-cols-2 gap-4 mb-4">
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

                {/* Submit Buttons */}
                <div className="flex gap-4">
                    <button
                        type="submit"
                        disabled={saving}
                        className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                        {saving ? 'Updating...' : 'Update Event'}
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
