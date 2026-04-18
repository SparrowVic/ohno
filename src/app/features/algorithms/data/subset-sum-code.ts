import { CodeVariantMap } from '../models/detail';
import { buildStructuredCode } from './code-line-builder/code-line-builder';

const SUBSET_SUM_TS = buildStructuredCode(`
  //#region subset-result interface collapsed
  interface SubsetSumResult {
    readonly reachable: boolean;
    readonly subset: number[];
  }
  //#endregion subset-result

  /**
   * Decide whether a subset reaches the target sum and reconstruct one witness subset.
   * Input: values array and target sum.
   * Returns: reachability flag and one subset if reachable.
   */
  //#region subset-sum function open
  function subsetSum(values: number[], target: number): SubsetSumResult {
    //@step 2
    const dp = Array.from({ length: values.length + 1 }, () =>
      Array.from({ length: target + 1 }, () => false),
    );
    dp[0][0] = true;

    for (let row = 1; row <= values.length; row += 1) {
      const value = values[row - 1];

      for (let sum = 0; sum <= target; sum += 1) {
        const skip = dp[row - 1][sum];
        const take = value <= sum ? dp[row - 1][sum - value] : false;

        //@step 5
        const reachable = skip || take;

        //@step 8
        dp[row][sum] = reachable;
      }
    }

    //@step 15
    if (!dp[values.length][target]) {
      return { reachable: false, subset: [] };
    }

    const subset: number[] = [];
    let row = values.length;
    let sum = target;

    while (row > 0 && sum >= 0) {
      const value = values[row - 1];

      if (dp[row - 1][sum]) {
        //@step 13
        row -= 1;
        continue;
      }

      if (sum >= value && dp[row - 1][sum - value]) {
        //@step 11
        subset.push(value);
        sum -= value;
      }

      row -= 1;
    }

    //@step 15
    return {
      reachable: true,
      subset: subset.reverse(),
    };
  }
  //#endregion subset-sum
`);

const SUBSET_SUM_PY = buildStructuredCode(
  `
  from typing import TypedDict


  //#region subset-result interface collapsed
  class SubsetSumResult(TypedDict):
      reachable: bool
      subset: list[int]
  //#endregion subset-result

  """
  Decide whether a subset reaches the target sum and reconstruct one witness subset.
  Input: values array and target sum.
  Returns: reachability flag and one subset if reachable.
  """
  //#region subset-sum function open
  def subset_sum(values: list[int], target: int) -> SubsetSumResult:
      //@step 2
      dp = [[False] * (target + 1) for _ in range(len(values) + 1)]
      dp[0][0] = True

      for row in range(1, len(values) + 1):
          value = values[row - 1]

          for total in range(target + 1):
              skip = dp[row - 1][total]
              take = dp[row - 1][total - value] if value <= total else False

              //@step 5
              reachable = skip or take

              //@step 8
              dp[row][total] = reachable

      //@step 15
      if not dp[len(values)][target]:
          return {"reachable": False, "subset": []}

      subset: list[int] = []
      row = len(values)
      total = target

      while row > 0 and total >= 0:
          value = values[row - 1]

          if dp[row - 1][total]:
              //@step 13
              row -= 1
              continue

          if total >= value and dp[row - 1][total - value]:
              //@step 11
              subset.append(value)
              total -= value

          row -= 1

      //@step 15
      return {"reachable": True, "subset": list(reversed(subset))}
  //#endregion subset-sum
  `,
  'python',
);

const SUBSET_SUM_CS = buildStructuredCode(
  `
  using System.Collections.Generic;

  //#region subset-result interface collapsed
  public sealed class SubsetSumResult
  {
      public required bool Reachable { get; init; }
      public required List<int> Subset { get; init; }
  }
  //#endregion subset-result

  /// <summary>
  /// Decides whether a subset reaches the target sum and reconstructs one witness subset.
  /// Input: values array and target sum.
  /// Returns: reachability flag and one subset if reachable.
  /// </summary>
  //#region subset-sum function open
  public static SubsetSumResult SubsetSum(IReadOnlyList<int> values, int target)
  {
      //@step 2
      var dp = new bool[values.Count + 1, target + 1];
      dp[0, 0] = true;

      for (var row = 1; row <= values.Count; row += 1)
      {
          var value = values[row - 1];

          for (var total = 0; total <= target; total += 1)
          {
              var skip = dp[row - 1, total];
              var take = value <= total && dp[row - 1, total - value];

              //@step 5
              var reachable = skip || take;

              //@step 8
              dp[row, total] = reachable;
          }
      }

      //@step 15
      if (!dp[values.Count, target])
      {
          return new SubsetSumResult { Reachable = false, Subset = [] };
      }

      var subset = new List<int>();
      var currentRow = values.Count;
      var total = target;

      while (currentRow > 0 && total >= 0)
      {
          var value = values[currentRow - 1];

          if (dp[currentRow - 1, total])
          {
              //@step 13
              currentRow -= 1;
              continue;
          }

          if (total >= value && dp[currentRow - 1, total - value])
          {
              //@step 11
              subset.Add(value);
              total -= value;
          }

          currentRow -= 1;
      }

      subset.Reverse();

      //@step 15
      return new SubsetSumResult { Reachable = true, Subset = subset };
  }
  //#endregion subset-sum
  `,
  'csharp',
);

