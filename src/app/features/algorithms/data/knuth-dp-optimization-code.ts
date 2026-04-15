import { CodeVariantMap } from '../models/detail';
import { buildStructuredCode } from './code-line-builder';

const KNUTH_TS = buildStructuredCode(`
  /**
   * Optimize interval merge DP with Knuth's quadrangle-inequality optimization.
   * Input: file weights in merge order.
   * Returns: minimum merge cost.
   */
  //#region knuth function open
  function knuthDp(weights: number[]): number {
    const prefix = Array.from({ length: weights.length + 1 }, () => 0);
    for (let index = 0; index < weights.length; index += 1) {
      prefix[index + 1] = prefix[index] + weights[index];
    }

    const dp = Array.from({ length: weights.length }, () =>
      Array.from({ length: weights.length }, () => 0),
    );
    const opt = Array.from({ length: weights.length }, (_, row) =>
      Array.from({ length: weights.length }, (_, col) => (row === col ? row : 0)),
    );

    //@step 2
    for (let index = 0; index < weights.length; index += 1) {
      dp[index][index] = 0;
      opt[index][index] = index;
    }

    const rangeCost = (left: number, right: number) => prefix[right + 1] - prefix[left];

    for (let span = 2; span <= weights.length; span += 1) {
      for (let left = 0; left + span - 1 < weights.length; left += 1) {
        const right = left + span - 1;
        dp[left][right] = Number.POSITIVE_INFINITY;

        const start = opt[left][right - 1];
        const end = opt[left + 1][right];
        for (let split = start; split <= end; split += 1) {
          //@step 5
          const candidate = dp[left][split] + dp[split + 1][right] + rangeCost(left, right);
          if (candidate < dp[left][right]) {
            //@step 6
            dp[left][right] = candidate;
            opt[left][right] = split;
          }
        }
      }
    }

    function trace(left: number, right: number): void {
      if (left >= right) {
        return;
      }

      //@step 7
      const split = opt[left][right];
      trace(left, split);
      trace(split + 1, right);
    }

    if (weights.length > 0) {
      trace(0, weights.length - 1);
    }

    //@step 8
    return weights.length === 0 ? 0 : dp[0][weights.length - 1];
  }
  //#endregion knuth
`);

const KNUTH_PY = buildStructuredCode(
  `
  from math import inf

  """
  Optimize interval merge DP with Knuth's quadrangle-inequality optimization.
  Input: file weights in merge order.
  Returns: minimum merge cost.
  """
  //#region knuth function open
  def knuth_dp(weights: list[int]) -> int:
      prefix = [0]
      for weight in weights:
          prefix.append(prefix[-1] + weight)

      dp = [[0] * len(weights) for _ in range(len(weights))]
      opt = [[row if row == col else 0 for col in range(len(weights))] for row in range(len(weights))]

      //@step 2
      for index in range(len(weights)):
          dp[index][index] = 0
          opt[index][index] = index

      def range_cost(left: int, right: int) -> int:
          return prefix[right + 1] - prefix[left]

      for span in range(2, len(weights) + 1):
          for left in range(len(weights) - span + 1):
              right = left + span - 1
              dp[left][right] = inf

              start = opt[left][right - 1]
              end = opt[left + 1][right]
              for split in range(start, end + 1):
                  //@step 5
                  candidate = dp[left][split] + dp[split + 1][right] + range_cost(left, right)
                  if candidate < dp[left][right]:
                      //@step 6
                      dp[left][right] = candidate
                      opt[left][right] = split

      def trace(left: int, right: int) -> None:
          if left >= right:
              return

          //@step 7
          split = opt[left][right]
          trace(left, split)
          trace(split + 1, right)

      if weights:
          trace(0, len(weights) - 1)

      //@step 8
      return 0 if not weights else int(dp[0][len(weights) - 1])
  //#endregion knuth
  `,
  'python',
);

const KNUTH_CS = buildStructuredCode(
  `
  using System;

  /// <summary>
  /// Optimizes interval merge DP with Knuth's quadrangle-inequality optimization.
  /// Input: file weights in merge order.
  /// Returns: minimum merge cost.
  /// </summary>
  //#region knuth function open
  public static int KnuthDp(int[] weights)
  {
      var prefix = new int[weights.Length + 1];
      for (var index = 0; index < weights.Length; index += 1)
      {
          prefix[index + 1] = prefix[index] + weights[index];
      }

      var dp = new int[weights.Length, weights.Length];
      var opt = new int[weights.Length, weights.Length];

      //@step 2
      for (var index = 0; index < weights.Length; index += 1)
      {
          dp[index, index] = 0;
          opt[index, index] = index;
      }

      int RangeCost(int left, int right) => prefix[right + 1] - prefix[left];

      for (var span = 2; span <= weights.Length; span += 1)
      {
          for (var left = 0; left + span - 1 < weights.Length; left += 1)
          {
              var right = left + span - 1;
              dp[left, right] = int.MaxValue;

              var start = opt[left, right - 1];
              var end = opt[left + 1, right];
              for (var split = start; split <= end; split += 1)
              {
                  //@step 5
                  var candidate = dp[left, split] + dp[split + 1, right] + RangeCost(left, right);
                  if (candidate < dp[left, right])
                  {
                      //@step 6
                      dp[left, right] = candidate;
                      opt[left, right] = split;
                  }
              }
          }
      }

      void Trace(int left, int right)
      {
          if (left >= right)
          {
              return;
          }

          //@step 7
          var split = opt[left, right];
          Trace(left, split);
          Trace(split + 1, right);
      }

      if (weights.Length > 0)
      {
          Trace(0, weights.Length - 1);
      }

      //@step 8
      return weights.Length == 0 ? 0 : dp[0, weights.Length - 1];
  }
  //#endregion knuth
  `,
  'csharp',
);

