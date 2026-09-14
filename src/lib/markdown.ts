import { marked } from 'marked';
import DOMPurify from 'dompurify';

export type MarkdownResult =
  | { ok: true; html: string }
  | { ok: false; error: string };

function purify(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    USE_PROFILES: { html: true },
    FORBID_TAGS: [
      'img',
      'picture',
      'source',
      'video',
      'audio',
      'track',
      'iframe',
      'object',
      'embed',
      'form',
    ],
    FORBID_ATTR: ['style', 'srcset', 'poster'],
    KEEP_CONTENT: false,
  });
}

function normalizeEmpty(html: string): string {
  const collapsed = html.replace(/<p>\s*<\/p>/g, '').trim();
  return collapsed === '' ? '' : html;
}

export function renderMarkdown(input: string): MarkdownResult {
  if (!input) return { ok: false, error: '' };
  try {
    const raw = marked.parse(input) as string;
    const html = normalizeEmpty(purify(raw));
    return { ok: true, html };
  } catch {
    return { ok: false, error: '' };
  }
}
