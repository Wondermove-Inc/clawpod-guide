import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const scripts = path.dirname(fileURLToPath(import.meta.url));
function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'clawpod-docs-test-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.mkdirSync(path.join(root, 'scripts'));
  fs.mkdirSync(path.join(root, 'guides'));
  for (const name of ['check-links.mjs', 'sync-ui-labels.mjs', 'generate-guide-index.mjs']) fs.copyFileSync(path.join(scripts, name), path.join(root, 'scripts', name));
  const write = (file, text) => fs.writeFileSync(path.join(root, file), text);
  const json = (file, value) => write(file, JSON.stringify(value));
  const run = (name, ...args) => spawnSync(process.execPath, [path.join(root, 'scripts', name), ...args], { cwd: root, encoding: 'utf8' });
  json('docs.json', { navigation: { groups: [{ group: 'Guide', pages: ['index', 'guides/start'] }] } });
  json('guide-index.json', { pages: [{ path: 'index' }, { path: 'guides/start' }] });
  json('scripts/public-compatibility-pages.json', ['old']);
  write('old.mdx', '# Previous URL\n[Start](./guides/start.mdx)\n');
  write('index.mdx', '---\ntitle: Home\n---\n# Home\n[Start](./guides/start.mdx#계정-설정)\n');
  write('guides/start.mdx', '---\ntitle: Start\n---\n# 계정 설정\n[Home](../index.mdx)\n');
  return { root, write, json, run };
}

test('relative MDX links, Korean/duplicate anchors, references and fenced examples', (t) => {
  const f = fixture(t);
  f.write('guides/start.mdx', '# 계정 설정\n# 계정 설정\n[Again](#계정-설정-1)\n[Home][home]\n[home]: ../index.mdx\n<a href="../index.mdx#home">Home</a>\n```md\n[Example](/does-not-exist)\n```\n');
  const result = f.run('check-links.mjs');
  assert.equal(result.status, 0, result.stderr);
});
for (const [name, body, diagnostic] of [
  ['site-only path', '[Bad](/guides/start)', /relative path with a file extension/],
  ['ambiguous sibling path', '[Bad](start.mdx)', /relative path with a file extension/],
  ['missing page', '[Bad](./guides/missing.mdx)', /missing or outside-repository target/],
  ['missing anchor', '[Bad](./guides/start.mdx#missing)', /missing anchor/],
  ['outside repository', '[Bad](../outside.md)', /outside-repository/],
  ['undefined reference', '[Bad][missing]', /undefined reference/],
]) test(`rejects ${name}`, (t) => {
  const f = fixture(t); f.write('index.mdx', `# Home\n${body}\n`);
  const result = f.run('check-links.mjs'); assert.equal(result.status, 1); assert.match(result.stderr, diagnostic);
});
test('rejects removed compatibility URLs', (t) => {
  const f = fixture(t); fs.unlinkSync(path.join(f.root, 'old.mdx'));
  const result = f.run('check-links.mjs'); assert.equal(result.status, 1); assert.match(result.stderr, /compatibility: missing old URL/);
});
test('rejects compatibility pages in navigation and search', (t) => {
  const f = fixture(t);
  f.json('docs.json', { navigation: { groups: [{ group: 'Guide', pages: ['index', 'guides/start', 'old'] }] } });
  f.json('guide-index.json', { pages: [{ path: 'index' }, { path: 'guides/start' }, { path: 'old' }] });
  const result = f.run('check-links.mjs'); assert.equal(result.status, 1); assert.match(result.stderr, /navigation: compatibility page/); assert.match(result.stderr, /search index: compatibility page/);
});
test('rejects unclassified MDX pages and stale indexes', (t) => {
  const f = fixture(t); f.write('extra.mdx', '# Extra\n'); f.json('guide-index.json', { pages: [] });
  const result = f.run('check-links.mjs'); assert.equal(result.status, 1); assert.match(result.stderr, /unclassified public page/); assert.match(result.stderr, /navigation differs/);
});
test('UI label sync escapes MDX syntax and search strips markup', (t) => {
  const f = fixture(t); f.json('ui-labels.ko.json', { 'nav.test': 'A & <B> {C}' });
  f.write('guides/start.mdx', '---\ntitle: Start\n---\n# Start\n<span data-ui-label="nav.test">Old</span>\n');
  assert.equal(f.run('sync-ui-labels.mjs', '--check').status, 1);
  assert.equal(f.run('sync-ui-labels.mjs').status, 0);
  assert.equal(f.run('sync-ui-labels.mjs', '--check').status, 0);
  assert.match(fs.readFileSync(path.join(f.root, 'guides/start.mdx'), 'utf8'), /A &amp; &lt;B&gt; &#123;C&#125;/);
  assert.equal(f.run('generate-guide-index.mjs').status, 0);
  const index = JSON.parse(fs.readFileSync(path.join(f.root, 'guide-index.json'), 'utf8'));
  assert.doesNotMatch(index.pages[1].text, /data-ui-label|<span/);
});

function siteFixture(t) {
  const f = fixture(t);
  fs.copyFileSync(path.join(scripts, 'check-site.mjs'), path.join(f.root, 'scripts/check-site.mjs'));
  f.write('docusaurus.config.js', "module.exports = { baseUrl: '/clawpod-guide/' };\n");
  f.write('llms.txt', '[Guide](./index.mdx)\n');
  for (const dir of ['build/guides/start', 'build/old']) fs.mkdirSync(path.join(f.root, dir), { recursive: true });
  for (const file of ['llms.txt', 'guide-index.json', 'index.mdx', 'guides/start.mdx', 'old.mdx']) fs.copyFileSync(path.join(f.root, file), path.join(f.root, 'build', file));
  f.write('build/index.html', '<h1 id="home">Home</h1><a href="/clawpod-guide/guides/start/#계정-설정">Start</a>');
  f.write('build/guides/start/index.html', '<h1 id="계정-설정">Start</h1>');
  f.write('build/old/index.html', '<a href="/clawpod-guide/">Home</a>');
  return f;
}

test('built site preserves page routes, raw documents and Korean fragments', (t) => {
  const f = siteFixture(t); const result = f.run('check-site.mjs');
  assert.equal(result.status, 0, result.stderr);
});
test('built site rejects links outside the GitHub Pages subpath', (t) => {
  const f = siteFixture(t); f.write('build/index.html', '<a href="/guides/start/">Start</a>');
  const result = f.run('check-site.mjs'); assert.equal(result.status, 1); assert.match(result.stderr, /outside Pages base path/);
});
test('built site rejects absent compatibility routes and raw sources', (t) => {
  const f = siteFixture(t); fs.unlinkSync(path.join(f.root, 'build/old/index.html')); fs.unlinkSync(path.join(f.root, 'build/guides/start.mdx'));
  const result = f.run('check-site.mjs'); assert.equal(result.status, 1); assert.match(result.stderr, /Missing page route: old/); assert.match(result.stderr, /Missing public file: guides\/start.mdx/);
});
test('built site rejects missing assets and anchors', (t) => {
  const f = siteFixture(t); f.write('build/index.html', '<img src="/clawpod-guide/absent.png"><a href="/clawpod-guide/guides/start/#absent">Start</a>');
  const result = f.run('check-site.mjs'); assert.equal(result.status, 1); assert.match(result.stderr, /missing target/); assert.match(result.stderr, /missing anchor/);
});
