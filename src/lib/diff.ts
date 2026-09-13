export type DiffLineKind = 'add' | 'del' | 'eq';

export type DiffLine = { kind: DiffLineKind; text: string };

export type DiffResult =
  | {
      ok: true;
      lines: DiffLine[];
      added: number;
      removed: number;
      identical: boolean;
    }
  | { ok: false; error: string };

export function diffText(
  _original: string,
  _changed: string,
  _options: { ignoreWhitespace: boolean },
): DiffResult {
  return { ok: false, error: 'not implemented' };
}
