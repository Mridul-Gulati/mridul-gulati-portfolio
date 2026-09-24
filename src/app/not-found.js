import { ButtonLink, Container, PageHeader } from "@/components/ui";

export const metadata = { title: "Page not found" };

export default function NotFound() {
  return (
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
  );
}
