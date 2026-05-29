import { readdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const roots = process.argv.slice(2);
const scanRoots = roots.length ? roots : ["apps/web", "apps/dashboard"];
const extensions = new Set([".ts", ".tsx", ".js", ".jsx", ".md", ".mdx"]);
const fromImport = "@/components/ui";
const toImport = "@ecommerce/ui/components";

let changed = 0;

async function* walk(dir) {
  let entries;

  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === ".next" || entry.name === "dist") {
        continue;
      }

      yield* walk(fullPath);
      continue;
    }

    if (entry.isFile() && extensions.has(path.extname(entry.name))) {
      yield fullPath;
    }
  }
}

for (const root of scanRoots) {
  try {
    if (!(await stat(root)).isDirectory()) {
      continue;
    }
  } catch {
    console.warn(`Skipping missing path: ${root}`);
    continue;
  }

  for await (const file of walk(root)) {
    const source = await readFile(file, "utf8");
    const next = source.replaceAll(fromImport, toImport);

    if (next !== source) {
      await writeFile(file, next);
      changed += 1;
      console.log(`updated ${file}`);
    }
  }
}

console.log(`Updated ${changed} file(s).`);
