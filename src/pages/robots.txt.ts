import type { APIRoute } from 'astro';
import { withBase } from '../i18n/base';

const body = (sitemapURL: URL) => `User-agent: *
Allow: /

Sitemap: ${sitemapURL.href}
`;

export const GET: APIRoute = ({ site }) => {
  const sitemapURL = new URL(withBase('/sitemap-index.xml'), site);
  return new Response(body(sitemapURL), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
