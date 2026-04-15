import { CodeVariantMap } from '../models/detail';
import { buildStructuredCode } from './code-line-builder';

const DIVIDE_CONQUER_TS = buildStructuredCode(`
  /**
   * Optimize partition DP with divide-and-conquer optimization.
   * Input: sorted values and group count.
   * Returns: minimum partition cost.
   */
  //#region divide-conquer-dp function open
  function divideConquerDp(values: number[], groups: number): number {
    const prefix = Array.from({ length: values.length + 1 }, () => 0);
    for (let index = 0; index < values.length; index += 1) {
      prefix[index + 1] = prefix[index] + values[index];
    }

    //@step 2
    let previous = Array.from({ length: values.length + 1 }, (_, index) =>
      index === 0 ? 0 : Number.POSITIVE_INFINITY,
    );
    const choice = Array.from({ length: groups + 1 }, () =>
      Array.from({ length: values.length + 1 }, () => -1),
    );

    function cost(left: number, right: number): number {
      const segmentSum = prefix[right] - prefix[left - 1];
      return segmentSum * segmentSum;
    }

    function solveRow(
      group: number,
      current: number[],
      left: number,
      right: number,
      optLeft: number,
      optRight: number,
    ): void {
      if (left > right) {
        return;
      }

      const mid = Math.floor((left + right) / 2);
      let bestSplit = -1;
      current[mid] = Number.POSITIVE_INFINITY;

      for (let split = optLeft; split <= Math.min(mid, optRight); split += 1) {
        //@step 5
        const candidate = previous[split - 1] + cost(split, mid);
        if (candidate < current[mid]) {
          current[mid] = candidate;
          bestSplit = split;
        }
      }

      //@step 6
      choice[group][mid] = bestSplit;
      solveRow(group, current, left, mid - 1, optLeft, bestSplit);
      solveRow(group, current, mid + 1, right, bestSplit, optRight);
    }

    for (let group = 1; group <= groups; group += 1) {
      const current = Array.from({ length: values.length + 1 }, () => Number.POSITIVE_INFINITY);
      solveRow(group, current, 1, values.length, 1, values.length);
      previous = current;
    }

    let right = values.length;
    for (let group = groups; group >= 1; group -= 1) {
      //@step 10
      right = choice[group][right] - 1;
    }

    //@step 11
    return previous[values.length];
  }
  //#endregion divide-conquer-dp
`);

const DIVIDE_CONQUER_PY = buildStructuredCode(
  `
  from math import inf

  """
  Optimize partition DP with divide-and-conquer optimization.
  Input: sorted values and group count.
  Returns: minimum partition cost.
  """
  //#region divide-conquer-dp function open
  def divide_conquer_dp(values: list[int], groups: int) -> int:
      prefix = [0]
      for value in values:
          prefix.append(prefix[-1] + value)

      //@step 2
      previous = [0] + [inf] * len(values)
      choice = [[-1] * (len(values) + 1) for _ in range(groups + 1)]

      def cost(left: int, right: int) -> int:
          segment_sum = prefix[right] - prefix[left - 1]
          return segment_sum * segment_sum

      def solve_row(group: int, current: list[float], left: int, right: int, opt_left: int, opt_right: int) -> None:
          if left > right:
              return

          mid = (left + right) // 2
          best_split = -1
          current[mid] = inf

          for split in range(opt_left, min(mid, opt_right) + 1):
              //@step 5
              candidate = previous[split - 1] + cost(split, mid)
              if candidate < current[mid]:
                  current[mid] = candidate
                  best_split = split

          //@step 6
          choice[group][mid] = best_split
          solve_row(group, current, left, mid - 1, opt_left, best_split)
          solve_row(group, current, mid + 1, right, best_split, opt_right)

      for group in range(1, groups + 1):
          current = [inf] * (len(values) + 1)
          solve_row(group, current, 1, len(values), 1, len(values))
          previous = current

      right = len(values)
      for group in range(groups, 0, -1):
          //@step 10
          right = choice[group][right] - 1

      //@step 11
      return int(previous[len(values)])
  //#endregion divide-conquer-dp
  `,
  'python',
);

