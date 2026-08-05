#!/usr/bin/env node

import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

const scriptDirectory = dirname(new URL(import.meta.url).pathname);
const docsDirectory = resolve(scriptDirectory, '..');
const labels = JSON.parse(readFileSync(join(docsDirectory, 'ui-labels.ko.json'), 'utf8'));
const checkOnly = process.argv.includes('--check');
const marker = /<!--\s*ui-label:\s*([\w.-]+)\s*-->([^\n]*?)<!--\s*\/ui-label\s*-->/g;

function collectFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return entry.name === 'scripts' ? [] : collectFiles(path);
    return /\.mdx?$/.test(entry.name) ? [path] : [];
  });
}

const stale = [];
for (const path of collectFiles(docsDirectory)) {
  const source = readFileSync(path, 'utf8');
  const updated = source.replace(marker, (whole, key, current) => {
    const label = labels[key];
    if (typeof label !== 'string') throw new Error(`${path}: unknown UI label key: ${key}`);
    if (current !== label) stale.push(path);
    return `<!-- ui-label: ${key} -->${label}<!-- /ui-label -->`;
  });
  if (updated !== source && !checkOnly) writeFileSync(path, updated);
}

if (checkOnly && stale.length) {
  const paths = [...new Set(stale)].map((path) => path.replace(`${docsDirectory}/`, '')).join(', ');
  throw new Error(`Stale UI labels in: ${paths}. Run: node product-docs/scripts/sync-ui-labels.mjs`);
}

console.log(`UI label sync: ${checkOnly ? 'current' : 'completed'}.`);
