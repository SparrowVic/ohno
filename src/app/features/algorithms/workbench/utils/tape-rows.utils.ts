import { TranslatableText } from '../../../../core/i18n/translatable-text';
import { LedColor } from '../../../../shared/instrument/led/led.types';
import { formatReadout } from '../../../../shared/instrument/readout/readout.utils';
import { TapeRow } from '../../../../shared/instrument/tape/tape.types';
import { SortStep } from '../../models/sort-step';
import { StepEvent, StepEventKind } from './step-events.utils';

export type TapeFilter = 'all' | 'compare' | 'swap' | 'pass';

export const TAPE_FILTERS: readonly TapeFilter[] = ['all', 'compare', 'swap', 'pass'];

export interface TapeLabels {
  readonly events: Readonly<Record<StepEventKind, string>>;
  readonly passSeparator: (index: number) => string;
}

const TONES: Readonly<Record<StepEventKind, LedColor>> = {
  start: 'slate',
  step: 'slate',
  compare: 'cyan',
  swap: 'pink',
  settle: 'lime',
  pass: 'slate',
  complete: 'lime',
};

const FILTERS: Readonly<Record<TapeFilter, ReadonlySet<StepEventKind>>> = {
  all: new Set<StepEventKind>(['start', 'step', 'compare', 'swap', 'settle', 'pass', 'complete']),
  compare: new Set<StepEventKind>(['compare']),
  swap: new Set<StepEventKind>(['swap']),
  pass: new Set<StepEventKind>(['pass']),
};

export function buildTapeRows(
  events: readonly StepEvent[],
  history: readonly SortStep[],
  cursor: number,
  filter: TapeFilter,
  labels: TapeLabels,
  translate: (text: TranslatableText) => string,
): readonly TapeRow[] {
  const allowed = FILTERS[filter];
  return events.flatMap((event): TapeRow[] => {
    if (event.index > cursor || !allowed.has(event.kind)) return [];
    if (event.kind === 'pass') {
      return [{ step: event.index, kind: 'separator', tone: TONES.pass, event: labels.passSeparator(event.pass), detail: '' }];
    }
    const step = history[event.index];
    const detail = event.detail || (step ? translate(step.description) : '');
    return [{ step: event.index, kind: 'event', tone: TONES[event.kind], event: labels.events[event.kind], detail }];
  });
}

export function formatTapeText(rows: readonly TapeRow[], stepHeader: string, eventHeader: string): string {
  const lines = rows.map((row) =>
    row.kind === 'separator'
      ? `${formatReadout(row.step, 3)}  ${row.event}`
      : `${formatReadout(row.step, 3)}  ${row.event.padEnd(10)}${row.detail}`.trimEnd(),
  );
  return [`${stepHeader.padEnd(5)}${eventHeader}`, ...lines].join('\n');
}
