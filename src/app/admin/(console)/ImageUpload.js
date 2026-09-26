"use client";

import { useRef, useState } from "react";
import { uploadImage } from "./media-actions";

// Shared upload helper: sends one file to the media bucket and returns { url } or { error }.
export async function upload(file, folder) {
  const data = new FormData();
  data.set("file", file);
  data.set("folder", folder);
  try {
    return await uploadImage(data);
  } catch {
    return { error: "Upload failed. Check the file is under 5 MB." };
  }
}

// A single-image field (cover image, agent thumbnail): upload, preview, replace or remove.
// The URL is submitted with the surrounding form via a hidden input.
export default function ImageField({ name, folder, defaultValue, label, aspect = "aspect-video" }) {
  const [url, setUrl] = useState(defaultValue ?? "");
  const [status, setStatus] = useState(null);
  const inputRef = useRef(null);

  async function onFile(file) {
    if (!file) return;
    setStatus("Uploading…");
    const result = await upload(file, folder);
    if (result.error) return setStatus(result.error);
    setUrl(result.url);
    setStatus(null);
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold">{label}</p>
      <input type="hidden" name={name} value={url} />
      <div className={`relative overflow-hidden rounded-xl border border-dashed border-dark/20 bg-dark/5 dark:border-light/20 dark:bg-light/5 ${aspect}`}>
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt="" className="size-full object-cover" />
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex size-full items-center justify-center text-sm text-dark/60 hover:text-dark dark:text-light/60 dark:hover:text-light"
          >
            Click to upload an image
          </button>
        )}
      </div>
      <div className="flex gap-3 text-sm">
        <button type="button" onClick={() => inputRef.current?.click()} className="font-semibold hover:underline">
          {url ? "Replace" : "Upload"}
        </button>
        {url && (
          <button type="button" onClick={() => setUrl("")} className="text-red-600 hover:underline dark:text-red-400">
            Remove
          </button>
        )}
        {status && <span className="text-dark/60 dark:text-light/60">{status}</span>}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
        className="hidden"
        onChange={(e) => onFile(e.target.files?.[0])}
      />
    </div>
  );
}
