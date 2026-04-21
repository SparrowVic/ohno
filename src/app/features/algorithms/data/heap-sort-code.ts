import { CodeVariantMap } from '../models/detail';
import { buildStructuredCode } from './code-line-builder/code-line-builder';

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

const HEAP_SORT_JS = buildStructuredCode(
  `
  /**
   * Sort the array in ascending order with heap sort.
   * Input: mutable array of numbers.
   * Returns: the same array after in-place sorting.
   */
  //#region heap-sort function open
  //@step 1
  function heapSort(values) {
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
  function heapify(values, size, root) {
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
  `,
  'javascript',
);

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

const HEAP_SORT_GO = buildStructuredCode(
  `
  package sorting

  /**
   * Sorts the array in ascending order with heap sort.
   * Input: mutable slice of integers.
   * Returns: the same slice after in-place sorting.
   */
  //#region heap-sort function open
  //@step 1
  func HeapSort(values []int) []int {
      size := len(values)

      for index := size/2 - 1; index >= 0; index -= 1 {
          heapify(values, size, index)
      }

      for end := size - 1; end > 0; end -= 1 {
          //@step 15
          values[0], values[end] = values[end], values[0]
          heapify(values, end, 0)
      }

      //@step 18
      return values
  }
  //#endregion heap-sort

  //#region heapify helper collapsed
  func heapify(values []int, size int, root int) {
      largest := root
      left := root*2 + 1
      right := left + 1

      //@step 6
      if left < size && values[left] > values[largest] {
          largest = left
      }

      //@step 7
      if right < size && values[right] > values[largest] {
          largest = right
      }

      if largest != root {
          //@step 9
          values[root], values[largest] = values[largest], values[root]
          heapify(values, size, largest)
      }
  }
  //#endregion heapify
  `,
  'go',
);

const HEAP_SORT_RUST = buildStructuredCode(
  `
  /**
   * Sorts the array in ascending order with heap sort.
   * Input: mutable vector of integers.
   * Returns: the same vector after in-place sorting.
   */
  //#region heap-sort function open
  //@step 1
  fn heap_sort(mut values: Vec<i32>) -> Vec<i32> {
      let size = values.len();

      for index in (0..(size / 2)).rev() {
          heapify(&mut values, size, index);
      }

      for end in (1..size).rev() {
          //@step 15
          values.swap(0, end);
          heapify(&mut values, end, 0);
      }

      //@step 18
      values
  }
  //#endregion heap-sort

  //#region heapify helper collapsed
  fn heapify(values: &mut [i32], size: usize, root: usize) {
      let mut largest = root;
      let left = root * 2 + 1;
      let right = left + 1;

      //@step 6
      if left < size && values[left] > values[largest] {
          largest = left;
      }

      //@step 7
      if right < size && values[right] > values[largest] {
          largest = right;
      }

      if largest != root {
          //@step 9
          values.swap(root, largest);
          heapify(values, size, largest);
      }
  }
  //#endregion heapify
  `,
  'rust',
);

const HEAP_SORT_SWIFT = buildStructuredCode(
  `
  /**
   * Sorts the array in ascending order with heap sort.
   * Input: mutable array of integers.
   * Returns: the same array after in-place sorting.
   */
  //#region heap-sort function open
  //@step 1
  func heapSort(_ values: inout [Int]) -> [Int] {
      let size = values.count

      if size > 1 {
          for index in stride(from: size / 2 - 1, through: 0, by: -1) {
              heapify(&values, size, index)
          }

          for end in stride(from: size - 1, through: 1, by: -1) {
              //@step 15
              values.swapAt(0, end)
              heapify(&values, end, 0)
          }
      }

      //@step 18
      return values
  }
  //#endregion heap-sort

  //#region heapify helper collapsed
  func heapify(_ values: inout [Int], _ size: Int, _ root: Int) {
      var largest = root
      let left = root * 2 + 1
      let right = left + 1

      //@step 6
      if left < size && values[left] > values[largest] {
          largest = left
      }

      //@step 7
      if right < size && values[right] > values[largest] {
          largest = right
      }

      if largest != root {
          //@step 9
          values.swapAt(root, largest)
          heapify(&values, size, largest)
      }
  }
  //#endregion heapify
  `,
  'swift',
);

const HEAP_SORT_PHP = buildStructuredCode(
  `
  <?php

  /**
   * Sorts the array in ascending order with heap sort.
   * Input: mutable array of integers.
   * Returns: the same array after in-place sorting.
   *
   * @param array<int, int> $values
   * @return array<int, int>
   */
  //#region heap-sort function open
  //@step 1
  function heapSort(array &$values): array
  {
      $size = count($values);

      for ($index = intdiv($size, 2) - 1; $index >= 0; $index -= 1) {
          heapify($values, $size, $index);
      }

      for ($end = $size - 1; $end > 0; $end -= 1) {
          //@step 15
          [$values[0], $values[$end]] = [$values[$end], $values[0]];
          heapify($values, $end, 0);
      }

      //@step 18
      return $values;
  }
  //#endregion heap-sort

  //#region heapify helper collapsed
  function heapify(array &$values, int $size, int $root): void
  {
      $largest = $root;
      $left = $root * 2 + 1;
      $right = $left + 1;

      //@step 6
      if ($left < $size && $values[$left] > $values[$largest]) {
          $largest = $left;
      }

      //@step 7
      if ($right < $size && $values[$right] > $values[$largest]) {
          $largest = $right;
      }

      if ($largest !== $root) {
          //@step 9
          [$values[$root], $values[$largest]] = [$values[$largest], $values[$root]];
          heapify($values, $size, $largest);
      }
  }
  //#endregion heapify
  `,
  'php',
);

