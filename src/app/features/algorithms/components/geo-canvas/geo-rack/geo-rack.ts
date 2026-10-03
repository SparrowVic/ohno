import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterRenderEffect,
  input,
  viewChild,
} from '@angular/core';

import { TranslatableText } from '../../../../../core/i18n/translatable-text';
import { OhnoLed } from '../../../../../shared/instrument/led/led';
import { OhnoRack } from '../../../../../shared/instrument/rack/rack';
import { OhnoRackRow } from '../../../../../shared/instrument/rack/rack-row/rack-row';
import { I18nTextPipe } from '../../../../../shared/pipes/i18n-text.pipe';
import { prefersReducedMotion } from '../../../utils/helpers/visualization-motion/visualization-motion';
import { GeoRackRow } from '../plane-display.utils';

const FOLLOW_MARGIN = 6;

@Component({
  selector: 'app-geo-rack',
  imports: [I18nTextPipe, OhnoLed, OhnoRack, OhnoRackRow],
  templateUrl: './geo-rack.html',
  styleUrl: './geo-rack.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GeoRack {
  readonly title = input.required<TranslatableText>();
  readonly meta = input<TranslatableText | null>(null);
  readonly rows = input.required<readonly GeoRackRow[]>();
  readonly empty = input<TranslatableText | null>(null);

  private readonly scrollerRef = viewChild<ElementRef<HTMLElement>>('scroller');

  constructor() {
    afterRenderEffect(() => {
      this.rows();
      const scroller = this.scrollerRef()?.nativeElement;
      const current = scroller?.querySelector<HTMLElement>('[data-current="true"]');
      if (!scroller || !current) return;
      const top = current.offsetTop - scroller.offsetTop;
      const bottom = top + current.offsetHeight;
      const target =
        top < scroller.scrollTop
          ? top - FOLLOW_MARGIN
          : bottom > scroller.scrollTop + scroller.clientHeight
            ? bottom - scroller.clientHeight + FOLLOW_MARGIN
            : null;
      if (target === null) return;
      scroller.scrollTo({ top: Math.max(0, target), behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
    });
  }
}
