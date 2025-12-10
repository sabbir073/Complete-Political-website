import { Metadata } from "next";

// Site configuration
export const siteConfig = {
  name: "S M Jahangir Hossain",
  shortName: "SM Jahangir",
  description:
    "S M Jahangir Hossain - BNP Nominated MP Candidate for Dhaka-18 Constituency in National Election 2026. Join the movement for change.",
  url: "https://smjahangir.com",
  ogImage: "/og-default.jpg",
  keywords: [
    "S M Jahangir Hossain",
    "SM Jahangir",
    "BNP",
    "Dhaka-18",
    "MP Candidate",
    "National Election 2026",
    "Bangladesh Nationalist Party",
    "Uttara",
    "Dhaka North",
    "Bangladesh Politics",
  ],
  author: "S M Jahangir Hossain",
  twitter: "@smjahangir",
  locale: "en_US",
  alternateLocale: "bn_BD",
};

// Generate base metadata
export function generateMetadata({
  title,
  description,
  image,
  url,
  type = "website",
  publishedTime,
  modifiedTime,
  section,
  tags,
  noIndex = false,
}: {
  title: string;
  description?: string;
  image?: string;
  url?: string;
  type?: "website" | "article" | "profile";
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
  noIndex?: boolean;
}): Metadata {
  const fullTitle = title.includes(siteConfig.shortName)
    ? title
    : `${title} | ${siteConfig.shortName}`;

  const finalDescription = description || siteConfig.description;
  const finalImage = image || siteConfig.ogImage;
  const finalUrl = url ? `${siteConfig.url}${url}` : siteConfig.url;

  const metadata: Metadata = {
    title: fullTitle,
    description: finalDescription,
    keywords: [...siteConfig.keywords, ...(tags || [])],
    authors: [{ name: siteConfig.author }],
    creator: siteConfig.author,
    publisher: siteConfig.author,
    metadataBase: new URL(siteConfig.url),
    alternates: {
      canonical: finalUrl,
      languages: {
        "en-US": finalUrl,
        "bn-BD": `${finalUrl}?lang=bn`,
      },
    },
    openGraph: {
      type: type,
      locale: siteConfig.locale,
      alternateLocale: siteConfig.alternateLocale,
      url: finalUrl,
      siteName: siteConfig.name,
      title: fullTitle,
      description: finalDescription,
      images: [
        {
          url: finalImage.startsWith("http") ? finalImage : `${siteConfig.url}${finalImage}`,
          width: 1200,
          height: 630,
          alt: fullTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: finalDescription,
      images: [finalImage.startsWith("http") ? finalImage : `${siteConfig.url}${finalImage}`],
      creator: siteConfig.twitter,
      site: siteConfig.twitter,
    },
    robots: noIndex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
          },
        },
  };

  // Add article-specific metadata
  if (type === "article" && metadata.openGraph) {
    Object.assign(metadata.openGraph, {
      type: "article",
      publishedTime: publishedTime,
      modifiedTime: modifiedTime,
      section: section,
      tags: tags,
      authors: [siteConfig.author],
    });
  }

  return metadata;
}

// Generate JSON-LD structured data
export function generatePersonJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "S M Jahangir Hossain",
    alternateName: "SM Jahangir",
    description: siteConfig.description,
    image: `${siteConfig.url}/events/event2.jpg`,
    jobTitle: "Joint Convener, BNP Dhaka Metropolitan North",
    worksFor: {
      "@type": "PoliticalParty",
      name: "Bangladesh Nationalist Party (BNP)",
      alternateName: "BNP",
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: "Uttara",
      addressRegion: "Dhaka",
      addressCountry: "Bangladesh",
    },
    url: siteConfig.url,
    sameAs: [
      "https://www.facebook.com/smjahangir",
      "https://twitter.com/smjahangir",
    ],
  };
}

export function generateWebsiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    alternateName: siteConfig.shortName,
    url: siteConfig.url,
    description: siteConfig.description,
    inLanguage: ["en", "bn"],
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteConfig.url}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function generateEventJsonLd(event: {
  title: string;
  description: string;
  startDate: string;
  endDate?: string;
  location?: string;
  image?: string;
  url: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    description: event.description,
    startDate: event.startDate,
    endDate: event.endDate || event.startDate,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: event.location
      ? {
          "@type": "Place",
          name: event.location,
          address: {
            "@type": "PostalAddress",
            addressLocality: "Dhaka",
            addressCountry: "Bangladesh",
          },
        }
      : undefined,
    image: event.image ? `${siteConfig.url}${event.image}` : undefined,
    organizer: {
      "@type": "Person",
      name: siteConfig.name,
      url: siteConfig.url,
    },
    url: `${siteConfig.url}${event.url}`,
  };
}

export function generateArticleJsonLd(article: {
  title: string;
  description: string;
  publishedTime: string;
  modifiedTime?: string;
  author?: string;
  image?: string;
  url: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.description,
    image: article.image ? `${siteConfig.url}${article.image}` : undefined,
    datePublished: article.publishedTime,
    dateModified: article.modifiedTime || article.publishedTime,
    author: {
      "@type": "Person",
      name: article.author || siteConfig.author,
      url: siteConfig.url,
    },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${siteConfig.url}${article.url}`,
    },
  };
}

export function generateBreadcrumbJsonLd(
  items: { name: string; url: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${siteConfig.url}${item.url}`,
    })),
  };
}

// Generate poll/survey JSON-LD
export function generatePollJsonLd(poll: {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  options: string[];
  url: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Quiz",
    name: poll.title,
    description: poll.description,
    dateCreated: poll.startDate,
    expires: poll.endDate,
    about: {
      "@type": "Thing",
      name: "Public Opinion Poll",
    },
    provider: {
      "@type": "Person",
      name: siteConfig.name,
      url: siteConfig.url,
    },
    url: `${siteConfig.url}${poll.url}`,
  };
}

// Generate FAQ JSON-LD for AMA
export function generateFAQJsonLd(
  questions: { question: string; answer: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: questions.map((q) => ({
      "@type": "Question",
      name: q.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: q.answer,
      },
    })),
  };
}

// Generate image gallery JSON-LD
export function generateImageGalleryJsonLd(
  images: { url: string; caption: string; alt: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "ImageGallery",
    name: "Photo Gallery - S M Jahangir Hossain",
    description: "Photos from events, rallies, and activities of S M Jahangir Hossain",
    image: images.map((img) => ({
      "@type": "ImageObject",
      contentUrl: img.url.startsWith("http") ? img.url : `${siteConfig.url}${img.url}`,
      caption: img.caption,
      description: img.alt,
    })),
    author: {
      "@type": "Person",
      name: siteConfig.name,
    },
  };
}
