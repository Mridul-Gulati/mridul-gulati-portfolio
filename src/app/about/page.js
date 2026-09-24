import { highlights, resume } from "@/data/resume";
import { ButtonLink, Card, Container, PageHeader, SectionHeader, Tag } from "@/components/ui";
import { Portrait } from "@/components/Headshot";

export const metadata = {
  title: "About",
  description:
    "AI technical lead building multi-agent systems with evaluation, guardrails and observability built in.",
};

const principles = [
  {
    title: "Production is the bar",
    body: "A demo that works once is easy. I design for the thousandth run: retries, caching, guardrails and clear failure modes.",
  },
  {
    title: "Measure before you ship",
    body: "Every agent gets an evaluation harness with metrics agreed up front, plus simulated users to probe the edges.",
  },
  {
    title: "Stack follows the problem",
    body: "LangGraph, ADK, MCP, open or hosted models, any cloud. I pick what fits your constraints, not a favourite vendor.",
  },
];

export default function AboutPage() {
  return (
    <Container>
      <PageHeader eyebrow="About" title="I turn agentic AI ideas into systems people rely on.">
        I&apos;m Mridul, an AI technical lead based in Delhi NCR. I design and ship multi-agent systems
        for enterprise workflows: incident response, hiring, internal assistants and quality review.
      </PageHeader>

      <div className="grid gap-12 lg:grid-cols-[1fr_20rem] xl:gap-20">
        {/* On phones the portrait sits between the intro and the story. */}
        <Portrait sizes="(min-width: 1024px) 20rem, 20rem" className="w-full max-w-xs lg:order-last lg:max-w-none" />

        <div className="space-y-5 text-lg leading-relaxed text-dark/80 dark:text-light/80">
          <p>
            I started out building an agent that reviewed LLM training data, scoring notebooks for
            hallucination, accuracy and instruction following. It grew from a prototype into a tool
            reviewers chose to use on their own, running more than 30,000 times a day and halving review
            time. That project taught me the difference between an agent that impresses and one that
            earns trust.
          </p>
          <p>
            Today I lead agentic AI delivery for enterprise clients: root-cause analysis agents for SRE
            teams, multi-agent candidate screening, and more than 50 enterprise-grade agents in production, with
            guardrails, evaluation and cost observability in place before release. In 2026 that work
            earned a quarterly award for impact, chosen from over 500 colleagues.
          </p>
          <p>
            Outside my full-time role, I take on a small number of freelance builds for teams in Europe,
            the UK and Australia. If you have a workflow that an agent should own, I&apos;d like to hear
            about it.
          </p>
        </div>
      </div>

      <dl className="mt-16 grid grid-cols-2 gap-6 border-t border-dark/10 pt-10 lg:grid-cols-4 dark:border-light/10">
        {highlights.map(({ value, label }) => (
          <div key={label}>
            <dt className="sr-only">{label}</dt>
            <dd className="text-3xl font-bold text-primary dark:text-primary-dark">{value}</dd>
            <dd className="mt-1 text-sm text-dark/70 dark:text-light/70">{label}</dd>
          </div>
        ))}
      </dl>

      <section className="pt-24">
        <SectionHeader eyebrow="How I work" title="Principles" />
        <div className="grid gap-6 md:grid-cols-3">
          {principles.map(({ title, body }) => (
            <Card key={title}>
              <h3 className="mb-2 text-xl font-bold">{title}</h3>
              <p className="text-dark/70 dark:text-light/70">{body}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="pt-24">
        <SectionHeader eyebrow="Skills" title="What I work with" />
        <div className="space-y-6">
          {resume.skills.map(({ group, items }) => (
            <div key={group} className="grid gap-3 sm:grid-cols-[14rem_1fr] sm:items-start">
              <h3 className="font-semibold">{group}</h3>
              <div className="flex flex-wrap gap-2">
                {items.map((item) => (
                  <Tag key={item}>{item}</Tag>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="pt-24">
        <SectionHeader eyebrow="Credentials" title="Certifications and programs" />
        <ul className="grid gap-4 sm:grid-cols-2">
          {resume.certifications.map((cert) => (
            <li key={cert} className="border-l-4 border-primary pl-4 font-medium dark:border-primary-dark">
              {cert}
            </li>
          ))}
        </ul>
      </section>

      <div className="flex flex-wrap gap-4 pt-20">
        <ButtonLink href="/contact">Work with me</ButtonLink>
        <ButtonLink href="/resume" variant="secondary">
          View resume
        </ButtonLink>
      </div>
    </Container>
  );
}
