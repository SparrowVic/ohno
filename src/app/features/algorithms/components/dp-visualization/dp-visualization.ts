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

import { DpCell, DpPresetOption, DpTraceState } from '../../models/dp';
import { SortStep } from '../../models/sort-step';
import { VisualizationRenderer } from '../../models/visualization-renderer';
import { createMotionProfile, pulseElement } from '../../utils/visualization-motion';

interface KnapsackItemCard {
  readonly row: number;
  readonly label: string;
  readonly weight: number | null;
  readonly value: number | null;
  readonly metaLabel: string | null;
  readonly isActive: boolean;
  readonly isPacked: boolean;
}

interface CapacityMarker {
  readonly col: number;
  readonly label: string;
  readonly isActive: boolean;
  readonly isBase: boolean;
}

interface KnapsackMetric {
  readonly label: string;
  readonly value: string;
  readonly tone: 'accent' | 'info' | 'success' | 'warning';
}

interface KnapsackBranch {
  readonly kind: 'skip' | 'take';
  readonly label: string;
  readonly value: string;
  readonly note: string;
  readonly status: 'available' | 'winner' | 'blocked';
}

const FOCUS_CELL_STATUSES = new Set<DpCell['status']>([
  'active',
  'improved',
  'chosen',
  'blocked',
  'backtrack',
  'match',
]);

