import { describe, expect, it } from 'vitest';

import { SidebarGroup } from '../../models/navigation';
import { buildBankRows } from './bank-rows.utils';

const groups: readonly SidebarGroup[] = [
  { id: 'overview', label: 'Przeglądaj', items: [{ id: 'all-algorithms', label: 'Wszystkie algorytmy', count: 102, sectionTitle: '', filter: {} }] },
  {
    id: 'sorting',
    label: 'Sortowanie',
    items: [
      { id: 'all-sorting', label: 'Wszystkie', count: 11, sectionTitle: '', filter: { category: 'sorting' } },
      { id: 'comparison', label: 'Porównawcze', count: 8, sectionTitle: '', filter: { category: 'sorting', subcategory: 'comparison' } },
    ],
  },
];

describe('buildBankRows', () => {
  it('makes one row per group pointing at its first item, with the overview relabelled', () => {
    const rows = buildBankRows(groups, 'sorting', 'Wszystkie');
    expect(rows).toEqual([
      { groupId: 'overview', itemId: 'all-algorithms', label: 'Wszystkie', count: 102, active: false },
      { groupId: 'sorting', itemId: 'all-sorting', label: 'Sortowanie', count: 11, active: true },
    ]);
  });

  it('skips a group without items', () => {
    expect(buildBankRows([{ id: 'empty', label: 'x', items: [] }], 'empty', 'All')).toEqual([]);
  });
});
