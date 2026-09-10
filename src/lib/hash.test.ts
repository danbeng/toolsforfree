import { describe, expect, it } from 'vitest';
import { hashText } from './hash';

describe('hashText', () => {
  it('hashes an empty string with SHA-256', async () => {
    await expect(hashText('', 'SHA-256')).resolves.toBe(
      'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    );
  });

  it("hashes 'abc' with SHA-1", async () => {
    await expect(hashText('abc', 'SHA-1')).resolves.toBe(
      'a9993e364706816aba3e25717850c26c9cd0d89d',
    );
  });
});
