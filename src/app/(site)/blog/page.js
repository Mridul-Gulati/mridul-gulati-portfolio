import { getPublishedPosts } from "@/lib/posts";
import { pageMetadata } from "@/lib/seo";
import { Container, PageHeader } from "@/components/ui";
import BlogList from "@/components/blog/BlogList";

export const metadata = pageMetadata({
  title: "Blog",
  description: "Notes on building production AI agents: orchestration, evaluation, guardrails, cost and the things that break.",
  path: "/blog",
});

// Cached; admin saves refresh it immediately (see revalidateBlog), this is the fallback.
export const revalidate = 300;

export default async function BlogPage() {
  const posts = await getPublishedPosts();

  return (
    <Container>
      <PageHeader eyebrow="Blog" title="Notes from building agents in production.">
        What works, what breaks, and what I&apos;d do differently: orchestration, evaluation, guardrails
        and cost.
      </PageHeader>
      <BlogList posts={posts} />
    </Container>
  );
}
