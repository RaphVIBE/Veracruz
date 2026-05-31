# veracruz.be

The VeraCruz studio site. A single-page static site.

## Stack

Plain HTML + CSS, no build step. Fonts loaded from Google Fonts, one Unsplash backdrop in the hero, otherwise self-hosted images.

## Deploy

Deployed via [Netlify](https://www.netlify.com/), linked to this repo. Every push to `main` triggers a rebuild and is live within a minute.

To work locally, just open `index.html` in a browser — no server needed.

## Files

- `index.html` — the entire site
- `veracruz-symbol.png`, `veracruz-logotype.png` — brand mark + wordmark
- `portrait.jpg` — About section portrait
- `practice-*.jpg` — Practice section images (Product / Service / Physical)
- `favicon.*`, `apple-touch-icon.png`, `og-image.png` — meta assets

## Brand

`VeraCruz Design System/` contains the canonical design tokens (colors, type, radii, spacing) the live site is built on.
