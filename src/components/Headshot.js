import Image from "next/image";
import { site } from "@/data/site";
import portrait from "@/assets/headshot.jpg";
import avatar from "@/assets/headshot-avatar.jpg";

const alt = `${site.name}, ${site.role}`;

// No shadow at rest; a soft brand-colour glow on hover (pink in light mode, teal in dark).
const glow =
  "transition-shadow duration-500 ease-out hover:shadow-[0_0_48px_-6px_var(--color-primary)] dark:hover:shadow-[0_0_48px_-6px_var(--color-primary-dark)]";

// Small "open to work" line. Driven by site.availability so it can be switched off in one place.
export function Availability({ className = "" }) {
  if (!site.availability) return null;
  return (
    <p className={`flex items-center gap-2 text-sm text-dark/70 dark:text-light/70 ${className}`}>
      <span className="relative flex size-2.5">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-60 motion-reduce:animate-none" />
        <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500" />
      </span>
      {site.availability}
    </p>
  );
}

// 4:5 portrait card.
export function Portrait({ priority = false, sizes = "(min-width: 1024px) 24rem, 80vw", className = "" }) {
  return (
    <div
      className={`h-fit self-start overflow-hidden rounded-3xl ring-1 ring-dark/10 hover:ring-primary/40 dark:ring-light/10 dark:hover:ring-primary-dark/40 ${glow} ${className}`}
    >
      <Image src={portrait} alt={alt} placeholder="blur" priority={priority} sizes={sizes} className="h-auto w-full" />
    </div>
  );
}

// Circular face crop for small placements (contact page).
export function Avatar({ size = 56, className = "" }) {
  return (
    <Image
      src={avatar}
      alt={alt}
      width={size}
      height={size}
      placeholder="blur"
      className={`shrink-0 rounded-full ring-2 ring-white dark:ring-dark ${glow} ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
