export function encodeUrl(text: string): string {
  return encodeURIComponent(text);
}

export function decodeUrl(
  text: string,
): { ok: true; text: string } | { ok: false; error: string } {
  try {
    return { ok: true, text: decodeURIComponent(text) };
  } catch {
    return { ok: false, error: 'Invalid URL encoding' };
  }
}
