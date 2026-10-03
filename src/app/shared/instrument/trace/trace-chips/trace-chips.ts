import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { TranslatableText } from '../../../../core/i18n/translatable-text';
import { I18nTextPipe } from '../../../pipes/i18n-text.pipe';
import { OhnoEngraving } from '../../engraving/engraving';
import { TraceChip, TraceValue } from '../trace.types';
import { OhnoTraceValue } from '../trace-value/trace-value';

@Component({
  selector: 'ohno-trace-chips',
  imports: [I18nTextPipe, OhnoEngraving, OhnoTraceValue],
  templateUrl: './trace-chips.html',
  styleUrl: './trace-chips.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.ohno-trace-chips--inline]': 'inline()',
  },
})
export class OhnoTraceChips {
  readonly chips = input.required<readonly TraceChip[]>();
  readonly title = input<TranslatableText | null>(null);
  readonly meta = input<TraceValue>(null);
  readonly emptyLabel = input<TranslatableText | null>(null);
  readonly inline = input(false);
}
