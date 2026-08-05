#!/usr/bin/env node

import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, extname, join, relative, resolve } from 'node:path';
import vm from 'node:vm';

const scriptDirectory = dirname(new URL(import.meta.url).pathname);
const docsDirectory = resolve(scriptDirectory, '..');
const repositoryDirectory = resolve(docsDirectory, '..');
const outputPath = join(docsDirectory, 'ui-labels.ko.json');
const portalRequire = createRequire(join(repositoryDirectory, 'src/admin-portal/package.json'));
const typescript = portalRequire('typescript');
const cache = new Map();

function collectFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return entry.name === 'scripts' ? [] : collectFiles(path);
    return /\.mdx?$/.test(entry.name) ? [path] : [];
  });
}

function collectKeys() {
  const keys = new Set();
  for (const path of collectFiles(docsDirectory)) {
    const document = readFileSync(path, 'utf8');
    for (const match of document.matchAll(/<!--\s*ui-label:\s*([\w.-]+)\s*-->/g)) keys.add(match[1]);
  }
  return [...keys].sort();
}

function loadTypeScriptModule(path) {
  const resolvedPath = resolve(path);
  if (cache.has(resolvedPath)) return cache.get(resolvedPath).exports;

  const module = { exports: {} };
  cache.set(resolvedPath, module);
  const source = readFileSync(resolvedPath, 'utf8');
  const compiled = typescript.transpileModule(source, {
    compilerOptions: { module: typescript.ModuleKind.CommonJS, target: typescript.ScriptTarget.ES2022 },
    fileName: resolvedPath,
  }).outputText;
  const localRequire = (specifier) => {
    if (!specifier.startsWith('.')) return portalRequire(specifier);
    const candidate = resolve(dirname(resolvedPath), specifier);
    const target = extname(candidate) ? candidate : `${candidate}.ts`;
    return loadTypeScriptModule(target);
  };
  vm.runInNewContext(compiled, { exports: module.exports, module, require: localRequire }, { filename: resolvedPath });
  return module.exports;
}

function valueAt(object, key) {
  return key.split('.').reduce((value, segment) => value?.[segment], object);
}

const { ko } = loadTypeScriptModule(join(repositoryDirectory, 'src/admin-portal/i18n/locales/ko/index.ts'));
const labels = Object.fromEntries(collectKeys().map((key) => {
  const value = valueAt(ko, key);
  if (typeof value !== 'string') throw new Error(`Unknown or non-string UI label key: ${key}`);
  return [key, value];
}));
const serialized = `${JSON.stringify(labels, null, 2)}\n`;

if (process.argv.includes('--check')) {
  const current = readFileSync(outputPath, 'utf8');
  if (current !== serialized) throw new Error(`${relative(repositoryDirectory, outputPath)} is stale. Run: node product-docs/scripts/export-ui-labels.mjs`);
  console.log(`UI labels: ${Object.keys(labels).length} keys are current.`);
} else {
  writeFileSync(outputPath, serialized);
  console.log(`Wrote ${relative(repositoryDirectory, outputPath)} with ${Object.keys(labels).length} keys.`);
}
