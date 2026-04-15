import { CodeVariantMap } from '../models/detail';
import { buildStructuredCode } from './code-line-builder';

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
};