@Component({
  selector: 'app-dp-visualization',
  imports: [],
  templateUrl: './dp-visualization.html',
  styleUrl: './dp-visualization.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DpVisualization implements AfterViewInit, OnDestroy, VisualizationRenderer {
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
  readonly isKnapsack = computed(() => this.state()?.mode === 'knapsack-01');
  readonly activeLabel = computed(() => this.state()?.activeLabel ?? '—');
  readonly pathLabel = computed(() => this.state()?.pathLabel ?? '—');
  readonly activeCell = computed<DpCell | null>(() => findFocusCell(this.state()));
  readonly activeItemCard = computed<KnapsackItemCard | null>(() => {
    const state = this.state();
    const active = this.activeCell();
    if (!state || state.mode !== 'knapsack-01' || !active || active.row === 0) {
      return null;
    }

    const header = state.rowHeaders[active.row] ?? null;
    const stats = parseItemStats(header?.metaLabel ?? null);
    return {
      row: active.row,
      label: header?.label ?? `item ${active.row}`,
      weight: stats.weight,
      value: stats.value,
      metaLabel: header?.metaLabel ?? null,
      isActive: true,
      isPacked: header?.status === 'accent',
    };
  });
  readonly itemCards = computed<readonly KnapsackItemCard[]>(() => {
    const state = this.state();
    const active = this.activeCell();
    if (!state || state.mode !== 'knapsack-01') {
      return [];
    }

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
  readonly capacityMarkers = computed<readonly CapacityMarker[]>(() => {
    const state = this.state();
    const active = this.activeCell();
    if (!state || state.mode !== 'knapsack-01') {
      return [];
    }

    return state.colHeaders.map((header, index) => ({
      col: index,
      label: header.label,
      isActive: active?.col === index,
      isBase: index === 0,
    }));
  });
  readonly knapsackMetrics = computed<readonly KnapsackMetric[]>(() => {
    const state = this.state();
    if (!state || state.mode !== 'knapsack-01') {
      return [];
    }

    return [
      {
        label: 'Best value',
        value: metricValue(state, 'Best value') ?? state.resultLabel,
        tone: 'success',
      },
      {
        label: 'Packed',
        value: metricValue(state, 'Picked') ?? '0',
        tone: 'warning',
      },
      {
        label: 'Table',
        value: metricValue(state, 'Table') ?? state.dimensionsLabel,
        tone: 'info',
      },
    ];
  });
  readonly packedItems = computed<readonly string[]>(() =>
    this.itemCards()
      .filter((item) => item.isPacked)
      .map((item) => item.label),
  );
  readonly knapsackBranches = computed<readonly KnapsackBranch[]>(() => {
    const state = this.state();
    const active = this.activeCell();
    const activeItem = this.activeItemCard();
    if (!state || state.mode !== 'knapsack-01' || !active || active.row === 0) {
      return [];
    }

    const skipValue = secondaryValue(state, 'skip');
    const takeValue = secondaryValue(state, 'take');
    const winner = winningBranch(state.computation?.decision ?? '');
    const itemWeight = activeItem?.weight ?? null;
    const itemValue = activeItem?.value ?? null;
    const hasConcreteItem = itemWeight !== null && itemValue !== null;
    const takeAvailable = hasConcreteItem ? active.col >= itemWeight : true;

    return [
      {
        kind: 'skip',
        label: 'Skip branch',
        value: skipValue ?? '—',
        note: `reuse dp[${active.row - 1}][${active.col}]`,
        status: winner === 'skip' ? 'winner' : 'available',
      },
      {
        kind: 'take',
        label: 'Take branch',
        value: takeAvailable ? (takeValue ?? '—') : 'blocked',
        note: hasConcreteItem
          ? active.col >= itemWeight
            ? `read dp[${active.row - 1}][${active.col - itemWeight}] + ${itemValue}`
            : `needs weight ${itemWeight}`
          : 'need previous state + item value',
        status: !takeAvailable ? 'blocked' : winner === 'take' ? 'winner' : 'available',
      },
    ];
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

  insightClass(tone: string): string {
    return `insight-card insight-card--${tone}`;
  }

  metricClass(tone: KnapsackMetric['tone']): string {
    return `knapsack-metric knapsack-metric--${tone}`;
  }

  itemCardClass(item: KnapsackItemCard): string {
    return [
      'item-shelf__card',
      item.isActive ? 'item-shelf__card--active' : '',
      item.isPacked ? 'item-shelf__card--packed' : '',
    ]
      .filter(Boolean)
      .join(' ');
  }

  markerClass(marker: CapacityMarker): string {
    return [
      'capacity-ruler__mark',
      marker.isActive ? 'capacity-ruler__mark--active' : '',
      marker.isBase ? 'capacity-ruler__mark--base' : '',
    ]
      .filter(Boolean)
      .join(' ');
  }

  branchClass(branch: KnapsackBranch): string {
    return `decision-branch decision-branch--${branch.status} decision-branch--${branch.kind}`;
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

    if (current.mode === 'knapsack-01' && currentFocus) {
      if (currentFocus.row > 0 && currentFocus.row !== previousFocus?.row) {
        const itemCard = this.findElement(`[data-item-row="${currentFocus.row}"]`);
        if (itemCard) {
          pulseElement(itemCard, {
            duration: motion.compareMs,
            scale: 1.02,
            filter: [
              'drop-shadow(0 0 0 transparent)',
              'drop-shadow(0 0 18px rgba(184, 213, 110, 0.22))',
              'drop-shadow(0 0 0 transparent)',
            ],
          });
        }
      }

      if (currentFocus.col !== previousFocus?.col) {
        const marker = this.findElement(`[data-capacity-col="${currentFocus.col}"]`);
        if (marker) {
          pulseElement(marker, {
            duration: motion.compareMs,
            scale: 1.04,
            filter: [
              'drop-shadow(0 0 0 transparent)',
              'drop-shadow(0 0 18px rgba(149, 169, 191, 0.2))',
              'drop-shadow(0 0 0 transparent)',
            ],
          });
        }
      }

      const winner = winningBranch(current.computation?.decision ?? '');
      if (winner) {
        const branch = this.findElement(`[data-branch-kind="${winner}"]`);
        if (branch) {
          pulseElement(branch, {
            duration: motion.settleMs,
            scale: 1.015,
            filter: [
              'drop-shadow(0 0 0 transparent)',
              'drop-shadow(0 0 20px rgba(184, 213, 110, 0.18))',
              'drop-shadow(0 0 0 transparent)',
            ],
          });
        }
      }
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

  private findElement(selector: string): HTMLElement | null {
    return this.containerRef().nativeElement.querySelector(selector);
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

function parseItemStats(metaLabel: string | null): {
  readonly weight: number | null;
  readonly value: number | null;
} {
  const match =
    metaLabel?.match(/w(\d+)\s*[·|]\s*v(\d+)/i) ?? metaLabel?.match(/w(\d+)\s*·\s*v(\d+)/i);
  return {
    weight: match ? Number(match[1]) : null,
    value: match ? Number(match[2]) : null,
  };
}

function metricValue(state: DpTraceState, label: string): string | null {
  return state.insights.find((insight) => insight.label === label)?.value ?? null;
}

function secondaryValue(state: DpTraceState, prefix: 'skip' | 'take'): string | null {
  const item = state.secondaryItems.find((entry) => entry.startsWith(`${prefix} = `));
  return item ? item.slice(prefix.length + 3) : null;
}

function winningBranch(decision: string): 'skip' | 'take' | null {
  const normalized = decision.toLowerCase();
  if (normalized.includes('take')) {
    return 'take';
  }

  if (normalized.includes('skip')) {
    return 'skip';
  }

  return null;
}
