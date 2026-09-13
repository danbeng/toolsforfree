import { describe, expect, it } from 'vitest';
import { diffText } from './diff';

describe('diffText', () => {
  it('returns empty error for both-empty before the engine', () => {
    expect(diffText('', '', { ignoreWhitespace: false })).toEqual({ ok: false, error: '' });
    expect(diffText('   ', '\n', { ignoreWhitespace: false })).toEqual({ ok: false, error: '' });
  });

  it('treats identical non-empty texts as identical', () => {
    const result = diffText('hello\n', 'hello\n', { ignoreWhitespace: false });
    expect(result).toEqual({
      ok: true,
      identical: true,
      added: 0,
      removed: 0,
      lines: [{ kind: 'eq', text: 'hello' }],
    });
  });

  it('emits one del and one add for a changed line', () => {
    const result = diffText('a\nb\n', 'a\nB\n', { ignoreWhitespace: false });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.identical).toBe(false);
    expect(result.lines).toContainEqual({ kind: 'del', text: 'b' });
    expect(result.lines).toContainEqual({ kind: 'add', text: 'B' });
  });
});
