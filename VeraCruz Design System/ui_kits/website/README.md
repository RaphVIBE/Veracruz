# UI Kit — VeraCruz Studio website

A high-fidelity, interactive recreation of the VeraCruz studio website, built in the brand's voice (black & white editorial, cherry accent, hand-drawn imagery, geometric + mono type).

> No live product or codebase was supplied — this surface is an original site built *from the brand system*, not a clone of an existing page. Copy, projects, and figures are placeholder written in the house voice.

## Run it
Open `index.html`. It loads `../../colors_and_type.css` (foundation) + `app.css` (kit layout), then the JSX components via Babel.

## Interactions
- **Nav** (Work / Studio / Contact) smooth-scrolls and marks the active item.
- **Work grid** — click any project card to open a full **project detail overlay** (← Back to work to close).
- **Contact** form shows a confirmation state on submit (no backend).

## Components
| File | Component | Notes |
|---|---|---|
| `Primitives.jsx` | `Eyebrow`, `Button`, `ArrowLink`, `PROJECTS` data | shared atoms + project dataset |
| `Header.jsx` | `Header` | sticky blur header, mono nav, ink CTA |
| `Hero.jsx` | `Hero` | display headline + framed hero sketch |
| `Work.jsx` | `Work`, `WorkCard` | 3-col hairline work grid (dark cards use the eye symbol) |
| `Studio.jsx` | `Studio` | about statement + mono stat block |
| `Contact.jsx` | `Contact`, `Footer` | inverted (ink) contact + footer |
| `ProjectOverlay.jsx` | `ProjectOverlay` | full-screen project detail |
| `App.jsx` | `App` | composition + scroll/overlay state |

## Brand notes baked in
- Cherry red appears only as: the headline period, one highlighted word, the active-nav underline, the cherry CTA, the focus underline, the index dot.
- All imagery is grayscaled graphite. The single supplied sketch is reused as a placeholder across projects with varied crops — swap in each project's own drawings.
- Buttons: ink (primary), cherry (emphasis), ghost (secondary). Hover lightens; press scales 0.99.
