import { createHash } from 'node:crypto';
import { readFile, stat, readdir } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const errors = [];
const pages = ['index.html', 'fr.html', 'ar.html', 'he.html', '404.html'];
const requiredFiles = [...pages, 'styles.css', 'app.js', 'locale.js', 'i18n.js',
  'preserved-assets.sha256.json', 'README.md'];

function fail(message) {
  errors.push(message);
}

async function isFile(file) {
  try {
    return (await stat(path.join(root, file))).isFile();
  } catch {
    return false;
  }
}

for (const file of requiredFiles) {
  if (!await isFile(file)) fail(`Missing required file: ${file}`);
}

const canonicalBase = 'https://el2545.github.io/portfolio_UAE/';
for (const file of pages.filter(file => file !== '404.html')) {
  if (!await isFile(file)) continue;
  const html = await readFile(path.join(root, file), 'utf8');
  const lang = file === 'index.html' ? 'en' : file.slice(0, 2);
  const langMatch = html.match(/<html\b[^>]*\blang=["']([^"']+)["'][^>]*>/i);
  const dirMatch = html.match(/<html\b[^>]*\bdir=["']([^"']+)["'][^>]*>/i);
  if (!langMatch || langMatch[1].toLowerCase() !== lang) {
    fail(`${file}: <html lang> must be "${lang}"`);
  }
  const expectedDir = lang === 'ar' || lang === 'he' ? 'rtl' : 'ltr';
  if (!dirMatch || dirMatch[1].toLowerCase() !== expectedDir) {
    fail(`${file}: <html dir> must be "${expectedDir}"`);
  }
  const canonical = canonicalBase + (file === 'index.html' ? '' : file);
  if (!html.includes(`href="${canonical}"`)) {
    fail(`${file}: missing canonical URL ${canonical}`);
  }
}

for (const file of pages.filter(file => file !== '404.html')) {
  if (!await isFile(file)) continue;
  const html = await readFile(path.join(root, file), 'utf8');
  const refs = [...html.matchAll(/\b(?:href|src)=["']([^"'#]+)["']/gi)].map(match => match[1]);
  for (const ref of refs) {
    if (/^(?:https?:|mailto:|tel:|data:|javascript:)/i.test(ref) || ref.startsWith('//')) continue;
    const clean = ref.split(/[?#]/)[0];
    if (!clean || clean === '.' || clean === './') continue;
    const target = path.resolve(root, path.dirname(file), decodeURIComponent(clean));
    if (!target.startsWith(root + path.sep) && target !== root) {
      fail(`${file}: local asset escapes repository: ${ref}`);
      continue;
    }
    if (!await isFile(path.relative(root, target))) {
      fail(`${file}: missing local asset ${ref}`);
    }
  }
}

if (await isFile('preserved-assets.sha256.json')) {
  const manifest = JSON.parse(await readFile(path.join(root, 'preserved-assets.sha256.json'), 'utf8'));
  for (const [file, expected] of Object.entries(manifest.files || {})) {
    const full = path.join(root, file);
    let actual;
    try {
      const bytes = await readFile(full);
      actual = createHash('sha256').update(bytes).digest('hex');
    } catch {
      fail(`Preserved asset missing: ${file}`);
      continue;
    }
    if (actual !== expected) fail(`Preserved asset checksum mismatch: ${file}`);
  }
}

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === '.git' || entry.name === 'node_modules') continue;
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) await walk(full);
    else if (entry.isFile()) {
      const relative = path.relative(root, full);
      const size = (await stat(full)).size;
      if (size > 100 * 1024 * 1024) {
        fail(`File exceeds GitHub 100 MiB ceiling: ${relative} (${size} bytes)`);
      }
    }
  }
}

await walk(root);

if (errors.length) {
  console.error(`Repository validation failed (${errors.length} issue${errors.length === 1 ? '' : 's'}):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log('Repository validation passed.');
