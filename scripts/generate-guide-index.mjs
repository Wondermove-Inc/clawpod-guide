import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const check = process.argv.includes("--check");
const docs = JSON.parse(fs.readFileSync(path.join(root, "docs.json"), "utf8"));

function frontmatterValue(content, key) {
  const match = content.match(new RegExp(`^${key}:\\s*(.+?)\\s*$`, "m"));
  if (!match) return "";
  return match[1].replace(/^['"]|['"]$/g, "");
}

function plainText(content) {
  return content
    .replace(/^---[\s\S]*?---\s*/m, "")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!?(?:\[([^\]]*)\])\([^)]*\)/g, "$1")
    .replace(/[`*_>#|]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const pages = docs.navigation.groups.flatMap((group) =>
  group.pages.map((page) => {
    const content = fs.readFileSync(path.join(root, `${page}.mdx`), "utf8");
    const title = frontmatterValue(content, "title");
    if (!title) throw new Error(`Missing frontmatter title: ${page}.mdx`);

    return {
      path: page,
      group: group.group,
      title,
      description: frontmatterValue(content, "description"),
      headings: [...content.matchAll(/^#{1,3}\s+(.+)$/gm)].map((match) => match[1].trim()),
      text: plainText(content),
    };
  })
);

const output = `${JSON.stringify({ version: 1, pages }, null, 2)}\n`;
const target = path.join(root, "guide-index.json");
const current = fs.existsSync(target) ? fs.readFileSync(target, "utf8") : "";

if (check) {
  if (current !== output) throw new Error("guide-index.json is stale. Run: node scripts/generate-guide-index.mjs");
  console.log("Guide search index: current.");
} else {
  fs.writeFileSync(target, output);
  console.log("Guide search index: generated.");
}
