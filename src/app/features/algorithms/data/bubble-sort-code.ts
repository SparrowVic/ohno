import { CodeVariantMap } from '../models/detail';
import { buildStructuredCode } from './code-line-builder/code-line-builder';

const BUBBLE_SORT_TS = buildStructuredCode(`
  /**
   * Sort the array in ascending order with bubble sort.
   * Input: mutable array of numbers.
   * Returns: the same array after in-place sorting.
   */
  //#region bubble-sort function open
  //@step 1
  function bubbleSort(values: number[]): number[] {
    const n = values.length;

    for (let end = n - 1; end > 0; end -= 1) {
      let swapped = false;

      for (let index = 0; index < end; index += 1) {
        //@step 6
        if (values[index] > values[index + 1]) {
          //@step 7
          [values[index], values[index + 1]] = [values[index + 1], values[index]];
          swapped = true;
        }
      }

      //@step 11
      if (!swapped) {
        break;
      }
    }

    //@step 13
    return values;
  }
  //#endregion bubble-sort
`);

const BUBBLE_SORT_JS = buildStructuredCode(
  `
  /**
   * Sort the array in ascending order with bubble sort.
   * Input: mutable array of numbers.
   * Returns: the same array after in-place sorting.
   */
  //#region bubble-sort function open
  //@step 1
  function bubbleSort(values) {
      const n = values.length;

      for (let end = n - 1; end > 0; end -= 1) {
          let swapped = false;

          for (let index = 0; index < end; index += 1) {
              //@step 6
              if (values[index] > values[index + 1]) {
                  //@step 7
                  [values[index], values[index + 1]] = [values[index + 1], values[index]];
                  swapped = true;
              }
          }

          //@step 11
          if (!swapped) {
              break;
          }
      }

      //@step 13
      return values;
  }
  //#endregion bubble-sort
  `,
  'javascript',
);

const BUBBLE_SORT_PY = buildStructuredCode(
  `
  """
  Sort the array in ascending order with bubble sort.
  Input: mutable list of numbers.
  Returns: the same list after in-place sorting.
  """
  //#region bubble-sort function open
  //@step 1
  def bubble_sort(values: list[int]) -> list[int]:
      n = len(values)

      for end in range(n - 1, 0, -1):
          swapped = False

          for index in range(end):
              //@step 6
              if values[index] > values[index + 1]:
                  //@step 7
                  values[index], values[index + 1] = values[index + 1], values[index]
                  swapped = True

          //@step 11
          if not swapped:
              break

      //@step 13
      return values
  //#endregion bubble-sort
  `,
  'python',
);

const BUBBLE_SORT_CS = buildStructuredCode(
  `
  /// <summary>
  /// Sorts the array in ascending order with bubble sort.
  /// Input: mutable array of integers.
  /// Returns: the same array after in-place sorting.
  /// </summary>
  //#region bubble-sort function open
  //@step 1
  public static int[] BubbleSort(int[] values)
  {
      var n = values.Length;

      for (var end = n - 1; end > 0; end -= 1)
      {
          var swapped = false;

          for (var index = 0; index < end; index += 1)
          {
              //@step 6
              if (values[index] > values[index + 1])
              {
                  //@step 7
                  (values[index], values[index + 1]) = (values[index + 1], values[index]);
                  swapped = true;
              }
          }

          //@step 11
          if (!swapped)
          {
              break;
          }
      }

      //@step 13
      return values;
  }
  //#endregion bubble-sort
  `,
  'csharp',
);

const BUBBLE_SORT_JAVA = buildStructuredCode(
  `
  /**
   * Sorts the array in ascending order with bubble sort.
   * Input: mutable array of integers.
   * Returns: the same array after in-place sorting.
   */
  //#region bubble-sort function open
  //@step 1
  public static int[] bubbleSort(int[] values) {
      int n = values.length;

      for (int end = n - 1; end > 0; end -= 1) {
          boolean swapped = false;

          for (int index = 0; index < end; index += 1) {
              //@step 6
              if (values[index] > values[index + 1]) {
                  //@step 7
                  int tmp = values[index];
                  values[index] = values[index + 1];
                  values[index + 1] = tmp;
                  swapped = true;
              }
          }

          //@step 11
          if (!swapped) {
              break;
          }
      }

      //@step 13
      return values;
  }
  //#endregion bubble-sort
  `,
  'java',
);

