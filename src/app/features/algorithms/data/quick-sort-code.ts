import { CodeVariantMap } from '../models/detail';
import { buildStructuredCode } from './code-line-builder/code-line-builder';

const QUICK_SORT_TS = buildStructuredCode(`
  /**
   * Sort the array in ascending order with quick sort.
   * Input: mutable array of numbers.
   * Returns: the same array after in-place sorting.
   */
  //#region quick-sort function open
  //@step 1
  function quickSort(values: number[]): number[] {
    sortRange(values, 0, values.length - 1);
    //@step 14
    return values;
  }
  //#endregion quick-sort

  //#region sort-range helper collapsed
  function sortRange(values: number[], low: number, high: number): void {
    //@step 3
    if (low >= high) {
      return;
    }

    //@step 5
    const pivot = values[high];
    let storeIndex = low;

    //@step 6
    for (let index = low; index < high; index += 1) {
      //@step 9
      if (values[index] < pivot) {
        //@step 10
        [values[storeIndex], values[index]] = [values[index], values[storeIndex]];
        storeIndex += 1;
      }
    }

    //@step 14
    [values[storeIndex], values[high]] = [values[high], values[storeIndex]];
    sortRange(values, low, storeIndex - 1);
    sortRange(values, storeIndex + 1, high);
  }
  //#endregion sort-range
`);

const QUICK_SORT_JS = buildStructuredCode(
  `
  /**
   * Sort the array in ascending order with quick sort.
   * Input: mutable array of numbers.
   * Returns: the same array after in-place sorting.
   */
  //#region quick-sort function open
  //@step 1
  function quickSort(values) {
      sortRange(values, 0, values.length - 1);
      //@step 14
      return values;
  }
  //#endregion quick-sort

  //#region sort-range helper collapsed
  function sortRange(values, low, high) {
      //@step 3
      if (low >= high) {
          return;
      }

      //@step 5
      const pivot = values[high];
      let storeIndex = low;

      //@step 6
      for (let index = low; index < high; index += 1) {
          //@step 9
          if (values[index] < pivot) {
              //@step 10
              [values[storeIndex], values[index]] = [values[index], values[storeIndex]];
              storeIndex += 1;
          }
      }

      //@step 14
      [values[storeIndex], values[high]] = [values[high], values[storeIndex]];
      sortRange(values, low, storeIndex - 1);
      sortRange(values, storeIndex + 1, high);
  }
  //#endregion sort-range
  `,
  'javascript',
);

const QUICK_SORT_PY = buildStructuredCode(
  `
  """
  Sort the array in ascending order with quick sort.
  Input: mutable list of numbers.
  Returns: the same list after in-place sorting.
  """
  //#region quick-sort function open
  //@step 1
  def quick_sort(values: list[int]) -> list[int]:
      sort_range(values, 0, len(values) - 1)
      //@step 14
      return values
  //#endregion quick-sort

  //#region sort-range helper collapsed
  def sort_range(values: list[int], low: int, high: int) -> None:
      //@step 3
      if low >= high:
          return

      //@step 5
      pivot = values[high]
      store_index = low

      //@step 6
      for index in range(low, high):
          //@step 9
          if values[index] < pivot:
              //@step 10
              values[store_index], values[index] = values[index], values[store_index]
              store_index += 1

      //@step 14
      values[store_index], values[high] = values[high], values[store_index]
      sort_range(values, low, store_index - 1)
      sort_range(values, store_index + 1, high)
  //#endregion sort-range
  `,
  'python',
);

const QUICK_SORT_CS = buildStructuredCode(
  `
  /// <summary>
  /// Sorts the array in ascending order with quick sort.
  /// Input: mutable array of integers.
  /// Returns: the same array after in-place sorting.
  /// </summary>
  //#region quick-sort function open
  //@step 1
  public static int[] QuickSort(int[] values)
  {
      SortRange(values, 0, values.Length - 1);
      //@step 14
      return values;
  }
  //#endregion quick-sort

  //#region sort-range helper collapsed
  private static void SortRange(int[] values, int low, int high)
  {
      //@step 3
      if (low >= high)
      {
          return;
      }

      //@step 5
      var pivot = values[high];
      var storeIndex = low;

      //@step 6
      for (var index = low; index < high; index += 1)
      {
          //@step 9
          if (values[index] < pivot)
          {
              //@step 10
              (values[storeIndex], values[index]) = (values[index], values[storeIndex]);
              storeIndex += 1;
          }
      }

      //@step 14
      (values[storeIndex], values[high]) = (values[high], values[storeIndex]);
      SortRange(values, low, storeIndex - 1);
      SortRange(values, storeIndex + 1, high);
  }
  //#endregion sort-range
  `,
  'csharp',
);

