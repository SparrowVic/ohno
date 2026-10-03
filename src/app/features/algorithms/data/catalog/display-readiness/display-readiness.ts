import type { VisualizationVariant } from '../../../models/visualization-renderer';

export const REBUILT_DISPLAY_VARIANTS: ReadonlySet<VisualizationVariant> = new Set<VisualizationVariant>([
  'bar',
  'block',
  'radix',
  'radix-strip',
  'radix-matrix',
  'tree',
  'dijkstra-graph',
  'dsu-graph',
  'dsu',
  'network',
  'dp',
  'grid',
  'matrix',
  'matrix-grid',
  'sieve-grid',
  'search',
  'pointer-lab',
  'string',
]);

export const PENDING_DISPLAY_IDS: ReadonlySet<string> = new Set<string>([
  'convex-hull',
  'line-intersection',
  'closest-pair-of-points',
  'sweep-line',
  'voronoi-diagram',
  'delaunay-triangulation',
  'minkowski-sum',
  'half-plane-intersection',
  'fibonacci-iterative',
  'factorial',
  'euclidean-gcd',
  'backtracking',
  'recursion-call-stack',
  'minimax-alpha-beta',
  'monte-carlo-tree-search',
  'reservoir-sampling',
  'fft-ntt',
  'gaussian-elimination',
  'simplex-algorithm',
  'miller-rabin',
  'pollards-rho',
  'chinese-remainder-theorem',
  'extended-euclidean',
]);

export function isDisplayReady(algorithmId: string): boolean {
  return !PENDING_DISPLAY_IDS.has(algorithmId);
}
