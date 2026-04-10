export type NavTabId = 'algorithms' | 'structures' | 'playground';

export interface NavTab {
  readonly id: NavTabId;
  readonly label: string;
  readonly path: string;
}

export interface SidebarItem {
  readonly id: string;
  readonly label: string;
  readonly count: number;
}

export interface SidebarGroup {
  readonly id: string;
  readonly label: string;
  readonly items: readonly SidebarItem[];
}
