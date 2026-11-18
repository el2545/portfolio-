import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, stat, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import vm from 'node:vm';
import { parseHTML } from 'linkedom';

const root = new URL('./', import.meta.url);
const read = (name) => readFile(new URL(name, root), 'utf8');
const readBytes = (name) => readFile(new URL(name, root));
const pages = ['index.html', 'fr.html', 'ar.html', 'he.html'];
const locale = await read('locale.js');
const cvHashes = {
  en: '107d3013a2dae127fa34ff3136fee56be8a55e5ee7616a2396aa30c807f2a667',
  fr: '7b41af3d96c3537123d13c778716ea99e9973a1dbb942df99b06c64f33d3b967',
  ar: '985db93137e449a38ba043836c170fd5b50c3d6e6421e893e707d9a7cdedfd64',
  he: '0e1ff4f0166da3caeeeba8fc2f9a5fd58e0f8bde162d9d89f2b89cbed24527f2'
};

test('static EN/FR/AR/HE copy, navigation, metadata and progressive enhancement', async () => {
  for (const [index, file] of pages.entries()) {
    const { document } = parseHTML(await read(file));
    const language = ['en', 'fr', 'ar', 'he'][index];
    Object.defineProperty(document, 'baseURI', { value: new URL(file, root).href });
    assert.equal(document.documentElement.lang, language);
    assert.equal(document.documentElement.dir, ['ar', 'he'].includes(language) ? 'rtl' : 'ltr');
    const window = {};
    vm.runInNewContext(locale, { document, window, URL, Intl });
    for (const node of document.querySelectorAll('[data-academic]')) {
      assert.equal(node.textContent, window.PORTFOLIO_I18N.academic(node.dataset.academic), `${file}: ${node.dataset.academic}`);
    }
    assert.match(document.title, /Elghali Sany/);
    assert.equal(document.querySelector('h1').textContent, 'Elghali Sany');
    const ids = [...document.querySelectorAll('[id]')].map(n => n.id);
    assert.equal(ids.length, new Set(ids).size, `${file}: duplicate ID`);
    assert.deepEqual([...document.querySelectorAll('main > [id]')].map(n => n.id), ['profile','education','experience','research','methods','cv','contact']);
    assert.ok(document.querySelector('noscript'));
    assert.ok(document.querySelector('#loadMap'));
    assert.equal(document.querySelectorAll('script[src="locale.js"]').length, 1);
    assert.equal(document.querySelectorAll('script[src="i18n.js"]').length, 0);
    assert.ok(document.querySelector('#carbon-source tbody tr'));
    for (const node of document.querySelectorAll('a[href],script[src],link[href],img[src]')) {
      const value = node.getAttribute('href') || node.getAttribute('src');
      if (!value || /^(?:https?:|mailto:|tel:|data:)/.test(value)) continue;
      assert.ok(!value.startsWith('/'), `${file}: root-relative asset ${value}`);
      const target = new URL(value, new URL(file, root));
      if (target.pathname.endsWith('.html') && target.hash || value.startsWith('#')) {
        const targetDocument = target.pathname === new URL(file, root).pathname ? document : parseHTML(await readFile(new URL(target.pathname.startsWith('/') ? target.href.split('#')[0] : target), 'utf8')).document;
        assert.ok(targetDocument.getElementById(decodeURIComponent(target.hash.slice(1))), `${file}: missing anchor ${value}`);
      }
      if (!value.startsWith('#')) {
        target.hash = ''; target.search = '';
        assert.ok((await stat(target)).isFile() || (await stat(target)).isDirectory(), `${file}: missing ${value}`);
      }
    }
    const canonical = document.querySelector('link[rel="canonical"]').href;
    assert.equal(canonical, 'https://el2545.github.io/portfolio_UAE/' + (index ? file : ''));
    assert.equal(document.querySelector('meta[property="og:url"]').content, canonical);
    const person = JSON.parse(document.querySelector('script[type="application/ld+json"]').textContent).mainEntity;
    assert.equal(person.name, 'Elghali Sany');
    assert.ok(!/High honors|533%|40% across|leading researcher/.test(document.body.textContent));
  }
  const errorPage = parseHTML(await read('404.html')).document;
  assert.deepEqual([...errorPage.querySelectorAll('a[href]')].map(a => a.getAttribute('href')), [
    'https://el2545.github.io/portfolio_UAE/',
    'https://el2545.github.io/portfolio_UAE/fr.html',
    'https://el2545.github.io/portfolio_UAE/ar.html',
    'https://el2545.github.io/portfolio_UAE/he.html',
  ]);
});

test('preserved original PDFs, spreadsheets, source data and third-party libraries match the supplied archive', async () => {
  const manifest = JSON.parse(await read('preserved-assets.sha256.json'));
  assert.ok(Object.keys(manifest.files).length > 250);
  for (const [name, expected] of Object.entries(manifest.files)) {
    const actual = createHash('sha256').update(await readFile(new URL(name, root))).digest('hex');
    assert.equal(actual, expected, name);
  }
});

