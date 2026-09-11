export type PasswordResult =
  | { ok: true; password: string }
  | { ok: false; error: string };

export function generatePassword(_opts: {
  length: number;
  lower: boolean;
  upper: boolean;
  digits: boolean;
  symbols: boolean;
  excludeSimilar: boolean;
}): PasswordResult {
  return { ok: false, error: 'not implemented' };
}
