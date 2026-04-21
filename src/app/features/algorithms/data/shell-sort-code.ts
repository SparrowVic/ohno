import { CodeVariantMap } from '../models/detail';
import { buildStructuredCode } from './code-line-builder/code-line-builder';

const SHELL_SORT_TS = buildStructuredCode(`
  /**
   * Sort the array in ascending order with Shell sort using halving gaps.
   * Input: mutable array of numbers.
   * Returns: the same array after in-place sorting.
   */
  //#region shell-sort function open
  //@step 1
  function shellSort(values: number[]): number[] {
    //@step 2
    for (let gap = Math.floor(values.length / 2); gap > 0; gap = Math.floor(gap / 2)) {
      for (let index = gap; index < values.length; index += 1) {
        const current = values[index];
        let scan = index;

        //@step 4
        while (scan >= gap && values[scan - gap] > current) {
          //@step 6
          values[scan] = values[scan - gap];
          //@step 7
          scan -= gap;
        }

        //@step 9
        values[scan] = current;
      }
    }

    //@step 12
    return values;
  }
  //#endregion shell-sort
`);

const SHELL_SORT_JS = buildStructuredCode(
  `
  /**
   * Sort the array in ascending order with Shell sort using halving gaps.
   * Input: mutable array of numbers.
   * Returns: the same array after in-place sorting.
   */
  //#region shell-sort function open
  //@step 1
  function shellSort(values) {
      //@step 2
      for (let gap = Math.floor(values.length / 2); gap > 0; gap = Math.floor(gap / 2)) {
          for (let index = gap; index < values.length; index += 1) {
              const current = values[index];
              let scan = index;

              //@step 4
              while (scan >= gap && values[scan - gap] > current) {
                  //@step 6
                  values[scan] = values[scan - gap];
                  //@step 7
                  scan -= gap;
              }

              //@step 9
              values[scan] = current;
          }
      }

      //@step 12
      return values;
  }
  //#endregion shell-sort
  `,
  'javascript',
);

const SHELL_SORT_PY = buildStructuredCode(
  `
  """
  Sort the array in ascending order with Shell sort using halving gaps.
  Input: mutable list of numbers.
  Returns: the same list after in-place sorting.
  """
  //#region shell-sort function open
  //@step 1
  def shell_sort(values: list[int]) -> list[int]:
      gap = len(values) // 2

      //@step 2
      while gap > 0:
          for index in range(gap, len(values)):
              current = values[index]
              scan = index

              //@step 4
              while scan >= gap and values[scan - gap] > current:
                  //@step 6
                  values[scan] = values[scan - gap]
                  //@step 7
                  scan -= gap

              //@step 9
              values[scan] = current

          gap //= 2

      //@step 12
      return values
  //#endregion shell-sort
  `,
  'python',
);

const SHELL_SORT_CS = buildStructuredCode(
  `
  /// <summary>
  /// Sorts the array in ascending order with Shell sort using halving gaps.
  /// Input: mutable array of integers.
  /// Returns: the same array after in-place sorting.
  /// </summary>
  //#region shell-sort function open
  //@step 1
  public static int[] ShellSort(int[] values)
  {
      //@step 2
      for (var gap = values.Length / 2; gap > 0; gap /= 2)
      {
          for (var index = gap; index < values.Length; index += 1)
          {
              var current = values[index];
              var scan = index;

              //@step 4
              while (scan >= gap && values[scan - gap] > current)
              {
                  //@step 6
                  values[scan] = values[scan - gap];
                  //@step 7
                  scan -= gap;
              }

              //@step 9
              values[scan] = current;
          }
      }

      //@step 12
      return values;
  }
  //#endregion shell-sort
  `,
  'csharp',
);

const SHELL_SORT_JAVA = buildStructuredCode(
  `
  /**
   * Sorts the array in ascending order with Shell sort using halving gaps.
   * Input: mutable array of integers.
   * Returns: the same array after in-place sorting.
   */
  //#region shell-sort function open
  //@step 1
  public static int[] shellSort(int[] values) {
      //@step 2
      for (int gap = values.length / 2; gap > 0; gap /= 2) {
          for (int index = gap; index < values.length; index += 1) {
              int current = values[index];
              int scan = index;

              //@step 4
              while (scan >= gap && values[scan - gap] > current) {
                  //@step 6
                  values[scan] = values[scan - gap];
                  //@step 7
                  scan -= gap;
              }

              //@step 9
              values[scan] = current;
          }
      }

      //@step 12
      return values;
  }
  //#endregion shell-sort
  `,
  'java',
);

