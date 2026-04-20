import { CodeVariantMap } from '../models/detail';
import { buildStructuredCode } from './code-line-builder/code-line-builder';

const COUNTING_SORT_TS = buildStructuredCode(`
  /**
   * Sort non-negative integers with counting sort.
   * Input: mutable array of integers in a compact range.
   * Returns: the same array after in-place sorting.
   */
  //#region counting-sort function open
  //@step 1
  function countingSort(values: number[]): number[] {
    const maxValue = Math.max(0, ...values);
    const counts = Array.from({ length: maxValue + 1 }, () => 0);

    for (const value of values) {
      //@step 5
      counts[value] += 1;
    }

    let write = 0;
    for (let value = 0; value <= maxValue; value += 1) {
      while (counts[value] > 0) {
        //@step 10
        values[write] = value;
        write += 1;
        counts[value] -= 1;
      }
    }

    //@step 15
    return values;
  }
  //#endregion counting-sort
`);

const COUNTING_SORT_JS = buildStructuredCode(
  `
  /**
   * Sort non-negative integers with counting sort.
   * Input: mutable array of integers in a compact range.
   * Returns: the same array after in-place sorting.
   */
  //#region counting-sort function open
  //@step 1
  function countingSort(values) {
      const maxValue = Math.max(0, ...values);
      const counts = Array.from({ length: maxValue + 1 }, () => 0);

      for (const value of values) {
          //@step 5
          counts[value] += 1;
      }

      let write = 0;
      for (let value = 0; value <= maxValue; value += 1) {
          while (counts[value] > 0) {
              //@step 10
              values[write] = value;
              write += 1;
              counts[value] -= 1;
          }
      }

      //@step 15
      return values;
  }
  //#endregion counting-sort
  `,
  'javascript',
);

const COUNTING_SORT_PY = buildStructuredCode(
  `
  """
  Sort non-negative integers with counting sort.
  Input: mutable list of integers in a compact range.
  Returns: the same list after in-place sorting.
  """
  //#region counting-sort function open
  //@step 1
  def counting_sort(values: list[int]) -> list[int]:
      max_value = max([0, *values])
      counts = [0] * (max_value + 1)

      for value in values:
          //@step 5
          counts[value] += 1

      write = 0
      for value in range(max_value + 1):
          while counts[value] > 0:
              //@step 10
              values[write] = value
              write += 1
              counts[value] -= 1

      //@step 15
      return values
  //#endregion counting-sort
  `,
  'python',
);

const COUNTING_SORT_CS = buildStructuredCode(
  `
  using System;
  using System.Linq;

  /// <summary>
  /// Sorts non-negative integers with counting sort.
  /// Input: mutable array of integers in a compact range.
  /// Returns: the same array after in-place sorting.
  /// </summary>
  //#region counting-sort function open
  //@step 1
  public static int[] CountingSort(int[] values)
  {
      var maxValue = Math.Max(0, values.Length == 0 ? 0 : values.Max());
      var counts = new int[maxValue + 1];

      foreach (var value in values)
      {
          //@step 5
          counts[value] += 1;
      }

      var write = 0;
      for (var value = 0; value <= maxValue; value += 1)
      {
          while (counts[value] > 0)
          {
              //@step 10
              values[write] = value;
              write += 1;
              counts[value] -= 1;
          }
      }

      //@step 15
      return values;
  }
  //#endregion counting-sort
  `,
  'csharp',
);

const COUNTING_SORT_JAVA = buildStructuredCode(
  `
  /**
   * Sorts non-negative integers with counting sort.
   * Input: mutable array of integers in a compact range.
   * Returns: the same array after in-place sorting.
   */
  //#region counting-sort function open
  //@step 1
  public static int[] countingSort(int[] values) {
      int maxValue = 0;
      for (int value : values) {
          maxValue = Math.max(maxValue, value);
      }

      int[] counts = new int[maxValue + 1];

      for (int value : values) {
          //@step 5
          counts[value] += 1;
      }

      int write = 0;
      for (int value = 0; value <= maxValue; value += 1) {
          while (counts[value] > 0) {
              //@step 10
              values[write] = value;
              write += 1;
              counts[value] -= 1;
          }
      }

      //@step 15
      return values;
  }
  //#endregion counting-sort
  `,
  'java',
);

