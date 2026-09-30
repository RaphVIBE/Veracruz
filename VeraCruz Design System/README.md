# VeraCruz Studio — Design System

> Black & white minimalism, drawn by hand, sharpened with a single drop of cherry red.

VeraCruz is a **creative / design studio**. The identity reads as visionary and architectural: a confident geometric wordmark, an abstract **eye** symbol (vision — *vera*, "true"), and a body of **hand-drawn futuristic concept sketches** (cities, vessels, structures) rendered as fine pencil/ink line-art. The brand lives almost entirely in **ink-on-paper black & white**, reserving a **cherry-red accent** for moments that need emphasis or emotion.

This repository is the canonical source of truth for VeraCruz's visual language: foundations (color, type, spacing, elevation, motion), brand assets (logos, symbol, imagery), and a high-fidelity UI kit recreating the studio's website.

---

## Sources

The system was built from the brand asset package provided by the client. No codebase or Figma file was supplied — the website UI kit is an original surface built *in the brand's voice*, not a recreation of an existing live product.

Original uploads (preserved in `/uploads`, working copies in `/assets`):
- `VeraCruz-Def_LOGOTYPE.png` — primary horizontal wordmark (black, transparent bg)
- `VeraCruz-Def_SYMBOLE-OG.png` — the eye/chalice symbol mark (black, transparent bg)
- `raphh1629_..._futuristic_city_sketch_...png` — hand-drawn futuristic city concept sketch

> ⚠️ **Font substitution — needs your confirmation.** The logotype uses a custom/rounded geometric sans. I matched it to **Outfit** (Google Fonts), the closest free geometric sans. If VeraCruz has a licensed brand typeface (e.g. a Futura/Avenir-class face or a bespoke wordmark font), please send the font files and I'll swap it in everywhere.

---

## Content fundamentals — how VeraCruz writes

The studio has no supplied copy yet, so this is the **recommended voice** derived from the visual identity (minimal, architectural, visionary). Treat it as the house style.

- **Tone:** calm, declarative, future-facing. Confident without hype. The work does the talking; copy stays out of its way.
- **Person:** "We" for the studio, "you" for the client/visitor. Warm but spare — never salesy.
- **Casing:** Sentence case for headlines and body. **UPPERCASE + letterspacing** reserved for the *mono* voice — eyebrows, section numbers, metadata, nav (e.g. `01 — STUDIO`, `WORK`, `EST. MMXX`).
- **Length:** short. Headlines are 2–6 words. Paragraphs are 1–3 sentences. Whitespace carries meaning.
- **Punctuation:** em-dashes and middots (`—`, `·`) as connective tissue. Index numbers (`01`, `02`) to structure. Avoid exclamation points.
- **Emoji:** none. Ever. The cherry dot (`●`) is the only "emoji-like" flourish.
- **Numerals / dates:** mono, sometimes Roman (`MMXX`) for a timeless, plate-engraved feel.

**Examples (house voice):**
- Eyebrow: `01 — WHAT WE DO`
- Headline: "We draw the future before it's built."
- Lead: "A studio for architecture, product, and the spaces between — working in ink, light, and intent."
- CTA: "Start a project" · "See the work"
- Metadata: `PROJECT 014 · SPECULATIVE · 2025`

---

## Visual foundations

**Overall feel.** Gallery-white editorial layout. Generous margins, a strict baseline, hairline rules. The page behaves like a printed monograph: type, rule, image, space. The hand-drawn sketches are the warmth; everything around them is precise and quiet.

**Color.**
- Duotone core: `--ink #0A0A0A` on `--paper #FFFFFF`. Inverted sections flip to ink ground with white type.
- A cool-leaning neutral grey scale (`--n-050 → --n-950`) handles dividers, captions, panels.
- **Cherry red `#D21F3C`** is the *only* hue and is rationed: a link, an underline, the index dot, a single highlighted word, a hover state, the focus ring. If a layout has more than ~2 cherry moments in view, it's overusing it.

**Type.** One family: Outfit, everywhere. Display is set **light (300)** and large, with tracking tightened (`-0.02 to -0.03em`). Labels, eyebrows and metadata are the *same* family, distinguished by weight (500) and size (~0.86rem), in sentence case with `letter-spacing: 0`. The typographic signature is the contrast of *airy geometric display* against *small plain labels*.

