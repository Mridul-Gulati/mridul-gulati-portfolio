import Image from "next/image";
import { site } from "@/data/site";
import portrait from "@/assets/headshot.jpg";
import avatar from "@/assets/headshot-avatar.jpg";

const alt = `${site.name}, ${site.role}`;

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

// 4:5 portrait in a framed card. The offset accent block behind it gives the white-background
// photo a deliberate frame in both themes. `withNameCard` overlaps a small identity card.
export function Portrait({ priority = false, withNameCard = false, sizes = "(min-width: 1024px) 24rem, 80vw", className = "" }) {
  return (
    <div className={`relative ${className}`}>
      <div aria-hidden="true" className="absolute inset-0 translate-x-3 translate-y-3 rounded-3xl bg-primary/15 sm:translate-x-4 sm:translate-y-4 dark:bg-primary-dark/15" />
      <div className="relative overflow-hidden rounded-3xl ring-1 ring-dark/10 dark:ring-light/10">
        <Image src={portrait} alt={alt} placeholder="blur" priority={priority} sizes={sizes} className="h-auto w-full" />
      </div>

      {withNameCard && (
        <div className="absolute -bottom-6 -left-4 rounded-2xl border border-dark/10 bg-white px-5 py-3.5 shadow-lg sm:-left-8 dark:border-light/10 dark:bg-dark">
          <p className="font-bold">{site.name}</p>
          <p className="text-sm text-dark/70 dark:text-light/70">{site.role}</p>
          <Availability className="mt-1.5" />
        </div>
      )}
    </div>
  );
}

// Circular face crop for small placements (mobile hero, contact page).
export function Avatar({ size = 56, className = "" }) {
  return (
    <Image
      src={avatar}
      alt={alt}
      width={size}
      height={size}
      placeholder="blur"
      className={`shrink-0 rounded-full ring-2 ring-white dark:ring-dark ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