const QUICK_SORT_JAVA = buildStructuredCode(
  `
  /**
   * Sorts the array in ascending order with quick sort.
   * Input: mutable array of integers.
   * Returns: the same array after in-place sorting.
   */
  //#region quick-sort function open
  //@step 1
  public static int[] quickSort(int[] values) {
      sortRange(values, 0, values.length - 1);
      //@step 14
      return values;
  }
  //#endregion quick-sort

  //#region sort-range helper collapsed
  private static void sortRange(int[] values, int low, int high) {
      //@step 3
      if (low >= high) {
          return;
      }

      //@step 5
      int pivot = values[high];
      int storeIndex = low;

      //@step 6
      for (int index = low; index < high; index += 1) {
          //@step 9
          if (values[index] < pivot) {
              //@step 10
              int tmp = values[storeIndex];
              values[storeIndex] = values[index];
              values[index] = tmp;
              storeIndex += 1;
          }
      }

      //@step 14
      int tmp = values[storeIndex];
      values[storeIndex] = values[high];
      values[high] = tmp;
      sortRange(values, low, storeIndex - 1);
      sortRange(values, storeIndex + 1, high);
  }
  //#endregion sort-range
  `,
  'java',
);

const QUICK_SORT_CPP = buildStructuredCode(
  `
  #include <vector>
  #include <utility>

  void sortRange(std::vector<int>& values, int low, int high);

  /**
   * Sorts the array in ascending order with quick sort.
   * Input: mutable vector of integers.
   * Returns: the same vector after in-place sorting.
   */
  //#region quick-sort function open
  //@step 1
  std::vector<int> quickSort(std::vector<int> values) {
      sortRange(values, 0, static_cast<int>(values.size()) - 1);
      //@step 14
      return values;
  }
  //#endregion quick-sort

  //#region sort-range helper collapsed
  void sortRange(std::vector<int>& values, int low, int high) {
      //@step 3
      if (low >= high) {
          return;
      }

      //@step 5
      int pivot = values[high];
      int storeIndex = low;

      //@step 6
      for (int index = low; index < high; index += 1) {
          //@step 9
          if (values[index] < pivot) {
              //@step 10
              std::swap(values[storeIndex], values[index]);
              storeIndex += 1;
          }
      }

      //@step 14
      std::swap(values[storeIndex], values[high]);
      sortRange(values, low, storeIndex - 1);
      sortRange(values, storeIndex + 1, high);
  }
  //#endregion sort-range
  `,
  'cpp',
);

const QUICK_SORT_GO = buildStructuredCode(
  `
  package sorting

  /**
   * Sorts the array in ascending order with quick sort.
   * Input: mutable slice of integers.
   * Returns: the same slice after in-place sorting.
   */
  //#region quick-sort function open
  //@step 1
  func QuickSort(values []int) []int {
      sortRange(values, 0, len(values)-1)
      //@step 14
      return values
  }
  //#endregion quick-sort

  //#region sort-range helper collapsed
  func sortRange(values []int, low int, high int) {
      //@step 3
      if low >= high {
          return
      }

      //@step 5
      pivot := values[high]
      storeIndex := low

      //@step 6
      for index := low; index < high; index += 1 {
          //@step 9
          if values[index] < pivot {
              //@step 10
              values[storeIndex], values[index] = values[index], values[storeIndex]
              storeIndex += 1
          }
      }

      //@step 14
      values[storeIndex], values[high] = values[high], values[storeIndex]
      sortRange(values, low, storeIndex-1)
      sortRange(values, storeIndex+1, high)
  }
  //#endregion sort-range
  `,
  'go',
);