const HEAP_SORT_KOTLIN = buildStructuredCode(
  `
  /**
   * Sorts the array in ascending order with heap sort.
   * Input: mutable array of integers.
   * Returns: the same array after in-place sorting.
   */
  //#region heap-sort function open
  //@step 1
  fun heapSort(values: IntArray): IntArray {
      val size = values.size

      if (size > 1) {
          for (index in size / 2 - 1 downTo 0) {
              heapify(values, size, index)
          }

          for (end in size - 1 downTo 1) {
              //@step 15
              val tmp = values[0]
              values[0] = values[end]
              values[end] = tmp
              heapify(values, end, 0)
          }
      }

      //@step 18
      return values
  }
  //#endregion heap-sort

  //#region heapify helper collapsed
  fun heapify(values: IntArray, size: Int, root: Int) {
      var largest = root
      val left = root * 2 + 1
      val right = left + 1

      //@step 6
      if (left < size && values[left] > values[largest]) {
          largest = left
      }

      //@step 7
      if (right < size && values[right] > values[largest]) {
          largest = right
      }

      if (largest != root) {
          //@step 9
          val tmp = values[root]
          values[root] = values[largest]
          values[largest] = tmp
          heapify(values, size, largest)
      }
  }
  //#endregion heapify
  `,
  'kotlin',
);

export const HEAP_SORT_CODE = HEAP_SORT_TS.lines;
export const HEAP_SORT_CODE_REGIONS = HEAP_SORT_TS.regions;
export const HEAP_SORT_CODE_HIGHLIGHT_MAP = HEAP_SORT_TS.highlightMap;
export const HEAP_SORT_CODE_VARIANTS: CodeVariantMap = {
  typescript: {
    language: 'typescript',
    lines: HEAP_SORT_TS.lines,
    regions: HEAP_SORT_TS.regions,
    highlightMap: HEAP_SORT_TS.highlightMap,
    source: HEAP_SORT_TS.source,
  },
  javascript: {
    language: 'javascript',
    lines: HEAP_SORT_JS.lines,
    regions: HEAP_SORT_JS.regions,
    highlightMap: HEAP_SORT_JS.highlightMap,
    source: HEAP_SORT_JS.source,
  },
  python: {
    language: 'python',
    lines: HEAP_SORT_PY.lines,
    regions: HEAP_SORT_PY.regions,
    highlightMap: HEAP_SORT_PY.highlightMap,
    source: HEAP_SORT_PY.source,
  },
  csharp: {
    language: 'csharp',
    lines: HEAP_SORT_CS.lines,
    regions: HEAP_SORT_CS.regions,
    highlightMap: HEAP_SORT_CS.highlightMap,
    source: HEAP_SORT_CS.source,
  },
  java: {
    language: 'java',
    lines: HEAP_SORT_JAVA.lines,
    regions: HEAP_SORT_JAVA.regions,
    highlightMap: HEAP_SORT_JAVA.highlightMap,
    source: HEAP_SORT_JAVA.source,
  },
  cpp: {
    language: 'cpp',
    lines: HEAP_SORT_CPP.lines,
    regions: HEAP_SORT_CPP.regions,
    highlightMap: HEAP_SORT_CPP.highlightMap,
    source: HEAP_SORT_CPP.source,
  },
  go: {
    language: 'go',
    lines: HEAP_SORT_GO.lines,
    regions: HEAP_SORT_GO.regions,
    highlightMap: HEAP_SORT_GO.highlightMap,
    source: HEAP_SORT_GO.source,
  },
  rust: {
    language: 'rust',
    lines: HEAP_SORT_RUST.lines,
    regions: HEAP_SORT_RUST.regions,
    highlightMap: HEAP_SORT_RUST.highlightMap,
    source: HEAP_SORT_RUST.source,
  },
  swift: {
    language: 'swift',
    lines: HEAP_SORT_SWIFT.lines,
    regions: HEAP_SORT_SWIFT.regions,
    highlightMap: HEAP_SORT_SWIFT.highlightMap,
    source: HEAP_SORT_SWIFT.source,
  },
  php: {
    language: 'php',
    lines: HEAP_SORT_PHP.lines,
    regions: HEAP_SORT_PHP.regions,
    highlightMap: HEAP_SORT_PHP.highlightMap,
    source: HEAP_SORT_PHP.source,
  },
  kotlin: {
    language: 'kotlin',
    lines: HEAP_SORT_KOTLIN.lines,
    regions: HEAP_SORT_KOTLIN.regions,
    highlightMap: HEAP_SORT_KOTLIN.highlightMap,
    source: HEAP_SORT_KOTLIN.source,
  },
};
