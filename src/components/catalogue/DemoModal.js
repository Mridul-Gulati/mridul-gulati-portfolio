"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { Tag, buttonClass } from "@/components/ui";
import { ArrowRightIcon, CloseIcon } from "@/components/icons";
import HeartButton from "./HeartButton";

function VideoDemo({ agent }) {
  // youtube-nocookie avoids tracking cookies until play; captions on by default because most
  // portfolio visitors watch muted (demos also have burned-in captions).
  const params = new URLSearchParams({ autoplay: "1", mute: "1", cc_load_policy: "1", rel: "0", playsinline: "1" });
  return (
    <iframe
      src={`https://www.youtube-nocookie.com/embed/${agent.youtube_id}?${params}`}
      title={`${agent.name} demo`}
      allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
      allowFullScreen
      className="size-full"
    />
  );
}

function NoDemoYet({ agent }) {
  return (
    // Sits on the dark video area in both themes, so text is always light.
    <div className="flex size-full flex-col items-center justify-center gap-3 bg-linear-to-br from-primary/30 via-primary/10 to-transparent p-8 text-center text-light dark:from-primary-dark/20 dark:via-primary-dark/5">
      <p className="text-lg font-bold">The {agent.name} demo is being recorded.</p>
      <p className="max-w-md text-light/75">
        Want to see it sooner, or have a similar workflow in mind? Get in touch and I&apos;ll walk you
        through it live.
      </p>
    </div>
  );
}

// Picks the demo experience for an agent. A live "Try it" chat plugs in here later
// (demo_type === "live"); until then every agent falls back to its recorded video.
function DemoView({ agent }) {
  if (agent.youtube_id) return <VideoDemo agent={agent} />;
  return <NoDemoYet agent={agent} />;
}

// One modal shared by every agent. Uses the native <dialog> for focus trapping and Esc handling.
export default function DemoModal({ agent, liked, heartCount, onLike, onClose }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (agent && !dialog.open) dialog.showModal();
    if (!agent && dialog.open) dialog.close();
  }, [agent]);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      // Clicking the backdrop (the dialog element itself, outside the panel) closes it.
      onClick={(e) => e.target === e.currentTarget && e.currentTarget.close()}
      aria-labelledby="demo-title"
      className="m-auto w-[min(56rem,calc(100%-2rem))] max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-2xl bg-light p-0 text-dark shadow-2xl backdrop:bg-dark/70 backdrop:backdrop-blur-sm dark:bg-dark dark:text-light dark:ring-1 dark:ring-light/10"
    >
      {agent && (
        <div>
          <div className="flex items-start justify-between gap-4 p-5 sm:p-6">
            <div>
              <h2 id="demo-title" className="text-2xl font-bold">
                {agent.name}
              </h2>
              <p className="text-sm font-medium text-primary dark:text-primary-dark">Built for: {agent.persona}</p>
            </div>
            <button
              type="button"
              onClick={() => dialogRef.current.close()}
              aria-label="Close demo"
              className="flex size-10 shrink-0 items-center justify-center rounded-full outline-none hover:bg-dark/5 focus-visible:ring-2 focus-visible:ring-primary dark:hover:bg-light/10 dark:focus-visible:ring-primary-dark"
            >
              <CloseIcon />
            </button>
          </div>

          <div className="aspect-video bg-dark">
            <DemoView agent={agent} />
          </div>

          <div className="space-y-5 p-5 sm:p-6">
            <p className="leading-relaxed text-dark/80 dark:text-light/80">{agent.description || agent.problem}</p>
            <div className="flex flex-wrap gap-2">
              {agent.tags.map((tag) => (
                <Tag key={tag}>{tag}</Tag>
              ))}
            </div>
            <div className="flex flex-col gap-4 border-t border-dark/10 pt-5 sm:flex-row sm:items-center sm:justify-between dark:border-light/10">
              <HeartButton name={agent.name} count={heartCount} liked={liked} onLike={onLike} />
              <div className="flex flex-col items-start gap-1 sm:items-end">
                <p className="text-sm font-semibold">Interested in an agent like this?</p>
                <Link href={`/contact?agent=${agent.slug}`} className={buttonClass("primary")}>
                  Contact me <ArrowRightIcon />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </dialog>
  );
}
