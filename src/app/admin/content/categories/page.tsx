'use client';

import { useState, useEffect } from 'react';
import { Category } from '@/types/cms';
import toast from 'react-hot-toast';

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name_en: '',
        name_bn: '',
        content_type: 'events' as 'events' | 'news' | 'photos' | 'videos',
        description_en: '',
        description_bn: '',
    });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/admin/categories');
            const result = await response.json();

            if (response.ok) {
                setCategories(result.data || []);
            } else {
                toast.error('Failed to fetch categories');
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
            toast.error('Failed to fetch categories');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const url = editingId
                ? `/api/admin/categories/${editingId}`
                : '/api/admin/categories';

            // Generate slug from name_en
            const slug = formData.name_en
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)+/g, '');

            const payload = {
                ...formData,
                slug,
            };

            const response = await fetch(url, {
                method: editingId ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (response.ok) {
                toast.success(editingId ? 'Category updated' : 'Category created');
                setShowForm(false);
                setEditingId(null);
                setFormData({
                    name_en: '',
                    name_bn: '',
                    content_type: 'events',
                    description_en: '',
                    description_bn: '',
                });
                fetchCategories();
            } else {
                toast.error(result.error || 'Failed to save category');
            }
        } catch (error) {
            console.error('Error saving category:', error);
            toast.error('Failed to save category');
        }
    };

    const handleEdit = (category: Category) => {
        setFormData({
            name_en: category.name_en,
            name_bn: category.name_bn,
            content_type: category.content_type,
            description_en: category.description_en || '',
            description_bn: category.description_bn || '',
        });
        setEditingId(category.id);
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this category?')) return;

        try {
            const response = await fetch(`/api/admin/categories/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                toast.success('Category deleted');
                fetchCategories();
            } else {
                const result = await response.json();
                toast.error(result.error || 'Failed to delete category');
            }
        } catch (error) {
            console.error('Error deleting category:', error);
            toast.error('Failed to delete category');
        }
    };

    const cancelForm = () => {
        setShowForm(false);
        setEditingId(null);
        setFormData({
            name_en: '',
            name_bn: '',
            content_type: 'events',
            description_en: '',
            description_bn: '',
        });
    };

    const groupedCategories = {
        events: categories.filter(c => c.content_type === 'events'),
        news: categories.filter(c => c.content_type === 'news'),
        photos: categories.filter(c => c.content_type === 'photos'),
        videos: categories.filter(c => c.content_type === 'videos'),
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold">Categories</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Manage categories for all content types
                    </p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition"
                >
                    {showForm ? 'Cancel' : 'Add Category'}
                </button>
            </div>

            {/* Add/Edit Form */}
            {showForm && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">
                        {editingId ? 'Edit Category' : 'Add New Category'}
                    </h2>

                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block mb-2 font-medium">Name (English) *</label>
                                <input
                                    type="text"
                                    value={formData.name_en}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name_en: e.target.value }))}
                                    className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block mb-2 font-medium">Name (Bengali) *</label>
                                <input
                                    type="text"
                                    value={formData.name_bn}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name_bn: e.target.value }))}
                                    className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                                    required
                                />
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="block mb-2 font-medium">Content Type *</label>
                            <select
                                value={formData.content_type}
                                onChange={(e) => setFormData(prev => ({ ...prev, content_type: e.target.value as any }))}
                                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                                required
                            >
                                <option value="events">Events</option>
                                <option value="news">News</option>
                                <option value="photos">Photos</option>
                                <option value="videos">Videos</option>
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block mb-2 font-medium">Description (English)</label>
                                <textarea
                                    value={formData.description_en}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description_en: e.target.value }))}
                                    className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 h-20"
                                />
                            </div>
                            <div>
                                <label className="block mb-2 font-medium">Description (Bengali)</label>
                                <textarea
                                    value={formData.description_bn}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description_bn: e.target.value }))}
                                    className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 h-20"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                type="submit"
                                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition"
                            >
                                {editingId ? 'Update' : 'Create'} Category
                            </button>
                            <button
                                type="button"
                                onClick={cancelForm}
                                className="bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white px-6 py-2 rounded-lg transition"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Categories List by Type */}
            {loading ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">Loading categories...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Events Categories */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                        <h3 className="text-lg font-bold mb-4 flex items-center">
                            <span className="text-blue-600 dark:text-blue-400 mr-2">📅</span>
                            Events ({groupedCategories.events.length})
                        </h3>
                        {groupedCategories.events.length === 0 ? (
                            <p className="text-gray-500 text-sm">No categories yet</p>
                        ) : (
                            <div className="space-y-2">
                                {groupedCategories.events.map(cat => (
                                    <div key={cat.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                        <div>
                                            <p className="font-medium">{cat.name_en}</p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">{cat.name_bn}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEdit(cat)}
                                                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition cursor-pointer"
                                                title="Edit"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => handleDelete(cat.id)}
                                                className="text-red-600 hover:text-red-800 dark:text-red-400 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition cursor-pointer"
                                                title="Delete"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* News Categories */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                        <h3 className="text-lg font-bold mb-4 flex items-center">
                            <span className="text-green-600 dark:text-green-400 mr-2">📰</span>
                            News ({groupedCategories.news.length})
                        </h3>
                        {groupedCategories.news.length === 0 ? (
                            <p className="text-gray-500 text-sm">No categories yet</p>
                        ) : (
                            <div className="space-y-2">
                                {groupedCategories.news.map(cat => (
                                    <div key={cat.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                        <div>
                                            <p className="font-medium">{cat.name_en}</p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">{cat.name_bn}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEdit(cat)}
                                                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition cursor-pointer"
                                                title="Edit"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => handleDelete(cat.id)}
                                                className="text-red-600 hover:text-red-800 dark:text-red-400 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition cursor-pointer"
                                                title="Delete"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Photos Categories */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                        <h3 className="text-lg font-bold mb-4 flex items-center">
                            <span className="text-purple-600 dark:text-purple-400 mr-2">🖼️</span>
                            Photos ({groupedCategories.photos.length})
                        </h3>
                        {groupedCategories.photos.length === 0 ? (
                            <p className="text-gray-500 text-sm">No categories yet</p>
                        ) : (
                            <div className="space-y-2">
                                {groupedCategories.photos.map(cat => (
                                    <div key={cat.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                        <div>
                                            <p className="font-medium">{cat.name_en}</p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">{cat.name_bn}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEdit(cat)}
                                                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition cursor-pointer"
                                                title="Edit"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => handleDelete(cat.id)}
                                                className="text-red-600 hover:text-red-800 dark:text-red-400 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition cursor-pointer"
                                                title="Delete"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Videos Categories */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                        <h3 className="text-lg font-bold mb-4 flex items-center">
                            <span className="text-red-600 dark:text-red-400 mr-2">🎥</span>
                            Videos ({groupedCategories.videos.length})
                        </h3>
                        {groupedCategories.videos.length === 0 ? (
                            <p className="text-gray-500 text-sm">No categories yet</p>
                        ) : (
                            <div className="space-y-2">
                                {groupedCategories.videos.map(cat => (
                                    <div key={cat.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                        <div>
                                            <p className="font-medium">{cat.name_en}</p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">{cat.name_bn}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEdit(cat)}
                                                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition cursor-pointer"
                                                title="Edit"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => handleDelete(cat.id)}
                                                className="text-red-600 hover:text-red-800 dark:text-red-400 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition cursor-pointer"
                                                title="Delete"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
