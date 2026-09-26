import Link from "next/link";
import { requireOwner } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import ThemeToggle from "@/components/ThemeToggle";
import AdminNav from "./AdminNav";
import { signOut } from "../login/actions";

export const metadata = {
  title: { default: "Admin", template: "%s | Admin" },
  robots: { index: false, follow: false },
};

// Everything under this layout is owner-only. requireOwner() runs on the server for every
// request; the middleware check in src/middleware.js is an extra, earlier gate.
export default async function AdminLayout({ children }) {
  const owner = await requireOwner();
  const { count: unhandled } = await createAdminClient()
    .from("contact_submissions")
    .select("id", { count: "exact", head: true })
    .eq("handled", false);

  return (
    <div className="flex min-h-screen flex-1 flex-col md:flex-row">
      <aside className="border-b border-dark/10 md:sticky md:top-0 md:h-screen md:w-60 md:shrink-0 md:border-b-0 md:border-r dark:border-light/10">
        <div className="flex h-full flex-col gap-4 p-4 md:p-5">
          <div className="flex items-center justify-between">
            <Link href="/admin" className="font-bold">
              Admin
            </Link>
            <ThemeToggle />
          </div>
          <AdminNav unhandled={unhandled ?? 0} />
          <div className="mt-auto flex items-center justify-between gap-4 text-sm md:block md:space-y-3">
            <Link href="/" target="_blank" className="block text-dark/70 hover:underline dark:text-light/70">
              View site ↗
            </Link>
            <p className="hidden truncate text-dark/50 md:block dark:text-light/50" title={owner.email}>
              {owner.email}
            </p>
            <form action={signOut}>
              <button type="submit" className="font-semibold hover:underline">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </aside>
      <main className="min-w-0 flex-1 px-4 py-6 sm:px-8 sm:py-10">{children}</main>
    </div>
  );
}
