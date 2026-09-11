import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('PasswordGenerator island', () => {
  const source = readFileSync(new URL('./PasswordGenerator.tsx', import.meta.url), 'utf8');

  it('calls generatePassword from the lib and copies via ToolShell output', () => {
    expect(source.includes("from '../../lib/password'")).toBe(true);
    expect(source.includes('generatePassword')).toBe(true);
    expect(source.includes('output={output}')).toBe(true);
    expect(source.includes('type="button"')).toBe(true);
    expect(source.includes("copy.tools['password-generator']")).toBe(true);
    expect(source.includes('err(r.error')).toBe(true);
  });

  it('places Generate above toggles and does not auto-regen on toggle', () => {
    const buttonAt = source.indexOf('<button type="button"');
    const firstToggle = source.indexOf('type="checkbox"');
    expect(buttonAt).toBeGreaterThan(-1);
    expect(firstToggle).toBeGreaterThan(buttonAt);
    expect(source.includes('useEffect')).toBe(true);
    expect(source.includes('onGenerate();')).toBe(true);
  });

  it('does not run CSPRNG or HTML injection in the island', () => {
    expect(source.includes('Math.random')).toBe(false);
    expect(source.includes('getRandomValues')).toBe(false);
    expect(source.includes('innerHTML')).toBe(false);
    expect(source.includes('dangerouslySetInnerHTML')).toBe(false);
  });
});

describe('password-generator FAQ', () => {
  const en = readFileSync(new URL('../../content/tools/password-generator.md', import.meta.url), 'utf8');
  const zh = readFileSync(new URL('../../content/tools/zh/password-generator.md', import.meta.url), 'utf8');

  it('states local Web Crypto generation and empty-charset error', () => {
    expect(en.includes('Web Crypto')).toBe(true);
    expect(en.includes('not a password manager')).toBe(true);
    expect(en.includes('Select at least one character set')).toBe(true);
    expect(en.includes('8 and 128')).toBe(true);
    expect(zh.includes('Web Crypto')).toBe(true);
    expect(zh.includes('密码管理器')).toBe(true);
    expect(zh.includes('请至少选择一种字符集')).toBe(true);
    expect(zh.includes('8 到 128')).toBe(true);
  });
});