const SUBSET_SUM_JAVA = buildStructuredCode(
  `
  import java.util.ArrayList;
  import java.util.Collections;
  import java.util.List;

  //#region subset-result interface collapsed
  public record SubsetSumResult(boolean reachable, List<Integer> subset) {}
  //#endregion subset-result

  /**
   * Decides whether a subset reaches the target sum and reconstructs one witness subset.
   * Input: values array and target sum.
   * Returns: reachability flag and one subset if reachable.
   */
  //#region subset-sum function open
  public static SubsetSumResult subsetSum(List<Integer> values, int target) {
      //@step 2
      boolean[][] dp = new boolean[values.size() + 1][target + 1];
      dp[0][0] = true;

      for (int row = 1; row <= values.size(); row += 1) {
          int value = values.get(row - 1);

          for (int total = 0; total <= target; total += 1) {
              boolean skip = dp[row - 1][total];
              boolean take = value <= total && dp[row - 1][total - value];

              //@step 5
              boolean reachable = skip || take;

              //@step 8
              dp[row][total] = reachable;
          }
      }

      //@step 15
      if (!dp[values.size()][target]) {
          return new SubsetSumResult(false, List.of());
      }

      List<Integer> subset = new ArrayList<>();
      int currentRow = values.size();
      int total = target;

      while (currentRow > 0 && total >= 0) {
          int value = values.get(currentRow - 1);

          if (dp[currentRow - 1][total]) {
              //@step 13
              currentRow -= 1;
              continue;
          }

          if (total >= value && dp[currentRow - 1][total - value]) {
              //@step 11
              subset.add(value);
              total -= value;
          }

          currentRow -= 1;
      }

      Collections.reverse(subset);

      //@step 15
      return new SubsetSumResult(true, subset);
  }
  //#endregion subset-sum
  `,
  'java',
);

const SUBSET_SUM_CPP = buildStructuredCode(
  `
  #include <algorithm>
  #include <vector>

  //#region subset-result interface collapsed
  struct SubsetSumResult {
      bool reachable;
      std::vector<int> subset;
  };
  //#endregion subset-result

  /**
   * Decides whether a subset reaches the target sum and reconstructs one witness subset.
   * Input: values array and target sum.
   * Returns: reachability flag and one subset if reachable.
   */
  //#region subset-sum function open
  SubsetSumResult subsetSum(const std::vector<int>& values, int target) {
      //@step 2
      std::vector<std::vector<bool>> dp(values.size() + 1, std::vector<bool>(target + 1, false));
      dp[0][0] = true;

      for (std::size_t row = 1; row <= values.size(); row += 1) {
          int value = values[row - 1];

          for (int total = 0; total <= target; total += 1) {
              bool skip = dp[row - 1][total];
              bool take = value <= total && dp[row - 1][total - value];

              //@step 5
              bool reachable = skip || take;

              //@step 8
              dp[row][total] = reachable;
          }
      }

      //@step 15
      if (!dp[values.size()][target]) {
          return {false, {}};
      }

      std::vector<int> subset;
      std::size_t currentRow = values.size();
      int total = target;

      while (currentRow > 0 && total >= 0) {
          int value = values[currentRow - 1];

          if (dp[currentRow - 1][total]) {
              //@step 13
              currentRow -= 1;
              continue;
          }

          if (total >= value && dp[currentRow - 1][total - value]) {
              //@step 11
              subset.push_back(value);
              total -= value;
          }

          currentRow -= 1;
      }

      std::reverse(subset.begin(), subset.end());

      //@step 15
      return {true, subset};
  }
  //#endregion subset-sum
  `,
  'cpp',
);

export const SUBSET_SUM_CODE = SUBSET_SUM_TS.lines;
export const SUBSET_SUM_CODE_REGIONS = SUBSET_SUM_TS.regions;
export const SUBSET_SUM_CODE_HIGHLIGHT_MAP = SUBSET_SUM_TS.highlightMap;
export const SUBSET_SUM_CODE_VARIANTS: CodeVariantMap = {
  typescript: {
    language: 'typescript',
    lines: SUBSET_SUM_TS.lines,
    regions: SUBSET_SUM_TS.regions,
    highlightMap: SUBSET_SUM_TS.highlightMap,
    source: SUBSET_SUM_TS.source,
  },
  python: {
    language: 'python',
    lines: SUBSET_SUM_PY.lines,
    regions: SUBSET_SUM_PY.regions,
    highlightMap: SUBSET_SUM_PY.highlightMap,
    source: SUBSET_SUM_PY.source,
  },
  csharp: {
    language: 'csharp',
    lines: SUBSET_SUM_CS.lines,
    regions: SUBSET_SUM_CS.regions,
    highlightMap: SUBSET_SUM_CS.highlightMap,
    source: SUBSET_SUM_CS.source,
  },
  java: {
    language: 'java',
    lines: SUBSET_SUM_JAVA.lines,
    regions: SUBSET_SUM_JAVA.regions,
    highlightMap: SUBSET_SUM_JAVA.highlightMap,
    source: SUBSET_SUM_JAVA.source,
  },
  cpp: {
    language: 'cpp',
    lines: SUBSET_SUM_CPP.lines,
    regions: SUBSET_SUM_CPP.regions,
    highlightMap: SUBSET_SUM_CPP.highlightMap,
    source: SUBSET_SUM_CPP.source,
  },
};
