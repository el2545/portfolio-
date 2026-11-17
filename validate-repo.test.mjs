import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { validateRepository } from './scripts/validate-repo.mjs';

const validPage = (file, dir = file === 'ar.html' || file === 'he.html' ? 'rtl' : 'ltr') => {
  const lang = file === 'index.html' ? 'en' : file.slice(0, 2);
  const canonical = `https://el2545.github.io/portfolio_UAE/${file === 'index.html' ? '' : file}`;
  return `<html lang="${lang}" dir="${dir}"><head><link rel="canonical" href="${canonical}"><script src="asset.js"></script></head></html>`;
};

async function fixture() {
  const root = await mkdtemp(path.join(tmpdir(), 'portfolio-validator-'));
  await mkdir(path.join(root, 'scripts'));
  await writeFile(path.join(root, 'asset.js'), '');
  for (const file of ['index.html', 'fr.html', 'ar.html', 'he.html']) {
    await writeFile(path.join(root, file), validPage(file));
  }
  await writeFile(path.join(root, '404.html'), '');
  for (const file of ['styles.css', 'app.js', 'locale.js', 'i18n.js', 'README.md']) {
    await writeFile(path.join(root, file), '');
  }
  await writeFile(path.join(root, 'preserved-assets.sha256.json'), '{"files":{}}');
  return root;
}

test('validator rejects an invalid RTL direction', async () => {
  const root = await fixture();
  await writeFile(path.join(root, 'he.html'), validPage('he.html', 'ltr'));
  const errors = await validateRepository(root);
  assert.ok(errors.some(error => error.includes('he.html: <html dir> must be "rtl"')));
});

test('validator rejects a missing local asset', async () => {
  const root = await fixture();
  await writeFile(path.join(root, 'he.html'), validPage('he.html').replace('asset.js', 'missing.js'));
  const errors = await validateRepository(root);
  assert.ok(errors.some(error => error.includes('he.html: missing local asset missing.js')));
});

test('validator rejects an incorrect canonical URL regardless of attribute order', async () => {
  const root = await fixture();
  await writeFile(path.join(root, 'he.html'), '<html lang="he" dir="rtl"><head><link href="https://example.test/he.html" data-test="x" rel="canonical"></head></html>');
  const errors = await validateRepository(root);
  assert.ok(errors.some(error => error.includes('he.html: canonical link must be https://el2545.github.io/portfolio_UAE/he.html')));
});
