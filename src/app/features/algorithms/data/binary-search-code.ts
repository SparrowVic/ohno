import { CodeVariantMap } from '../models/detail';
import { buildStructuredCode } from './code-line-builder/code-line-builder';

const BINARY_SEARCH_TS = buildStructuredCode(`
  /**
   * Search a sorted array for an exact target value.
   * Input: sorted array of numbers and a target number.
   * Returns: matching index, or -1 when absent.
   */
  //#region binary-search function open
  //@step 1
  function binarySearch(values: readonly number[], target: number): number {
    let low = 0;
    let high = values.length - 1;

    //@step 3
    while (low <= high) {
      const middle = Math.floor((low + high) / 2);

      //@step 5
      if (values[middle] === target) {
        return middle;
      }

      if (values[middle] < target) {
        //@step 8
        low = middle + 1;
      } else {
        //@step 10
        high = middle - 1;
      }
    }

    //@step 12
    return -1;
  }
  //#endregion binary-search
`);

const BINARY_SEARCH_PY = buildStructuredCode(
  `
  """
  Search a sorted array for an exact target value.
  Input: sorted list of numbers and a target number.
  Returns: matching index, or -1 when absent.
  """
  //#region binary-search function open
  //@step 1
  def binary_search(values: list[int], target: int) -> int:
      low = 0
      high = len(values) - 1

      //@step 3
      while low <= high:
          middle = (low + high) // 2

          //@step 5
          if values[middle] == target:
              return middle

          if values[middle] < target:
              //@step 8
              low = middle + 1
          else:
              //@step 10
              high = middle - 1

      //@step 12
      return -1
  //#endregion binary-search
  `,
  'python',
);

const BINARY_SEARCH_CS = buildStructuredCode(
  `
  using System.Collections.Generic;

  /// <summary>
  /// Searches a sorted array for an exact target value.
  /// Input: sorted list of integers and a target integer.
  /// Returns: matching index, or -1 when absent.
  /// </summary>
  //#region binary-search function open
  //@step 1
  public static int BinarySearch(IReadOnlyList<int> values, int target)
  {
      var low = 0;
      var high = values.Count - 1;

      //@step 3
      while (low <= high)
      {
          var middle = (low + high) / 2;

          //@step 5
          if (values[middle] == target)
          {
              return middle;
          }

          if (values[middle] < target)
          {
              //@step 8
              low = middle + 1;
          }
          else
          {
              //@step 10
              high = middle - 1;
          }
      }

      //@step 12
      return -1;
  }
  //#endregion binary-search
  `,
  'csharp',
);

const BINARY_SEARCH_JAVA = buildStructuredCode(
  `
  /**
   * Searches a sorted array for an exact target value.
   * Input: sorted array of integers and a target integer.
   * Returns: matching index, or -1 when absent.
   */
  //#region binary-search function open
  //@step 1
  public static int binarySearch(int[] values, int target) {
      int low = 0;
      int high = values.length - 1;

      //@step 3
      while (low <= high) {
          int middle = (low + high) / 2;

          //@step 5
          if (values[middle] == target) {
              return middle;
          }

          if (values[middle] < target) {
              //@step 8
              low = middle + 1;
          } else {
              //@step 10
              high = middle - 1;
          }
      }

      //@step 12
      return -1;
  }
  //#endregion binary-search
  `,
  'java',
);

const BINARY_SEARCH_CPP = buildStructuredCode(
  `
  #include <vector>

  /**
   * Searches a sorted array for an exact target value.
   * Input: sorted vector of integers and a target integer.
   * Returns: matching index, or -1 when absent.
   */
  //#region binary-search function open
  //@step 1
  int binarySearch(const std::vector<int>& values, int target) {
      int low = 0;
      int high = static_cast<int>(values.size()) - 1;

      //@step 3
      while (low <= high) {
          int middle = (low + high) / 2;

          //@step 5
          if (values[middle] == target) {
              return middle;
          }

          if (values[middle] < target) {
              //@step 8
              low = middle + 1;
          } else {
              //@step 10
              high = middle - 1;
          }
      }

      //@step 12
      return -1;
  }
  //#endregion binary-search
  `,
  'cpp',
);

export const BINARY_SEARCH_CODE = BINARY_SEARCH_TS.lines;
export const BINARY_SEARCH_CODE_REGIONS = BINARY_SEARCH_TS.regions;
export const BINARY_SEARCH_CODE_HIGHLIGHT_MAP = BINARY_SEARCH_TS.highlightMap;
export const BINARY_SEARCH_CODE_VARIANTS: CodeVariantMap = {
  typescript: { language: 'typescript', lines: BINARY_SEARCH_TS.lines, regions: BINARY_SEARCH_TS.regions, highlightMap: BINARY_SEARCH_TS.highlightMap, source: BINARY_SEARCH_TS.source },
  python: { language: 'python', lines: BINARY_SEARCH_PY.lines, regions: BINARY_SEARCH_PY.regions, highlightMap: BINARY_SEARCH_PY.highlightMap, source: BINARY_SEARCH_PY.source },
  csharp: { language: 'csharp', lines: BINARY_SEARCH_CS.lines, regions: BINARY_SEARCH_CS.regions, highlightMap: BINARY_SEARCH_CS.highlightMap, source: BINARY_SEARCH_CS.source },
  java: { language: 'java', lines: BINARY_SEARCH_JAVA.lines, regions: BINARY_SEARCH_JAVA.regions, highlightMap: BINARY_SEARCH_JAVA.highlightMap, source: BINARY_SEARCH_JAVA.source },
  cpp: { language: 'cpp', lines: BINARY_SEARCH_CPP.lines, regions: BINARY_SEARCH_CPP.regions, highlightMap: BINARY_SEARCH_CPP.highlightMap, source: BINARY_SEARCH_CPP.source },
};
