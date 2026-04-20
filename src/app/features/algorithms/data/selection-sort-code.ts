import { CodeVariantMap } from '../models/detail';
import { buildStructuredCode } from './code-line-builder/code-line-builder';

const SELECTION_SORT_TS = buildStructuredCode(`
  /**
   * Sort the array in ascending order with selection sort.
   * Input: mutable array of numbers.
   * Returns: the same array after in-place sorting.
   */
  //#region selection-sort function open
  //@step 1
  function selectionSort(values: number[]): number[] {
    for (let start = 0; start < values.length - 1; start += 1) {
      //@step 3
      let minIndex = start;

      for (let index = start + 1; index < values.length; index += 1) {
        //@step 5
        if (values[index] < values[minIndex]) {
          //@step 6
          minIndex = index;
        }
      }

      //@step 10
      if (minIndex !== start) {
        [values[start], values[minIndex]] = [values[minIndex], values[start]];
      }

      //@step 12
      continue;
    }

    //@step 13
    return values;
  }
  //#endregion selection-sort
`);

const SELECTION_SORT_JS = buildStructuredCode(
  `
  /**
   * Sort the array in ascending order with selection sort.
   * Input: mutable array of numbers.
   * Returns: the same array after in-place sorting.
   */
  //#region selection-sort function open
  //@step 1
  function selectionSort(values) {
      for (let start = 0; start < values.length - 1; start += 1) {
          //@step 3
          let minIndex = start;

          for (let index = start + 1; index < values.length; index += 1) {
              //@step 5
              if (values[index] < values[minIndex]) {
                  //@step 6
                  minIndex = index;
              }
          }

          //@step 10
          if (minIndex !== start) {
              [values[start], values[minIndex]] = [values[minIndex], values[start]];
          }

          //@step 12
          continue;
      }

      //@step 13
      return values;
  }
  //#endregion selection-sort
  `,
  'javascript',
);

const SELECTION_SORT_PY = buildStructuredCode(
  `
  """
  Sort the array in ascending order with selection sort.
  Input: mutable list of numbers.
  Returns: the same list after in-place sorting.
  """
  //#region selection-sort function open
  //@step 1
  def selection_sort(values: list[int]) -> list[int]:
      for start in range(len(values) - 1):
          //@step 3
          min_index = start

          for index in range(start + 1, len(values)):
              //@step 5
              if values[index] < values[min_index]:
                  //@step 6
                  min_index = index

          //@step 10
          if min_index != start:
              values[start], values[min_index] = values[min_index], values[start]

          //@step 12
          continue

      //@step 13
      return values
  //#endregion selection-sort
  `,
  'python',
);

const SELECTION_SORT_CS = buildStructuredCode(
  `
  /// <summary>
  /// Sorts the array in ascending order with selection sort.
  /// Input: mutable array of integers.
  /// Returns: the same array after in-place sorting.
  /// </summary>
  //#region selection-sort function open
  //@step 1
  public static int[] SelectionSort(int[] values)
  {
      for (var start = 0; start < values.Length - 1; start += 1)
      {
          //@step 3
          var minIndex = start;

          for (var index = start + 1; index < values.Length; index += 1)
          {
              //@step 5
              if (values[index] < values[minIndex])
              {
                  //@step 6
                  minIndex = index;
              }
          }

          //@step 10
          if (minIndex != start)
          {
              (values[start], values[minIndex]) = (values[minIndex], values[start]);
          }

          //@step 12
          continue;
      }

      //@step 13
      return values;
  }
  //#endregion selection-sort
  `,
  'csharp',
);

const SELECTION_SORT_JAVA = buildStructuredCode(
  `
  /**
   * Sorts the array in ascending order with selection sort.
   * Input: mutable array of integers.
   * Returns: the same array after in-place sorting.
   */
  //#region selection-sort function open
  //@step 1
  public static int[] selectionSort(int[] values) {
      for (int start = 0; start < values.length - 1; start += 1) {
          //@step 3
          int minIndex = start;

          for (int index = start + 1; index < values.length; index += 1) {
              //@step 5
              if (values[index] < values[minIndex]) {
                  //@step 6
                  minIndex = index;
              }
          }

          //@step 10
          if (minIndex != start) {
              int tmp = values[start];
              values[start] = values[minIndex];
              values[minIndex] = tmp;
          }

          //@step 12
          continue;
      }

      //@step 13
      return values;
  }
  //#endregion selection-sort
  `,
  'java',
);

