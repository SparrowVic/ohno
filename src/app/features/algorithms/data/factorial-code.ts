import { CodeVariantMap } from '../models/detail';
import { buildStructuredCode } from './code-line-builder/code-line-builder';

const FACTORIAL_TS = buildStructuredCode(`
  /**
   * Factorial via a running accumulator.
   * O(n) time, O(1) memory.
   */
  //#region factorial function open
  function factorial(n: number): number {
    //@step 1
    if (n === 0) return 1;

    //@step 2
    let acc = 1;

    //@step 3
    for (let i = 1; i <= n; i++) {
      //@step 4
      acc = acc * i;
      //@step 5
    }

    return acc;
  }
  //#endregion factorial
`);

export const FACTORIAL_CODE = FACTORIAL_TS.lines;
export const FACTORIAL_CODE_REGIONS = FACTORIAL_TS.regions;
export const FACTORIAL_CODE_HIGHLIGHT_MAP = FACTORIAL_TS.highlightMap;
export const FACTORIAL_CODE_VARIANTS: CodeVariantMap = {
  typescript: {
    language: 'typescript',
    lines: FACTORIAL_TS.lines,
    regions: FACTORIAL_TS.regions,
    highlightMap: FACTORIAL_TS.highlightMap,
    source: FACTORIAL_TS.source,
  },
};
