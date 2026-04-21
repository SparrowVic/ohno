import { CodeVariantMap } from '../models/detail';
import { buildStructuredCode } from './code-line-builder/code-line-builder';

const BURST_BALLOONS_TS = buildStructuredCode(`
  /**
   * Compute the maximum coins obtainable by bursting balloons in optimal order.
   * Input: balloon values.
   * Returns: maximum coin count and the last-burst choice table.
   */
  //#region burst-balloons function open
  function burstBalloons(values: number[]): { maxCoins: number; choice: number[][] } {
    //@step 2
    const padded = [1, ...values, 1];
    const count = values.length;
    const dp = Array.from({ length: count + 2 }, () =>
      Array.from({ length: count + 2 }, () => 0),
    );
    const choice = Array.from({ length: count + 2 }, () =>
      Array.from({ length: count + 2 }, () => -1),
    );

    for (let span = 1; span <= count; span += 1) {
      for (let left = 1; left + span - 1 <= count; left += 1) {
        const right = left + span - 1;
        let best = 0;

        for (let last = left; last <= right; last += 1) {
          //@step 6
          const candidate =
            dp[left][last - 1] +
            padded[left - 1] * padded[last] * padded[right + 1] +
            dp[last + 1][right];

          if (candidate > best) {
            best = candidate;
            choice[left][right] = last;
          }
        }

        //@step 9
        dp[left][right] = best;
      }
    }

    function trace(left: number, right: number): void {
      if (left > right) {
        return;
      }

      //@step 10
      const last = choice[left][right];
      trace(left, last - 1);
      trace(last + 1, right);
    }

    if (count > 0) {
      trace(1, count);
    }

    //@step 11
    return { maxCoins: dp[1][count], choice };
  }
  //#endregion burst-balloons
`);

const BURST_BALLOONS_PY = buildStructuredCode(
  `
  """
  Compute the maximum coins obtainable by bursting balloons in optimal order.
  Input: balloon values.
  Returns: maximum coin count and the last-burst choice table.
  """
  //#region burst-balloons function open
  def burst_balloons(values: list[int]) -> dict[str, object]:
      //@step 2
      padded = [1, *values, 1]
      count = len(values)
      dp = [[0] * (count + 2) for _ in range(count + 2)]
      choice = [[-1] * (count + 2) for _ in range(count + 2)]

      for span in range(1, count + 1):
          for left in range(1, count - span + 2):
              right = left + span - 1
              best = 0

              for last in range(left, right + 1):
                  //@step 6
                  candidate = (
                      dp[left][last - 1] +
                      padded[left - 1] * padded[last] * padded[right + 1] +
                      dp[last + 1][right]
                  )

                  if candidate > best:
                      best = candidate
                      choice[left][right] = last

              //@step 9
              dp[left][right] = best

      def trace(left: int, right: int) -> None:
          if left > right:
              return

          //@step 10
          last = choice[left][right]
          trace(left, last - 1)
          trace(last + 1, right)

      if count > 0:
          trace(1, count)

      //@step 11
      return {"max_coins": dp[1][count] if count > 0 else 0, "choice": choice}
  //#endregion burst-balloons
  `,
  'python',
);

