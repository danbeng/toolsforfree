export type RegexMatch = { index: number; text: string; groups: string[] };
export type RegexResult =
  | { ok: true; matches: RegexMatch[] }
  | { ok: false; error: string };

function toMatch(m: RegExpMatchArray): RegexMatch {
  return {
    index: m.index ?? 0,
    text: m[0],
    groups: m.slice(1).map((g) => g ?? ''),
  };
}

export function testRegex(pattern: string, flags: string, text: string): RegexResult {
  if (!pattern) return { ok: false, error: '' };
  let re: RegExp;
  try {
    re = new RegExp(pattern, flags);
  } catch {
    return { ok: false, error: 'Invalid regular expression' };
  }
  if (re.global) {
    return { ok: true, matches: [...text.matchAll(re)].map(toMatch) };
  }
  const m = re.exec(text);
  return { ok: true, matches: m ? [toMatch(m)] : [] };
}
