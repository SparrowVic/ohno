import { CodeVariantMap } from '../models/detail';
import { buildStructuredCode } from './code-line-builder/code-line-builder';

const BITMASK_TS = buildStructuredCode(`
  /**
   * Solve assignment with DP over subsets.
   * Input: cost matrix costs[worker][job].
   * Returns: minimum total assignment cost.
   */
  //#region bitmask-dp function open
  function bitmaskAssignment(costs: number[][]): number {
    const workerCount = costs.length;
    const fullMask = (1 << workerCount) - 1;
    const dp = Array.from({ length: 1 << workerCount }, () => Number.POSITIVE_INFINITY);
    const parentMask = Array.from({ length: 1 << workerCount }, () => -1);
    const parentJob = Array.from({ length: 1 << workerCount }, () => -1);

    //@step 2
    dp[0] = 0;

    for (let mask = 0; mask <= fullMask; mask += 1) {
      const worker = popcount(mask);
      if (worker >= workerCount || !Number.isFinite(dp[mask])) {
        continue;
      }

      for (let job = 0; job < workerCount; job += 1) {
        if ((mask & (1 << job)) !== 0) {
          continue;
        }

        //@step 5
        const nextMask = mask | (1 << job);
        //@step 6
        const candidate = dp[mask] + costs[worker][job];

        if (candidate < dp[nextMask]) {
          dp[nextMask] = candidate;
          parentMask[nextMask] = mask;
          parentJob[nextMask] = job;
        }
      }
    }

    let mask = fullMask;
    while (mask !== 0) {
      //@step 8
      mask = parentMask[mask];
    }

    //@step 9
    return dp[fullMask];
  }
  //#endregion bitmask-dp

  //#region popcount helper collapsed
  function popcount(mask: number): number {
    let count = 0;
    let current = mask;
    while (current > 0) {
      count += current & 1;
      current >>= 1;
    }
    return count;
  }
  //#endregion popcount
`);

const BITMASK_PY = buildStructuredCode(
  `
  from math import inf

  """
  Solve assignment with DP over subsets.
  Input: cost matrix costs[worker][job].
  Returns: minimum total assignment cost.
  """
  //#region bitmask-dp function open
  def bitmask_assignment(costs: list[list[int]]) -> int:
      worker_count = len(costs)
      full_mask = (1 << worker_count) - 1
      dp = [inf] * (1 << worker_count)
      parent_mask = [-1] * (1 << worker_count)
      parent_job = [-1] * (1 << worker_count)

      //@step 2
      dp[0] = 0

      for mask in range(full_mask + 1):
          worker = mask.bit_count()
          if worker >= worker_count or dp[mask] == inf:
              continue

          for job in range(worker_count):
              if (mask & (1 << job)) != 0:
                  continue

              //@step 5
              next_mask = mask | (1 << job)
              //@step 6
              candidate = dp[mask] + costs[worker][job]

              if candidate < dp[next_mask]:
                  dp[next_mask] = candidate
                  parent_mask[next_mask] = mask
                  parent_job[next_mask] = job

      mask = full_mask
      while mask != 0:
          //@step 8
          mask = parent_mask[mask]

      //@step 9
      return int(dp[full_mask])
  //#endregion bitmask-dp
  `,
  'python',
);

const BITMASK_CS = buildStructuredCode(
  `
  using System;
  using System.Numerics;

  /// <summary>
  /// Solves assignment with DP over subsets.
  /// Input: cost matrix costs[worker][job].
  /// Returns: minimum total assignment cost.
  /// </summary>
  //#region bitmask-dp function open
  public static int BitmaskAssignment(int[,] costs)
  {
      var workerCount = costs.GetLength(0);
      var fullMask = (1 << workerCount) - 1;
      var dp = new int[1 << workerCount];
      var parentMask = new int[1 << workerCount];
      var parentJob = new int[1 << workerCount];
      Array.Fill(dp, int.MaxValue);
      Array.Fill(parentMask, -1);
      Array.Fill(parentJob, -1);

      //@step 2
      dp[0] = 0;

      for (var mask = 0; mask <= fullMask; mask += 1)
      {
          var worker = BitOperations.PopCount((uint)mask);
          if (worker >= workerCount || dp[mask] == int.MaxValue)
          {
              continue;
          }

          for (var job = 0; job < workerCount; job += 1)
          {
              if ((mask & (1 << job)) != 0)
              {
                  continue;
              }

              //@step 5
              var nextMask = mask | (1 << job);
              //@step 6
              var candidate = dp[mask] + costs[worker, job];

              if (candidate < dp[nextMask])
              {
                  dp[nextMask] = candidate;
                  parentMask[nextMask] = mask;
                  parentJob[nextMask] = job;
              }
          }
      }

      var currentMask = fullMask;
      while (currentMask != 0)
      {
          //@step 8
          currentMask = parentMask[currentMask];
      }

      //@step 9
      return dp[fullMask];
  }
  //#endregion bitmask-dp
  `,
  'csharp',
);

