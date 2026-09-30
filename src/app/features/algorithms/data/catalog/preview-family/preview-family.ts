import { AlgorithmItem } from '../../../models/algorithm';

export type PreviewFamily = 'bars' | 'buckets' | 'graph' | 'matrix' | 'tape' | 'notebook' | 'xy' | 'stack';

const CATEGORY_FAMILY: Readonly<Record<string, PreviewFamily>> = {
  sorting: 'bars',
  searching: 'bars',
  trees: 'graph',
  graphs: 'graph',
  dp: 'matrix',
  strings: 'tape',
  geometry: 'xy',
  misc: 'stack',
};

export function previewFamily(item: AlgorithmItem): PreviewFamily {
  if (item.category === 'sorting' && item.subcategory === 'non-comparison') return 'buckets';
  if (item.category === 'misc' && item.subcategory === 'math') return 'notebook';
  return CATEGORY_FAMILY[item.category] ?? 'stack';
}
