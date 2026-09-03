import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JOURNAL_POSTS, findJournalPost } from "@/lib/journal";
import { pageMetadata } from "@/lib/metadata";
import { JournalPost } from "@/components/JournalPost";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return JOURNAL_POSTS.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const post = findJournalPost((await params).slug);
  if (!post) return {};

  return pageMetadata({
    title: `${post.title} — Loovio`,
    description: post.excerpt.trim(),
    article: { publishedTime: post.published, images: [post.hero.src] },
  });
}

export default async function Page({ params }: Params) {
  const post = findJournalPost((await params).slug);
  if (!post) notFound();

  return <JournalPost {...post} />;
}
