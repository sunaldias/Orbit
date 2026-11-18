import { permanentRedirect } from "next/navigation";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function LegacyWorkDetailRedirect({ params }: PageProps) {
  const { slug } = await params;
  permanentRedirect(`/portfolio/${slug}`);
}
