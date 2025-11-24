import React from 'react';
import { notFound } from 'next/navigation';

interface NewsDetail {
    id: number;
    title_en: string;
    slug: string;
    published_at: string;
    content_en?: string;
    featured_image?: string;
    category?: { name_en: string };
}

export const metadata = {
    title: 'News Detail',
    description: 'Full news article',
};

export default async function NewsDetailPage({
    params,
}: {
    params: { slug: string };
}) {
    const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/news/${params.slug}`,
        { cache: 'no-store' }
    );
    if (!res.ok) {
        notFound();
    }
    const news: NewsDetail = await res.json();

    return (
        <div className="p-6 max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold mb-4">{news.title_en}</h1>
            <p className="text-gray-600 mb-2">
                {new Date(news.published_at).toLocaleDateString()}
                {news.category?.name_en ? ` • ${news.category.name_en}` : ''}
            </p>
            {news.featured_image && (
                <img src={news.featured_image} alt={news.title_en} className="w-full mb-4" />
            )}
            {news.content_en && (
                <div className="prose" dangerouslySetInnerHTML={{ __html: news.content_en }} />
            )}
        </div>
    );
}
