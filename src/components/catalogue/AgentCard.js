import Image from "next/image";
import { thumbnailFor } from "@/lib/agent-format";
import { Tag } from "@/components/ui";

const badgeLabels = { new: "Newly added", "most-liked": "Most liked" };

function Thumbnail({ agent }) {
  const src = thumbnailFor(agent);
  if (src) {
    return (
      <Image
        src={src}
        alt=""
        fill
        sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
        className="object-cover"
      />
    );
  }
  // No thumbnail or video yet: a branded placeholder with the agent's initials.
  const initials = agent.name
    .split(" ")
    .map((word) => word[0])
    .slice(0, 2)
    .join("");
  return (
    <div className="flex size-full items-center justify-center bg-linear-to-br from-primary/25 via-primary/5 to-transparent dark:from-primary-dark/25 dark:via-primary-dark/5">
      <span className="text-5xl font-bold tracking-tight text-primary/70 dark:text-primary-dark/70">{initials}</span>
    </div>
  );
}

// Presentational card shared by the catalogue and the home-page featured strip.
// The caller supplies the interactive footer (demo button, heart) as children.
export default function AgentCard({ agent, children }) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-dark/10 bg-white dark:border-light/10 dark:bg-white/5">
      <div className="relative aspect-video bg-dark/5 dark:bg-light/5">
        <Thumbnail agent={agent} />
        {agent.badges?.length > 0 && (
          <div className="absolute left-3 top-3 flex gap-2">
            {agent.badges.map((badge) => (
              <span
                key={badge}
                className="rounded-full bg-dark px-2.5 py-1 text-xs font-semibold text-light shadow-sm dark:bg-light dark:text-dark"
              >
                {badgeLabels[badge]}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-6">
        <h3 className="text-xl font-bold">{agent.name}</h3>
        <p className="text-sm font-medium text-primary dark:text-primary-dark">Built for: {agent.persona}</p>
        <p className="flex-1 text-dark/70 dark:text-light/70">{agent.problem}</p>
        <div className="flex flex-wrap gap-2">
          {agent.tags.map((tag) => (
            <Tag key={tag}>{tag}</Tag>
          ))}
        </div>
        {children && <div className="mt-2 flex items-center justify-between gap-3">{children}</div>}
      </div>
    </article>
  );
}