const KNUTH_JAVA = buildStructuredCode(
  `
  /**
   * Optimizes interval merge DP with Knuth's quadrangle-inequality optimization.
   * Input: file weights in merge order.
   * Returns: minimum merge cost.
   */
  //#region knuth function open
  public static int knuthDp(int[] weights) {
      int[] prefix = new int[weights.length + 1];
      for (int index = 0; index < weights.length; index += 1) {
          prefix[index + 1] = prefix[index] + weights[index];
      }

      int[][] dp = new int[weights.length][weights.length];
      int[][] opt = new int[weights.length][weights.length];

      //@step 2
      for (int index = 0; index < weights.length; index += 1) {
          dp[index][index] = 0;
          opt[index][index] = index;
      }

      for (int span = 2; span <= weights.length; span += 1) {
          for (int left = 0; left + span - 1 < weights.length; left += 1) {
              int right = left + span - 1;
              dp[left][right] = Integer.MAX_VALUE;

              int start = opt[left][right - 1];
              int end = opt[left + 1][right];
              for (int split = start; split <= end; split += 1) {
                  //@step 5
                  int candidate = dp[left][split] + dp[split + 1][right] + (prefix[right + 1] - prefix[left]);
                  if (candidate < dp[left][right]) {
                      //@step 6
                      dp[left][right] = candidate;
                      opt[left][right] = split;
                  }
              }
          }
      }

      if (weights.length > 0) {
          trace(opt, 0, weights.length - 1);
      }

      //@step 8
      return weights.length == 0 ? 0 : dp[0][weights.length - 1];
  }
  //#endregion knuth

  //#region trace helper collapsed
  private static void trace(int[][] opt, int left, int right) {
      if (left >= right) {
          return;
      }

      //@step 7
      int split = opt[left][right];
      trace(opt, left, split);
      trace(opt, split + 1, right);
  }
  //#endregion trace
  `,
  'java',
);

const KNUTH_CPP = buildStructuredCode(
  `
  #include <limits>
  #include <vector>

  /**
   * Optimizes interval merge DP with Knuth's quadrangle-inequality optimization.
   * Input: file weights in merge order.
   * Returns: minimum merge cost.
   */
  //#region knuth function open
  int knuthDp(const std::vector<int>& weights) {
      std::vector<int> prefix(weights.size() + 1, 0);
      for (int index = 0; index < static_cast<int>(weights.size()); index += 1) {
          prefix[index + 1] = prefix[index] + weights[index];
      }

      std::vector<std::vector<int>> dp(weights.size(), std::vector<int>(weights.size(), 0));
      std::vector<std::vector<int>> opt(weights.size(), std::vector<int>(weights.size(), 0));

      //@step 2
      for (int index = 0; index < static_cast<int>(weights.size()); index += 1) {
          dp[index][index] = 0;
          opt[index][index] = index;
      }

      for (int span = 2; span <= static_cast<int>(weights.size()); span += 1) {
          for (int left = 0; left + span - 1 < static_cast<int>(weights.size()); left += 1) {
              int right = left + span - 1;
              dp[left][right] = std::numeric_limits<int>::max();

              int start = opt[left][right - 1];
              int end = opt[left + 1][right];
              for (int split = start; split <= end; split += 1) {
                  //@step 5
                  int candidate = dp[left][split] + dp[split + 1][right] + (prefix[right + 1] - prefix[left]);
                  if (candidate < dp[left][right]) {
                      //@step 6
                      dp[left][right] = candidate;
                      opt[left][right] = split;
                  }
              }
          }
      }

      if (!weights.empty()) {
          trace(opt, 0, static_cast<int>(weights.size()) - 1);
      }

      //@step 8
      return weights.empty() ? 0 : dp[0][weights.size() - 1];
  }
  //#endregion knuth

  //#region trace helper collapsed
  void trace(const std::vector<std::vector<int>>& opt, int left, int right) {
      if (left >= right) {
          return;
      }

      //@step 7
      int split = opt[left][right];
      trace(opt, left, split);
      trace(opt, split + 1, right);
  }
  //#endregion trace
  `,
  'cpp',
);

export const KNUTH_DP_OPTIMIZATION_CODE = KNUTH_TS.lines;
export const KNUTH_DP_OPTIMIZATION_CODE_REGIONS = KNUTH_TS.regions;
export const KNUTH_DP_OPTIMIZATION_CODE_HIGHLIGHT_MAP = KNUTH_TS.highlightMap;
export const KNUTH_DP_OPTIMIZATION_CODE_VARIANTS: CodeVariantMap = {
  typescript: { language: 'typescript', lines: KNUTH_TS.lines, regions: KNUTH_TS.regions, highlightMap: KNUTH_TS.highlightMap, source: KNUTH_TS.source },
  python: { language: 'python', lines: KNUTH_PY.lines, regions: KNUTH_PY.regions, highlightMap: KNUTH_PY.highlightMap, source: KNUTH_PY.source },
  csharp: { language: 'csharp', lines: KNUTH_CS.lines, regions: KNUTH_CS.regions, highlightMap: KNUTH_CS.highlightMap, source: KNUTH_CS.source },
  java: { language: 'java', lines: KNUTH_JAVA.lines, regions: KNUTH_JAVA.regions, highlightMap: KNUTH_JAVA.highlightMap, source: KNUTH_JAVA.source },
  cpp: { language: 'cpp', lines: KNUTH_CPP.lines, regions: KNUTH_CPP.regions, highlightMap: KNUTH_CPP.highlightMap, source: KNUTH_CPP.source },
};
