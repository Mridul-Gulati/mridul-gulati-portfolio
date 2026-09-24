import { Container } from "@/components/ui";

export default function Loading() {
  return (
    <Container>
      <div className="animate-pulse" aria-busy="true" aria-label="Loading agents">
        <div className="space-y-4 pb-12 pt-16 sm:pt-24">
          <div className="h-4 w-32 rounded bg-dark/10 dark:bg-light/10" />
          <div className="h-12 w-2/3 rounded bg-dark/10 dark:bg-light/10" />
        </div>
        <div className="mb-8 h-12 rounded-lg bg-dark/10 dark:bg-light/10" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-96 rounded-2xl bg-dark/10 dark:bg-light/10" />
          ))}
        </div>
      </div>
    </Container>
  );
}
