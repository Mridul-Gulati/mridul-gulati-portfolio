import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { AdminHeader } from "../../admin-ui";
import PostEditor from "../PostEditor";
import DeleteButton from "../../DeleteButton";
import { deletePost } from "../actions";

export const metadata = { title: "Edit post" };
export const dynamic = "force-dynamic";

export default async function EditPostPage({ params, searchParams }) {
  const { id } = await params;
  const { saved } = await searchParams;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();

  const { data: post } = await createAdminClient().from("posts").select("*").eq("id", id).maybeSingle();
  if (!post) notFound();

  const live = post.status === "published" && new Date(post.published_at) <= new Date();

  return (
    <>
      <AdminHeader
        title="Edit post"
        actions={
          <>
            {live && (
              <Link href={`/blog/${post.slug}`} target="_blank" className="px-2 py-2 text-sm font-semibold hover:underline">
                View live ↗
              </Link>
            )}
            <DeleteButton action={deletePost} id={post.id} label="Delete post" confirmText={`Delete "${post.title}"? This can't be undone.`} />
          </>
        }
      >
        <Link href="/admin/posts" className="hover:underline">
          ← All posts
        </Link>
      </AdminHeader>
      <PostEditor post={post} saved={saved === "1"} />
    </>
  );
}
