import { getPublishedPosts } from "@/lib/posts";
import { absoluteUrl } from "@/lib/site-url";

export const revalidate = 3600;

export default async function sitemap() {
  const posts = await getPublishedPosts();
  const latestPost = posts[0]?.updated_at;

  const pages = [
    { path: "/", priority: 1, changeFrequency: "weekly" },
    { path: "/projects", priority: 0.9, changeFrequency: "weekly" },
    { path: "/about", priority: 0.8, changeFrequency: "monthly" },
    { path: "/resume", priority: 0.7, changeFrequency: "monthly" },
    { path: "/contact", priority: 0.8, changeFrequency: "yearly" },
    { path: "/blog", priority: 0.8, changeFrequency: "weekly", lastModified: latestPost },
  ];

  return [
    ...pages.map(({ path, lastModified, ...rest }) => ({
      url: absoluteUrl(path),
      ...(lastModified && { lastModified }),
      ...rest,
    })),
    ...posts.map((post) => ({
      url: absoluteUrl(`/blog/${post.slug}`),
      lastModified: post.updated_at,
      changeFrequency: "monthly",
      priority: 0.7,
    })),
  ];
}