const BITMASK_JAVA = buildStructuredCode(
  `
  /**
   * Solves assignment with DP over subsets.
   * Input: cost matrix costs[worker][job].
   * Returns: minimum total assignment cost.
   */
  //#region bitmask-dp function open
  public static int bitmaskAssignment(int[][] costs) {
      int workerCount = costs.length;
      int fullMask = (1 << workerCount) - 1;
      int[] dp = new int[1 << workerCount];
      int[] parentMask = new int[1 << workerCount];
      int[] parentJob = new int[1 << workerCount];
      java.util.Arrays.fill(dp, Integer.MAX_VALUE);
      java.util.Arrays.fill(parentMask, -1);
      java.util.Arrays.fill(parentJob, -1);

      //@step 2
      dp[0] = 0;

      for (int mask = 0; mask <= fullMask; mask += 1) {
          int worker = Integer.bitCount(mask);
          if (worker >= workerCount || dp[mask] == Integer.MAX_VALUE) {
              continue;
          }

          for (int job = 0; job < workerCount; job += 1) {
              if ((mask & (1 << job)) != 0) {
                  continue;
              }

              //@step 5
              int nextMask = mask | (1 << job);
              //@step 6
              int candidate = dp[mask] + costs[worker][job];

              if (candidate < dp[nextMask]) {
                  dp[nextMask] = candidate;
                  parentMask[nextMask] = mask;
                  parentJob[nextMask] = job;
              }
          }
      }

      int mask = fullMask;
      while (mask != 0) {
          //@step 8
          mask = parentMask[mask];
      }

      //@step 9
      return dp[fullMask];
  }
  //#endregion bitmask-dp
  `,
  'java',
);

const BITMASK_CPP = buildStructuredCode(
  `
  #include <limits>
  #include <vector>

  /**
   * Solves assignment with DP over subsets.
   * Input: cost matrix costs[worker][job].
   * Returns: minimum total assignment cost.
   */
  //#region bitmask-dp function open
  int bitmaskAssignment(const std::vector<std::vector<int>>& costs) {
      int workerCount = static_cast<int>(costs.size());
      int fullMask = (1 << workerCount) - 1;
      std::vector<int> dp(1 << workerCount, std::numeric_limits<int>::max());
      std::vector<int> parentMask(1 << workerCount, -1);
      std::vector<int> parentJob(1 << workerCount, -1);

      //@step 2
      dp[0] = 0;

      for (int mask = 0; mask <= fullMask; mask += 1) {
          int worker = __builtin_popcount(static_cast<unsigned>(mask));
          if (worker >= workerCount || dp[mask] == std::numeric_limits<int>::max()) {
              continue;
          }

          for (int job = 0; job < workerCount; job += 1) {
              if ((mask & (1 << job)) != 0) {
                  continue;
              }

              //@step 5
              int nextMask = mask | (1 << job);
              //@step 6
              int candidate = dp[mask] + costs[worker][job];

              if (candidate < dp[nextMask]) {
                  dp[nextMask] = candidate;
                  parentMask[nextMask] = mask;
                  parentJob[nextMask] = job;
              }
          }
      }

      int mask = fullMask;
      while (mask != 0) {
          //@step 8
          mask = parentMask[mask];
      }

      //@step 9
      return dp[fullMask];
  }
  //#endregion bitmask-dp
  `,
  'cpp',
);

