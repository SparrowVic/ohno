import { SortStep } from './sort-step';

export interface VisualizationRenderer {
  initialize(array: readonly number[]): void;
  render(step: SortStep): void;
  destroy(): void;
}

export type VisualizationVariant =
  | 'bar'
  | 'block'
  | 'gradient'
  | 'dot'
  | 'radial'
  | 'sound'
  | 'search'
  | 'dp'
  | 'grid'
  | 'matrix'
  | 'dsu'
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
  | 'delaunay';
