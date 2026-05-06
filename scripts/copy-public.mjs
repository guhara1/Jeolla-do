import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, statSync } from "node:fs";
import { join } from "node:path";

if (!existsSync("out")) {
  throw new Error("Missing out directory. Run build-static before copy-public.");
}

if (existsSync("public")) {
  rmSync("public", { recursive: true, force: true });
}
mkdirSync("public", { recursive: true });
cpSync("out", "public", { recursive: true });

const keep = new Set([".git", "scripts", "node_modules", "out", "public", "package.json", "netlify.toml", "README.md", ".gitignore"]);
for (const entry of readdirSync(".")) {
  if (keep.has(entry)) continue;
  if (entry === "index.html" || entry === "sitemap.xml" || entry === "robots.txt" || entry === "rss.xml" || entry === "favicon.svg" || entry === "area") {
    const stat = statSync(entry);
    rmSync(entry, { recursive: stat.isDirectory(), force: true });
  }
}

for (const entry of readdirSync("out")) {
  cpSync(join("out", entry), entry, { recursive: true });
}
