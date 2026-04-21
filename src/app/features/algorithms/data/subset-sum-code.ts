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

const SUBSET_SUM_JS = buildStructuredCode(
  `
  /**
   * Decide whether a subset reaches the target sum and reconstruct one witness subset.
   * Input: values array and target sum.
   * Returns: reachability flag and one subset if reachable.
   */
  //#region subset-sum function open
  function subsetSum(values, target) {
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

      const subset = [];
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
  `,
  'javascript',
);

const SUBSET_SUM_GO = buildStructuredCode(
  `
  package dp

  //#region subset-result interface collapsed
  type SubsetSumResult struct {
      Reachable bool
      Subset []int
  }
  //#endregion subset-result

  /**
   * Decides whether a subset reaches the target sum and reconstructs one witness subset.
   * Input: values array and target sum.
   * Returns: reachability flag and one subset if reachable.
   */
  //#region subset-sum function open
  func SubsetSum(values []int, target int) SubsetSumResult {
      //@step 2
      dp := make([][]bool, len(values) + 1)
      for row := 0; row <= len(values); row += 1 {
          dp[row] = make([]bool, target + 1)
      }
      dp[0][0] = true

      for row := 1; row <= len(values); row += 1 {
          value := values[row - 1]

          for sum := 0; sum <= target; sum += 1 {
              skip := dp[row - 1][sum]
              take := value <= sum && dp[row - 1][sum - value]

              //@step 5
              reachable := skip || take

              //@step 8
              dp[row][sum] = reachable
          }
      }

      //@step 15
      if !dp[len(values)][target] {
          return SubsetSumResult{Reachable: false, Subset: []int{}}
      }

      subset := make([]int, 0)
      row := len(values)
      sum := target

      for row > 0 && sum >= 0 {
          value := values[row - 1]

          if dp[row - 1][sum] {
              //@step 13
              row -= 1
              continue
          }

          if sum >= value && dp[row - 1][sum - value] {
              //@step 11
              subset = append(subset, value)
              sum -= value
          }

          row -= 1
      }

      for left, right := 0, len(subset) - 1; left < right; left, right = left + 1, right - 1 {
          subset[left], subset[right] = subset[right], subset[left]
      }

      //@step 15
      return SubsetSumResult{Reachable: true, Subset: subset}
  }
  //#endregion subset-sum
  `,
  'go',
);

const SUBSET_SUM_RUST = buildStructuredCode(
  `
  //#region subset-result interface collapsed
  struct SubsetSumResult {
      reachable: bool,
      subset: Vec<i32>,
  }
  //#endregion subset-result

  /**
   * Decides whether a subset reaches the target sum and reconstructs one witness subset.
   * Input: values array and target sum.
   * Returns: reachability flag and one subset if reachable.
   */
  //#region subset-sum function open
  fn subset_sum(values: &[i32], target: usize) -> SubsetSumResult {
      //@step 2
      let mut dp = vec![vec![false; target + 1]; values.len() + 1];
      dp[0][0] = true;

      for row in 1..=values.len() {
          let value = values[row - 1] as usize;

          for sum in 0..=target {
              let skip = dp[row - 1][sum];
              let take = value <= sum && dp[row - 1][sum - value];

              //@step 5
              let reachable = skip || take;

              //@step 8
              dp[row][sum] = reachable;
          }
      }

      //@step 15
      if !dp[values.len()][target] {
          return SubsetSumResult { reachable: false, subset: Vec::new() };
      }

      let mut subset = Vec::new();
      let mut row = values.len();
      let mut sum = target;

      while row > 0 {
          let value = values[row - 1] as usize;

          if dp[row - 1][sum] {
              //@step 13
              row -= 1;
              continue;
          }

          if sum >= value && dp[row - 1][sum - value] {
              //@step 11
              subset.push(values[row - 1]);
              sum -= value;
          }

          row -= 1;
      }

      subset.reverse();

      //@step 15
      SubsetSumResult { reachable: true, subset }
  }
  //#endregion subset-sum
  `,
  'rust',
);

const SUBSET_SUM_SWIFT = buildStructuredCode(
  `
  //#region subset-result interface collapsed
  struct SubsetSumResult {
      let reachable: Bool
      let subset: [Int]
  }
  //#endregion subset-result

  /**
   * Decides whether a subset reaches the target sum and reconstructs one witness subset.
   * Input: values array and target sum.
   * Returns: reachability flag and one subset if reachable.
   */
  //#region subset-sum function open
  func subsetSum(_ values: [Int], target: Int) -> SubsetSumResult {
      //@step 2
      var dp = Array(repeating: Array(repeating: false, count: target + 1), count: values.count + 1)
      dp[0][0] = true

      for row in 1...values.count {
          let value = values[row - 1]

          for sum in 0...target {
              let skip = dp[row - 1][sum]
              let take = value <= sum ? dp[row - 1][sum - value] : false

              //@step 5
              let reachable = skip || take

              //@step 8
              dp[row][sum] = reachable
          }
      }

      //@step 15
      if !dp[values.count][target] {
          return SubsetSumResult(reachable: false, subset: [])
      }

      var subset: [Int] = []
      var row = values.count
      var sum = target

      while row > 0 && sum >= 0 {
          let value = values[row - 1]

          if dp[row - 1][sum] {
              //@step 13
              row -= 1
              continue
          }

          if sum >= value && dp[row - 1][sum - value] {
              //@step 11
              subset.append(value)
              sum -= value
          }

          row -= 1
      }

      //@step 15
      return SubsetSumResult(reachable: true, subset: subset.reversed())
  }
  //#endregion subset-sum
  `,
  'swift',
);

