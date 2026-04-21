import { LegendItem } from '../../models/detail';

export const DEFAULT_SORTING_LEGEND: readonly LegendItem[] = [
  { label: 'Unsorted', color: 'var(--viz-state-default)', opacity: 0.55 },
  { label: 'Comparing', color: 'var(--viz-state-compare)' },
  { label: 'Swapping', color: 'var(--viz-state-swap)' },
  { label: 'Sorted', color: 'var(--viz-state-sorted)' },
  { label: 'Pivot', color: 'var(--chrome-accent)' },
];
