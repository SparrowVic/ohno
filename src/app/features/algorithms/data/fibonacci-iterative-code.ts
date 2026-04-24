import { CodeVariantMap } from '../models/detail';
import { buildStructuredCode } from './code-line-builder/code-line-builder';

const FIBONACCI_TS = buildStructuredCode(`
  /**
   * Iterative Fibonacci with a rolling two-value window —
   * O(n) time, O(1) memory.
   */
  //#region fibonacci function open
  function fibonacci(n: number): number {
    //@step 1
    if (n === 0) return 0;
    //@step 2
    if (n === 1) return 1;

    let prev = 0;
    let curr = 1;

    //@step 3
    for (let i = 2; i <= n; i++) {
      //@step 6
      const next = prev + curr;
      //@step 8
      prev = curr;
      curr = next;
    }

    return curr;
  }
  //#endregion fibonacci
`);

export const FIBONACCI_CODE = FIBONACCI_TS.lines;
export const FIBONACCI_CODE_REGIONS = FIBONACCI_TS.regions;
export const FIBONACCI_CODE_HIGHLIGHT_MAP = FIBONACCI_TS.highlightMap;
export const FIBONACCI_CODE_VARIANTS: CodeVariantMap = {
  typescript: {
    language: 'typescript',
    lines: FIBONACCI_TS.lines,
    regions: FIBONACCI_TS.regions,
    highlightMap: FIBONACCI_TS.highlightMap,
    source: FIBONACCI_TS.source,
  },
};
