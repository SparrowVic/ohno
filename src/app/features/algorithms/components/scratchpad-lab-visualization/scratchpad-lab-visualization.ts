import { ChangeDetectionStrategy, Component, ElementRef, afterRenderEffect, computed, input, viewChild } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { I18N_KEY } from '../../../../core/i18n/i18n-keys';
import { MathText } from '../../../../shared/components/math-text/math-text';
import { OhnoEngraving } from '../../../../shared/instrument/engraving/engraving';
import { OhnoLed } from '../../../../shared/instrument/led/led';
import { LedColor } from '../../../../shared/instrument/led/led.types';
import { OhnoRack } from '../../../../shared/instrument/rack/rack';
import { I18nTextPipe } from '../../../../shared/pipes/i18n-text.pipe';
import { SortStep } from '../../models/sort-step';
import { prefersReducedMotion } from '../../utils/helpers/visualization-motion/visualization-motion';
import { NotebookRegisterRack } from '../notebook-register-rack/notebook-register-rack';
import { notebookRegisters } from '../notebook-register-rack/notebook-registers.utils';
import { NotebookSectionStatus, notebookMargins, notebookScrollTop, notebookView } from './scratchpad-display.utils';

const SECTION_LEDS: Readonly<Record<NotebookSectionStatus, LedColor>> = {
  done: 'lime',
  current: 'cyan',
  pending: 'slate',
};

@Component({
  selector: 'app-scratchpad-lab-visualization',
  imports: [I18nTextPipe, MathText, NotebookRegisterRack, OhnoEngraving, OhnoLed, OhnoRack, TranslocoPipe],
  templateUrl: './scratchpad-lab-visualization.html',
  styleUrl: './scratchpad-lab-visualization.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScratchpadLabVisualization {
  protected readonly NOTEBOOK = I18N_KEY.features.algorithms.display.notebook;
  protected readonly SECTION_LEDS = SECTION_LEDS;

  readonly array = input<readonly number[]>([]);
  readonly step = input<SortStep | null>(null);
  readonly speed = input<number>(5);

  private readonly scrollerRef = viewChild<ElementRef<HTMLElement>>('scroller');

  protected readonly state = computed(() => this.step()?.scratchpadLab ?? null);
  protected readonly view = computed(() => {
    const state = this.state();
    return state ? notebookView(state) : null;
  });
  protected readonly margins = computed(() => {
    const state = this.state();
    return state ? notebookMargins(state, this.view()?.currentId ?? null) : [];
  });
  protected readonly registers = computed(() => notebookRegisters(this.step()?.numberLab?.registers ?? []));

  constructor() {
    afterRenderEffect(() => {
      const currentId = this.view()?.currentId;
      const scroller = this.scrollerRef()?.nativeElement;
      if (!scroller || !currentId) return;
      const target = scroller.querySelector<HTMLElement>('[data-current="true"]');
      if (!target) return;
      const box = scroller.getBoundingClientRect();
      const rect = target.getBoundingClientRect();
      const top = notebookScrollTop(
        { top: scroller.scrollTop, height: scroller.clientHeight },
        { top: rect.top - box.top + scroller.scrollTop, height: rect.height },
      );
      if (top !== null) scroller.scrollTo({ top, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
    });
  }
}
