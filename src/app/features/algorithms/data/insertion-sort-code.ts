import { CodeVariantMap } from '../models/detail';
import { buildStructuredCode } from './code-line-builder/code-line-builder';

const INSERTION_SORT_TS = buildStructuredCode(`
  /**
   * Sort the array in ascending order with insertion sort.
   * Input: mutable array of numbers.
   * Returns: the same array after in-place sorting.
   */
  //#region insertion-sort function open
  //@step 1
  function insertionSort(values: number[]): number[] {
    for (let index = 1; index < values.length; index += 1) {
      const current = values[index];
      let scan = index - 1;

      //@step 5
      while (scan >= 0 && values[scan] > current) {
        //@step 6
        values[scan + 1] = values[scan];
        scan -= 1;
      }

      //@step 9
      values[scan + 1] = current;
    }

    //@step 11
    return values;
  }
  //#endregion insertion-sort
`);

const INSERTION_SORT_JS = buildStructuredCode(
  `
  /**
   * Sort the array in ascending order with insertion sort.
   * Input: mutable array of numbers.
   * Returns: the same array after in-place sorting.
   */
  //#region insertion-sort function open
  //@step 1
  function insertionSort(values) {
      for (let index = 1; index < values.length; index += 1) {
          const current = values[index];
          let scan = index - 1;

          //@step 5
          while (scan >= 0 && values[scan] > current) {
              //@step 6
              values[scan + 1] = values[scan];
              scan -= 1;
          }

          //@step 9
          values[scan + 1] = current;
      }

      //@step 11
      return values;
  }
  //#endregion insertion-sort
  `,
  'javascript',
);

const INSERTION_SORT_PY = buildStructuredCode(
  `
  """
  Sort the array in ascending order with insertion sort.
  Input: mutable list of numbers.
  Returns: the same list after in-place sorting.
  """
  //#region insertion-sort function open
  //@step 1
  def insertion_sort(values: list[int]) -> list[int]:
      for index in range(1, len(values)):
          current = values[index]
          scan = index - 1

          //@step 5
          while scan >= 0 and values[scan] > current:
              //@step 6
              values[scan + 1] = values[scan]
              scan -= 1

          //@step 9
          values[scan + 1] = current

      //@step 11
      return values
  //#endregion insertion-sort
  `,
  'python',
);

const INSERTION_SORT_CS = buildStructuredCode(
  `
  /// <summary>
  /// Sorts the array in ascending order with insertion sort.
  /// Input: mutable array of integers.
  /// Returns: the same array after in-place sorting.
  /// </summary>
  //#region insertion-sort function open
  //@step 1
  public static int[] InsertionSort(int[] values)
  {
      for (var index = 1; index < values.Length; index += 1)
      {
          var current = values[index];
          var scan = index - 1;

          //@step 5
          while (scan >= 0 && values[scan] > current)
          {
              //@step 6
              values[scan + 1] = values[scan];
              scan -= 1;
          }

          //@step 9
          values[scan + 1] = current;
      }

      //@step 11
      return values;
  }
  //#endregion insertion-sort
  `,
  'csharp',
);

const INSERTION_SORT_JAVA = buildStructuredCode(
  `
  /**
   * Sorts the array in ascending order with insertion sort.
   * Input: mutable array of integers.
   * Returns: the same array after in-place sorting.
   */
  //#region insertion-sort function open
  //@step 1
  public static int[] insertionSort(int[] values) {
      for (int index = 1; index < values.length; index += 1) {
          int current = values[index];
          int scan = index - 1;

          //@step 5
          while (scan >= 0 && values[scan] > current) {
              //@step 6
              values[scan + 1] = values[scan];
              scan -= 1;
          }

          //@step 9
          values[scan + 1] = current;
      }

      //@step 11
      return values;
  }
  //#endregion insertion-sort
  `,
  'java',
);

