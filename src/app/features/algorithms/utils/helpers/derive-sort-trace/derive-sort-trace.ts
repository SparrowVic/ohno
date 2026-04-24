import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import { SortPhase, SortStep } from '../../../models/sort-step';
import {
  SortPhaseTone,
  SortTraceBucketSummary,
  SortTracePair,
  SortTraceRow,
  SortTraceState,
  SortTraceStatus,
  SortTraceTag,
} from '../../../models/sort-trace';

interface PhaseMeta {
  readonly label: string;
  readonly tone: SortPhaseTone;
}

const PHASE_META: Partial<Record<SortPhase, PhaseMeta>> = {
  idle: { label: t('features.algorithms.tracePanels.sort.phases.idle'), tone: 'idle' },
  init: { label: t('features.algorithms.tracePanels.sort.phases.init'), tone: 'idle' },
  compare: { label: t('features.algorithms.tracePanels.sort.phases.compare'), tone: 'compare' },
  swap: { label: t('features.algorithms.tracePanels.sort.phases.swap'), tone: 'swap' },
  'focus-digit': {
    label: t('features.algorithms.tracePanels.sort.phases.focusDigit'),
    tone: 'distribute',
  },
  distribute: {
    label: t('features.algorithms.tracePanels.sort.phases.distribute'),
    tone: 'distribute',
  },
  gather: { label: t('features.algorithms.tracePanels.sort.phases.gather'), tone: 'settle' },
  'pass-complete': {
    label: t('features.algorithms.tracePanels.sort.phases.passComplete'),
    tone: 'settle',
  },
  complete: { label: t('features.algorithms.tracePanels.sort.phases.complete'), tone: 'complete' },
};

/** Derive a Trace-tab state from a raw sort step. Returns `null` when
 *  there's no step yet (initial load / reset) so the side panel can
 *  hide the Trace tab until playback has started. All 11 sorting
 *  algorithms already emit the fields needed here, so no per-algo
 *  wiring is required.
 */
export function deriveSortTrace(step: SortStep | null): SortTraceState | null {
  if (!step) return null;

  const sortedSet = new Set(step.sorted);
  const compareSet = new Set(step.comparing ?? []);
  const swapSet = new Set(step.swapping ?? []);

  const phase = resolvePhase(step);
  const meta = PHASE_META[phase] ?? { label: phase, tone: 'idle' as SortPhaseTone };

  const rows: SortTraceRow[] = step.array.map((value, index) => {
    const tags: SortTraceTag[] = [];
    let status: SortTraceStatus = 'unsorted';

    if (swapSet.has(index)) {
      status = 'swapping';
      tags.push('swap');
    } else if (compareSet.has(index)) {
      status = 'comparing';
      tags.push('compare');
    } else if (sortedSet.has(index)) {
      status = 'sorted';
      tags.push('sorted');
    }

    return { index, value, status, tags };
  });

  const comparing = toPair(step.array, step.comparing);
  const swapping = toPair(step.array, step.swapping);

  const digit =
    step.digitIndex !== undefined &&
    step.digitIndex !== null &&
    step.maxDigits !== undefined &&
    step.maxDigits !== null
      ? { index: step.digitIndex, max: step.maxDigits }
      : null;

  const buckets: SortTraceBucketSummary[] = (step.buckets ?? []).map((b) => ({
    bucket: b.bucket,
    count: b.items.length,
    active: step.activeBucket === b.bucket,
  }));

  return {
    phase,
    phaseLabel: meta.label,
    phaseTone: meta.tone,
    description: step.description,
    comparing,
    swapping,
    sortedCount: step.sorted.length,
    unsortedCount: Math.max(0, step.array.length - step.sorted.length),
    boundary: step.boundary,
    rows,
    digit,
    buckets,
  };
}

function resolvePhase(step: SortStep): SortPhase {
  if (step.phase) return step.phase;
  if (step.swapping) return 'swap';
  if (step.comparing) return 'compare';
  if (step.array.length > 0 && step.sorted.length === step.array.length) return 'complete';
  return 'idle';
}

function toPair(
  array: readonly number[],
  pair: readonly [number, number] | null | undefined,
): SortTracePair | null {
  if (!pair) return null;
  const [a, b] = pair;
  return {
    indexA: a,
    valueA: array[a] ?? 0,
    indexB: b,
    valueB: array[b] ?? 0,
  };
}
