import { CodeVariantMap } from '../models/detail';
import { buildStructuredCode } from './code-line-builder/code-line-builder';

const SUFFIX_ARRAY_TS = buildStructuredCode(`
  //#region suffix-array function open
  //@step 1
  function buildSuffixArray(text: string): number[] {
    const n = text.length;
    let suffixArray = Array.from({ length: n }, (_, index) => index);
    let ranks = Array.from(text, (char) => char.charCodeAt(0));

    for (let step = 1; step < n; step *= 2) {
      //@step 2
      const pairs = suffixArray.map((index) => ({
        index,
        first: ranks[index] ?? -1,
        second: index + step < n ? (ranks[index + step] ?? -1) : -1,
      }));

      //@step 3
      pairs.sort((left, right) => {
        if (left.first !== right.first) return left.first - right.first;
        if (left.second !== right.second) return left.second - right.second;
        return left.index - right.index;
      });

      suffixArray = pairs.map((pair) => pair.index);
      const nextRanks = Array.from({ length: n }, () => 0);
      let rank = 0;
      nextRanks[suffixArray[0]!] = 0;

      //@step 4
      for (let order = 1; order < n; order += 1) {
        const current = pairs[order]!;
        const previous = pairs[order - 1]!;
        if (current.first !== previous.first || current.second !== previous.second) {
          rank += 1;
        }
        nextRanks[current.index] = rank;
      }

      ranks = nextRanks;
      if (rank === n - 1) break;
    }

    //@step 6
    return suffixArray;
  }
  //#endregion suffix-array
`);

const SUFFIX_ARRAY_PY = buildStructuredCode(
  `
  """
  Build a suffix array with the prefix-doubling algorithm.
  """
  //#region suffix-array function open
  //@step 1
  def build_suffix_array(text: str) -> list[int]:
      n = len(text)
      suffix_array = list(range(n))
      ranks = [ord(char) for char in text]
      step = 1

      while step < n:
          //@step 2
          pairs = [
              (
                  ranks[index],
                  ranks[index + step] if index + step < n else -1,
                  index,
              )
              for index in suffix_array
          ]

          //@step 3
          pairs.sort()
          suffix_array = [index for _, _, index in pairs]
          next_ranks = [0] * n
          rank = 0
          next_ranks[suffix_array[0]] = 0

          //@step 4
          for order in range(1, n):
              current = pairs[order]
              previous = pairs[order - 1]
              if current[:2] != previous[:2]:
                  rank += 1
              next_ranks[current[2]] = rank

          ranks = next_ranks
          if rank == n - 1:
              break
          step *= 2

      //@step 6
      return suffix_array
  //#endregion suffix-array
  `,
  'python',
);

export const SUFFIX_ARRAY_CONSTRUCTION_CODE = SUFFIX_ARRAY_TS.lines;
export const SUFFIX_ARRAY_CONSTRUCTION_CODE_REGIONS = SUFFIX_ARRAY_TS.regions;
export const SUFFIX_ARRAY_CONSTRUCTION_CODE_HIGHLIGHT_MAP = SUFFIX_ARRAY_TS.highlightMap;
export const SUFFIX_ARRAY_CONSTRUCTION_CODE_VARIANTS: CodeVariantMap = {
  typescript: {
    language: 'typescript',
    lines: SUFFIX_ARRAY_TS.lines,
    regions: SUFFIX_ARRAY_TS.regions,
    highlightMap: SUFFIX_ARRAY_TS.highlightMap,
    source: SUFFIX_ARRAY_TS.source,
  },
  python: {
    language: 'python',
    lines: SUFFIX_ARRAY_PY.lines,
    regions: SUFFIX_ARRAY_PY.regions,
    highlightMap: SUFFIX_ARRAY_PY.highlightMap,
    source: SUFFIX_ARRAY_PY.source,
  },
};
