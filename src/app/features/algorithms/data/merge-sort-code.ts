import { CodeVariantMap } from '../models/detail';
import { buildStructuredCode } from './code-line-builder';

const MERGE_SORT_TS = buildStructuredCode(`
  /**
   * Sort the array in ascending order with merge sort.
   * Input: mutable array of numbers.
   * Returns: the same array after in-place sorting.
   */
  //#region merge-sort function open
  //@step 1
  function mergeSort(values: number[]): number[] {
    const temp = Array.from({ length: values.length }, () => 0);

    if (values.length > 0) {
      sortRange(values, temp, 0, values.length - 1);
    }

    //@step 4
    return values;
  }
  //#endregion merge-sort

  //#region sort-range helper collapsed
  function sortRange(
    values: number[],
    temp: number[],
    left: number,
    right: number,
  ): void {
    if (left >= right) {
      return;
    }

    //@step 7
    const middle = Math.floor((left + right) / 2);
    sortRange(values, temp, left, middle);
    sortRange(values, temp, middle + 1, right);
    mergeRanges(values, temp, left, middle, right);
  }
  //#endregion sort-range

  //#region merge-ranges helper collapsed
  function mergeRanges(
    values: number[],
    temp: number[],
    left: number,
    middle: number,
    right: number,
  ): void {
    let leftIndex = left;
    let rightIndex = middle + 1;
    let writeIndex = left;

    while (leftIndex <= middle && rightIndex <= right) {
      //@step 15
      if (values[leftIndex] <= values[rightIndex]) {
        temp[writeIndex] = values[leftIndex];
        leftIndex += 1;
      } else {
        temp[writeIndex] = values[rightIndex];
        rightIndex += 1;
      }
      writeIndex += 1;
    }

    while (leftIndex <= middle) {
      temp[writeIndex] = values[leftIndex];
      leftIndex += 1;
      writeIndex += 1;
    }

    while (rightIndex <= right) {
      temp[writeIndex] = values[rightIndex];
      rightIndex += 1;
      writeIndex += 1;
    }

    for (let index = left; index <= right; index += 1) {
      //@step 19
      values[index] = temp[index];
    }
  }
  //#endregion merge-ranges
`);

const MERGE_SORT_PY = buildStructuredCode(
  `
  """
  Sort the array in ascending order with merge sort.
  Input: mutable list of numbers.
  Returns: the same list after in-place sorting.
  """
  //#region merge-sort function open
  //@step 1
  def merge_sort(values: list[int]) -> list[int]:
      temp = [0] * len(values)

      if values:
          sort_range(values, temp, 0, len(values) - 1)

      //@step 4
      return values
  //#endregion merge-sort

  //#region sort-range helper collapsed
  def sort_range(values: list[int], temp: list[int], left: int, right: int) -> None:
      if left >= right:
          return

      //@step 7
      middle = (left + right) // 2
      sort_range(values, temp, left, middle)
      sort_range(values, temp, middle + 1, right)
      merge_ranges(values, temp, left, middle, right)
  //#endregion sort-range

  //#region merge-ranges helper collapsed
  def merge_ranges(
      values: list[int],
      temp: list[int],
      left: int,
      middle: int,
      right: int,
  ) -> None:
      left_index = left
      right_index = middle + 1
      write_index = left

      while left_index <= middle and right_index <= right:
          //@step 15
          if values[left_index] <= values[right_index]:
              temp[write_index] = values[left_index]
              left_index += 1
          else:
              temp[write_index] = values[right_index]
              right_index += 1
          write_index += 1

      while left_index <= middle:
          temp[write_index] = values[left_index]
          left_index += 1
          write_index += 1

      while right_index <= right:
          temp[write_index] = values[right_index]
          right_index += 1
          write_index += 1

      for index in range(left, right + 1):
          //@step 19
          values[index] = temp[index]
  //#endregion merge-ranges
  `,
  'python',
);

