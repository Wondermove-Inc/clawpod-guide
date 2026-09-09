import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// No network is needed for the default CI check.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const external = process.argv.includes('--external');
const errors = [];
const externalUrls = new Set();
const docs = JSON.parse(fs.readFileSync(path.join(root, 'docs.json'), 'utf8'));
const compatibility = new Set(JSON.parse(fs.readFileSync(path.join(root, 'scripts/public-compatibility-pages.json'), 'utf8')));
const pages = docs.navigation.groups.flatMap((group) => group.pages);
const indexed = JSON.parse(fs.readFileSync(path.join(root, 'guide-index.json'), 'utf8')).pages.map((page) => page.path);

function filesIn(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name.startsWith('.') || entry.name === 'node_modules') return [];
    const file = path.join(directory, entry.name);
    return entry.isDirectory() ? filesIn(file) : /\.(mdx?|txt)$/.test(entry.name) ? [file] : [];
  });
}

function prose(source) {
  return source.replace(/^---\n[\s\S]*?\n---\n/, '').replace(/^(`{3,}|~{3,})[^\n]*\n[\s\S]*?^\1\s*$/gm, '').replace(/<!--[\s\S]*?-->/g, '');
}

function anchors(source) {
  const result = new Set();
  const seen = new Map();
  for (const match of prose(source).matchAll(/^#{1,6}\s+(.+?)\s*#*$/gm)) {
    const explicit = match[1].match(/\{#([^}]+)\}/);
    if (explicit) { result.add(explicit[1]); continue; }
    const base = match[1].replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/<[^>]+>/g, '').toLowerCase().replace(/[^\p{L}\p{N}\p{M}\s_-]/gu, '').replace(/\s/g, '-');
    let id = base;
    let suffix = seen.get(base) || 0;
    while (result.has(id)) id = `${base}-${++suffix}`;
    seen.set(base, suffix);
    result.add(id);
  }
  for (const match of source.matchAll(/\b(?:id|name)=["']([^"']+)["']/g)) result.add(match[1]);
  return result;
}

const files = filesIn(root);
let linkCount = 0;
for (const file of files) {
  const label = path.relative(root, file);
  const source = prose(fs.readFileSync(file, 'utf8'));
  const references = new Map([...source.matchAll(/^\s*\[([^\]]+)\]:\s*<?([^\s>]+)>?/gm)].map((m) => [m[1].toLowerCase(), m[2]]));
  const targets = [...source.matchAll(/!?\[[^\]\n]*\]\(<?([^\s)>]+)>?(?:\s+["'][^\n]*?["'])?\)|\b(?:href|src)=["']([^"']+)["']/g)].map((m) => m[1] || m[2]);
  for (const m of source.matchAll(/!?\[([^\]\n]+)\]\[([^\]\n]*)\]/g)) {
    const ref = references.get((m[2] || m[1]).toLowerCase());
    if (ref) targets.push(ref); else errors.push(`${label}: undefined reference ${m[0]}`);
  }
  targets.push(...references.values());
  for (const url of targets) {
    linkCount++;
    if (/^https?:\/\//.test(url)) { externalUrls.add(url); continue; }
    if (/^(mailto:|tel:)/.test(url)) continue;
    if (/^[a-z][a-z0-9+.-]*:/i.test(url) || url.startsWith('//')) { errors.push(`${label}: unsupported link ${url}`); continue; }
    const [pathname, fragment] = url.split('#', 2);
    const bare = pathname.split('?')[0];
    let target;
    try { target = bare ? path.resolve(path.dirname(file), decodeURIComponent(bare)) : file; }
    catch { errors.push(`${label}: malformed URL ${url}`); continue; }
    if (bare && (!bare.startsWith('./') && !bare.startsWith('../') || !path.extname(bare))) { errors.push(`${label}: use a relative path with a file extension: ${url}`); continue; }
    const relative = path.relative(root, target);
    if (relative.startsWith('../') || path.isAbsolute(relative) || !fs.existsSync(target) || !fs.statSync(target).isFile()) { errors.push(`${label}: missing or outside-repository target ${url}`); continue; }
    if (fragment && /\.mdx?$/.test(target)) {
      try {
        if (!anchors(fs.readFileSync(target, 'utf8')).has(decodeURIComponent(fragment))) errors.push(`${label}: missing anchor ${url}`);
      } catch { errors.push(`${label}: malformed fragment ${url}`); }
    }
  }
}
for (const page of pages) {
  if (!fs.existsSync(path.join(root, `${page}.mdx`))) errors.push(`navigation: missing ${page}`);
  if (compatibility.has(page)) errors.push(`navigation: compatibility page included: ${page}`);
}
if (new Set(pages).size !== pages.length) errors.push('navigation: duplicate page');
if (JSON.stringify(indexed) !== JSON.stringify(pages)) errors.push('search index: navigation differs; regenerate guide-index.json');
for (const page of compatibility) {
  if (!fs.existsSync(path.join(root, `${page}.mdx`))) errors.push(`compatibility: missing old URL ${page}`);
  if (indexed.includes(page)) errors.push(`search index: compatibility page included: ${page}`);
}
for (const file of files.filter((file) => file.endsWith('.mdx'))) {
  const page = path.relative(root, file).replace(/\.mdx$/, '');
  if (!page.startsWith('_templates/') && !pages.includes(page) && !compatibility.has(page)) errors.push(`unclassified public page: ${page}`);
}
console.log(`Checked ${linkCount} links, ${pages.length} navigation pages, ${compatibility.size} compatibility pages.`);

if (external) {
  let unverified = 0;
  for (const url of [...externalUrls].sort()) {
    try {
      const response = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(15_000) });
      await response.body?.cancel();
      console.log(`${response.status} ${url}${response.url !== url ? ` -> ${response.url}` : ''}`);
      if ([404, 410].includes(response.status)) errors.push(`external: ${response.status} ${url}`);
      else if (!response.ok) { unverified++; console.warn(`REVIEW: access, rate limit or server response; do not assume this URL is missing: ${url}`); }
    } catch (error) { unverified++; console.warn(`REVIEW: unverified ${url}: ${error.message}`); }
  }
  console.log(`External URLs: ${externalUrls.size}; unverified: ${unverified}.`);
  if (unverified) process.exitCode = 2;
}
if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1; }
else console.log('Local links and public navigation: passed.');
