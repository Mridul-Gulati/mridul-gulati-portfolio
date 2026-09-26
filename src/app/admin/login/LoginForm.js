"use client";

import { useActionState, useEffect, useState } from "react";
import { buttonClass } from "@/components/ui";
import { loginWithPassword, resendLink } from "./actions";

const inputClass =
  "w-full rounded-lg border border-dark/20 bg-white px-4 py-3 outline-none focus:border-primary dark:border-light/20 dark:bg-white/5 dark:focus:border-primary-dark";

const linkErrors = {
  link: "That login link is invalid or has expired. Sign in again to get a new one.",
  password: "Login links only work in the browser where you entered your password. Sign in again here.",
};

function Countdown({ seconds, children }) {
  const [left, setLeft] = useState(seconds);
  useEffect(() => {
    setLeft(seconds);
    const timer = setInterval(() => setLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(timer);
  }, [seconds]);
  return children(left);
}

// Step 2 screen: the link is on its way; resend is throttled with a visible countdown.
function CheckEmail({ first }) {
  const [state, resend, pending] = useActionState(resendLink, null);
  const current = state ?? first;

  if (current.status === "error") {
    return (
      <div className="space-y-4">
        <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
          {current.message}
        </p>
        <button type="button" onClick={() => window.location.reload()} className={`${buttonClass("secondary")} w-full`}>
          Start again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p role="status" className="rounded-lg bg-emerald-50 p-4 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
        {current.message}
      </p>
      <p className="text-sm text-dark/70 dark:text-light/70">
        Open the email on this device and click the link. It works only in this browser, and expires after 10 minutes.
      </p>
      <form action={resend}>
        <Countdown key={current.at} seconds={current.retryAfter ?? 60}>
          {(left) => (
            <button type="submit" disabled={pending || left > 0} className={`${buttonClass("secondary")} w-full`}>
              {pending ? "Sending…" : left > 0 ? `Resend link in ${left}s` : "Resend link"}
            </button>
          )}
        </Countdown>
      </form>
    </div>
  );
}

export default function LoginForm({ linkError }) {
  const [state, action, pending] = useActionState(loginWithPassword, null);

  if (state?.status === "sent") return <CheckEmail first={state} />;

  const error = state?.status === "error" ? state.message : linkErrors[linkError];

  return (
    <form action={action} className="space-y-4">
      {error && (
        <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </p>
      )}
      <div className="space-y-1.5">
        <label htmlFor="email" className="block font-semibold">
          Email
        </label>
        <input id="email" name="email" type="email" required autoComplete="username" className={inputClass} />
      </div>
      <div className="space-y-1.5">
        <label htmlFor="password" className="block font-semibold">
          Password
        </label>
        <input id="password" name="password" type="password" required autoComplete="current-password" className={inputClass} />
      </div>
      <button type="submit" disabled={pending} className={`${buttonClass("primary")} w-full`}>
        {pending ? "Checking…" : "Continue"}
      </button>
      <p className="text-center text-xs text-dark/60 dark:text-light/60">
        Step 1 of 2. After your password, we&apos;ll email you a one-time login link.
      </p>
    </form>
  );
}