const BITMASK_JS = buildStructuredCode(
  `
  /**
   * Solves assignment with DP over subsets.
   * Input: cost matrix costs[worker][job].
   * Returns: minimum total assignment cost.
   */
  //#region bitmask-dp function open
  function bitmaskAssignment(costs) {
      const workerCount = costs.length;
      const fullMask = (1 << workerCount) - 1;
      const dp = Array.from({ length: 1 << workerCount }, () => Number.POSITIVE_INFINITY);
      const parentMask = Array.from({ length: 1 << workerCount }, () => -1);
      const parentJob = Array.from({ length: 1 << workerCount }, () => -1);

      //@step 2
      dp[0] = 0;

      for (let mask = 0; mask <= fullMask; mask += 1) {
          const worker = popcount(mask);
          if (worker >= workerCount || !Number.isFinite(dp[mask])) {
              continue;
          }

          for (let job = 0; job < workerCount; job += 1) {
              if ((mask & (1 << job)) !== 0) {
                  continue;
              }

              //@step 5
              const nextMask = mask | (1 << job);
              //@step 6
              const candidate = dp[mask] + costs[worker][job];

              if (candidate < dp[nextMask]) {
                  dp[nextMask] = candidate;
                  parentMask[nextMask] = mask;
                  parentJob[nextMask] = job;
              }
          }
      }

      let mask = fullMask;
      while (mask !== 0) {
          //@step 8
          mask = parentMask[mask];
      }

      //@step 9
      return dp[fullMask];
  }
  //#endregion bitmask-dp

  //#region popcount helper collapsed
  function popcount(mask) {
      let count = 0;
      let current = mask;
      while (current > 0) {
          count += current & 1;
          current >>= 1;
      }
      return count;
  }
  //#endregion popcount
  `,
  'javascript',
);

const BITMASK_GO = buildStructuredCode(
  `
  package dp

  import "math/bits"

  /**
   * Solves assignment with DP over subsets.
   * Input: cost matrix costs[worker][job].
   * Returns: minimum total assignment cost.
   */
  //#region bitmask-dp function open
  func BitmaskAssignment(costs [][]int) int {
      workerCount := len(costs)
      fullMask := (1 << workerCount) - 1
      dp := make([]int, 1 << workerCount)
      parentMask := make([]int, 1 << workerCount)
      parentJob := make([]int, 1 << workerCount)
      for i := range dp {
          dp[i] = inf()
          parentMask[i] = -1
          parentJob[i] = -1
      }

      //@step 2
      dp[0] = 0

      for mask := 0; mask <= fullMask; mask += 1 {
          worker := bits.OnesCount(uint(mask))
          if worker >= workerCount || dp[mask] == inf() {
              continue
          }

          for job := 0; job < workerCount; job += 1 {
              if (mask & (1 << job)) != 0 {
                  continue
              }

              //@step 5
              nextMask := mask | (1 << job)
              //@step 6
              candidate := dp[mask] + costs[worker][job]

              if candidate < dp[nextMask] {
                  dp[nextMask] = candidate
                  parentMask[nextMask] = mask
                  parentJob[nextMask] = job
              }
          }
      }

      mask := fullMask
      for mask != 0 {
          //@step 8
          mask = parentMask[mask]
      }

      //@step 9
      return dp[fullMask]
  }
  //#endregion bitmask-dp

  //#region inf helper collapsed
  func inf() int {
      return int(^uint(0) >> 1)
  }
  //#endregion inf
  `,
  'go',
);

const BITMASK_RUST = buildStructuredCode(
  `
  /**
   * Solves assignment with DP over subsets.
   * Input: cost matrix costs[worker][job].
   * Returns: minimum total assignment cost.
   */
  //#region bitmask-dp function open
  fn bitmask_assignment(costs: &[Vec<i32>]) -> i32 {
      let worker_count = costs.len();
      let full_mask = (1usize << worker_count) - 1;
      let mut dp = vec![i32::MAX; 1usize << worker_count];
      let mut parent_mask = vec![usize::MAX; 1usize << worker_count];
      let mut parent_job = vec![-1isize; 1usize << worker_count];

      //@step 2
      dp[0] = 0;

      for mask in 0..=full_mask {
          let worker = mask.count_ones() as usize;
          if worker >= worker_count || dp[mask] == i32::MAX {
              continue;
          }

          for job in 0..worker_count {
              if (mask & (1usize << job)) != 0 {
                  continue;
              }

              //@step 5
              let next_mask = mask | (1usize << job);
              //@step 6
              let candidate = dp[mask] + costs[worker][job];

              if candidate < dp[next_mask] {
                  dp[next_mask] = candidate;
                  parent_mask[next_mask] = mask;
                  parent_job[next_mask] = job as isize;
              }
          }
      }

      let mut mask = full_mask;
      while mask != 0 {
          //@step 8
          mask = parent_mask[mask];
      }

      //@step 9
      dp[full_mask]
  }
  //#endregion bitmask-dp
  `,
  'rust',
);

