import ChallengeDetailClient from './ChallengeDetailClient';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ChallengeDetailPage({ params }: Props) {
  const { id } = await params;
  return <ChallengeDetailClient challengeId={id} />;
}
