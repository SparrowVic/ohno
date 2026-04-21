import { CodeVariantMap } from '../models/detail';
import { buildStructuredCode } from './code-line-builder/code-line-builder';

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

const KNUTH_JS = buildStructuredCode(
  `
  /**
   * Optimize interval merge DP with Knuth's quadrangle-inequality optimization.
   * Input: file weights in merge order.
   * Returns: minimum merge cost.
   */
  //#region knuth function open
  function knuthDp(weights) {
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

      const rangeCost = (left, right) => prefix[right + 1] - prefix[left];

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

      function trace(left, right) {
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
  `,
  'javascript',
);

const KNUTH_GO = buildStructuredCode(
  `
  package dp

  /**
   * Optimizes interval merge DP with Knuth's quadrangle-inequality optimization.
   * Input: file weights in merge order.
   * Returns: minimum merge cost.
   */
  //#region knuth function open
  func KnuthDp(weights []int) int {
      prefix := make([]int, len(weights) + 1)
      for index := 0; index < len(weights); index += 1 {
          prefix[index + 1] = prefix[index] + weights[index]
      }

      dp := make([][]int, len(weights))
      opt := make([][]int, len(weights))
      for row := 0; row < len(weights); row += 1 {
          dp[row] = make([]int, len(weights))
          opt[row] = make([]int, len(weights))
      }

      //@step 2
      for index := 0; index < len(weights); index += 1 {
          dp[index][index] = 0
          opt[index][index] = index
      }

      rangeCost := func(left int, right int) int {
          return prefix[right + 1] - prefix[left]
      }

      for span := 2; span <= len(weights); span += 1 {
          for left := 0; left + span - 1 < len(weights); left += 1 {
              right := left + span - 1
              dp[left][right] = infInt()

              start := opt[left][right - 1]
              end := opt[left + 1][right]
              for split := start; split <= end; split += 1 {
                  //@step 5
                  candidate := dp[left][split] + dp[split + 1][right] + rangeCost(left, right)
                  if candidate < dp[left][right] {
                      //@step 6
                      dp[left][right] = candidate
                      opt[left][right] = split
                  }
              }
          }
      }

      var trace func(int, int)
      trace = func(left int, right int) {
          if left >= right {
              return
          }

          //@step 7
          split := opt[left][right]
          trace(left, split)
          trace(split + 1, right)
      }

      if len(weights) > 0 {
          trace(0, len(weights) - 1)
      }

      //@step 8
      if len(weights) == 0 {
          return 0
      }
      return dp[0][len(weights) - 1]
  }
  //#endregion knuth

  //#region inf helper collapsed
  func infInt() int {
      return int(^uint(0) >> 1)
  }
  //#endregion inf
  `,
  'go',
);

const KNUTH_RUST = buildStructuredCode(
  `
  /**
   * Optimizes interval merge DP with Knuth's quadrangle-inequality optimization.
   * Input: file weights in merge order.
   * Returns: minimum merge cost.
   */
  //#region knuth function open
  fn knuth_dp(weights: &[i32]) -> i32 {
      let mut prefix = vec![0; weights.len() + 1];
      for index in 0..weights.len() {
          prefix[index + 1] = prefix[index] + weights[index];
      }

      let mut dp = vec![vec![0; weights.len()]; weights.len()];
      let mut opt = vec![vec![0; weights.len()]; weights.len()];

      //@step 2
      for index in 0..weights.len() {
          dp[index][index] = 0;
          opt[index][index] = index;
      }

      for span in 2..=weights.len() {
          for left in 0..=(weights.len() - span) {
              let right = left + span - 1;
              dp[left][right] = i32::MAX;

              let start = opt[left][right - 1];
              let end = opt[left + 1][right];
              for split in start..=end {
                  //@step 5
                  let candidate = dp[left][split] + dp[split + 1][right] + (prefix[right + 1] - prefix[left]);
                  if candidate < dp[left][right] {
                      //@step 6
                      dp[left][right] = candidate;
                      opt[left][right] = split;
                  }
              }
          }
      }

      if !weights.is_empty() {
          trace(&opt, 0, weights.len() - 1);
      }

      //@step 8
      if weights.is_empty() { 0 } else { dp[0][weights.len() - 1] }
  }
  //#endregion knuth

  //#region trace helper collapsed
  fn trace(opt: &[Vec<usize>], left: usize, right: usize) {
      if left >= right {
          return;
      }

      //@step 7
      let split = opt[left][right];
      trace(opt, left, split);
      trace(opt, split + 1, right);
  }
  //#endregion trace
  `,
  'rust',
);

