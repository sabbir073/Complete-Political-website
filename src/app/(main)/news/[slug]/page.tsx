import { Metadata } from "next";
import { generateMetadata as generateSeoMetadata, siteConfig, generateArticleJsonLd, generateBreadcrumbJsonLd } from "@/lib/seo";
import NewsDetailClient from "./NewsDetailClient";

interface Props {
  params: Promise<{ slug: string }>;
}

// Fetch news data for metadata
async function getNews(slug: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || siteConfig.url;
    const response = await fetch(`${baseUrl}/api/news/${slug}`, {
      cache: 'no-store',
    });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const news = await getNews(slug);

  if (!news) {
    return generateSeoMetadata({
      title: "News Not Found",
      description: "The news article you're looking for doesn't exist.",
      url: `/news/${slug}`,
      noIndex: true,
    });
  }

  const title = news.title_en || "News";
  const description = news.excerpt_en || news.content_en?.replace(/<[^>]*>/g, '').substring(0, 160) || `News: ${title}`;
  const image = news.featured_image || "/bnp-welcome.jpg";

  return generateSeoMetadata({
    title: title,
    description: description,
    url: `/news/${slug}`,
    image: image,
    type: "article",
    publishedTime: news.published_at,
    tags: ["news", news.category?.name_en || "general", "Dhaka-18", "SM Jahangir"],
  });
}

export default async function NewsDetailPage({ params }: Props) {
  const { slug } = await params;
  const news = await getNews(slug);

  const articleJsonLd = news ? generateArticleJsonLd({
    title: news.title_en,
    description: news.excerpt_en || news.content_en?.replace(/<[^>]*>/g, '').substring(0, 160) || "",
    publishedTime: news.published_at,
    modifiedTime: news.updated_at,
    author: news.author_name,
    image: news.featured_image,
    url: `/news/${slug}`,
  }) : null;

  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: "Home", url: "/" },
    { name: "News", url: "/news" },
    { name: news?.title_en || "News", url: `/news/${slug}` },
  ]);

  return (
    <>
      {articleJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <NewsDetailClient slug={slug} initialNews={news} />
    </>
  );
}
