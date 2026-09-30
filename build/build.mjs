#!/usr/bin/env node
/**
 * build.mjs — generates the VeraCruz journal from Markdown.
 *
 *   content/journal/*.md  ->  journal/index.html
 *                             journal/<slug>/index.html
 *                             journal/feed.xml
 *
 * Run with `npm run build` (or `node build/build.mjs`). No dependencies.
 * Files starting with `_` are skipped, as is any post with `draft: true`.
 */

import { readdir, readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseFrontmatter, markdown, stripMarkdown, typography } from './markdown.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CONTENT = join(ROOT, 'content', 'journal');
const OUT = join(ROOT, 'journal');

const SITE = {
  url: 'https://veracruz.be',
  name: 'VeraCruz',
  title: 'Journal, VeraCruz',
  tagline: 'Notes and essays on design, AI and the tools reshaping both.',
  author: 'Raphael Hombroeck',
};

const KINDS = {
  note:  { label: 'Note',  plural: 'Notes'  },
  essay: { label: 'Essay', plural: 'Essays' },
};

// Titles and summaries get the same typographic treatment as body copy
// (curly quotes, ellipses) before being escaped. Straight quotes are gone by
// then, so the result is still safe inside an attribute.
const esc = (s = '') =>
  typography(String(s))
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const formatDate = (iso) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
  });

const readingTime = (text) => Math.max(1, Math.round(stripMarkdown(text).split(/\s+/).length / 230));

/* ────────────────────────── Shared chrome ────────────────────────── */

// A post uses its own share card when `npm run og` has produced one;
// otherwise it falls back to the site-wide image.
const shareImage = (slug) =>
  slug && existsSync(join(ROOT, 'assets', 'og', `${slug}.png`))
    ? `${SITE.url}/assets/og/${slug}.png`
    : `${SITE.url}/og-image.png`;

const head = ({ title, description, canonical, image = `${SITE.url}/og-image.png`, extraMeta = '' }) => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}" />
<meta name="theme-color" content="#FFFFFF" />
<link rel="canonical" href="${canonical}" />

<link rel="icon" href="/favicon.ico" sizes="any" />
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png" />
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16.png" />
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
<link rel="alternate" type="application/rss+xml" title="VeraCruz Journal" href="/journal/feed.xml" />

<meta property="og:site_name" content="VeraCruz" />
<meta property="og:url" content="${canonical}" />
<meta property="og:title" content="${esc(title)}" />
<meta property="og:description" content="${esc(description)}" />
<meta property="og:image" content="${image}" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${esc(title)}" />
<meta name="twitter:description" content="${esc(description)}" />
<meta name="twitter:image" content="${image}" />
${extraMeta}
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@200;300;400;500;600;700&display=swap" rel="stylesheet" />
<link rel="stylesheet" href="/assets/journal.css" />
</head>
<body>

<header class="site">
  <div class="wrap header-row">
    <a href="/" class="wordmark" aria-label="VeraCruz, home">
      <img class="mark-img" src="/veracruz-symbol-tight.png" alt="" />
      <img class="logotype-img" src="/veracruz-logotype-tight.png" alt="VeraCruz" />
    </a>
    <nav class="primary" aria-label="Primary">
      <ul>
        <li><a href="/#practice">Practice</a></li>
        <li><a href="/#approach">Approach</a></li>
        <li><a href="/#about">About</a></li>
        <li><a href="/facts/">Facts</a></li>
        <li class="nav-journal"><a href="/journal/" class="is-active">Journal</a></li>
        <li><a href="/#contact">Contact</a></li>
      </ul>
    </nav>
  </div>
</header>
`;

const foot = `
<footer class="site">
  <div class="wrap footer-row">
    <span>&copy; ${new Date().getFullYear()} VeraCruz <span class="dot"></span> Brussels</span>
    <span><a href="/journal/feed.xml">RSS</a> <span class="dot"></span> <a href="mailto:info@veracruz.be">info@veracruz.be</a></span>
  </div>
</footer>

