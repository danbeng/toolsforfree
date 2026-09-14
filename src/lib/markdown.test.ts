// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { renderMarkdown } from './markdown';

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
});
