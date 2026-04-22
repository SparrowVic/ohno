import { CodeVariantMap } from '../models/detail';
import { buildStructuredCode } from './code-line-builder/code-line-builder';

const SW_TS = buildStructuredCode(`
  /**
   * Fixed-size sliding window — tracks the max-sum window of width k.
   * O(n) time, O(1) memory.
   */
  //#region slidingWindow function open
  function maxWindowSum(values: readonly number[], k: number): number {
    //@step 1
    let sum = 0;
    for (let i = 0; i < k; i++) sum += values[i];

    let best = sum;

    //@step 3
    for (let right = k; right < values.length; right++) {
      //@step 4
      sum = sum - values[right - k] + values[right];

      //@step 5
      if (sum > best) {
        //@step 6
        best = sum;
      } else {
        //@step 7
      }
    }

    //@step 9
    return best;
  }
  //#endregion slidingWindow
`);

export const SLIDING_WINDOW_CODE = SW_TS.lines;
export const SLIDING_WINDOW_CODE_REGIONS = SW_TS.regions;
export const SLIDING_WINDOW_CODE_HIGHLIGHT_MAP = SW_TS.highlightMap;
export const SLIDING_WINDOW_CODE_VARIANTS: CodeVariantMap = {
  typescript: {
    language: 'typescript',
    lines: SW_TS.lines,
    regions: SW_TS.regions,
    highlightMap: SW_TS.highlightMap,
    source: SW_TS.source,
  },
};
