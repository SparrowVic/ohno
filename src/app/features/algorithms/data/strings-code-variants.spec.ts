import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import { resolveActiveCodeLine } from '../components/code-panel/code-panel.utils/code-panel.utils';
import { BURROWS_WHEELER_TRANSFORM_CODE_VARIANTS } from './burrows-wheeler-transform-code';
import { HUFFMAN_CODE_VARIANTS } from './huffman-coding-code';
import { KMP_PATTERN_MATCHING_CODE_VARIANTS } from './kmp-pattern-matching-code';
import { MANACHER_CODE_VARIANTS } from './manacher-code';
import { RABIN_KARP_CODE_VARIANTS } from './rabin-karp-code';
import { RLE_CODE_VARIANTS } from './run-length-encoding-code';
import { Z_ALGORITHM_CODE_VARIANTS } from './z-algorithm-code';

const EXPECTED_LANGUAGES = [
  'typescript',
  'javascript',
  'python',
  'csharp',
  'java',
  'cpp',
  'go',
  'rust',
  'swift',
  'php',
  'kotlin',
] as const;

const STRING_CODE_CASES = [
  [
    'kmp-pattern-matching',
    KMP_PATTERN_MATCHING_CODE_VARIANTS,
    'src/app/features/algorithms/algorithms/kmp-pattern-matching/kmp-pattern-matching.ts',
  ],
  [
    'rabin-karp',
    RABIN_KARP_CODE_VARIANTS,
    'src/app/features/algorithms/algorithms/rabin-karp/rabin-karp.ts',
  ],
  [
    'z-algorithm',
    Z_ALGORITHM_CODE_VARIANTS,
    'src/app/features/algorithms/algorithms/z-algorithm/z-algorithm.ts',
  ],
  [
    'manacher',
    MANACHER_CODE_VARIANTS,
    'src/app/features/algorithms/algorithms/manacher/manacher.ts',
  ],
  [
    'burrows-wheeler-transform',
    BURROWS_WHEELER_TRANSFORM_CODE_VARIANTS,
    'src/app/features/algorithms/algorithms/burrows-wheeler-transform/burrows-wheeler-transform.ts',
  ],
  [
    'run-length-encoding',
    RLE_CODE_VARIANTS,
    'src/app/features/algorithms/algorithms/run-length-encoding/run-length-encoding.ts',
  ],
  [
    'huffman-coding',
    HUFFMAN_CODE_VARIANTS,
    'src/app/features/algorithms/algorithms/huffman-coding/huffman-coding.ts',
  ],
] as const;

describe('string code variants', () => {
  it.each(STRING_CODE_CASES)(
    'exposes every supported programming language for %s',
    (_algorithmId, variants) => {
      expect(Object.keys(variants).sort()).toEqual([...EXPECTED_LANGUAGES].sort());
    },
  );

  it.each(STRING_CODE_CASES)(
    'resolves every active string step to a non-empty code line for %s',
    (_algorithmId, variants, generatorPath) => {
      const generatorSource = readFileSync(resolve(process.cwd(), generatorPath), 'utf8');
      const activeSteps = [
        ...new Set(
          [...generatorSource.matchAll(/activeCodeLine:\s*(\d+)/g)].map((match) =>
            Number(match[1]),
          ),
        ),
      ];

      for (const language of EXPECTED_LANGUAGES) {
        const variant = variants[language];
        expect(variant).toBeDefined();

        for (const step of activeSteps) {
          const resolved = resolveActiveCodeLine(step, variant!);
          expect(resolved).not.toBeNull();

          const line = variant!.lines[(resolved ?? 1) - 1];
          const text = line?.tokens.map((token) => token.text).join('') ?? '';
          expect(text.trim().length).toBeGreaterThan(0);
        }
      }
    },
  );
});
