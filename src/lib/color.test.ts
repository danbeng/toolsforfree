import { describe, expect, it } from 'vitest';
import { parseHex, parseHsl, parseRgb } from './color';

describe('parseHex', () => {
  it('parses #ff0000 to rgb {r:255,g:0,b:0}', () => {
    const r = parseHex('#ff0000');
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.rgb).toEqual({ r: 255, g: 0, b: 0 });
      expect(r.value.hex).toBe('#ff0000');
    }
  });

  it('accepts hex without a leading #', () => {
    const r = parseHex('00ff00');
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.hex).toBe('#00ff00');
      expect(r.value.rgb).toEqual({ r: 0, g: 255, b: 0 });
    }
  });

  it('rejects invalid hex as Invalid color', () => {
    expect(parseHex('zzzzzz')).toEqual({
      ok: false,
      error: 'Invalid color',
    });
  });

  it('returns empty error for empty input', () => {
    expect(parseHex('')).toEqual({ ok: false, error: '' });
    expect(parseHex('   ')).toEqual({ ok: false, error: '' });
  });
});

describe('parseRgb', () => {
  it("parses 0,0,0 to hex #000000", () => {
    const r = parseRgb('0', '0', '0');
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.hex).toBe('#000000');
      expect(r.value.rgb).toEqual({ r: 0, g: 0, b: 0 });
    }
  });

  it('returns empty error when all fields are empty', () => {
    expect(parseRgb('', '', '')).toEqual({ ok: false, error: '' });
    expect(parseRgb('  ', '  ', '  ')).toEqual({ ok: false, error: '' });
  });
});

describe('parseHsl', () => {
  it('converts h 0 s 100 l 50 to #ff0000', () => {
    const r = parseHsl('0', '100', '50');
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.hex).toBe('#ff0000');
      expect(r.value.rgb).toEqual({ r: 255, g: 0, b: 0 });
      expect(r.value.hsl).toEqual({ h: 0, s: 100, l: 50 });
    }
  });

  it('returns empty error when all fields are empty', () => {
    expect(parseHsl('', '', '')).toEqual({ ok: false, error: '' });
  });
});
