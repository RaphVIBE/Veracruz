/**
 * Tests for the journal's Markdown subset. Run with `npm test`.
 * These exist so that editing markdown.mjs later doesn't silently break a post.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseFrontmatter, markdown, stripMarkdown } from './markdown.mjs';

test('frontmatter: parses keys, quotes, booleans, and colons in values', () => {
  const { data, body } = parseFrontmatter(
    `---\ntitle: "Design: a field guide"\ndate: 2026-01-02\ndraft: true\n---\nBody here.`
  );
  assert.equal(data.title, 'Design: a field guide');
  assert.equal(data.date, '2026-01-02');
  assert.equal(data.draft, true);
  assert.equal(body, 'Body here.');
});

test('frontmatter: a file without one still yields a body', () => {
  const { data, body } = parseFrontmatter('Just prose.');
  assert.deepEqual(data, {});
  assert.equal(body, 'Just prose.');
});

test('inline: bold, italic, and links', () => {
  const html = markdown('A **bold** and *italic* word, plus [a link](/journal/).');
  assert.match(html, /<strong>bold<\/strong>/);
  assert.match(html, /<em>italic<\/em>/);
  assert.match(html, /<a href="\/journal\/">a link<\/a>/);
});

test('inline: external links open in a new tab, internal ones do not', () => {
  assert.match(markdown('[out](https://example.com)'), /target="_blank" rel="noopener noreferrer"/);
  assert.doesNotMatch(markdown('[in](/about/)'), /target="_blank"/);
});

test('inline: code spans are never reformatted', () => {
  const html = markdown('Use `a * b` and `<script>` literally.');
  assert.match(html, /<code>a \* b<\/code>/);
  assert.match(html, /<code>&lt;script&gt;<\/code>/);
  assert.doesNotMatch(html, /<em>/);
});

test('security: raw HTML in prose is escaped', () => {
  assert.match(markdown('Careful: <script>alert(1)</script>'), /&lt;script&gt;/);
  assert.doesNotMatch(markdown('Careful: <script>alert(1)</script>'), /<script>/);
});

test('blocks: headings get ids, lists and quotes render', () => {
  const html = markdown('## Why publish at all\n\n- one\n- two\n\n> A claim worth pulling out.');
  assert.match(html, /<h2 id="why-publish-at-all">Why publish at all<\/h2>/);
  assert.match(html, /<ul><li>one<\/li><li>two<\/li><\/ul>/);
  assert.match(html, /<blockquote><p>A claim worth pulling out\.<\/p><\/blockquote>/);
});

test('blocks: ordered lists and fenced code', () => {
  assert.match(markdown('1. first\n2. second'), /<ol><li>first<\/li><li>second<\/li><\/ol>/);
  const code = markdown('```js\nconst a = 1 < 2;\n```');
  assert.match(code, /<pre data-lang="js"><code>const a = 1 &lt; 2;<\/code><\/pre>/);
});

test('blocks: a standalone image becomes a figure with a caption', () => {
  const html = markdown('![A prototype](/img/proto.jpg "Third iteration")');
  assert.match(html, /<figure><img src="\/img\/proto\.jpg" alt="A prototype" loading="lazy" \/>/);
  assert.match(html, /<figcaption>Third iteration<\/figcaption>/);
});

test('typography: quotes, apostrophes, ellipses — et surtout pas de cadratin', () => {
  const html = markdown('He said "no" --- it wasn\'t ready...');
  assert.match(html, /“no”/);
  assert.match(html, /wasn’t/);
  assert.match(html, /…/);
  // Le cadratin est proscrit dans la copie du site : rien, pas meme un `---`
  // dans le Markdown, ne doit en produire.
  assert.doesNotMatch(html, /—/);
});

test('paragraphs: a blank line separates, a single newline does not', () => {
  const html = markdown('Line one\nstill one.\n\nParagraph two.');
  assert.equal((html.match(/<p>/g) || []).length, 2);
  assert.match(html, /<p>Line one still one\.<\/p>/);
});

test('stripMarkdown: reading time counts words, not syntax', () => {
  const plain = stripMarkdown('## Title\n\n**Bold** [link](/x) and `code`.');
  assert.doesNotMatch(plain, /[#*`\[\]]/);
  assert.match(plain, /Bold link and code/);
});
