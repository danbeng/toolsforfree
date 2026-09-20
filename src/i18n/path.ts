import type { Locale } from './locales';

function stripScheme(input: string): string {
  return input.replace(/^[a-zA-Z][a-zA-Z0-9+.-]*:/, '');
}

function normalizePath(input: string): string {
  let path = stripScheme(input ?? '');
  path = path.replace(/^\/+/, '/');
  if (!path.startsWith('/')) {
    path = `/${path}`;
  }
  path = `/${path.replace(/^\/+/, '').replace(/\/+/g, '/')}`;
  if (!path.endsWith('/')) {
    path = `${path}/`;
  }
  return path;
}

export function localeFromPathname(pathname: string): Locale {
  if (!pathname) return 'en';
  if (pathname === '/zh' || pathname.startsWith('/zh/')) return 'zh';
  return 'en';
}

export function localizedPath(locale: Locale, path: string): string {
  const normalized = normalizePath(path);
  if (locale !== 'zh') {
    return normalized;
  }
  if (normalized === '/') return '/zh/';
  return `/zh${normalized}`;
}

export function switchLocalePath(pathname: string, target: Locale): string {
  const normalized = normalizePath(pathname);
  let rest = normalized;
  if (rest === '/zh/') {
    rest = '/';
  } else if (rest.startsWith('/zh/')) {
    rest = rest.slice(3);
  }
  return localizedPath(target === 'zh' ? 'zh' : 'en', rest);
}
