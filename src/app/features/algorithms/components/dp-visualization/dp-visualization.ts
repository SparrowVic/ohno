import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  computed,
  effect,
  input,
  output,
  untracked,
  viewChild,
} from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { looksLikeI18nKey } from '../../../../core/i18n/looks-like-i18n-key';
import { TranslatableText } from '../../../../core/i18n/translatable-text';
import { I18nTextPipe } from '../../../../shared/pipes/i18n-text.pipe';
import { DpCell, DpPresetOption, DpTraceState } from '../../models/dp';
import { SortStep } from '../../models/sort-step';
import { VisualizationRenderer } from '../../models/visualization-renderer';
import { createMotionProfile, pulseElement } from '../../utils/visualization-motion/visualization-motion';
import { VizHeader, VizHeaderTone } from '../viz-header/viz-header';
import { VizPanel } from '../viz-panel/viz-panel';
import { VizPresetPicker } from '../viz-preset-picker/viz-preset-picker';

const FOCUS_CELL_STATUSES = new Set<DpCell['status']>([
  'active',
  'improved',
  'chosen',
  'blocked',
  'backtrack',
  'match',
]);

/** Knapsack item card for the item shelf — extracted from the row
 *  header so the UI can show weight / value alongside the label and
 *  highlight whichever row is currently being evaluated. */
interface KnapsackItemCard {
  readonly row: number;
  readonly label: string;
  readonly weight: number | null;
  readonly value: number | null;
  readonly metaLabel: string | null;
  readonly isActive: boolean;
  readonly isPacked: boolean;
}

/** Capacity marker sitting on the ruler strip above the board. One
 *  per column — base (w=0) gets a distinct badge, the active column
 *  pulses to match the current focus cell. */
interface CapacityMarker {
  readonly col: number;
  readonly label: string;
  readonly isActive: boolean;
  readonly isBase: boolean;
}

