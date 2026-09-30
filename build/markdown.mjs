/**
 * markdown.mjs — a deliberately small Markdown subset for the VeraCruz journal.
 *
 * No dependencies, on purpose: the site has no node_modules and the Netlify
 * build is a single `node build/build.mjs`. If the journal ever needs tables,
 * footnotes or syntax highlighting, swap this file for `marked` — the rest of
 * the build calls only `parseFrontmatter()` and `markdown()`.
 *
 * Supported: headings (##, ###, ####), paragraphs, **bold**, *italic*,
 * `code`, [links](url), images, unordered + ordered lists, > blockquotes,
 * ``` fenced code, --- rules, and typographic quotes/dashes.
 */

const escapeHtml = (s) =>
  s.replace(/&/g, '&amp;')
   .replace(/</g, '&lt;')
   .replace(/>/g, '&gt;')
   .replace(/"/g, '&quot;');

/** Split `---\nkey: value\n---\nbody` into { data, body }. */
export function parseFrontmatter(src) {
  const text = src.replace(/^﻿/, '').replace(/\r\n/g, '\n');
  const match = /^---\n([\s\S]*?)\n---\n?/.exec(text);
  if (!match) return { data: {}, body: text.trim() };

  const data = {};
  for (const line of match[1].split('\n')) {
    if (!line.trim() || line.trim().startsWith('#')) continue;
    const at = line.indexOf(':');
    if (at === -1) continue;
    const key = line.slice(0, at).trim();
    let value = line.slice(at + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (value === 'true') value = true;
    else if (value === 'false') value = false;
    data[key] = value;
  }
  return { data, body: text.slice(match[0].length).trim() };
}

/** Typographic polish: curly quotes, em dashes, ellipses. Skips code spans. */
export function typography(s) {
  // Pas de conversion ---  ->  cadratin : le cadratin est proscrit dans la copie
  // du site, rien ne doit en introduire dans le dos de l'auteur.
  return s
    .replace(/\.\.\./g, '…')
    .replace(/(^|[\s(\[])"/g, '$1“')
    .replace(/"/g, '”')
    .replace(/(^|[\s(\[])'/g, '$1‘')
    .replace(/'/g, '’');
}

/**
 * Inline formatting.
 *
 * Order matters: code spans and link targets are pulled out first so that
 * neither typographic substitution nor emphasis can touch a URL or the inside
 * of a code span. Everything else is escaped, then typeset, then emphasised.
 */
function inline(raw) {
  const codeSpans = [];
  const links = [];

  let s = raw.replace(/`([^`]+)`/g, (_, code) => {
    codeSpans.push(code);
    return `\u0000CODE${codeSpans.length - 1}\u0000`;
  });

  s = s.replace(
    /(!?)\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/g,
    (_, bang, text, href, title) => {
      links.push({ image: bang === '!', text, href, title });
      return `\u0000LINK${links.length - 1}\u0000`;
    }
  );

  const format = (str) => {
    let t = escapeHtml(typography(str));
    t = t.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    t = t.replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>');
    return t;
  };

  s = format(s);

  s = s.replace(/\u0000LINK(\d+)\u0000/g, (_, i) => {
    const { image, text, href, title } = links[+i];
    const url = href.replace(/"/g, '%22');
    if (image) {
      const alt = escapeHtml(text);
      return `<img src="${url}" alt="${alt}"${title ? ` title="${escapeHtml(title)}"` : ''} loading="lazy" />`;
    }
    const external = /^https?:\/\//.test(href);
    const attrs = external ? ' target="_blank" rel="noopener noreferrer"' : '';
    return `<a href="${url}"${attrs}>${format(text)}</a>`;
  });

  return s.replace(/\u0000CODE(\d+)\u0000/g, (_, i) => `<code>${escapeHtml(codeSpans[+i])}</code>`);
}

/** Turn a Markdown body into HTML. */
export function markdown(src) {
  const lines = src.replace(/\r\n/g, '\n').split('\n');
  const out = [];
  let i = 0;

  const slugify = (s) =>
    s.toLowerCase().replace(/<[^>]+>/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) { i++; continue; }

    // Fenced code
    if (/^```/.test(line)) {
      const lang = line.slice(3).trim();
      const buf = [];
      i++;
      while (i < lines.length && !/^```/.test(lines[i])) buf.push(lines[i++]);
      i++; // closing fence
      out.push(
        `<pre${lang ? ` data-lang="${escapeHtml(lang)}"` : ''}><code>${escapeHtml(buf.join('\n'))}</code></pre>`
      );
      continue;
    }

    // Horizontal rule
    if (/^(---|\*\*\*|___)\s*$/.test(line)) { out.push('<hr />'); i++; continue; }

    // Headings — anchored so they can be linked to directly
    const heading = /^(#{2,4})\s+(.*)$/.exec(line);
    if (heading) {
      const level = heading[1].length;
      const html = inline(heading[2].trim());
      out.push(`<h${level} id="${slugify(heading[2])}">${html}</h${level}>`);
      i++;
      continue;
    }

    // Blockquote
    if (/^>\s?/.test(line)) {
      const buf = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) buf.push(lines[i++].replace(/^>\s?/, ''));
      out.push(`<blockquote><p>${inline(buf.join(' ').trim())}</p></blockquote>`);
      continue;
    }

    // Lists
    const isUl = (l) => /^[-*]\s+/.test(l);
    const isOl = (l) => /^\d+\.\s+/.test(l);
    if (isUl(line) || isOl(line)) {
      const ordered = isOl(line);
      const test = ordered ? isOl : isUl;
      const items = [];
      while (i < lines.length && test(lines[i])) {
        items.push(lines[i++].replace(ordered ? /^\d+\.\s+/ : /^[-*]\s+/, ''));
      }
      const tag = ordered ? 'ol' : 'ul';
      out.push(`<${tag}>${items.map((t) => `<li>${inline(t.trim())}</li>`).join('')}</${tag}>`);
      continue;
    }

    // Standalone image becomes a figure
    const figure = /^!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)\s*$/.exec(line);
    if (figure) {
      const [, alt, src, caption] = figure;
      out.push(
        `<figure><img src="${src}" alt="${escapeHtml(alt)}" loading="lazy" />` +
        (caption ? `<figcaption>${inline(caption)}</figcaption>` : '') +
        `</figure>`
      );
      i++;
      continue;
    }

    // Paragraph — runs until a blank line or a block-level marker
    const buf = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !/^(#{2,4}\s|>|```|---\s*$)/.test(lines[i]) &&
      !isUl(lines[i]) &&
      !isOl(lines[i])
    ) {
      buf.push(lines[i++]);
    }
    out.push(`<p>${inline(buf.join(' ').trim())}</p>`);
  }

  return out.join('\n');
}

/** Plain text, for summaries and RSS descriptions. */
export function stripMarkdown(src) {
  return src
    .replace(/```[\s\S]*?```/g, '')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[#>*`_]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}
