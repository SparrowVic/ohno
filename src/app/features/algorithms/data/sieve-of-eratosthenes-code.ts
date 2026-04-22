import { CodeVariantMap } from '../models/detail';
import { buildStructuredCode } from './code-line-builder/code-line-builder';

const SIEVE_TS = buildStructuredCode(`
  /**
   * Sieve of Eratosthenes — marks composites up to n by crossing out
   * every multiple of each found prime. O(n log log n).
   */
  //#region sieveOfEratosthenes function open
  function sieveOfEratosthenes(n: number): number[] {
    //@step 1
    const composite = new Array(n + 1).fill(false);

    //@step 2
    for (let p = 2; p * p <= n; p++) {
      //@step 3
      if (composite[p]) continue;

      //@step 4
      for (let k = p * p; k <= n; k += p) {
        //@step 5
        composite[k] = true;
      }
    }

    //@step 6
    const primes: number[] = [];
    for (let i = 2; i <= n; i++) {
      //@step 7
      if (!composite[i]) primes.push(i);
    }
    return primes;
  }
  //#endregion sieveOfEratosthenes
`);

export const SIEVE_OF_ERATOSTHENES_CODE = SIEVE_TS.lines;
export const SIEVE_OF_ERATOSTHENES_CODE_REGIONS = SIEVE_TS.regions;
export const SIEVE_OF_ERATOSTHENES_CODE_HIGHLIGHT_MAP = SIEVE_TS.highlightMap;
export const SIEVE_OF_ERATOSTHENES_CODE_VARIANTS: CodeVariantMap = {
  typescript: {
    language: 'typescript',
    lines: SIEVE_TS.lines,
    regions: SIEVE_TS.regions,
    highlightMap: SIEVE_TS.highlightMap,
    source: SIEVE_TS.source,
  },
};
