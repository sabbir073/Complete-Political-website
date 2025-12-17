import { Metadata } from "next";
import { generateMetadata as generateSEO, generateBreadcrumbJsonLd } from "@/lib/seo";

export const metadata: Metadata = generateSEO({
  title: "Achievements",
  description: "Explore S M Jahangir Hossain's achievements and completed projects for Dhaka-18 constituency. See the impact on community development, education, healthcare, and more.",
  url: "/achievements",
  tags: ["achievements", "accomplishments", "projects", "community development", "Dhaka-18", "impact"],
});

export default function AchievementsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: "Home", url: "/" },
    { name: "Achievements", url: "/achievements" },
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
