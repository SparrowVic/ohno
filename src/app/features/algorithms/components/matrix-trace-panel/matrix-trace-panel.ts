import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { I18N_KEY } from '../../../../core/i18n/i18n-keys';
import { OhnoLed } from '../../../../shared/instrument/led/led';
import { OhnoTraceChips } from '../../../../shared/instrument/trace/trace-chips/trace-chips';
import { OhnoTraceFacts } from '../../../../shared/instrument/trace/trace-facts/trace-facts';
import { OhnoTraceTable } from '../../../../shared/instrument/trace/trace-table/trace-table';
import { TraceChip, TraceColumn, TraceFact, TraceRow, TraceTone, TraceValue } from '../../../../shared/instrument/trace/trace.types';
import { toTraceValue } from '../../../../shared/instrument/trace/trace-value.utils';
import { GRAPH_ALGORITHM_TUTORIALS } from '../../data/graph-algorithm-tutorial/graph-algorithm-tutorial';
import { MatrixCell, MatrixTraceState, MatrixTraceTag } from '../../models/matrix';
import { matrixRackSpec, matrixSentenceText } from '../matrix-visualization/matrix-display.utils';

const MATRIX_KEYS = I18N_KEY.features.algorithms.tracePanels.matrix;
const COMMON_KEYS = I18N_KEY.features.algorithms.tracePanels.common;

const STATUS_TONES: Readonly<Record<MatrixCell['status'], TraceTone | null>> = {
  idle: null,
  pivot: 'violet',
  active: 'cyan',
  candidate: 'pink',
  improved: 'lime',
  assignment: 'lime',
  adjusted: 'amber',
  covered: 'slate',
  zero: 'amber',
  blocked: 'red',
};

const TAG_CHIPS: Readonly<Record<MatrixTraceTag, { readonly label: TraceValue; readonly tone: TraceTone }>> = {
  pivot: { label: toTraceValue(MATRIX_KEYS.statuses.pivot), tone: 'violet' },
  active: { label: toTraceValue(MATRIX_KEYS.statuses.active), tone: 'cyan' },
  improved: { label: toTraceValue(MATRIX_KEYS.statuses.improved), tone: 'lime' },
  covered: { label: toTraceValue(MATRIX_KEYS.statuses.covered), tone: 'slate' },
  zero: { label: toTraceValue(MATRIX_KEYS.statuses.zero), tone: 'amber' },
  assignment: { label: toTraceValue(MATRIX_KEYS.statuses.assignment), tone: 'lime' },
  row: { label: toTraceValue(MATRIX_KEYS.rowTagLabel), tone: 'cyan' },
  column: { label: toTraceValue(MATRIX_KEYS.columnTagLabel), tone: 'cyan' },
  adjusted: { label: toTraceValue(MATRIX_KEYS.statuses.adjusted), tone: 'amber' },
  infinite: { label: '∞', tone: 'slate' },
};

function sentence(raw: string) {
  return toTraceValue(matrixSentenceText(raw) ?? raw);
}

const TABLE_COLUMNS: readonly TraceColumn[] = [
  { id: 'cell', header: MATRIX_KEYS.columns.cell, kind: 'mono' },
  { id: 'value', header: MATRIX_KEYS.columns.value, align: 'end' },
  { id: 'meta', header: MATRIX_KEYS.columns.meta, kind: 'mono' },
  { id: 'status', header: MATRIX_KEYS.columns.status, kind: 'chips' },
  { id: 'tags', header: MATRIX_KEYS.columns.tags, kind: 'chips' },
];