test('every academic CV is a separate, nonempty PDF with a fallback preview', async () => {
  for (const language of ['en','fr','ar','he']) {
    const { document } = parseHTML(await read(`academic-cv-${language}.html`));
    Object.defineProperty(document, 'baseURI', { value: new URL(`academic-cv-${language}.html`, root).href });
    assert.equal(document.documentElement.lang, language);
    assert.equal(document.documentElement.dir, ['ar', 'he'].includes(language) ? 'rtl' : 'ltr');
    assert.ok(!/2 pages|deux pages|صفحتان|שני עמודים/i.test(document.body.textContent));
    const buffer = await readBytes(`academic-cv-${language}.pdf`);
    assert.equal(buffer.subarray(0, 5).toString(), '%PDF-');
    assert.equal(createHash('sha256').update(buffer).digest('hex'), cvHashes[language]);
    assert.equal((buffer.toString('latin1').match(/\/Type\s*\/Page\b/g) || []).length, 1);
    assert.ok((await stat(new URL(`academic-cv-${language}.preview.png`, root))).size > 10000);
  }
});

test('portfolio CV controls point to the matching language and expose all four versions', async () => {
  for (const [index, file] of pages.entries()) {
    const { document } = parseHTML(await read(file));
    const language = ['en', 'fr', 'ar', 'he'][index];
    assert.equal(document.querySelector('.di-nav-cv').getAttribute('href'), `academic-cv-${language}.pdf`, file);
    assert.equal(document.querySelector('.di-button--ghost').getAttribute('href'), `academic-cv-${language}.pdf`, file);
    assert.deepEqual(
      [...document.querySelectorAll('.di-cv-item a[download]')].map(node => node.getAttribute('href')).sort(),
      ['academic-cv-ar.pdf', 'academic-cv-en.pdf', 'academic-cv-fr.pdf', 'academic-cv-he.pdf'],
      file
    );
  }
});


test('Hebrew runtime tables are complete and preserve interpolation fields', async () => {
  const { document } = parseHTML(await read('he.html'));
  Object.defineProperty(document, 'baseURI', { value: new URL('he.html', root).href });
  const window = {};
  const inspect = locale.replace('  window.PORTFOLIO_I18N = {', '  window.TABLES = { copy, zones, vehicleStates, messages, advertising, visitor, pdfReader, academic }; window.PORTFOLIO_I18N = {');
  vm.runInNewContext(inspect, { document, window, URL, Intl });
  for (const [name, table] of Object.entries(window.TABLES)) {
    for (const [key, value] of Object.entries(table.en)) {
      assert.ok(Object.hasOwn(table.he, key), `${name}.${key}: missing Hebrew`);
      if (typeof value === 'string') {
        const placeholders = s => [...s.matchAll(/\{[a-zA-Z]+\}/g)].map(m => m[0]).sort();
        assert.deepEqual(placeholders(table.he[key]), placeholders(value), `${name}.${key}: interpolation changed`);
      }
    }
  }
  assert.match(window.PORTFOLIO_I18N.pdf('ready'), /עמוד/);
  assert.match(window.PORTFOLIO_I18N.message('dataError'), /נתוני/);
  assert.equal(window.PORTFOLIO_I18N.ad('speedUnit'), 'קמ״ש');
  assert.equal(document.querySelectorAll('.di-language-switcher a').length, 4);
  const allowed = new Set(['Elghali','Sany','Elghali Sany','EN','FR','English','Français','Fuzzy-AHP / MEREC → AROMAN','XGBoost','QGIS','CPM','NPV','TCO','CAPEX / OPEX','DSO','CEI','Excel','Power Query','DSO & CEI','Excel & Power Query','sanyghali@gmail.com','LinkedIn']);
  const walk = node => {
    if (['SCRIPT','STYLE'].includes(node.nodeName)) return;
    if (node.nodeType === 3) {
      const text = node.textContent.replace(/\s+/g,' ').trim();
      if (/[A-Za-z]/.test(text) && !/[\u0590-\u05ff]/.test(text)) assert.ok(allowed.has(text), `Untranslated Hebrew UI: ${text}`);
    }
    for (const child of node.childNodes || []) walk(child);
  };
  walk(document.body);
});

test('validated M1 and transcript-based coursework are present without private attachments', async () => {
  const names = await readdir(root);
  assert.ok(!names.some(name => /transcript|bulletin|relev[eé]/i.test(name)), 'Private transcript copied to public site');
  for (const file of pages) {
    const { document } = parseHTML(await read(file));
    const note = document.querySelector('[data-academic="inseecNote"]').textContent;
    assert.match(note, /Master’s-level studies|Études de niveau master|دراسات على مستوى الماجستير|לימודים ברמת תואר שני/);
    assert.ok(document.querySelector('[data-academic="courseworkBody"]'));
    assert.equal(document.querySelectorAll('link[rel="alternate"][hreflang="he"]').length, 1);
    assert.equal(document.querySelectorAll('.di-cv-item').length, 4);
    assert.ok(!/Student National Number|National identity\/Passport|N° INE/.test(document.body.textContent));
  }
});
