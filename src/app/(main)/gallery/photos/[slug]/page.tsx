import React from 'react';
import { notFound } from 'next/navigation';

interface PhotoItem {
    id: number;
    url: string;
    alt_text?: string;
}

interface AlbumDetail {
    id: number;
    title_en: string;
    slug: string;
    description_en?: string;
    cover_image?: string;
    photos?: PhotoItem[];
    category?: { name_en: string };
}

export const metadata = {
    title: 'Photo Album Detail',
    description: 'Album photos',
};

export default async function AlbumDetailPage({
    params,
}: {
    params: { slug: string };
}) {
    const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/photo-gallery?album=${params.slug}`,
        { cache: 'no-store' }
    );
    if (!res.ok) {
        notFound();
    }
    const album: AlbumDetail = await res.json();

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-4">{album.title_en}</h1>
            {album.description_en && (
                <p className="mb-4">{album.description_en}</p>
            )}
            {album.photos && album.photos.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {album.photos.map((photo) => (
                        <img
                            key={photo.id}
                            src={photo.url}
                            alt={photo.alt_text || album.title_en}
                            className="w-full h-auto object-cover"
                        />
                    ))}
                </div>
            ) : (
                <p>No photos available.</p>
            )}
        </div>
    );
}
