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
  | 'radix'
  | 'radix-strip'
  | 'radix-matrix';
