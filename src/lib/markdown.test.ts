// @vitest-environment jsdom
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { describe, expect, it } from 'vitest';
import { renderMarkdown } from './markdown';

const here = pathToFileURL(`${process.cwd()}/src/lib/`).href;

const GFM_SAMPLE = [
  '# Hello',
  '',
  '- item',
  '',
  '[link](https://example.com)',
  '',
  '```js',
  'const a = 1;',
  '```',
  '',
  '| a | b |',
  '| - | - |',
  '| 1 | 2 |',
  '',
  '~~nope~~',
  '',
  '- [ ] todo',
].join('\n');

describe('renderMarkdown', () => {
  it('returns empty error for empty string before parse', () => {
    expect(renderMarkdown('')).toEqual({ ok: false, error: '' });
  });

  it('renders a heading as ok html with h1 Hello', () => {
    const result = renderMarkdown('# Hello');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.html).toContain('<h1>');
      expect(result.html).toContain('Hello');
    }
  });

  it('keeps GFM heading list link fence table strike and task checkbox', () => {
    const result = renderMarkdown(GFM_SAMPLE);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.html).toContain('<h1>');
    expect(result.html).toContain('<ul>');
    expect(result.html).toContain('<li>');
    expect(result.html).toContain('<a');
    expect(result.html).toContain('<pre>');
    expect(result.html).toContain('language-js');
    expect(result.html).toContain('<table>');
    expect(result.html).toContain('<del>');
    expect(result.html).toMatch(/<input[^>]*disabled/);
    expect(result.html).toMatch(/type="checkbox"/);
  });

  it('strips script tags from xss payloads', () => {
    const result = renderMarkdown('<script>alert(1)</script>');
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.html.toLowerCase()).not.toContain('<script');
  });

  it('strips remote and data-uri images', () => {
    const httpsImg = renderMarkdown('![x](https://evil.example/x.png)');
    const dataImg = renderMarkdown('![x](data:image/png;base64,AAAA)');
    expect(httpsImg.ok).toBe(true);
    expect(dataImg.ok).toBe(true);
    if (httpsImg.ok) expect(httpsImg.html.toLowerCase()).not.toContain('<img');
    if (dataImg.ok) expect(dataImg.html.toLowerCase()).not.toContain('<img');
  });

  it('normalizes image-only source to empty html', () => {
    const result = renderMarkdown('![x](https://evil.example/x.png)');
    expect(result).toEqual({ ok: true, html: '' });
  });

  it('parses whitespace-only without throwing', () => {
    const result = renderMarkdown('   ');
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.html).toBe('');
  });

  it('source-reads too-large guard and FAQ local-only wording', () => {
    const island = readFileSync(
      new URL('../components/tools/MarkdownPreview.tsx', here),
      'utf8',
    );
    expect(island).toContain('isTooLarge(input)');
    expect(island).toContain('INPUT_TOO_LARGE_MSG');
    expect(island).toContain('localizeError');
    expect(island).toContain('renderMarkdown');
    expect(island).toContain('../../lib/markdown');
    expect(island).toContain('class=');
    expect(island).not.toContain('className');
    expect(island).toContain('spellcheck={false}');
    expect(island).toContain('tool-grid split');
    expect(island).toContain('md-preview');
    expect(island).toContain('dangerouslySetInnerHTML');
    expect(island).not.toMatch(/from ['"]marked['"]/);
    expect(island).not.toMatch(/from ['"]dompurify['"]/);
    const en = readFileSync(
      new URL('../content/tools/markdown-preview.md', here),
      'utf8',
    );
    const zh = readFileSync(
      new URL('../content/tools/zh/markdown-preview.md', here),
      'utf8',
    );
    expect(en.toLowerCase()).toMatch(/browser/);
    expect(en.toLowerCase()).toMatch(/nothing is uploaded/);
    expect(en.toLowerCase()).toMatch(/wysiwyg/);
    expect(en.toLowerCase()).toMatch(/remote images/);
    expect(en.toLowerCase()).toMatch(/data uris/);
    expect(zh).toContain('不会上传');
    expect(zh).toMatch(/远程图片/);
  });
});
