import { CodeLanguage, CodeLine, CodeRegion, CodeRegionKind } from '../../models/detail';

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

interface BraceRegion {
  readonly startLine: number;
  readonly endLine: number;
}

/**
 * Scan source code for every balanced multi-line `{...}` block. Each pair
 * becomes an independent fold region — matching how IDEs expose folding
 * around function/method/object bodies automatically. Braces inside
 * strings and comments are skipped. Single-line blocks (both braces on
 * the same line) are not foldable.
 *
 * The `startLine` returned is the DECLARATION start line, not the line
 * where `{` happens to sit. For multi-line signatures like:
 *
 *   function foo(
 *     a,
 *     b,
 *   ): Type {
 *
 * the `{` is on the last line but the declaration starts at
 * `function foo(` — which is where IDEs place the fold caret. We find
 * it by walking back from the `{` position to the first earlier line
 * whose start has paren-depth ≤ current AND brace-depth == current
 * (i.e. the first line not inside an open paren/brace context of our
 * declaration).
 *
 * When multiple brace regions end up mapped to the same declaration
 * line — a function's return-type `{...}` and body `{...}` both resolve
 * back to the `function` line — we keep only the outermost one so the
 * user sees a single fold for the whole construct.
 */
function detectBraceRegions(emittedLines: readonly string[]): readonly BraceRegion[] {
  const parenDepthAtLineStart: number[] = [];
  const braceDepthAtLineStart: number[] = [];

  // Pass 1: snapshot paren/brace depth at the start of every line.
  {
    let paren = 0;
    let brace = 0;
    let inBlockComment = false;

    for (let lineIdx = 0; lineIdx < emittedLines.length; lineIdx += 1) {
      parenDepthAtLineStart.push(paren);
      braceDepthAtLineStart.push(brace);

      const line = emittedLines[lineIdx]!;
      let inString: string | null = null;
      let i = 0;

      while (i < line.length) {
        const ch = line[i]!;
        const next = line[i + 1];

        if (inBlockComment) {
          if (ch === '*' && next === '/') {
            inBlockComment = false;
            i += 2;
          } else {
            i += 1;
          }
          continue;
        }

        if (inString !== null) {
          if (ch === '\\') {
            i += 2;
            continue;
          }
          if (ch === inString) inString = null;
          i += 1;
          continue;
        }

        if (ch === '/' && next === '/') break;
        if (ch === '/' && next === '*') {
          inBlockComment = true;
          i += 2;
          continue;
        }
        if (ch === '"' || ch === "'" || ch === '`') {
          inString = ch;
          i += 1;
          continue;
        }

        if (ch === '(') paren += 1;
        else if (ch === ')') paren -= 1;
        else if (ch === '{') brace += 1;
        else if (ch === '}') brace -= 1;

        i += 1;
      }
    }
  }

  // Pass 2: detect braces and map each `{` back to its declaration line.
  const rawRegions: BraceRegion[] = [];
  {
    const stack: Array<{ declarationStartLine: number }> = [];
    let paren = 0;
    let brace = 0;
    let inBlockComment = false;

    for (let lineIdx = 0; lineIdx < emittedLines.length; lineIdx += 1) {
      const line = emittedLines[lineIdx]!;
      const lineNum = lineIdx + 1;
      let inString: string | null = null;
      let i = 0;

      while (i < line.length) {
        const ch = line[i]!;
        const next = line[i + 1];

        if (inBlockComment) {
          if (ch === '*' && next === '/') {
            inBlockComment = false;
            i += 2;
          } else {
            i += 1;
          }
          continue;
        }

        if (inString !== null) {
          if (ch === '\\') {
            i += 2;
            continue;
          }
          if (ch === inString) inString = null;
          i += 1;
          continue;
        }

        if (ch === '/' && next === '/') break;
        if (ch === '/' && next === '*') {
          inBlockComment = true;
          i += 2;
          continue;
        }
        if (ch === '"' || ch === "'" || ch === '`') {
          inString = ch;
          i += 1;
          continue;
        }

        if (ch === '(') {
          paren += 1;
        } else if (ch === ')') {
          paren -= 1;
        } else if (ch === '{') {
          // Walk back to find the declaration start line. First line whose
          // start is at paren-depth ≤ current and brace-depth == current.
          let declLine = lineNum;
          for (let scanLine = lineNum; scanLine >= 1; scanLine -= 1) {
            if (
              parenDepthAtLineStart[scanLine - 1]! <= paren &&
              braceDepthAtLineStart[scanLine - 1]! === brace
            ) {
              declLine = scanLine;
              break;
            }
          }
          stack.push({ declarationStartLine: declLine });
          brace += 1;
        } else if (ch === '}') {
          brace -= 1;
          const top = stack.pop();
          if (top && top.declarationStartLine < lineNum) {
            rawRegions.push({ startLine: top.declarationStartLine, endLine: lineNum });
          }
        }

        i += 1;
      }
    }
  }

  // Dedupe: if two regions share a declaration startLine (multi-line
  // signatures produce a return-type brace and body brace that both
  // resolve to the same line), keep only the outermost (greatest endLine).
  const bestByStart = new Map<number, BraceRegion>();
  for (const region of rawRegions) {
    const existing = bestByStart.get(region.startLine);
    if (!existing || region.endLine > existing.endLine) {
      bestByStart.set(region.startLine, region);
    }
  }

  return [...bestByStart.values()].sort((a, b) => a.startLine - b.startLine);
}

