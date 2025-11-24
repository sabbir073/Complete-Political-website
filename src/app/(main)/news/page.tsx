import React from 'react';
import Link from 'next/link';

interface NewsItem {
    id: number;
    title_en: string;
    slug: string;
    published_at: string;
    category?: { name_en: string };
    featured_image?: string;
}

export const metadata = {
    title: 'News',
    description: 'Latest news articles',
};

export default async function NewsPage() {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/news?limit=100`, {
        cache: 'no-store',
    });
    const { data }: { data: NewsItem[] } = await res.json();

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">News</h1>
            {data && data.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {data.map((item) => (
                        <div key={item.id} className="border rounded overflow-hidden shadow-sm">
                            {item.featured_image && (
                                <img src={item.featured_image} alt={item.title_en} className="w-full h-48 object-cover" />
                            )}
                            <div className="p-4">
                                <h2 className="text-xl font-semibold mb-2">
                                    <Link href={`/news/${item.slug}`} className="text-blue-600 hover:underline cursor-pointer">
                                        {item.title_en}
                                    </Link>
                                </h2>
                                <p className="text-gray-500 text-sm mb-2">
                                    {new Date(item.published_at).toLocaleDateString()}
                                </p>
                                <p className="text-gray-700">{item.category?.name_en ?? ''}</p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p>No news articles found.</p>
            )}
        </div>
    );
}
