import { AlgorithmItem } from '../../../models/algorithm';

export const MODULE_FAMILY_PREFIX: Readonly<Record<string, string>> = {
  sorting: 'SRT',
  searching: 'SRC',
  trees: 'TRE',
  graphs: 'GRF',
  dp: 'DYN',
  strings: 'STR',
  geometry: 'GEO',
  misc: 'MSC',
};

const FALLBACK_PREFIX = 'MOD';

export function moduleId(item: AlgorithmItem, catalog: readonly AlgorithmItem[]): string {
  const prefix = MODULE_FAMILY_PREFIX[item.category] ?? FALLBACK_PREFIX;
  const siblings = catalog.filter((entry) => entry.category === item.category);
  const index = siblings.findIndex((entry) => entry.id === item.id) + 1;
  return `${prefix}-${String(index).padStart(2, '0')}`;
}
