export interface SidebarFilter {
  readonly category?: string;
  readonly subcategory?: string;
}

export interface SidebarItem {
  readonly id: string;
  readonly label: string;
  readonly count: number;
  readonly sectionTitle: string;
  readonly filter: SidebarFilter;
}

export interface SidebarGroup {
  readonly id: string;
  readonly label: string;
  readonly items: readonly SidebarItem[];
}
