import { CodeVariantMap } from '../models/detail';
import { buildStructuredCode } from './code-line-builder/code-line-builder';

const TP_TS = buildStructuredCode(`
  /**
   * Two-pointer pair-sum search on a sorted array.
   * O(n) time, O(1) memory.
   */
  //#region twoPointers function open
  function findPair(values: readonly number[], target: number): [number, number] | null {
    //@step 1
    let left = 0;
    let right = values.length - 1;

    //@step 2
    while (left < right) {
      //@step 3
      const sum = values[left] + values[right];

      //@step 4
      if (sum === target) {
        //@step 5
        return [left, right];
      }

      //@step 6
      if (sum < target) {
        //@step 7
        left += 1;
      } else {
        //@step 9
        right -= 1;
      }
    }

    //@step 11
    return null;
  }
  //#endregion twoPointers
`);

export const TWO_POINTERS_CODE = TP_TS.lines;
export const TWO_POINTERS_CODE_REGIONS = TP_TS.regions;
export const TWO_POINTERS_CODE_HIGHLIGHT_MAP = TP_TS.highlightMap;
export const TWO_POINTERS_CODE_VARIANTS: CodeVariantMap = {
  typescript: {
    language: 'typescript',
    lines: TP_TS.lines,
    regions: TP_TS.regions,
    highlightMap: TP_TS.highlightMap,
    source: TP_TS.source,
  },
};