const BURST_BALLOONS_CS = buildStructuredCode(
  `
  using System;

  /// <summary>
  /// Computes the maximum coins obtainable by bursting balloons in optimal order.
  /// Input: balloon values.
  /// Returns: maximum coin count and the last-burst choice table.
  /// </summary>
  //#region burst-balloons function open
  public static (int MaxCoins, int[,] Choice) BurstBalloons(int[] values)
  {
      //@step 2
      var padded = new int[values.Length + 2];
      padded[0] = 1;
      padded[^1] = 1;
      for (var index = 0; index < values.Length; index += 1)
      {
          padded[index + 1] = values[index];
      }

      var count = values.Length;
      var dp = new int[count + 2, count + 2];
      var choice = new int[count + 2, count + 2];
      for (var row = 0; row < count + 2; row += 1)
      {
          for (var col = 0; col < count + 2; col += 1)
          {
              choice[row, col] = -1;
          }
      }

      for (var span = 1; span <= count; span += 1)
      {
          for (var left = 1; left + span - 1 <= count; left += 1)
          {
              var right = left + span - 1;
              var best = 0;

              for (var last = left; last <= right; last += 1)
              {
                  //@step 6
                  var candidate =
                      dp[left, last - 1] +
                      padded[left - 1] * padded[last] * padded[right + 1] +
                      dp[last + 1, right];

                  if (candidate > best)
                  {
                      best = candidate;
                      choice[left, right] = last;
                  }
              }

              //@step 9
              dp[left, right] = best;
          }
      }

      void Trace(int left, int right)
      {
          if (left > right)
          {
              return;
          }

          //@step 10
          var last = choice[left, right];
          Trace(left, last - 1);
          Trace(last + 1, right);
      }

      if (count > 0)
      {
          Trace(1, count);
      }

      //@step 11
      return (count > 0 ? dp[1, count] : 0, choice);
  }
  //#endregion burst-balloons
  `,
  'csharp',
);

const BURST_BALLOONS_JAVA = buildStructuredCode(
  `
  /**
   * Computes the maximum coins obtainable by bursting balloons in optimal order.
   * Input: balloon values.
   * Returns: maximum coin count and the last-burst choice table.
   */
  //#region burst-balloons function open
  public static BurstBalloonsResult burstBalloons(int[] values) {
      //@step 2
      int[] padded = new int[values.length + 2];
      padded[0] = 1;
      padded[padded.length - 1] = 1;
      for (int index = 0; index < values.length; index += 1) {
          padded[index + 1] = values[index];
      }

      int count = values.length;
      int[][] dp = new int[count + 2][count + 2];
      int[][] choice = new int[count + 2][count + 2];
      for (int row = 0; row < count + 2; row += 1) {
          for (int col = 0; col < count + 2; col += 1) {
              choice[row][col] = -1;
          }
      }

      for (int span = 1; span <= count; span += 1) {
          for (int left = 1; left + span - 1 <= count; left += 1) {
              int right = left + span - 1;
              int best = 0;

              for (int last = left; last <= right; last += 1) {
                  //@step 6
                  int candidate =
                      dp[left][last - 1] +
                      padded[left - 1] * padded[last] * padded[right + 1] +
                      dp[last + 1][right];

                  if (candidate > best) {
                      best = candidate;
                      choice[left][right] = last;
                  }
              }

              //@step 9
              dp[left][right] = best;
          }
      }

      if (count > 0) {
          trace(choice, 1, count);
      }

      //@step 11
      return new BurstBalloonsResult(count > 0 ? dp[1][count] : 0, choice);
  }
  //#endregion burst-balloons

  //#region trace helper collapsed
  private static void trace(int[][] choice, int left, int right) {
      if (left > right) {
          return;
      }

      //@step 10
      int last = choice[left][right];
      trace(choice, left, last - 1);
      trace(choice, last + 1, right);
  }

  public record BurstBalloonsResult(int maxCoins, int[][] choice) {}
  //#endregion trace
  `,
  'java',
);

