"use client";

import { formatLikes } from "@/lib/agent-format";

function HeartIcon({ filled }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
      <path d="M12 20.5 10.6 19.2C5.4 14.5 2 11.4 2 7.6 2 4.5 4.4 2 7.5 2c1.7 0 3.4.8 4.5 2.1C13.1 2.8 14.8 2 16.5 2 19.6 2 22 4.5 22 7.6c0 3.8-3.4 6.9-8.6 11.6L12 20.5Z" />
    </svg>
  );
}

// One-way like: once hearted it fills and disables. The server enforces one per visitor.
export default function HeartButton({ name, count, liked, onLike }) {
  const label = formatLikes(count);
  return (
    <div className="flex items-center gap-2 text-sm text-dark/70 dark:text-light/70">
      <button
        type="button"
        onClick={onLike}
        disabled={liked}
        aria-pressed={liked}
        aria-label={liked ? `You liked ${name}` : `Like ${name}`}
        className="flex size-10 items-center justify-center rounded-full text-primary transition hover:bg-primary/10 enabled:active:scale-90 disabled:cursor-default dark:text-primary-dark dark:hover:bg-primary-dark/10"
      >
        <HeartIcon filled={liked} />
      </button>
      {label && <span>{label}</span>}
    </div>
  );
}