const KNUTH_SWIFT = buildStructuredCode(
  `
  /**
   * Optimizes interval merge DP with Knuth's quadrangle-inequality optimization.
   * Input: file weights in merge order.
   * Returns: minimum merge cost.
   */
  //#region knuth function open
  func knuthDp(_ weights: [Int]) -> Int {
      var prefix = Array(repeating: 0, count: weights.count + 1)
      for index in 0..<weights.count {
          prefix[index + 1] = prefix[index] + weights[index]
      }

      var dp = Array(repeating: Array(repeating: 0, count: weights.count), count: weights.count)
      var opt = Array(repeating: Array(repeating: 0, count: weights.count), count: weights.count)

      //@step 2
      for index in 0..<weights.count {
          dp[index][index] = 0
          opt[index][index] = index
      }

      if weights.count >= 2 {
          for span in 2...weights.count {
              for left in 0...(weights.count - span) {
                  let right = left + span - 1
                  dp[left][right] = Int.max

                  let start = opt[left][right - 1]
                  let end = opt[left + 1][right]
                  for split in start...end {
                      //@step 5
                      let candidate = dp[left][split] + dp[split + 1][right] + (prefix[right + 1] - prefix[left])
                      if candidate < dp[left][right] {
                          //@step 6
                          dp[left][right] = candidate
                          opt[left][right] = split
                      }
                  }
              }
          }
      }

      func trace(_ left: Int, _ right: Int) {
          if left >= right {
              return
          }

          //@step 7
          let split = opt[left][right]
          trace(left, split)
          trace(split + 1, right)
      }

      if !weights.isEmpty {
          trace(0, weights.count - 1)
      }

      //@step 8
      return weights.isEmpty ? 0 : dp[0][weights.count - 1]
  }
  //#endregion knuth
  `,
  'swift',
);

const KNUTH_PHP = buildStructuredCode(
  `
  /**
   * Optimizes interval merge DP with Knuth's quadrangle-inequality optimization.
   * Input: file weights in merge order.
   * Returns: minimum merge cost.
   */
  //#region knuth function open
  function knuthDp(array $weights): int
  {
      $prefix = array_fill(0, count($weights) + 1, 0);
      for ($index = 0; $index < count($weights); $index += 1) {
          $prefix[$index + 1] = $prefix[$index] + $weights[$index];
      }

      $dp = array_fill(0, count($weights), array_fill(0, count($weights), 0));
      $opt = array_fill(0, count($weights), array_fill(0, count($weights), 0));

      //@step 2
      for ($index = 0; $index < count($weights); $index += 1) {
          $dp[$index][$index] = 0;
          $opt[$index][$index] = $index;
      }

      for ($span = 2; $span <= count($weights); $span += 1) {
          for ($left = 0; $left + $span - 1 < count($weights); $left += 1) {
              $right = $left + $span - 1;
              $dp[$left][$right] = PHP_INT_MAX;

              $start = $opt[$left][$right - 1];
              $end = $opt[$left + 1][$right];
              for ($split = $start; $split <= $end; $split += 1) {
                  //@step 5
                  $candidate =
                      $dp[$left][$split] +
                      $dp[$split + 1][$right] +
                      ($prefix[$right + 1] - $prefix[$left]);
                  if ($candidate < $dp[$left][$right]) {
                      //@step 6
                      $dp[$left][$right] = $candidate;
                      $opt[$left][$right] = $split;
                  }
              }
          }
      }

      $trace = null;
      $trace = function (int $left, int $right) use (&$trace, &$opt): void {
          if ($left >= $right) {
              return;
          }

          //@step 7
          $split = $opt[$left][$right];
          $trace($left, $split);
          $trace($split + 1, $right);
      };

      if ($weights !== []) {
          $trace(0, count($weights) - 1);
      }

      //@step 8
      return $weights === [] ? 0 : $dp[0][count($weights) - 1];
  }
  //#endregion knuth
  `,
  'php',
);

