export type CounterResult = {
  ok: true;
  words: number;
  charsWithSpaces: number;
  charsWithoutSpaces: number;
  lines: number;
  sentences: number;
  paragraphs: number;
};

export function countWordsFallback(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  let n = 0;
  for (const token of trimmed.split(/\s+/)) {
    const parts = token.split(/(\p{Script=Han})/u).filter(Boolean);
    for (const p of parts) {
      if (/^\p{Script=Han}$/u.test(p)) n += 1;
      else n += 1;
    }
  }
  return n;
}

export function countWords(text: string, localeTag = 'en'): number {
  if (typeof Intl !== 'undefined' && typeof Intl.Segmenter === 'function') {
    const seg = new Intl.Segmenter(localeTag, { granularity: 'word' });
    let n = 0;
    for (const part of seg.segment(text)) {
      if (part.isWordLike) n += 1;
    }
    return n;
  }
  return countWordsFallback(text);
}

export function countText(text: string, localeTag = 'en'): CounterResult {
  if (!text.trim()) {
    return {
      ok: true,
      words: 0,
      charsWithSpaces: 0,
      charsWithoutSpaces: 0,
      lines: 0,
      sentences: 0,
      paragraphs: 0,
    };
  }
  return {
    ok: true,
    words: countWords(text, localeTag),
    charsWithSpaces: text.length,
    charsWithoutSpaces: text.replace(/\s/g, '').length,
    lines: text.split(/\r\n|\n|\r/).length,
    sentences: 0,
    paragraphs: 0,
  };
}
