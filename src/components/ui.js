import Link from "next/link";

// Shared layout primitives. Every page composes these so spacing and type stay consistent.

export function Container({ className = "", children }) {
  return <div className={`mx-auto w-full max-w-6xl px-5 sm:px-8 ${className}`}>{children}</div>;
}

const buttonStyles = {
  primary:
    "bg-dark text-light hover:bg-primary dark:bg-light dark:text-dark dark:hover:bg-primary-dark",
  secondary:
    "border-2 border-dark text-dark hover:bg-dark hover:text-light dark:border-light dark:text-light dark:hover:bg-light dark:hover:text-dark",
};

export const buttonClass = (variant = "primary") =>
  `inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-base font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary dark:focus-visible:outline-primary-dark disabled:cursor-not-allowed disabled:opacity-60 ${buttonStyles[variant]}`;

export function ButtonLink({ href, variant = "primary", className = "", children, ...props }) {
  return (
    <Link href={href} className={`${buttonClass(variant)} ${className}`} {...props}>
      {children}
    </Link>
  );
}

export function Eyebrow({ children }) {
  return (
    <p className="text-sm font-semibold uppercase tracking-widest text-primary dark:text-primary-dark">
      {children}
    </p>
  );
}

export function SectionHeader({ eyebrow, title, children }) {
  return (
    <div className="mb-10 max-w-2xl space-y-3">
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>
      {children && <p className="text-lg text-dark/70 dark:text-light/70">{children}</p>}
    </div>
  );
}

export function PageHeader({ eyebrow, title, children }) {
  return (
    <header className="max-w-3xl space-y-4 pb-12 pt-16 sm:pt-24">
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{title}</h1>
      {children && <p className="text-lg text-dark/70 dark:text-light/70">{children}</p>}
    </header>
  );
}

export function Card({ className = "", children }) {
  return (
    <div
      className={`rounded-2xl border border-dark/10 bg-white p-6 dark:border-light/10 dark:bg-white/5 ${className}`}
    >
      {children}
    </div>
  );
}

export function Tag({ children }) {
  return (
    <span className="rounded-full bg-dark/5 px-3 py-1 text-sm font-medium dark:bg-light/10">
      {children}
    </span>
  );
}
