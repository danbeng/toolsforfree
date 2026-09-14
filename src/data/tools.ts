export type ToolCategory =
  | 'Format'
  | 'Auth'
  | 'Encode'
  | 'Generate'
  | 'Text'
  | 'Time'
  | 'Color';

export interface Tool {
  slug: string;
  name: string;
  category: ToolCategory;
  shortDescription: string;
  relatedSlugs: string[];
  featured: boolean;
}

export const TOOLS: Tool[] = [
  {
    slug: 'json-formatter',
    name: 'JSON Formatter / Validator',
    category: 'Format',
    shortDescription: 'Format and validate JSON in your browser.',
    relatedSlugs: ['base64', 'jwt-decoder', 'regex-tester'],
    featured: true,
  },
  {
    slug: 'jwt-decoder',
    name: 'JWT Decoder',
    category: 'Auth',
    shortDescription: 'Decode a JWT header and payload locally. Not verification.',
    relatedSlugs: ['base64', 'json-formatter', 'hash-generator'],
    featured: true,
  },
  {
    slug: 'base64',
    name: 'Base64 Encode / Decode',
    category: 'Encode',
    shortDescription: 'Encode or decode Base64 without uploading data.',
    relatedSlugs: ['url-encode', 'jwt-decoder', 'hash-generator'],
    featured: false,
  },
  {
    slug: 'url-encode',
    name: 'URL Encode / Decode',
    category: 'Encode',
    shortDescription: 'Percent-encode or decode URL components.',
    relatedSlugs: ['base64', 'json-formatter'],
    featured: false,
  },
  {
    slug: 'hash-generator',
    name: 'Hash Generator',
    category: 'Generate',
    shortDescription: 'SHA-256 and SHA-1 hashes via Web Crypto.',
    relatedSlugs: ['uuid-generator', 'base64', 'jwt-decoder'],
    featured: true,
  },
  {
    slug: 'uuid-generator',
    name: 'UUID Generator',
    category: 'Generate',
    shortDescription: 'Generate a UUID v4 in your browser.',
    relatedSlugs: ['hash-generator', 'unix-timestamp'],
    featured: false,
  },
  {
    slug: 'regex-tester',
    name: 'Regex Tester',
    category: 'Text',
    shortDescription: 'Test a regular expression against a sample string.',
    relatedSlugs: ['json-formatter', 'url-encode'],
    featured: true,
  },
  {
    slug: 'unix-timestamp',
    name: 'Unix Timestamp Converter',
    category: 'Time',
    shortDescription: 'Convert Unix time to UTC ISO and back.',
    relatedSlugs: ['crontab-explainer', 'uuid-generator'],
    featured: true,
  },
  {
    slug: 'crontab-explainer',
    name: 'Crontab Explainer',
    category: 'Time',
    shortDescription: 'Explain a five-field cron expression in English.',
    relatedSlugs: ['unix-timestamp', 'regex-tester'],
    featured: true,
  },
  {
    slug: 'color-converter',
    name: 'Hex / RGB / HSL Converter',
    category: 'Color',
    shortDescription: 'Convert colors between hex, RGB, and HSL.',
    relatedSlugs: ['hash-generator', 'json-formatter'],
    featured: false,
  },
  {
    slug: 'word-counter',
    name: 'Word Counter',
    category: 'Text',
    shortDescription: 'Count words, characters, lines, sentences, and paragraphs locally.',
    relatedSlugs: ['case-converter', 'regex-tester', 'lorem-ipsum'],
    featured: false,
  },
  {
    slug: 'case-converter',
    name: 'Case / Slug Converter',
    category: 'Text',
    shortDescription: 'Convert letter case and build a URL slug locally.',
    relatedSlugs: ['word-counter', 'regex-tester', 'url-encode'],
    featured: false,
  },
  {
    slug: 'lorem-ipsum',
    name: 'Lorem Ipsum Generator',
    category: 'Generate',
    shortDescription: 'Generate dummy Latin text in your browser.',
    relatedSlugs: ['word-counter', 'case-converter', 'password-generator'],
    featured: false,
  },
  {
    slug: 'password-generator',
    name: 'Password Generator',
    category: 'Generate',
    shortDescription: 'Generate a password locally with Web Crypto.',
    relatedSlugs: ['uuid-generator', 'hash-generator', 'lorem-ipsum'],
    featured: false,
  },
  {
    slug: 'sql-formatter',
    name: 'SQL Formatter',
    category: 'Format',
    shortDescription: 'Pretty-print SQL in your browser.',
    relatedSlugs: ['json-formatter', 'regex-tester', 'base64'],
    featured: false,
  },
  {
    slug: 'text-diff',
    name: 'Text Diff',
    category: 'Text',
    shortDescription: 'Compare two texts line by line in your browser.',
    relatedSlugs: ['word-counter', 'case-converter', 'json-formatter'],
    featured: false,
  },
  {
    slug: 'markdown-preview',
    name: 'Markdown Preview',
    category: 'Format',
    shortDescription: 'Preview GitHub-flavored Markdown in your browser.',
    relatedSlugs: ['json-formatter', 'text-diff', 'word-counter'],
    featured: false,
  },
];

const CATEGORY_ORDER: ToolCategory[] = [
  'Format',
  'Auth',
  'Encode',
  'Generate',
  'Text',
  'Time',
  'Color',
];

export function getTool(slug: string): Tool | undefined {
  return TOOLS.find((t) => t.slug === slug);
}

export function getFeaturedTools(): Tool[] {
  return TOOLS.filter((t) => t.featured);
}

export function getToolsByCategory(): { category: ToolCategory; tools: Tool[] }[] {
  return CATEGORY_ORDER.map((category) => ({
    category,
    tools: TOOLS.filter((t) => t.category === category),
  })).filter((g) => g.tools.length > 0);
}

export function getRelatedTools(slug: string): Tool[] {
  const tool = getTool(slug);
  if (!tool) return [];
  return tool.relatedSlugs
    .map((s) => getTool(s))
    .filter((t): t is Tool => Boolean(t) && t.slug !== slug);
}
