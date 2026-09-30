import { SortStep } from '../../models/sort-step';

export type StepEventKind = 'start' | 'step' | 'compare' | 'swap' | 'settle' | 'pass' | 'complete';

export interface StepEvent {
  readonly index: number;
  readonly kind: StepEventKind;
  readonly detail: string;
  readonly pass: number;
}

export interface StepEventCounts {
  readonly comparisons: number;
  readonly swaps: number;
  readonly passes: number;
}

export function classifyStepEvents(history: readonly SortStep[]): readonly StepEvent[] {
  let pass = 0;
  return history.map((step, index) => {
    const kind = classify(step, history[index - 1] ?? null, index === history.length - 1, index);
    if (kind === 'pass') pass += 1;
    return { index, kind, detail: detailFor(step, kind), pass };
  });
}

export function countStepEvents(events: readonly StepEvent[], cursor: number): StepEventCounts {
  let comparisons = 0;
  let swaps = 0;
  let passes = 0;
  for (const event of events) {
    if (event.index > cursor) break;
    if (event.kind === 'compare') comparisons += 1;
    if (event.kind === 'swap') swaps += 1;
    if (event.kind === 'pass') passes += 1;
  }
  return { comparisons, swaps, passes };
}

function classify(step: SortStep, previous: SortStep | null, last: boolean, index: number): StepEventKind {
  if (index === 0) return 'start';
  if (step.swapping) return 'swap';
  if (step.comparing) return 'compare';
  if (last || step.phase === 'complete') return 'complete';
  const grew = previous !== null && step.sorted.length > previous.sorted.length;
  if (step.phase === 'pass-complete' || (grew && step.sorted.length < step.array.length)) return 'pass';
  if (grew) return 'settle';
  return 'step';
}

function detailFor(step: SortStep, kind: StepEventKind): string {
  if (kind === 'swap' && step.swapping) {
    const [left, right] = step.swapping;
    return `${step.array[right]}[${left}] ↔ ${step.array[left]}[${right}]`;
  }
  if (kind === 'compare' && step.comparing) {
    const [left, right] = step.comparing;
    return `${step.array[left]}[${left}] : ${step.array[right]}[${right}]`;
  }
  return '';
}
