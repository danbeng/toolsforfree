import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { encodeQr, decodeQr, QR_ENCODE_FAIL_MSG, QR_NOT_FOUND_MSG } from './qr';

function matrixToRgba(matrix: boolean[][], scale: number) {
  const n = matrix.length;
  const size = n * scale;
  const data = new Uint8ClampedArray(size * size * 4);
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      const v = matrix[y][x] ? 0 : 255;
      for (let dy = 0; dy < scale; dy++) {
        for (let dx = 0; dx < scale; dx++) {
          const i = ((y * scale + dy) * size + (x * scale + dx)) * 4;
          data[i] = v;
          data[i + 1] = v;
          data[i + 2] = v;
          data[i + 3] = 255;
        }
      }
    }
  }
  return { width: size, height: size, data };
}

describe('encodeQr', () => {
  it('returns empty error for empty and whitespace input', () => {
    expect(encodeQr('')).toEqual({ ok: false, error: '' });
    expect(encodeQr('   ')).toEqual({ ok: false, error: '' });
  });

  it('returns a matrix for hello', () => {
    const result = encodeQr('hello');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.matrix.length).toBeGreaterThan(0);
      expect(result.matrix[0].length).toBeGreaterThan(0);
      expect(typeof result.matrix[0][0]).toBe('boolean');
    }
  });

  it('defaults ecc to M mapped to medium', () => {
    const def = encodeQr('hello');
    const medium = encodeQr('hello', 'M');
    expect(def.ok).toBe(true);
    expect(medium.ok).toBe(true);
    if (def.ok && medium.ok) {
      expect(def.matrix).toEqual(medium.matrix);
    }
  });

  it('maps L versus H to different matrices', () => {
    const low = encodeQr('https://example.com/', 'L');
    const high = encodeQr('https://example.com/', 'H');
    expect(low.ok).toBe(true);
    expect(high.ok).toBe(true);
    if (low.ok && high.ok) {
      const sameSize = low.matrix.length === high.matrix.length;
      const samePattern =
        sameSize &&
        low.matrix.every((row, y) => row.every((cell, x) => cell === high.matrix[y][x]));
      expect(samePattern).toBe(false);
    }
  });

  it('maps UI letters in qr.ts and does not pass letter M as opts.ecc', () => {
    const qrSource = readFileSync(new URL('./qr.ts', import.meta.url), 'utf8');
    expect(qrSource).toContain('low');
    expect(qrSource).toContain('medium');
    expect(qrSource).toContain('quartile');
    expect(qrSource).toContain('high');
    expect(qrSource).toContain('ECC_TO_QR');
    expect(qrSource).not.toMatch(/ecc:\s*['"]M['"]/);
  });

  it('returns QR_ENCODE_FAIL_MSG for capacity overflow at H', () => {
    expect(encodeQr('A'.repeat(3000), 'H')).toEqual({
      ok: false,
      error: QR_ENCODE_FAIL_MSG,
    });
  });
});

describe('decodeQr', () => {
  it('round-trips a scale-2 synthetic raster of an encoded matrix', () => {
    const payload = 'https://example.com/';
    const encoded = encodeQr(payload);
    expect(encoded.ok).toBe(true);
    if (!encoded.ok) return;
    const img = matrixToRgba(encoded.matrix, 2);
    const decoded = decodeQr(img);
    expect(decoded).toEqual({ ok: true, payload });
  });

  it('returns QR_NOT_FOUND_MSG for 64 by 64 noise', () => {
    const size = 64;
    const data = new Uint8ClampedArray(size * size * 4);
    for (let i = 0; i < data.length; i += 4) {
      const v = (i * 17) % 256;
      data[i] = v;
      data[i + 1] = v;
      data[i + 2] = v;
      data[i + 3] = 255;
    }
    expect(decodeQr({ width: size, height: size, data })).toEqual({
      ok: false,
      error: QR_NOT_FOUND_MSG,
    });
  });
});

describe('QrCode island source', () => {
  it('source-reads PNG download, decoded output, size guards, and lib imports', () => {
    const island = readFileSync(
      new URL('../components/tools/QrCode.tsx', import.meta.url),
      'utf8',
    );
    expect(island).toContain("toDataURL('image/png')");
    expect(island).toContain("download = 'qr-code.png'");
    expect(island).toContain('IMAGE_MAX_BYTES');
    expect(island).toContain('file.size');
    expect(island).toContain('isTooLarge(input)');
    expect(island).toContain('localizeError');
    expect(island).toContain('encodeQr');
    expect(island).toContain('decodeQr');
    expect(island).toContain('../../lib/qr');
    expect(island).toContain('class=');
    expect(island).not.toContain('className');
    expect(island).toContain('spellcheck={false}');
    expect(island).toContain('tool-grid split');
    expect(island).toContain('qr-preview');
    expect(island).toContain('output={payload}');
    expect(island).not.toMatch(/from ['"]qr['"]/);
    expect(island).not.toMatch(/from ['"]qr\/decode\.js['"]/);
    expect(island).not.toMatch(/from ['"]qr\/dom\.js['"]/);
  });

  it('forbids camera APIs in lib and island', () => {
    const qrSource = readFileSync(new URL('./qr.ts', import.meta.url), 'utf8');
    const island = readFileSync(
      new URL('../components/tools/QrCode.tsx', import.meta.url),
      'utf8',
    );
    expect(qrSource).not.toMatch(/from ['"]qr\/dom\.js['"]/);
    expect(qrSource).not.toMatch(/from ['"]jsdom['"]/);
    expect(qrSource + island).not.toMatch(/getUserMedia|mediaDevices|rearCamera|selfieCamera/);
    expect(island).not.toMatch(/\bcapture\b/);
  });
});

describe('qr-code FAQ', () => {
  it('locks EN and ZH local-only and never-camera wording', () => {
    const en = readFileSync(new URL('../content/tools/qr-code.md', import.meta.url), 'utf8');
    const zh = readFileSync(new URL('../content/tools/zh/qr-code.md', import.meta.url), 'utf8');
    expect(en.toLowerCase()).toMatch(/browser/);
    expect(en.toLowerCase()).toMatch(/nothing is uploaded/);
    expect(en.toLowerCase()).toMatch(/selected image file/);
    expect(en.toLowerCase()).toMatch(/camera/);
    expect(zh).toContain('不会上传');
    expect(zh).toMatch(/文件/);
    expect(zh).toMatch(/摄像头/);
    expect(en).toMatch(/howTo:/);
    expect(zh).toMatch(/howTo:/);
  });
});
