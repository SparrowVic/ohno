import { Injectable, Signal, signal } from '@angular/core';

import { SORTING_ALGORITHMS } from '../data/sorting';
import { AlgorithmItem, Difficulty } from '../models/algorithm';

@Injectable({ providedIn: 'root' })
export class AlgorithmRegistry {
  private readonly itemsState = signal<readonly AlgorithmItem[]>([...SORTING_ALGORITHMS]);

  readonly all: Signal<readonly AlgorithmItem[]> = this.itemsState.asReadonly();

  getById(id: string): AlgorithmItem | undefined {
    return this.itemsState().find((item) => item.id === id);
  }

  filterByDifficulty(difficulty: Difficulty): readonly AlgorithmItem[] {
    return this.itemsState().filter((item) => item.difficulty === difficulty);
  }

  filterByCategory(category: string, subcategory?: string): readonly AlgorithmItem[] {
    return this.itemsState().filter((item) => {
      if (item.category !== category) return false;
      if (subcategory && item.subcategory !== subcategory) return false;
      return true;
    });
  }
}