const DIVIDE_CONQUER_CS = buildStructuredCode(
  `
  using System;

  /// <summary>
  /// Optimizes partition DP with divide-and-conquer optimization.
  /// Input: sorted values and group count.
  /// Returns: minimum partition cost.
  /// </summary>
  //#region divide-conquer-dp function open
  public static long DivideConquerDp(int[] values, int groups)
  {
      var prefix = new long[values.Length + 1];
      for (var index = 0; index < values.Length; index += 1)
      {
          prefix[index + 1] = prefix[index] + values[index];
      }

      //@step 2
      var previous = new long[values.Length + 1];
      Array.Fill(previous, long.MaxValue);
      previous[0] = 0;
      var choice = new int[groups + 1, values.Length + 1];

      long Cost(int left, int right)
      {
          var segmentSum = prefix[right] - prefix[left - 1];
          return segmentSum * segmentSum;
      }

      void SolveRow(int group, long[] current, int left, int right, int optLeft, int optRight)
      {
          if (left > right)
          {
              return;
          }

          var mid = (left + right) / 2;
          var bestSplit = -1;
          current[mid] = long.MaxValue;

          for (var split = optLeft; split <= Math.Min(mid, optRight); split += 1)
          {
              //@step 5
              var candidate = previous[split - 1] + Cost(split, mid);
              if (candidate < current[mid])
              {
                  current[mid] = candidate;
                  bestSplit = split;
              }
          }

          //@step 6
          choice[group, mid] = bestSplit;
          SolveRow(group, current, left, mid - 1, optLeft, bestSplit);
          SolveRow(group, current, mid + 1, right, bestSplit, optRight);
      }

      for (var group = 1; group <= groups; group += 1)
      {
          var current = new long[values.Length + 1];
          Array.Fill(current, long.MaxValue);
          SolveRow(group, current, 1, values.Length, 1, values.Length);
          previous = current;
      }

      var right = values.Length;
      for (var group = groups; group >= 1; group -= 1)
      {
          //@step 10
          right = choice[group, right] - 1;
      }

      //@step 11
      return previous[values.Length];
  }
  //#endregion divide-conquer-dp
  `,
  'csharp',
);

const DIVIDE_CONQUER_JAVA = buildStructuredCode(
  `
  /**
   * Optimizes partition DP with divide-and-conquer optimization.
   * Input: sorted values and group count.
   * Returns: minimum partition cost.
   */
  //#region divide-conquer-dp function open
  public static long divideConquerDp(int[] values, int groups) {
      long[] prefix = new long[values.length + 1];
      for (int index = 0; index < values.length; index += 1) {
          prefix[index + 1] = prefix[index] + values[index];
      }

      //@step 2
      long[] previous = new long[values.length + 1];
      java.util.Arrays.fill(previous, Long.MAX_VALUE);
      previous[0] = 0;
      int[][] choice = new int[groups + 1][values.length + 1];

      for (int group = 1; group <= groups; group += 1) {
          long[] current = new long[values.length + 1];
          java.util.Arrays.fill(current, Long.MAX_VALUE);
          solveRow(values.length, prefix, previous, choice, group, current, 1, values.length, 1, values.length);
          previous = current;
      }

      int right = values.length;
      for (int group = groups; group >= 1; group -= 1) {
          //@step 10
          right = choice[group][right] - 1;
      }

      //@step 11
      return previous[values.length];
  }
  //#endregion divide-conquer-dp

  //#region helper collapsed
  private static long cost(long[] prefix, int left, int right) {
      long segmentSum = prefix[right] - prefix[left - 1];
      return segmentSum * segmentSum;
  }

  private static void solveRow(
      int n,
      long[] prefix,
      long[] previous,
      int[][] choice,
      int group,
      long[] current,
      int left,
      int right,
      int optLeft,
      int optRight
  ) {
      if (left > right) {
          return;
      }

      int mid = (left + right) / 2;
      int bestSplit = -1;
      current[mid] = Long.MAX_VALUE;

      for (int split = optLeft; split <= Math.min(mid, optRight); split += 1) {
          //@step 5
          long candidate = previous[split - 1] + cost(prefix, split, mid);
          if (candidate < current[mid]) {
              current[mid] = candidate;
              bestSplit = split;
          }
      }

      //@step 6
      choice[group][mid] = bestSplit;
      solveRow(n, prefix, previous, choice, group, current, left, mid - 1, optLeft, bestSplit);
      solveRow(n, prefix, previous, choice, group, current, mid + 1, right, bestSplit, optRight);
  }
  //#endregion helper
  `,
  'java',
);

