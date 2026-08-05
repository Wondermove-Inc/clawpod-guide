import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const check = process.argv.includes("--check");
const docs = JSON.parse(fs.readFileSync(path.join(root, "docs.json"), "utf8"));

function titleFor(page) {
  const file = path.join(root, `${page}.mdx`);
  const content = fs.readFileSync(file, "utf8");
  const match = content.match(/^---\s*\ntitle:\s*(.+?)\s*\n/m);
  if (!match) throw new Error(`Missing frontmatter title: ${page}.mdx`);
  return match[1].replace(/^['"]|['"]$/g, "");
}

const lines = [
  "# ClawPod 가이드",
  "",
  "> 이 파일은 `docs.json`에서 자동 생성됩니다. 직접 수정하지 말고 `node scripts/generate-readme.mjs`를 실행하세요.",
  "",
  "ClawPod의 소비자·Agent용 제품 문서입니다. 문서 작성·검증 규칙은 [DOCUMENTATION.md](DOCUMENTATION.md)를 참고하세요.",
  "",
  "## 목차",
  "",
];

for (const group of docs.navigation.groups) {
  lines.push(`### ${group.group}`, "");
  for (const page of group.pages) lines.push(`- [${titleFor(page)}](${page}.mdx)`);
  lines.push("");
}

const output = `${lines.join("\n").trimEnd()}\n`;
const target = path.join(root, "README.md");
const current = fs.existsSync(target) ? fs.readFileSync(target, "utf8") : "";

if (check) {
  if (current !== output) throw new Error("README.md is stale. Run: node scripts/generate-readme.mjs");
  console.log("README table of contents: current.");
} else {
  fs.writeFileSync(target, output);
  console.log("README table of contents: generated.");
}