const BURST_BALLOONS_CPP = buildStructuredCode(
  `
  #include <vector>

  struct BurstBalloonsResult {
      int maxCoins;
      std::vector<std::vector<int>> choice;
  };

  /**
   * Computes the maximum coins obtainable by bursting balloons in optimal order.
   * Input: balloon values.
   * Returns: maximum coin count and the last-burst choice table.
   */
  //#region burst-balloons function open
  BurstBalloonsResult burstBalloons(const std::vector<int>& values) {
      //@step 2
      std::vector<int> padded(values.size() + 2, 1);
      for (std::size_t index = 0; index < values.size(); index += 1) {
          padded[index + 1] = values[index];
      }

      int count = static_cast<int>(values.size());
      std::vector<std::vector<int>> dp(count + 2, std::vector<int>(count + 2, 0));
      std::vector<std::vector<int>> choice(count + 2, std::vector<int>(count + 2, -1));

      for (int span = 1; span <= count; span += 1) {
          for (int left = 1; left + span - 1 <= count; left += 1) {
              int right = left + span - 1;
              int best = 0;

              for (int last = left; last <= right; last += 1) {
                  //@step 6
                  int candidate =
                      dp[left][last - 1] +
                      padded[left - 1] * padded[last] * padded[right + 1] +
                      dp[last + 1][right];

                  if (candidate > best) {
                      best = candidate;
                      choice[left][right] = last;
                  }
              }

              //@step 9
              dp[left][right] = best;
          }
      }

      if (count > 0) {
          trace(choice, 1, count);
      }

      //@step 11
      return {count > 0 ? dp[1][count] : 0, choice};
  }
  //#endregion burst-balloons

  //#region trace helper collapsed
  void trace(const std::vector<std::vector<int>>& choice, int left, int right) {
      if (left > right) {
          return;
      }

      //@step 10
      int last = choice[left][right];
      trace(choice, left, last - 1);
      trace(choice, last + 1, right);
  }
  //#endregion trace
  `,
  'cpp',
);

const BURST_BALLOONS_JS = buildStructuredCode(
  `
  /**
   * Compute the maximum coins obtainable by bursting balloons in optimal order.
   * Input: balloon values.
   * Returns: maximum coin count and the last-burst choice table.
   */
  //#region burst-balloons function open
  function burstBalloons(values) {
      //@step 2
      const padded = [1, ...values, 1];
      const count = values.length;
      const dp = Array.from({ length: count + 2 }, () =>
          Array.from({ length: count + 2 }, () => 0),
      );
      const choice = Array.from({ length: count + 2 }, () =>
          Array.from({ length: count + 2 }, () => -1),
      );

      for (let span = 1; span <= count; span += 1) {
          for (let left = 1; left + span - 1 <= count; left += 1) {
              const right = left + span - 1;
              let best = 0;

              for (let last = left; last <= right; last += 1) {
                  //@step 6
                  const candidate =
                      dp[left][last - 1] +
                      padded[left - 1] * padded[last] * padded[right + 1] +
                      dp[last + 1][right];

                  if (candidate > best) {
                      best = candidate;
                      choice[left][right] = last;
                  }
              }

              //@step 9
              dp[left][right] = best;
          }
      }

      function trace(left, right) {
          if (left > right) {
              return;
          }

          //@step 10
          const last = choice[left][right];
          trace(left, last - 1);
          trace(last + 1, right);
      }

      if (count > 0) {
          trace(1, count);
      }

      //@step 11
      return { maxCoins: count > 0 ? dp[1][count] : 0, choice };
  }
  //#endregion burst-balloons
  `,
  'javascript',
);

const BURST_BALLOONS_GO = buildStructuredCode(
  `
  package dp

  //#region burst-balloons-result interface collapsed
  type BurstBalloonsResult struct {
      MaxCoins int
      Choice [][]int
  }
  //#endregion burst-balloons-result

  /**
   * Computes the maximum coins obtainable by bursting balloons in optimal order.
   * Input: balloon values.
   * Returns: maximum coin count and the last-burst choice table.
   */
  //#region burst-balloons function open
  func BurstBalloons(values []int) BurstBalloonsResult {
      //@step 2
      padded := append([]int{1}, values...)
      padded = append(padded, 1)
      count := len(values)
      dp := make([][]int, count + 2)
      choice := make([][]int, count + 2)
      for row := 0; row < count + 2; row += 1 {
          dp[row] = make([]int, count + 2)
          choice[row] = make([]int, count + 2)
          for col := 0; col < count + 2; col += 1 {
              choice[row][col] = -1
          }
      }

      for span := 1; span <= count; span += 1 {
          for left := 1; left + span - 1 <= count; left += 1 {
              right := left + span - 1
              best := 0

              for last := left; last <= right; last += 1 {
                  //@step 6
                  candidate :=
                      dp[left][last - 1] +
                      padded[left - 1] * padded[last] * padded[right + 1] +
                      dp[last + 1][right]

                  if candidate > best {
                      best = candidate
                      choice[left][right] = last
                  }
              }

              //@step 9
              dp[left][right] = best
          }
      }

      var trace func(int, int)
      trace = func(left int, right int) {
          if left > right {
              return
          }

          //@step 10
          last := choice[left][right]
          trace(left, last - 1)
          trace(last + 1, right)
      }

      if count > 0 {
          trace(1, count)
      }

      //@step 11
      if count == 0 {
          return BurstBalloonsResult{MaxCoins: 0, Choice: choice}
      }
      return BurstBalloonsResult{MaxCoins: dp[1][count], Choice: choice}
  }
  //#endregion burst-balloons
  `,
  'go',
);

