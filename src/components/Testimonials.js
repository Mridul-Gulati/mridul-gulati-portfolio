import { testimonials } from "@/data/testimonials";
import { Card, Container, SectionHeader } from "./ui";

// Hidden until there is at least one real testimonial (see src/data/testimonials.js).
export default function Testimonials() {
  if (testimonials.length === 0) return null;

  return (
    <section className="py-16">
      <Container>
        <SectionHeader eyebrow="Testimonials" title="What clients say" />
        <div className="grid gap-6 md:grid-cols-2">
          {testimonials.map(({ quote, name, role, company }) => (
            <Card key={name}>
              <figure className="space-y-4">
                <blockquote className="text-lg">&ldquo;{quote}&rdquo;</blockquote>
                <figcaption className="text-sm text-dark/70 dark:text-light/70">
                  <span className="font-semibold text-dark dark:text-light">{name}</span>
                  {role && `, ${role}`}
                  {company && ` at ${company}`}
                </figcaption>
              </figure>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}
