import { createHash } from 'node:crypto';
import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const pages = ['index.html', 'fr.html', 'ar.html', 'he.html', '404.html'];
const requiredFiles = [...pages, 'styles.css', 'app.js', 'locale.js', 'i18n.js',
  'preserved-assets.sha256.json', 'README.md'];
const canonicalBase = 'https://el2545.github.io/portfolio_UAE/';

const filePath = (root, file) => path.join(root, file);

async function isFile(root, file) {
  try {
    return (await stat(filePath(root, file))).isFile();
  } catch {
    return false;
  }
}

function attributes(tag) {
  return Object.fromEntries([...tag.matchAll(/([:\w-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)]
    .map(([, name, doubleQuoted, singleQuoted]) => [name.toLowerCase(), doubleQuoted ?? singleQuoted]));
}

function canonicalHref(html) {
  const link = html.match(/<link\b[^>]*>/gi)?.find(tag => {
    const attrs = attributes(tag);
    return (attrs.rel || '').toLowerCase().split(/\s+/).includes('canonical');
  });
  return link ? attributes(link).href : undefined;
}

async function validateRepository(root) {
  const errors = [];
  const fail = message => errors.push(message);

  for (const file of requiredFiles) {
    if (!await isFile(root, file)) fail(`Missing required file: ${file}`);
  }

  for (const file of pages.filter(page => page !== '404.html')) {
    if (!await isFile(root, file)) continue;
    const html = await readFile(filePath(root, file), 'utf8');
    const lang = file === 'index.html' ? 'en' : file.slice(0, 2);
    const htmlTag = html.match(/<html\b[^>]*>/i)?.[0] || '';
    const htmlAttrs = attributes(htmlTag);
    if ((htmlAttrs.lang || '').toLowerCase() !== lang) {
      fail(`${file}: <html lang> must be "${lang}"`);
    }
    const expectedDir = lang === 'ar' || lang === 'he' ? 'rtl' : 'ltr';
    if ((htmlAttrs.dir || '').toLowerCase() !== expectedDir) {
      fail(`${file}: <html dir> must be "${expectedDir}"`);
    }
    const expectedCanonical = canonicalBase + (file === 'index.html' ? '' : file);
    if (canonicalHref(html) !== expectedCanonical) {
      fail(`${file}: canonical link must be ${expectedCanonical}`);
    }
  }

  for (const file of pages.filter(page => page !== '404.html')) {
    if (!await isFile(root, file)) continue;
    const html = await readFile(filePath(root, file), 'utf8');
    const refs = [...html.matchAll(/\b(?:href|src)\s*=\s*["']([^"'#]+)["']/gi)]
      .map(match => match[1]);
    for (const ref of refs) {
      if (/^(?:https?:|mailto:|tel:|data:|javascript:)/i.test(ref) || ref.startsWith('//')) continue;
      const clean = ref.split(/[?#]/)[0];
      if (!clean || clean === '.' || clean === './') continue;
      const target = path.resolve(root, path.dirname(file), decodeURIComponent(clean));
      if (!target.startsWith(root + path.sep) && target !== root) {
        fail(`${file}: local asset escapes repository: ${ref}`);
      } else if (!await isFile(root, path.relative(root, target))) {
        fail(`${file}: missing local asset ${ref}`);
      }
    }
  }

  if (await isFile(root, 'preserved-assets.sha256.json')) {
    const manifest = JSON.parse(await readFile(filePath(root, 'preserved-assets.sha256.json'), 'utf8'));
    for (const [file, expected] of Object.entries(manifest.files || {})) {
      try {
        const actual = createHash('sha256')
          .update(await readFile(filePath(root, file)))
          .digest('hex');
        if (actual !== expected) fail(`Preserved asset checksum mismatch: ${file}`);
      } catch {
        fail(`Preserved asset missing: ${file}`);
      }
    }
  }

  async function walk(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      if (entry.name === '.git' || entry.name === 'node_modules') continue;
      const full = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        await walk(full);
      } else if (entry.isFile() && (await stat(full)).size > 100 * 1024 * 1024) {
        fail(`File exceeds GitHub 100 MiB ceiling: ${path.relative(root, full)}`);
      }
    }
  }
  await walk(root);
  return errors;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const errors = await validateRepository(process.cwd());
  if (errors.length) {
    console.error(`Repository validation failed (${errors.length} issue${errors.length === 1 ? '' : 's'}):`);
    for (const error of errors) console.error(`- ${error}`);
    process.exit(1);
  }
  console.log('Repository validation passed.');
}

export { validateRepository };
