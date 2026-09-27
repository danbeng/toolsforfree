function normalizeBase(base: string): string {
  return (base ?? '').replace(/\/+$/, '');
}

export function joinBase(base: string, path: string): string {
  const prefix = normalizeBase(base);
  let rest = (path ?? '').replace(/^\/+/, '/');
  if (!rest.startsWith('/')) {
    rest = `/${rest}`;
  }
  return `${prefix}${rest}`;
}

export function removeBase(base: string, pathname: string): string {
  const prefix = normalizeBase(base);
  if (!prefix) return pathname;
  if (pathname === prefix || pathname === `${prefix}/`) return '/';
  if (pathname.startsWith(`${prefix}/`)) return pathname.slice(prefix.length);
  return pathname;
}

export function withBase(path: string): string {
  return joinBase(import.meta.env.BASE_URL, path);
}

export function stripBase(pathname: string): string {
  return removeBase(import.meta.env.BASE_URL, pathname);
}
