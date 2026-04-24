export interface FloydWarshallScenario {
  readonly kind: 'floyd-warshall';
  readonly labels: readonly string[];
  readonly matrix: readonly (readonly (number | null)[])[];
}

export interface HungarianScenario {
  readonly kind: 'hungarian';
  readonly rowLabels: readonly string[];
  readonly colLabels: readonly string[];
  readonly costs: readonly (readonly number[])[];
}

export function createFloydWarshallScenario(size: number): FloydWarshallScenario {
  return size >= 6 ? largeFloydScenario() : compactFloydScenario();
}

export function createHungarianScenario(size: number): HungarianScenario {
  return size >= 5 ? largeHungarianScenario() : compactHungarianScenario();
}

function compactFloydScenario(): FloydWarshallScenario {
  return {
    kind: 'floyd-warshall',
    labels: ['A', 'B', 'C', 'D', 'E'],
    matrix: [
      [0, 3, 8, null, 7],
      [8, 0, 2, 5, null],
      [5, null, 0, 1, null],
      [2, null, null, 0, 1],
      [null, null, 3, 2, 0],
    ],
  };
}

function largeFloydScenario(): FloydWarshallScenario {
  return {
    kind: 'floyd-warshall',
    labels: ['A', 'B', 'C', 'D', 'E', 'F'],
    matrix: [
      [0, 4, null, 10, null, null],
      [null, 0, 3, null, 7, null],
      [2, null, 0, 1, null, 8],
      [null, null, null, 0, 2, 3],
      [null, null, 1, null, 0, 2],
      [5, null, null, null, null, 0],
    ],
  };
}

function compactHungarianScenario(): HungarianScenario {
  return {
    kind: 'hungarian',
    rowLabels: ['Ava', 'Ben', 'Cara', 'Dean'],
    colLabels: ['UI', 'API', 'DB', 'QA'],
    costs: [
      [9, 2, 7, 8],
      [6, 4, 3, 7],
      [5, 8, 1, 8],
      [7, 6, 9, 4],
    ],
  };
}

function largeHungarianScenario(): HungarianScenario {
  return {
    kind: 'hungarian',
    rowLabels: ['Ava', 'Ben', 'Cara', 'Dean', 'Eli'],
    colLabels: ['UI', 'API', 'DB', 'QA', 'Ops'],
    costs: [
      [14, 5, 8, 7, 15],
      [2, 12, 6, 5, 3],
      [7, 8, 3, 9, 7],
      [2, 4, 6, 10, 1],
      [8, 6, 7, 4, 9],
    ],
  };
}
