import { CodeVariantMap } from '../models/detail';
import { buildStructuredCode } from './code-line-builder/code-line-builder';

const RECURSION_TS = buildStructuredCode(`
  /**
   * Recursive Fibonacci — naive tree recursion. Every call spawns two
   * children until the base case collapses the frames back up. The
   * visualization exposes the live call stack and the unwind trail.
   */
  //#region fib function open
  function fib(n: number): number {
    //@step 1
    if (n <= 1) return n;

    //@step 2
    const left = fib(n - 1);

    //@step 3
    const right = fib(n - 2);

    //@step 4
    return left + right;
  }
  //#endregion fib
`);

export const RECURSION_CALL_STACK_CODE = RECURSION_TS.lines;
export const RECURSION_CALL_STACK_CODE_REGIONS = RECURSION_TS.regions;
export const RECURSION_CALL_STACK_CODE_HIGHLIGHT_MAP = RECURSION_TS.highlightMap;
export const RECURSION_CALL_STACK_CODE_VARIANTS: CodeVariantMap = {
  typescript: {
    language: 'typescript',
    lines: RECURSION_TS.lines,
    regions: RECURSION_TS.regions,
    highlightMap: RECURSION_TS.highlightMap,
    source: RECURSION_TS.source,
  },
};
