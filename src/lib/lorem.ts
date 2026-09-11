export const WORDS = [
  'lorem',
  'ipsum',
  'dolor',
  'sit',
  'amet',
  'consectetur',
  'adipiscing',
  'elit',
  'sed',
  'do',
  'eiusmod',
  'tempor',
  'incididunt',
  'ut',
  'labore',
  'et',
  'dolore',
  'magna',
  'aliqua',
  'enim',
  'ad',
  'minim',
  'veniam',
  'quis',
  'nostrud',
  'exercitation',
  'ullamco',
  'laboris',
  'nisi',
  'aliquip',
  'ex',
  'ea',
  'commodo',
  'consequat',
  'duis',
  'aute',
  'irure',
  'in',
  'reprehenderit',
  'voluptate',
  'velit',
  'esse',
  'cillum',
  'eu',
  'fugiat',
  'nulla',
  'pariatur',
  'excepteur',
  'sint',
  'occaecat',
  'cupidatat',
  'non',
  'proident',
  'sunt',
  'culpa',
  'qui',
  'officia',
  'deserunt',
  'mollit',
  'anim',
  'id',
  'est',
  'laborum',
  'phasellus',
  'vitae',
  'semper',
  'lectus',
  'integer',
  'nec',
  'odio',
  'praesent',
  'libero',
  'cursus',
  'ante',
  'dapibus',
  'diam',
  'nunc',
  'fermentum',
  'pretium',
  'maecenas',
  'gravida',
  'orci',
  'donec',
  'dui',
  'nam',
  'malesuada',
  'suspendisse',
  'pulvinar',
  'convallis',
  'mauris',
  'blandit',
  'aliquet',
  'tincidunt',
  'porta',
  'felis',
  'urna',
  'sagittis',
  'vehicula',
  'luctus',
  'accumsan',
] as const;

const OPENING = ['Lorem', 'ipsum', 'dolor', 'sit', 'amet'] as const;
const PARAGRAPH_WORDS = 50;
const COUNT_ERROR = 'Enter a count of at least 1';

export type LoremResult =
  | { ok: true; text: string }
  | { ok: false; error: string };

function take(n: number, start: number): string[] {
  const out: string[] = [];
  for (let i = 0; i < n; i++) {
    out.push(WORDS[(start + i) % WORDS.length]);
  }
  return out;
}

function finish(words: string[]): string {
  return `${words.join(' ')}.`;
}

export function generateLorem(opts: {
  mode: 'words' | 'paragraphs';
  count: number;
  classic: boolean;
}): LoremResult {
  const { mode, count, classic } = opts;
  if (!Number.isInteger(count) || count < 1) {
    return { ok: false, error: COUNT_ERROR };
  }

  if (mode === 'words') {
    if (classic) {
      const head = OPENING.slice(0, Math.min(count, OPENING.length));
      const rest = count > OPENING.length ? take(count - OPENING.length, 0) : [];
      return { ok: true, text: finish([...head, ...rest]) };
    }
    return { ok: true, text: finish(take(count, 0)) };
  }

  const paragraphs: string[] = [];
  let cursor = 0;
  for (let p = 0; p < count; p++) {
    if (classic && p === 0) {
      const restCount = PARAGRAPH_WORDS - OPENING.length;
      const rest = take(restCount, cursor);
      cursor += restCount;
      paragraphs.push(finish([...OPENING, ...rest]));
    } else {
      paragraphs.push(finish(take(PARAGRAPH_WORDS, cursor)));
      cursor += PARAGRAPH_WORDS;
    }
  }
  return { ok: true, text: paragraphs.join('\n\n') };
}
