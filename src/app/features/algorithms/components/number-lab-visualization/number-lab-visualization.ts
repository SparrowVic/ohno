import { ChangeDetectionStrategy, Component, ElementRef, afterRenderEffect, computed, input, viewChild } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { I18N_KEY } from '../../../../core/i18n/i18n-keys';
import { MathText } from '../../../../shared/components/math-text/math-text';
import { MathRenderMode } from '../../../../shared/components/math-text/math-text.utils';
import { OhnoEngraving } from '../../../../shared/instrument/engraving/engraving';
import { I18nTextPipe } from '../../../../shared/pipes/i18n-text.pipe';
import { SortStep } from '../../models/sort-step';
import { keepTapeFocusInView } from '../../utils/helpers/tape-layout/tape-scroll';
import { NotebookRegisterRack } from '../notebook-register-rack/notebook-register-rack';
import { notebookMathMode, notebookRegisters, notebookSpacedTex } from '../notebook-register-rack/notebook-registers.utils';
import { numberLabCellWidth, numberLabFormula, numberLabHistory } from './number-lab-display.utils';

@Component({
  selector: 'app-number-lab-visualization',
  imports: [I18nTextPipe, MathText, NotebookRegisterRack, OhnoEngraving, TranslocoPipe],
  templateUrl: './number-lab-visualization.html',
  styleUrl: './number-lab-visualization.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NumberLabVisualization {
  protected readonly LAB = I18N_KEY.features.algorithms.display.numberLab;
  protected readonly spacedTex = notebookSpacedTex;

  readonly array = input<readonly number[]>([]);
  readonly step = input<SortStep | null>(null);
  readonly speed = input<number>(5);

  private readonly trackRef = viewChild<ElementRef<HTMLElement>>('track');

  protected readonly state = computed(() => this.step()?.numberLab ?? null);
  protected readonly registers = computed(() => notebookRegisters(this.state()?.registers ?? []));
  protected readonly formula = computed(() => numberLabFormula(this.state()?.formula ?? null));
  protected readonly history = computed(() => numberLabHistory(this.state()?.history ?? []));
  protected readonly resultMode = computed<MathRenderMode>(() => {
    const result = this.state()?.resultLabel;
    return result && notebookMathMode(result) === 'math' ? 'math' : 'mixed';
  });
  protected readonly cellWidth = computed(() => numberLabCellWidth(this.history()));

  constructor() {
    afterRenderEffect(() => {
      this.history();
      const track = this.trackRef()?.nativeElement;
      if (track) keepTapeFocusInView(track, track.querySelector<HTMLElement>('[data-current="true"]') ?? track.lastElementChild as HTMLElement | null);
    });
  }
}
