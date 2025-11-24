import React from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';

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
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/photo-gallery?album=${slug}`,
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
                        <div key={photo.id} className="relative w-full aspect-square">
                            <Image
                                src={photo.url}
                                alt={photo.alt_text || album.title_en}
                                fill
                                className="object-cover rounded"
                                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            />
                        </div>
                    ))}
                </div>
            ) : (
                <p>No photos available.</p>
            )}
        </div>
    );
}
