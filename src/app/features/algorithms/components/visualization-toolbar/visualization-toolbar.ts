import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

const SIZE_OPTIONS: readonly number[] = [16, 32, 64];

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

  readonly sizeOptions = SIZE_OPTIONS;

  readonly resetClick = output<void>();
  readonly stepBackClick = output<void>();
  readonly playToggle = output<void>();
  readonly stepForwardClick = output<void>();
  readonly speedChange = output<number>();
  readonly sizeChange = output<number>();
  readonly randomizeClick = output<void>();

  onSpeedInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.speedChange.emit(Number(target.value));
  }

  onSizeChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.sizeChange.emit(Number(target.value));
  }
}
