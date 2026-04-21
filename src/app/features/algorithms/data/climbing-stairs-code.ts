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

const CLIMBING_STAIRS_JS = buildStructuredCode(
  `
  /**
   * Counts how many distinct ways there are to climb n stairs
   * when each move can advance by 1 or 2 steps.
   * Input: non-negative stair count n.
   * Returns: number of valid climb sequences.
   */
  //#region climbing-stairs function open
  function climbStairs(n) {
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
  `,
  'javascript',
);

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

const CLIMBING_STAIRS_GO = buildStructuredCode(
  `
  package dp

  /**
   * Counts how many distinct ways there are to climb n stairs
   * when each move can advance by 1 or 2 steps.
   * Input: non-negative stair count n.
   * Returns: number of valid climb sequences.
   */
  //#region climbing-stairs function open
  func ClimbStairs(n int) int {
      if n <= 1 {
          return 1
      }

      //@step 2
      ways := make([]int, n + 1)
      ways[0] = 1
      ways[1] = 1

      for stair := 2; stair <= n; stair += 1 {
          //@step 4
          fromOneStepBelow := ways[stair - 1]
          fromTwoStepsBelow := ways[stair - 2]

          //@step 5
          ways[stair] = fromOneStepBelow + fromTwoStepsBelow
      }

      //@step 6
      return ways[n]
  }
  //#endregion climbing-stairs
  `,
  'go',
);

const CLIMBING_STAIRS_RUST = buildStructuredCode(
  `
  /**
   * Counts how many distinct ways there are to climb n stairs
   * when each move can advance by 1 or 2 steps.
   * Input: non-negative stair count n.
   * Returns: number of valid climb sequences.
   */
  //#region climbing-stairs function open
  fn climb_stairs(n: usize) -> usize {
      if n <= 1 {
          return 1;
      }

      //@step 2
      let mut ways = vec![0; n + 1];
      ways[0] = 1;
      ways[1] = 1;

      for stair in 2..=n {
          //@step 4
          let from_one_step_below = ways[stair - 1];
          let from_two_steps_below = ways[stair - 2];

          //@step 5
          ways[stair] = from_one_step_below + from_two_steps_below;
      }

      //@step 6
      ways[n]
  }
  //#endregion climbing-stairs
  `,
  'rust',
);

const CLIMBING_STAIRS_SWIFT = buildStructuredCode(
  `
  /**
   * Counts how many distinct ways there are to climb n stairs
   * when each move can advance by 1 or 2 steps.
   * Input: non-negative stair count n.
   * Returns: number of valid climb sequences.
   */
  //#region climbing-stairs function open
  func climbStairs(_ n: Int) -> Int {
      if n <= 1 {
          return 1
      }

      //@step 2
      var ways = Array(repeating: 0, count: n + 1)
      ways[0] = 1
      ways[1] = 1

      for stair in 2...n {
          //@step 4
          let fromOneStepBelow = ways[stair - 1]
          let fromTwoStepsBelow = ways[stair - 2]

          //@step 5
          ways[stair] = fromOneStepBelow + fromTwoStepsBelow
      }

      //@step 6
      return ways[n]
  }
  //#endregion climbing-stairs
  `,
  'swift',
);

const CLIMBING_STAIRS_PHP = buildStructuredCode(
  `
  <?php

  /**
   * Counts how many distinct ways there are to climb n stairs
   * when each move can advance by 1 or 2 steps.
   * Input: non-negative stair count n.
   * Returns: number of valid climb sequences.
   */
  //#region climbing-stairs function open
  function climbStairs(int $n): int
  {
      if ($n <= 1) {
          return 1;
      }

      //@step 2
      $ways = array_fill(0, $n + 1, 0);
      $ways[0] = 1;
      $ways[1] = 1;

      for ($stair = 2; $stair <= $n; $stair += 1) {
          //@step 4
          $fromOneStepBelow = $ways[$stair - 1];
          $fromTwoStepsBelow = $ways[$stair - 2];

          //@step 5
          $ways[$stair] = $fromOneStepBelow + $fromTwoStepsBelow;
      }

      //@step 6
      return $ways[$n];
  }
  //#endregion climbing-stairs
  `,
  'php',
);

const CLIMBING_STAIRS_KOTLIN = buildStructuredCode(
  `
  /**
   * Counts how many distinct ways there are to climb n stairs
   * when each move can advance by 1 or 2 steps.
   * Input: non-negative stair count n.
   * Returns: number of valid climb sequences.
   */
  //#region climbing-stairs function open
  fun climbStairs(n: Int): Int {
      if (n <= 1) {
          return 1
      }

      //@step 2
      val ways = IntArray(n + 1)
      ways[0] = 1
      ways[1] = 1

      for (stair in 2..n) {
          //@step 4
          val fromOneStepBelow = ways[stair - 1]
          val fromTwoStepsBelow = ways[stair - 2]

          //@step 5
          ways[stair] = fromOneStepBelow + fromTwoStepsBelow
      }

      //@step 6
      return ways[n]
  }
  //#endregion climbing-stairs
  `,
  'kotlin',
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
  javascript: {
    language: 'javascript',
    lines: CLIMBING_STAIRS_JS.lines,
    regions: CLIMBING_STAIRS_JS.regions,
    highlightMap: CLIMBING_STAIRS_JS.highlightMap,
    source: CLIMBING_STAIRS_JS.source,
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
  go: {
    language: 'go',
    lines: CLIMBING_STAIRS_GO.lines,
    regions: CLIMBING_STAIRS_GO.regions,
    highlightMap: CLIMBING_STAIRS_GO.highlightMap,
    source: CLIMBING_STAIRS_GO.source,
  },
  rust: {
    language: 'rust',
    lines: CLIMBING_STAIRS_RUST.lines,
    regions: CLIMBING_STAIRS_RUST.regions,
    highlightMap: CLIMBING_STAIRS_RUST.highlightMap,
    source: CLIMBING_STAIRS_RUST.source,
  },
  swift: {
    language: 'swift',
    lines: CLIMBING_STAIRS_SWIFT.lines,
    regions: CLIMBING_STAIRS_SWIFT.regions,
    highlightMap: CLIMBING_STAIRS_SWIFT.highlightMap,
    source: CLIMBING_STAIRS_SWIFT.source,
  },
  php: {
    language: 'php',
    lines: CLIMBING_STAIRS_PHP.lines,
    regions: CLIMBING_STAIRS_PHP.regions,
    highlightMap: CLIMBING_STAIRS_PHP.highlightMap,
    source: CLIMBING_STAIRS_PHP.source,
  },
  kotlin: {
    language: 'kotlin',
    lines: CLIMBING_STAIRS_KOTLIN.lines,
    regions: CLIMBING_STAIRS_KOTLIN.regions,
    highlightMap: CLIMBING_STAIRS_KOTLIN.highlightMap,
    source: CLIMBING_STAIRS_KOTLIN.source,
  },
};
