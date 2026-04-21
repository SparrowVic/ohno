import { CodeVariantMap } from '../models/detail';
import { buildStructuredCode } from './code-line-builder/code-line-builder';

const LINEAR_SEARCH_TS = buildStructuredCode(`
  /**
   * Find the first index containing the target value.
   * Input: array of numbers and a target number.
   * Returns: index of the first match, or -1 when absent.
   */
  //#region linear-search function open
  //@step 1
  function linearSearch(values: readonly number[], target: number): number {
    //@step 2
    for (let index = 0; index < values.length; index += 1) {
      //@step 3
      if (values[index] === target) {
        return index;
      }
    }

    //@step 5
    return -1;
  }
  //#endregion linear-search
`);

const LINEAR_SEARCH_JS = buildStructuredCode(
  `
  /**
   * Find the first index containing the target value.
   * Input: array of numbers and a target number.
   * Returns: index of the first match, or -1 when absent.
   */
  //#region linear-search function open
  //@step 1
  function linearSearch(values, target) {
      //@step 2
      for (let index = 0; index < values.length; index += 1) {
          //@step 3
          if (values[index] === target) {
              return index;
          }
      }

      //@step 5
      return -1;
  }
  //#endregion linear-search
  `,
  'javascript',
);

const LINEAR_SEARCH_PY = buildStructuredCode(
  `
  """
  Find the first index containing the target value.
  Input: list of numbers and a target number.
  Returns: index of the first match, or -1 when absent.
  """
  //#region linear-search function open
  //@step 1
  def linear_search(values: list[int], target: int) -> int:
      //@step 2
      for index, value in enumerate(values):
          //@step 3
          if value == target:
              return index

      //@step 5
      return -1
  //#endregion linear-search
  `,
  'python',
);

const LINEAR_SEARCH_CS = buildStructuredCode(
  `
  using System.Collections.Generic;

  /// <summary>
  /// Finds the first index containing the target value.
  /// Input: array of integers and a target integer.
  /// Returns: index of the first match, or -1 when absent.
  /// </summary>
  //#region linear-search function open
  //@step 1
  public static int LinearSearch(IReadOnlyList<int> values, int target)
  {
      //@step 2
      for (var index = 0; index < values.Count; index += 1)
      {
          //@step 3
          if (values[index] == target)
          {
              return index;
          }
      }

      //@step 5
      return -1;
  }
  //#endregion linear-search
  `,
  'csharp',
);

const LINEAR_SEARCH_JAVA = buildStructuredCode(
  `
  /**
   * Finds the first index containing the target value.
   * Input: array of integers and a target integer.
   * Returns: index of the first match, or -1 when absent.
   */
  //#region linear-search function open
  //@step 1
  public static int linearSearch(int[] values, int target) {
      //@step 2
      for (int index = 0; index < values.length; index += 1) {
          //@step 3
          if (values[index] == target) {
              return index;
          }
      }

      //@step 5
      return -1;
  }
  //#endregion linear-search
  `,
  'java',
);

const LINEAR_SEARCH_CPP = buildStructuredCode(
  `
  #include <vector>

  /**
   * Finds the first index containing the target value.
   * Input: vector of integers and a target integer.
   * Returns: index of the first match, or -1 when absent.
   */
  //#region linear-search function open
  //@step 1
  int linearSearch(const std::vector<int>& values, int target) {
      //@step 2
      for (int index = 0; index < static_cast<int>(values.size()); index += 1) {
          //@step 3
          if (values[index] == target) {
              return index;
          }
      }

      //@step 5
      return -1;
  }
  //#endregion linear-search
  `,
  'cpp',
);

const LINEAR_SEARCH_GO = buildStructuredCode(
  `
  package searching

  /**
   * Finds the first index containing the target value.
   * Input: slice of integers and a target integer.
   * Returns: index of the first match, or -1 when absent.
   */
  //#region linear-search function open
  //@step 1
  func LinearSearch(values []int, target int) int {
      //@step 2
      for index, value := range values {
          //@step 3
          if value == target {
              return index
          }
      }

      //@step 5
      return -1
  }
  //#endregion linear-search
  `,
  'go',
);

const LINEAR_SEARCH_RUST = buildStructuredCode(
  `
  /**
   * Finds the first index containing the target value.
   * Input: slice of integers and a target integer.
   * Returns: index of the first match, or -1 when absent.
   */
  //#region linear-search function open
  //@step 1
  fn linear_search(values: &[i32], target: i32) -> isize {
      //@step 2
      for (index, value) in values.iter().enumerate() {
          //@step 3
          if *value == target {
              return index as isize;
          }
      }

      //@step 5
      -1
  }
  //#endregion linear-search
  `,
  'rust',
);

const LINEAR_SEARCH_SWIFT = buildStructuredCode(
  `
  /**
   * Finds the first index containing the target value.
   * Input: array of integers and a target integer.
   * Returns: index of the first match, or -1 when absent.
   */
  //#region linear-search function open
  //@step 1
  func linearSearch(_ values: [Int], target: Int) -> Int {
      //@step 2
      for (index, value) in values.enumerated() {
          //@step 3
          if value == target {
              return index
          }
      }

      //@step 5
      return -1
  }
  //#endregion linear-search
  `,
  'swift',
);

