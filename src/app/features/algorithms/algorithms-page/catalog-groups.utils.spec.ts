import { describe, expect, it } from 'vitest';

import { SidebarFilter, SidebarGroup } from '../../../core/models/navigation';
import { ALGORITHM_CATALOG } from '../data/catalog/catalog';
import { ALL_DIFFICULTIES } from '../data/catalog/difficulty-filter/difficulty-filter';
import { Difficulty } from '../models/algorithm';
import { buildCatalogGroups, buildMarqueeStats, bankIndex } from './catalog-groups.utils';

const item = (id: string, label: string, filter: SidebarFilter, count: number) => ({ id, label, count, sectionTitle: '', filter });
const groups: readonly SidebarGroup[] = [
  { id: 'overview', label: 'Przeglądaj', items: [item('all-algorithms', 'Wszystkie', {}, 102)] },
  { id: 'sorting', label: 'Sortowanie', items: [item('all-sorting', 'Wszystkie', { category: 'sorting' }, 11), item('comparison', 'Porównawcze', { category: 'sorting', subcategory: 'comparison' }, 8), item('non-comparison', 'Nieporównawcze', { category: 'sorting', subcategory: 'non-comparison' }, 3)] },
  { id: 'searching', label: 'Wyszukiwanie', items: [item('all-searching', 'Wszystkie', { category: 'searching' }, 3), item('array-search', 'Liniowe', { category: 'searching', subcategory: 'array' }, 1), item('binary-search', 'Binarne', { category: 'searching', subcategory: 'binary' }, 2)] },
];
const resolve = (filter: SidebarFilter) =>
  ALGORITHM_CATALOG.filter((entry) => (!filter.category || entry.category === filter.category) && (!filter.subcategory || entry.subcategory === filter.subcategory));

describe('buildCatalogGroups', () => {
  it('renders one group per subcategory for a bank', () => {
    const view = buildCatalogGroups(groups, 'sorting:all-sorting', resolve, ALL_DIFFICULTIES);
    expect(view.map((group) => [group.id, group.label, group.items.length])).toEqual([['comparison', 'Porównawcze', 8], ['non-comparison', 'Nieporównawcze', 3]]);
  });

  it('renders one group per bank for the overview', () => {
    const view = buildCatalogGroups(groups, 'overview:all-algorithms', resolve, ALL_DIFFICULTIES);
    expect(view.map((group) => [group.id, group.items.length])).toEqual([['sorting', 11], ['searching', 3]]);
  });

  it('renders a single group when a subcategory is active through the URL', () => {
    const view = buildCatalogGroups(groups, 'sorting:comparison', resolve, ALL_DIFFICULTIES);
    expect(view.map((group) => group.id)).toEqual(['comparison']);
  });

  it('applies the difficulty latches and drops empty groups', () => {
    const view = buildCatalogGroups(groups, 'sorting:all-sorting', resolve, new Set([Difficulty.Easy]));
    expect(view.map((group) => [group.id, group.items.length])).toEqual([['comparison', 3], ['non-comparison', 1]]);
    expect(buildCatalogGroups(groups, 'sorting:all-sorting', resolve, new Set())).toEqual([]);
  });
});

describe('buildMarqueeStats and bankIndex', () => {
  const labels = { modules: 'Modułów', categories: 'Kategorii', groups: 'Grup' };

  it('lists modules and one stat per subcategory for a bank', () => {
    expect(buildMarqueeStats(groups, 'sorting', labels)).toEqual([
      { label: 'Modułów', value: 11 }, { label: 'Porównawcze', value: 8 }, { label: 'Nieporównawcze', value: 3 },
    ]);
    expect(bankIndex(groups, 'sorting')).toBe('01');
    expect(bankIndex(groups, 'searching')).toBe('02');
  });

  it('lists modules, banks and groups for the overview', () => {
    expect(buildMarqueeStats(groups, 'overview', labels)).toEqual([
      { label: 'Modułów', value: 102 }, { label: 'Kategorii', value: 2 }, { label: 'Grup', value: 4 },
    ]);
    expect(bankIndex(groups, 'overview')).toBeNull();
  });
});
