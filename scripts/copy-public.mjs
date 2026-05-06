import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";

if (!existsSync("out")) {
  throw new Error("Missing out directory. Run build-static before copy-public.");
}

if (existsSync("public")) {
  rmSync("public", { recursive: true, force: true });
}

mkdirSync("public", { recursive: true });
cpSync("out", "public", { recursive: true });
