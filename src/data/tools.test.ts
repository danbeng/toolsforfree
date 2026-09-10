import { describe, expect, it } from 'vitest';
import {
  TOOLS,
  getFeaturedTools,
  getRelatedTools,
  getTool,
  getToolsByCategory,
} from './tools';

describe('TOOLS registry', () => {
  it('has exactly 10 tools', () => {
    expect(TOOLS).toHaveLength(10);
  });

  it('uses unique slugs', () => {
    const slugs = TOOLS.map((t) => t.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('features exactly six tools including json-formatter and jwt-decoder', () => {
    const featured = getFeaturedTools();
    expect(featured).toHaveLength(6);
    expect(featured.map((t) => t.slug)).toEqual(
      expect.arrayContaining(['json-formatter', 'jwt-decoder']),
    );
  });

  it('resolves related tools from slugs', () => {
    const related = getRelatedTools('json-formatter');
    expect(related.every((t) => t.slug !== 'json-formatter')).toBe(true);
    expect(related.length).toBeGreaterThan(0);
  });

  it('getTool returns undefined for unknown slugs', () => {
    expect(getTool('nope')).toBeUndefined();
  });

  it('groups by category without dropping tools', () => {
    const grouped = getToolsByCategory();
    const count = grouped.reduce((n, g) => n + g.tools.length, 0);
    expect(count).toBe(10);
  });
});
