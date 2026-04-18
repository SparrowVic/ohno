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

export const BURST_BALLOONS_CODE = BURST_BALLOONS_TS.lines;
export const BURST_BALLOONS_CODE_REGIONS = BURST_BALLOONS_TS.regions;
export const BURST_BALLOONS_CODE_HIGHLIGHT_MAP = BURST_BALLOONS_TS.highlightMap;
export const BURST_BALLOONS_CODE_VARIANTS: CodeVariantMap = {
  typescript: { language: 'typescript', lines: BURST_BALLOONS_TS.lines, regions: BURST_BALLOONS_TS.regions, highlightMap: BURST_BALLOONS_TS.highlightMap, source: BURST_BALLOONS_TS.source },
  python: { language: 'python', lines: BURST_BALLOONS_PY.lines, regions: BURST_BALLOONS_PY.regions, highlightMap: BURST_BALLOONS_PY.highlightMap, source: BURST_BALLOONS_PY.source },
  csharp: { language: 'csharp', lines: BURST_BALLOONS_CS.lines, regions: BURST_BALLOONS_CS.regions, highlightMap: BURST_BALLOONS_CS.highlightMap, source: BURST_BALLOONS_CS.source },
  java: { language: 'java', lines: BURST_BALLOONS_JAVA.lines, regions: BURST_BALLOONS_JAVA.regions, highlightMap: BURST_BALLOONS_JAVA.highlightMap, source: BURST_BALLOONS_JAVA.source },
  cpp: { language: 'cpp', lines: BURST_BALLOONS_CPP.lines, regions: BURST_BALLOONS_CPP.regions, highlightMap: BURST_BALLOONS_CPP.highlightMap, source: BURST_BALLOONS_CPP.source },
};
