import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { site } from "@/data/site";
import { formatDate, getPublishedPost, getPublishedPosts } from "@/lib/posts";
import { pageMetadata } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site-url";
import { ButtonLink, Container, Tag } from "@/components/ui";
import { ArrowRightIcon } from "@/components/icons";
import { Avatar } from "@/components/Headshot";
import Markdown from "@/components/Markdown";
import ViewCounter from "@/components/blog/ViewCounter";

export const revalidate = 300;

// Pre-render every published post at build time; new ones render on first visit.
export async function generateStaticParams() {
  const posts = await getPublishedPosts();
  return posts.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = await getPublishedPost(slug);
  if (!post) return { title: "Post not found", robots: { index: false } };

  return pageMetadata({
    title: post.title,
    description: post.excerpt || `${post.title}, by ${site.name}.`,
    path: `/blog/${post.slug}`,
    type: "article",
    // The share image is the branded card from ./opengraph-image.js.
    openGraph: {
      publishedTime: post.published_at,
      modifiedTime: post.updated_at,
      authors: [site.name],
      tags: post.tags,
    },
  });
}

export default async function PostPage({ params }) {
  const { slug } = await params;
  const post = await getPublishedPost(slug);
  if (!post) notFound();

  const url = absoluteUrl(`/blog/${post.slug}`);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt || undefined,
    image: post.cover_image || absoluteUrl(`/blog/${post.slug}/opengraph-image`),
    datePublished: post.published_at,
    dateModified: post.updated_at,
    author: { "@type": "Person", name: site.name, url: absoluteUrl("/about") },
    publisher: { "@type": "Person", name: site.name },
    mainEntityOfPage: url,
    keywords: post.tags.join(", ") || undefined,
  };

  return (
    <Container className="max-w-3xl">
      <script
        type="application/ld+json"
        // JSON-LD must be inline; escape "<" so post content can't close the script tag.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <ViewCounter slug={post.slug} />

      <article className="pb-8 pt-12 sm:pt-20">
        <Link href="/blog" className="text-sm font-semibold text-dark/60 hover:underline dark:text-light/60">
          ← All posts
        </Link>

        <header className="mt-6 space-y-5">
          <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl">{post.title}</h1>
          {post.excerpt && <p className="text-xl text-dark/70 dark:text-light/70">{post.excerpt}</p>}
          <div className="flex items-center gap-3 text-sm text-dark/70 dark:text-light/70">
            <Avatar size={40} />
            <div>
              <p className="font-semibold text-dark dark:text-light">{site.name}</p>
              <p>
                <time dateTime={post.published_at}>{formatDate(post.published_at)}</time> · {post.minutes} min read
              </p>
            </div>
          </div>
        </header>

        {post.cover_image && (
          <div className="relative mt-10 aspect-[1.91/1] overflow-hidden rounded-2xl bg-dark/5 dark:bg-light/5">
            <Image src={post.cover_image} alt="" fill priority sizes="(min-width: 768px) 48rem, 100vw" className="object-cover" />
          </div>
        )}

        <Markdown className="mt-10">{post.body}</Markdown>

        {post.tags.length > 0 && (
          <div className="mt-12 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Link key={tag} href={`/blog?tag=${encodeURIComponent(tag)}`}>
                <Tag>{tag}</Tag>
              </Link>
            ))}
          </div>
        )}
      </article>

      <aside className="mt-8 flex flex-col gap-5 rounded-2xl border border-dark/10 bg-white p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8 dark:border-light/10 dark:bg-white/5">
        <div>
          <p className="text-lg font-bold">Building something like this?</p>
          <p className="text-dark/70 dark:text-light/70">I help teams take agents from prototype to production.</p>
        </div>
        <ButtonLink href="/contact" className="shrink-0">
          Get in touch <ArrowRightIcon />
        </ButtonLink>
      </aside>
    </Container>
  );
}
