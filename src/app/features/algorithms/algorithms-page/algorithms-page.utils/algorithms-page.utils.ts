import {
  ALGORITHM_TRAIT_GROUPS,
  ALGORITHM_TRAITS,
  AlgorithmTraitGroupId,
  AlgorithmTraitId,
  deriveAlgorithmTraits,
} from '../../algorithm-traits/algorithm-traits';
import { AlgorithmItem } from '../../models/algorithm';

export interface PageStat {
  readonly value: string;
  readonly label: string;
  readonly tone: 'accent' | 'success' | 'neutral';
}

export interface TraitOptionView {
  readonly id: AlgorithmTraitId;
  readonly label: string;
  readonly count: number;
  readonly selected: boolean;
}

export interface TraitGroupView {
  readonly id: AlgorithmTraitGroupId;
  readonly label: string;
  readonly options: readonly TraitOptionView[];
}

type TranslateFn = (key: string, params?: Record<string, string | number>) => string;

const TRAIT_DEFINITION_BY_ID = new Map(ALGORITHM_TRAITS.map((trait) => [trait.id, trait] as const));

export function buildTraitCounts(
  items: readonly AlgorithmItem[],
): ReadonlyMap<AlgorithmTraitId, number> {
  const counts = new Map<AlgorithmTraitId, number>();

  for (const item of items) {
    for (const trait of deriveAlgorithmTraits(item)) {
      counts.set(trait, (counts.get(trait) ?? 0) + 1);
    }
  }

  return counts;
}

export function buildTraitGroupsView(
  selectedTraits: readonly AlgorithmTraitId[],
  counts: ReadonlyMap<AlgorithmTraitId, number>,
  translate: TranslateFn,
): readonly TraitGroupView[] {
  const selected = new Set(selectedTraits);

  return ALGORITHM_TRAIT_GROUPS.map((group) => {
    const options = ALGORITHM_TRAITS.filter((trait) => trait.group === group.id)
      .map<TraitOptionView>((trait) => ({
        id: trait.id,
        label: translate(trait.labelKey),
        count: counts.get(trait.id) ?? 0,
        selected: selected.has(trait.id),
      }))
      .filter((option) => option.count > 0 || option.selected);

    return {
      id: group.id,
      label: translate(group.labelKey),
      options,
    };
  }).filter((group) => group.options.length > 0);
}

export function groupSelectedTraits(
  selectedTraits: readonly AlgorithmTraitId[],
): ReadonlyMap<AlgorithmTraitGroupId, ReadonlySet<AlgorithmTraitId>> {
  const grouped = new Map<AlgorithmTraitGroupId, Set<AlgorithmTraitId>>();

  for (const traitId of selectedTraits) {
    const definition = TRAIT_DEFINITION_BY_ID.get(traitId);
    if (!definition) {
      continue;
    }

    const bucket = grouped.get(definition.group) ?? new Set<AlgorithmTraitId>();
    bucket.add(traitId);
    grouped.set(definition.group, bucket);
  }

  return grouped;
}

export function filterItemsByTraits(
  items: readonly AlgorithmItem[],
  groupedTraits: ReadonlyMap<AlgorithmTraitGroupId, ReadonlySet<AlgorithmTraitId>>,
): readonly AlgorithmItem[] {
  if (groupedTraits.size === 0) {
    return items;
  }

  return items.filter((item) => {
    const itemTraits = new Set(deriveAlgorithmTraits(item));

    for (const traitIds of groupedTraits.values()) {
      let matchedGroup = false;

      for (const traitId of traitIds) {
        if (itemTraits.has(traitId)) {
          matchedGroup = true;
          break;
        }
      }

      if (!matchedGroup) {
        return false;
      }
    }

    return true;
  });
}

export function buildPageStats(
  totalItems: number,
  implementedCount: number,
  trackCount: number,
  translate: TranslateFn,
): readonly PageStat[] {
  return [
    {
      value: String(totalItems),
      label: translate('features.algorithms.page.stats.visibleNow'),
      tone: 'accent',
    },
    {
      value: String(implementedCount),
      label: translate('features.algorithms.page.stats.interactive'),
      tone: 'success',
    },
    {
      value: String(trackCount),
      label: translate('features.algorithms.page.stats.tracks'),
      tone: 'neutral',
    },
  ];
}
