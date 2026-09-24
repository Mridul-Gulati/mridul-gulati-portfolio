import { ButtonLink, Container, PageHeader } from "@/components/ui";

export const metadata = {
  title: "Agent catalogue",
  description: "Browse AI agents built for enterprise workflows, with short captioned demos.",
};

// Placeholder until the Supabase-backed catalogue lands in Phase 3.
export default function ProjectsPage() {
  return (
    <Container>
      <PageHeader eyebrow="Agent catalogue" title="Demos are on their way.">
        I&apos;m recording short, captioned demos of each agent. The first one, an SRE assistant that
        finds the root cause of incidents, is coming soon. In the meantime, tell me what you&apos;d like
        an agent to do.
      </PageHeader>
      <ButtonLink href="/contact">Get in touch</ButtonLink>
    </Container>
  );
}
