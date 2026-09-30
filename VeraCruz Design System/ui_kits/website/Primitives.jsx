// VeraCruz — shared primitives & data
const { useState } = React;

const A = '../../assets/';

const PROJECTS = [
  { id: 14, title: 'Vertical City', type: 'Speculative', year: '2025',
    img: A + 'city-sketch.png', pos: 'center',
    blurb: 'A speculative masterplan for a city that grows upward — drawn first in graphite, then resolved into structure.',
    facts: { Client: 'Internal', Discipline: 'Architecture · Urbanism', Scope: 'Concept → Masterplan', Status: 'Ongoing' },
    body: ['We began Vertical City the way we begin everything — with a line on paper. The question was simple: what does density look like when it stops apologising for itself?',
           'The drawings imagine vessels and spires sharing a single horizon, the ground line dissolving into cloud. Each elevation was hand-drawn, then re-drawn, until the silhouette read as inevitable.'] },
  { id: 13, title: 'Identity', type: 'Brand', year: '2024',
    img: A + 'veracruz-symbol.png', dark: true, pos: 'center',
    blurb: 'The studio mark, wordmark, and a black-and-white system sharpened with a single drop of cherry.',
    facts: { Client: 'VeraCruz', Discipline: 'Brand · System', Scope: 'Mark, wordmark, guidelines', Status: 'Shipped' },
    body: ['The eye is the whole idea: vision, truth, the act of looking before building. One continuous line, rounded at every terminal.',
           'Around it we built a quiet system — ink on paper, a geometric voice, a mono counter-voice, and red used like punctuation.'] },
  { id: 12, title: 'Cloudport', type: 'Speculative', year: '2024',
    img: A + 'city-sketch.png', pos: 'top',
    blurb: 'A transit terminal for vessels that never touch the ground.',
    facts: { Client: 'Confidential', Discipline: 'Architecture', Scope: 'Concept', Status: 'Archived' },
    body: ['Cloudport studies the threshold between arriving and landing — a structure that catches craft mid-air and lets people walk out onto open platforms above the valley.'] },
  { id: 11, title: 'The Long Span', type: 'Structure', year: '2023',
    img: A + 'city-sketch.png', pos: 'bottom',
    blurb: 'A bridge drawn as one unbroken gesture across the gorge.',
    facts: { Client: 'Public', Discipline: 'Structure', Scope: 'Competition', Status: 'Shortlisted' },
    body: ['One line, edge to edge. The Long Span treats infrastructure as drawing — the cable and the deck as a single confident stroke.'] },
  { id: 10, title: 'Quiet Tower', type: 'Architecture', year: '2023',
    img: A + 'city-sketch.png', pos: 'left',
    blurb: 'A residential spire that disappears into weather.',
    facts: { Client: 'Private', Discipline: 'Architecture', Scope: 'Schematic', Status: 'Shipped' },
    body: ['Quiet Tower is the calm at the centre of Vertical City — a slender residential mass detailed to vanish against the sky.'] },
  { id: 9, title: 'Field Notes', type: 'Print', year: '2022',
    img: A + 'veracruz-symbol.png', dark: true, pos: 'center',
    blurb: 'A monograph of the studio\u2019s drawings, set in ink.',
    facts: { Client: 'Self-published', Discipline: 'Editorial', Scope: 'Book design', Status: 'Shipped' },
    body: ['Field Notes collects three years of sketches into a single object — uncoated paper, hairline rules, and the drawings allowed to breathe.'] },
];

function Eyebrow({ children, dark }) {
  return <span className="eyebrow" style={dark ? { color: 'var(--fg2-on-dark)' } : null}>{children}</span>;
}

function Button({ variant = 'ink', children, onClick }) {
  return <button className={'btn btn-' + variant} onClick={onClick}>{children}</button>;
}

function ArrowLink({ children, onClick }) {
  return <span className="lnk" onClick={onClick}>{children} <span className="ar">→</span></span>;
}

Object.assign(window, { useState, A, PROJECTS, Eyebrow, Button, ArrowLink });
