#!/usr/bin/env node
/**
 * projects.mjs — writes the project list into the home page, EN and FR.
 *
 *   content/projects.json  ->  index.html     (between <!--projects:start--> and <!--projects:end-->)
 *                              fr/index.html
 *
 * Run with `npm run projects`, then commit both HTML files. It is not part of
 * the Netlify build: the home page stays a plain static file.
 *
 * The first run also adds the "Projects" link to the desktop and mobile menus.
 * Running it again only refreshes the block, so it is safe to repeat.
 */

import { readFile, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const START = '<!--projects:start-->';
const END = '<!--projects:end-->';

const T = {
  en: {
    file: 'index.html',
    nav: 'Projects',
    eyebrow: 'Projects',
    title: 'Recent projects.',
    lede: 'Client names stay private. Each entry describes the problem, what we did and what came of it.',
    filter: 'Filter projects by tag',
    all: 'All',
    context: 'The problem',
    work: 'What we did',
    outcome: 'What came of it',
    example: 'Example',
    count: (n, tag) => `${n} ${n === 1 ? 'project' : 'projects'}${tag ? ` tagged ${tag}` : ''}`,
  },
  fr: {
    file: 'fr/index.html',
    nav: 'Projets',
    eyebrow: 'Projets',
    title: 'Projets récents.',
    lede: 'Les noms des clients restent privés. Chaque fiche décrit le problème, ce que nous avons fait et ce qui en est sorti.',
    filter: 'Filtrer les projets par thème',
    all: 'Tous',
    context: 'Le problème',
    work: 'Ce que nous avons fait',
    outcome: 'Ce qui en est sorti',
    example: 'Exemple',
    count: (n, tag) => `${n} projet${n === 1 ? '' : 's'}${tag ? ` ${tag}` : ''}`,
  },
};

const esc = (s = '') =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const WRAP = 'width:100%;max-width:1240px;margin:0 auto;padding-left:clamp(16px,4vw,48px);padding-right:clamp(16px,4vw,48px);box-sizing:border-box';

const CSS = `<style>
.vc-pj-bar{display:flex;flex-wrap:wrap;gap:8px}
.vc-pj-bar[hidden]{display:none}
.vc-pj-f{font:inherit;font-size:15px;min-height:40px;padding:0 16px;border-radius:999px;border:1px solid #2A2A2A;background:transparent;color:#F4EFE6;cursor:pointer;transition:border-color .25s,background-color .25s}
.vc-pj-f:hover{border-color:#77736C}
.vc-pj-f[aria-pressed="true"]{background:#D21F3C;border-color:#D21F3C}
.vc-pj-n{margin:0;font-size:15px;color:rgba(244,239,230,0.74)}
.vc-pj details{border-top:1px solid #2A2A2A}
.vc-pj details[hidden]{display:none}
.vc-pj summary{cursor:pointer;list-style:none;display:grid;grid-template-columns:150px 1fr 28px;gap:12px 24px;align-items:center;padding:22px 0}
.vc-pj-meta{font-size:15px;color:rgba(244,239,230,0.74);display:flex;flex-direction:column;gap:2px}
.vc-pj-t{display:flex;flex-direction:column;gap:10px;min-width:0}
.vc-pj-t b{font-size:clamp(18px,1.7vw,21px);font-weight:500;color:#F4EFE6;line-height:1.3}
.vc-pj-tags{display:flex;flex-wrap:wrap;gap:6px;margin:0;padding:0;list-style:none}
.vc-pj-tags li{font-size:13px;line-height:1;padding:6px 10px;border-radius:999px;background:#1C1C1C;color:#F4EFE6}
.vc-pj-tags li.ex{background:transparent;border:1px solid #D21F3C;color:#F4EFE6}
.vc-pj summary>span[aria-hidden="true"]{width:28px;height:28px;border-radius:50%;border:1.5px solid rgba(244,239,230,0.74);display:flex;align-items:center;justify-content:center;font-size:18px;line-height:1;color:#F4EFE6}
.vc-pj-body{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,240px),1fr));gap:20px 32px;padding:0 0 28px 174px}
.vc-pj-body h3{margin:0 0 6px;font-size:15px;font-weight:500;color:rgba(244,239,230,0.74)}
.vc-pj-body p{margin:0;font-size:16px;line-height:1.55;color:#F4EFE6}
@media (max-width:760px){.vc-pj summary{grid-template-columns:1fr 28px}.vc-pj-meta{grid-column:1/-1;flex-direction:row;gap:10px}.vc-pj-meta i{display:inline-block;width:5px;height:5px;border-radius:50%;background:#D21F3C;align-self:center}.vc-pj-body{padding-left:0}}
@media (min-width:761px){.vc-pj-meta i{display:none}}
</style>`;

function block(lang, data) {
  const t = T[lang];
  const projects = data.projects.filter((p) => p.draft !== true).sort((a, b) => b.year - a.year);
  const used = Object.keys(data.tags).filter((k) => projects.some((p) => p.tags.includes(k)));

  for (const p of projects) {
    for (const k of p.tags) if (!data.tags[k]) throw new Error(`Projet ${p.id} : tag inconnu "${k}"`);
    for (const f of ['title', 'sector', 'context', 'work', 'outcome']) {
      if (!p[f] || !p[f][lang]) throw new Error(`Projet ${p.id} : champ ${f}.${lang} manquant`);
      for (const g of ['\u2014', '\u00b7']) if (p[f][lang].includes(g)) console.warn(`  ! ${p.id} ${f}.${lang} contient ${g}`);
    }
  }

  const tagLabel = (k) => esc(data.tags[k][lang]);

  const items = projects.map((p) => `<details data-tags="${p.tags.join(' ')}"><summary><span class="vc-pj-meta"><span>${p.year}</span><i></i><span>${esc(p.sector[lang])}</span></span><span class="vc-pj-t"><b>${esc(p.title[lang])}</b><ul class="vc-pj-tags">${p.example ? `<li class="ex">${t.example}</li>` : ''}${p.tags.map((k) => `<li>${tagLabel(k)}</li>`).join('')}</ul></span><span aria-hidden="true">+</span></summary><div class="vc-pj-body"><div><h3>${t.context}</h3><p>${esc(p.context[lang])}</p></div><div><h3>${t.work}</h3><p>${esc(p.work[lang])}</p></div><div><h3>${t.outcome}</h3><p>${esc(p.outcome[lang])}</p></div></div></details>`).join('\n');

  const buttons = [`<button type="button" class="vc-pj-f" data-tag="" aria-pressed="true">${t.all}</button>`]
    .concat(used.map((k) => `<button type="button" class="vc-pj-f" data-tag="${k}" data-label="${tagLabel(k)}" aria-pressed="false">${tagLabel(k)}</button>`))
    .join('');

  const script = `<script>
(function(){var s=document.getElementById('projects');if(!s)return;var bar=s.querySelector('.vc-pj-bar'),n=s.querySelector('.vc-pj-n'),items=[].slice.call(s.querySelectorAll('.vc-pj details'));bar.hidden=false;
var fr=document.documentElement.lang==='fr';function count(k,l){return fr?k+' projet'+(k>1?'s':'')+(l?' '+l:''):k+' project'+(k>1?'s':'')+(l?' tagged '+l:'');}
bar.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;var tag=b.getAttribute('data-tag'),shown=0;
[].forEach.call(bar.querySelectorAll('button'),function(x){x.setAttribute('aria-pressed',x===b?'true':'false');});
items.forEach(function(d){var ok=!tag||(' '+d.getAttribute('data-tags')+' ').indexOf(' '+tag+' ')>-1;d.hidden=!ok;if(!ok)d.open=false;else shown++;});
n.textContent=count(shown,tag?b.getAttribute('data-label'):'');});})();
</script>`;

  return `${START}<div style="${WRAP}"><div style="height:1px;background:#2A2A2A"></div></div>${CSS}<section id="projects" aria-labelledby="projects-h" style="${WRAP};padding-top:clamp(64px,9vw,120px);padding-bottom:clamp(64px,9vw,120px);display:flex;flex-direction:column;gap:32px">
<div style="display:flex;flex-direction:column;gap:20px;max-width:720px"><p style="margin:0;display:flex;align-items:center;gap:10px;font-size:15px;font-weight:500;color:rgba(244,239,230,0.74)"><span aria-hidden="true" style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#D21F3C;flex:none"></span>${t.eyebrow}</p><h2 id="projects-h" style="margin:0;font-family:'Krona One',sans-serif;font-weight:400;font-size:clamp(26px,3.2vw,44px);line-height:1.15;color:#F4EFE6">${t.title}</h2><p style="margin:0;font-size:18px;line-height:1.55;color:rgba(244,239,230,0.74)">${t.lede}</p></div>
<div style="display:flex;flex-direction:column;gap:14px"><div class="vc-pj-bar" role="group" aria-label="${t.filter}" hidden>${buttons}</div><p class="vc-pj-n" aria-live="polite">${t.count(projects.length, '')}</p></div>
<div class="vc-pj">
${items}
<div style="border-top:1px solid #2A2A2A"></div></div></section>${script}${END}`;
}

function addNav(html, lang) {
  if (html.includes('href="#projects"')) return html;
  const label = T[lang].nav;
  // Desktop: after the Practice link.
  html = html.replace(
    /(<nav aria-label="[^"]*" class="vc-links"[^>]*><a href="#practice"[^>]*>[^<]*<\/a>)/,
    `$1<a href="#projects" style="color:#F4EFE6;text-decoration:none;font-size:15px;padding:12px 2px">${label}</a>`
  );
  // Mobile: same place, then renumber the stagger index.
  html = html.replace(/(<div id="vc-mnav"[\s\S]*?<nav[^>]*>)([\s\S]*?)(<\/nav>)/, (m, a, links, c) => {
    links = links.replace(
      /(<a href="#practice" style="([^"]*)">[^<]*<\/a>)/,
      (x, link, style) => `${link}<a href="#projects" style="${style}">${label}</a>`
    );
    let i = 0;
    links = links.replace(/--i:\d+/g, () => `--i:${i++}`);
    return a + links + c;
  });
  return html;
}

async function main() {
  const data = JSON.parse(await readFile(join(ROOT, 'content', 'projects.json'), 'utf8'));
  for (const lang of Object.keys(T)) {
    const path = join(ROOT, T[lang].file);
    let html = await readFile(path, 'utf8');
    const out = block(lang, data);
    if (html.includes(START)) {
      html = html.slice(0, html.indexOf(START)) + out + html.slice(html.indexOf(END) + END.length);
    } else {
      // First run: right after the "Quiet by design" section, before About.
      const anchor = html.indexOf('</section>', html.indexOf('aria-labelledby="quiet"'));
      if (anchor < 0) throw new Error(`${T[lang].file} : section "quiet" introuvable`);
      const at = anchor + '</section>'.length;
      html = html.slice(0, at) + out + html.slice(at);
    }
    html = addNav(html, lang);
    await writeFile(path, html);
  }
  const live = data.projects.filter((p) => p.draft !== true);
  const ex = live.filter((p) => p.example).length;
  console.log(`Projects written: ${live.length} live${ex ? `, of which ${ex} EXAMPLE entries to replace before publishing` : ''}.`);
}

main().catch((err) => { console.error(err.message || err); process.exit(1); });
