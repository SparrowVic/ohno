import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

import { VisualizationVariant } from '../../models/visualization-renderer';

const SIZE_OPTIONS: readonly number[] = [16, 32, 64];

interface VariantOption {
  readonly value: VisualizationVariant;
  readonly label: string;
}

const VARIANT_OPTIONS: readonly VariantOption[] = [
  { value: 'bar', label: 'Bar Chart' },
  { value: 'block', label: 'Block Swap' },
  { value: 'gradient', label: 'Color Gradient' },
  { value: 'dot', label: 'Dot Plot' },
  { value: 'radial', label: 'Radial Circle' },
  { value: 'sound', label: 'Sound Bars' },
];

@Component({
  selector: 'app-visualization-toolbar',
  imports: [],
  templateUrl: './visualization-toolbar.html',
  styleUrl: './visualization-toolbar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VisualizationToolbar {
  readonly isPlaying = input.required<boolean>();
  readonly speed = input.required<number>();
  readonly currentStep = input.required<number>();
  readonly totalSteps = input.required<number>();
  readonly size = input.required<number>();
  readonly variant = input.required<VisualizationVariant>();
  readonly muted = input<boolean>(true);

  readonly sizeOptions = SIZE_OPTIONS;
  readonly variantOptions = VARIANT_OPTIONS;

  readonly canStepBack = computed(() => this.currentStep() > 0);
  readonly canStepForward = computed(() => this.currentStep() < this.totalSteps());

  readonly resetClick = output<void>();
  readonly stepBackClick = output<void>();
  readonly playToggle = output<void>();
  readonly stepForwardClick = output<void>();
  readonly speedChange = output<number>();
  readonly sizeChange = output<number>();
  readonly randomizeClick = output<void>();
  readonly variantChange = output<VisualizationVariant>();
  readonly muteToggle = output<void>();

  onSpeedInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.speedChange.emit(Number(target.value));
  }

  onSizeChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.sizeChange.emit(Number(target.value));
  }

  onVariantChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.variantChange.emit(target.value as VisualizationVariant);
  }
}