const INSERTION_SORT_CPP = buildStructuredCode(
  `
  #include <vector>

  /**
   * Sorts the array in ascending order with insertion sort.
   * Input: mutable vector of integers.
   * Returns: the same vector after in-place sorting.
   */
  //#region insertion-sort function open
  //@step 1
  std::vector<int> insertionSort(std::vector<int> values) {
      for (int index = 1; index < static_cast<int>(values.size()); index += 1) {
          int current = values[index];
          int scan = index - 1;

          //@step 5
          while (scan >= 0 && values[scan] > current) {
              //@step 6
              values[scan + 1] = values[scan];
              scan -= 1;
          }

          //@step 9
          values[scan + 1] = current;
      }

      //@step 11
      return values;
  }
  //#endregion insertion-sort
  `,
  'cpp',
);

const INSERTION_SORT_GO = buildStructuredCode(
  `
  package sorting

  /**
   * Sorts the array in ascending order with insertion sort.
   * Input: mutable slice of integers.
   * Returns: the same slice after in-place sorting.
   */
  //#region insertion-sort function open
  //@step 1
  func InsertionSort(values []int) []int {
      for index := 1; index < len(values); index += 1 {
          current := values[index]
          scan := index - 1

          //@step 5
          for scan >= 0 && values[scan] > current {
              //@step 6
              values[scan+1] = values[scan]
              scan -= 1
          }

          //@step 9
          values[scan+1] = current
      }

      //@step 11
      return values
  }
  //#endregion insertion-sort
  `,
  'go',
);

const INSERTION_SORT_RUST = buildStructuredCode(
  `
  /**
   * Sorts the array in ascending order with insertion sort.
   * Input: mutable vector of integers.
   * Returns: the same vector after in-place sorting.
   */
  //#region insertion-sort function open
  //@step 1
  fn insertion_sort(mut values: Vec<i32>) -> Vec<i32> {
      for index in 1..values.len() {
          let current = values[index];
          let mut scan = index as isize - 1;

          //@step 5
          while scan >= 0 && values[scan as usize] > current {
              //@step 6
              values[scan as usize + 1] = values[scan as usize];
              scan -= 1;
          }

          //@step 9
          values[scan as usize + 1] = current;
      }

      //@step 11
      values
  }
  //#endregion insertion-sort
  `,
  'rust',
);

const INSERTION_SORT_SWIFT = buildStructuredCode(
  `
  /**
   * Sorts the array in ascending order with insertion sort.
   * Input: mutable array of integers.
   * Returns: the same array after in-place sorting.
   */
  //#region insertion-sort function open
  //@step 1
  func insertionSort(_ values: inout [Int]) -> [Int] {
      if values.count > 1 {
          for index in 1..<values.count {
              let current = values[index]
              var scan = index - 1

              //@step 5
              while scan >= 0 && values[scan] > current {
                  //@step 6
                  values[scan + 1] = values[scan]
                  scan -= 1
              }

              //@step 9
              values[scan + 1] = current
          }
      }

      //@step 11
      return values
  }
  //#endregion insertion-sort
  `,
  'swift',
);

const INSERTION_SORT_PHP = buildStructuredCode(
  `
  <?php

  /**
   * Sorts the array in ascending order with insertion sort.
   * Input: mutable array of integers.
   * Returns: the same array after in-place sorting.
   *
   * @param array<int, int> $values
   * @return array<int, int>
   */
  //#region insertion-sort function open
  //@step 1
  function insertionSort(array &$values): array
  {
      for ($index = 1; $index < count($values); $index += 1) {
          $current = $values[$index];
          $scan = $index - 1;

          //@step 5
          while ($scan >= 0 && $values[$scan] > $current) {
              //@step 6
              $values[$scan + 1] = $values[$scan];
              $scan -= 1;
          }

          //@step 9
          $values[$scan + 1] = $current;
      }

      //@step 11
      return $values;
  }
  //#endregion insertion-sort
  `,
  'php',
);

