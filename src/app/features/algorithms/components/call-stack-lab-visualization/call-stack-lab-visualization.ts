import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterRenderEffect,
  computed,
  input,
  viewChild,
} from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { I18N_KEY } from '../../../../core/i18n/i18n-keys';
import { MathText } from '../../../../shared/components/math-text/math-text';
import { OhnoEngraving } from '../../../../shared/instrument/engraving/engraving';
import { OhnoRack } from '../../../../shared/instrument/rack/rack';
import { OhnoRackRow } from '../../../../shared/instrument/rack/rack-row/rack-row';
import { I18nTextPipe } from '../../../../shared/pipes/i18n-text.pipe';
import { CallStackLabTraceState } from '../../models/call-stack-lab';
import { SortStep } from '../../models/sort-step';
import { callStackFrames, callStackReturnRows, callStackTopTitle } from './call-stack-display.utils';

@Component({
  selector: 'app-call-stack-lab-visualization',
  imports: [TranslocoPipe, I18nTextPipe, MathText, OhnoEngraving, OhnoRack, OhnoRackRow],
  templateUrl: './call-stack-lab-visualization.html',
  styleUrl: './call-stack-lab-visualization.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CallStackLabVisualization {
  protected readonly CALL_STACK = I18N_KEY.features.algorithms.display.callStack;
  protected readonly RACKS = I18N_KEY.features.algorithms.display.racks;
  protected readonly NOTES = I18N_KEY.features.algorithms.display.notes;

  readonly array = input.required<readonly number[]>();
  readonly step = input<SortStep | null>(null);
  readonly speed = input<number>(5);

  private readonly scrollerRef = viewChild<ElementRef<HTMLElement>>('scroller');

  protected readonly state = computed<CallStackLabTraceState | null>(() => this.step()?.callStackLab ?? null);
  protected readonly frames = computed(() => callStackFrames(this.state()));
  protected readonly returns = computed(() => callStackReturnRows(this.state()));
  protected readonly topTitle = computed(() => callStackTopTitle(this.state()));

  constructor() {
    afterRenderEffect(() => {
      this.frames();
      const scroller = this.scrollerRef()?.nativeElement;
      if (scroller && scroller.scrollTop !== 0) scroller.scrollTop = 0;
    });
  }
}
