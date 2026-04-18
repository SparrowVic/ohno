import { CodeVariantMap } from '../models/detail';
import { buildStructuredCode } from './code-line-builder/code-line-builder';

const CLIMBING_STAIRS_TS = buildStructuredCode(`
  /**
   * Count how many distinct ways there are to climb n stairs
   * when each move can advance by 1 or 2 steps.
   * Input: non-negative stair count n.
   * Returns: number of valid climb sequences.
   */
  //#region climbing-stairs function open
  function climbStairs(n: number): number {
    if (n <= 1) {
      return 1;
    }

    //@step 2
    const ways = Array.from({ length: n + 1 }, () => 0);
    ways[0] = 1;
    ways[1] = 1;

    for (let stair = 2; stair <= n; stair += 1) {
      //@step 4
      const fromOneStepBelow = ways[stair - 1];
      const fromTwoStepsBelow = ways[stair - 2];

      //@step 5
      ways[stair] = fromOneStepBelow + fromTwoStepsBelow;
    }

    //@step 6
    return ways[n];
  }
  //#endregion climbing-stairs
`);

const CLIMBING_STAIRS_PY = buildStructuredCode(
  `
  """
  Count how many distinct ways there are to climb n stairs
  when each move can advance by 1 or 2 steps.
  Input: non-negative stair count n.
  Returns: number of valid climb sequences.
  """
  //#region climbing-stairs function open
  def climb_stairs(n: int) -> int:
      if n <= 1:
          return 1

      //@step 2
      ways = [0] * (n + 1)
      ways[0] = 1
      ways[1] = 1

      for stair in range(2, n + 1):
          //@step 4
          from_one_step_below = ways[stair - 1]
          from_two_steps_below = ways[stair - 2]

          //@step 5
          ways[stair] = from_one_step_below + from_two_steps_below

      //@step 6
      return ways[n]
  //#endregion climbing-stairs
  `,
  'python',
);

const CLIMBING_STAIRS_CS = buildStructuredCode(
  `
  /// <summary>
  /// Counts how many distinct ways there are to climb n stairs
  /// when each move can advance by 1 or 2 steps.
  /// Input: non-negative stair count n.
  /// Returns: number of valid climb sequences.
  /// </summary>
  //#region climbing-stairs function open
  public static int ClimbStairs(int n)
  {
      if (n <= 1)
      {
          return 1;
      }

      //@step 2
      var ways = new int[n + 1];
      ways[0] = 1;
      ways[1] = 1;

      for (var stair = 2; stair <= n; stair += 1)
      {
          //@step 4
          var fromOneStepBelow = ways[stair - 1];
          var fromTwoStepsBelow = ways[stair - 2];

          //@step 5
          ways[stair] = fromOneStepBelow + fromTwoStepsBelow;
      }

      //@step 6
      return ways[n];
  }
  //#endregion climbing-stairs
  `,
  'csharp',
);

const CLIMBING_STAIRS_JAVA = buildStructuredCode(
  `
  /**
   * Counts how many distinct ways there are to climb n stairs
   * when each move can advance by 1 or 2 steps.
   * Input: non-negative stair count n.
   * Returns: number of valid climb sequences.
   */
  //#region climbing-stairs function open
  public static int climbStairs(int n) {
      if (n <= 1) {
          return 1;
      }

      //@step 2
      int[] ways = new int[n + 1];
      ways[0] = 1;
      ways[1] = 1;

      for (int stair = 2; stair <= n; stair += 1) {
          //@step 4
          int fromOneStepBelow = ways[stair - 1];
          int fromTwoStepsBelow = ways[stair - 2];

          //@step 5
          ways[stair] = fromOneStepBelow + fromTwoStepsBelow;
      }

      //@step 6
      return ways[n];
  }
  //#endregion climbing-stairs
  `,
  'java',
);

const CLIMBING_STAIRS_CPP = buildStructuredCode(
  `
  #include <vector>

  /**
   * Counts how many distinct ways there are to climb n stairs
   * when each move can advance by 1 or 2 steps.
   * Input: non-negative stair count n.
   * Returns: number of valid climb sequences.
   */
  //#region climbing-stairs function open
  int climbStairs(int n) {
      if (n <= 1) {
          return 1;
      }

      //@step 2
      std::vector<int> ways(n + 1, 0);
      ways[0] = 1;
      ways[1] = 1;

      for (int stair = 2; stair <= n; stair += 1) {
          //@step 4
          int fromOneStepBelow = ways[stair - 1];
          int fromTwoStepsBelow = ways[stair - 2];

          //@step 5
          ways[stair] = fromOneStepBelow + fromTwoStepsBelow;
      }

      //@step 6
      return ways[n];
  }
  //#endregion climbing-stairs
  `,
  'cpp',
);

export const CLIMBING_STAIRS_CODE = CLIMBING_STAIRS_TS.lines;
export const CLIMBING_STAIRS_CODE_REGIONS = CLIMBING_STAIRS_TS.regions;
export const CLIMBING_STAIRS_CODE_HIGHLIGHT_MAP = CLIMBING_STAIRS_TS.highlightMap;
export const CLIMBING_STAIRS_CODE_VARIANTS: CodeVariantMap = {
  typescript: {
    language: 'typescript',
    lines: CLIMBING_STAIRS_TS.lines,
    regions: CLIMBING_STAIRS_TS.regions,
    highlightMap: CLIMBING_STAIRS_TS.highlightMap,
    source: CLIMBING_STAIRS_TS.source,
  },
  python: {
    language: 'python',
    lines: CLIMBING_STAIRS_PY.lines,
    regions: CLIMBING_STAIRS_PY.regions,
    highlightMap: CLIMBING_STAIRS_PY.highlightMap,
    source: CLIMBING_STAIRS_PY.source,
  },
  csharp: {
    language: 'csharp',
    lines: CLIMBING_STAIRS_CS.lines,
    regions: CLIMBING_STAIRS_CS.regions,
    highlightMap: CLIMBING_STAIRS_CS.highlightMap,
    source: CLIMBING_STAIRS_CS.source,
  },
  java: {
    language: 'java',
    lines: CLIMBING_STAIRS_JAVA.lines,
    regions: CLIMBING_STAIRS_JAVA.regions,
    highlightMap: CLIMBING_STAIRS_JAVA.highlightMap,
    source: CLIMBING_STAIRS_JAVA.source,
  },
  cpp: {
    language: 'cpp',
    lines: CLIMBING_STAIRS_CPP.lines,
    regions: CLIMBING_STAIRS_CPP.regions,
    highlightMap: CLIMBING_STAIRS_CPP.highlightMap,
    source: CLIMBING_STAIRS_CPP.source,
  },
};