const KNUTH_KOTLIN = buildStructuredCode(
  `
  /**
   * Optimizes interval merge DP with Knuth's quadrangle-inequality optimization.
   * Input: file weights in merge order.
   * Returns: minimum merge cost.
   */
  //#region knuth function open
  fun knuthDp(weights: IntArray): Int {
      val prefix = IntArray(weights.size + 1)
      for (index in weights.indices) {
          prefix[index + 1] = prefix[index] + weights[index]
      }

      val dp = Array(weights.size) { IntArray(weights.size) }
      val opt = Array(weights.size) { IntArray(weights.size) }

      //@step 2
      for (index in weights.indices) {
          dp[index][index] = 0
          opt[index][index] = index
      }

      for (span in 2..weights.size) {
          for (left in 0..(weights.size - span)) {
              val right = left + span - 1
              dp[left][right] = Int.MAX_VALUE

              val start = opt[left][right - 1]
              val end = opt[left + 1][right]
              for (split in start..end) {
                  //@step 5
                  val candidate = dp[left][split] + dp[split + 1][right] + (prefix[right + 1] - prefix[left])
                  if (candidate < dp[left][right]) {
                      //@step 6
                      dp[left][right] = candidate
                      opt[left][right] = split
                  }
              }
          }
      }

      fun trace(left: Int, right: Int) {
          if (left >= right) {
              return
          }

          //@step 7
          val split = opt[left][right]
          trace(left, split)
          trace(split + 1, right)
      }

      if (weights.isNotEmpty()) {
          trace(0, weights.size - 1)
      }

      //@step 8
      return if (weights.isEmpty()) 0 else dp[0][weights.size - 1]
  }
  //#endregion knuth
  `,
  'kotlin',
);

export const KNUTH_DP_OPTIMIZATION_CODE = KNUTH_TS.lines;
export const KNUTH_DP_OPTIMIZATION_CODE_REGIONS = KNUTH_TS.regions;
export const KNUTH_DP_OPTIMIZATION_CODE_HIGHLIGHT_MAP = KNUTH_TS.highlightMap;
export const KNUTH_DP_OPTIMIZATION_CODE_VARIANTS: CodeVariantMap = {
  typescript: {
    language: 'typescript',
    lines: KNUTH_TS.lines,
    regions: KNUTH_TS.regions,
    highlightMap: KNUTH_TS.highlightMap,
    source: KNUTH_TS.source,
  },
  javascript: {
    language: 'javascript',
    lines: KNUTH_JS.lines,
    regions: KNUTH_JS.regions,
    highlightMap: KNUTH_JS.highlightMap,
    source: KNUTH_JS.source,
  },
  python: {
    language: 'python',
    lines: KNUTH_PY.lines,
    regions: KNUTH_PY.regions,
    highlightMap: KNUTH_PY.highlightMap,
    source: KNUTH_PY.source,
  },
  csharp: {
    language: 'csharp',
    lines: KNUTH_CS.lines,
    regions: KNUTH_CS.regions,
    highlightMap: KNUTH_CS.highlightMap,
    source: KNUTH_CS.source,
  },
  java: {
    language: 'java',
    lines: KNUTH_JAVA.lines,
    regions: KNUTH_JAVA.regions,
    highlightMap: KNUTH_JAVA.highlightMap,
    source: KNUTH_JAVA.source,
  },
  cpp: {
    language: 'cpp',
    lines: KNUTH_CPP.lines,
    regions: KNUTH_CPP.regions,
    highlightMap: KNUTH_CPP.highlightMap,
    source: KNUTH_CPP.source,
  },
  go: {
    language: 'go',
    lines: KNUTH_GO.lines,
    regions: KNUTH_GO.regions,
    highlightMap: KNUTH_GO.highlightMap,
    source: KNUTH_GO.source,
  },
  rust: {
    language: 'rust',
    lines: KNUTH_RUST.lines,
    regions: KNUTH_RUST.regions,
    highlightMap: KNUTH_RUST.highlightMap,
    source: KNUTH_RUST.source,
  },
  swift: {
    language: 'swift',
    lines: KNUTH_SWIFT.lines,
    regions: KNUTH_SWIFT.regions,
    highlightMap: KNUTH_SWIFT.highlightMap,
    source: KNUTH_SWIFT.source,
  },
  php: {
    language: 'php',
    lines: KNUTH_PHP.lines,
    regions: KNUTH_PHP.regions,
    highlightMap: KNUTH_PHP.highlightMap,
    source: KNUTH_PHP.source,
  },
  kotlin: {
    language: 'kotlin',
    lines: KNUTH_KOTLIN.lines,
    regions: KNUTH_KOTLIN.regions,
    highlightMap: KNUTH_KOTLIN.highlightMap,
    source: KNUTH_KOTLIN.source,
  },
};
