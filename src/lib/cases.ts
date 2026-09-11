export type CaseValue = {
  upper: string;
  lower: string;
  title: string;
  camel: string;
  pascal: string;
  snake: string;
  kebab: string;
  constant: string;
  slug: string;
};

export type CaseResult =
  | { ok: true; value: CaseValue }
  | { ok: false; error: string };

function titleCase(input: string): string {
  return input
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => {
      const chars = [...word];
      const first = chars[0].toLocaleUpperCase();
      const rest = chars.slice(1).join('').toLocaleLowerCase();
      return first + rest;
    })
    .join(' ');
}

function tokenize(input: string): string[] {
  return input
    .split(/[\s_\-]+|[^\p{Letter}\p{Number}]+/u)
    .map((token) => token.trim())
    .filter(Boolean);
}

function capitalizeToken(token: string): string {
  const chars = [...token];
  if (chars.length === 0) return '';
  return chars[0].toLocaleUpperCase() + chars.slice(1).join('').toLocaleLowerCase();
}

export function slugify(input: string): string {
  const stripped = input.normalize('NFKD').replace(/\p{M}+/gu, '');
  return stripped
    .toLocaleLowerCase()
    .replace(/[^\p{Letter}\p{Number}]+/gu, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function convertCases(input: string): CaseResult {
  const trimmed = input.trim();
  if (!trimmed) return { ok: false, error: '' };

  const tokens = tokenize(trimmed);
  const lowerTokens = tokens.map((token) => token.toLocaleLowerCase());
  const camel =
    lowerTokens.length === 0
      ? ''
      : lowerTokens[0] + lowerTokens.slice(1).map(capitalizeToken).join('');
  const pascal = lowerTokens.map(capitalizeToken).join('');
  const snake = lowerTokens.join('_');
  const kebab = lowerTokens.join('-');
  const constant = snake.toLocaleUpperCase();

  return {
    ok: true,
    value: {
      upper: trimmed.toLocaleUpperCase(),
      lower: trimmed.toLocaleLowerCase(),
      title: titleCase(trimmed),
      camel,
      pascal,
      snake,
      kebab,
      constant,
      slug: slugify(trimmed),
    },
  };
}