const MERGE_SORT_CS = buildStructuredCode(
  `
  /// <summary>
  /// Sorts the array in ascending order with merge sort.
  /// Input: mutable array of integers.
  /// Returns: the same array after in-place sorting.
  /// </summary>
  //#region merge-sort function open
  //@step 1
  public static int[] MergeSort(int[] values)
  {
      var temp = new int[values.Length];

      if (values.Length > 0)
      {
          SortRange(values, temp, 0, values.Length - 1);
      }

      //@step 4
      return values;
  }
  //#endregion merge-sort

  //#region sort-range helper collapsed
  private static void SortRange(int[] values, int[] temp, int left, int right)
  {
      if (left >= right)
      {
          return;
      }

      //@step 7
      var middle = (left + right) / 2;
      SortRange(values, temp, left, middle);
      SortRange(values, temp, middle + 1, right);
      MergeRanges(values, temp, left, middle, right);
  }
  //#endregion sort-range

  //#region merge-ranges helper collapsed
  private static void MergeRanges(int[] values, int[] temp, int left, int middle, int right)
  {
      var leftIndex = left;
      var rightIndex = middle + 1;
      var writeIndex = left;

      while (leftIndex <= middle && rightIndex <= right)
      {
          //@step 15
          if (values[leftIndex] <= values[rightIndex])
          {
              temp[writeIndex] = values[leftIndex];
              leftIndex += 1;
          }
          else
          {
              temp[writeIndex] = values[rightIndex];
              rightIndex += 1;
          }

          writeIndex += 1;
      }

      while (leftIndex <= middle)
      {
          temp[writeIndex] = values[leftIndex];
          leftIndex += 1;
          writeIndex += 1;
      }

      while (rightIndex <= right)
      {
          temp[writeIndex] = values[rightIndex];
          rightIndex += 1;
          writeIndex += 1;
      }

      for (var index = left; index <= right; index += 1)
      {
          //@step 19
          values[index] = temp[index];
      }
  }
  //#endregion merge-ranges
  `,
  'csharp',
);

const MERGE_SORT_JAVA = buildStructuredCode(
  `
  /**
   * Sorts the array in ascending order with merge sort.
   * Input: mutable array of integers.
   * Returns: the same array after in-place sorting.
   */
  //#region merge-sort function open
  //@step 1
  public static int[] mergeSort(int[] values) {
      int[] temp = new int[values.length];

      if (values.length > 0) {
          sortRange(values, temp, 0, values.length - 1);
      }

      //@step 4
      return values;
  }
  //#endregion merge-sort

  //#region sort-range helper collapsed
  private static void sortRange(int[] values, int[] temp, int left, int right) {
      if (left >= right) {
          return;
      }

      //@step 7
      int middle = (left + right) / 2;
      sortRange(values, temp, left, middle);
      sortRange(values, temp, middle + 1, right);
      mergeRanges(values, temp, left, middle, right);
  }
  //#endregion sort-range

  //#region merge-ranges helper collapsed
  private static void mergeRanges(int[] values, int[] temp, int left, int middle, int right) {
      int leftIndex = left;
      int rightIndex = middle + 1;
      int writeIndex = left;

      while (leftIndex <= middle && rightIndex <= right) {
          //@step 15
          if (values[leftIndex] <= values[rightIndex]) {
              temp[writeIndex] = values[leftIndex];
              leftIndex += 1;
          } else {
              temp[writeIndex] = values[rightIndex];
              rightIndex += 1;
          }
          writeIndex += 1;
      }

      while (leftIndex <= middle) {
          temp[writeIndex] = values[leftIndex];
          leftIndex += 1;
          writeIndex += 1;
      }

      while (rightIndex <= right) {
          temp[writeIndex] = values[rightIndex];
          rightIndex += 1;
          writeIndex += 1;
      }

      for (int index = left; index <= right; index += 1) {
          //@step 19
          values[index] = temp[index];
      }
  }
  //#endregion merge-ranges
  `,
  'java',
);

