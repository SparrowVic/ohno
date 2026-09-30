import { SidebarFilter, SidebarGroup } from '../../../core/models/navigation';
import { filterByDifficulty } from '../data/catalog/difficulty-filter/difficulty-filter';
import { AlgorithmItem, Difficulty } from '../models/algorithm';

export interface CatalogGroupView {
  readonly id: string;
  readonly label: string;
  readonly items: readonly AlgorithmItem[];
}

export interface MarqueeStat {
  readonly label: string;
  readonly value: number;
}

export interface MarqueeLabels {
  readonly modules: string;
  readonly categories: string;
  readonly groups: string;
}

const OVERVIEW_GROUP_ID = 'overview';

export function buildCatalogGroups(
  groups: readonly SidebarGroup[],
  activeItemKey: string,
  resolve: (filter: SidebarFilter) => readonly AlgorithmItem[],
  active: ReadonlySet<Difficulty>,
): readonly CatalogGroupView[] {
  const [groupId, itemId] = activeItemKey.split(':');
  const group = groups.find((candidate) => candidate.id === groupId);
  const sources =
    groupId === OVERVIEW_GROUP_ID || !group
      ? groups.filter((candidate) => candidate.id !== OVERVIEW_GROUP_ID).flatMap((candidate) => {
          const first = candidate.items[0];
          return first ? [{ id: candidate.id, label: candidate.label, filter: first.filter }] : [];
        })
      : itemId === group.items[0]?.id
        ? group.items.slice(1).map((item) => ({ id: item.id, label: item.label, filter: item.filter }))
        : group.items.filter((item) => item.id === itemId).map((item) => ({ id: item.id, label: item.label, filter: item.filter }));

  return sources
    .map((source) => ({ id: source.id, label: source.label, items: filterByDifficulty(resolve(source.filter), active) }))
    .filter((view) => view.items.length > 0);
}

export function buildMarqueeStats(
  groups: readonly SidebarGroup[],
  activeGroupId: string,
  labels: MarqueeLabels,
): readonly MarqueeStat[] {
  const banks = groups.filter((group) => group.id !== OVERVIEW_GROUP_ID);
  if (activeGroupId === OVERVIEW_GROUP_ID) {
    const overview = groups.find((group) => group.id === OVERVIEW_GROUP_ID);
    return [
      { label: labels.modules, value: overview?.items[0]?.count ?? 0 },
      { label: labels.categories, value: banks.length },
      { label: labels.groups, value: banks.reduce((sum, bank) => sum + Math.max(bank.items.length - 1, 0), 0) },
    ];
  }
  const bank = banks.find((group) => group.id === activeGroupId);
  if (!bank) return [];
  const [all, ...subcategories] = bank.items;
  return [
    { label: labels.modules, value: all?.count ?? 0 },
    ...subcategories.map((item) => ({ label: item.label, value: item.count })),
  ];
}

export function bankIndex(groups: readonly SidebarGroup[], activeGroupId: string): string | null {
  const banks = groups.filter((group) => group.id !== OVERVIEW_GROUP_ID);
  const position = banks.findIndex((group) => group.id === activeGroupId);
  return position === -1 ? null : String(position + 1).padStart(2, '0');
}
