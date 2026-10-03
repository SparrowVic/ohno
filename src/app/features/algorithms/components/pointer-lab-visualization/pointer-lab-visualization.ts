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
import { TranslocoPipe } from '@jsverse/transloco';

import { I18N_KEY } from '../../../../core/i18n/i18n-keys';
import { OhnoEngraving } from '../../../../shared/instrument/engraving/engraving';
import { OhnoLed } from '../../../../shared/instrument/led/led';
import { OhnoRack } from '../../../../shared/instrument/rack/rack';
import { OhnoRackRow } from '../../../../shared/instrument/rack/rack-row/rack-row';
import { I18nTextPipe } from '../../../../shared/pipes/i18n-text.pipe';
import { SortStep } from '../../models/sort-step';
import { keepTapeFocusInView } from '../../utils/helpers/tape-layout/tape-scroll';
import { tapeLayout } from '../../utils/helpers/tape-layout/tape-layout.utils';
import {
  POINTER_TAPE_METRICS,
  pointerBand,
  pointerChars,
  pointerCursors,
  pointerLanes,
  pointerStatRows,
  pointerTapeView,
} from './pointer-lab-display.utils';

const FALLBACK_WIDTH = 560;

@Component({
  selector: 'app-pointer-lab-visualization',
  imports: [TranslocoPipe, I18nTextPipe, OhnoEngraving, OhnoLed, OhnoRack, OhnoRackRow],
  templateUrl: './pointer-lab-visualization.html',
  styleUrl: './pointer-lab-visualization.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PointerLabVisualization {
  protected readonly LAB = I18N_KEY.features.algorithms.display.pointerLab;
  protected readonly RACKS = I18N_KEY.features.algorithms.display.racks;
  protected readonly METRICS = POINTER_TAPE_METRICS;

  readonly array = input<readonly number[]>([]);
  readonly step = input<SortStep | null>(null);
  readonly speed = input<number>(5);

  private readonly destroyRef = inject(DestroyRef);
  private readonly mainRef = viewChild<ElementRef<HTMLElement>>('main');
  private readonly trackRef = viewChild<ElementRef<HTMLElement>>('track');
  private readonly width = signal(0);
  private observer: ResizeObserver | null = null;

  protected readonly state = computed(() => this.step()?.pointerLab ?? null);
  protected readonly view = computed(() => {
    const state = this.state();
    return state ? pointerTapeView(state) : null;
  });
  protected readonly layout = computed(() => {
    const state = this.state();
    return tapeLayout(
      state?.cells.length ?? 0,
      state ? pointerChars(state) : 1,
      this.width() || FALLBACK_WIDTH,
      POINTER_TAPE_METRICS,
    );
  });
  protected readonly cursors = computed(() => {
    const state = this.state();
    return state ? pointerCursors(state, this.layout()) : [];
  });
  protected readonly lanes = computed(() => pointerLanes(this.cursors()));
  protected readonly band = computed(() =>
    pointerBand(this.state()?.window ?? null, this.state()?.cells.length ?? 0, this.layout()),
  );
  protected readonly stats = computed(() => {
    const state = this.state();
    return state ? pointerStatRows(state) : [];
  });
  protected readonly pointerNames = computed(() =>
    (this.state()?.pointers ?? []).map((pointer) => pointer.label).join(', '),
  );

  constructor() {
    effect(() => {
      const main = this.mainRef()?.nativeElement;
      this.observer?.disconnect();
      this.observer = null;
      if (!main || typeof ResizeObserver === 'undefined') return;
      this.observer = new ResizeObserver(([entry]) => {
        if (!entry) return;
        const width = Math.floor(entry.contentRect.width);
        if (width !== this.width()) this.width.set(width);
      });
      this.observer.observe(main);
    });

    afterRenderEffect(() => {
      this.view();
      this.layout();
      const track = this.trackRef()?.nativeElement;
      if (track) keepTapeFocusInView(track, track.querySelector<HTMLElement>('[data-focus="true"]'));
    });

    this.destroyRef.onDestroy(() => {
      this.observer?.disconnect();
      this.observer = null;
    });
  }
}