<script>
  const head = document.querySelector('header.site');
  const onScroll = () => head.classList.toggle('scrolled', window.scrollY > 4);
  onScroll(); window.addEventListener('scroll', onScroll, { passive: true });

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
</script>
</body>
</html>
`;

/* ────────────────────────── Templates ────────────────────────── */

function indexPage(posts) {
  const rows = posts.map((p, i) => `
        <li class="entry reveal" style="transition-delay:${Math.min(i * 60, 240)}ms">
          <a class="entry-link" href="${p.url}">
            <div class="entry-meta">
              <time datetime="${p.date}">${formatDate(p.date)}</time>
              <span class="kind kind-${p.kind}">${KINDS[p.kind].label}</span>
            </div>
            <div class="entry-body">
              <h2>${esc(p.title)}</h2>
              <p>${esc(p.summary)}</p>
              <span class="entry-more">Read <span aria-hidden="true">&rarr;</span> <span class="entry-time">${p.minutes} min</span></span>
            </div>
          </a>
        </li>`).join('');

  const empty = `
        <li class="entry entry-empty">
          <p>The first pieces are being written. <a href="/journal/feed.xml">Subscribe by RSS</a> to catch them.</p>
        </li>`;

  return head({
    title: SITE.title,
    description: SITE.tagline,
    canonical: `${SITE.url}/journal/`,
  }) + `
<main id="top">
  <section class="journal-hero">
    <div class="wrap">
      <div class="eyebrow reveal">Journal</div>
      <h1 class="reveal">${esc(SITE.tagline)}</h1>
      <p class="lede reveal">Short notes when something is worth flagging, longer essays when a subject has had time to settle. Written in the open, from the studio.</p>
    </div>
  </section>

  <section class="journal-list">
    <div class="wrap">
      <ul class="entries">${posts.length ? rows : empty}
      </ul>
    </div>
  </section>
</main>
` + foot;
}

function postPage(post, { prev, next }) {
  const nav = (prev || next) ? `
    <nav class="post-nav" aria-label="More from the journal">
      ${prev ? `<a class="post-nav-item" href="${prev.url}"><span class="post-nav-label">Previous</span><span class="post-nav-title">${esc(prev.title)}</span></a>` : '<span></span>'}
      ${next ? `<a class="post-nav-item post-nav-next" href="${next.url}"><span class="post-nav-label">Next</span><span class="post-nav-title">${esc(next.title)}</span></a>` : '<span></span>'}
    </nav>` : '';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.summary,
    datePublished: post.date,
    author: { '@type': 'Person', name: SITE.author },
    publisher: { '@type': 'Organization', name: SITE.name },
    mainEntityOfPage: `${SITE.url}${post.url}`,
  };

  return head({
    title: `${post.title}, VeraCruz Journal`,
    description: post.summary,
    canonical: `${SITE.url}${post.url}`,
    image: shareImage(post.slug),
    extraMeta: `<meta property="og:type" content="article" />
<meta property="article:published_time" content="${post.date}" />
<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`,
  }) + `
<main id="top">
  <article class="post">
    <header class="post-head">
      <div class="wrap">
        <div class="post-meta reveal">
          <a href="/journal/">Journal</a>
          <span class="sep" aria-hidden="true">/</span>
          <span class="kind kind-${post.kind}">${KINDS[post.kind].label}</span>
          <span class="sep" aria-hidden="true">/</span>
          <time datetime="${post.date}">${formatDate(post.date)}</time>
          <span class="sep" aria-hidden="true">/</span>
          <span>${post.minutes} min</span>
        </div>
        <h1 class="reveal">${esc(post.title)}</h1>
        <p class="lede reveal">${esc(post.summary)}</p>
      </div>
    </header>

    <div class="post-body wrap">
${post.html}
    </div>

    <footer class="post-foot">
      <div class="wrap">
        <p class="post-sign">${esc(SITE.author)} <span class="dot"></span> VeraCruz, Brussels</p>
        <p class="post-cta">Working on something that crosses disciplines? <a href="/#contact">Get in touch.</a></p>
${nav}
      </div>
    </footer>
  </article>