const LINEAR_SEARCH_PHP = buildStructuredCode(
  `
  <?php

  /**
   * Finds the first index containing the target value.
   * Input: array of integers and a target integer.
   * Returns: index of the first match, or -1 when absent.
   *
   * @param array<int, int> $values
   */
  //#region linear-search function open
  //@step 1
  function linearSearch(array $values, int $target): int
  {
      //@step 2
      foreach ($values as $index => $value) {
          //@step 3
          if ($value === $target) {
              return $index;
          }
      }

      //@step 5
      return -1;
  }
  //#endregion linear-search
  `,
  'php',
);

const LINEAR_SEARCH_KOTLIN = buildStructuredCode(
  `
  /**
   * Finds the first index containing the target value.
   * Input: array of integers and a target integer.
   * Returns: index of the first match, or -1 when absent.
   */
  //#region linear-search function open
  //@step 1
  fun linearSearch(values: IntArray, target: Int): Int {
      //@step 2
      for ((index, value) in values.withIndex()) {
          //@step 3
          if (value == target) {
              return index
          }
      }

      //@step 5
      return -1
  }
  //#endregion linear-search
  `,
  'kotlin',
);

export const LINEAR_SEARCH_CODE = LINEAR_SEARCH_TS.lines;
export const LINEAR_SEARCH_CODE_REGIONS = LINEAR_SEARCH_TS.regions;
export const LINEAR_SEARCH_CODE_HIGHLIGHT_MAP = LINEAR_SEARCH_TS.highlightMap;
export const LINEAR_SEARCH_CODE_VARIANTS: CodeVariantMap = {
  typescript: {
    language: 'typescript',
    lines: LINEAR_SEARCH_TS.lines,
    regions: LINEAR_SEARCH_TS.regions,
    highlightMap: LINEAR_SEARCH_TS.highlightMap,
    source: LINEAR_SEARCH_TS.source,
  },
  javascript: {
    language: 'javascript',
    lines: LINEAR_SEARCH_JS.lines,
    regions: LINEAR_SEARCH_JS.regions,
    highlightMap: LINEAR_SEARCH_JS.highlightMap,
    source: LINEAR_SEARCH_JS.source,
  },
  python: {
    language: 'python',
    lines: LINEAR_SEARCH_PY.lines,
    regions: LINEAR_SEARCH_PY.regions,
    highlightMap: LINEAR_SEARCH_PY.highlightMap,
    source: LINEAR_SEARCH_PY.source,
  },
  csharp: {
    language: 'csharp',
    lines: LINEAR_SEARCH_CS.lines,
    regions: LINEAR_SEARCH_CS.regions,
    highlightMap: LINEAR_SEARCH_CS.highlightMap,
    source: LINEAR_SEARCH_CS.source,
  },
  java: {
    language: 'java',
    lines: LINEAR_SEARCH_JAVA.lines,
    regions: LINEAR_SEARCH_JAVA.regions,
    highlightMap: LINEAR_SEARCH_JAVA.highlightMap,
    source: LINEAR_SEARCH_JAVA.source,
  },
  cpp: {
    language: 'cpp',
    lines: LINEAR_SEARCH_CPP.lines,
    regions: LINEAR_SEARCH_CPP.regions,
    highlightMap: LINEAR_SEARCH_CPP.highlightMap,
    source: LINEAR_SEARCH_CPP.source,
  },
  go: {
    language: 'go',
    lines: LINEAR_SEARCH_GO.lines,
    regions: LINEAR_SEARCH_GO.regions,
    highlightMap: LINEAR_SEARCH_GO.highlightMap,
    source: LINEAR_SEARCH_GO.source,
  },
  rust: {
    language: 'rust',
    lines: LINEAR_SEARCH_RUST.lines,
    regions: LINEAR_SEARCH_RUST.regions,
    highlightMap: LINEAR_SEARCH_RUST.highlightMap,
    source: LINEAR_SEARCH_RUST.source,
  },
  swift: {
    language: 'swift',
    lines: LINEAR_SEARCH_SWIFT.lines,
    regions: LINEAR_SEARCH_SWIFT.regions,
    highlightMap: LINEAR_SEARCH_SWIFT.highlightMap,
    source: LINEAR_SEARCH_SWIFT.source,
  },
  php: {
    language: 'php',
    lines: LINEAR_SEARCH_PHP.lines,
    regions: LINEAR_SEARCH_PHP.regions,
    highlightMap: LINEAR_SEARCH_PHP.highlightMap,
    source: LINEAR_SEARCH_PHP.source,
  },
  kotlin: {
    language: 'kotlin',
    lines: LINEAR_SEARCH_KOTLIN.lines,
    regions: LINEAR_SEARCH_KOTLIN.regions,
    highlightMap: LINEAR_SEARCH_KOTLIN.highlightMap,
    source: LINEAR_SEARCH_KOTLIN.source,
  },
};
