import { CodeVariantMap } from '../models/detail';
import { buildStructuredCode } from './code-line-builder';

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

export const LINEAR_SEARCH_CODE = LINEAR_SEARCH_TS.lines;
export const LINEAR_SEARCH_CODE_REGIONS = LINEAR_SEARCH_TS.regions;
export const LINEAR_SEARCH_CODE_HIGHLIGHT_MAP = LINEAR_SEARCH_TS.highlightMap;
export const LINEAR_SEARCH_CODE_VARIANTS: CodeVariantMap = {
  typescript: { language: 'typescript', lines: LINEAR_SEARCH_TS.lines, regions: LINEAR_SEARCH_TS.regions, highlightMap: LINEAR_SEARCH_TS.highlightMap, source: LINEAR_SEARCH_TS.source },
  python: { language: 'python', lines: LINEAR_SEARCH_PY.lines, regions: LINEAR_SEARCH_PY.regions, highlightMap: LINEAR_SEARCH_PY.highlightMap, source: LINEAR_SEARCH_PY.source },
  csharp: { language: 'csharp', lines: LINEAR_SEARCH_CS.lines, regions: LINEAR_SEARCH_CS.regions, highlightMap: LINEAR_SEARCH_CS.highlightMap, source: LINEAR_SEARCH_CS.source },
  java: { language: 'java', lines: LINEAR_SEARCH_JAVA.lines, regions: LINEAR_SEARCH_JAVA.regions, highlightMap: LINEAR_SEARCH_JAVA.highlightMap, source: LINEAR_SEARCH_JAVA.source },
  cpp: { language: 'cpp', lines: LINEAR_SEARCH_CPP.lines, regions: LINEAR_SEARCH_CPP.regions, highlightMap: LINEAR_SEARCH_CPP.highlightMap, source: LINEAR_SEARCH_CPP.source },
};
