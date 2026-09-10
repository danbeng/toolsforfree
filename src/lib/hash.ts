export type HashAlg = 'SHA-256' | 'SHA-1';

export async function hashText(input: string, alg: HashAlg): Promise<string> {
  const bytes = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest(alg, bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}