const BURST_BALLOONS_RUST = buildStructuredCode(
  `
  //#region burst-balloons-result interface collapsed
  struct BurstBalloonsResult {
      max_coins: i32,
      choice: Vec<Vec<i32>>,
  }
  //#endregion burst-balloons-result

  /**
   * Computes the maximum coins obtainable by bursting balloons in optimal order.
   * Input: balloon values.
   * Returns: maximum coin count and the last-burst choice table.
   */
  //#region burst-balloons function open
  fn burst_balloons(values: &[i32]) -> BurstBalloonsResult {
      //@step 2
      let mut padded = vec![1];
      padded.extend_from_slice(values);
      padded.push(1);
      let count = values.len();
      let mut dp = vec![vec![0; count + 2]; count + 2];
      let mut choice = vec![vec![-1; count + 2]; count + 2];

      for span in 1..=count {
          for left in 1..=(count - span + 1) {
              let right = left + span - 1;
              let mut best = 0;

              for last in left..=right {
                  //@step 6
                  let candidate =
                      dp[left][last - 1] +
                      padded[left - 1] * padded[last] * padded[right + 1] +
                      dp[last + 1][right];

                  if candidate > best {
                      best = candidate;
                      choice[left][right] = last as i32;
                  }
              }

              //@step 9
              dp[left][right] = best;
          }
      }

      if count > 0 {
          trace(&choice, 1, count);
      }

      //@step 11
      BurstBalloonsResult {
          max_coins: if count > 0 { dp[1][count] } else { 0 },
          choice,
      }
  }
  //#endregion burst-balloons

  //#region trace helper collapsed
  fn trace(choice: &[Vec<i32>], left: usize, right: usize) {
      if left > right {
          return;
      }

      //@step 10
      let last = choice[left][right] as usize;
      trace(choice, left, last - 1);
      trace(choice, last + 1, right);
  }
  //#endregion trace
  `,
  'rust',
);

const BURST_BALLOONS_SWIFT = buildStructuredCode(
  `
  //#region burst-balloons-result interface collapsed
  struct BurstBalloonsResult {
      let maxCoins: Int
      let choice: [[Int]]
  }
  //#endregion burst-balloons-result

  /**
   * Computes the maximum coins obtainable by bursting balloons in optimal order.
   * Input: balloon values.
   * Returns: maximum coin count and the last-burst choice table.
   */
  //#region burst-balloons function open
  func burstBalloons(_ values: [Int]) -> BurstBalloonsResult {
      //@step 2
      let padded = [1] + values + [1]
      let count = values.count
      var dp = Array(repeating: Array(repeating: 0, count: count + 2), count: count + 2)
      var choice = Array(repeating: Array(repeating: -1, count: count + 2), count: count + 2)

      for span in 1...count {
          for left in 1...(count - span + 1) {
              let right = left + span - 1
              var best = 0

              for last in left...right {
                  //@step 6
                  let candidate =
                      dp[left][last - 1] +
                      padded[left - 1] * padded[last] * padded[right + 1] +
                      dp[last + 1][right]

                  if candidate > best {
                      best = candidate
                      choice[left][right] = last
                  }
              }

              //@step 9
              dp[left][right] = best
          }
      }

      func trace(_ left: Int, _ right: Int) {
          if left > right {
              return
          }

          //@step 10
          let last = choice[left][right]
          trace(left, last - 1)
          trace(last + 1, right)
      }

      if count > 0 {
          trace(1, count)
      }

      //@step 11
      return BurstBalloonsResult(maxCoins: count > 0 ? dp[1][count] : 0, choice: choice)
  }
  //#endregion burst-balloons
  `,
  'swift',
);

