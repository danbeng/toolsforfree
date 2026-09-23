import { describe, expect, it } from 'vitest';
import { TOOLS, type Tool } from '../data/tools';
import { toolLabels } from './catalog-copy';
import { t } from './ui';

const present = TOOLS.find((tool) => tool.slug === 'json-formatter');
if (!present) throw new Error('json-formatter missing from catalog');

const missing: Tool = {
  ...present,
  slug: 'not-in-ui-copy',
  name: 'Catalog Only Name',
  shortDescription: 'Catalog only short description.',
};

describe('toolLabels', () => {
  it('returns a present UI-copy entry unchanged for en and zh', () => {
    for (const locale of ['en', 'zh'] as const) {
      const entry = t(locale).tools['json-formatter'];
      expect(toolLabels(t(locale).tools, present)).toEqual({
        name: entry.name,
        shortDescription: entry.shortDescription,
      });
    }
  });

  it('returns catalog name and short description when the key is missing', () => {
    expect(toolLabels(t('en').tools, missing)).toEqual({
      name: missing.name,
      shortDescription: missing.shortDescription,
    });
  });

  it('does not mix a present key with catalog fields', () => {
    const catalogShaped: Tool = {
      ...present,
      name: 'Should Not Replace UI Copy',
      shortDescription: 'Should not replace UI copy.',
    };
    const entry = t('en').tools['json-formatter'];
    expect(toolLabels(t('en').tools, catalogShaped)).toEqual({
      name: entry.name,
      shortDescription: entry.shortDescription,
    });
  });
});
