import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { AdminHeader, EmptyState, StatusPill } from "../admin-ui";
import { setHandled } from "./actions";

export const metadata = { title: "Contacts" };
export const dynamic = "force-dynamic";

const formatDateTime = (iso) =>
  new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" });

export default async function AdminContactsPage({ searchParams }) {
  const { show } = await searchParams;
  const showAll = show === "all";

  let query = createAdminClient()
    .from("contact_submissions")
    .select("id, name, email, company, requirement_type, message, handled, created_at")
    .order("created_at", { ascending: false })
    .limit(200);
  if (!showAll) query = query.eq("handled", false);
  const { data: submissions } = await query;

  return (
    <>
      <AdminHeader
        title="Contacts"
        actions={
          <div className="flex rounded-lg border border-dark/15 text-sm dark:border-light/15">
            {[
              ["New", "/admin/contacts", !showAll],
              ["All", "/admin/contacts?show=all", showAll],
            ].map(([label, href, active]) => (
              <Link
                key={label}
                href={href}
                aria-current={active ? "page" : undefined}
                className="px-4 py-2 aria-[current=page]:bg-dark aria-[current=page]:text-light dark:aria-[current=page]:bg-light dark:aria-[current=page]:text-dark"
              >
                {label}
              </Link>
            ))}
          </div>
        }
      >
        Enquiries from the contact form. Times shown in IST.
      </AdminHeader>

      {submissions?.length ? (
        <ul className="space-y-4">
          {submissions.map((s) => (
            <li key={s.id} className="rounded-2xl border border-dark/10 bg-white p-5 dark:border-light/10 dark:bg-white/5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">
                    {s.name}
                    {s.company && <span className="font-normal text-dark/60 dark:text-light/60"> · {s.company}</span>}
                  </p>
                  <p className="text-sm text-dark/60 dark:text-light/60">
                    <a href={`mailto:${s.email}?subject=${encodeURIComponent(`Re: ${s.requirement_type}`)}`} className="font-medium text-primary hover:underline dark:text-primary-dark">
                      {s.email}
                    </a>
                    {" · "}
                    {formatDateTime(s.created_at)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusPill>{s.requirement_type}</StatusPill>
                  <form action={setHandled}>
                    <input type="hidden" name="id" value={s.id} />
                    <input type="hidden" name="handled" value={String(!s.handled)} />
                    <button
                      type="submit"
                      className="rounded-lg border border-dark/15 px-3 py-1.5 text-sm font-semibold hover:bg-dark/5 dark:border-light/15 dark:hover:bg-light/10"
                    >
                      {s.handled ? "Mark as new" : "Mark handled"}
                    </button>
                  </form>
                </div>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-dark/80 dark:text-light/80">{s.message}</p>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState>{showAll ? "No enquiries yet." : "All caught up. No new enquiries."}</EmptyState>
      )}
    </>
  );
}
