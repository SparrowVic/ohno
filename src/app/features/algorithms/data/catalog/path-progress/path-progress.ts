import { AlgorithmItem } from '../../../models/algorithm';
import { CatalogPath } from '../paths/paths';

export interface PathStepView {
  readonly id: string;
  readonly name: string;
  readonly index: number;
  readonly done: boolean;
  readonly current: boolean;
}

export interface PathProgressView {
  readonly steps: readonly PathStepView[];
  readonly doneCount: number;
  readonly total: number;
}

export function pathProgress(
  path: CatalogPath,
  resolve: (id: string) => AlgorithmItem | undefined,
  finishedIds: ReadonlySet<string>,
): PathProgressView {
  const items = path.steps
    .map((id) => resolve(id))
    .filter((item): item is AlgorithmItem => item !== undefined);
  const currentIndex = items.findIndex((item) => !finishedIds.has(item.id));
  const steps = items.map((item, position) => ({
    id: item.id,
    name: item.name,
    index: position + 1,
    done: finishedIds.has(item.id),
    current: position === currentIndex,
  }));
  return { steps, doneCount: steps.filter((step) => step.done).length, total: steps.length };
}
