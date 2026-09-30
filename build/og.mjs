#!/usr/bin/env node
/**
 * og.mjs — share images for the journal.
 *
 * Renders a 1200×630 PNG per post (typographic, no photography) into
 * assets/og/<slug>.png. The main build stays dependency-free; this script is
 * the one place that needs Playwright, and it only has to run when a new post
 * is published.
 *
 *   npm run og            # generate what is missing
 *   npm run og -- --force # redo everything
 *
 * First time only:
 *   npm install -D playwright @fontsource/outfit
 *   npx playwright install chromium
 *
 * Fonts are read from node_modules so the render works offline and matches the
 * site exactly — never rely on whatever the machine happens to have installed.
 */

import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = process.env.SITE_ROOT || dirname(HERE);
const CONTENT = join(ROOT, 'content', 'journal');
const OUT = join(ROOT, 'assets', 'og');

const KIND_LABEL = { note: 'Note', essay: 'Essay' };

/* ── helpers ─────────────────────────────────────────────────────────── */

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const smart = (s) =>
  String(s)
    .replace(/---/g, '—')
    .replace(/\.\.\./g, '…')
    .replace(/(^|[\s(\[])"/g, '$1“')
    .replace(/"/g, '”')
    .replace(/(^|[\s(\[])'/g, '$1‘')
    .replace(/'/g, '’');

const formatDate = (iso) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
  });

/** Look for a package in this repo's node_modules, then in the caller's. */
function resolveAsset(relative) {
  const roots = [ROOT, process.env.FONT_ROOT, process.cwd(), HERE].filter(Boolean);
  for (const r of roots) {
    const p = join(r, 'node_modules', relative);
    if (existsSync(p)) return p;
  }
  return null;
}

async function dataUri(path, mime) {
  if (!path || !existsSync(path)) return null;
  return `data:${mime};base64,${(await readFile(path)).toString('base64')}`;
}

/** Title size steps down as the title grows — keeps the card balanced. */
function titleSize(title) {
  const n = title.length;
  if (n <= 32) return 88;
  if (n <= 52) return 76;
  if (n <= 80) return 64;
  if (n <= 110) return 54;
  return 46;
}

/* ── the card ────────────────────────────────────────────────────────── */

async function cardHtml({ title, kind, date }) {
  // Une seule famille, comme sur le site : pas de monospace en capitales
  // chassees pour les libelles.
  const [outfit300, outfit400, outfit500] = await Promise.all([
    dataUri(resolveAsset('@fontsource/outfit/files/outfit-latin-300-normal.woff2'), 'font/woff2'),
    dataUri(resolveAsset('@fontsource/outfit/files/outfit-latin-400-normal.woff2'), 'font/woff2'),
    dataUri(resolveAsset('@fontsource/outfit/files/outfit-latin-500-normal.woff2'), 'font/woff2'),
  ]);

  const [symbol, logotype] = await Promise.all([
    dataUri(join(ROOT, 'veracruz-symbol-tight.png'), 'image/png'),
    dataUri(join(ROOT, 'veracruz-logotype-tight.png'), 'image/png'),
  ]);

  const face = (family, weight, uri) =>
    uri ? `@font-face{font-family:'${family}';font-weight:${weight};font-style:normal;src:url(${uri}) format('woff2');}` : '';

  return `<!doctype html>
<html><head><meta charset="utf-8" /><style>
${face('Outfit', 300, outfit300)}
${face('Outfit', 400, outfit400)}
${face('Outfit', 500, outfit500)}
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:1200px;height:630px}
body{
  background:#FFFFFF;
  font-family:'Outfit',system-ui,sans-serif;
  display:flex;flex-direction:column;justify-content:space-between;
  padding:78px 84px 72px;
  -webkit-font-smoothing:antialiased;
}
.top{display:flex;align-items:center;gap:18px}
.rule{width:34px;height:1px;background:#767676}
.eyebrow{
  font-weight:500;font-size:19px;
  letter-spacing:0;color:#767676;
}
.kind{
  font-weight:500;font-size:18px;
  letter-spacing:0;
  color:#A8182F;background:#FBEAEC;
  padding:6px 13px;border-radius:2px;
}
h1{
  font-weight:300;
  font-size:${titleSize(esc(smart(title)))}px;
  line-height:1.02;letter-spacing:-0.03em;
  color:#0A0A0A;max-width:19ch;text-wrap:balance;
}
.foot{
  display:flex;align-items:flex-end;justify-content:space-between;
  border-top:1px solid #E2E2E2;padding-top:26px;
}
.brand{display:flex;align-items:center;gap:19px}
.brand .sym{height:30px}
.brand .word{height:20px}
.date{
  font-size:19px;
  letter-spacing:0;color:#767676;
}
</style></head>
<body>
  <div class="top">
    <span class="rule"></span>
    <span class="eyebrow">Journal</span>
    <span class="kind">${KIND_LABEL[kind] || 'Note'}</span>
  </div>

  <h1>${esc(smart(title))}</h1>

  <div class="foot">
    <div class="brand">
      ${symbol ? `<img class="sym" src="${symbol}" alt="" />` : ''}
      ${logotype ? `<img class="word" src="${logotype}" alt="" />` : '<span style="font-size:26px">VeraCruz</span>'}
    </div>
    <span class="date">${formatDate(date)}</span>
  </div>
</body></html>`;
}

/* ── frontmatter (same rules as the build) ───────────────────────────── */

function frontmatter(src) {
  const text = src.replace(/^﻿/, '').replace(/\r\n/g, '\n');
  const m = /^---\n([\s\S]*?)\n---\n?/.exec(text);
  if (!m) return {};
  const data = {};
  for (const line of m[1].split('\n')) {
    const at = line.indexOf(':');
    if (at === -1) continue;
    let v = line.slice(at + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    if (v === 'true') v = true;
    if (v === 'false') v = false;
    data[line.slice(0, at).trim()] = v;
  }
  return data;
}

/* ── main ────────────────────────────────────────────────────────────── */

async function main() {
  const force = process.argv.includes('--force');

  let chromium;
  try {
    ({ chromium } = await import('playwright'));
  } catch {
    console.error('Playwright is missing. Run:\n  npm install -D playwright @fontsource/outfit\n  npx playwright install chromium');
    process.exit(1);
  }

  const files = (await readdir(CONTENT)).filter((f) => f.endsWith('.md') && !f.startsWith('_'));
  const jobs = [];

  for (const file of files) {
    const data = frontmatter(await readFile(join(CONTENT, file), 'utf8'));
    if (data.draft === true || !data.title || !data.date) continue;
    const slug = data.slug || basename(file, '.md').replace(/^\d{4}-\d{2}-\d{2}-/, '');
    const out = join(OUT, `${slug}.png`);
    if (!force && existsSync(out)) continue;
    jobs.push({ slug, out, title: data.title, date: data.date, kind: data.kind || 'note' });
  }

  if (!jobs.length) {
    console.log('Share images are up to date. Use --force to redo them.');
    return;
  }

  await mkdir(OUT, { recursive: true });
  const launch = process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {};
  const browser = await chromium.launch(launch);
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });

  for (const job of jobs) {
    await page.setContent(await cardHtml(job), { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: job.out });
    console.log(`  · assets/og/${job.slug}.png`);
  }

  await browser.close();
  console.log(`${jobs.length} share image${jobs.length > 1 ? 's' : ''} written.`);
}

main().catch((err) => { console.error(err); process.exit(1); });
