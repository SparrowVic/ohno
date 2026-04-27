import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  untracked,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

import { I18N_KEY, I18nKey } from '../../../../core/i18n/i18n-keys';
import { looksLikeI18nKey } from '../../../../core/i18n/looks-like-i18n-key';
import { Task } from '../../models/task';
import { VisualizationOption } from '../../models/visualization-option';
import { VisualizationVariant } from '../../models/visualization-renderer';
import { Slider } from '../../../../shared/controls/slider/slider';
import { Select, SelectOption } from '../../../../shared/controls/select/select';
import { VizCustomValuesPopover } from '../viz-custom-values-popover/viz-custom-values-popover';

@Component({
  selector: 'app-visualization-toolbar',
  imports: [
    Select,
    Slider,
    ReactiveFormsModule,
    TranslocoPipe,
    VizCustomValuesPopover,
  ],
  templateUrl: './visualization-toolbar.html',
  styleUrl: './visualization-toolbar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VisualizationToolbar {
  protected readonly I18N_KEY = I18N_KEY;
  private readonly transloco = inject(TranslocoService);
  readonly isPlaying = input.required<boolean>();
  readonly speed = input.required<number>();
  readonly currentStep = input.required<number>();
  readonly totalSteps = input.required<number>();
  readonly size = input.required<number>();
  readonly variant = input.required<VisualizationVariant>();
  readonly sizeOptions = input<readonly number[]>([]);
  readonly variantOptions = input<readonly VisualizationOption[]>([]);
  readonly sizeUnit = input<string>('elements');
  readonly randomizeLabel = input<string>('Randomize');
  /** Unified task list (toolbar-level task picker, replacing the 8 per-viz
   *  preset pickers for algorithms that have migrated). Null / empty list
   *  hides the picker entirely — stays invisible for un-migrated families
   *  during the transition period. */
  readonly tasks = input<readonly Task<Record<string, unknown>>[] | null>(null);
  readonly activeTaskId = input<string | null>(null);
  readonly currentTaskValues = input<Record<string, unknown> | null>(null);

  readonly canStepBack = computed(() => this.currentStep() > 0);
  readonly canStepForward = computed(() => this.currentStep() < this.totalSteps());
  readonly hasVariantChoice = computed(() => this.variantOptions().length > 1);
  readonly hasTaskChoice = computed(() => (this.tasks()?.length ?? 0) > 0);
  readonly activeTask = computed<Task<Record<string, unknown>> | null>(() => {
    const list = this.tasks();
    const id = this.activeTaskId();
    if (!list || !id) return null;
    return list.find((t) => t.id === id) ?? null;
  });
  readonly hasCustomValuesFields = computed(() => {
    const schema = this.activeTask()?.inputSchema;
    return schema ? Object.keys(schema).length > 0 : false;
  });

  readonly customValuesOpen = signal(false);
  /** Hide the dataset-size select when the algorithm doesn't offer a
   *  meaningful choice — a one-option pulldown was confusing students
   *  on preset-only flows (GCD, Extended Euclidean) where they'd
   *  expect the control to switch scenarios but nothing changed. */
  readonly hasSizeChoice = computed(() => this.sizeOptions().length > 1);
  readonly progressRatio = computed(() => {
    const total = this.totalSteps();
    if (total <= 0) return 0;
    return Math.min(100, (this.currentStep() / total) * 100);
  });
  readonly variantSelectOptions = computed<readonly SelectOption<VisualizationVariant>[]>(() =>
    this.variantOptions().map((option) => ({
      value: option.value,
      label: option.label,
    })),
  );
  readonly sizeSelectOptions = computed<readonly SelectOption<number>[]>(() =>
    this.sizeOptions().map((option) => ({
      value: option,
      label: `${option} ${this.sizeUnit()}`,
    })),
  );
  readonly taskSelectOptions = computed<readonly SelectOption<string>[]>(() => {
    const list = this.tasks() ?? [];
    // Task labels often arrive as i18n keys — resolve them to strings
    // here so the select renders plain text without demanding a pipe
    // on every option.
    return list.map((task) => {
      const raw = task.name;
      const label =
        typeof raw === 'string'
          ? looksLikeI18nKey(raw)
            ? this.transloco.translate(raw)
            : raw
          : String(raw);
      return { value: task.id, label };
    });
  });

  readonly speedControl = new FormControl(5, { nonNullable: true });
  readonly variantControl = new FormControl<VisualizationVariant>('bar', { nonNullable: true });
  readonly sizeControl = new FormControl(16, { nonNullable: true });
  readonly taskControl = new FormControl<string>('', { nonNullable: true });

  readonly resetClick = output<void>();
  readonly stepBackClick = output<void>();
  readonly playToggle = output<void>();
  readonly stepForwardClick = output<void>();
  readonly speedChange = output<number>();
  readonly sizeChange = output<number>();
  readonly randomizeClick = output<void>();
  readonly variantChange = output<VisualizationVariant>();
  readonly taskChange = output<string>();
  readonly customValuesChange = output<Record<string, unknown>>();

  constructor() {
    effect(() => {
      const speed = this.speed();
      untracked(() => {
        if (this.speedControl.value !== speed) {
          this.speedControl.setValue(speed, { emitEvent: false });
        }
      });
    });

    effect(() => {
      const size = this.size();
      untracked(() => {
        if (this.sizeControl.value !== size) {
          this.sizeControl.setValue(size, { emitEvent: false });
        }
      });
    });

    effect(() => {
      const variant = this.variant();
      untracked(() => {
        if (this.variantControl.value !== variant) {
          this.variantControl.setValue(variant, { emitEvent: false });
        }
      });
    });

    effect(() => {
      const taskId = this.activeTaskId();
      untracked(() => {
        if (taskId !== null && this.taskControl.value !== taskId) {
          this.taskControl.setValue(taskId, { emitEvent: false });
        }
      });
    });

    this.speedControl.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((value) => this.speedChange.emit(value));

    this.sizeControl.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((value) => this.sizeChange.emit(value));

    this.variantControl.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((value) => this.variantChange.emit(value));

    this.taskControl.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((value) => {
        if (value) this.taskChange.emit(value);
      });
  }

  transportLabelKey(): I18nKey {
    return this.isPlaying()
      ? I18N_KEY.features.algorithms.toolbar.pausePlaybackLabel
      : I18N_KEY.features.algorithms.toolbar.startPlaybackLabel;
  }

  toggleCustomValues(event: MouseEvent): void {
    // Stop propagation so the popover's own outside-click handler
    // (registered on document:click) doesn't immediately re-close it.
    event.stopPropagation();
    this.customValuesOpen.update((open) => !open);
  }

  closeCustomValues(): void {
    if (this.customValuesOpen()) this.customValuesOpen.set(false);
  }

  onCustomValuesApply(values: Record<string, unknown>): void {
    this.customValuesChange.emit(values);
  }
}
