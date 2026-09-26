import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { AdminHeader, plural } from "../../admin-ui";
import AgentForm from "../AgentForm";
import DeleteButton from "../../DeleteButton";
import { deleteAgent } from "../actions";

export const metadata = { title: "Edit agent" };
export const dynamic = "force-dynamic";

export default async function EditAgentPage({ params, searchParams }) {
  const { id } = await params;
  const { saved } = await searchParams;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();

  const { data: agent } = await createAdminClient().from("agents").select("*").eq("id", id).maybeSingle();
  if (!agent) notFound();

  return (
    <>
      <AdminHeader
        title={agent.name}
        actions={
          <>
            {agent.published && (
              <Link href={`/projects?agent=${agent.slug}`} target="_blank" className="px-2 py-2 text-sm font-semibold hover:underline">
                View live ↗
              </Link>
            )}
            <DeleteButton
              action={deleteAgent}
              id={agent.id}
              label="Delete agent"
              confirmText={`Delete "${agent.name}"? Its hearts are deleted too. This can't be undone.`}
            />
          </>
        }
      >
        <Link href="/admin/agents" className="hover:underline">
          ← All agents
        </Link>
        {" · "}
        {plural(agent.views, "view")} · {agent.hearts_count} ♥
      </AdminHeader>
      <AgentForm agent={agent} saved={saved === "1"} />
    </>
  );
}