/**
 * Detect multi-line comments / docstrings that span more than one line
 * and expose them as fold regions. Language-aware:
 *
 *   - C-style languages (TS/JS/Java/Go/C/C++/Rust, etc.): `/* ... *\/`
 *   - Python: triple-quoted strings (`"""` or `'''`), which double as
 *     docstrings and are canonically foldable in Python editors.
 *
 * Single-line comments/docstrings are ignored — only multi-line spans
 * produce a region.
 */
function detectCommentRegions(
  emittedLines: readonly string[],
  language: CodeLanguage,
): readonly BraceRegion[] {
  if (language === 'python') {
    return detectPythonDocstringRegions(emittedLines);
  }
  return detectCStyleBlockComments(emittedLines);
}

function detectCStyleBlockComments(lines: readonly string[]): readonly BraceRegion[] {
  const regions: BraceRegion[] = [];
  let commentStartLine: number | null = null;
  let inBlockComment = false;

  for (let lineIdx = 0; lineIdx < lines.length; lineIdx += 1) {
    const line = lines[lineIdx]!;
    const lineNum = lineIdx + 1;
    let inString: string | null = null;
    let i = 0;

    while (i < line.length) {
      const ch = line[i]!;
      const next = line[i + 1];

      if (inBlockComment) {
        if (ch === '*' && next === '/') {
          if (commentStartLine !== null && commentStartLine < lineNum) {
            regions.push({ startLine: commentStartLine, endLine: lineNum });
          }
          commentStartLine = null;
          inBlockComment = false;
          i += 2;
        } else {
          i += 1;
        }
        continue;
      }

      if (inString !== null) {
        if (ch === '\\') {
          i += 2;
          continue;
        }
        if (ch === inString) inString = null;
        i += 1;
        continue;
      }

      if (ch === '/' && next === '/') break;
      if (ch === '/' && next === '*') {
        inBlockComment = true;
        commentStartLine = lineNum;
        i += 2;
        continue;
      }
      if (ch === '"' || ch === "'" || ch === '`') {
        inString = ch;
        i += 1;
        continue;
      }

      i += 1;
    }
  }

  return regions;
}

function detectPythonDocstringRegions(lines: readonly string[]): readonly BraceRegion[] {
  const regions: BraceRegion[] = [];
  let tripleStartLine: number | null = null;
  let tripleQuote: '"""' | "'''" | null = null;

  for (let lineIdx = 0; lineIdx < lines.length; lineIdx += 1) {
    const line = lines[lineIdx]!;
    const lineNum = lineIdx + 1;
    let i = 0;

    while (i < line.length) {
      if (tripleQuote !== null) {
        if (line.substring(i, i + 3) === tripleQuote) {
          if (tripleStartLine !== null && tripleStartLine < lineNum) {
            regions.push({ startLine: tripleStartLine, endLine: lineNum });
          }
          tripleStartLine = null;
          tripleQuote = null;
          i += 3;
          continue;
        }
        if (line[i] === '\\') {
          i += 2;
        } else {
          i += 1;
        }
        continue;
      }

      if (line[i] === '#') break;

      if (line.substring(i, i + 3) === '"""') {
        tripleQuote = '"""';
        tripleStartLine = lineNum;
        i += 3;
        continue;
      }
      if (line.substring(i, i + 3) === "'''") {
        tripleQuote = "'''";
        tripleStartLine = lineNum;
        i += 3;
        continue;
      }

      if (line[i] === '"' || line[i] === "'") {
        const quote = line[i]!;
        i += 1;
        while (i < line.length && line[i] !== quote) {
          if (line[i] === '\\') {
            i += 2;
          } else {
            i += 1;
          }
        }
        if (i < line.length) i += 1;
        continue;
      }

      i += 1;
    }
  }

  return regions;
}

/**
 * An auto-detected brace region inherits `collapsedByDefault` from the
 * innermost enclosing explicit `//#region` — but only if it's the
 * OUTERMOST auto-region inside that explicit scope. Nested blocks (a
 * while inside a function body) default to expanded, matching IDE
 * behavior where only top-level declarations are folded on init.
 */
