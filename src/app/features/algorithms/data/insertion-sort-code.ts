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
};
