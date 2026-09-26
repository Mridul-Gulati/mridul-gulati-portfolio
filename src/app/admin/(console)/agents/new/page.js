import Link from "next/link";
import { AdminHeader } from "../../admin-ui";
import AgentForm from "../AgentForm";

export const metadata = { title: "New agent" };

export default function NewAgentPage() {
  return (
    <>
      <AdminHeader title="New agent">
        <Link href="/admin/agents" className="hover:underline">
          ← All agents
        </Link>
      </AdminHeader>
      <AgentForm />
    </>
  );
}
