import { resume } from "@/data/resume";
import { Container, buttonClass } from "@/components/ui";
import { DownloadIcon } from "@/components/icons";

export const metadata = {
  title: "Resume",
  description: `${resume.name}, ${resume.title}. Experience, skills and certifications.`,
};

// Generated from this page by `npm run resume:pdf`, so the PDF always matches the page.
const PDF_PATH = "/Mridul_Gulati_Resume.pdf";

function SectionTitle({ children }) {
  return (
    <h2 className="mb-5 border-b-2 border-dark pb-2 text-sm font-bold uppercase tracking-widest dark:border-light print:mb-2 print:pb-1">
      {children}
    </h2>
  );
}

export default function ResumePage() {
  return (
    <Container className="max-w-4xl py-16 print:max-w-none print:px-0 print:py-0">
      <header className="flex flex-col gap-6 pb-10 sm:flex-row sm:items-end sm:justify-between print:pb-4">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight print:text-3xl">{resume.name}</h1>
          <p className="text-lg font-semibold text-primary dark:text-primary-dark print:text-base">{resume.title}</p>
          <p className="text-sm text-dark/70 dark:text-light/70">
            {resume.location}
            {resume.links.map(({ label, href }) => (
              <span key={href}>
                {" · "}
                <a href={href} className="hover:underline">
                  {label}
                </a>
              </span>
            ))}
          </p>
        </div>
        <a href={PDF_PATH} download className={`${buttonClass("primary")} shrink-0 print:hidden`}>
          <DownloadIcon /> Download PDF
        </a>
      </header>

      <div className="space-y-12 print:space-y-5 print:text-[10.5pt] print:leading-snug">
        <section>
          <SectionTitle>Summary</SectionTitle>
          <p className="leading-relaxed text-dark/80 dark:text-light/80">{resume.summary}</p>
        </section>

        <section>
          <SectionTitle>Experience</SectionTitle>
          <div className="space-y-10 print:space-y-4">
            {resume.experience.map((job) => (
              <article key={job.company} className="break-inside-avoid-page">
                <div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-baseline print:flex-row print:items-baseline">
                  <h3 className="text-lg font-bold">
                    {job.role} · {job.company}
                  </h3>
                  <p className="text-sm text-dark/70 dark:text-light/70">
                    {job.period} · {job.location}
                  </p>
                </div>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-dark/80 marker:text-primary dark:text-light/80 dark:marker:text-primary-dark print:mt-1 print:space-y-0.5">
                  {job.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
                {job.award && (
                  <p className="mt-3 text-sm font-semibold print:mt-1">
                    <span className="text-primary dark:text-primary-dark">Award:</span> {job.award}
                  </p>
                )}
              </article>
            ))}
          </div>
        </section>

        <section className="break-inside-avoid-page">
          <SectionTitle>Education</SectionTitle>
          {resume.education.map((edu) => (
            <div key={edu.school} className="flex flex-col justify-between gap-1 sm:flex-row sm:items-baseline print:flex-row">
              <div>
                <h3 className="font-bold">{edu.school}</h3>
                <p className="text-dark/80 dark:text-light/80">
                  {edu.degree} · {edu.detail}
                </p>
              </div>
              <p className="text-sm text-dark/70 dark:text-light/70">
                {edu.period} · {edu.location}
              </p>
            </div>
          ))}
        </section>

        <section className="break-inside-avoid-page">
          <SectionTitle>Skills</SectionTitle>
          <dl className="space-y-2">
            {resume.skills.map(({ group, items }) => (
              <div key={group} className="sm:flex sm:gap-2">
                <dt className="font-semibold sm:shrink-0">{group}:</dt>
                <dd className="text-dark/80 dark:text-light/80">{items.join(", ")}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="break-inside-avoid-page">
          <SectionTitle>Certifications</SectionTitle>
          <ul className="list-disc space-y-1 pl-5 text-dark/80 marker:text-primary dark:text-light/80 dark:marker:text-primary-dark">
            {resume.certifications.map((cert) => (
              <li key={cert}>{cert}</li>
            ))}
          </ul>
        </section>
      </div>
    </Container>
  );
}
