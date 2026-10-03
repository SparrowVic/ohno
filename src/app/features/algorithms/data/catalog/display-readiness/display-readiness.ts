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
  'call-stack-lab',
  'call-tree-lab',
  'scratchpad-lab',
  'number-lab',
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
]);

export function isDisplayReady(algorithmId: string): boolean {
  return !PENDING_DISPLAY_IDS.has(algorithmId);
}
