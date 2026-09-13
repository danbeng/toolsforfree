import { diffLines } from 'diff';

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
  original: string,
  changed: string,
  options: { ignoreWhitespace: boolean },
): DiffResult {
  if (!original.trim() && !changed.trim()) return { ok: false, error: '' };
  try {
    const changes = diffLines(original, changed, {
      ignoreWhitespace: options.ignoreWhitespace,
      oneChangePerToken: true,
    });
    const lines: DiffLine[] = [];
    let added = 0;
    let removed = 0;
    for (const change of changes) {
      const kind: DiffLineKind = change.added ? 'add' : change.removed ? 'del' : 'eq';
      if (kind === 'add') added += 1;
      if (kind === 'del') removed += 1;
      const text = change.value.replace(/\r?\n$/, '');
      lines.push({ kind, text });
    }
    return {
      ok: true,
      lines,
      added,
      removed,
      identical: added === 0 && removed === 0,
    };
  } catch {
    return { ok: false, error: '' };
  }
}
