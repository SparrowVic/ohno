import { TitleCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AlgorithmItem } from '../models/algorithm';

@Component({
  selector: 'app-algorithm-card',
  imports: [RouterLink, TitleCasePipe],
  templateUrl: './algorithm-card.html',
  styleUrl: './algorithm-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlgorithmCard {
  readonly algorithm = input.required<AlgorithmItem>();
}
