import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = path.join(root, 'i18n/en/docusaurus-plugin-content-docs/current');
const index = JSON.parse(fs.readFileSync(path.join(source, 'guide-index.json'), 'utf8'));
let output = '# ClawPod Guide\n\nPublic user and Agent documentation.\n\n[English website](https://wondermove-inc.github.io/clawpod-guide/en/) · [한국어 website](https://wondermove-inc.github.io/clawpod-guide/)\n\n';
let group;
for (const [position, page] of index.pages.entries()) {
  if (page.group !== group) { group = page.group; output += `## ${group}\n\n`; }
  output += `- [${page.title}](./${page.path}.mdx)\n`;
  if (index.pages[position + 1]?.group !== group) output += '\n';
}
output += 'See [documentation maintenance](./DOCUMENTATION.md) for editing, checks, and publishing.\n';
const target = path.join(source, 'README.md');
if (process.argv.includes('--check')) {
  if (!fs.existsSync(target) || fs.readFileSync(target, 'utf8') !== output) throw new Error('English README is stale. Run: node scripts/generate-english-readme.mjs');
} else fs.writeFileSync(target, output);
console.log('English README: current.');
