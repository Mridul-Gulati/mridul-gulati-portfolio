import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { ButtonLink, Container, PageHeader } from "@/components/ui";

export const metadata = { title: "Page not found", robots: { index: false } };

// Root-level 404 renders outside the (site) layout, so it brings its own header and footer.
export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <Container>
          <PageHeader eyebrow="404" title="This page does not exist.">
            The link may be broken, or the page may have moved.
          </PageHeader>
          <div className="flex flex-wrap gap-4">
            <ButtonLink href="/">Back to home</ButtonLink>
            <ButtonLink href="/projects" variant="secondary">
              Browse agents
            </ButtonLink>
          </div>
        </Container>
      </main>
      <SiteFooter />
    </>
  );
}
