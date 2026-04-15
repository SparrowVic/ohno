import { CodeVariantMap } from '../models/detail';
import { buildStructuredCode } from './code-line-builder';

const BINARY_SEARCH_VARIANTS_TS = buildStructuredCode(`
  /**
   * Find the first and last occurrence of a target in a sorted array.
   * Input: sorted array of numbers and a target number.
   * Returns: inclusive range [first, last], or [-1, -1] when absent.
   */
  //#region binary-search-range function open
  //@step 1
  function binarySearchRange(values: readonly number[], target: number): [number, number] {
    let low = 0;
    let high = values.length - 1;
    let first = -1;

    //@step 3
    while (low <= high) {
      const middle = Math.floor((low + high) / 2);

      //@step 6
      if (values[middle] >= target) {
        if (values[middle] === target) {
          first = middle;
        }
        high = middle - 1;
      } else {
        //@step 8
        low = middle + 1;
      }
    }

    //@step 10
    if (first === -1) {
      return [-1, -1];
    }

    //@step 11
    low = first;
    high = values.length - 1;
    let last = first;

    //@step 13
    while (low <= high) {
      const middle = Math.floor((low + high) / 2);

      //@step 16
      if (values[middle] <= target) {
        if (values[middle] === target) {
          last = middle;
        }
        low = middle + 1;
      } else {
        //@step 18
        high = middle - 1;
      }
    }

    //@step 20
    return [first, last];
  }
  //#endregion binary-search-range
`);

const BINARY_SEARCH_VARIANTS_PY = buildStructuredCode(
  `
  """
  Find the first and last occurrence of a target in a sorted array.
  Input: sorted list of numbers and a target number.
  Returns: inclusive range [first, last], or [-1, -1] when absent.
  """
  //#region binary-search-range function open
  //@step 1
  def binary_search_range(values: list[int], target: int) -> tuple[int, int]:
      low = 0
      high = len(values) - 1
      first = -1

      //@step 3
      while low <= high:
          middle = (low + high) // 2

          //@step 6
          if values[middle] >= target:
              if values[middle] == target:
                  first = middle
              high = middle - 1
          else:
              //@step 8
              low = middle + 1

      //@step 10
      if first == -1:
          return (-1, -1)

      //@step 11
      low = first
      high = len(values) - 1
      last = first

      //@step 13
      while low <= high:
          middle = (low + high) // 2

          //@step 16
          if values[middle] <= target:
              if values[middle] == target:
                  last = middle
              low = middle + 1
          else:
              //@step 18
              high = middle - 1

      //@step 20
      return (first, last)
  //#endregion binary-search-range
  `,
  'python',
);

const BINARY_SEARCH_VARIANTS_CS = buildStructuredCode(
  `
  using System.Collections.Generic;

  /// <summary>
  /// Finds the first and last occurrence of a target in a sorted array.
  /// Input: sorted list of integers and a target integer.
  /// Returns: inclusive range [first, last], or [-1, -1] when absent.
  /// </summary>
  //#region binary-search-range function open
  //@step 1
  public static (int First, int Last) BinarySearchRange(IReadOnlyList<int> values, int target)
  {
      var low = 0;
      var high = values.Count - 1;
      var first = -1;

      //@step 3
      while (low <= high)
      {
          var middle = (low + high) / 2;

          //@step 6
          if (values[middle] >= target)
          {
              if (values[middle] == target)
              {
                  first = middle;
              }
              high = middle - 1;
          }
          else
          {
              //@step 8
              low = middle + 1;
          }
      }

      //@step 10
      if (first == -1)
      {
          return (-1, -1);
      }

      //@step 11
      low = first;
      high = values.Count - 1;
      var last = first;

      //@step 13
      while (low <= high)
      {
          var middle = (low + high) / 2;

          //@step 16
          if (values[middle] <= target)
          {
              if (values[middle] == target)
              {
                  last = middle;
              }
              low = middle + 1;
          }
          else
          {
              //@step 18
              high = middle - 1;
          }
      }

      //@step 20
      return (first, last);
  }
  //#endregion binary-search-range
  `,
  'csharp',
);

