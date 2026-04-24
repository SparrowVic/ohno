import { CodeVariantMap } from '../models/detail';
import { buildStructuredCode } from './code-line-builder/code-line-builder';

const PAL_TS = buildStructuredCode(`
  /**
   * Palindrome check with symmetric two-pointer scan.
   * O(n / 2) time, O(1) memory.
   */
  //#region palindrome function open
  function isPalindrome(word: string): boolean {
    //@step 1
    let left = 0;
    let right = word.length - 1;

    //@step 2
    while (left < right) {
      //@step 3
      if (word[left] === word[right]) {
        //@step 4
        left += 1;
        right -= 1;
      } else {
        //@step 6
        return false;
      }
    }

    //@step 8
    return true;
  }
  //#endregion palindrome
`);

export const PALINDROME_CODE = PAL_TS.lines;
export const PALINDROME_CODE_REGIONS = PAL_TS.regions;
export const PALINDROME_CODE_HIGHLIGHT_MAP = PAL_TS.highlightMap;
export const PALINDROME_CODE_VARIANTS: CodeVariantMap = {
  typescript: {
    language: 'typescript',
    lines: PAL_TS.lines,
    regions: PAL_TS.regions,
    highlightMap: PAL_TS.highlightMap,
    source: PAL_TS.source,
  },
};
