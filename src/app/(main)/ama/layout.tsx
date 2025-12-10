import { Metadata } from "next";
import { generateMetadata as generateSEO, generateFAQJsonLd, generateBreadcrumbJsonLd, siteConfig } from "@/lib/seo";

export const metadata: Metadata = generateSEO({
    title: "Ask Me Anything (AMA)",
    description: "Ask S M Jahangir Hossain directly. Get answers to your questions about Dhaka-18 constituency, policies, community issues, and more. Submit questions anonymously or with your name.",
    url: "/ama",
    tags: ["AMA", "Ask Me Anything", "Q&A", "questions", "answers", "Dhaka-18", "community", "public participation"],
});

export default function AMALayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Generate JSON-LD for breadcrumb
    const breadcrumbJsonLd = generateBreadcrumbJsonLd([
        { name: "Home", url: "/" },
        { name: "Ask Me Anything", url: "/ama" },
    ]);

    return (
        <>
            {/* JSON-LD Structured Data for Breadcrumb */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
            />
            {children}
        </>
    );
}
