import { Metadata } from "next";
import { generateMetadata as generateSeoMetadata, siteConfig, generateFAQJsonLd, generateBreadcrumbJsonLd } from "@/lib/seo";
import AMAQuestionDetailClient from "./AMAQuestionDetailClient";

interface Props {
  params: Promise<{ questionId: string }>;
}

// Fetch question data for metadata
async function getQuestion(id: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || siteConfig.url;
    const response = await fetch(`${baseUrl}/api/ama/questions/${id}`, {
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
  const { questionId } = await params;
  const question = await getQuestion(questionId);

  if (!question) {
    return generateSeoMetadata({
      title: "Question Not Found",
      description: "The question you're looking for doesn't exist.",
      url: `/ama/${questionId}`,
      noIndex: true,
    });
  }

  // Use the question text as the title
  const questionText = question.question_en || "Question";
  // Truncate title if too long (for OG title)
  const title = questionText.length > 100
    ? questionText.substring(0, 97) + "..."
    : questionText;

  // Use answer as description if available, otherwise use a generic description
  const description = question.answer_en
    ? question.answer_en.substring(0, 200) + (question.answer_en.length > 200 ? "..." : "")
    : `Q&A with S M Jahangir Hossain: ${title}`;

  return generateSeoMetadata({
    title: title,
    description: description,
    url: `/ama/${questionId}`,
    image: "/og-default.jpg",
    type: "article",
    publishedTime: question.created_at,
    modifiedTime: question.answered_at || question.created_at,
    tags: ["AMA", "Q&A", "Ask Me Anything", "Dhaka-18", "S M Jahangir Hossain"],
  });
}

export default async function AMAQuestionPage({ params }: Props) {
  const { questionId } = await params;
  const question = await getQuestion(questionId);

  // Generate JSON-LD for FAQ if question is answered
  const faqJsonLd = question && question.status === 'answered' && question.answer_en
    ? generateFAQJsonLd([{
        question: question.question_en,
        answer: question.answer_en,
      }])
    : null;

  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: "Home", url: "/" },
    { name: "Ask Me Anything", url: "/ama" },
    { name: question?.question_en?.substring(0, 50) || "Question", url: `/ama/${questionId}` },
  ]);

  return (
    <>
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <AMAQuestionDetailClient questionId={questionId} initialQuestion={question} />
    </>
  );
}
