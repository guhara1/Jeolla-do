import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = "out";
const google = '<meta name="google-site-verification" content="X93GGlzAy5MWuA-HXEijTHTQCYAIa3_j7FVZKL1k9pg">';
const naver = '<meta name="naver-site-verification" content="702ccc5484e7741faa3ef328e1781587ffc038ad">';

function cleanVerification(html) {
  return html
    .replace(/<meta name="google-site-verification" content="[^"]*"\s*\/?\s*>/g, "")
    .replace(/<meta name="naver-site-verification" content="[^"]*"\s*\/?\s*>/g, "");
}
function updateHtml(file) {
  let html = readFileSync(file, "utf8");
  html = cleanVerification(html);
  html = html.replace("</head>", `${google}${naver}</head>`);
  writeFileSync(file, html, "utf8");
}
function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    if (entry.isFile() && entry.name.endsWith(".html")) updateHtml(full);
  }
}

if (!existsSync(root) || !statSync(root).isDirectory()) throw new Error("Missing out directory");
walk(root);
