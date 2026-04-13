import { Difficulty } from '../../algorithms/models/algorithm';

export interface StructureItem {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly difficulty: Difficulty;
  readonly category: string;
  readonly subcategory: string;
  readonly tags: readonly string[];
  readonly implemented: boolean;
}
