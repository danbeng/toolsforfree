export const ui = {
  en: {
    tools: {
      'word-counter': {
        name: 'Word Counter',
        shortDescription: 'Count words, characters, lines, sentences, and paragraphs locally.',
        text: 'Text',
        words: 'Words',
        chars: 'Characters (with spaces)',
        charsNoSpaces: 'Characters (no spaces)',
        lines: 'Lines',
        sentences: 'Sentences',
        paragraphs: 'Paragraphs',
      },
    },
  },
  zh: {
    tools: {
      'word-counter': {
        name: '字数统计',
        shortDescription: '在本地统计词数、字符、行、句子和段落。',
        text: '文本',
        words: '词数',
        chars: '字符（含空格）',
        charsNoSpaces: '字符（不含空格）',
        lines: '行数',
        sentences: '句子',
        paragraphs: '段落',
      },
    },
  },
} as const;

export type Locale = 'en' | 'zh';
export type UiDict = (typeof ui)['en'];

export function t(locale: Locale): UiDict {
  return ui[locale];
}
