import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { AlgorithmItem } from '../../models/algorithm';
import { resolvePreviewSpec } from './algorithm-card-preview-spec/algorithm-card-preview-spec';

@Component({
  selector: 'app-algorithm-card-preview',
  templateUrl: './algorithm-card-preview.html',
  styleUrl: './algorithm-card-preview.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlgorithmCardPreview {
  readonly algorithm = input.required<AlgorithmItem>();
  readonly spec = computed(() => resolvePreviewSpec(this.algorithm()));
}
