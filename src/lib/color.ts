export type Rgb = { r: number; g: number; b: number };
export type Hsl = { h: number; s: number; l: number };
export type ColorValue = { hex: string; rgb: Rgb; hsl: Hsl };
export type ColorResult =
  | { ok: true; value: ColorValue }
  | { ok: false; error: string };

const INVALID: ColorResult = { ok: false, error: 'Invalid color' };
const IDLE: ColorResult = { ok: false, error: '' };

function isBlank(s: string): boolean {
  return s.trim() === '';
}

function rgbToHex(rgb: Rgb): string {
  const toHex = (n: number) => n.toString(16).padStart(2, '0');
  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
}

function rgbToHsl(rgb: Rgb): Hsl {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
  }
  return {
    h: Math.round(h),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

function fromRgb(rgb: Rgb): ColorResult {
  return {
    ok: true,
    value: { hex: rgbToHex(rgb), rgb, hsl: rgbToHsl(rgb) },
  };
}

function hslToRgb(h: number, s: number, l: number): Rgb {
  const sat = s / 100;
  const light = l / 100;
  const c = (1 - Math.abs(2 * light - 1)) * sat;
  const hp = ((h % 360) + 360) % 360 / 60;
  const x = c * (1 - Math.abs((hp % 2) - 1));
  let r1 = 0;
  let g1 = 0;
  let b1 = 0;
  if (hp >= 0 && hp < 1) {
    r1 = c;
    g1 = x;
  } else if (hp < 2) {
    r1 = x;
    g1 = c;
  } else if (hp < 3) {
    g1 = c;
    b1 = x;
  } else if (hp < 4) {
    g1 = x;
    b1 = c;
  } else if (hp < 5) {
    r1 = x;
    b1 = c;
  } else {
    r1 = c;
    b1 = x;
  }
  const m = light - c / 2;
  return {
    r: Math.round((r1 + m) * 255),
    g: Math.round((g1 + m) * 255),
    b: Math.round((b1 + m) * 255),
  };
}

function parseChannel(input: string, min: number, max: number): number | null {
  const t = input.trim();
  if (t === '' || !/^-?\d+(\.\d+)?$/.test(t)) return null;
  const n = Number(t);
  if (!Number.isFinite(n) || n < min || n > max) return null;
  return n;
}

export function parseHex(input: string): ColorResult {
  if (isBlank(input)) return IDLE;
  const t = input.trim();
  const hex = t.startsWith('#') ? t.slice(1) : t;
  if (!/^[0-9a-fA-F]{6}$/.test(hex)) return INVALID;
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  return fromRgb({ r, g, b });
}

export function parseRgb(r: string, g: string, b: string): ColorResult {
  if (isBlank(r) && isBlank(g) && isBlank(b)) return IDLE;
  const rv = parseChannel(r, 0, 255);
  const gv = parseChannel(g, 0, 255);
  const bv = parseChannel(b, 0, 255);
  if (rv === null || gv === null || bv === null) return INVALID;
  return fromRgb({ r: Math.round(rv), g: Math.round(gv), b: Math.round(bv) });
}

export function parseHsl(h: string, s: string, l: string): ColorResult {
  if (isBlank(h) && isBlank(s) && isBlank(l)) return IDLE;
  const hv = parseChannel(h, 0, 360);
  const sv = parseChannel(s, 0, 100);
  const lv = parseChannel(l, 0, 100);
  if (hv === null || sv === null || lv === null) return INVALID;
  const rgb = hslToRgb(hv, sv, lv);
  return fromRgb(rgb);
}