const COUNTING_SORT_CPP = buildStructuredCode(
  `
  #include <algorithm>
  #include <vector>

  /**
   * Sorts non-negative integers with counting sort.
   * Input: mutable vector of integers in a compact range.
   * Returns: the same vector after in-place sorting.
   */
  //#region counting-sort function open
  //@step 1
  std::vector<int> countingSort(std::vector<int> values) {
      int maxValue = values.empty() ? 0 : *std::max_element(values.begin(), values.end());
      std::vector<int> counts(maxValue + 1, 0);

      for (int value : values) {
          //@step 5
          counts[value] += 1;
      }

      int write = 0;
      for (int value = 0; value <= maxValue; value += 1) {
          while (counts[value] > 0) {
              //@step 10
              values[write] = value;
              write += 1;
              counts[value] -= 1;
          }
      }

      //@step 15
      return values;
  }
  //#endregion counting-sort
  `,
  'cpp',
);

const COUNTING_SORT_GO = buildStructuredCode(
  `
  package sorting

  /**
   * Sorts non-negative integers with counting sort.
   * Input: mutable slice of integers in a compact range.
   * Returns: the same slice after in-place sorting.
   */
  //#region counting-sort function open
  //@step 1
  func CountingSort(values []int) []int {
      maxValue := 0
      for _, value := range values {
          if value > maxValue {
              maxValue = value
          }
      }

      counts := make([]int, maxValue+1)

      for _, value := range values {
          //@step 5
          counts[value] += 1
      }

      write := 0
      for value := 0; value <= maxValue; value += 1 {
          for counts[value] > 0 {
              //@step 10
              values[write] = value
              write += 1
              counts[value] -= 1
          }
      }

      //@step 15
      return values
  }
  //#endregion counting-sort
  `,
  'go',
);

const COUNTING_SORT_RUST = buildStructuredCode(
  `
  /**
   * Sorts non-negative integers with counting sort.
   * Input: mutable vector of integers in a compact range.
   * Returns: the same vector after in-place sorting.
   */
  //#region counting-sort function open
  //@step 1
  fn counting_sort(mut values: Vec<i32>) -> Vec<i32> {
      let max_value = values.iter().copied().max().unwrap_or(0) as usize;
      let mut counts = vec![0; max_value + 1];

      for &value in &values {
          //@step 5
          counts[value as usize] += 1;
      }

      let mut write = 0;
      for value in 0..=max_value {
          while counts[value] > 0 {
              //@step 10
              values[write] = value as i32;
              write += 1;
              counts[value] -= 1;
          }
      }

      //@step 15
      values
  }
  //#endregion counting-sort
  `,
  'rust',
);

const COUNTING_SORT_SWIFT = buildStructuredCode(
  `
  /**
   * Sorts non-negative integers with counting sort.
   * Input: mutable array of integers in a compact range.
   * Returns: the same array after in-place sorting.
   */
  //#region counting-sort function open
  //@step 1
  func countingSort(_ values: inout [Int]) -> [Int] {
      let maxValue = max(0, values.max() ?? 0)
      var counts = Array(repeating: 0, count: maxValue + 1)

      for value in values {
          //@step 5
          counts[value] += 1
      }

      var write = 0
      for value in 0...maxValue {
          while counts[value] > 0 {
              //@step 10
              values[write] = value
              write += 1
              counts[value] -= 1
          }
      }

      //@step 15
      return values
  }
  //#endregion counting-sort
  `,
  'swift',
);

const COUNTING_SORT_PHP = buildStructuredCode(
  `
  <?php

  /**
   * Sorts non-negative integers with counting sort.
   * Input: mutable array of integers in a compact range.
   * Returns: the same array after in-place sorting.
   *
   * @param array<int, int> $values
   * @return array<int, int>
   */
  //#region counting-sort function open
  //@step 1
  function countingSort(array &$values): array
  {
      $maxValue = empty($values) ? 0 : max($values);
      $counts = array_fill(0, $maxValue + 1, 0);

      foreach ($values as $value) {
          //@step 5
          $counts[$value] += 1;
      }

      $write = 0;
      for ($value = 0; $value <= $maxValue; $value += 1) {
          while ($counts[$value] > 0) {
              //@step 10
              $values[$write] = $value;
              $write += 1;
              $counts[$value] -= 1;
          }
      }

      //@step 15
      return $values;
  }
  //#endregion counting-sort
  `,
  'php',
);

