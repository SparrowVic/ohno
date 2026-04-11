import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

import { VisualizationOption } from '../../models/visualization-option';
import { VisualizationVariant } from '../../models/visualization-renderer';

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
  readonly sizeOptions = input<readonly number[]>([]);
  readonly variantOptions = input<readonly VisualizationOption[]>([]);

  readonly canStepBack = computed(() => this.currentStep() > 0);
  readonly canStepForward = computed(() => this.currentStep() < this.totalSteps());
  readonly hasVariantChoice = computed(() => this.variantOptions().length > 1);

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
