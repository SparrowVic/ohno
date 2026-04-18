import { Injectable, Signal, signal } from '@angular/core';

import { SidebarFilter } from '../../../../core/models/navigation';
import { ALGORITHM_CATALOG } from '../../data/catalog/catalog';
import { AlgorithmItem, Difficulty } from '../../models/algorithm';

@Injectable({ providedIn: 'root' })
export class AlgorithmRegistry {
  private readonly itemsState = signal<readonly AlgorithmItem[]>([...ALGORITHM_CATALOG]);

  readonly all: Signal<readonly AlgorithmItem[]> = this.itemsState.asReadonly();

  getById(id: string): AlgorithmItem | undefined {
    return this.itemsState().find((item) => item.id === id);
  }

  filterByDifficulty(difficulty: Difficulty): readonly AlgorithmItem[] {
    return this.itemsState().filter((item) => item.difficulty === difficulty);
  }

  filter(filter?: SidebarFilter): readonly AlgorithmItem[] {
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
