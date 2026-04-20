import { describe, expect, it } from 'vitest';

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

describe('sorting code variants', () => {
  it.each([
    ['bubble-sort', BUBBLE_SORT_CODE_VARIANTS],
    ['bucket-sort', BUCKET_SORT_CODE_VARIANTS],
    ['counting-sort', COUNTING_SORT_CODE_VARIANTS],
    ['heap-sort', HEAP_SORT_CODE_VARIANTS],
    ['insertion-sort', INSERTION_SORT_CODE_VARIANTS],
    ['merge-sort', MERGE_SORT_CODE_VARIANTS],
    ['quick-sort', QUICK_SORT_CODE_VARIANTS],
    ['radix-sort', RADIX_SORT_CODE_VARIANTS],
    ['selection-sort', SELECTION_SORT_CODE_VARIANTS],
    ['shell-sort', SHELL_SORT_CODE_VARIANTS],
    ['tim-sort', TIM_SORT_CODE_VARIANTS],
  ])('exposes every supported programming language for %s', (_algorithmId, variants) => {
    expect(Object.keys(variants).sort()).toEqual([...EXPECTED_LANGUAGES].sort());
  });
});
