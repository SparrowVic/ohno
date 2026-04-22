import { CodeVariantMap } from '../models/detail';
import { buildStructuredCode } from './code-line-builder/code-line-builder';

const REV_TS = buildStructuredCode(`
  /**
   * In-place reversal of a string / array with mirrored pointers.
   * O(n / 2) time, O(1) memory.
   */
  //#region reverse function open
  function reverse<T>(values: T[]): T[] {
    //@step 1
    let left = 0;
    let right = values.length - 1;

    //@step 2
    while (left < right) {
      //@step 3
      const tmp = values[left];
      values[left] = values[right];
      values[right] = tmp;

      //@step 4
      left += 1;
      right -= 1;
    }

    //@step 6
    return values;
  }
  //#endregion reverse
`);

export const REVERSE_CODE = REV_TS.lines;
export const REVERSE_CODE_REGIONS = REV_TS.regions;
export const REVERSE_CODE_HIGHLIGHT_MAP = REV_TS.highlightMap;
export const REVERSE_CODE_VARIANTS: CodeVariantMap = {
  typescript: {
    language: 'typescript',
    lines: REV_TS.lines,
    regions: REV_TS.regions,
    highlightMap: REV_TS.highlightMap,
    source: REV_TS.source,
  },
};