const SELECTION_SORT_CPP = buildStructuredCode(
  `
  #include <vector>
  #include <utility>

  /**
   * Sorts the array in ascending order with selection sort.
   * Input: mutable vector of integers.
   * Returns: the same vector after in-place sorting.
   */
  //#region selection-sort function open
  //@step 1
  std::vector<int> selectionSort(std::vector<int> values) {
      for (int start = 0; start < static_cast<int>(values.size()) - 1; start += 1) {
          //@step 3
          int minIndex = start;

          for (int index = start + 1; index < static_cast<int>(values.size()); index += 1) {
              //@step 5
              if (values[index] < values[minIndex]) {
                  //@step 6
                  minIndex = index;
              }
          }

          //@step 10
          if (minIndex != start) {
              std::swap(values[start], values[minIndex]);
          }

          //@step 12
          continue;
      }

      //@step 13
      return values;
  }
  //#endregion selection-sort
  `,
  'cpp',
);

const SELECTION_SORT_GO = buildStructuredCode(
  `
  package sorting

  /**
   * Sorts the array in ascending order with selection sort.
   * Input: mutable slice of integers.
   * Returns: the same slice after in-place sorting.
   */
  //#region selection-sort function open
  //@step 1
  func SelectionSort(values []int) []int {
      for start := 0; start < len(values)-1; start += 1 {
          //@step 3
          minIndex := start

          for index := start + 1; index < len(values); index += 1 {
              //@step 5
              if values[index] < values[minIndex] {
                  //@step 6
                  minIndex = index
              }
          }

          //@step 10
          if minIndex != start {
              values[start], values[minIndex] = values[minIndex], values[start]
          }

          //@step 12
          continue
      }

      //@step 13
      return values
  }
  //#endregion selection-sort
  `,
  'go',
);

const SELECTION_SORT_RUST = buildStructuredCode(
  `
  /**
   * Sorts the array in ascending order with selection sort.
   * Input: mutable vector of integers.
   * Returns: the same vector after in-place sorting.
   */
  //#region selection-sort function open
  //@step 1
  fn selection_sort(mut values: Vec<i32>) -> Vec<i32> {
      for start in 0..values.len().saturating_sub(1) {
          //@step 3
          let mut min_index = start;

          for index in (start + 1)..values.len() {
              //@step 5
              if values[index] < values[min_index] {
                  //@step 6
                  min_index = index;
              }
          }

          //@step 10
          if min_index != start {
              values.swap(start, min_index);
          }

          //@step 12
          continue;
      }

      //@step 13
      values
  }
  //#endregion selection-sort
  `,
  'rust',
);

const SELECTION_SORT_SWIFT = buildStructuredCode(
  `
  /**
   * Sorts the array in ascending order with selection sort.
   * Input: mutable array of integers.
   * Returns: the same array after in-place sorting.
   */
  //#region selection-sort function open
  //@step 1
  func selectionSort(_ values: inout [Int]) -> [Int] {
      for start in 0..<max(values.count - 1, 0) {
          //@step 3
          var minIndex = start

          for index in (start + 1)..<values.count {
              //@step 5
              if values[index] < values[minIndex] {
                  //@step 6
                  minIndex = index
              }
          }

          //@step 10
          if minIndex != start {
              values.swapAt(start, minIndex)
          }

          //@step 12
          continue
      }

      //@step 13
      return values
  }
  //#endregion selection-sort
  `,
  'swift',
);

const SELECTION_SORT_PHP = buildStructuredCode(
  `
  <?php

  /**
   * Sorts the array in ascending order with selection sort.
   * Input: mutable array of integers.
   * Returns: the same array after in-place sorting.
   *
   * @param array<int, int> $values
   * @return array<int, int>
   */
  //#region selection-sort function open
  //@step 1
  function selectionSort(array &$values): array
  {
      for ($start = 0; $start < count($values) - 1; $start += 1) {
          //@step 3
          $minIndex = $start;

          for ($index = $start + 1; $index < count($values); $index += 1) {
              //@step 5
              if ($values[$index] < $values[$minIndex]) {
                  //@step 6
                  $minIndex = $index;
              }
          }

          //@step 10
          if ($minIndex !== $start) {
              [$values[$start], $values[$minIndex]] = [$values[$minIndex], $values[$start]];
          }

          //@step 12
          continue;
      }

      //@step 13
      return $values;
  }
  //#endregion selection-sort
  `,
  'php',
);

