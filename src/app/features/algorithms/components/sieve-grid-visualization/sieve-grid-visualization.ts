import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterRenderEffect,
  computed,
  effect,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

import { AppLanguageService } from '../../../../core/i18n/app-language.service';
import { I18N_KEY } from '../../../../core/i18n/i18n-keys';
import { OhnoRack } from '../../../../shared/instrument/rack/rack';
import { OhnoRackRow } from '../../../../shared/instrument/rack/rack-row/rack-row';
import { I18nTextPipe } from '../../../../shared/pipes/i18n-text.pipe';
import { SieveGridTraceState } from '../../models/sieve-grid';
import { SortStep } from '../../models/sort-step';
import {
  SIEVE_BOARD_METRICS,
  SieveBoardCell,
  SieveBoardLayout,
  SieveBoardRow,
  SievePrimeChip,
  SieveStatRow,
  sieveBoardLayout,
  sieveBoardRows,
  sievePrimeChips,
  sieveStatRows,
  sieveVisibleCells,
} from './sieve-display.utils';

interface BoardSize {
  readonly width: number;
  readonly height: number;
}

@Component({
  selector: 'app-sieve-grid-visualization',
  imports: [I18nTextPipe, TranslocoPipe, OhnoRack, OhnoRackRow],
  templateUrl: './sieve-grid-visualization.html',
  styleUrl: './sieve-grid-visualization.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SieveGridVisualization {
  protected readonly SIEVE = I18N_KEY.features.algorithms.display.sieve;
  protected readonly RACKS = I18N_KEY.features.algorithms.display.racks;
  protected readonly NOTES = I18N_KEY.features.algorithms.display.notes;
  protected readonly METRICS = SIEVE_BOARD_METRICS;

  readonly array = input.required<readonly number[]>();
  readonly step = input<SortStep | null>(null);
  readonly speed = input<number>(5);

  private readonly transloco = inject(TranslocoService);
  private readonly language = inject(AppLanguageService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly boardRef = viewChild<ElementRef<HTMLElement>>('board');
  private readonly primesRef = viewChild<ElementRef<HTMLElement>>('primeChips');
  private readonly size = signal<BoardSize>({ width: 0, height: 0 });
  private observer: ResizeObserver | null = null;

  protected readonly state = computed<SieveGridTraceState | null>(() => this.step()?.sieveGrid ?? null);

  protected readonly upper = computed(() => {
    const cells = this.state()?.cells ?? [];
    return cells[cells.length - 1]?.value ?? 0;
  });

  protected readonly layout = computed<SieveBoardLayout>(() => {
    const state = this.state();
    const count = state ? sieveVisibleCells(state.cells).length : 0;
    const { width, height } = this.size();
    return sieveBoardLayout(count, width || 640, height || 420);
  });

  protected readonly rows = computed<readonly SieveBoardRow[]>(() => {
    const state = this.state();
    return state ? sieveBoardRows(state, this.layout().columns) : [];
  });

  protected readonly columnHeads = computed<readonly number[]>(() =>
    Array.from({ length: Math.min(this.layout().columns, this.rows()[0]?.cells.length ?? 0) }, (_, index) => index + 1),
  );

  protected readonly cellLabels = computed<ReadonlyMap<number, string>>(() => {
    this.language.activeLang();
    const labels = new Map<number, string>();
    for (const row of this.rows()) {
      for (const cell of row.cells) {
        const state = this.transloco.translate(this.SIEVE.states[cell.stateName]);
        labels.set(
          cell.value,
          cell.factor === null
            ? this.transloco.translate(this.SIEVE.cellAria, { value: cell.value, state })
            : this.transloco.translate(this.SIEVE.cellFactorAria, { value: cell.value, state, factor: cell.factor }),
        );
      }
    }
    return labels;
  });

  protected readonly focusCell = computed<SieveBoardCell | null>(() => {
    for (const row of this.rows()) {
      const cell = row.cells.find((item) => item.focus);
      if (cell) return cell;
    }
    return null;
  });

  protected readonly primes = computed<readonly SievePrimeChip[]>(() => sievePrimeChips(this.state()?.cells ?? []));

  protected readonly primeList = computed(() =>
    this.primes()
      .map((chip) => chip.value)
      .join(', '),
  );

  protected readonly stats = computed<readonly SieveStatRow[]>(() => sieveStatRows(this.state()?.stats ?? []));

  protected readonly complete = computed(() => this.state()?.tone === 'complete');

  constructor() {
    effect(() => {
      const board = this.boardRef()?.nativeElement;
      this.observer?.disconnect();
      this.observer = null;
      if (!board || typeof ResizeObserver === 'undefined') return;
      this.observer = new ResizeObserver(([entry]) => {
        if (!entry) return;
        const width = Math.floor(entry.contentRect.width);
        const height = Math.floor(entry.contentRect.height);
        const current = this.size();
        if (current.width !== width || current.height !== height) this.size.set({ width, height });
      });
      this.observer.observe(board);
    });

    afterRenderEffect(() => {
      const focus = this.focusCell();
      this.layout();
      const board = this.boardRef()?.nativeElement;
      if (board && focus) {
        const target = board.querySelector<HTMLElement>(`[data-value="${focus.value}"]`);
        const { columnHead, gap, inset } = SIEVE_BOARD_METRICS;
        if (target) this.scrollWithin(board, target, columnHead + gap + inset);
      }
      this.primes();
      const primes = this.primesRef()?.nativeElement;
      const head = primes?.querySelector<HTMLElement>('[data-head="true"]');
      if (primes && head) this.scrollWithin(primes, head);
    });

    this.destroyRef.onDestroy(() => {
      this.observer?.disconnect();
      this.observer = null;
    });
  }

  private scrollWithin(container: HTMLElement, target: HTMLElement, stickyTop = 0): void {
    const box = container.getBoundingClientRect();
    const rect = target.getBoundingClientRect();
    const margin = 6;
    const top = box.top + stickyTop + margin;
    if (rect.top < top) {
      container.scrollTop -= top - rect.top;
    } else if (rect.bottom > box.bottom - margin) {
      container.scrollTop += rect.bottom - (box.bottom - margin);
    }
    if (rect.left < box.left + margin) {
      container.scrollLeft -= box.left + margin - rect.left;
    } else if (rect.right > box.right - margin) {
      container.scrollLeft += rect.right - (box.right - margin);
    }
  }
}
