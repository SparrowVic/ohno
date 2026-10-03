import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { isI18nText } from '../../../../core/i18n/translatable-text';
import { MathText } from '../../../components/math-text/math-text';
import { I18nTextPipe } from '../../../pipes/i18n-text.pipe';
import { TraceValue, TraceValueKind } from '../trace.types';
import { resolveTraceValueKind, traceValueText } from '../trace-value.utils';

@Component({
  selector: 'ohno-trace-value',
  imports: [I18nTextPipe, MathText],
  templateUrl: './trace-value.html',
  styleUrl: './trace-value.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-kind]': 'resolvedKind()',
    '[attr.data-dot]': 'dot() ? "" : null',
  },
})
export class OhnoTraceValue {
  readonly value = input<TraceValue>(null);
  readonly kind = input<TraceValueKind>('auto');
  readonly dot = input(false);

  protected readonly resolvedKind = computed(() => resolveTraceValueKind(this.value(), this.kind()));
  protected readonly translatable = computed(() => {
    const value = this.value();
    return isI18nText(value) ? value : null;
  });
  protected readonly text = computed(() => traceValueText(this.value()));
}