@Component({
  selector: 'app-dp-visualization',
  imports: [I18nTextPipe, TranslocoPipe, VizHeader, VizPanel, VizPresetPicker],
  templateUrl: './dp-visualization.html',
  styleUrl: './dp-visualization.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DpVisualization implements AfterViewInit, OnDestroy, VisualizationRenderer {
  protected readonly looksLikeI18nKey = looksLikeI18nKey;
  readonly array = input.required<readonly number[]>();
  readonly step = input<SortStep | null>(null);
  readonly speed = input<number>(5);
  readonly presetOptions = input<readonly DpPresetOption[]>([]);
  readonly presetId = input<string | null>(null);
  readonly presetChange = output<string>();

  private readonly containerRef = viewChild.required<ElementRef<HTMLDivElement>>('container');
  private readonly boardWrapRef = viewChild<ElementRef<HTMLDivElement>>('boardWrap');
  private initialized = false;
  private lastStep: SortStep | null = null;

  readonly state = computed<DpTraceState | null>(() => this.step()?.dp ?? null);

  /** True when the current DP instance is the 0/1 knapsack. Drives
   *  the item-shelf + capacity-ruler strip above the board — the two
   *  axes-as-entities that make knapsack's "take vs skip" decision
   *  readable at a glance, rather than buried in header labels. */
  readonly isKnapsack = computed(() => this.state()?.mode === 'knapsack-01');

  /** The cell the algorithm is currently deciding on. Falls back to
   *  any focus-class status so the item shelf / ruler highlight the
   *  right row + column even when the tag hasn't been set yet. */
  readonly activeCell = computed<DpCell | null>(() => {
    const state = this.state();
    if (!state) return null;
    return (
      state.cells.find((cell) => cell.tags.includes('active')) ??
      state.cells.find((cell) => FOCUS_CELL_STATUSES.has(cell.status)) ??
      null
    );
  });

  /** Item cards — one per data row (row 0 is the w=0 base and is
   *  excluded). We parse `w{n} · v{n}` out of the row header's meta
   *  label so the card can split weight from value into separate
   *  badges; if the generator format ever changes the parse returns
   *  nulls and the UI falls back to '—'. */
  readonly itemCards = computed<readonly KnapsackItemCard[]>(() => {
    const state = this.state();
    const active = this.activeCell();
    if (!state || state.mode !== 'knapsack-01') return [];
    return state.rowHeaders.slice(1).map((header, index) => {
      const stats = parseItemStats(header.metaLabel);
      const row = index + 1;
      return {
        row,
        label: header.label,
        weight: stats.weight,
        value: stats.value,
        metaLabel: header.metaLabel,
        isActive: active?.row === row,
        isPacked: header.status === 'accent',
      };
    });
  });

  /** Capacity markers — one per column header. The active column
   *  matches the current decision cell's `col`; base (w=0) gets a
   *  distinct badge tone. */
  readonly capacityMarkers = computed<readonly CapacityMarker[]>(() => {
    const state = this.state();
    const active = this.activeCell();
    if (!state || state.mode !== 'knapsack-01') return [];
    return state.colHeaders.map((header, index) => ({
      col: index,
      label: header.label,
      isActive: active?.col === index,
      isBase: index === 0,
    }));
  });

  /** Algorithm tag — "LCS", "Knapsack 0/1", etc. Stays stable across
   *  steps and reads as the viz's identity badge. */
  readonly phaseLabel = computed<TranslatableText>(() => this.state()?.modeLabel ?? '');

  /** Action sentence. Picks the richest per-step description:
   *    1. `computation.decision` — "take (+v5)"
   *    2. `computation.expression` — "dp[i-1][w] vs dp[i-1][w-wᵢ]+vᵢ"
   *    3. `phaseLabel` — generic phase name
   *    4. `activeLabel` — active row/col */
  readonly actionText = computed<TranslatableText>(() => {
    const state = this.state();
    if (!state) return '';
    return (
      state.computation?.decision ??
      state.computation?.expression ??
      state.phaseLabel ??
      state.activeLabel ??
      ''
    );
  });

  /** Tone derived from cell status flags:
   *    - chosen / improved → sorted (lime, value locked in)
   *    - active            → swap   (pink, acting now)
   *    - match             → compare (cyan, attending)
   *    - backtrack / blocked → compare
   *    - idle              → default */
  readonly headerTone = computed<VizHeaderTone>(() => {
    const cells = this.state()?.cells ?? [];
    if (cells.some((cell) => cell.status === 'chosen')) return 'sorted';
    if (cells.some((cell) => cell.status === 'improved')) return 'sorted';
    if (cells.some((cell) => cell.status === 'active')) return 'swap';
    if (cells.some((cell) => cell.status === 'backtrack')) return 'compare';
    if (cells.some((cell) => cell.status === 'match')) return 'compare';
    if (cells.some((cell) => cell.status === 'blocked')) return 'compare';
    return 'default';
  });

  constructor() {
    effect(() => {
      const arr = this.array();
      if (!this.initialized) return;
      this.initialize(arr);
      untracked(() => {
        const step = this.step();
        if (step) this.render(step);
      });
    });

    effect(() => {
      const step = this.step();
      if (this.initialized && step) {
        this.render(step);
      }
    });
  }

  ngAfterViewInit(): void {
    this.initialized = true;
    this.initialize(this.array());
    const step = this.step();
    if (step) this.render(step);
  }

  ngOnDestroy(): void {
    this.destroy();
  }

  initialize(_: readonly number[]): void {
    this.lastStep = null;
  }

  render(step: SortStep): void {
    const previous = this.lastStep;
    this.lastStep = step;
    queueMicrotask(() => this.animateStepEffects(previous, step));
  }

  destroy(): void {
    this.lastStep = null;
    this.initialized = false;
  }

  selectPreset(id: string): void {
    if (id === this.presetId()) return;
    this.presetChange.emit(id);
  }

  rowCells(row: number): readonly DpCell[] {
    return (
      this.state()
        ?.cells.filter((cell) => cell.row === row)
        .sort((left, right) => left.col - right.col) ?? []
    );
  }

  gridCols(): string {
    return `repeat(${(this.state()?.colHeaders.length ?? 0) + 1}, minmax(0, 1fr))`;
  }

  cellClass(cell: DpCell): string {
    return [
      'dp-cell',
      `dp-cell--${cell.status}`,
      cell.tags.includes('skip') ? 'dp-cell--skip' : '',
      cell.tags.includes('take') ? 'dp-cell--take' : '',
      cell.tags.includes('path') ? 'dp-cell--path' : '',
    ]
      .filter(Boolean)
      .join(' ');
  }

  headerClass(status: string): string {
    return `dp-head dp-head--${status}`;
  }

  private animateStepEffects(previousStep: SortStep | null, step: SortStep): void {
    const current = step.dp;
    const previous = previousStep?.dp ?? null;
    if (!current) return;

    const motion = createMotionProfile(this.speed());
    const previousStatuses = new Map(previous?.cells.map((cell) => [cell.id, cell.status]) ?? []);
    const currentFocus = findFocusCell(current);
    const previousFocus = findFocusCell(previous);

    if (currentFocus && currentFocus.id !== previousFocus?.id) {
      this.scrollCellIntoView(currentFocus.id);
    }

    for (const cell of current.cells) {
      const prior = previousStatuses.get(cell.id);
      if (!prior || prior === cell.status) continue;
      if (!['active', 'improved', 'chosen', 'backtrack', 'match'].includes(cell.status)) continue;
      const el = this.findCell(cell.id);
      if (!el) continue;
      pulseElement(el, {
        duration: cell.status === 'active' ? motion.compareMs : motion.settleMs,
        scale: cell.status === 'backtrack' ? 1.04 : 1.03,
        filter: [
          'drop-shadow(0 0 0 transparent)',
          glowForStatus(cell.status),
          'drop-shadow(0 0 0 transparent)',
        ],
      });
    }
  }

  private findCell(id: string): HTMLElement | null {
    return this.containerRef().nativeElement.querySelector(`[data-cell-id="${id}"]`);
  }

  private scrollCellIntoView(id: string): void {
    const cell = this.findCell(id);
    if (!cell || !this.boardWrapRef()) {
      return;
    }

    cell.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'nearest',
    });
  }
}

