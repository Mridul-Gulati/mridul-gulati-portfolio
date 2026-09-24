import Link from "next/link";
import { highlights } from "@/data/resume";
import { getPublishedAgents } from "@/lib/agents";
import { ButtonLink, Card, Container, Eyebrow, SectionHeader } from "@/components/ui";
import { ArrowRightIcon } from "@/components/icons";
import AgentCard from "@/components/catalogue/AgentCard";
import { Availability } from "@/components/Headshot";
import GeometricField from "@/components/GeometricField";
import Testimonials from "@/components/Testimonials";

// Featured agents come from the catalogue; refresh the cached page at most every 5 minutes.
export const revalidate = 300;

const capabilities = [
  {
    title: "Multi-agent systems",
    body: "Orchestrated agents that plan, call tools and hand off work, built with LangGraph, ADK and MCP.",
  },
  {
    title: "Evaluation before release",
    body: "Custom quality metrics, LLM-as-judge scoring and simulated users, so you know how the agent behaves before your users do.",
  },
  {
    title: "Guardrails and cost control",
    body: "Input and output guardrails, prompt-injection defences, and per-agent token spend you can actually see.",
  },
];

export default async function Home() {
  const featured = await getPublishedAgents({ limit: 3 });

  return (
    <>
      <section>
        <Container className="pb-20 pt-12 sm:pb-28 sm:pt-20 lg:pt-24">
          <div className="grid items-center gap-12 lg:grid-cols-[1fr_26rem] xl:grid-cols-[1fr_30rem] xl:gap-16">
            <div className="space-y-6">
              <Availability />
              <Eyebrow>AI engineer · Agentic systems</Eyebrow>
              <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-6xl lg:text-5xl xl:text-6xl">
                I build AI agents that run in production, not just in demos.
              </h1>
              <p className="max-w-2xl text-lg text-dark/70 sm:text-xl dark:text-light/70">
                Multi-agent systems with evaluation, guardrails and observability built in, from first
                prototype to thousands of runs a day. Based in India, with working hours that overlap
                Europe, the UK and Australia.
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <ButtonLink href="/contact">
                  Start a project <ArrowRightIcon />
                </ButtonLink>
                <ButtonLink href="/projects" variant="secondary">
                  Browse agents
                </ButtonLink>
              </div>
            </div>

            {/* Desktop: slowly rotating wireframe solids beside the headline. */}
            <div className="hidden aspect-square w-full lg:block">
              <GeometricField />
            </div>
          </div>

          <dl className="mt-16 grid grid-cols-2 gap-6 border-t border-dark/10 pt-10 lg:grid-cols-4 dark:border-light/10">
            {highlights.map(({ value, label }) => (
              <div key={label}>
                <dt className="sr-only">{label}</dt>
                <dd className="text-3xl font-bold text-primary sm:text-4xl dark:text-primary-dark">{value}</dd>
                <dd className="mt-1 text-sm text-dark/70 dark:text-light/70">{label}</dd>
              </div>
            ))}
          </dl>
        </Container>
      </section>

      {featured.length > 0 && (
        <section className="py-16">
          <Container>
            <SectionHeader eyebrow="Agent catalogue" title="See the agents at work">
              Short, captioned demos of agents built for real enterprise workflows. New ones are added
              regularly.
            </SectionHeader>
            <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {featured.map((agent) => (
                <li key={agent.slug}>
                  <AgentCard agent={agent}>
                    <Link
                      href={`/projects?agent=${agent.slug}`}
                      className="inline-flex items-center gap-2 font-semibold hover:underline"
                    >
                      {agent.youtube_id ? "Watch demo" : "Preview"} <ArrowRightIcon />
                    </Link>
                  </AgentCard>
                </li>
              ))}
            </ul>
            <Link href="/projects" className="mt-8 inline-flex items-center gap-2 font-semibold hover:underline">
              View the full catalogue <ArrowRightIcon />
            </Link>
          </Container>
        </section>
      )}

      <section className="py-16">
        <Container>
          <SectionHeader eyebrow="What I do" title="Agents you can trust with real work" />
          <div className="grid gap-6 md:grid-cols-3">
            {capabilities.map(({ title, body }) => (
              <div key={title} className="space-y-3 border-l-4 border-primary pl-5 dark:border-primary-dark">
                <h3 className="text-xl font-bold">{title}</h3>
                <p className="text-dark/70 dark:text-light/70">{body}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-16">
        <Container>
          <Card className="flex flex-col gap-6 p-8 sm:p-12 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl space-y-3">
              <h2 className="text-2xl font-bold sm:text-3xl">An AI technical lead who still ships.</h2>
              <p className="text-dark/70 dark:text-light/70">
                I lead agentic AI delivery for enterprise clients and previously scaled an LLM evaluation
                agent to 30,000+ runs a day. Alongside that, I take on a small number of focused freelance builds.
              </p>
            </div>
            <ButtonLink href="/about" variant="secondary" className="shrink-0">
              More about me
            </ButtonLink>
          </Card>
        </Container>
      </section>

      <Testimonials />
    </>
  );
}
