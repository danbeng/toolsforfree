import { describe, expect, it } from 'vitest';
import { joinBase, removeBase, stripBase, withBase } from './base';
import { switchLocalePath } from './path';

describe('joinBase', () => {
  it('prefixes a base with or without a trailing slash', () => {
    expect(joinBase('/toolsforfree', '/tools/')).toBe('/toolsforfree/tools/');
    expect(joinBase('/toolsforfree/', '/tools/')).toBe('/toolsforfree/tools/');
  });

  it('handles home paths', () => {
    expect(joinBase('/toolsforfree', '/')).toBe('/toolsforfree/');
    expect(joinBase('/toolsforfree', '/zh/')).toBe('/toolsforfree/zh/');
  });

  it('keeps the hash', () => {
    expect(joinBase('/toolsforfree', '/tools/#category-text')).toBe('/toolsforfree/tools/#category-text');
  });

  it('does not add or strip a trailing slash on the path', () => {
    expect(joinBase('/toolsforfree', '/sitemap-index.xml')).toBe('/toolsforfree/sitemap-index.xml');
  });

  it('is identity for an empty or root base', () => {
    for (const p of ['/', '/tools/', '/zh/tools/json-formatter/']) {
      expect(joinBase('/', p)).toBe(p);
      expect(joinBase('', p)).toBe(p);
    }
  });

  it('never emits a double slash', () => {
    const cases: [string, string][] = [
      ['/toolsforfree', '//evil.com'],
      ['/', '//evil.com'],
      ['', '//evil.com'],
      ['/toolsforfree//', '/tools/'],
      ['/toolsforfree', 'tools/'],
    ];
    for (const [b, p] of cases) {
      const out = joinBase(b, p);
      expect(out.startsWith('//')).toBe(false);
      expect(out.includes('//')).toBe(false);
    }
    expect(joinBase('/toolsforfree', 'tools/')).toBe('/toolsforfree/tools/');
    expect(joinBase('/toolsforfree//', '/tools/')).toBe('/toolsforfree/tools/');
  });
});

describe('removeBase', () => {
  it('strips a base with or without a trailing slash', () => {
    expect(removeBase('/toolsforfree', '/toolsforfree/zh/tools/')).toBe('/zh/tools/');
    expect(removeBase('/toolsforfree/', '/toolsforfree/zh/tools/')).toBe('/zh/tools/');
  });

  it('maps the base itself to root', () => {
    expect(removeBase('/toolsforfree', '/toolsforfree/')).toBe('/');
    expect(removeBase('/toolsforfree', '/toolsforfree')).toBe('/');
  });

  it('is segment-boundary safe', () => {
    expect(removeBase('/toolsforfree', '/toolsforfreebie/')).toBe('/toolsforfreebie/');
    expect(removeBase('/toolsforfree', '/tools/')).toBe('/tools/');
  });

  it('is identity for a root base', () => {
    for (const p of ['/', '/tools/', '/zh/tools/json-formatter/']) {
      expect(removeBase('/', p)).toBe(p);
    }
  });
});

describe('round trip and composition', () => {
  it('join(remove(join(p))) equals join(p)', () => {
    for (const b of ['/toolsforfree', '/toolsforfree/', '/']) {
      for (const p of ['/', '/tools/', '/zh/', '/zh/tools/json-formatter/']) {
        const joined = joinBase(b, p);
        expect(joinBase(b, removeBase(b, joined))).toBe(joined);
      }
    }
  });

  it('puts /zh/ after the base when switching locale', () => {
    const logical = removeBase('/toolsforfree', '/toolsforfree/tools/json-formatter/');
    const out = joinBase('/toolsforfree', switchLocalePath(logical, 'zh'));
    expect(out).toBe('/toolsforfree/zh/tools/json-formatter/');
    expect(out.includes('/zh/toolsforfree')).toBe(false);
  });
});

describe('withBase / stripBase under Vitest', () => {
  it('are identity when BASE_URL is /', () => {
    expect(withBase('/tools/')).toBe('/tools/');
    expect(stripBase('/zh/tools/')).toBe('/zh/tools/');
  });
});
