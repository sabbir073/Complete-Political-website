import { Metadata } from "next";
import { generateMetadata as generateSEO, generateBreadcrumbJsonLd, generateImageGalleryJsonLd, siteConfig } from "@/lib/seo";
import AlbumDetailClient from "./AlbumDetailClient";

interface AlbumData {
    id: string;
    name_en: string;
    name_bn?: string;
    slug: string;
    cover_image?: string;
    description_en?: string;
    description_bn?: string;
    photos?: {
        id: string;
        image_url: string;
        title_en?: string;
        title_bn?: string;
        caption_en?: string;
        caption_bn?: string;
        alt_text_en?: string;
        alt_text_bn?: string;
    }[];
    category?: {
        id: string;
        name_en: string;
        name_bn?: string;
    };
    created_at?: string;
}

// Fetch album data for metadata
async function getAlbumData(slug: string): Promise<AlbumData | null> {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || siteConfig.url;
        const res = await fetch(`${baseUrl}/api/photo-gallery?album=${slug}`, {
            cache: 'no-store'
        });

        if (!res.ok) return null;

        const data = await res.json();
        if (data.error) return null;

        return data;
    } catch (error) {
        console.error('Error fetching album:', error);
        return null;
    }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const resolvedParams = await params;
    const album = await getAlbumData(resolvedParams.slug);

    if (!album) {
        return generateSEO({
            title: "Album Not Found",
            description: "The requested photo album could not be found.",
            url: `/gallery/photos/${resolvedParams.slug}`,
            noIndex: true,
        });
    }

    const title = album.name_en;
    const description = album.description_en || `Photo album: ${album.name_en}. Browse ${album.photos?.length || 0} photos from S M Jahangir Hossain's activities.`;
    const image = album.cover_image || (album.photos?.[0]?.image_url) || "/og-default.jpg";

    return generateSEO({
        title,
        description,
        image,
        url: `/gallery/photos/${resolvedParams.slug}`,
        type: "article",
        publishedTime: album.created_at,
        section: "Photo Gallery",
        tags: ["photos", "gallery", "album", album.category?.name_en || ""].filter(Boolean),
    });
}

export default async function AlbumDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const resolvedParams = await params;
    const album = await getAlbumData(resolvedParams.slug);

    // Generate JSON-LD for breadcrumb
    const breadcrumbJsonLd = generateBreadcrumbJsonLd([
        { name: "Home", url: "/" },
        { name: "Photo Gallery", url: "/gallery/photos" },
        { name: album?.name_en || "Album", url: `/gallery/photos/${resolvedParams.slug}` },
    ]);

    // Generate JSON-LD for image gallery
    const galleryJsonLd = album?.photos && album.photos.length > 0
        ? generateImageGalleryJsonLd(
            album.photos.map((photo) => ({
                url: photo.image_url,
                caption: photo.caption_en || photo.title_en || "",
                alt: photo.alt_text_en || photo.title_en || "Photo",
            }))
        )
        : null;

    return (
        <>
            {/* JSON-LD Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
            />
            {galleryJsonLd && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(galleryJsonLd) }}
                />
            )}

            <AlbumDetailClient
                slug={resolvedParams.slug}
                initialAlbum={album}
            />
        </>
    );
}