const BITMASK_SWIFT = buildStructuredCode(
  `
  /**
   * Solves assignment with DP over subsets.
   * Input: cost matrix costs[worker][job].
   * Returns: minimum total assignment cost.
   */
  //#region bitmask-dp function open
  func bitmaskAssignment(_ costs: [[Int]]) -> Int {
      let workerCount = costs.count
      let fullMask = (1 << workerCount) - 1
      var dp = Array(repeating: Int.max, count: 1 << workerCount)
      var parentMask = Array(repeating: -1, count: 1 << workerCount)
      var parentJob = Array(repeating: -1, count: 1 << workerCount)

      //@step 2
      dp[0] = 0

      for mask in 0...fullMask {
          let worker = mask.nonzeroBitCount
          if worker >= workerCount || dp[mask] == Int.max {
              continue
          }

          for job in 0..<workerCount {
              if (mask & (1 << job)) != 0 {
                  continue
              }

              //@step 5
              let nextMask = mask | (1 << job)
              //@step 6
              let candidate = dp[mask] + costs[worker][job]

              if candidate < dp[nextMask] {
                  dp[nextMask] = candidate
                  parentMask[nextMask] = mask
                  parentJob[nextMask] = job
              }
          }
      }

      var mask = fullMask
      while mask != 0 {
          //@step 8
          mask = parentMask[mask]
      }

      //@step 9
      return dp[fullMask]
  }
  //#endregion bitmask-dp
  `,
  'swift',
);

const BITMASK_PHP = buildStructuredCode(
  `
  /**
   * Solves assignment with DP over subsets.
   * Input: cost matrix costs[worker][job].
   * Returns: minimum total assignment cost.
   */
  //#region bitmask-dp function open
  function bitmaskAssignment(array $costs): int
  {
      $workerCount = count($costs);
      $fullMask = (1 << $workerCount) - 1;
      $dp = array_fill(0, 1 << $workerCount, PHP_INT_MAX);
      $parentMask = array_fill(0, 1 << $workerCount, -1);
      $parentJob = array_fill(0, 1 << $workerCount, -1);

      //@step 2
      $dp[0] = 0;

      for ($mask = 0; $mask <= $fullMask; $mask += 1) {
          $worker = popcount($mask);
          if ($worker >= $workerCount || $dp[$mask] === PHP_INT_MAX) {
              continue;
          }

          for ($job = 0; $job < $workerCount; $job += 1) {
              if (($mask & (1 << $job)) !== 0) {
                  continue;
              }

              //@step 5
              $nextMask = $mask | (1 << $job);
              //@step 6
              $candidate = $dp[$mask] + $costs[$worker][$job];

              if ($candidate < $dp[$nextMask]) {
                  $dp[$nextMask] = $candidate;
                  $parentMask[$nextMask] = $mask;
                  $parentJob[$nextMask] = $job;
              }
          }
      }

      $mask = $fullMask;
      while ($mask !== 0) {
          //@step 8
          $mask = $parentMask[$mask];
      }

      //@step 9
      return $dp[$fullMask];
  }
  //#endregion bitmask-dp

  //#region popcount helper collapsed
  function popcount(int $mask): int
  {
      $count = 0;
      $current = $mask;
      while ($current > 0) {
          $count += $current & 1;
          $current >>= 1;
      }
      return $count;
  }
  //#endregion popcount
  `,
  'php',
);