const COUNTING_SORT_KOTLIN = buildStructuredCode(
  `
  /**
   * Sorts non-negative integers with counting sort.
   * Input: mutable array of integers in a compact range.
   * Returns: the same array after in-place sorting.
   */
  //#region counting-sort function open
  //@step 1
  fun countingSort(values: IntArray): IntArray {
      val maxValue = values.maxOrNull() ?: 0
      val counts = IntArray(maxValue + 1)

      for (value in values) {
          //@step 5
          counts[value] += 1
      }

      var write = 0
      for (value in 0..maxValue) {
          while (counts[value] > 0) {
              //@step 10
              values[write] = value
              write += 1
              counts[value] -= 1
          }
      }

      //@step 15
      return values
  }
  //#endregion counting-sort
  `,
  'kotlin',
);

export const COUNTING_SORT_CODE = COUNTING_SORT_TS.lines;
export const COUNTING_SORT_CODE_REGIONS = COUNTING_SORT_TS.regions;
export const COUNTING_SORT_CODE_HIGHLIGHT_MAP = COUNTING_SORT_TS.highlightMap;
export const COUNTING_SORT_CODE_VARIANTS: CodeVariantMap = {
  typescript: {
    language: 'typescript',
    lines: COUNTING_SORT_TS.lines,
    regions: COUNTING_SORT_TS.regions,
    highlightMap: COUNTING_SORT_TS.highlightMap,
    source: COUNTING_SORT_TS.source,
  },
  javascript: {
    language: 'javascript',
    lines: COUNTING_SORT_JS.lines,
    regions: COUNTING_SORT_JS.regions,
    highlightMap: COUNTING_SORT_JS.highlightMap,
    source: COUNTING_SORT_JS.source,
  },
  python: {
    language: 'python',
    lines: COUNTING_SORT_PY.lines,
    regions: COUNTING_SORT_PY.regions,
    highlightMap: COUNTING_SORT_PY.highlightMap,
    source: COUNTING_SORT_PY.source,
  },
  csharp: {
    language: 'csharp',
    lines: COUNTING_SORT_CS.lines,
    regions: COUNTING_SORT_CS.regions,
    highlightMap: COUNTING_SORT_CS.highlightMap,
    source: COUNTING_SORT_CS.source,
  },
  java: {
    language: 'java',
    lines: COUNTING_SORT_JAVA.lines,
    regions: COUNTING_SORT_JAVA.regions,
    highlightMap: COUNTING_SORT_JAVA.highlightMap,
    source: COUNTING_SORT_JAVA.source,
  },
  cpp: {
    language: 'cpp',
    lines: COUNTING_SORT_CPP.lines,
    regions: COUNTING_SORT_CPP.regions,
    highlightMap: COUNTING_SORT_CPP.highlightMap,
    source: COUNTING_SORT_CPP.source,
  },
  go: {
    language: 'go',
    lines: COUNTING_SORT_GO.lines,
    regions: COUNTING_SORT_GO.regions,
    highlightMap: COUNTING_SORT_GO.highlightMap,
    source: COUNTING_SORT_GO.source,
  },
  rust: {
    language: 'rust',
    lines: COUNTING_SORT_RUST.lines,
    regions: COUNTING_SORT_RUST.regions,
    highlightMap: COUNTING_SORT_RUST.highlightMap,
    source: COUNTING_SORT_RUST.source,
  },
  swift: {
    language: 'swift',
    lines: COUNTING_SORT_SWIFT.lines,
    regions: COUNTING_SORT_SWIFT.regions,
    highlightMap: COUNTING_SORT_SWIFT.highlightMap,
    source: COUNTING_SORT_SWIFT.source,
  },
  php: {
    language: 'php',
    lines: COUNTING_SORT_PHP.lines,
    regions: COUNTING_SORT_PHP.regions,
    highlightMap: COUNTING_SORT_PHP.highlightMap,
    source: COUNTING_SORT_PHP.source,
  },
  kotlin: {
    language: 'kotlin',
    lines: COUNTING_SORT_KOTLIN.lines,
    regions: COUNTING_SORT_KOTLIN.regions,
    highlightMap: COUNTING_SORT_KOTLIN.highlightMap,
    source: COUNTING_SORT_KOTLIN.source,
  },
};
