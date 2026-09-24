// Generates public/Mridul_Gulati_Resume.pdf by printing the /resume page with headless Chrome,
// so the downloadable PDF always matches the rendered page.
//
// Workflow: edit src/data/resume.js, run the site locally (npm run dev), then
//   npm run resume:pdf
// and commit the updated PDF together with the data change, so one deploy ships both.
// It prints http://localhost:3000/resume by default. Passing a URL (e.g. the Vercel one) also
// works, but that prints what is already deployed, not your local edits:
//   npm run resume:pdf -- https://<project>.vercel.app/resume
// Set CHROME_PATH if Chrome or Edge lives somewhere unusual.

import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

const url = process.argv[2] || "http://localhost:3000/resume";
const out = resolve("public/Mridul_Gulati_Resume.pdf");

const candidates = [
  process.env.CHROME_PATH,
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
].filter(Boolean);

const chrome = candidates.find((path) => existsSync(path));
if (!chrome) {
  console.error("No Chrome/Edge found. Set CHROME_PATH to your browser binary.");
  process.exit(1);
}

try {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
} catch (err) {
  console.error(`Could not load ${url} (${err.message}). Is the site running?`);
  process.exit(1);
}

execFileSync(
  chrome,
  [
    "--headless=new",
    "--disable-gpu",
    "--no-pdf-header-footer",
    "--virtual-time-budget=5000",
    `--print-to-pdf=${out}`,
    url,
  ],
  { stdio: "inherit" }
);

console.log(`Wrote ${out}`);
