"use client";

import { buttonClass } from "@/components/ui";

// Admin-wide error boundary: an unexpected failure shows a recoverable message, not a white screen.
export default function AdminError({ reset }) {
  return (
    <main className="flex flex-1 items-center justify-center px-5 py-16">
      <div className="w-full max-w-sm space-y-4 text-center">
        <h1 className="text-2xl font-bold">Something went wrong.</h1>
        <p className="text-dark/70 dark:text-light/70">Please try again. If it keeps happening, sign in again.</p>
        <div className="flex justify-center gap-3">
          <button type="button" onClick={reset} className={buttonClass("primary")}>
            Try again
          </button>
          <a href="/admin/login" className={buttonClass("secondary")}>
            Sign in
          </a>
        </div>
      </div>
    </main>
  );
}
