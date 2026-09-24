import { getPublishedAgents } from "@/lib/agents";
import { ButtonLink, Container, PageHeader } from "@/components/ui";
import Catalogue from "@/components/catalogue/Catalogue";

export const metadata = {
  title: "Agent catalogue",
  description: "Browse AI agents built for enterprise workflows, with short captioned demos.",
};

// Statically cached and refreshed at most once a minute; per-visitor likes load client-side.
export const revalidate = 60;

export default async function ProjectsPage() {
  const agents = await getPublishedAgents();

  return (
    <Container>
      <PageHeader eyebrow="Agent catalogue" title="Agents built for real workflows.">
        Each agent comes with a short, captioned demo showing it working end to end. Like the ones
        you find useful, and get in touch if you want one built for your team.
      </PageHeader>

      {agents.length > 0 ? (
        <Catalogue agents={agents} />
      ) : (
        <div className="rounded-2xl border border-dashed border-dark/20 p-12 text-center dark:border-light/20">
          <p className="text-lg font-semibold">The first demos are being recorded.</p>
          <p className="mt-2 text-dark/70 dark:text-light/70">
            In the meantime, tell me what you&apos;d like an agent to do.
          </p>
          <ButtonLink href="/contact" className="mt-6">
            Get in touch
          </ButtonLink>
        </div>
      )}
    </Container>
  );
}
