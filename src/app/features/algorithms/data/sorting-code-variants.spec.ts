import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import { resolveActiveCodeLine } from '../components/code-panel/code-panel.utils/code-panel.utils';
import { BUBBLE_SORT_CODE_VARIANTS } from './bubble-sort-code';
import { BUCKET_SORT_CODE_VARIANTS } from './bucket-sort-code';
import { COUNTING_SORT_CODE_VARIANTS } from './counting-sort-code';
import { HEAP_SORT_CODE_VARIANTS } from './heap-sort-code';
import { INSERTION_SORT_CODE_VARIANTS } from './insertion-sort-code';
import { MERGE_SORT_CODE_VARIANTS } from './merge-sort-code';
import { QUICK_SORT_CODE_VARIANTS } from './quick-sort-code';
import { RADIX_SORT_CODE_VARIANTS } from './radix-sort-code';
import { SELECTION_SORT_CODE_VARIANTS } from './selection-sort-code';
import { SHELL_SORT_CODE_VARIANTS } from './shell-sort-code';
import { TIM_SORT_CODE_VARIANTS } from './tim-sort-code';

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

const SORTING_CODE_CASES = [
  [
    'bubble-sort',
    BUBBLE_SORT_CODE_VARIANTS,
    'src/app/features/algorithms/algorithms/bubble-sort.ts',
  ],
  [
    'bucket-sort',
    BUCKET_SORT_CODE_VARIANTS,
    'src/app/features/algorithms/algorithms/bucket-sort.ts',
  ],
  [
    'counting-sort',
    COUNTING_SORT_CODE_VARIANTS,
    'src/app/features/algorithms/algorithms/counting-sort.ts',
  ],
  ['heap-sort', HEAP_SORT_CODE_VARIANTS, 'src/app/features/algorithms/algorithms/heap-sort.ts'],
  [
    'insertion-sort',
    INSERTION_SORT_CODE_VARIANTS,
    'src/app/features/algorithms/algorithms/insertion-sort.ts',
  ],
  ['merge-sort', MERGE_SORT_CODE_VARIANTS, 'src/app/features/algorithms/algorithms/merge-sort.ts'],
  ['quick-sort', QUICK_SORT_CODE_VARIANTS, 'src/app/features/algorithms/algorithms/quick-sort.ts'],
  ['radix-sort', RADIX_SORT_CODE_VARIANTS, 'src/app/features/algorithms/algorithms/radix-sort.ts'],
  [
    'selection-sort',
    SELECTION_SORT_CODE_VARIANTS,
    'src/app/features/algorithms/algorithms/selection-sort.ts',
  ],
  ['shell-sort', SHELL_SORT_CODE_VARIANTS, 'src/app/features/algorithms/algorithms/shell-sort.ts'],
  ['tim-sort', TIM_SORT_CODE_VARIANTS, 'src/app/features/algorithms/algorithms/tim-sort.ts'],
] as const;

describe('sorting code variants', () => {
  it.each(SORTING_CODE_CASES)(
    'exposes every supported programming language for %s',
    (_algorithmId, variants) => {
      expect(Object.keys(variants).sort()).toEqual([...EXPECTED_LANGUAGES].sort());
    },
  );

  it.each(SORTING_CODE_CASES)(
    'resolves every active sorting step to a non-empty code line for %s',
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
