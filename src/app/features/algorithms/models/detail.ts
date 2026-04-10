export interface LegendItem {
  readonly label: string;
  readonly color: string;
  readonly opacity?: number;
}

export type CodeTokenKind = 'text' | 'kw' | 'fn' | 'str' | 'num' | 'cm' | 'op';

export interface CodeToken {
  readonly kind: CodeTokenKind;
  readonly text: string;
}

export interface CodeLine {
  readonly number: number;
  readonly tokens: readonly CodeToken[];
}

export interface LogEntry {
  readonly step: number;
  readonly description: string;
  readonly timestamp: number;
}
