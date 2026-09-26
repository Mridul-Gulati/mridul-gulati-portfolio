"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/posts", label: "Posts" },
  { href: "/admin/agents", label: "Agents" },
  { href: "/admin/contacts", label: "Contacts", badge: true },
  { href: "/admin/account", label: "Account" },
];

export default function AdminNav({ unhandled }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Admin" className="-mx-1 flex gap-1 overflow-x-auto md:mx-0 md:flex-col">
      {items.map(({ href, label, badge }) => {
        const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className="flex shrink-0 items-center justify-between gap-3 rounded-lg px-3 py-2 font-medium text-dark/70 transition-colors hover:bg-dark/5 aria-[current=page]:bg-dark aria-[current=page]:text-light dark:text-light/70 dark:hover:bg-light/10 dark:aria-[current=page]:bg-light dark:aria-[current=page]:text-dark"
          >
            {label}
            {badge && unhandled > 0 && (
              <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-bold text-white dark:bg-primary-dark dark:text-dark">
                {unhandled}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
