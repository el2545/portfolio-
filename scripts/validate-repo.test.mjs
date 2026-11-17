import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const validator = fileURLToPath(new URL('./validate-repo.mjs', import.meta.url));
const canonicalBase = 'https://el2545.github.io/portfolio_UAE/';
const pages = { 'index.html': ['en', 'ltr'], 'fr.html': ['fr', 'ltr'],
  'ar.html': ['ar', 'rtl'], 'he.html': ['he', 'rtl'] };

function fixture(t) {
  const directory = mkdtempSync(path.join(tmpdir(), 'rtl-validator-'));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  const write = (name, value) => writeFileSync(path.join(directory, name), value);
  for (const [file, [lang, dir]] of Object.entries(pages)) {
    const href = canonicalBase + (file === 'index.html' ? '' : file);
    write(file, '<!doctype html><html lang="' + lang + '" dir="' + dir +
      '"><head><link rel="canonical" href="' + href +
      '"></head><body><main>Test</main></body></html>');
  }
  for (const file of ['404.html', 'styles.css', 'app.js', 'locale.js', 'i18n.js', 'README.md']) {
    write(file, 'fixture');
  }
  write('preserved-assets.sha256.json', JSON.stringify({ files: {} }));
  const run = () => spawnSync(process.execPath, [validator], {
    cwd: directory, encoding: 'utf8', timeout: 15000
  });
  return { write, run };
}

test('validator accepts a valid minimal static-site fixture', t => {
  const { run } = fixture(t);
  const result = run();
  assert.equal(result.status, 0, result.stderr);
});

test('validator rejects Hebrew with LTR document direction', t => {
  const { write, run } = fixture(t);
  write('he.html', '<html lang="he" dir="ltr"><link rel="canonical" href="' +
    canonicalBase + 'he.html"></html>');
  const result = run();
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /<html dir> must be "rtl"/);
});

test('validator rejects canonical URL placed only in unrelated markup', t => {
  const { write, run } = fixture(t);
  write('he.html', '<html lang="he" dir="rtl"><link rel="canonical" href="https://invalid.example/">' +
    '<a href="' + canonicalBase + 'he.html">External</a></html>');
  const result = run();
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /exactly one <link rel="canonical"/);
});

test('validator rejects duplicate canonical links', t => {
  const { write, run } = fixture(t);
  const correct = '<link rel="canonical" href="' + canonicalBase + 'he.html">';
  write('he.html', '<html lang="he" dir="rtl">' + correct + correct + '</html>');
  const result = run();
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /exactly one <link rel="canonical"/);
});

test('validator rejects missing local assets', t => {
  const { write, run } = fixture(t);
  write('he.html', '<html lang="he" dir="rtl"><link rel="canonical" href="' +
    canonicalBase + 'he.html"><img src="missing.png"></html>');
  const result = run();
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /missing local asset missing.png/);
});

test('validator rejects altered preserved assets', t => {
  const { write, run } = fixture(t);
  write('preserved-assets.sha256.json', JSON.stringify({
    files: { 'styles.css': '0'.repeat(64) }
  }));
  const result = run();
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /checksum mismatch: styles.css/);
});
