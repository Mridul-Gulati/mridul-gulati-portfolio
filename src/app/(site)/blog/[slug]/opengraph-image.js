import { ogCard, ogSize } from "@/lib/og-card";
import { getPublishedPost, readingMinutes } from "@/lib/posts";

export const alt = "Blog post by Mridul Gulati";
export const size = ogSize;
export const contentType = "image/png";
export const revalidate = 300;

export default async function Image({ params }) {
  const { slug } = await params;
  const post = await getPublishedPost(slug);
  return ogCard({
    eyebrow: "Blog",
    title: post?.title ?? "Notes from building agents in production",
    footer: post ? `Mridul Gulati · ${readingMinutes(post.body)} min read` : undefined,
  });
}
