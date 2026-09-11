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
      'case-converter': {
        name: 'Case / Slug Converter',
        shortDescription: 'Convert letter case and build a URL slug locally.',
        text: 'Text',
        upper: 'UPPER',
        lower: 'lower',
        title: 'Title',
        camel: 'camelCase',
        pascal: 'PascalCase',
        snake: 'snake_case',
        kebab: 'kebab-case',
        constant: 'CONSTANT_CASE',
        slug: 'URL slug',
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
      'case-converter': {
        name: '大小写 / 短链接转换',
        shortDescription: '在本地转换字母大小写并生成 URL slug。',
        text: '文本',
        upper: '大写',
        lower: '小写',
        title: '标题格式',
        camel: 'camelCase',
        pascal: 'PascalCase',
        snake: 'snake_case',
        kebab: 'kebab-case',
        constant: 'CONSTANT_CASE',
        slug: 'URL slug',
      },
    },
  },
} as const;

export type Locale = 'en' | 'zh';
export type UiDict = (typeof ui)['en'];

export function t(locale: Locale): UiDict {
  return ui[locale];
}
