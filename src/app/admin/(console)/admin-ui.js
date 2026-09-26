// Small presentational pieces shared by admin pages and forms.

export const plural = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;

export const inputClass =
  "w-full rounded-lg border border-dark/20 bg-white px-3 py-2.5 outline-none transition-colors focus:border-primary aria-invalid:border-red-600 dark:border-light/20 dark:bg-white/5 dark:focus:border-primary-dark dark:aria-invalid:border-red-400";

export function AdminHeader({ title, children, actions }) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">{title}</h1>
        {children && <p className="mt-1 text-dark/70 dark:text-light/70">{children}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Field({ label, name, error, hint, children }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={name} className="block text-sm font-semibold">
        {label}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-dark/60 dark:text-light/60">{hint}</p>}
      {error && (
        <p id={`${name}-error`} className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}

export function StatusPill({ tone = "neutral", children }) {
  const tones = {
    live: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300",
    draft: "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300",
    neutral: "bg-dark/5 text-dark/70 dark:bg-light/10 dark:text-light/70",
  };
  return <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${tones[tone]}`}>{children}</span>;
}

export function Notice({ tone = "success", children }) {
  const tones = {
    success: "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300",
    error: "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300",
  };
  return (
    <p role={tone === "error" ? "alert" : "status"} className={`rounded-lg p-3 text-sm ${tones[tone]}`}>
      {children}
    </p>
  );
}

export function EmptyState({ children }) {
  return (
    <div className="rounded-2xl border border-dashed border-dark/20 p-10 text-center text-dark/70 dark:border-light/20 dark:text-light/70">
      {children}
    </div>
  );
}