</main>
` + foot;
}

function feed(posts) {
  const items = posts.slice(0, 20).map((p) => `
    <item>
      <title>${esc(p.title)}</title>
      <link>${SITE.url}${p.url}</link>
      <guid isPermaLink="true">${SITE.url}${p.url}</guid>
      <pubDate>${new Date(`${p.date}T12:00:00Z`).toUTCString()}</pubDate>
      <category>${KINDS[p.kind].label}</category>
      <description>${esc(p.summary)}</description>
    </item>`).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>VeraCruz Journal</title>
    <link>${SITE.url}/journal/</link>
    <atom:link href="${SITE.url}/journal/feed.xml" rel="self" type="application/rss+xml" />
    <description>${esc(SITE.tagline)}</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>${items}
  </channel>
</rss>
`;
}

/* ────────────────────────── Build ────────────────────────── */

async function main() {
  if (!existsSync(CONTENT)) {
    console.error(`No content directory at ${CONTENT}`);
    process.exit(1);
  }

  const files = (await readdir(CONTENT)).filter((f) => f.endsWith('.md') && !f.startsWith('_'));
  const posts = [];

  for (const file of files) {
    const raw = await readFile(join(CONTENT, file), 'utf8');
    const { data, body } = parseFrontmatter(raw);

    if (data.draft === true) continue;

    const problems = [];
    if (!data.title) problems.push('title');
    if (!data.date) problems.push('date');
    if (!data.summary) problems.push('summary');
    if (problems.length) {
      console.error(`  ✗ ${file} — missing frontmatter: ${problems.join(', ')}`);
      process.exitCode = 1;
      continue;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(data.date))) {
      console.error(`  ✗ ${file} — date must be YYYY-MM-DD, got "${data.date}"`);
      process.exitCode = 1;
      continue;
    }

    // Garde-fou maison : le cadratin et le point median sont proscrits dans la
    // copie du site. On avertit sans faire echouer le build.
    for (const [glyph, name] of [['\u2014', 'cadratin (—)'], ['\u00b7', 'point median (·)']]) {
      if (raw.includes(glyph)) console.warn(`  ! ${file} — contient un ${name}`);
    }

    const kind = KINDS[data.kind] ? data.kind : 'note';
    const slug = data.slug || basename(file, '.md').replace(/^\d{4}-\d{2}-\d{2}-/, '');

    posts.push({
      slug,
      url: `/journal/${slug}/`,
      title: String(data.title),
      summary: String(data.summary),
      date: String(data.date),
      kind,
      minutes: readingTime(body),
      html: markdown(body),
      file,
    });
  }

  posts.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

  const dupes = posts.map((p) => p.slug).filter((s, i, a) => a.indexOf(s) !== i);
  if (dupes.length) {
    console.error(`  ✗ duplicate slugs: ${[...new Set(dupes)].join(', ')}`);
    process.exit(1);
  }

  // Clean generated output only — never touches files outside journal/.
  // Some sandboxed filesystems refuse deletes; in that case we overwrite in
  // place and only warn, so a local build never hard-fails on permissions.
  await mkdir(OUT, { recursive: true });
  const keep = new Set([...posts.map((p) => p.slug), 'index.html', 'feed.xml']);
  for (const entry of await readdir(OUT, { withFileTypes: true })) {
    if (keep.has(entry.name)) continue;
    try {
      await rm(join(OUT, entry.name), { recursive: true, force: true });
    } catch (err) {
      console.warn(`  ! could not remove stale ${entry.name}: ${err.code || err.message}`);
    }
  }

  await writeFile(join(OUT, 'index.html'), indexPage(posts));
  await writeFile(join(OUT, 'feed.xml'), feed(posts));

  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];
    const dir = join(OUT, post.slug);
    await mkdir(dir, { recursive: true });
    await writeFile(
      join(dir, 'index.html'),
      postPage(post, { prev: posts[i + 1] || null, next: posts[i - 1] || null })
    );
  }

  console.log(`Journal built — ${posts.length} ${posts.length === 1 ? 'entry' : 'entries'}:`);
  for (const p of posts) console.log(`  · ${p.date}  ${KINDS[p.kind].label.padEnd(5)}  ${p.url}`);
}

main().catch((err) => { console.error(err); process.exit(1); });
