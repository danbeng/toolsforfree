import { readFileSync } from 'node:fs';
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

  it('treats leading/trailing-only edits as identical when ignoreWhitespace is true', () => {
    const result = diffText('foo \n', 'foo\n', { ignoreWhitespace: true });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.identical).toBe(true);
    expect(result.added).toBe(0);
    expect(result.removed).toBe(0);
  });

  it('does not treat internal-space-only edits as identical when ignoreWhitespace is true', () => {
    const result = diffText('foo  bar\n', 'foo bar\n', { ignoreWhitespace: true });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.identical).toBe(false);
  });

  it('emits one row per consecutive added line', () => {
    const result = diffText('a\nb\nc\n', 'a\nX\nY\nc\n', { ignoreWhitespace: false });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const adds = result.lines.filter((line) => line.kind === 'add');
    expect(adds).toHaveLength(2);
    expect(adds[0]).toEqual({ kind: 'add', text: 'X' });
    expect(adds[1]).toEqual({ kind: 'add', text: 'Y' });
    expect(result.added).toBe(2);
  });

  it('treats one-empty original as all add and one-empty changed as all del', () => {
    const added = diffText('', 'x\ny\n', { ignoreWhitespace: false });
    expect(added.ok).toBe(true);
    if (added.ok) {
      expect(added.lines.every((line) => line.kind === 'add')).toBe(true);
      expect(added.added).toBe(2);
      expect(added.removed).toBe(0);
    }
    const removed = diffText('x\ny\n', '', { ignoreWhitespace: false });
    expect(removed.ok).toBe(true);
    if (removed.ok) {
      expect(removed.lines.every((line) => line.kind === 'del')).toBe(true);
      expect(removed.removed).toBe(2);
      expect(removed.added).toBe(0);
    }
  });

  it('source-reads per-pane isTooLarge and FAQ local-only wording', () => {
    const island = readFileSync(
      new URL('../components/tools/TextDiff.tsx', import.meta.url),
      'utf8',
    );
    expect(island).toContain('isTooLarge(original)');
    expect(island).toContain('isTooLarge(changed)');
    expect(island).not.toContain('INPUT_TOO_LARGE_MSG');
    const en = readFileSync(new URL('../content/tools/text-diff.md', import.meta.url), 'utf8');
    const zh = readFileSync(new URL('../content/tools/zh/text-diff.md', import.meta.url), 'utf8');
    expect(en.toLowerCase()).toMatch(/browser/);
    expect(en.toLowerCase()).toMatch(/nothing is uploaded/);
    expect(zh).toContain('不会上传');
  });
});
