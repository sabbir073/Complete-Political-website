import { Metadata } from "next";
import { generateMetadata as generateSEO } from "@/lib/seo";

export const metadata: Metadata = generateSEO({
    title: "Photo Gallery",
    description: "Browse photo albums from S M Jahangir Hossain's political events, rallies, community meetings, and activities in Dhaka-18 constituency.",
    url: "/gallery/photos",
    tags: ["photos", "gallery", "events", "rallies", "Dhaka-18", "BNP"],
});

export default function PhotoGalleryLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
