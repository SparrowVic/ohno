import { describe, expect, it } from 'vitest';

import {
  createBurrowsWheelerScenario,
  createHuffmanScenario,
  createKmpScenario,
  createManacherScenario,
  createRabinKarpScenario,
  createRleScenario,
  createZAlgorithmScenario,
} from './string-scenarios';

describe('string-scenarios', () => {
  it('selects KMP presets by size tier and preset id', () => {
    const short = createKmpScenario(12, 'dna');
    const long = createKmpScenario(24, 'signal');

    expect(short.pattern).toBe('AABA');
    expect(short.text).toBe('AACAADAABAABA');
    expect(long.pattern).toBe('NEONNEB');
    expect(long.text).toContain('NEON');
  });

  it('builds deterministic Rabin-Karp and Z-algorithm scenarios', () => {
    const rabin = createRabinKarpScenario(25, 'alarm');
    const z = createZAlgorithmScenario(15, 'log');

    expect(rabin.base).toBe(31);
    expect(rabin.mod).toBe(11);
    expect(rabin.pattern).toBe('CABA');

    expect(z.pattern).toBe('SYNC');
    expect(z.text).toContain('SYNC');
  });

  it('appends a single BWT sentinel and preserves strong palindrome presets', () => {
    const bwt = createBurrowsWheelerScenario(5, 'panama');
    const manacher = createManacherScenario(18, 'mixed');

    expect(bwt.source.endsWith('$')).toBe(true);
    expect(bwt.source.endsWith('$$')).toBe(false);
    expect(manacher.source).toContain('LEVEL');
  });

  it('uses appropriate compression sources and falls back to the first Huffman preset', () => {
    const rle = createRleScenario(15, 'worst');
    const huffman = createHuffmanScenario(4, 'missing-preset');

    expect(new Set(rle.source).size).toBe(rle.source.length);
    expect(huffman.presetId).toBe('classic');
    expect(huffman.source).toBe('AABBC');
  });
});
