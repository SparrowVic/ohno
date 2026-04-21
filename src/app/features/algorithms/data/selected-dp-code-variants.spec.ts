import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import { resolveActiveCodeLine } from '../components/code-panel/code-panel.utils/code-panel.utils';
import { BURST_BALLOONS_CODE_VARIANTS } from './burst-balloons-code';
import { CLIMBING_STAIRS_CODE_VARIANTS } from './climbing-stairs-code';
import { COIN_CHANGE_CODE_VARIANTS } from './coin-change-code';
import { DIVIDE_CONQUER_DP_OPTIMIZATION_CODE_VARIANTS } from './divide-conquer-dp-optimization-code';
import { DP_CONVEX_HULL_TRICK_CODE_VARIANTS } from './dp-convex-hull-trick-code';
import { DP_ON_TREES_CODE_VARIANTS } from './dp-on-trees-code';
import { DP_WITH_BITMASK_CODE_VARIANTS } from './dp-with-bitmask-code';
import { EDIT_DISTANCE_CODE_VARIANTS } from './edit-distance-code';
import { FIBONACCI_DP_CODE_VARIANTS } from './fibonacci-dp-code';
import { KNAPSACK_01_CODE_VARIANTS } from './knapsack-01-code';
import { KNUTH_DP_OPTIMIZATION_CODE_VARIANTS } from './knuth-dp-optimization-code';
import { LONGEST_COMMON_SUBSEQUENCE_CODE_VARIANTS } from './longest-common-subsequence-code';
import { LONGEST_INCREASING_SUBSEQUENCE_CODE_VARIANTS } from './longest-increasing-subsequence-code';
import { LONGEST_PALINDROMIC_SUBSEQUENCE_CODE_VARIANTS } from './longest-palindromic-subsequence-code';
import { MATRIX_CHAIN_MULTIPLICATION_CODE_VARIANTS } from './matrix-chain-multiplication-code';
import { PROFILE_DP_CODE_VARIANTS } from './profile-dp-code';
import { REGEX_MATCHING_DP_CODE_VARIANTS } from './regex-matching-dp-code';
import { SOS_DP_CODE_VARIANTS } from './sos-dp-code';
import { SUBSET_SUM_CODE_VARIANTS } from './subset-sum-code';
import { TRAVELING_SALESMAN_DP_CODE_VARIANTS } from './traveling-salesman-dp-code';
import { WILDCARD_MATCHING_CODE_VARIANTS } from './wildcard-matching-code';

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

const DP_CODE_CASES = [
  [
    'knapsack-01',
    KNAPSACK_01_CODE_VARIANTS,
    'src/app/features/algorithms/algorithms/knapsack-01/knapsack-01.ts',
  ],
  [
    'longest-common-subsequence',
    LONGEST_COMMON_SUBSEQUENCE_CODE_VARIANTS,
    'src/app/features/algorithms/algorithms/longest-common-subsequence/longest-common-subsequence.ts',
  ],
  [
    'longest-increasing-subsequence',
    LONGEST_INCREASING_SUBSEQUENCE_CODE_VARIANTS,
    'src/app/features/algorithms/algorithms/longest-increasing-subsequence/longest-increasing-subsequence.ts',
  ],
  [
    'coin-change',
    COIN_CHANGE_CODE_VARIANTS,
    'src/app/features/algorithms/algorithms/coin-change/coin-change.ts',
  ],
  [
    'edit-distance',
    EDIT_DISTANCE_CODE_VARIANTS,
    'src/app/features/algorithms/algorithms/edit-distance/edit-distance.ts',
  ],
  [
    'climbing-stairs',
    CLIMBING_STAIRS_CODE_VARIANTS,
    'src/app/features/algorithms/algorithms/climbing-stairs/climbing-stairs.ts',
  ],
  [
    'matrix-chain-multiplication',
    MATRIX_CHAIN_MULTIPLICATION_CODE_VARIANTS,
    'src/app/features/algorithms/algorithms/matrix-chain-multiplication/matrix-chain-multiplication.ts',
  ],
  [
    'fibonacci-dp',
    FIBONACCI_DP_CODE_VARIANTS,
    'src/app/features/algorithms/algorithms/fibonacci-dp/fibonacci-dp.ts',
  ],
  [
    'dp-on-trees',
    DP_ON_TREES_CODE_VARIANTS,
    'src/app/features/algorithms/algorithms/dp-on-trees.ts',
  ],
  [
    'dp-with-bitmask',
    DP_WITH_BITMASK_CODE_VARIANTS,
    'src/app/features/algorithms/algorithms/dp-with-bitmask.ts',
  ],
  [
    'longest-palindromic-subsequence',
    LONGEST_PALINDROMIC_SUBSEQUENCE_CODE_VARIANTS,
    'src/app/features/algorithms/algorithms/longest-palindromic-subsequence/longest-palindromic-subsequence.ts',
  ],
  [
    'traveling-salesman-dp',
    TRAVELING_SALESMAN_DP_CODE_VARIANTS,
    'src/app/features/algorithms/algorithms/traveling-salesman-dp.ts',
  ],
  [
    'subset-sum',
    SUBSET_SUM_CODE_VARIANTS,
    'src/app/features/algorithms/algorithms/subset-sum/subset-sum.ts',
  ],
  [
    'burst-balloons',
    BURST_BALLOONS_CODE_VARIANTS,
    'src/app/features/algorithms/algorithms/burst-balloons/burst-balloons.ts',
  ],
  [
    'regex-matching-dp',
    REGEX_MATCHING_DP_CODE_VARIANTS,
    'src/app/features/algorithms/algorithms/regex-matching-dp/regex-matching-dp.ts',
  ],
  [
    'wildcard-matching',
    WILDCARD_MATCHING_CODE_VARIANTS,
    'src/app/features/algorithms/algorithms/wildcard-matching/wildcard-matching.ts',
  ],
  [
    'dp-convex-hull-trick',
    DP_CONVEX_HULL_TRICK_CODE_VARIANTS,
    'src/app/features/algorithms/algorithms/dp-convex-hull-trick.ts',
  ],
  [
    'divide-conquer-dp-optimization',
    DIVIDE_CONQUER_DP_OPTIMIZATION_CODE_VARIANTS,
    'src/app/features/algorithms/algorithms/divide-conquer-dp-optimization.ts',
  ],
  [
    'knuth-dp-optimization',
    KNUTH_DP_OPTIMIZATION_CODE_VARIANTS,
    'src/app/features/algorithms/algorithms/knuth-dp-optimization.ts',
  ],
  ['sos-dp', SOS_DP_CODE_VARIANTS, 'src/app/features/algorithms/algorithms/sos-dp.ts'],
  ['profile-dp', PROFILE_DP_CODE_VARIANTS, 'src/app/features/algorithms/algorithms/profile-dp.ts'],
] as const;

describe('dynamic-programming code variants', () => {
  it.each(DP_CODE_CASES)(
    'exposes every supported programming language for %s',
    (_algorithmId, variants) => {
      expect(Object.keys(variants).sort()).toEqual([...EXPECTED_LANGUAGES].sort());
    },
  );

  it.each(DP_CODE_CASES)(
    'resolves every active DP step to a non-empty code line for %s',
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
