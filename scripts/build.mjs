#!/usr/bin/env node
// Build helper for the monorepo.
//   node scripts/build.mjs status    list workspace packages that have a build output folder
//   node scripts/build.mjs clear     remove every build output folder
//   node scripts/build.mjs services  build all packages except apps (pnpm orders by dependency, shared first)
import { spawnSync } from "node:child_process";
import {
  existsSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
} from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const WORKSPACE_DIRS = ["packages", "services"];
const OUTPUT_DIRS = ["dist", "build"];

function findPackages(dir) {
  const found = [];
  if (!existsSync(dir)) return found;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name === "node_modules") continue;
    const full = join(dir, entry.name);
    if (existsSync(join(full, "package.json"))) found.push(full);
    else found.push(...findPackages(full));
  }
  return found;
}

function packages() {
  return WORKSPACE_DIRS.flatMap((d) => findPackages(join(root, d)))
    .map((dir) => ({
      dir,
      path: relative(root, dir),
      name: JSON.parse(readFileSync(join(dir, "package.json"), "utf8")).name,
      outputs: OUTPUT_DIRS.map((o) => join(dir, o)).filter(
        (p) => existsSync(p) && statSync(p).isDirectory(),
      ),
    }))
    .sort((a, b) => a.path.localeCompare(b.path));
}

function status() {
  const built = packages().filter((p) => p.outputs.length);
  if (!built.length)
    return console.log("No services have a build or dist folder.");
  console.log(`${built.length} package(s) with build output:\n`);
  for (const p of built) {
    const folders = p.outputs.map((o) => relative(p.dir, o)).join(", ");
    console.log(`  ${p.name.padEnd(28)} ${p.path.padEnd(28)} ${folders}`);
  }
}

function clear() {
  let removed = 0;
  for (const p of packages()) {
    for (const out of p.outputs) {
      rmSync(out, { recursive: true, force: true });
      console.log(`removed ${relative(root, out)}`);
      removed++;
    }
  }
  console.log(
    removed ? `\nCleared ${removed} build folder(s).` : "Nothing to clear.",
  );
}

function build() {
  const res = spawnSync(
    "pnpm",
    ["-r", "--filter", "!./apps/**", "run", "build"],
    {
      cwd: root,
      stdio: "inherit",
    },
  );
  process.exit(res.status ?? 1);
}

const commands = { status, clear, services: build };
const run = commands[process.argv[2]];
if (!run) {
  console.error(`Usage: build.mjs <${Object.keys(commands).join("|")}>`);
  process.exit(1);
}
run();
