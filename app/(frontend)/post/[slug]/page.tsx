import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { formatPublished } from "@/lib/dates";
import { artworkFrom } from "@/lib/media";
import { pageMetadata } from "@/lib/metadata";
import { getPost, getPosts } from "@/lib/payload";
import { SIZES } from "@/lib/sizes";
import { JournalPost } from "@/components/JournalPost";

type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const post = await getPost((await params).slug);
  if (!post) return {};

  return pageMetadata({
    title: `${post.title} — Loovio`,
    description: post.excerpt.trim(),
    article: {
      // The date, not the timestamp: `article:published_time` read "2021-08-07"
      // before the two journal date strings collapsed into one field, and the
      // seed's midnight-UTC hour is a storage detail, not a publication fact.
      publishedTime: formatPublished(post.published).machine,
      images: [artworkFrom(post.hero).src],
    },
  });
}

export default async function Page({ params }: Params) {
  const post = await getPost((await params).slug);
  if (!post) notFound();

  return (
    <JournalPost
      title={post.title}
      published={post.published}
      excerpt={post.excerpt}
      hero={artworkFrom(post.hero, SIZES.fullWidth)}
      body={post.body}
    />
  );
}