const SUBSET_SUM_PHP = buildStructuredCode(
  `
  /**
   * Decides whether a subset reaches the target sum and reconstructs one witness subset.
   * Input: values array and target sum.
   * Returns: reachability flag and one subset if reachable.
   */
  //#region subset-sum function open
  function subsetSum(array $values, int $target): array
  {
      //@step 2
      $dp = array_fill(0, count($values) + 1, array_fill(0, $target + 1, false));
      $dp[0][0] = true;

      for ($row = 1; $row <= count($values); $row += 1) {
          $value = $values[$row - 1];

          for ($sum = 0; $sum <= $target; $sum += 1) {
              $skip = $dp[$row - 1][$sum];
              $take = $value <= $sum ? $dp[$row - 1][$sum - $value] : false;

              //@step 5
              $reachable = $skip || $take;

              //@step 8
              $dp[$row][$sum] = $reachable;
          }
      }

      //@step 15
      if (!$dp[count($values)][$target]) {
          return ['reachable' => false, 'subset' => []];
      }

      $subset = [];
      $row = count($values);
      $sum = $target;

      while ($row > 0 && $sum >= 0) {
          $value = $values[$row - 1];

          if ($dp[$row - 1][$sum]) {
              //@step 13
              $row -= 1;
              continue;
          }

          if ($sum >= $value && $dp[$row - 1][$sum - $value]) {
              //@step 11
              $subset[] = $value;
              $sum -= $value;
          }

          $row -= 1;
      }

      //@step 15
      return ['reachable' => true, 'subset' => array_reverse($subset)];
  }
  //#endregion subset-sum
  `,
  'php',
);

const SUBSET_SUM_KOTLIN = buildStructuredCode(
  `
  //#region subset-result interface collapsed
  data class SubsetSumResult(
      val reachable: Boolean,
      val subset: List<Int>,
  )
  //#endregion subset-result

  /**
   * Decides whether a subset reaches the target sum and reconstructs one witness subset.
   * Input: values array and target sum.
   * Returns: reachability flag and one subset if reachable.
   */
  //#region subset-sum function open
  fun subsetSum(values: List<Int>, target: Int): SubsetSumResult {
      //@step 2
      val dp = Array(values.size + 1) { BooleanArray(target + 1) }
      dp[0][0] = true

      for (row in 1..values.size) {
          val value = values[row - 1]

          for (sum in 0..target) {
              val skip = dp[row - 1][sum]
              val take = value <= sum && dp[row - 1][sum - value]

              //@step 5
              val reachable = skip || take

              //@step 8
              dp[row][sum] = reachable
          }
      }

      //@step 15
      if (!dp[values.size][target]) {
          return SubsetSumResult(reachable = false, subset = emptyList())
      }

      val subset = mutableListOf<Int>()
      var row = values.size
      var sum = target

      while (row > 0 && sum >= 0) {
          val value = values[row - 1]

          if (dp[row - 1][sum]) {
              //@step 13
              row -= 1
              continue
          }

          if (sum >= value && dp[row - 1][sum - value]) {
              //@step 11
              subset += value
              sum -= value
          }

          row -= 1
      }

      //@step 15
      return SubsetSumResult(reachable = true, subset = subset.reversed())
  }
  //#endregion subset-sum
  `,
  'kotlin',
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
  javascript: {
    language: 'javascript',
    lines: SUBSET_SUM_JS.lines,
    regions: SUBSET_SUM_JS.regions,
    highlightMap: SUBSET_SUM_JS.highlightMap,
    source: SUBSET_SUM_JS.source,
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
  go: {
    language: 'go',
    lines: SUBSET_SUM_GO.lines,
    regions: SUBSET_SUM_GO.regions,
    highlightMap: SUBSET_SUM_GO.highlightMap,
    source: SUBSET_SUM_GO.source,
  },
  rust: {
    language: 'rust',
    lines: SUBSET_SUM_RUST.lines,
    regions: SUBSET_SUM_RUST.regions,
    highlightMap: SUBSET_SUM_RUST.highlightMap,
    source: SUBSET_SUM_RUST.source,
  },
  swift: {
    language: 'swift',
    lines: SUBSET_SUM_SWIFT.lines,
    regions: SUBSET_SUM_SWIFT.regions,
    highlightMap: SUBSET_SUM_SWIFT.highlightMap,
    source: SUBSET_SUM_SWIFT.source,
  },
  php: {
    language: 'php',
    lines: SUBSET_SUM_PHP.lines,
    regions: SUBSET_SUM_PHP.regions,
    highlightMap: SUBSET_SUM_PHP.highlightMap,
    source: SUBSET_SUM_PHP.source,
  },
  kotlin: {
    language: 'kotlin',
    lines: SUBSET_SUM_KOTLIN.lines,
    regions: SUBSET_SUM_KOTLIN.regions,
    highlightMap: SUBSET_SUM_KOTLIN.highlightMap,
    source: SUBSET_SUM_KOTLIN.source,
  },
};
