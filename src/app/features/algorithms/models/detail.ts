export interface LegendItem {
  readonly label: string;
  readonly color: string;
  readonly opacity?: number;
}

export type CodeLanguage =
  | 'typescript'
  | 'javascript'
  | 'python'
  | 'csharp'
  | 'java'
  | 'cpp'
  | 'go'
  | 'rust'
  | 'swift'
  | 'php'
  | 'kotlin'
  | 'plaintext';
export type CodeRegionKind = 'type' | 'interface' | 'function' | 'method' | 'helper' | 'block';

export type CodeTokenKind = 'text' | 'kw' | 'fn' | 'str' | 'num' | 'cm' | 'op';

export interface CodeToken {
  readonly kind: CodeTokenKind;
  readonly text: string;
}

export interface CodeLine {
  readonly number: number;
  readonly tokens: readonly CodeToken[];
}

export interface CodeRegion {
  readonly id: string;
  readonly kind: CodeRegionKind;
  readonly startLine: number;
  readonly endLine: number;
  readonly collapsedByDefault?: boolean;
}

export interface CodeVariant {
  readonly language: CodeLanguage;
  readonly lines: readonly CodeLine[];
  readonly regions?: readonly CodeRegion[];
  readonly highlightMap?: Readonly<Record<number, number>>;
  readonly source?: string;
}

export type CodeVariantMap = Partial<Record<CodeLanguage, CodeVariant>>;

export interface LogEntry {
  readonly step: number;
  readonly description: string;
  readonly timestamp: number;
}