const BUBBLE_SORT_CPP = buildStructuredCode(
  `
  #include <vector>
  #include <utility>

  /**
   * Sorts the array in ascending order with bubble sort.
   * Input: mutable vector of integers.
   * Returns: the same vector after in-place sorting.
   */
  //#region bubble-sort function open
  //@step 1
  std::vector<int> bubbleSort(std::vector<int> values) {
      int n = static_cast<int>(values.size());

      for (int end = n - 1; end > 0; end -= 1) {
          bool swapped = false;

          for (int index = 0; index < end; index += 1) {
              //@step 6
              if (values[index] > values[index + 1]) {
                  //@step 7
                  std::swap(values[index], values[index + 1]);
                  swapped = true;
              }
          }

          //@step 11
          if (!swapped) {
              break;
          }
      }

      //@step 13
      return values;
  }
  //#endregion bubble-sort
  `,
  'cpp',
);

const BUBBLE_SORT_GO = buildStructuredCode(
  `
  package sorting

  /**
   * Sorts the array in ascending order with bubble sort.
   * Input: mutable slice of integers.
   * Returns: the same slice after in-place sorting.
   */
  //#region bubble-sort function open
  //@step 1
  func BubbleSort(values []int) []int {
      n := len(values)

      for end := n - 1; end > 0; end -= 1 {
          swapped := false

          for index := 0; index < end; index += 1 {
              //@step 6
              if values[index] > values[index+1] {
                  //@step 7
                  values[index], values[index+1] = values[index+1], values[index]
                  swapped = true
              }
          }

          //@step 11
          if !swapped {
              break
          }
      }

      //@step 13
      return values
  }
  //#endregion bubble-sort
  `,
  'go',
);

const BUBBLE_SORT_RUST = buildStructuredCode(
  `
  /**
   * Sorts the array in ascending order with bubble sort.
   * Input: mutable vector of integers.
   * Returns: the same vector after in-place sorting.
   */
  //#region bubble-sort function open
  //@step 1
  fn bubble_sort(mut values: Vec<i32>) -> Vec<i32> {
      let n = values.len();

      for end in (1..n).rev() {
          let mut swapped = false;

          for index in 0..end {
              //@step 6
              if values[index] > values[index + 1] {
                  //@step 7
                  values.swap(index, index + 1);
                  swapped = true;
              }
          }

          //@step 11
          if !swapped {
              break;
          }
      }

      //@step 13
      values
  }
  //#endregion bubble-sort
  `,
  'rust',
);

const BUBBLE_SORT_SWIFT = buildStructuredCode(
  `
  /**
   * Sorts the array in ascending order with bubble sort.
   * Input: mutable array of integers.
   * Returns: the same array after in-place sorting.
   */
  //#region bubble-sort function open
  //@step 1
  func bubbleSort(_ values: inout [Int]) -> [Int] {
      let n = values.count

      if n > 1 {
          for end in stride(from: n - 1, through: 1, by: -1) {
              var swapped = false

              for index in 0..<end {
                  //@step 6
                  if values[index] > values[index + 1] {
                      //@step 7
                      values.swapAt(index, index + 1)
                      swapped = true
                  }
              }

              //@step 11
              if !swapped {
                  break
              }
          }
      }

      //@step 13
      return values
  }
  //#endregion bubble-sort
  `,
  'swift',
);

const BUBBLE_SORT_PHP = buildStructuredCode(
  `
  <?php

  /**
   * Sorts the array in ascending order with bubble sort.
   * Input: mutable array of integers.
   * Returns: the same array after in-place sorting.
   *
   * @param array<int, int> $values
   * @return array<int, int>
   */
  //#region bubble-sort function open
  //@step 1
  function bubbleSort(array &$values): array
  {
      $n = count($values);

      for ($end = $n - 1; $end > 0; $end -= 1) {
          $swapped = false;

          for ($index = 0; $index < $end; $index += 1) {
              //@step 6
              if ($values[$index] > $values[$index + 1]) {
                  //@step 7
                  [$values[$index], $values[$index + 1]] = [$values[$index + 1], $values[$index]];
                  $swapped = true;
              }
          }

          //@step 11
          if (!$swapped) {
              break;
          }
      }

      //@step 13
      return $values;
  }
  //#endregion bubble-sort
  `,
  'php',
);