**Never** set labels, eyebrows or metadata in a monospace face, in uppercase, or with tracking above ~0.02em. Mono + UPPERCASE + `0.18em` is the house style of AI-generated landing pages, and it is the fastest way to make this brand look like one. Monospace is reserved for code, via the system stack.

**Spacing.** 4px base scale. Sections breathe — vertical rhythm in the 64–128px range on desktop. Density is low by intent.

**Backgrounds.** Mostly flat white or flat ink. **No gradients.** Imagery is the hand-drawn line-art sketches — used full-bleed in heroes, framed with a hairline in grids, or floated in whitespace. Sketches are monochrome graphite on white; keep them that way (optionally a faint paper warmth, never colorized — except a deliberate cherry one-off).

**Imagery treatment.** Cool/neutral graphite line-art on white. High detail, architectural. Crop confidently. Never apply heavy filters; the pencil texture *is* the texture.

**Borders & dividers.** Hairlines (`1px var(--line)`). Square-ish corners (radii 2–10px max; default to small). Architectural, not soft. Full-width rules separate sections.

**Cards.** Mostly border-defined, not shadow-defined — a hairline box on white. Elevation is restrained (`--shadow-sm/md/lg`, low spread, ~6–12% opacity). Lift on hover is subtle (translateY 2–4px + shadow step), never bouncy.

**Motion.** Quiet and precise. `--ease: cubic-bezier(0.22,1,0.36,1)` (gentle ease-out). Fades and short translations (8–16px). Durations 140–520ms. No bounce, no spring, no parallax theatrics. Line-draw / mask-reveal is on-brand for the symbol.

**Hover / press.**
- Links: cherry color or a cherry underline that grows in.
- Buttons (ink): hover lightens to `--n-800`; press darkens. Cherry buttons hover `--cherry-hover`, press `--cherry-press`.
- Cards: hairline darkens to `--line-strong` + subtle lift.
- Press: slight darken; optional `scale(0.99)`. No large shrink.

**Focus.** 2px cherry ring (`outline: 2px solid var(--cherry); outline-offset: 2px`).

**Transparency / blur.** Used rarely — a sticky header may use a white blur veil (`backdrop-filter: blur(10px)` over `rgba(255,255,255,0.8)`). No glassmorphism elsewhere.

**Layout rules.** Sticky minimal header. Content in a centered max-width column (~1200px) with wide gutters. Mono index numbers anchor sections to a left rail where space allows.

---

## Iconography

VeraCruz has **no supplied icon set**. The brand's own iconography is its **symbol mark** — the abstract eye, a single-weight continuous line with rounded caps. That stroke logic (uniform weight, rounded terminals, open geometric forms) is the model for any UI icons.

- **System icons:** use **Lucide** (CDN), chosen because its uniform stroke weight and rounded line caps echo the symbol's drawing logic. Set `stroke-width: 1.5`, `stroke-linecap: round`. This is a **substitution** — flag if VeraCruz owns a custom UI icon set.
- **Brand symbol:** the eye mark (`assets/veracruz-symbol*.png`) is used as favicon, loading mark, section ornament, and watermark — *not* as a generic UI icon.
- **No emoji. No unicode-as-icon** beyond the cherry dot `●`, the em-dash `—`, and the middot `·`.
- Prefer the brand's drawn sketches over decorative iconography wherever an image can do the job.

Assets in `/assets`:
- `veracruz-logotype.png` / `-white.png` — wordmark (ink / white for dark grounds)
- `veracruz-symbol.png` / `-white.png` / `-cherry.png` — eye symbol in three colorways
- `city-sketch.png` — hero-grade hand-drawn futuristic city

---

## Index — what's in this system

| Path | What it is |
|---|---|
| `README.md` | This file — brand context, voice, foundations, iconography |
| `colors_and_type.css` | CSS custom properties + semantic type/color classes |
| `SKILL.md` | Agent-Skill manifest for reuse in Claude Code |
| `assets/` | Logos, eye symbol (3 colorways), hero sketch |
| `preview/` | Design-system cards (rendered in the Design System tab) |
| `ui_kits/website/` | High-fidelity studio website UI kit (React/JSX + index.html) |

**UI kits**
- `ui_kits/website/` — the VeraCruz studio site: header/nav, hero, work grid, project detail, studio/about, contact, footer, plus buttons/fields/labels.
