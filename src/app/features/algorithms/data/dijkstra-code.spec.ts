import { describe, expect, it } from 'vitest';

import { DIJKSTRA_CODE_VARIANTS } from './dijkstra-code';

describe('dijkstra-code', () => {
  it('exposes all implemented language variants for Dijkstra', () => {
    expect(Object.keys(DIJKSTRA_CODE_VARIANTS).sort()).toEqual([
      'cpp',
      'csharp',
      'go',
      'java',
      'javascript',
      'kotlin',
      'php',
      'python',
      'rust',
      'swift',
      'typescript',
    ]);

    for (const variant of Object.values(DIJKSTRA_CODE_VARIANTS)) {
      expect(variant?.lines.length).toBeGreaterThan(0);
      expect(variant?.source?.length).toBeGreaterThan(0);
    }
  });
});
