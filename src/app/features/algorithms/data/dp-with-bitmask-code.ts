import { CodeVariantMap } from '../models/detail';
import { buildStructuredCode } from './code-line-builder';

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

export const DP_WITH_BITMASK_CODE = BITMASK_TS.lines;
export const DP_WITH_BITMASK_CODE_REGIONS = BITMASK_TS.regions;
export const DP_WITH_BITMASK_CODE_HIGHLIGHT_MAP = BITMASK_TS.highlightMap;
export const DP_WITH_BITMASK_CODE_VARIANTS: CodeVariantMap = {
  typescript: { language: 'typescript', lines: BITMASK_TS.lines, regions: BITMASK_TS.regions, highlightMap: BITMASK_TS.highlightMap, source: BITMASK_TS.source },
  python: { language: 'python', lines: BITMASK_PY.lines, regions: BITMASK_PY.regions, highlightMap: BITMASK_PY.highlightMap, source: BITMASK_PY.source },
  csharp: { language: 'csharp', lines: BITMASK_CS.lines, regions: BITMASK_CS.regions, highlightMap: BITMASK_CS.highlightMap, source: BITMASK_CS.source },
  java: { language: 'java', lines: BITMASK_JAVA.lines, regions: BITMASK_JAVA.regions, highlightMap: BITMASK_JAVA.highlightMap, source: BITMASK_JAVA.source },
  cpp: { language: 'cpp', lines: BITMASK_CPP.lines, regions: BITMASK_CPP.regions, highlightMap: BITMASK_CPP.highlightMap, source: BITMASK_CPP.source },
};
