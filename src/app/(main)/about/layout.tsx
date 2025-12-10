import { Metadata } from "next";
import { generateMetadata as generateSEO, generatePersonJsonLd, generateBreadcrumbJsonLd, siteConfig } from "@/lib/seo";

export const metadata: Metadata = generateSEO({
    title: "About S M Jahangir Hossain",
    description: "Learn about S M Jahangir Hossain - BNP Joint Convener of Dhaka Metropolitan North, MP Candidate for Dhaka-18 constituency. His biography, political journey, vision, and commitment to serving the people.",
    url: "/about",
    type: "profile",
    tags: [
        "biography",
        "political journey",
        "BNP leader",
        "Dhaka-18",
        "MP candidate",
        "Dhaka Metropolitan North",
        "Joint Convener",
    ],
});

export default function AboutLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Generate JSON-LD for Person
    const personJsonLd = generatePersonJsonLd();

    // Generate JSON-LD for breadcrumb
    const breadcrumbJsonLd = generateBreadcrumbJsonLd([
        { name: "Home", url: "/" },
        { name: "About", url: "/about" },
    ]);

    return (
        <>
            {/* JSON-LD Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
            />
            {children}
        </>
    );
}
