import { CodeVariantMap } from '../models/detail';
import { buildStructuredCode } from './code-line-builder';

const HEAP_SORT_TS = buildStructuredCode(`
  /**
   * Sort the array in ascending order with heap sort.
   * Input: mutable array of numbers.
   * Returns: the same array after in-place sorting.
   */
  //#region heap-sort function open
  //@step 1
  function heapSort(values: number[]): number[] {
    const size = values.length;

    for (let index = Math.floor(size / 2) - 1; index >= 0; index -= 1) {
      heapify(values, size, index);
    }

    for (let end = size - 1; end > 0; end -= 1) {
      //@step 15
      [values[0], values[end]] = [values[end], values[0]];
      heapify(values, end, 0);
    }

    //@step 18
    return values;
  }
  //#endregion heap-sort

  //#region heapify helper collapsed
  function heapify(values: number[], size: number, root: number): void {
    let largest = root;
    const left = root * 2 + 1;
    const right = left + 1;

    //@step 6
    if (left < size && values[left] > values[largest]) {
      largest = left;
    }

    //@step 7
    if (right < size && values[right] > values[largest]) {
      largest = right;
    }

    if (largest !== root) {
      //@step 9
      [values[root], values[largest]] = [values[largest], values[root]];
      heapify(values, size, largest);
    }
  }
  //#endregion heapify
`);

const HEAP_SORT_PY = buildStructuredCode(
  `
  """
  Sort the array in ascending order with heap sort.
  Input: mutable list of numbers.
  Returns: the same list after in-place sorting.
  """
  //#region heap-sort function open
  //@step 1
  def heap_sort(values: list[int]) -> list[int]:
      size = len(values)

      for index in range(size // 2 - 1, -1, -1):
          heapify(values, size, index)

      for end in range(size - 1, 0, -1):
          //@step 15
          values[0], values[end] = values[end], values[0]
          heapify(values, end, 0)

      //@step 18
      return values
  //#endregion heap-sort

  //#region heapify helper collapsed
  def heapify(values: list[int], size: int, root: int) -> None:
      largest = root
      left = root * 2 + 1
      right = left + 1

      //@step 6
      if left < size and values[left] > values[largest]:
          largest = left

      //@step 7
      if right < size and values[right] > values[largest]:
          largest = right

      if largest != root:
          //@step 9
          values[root], values[largest] = values[largest], values[root]
          heapify(values, size, largest)
  //#endregion heapify
  `,
  'python',
);

const HEAP_SORT_CS = buildStructuredCode(
  `
  /// <summary>
  /// Sorts the array in ascending order with heap sort.
  /// Input: mutable array of integers.
  /// Returns: the same array after in-place sorting.
  /// </summary>
  //#region heap-sort function open
  //@step 1
  public static int[] HeapSort(int[] values)
  {
      var size = values.Length;

      for (var index = size / 2 - 1; index >= 0; index -= 1)
      {
          Heapify(values, size, index);
      }

      for (var end = size - 1; end > 0; end -= 1)
      {
          //@step 15
          (values[0], values[end]) = (values[end], values[0]);
          Heapify(values, end, 0);
      }

      //@step 18
      return values;
  }
  //#endregion heap-sort

  //#region heapify helper collapsed
  private static void Heapify(int[] values, int size, int root)
  {
      var largest = root;
      var left = root * 2 + 1;
      var right = left + 1;

      //@step 6
      if (left < size && values[left] > values[largest])
      {
          largest = left;
      }

      //@step 7
      if (right < size && values[right] > values[largest])
      {
          largest = right;
      }

      if (largest != root)
      {
          //@step 9
          (values[root], values[largest]) = (values[largest], values[root]);
          Heapify(values, size, largest);
      }
  }
  //#endregion heapify
  `,
  'csharp',
);

