export function encodeBase64(text: string): string {
  const bytes = new TextEncoder().encode(text);
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(bytes).toString('base64');
  }
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}

export function decodeBase64(
  text: string,
): { ok: true; text: string } | { ok: false; error: string } {
  const trimmed = text.trim();
  if (!trimmed) return { ok: false, error: '' };

  try {
    let bytes: Uint8Array;
    if (typeof Buffer !== 'undefined') {
      if (!/^[A-Za-z0-9+/]+={0,2}$/.test(trimmed) || trimmed.length % 4 !== 0) {
        return { ok: false, error: 'Invalid Base64' };
      }
      const buf = Buffer.from(trimmed, 'base64');
      if (buf.toString('base64') !== trimmed) {
        return { ok: false, error: 'Invalid Base64' };
      }
      bytes = new Uint8Array(buf);
    } else {
      const binary = atob(trimmed);
      bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
    }
    return { ok: true, text: new TextDecoder().decode(bytes) };
  } catch {
    return { ok: false, error: 'Invalid Base64' };
  }
}
