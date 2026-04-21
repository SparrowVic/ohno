import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import { resolveActiveCodeLine } from '../components/code-panel/code-panel.utils/code-panel.utils';
import { BINARY_SEARCH_VARIANTS_CODE_VARIANTS } from './binary-search-variants-code';
import { BINARY_SEARCH_CODE_VARIANTS } from './binary-search-code';
import { LINEAR_SEARCH_CODE_VARIANTS } from './linear-search-code';

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

const SEARCHING_CODE_CASES = [
  [
    'linear-search',
    LINEAR_SEARCH_CODE_VARIANTS,
    'src/app/features/algorithms/algorithms/linear-search/linear-search.ts',
  ],
  [
    'binary-search',
    BINARY_SEARCH_CODE_VARIANTS,
    'src/app/features/algorithms/algorithms/binary-search/binary-search.ts',
  ],
  [
    'binary-search-variants',
    BINARY_SEARCH_VARIANTS_CODE_VARIANTS,
    'src/app/features/algorithms/algorithms/binary-search-variants/binary-search-variants.ts',
  ],
] as const;

describe('searching code variants', () => {
  it.each(SEARCHING_CODE_CASES)(
    'exposes every supported programming language for %s',
    (_algorithmId, variants) => {
      expect(Object.keys(variants).sort()).toEqual([...EXPECTED_LANGUAGES].sort());
    },
  );

  it.each(SEARCHING_CODE_CASES)(
    'resolves every active searching step to a non-empty code line for %s',
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
