import { CodeVariantMap } from '../models/detail';
import { buildStructuredCode } from './code-line-builder/code-line-builder';

const BACKTRACK_TS = buildStructuredCode(`
  /**
   * N-Queens via backtracking — place one queen per row, trying each
   * column in order and unwinding as soon as a conflict appears.
   */
  //#region solve function open
  function solve(n: number): number[] | null {
    const cols: number[] = [];

    //#region place function open
    function place(row: number): boolean {
      //@step 1
      if (row === n) return true;

      //@step 2
      for (let col = 0; col < n; col++) {
        //@step 3
        if (!isSafe(cols, row, col)) continue;

        //@step 4
        cols.push(col);
        //@step 5
        if (place(row + 1)) return true;

        //@step 6
        cols.pop();
      }

      //@step 7
      return false;
    }
    //#endregion place

    return place(0) ? cols : null;
  }
  //#endregion solve
`);

export const BACKTRACKING_CODE = BACKTRACK_TS.lines;
export const BACKTRACKING_CODE_REGIONS = BACKTRACK_TS.regions;
export const BACKTRACKING_CODE_HIGHLIGHT_MAP = BACKTRACK_TS.highlightMap;
export const BACKTRACKING_CODE_VARIANTS: CodeVariantMap = {
  typescript: {
    language: 'typescript',
    lines: BACKTRACK_TS.lines,
    regions: BACKTRACK_TS.regions,
    highlightMap: BACKTRACK_TS.highlightMap,
    source: BACKTRACK_TS.source,
  },
};