const INSERTION_SORT_KOTLIN = buildStructuredCode(
  `
  /**
   * Sorts the array in ascending order with insertion sort.
   * Input: mutable array of integers.
   * Returns: the same array after in-place sorting.
   */
  //#region insertion-sort function open
  //@step 1
  fun insertionSort(values: IntArray): IntArray {
      for (index in 1 until values.size) {
          val current = values[index]
          var scan = index - 1

          //@step 5
          while (scan >= 0 && values[scan] > current) {
              //@step 6
              values[scan + 1] = values[scan]
              scan -= 1
          }

          //@step 9
          values[scan + 1] = current
      }

      //@step 11
      return values
  }
  //#endregion insertion-sort
  `,
  'kotlin',
);

export const INSERTION_SORT_CODE = INSERTION_SORT_TS.lines;
export const INSERTION_SORT_CODE_REGIONS = INSERTION_SORT_TS.regions;
export const INSERTION_SORT_CODE_HIGHLIGHT_MAP = INSERTION_SORT_TS.highlightMap;
export const INSERTION_SORT_CODE_VARIANTS: CodeVariantMap = {
  typescript: {
    language: 'typescript',
    lines: INSERTION_SORT_TS.lines,
    regions: INSERTION_SORT_TS.regions,
    highlightMap: INSERTION_SORT_TS.highlightMap,
    source: INSERTION_SORT_TS.source,
  },
  javascript: {
    language: 'javascript',
    lines: INSERTION_SORT_JS.lines,
    regions: INSERTION_SORT_JS.regions,
    highlightMap: INSERTION_SORT_JS.highlightMap,
    source: INSERTION_SORT_JS.source,
  },
  python: {
    language: 'python',
    lines: INSERTION_SORT_PY.lines,
    regions: INSERTION_SORT_PY.regions,
    highlightMap: INSERTION_SORT_PY.highlightMap,
    source: INSERTION_SORT_PY.source,
  },
  csharp: {
    language: 'csharp',
    lines: INSERTION_SORT_CS.lines,
    regions: INSERTION_SORT_CS.regions,
    highlightMap: INSERTION_SORT_CS.highlightMap,
    source: INSERTION_SORT_CS.source,
  },
  java: {
    language: 'java',
    lines: INSERTION_SORT_JAVA.lines,
    regions: INSERTION_SORT_JAVA.regions,
    highlightMap: INSERTION_SORT_JAVA.highlightMap,
    source: INSERTION_SORT_JAVA.source,
  },
  cpp: {
    language: 'cpp',
    lines: INSERTION_SORT_CPP.lines,
    regions: INSERTION_SORT_CPP.regions,
    highlightMap: INSERTION_SORT_CPP.highlightMap,
    source: INSERTION_SORT_CPP.source,
  },
  go: {
    language: 'go',
    lines: INSERTION_SORT_GO.lines,
    regions: INSERTION_SORT_GO.regions,
    highlightMap: INSERTION_SORT_GO.highlightMap,
    source: INSERTION_SORT_GO.source,
  },
  rust: {
    language: 'rust',
    lines: INSERTION_SORT_RUST.lines,
    regions: INSERTION_SORT_RUST.regions,
    highlightMap: INSERTION_SORT_RUST.highlightMap,
    source: INSERTION_SORT_RUST.source,
  },
  swift: {
    language: 'swift',
    lines: INSERTION_SORT_SWIFT.lines,
    regions: INSERTION_SORT_SWIFT.regions,
    highlightMap: INSERTION_SORT_SWIFT.highlightMap,
    source: INSERTION_SORT_SWIFT.source,
  },
  php: {
    language: 'php',
    lines: INSERTION_SORT_PHP.lines,
    regions: INSERTION_SORT_PHP.regions,
    highlightMap: INSERTION_SORT_PHP.highlightMap,
    source: INSERTION_SORT_PHP.source,
  },
  kotlin: {
    language: 'kotlin',
    lines: INSERTION_SORT_KOTLIN.lines,
    regions: INSERTION_SORT_KOTLIN.regions,
    highlightMap: INSERTION_SORT_KOTLIN.highlightMap,
    source: INSERTION_SORT_KOTLIN.source,
  },
};