const QUICK_SORT_RUST = buildStructuredCode(
  `
  /**
   * Sorts the array in ascending order with quick sort.
   * Input: mutable vector of integers.
   * Returns: the same vector after in-place sorting.
   */
  //#region quick-sort function open
  //@step 1
  fn quick_sort(mut values: Vec<i32>) -> Vec<i32> {
      sort_range(&mut values, 0, values.len() as isize - 1);
      //@step 14
      values
  }
  //#endregion quick-sort

  //#region sort-range helper collapsed
  fn sort_range(values: &mut [i32], low: isize, high: isize) {
      //@step 3
      if low >= high {
          return;
      }

      //@step 5
      let pivot = values[high as usize];
      let mut store_index = low;

      //@step 6
      for index in low..high {
          //@step 9
          if values[index as usize] < pivot {
              //@step 10
              values.swap(store_index as usize, index as usize);
              store_index += 1;
          }
      }

      //@step 14
      values.swap(store_index as usize, high as usize);
      sort_range(values, low, store_index - 1);
      sort_range(values, store_index + 1, high);
  }
  //#endregion sort-range
  `,
  'rust',
);

const QUICK_SORT_SWIFT = buildStructuredCode(
  `
  /**
   * Sorts the array in ascending order with quick sort.
   * Input: mutable array of integers.
   * Returns: the same array after in-place sorting.
   */
  //#region quick-sort function open
  //@step 1
  func quickSort(_ values: inout [Int]) -> [Int] {
      sortRange(&values, 0, values.count - 1)
      //@step 14
      return values
  }
  //#endregion quick-sort

  //#region sort-range helper collapsed
  func sortRange(_ values: inout [Int], _ low: Int, _ high: Int) {
      //@step 3
      if low >= high {
          return
      }

      //@step 5
      let pivot = values[high]
      var storeIndex = low

      //@step 6
      for index in low..<high {
          //@step 9
          if values[index] < pivot {
              //@step 10
              values.swapAt(storeIndex, index)
              storeIndex += 1
          }
      }

      //@step 14
      values.swapAt(storeIndex, high)
      sortRange(&values, low, storeIndex - 1)
      sortRange(&values, storeIndex + 1, high)
  }
  //#endregion sort-range
  `,
  'swift',
);

const QUICK_SORT_PHP = buildStructuredCode(
  `
  <?php

  /**
   * Sorts the array in ascending order with quick sort.
   * Input: mutable array of integers.
   * Returns: the same array after in-place sorting.
   *
   * @param array<int, int> $values
   * @return array<int, int>
   */
  //#region quick-sort function open
  //@step 1
  function quickSort(array &$values): array
  {
      sortRange($values, 0, count($values) - 1);
      //@step 14
      return $values;
  }
  //#endregion quick-sort

  //#region sort-range helper collapsed
  function sortRange(array &$values, int $low, int $high): void
  {
      //@step 3
      if ($low >= $high) {
          return;
      }

      //@step 5
      $pivot = $values[$high];
      $storeIndex = $low;

      //@step 6
      for ($index = $low; $index < $high; $index += 1) {
          //@step 9
          if ($values[$index] < $pivot) {
              //@step 10
              [$values[$storeIndex], $values[$index]] = [$values[$index], $values[$storeIndex]];
              $storeIndex += 1;
          }
      }

      //@step 14
      [$values[$storeIndex], $values[$high]] = [$values[$high], $values[$storeIndex]];
      sortRange($values, $low, $storeIndex - 1);
      sortRange($values, $storeIndex + 1, $high);
  }
  //#endregion sort-range
  `,
  'php',
);