const SELECTION_SORT_KOTLIN = buildStructuredCode(
  `
  /**
   * Sorts the array in ascending order with selection sort.
   * Input: mutable array of integers.
   * Returns: the same array after in-place sorting.
   */
  //#region selection-sort function open
  //@step 1
  fun selectionSort(values: IntArray): IntArray {
      for (start in 0 until values.size - 1) {
          //@step 3
          var minIndex = start

          for (index in start + 1 until values.size) {
              //@step 5
              if (values[index] < values[minIndex]) {
                  //@step 6
                  minIndex = index
              }
          }

          //@step 10
          if (minIndex != start) {
              val tmp = values[start]
              values[start] = values[minIndex]
              values[minIndex] = tmp
          }

          //@step 12
          continue
      }

      //@step 13
      return values
  }
  //#endregion selection-sort
  `,
  'kotlin',
);

export const SELECTION_SORT_CODE = SELECTION_SORT_TS.lines;
export const SELECTION_SORT_CODE_REGIONS = SELECTION_SORT_TS.regions;
export const SELECTION_SORT_CODE_HIGHLIGHT_MAP = SELECTION_SORT_TS.highlightMap;
export const SELECTION_SORT_CODE_VARIANTS: CodeVariantMap = {
  typescript: {
    language: 'typescript',
    lines: SELECTION_SORT_TS.lines,
    regions: SELECTION_SORT_TS.regions,
    highlightMap: SELECTION_SORT_TS.highlightMap,
    source: SELECTION_SORT_TS.source,
  },
  javascript: {
    language: 'javascript',
    lines: SELECTION_SORT_JS.lines,
    regions: SELECTION_SORT_JS.regions,
    highlightMap: SELECTION_SORT_JS.highlightMap,
    source: SELECTION_SORT_JS.source,
  },
  python: {
    language: 'python',
    lines: SELECTION_SORT_PY.lines,
    regions: SELECTION_SORT_PY.regions,
    highlightMap: SELECTION_SORT_PY.highlightMap,
    source: SELECTION_SORT_PY.source,
  },
  csharp: {
    language: 'csharp',
    lines: SELECTION_SORT_CS.lines,
    regions: SELECTION_SORT_CS.regions,
    highlightMap: SELECTION_SORT_CS.highlightMap,
    source: SELECTION_SORT_CS.source,
  },
  java: {
    language: 'java',
    lines: SELECTION_SORT_JAVA.lines,
    regions: SELECTION_SORT_JAVA.regions,
    highlightMap: SELECTION_SORT_JAVA.highlightMap,
    source: SELECTION_SORT_JAVA.source,
  },
  cpp: {
    language: 'cpp',
    lines: SELECTION_SORT_CPP.lines,
    regions: SELECTION_SORT_CPP.regions,
    highlightMap: SELECTION_SORT_CPP.highlightMap,
    source: SELECTION_SORT_CPP.source,
  },
  go: {
    language: 'go',
    lines: SELECTION_SORT_GO.lines,
    regions: SELECTION_SORT_GO.regions,
    highlightMap: SELECTION_SORT_GO.highlightMap,
    source: SELECTION_SORT_GO.source,
  },
  rust: {
    language: 'rust',
    lines: SELECTION_SORT_RUST.lines,
    regions: SELECTION_SORT_RUST.regions,
    highlightMap: SELECTION_SORT_RUST.highlightMap,
    source: SELECTION_SORT_RUST.source,
  },
  swift: {
    language: 'swift',
    lines: SELECTION_SORT_SWIFT.lines,
    regions: SELECTION_SORT_SWIFT.regions,
    highlightMap: SELECTION_SORT_SWIFT.highlightMap,
    source: SELECTION_SORT_SWIFT.source,
  },
  php: {
    language: 'php',
    lines: SELECTION_SORT_PHP.lines,
    regions: SELECTION_SORT_PHP.regions,
    highlightMap: SELECTION_SORT_PHP.highlightMap,
    source: SELECTION_SORT_PHP.source,
  },
  kotlin: {
    language: 'kotlin',
    lines: SELECTION_SORT_KOTLIN.lines,
    regions: SELECTION_SORT_KOTLIN.regions,
    highlightMap: SELECTION_SORT_KOTLIN.highlightMap,
    source: SELECTION_SORT_KOTLIN.source,
  },
};
