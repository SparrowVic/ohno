import { TranslatableText } from '../../../../core/i18n/translatable-text';
import { TraceChip } from '../../../../shared/instrument/trace/trace.types';
import { toTraceValue } from '../../../../shared/instrument/trace/trace-value.utils';
import { GeometryEventChip } from '../../models/geometry';

export function geometryEventChips(
  events: readonly GeometryEventChip[],
  label: (event: GeometryEventChip) => TranslatableText = (event) => event.label,
): readonly TraceChip[] {
  return events.map((event) => ({
    id: event.id,
    label: toTraceValue(label(event)),
    tone: event.tone === 'current' ? 'cyan' : event.tone === 'done' ? 'lime' : null,
    active: event.tone === 'current',
    dim: event.tone === 'done',
  }));
}

export function formatCoordPair(x: number | undefined, y: number | undefined): string {
  const format = (value: number | undefined) => (value === undefined ? '—' : value.toFixed(1));
  return `(${format(x)}, ${format(y)})`;
}