const SHELL_SORT_CPP = buildStructuredCode(
  `
  #include <vector>

  /**
   * Sorts the array in ascending order with Shell sort using halving gaps.
   * Input: mutable vector of integers.
   * Returns: the same vector after in-place sorting.
   */
  //#region shell-sort function open
  //@step 1
  std::vector<int> shellSort(std::vector<int> values) {
      //@step 2
      for (int gap = static_cast<int>(values.size()) / 2; gap > 0; gap /= 2) {
          for (int index = gap; index < static_cast<int>(values.size()); index += 1) {
              int current = values[index];
              int scan = index;

              //@step 4
              while (scan >= gap && values[scan - gap] > current) {
                  //@step 6
                  values[scan] = values[scan - gap];
                  //@step 7
                  scan -= gap;
              }

              //@step 9
              values[scan] = current;
          }
      }

      //@step 12
      return values;
  }
  //#endregion shell-sort
  `,
  'cpp',
);

const SHELL_SORT_GO = buildStructuredCode(
  `
  package sorting

  /**
   * Sorts the array in ascending order with Shell sort using halving gaps.
   * Input: mutable slice of integers.
   * Returns: the same slice after in-place sorting.
   */
  //#region shell-sort function open
  //@step 1
  func ShellSort(values []int) []int {
      //@step 2
      for gap := len(values) / 2; gap > 0; gap /= 2 {
          for index := gap; index < len(values); index += 1 {
              current := values[index]
              scan := index

              //@step 4
              for scan >= gap && values[scan-gap] > current {
                  //@step 6
                  values[scan] = values[scan-gap]
                  //@step 7
                  scan -= gap
              }

              //@step 9
              values[scan] = current
          }
      }

      //@step 12
      return values
  }
  //#endregion shell-sort
  `,
  'go',
);

const SHELL_SORT_RUST = buildStructuredCode(
  `
  /**
   * Sorts the array in ascending order with Shell sort using halving gaps.
   * Input: mutable vector of integers.
   * Returns: the same vector after in-place sorting.
   */
  //#region shell-sort function open
  //@step 1
  fn shell_sort(mut values: Vec<i32>) -> Vec<i32> {
      let mut gap = values.len() / 2;

      //@step 2
      while gap > 0 {
          for index in gap..values.len() {
              let current = values[index];
              let mut scan = index;

              //@step 4
              while scan >= gap && values[scan - gap] > current {
                  //@step 6
                  values[scan] = values[scan - gap];
                  //@step 7
                  scan -= gap;
              }

              //@step 9
              values[scan] = current;
          }

          gap /= 2;
      }

      //@step 12
      values
  }
  //#endregion shell-sort
  `,
  'rust',
);

const SHELL_SORT_SWIFT = buildStructuredCode(
  `
  /**
   * Sorts the array in ascending order with Shell sort using halving gaps.
   * Input: mutable array of integers.
   * Returns: the same array after in-place sorting.
   */
  //#region shell-sort function open
  //@step 1
  func shellSort(_ values: inout [Int]) -> [Int] {
      var gap = values.count / 2

      //@step 2
      while gap > 0 {
          for index in gap..<values.count {
              let current = values[index]
              var scan = index

              //@step 4
              while scan >= gap && values[scan - gap] > current {
                  //@step 6
                  values[scan] = values[scan - gap]
                  //@step 7
                  scan -= gap
              }

              //@step 9
              values[scan] = current
          }

          gap /= 2
      }

      //@step 12
      return values
  }
  //#endregion shell-sort
  `,
  'swift',
);

const SHELL_SORT_PHP = buildStructuredCode(
  `
  <?php

  /**
   * Sorts the array in ascending order with Shell sort using halving gaps.
   * Input: mutable array of integers.
   * Returns: the same array after in-place sorting.
   *
   * @param array<int, int> $values
   * @return array<int, int>
   */
  //#region shell-sort function open
  //@step 1
  function shellSort(array &$values): array
  {
      $gap = intdiv(count($values), 2);

      //@step 2
      while ($gap > 0) {
          for ($index = $gap; $index < count($values); $index += 1) {
              $current = $values[$index];
              $scan = $index;

              //@step 4
              while ($scan >= $gap && $values[$scan - $gap] > $current) {
                  //@step 6
                  $values[$scan] = $values[$scan - $gap];
                  //@step 7
                  $scan -= $gap;
              }

              //@step 9
              $values[$scan] = $current;
          }

          $gap = intdiv($gap, 2);
      }

      //@step 12
      return $values;
  }
  //#endregion shell-sort
  `,
  'php',
);

