import { describe, expect, it } from 'vitest';

import { ALGORITHM_CATALOG } from '../catalog';
import { CatalogPath } from '../paths/paths';
import { pathProgress } from './path-progress';

const resolve = (id: string) => ALGORITHM_CATALOG.find((item) => item.id === id);
const path: CatalogPath = {
  groupId: 'sorting',
  titleKey: 'x',
  steps: ['bubble-sort', 'insertion-sort', 'merge-sort', 'quick-sort'],
};

describe('pathProgress', () => {
  it('marks finished steps done and the first unfinished one current', () => {
    const view = pathProgress(path, resolve, new Set(['bubble-sort']));
    expect(view.doneCount).toBe(1);
    expect(view.total).toBe(4);
    expect(view.steps.map((step) => [step.index, step.done, step.current])).toEqual([
      [1, true, false], [2, false, true], [3, false, false], [4, false, false],
    ]);
    expect(view.steps[0].name).toBe('Bubble Sort');
  });

  it('has no current step once everything is finished', () => {
    const view = pathProgress(path, resolve, new Set(path.steps));
    expect(view.doneCount).toBe(4);
    expect(view.steps.every((step) => !step.current)).toBe(true);
  });

  it('drops steps whose algorithm no longer exists', () => {
    const view = pathProgress({ ...path, steps: ['bubble-sort', 'gone', 'merge-sort'] }, resolve, new Set());
    expect(view.steps.map((step) => step.id)).toEqual(['bubble-sort', 'merge-sort']);
    expect(view.total).toBe(2);
  });
});
