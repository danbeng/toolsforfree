import { describe, expect, it } from 'vitest';
import { formatJson } from './json';

describe('formatJson', () => {
  it('formats valid JSON', () => {
    const result = formatJson('{"a":1}');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(JSON.parse(result.formatted)).toEqual({ a: 1 });
      expect(result.formatted.includes('\n')).toBe(true);
    }
  });

  it('returns Invalid JSON for truncated input', () => {
    expect(formatJson('{')).toEqual({ ok: false, error: 'Invalid JSON' });
  });

  it('returns empty error for empty input', () => {
    expect(formatJson('')).toEqual({ ok: false, error: '' });
    expect(formatJson('   ')).toEqual({ ok: false, error: '' });
  });

  it('does not evaluate JavaScript', () => {
    expect(formatJson('{a:1}')).toEqual({ ok: false, error: 'Invalid JSON' });
  });
});