const BURST_BALLOONS_PHP = buildStructuredCode(
  `
  /**
   * Computes the maximum coins obtainable by bursting balloons in optimal order.
   * Input: balloon values.
   * Returns: maximum coin count and the last-burst choice table.
   */
  //#region burst-balloons function open
  function burstBalloons(array $values): array
  {
      //@step 2
      $padded = [1, ...$values, 1];
      $count = count($values);
      $dp = array_fill(0, $count + 2, array_fill(0, $count + 2, 0));
      $choice = array_fill(0, $count + 2, array_fill(0, $count + 2, -1));

      for ($span = 1; $span <= $count; $span += 1) {
          for ($left = 1; $left + $span - 1 <= $count; $left += 1) {
              $right = $left + $span - 1;
              $best = 0;

              for ($last = $left; $last <= $right; $last += 1) {
                  //@step 6
                  $candidate =
                      $dp[$left][$last - 1] +
                      $padded[$left - 1] * $padded[$last] * $padded[$right + 1] +
                      $dp[$last + 1][$right];

                  if ($candidate > $best) {
                      $best = $candidate;
                      $choice[$left][$right] = $last;
                  }
              }

              //@step 9
              $dp[$left][$right] = $best;
          }
      }

      $trace = null;
      $trace = function (int $left, int $right) use (&$trace, &$choice): void {
          if ($left > $right) {
              return;
          }

          //@step 10
          $last = $choice[$left][$right];
          $trace($left, $last - 1);
          $trace($last + 1, $right);
      };

      if ($count > 0) {
          $trace(1, $count);
      }

      //@step 11
      return ['maxCoins' => $count > 0 ? $dp[1][$count] : 0, 'choice' => $choice];
  }
  //#endregion burst-balloons
  `,
  'php',
);

const BURST_BALLOONS_KOTLIN = buildStructuredCode(
  `
  //#region burst-balloons-result interface collapsed
  data class BurstBalloonsResult(
      val maxCoins: Int,
      val choice: Array<IntArray>,
  )
  //#endregion burst-balloons-result

  /**
   * Computes the maximum coins obtainable by bursting balloons in optimal order.
   * Input: balloon values.
   * Returns: maximum coin count and the last-burst choice table.
   */
  //#region burst-balloons function open
  fun burstBalloons(values: IntArray): BurstBalloonsResult {
      //@step 2
      val padded = IntArray(values.size + 2)
      padded[0] = 1
      padded[padded.lastIndex] = 1
      for (index in values.indices) {
          padded[index + 1] = values[index]
      }

      val count = values.size
      val dp = Array(count + 2) { IntArray(count + 2) }
      val choice = Array(count + 2) { IntArray(count + 2) { -1 } }

      for (span in 1..count) {
          for (left in 1..(count - span + 1)) {
              val right = left + span - 1
              var best = 0

              for (last in left..right) {
                  //@step 6
                  val candidate =
                      dp[left][last - 1] +
                      padded[left - 1] * padded[last] * padded[right + 1] +
                      dp[last + 1][right]

                  if (candidate > best) {
                      best = candidate
                      choice[left][right] = last
                  }
              }

              //@step 9
              dp[left][right] = best
          }
      }

      fun trace(left: Int, right: Int) {
          if (left > right) {
              return
          }

          //@step 10
          val last = choice[left][right]
          trace(left, last - 1)
          trace(last + 1, right)
      }

      if (count > 0) {
          trace(1, count)
      }

      //@step 11
      return BurstBalloonsResult(maxCoins = if (count > 0) dp[1][count] else 0, choice = choice)
  }
  //#endregion burst-balloons
  `,
  'kotlin',
);

