"use client";

import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import Markdown from "@/components/Markdown";
import { buttonClass } from "@/components/ui";
import ImageField, { upload } from "../ImageUpload";
import { Field, Notice, inputClass } from "../admin-ui";
import { savePost } from "./actions";

const slugify = (text) =>
  text.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);

// ISO timestamp <-> value for <input type="datetime-local"> in the author's own timezone.
const toLocalInput = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

// Toolbar actions: wrap the selection, or prefix the current line(s).
const tools = [
  { label: "H2", title: "Heading", prefix: "## " },
  { label: "B", title: "Bold", wrap: ["**", "**"], className: "font-bold" },
  { label: "I", title: "Italic", wrap: ["_", "_"], className: "italic" },
  { label: "Link", title: "Link", wrap: ["[", "](https://)"] },
  { label: "`code`", title: "Inline code", wrap: ["`", "`"], className: "font-mono" },
  { label: "{ }", title: "Code block", wrap: ["\n```python\n", "\n```\n"], className: "font-mono" },
  { label: "❝", title: "Quote", prefix: "> " },
  { label: "•", title: "Bulleted list", prefix: "- " },
];

export default function PostEditor({ post, saved }) {
  const [state, formAction, pending] = useActionState(savePost, null);
  const values = state?.values ?? post ?? {};
  const errors = state?.errors ?? {};

  const [title, setTitle] = useState(values.title ?? "");
  const [slug, setSlug] = useState(values.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(post?.slug));
  const [body, setBody] = useState(values.body ?? "");
  const [excerpt, setExcerpt] = useState(values.excerpt ?? "");
  const [publishAt, setPublishAt] = useState(toLocalInput(values.published_at));
  // Controlled fields. The form submits via onSubmit (not the `action` prop) because React 19
  // resets a form after every `action` submission, which snapped Status back to "Draft" and
  // could silently unpublish a post on the next save.
  const [status, setStatus] = useState(values.status ?? "draft");
  const [tags, setTags] = useState((values.tags ?? []).join(", "));
  const [view, setView] = useState("split");
  const [uploading, setUploading] = useState(null);
  const [dirty, setDirty] = useState(false);
  const textareaRef = useRef(null);
  const formRef = useRef(null);
  const fileRef = useRef(null);

  // Saved successfully: the form is clean again.
  useEffect(() => {
    if (state?.status === "saved") setDirty(false);
  }, [state]);

  // Warn before leaving with unsaved changes.
  useEffect(() => {
    const warn = (e) => dirty && e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  // Cmd/Ctrl+S saves.
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        formRef.current?.requestSubmit();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function insert(text, { select } = {}) {
    const el = textareaRef.current;
    const start = el.selectionStart;
    const next = body.slice(0, start) + text + body.slice(el.selectionEnd);
    setBody(next);
    setDirty(true);
    requestAnimationFrame(() => {
      el.focus();
      const cursor = start + (select ?? text.length);
      el.setSelectionRange(cursor, cursor);
    });
  }

  function applyTool(tool) {
    const el = textareaRef.current;
    const { selectionStart: start, selectionEnd: end } = el;
    const selected = body.slice(start, end);
    let next, cursorStart, cursorEnd;

    if (tool.wrap) {
      const [before, after] = tool.wrap;
      next = body.slice(0, start) + before + selected + after + body.slice(end);
      cursorStart = start + before.length;
      cursorEnd = cursorStart + selected.length;
    } else {
      const lineStart = body.lastIndexOf("\n", start - 1) + 1;
      const block = body.slice(lineStart, end).split("\n").map((line) => tool.prefix + line).join("\n");
      next = body.slice(0, lineStart) + block + body.slice(end);
      cursorStart = cursorEnd = lineStart + block.length;
    }

    setBody(next);
    setDirty(true);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(cursorStart, cursorEnd);
    });
  }

  async function uploadInline(files) {
    const images = [...files].filter((f) => f.type.startsWith("image/"));
    for (const file of images) {
      setUploading(`Uploading ${file.name}…`);
      const result = await upload(file, "posts");
      if (result.error) {
        setUploading(result.error);
        return;
      }
      const alt = file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ");
      insert(`\n![${alt}](${result.url})\n`);
    }
    setUploading(null);
  }

  return (
    <form
      ref={formRef}
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        startTransition(() => formAction(data));
      }}
      onChange={() => setDirty(true)}
      className="space-y-6"
    >
      <input type="hidden" name="id" value={post?.id ?? ""} />
      <input type="hidden" name="body" value={body} />
      <input type="hidden" name="published_at" value={publishAt ? new Date(publishAt).toISOString() : ""} />

      {saved && !state && <Notice>Post created.</Notice>}
      {state?.status === "saved" && <Notice>{state.message}</Notice>}
      {state?.message && state.status === "error" && <Notice tone="error">{state.message}</Notice>}
      {Object.keys(errors).length > 0 && <Notice tone="error">Please fix the highlighted fields.</Notice>}

      <div className="grid gap-6 xl:grid-cols-[1fr_20rem]">
        <div className="min-w-0 space-y-5">
          <Field label="Title" name="title" error={errors.title}>
            <input
              id="title"
              name="title"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (!slugTouched) setSlug(slugify(e.target.value));
              }}
              required
              maxLength={200}
              aria-invalid={errors.title ? true : undefined}
              className={`${inputClass} text-lg font-semibold`}
            />
          </Field>

          <Field label="Slug" name="slug" error={errors.slug} hint={`/blog/${slug || "your-post"}`}>
            <input
              id="slug"
              name="slug"
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value);
                setSlugTouched(true);
              }}
              aria-invalid={errors.slug ? true : undefined}
              className={`${inputClass} font-mono text-sm`}
            />
          </Field>

          {/* Editor */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap gap-1" role="toolbar" aria-label="Formatting">
                {tools.map((tool) => (
                  <button
                    key={tool.title}
                    type="button"
                    title={tool.title}
                    aria-label={tool.title}
                    onClick={() => applyTool(tool)}
                    className={`min-w-9 rounded-md border border-dark/15 px-2 py-1 text-sm hover:bg-dark/5 dark:border-light/15 dark:hover:bg-light/10 ${tool.className ?? ""}`}
                  >
                    {tool.label}
                  </button>
                ))}
                <button
                  type="button"
                  title="Upload image"
                  aria-label="Insert image"
                  onClick={() => fileRef.current?.click()}
                  className="rounded-md border border-dark/15 px-2 py-1 text-sm hover:bg-dark/5 dark:border-light/15 dark:hover:bg-light/10"
                >
                  Image
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
                  multiple
                  className="hidden"
                  onChange={(e) => uploadInline(e.target.files)}
                />
              </div>
              <div className="flex rounded-md border border-dark/15 text-sm dark:border-light/15" role="group" aria-label="Editor view">
                {["write", "split", "preview"].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setView(v)}
                    aria-pressed={view === v}
                    className={`px-3 py-1 capitalize aria-pressed:bg-dark aria-pressed:text-light dark:aria-pressed:bg-light dark:aria-pressed:text-dark ${v === "split" ? "hidden lg:block" : ""}`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            <div className={`grid gap-4 ${view === "split" ? "lg:grid-cols-2" : ""}`}>
              <textarea
                ref={textareaRef}
                aria-label="Post body (markdown)"
                value={body}
                onChange={(e) => {
                  setBody(e.target.value);
                  setDirty(true);
                }}
                onPaste={(e) => e.clipboardData.files.length && (e.preventDefault(), uploadInline(e.clipboardData.files))}
                onDrop={(e) => e.dataTransfer.files.length && (e.preventDefault(), uploadInline(e.dataTransfer.files))}
                placeholder={"Write in markdown. Paste or drop images to upload them.\n\n```python\nprint(\"code blocks are highlighted\")\n```"}
                spellCheck
                className={`${inputClass} min-h-[60vh] resize-y font-mono text-sm leading-relaxed ${view === "preview" ? "hidden" : ""}`}
              />
              <div
                className={`min-h-[60vh] overflow-auto rounded-lg border border-dark/10 bg-white p-5 dark:border-light/10 dark:bg-white/5 ${view === "write" ? "hidden" : ""} ${view === "split" ? "hidden lg:block" : ""}`}
              >
                {body.trim() ? <Markdown>{body}</Markdown> : <p className="text-dark/50 dark:text-light/50">Preview appears here.</p>}
              </div>
            </div>
            <div className="flex justify-between text-xs text-dark/60 dark:text-light/60">
              <span>{uploading ?? "Markdown with GitHub extensions. ⌘/Ctrl+S to save."}</span>
              <span>{body.trim().split(/\s+/).filter(Boolean).length} words</span>
            </div>
            {errors.body && <p className="text-sm text-red-600 dark:text-red-400">{errors.body}</p>}
          </div>
        </div>

        {/* Sidebar: publishing and metadata */}
        <aside className="space-y-5 xl:sticky xl:top-6 xl:self-start">
          <div className="space-y-4 rounded-2xl border border-dark/10 bg-white p-5 dark:border-light/10 dark:bg-white/5">
            <Field label="Status" name="status">
              <select id="status" name="status" value={status} onChange={(e) => setStatus(e.target.value)} className={inputClass}>
                <option value="draft">Draft (only you can see it)</option>
                <option value="published">Published</option>
              </select>
            </Field>
            <Field label="Publish date" name="publish_at_local" hint="Leave empty to publish now. A future date schedules it.">
              <input
                id="publish_at_local"
                type="datetime-local"
                value={publishAt}
                onChange={(e) => setPublishAt(e.target.value)}
                className={inputClass}
              />
            </Field>
            <button type="submit" disabled={pending} className={`${buttonClass("primary")} w-full`}>
              {pending ? "Saving…" : "Save"}
            </button>
            {dirty && !pending && <p className="text-center text-xs text-dark/60 dark:text-light/60">Unsaved changes</p>}
          </div>

          <Field label="Excerpt" name="excerpt" error={errors.excerpt} hint={`${excerpt.length}/400 · shown on the blog index and in link previews`}>
            <textarea
              id="excerpt"
              name="excerpt"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={4}
              maxLength={400}
              className={inputClass}
            />
          </Field>

          <Field label="Tags" name="tags" hint="Comma separated, e.g. RAG, Evals, LangGraph">
            <input id="tags" name="tags" value={tags} onChange={(e) => setTags(e.target.value)} className={inputClass} />
          </Field>

          <ImageField name="cover_image" folder="covers" defaultValue={values.cover_image} label="Cover image" />
        </aside>
      </div>
    </form>
  );
}
