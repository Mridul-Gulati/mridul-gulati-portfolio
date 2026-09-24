"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { nav, site } from "@/data/site";
import { Container, buttonClass } from "./ui";
import ThemeToggle from "./ThemeToggle";
import { CloseIcon, MenuIcon } from "./icons";

function isActive(pathname, href) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export default function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close the mobile menu on navigation.
  useEffect(() => setOpen(false), [pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-dark/10 bg-light/85 backdrop-blur dark:border-light/10 dark:bg-dark/85 print:hidden">
      <Container className="flex h-16 items-center justify-between">
        <Link href="/" className="text-lg font-bold tracking-tight">
          {site.name}
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {nav.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              aria-current={isActive(pathname, href) ? "page" : undefined}
              className="rounded-md px-3 py-2 font-medium text-dark/70 transition-colors hover:text-dark aria-[current=page]:text-dark dark:text-light/70 dark:hover:text-light dark:aria-[current=page]:text-light"
            >
              {label}
            </Link>
          ))}
          <ThemeToggle />
          <Link href="/contact" className={`${buttonClass("primary")} ml-2 px-4 py-2 text-sm`}>
            Hire me
          </Link>
        </nav>

        <div className="flex items-center gap-1 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            className="flex size-10 items-center justify-center rounded-full hover:bg-dark/5 dark:hover:bg-light/10"
          >
            {open ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </Container>

      {open && (
        <nav id="mobile-nav" aria-label="Main" className="border-t border-dark/10 dark:border-light/10 md:hidden">
          <Container className="flex flex-col gap-1 py-4">
            {nav.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                aria-current={isActive(pathname, href) ? "page" : undefined}
                className="rounded-md px-3 py-3 text-lg font-medium aria-[current=page]:bg-dark/5 dark:aria-[current=page]:bg-light/10"
              >
                {label}
              </Link>
            ))}
            <Link href="/contact" className={`${buttonClass("primary")} mt-2`}>
              Hire me
            </Link>
          </Container>
        </nav>
      )}
    </header>
  );
}
