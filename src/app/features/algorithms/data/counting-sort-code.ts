import { CodeVariantMap } from '../models/detail';
import { buildStructuredCode } from './code-line-builder';

const COUNTING_SORT_TS = buildStructuredCode(`
  /**
   * Sort non-negative integers with counting sort.
   * Input: mutable array of integers in a compact range.
   * Returns: the same array after in-place sorting.
   */
  //#region counting-sort function open
  //@step 1
  function countingSort(values: number[]): number[] {
    const maxValue = Math.max(0, ...values);
    const counts = Array.from({ length: maxValue + 1 }, () => 0);

    for (const value of values) {
      //@step 5
      counts[value] += 1;
    }

    let write = 0;
    for (let value = 0; value <= maxValue; value += 1) {
      while (counts[value] > 0) {
        //@step 10
        values[write] = value;
        write += 1;
        counts[value] -= 1;
      }
    }

    //@step 15
    return values;
  }
  //#endregion counting-sort
`);

const COUNTING_SORT_PY = buildStructuredCode(
  `
  """
  Sort non-negative integers with counting sort.
  Input: mutable list of integers in a compact range.
  Returns: the same list after in-place sorting.
  """
  //#region counting-sort function open
  //@step 1
  def counting_sort(values: list[int]) -> list[int]:
      max_value = max([0, *values])
      counts = [0] * (max_value + 1)

      for value in values:
          //@step 5
          counts[value] += 1

      write = 0
      for value in range(max_value + 1):
          while counts[value] > 0:
              //@step 10
              values[write] = value
              write += 1
              counts[value] -= 1

      //@step 15
      return values
  //#endregion counting-sort
  `,
  'python',
);

const COUNTING_SORT_CS = buildStructuredCode(
  `
  using System;
  using System.Linq;

  /// <summary>
  /// Sorts non-negative integers with counting sort.
  /// Input: mutable array of integers in a compact range.
  /// Returns: the same array after in-place sorting.
  /// </summary>
  //#region counting-sort function open
  //@step 1
  public static int[] CountingSort(int[] values)
  {
      var maxValue = Math.Max(0, values.Length == 0 ? 0 : values.Max());
      var counts = new int[maxValue + 1];

      foreach (var value in values)
      {
          //@step 5
          counts[value] += 1;
      }

      var write = 0;
      for (var value = 0; value <= maxValue; value += 1)
      {
          while (counts[value] > 0)
          {
              //@step 10
              values[write] = value;
              write += 1;
              counts[value] -= 1;
          }
      }

      //@step 15
      return values;
  }
  //#endregion counting-sort
  `,
  'csharp',
);

const COUNTING_SORT_JAVA = buildStructuredCode(
  `
  /**
   * Sorts non-negative integers with counting sort.
   * Input: mutable array of integers in a compact range.
   * Returns: the same array after in-place sorting.
   */
  //#region counting-sort function open
  //@step 1
  public static int[] countingSort(int[] values) {
      int maxValue = 0;
      for (int value : values) {
          maxValue = Math.max(maxValue, value);
      }

      int[] counts = new int[maxValue + 1];

      for (int value : values) {
          //@step 5
          counts[value] += 1;
      }

      int write = 0;
      for (int value = 0; value <= maxValue; value += 1) {
          while (counts[value] > 0) {
              //@step 10
              values[write] = value;
              write += 1;
              counts[value] -= 1;
          }
      }

      //@step 15
      return values;
  }
  //#endregion counting-sort
  `,
  'java',
);

const COUNTING_SORT_CPP = buildStructuredCode(
  `
  #include <algorithm>
  #include <vector>

  /**
   * Sorts non-negative integers with counting sort.
   * Input: mutable vector of integers in a compact range.
   * Returns: the same vector after in-place sorting.
   */
  //#region counting-sort function open
  //@step 1
  std::vector<int> countingSort(std::vector<int> values) {
      int maxValue = values.empty() ? 0 : *std::max_element(values.begin(), values.end());
      std::vector<int> counts(maxValue + 1, 0);

      for (int value : values) {
          //@step 5
          counts[value] += 1;
      }

      int write = 0;
      for (int value = 0; value <= maxValue; value += 1) {
          while (counts[value] > 0) {
              //@step 10
              values[write] = value;
              write += 1;
              counts[value] -= 1;
          }
      }

      //@step 15
      return values;
  }
  //#endregion counting-sort
  `,
  'cpp',
);

export const COUNTING_SORT_CODE = COUNTING_SORT_TS.lines;
export const COUNTING_SORT_CODE_REGIONS = COUNTING_SORT_TS.regions;
export const COUNTING_SORT_CODE_HIGHLIGHT_MAP = COUNTING_SORT_TS.highlightMap;
export const COUNTING_SORT_CODE_VARIANTS: CodeVariantMap = {
  typescript: {
    language: 'typescript',
    lines: COUNTING_SORT_TS.lines,
    regions: COUNTING_SORT_TS.regions,
    highlightMap: COUNTING_SORT_TS.highlightMap,
    source: COUNTING_SORT_TS.source,
  },
  python: {
    language: 'python',
    lines: COUNTING_SORT_PY.lines,
    regions: COUNTING_SORT_PY.regions,
    highlightMap: COUNTING_SORT_PY.highlightMap,
    source: COUNTING_SORT_PY.source,
  },
  csharp: {
    language: 'csharp',
    lines: COUNTING_SORT_CS.lines,
    regions: COUNTING_SORT_CS.regions,
    highlightMap: COUNTING_SORT_CS.highlightMap,
    source: COUNTING_SORT_CS.source,
  },
  java: {
    language: 'java',
    lines: COUNTING_SORT_JAVA.lines,
    regions: COUNTING_SORT_JAVA.regions,
    highlightMap: COUNTING_SORT_JAVA.highlightMap,
    source: COUNTING_SORT_JAVA.source,
  },
  cpp: {
    language: 'cpp',
    lines: COUNTING_SORT_CPP.lines,
    regions: COUNTING_SORT_CPP.regions,
    highlightMap: COUNTING_SORT_CPP.highlightMap,
    source: COUNTING_SORT_CPP.source,
  },
};
