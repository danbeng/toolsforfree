export type JwtResult =
  | { ok: true; header: unknown; payload: unknown }
  | { ok: false; error: string };

function decodeBase64Url(segment: string): string | null {
  try {
    if (typeof atob === 'function') {
      const padded = segment.replace(/-/g, '+').replace(/_/g, '/');
      const pad = padded.length % 4 === 0 ? '' : '='.repeat(4 - (padded.length % 4));
      return atob(padded + pad);
    }
    return Buffer.from(segment, 'base64url').toString('utf8');
  } catch {
    return null;
  }
}

export function decodeJwt(token: string): JwtResult {
  const trimmed = token.trim();
  if (!trimmed) return { ok: false, error: '' };

  const parts = trimmed.split('.');
  if (parts.length !== 3) return { ok: false, error: 'Not a JWT' };

  const headerJson = decodeBase64Url(parts[0]);
  const payloadJson = decodeBase64Url(parts[1]);
  if (headerJson === null || payloadJson === null) {
    return { ok: false, error: 'Not a JWT' };
  }

  try {
    return {
      ok: true,
      header: JSON.parse(headerJson),
      payload: JSON.parse(payloadJson),
    };
  } catch {
    return { ok: false, error: 'Not a JWT' };
  }
}