function glowForStatus(status: DpCell['status']): string {
  switch (status) {
    case 'active':
      return 'drop-shadow(0 0 10px rgba(240,180,41,0.18))';
    case 'match':
      return 'drop-shadow(0 0 10px rgba(56,189,248,0.18))';
    case 'backtrack':
      return 'drop-shadow(0 0 10px rgba(255,222,89,0.18))';
    default:
      return 'drop-shadow(0 0 10px rgba(62,207,142,0.18))';
  }
}

function findFocusCell(state: DpTraceState | null | undefined): DpCell | null {
  return (
    state?.cells.find((cell) => cell.tags.includes('active')) ??
    state?.cells.find((cell) => FOCUS_CELL_STATUSES.has(cell.status)) ??
    null
  );
}

/** Pulls `w{weight} · v{value}` or `w{weight} | v{value}` out of the
 *  row header meta label. Both glyphs appear in generator output —
 *  tolerate either so we don't need to couple the UI to a single
 *  format. Returns nulls when nothing matches so the UI falls back
 *  to a dash. */
function parseItemStats(metaLabel: string | null): {
  readonly weight: number | null;
  readonly value: number | null;
} {
  const match =
    metaLabel?.match(/w(\d+)\s*·\s*v(\d+)/i) ?? metaLabel?.match(/w(\d+)\s*\|\s*v(\d+)/i);
  return {
    weight: match ? Number(match[1]) : null,
    value: match ? Number(match[2]) : null,
  };
}
