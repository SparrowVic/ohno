import { TitleCasePipe } from '@angular/common';
import { Component, input } from '@angular/core';

import { AlgorithmItem } from '../models/algorithm';

@Component({
  selector: 'app-algorithm-card',
  imports: [TitleCasePipe],
  templateUrl: './algorithm-card.html',
  styleUrl: './algorithm-card.scss',
})
export class AlgorithmCard {
  readonly algorithm = input.required<AlgorithmItem>();
}
