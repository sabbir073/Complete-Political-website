import { Metadata } from "next";
import { generateMetadata as generateSEO, generateBreadcrumbJsonLd } from "@/lib/seo";

export const metadata: Metadata = generateSEO({
  title: "Promise Tracker",
  description: "Track S M Jahangir Hossain's campaign promises and progress. See completed commitments, ongoing projects, and upcoming plans for Dhaka-18 constituency.",
  url: "/promises",
  tags: ["promises", "commitments", "progress", "accountability", "transparency", "Dhaka-18"],
});

export default function PromisesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: "Home", url: "/" },
    { name: "Promise Tracker", url: "/promises" },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {children}
    </>
  );
}