const HEAP_SORT_JAVA = buildStructuredCode(
  `
  /**
   * Sorts the array in ascending order with heap sort.
   * Input: mutable array of integers.
   * Returns: the same array after in-place sorting.
   */
  //#region heap-sort function open
  //@step 1
  public static int[] heapSort(int[] values) {
      int size = values.length;

      for (int index = size / 2 - 1; index >= 0; index -= 1) {
          heapify(values, size, index);
      }

      for (int end = size - 1; end > 0; end -= 1) {
          //@step 15
          int tmp = values[0];
          values[0] = values[end];
          values[end] = tmp;
          heapify(values, end, 0);
      }

      //@step 18
      return values;
  }
  //#endregion heap-sort

  //#region heapify helper collapsed
  private static void heapify(int[] values, int size, int root) {
      int largest = root;
      int left = root * 2 + 1;
      int right = left + 1;

      //@step 6
      if (left < size && values[left] > values[largest]) {
          largest = left;
      }

      //@step 7
      if (right < size && values[right] > values[largest]) {
          largest = right;
      }

      if (largest != root) {
          //@step 9
          int tmp = values[root];
          values[root] = values[largest];
          values[largest] = tmp;
          heapify(values, size, largest);
      }
  }
  //#endregion heapify
  `,
  'java',
);

const HEAP_SORT_CPP = buildStructuredCode(
  `
  #include <vector>
  #include <utility>

  void heapify(std::vector<int>& values, int size, int root);

  /**
   * Sorts the array in ascending order with heap sort.
   * Input: mutable vector of integers.
   * Returns: the same vector after in-place sorting.
   */
  //#region heap-sort function open
  //@step 1
  std::vector<int> heapSort(std::vector<int> values) {
      int size = static_cast<int>(values.size());

      for (int index = size / 2 - 1; index >= 0; index -= 1) {
          heapify(values, size, index);
      }

      for (int end = size - 1; end > 0; end -= 1) {
          //@step 15
          std::swap(values[0], values[end]);
          heapify(values, end, 0);
      }

      //@step 18
      return values;
  }
  //#endregion heap-sort

  //#region heapify helper collapsed
  void heapify(std::vector<int>& values, int size, int root) {
      int largest = root;
      int left = root * 2 + 1;
      int right = left + 1;

      //@step 6
      if (left < size && values[left] > values[largest]) {
          largest = left;
      }

      //@step 7
      if (right < size && values[right] > values[largest]) {
          largest = right;
      }

      if (largest != root) {
          //@step 9
          std::swap(values[root], values[largest]);
          heapify(values, size, largest);
      }
  }
  //#endregion heapify
  `,
  'cpp',
);

export const HEAP_SORT_CODE = HEAP_SORT_TS.lines;
export const HEAP_SORT_CODE_REGIONS = HEAP_SORT_TS.regions;
export const HEAP_SORT_CODE_HIGHLIGHT_MAP = HEAP_SORT_TS.highlightMap;
export const HEAP_SORT_CODE_VARIANTS: CodeVariantMap = {
  typescript: { language: 'typescript', lines: HEAP_SORT_TS.lines, regions: HEAP_SORT_TS.regions, highlightMap: HEAP_SORT_TS.highlightMap, source: HEAP_SORT_TS.source },
  python: { language: 'python', lines: HEAP_SORT_PY.lines, regions: HEAP_SORT_PY.regions, highlightMap: HEAP_SORT_PY.highlightMap, source: HEAP_SORT_PY.source },
  csharp: { language: 'csharp', lines: HEAP_SORT_CS.lines, regions: HEAP_SORT_CS.regions, highlightMap: HEAP_SORT_CS.highlightMap, source: HEAP_SORT_CS.source },
  java: { language: 'java', lines: HEAP_SORT_JAVA.lines, regions: HEAP_SORT_JAVA.regions, highlightMap: HEAP_SORT_JAVA.highlightMap, source: HEAP_SORT_JAVA.source },
  cpp: { language: 'cpp', lines: HEAP_SORT_CPP.lines, regions: HEAP_SORT_CPP.regions, highlightMap: HEAP_SORT_CPP.highlightMap, source: HEAP_SORT_CPP.source },
};
