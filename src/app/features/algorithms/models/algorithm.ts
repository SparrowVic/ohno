export enum Difficulty {
  Easy = 'easy',
  Medium = 'medium',
  Hard = 'hard',
  UltraHard = 'ultra-hard',
}

export interface ComplexityInfo {
  readonly timeBest: string;
  readonly timeAverage: string;
  readonly timeWorst: string;
  readonly space: string;
}

export interface AlgorithmItem {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly difficulty: Difficulty;
  readonly category: string;
  readonly subcategory: string;
  readonly tags: readonly string[];
  readonly complexity: ComplexityInfo;
  readonly implemented: boolean;
  readonly stable?: boolean;
  readonly inPlace?: boolean;
}
