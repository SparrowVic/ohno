import { I18nText, TranslatableText } from '../../../core/i18n/translatable-text';

export type TraceTone = 'cyan' | 'pink' | 'lime' | 'violet' | 'amber' | 'red' | 'slate';

export type TraceValue = string | number | I18nText | null | undefined;

export type TraceValueKind = 'auto' | 'number' | 'mono' | 'text' | 'math';

export type ResolvedTraceValueKind = Exclude<TraceValueKind, 'auto'> | 'i18n' | 'empty';

export interface TraceFact {
  readonly id: string;
  readonly label: TranslatableText;
  readonly value: TraceValue;
  readonly total?: number | string | null;
  readonly kind?: TraceValueKind;
  readonly tone?: TraceTone | null;
  readonly wide?: boolean;
}

export interface TraceChip {
  readonly id: string | number;
  readonly label: TraceValue;
  readonly tone?: TraceTone | null;
  readonly active?: boolean;
  readonly dim?: boolean;
  readonly kind?: 'mono' | 'math';
}

export type TraceColumnAlign = 'start' | 'center' | 'end';

export interface TraceColumn {
  readonly id: string;
  readonly header: TranslatableText;
  readonly kind?: TraceValueKind | 'chips';
  readonly align?: TraceColumnAlign;
  readonly width?: string;
}

export type TraceCell = TraceValue | readonly TraceChip[];

export interface TraceRow {
  readonly id: string | number;
  readonly tone?: TraceTone | null;
  readonly dim?: boolean;
  readonly cells: Readonly<Record<string, TraceCell>>;
}
