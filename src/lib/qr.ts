import encodeQR from 'qr';
import decodeQR from 'qr/decode.js';

export type QrEcc = 'L' | 'M' | 'Q' | 'H';

const ECC_TO_QR = {
  L: 'low',
  M: 'medium',
  Q: 'quartile',
  H: 'high',
} as const;

export const QR_ENCODE_FAIL_MSG = 'Cannot encode this text as a QR code.';
export const QR_NOT_FOUND_MSG = 'No QR code found in this image.';

export type QrEncodeResult =
  | { ok: true; matrix: boolean[][] }
  | { ok: false; error: string };

export type QrDecodeResult =
  | { ok: true; payload: string }
  | { ok: false; error: string };

export function encodeQr(input: string, ecc: QrEcc = 'M'): QrEncodeResult {
  if (!input.trim()) return { ok: false, error: '' };
  try {
    const matrix = encodeQR(input, 'raw', { ecc: ECC_TO_QR[ecc] });
    return { ok: true, matrix };
  } catch {
    return { ok: false, error: QR_ENCODE_FAIL_MSG };
  }
}

export function decodeQr(img: {
  width: number;
  height: number;
  data: Uint8ClampedArray | Uint8Array;
}): QrDecodeResult {
  try {
    const payload = decodeQR(img, { effort: Infinity, timeLimit: Infinity });
    return { ok: true, payload };
  } catch {
    return { ok: false, error: QR_NOT_FOUND_MSG };
  }
}
