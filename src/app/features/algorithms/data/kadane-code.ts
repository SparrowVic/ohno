import { CodeVariantMap } from '../models/detail';
import { buildStructuredCode } from './code-line-builder/code-line-builder';

const KADANE_TS = buildStructuredCode(`
  /**
   * Kadane's algorithm — maximum subarray sum in O(n). At each index
   * the current sum is either "extended" with the new value or
   * "restarted" fresh from it, whichever is larger.
   */
  //#region kadane function open
  function kadane(values: number[]): { sum: number; left: number; right: number } {
    //@step 1
    let best = values[0];
    let current = values[0];
    let bestLeft = 0;
    let bestRight = 0;
    let currentLeft = 0;

    //@step 2
    for (let i = 1; i < values.length; i++) {
      //@step 3
      if (values[i] > current + values[i]) {
        //@step 4
        current = values[i];
        currentLeft = i;
      } else {
        //@step 5
        current = current + values[i];
      }

      //@step 6
      if (current > best) {
        //@step 7
        best = current;
        bestLeft = currentLeft;
        bestRight = i;
      }
    }

    //@step 8
    return { sum: best, left: bestLeft, right: bestRight };
  }
  //#endregion kadane
`);

export const KADANE_CODE = KADANE_TS.lines;
export const KADANE_CODE_REGIONS = KADANE_TS.regions;
export const KADANE_CODE_HIGHLIGHT_MAP = KADANE_TS.highlightMap;
export const KADANE_CODE_VARIANTS: CodeVariantMap = {
  typescript: {
    language: 'typescript',
    lines: KADANE_TS.lines,
    regions: KADANE_TS.regions,
    highlightMap: KADANE_TS.highlightMap,
    source: KADANE_TS.source,
  },
};
