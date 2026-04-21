import { SortStep } from './sort-step';

export interface VisualizationRenderer {
  initialize(array: readonly number[]): void;
  render(step: SortStep): void;
  destroy(): void;
}

export type VisualizationVariant =
  | 'bar'
  | 'block'
  | 'search'
  | 'string'
  | 'dp'
  | 'grid'
  | 'matrix'
  | 'dsu'
  | 'dsu-graph'
  | 'network'
  | 'radix'
  | 'radix-strip'
  | 'radix-matrix'
  | 'dijkstra-graph'
  | 'convex-hull'
  | 'closest-pair'
  | 'line-intersection'
  | 'half-plane'
  | 'minkowski-sum'
  | 'sweep-line'
  | 'voronoi'
  | 'delaunay'
  | 'tree';
