"use client";

import { useActionState, useState } from "react";
import { buttonClass } from "@/components/ui";
import ImageField from "../ImageUpload";
import { Field, Notice, inputClass } from "../admin-ui";
import { saveAgent } from "./actions";

const slugify = (text) =>
  text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);

// React 19 resets uncontrolled fields after every form action. Remounting the fields with the
// values the server returned keeps what was saved (or what was typed, after a validation error).
export default function AgentForm({ agent, saved }) {
  const [state, formAction, pending] = useActionState(saveAgent, null);
  const values = state?.values ?? agent ?? { demo_type: "video", published: false };
  return <AgentFields key={JSON.stringify(values)} {...{ agent, saved, state, formAction, pending, values }} />;
}

function AgentFields({ agent, saved, state, formAction, pending, values }) {
  const errors = state?.errors ?? {};

  const [name, setName] = useState(values.name ?? "");
  const [slug, setSlug] = useState(values.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(agent?.slug));
  const [problem, setProblem] = useState(values.problem ?? "");

  const props = (field) => ({
    id: field,
    name: field,
    "aria-invalid": errors[field] ? true : undefined,
    className: inputClass,
  });

  return (
    <form action={formAction} className="max-w-3xl space-y-6">
      <input type="hidden" name="id" value={agent?.id ?? ""} />

      {saved && !state && <Notice>Agent created.</Notice>}
      {state?.status === "saved" && <Notice>{state.message}</Notice>}
      {state?.status === "error" && <Notice tone="error">{state.message ?? "Please fix the highlighted fields."}</Notice>}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Name" name="name" error={errors.name}>
          <input
            {...props("name")}
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (!slugTouched) setSlug(slugify(e.target.value));
            }}
            required
          />
        </Field>
        <Field label="Slug" name="slug" error={errors.slug} hint={`/projects?agent=${slug || "slug"}`}>
          <input
            {...props("slug")}
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value);
              setSlugTouched(true);
            }}
            className={`${inputClass} font-mono text-sm`}
          />
        </Field>
      </div>

      <Field label="Built for (persona)" name="persona" error={errors.persona} hint="e.g. Site reliability engineers">
        <input {...props("persona")} defaultValue={values.persona} required />
      </Field>

      <Field label="Problem (shown on the card)" name="problem" error={errors.problem} hint={`${problem.length}/220`}>
        <textarea {...props("problem")} value={problem} onChange={(e) => setProblem(e.target.value)} rows={2} maxLength={220} required />
      </Field>

      <Field label="Description (shown in the demo window)" name="description">
        <textarea {...props("description")} defaultValue={values.description} rows={4} />
      </Field>

      <Field label="Tags" name="tags" hint="Comma separated. Used for catalogue filters.">
        <input {...props("tags")} defaultValue={(values.tags ?? []).join(", ")} />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="YouTube video" name="youtube_id" error={errors.youtube_id} hint="Paste the unlisted video's link or its 11-character id.">
          <input {...props("youtube_id")} defaultValue={values.youtube_id ?? ""} placeholder="https://youtu.be/…" />
        </Field>
        <Field label="Demo type" name="demo_type" hint="Live 'Try it' mode arrives in a later phase; video is used until then.">
          <select {...props("demo_type")} defaultValue={values.demo_type}>
            <option value="video">Video</option>
            <option value="live">Live (later)</option>
          </select>
        </Field>
      </div>

      <div className="max-w-md">
        <ImageField
          name="thumbnail"
          folder="agents"
          defaultValue={values.thumbnail}
          label="Thumbnail (optional; defaults to the YouTube thumbnail)"
        />
      </div>

      <label className="flex items-center gap-3 rounded-xl border border-dark/10 bg-white p-4 dark:border-light/10 dark:bg-white/5">
        <input type="checkbox" name="published" defaultChecked={values.published} className="size-5 accent-primary dark:accent-primary-dark" />
        <span>
          <span className="block font-semibold">Show in the public catalogue</span>
          <span className="text-sm text-dark/60 dark:text-light/60">Unchecked agents stay hidden.</span>
        </span>
      </label>

      <button type="submit" disabled={pending} className={buttonClass("primary")}>
        {pending ? "Saving…" : "Save agent"}
      </button>
    </form>
  );
}
