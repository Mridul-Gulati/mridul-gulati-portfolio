import Link from "next/link";
import { site } from "@/data/site";
import { Container } from "./ui";
import { GitHubIcon, LinkedInIcon } from "./icons";

export default function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-dark/10 py-10 dark:border-light/10 print:hidden">
      <Container className="flex flex-col gap-6 text-sm text-dark/70 sm:flex-row sm:items-center sm:justify-between dark:text-light/70">
        <p>
          © {new Date().getFullYear()} {site.name} · {site.location}
        </p>
        <div className="flex items-center gap-5">
          <Link href="/contact" className="font-semibold text-dark hover:underline dark:text-light">
            Start a project
          </Link>
          <a href={site.links.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="hover:text-dark dark:hover:text-light">
            <LinkedInIcon />
          </a>
          <a href={site.links.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="hover:text-dark dark:hover:text-light">
            <GitHubIcon />
          </a>
        </div>
      </Container>
    </footer>
  );
}
