import { Injectable, Signal, signal } from '@angular/core';

import { SidebarFilter } from '../../../core/models/navigation';
import { STRUCTURE_CATALOG } from '../data/catalog';
import { StructureItem } from '../models/structure';

@Injectable({ providedIn: 'root' })
export class StructureRegistry {
  private readonly itemsState = signal<readonly StructureItem[]>([...STRUCTURE_CATALOG]);

  readonly all: Signal<readonly StructureItem[]> = this.itemsState.asReadonly();

  filter(filter?: SidebarFilter): readonly StructureItem[] {
    return this.itemsState().filter((item) => {
      if (!filter?.category) return true;
      if (item.category !== filter.category) return false;
      if (filter.subcategory && item.subcategory !== filter.subcategory) return false;
      return true;
    });
  }

  count(filter?: SidebarFilter): number {
    return this.filter(filter).length;
  }
}