const BINARY_SEARCH_VARIANTS_JAVA = buildStructuredCode(
  `
  /**
   * Finds the first and last occurrence of a target in a sorted array.
   * Input: sorted array of integers and a target integer.
   * Returns: inclusive range [first, last], or [-1, -1] when absent.
   */
  //#region binary-search-range function open
  //@step 1
  public static int[] binarySearchRange(int[] values, int target) {
      int low = 0;
      int high = values.length - 1;
      int first = -1;

      //@step 3
      while (low <= high) {
          int middle = (low + high) / 2;

          //@step 6
          if (values[middle] >= target) {
              if (values[middle] == target) {
                  first = middle;
              }
              high = middle - 1;
          } else {
              //@step 8
              low = middle + 1;
          }
      }

      //@step 10
      if (first == -1) {
          return new int[] { -1, -1 };
      }

      //@step 11
      low = first;
      high = values.length - 1;
      int last = first;

      //@step 13
      while (low <= high) {
          int middle = (low + high) / 2;

          //@step 16
          if (values[middle] <= target) {
              if (values[middle] == target) {
                  last = middle;
              }
              low = middle + 1;
          } else {
              //@step 18
              high = middle - 1;
          }
      }

      //@step 20
      return new int[] { first, last };
  }
  //#endregion binary-search-range
  `,
  'java',
);

const BINARY_SEARCH_VARIANTS_CPP = buildStructuredCode(
  `
  #include <array>
  #include <vector>

  /**
   * Finds the first and last occurrence of a target in a sorted array.
   * Input: sorted vector of integers and a target integer.
   * Returns: inclusive range [first, last], or [-1, -1] when absent.
   */
  //#region binary-search-range function open
  //@step 1
  std::array<int, 2> binarySearchRange(const std::vector<int>& values, int target) {
      int low = 0;
      int high = static_cast<int>(values.size()) - 1;
      int first = -1;

      //@step 3
      while (low <= high) {
          int middle = (low + high) / 2;

          //@step 6
          if (values[middle] >= target) {
              if (values[middle] == target) {
                  first = middle;
              }
              high = middle - 1;
          } else {
              //@step 8
              low = middle + 1;
          }
      }

      //@step 10
      if (first == -1) {
          return { -1, -1 };
      }

      //@step 11
      low = first;
      high = static_cast<int>(values.size()) - 1;
      int last = first;

      //@step 13
      while (low <= high) {
          int middle = (low + high) / 2;

          //@step 16
          if (values[middle] <= target) {
              if (values[middle] == target) {
                  last = middle;
              }
              low = middle + 1;
          } else {
              //@step 18
              high = middle - 1;
          }
      }

      //@step 20
      return { first, last };
  }
  //#endregion binary-search-range
  `,
  'cpp',
);

export const BINARY_SEARCH_VARIANTS_CODE = BINARY_SEARCH_VARIANTS_TS.lines;
export const BINARY_SEARCH_VARIANTS_CODE_REGIONS = BINARY_SEARCH_VARIANTS_TS.regions;
export const BINARY_SEARCH_VARIANTS_CODE_HIGHLIGHT_MAP = BINARY_SEARCH_VARIANTS_TS.highlightMap;
export const BINARY_SEARCH_VARIANTS_CODE_VARIANTS: CodeVariantMap = {
  typescript: { language: 'typescript', lines: BINARY_SEARCH_VARIANTS_TS.lines, regions: BINARY_SEARCH_VARIANTS_TS.regions, highlightMap: BINARY_SEARCH_VARIANTS_TS.highlightMap, source: BINARY_SEARCH_VARIANTS_TS.source },
  python: { language: 'python', lines: BINARY_SEARCH_VARIANTS_PY.lines, regions: BINARY_SEARCH_VARIANTS_PY.regions, highlightMap: BINARY_SEARCH_VARIANTS_PY.highlightMap, source: BINARY_SEARCH_VARIANTS_PY.source },
  csharp: { language: 'csharp', lines: BINARY_SEARCH_VARIANTS_CS.lines, regions: BINARY_SEARCH_VARIANTS_CS.regions, highlightMap: BINARY_SEARCH_VARIANTS_CS.highlightMap, source: BINARY_SEARCH_VARIANTS_CS.source },
  java: { language: 'java', lines: BINARY_SEARCH_VARIANTS_JAVA.lines, regions: BINARY_SEARCH_VARIANTS_JAVA.regions, highlightMap: BINARY_SEARCH_VARIANTS_JAVA.highlightMap, source: BINARY_SEARCH_VARIANTS_JAVA.source },
  cpp: { language: 'cpp', lines: BINARY_SEARCH_VARIANTS_CPP.lines, regions: BINARY_SEARCH_VARIANTS_CPP.regions, highlightMap: BINARY_SEARCH_VARIANTS_CPP.highlightMap, source: BINARY_SEARCH_VARIANTS_CPP.source },
};
