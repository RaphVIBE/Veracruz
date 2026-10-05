# veracruz.be

The VeraCruz studio site. A single-page static site.

## Stack

Plain HTML + CSS. Fonts loaded from Google Fonts, one Unsplash backdrop in the hero, otherwise self-hosted images.

The only build step is the journal: `content/journal/*.md` is compiled to `journal/**` by `build/build.mjs`. No dependencies, no `node_modules`, just Node 18+.

## Journal

Posts are Markdown files in `content/journal/`, named `YYYY-MM-DD-slug.md`:

```md
---
title: Have I lost my critical eye?
date: 2026-09-30
kind: essay          # essay | note
summary: One sentence. Used on the index, in the RSS feed, and as the page description.
draft: false         # optional, true keeps it out of the build
---

Body in Markdown.
```

The URL comes from the filename with the date stripped (`/journal/have-i-lost-my-critical-eye/`), or from an explicit `slug:` field. Files starting with `_` are never built: `_ideas.md` holds the running list of subjects being chewed on.

```sh
npm run build     # writes journal/**
npm run dev       # build, then serve the site at localhost:4000
npm test          # tests for the Markdown parser
npm run og        # share images for new posts (see below)
```

The build fails loudly on a missing title, date or summary, and on duplicate slugs. It also warns when an em dash or a middle dot turns up in a content file, because neither belongs in this site's copy (see the design system).

### Share images

Each post gets its own 1200x630 card at `assets/og/<slug>.png`: typographic, built from the same tokens as the site, no photography. A post without one falls back to the site-wide `og-image.png`.

`npm run og` renders the missing ones, `npm run og -- --force` redoes them all. Run it after publishing a post and commit the PNG. It needs Playwright and the web font, installed once:

```sh
npm install -D playwright @fontsource/outfit
npx playwright install chromium
```

**Do not add these to `package.json`.** Netlify runs `npm install` before the build whenever dependencies are declared, and pulling Chromium on every deploy would be slow and fragile. The share images are generated locally and committed, so the deploy stays dependency-free.

## Languages

The site is in English at the root and in French under `fr/`: `fr/index.html` mirrors `index.html`, `fr/faits/` mirrors `facts/`. The guides exist in French only, the journal in English only. Every footer carries the language switch, and each pair of pages declares its `hreflang` alternates (also in `sitemap.xml`). A change to one version of a page has to be carried over to the other by hand.

## Deploy

Deployed via [Netlify](https://www.netlify.com/), linked to this repo. Every push to `main` runs `node build/build.mjs` and is live within a few minutes. Config lives in `netlify.toml`; `journal/` is generated output and is gitignored.

To work on the static pages, open `index.html` in a browser. To see the journal, run `npm run dev`.

## Files

- `index.html` — the home page (English)
- `fr/` — the French home page and `fr/faits/`
- `content/journal/` — journal posts in Markdown (the source of truth)
- `build/` — the journal generator: `build.mjs`, a small Markdown parser, and the share-image renderer
- `assets/journal.css` — styles for the journal pages
- `assets/og/` — per-post share images (generated locally, committed)
- `journal/` — generated, gitignored
- `veracruz-symbol-tight.png`, `veracruz-logotype-tight.png` — brand mark and wordmark, cropped to the ink. **Use these.** The untrimmed `veracruz-symbol.png` and `veracruz-logotype.png` carry up to 69% transparent margin, which makes any CSS height misleading
- `portrait.jpg` — About section portrait
- `practice-*.jpg` — Practice section images (Product / Service / Physical)
- `favicon.*`, `apple-touch-icon.png`, `og-image.png` — meta assets

## Brand

`VeraCruz Design System/` contains the canonical design tokens (colors, type, radii, spacing) the live site is built on. Read its `README.md` before touching type: one family (Outfit) for everything, monospace for code only.

AI Réputation is a **separate product with its own site**, https://reputation.veracruz.be, published from the private repo `RaphVIBE/ai-reputation`. It left this repo on 2026-10-02; `/ai-reputation/*` redirects there (see `netlify.toml`). Nothing from the studio design system applies to it.
