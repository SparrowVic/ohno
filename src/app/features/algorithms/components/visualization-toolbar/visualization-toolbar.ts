import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  untracked,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TranslocoService } from '@jsverse/transloco';
import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import { AppLanguageService } from '../../../../core/i18n/app-language.service';
import { VisualizationOption } from '../../models/visualization-option';
import { VisualizationVariant } from '../../models/visualization-renderer';
import { LabSlider } from '../../../../shared/controls/lab-slider/lab-slider';
import { LabSelect, LabSelectOption } from '../../../../shared/controls/lab-select/lab-select';

@Component({
  selector: 'app-visualization-toolbar',
  imports: [LabSelect, LabSlider, ReactiveFormsModule],
  templateUrl: './visualization-toolbar.html',
  styleUrl: './visualization-toolbar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VisualizationToolbar {
  private readonly language = inject(AppLanguageService);
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

  readonly canStepBack = computed(() => this.currentStep() > 0);
  readonly canStepForward = computed(() => this.currentStep() < this.totalSteps());
  readonly hasVariantChoice = computed(() => this.variantOptions().length > 1);
  readonly progressRatio = computed(() => {
    const total = this.totalSteps();
    if (total <= 0) return 0;
    return Math.min(100, (this.currentStep() / total) * 100);
  });
  readonly variantSelectOptions = computed<readonly LabSelectOption<VisualizationVariant>[]>(() =>
    this.variantOptions().map((option) => ({
      value: option.value,
      label: option.label,
    })),
  );
  readonly sizeSelectOptions = computed<readonly LabSelectOption<number>[]>(() =>
    this.sizeOptions().map((option) => ({
      value: option,
      label: `${option} ${this.sizeUnit()}`,
    })),
  );
  readonly resetLabel = computed(() => this.translate(t('features.algorithms.toolbar.resetLabel')));
  readonly previousStepLabel = computed(() =>
    this.translate(t('features.algorithms.toolbar.previousStepLabel')),
  );
  readonly nextStepLabel = computed(() =>
    this.translate(t('features.algorithms.toolbar.nextStepLabel')),
  );
  readonly runStateLabel = computed(() =>
    this.translate(t('features.algorithms.toolbar.runStateLabel')),
  );
  readonly counterLabel = computed(() =>
    this.translate(t('features.algorithms.toolbar.counterLabel'), {
      current: this.currentStep(),
      total: this.totalSteps(),
    }),
  );
  readonly viewLabel = computed(() => this.translate(t('features.algorithms.toolbar.viewLabel')));
  readonly datasetSizeLabel = computed(() =>
    this.translate(t('features.algorithms.toolbar.datasetSizeLabel')),
  );
  readonly speedLabel = computed(() => this.translate(t('features.algorithms.toolbar.speedLabel')));

  readonly speedControl = new FormControl(5, { nonNullable: true });
  readonly variantControl = new FormControl<VisualizationVariant>('bar', { nonNullable: true });
  readonly sizeControl = new FormControl(16, { nonNullable: true });

  readonly resetClick = output<void>();
  readonly stepBackClick = output<void>();
  readonly playToggle = output<void>();
  readonly stepForwardClick = output<void>();
  readonly speedChange = output<number>();
  readonly sizeChange = output<number>();
  readonly randomizeClick = output<void>();
  readonly variantChange = output<VisualizationVariant>();

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

    this.speedControl.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((value) => this.speedChange.emit(value));

    this.sizeControl.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((value) => this.sizeChange.emit(value));

    this.variantControl.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((value) => this.variantChange.emit(value));
  }

  transportLabel(): string {
    return this.isPlaying()
      ? this.translate(t('features.algorithms.toolbar.pausePlaybackLabel'))
      : this.translate(t('features.algorithms.toolbar.startPlaybackLabel'));
  }

  private translate(key: string, params?: Record<string, string | number>): string {
    this.language.activeLang();
    return this.transloco.translate(key, params);
  }
}
