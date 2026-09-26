import { requireOwner } from "@/lib/auth";
import { AdminHeader } from "../admin-ui";
import PasswordForm from "./PasswordForm";

export const metadata = { title: "Account" };
export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const owner = await requireOwner();
  return (
    <>
      <AdminHeader title="Account">
        Signed in as {owner.email}. Login is your password, then a one-time email link.
      </AdminHeader>
      <h2 className="mb-4 text-lg font-bold">Change password</h2>
      <PasswordForm />
    </>
  );
}