const SHELL_SORT_KOTLIN = buildStructuredCode(
  `
  /**
   * Sorts the array in ascending order with Shell sort using halving gaps.
   * Input: mutable array of integers.
   * Returns: the same array after in-place sorting.
   */
  //#region shell-sort function open
  //@step 1
  fun shellSort(values: IntArray): IntArray {
      var gap = values.size / 2

      //@step 2
      while (gap > 0) {
          for (index in gap until values.size) {
              val current = values[index]
              var scan = index

              //@step 4
              while (scan >= gap && values[scan - gap] > current) {
                  //@step 6
                  values[scan] = values[scan - gap]
                  //@step 7
                  scan -= gap
              }

              //@step 9
              values[scan] = current
          }

          gap /= 2
      }

      //@step 12
      return values
  }
  //#endregion shell-sort
  `,
  'kotlin',
);

export const SHELL_SORT_CODE = SHELL_SORT_TS.lines;
export const SHELL_SORT_CODE_REGIONS = SHELL_SORT_TS.regions;
export const SHELL_SORT_CODE_HIGHLIGHT_MAP = SHELL_SORT_TS.highlightMap;
export const SHELL_SORT_CODE_VARIANTS: CodeVariantMap = {
  typescript: {
    language: 'typescript',
    lines: SHELL_SORT_TS.lines,
    regions: SHELL_SORT_TS.regions,
    highlightMap: SHELL_SORT_TS.highlightMap,
    source: SHELL_SORT_TS.source,
  },
  javascript: {
    language: 'javascript',
    lines: SHELL_SORT_JS.lines,
    regions: SHELL_SORT_JS.regions,
    highlightMap: SHELL_SORT_JS.highlightMap,
    source: SHELL_SORT_JS.source,
  },
  python: {
    language: 'python',
    lines: SHELL_SORT_PY.lines,
    regions: SHELL_SORT_PY.regions,
    highlightMap: SHELL_SORT_PY.highlightMap,
    source: SHELL_SORT_PY.source,
  },
  csharp: {
    language: 'csharp',
    lines: SHELL_SORT_CS.lines,
    regions: SHELL_SORT_CS.regions,
    highlightMap: SHELL_SORT_CS.highlightMap,
    source: SHELL_SORT_CS.source,
  },
  java: {
    language: 'java',
    lines: SHELL_SORT_JAVA.lines,
    regions: SHELL_SORT_JAVA.regions,
    highlightMap: SHELL_SORT_JAVA.highlightMap,
    source: SHELL_SORT_JAVA.source,
  },
  cpp: {
    language: 'cpp',
    lines: SHELL_SORT_CPP.lines,
    regions: SHELL_SORT_CPP.regions,
    highlightMap: SHELL_SORT_CPP.highlightMap,
    source: SHELL_SORT_CPP.source,
  },
  go: {
    language: 'go',
    lines: SHELL_SORT_GO.lines,
    regions: SHELL_SORT_GO.regions,
    highlightMap: SHELL_SORT_GO.highlightMap,
    source: SHELL_SORT_GO.source,
  },
  rust: {
    language: 'rust',
    lines: SHELL_SORT_RUST.lines,
    regions: SHELL_SORT_RUST.regions,
    highlightMap: SHELL_SORT_RUST.highlightMap,
    source: SHELL_SORT_RUST.source,
  },
  swift: {
    language: 'swift',
    lines: SHELL_SORT_SWIFT.lines,
    regions: SHELL_SORT_SWIFT.regions,
    highlightMap: SHELL_SORT_SWIFT.highlightMap,
    source: SHELL_SORT_SWIFT.source,
  },
  php: {
    language: 'php',
    lines: SHELL_SORT_PHP.lines,
    regions: SHELL_SORT_PHP.regions,
    highlightMap: SHELL_SORT_PHP.highlightMap,
    source: SHELL_SORT_PHP.source,
  },
  kotlin: {
    language: 'kotlin',
    lines: SHELL_SORT_KOTLIN.lines,
    regions: SHELL_SORT_KOTLIN.regions,
    highlightMap: SHELL_SORT_KOTLIN.highlightMap,
    source: SHELL_SORT_KOTLIN.source,
  },
};
