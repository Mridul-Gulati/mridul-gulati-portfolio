import Link from "next/link";
import { AdminHeader } from "../../admin-ui";
import PostEditor from "../PostEditor";

export const metadata = { title: "New post" };

export default function NewPostPage() {
  return (
    <>
      <AdminHeader title="New post">
        <Link href="/admin/posts" className="hover:underline">
          ← All posts
        </Link>
      </AdminHeader>
      <PostEditor />
    </>
  );
}