const DIVIDE_CONQUER_CPP = buildStructuredCode(
  `
  #include <algorithm>
  #include <limits>
  #include <vector>

  /**
   * Optimizes partition DP with divide-and-conquer optimization.
   * Input: sorted values and group count.
   * Returns: minimum partition cost.
   */
  //#region divide-conquer-dp function open
  long long divideConquerDp(const std::vector<int>& values, int groups) {
      std::vector<long long> prefix(values.size() + 1, 0);
      for (int index = 0; index < static_cast<int>(values.size()); index += 1) {
          prefix[index + 1] = prefix[index] + values[index];
      }

      //@step 2
      std::vector<long long> previous(values.size() + 1, std::numeric_limits<long long>::max());
      previous[0] = 0;
      std::vector<std::vector<int>> choice(groups + 1, std::vector<int>(values.size() + 1, -1));

      for (int group = 1; group <= groups; group += 1) {
          std::vector<long long> current(values.size() + 1, std::numeric_limits<long long>::max());
          solveRow(prefix, previous, choice, group, current, 1, static_cast<int>(values.size()), 1, static_cast<int>(values.size()));
          previous = current;
      }

      int right = static_cast<int>(values.size());
      for (int group = groups; group >= 1; group -= 1) {
          //@step 10
          right = choice[group][right] - 1;
      }

      //@step 11
      return previous[values.size()];
  }
  //#endregion divide-conquer-dp

  //#region helper collapsed
  long long cost(const std::vector<long long>& prefix, int left, int right) {
      long long segmentSum = prefix[right] - prefix[left - 1];
      return segmentSum * segmentSum;
  }

  void solveRow(
      const std::vector<long long>& prefix,
      const std::vector<long long>& previous,
      std::vector<std::vector<int>>& choice,
      int group,
      std::vector<long long>& current,
      int left,
      int right,
      int optLeft,
      int optRight
  ) {
      if (left > right) {
          return;
      }

      int mid = (left + right) / 2;
      int bestSplit = -1;
      current[mid] = std::numeric_limits<long long>::max();

      for (int split = optLeft; split <= std::min(mid, optRight); split += 1) {
          //@step 5
          long long candidate = previous[split - 1] + cost(prefix, split, mid);
          if (candidate < current[mid]) {
              current[mid] = candidate;
              bestSplit = split;
          }
      }

      //@step 6
      choice[group][mid] = bestSplit;
      solveRow(prefix, previous, choice, group, current, left, mid - 1, optLeft, bestSplit);
      solveRow(prefix, previous, choice, group, current, mid + 1, right, bestSplit, optRight);
  }
  //#endregion helper
  `,
  'cpp',
);

export const DIVIDE_CONQUER_DP_OPTIMIZATION_CODE = DIVIDE_CONQUER_TS.lines;
export const DIVIDE_CONQUER_DP_OPTIMIZATION_CODE_REGIONS = DIVIDE_CONQUER_TS.regions;
export const DIVIDE_CONQUER_DP_OPTIMIZATION_CODE_HIGHLIGHT_MAP = DIVIDE_CONQUER_TS.highlightMap;
export const DIVIDE_CONQUER_DP_OPTIMIZATION_CODE_VARIANTS: CodeVariantMap = {
  typescript: { language: 'typescript', lines: DIVIDE_CONQUER_TS.lines, regions: DIVIDE_CONQUER_TS.regions, highlightMap: DIVIDE_CONQUER_TS.highlightMap, source: DIVIDE_CONQUER_TS.source },
  python: { language: 'python', lines: DIVIDE_CONQUER_PY.lines, regions: DIVIDE_CONQUER_PY.regions, highlightMap: DIVIDE_CONQUER_PY.highlightMap, source: DIVIDE_CONQUER_PY.source },
  csharp: { language: 'csharp', lines: DIVIDE_CONQUER_CS.lines, regions: DIVIDE_CONQUER_CS.regions, highlightMap: DIVIDE_CONQUER_CS.highlightMap, source: DIVIDE_CONQUER_CS.source },
  java: { language: 'java', lines: DIVIDE_CONQUER_JAVA.lines, regions: DIVIDE_CONQUER_JAVA.regions, highlightMap: DIVIDE_CONQUER_JAVA.highlightMap, source: DIVIDE_CONQUER_JAVA.source },
  cpp: { language: 'cpp', lines: DIVIDE_CONQUER_CPP.lines, regions: DIVIDE_CONQUER_CPP.regions, highlightMap: DIVIDE_CONQUER_CPP.highlightMap, source: DIVIDE_CONQUER_CPP.source },
};
