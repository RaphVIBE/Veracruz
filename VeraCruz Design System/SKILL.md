---
name: veracruz-design
description: Use this skill to generate well-branded interfaces and assets for VeraCruz Studio, either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping.
user-invocable: true
---

Read the README.md file within this skill, and explore the other available files.
If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out and create static HTML files for the user to view. If working on production code, you can copy assets and read the rules here to become an expert in designing with this brand.
If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some questions, and act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need.

Quick reference:
- **Foundations:** `colors_and_type.css` — import it and use the CSS vars/classes.
- **Aesthetic:** black & white editorial minimalism; cherry red (`#D21F3C`) rationed for emphasis only.
- **Type:** Outfit only — display/body set light + tight; labels/eyebrows/metadata in the same family, weight 500, sentence case, no extra tracking. Never monospace + UPPERCASE + wide tracking for labels (reads as AI-generated); mono is for code only.
- **Imagery:** hand-drawn graphite futuristic sketches — never colorize.
- **Icons:** Lucide (stroke 1.5, round caps). The eye symbol is the brand mark, not a UI icon.
- **Assets:** `assets/` holds the logotype + eye symbol (ink/white/cherry) + hero sketch.
- **UI kit:** `ui_kits/website/` recreates the studio website.
