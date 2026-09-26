"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Tag } from "@/components/ui";

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

// Tag filtering happens client-side so the page itself stays statically cached.
// The active tag is mirrored in ?tag= so filtered views can be shared.
export default function BlogList({ posts }) {
  const [activeTag, setActiveTag] = useState(null);
  const tags = useMemo(() => [...new Set(posts.flatMap((p) => p.tags))].sort(), [posts]);
  const visible = activeTag ? posts.filter((p) => p.tags.includes(activeTag)) : posts;

  useEffect(() => {
    const tag = new URLSearchParams(window.location.search).get("tag");
    if (tag && tags.includes(tag)) setActiveTag(tag);
  }, [tags]);

  function choose(tag) {
    setActiveTag(tag);
    window.history.replaceState(null, "", tag ? `?tag=${encodeURIComponent(tag)}` : window.location.pathname);
  }

  if (posts.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-dark/20 p-12 text-center dark:border-light/20">
        <p className="text-lg font-semibold">The first posts are on their way.</p>
      </div>
    );
  }

  return (
    <>
      {tags.length > 0 && (
        <div className="mb-10 flex flex-wrap gap-2" role="group" aria-label="Filter by tag">
          {[null, ...tags].map((tag) => (
            <button
              key={tag ?? "all"}
              type="button"
              onClick={() => choose(tag)}
              aria-pressed={activeTag === tag}
              className="rounded-full border border-dark/15 px-3.5 py-1.5 text-sm font-medium transition-colors hover:border-dark/40 aria-pressed:border-dark aria-pressed:bg-dark aria-pressed:text-light dark:border-light/15 dark:hover:border-light/40 dark:aria-pressed:border-light dark:aria-pressed:bg-light dark:aria-pressed:text-dark"
            >
              {tag ?? "All"}
            </button>
          ))}
        </div>
      )}

      <ul className="grid gap-x-8 gap-y-12 md:grid-cols-2">
        {visible.map((post) => (
          <li key={post.slug}>
            <article className="group flex h-full flex-col">
              <Link href={`/blog/${post.slug}`} className="block space-y-4">
                {post.cover_image && (
                  <div className="relative aspect-[1.91/1] overflow-hidden rounded-2xl bg-dark/5 dark:bg-light/5">
                    <Image
                      src={post.cover_image}
                      alt=""
                      fill
                      sizes="(min-width: 768px) 50vw, 100vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                    />
                  </div>
                )}
                <p className="text-sm text-dark/60 dark:text-light/60">
                  <time dateTime={post.published_at}>{formatDate(post.published_at)}</time> · {post.minutes} min read
                </p>
                <h2 className="text-2xl font-bold tracking-tight group-hover:underline group-hover:decoration-primary group-hover:underline-offset-4 dark:group-hover:decoration-primary-dark">
                  {post.title}
                </h2>
                {post.excerpt && <p className="text-dark/70 dark:text-light/70">{post.excerpt}</p>}
              </Link>
              {post.tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <Tag key={tag}>{tag}</Tag>
                  ))}
                </div>
              )}
            </article>
          </li>
        ))}
      </ul>
    </>
  );
}
