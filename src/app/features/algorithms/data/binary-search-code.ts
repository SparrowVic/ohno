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

const BINARY_SEARCH_JS = buildStructuredCode(
  `
  /**
   * Search a sorted array for an exact target value.
   * Input: sorted array of numbers and a target number.
   * Returns: matching index, or -1 when absent.
   */
  //#region binary-search function open
  //@step 1
  function binarySearch(values, target) {
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
  `,
  'javascript',
);

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

const BINARY_SEARCH_GO = buildStructuredCode(
  `
  package searching

  /**
   * Searches a sorted array for an exact target value.
   * Input: sorted slice of integers and a target integer.
   * Returns: matching index, or -1 when absent.
   */
  //#region binary-search function open
  //@step 1
  func BinarySearch(values []int, target int) int {
      low := 0
      high := len(values) - 1

      //@step 3
      for low <= high {
          middle := (low + high) / 2

          //@step 5
          if values[middle] == target {
              return middle
          }

          if values[middle] < target {
              //@step 8
              low = middle + 1
          } else {
              //@step 10
              high = middle - 1
          }
      }

      //@step 12
      return -1
  }
  //#endregion binary-search
  `,
  'go',
);

const BINARY_SEARCH_RUST = buildStructuredCode(
  `
  /**
   * Searches a sorted array for an exact target value.
   * Input: sorted slice of integers and a target integer.
   * Returns: matching index, or -1 when absent.
   */
  //#region binary-search function open
  //@step 1
  fn binary_search(values: &[i32], target: i32) -> isize {
      let mut low: isize = 0;
      let mut high: isize = values.len() as isize - 1;

      //@step 3
      while low <= high {
          let middle = (low + high) / 2;

          //@step 5
          if values[middle as usize] == target {
              return middle;
          }

          if values[middle as usize] < target {
              //@step 8
              low = middle + 1;
          } else {
              //@step 10
              high = middle - 1;
          }
      }

      //@step 12
      -1
  }
  //#endregion binary-search
  `,
  'rust',
);

const BINARY_SEARCH_SWIFT = buildStructuredCode(
  `
  /**
   * Searches a sorted array for an exact target value.
   * Input: sorted array of integers and a target integer.
   * Returns: matching index, or -1 when absent.
   */
  //#region binary-search function open
  //@step 1
  func binarySearch(_ values: [Int], target: Int) -> Int {
      var low = 0
      var high = values.count - 1

      //@step 3
      while low <= high {
          let middle = (low + high) / 2

          //@step 5
          if values[middle] == target {
              return middle
          }

          if values[middle] < target {
              //@step 8
              low = middle + 1
          } else {
              //@step 10
              high = middle - 1
          }
      }

      //@step 12
      return -1
  }
  //#endregion binary-search
  `,
  'swift',
);

const BINARY_SEARCH_PHP = buildStructuredCode(
  `
  <?php

  /**
   * Searches a sorted array for an exact target value.
   * Input: sorted array of integers and a target integer.
   * Returns: matching index, or -1 when absent.
   *
   * @param array<int, int> $values
   */
  //#region binary-search function open
  //@step 1
  function binarySearch(array $values, int $target): int
  {
      $low = 0;
      $high = count($values) - 1;

      //@step 3
      while ($low <= $high) {
          $middle = intdiv($low + $high, 2);

          //@step 5
          if ($values[$middle] === $target) {
              return $middle;
          }

          if ($values[$middle] < $target) {
              //@step 8
              $low = $middle + 1;
          } else {
              //@step 10
              $high = $middle - 1;
          }
      }

      //@step 12
      return -1;
  }
  //#endregion binary-search
  `,
  'php',
);

