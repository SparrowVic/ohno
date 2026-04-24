import { CodeVariantMap } from '../models/detail';
import { buildStructuredCode } from './code-line-builder/code-line-builder';

const EXTENDED_EUCLIDEAN_TS = buildStructuredCode(`
  /**
   * Extended Euclidean — returns the gcd of a and b together with
   * integers s, t that satisfy Bézout's identity:
   *   s * a + t * b = gcd(a, b).
   *
   * Classical formulation: run the Euclidean division chain forward,
   * then unwind each equation to express gcd as a linear combination
   * of the original inputs.
   */
  //#region extendedEuclidean function open
  function extendedEuclidean(a: number, b: number): { gcd: number; s: number; t: number } {
    const steps: { dividend: number; divisor: number; quotient: number; remainder: number }[] = [];

    //@step 1
    let x = a;
    let y = b;

    //@step 2
    while (y !== 0) {
      const q = Math.floor(x / y);
      const r = x - q * y;
      steps.push({ dividend: x, divisor: y, quotient: q, remainder: r });

      //@step 3
      if (r === 0) break;

      [x, y] = [y, r];
    }

    //@step 4
    const gcd = steps[steps.length - 1].divisor;

    //@step 5
    // Seed: gcd = dividend_{n-1} - quotient_{n-1} * divisor_{n-1}.
    let s = 1;
    let t = -steps[steps.length - 2].quotient;

    //@step 6
    // Walk back through earlier forward equations, rewriting the
    // inner term each time via divisor = dividend - quotient * r.
    for (let i = steps.length - 3; i >= 0; i--) {
      const { quotient } = steps[i];
      [s, t] = [t, s - quotient * t];
    }

    //@step 7
    return { gcd, s, t };
  }
  //#endregion extendedEuclidean
`);

export const EXTENDED_EUCLIDEAN_CODE = EXTENDED_EUCLIDEAN_TS.lines;
export const EXTENDED_EUCLIDEAN_CODE_REGIONS = EXTENDED_EUCLIDEAN_TS.regions;
export const EXTENDED_EUCLIDEAN_CODE_HIGHLIGHT_MAP = EXTENDED_EUCLIDEAN_TS.highlightMap;
export const EXTENDED_EUCLIDEAN_CODE_VARIANTS: CodeVariantMap = {
  typescript: {
    language: 'typescript',
    lines: EXTENDED_EUCLIDEAN_TS.lines,
    regions: EXTENDED_EUCLIDEAN_TS.regions,
    highlightMap: EXTENDED_EUCLIDEAN_TS.highlightMap,
    source: EXTENDED_EUCLIDEAN_TS.source,
  },
};
