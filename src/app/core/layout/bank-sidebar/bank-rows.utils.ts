import { SidebarGroup } from '../../models/navigation';

export interface BankRow {
  readonly groupId: string;
  readonly itemId: string;
  readonly label: string;
  readonly count: number;
  readonly active: boolean;
}

const OVERVIEW_GROUP_ID = 'overview';

export function buildBankRows(
  groups: readonly SidebarGroup[],
  activeGroupId: string,
  allLabel: string,
): readonly BankRow[] {
  return groups.flatMap((group) => {
    const first = group.items[0];
    if (!first) return [];
    return [{
      groupId: group.id,
      itemId: first.id,
      label: group.id === OVERVIEW_GROUP_ID ? allLabel : group.label,
      count: first.count,
      active: group.id === activeGroupId,
    }];
  });
}