const BINARY_SEARCH_KOTLIN = buildStructuredCode(
  `
  /**
   * Searches a sorted array for an exact target value.
   * Input: sorted array of integers and a target integer.
   * Returns: matching index, or -1 when absent.
   */
  //#region binary-search function open
  //@step 1
  fun binarySearch(values: IntArray, target: Int): Int {
      var low = 0
      var high = values.size - 1

      //@step 3
      while (low <= high) {
          val middle = (low + high) / 2

          //@step 5
          if (values[middle] == target) {
              return middle
          }

          if (values[middle] < target) {
              //@step 8
              low = middle + 1
          } else {
              //@step 10
              high = middle - 1
          }
      }

      //@step 12
      return -1
  }
  //#endregion binary-search
  `,
  'kotlin',
);

export const BINARY_SEARCH_CODE = BINARY_SEARCH_TS.lines;
export const BINARY_SEARCH_CODE_REGIONS = BINARY_SEARCH_TS.regions;
export const BINARY_SEARCH_CODE_HIGHLIGHT_MAP = BINARY_SEARCH_TS.highlightMap;
export const BINARY_SEARCH_CODE_VARIANTS: CodeVariantMap = {
  typescript: {
    language: 'typescript',
    lines: BINARY_SEARCH_TS.lines,
    regions: BINARY_SEARCH_TS.regions,
    highlightMap: BINARY_SEARCH_TS.highlightMap,
    source: BINARY_SEARCH_TS.source,
  },
  javascript: {
    language: 'javascript',
    lines: BINARY_SEARCH_JS.lines,
    regions: BINARY_SEARCH_JS.regions,
    highlightMap: BINARY_SEARCH_JS.highlightMap,
    source: BINARY_SEARCH_JS.source,
  },
  python: {
    language: 'python',
    lines: BINARY_SEARCH_PY.lines,
    regions: BINARY_SEARCH_PY.regions,
    highlightMap: BINARY_SEARCH_PY.highlightMap,
    source: BINARY_SEARCH_PY.source,
  },
  csharp: {
    language: 'csharp',
    lines: BINARY_SEARCH_CS.lines,
    regions: BINARY_SEARCH_CS.regions,
    highlightMap: BINARY_SEARCH_CS.highlightMap,
    source: BINARY_SEARCH_CS.source,
  },
  java: {
    language: 'java',
    lines: BINARY_SEARCH_JAVA.lines,
    regions: BINARY_SEARCH_JAVA.regions,
    highlightMap: BINARY_SEARCH_JAVA.highlightMap,
    source: BINARY_SEARCH_JAVA.source,
  },
  cpp: {
    language: 'cpp',
    lines: BINARY_SEARCH_CPP.lines,
    regions: BINARY_SEARCH_CPP.regions,
    highlightMap: BINARY_SEARCH_CPP.highlightMap,
    source: BINARY_SEARCH_CPP.source,
  },
  go: {
    language: 'go',
    lines: BINARY_SEARCH_GO.lines,
    regions: BINARY_SEARCH_GO.regions,
    highlightMap: BINARY_SEARCH_GO.highlightMap,
    source: BINARY_SEARCH_GO.source,
  },
  rust: {
    language: 'rust',
    lines: BINARY_SEARCH_RUST.lines,
    regions: BINARY_SEARCH_RUST.regions,
    highlightMap: BINARY_SEARCH_RUST.highlightMap,
    source: BINARY_SEARCH_RUST.source,
  },
  swift: {
    language: 'swift',
    lines: BINARY_SEARCH_SWIFT.lines,
    regions: BINARY_SEARCH_SWIFT.regions,
    highlightMap: BINARY_SEARCH_SWIFT.highlightMap,
    source: BINARY_SEARCH_SWIFT.source,
  },
  php: {
    language: 'php',
    lines: BINARY_SEARCH_PHP.lines,
    regions: BINARY_SEARCH_PHP.regions,
    highlightMap: BINARY_SEARCH_PHP.highlightMap,
    source: BINARY_SEARCH_PHP.source,
  },
  kotlin: {
    language: 'kotlin',
    lines: BINARY_SEARCH_KOTLIN.lines,
    regions: BINARY_SEARCH_KOTLIN.regions,
    highlightMap: BINARY_SEARCH_KOTLIN.highlightMap,
    source: BINARY_SEARCH_KOTLIN.source,
  },
};
