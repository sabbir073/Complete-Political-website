import { Metadata } from "next";
import { generateMetadata as generateSeoMetadata } from "@/lib/seo";

export const metadata: Metadata = generateSeoMetadata({
  title: "Polls & Surveys",
  description: "Participate in polls and surveys. Your opinion matters! Share your views on important issues affecting Dhaka-18 constituency.",
  url: "/polls",
  image: "/og-polls.jpg",
  tags: ["polls", "surveys", "opinion", "vote", "democracy", "Dhaka-18"],
});

export default function PollsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
