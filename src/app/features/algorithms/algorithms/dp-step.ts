import {
  DpCell,
  DpComputation,
  DpHeader,
  DpInsight,
  DpMode,
  DpTraceState,
  DpTraceTag,
} from '../models/dp';
import { SortStep } from '../models/sort-step';
import { TranslatableText } from '../../../core/i18n/translatable-text';

export interface DpHeaderConfig {
  readonly id: string;
  readonly label: string;
  readonly status?: DpHeader['status'];
  readonly metaLabel?: string | null;
}

export interface DpCellConfig {
  readonly row: number;
  readonly col: number;
  readonly rowLabel: string;
  readonly colLabel: string;
  readonly valueLabel: string;
  readonly metaLabel?: string | null;
  readonly status?: DpCell['status'];
  readonly tags?: readonly DpTraceTag[];
}

export interface CreateDpStepArgs {
  readonly mode: DpMode;
  readonly modeLabel: TranslatableText;
  readonly phaseLabel: TranslatableText;
  readonly resultLabel: TranslatableText;
  readonly presetLabel: TranslatableText;
  readonly presetDescription: TranslatableText;
  readonly dimensionsLabel: string;
  readonly activeLabel: TranslatableText | null;
  readonly pathLabel: TranslatableText;
  readonly primaryItemsLabel: TranslatableText;
  readonly primaryItems: readonly TranslatableText[];
  readonly secondaryItemsLabel: TranslatableText;
  readonly secondaryItems: readonly TranslatableText[];
  readonly insights: readonly DpInsight[];
  readonly rowHeaders: readonly DpHeaderConfig[];
  readonly colHeaders: readonly DpHeaderConfig[];
  readonly cells: readonly DpCellConfig[];
  readonly activeCodeLine: number;
  readonly description: TranslatableText;
  readonly phase: SortStep['phase'];
  readonly tableShape?: DpTraceState['tableShape'];
  readonly computation?: DpComputation | null;
}

export function createDpStep(args: CreateDpStepArgs): SortStep {
  return {
    array: [],
    comparing: null,
    swapping: null,
    sorted: [],
    boundary: -1,
    activeCodeLine: args.activeCodeLine,
    description: args.description,
    phase: args.phase,
    dp: {
      mode: args.mode,
      modeLabel: args.modeLabel,
      phaseLabel: args.phaseLabel,
      resultLabel: args.resultLabel,
      presetLabel: args.presetLabel,
      presetDescription: args.presetDescription,
      dimensionsLabel: args.dimensionsLabel,
      activeLabel: args.activeLabel,
      pathLabel: args.pathLabel,
      primaryItemsLabel: args.primaryItemsLabel,
      primaryItems: args.primaryItems,
      secondaryItemsLabel: args.secondaryItemsLabel,
      secondaryItems: args.secondaryItems,
      insights: args.insights,
      rowHeaders: args.rowHeaders.map((header) => ({
        id: header.id,
        label: header.label,
        status: header.status ?? 'idle',
        metaLabel: header.metaLabel ?? null,
      })),
      colHeaders: args.colHeaders.map((header) => ({
        id: header.id,
        label: header.label,
        status: header.status ?? 'idle',
        metaLabel: header.metaLabel ?? null,
      })),
      cells: args.cells.map((cell) => ({
        id: dpCellId(cell.row, cell.col),
        row: cell.row,
        col: cell.col,
        rowLabel: cell.rowLabel,
        colLabel: cell.colLabel,
        valueLabel: cell.valueLabel,
        metaLabel: cell.metaLabel ?? null,
        status: cell.status ?? 'idle',
        tags: cell.tags ?? [],
      })),
      tableShape: args.tableShape ?? 'full',
      computation: args.computation ?? null,
    },
  };
}

export function dpCellId(row: number, col: number): string {
  return `dp-${row}-${col}`;
}
