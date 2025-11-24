import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface AlbumItem {
    id: number;
    title_en: string;
    slug: string;
    cover_image?: string;
    category?: { name_en: string };
}

export const metadata = {
    title: 'Photo Gallery',
    description: 'Browse photo albums',
};

export default async function PhotoGalleryPage() {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/photo-gallery?limit=20`, {
        cache: 'no-store',
    });
    const { data }: { data: AlbumItem[] } = await res.json();

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Photo Gallery</h1>
            {data && data.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {data.map((album) => (
                        <div key={album.id} className="border rounded overflow-hidden shadow-sm">
                            {album.cover_image && (
                                <div className="relative w-full h-48">
                                    <Image
                                        src={album.cover_image}
                                        alt={album.title_en}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                    />
                                </div>
                            )}
                            <div className="p-4">
                                <h2 className="text-xl font-semibold mb-2">
                                    <Link href={`/gallery/photos/${album.slug}`} className="text-blue-600 hover:underline cursor-pointer">
                                        {album.title_en}
                                    </Link>
                                </h2>
                                <p className="text-gray-500 text-sm">{album.category?.name_en ?? ''}</p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p>No albums found.</p>
            )}
        </div>
    );
}
