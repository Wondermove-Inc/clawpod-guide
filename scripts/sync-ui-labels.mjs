#!/usr/bin/env node

import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

const scriptDirectory = dirname(new URL(import.meta.url).pathname);
const root = resolve(scriptDirectory, '..');
const locale = process.argv.includes('--english') ? 'en' : 'ko';
const docsDirectory = locale === 'en' ? join(root, 'i18n/en/docusaurus-plugin-content-docs/current') : root;
const labels = JSON.parse(readFileSync(join(root, `ui-labels.${locale}.json`), 'utf8'));
const checkOnly = process.argv.includes('--check');
const marker = /<span data-ui-label="([\w.-]+)">([^\n]*?)<\/span>/g;

function collectFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return ['scripts', 'node_modules', 'build', 'i18n'].includes(entry.name) || entry.name.startsWith('.') ? [] : collectFiles(path);
    return /\.mdx?$/.test(entry.name) ? [path] : [];
  });
}

const stale = [];
for (const path of collectFiles(docsDirectory)) {
  const source = readFileSync(path, 'utf8');
  const updated = source.replace(marker, (whole, key, current) => {
    const label = labels[key];
    if (typeof label !== 'string') throw new Error(`${path}: unknown UI label key: ${key}`);
    const escaped = label.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll("{", "&#123;").replaceAll("}", "&#125;");
    if (current !== escaped) stale.push(path);
    return `<span data-ui-label="${key}">${escaped}</span>`;
  });
  if (updated !== source && !checkOnly) writeFileSync(path, updated);
}

if (checkOnly && stale.length) {
  const paths = [...new Set(stale)].map((path) => path.replace(`${docsDirectory}/`, '')).join(', ');
  throw new Error(`Stale UI labels in: ${paths}. Run: node scripts/sync-ui-labels.mjs`);
}

console.log(`UI label sync: ${checkOnly ? 'current' : 'completed'}.`);