const QUICK_SORT_KOTLIN = buildStructuredCode(
  `
  /**
   * Sorts the array in ascending order with quick sort.
   * Input: mutable array of integers.
   * Returns: the same array after in-place sorting.
   */
  //#region quick-sort function open
  //@step 1
  fun quickSort(values: IntArray): IntArray {
      sortRange(values, 0, values.size - 1)
      //@step 14
      return values
  }
  //#endregion quick-sort

  //#region sort-range helper collapsed
  fun sortRange(values: IntArray, low: Int, high: Int) {
      //@step 3
      if (low >= high) {
          return
      }

      //@step 5
      val pivot = values[high]
      var storeIndex = low

      //@step 6
      for (index in low until high) {
          //@step 9
          if (values[index] < pivot) {
              //@step 10
              val tmp = values[storeIndex]
              values[storeIndex] = values[index]
              values[index] = tmp
              storeIndex += 1
          }
      }

      //@step 14
      val tmp = values[storeIndex]
      values[storeIndex] = values[high]
      values[high] = tmp
      sortRange(values, low, storeIndex - 1)
      sortRange(values, storeIndex + 1, high)
  }
  //#endregion sort-range
  `,
  'kotlin',
);

export const QUICK_SORT_CODE = QUICK_SORT_TS.lines;
export const QUICK_SORT_CODE_REGIONS = QUICK_SORT_TS.regions;
export const QUICK_SORT_CODE_HIGHLIGHT_MAP = QUICK_SORT_TS.highlightMap;
export const QUICK_SORT_CODE_VARIANTS: CodeVariantMap = {
  typescript: {
    language: 'typescript',
    lines: QUICK_SORT_TS.lines,
    regions: QUICK_SORT_TS.regions,
    highlightMap: QUICK_SORT_TS.highlightMap,
    source: QUICK_SORT_TS.source,
  },
  javascript: {
    language: 'javascript',
    lines: QUICK_SORT_JS.lines,
    regions: QUICK_SORT_JS.regions,
    highlightMap: QUICK_SORT_JS.highlightMap,
    source: QUICK_SORT_JS.source,
  },
  python: {
    language: 'python',
    lines: QUICK_SORT_PY.lines,
    regions: QUICK_SORT_PY.regions,
    highlightMap: QUICK_SORT_PY.highlightMap,
    source: QUICK_SORT_PY.source,
  },
  csharp: {
    language: 'csharp',
    lines: QUICK_SORT_CS.lines,
    regions: QUICK_SORT_CS.regions,
    highlightMap: QUICK_SORT_CS.highlightMap,
    source: QUICK_SORT_CS.source,
  },
  java: {
    language: 'java',
    lines: QUICK_SORT_JAVA.lines,
    regions: QUICK_SORT_JAVA.regions,
    highlightMap: QUICK_SORT_JAVA.highlightMap,
    source: QUICK_SORT_JAVA.source,
  },
  cpp: {
    language: 'cpp',
    lines: QUICK_SORT_CPP.lines,
    regions: QUICK_SORT_CPP.regions,
    highlightMap: QUICK_SORT_CPP.highlightMap,
    source: QUICK_SORT_CPP.source,
  },
  go: {
    language: 'go',
    lines: QUICK_SORT_GO.lines,
    regions: QUICK_SORT_GO.regions,
    highlightMap: QUICK_SORT_GO.highlightMap,
    source: QUICK_SORT_GO.source,
  },
  rust: {
    language: 'rust',
    lines: QUICK_SORT_RUST.lines,
    regions: QUICK_SORT_RUST.regions,
    highlightMap: QUICK_SORT_RUST.highlightMap,
    source: QUICK_SORT_RUST.source,
  },
  swift: {
    language: 'swift',
    lines: QUICK_SORT_SWIFT.lines,
    regions: QUICK_SORT_SWIFT.regions,
    highlightMap: QUICK_SORT_SWIFT.highlightMap,
    source: QUICK_SORT_SWIFT.source,
  },
  php: {
    language: 'php',
    lines: QUICK_SORT_PHP.lines,
    regions: QUICK_SORT_PHP.regions,
    highlightMap: QUICK_SORT_PHP.highlightMap,
    source: QUICK_SORT_PHP.source,
  },
  kotlin: {
    language: 'kotlin',
    lines: QUICK_SORT_KOTLIN.lines,
    regions: QUICK_SORT_KOTLIN.regions,
    highlightMap: QUICK_SORT_KOTLIN.highlightMap,
    source: QUICK_SORT_KOTLIN.source,
  },
};
