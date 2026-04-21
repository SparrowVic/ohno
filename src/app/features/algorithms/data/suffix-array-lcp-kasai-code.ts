import { CodeVariantMap } from '../models/detail';
import { buildStructuredCode } from './code-line-builder/code-line-builder';

const SUFFIX_LCP_TS = buildStructuredCode(`
  //#region suffix-lcp function open
  //@step 1
  function buildLcpKasai(text: string, suffixArray: number[]): number[] {
    const n = text.length;
    const rank = Array.from({ length: n }, () => 0);
    const lcp = Array.from({ length: n }, () => 0);

    for (let order = 0; order < n; order += 1) {
      rank[suffixArray[order]!] = order;
    }

    let overlap = 0;
    for (let index = 0; index < n; index += 1) {
      if (rank[index] === n - 1) {
        overlap = 0;
        continue;
      }

      const next = suffixArray[rank[index]! + 1]!;

      //@step 3
      while (
        index + overlap < n &&
        next + overlap < n &&
        text[index + overlap] === text[next + overlap]
      ) {
        overlap += 1;
      }

      lcp[rank[index]!] = overlap;
      if (overlap > 0) overlap -= 1;
    }

    //@step 5
    return lcp;
  }
  //#endregion suffix-lcp
`);

const SUFFIX_LCP_PY = buildStructuredCode(
  `
  """
  Build the LCP array with Kasai's algorithm.
  """
  //#region suffix-lcp function open
  //@step 1
  def build_lcp_kasai(text: str, suffix_array: list[int]) -> list[int]:
      n = len(text)
      rank = [0] * n
      lcp = [0] * n

      for order, index in enumerate(suffix_array):
          rank[index] = order

      overlap = 0
      for index in range(n):
          if rank[index] == n - 1:
              overlap = 0
              continue

          next_index = suffix_array[rank[index] + 1]

          //@step 3
          while (
              index + overlap < n and
              next_index + overlap < n and
              text[index + overlap] == text[next_index + overlap]
          ):
              overlap += 1

          lcp[rank[index]] = overlap
          if overlap > 0:
              overlap -= 1

      //@step 5
      return lcp
  //#endregion suffix-lcp
  `,
  'python',
);

export const SUFFIX_ARRAY_LCP_KASAI_CODE = SUFFIX_LCP_TS.lines;
export const SUFFIX_ARRAY_LCP_KASAI_CODE_REGIONS = SUFFIX_LCP_TS.regions;
export const SUFFIX_ARRAY_LCP_KASAI_CODE_HIGHLIGHT_MAP = SUFFIX_LCP_TS.highlightMap;
export const SUFFIX_ARRAY_LCP_KASAI_CODE_VARIANTS: CodeVariantMap = {
  typescript: {
    language: 'typescript',
    lines: SUFFIX_LCP_TS.lines,
    regions: SUFFIX_LCP_TS.regions,
    highlightMap: SUFFIX_LCP_TS.highlightMap,
    source: SUFFIX_LCP_TS.source,
  },
  python: {
    language: 'python',
    lines: SUFFIX_LCP_PY.lines,
    regions: SUFFIX_LCP_PY.regions,
    highlightMap: SUFFIX_LCP_PY.highlightMap,
    source: SUFFIX_LCP_PY.source,
  },
};
