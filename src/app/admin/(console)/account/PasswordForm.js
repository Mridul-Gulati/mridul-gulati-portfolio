"use client";

import { useActionState } from "react";
import { buttonClass } from "@/components/ui";
import { Field, Notice, inputClass } from "../admin-ui";
import { changePassword } from "./actions";

export default function PasswordForm() {
  const [state, action, pending] = useActionState(changePassword, null);
  return (
    <form action={action} key={state?.status === "saved" ? "done" : "form"} className="max-w-md space-y-5">
      {state && <Notice tone={state.status === "saved" ? "success" : "error"}>{state.message}</Notice>}
      <Field label="Current password" name="current">
        <input id="current" name="current" type="password" required autoComplete="current-password" className={inputClass} />
      </Field>
      <Field label="New password" name="next" hint="At least 12 characters. A passphrase or password-manager password is best.">
        <input id="next" name="next" type="password" required minLength={12} autoComplete="new-password" className={inputClass} />
      </Field>
      <Field label="Confirm new password" name="confirm">
        <input id="confirm" name="confirm" type="password" required minLength={12} autoComplete="new-password" className={inputClass} />
      </Field>
      <button type="submit" disabled={pending} className={buttonClass("primary")}>
        {pending ? "Updating…" : "Change password"}
      </button>
    </form>
  );
}