function inheritsCollapsedDefault(
  auto: BraceRegion,
  explicitRegions: readonly CodeRegion[],
  autoRegions: readonly BraceRegion[],
): boolean {
  let innermost: CodeRegion | null = null;
  for (const ex of explicitRegions) {
    if (ex.startLine <= auto.startLine && ex.endLine >= auto.endLine) {
      if (!innermost || ex.startLine > innermost.startLine || ex.endLine < innermost.endLine) {
        innermost = ex;
      }
    }
  }

  if (!innermost || !innermost.collapsedByDefault) {
    return false;
  }

  for (const other of autoRegions) {
    if (other === auto) continue;
    if (other.startLine === auto.startLine && other.endLine === auto.endLine) continue;
    const encloses = other.startLine <= auto.startLine && other.endLine >= auto.endLine;
    const insideInnermost =
      other.startLine >= innermost.startLine && other.endLine <= innermost.endLine;
    if (encloses && insideInnermost) {
      return false;
    }
  }

  return true;
}

export function buildStructuredCode(
  source: string,
  language: CodeLanguage = 'typescript',
): StructuredCode {
  const emittedLines: string[] = [];
  const explicitRegions: CodeRegion[] = [];
  const highlightMap: Record<number, number> = {};
  const regionStack: RegionDraft[] = [];

  let pendingSteps: number[] = [];

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
        explicitRegions.push({
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
      pendingSteps.push(Number(stepDirective[1]));
      continue;
    }

    emittedLines.push(rawLine);
    if (pendingSteps.length > 0) {
      for (const step of pendingSteps) {
        highlightMap[step] = emittedLines.length;
      }
      pendingSteps = [];
    }
  }

  if (regionStack.length > 0) {
    const pendingRegions = regionStack.map((region) => region.id).join(', ');
    throw new Error(`Unclosed code regions: ${pendingRegions}`);
  }

  const braceRegions = detectBraceRegions(emittedLines);
  const commentRegions = detectCommentRegions(emittedLines, language);
  // Filter out any comment region that collides with a brace region's
  // declaration line — should essentially never happen, but defensively
  // avoids two fold toggles fighting over the same gutter slot.
  const commentRegionsSafe = commentRegions.filter(
    (cr) => !braceRegions.some((br) => br.startLine === cr.startLine),
  );
  const autoFoldRegions = [...braceRegions, ...commentRegionsSafe];

  let regions: CodeRegion[];

  if (autoFoldRegions.length === 0) {
    // Nothing auto-detected (e.g. Python file with no docstrings and no
    // brace blocks): fall back to explicit `//#region` markers.
    regions = explicitRegions;
  } else {
    // Auto-detected languages: every brace block and every multi-line
    // comment/docstring is its own fold region. Explicit `//#region`
    // markers that cleanly wrap a single top-level block are "promoted"
    // — the auto region adopts the explicit's id/kind/collapsedByDefault
    // so named regions keep their metadata. Explicit markers that wrap
    // multiple top-level blocks (pure grouping) are dropped so each
    // inner block folds independently.
    const autoToPromoted = new Map<BraceRegion, CodeRegion>();
    const promotedExplicits = new Set<CodeRegion>();

    for (const ex of explicitRegions) {
      const topLevelAutosInEx = autoFoldRegions.filter((br) => {
        if (br.startLine < ex.startLine || br.endLine > ex.endLine) {
          return false;
        }
        return !autoFoldRegions.some(
          (other) =>
            other !== br &&
            other.startLine >= ex.startLine &&
            other.endLine <= ex.endLine &&
            other.startLine <= br.startLine &&
            other.endLine >= br.endLine &&
            (other.startLine !== br.startLine || other.endLine !== br.endLine),
        );
      });

      if (topLevelAutosInEx.length === 1) {
        autoToPromoted.set(topLevelAutosInEx[0]!, ex);
        promotedExplicits.add(ex);
      }
    }

    const commentRegionSet = new Set<BraceRegion>(commentRegionsSafe);

    const autoAsCode: CodeRegion[] = autoFoldRegions.map((auto) => {
      const promoted = autoToPromoted.get(auto);
      if (promoted) {
        return {
          id: promoted.id,
          kind: promoted.kind,
          startLine: promoted.startLine,
          endLine: promoted.endLine,
          collapsedByDefault: promoted.collapsedByDefault,
        };
      }
      const isComment = commentRegionSet.has(auto);
      return {
        id: `${isComment ? 'comment' : 'auto'}-${auto.startLine}-${auto.endLine}`,
        kind: isComment ? 'helper' : 'block',
        startLine: auto.startLine,
        endLine: auto.endLine,
        collapsedByDefault: inheritsCollapsedDefault(auto, explicitRegions, autoFoldRegions),
      };
    });

    // Keep explicit regions that weren't promoted and don't contain any
    // auto-detected blocks (e.g., a `//#region` wrapping plain declarations).
    const explicitKeep = explicitRegions.filter(
      (ex) =>
        !promotedExplicits.has(ex) &&
        !autoFoldRegions.some((br) => br.startLine >= ex.startLine && br.endLine <= ex.endLine),
    );

    regions = [...autoAsCode, ...explicitKeep];
  }

  return {
    language,
    source: emittedLines.join('\n'),
    lines: makeTextCodeLines(emittedLines),
    regions,
    highlightMap,
  };
}