const BUBBLE_SORT_KOTLIN = buildStructuredCode(
  `
  /**
   * Sorts the array in ascending order with bubble sort.
   * Input: mutable array of integers.
   * Returns: the same array after in-place sorting.
   */
  //#region bubble-sort function open
  //@step 1
  fun bubbleSort(values: IntArray): IntArray {
      val n = values.size

      for (end in (n - 1) downTo 1) {
          var swapped = false

          for (index in 0 until end) {
              //@step 6
              if (values[index] > values[index + 1]) {
                  //@step 7
                  val tmp = values[index]
                  values[index] = values[index + 1]
                  values[index + 1] = tmp
                  swapped = true
              }
          }

          //@step 11
          if (!swapped) {
              break
          }
      }

      //@step 13
      return values
  }
  //#endregion bubble-sort
  `,
  'kotlin',
);

export const BUBBLE_SORT_CODE = BUBBLE_SORT_TS.lines;
export const BUBBLE_SORT_CODE_REGIONS = BUBBLE_SORT_TS.regions;
export const BUBBLE_SORT_CODE_HIGHLIGHT_MAP = BUBBLE_SORT_TS.highlightMap;
export const BUBBLE_SORT_CODE_VARIANTS: CodeVariantMap = {
  typescript: {
    language: 'typescript',
    lines: BUBBLE_SORT_TS.lines,
    regions: BUBBLE_SORT_TS.regions,
    highlightMap: BUBBLE_SORT_TS.highlightMap,
    source: BUBBLE_SORT_TS.source,
  },
  javascript: {
    language: 'javascript',
    lines: BUBBLE_SORT_JS.lines,
    regions: BUBBLE_SORT_JS.regions,
    highlightMap: BUBBLE_SORT_JS.highlightMap,
    source: BUBBLE_SORT_JS.source,
  },
  python: {
    language: 'python',
    lines: BUBBLE_SORT_PY.lines,
    regions: BUBBLE_SORT_PY.regions,
    highlightMap: BUBBLE_SORT_PY.highlightMap,
    source: BUBBLE_SORT_PY.source,
  },
  csharp: {
    language: 'csharp',
    lines: BUBBLE_SORT_CS.lines,
    regions: BUBBLE_SORT_CS.regions,
    highlightMap: BUBBLE_SORT_CS.highlightMap,
    source: BUBBLE_SORT_CS.source,
  },
  java: {
    language: 'java',
    lines: BUBBLE_SORT_JAVA.lines,
    regions: BUBBLE_SORT_JAVA.regions,
    highlightMap: BUBBLE_SORT_JAVA.highlightMap,
    source: BUBBLE_SORT_JAVA.source,
  },
  cpp: {
    language: 'cpp',
    lines: BUBBLE_SORT_CPP.lines,
    regions: BUBBLE_SORT_CPP.regions,
    highlightMap: BUBBLE_SORT_CPP.highlightMap,
    source: BUBBLE_SORT_CPP.source,
  },
  go: {
    language: 'go',
    lines: BUBBLE_SORT_GO.lines,
    regions: BUBBLE_SORT_GO.regions,
    highlightMap: BUBBLE_SORT_GO.highlightMap,
    source: BUBBLE_SORT_GO.source,
  },
  rust: {
    language: 'rust',
    lines: BUBBLE_SORT_RUST.lines,
    regions: BUBBLE_SORT_RUST.regions,
    highlightMap: BUBBLE_SORT_RUST.highlightMap,
    source: BUBBLE_SORT_RUST.source,
  },
  swift: {
    language: 'swift',
    lines: BUBBLE_SORT_SWIFT.lines,
    regions: BUBBLE_SORT_SWIFT.regions,
    highlightMap: BUBBLE_SORT_SWIFT.highlightMap,
    source: BUBBLE_SORT_SWIFT.source,
  },
  php: {
    language: 'php',
    lines: BUBBLE_SORT_PHP.lines,
    regions: BUBBLE_SORT_PHP.regions,
    highlightMap: BUBBLE_SORT_PHP.highlightMap,
    source: BUBBLE_SORT_PHP.source,
  },
  kotlin: {
    language: 'kotlin',
    lines: BUBBLE_SORT_KOTLIN.lines,
    regions: BUBBLE_SORT_KOTLIN.regions,
    highlightMap: BUBBLE_SORT_KOTLIN.highlightMap,
    source: BUBBLE_SORT_KOTLIN.source,
  },
};