@Component({
  selector: 'app-matrix-trace-panel',
  imports: [OhnoLed, OhnoTraceChips, OhnoTraceFacts, OhnoTraceTable, TranslocoPipe],
  templateUrl: './matrix-trace-panel.html',
  styleUrl: './matrix-trace-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatrixTracePanel {
  protected readonly keys = MATRIX_KEYS;
  protected readonly commonKeys = COMMON_KEYS;
  protected readonly columns = TABLE_COLUMNS;

  readonly state = input<MatrixTraceState | null>(null);
  readonly algorithmId = input<string | null>(null);

  protected readonly hintFacts = computed<readonly TraceFact[]>(() => {
    const id = this.algorithmId();
    const tutorial = id ? GRAPH_ALGORITHM_TUTORIALS[id] : undefined;
    if (!tutorial) return [];
    return [
      { id: 'idea', label: COMMON_KEYS.keyIdeaLabel, value: toTraceValue(tutorial.keyIdea), kind: 'text', wide: true },
      { id: 'watch', label: COMMON_KEYS.watchLabel, value: toTraceValue(tutorial.watch), kind: 'text', wide: true },
    ];
  });

  protected readonly summaryFacts = computed<readonly TraceFact[]>(() => {
    const state = this.state();
    if (!state) return [];
    return [
      { id: 'mode', label: COMMON_KEYS.modeLabel, value: sentence(state.modeLabel), kind: 'mono' },
      { id: 'phase', label: COMMON_KEYS.phaseLabel, value: sentence(state.phaseLabel), kind: 'mono' },
      { id: 'row', label: MATRIX_KEYS.activeRowLabel, value: state.activeRowLabel, kind: 'mono', tone: 'cyan' },
      { id: 'col', label: MATRIX_KEYS.activeColLabel, value: state.activeColLabel, kind: 'mono', tone: 'cyan' },
      { id: 'pivot', label: MATRIX_KEYS.pivotLabel, value: state.pivotLabel, kind: 'mono', tone: 'violet' },
      { id: 'result', label: COMMON_KEYS.resultLabel, value: sentence(state.resultLabel), kind: 'mono', tone: 'lime' },
    ];
  });

  protected readonly operationFacts = computed<readonly TraceFact[]>(() => {
    const state = this.state();
    if (!state) return [];
    const computation = state.computation;
    const facts: TraceFact[] = [
      { id: 'status', label: COMMON_KEYS.statusLabel, value: sentence(state.statusLabel), kind: 'mono' },
      { id: 'size', label: COMMON_KEYS.sizeLabel, value: state.dimensionsLabel, kind: 'mono' },
    ];
    if (computation) {
      const result = computation.result ? ` = ${computation.result}` : '';
      facts.push(
        { id: 'expression', label: computation.label, value: `${computation.expression}${result}`, kind: 'mono', wide: true, tone: 'pink' },
        { id: 'decision', label: COMMON_KEYS.decisionLabel, value: sentence(computation.decision), kind: 'text', wide: true },
      );
    } else {
      facts.push({
        id: 'decision',
        label: COMMON_KEYS.decisionLabel,
        value: toTraceValue(MATRIX_KEYS.waitingOperationLabel),
        kind: 'text',
        wide: true,
      });
    }
    return facts;
  });

  protected readonly focusTitle = computed(() => matrixRackSpec(this.state()?.focusItemsLabel).title);
  protected readonly secondaryTitle = computed(() => matrixRackSpec(this.state()?.secondaryItemsLabel).title);

  protected readonly focusChips = computed<readonly TraceChip[]>(() =>
    (this.state()?.focusItems ?? []).map((item, index) => ({ id: index, label: toTraceValue(matrixSentenceText(item) ?? item), tone: 'cyan' })),
  );

  protected readonly secondaryChips = computed<readonly TraceChip[]>(() =>
    (this.state()?.secondaryItems ?? []).map((item, index) => ({ id: index, label: toTraceValue(matrixSentenceText(item) ?? item) })),
  );

  protected readonly rows = computed<readonly TraceRow[]>(() =>
    (this.state()?.cells ?? [])
      .filter((cell) => cell.status !== 'idle' || cell.tags.length > 0)
      .sort((left, right) => left.row - right.row || left.col - right.col)
      .map((cell) => {
        const tone = STATUS_TONES[cell.status];
        const highlighted = ['active', 'candidate', 'improved', 'assignment'].includes(cell.status);
        return {
          id: cell.id,
          tone: highlighted ? tone : null,
          cells: {
            cell: `${cell.rowLabel}→${cell.colLabel}`,
            value: cell.valueLabel,
            meta: cell.metaLabel,
            status: [{ id: cell.status, label: toTraceValue(MATRIX_KEYS.statuses[cell.status]), tone }],
            tags: cell.tags.map((tag) => ({ id: tag, label: TAG_CHIPS[tag].label, tone: TAG_CHIPS[tag].tone })),
          },
        };
      }),
  );
}
