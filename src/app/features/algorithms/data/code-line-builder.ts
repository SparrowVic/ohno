import { CodeLanguage, CodeLine, CodeRegion, CodeRegionKind } from '../models/detail';

export function makeTextCodeLines(lines: readonly string[]): readonly CodeLine[] {
  return lines.map((text, index) => ({
    number: index + 1,
    tokens: [{ kind: 'text', text }],
  }));
}

export interface StructuredCode {
  readonly language: CodeLanguage;
  readonly source: string;
  readonly lines: readonly CodeLine[];
  readonly regions: readonly CodeRegion[];
  readonly highlightMap: Readonly<Record<number, number>>;
}

interface RegionDraft {
  readonly id: string;
  readonly kind: CodeRegionKind;
  readonly collapsedByDefault: boolean;
  readonly startLine: number;
}

const REGION_START_RE =
  /^\s*\/\/#region\s+([a-z0-9-]+)\s+(type|interface|function|method|helper|block)(?:\s+(collapsed|open))?\s*$/i;
const REGION_END_RE = /^\s*\/\/#endregion(?:\s+([a-z0-9-]+))?\s*$/i;
const STEP_RE = /^\s*\/\/@step\s+(\d+)\s*$/i;

function dedent(source: string): string {
  const normalized = source.replace(/\r\n/g, '\n').replace(/\t/g, '  ');
  const trimmed = normalized.replace(/^\n+/, '').replace(/\n+\s*$/, '');
  const lines = trimmed.split('\n');
  const indents = lines
    .filter((line) => line.trim().length > 0)
    .map((line) => line.match(/^ */)?.[0].length ?? 0);
  const baseIndent = indents.length > 0 ? Math.min(...indents) : 0;

  return lines.map((line) => line.slice(baseIndent)).join('\n');
}

export function buildStructuredCode(source: string, language: CodeLanguage = 'typescript'): StructuredCode {
  const emittedLines: string[] = [];
  const regions: CodeRegion[] = [];
  const highlightMap: Record<number, number> = {};
  const regionStack: RegionDraft[] = [];

  let pendingStep: number | null = null;

  for (const rawLine of dedent(source).split('\n')) {
    const regionStart = rawLine.match(REGION_START_RE);
    if (regionStart) {
      regionStack.push({
        id: regionStart[1]!.toLowerCase(),
        kind: regionStart[2]!.toLowerCase() as CodeRegionKind,
        collapsedByDefault: regionStart[3]?.toLowerCase() !== 'open',
        startLine: emittedLines.length + 1,
      });
      continue;
    }

    const regionEnd = rawLine.match(REGION_END_RE);
    if (regionEnd) {
      const draft = regionStack.pop();
      if (!draft) {
        throw new Error(`Unexpected //#endregion without matching //#region in code snippet.`);
      }

      const explicitId = regionEnd[1]?.toLowerCase();
      if (explicitId && explicitId !== draft.id) {
        throw new Error(`Mismatched //#endregion ${explicitId} for region ${draft.id}.`);
      }

      if (emittedLines.length >= draft.startLine) {
        regions.push({
          id: draft.id,
          kind: draft.kind,
          startLine: draft.startLine,
          endLine: emittedLines.length,
          collapsedByDefault: draft.collapsedByDefault,
        });
      }
      continue;
    }

    const stepDirective = rawLine.match(STEP_RE);
    if (stepDirective) {
      pendingStep = Number(stepDirective[1]);
      continue;
    }

    emittedLines.push(rawLine);
    if (pendingStep !== null) {
      highlightMap[pendingStep] = emittedLines.length;
      pendingStep = null;
    }
  }

  if (regionStack.length > 0) {
    const pendingRegions = regionStack.map((region) => region.id).join(', ');
    throw new Error(`Unclosed code regions: ${pendingRegions}`);
  }

  return {
    language,
    source: emittedLines.join('\n'),
    lines: makeTextCodeLines(emittedLines),
    regions,
    highlightMap,
  };
}
