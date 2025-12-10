import { Metadata } from "next";
import { generateMetadata as generateSeoMetadata, siteConfig, generateEventJsonLd, generateBreadcrumbJsonLd } from "@/lib/seo";
import EventDetailClient from "./EventDetailClient";

interface Props {
  params: Promise<{ slug: string }>;
}

// Fetch event data for metadata
async function getEvent(slug: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || siteConfig.url;
    const response = await fetch(`${baseUrl}/api/events/${slug}`, {
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
  const event = await getEvent(slug);

  if (!event) {
    return generateSeoMetadata({
      title: "Event Not Found",
      description: "The event you're looking for doesn't exist.",
      url: `/events/${slug}`,
      noIndex: true,
    });
  }

  const title = event.title_en || "Event";
  const description = event.excerpt_en || event.description_en?.replace(/<[^>]*>/g, '').substring(0, 160) || `Event: ${title}`;
  const image = event.featured_image || "/og-events.jpg";

  return generateSeoMetadata({
    title: title,
    description: description,
    url: `/events/${slug}`,
    image: image,
    type: "article",
    publishedTime: event.published_at || event.event_date,
    tags: ["event", event.category?.name_en || "general", "Dhaka-18", "SM Jahangir"],
  });
}

export default async function EventDetailPage({ params }: Props) {
  const { slug } = await params;
  const event = await getEvent(slug);

  const eventJsonLd = event ? generateEventJsonLd({
    title: event.title_en,
    description: event.excerpt_en || event.description_en?.replace(/<[^>]*>/g, '').substring(0, 160) || "",
    startDate: event.event_date,
    endDate: event.event_end_date,
    location: event.location_en,
    image: event.featured_image,
    url: `/events/${slug}`,
  }) : null;

  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: "Home", url: "/" },
    { name: "Events", url: "/events" },
    { name: event?.title_en || "Event", url: `/events/${slug}` },
  ]);

  return (
    <>
      {eventJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(eventJsonLd) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <EventDetailClient slug={slug} initialEvent={event} />
    </>
  );
}
