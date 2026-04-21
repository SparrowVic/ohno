import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import { resolveActiveCodeLine } from '../components/code-panel/code-panel.utils/code-panel.utils';
import { CLOSEST_PAIR_OF_POINTS_CODE_VARIANTS } from './closest-pair-of-points-code';
import { CONVEX_HULL_CODE_VARIANTS } from './convex-hull-code';
import { DELAUNAY_TRIANGULATION_CODE_VARIANTS } from './delaunay-triangulation-code';
import { HALF_PLANE_INTERSECTION_CODE_VARIANTS } from './half-plane-intersection-code';
import { LINE_INTERSECTION_CODE_VARIANTS } from './line-intersection-code';
import { MINKOWSKI_SUM_CODE_VARIANTS } from './minkowski-sum-code';
import { SWEEP_LINE_CODE_VARIANTS } from './sweep-line-code';
import { VORONOI_DIAGRAM_CODE_VARIANTS } from './voronoi-diagram-code';

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

const GEOMETRY_CODE_CASES = [
  [
    'convex-hull',
    CONVEX_HULL_CODE_VARIANTS,
    'src/app/features/algorithms/algorithms/convex-hull.ts',
  ],
  [
    'line-intersection',
    LINE_INTERSECTION_CODE_VARIANTS,
    'src/app/features/algorithms/algorithms/line-intersection.ts',
  ],
  [
    'closest-pair-of-points',
    CLOSEST_PAIR_OF_POINTS_CODE_VARIANTS,
    'src/app/features/algorithms/algorithms/closest-pair-of-points.ts',
  ],
  ['sweep-line', SWEEP_LINE_CODE_VARIANTS, 'src/app/features/algorithms/algorithms/sweep-line.ts'],
  [
    'voronoi-diagram',
    VORONOI_DIAGRAM_CODE_VARIANTS,
    'src/app/features/algorithms/algorithms/voronoi-diagram.ts',
  ],
  [
    'delaunay-triangulation',
    DELAUNAY_TRIANGULATION_CODE_VARIANTS,
    'src/app/features/algorithms/algorithms/delaunay-triangulation.ts',
  ],
  [
    'minkowski-sum',
    MINKOWSKI_SUM_CODE_VARIANTS,
    'src/app/features/algorithms/algorithms/minkowski-sum.ts',
  ],
  [
    'half-plane-intersection',
    HALF_PLANE_INTERSECTION_CODE_VARIANTS,
    'src/app/features/algorithms/algorithms/half-plane-intersection.ts',
  ],
] as const;

describe('geometry code variants', () => {
  it.each(GEOMETRY_CODE_CASES)(
    'exposes every supported programming language for %s',
    (_algorithmId, variants) => {
      expect(Object.keys(variants).sort()).toEqual([...EXPECTED_LANGUAGES].sort());
    },
  );

  it.each(GEOMETRY_CODE_CASES)(
    'resolves every active geometry step to a non-empty code line for %s',
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