export const BURST_BALLOONS_CODE = BURST_BALLOONS_TS.lines;
export const BURST_BALLOONS_CODE_REGIONS = BURST_BALLOONS_TS.regions;
export const BURST_BALLOONS_CODE_HIGHLIGHT_MAP = BURST_BALLOONS_TS.highlightMap;
export const BURST_BALLOONS_CODE_VARIANTS: CodeVariantMap = {
  typescript: {
    language: 'typescript',
    lines: BURST_BALLOONS_TS.lines,
    regions: BURST_BALLOONS_TS.regions,
    highlightMap: BURST_BALLOONS_TS.highlightMap,
    source: BURST_BALLOONS_TS.source,
  },
  javascript: {
    language: 'javascript',
    lines: BURST_BALLOONS_JS.lines,
    regions: BURST_BALLOONS_JS.regions,
    highlightMap: BURST_BALLOONS_JS.highlightMap,
    source: BURST_BALLOONS_JS.source,
  },
  python: {
    language: 'python',
    lines: BURST_BALLOONS_PY.lines,
    regions: BURST_BALLOONS_PY.regions,
    highlightMap: BURST_BALLOONS_PY.highlightMap,
    source: BURST_BALLOONS_PY.source,
  },
  csharp: {
    language: 'csharp',
    lines: BURST_BALLOONS_CS.lines,
    regions: BURST_BALLOONS_CS.regions,
    highlightMap: BURST_BALLOONS_CS.highlightMap,
    source: BURST_BALLOONS_CS.source,
  },
  java: {
    language: 'java',
    lines: BURST_BALLOONS_JAVA.lines,
    regions: BURST_BALLOONS_JAVA.regions,
    highlightMap: BURST_BALLOONS_JAVA.highlightMap,
    source: BURST_BALLOONS_JAVA.source,
  },
  cpp: {
    language: 'cpp',
    lines: BURST_BALLOONS_CPP.lines,
    regions: BURST_BALLOONS_CPP.regions,
    highlightMap: BURST_BALLOONS_CPP.highlightMap,
    source: BURST_BALLOONS_CPP.source,
  },
  go: {
    language: 'go',
    lines: BURST_BALLOONS_GO.lines,
    regions: BURST_BALLOONS_GO.regions,
    highlightMap: BURST_BALLOONS_GO.highlightMap,
    source: BURST_BALLOONS_GO.source,
  },
  rust: {
    language: 'rust',
    lines: BURST_BALLOONS_RUST.lines,
    regions: BURST_BALLOONS_RUST.regions,
    highlightMap: BURST_BALLOONS_RUST.highlightMap,
    source: BURST_BALLOONS_RUST.source,
  },
  swift: {
    language: 'swift',
    lines: BURST_BALLOONS_SWIFT.lines,
    regions: BURST_BALLOONS_SWIFT.regions,
    highlightMap: BURST_BALLOONS_SWIFT.highlightMap,
    source: BURST_BALLOONS_SWIFT.source,
  },
  php: {
    language: 'php',
    lines: BURST_BALLOONS_PHP.lines,
    regions: BURST_BALLOONS_PHP.regions,
    highlightMap: BURST_BALLOONS_PHP.highlightMap,
    source: BURST_BALLOONS_PHP.source,
  },
  kotlin: {
    language: 'kotlin',
    lines: BURST_BALLOONS_KOTLIN.lines,
    regions: BURST_BALLOONS_KOTLIN.regions,
    highlightMap: BURST_BALLOONS_KOTLIN.highlightMap,
    source: BURST_BALLOONS_KOTLIN.source,
  },
};
