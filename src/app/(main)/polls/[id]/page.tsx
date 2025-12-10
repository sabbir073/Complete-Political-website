import { Metadata } from "next";
import { generateMetadata as generateSeoMetadata, siteConfig, generatePollJsonLd, generateBreadcrumbJsonLd } from "@/lib/seo";
import PollDetailClient from "./PollDetailClient";

interface Props {
  params: Promise<{ id: string }>;
}

// Fetch poll data for metadata
async function getPoll(id: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || siteConfig.url;
    const response = await fetch(`${baseUrl}/api/polls/${id}`, {
      cache: 'no-store',
    });
    if (!response.ok) return null;
    const data = await response.json();
    return data.success ? data.data : null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const poll = await getPoll(id);

  if (!poll) {
    return generateSeoMetadata({
      title: "Poll Not Found",
      description: "The poll you're looking for doesn't exist.",
      url: `/polls/${id}`,
      noIndex: true,
    });
  }

  const title = poll.title_en || "Poll";
  const description = poll.description_en || `Participate in this poll: ${title}. Your opinion matters!`;

  return generateSeoMetadata({
    title: title,
    description: description,
    url: `/polls/${id}`,
    image: "/bnp-welcome.jpg",
    type: "article",
    publishedTime: poll.start_datetime,
    tags: ["poll", "survey", "opinion", "vote", "Dhaka-18"],
  });
}

export default async function PollDetailPage({ params }: Props) {
  const { id } = await params;
  const poll = await getPoll(id);

  const pollJsonLd = poll ? generatePollJsonLd({
    title: poll.title_en,
    description: poll.description_en || "",
    startDate: poll.start_datetime,
    endDate: poll.end_datetime,
    options: poll.poll_options?.map((o: { option_en: string }) => o.option_en) || [],
    url: `/polls/${id}`,
  }) : null;

  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: "Home", url: "/" },
    { name: "Polls & Surveys", url: "/polls" },
    { name: poll?.title_en || "Poll", url: `/polls/${id}` },
  ]);

  return (
    <>
      {pollJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(pollJsonLd) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <PollDetailClient pollId={id} initialPoll={poll} />
    </>
  );
}
