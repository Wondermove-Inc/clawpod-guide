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
const locales = config.i18n?.locales || ['ko'];
const defaultLocale = config.i18n?.defaultLocale || 'ko';
const localeDirectory = (locale) => locale === defaultLocale ? '' : locale;
for (const locale of locales) {
  for (const page of [...pages, ...compatibility]) {
    const route = path.join(build, localeDirectory(locale), page === 'index' ? '' : page, 'index.html');
    if (!fs.existsSync(route)) errors.push(`Missing page route: ${localeDirectory(locale) ? locale + '/' : ''}${page}`);
    else if (config.i18n && !fs.readFileSync(route, 'utf8').includes(`lang="${locale}"`)) errors.push(`Incorrect document language: ${locale}/${page}`);
  }
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
for (const locale of locales) {
  const output = path.join(build, localeDirectory(locale));
  const source = locale === defaultLocale ? root : path.join(root, 'i18n', locale, 'docusaurus-plugin-content-docs/current');
  for (const file of ['llms.txt', 'guide-index.json', ...pages.map((page) => `${page}.mdx`), ...compatibility.map((page) => `${page}.mdx`)]) {
    const label = localeDirectory(locale) ? `${locale}/${file}` : file;
    if (!fs.existsSync(path.join(output, file))) errors.push(`Missing public file: ${label}`);
    else if (!fs.existsSync(path.join(source, file)) || !fs.readFileSync(path.join(output, file)).equals(fs.readFileSync(path.join(source, file)))) errors.push(`Public file differs from source: ${label}`);
  }
  for (const match of fs.readFileSync(path.join(source, 'llms.txt'), 'utf8').matchAll(/\]\(\.\/([^\s)]+)\)/g)) {
    if (!fs.existsSync(path.join(output, match[1]))) errors.push(`Missing llms.txt target: ${locale}/${match[1]}`);
  }
}
if (errors.length) { console.error([...new Set(errors)].join('\n')); process.exitCode = 1; }
else console.log(`Built site: ${locales.length} languages, ${pages.length} guides, ${compatibility.length} existing routes and ${links} local links/assets passed under ${config.baseUrl}.`);
