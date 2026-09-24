import Link from "next/link";
import { highlights } from "@/data/resume";
import { ButtonLink, Card, Container, Eyebrow, SectionHeader, Tag } from "@/components/ui";
import { ArrowRightIcon } from "@/components/icons";
import Testimonials from "@/components/Testimonials";

// Placeholder cards until the catalogue reads real agents from Supabase (Phase 3).
const upcomingAgents = [
  {
    name: "SRE Assistant",
    persona: "site reliability engineers",
    problem: "Correlates incidents with metrics and logs, finds the likely root cause and drafts a remediation plan.",
    tags: ["Multi-agent", "Incident response"],
  },
  {
    name: "Candidate Screening Assistant",
    persona: "recruiters and hiring managers",
    problem: "Parses CVs against a job description, scores the match and generates tailored interview questions.",
    tags: ["Document parsing", "Scoring"],
  },
  {
    name: "Employee Onboarding Assistant",
    persona: "HR and new joiners",
    problem: "Guides new hires through their first weeks, answers policy questions and tracks onboarding tasks.",
    tags: ["RAG", "Workflow"],
  },
];

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

export default function Home() {
  return (
    <>
      <section>
        <Container className="pb-20 pt-16 sm:pb-28 sm:pt-28">
          <div className="max-w-4xl space-y-6">
            <Eyebrow>AI engineer · Agentic systems</Eyebrow>
            <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-6xl">
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

      <section className="py-16">
        <Container>
          <SectionHeader eyebrow="Agent catalogue" title="See the agents at work">
            Short, captioned demos of agents built for real enterprise workflows. New ones are added
            regularly.
          </SectionHeader>
          <div className="grid gap-6 md:grid-cols-3">
            {upcomingAgents.map((agent) => (
              <Card key={agent.name} className="flex flex-col gap-4">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-xl font-bold">{agent.name}</h3>
                  <span className="shrink-0 rounded-full border border-dark/20 px-2.5 py-0.5 text-xs font-semibold dark:border-light/20">
                    Demo soon
                  </span>
                </div>
                <p className="text-sm font-medium text-primary dark:text-primary-dark">For {agent.persona}</p>
                <p className="flex-1 text-dark/70 dark:text-light/70">{agent.problem}</p>
                <div className="flex flex-wrap gap-2">
                  {agent.tags.map((tag) => (
                    <Tag key={tag}>{tag}</Tag>
                  ))}
                </div>
              </Card>
            ))}
          </div>
          <Link href="/projects" className="mt-8 inline-flex items-center gap-2 font-semibold hover:underline">
            View the full catalogue <ArrowRightIcon />
          </Link>
        </Container>
      </section>

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