const MERGE_SORT_CPP = buildStructuredCode(
  `
  #include <vector>

  void sortRange(std::vector<int>& values, std::vector<int>& temp, int left, int right);
  void mergeRanges(
      std::vector<int>& values,
      std::vector<int>& temp,
      int left,
      int middle,
      int right
  );

  /**
   * Sorts the array in ascending order with merge sort.
   * Input: mutable vector of integers.
   * Returns: the same vector after in-place sorting.
   */
  //#region merge-sort function open
  //@step 1
  std::vector<int> mergeSort(std::vector<int> values) {
      std::vector<int> temp(values.size(), 0);

      if (!values.empty()) {
          sortRange(values, temp, 0, static_cast<int>(values.size()) - 1);
      }

      //@step 4
      return values;
  }
  //#endregion merge-sort

  //#region sort-range helper collapsed
  void sortRange(std::vector<int>& values, std::vector<int>& temp, int left, int right) {
      if (left >= right) {
          return;
      }

      //@step 7
      int middle = (left + right) / 2;
      sortRange(values, temp, left, middle);
      sortRange(values, temp, middle + 1, right);
      mergeRanges(values, temp, left, middle, right);
  }
  //#endregion sort-range

  //#region merge-ranges helper collapsed
  void mergeRanges(
      std::vector<int>& values,
      std::vector<int>& temp,
      int left,
      int middle,
      int right
  ) {
      int leftIndex = left;
      int rightIndex = middle + 1;
      int writeIndex = left;

      while (leftIndex <= middle && rightIndex <= right) {
          //@step 15
          if (values[leftIndex] <= values[rightIndex]) {
              temp[writeIndex] = values[leftIndex];
              leftIndex += 1;
          } else {
              temp[writeIndex] = values[rightIndex];
              rightIndex += 1;
          }
          writeIndex += 1;
      }

      while (leftIndex <= middle) {
          temp[writeIndex] = values[leftIndex];
          leftIndex += 1;
          writeIndex += 1;
      }

      while (rightIndex <= right) {
          temp[writeIndex] = values[rightIndex];
          rightIndex += 1;
          writeIndex += 1;
      }

      for (int index = left; index <= right; index += 1) {
          //@step 19
          values[index] = temp[index];
      }
  }
  //#endregion merge-ranges
  `,
  'cpp',
);

export const MERGE_SORT_CODE = MERGE_SORT_TS.lines;
export const MERGE_SORT_CODE_REGIONS = MERGE_SORT_TS.regions;
export const MERGE_SORT_CODE_HIGHLIGHT_MAP = MERGE_SORT_TS.highlightMap;
export const MERGE_SORT_CODE_VARIANTS: CodeVariantMap = {
  typescript: {
    language: 'typescript',
    lines: MERGE_SORT_TS.lines,
    regions: MERGE_SORT_TS.regions,
    highlightMap: MERGE_SORT_TS.highlightMap,
    source: MERGE_SORT_TS.source,
  },
  python: {
    language: 'python',
    lines: MERGE_SORT_PY.lines,
    regions: MERGE_SORT_PY.regions,
    highlightMap: MERGE_SORT_PY.highlightMap,
    source: MERGE_SORT_PY.source,
  },
  csharp: {
    language: 'csharp',
    lines: MERGE_SORT_CS.lines,
    regions: MERGE_SORT_CS.regions,
    highlightMap: MERGE_SORT_CS.highlightMap,
    source: MERGE_SORT_CS.source,
  },
  java: {
    language: 'java',
    lines: MERGE_SORT_JAVA.lines,
    regions: MERGE_SORT_JAVA.regions,
    highlightMap: MERGE_SORT_JAVA.highlightMap,
    source: MERGE_SORT_JAVA.source,
  },
  cpp: {
    language: 'cpp',
    lines: MERGE_SORT_CPP.lines,
    regions: MERGE_SORT_CPP.regions,
    highlightMap: MERGE_SORT_CPP.highlightMap,
    source: MERGE_SORT_CPP.source,
  },
};
