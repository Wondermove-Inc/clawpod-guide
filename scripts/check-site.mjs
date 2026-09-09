import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const config = require('../docusaurus.config.js');
const build = path.join(root, 'build');
const guide = require('../docs.json');
const compatibility = require('./public-compatibility-pages.json');
const errors = [];
const pages = guide.navigation.groups.flatMap((group) => group.pages);
const routeFile = (page) => path.join(build, page === 'index' ? '' : page, 'index.html');
for (const page of [...pages, ...compatibility]) {
  if (!fs.existsSync(routeFile(page))) errors.push(`Missing page route: ${page}`);
}
const walk = (directory) => fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
  const file = path.join(directory, entry.name);
  return entry.isDirectory() ? walk(file) : file.endsWith('.html') ? [file] : [];
});
const anchorCache = new Map();
let links = 0;
for (const file of walk(build)) {
  const html = fs.readFileSync(file, 'utf8');
  const current = config.baseUrl + path.relative(build, file).replaceAll(path.sep, '/').replace(/index\.html$/, '');
  for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const href = match[1].replaceAll('&amp;', '&');
    if (/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(href)) continue;
    const url = new URL(href, 'https://site.invalid' + current);
    if (!url.pathname.startsWith(config.baseUrl)) { errors.push(`${current}: outside Pages base path: ${href}`); continue; }
    let target = path.join(build, decodeURIComponent(url.pathname.slice(config.baseUrl.length)));
    if (fs.existsSync(target) && fs.statSync(target).isDirectory()) target = path.join(target, 'index.html');
    if (!fs.existsSync(target)) { errors.push(`${current}: missing target ${href}`); continue; }
    links++;
    if (url.hash && target.endsWith('.html')) {
      if (!anchorCache.has(target)) anchorCache.set(target, new Set([...fs.readFileSync(target, 'utf8').matchAll(/\bid="([^"]+)"/g)].map((m) => m[1])));
      if (!anchorCache.get(target).has(decodeURIComponent(url.hash.slice(1)))) errors.push(`${current}: missing anchor ${href}`);
    }
  }
}
for (const file of ['llms.txt', 'guide-index.json', ...pages.map((page) => `${page}.mdx`), ...compatibility.map((page) => `${page}.mdx`)]) {
  if (!fs.existsSync(path.join(build, file))) errors.push(`Missing public file: ${file}`);
  else if (!fs.readFileSync(path.join(build, file)).equals(fs.readFileSync(path.join(root, file)))) errors.push(`Public file differs from source: ${file}`);
}
for (const match of fs.readFileSync(path.join(root, 'llms.txt'), 'utf8').matchAll(/\]\(\.\/([^\s)]+)\)/g)) {
  if (!fs.existsSync(path.join(build, match[1]))) errors.push(`Missing llms.txt target: ${match[1]}`);
}
if (errors.length) { console.error([...new Set(errors)].join('\n')); process.exitCode = 1; }
else console.log(`Built site: ${pages.length} guides, ${compatibility.length} existing routes and ${links} local links/assets passed under ${config.baseUrl}.`);
