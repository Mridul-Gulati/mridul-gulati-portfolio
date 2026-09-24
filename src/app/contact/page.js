import { requirementTypes, site } from "@/data/site";
import { getPublishedAgentBySlug } from "@/lib/agents";
import { Container, PageHeader } from "@/components/ui";
import { LinkedInIcon } from "@/components/icons";
import ContactForm from "./ContactForm";

export const metadata = {
  title: "Contact",
  description: "Tell me about the agent you need built. I reply within one to two working days.",
};

const expectations = [
  "A reply within one to two working days.",
  "A short call to scope the problem, if it's a fit.",
  "A clear written proposal covering approach, timeline and cost.",
];

// Pre-fill from the URL:
// - /contact?type=<requirement type> pre-selects the dropdown
// - /contact?agent=<slug> (the catalogue's "Contact me") pre-selects a custom build and
//   starts the message with the agent the visitor was looking at
export default async function ContactPage({ searchParams }) {
  const { type, agent: agentSlug } = await searchParams;
  const agent = await getPublishedAgentBySlug(agentSlug);

  const defaultType = requirementTypes.includes(type)
    ? type
    : agent
      ? "Custom AI agent build"
      : undefined;
  const defaultMessage = agent ? `I saw the ${agent.name} demo and I'm interested in something similar. ` : undefined;

  return (
    <Container>
      <PageHeader eyebrow="Contact" title="Tell me what you want an agent to do.">
        Whether it&apos;s a new build, an agent that isn&apos;t reliable enough yet, or a second opinion
        on an architecture, send the details and I&apos;ll get back to you.
      </PageHeader>

      <div className="grid gap-12 lg:grid-cols-[2fr_1fr]">
        <ContactForm defaultType={defaultType} defaultMessage={defaultMessage} />

        <aside className="space-y-8">
          <div>
            <h2 className="mb-4 text-lg font-bold">What happens next</h2>
            <ol className="space-y-3">
              {expectations.map((item, i) => (
                <li key={item} className="flex gap-3 text-dark/80 dark:text-light/80">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white dark:bg-primary-dark dark:text-dark">
                    {i + 1}
                  </span>
                  {item}
                </li>
              ))}
            </ol>
          </div>
          <div>
            <h2 className="mb-2 text-lg font-bold">Prefer LinkedIn?</h2>
            <a
              href={site.links.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 font-semibold hover:underline"
            >
              <LinkedInIcon /> Message me on LinkedIn
            </a>
          </div>
        </aside>
      </div>
    </Container>
  );
}
