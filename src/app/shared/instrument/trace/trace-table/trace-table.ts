import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { TranslatableText } from '../../../../core/i18n/translatable-text';
import { I18nTextPipe } from '../../../pipes/i18n-text.pipe';
import { OhnoEngraving } from '../../engraving/engraving';
import { OhnoTraceChips } from '../trace-chips/trace-chips';
import { TraceCell, TraceChip, TraceColumn, TraceRow, TraceValue, TraceValueKind } from '../trace.types';
import { isTraceChipList } from '../trace-value.utils';
import { OhnoTraceValue } from '../trace-value/trace-value';

@Component({
  selector: 'ohno-trace-table',
  imports: [I18nTextPipe, OhnoEngraving, OhnoTraceChips, OhnoTraceValue],
  templateUrl: './trace-table.html',
  styleUrl: './trace-table.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[style.--trace-table-max-height]': 'maxHeight()',
  },
})
export class OhnoTraceTable {
  readonly columns = input.required<readonly TraceColumn[]>();
  readonly rows = input.required<readonly TraceRow[]>();
  readonly title = input.required<TranslatableText>();
  readonly meta = input<TraceValue>(null);
  readonly emptyLabel = input<TranslatableText | null>(null);
  readonly maxHeight = input<string | null>(null);

  protected chipsOf(cell: TraceCell): readonly TraceChip[] | null {
    return isTraceChipList(cell) ? cell : null;
  }

  protected valueOf(cell: TraceCell): TraceValue {
    return isTraceChipList(cell) ? null : cell;
  }

  protected kindOf(column: TraceColumn): TraceValueKind {
    return column.kind === 'chips' || column.kind === undefined ? 'auto' : column.kind;
  }
}