const BITMASK_KOTLIN = buildStructuredCode(
  `
  /**
   * Solves assignment with DP over subsets.
   * Input: cost matrix costs[worker][job].
   * Returns: minimum total assignment cost.
   */
  //#region bitmask-dp function open
  fun bitmaskAssignment(costs: Array<IntArray>): Int {
      val workerCount = costs.size
      val fullMask = (1 shl workerCount) - 1
      val dp = IntArray(1 shl workerCount) { Int.MAX_VALUE }
      val parentMask = IntArray(1 shl workerCount) { -1 }
      val parentJob = IntArray(1 shl workerCount) { -1 }

      //@step 2
      dp[0] = 0

      for (mask in 0..fullMask) {
          val worker = Integer.bitCount(mask)
          if (worker >= workerCount || dp[mask] == Int.MAX_VALUE) {
              continue
          }

          for (job in 0 until workerCount) {
              if ((mask and (1 shl job)) != 0) {
                  continue
              }

              //@step 5
              val nextMask = mask or (1 shl job)
              //@step 6
              val candidate = dp[mask] + costs[worker][job]

              if (candidate < dp[nextMask]) {
                  dp[nextMask] = candidate
                  parentMask[nextMask] = mask
                  parentJob[nextMask] = job
              }
          }
      }

      var mask = fullMask
      while (mask != 0) {
          //@step 8
          mask = parentMask[mask]
      }

      //@step 9
      return dp[fullMask]
  }
  //#endregion bitmask-dp
  `,
  'kotlin',
);

export const DP_WITH_BITMASK_CODE = BITMASK_TS.lines;
export const DP_WITH_BITMASK_CODE_REGIONS = BITMASK_TS.regions;
export const DP_WITH_BITMASK_CODE_HIGHLIGHT_MAP = BITMASK_TS.highlightMap;
export const DP_WITH_BITMASK_CODE_VARIANTS: CodeVariantMap = {
  typescript: {
    language: 'typescript',
    lines: BITMASK_TS.lines,
    regions: BITMASK_TS.regions,
    highlightMap: BITMASK_TS.highlightMap,
    source: BITMASK_TS.source,
  },
  javascript: {
    language: 'javascript',
    lines: BITMASK_JS.lines,
    regions: BITMASK_JS.regions,
    highlightMap: BITMASK_JS.highlightMap,
    source: BITMASK_JS.source,
  },
  python: {
    language: 'python',
    lines: BITMASK_PY.lines,
    regions: BITMASK_PY.regions,
    highlightMap: BITMASK_PY.highlightMap,
    source: BITMASK_PY.source,
  },
  csharp: {
    language: 'csharp',
    lines: BITMASK_CS.lines,
    regions: BITMASK_CS.regions,
    highlightMap: BITMASK_CS.highlightMap,
    source: BITMASK_CS.source,
  },
  java: {
    language: 'java',
    lines: BITMASK_JAVA.lines,
    regions: BITMASK_JAVA.regions,
    highlightMap: BITMASK_JAVA.highlightMap,
    source: BITMASK_JAVA.source,
  },
  cpp: {
    language: 'cpp',
    lines: BITMASK_CPP.lines,
    regions: BITMASK_CPP.regions,
    highlightMap: BITMASK_CPP.highlightMap,
    source: BITMASK_CPP.source,
  },
  go: {
    language: 'go',
    lines: BITMASK_GO.lines,
    regions: BITMASK_GO.regions,
    highlightMap: BITMASK_GO.highlightMap,
    source: BITMASK_GO.source,
  },
  rust: {
    language: 'rust',
    lines: BITMASK_RUST.lines,
    regions: BITMASK_RUST.regions,
    highlightMap: BITMASK_RUST.highlightMap,
    source: BITMASK_RUST.source,
  },
  swift: {
    language: 'swift',
    lines: BITMASK_SWIFT.lines,
    regions: BITMASK_SWIFT.regions,
    highlightMap: BITMASK_SWIFT.highlightMap,
    source: BITMASK_SWIFT.source,
  },
  php: {
    language: 'php',
    lines: BITMASK_PHP.lines,
    regions: BITMASK_PHP.regions,
    highlightMap: BITMASK_PHP.highlightMap,
    source: BITMASK_PHP.source,
  },
  kotlin: {
    language: 'kotlin',
    lines: BITMASK_KOTLIN.lines,
    regions: BITMASK_KOTLIN.regions,
    highlightMap: BITMASK_KOTLIN.highlightMap,
    source: BITMASK_KOTLIN.source,
  },
};
