import { CodeVariantMap } from '../models/detail';
import { buildStructuredCode } from './code-line-builder/code-line-builder';

const GCD_TS = buildStructuredCode(`
  /**
   * Euclidean GCD — repeated remainder until the pair collapses.
   * O(log min(a, b)) time, O(1) memory.
   */
  //#region gcd function open
  function gcd(a: number, b: number): number {
    //@step 1
    if (b > a) [a, b] = [b, a];

    //@step 2
    while (b !== 0) {
      //@step 3
      const r = a % b;
      //@step 4
      a = b;
      b = r;
    }

    return a;
  }
  //#endregion gcd
`);

export const EUCLIDEAN_GCD_CODE = GCD_TS.lines;
export const EUCLIDEAN_GCD_CODE_REGIONS = GCD_TS.regions;
export const EUCLIDEAN_GCD_CODE_HIGHLIGHT_MAP = GCD_TS.highlightMap;
export const EUCLIDEAN_GCD_CODE_VARIANTS: CodeVariantMap = {
  typescript: {
    language: 'typescript',
    lines: GCD_TS.lines,
    regions: GCD_TS.regions,
    highlightMap: GCD_TS.highlightMap,
    source: GCD_TS.source,
  },
};
