import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { TranslatableText } from '../../../../core/i18n/translatable-text';
import { I18nTextPipe } from '../../../pipes/i18n-text.pipe';
import { OhnoEngraving } from '../../engraving/engraving';
import { OhnoLed } from '../../led/led';
import { TraceFact, TraceValue } from '../trace.types';
import { traceValueText } from '../trace-value.utils';
import { OhnoTraceValue } from '../trace-value/trace-value';

@Component({
  selector: 'ohno-trace-facts',
  imports: [I18nTextPipe, OhnoEngraving, OhnoLed, OhnoTraceValue],
  templateUrl: './trace-facts.html',
  styleUrl: './trace-facts.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OhnoTraceFacts {
  readonly facts = input.required<readonly TraceFact[]>();
  readonly title = input<TranslatableText | null>(null);
  readonly meta = input<TraceValue>(null);

  protected totalText(total: number | string): string {
    return traceValueText(total);
  }
}
