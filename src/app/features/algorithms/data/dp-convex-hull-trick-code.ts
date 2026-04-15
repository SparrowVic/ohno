import { CodeVariantMap } from '../models/detail';
import { buildStructuredCode } from './code-line-builder';

const CHT_TS = buildStructuredCode(`
  //#region line interface collapsed
  interface Line {
    readonly slope: number;
    readonly intercept: number;
    readonly index: number;
  }
  //#endregion line

  /**
   * Optimize a quadratic DP recurrence with a monotone convex hull trick.
   * Input: non-decreasing x values.
   * Returns: optimized dp values.
   */
  //#region cht function open
  function dpCht(x: number[]): number[] {
    if (x.length === 0) {
      return [];
    }

    const dp = Array.from({ length: x.length }, () => 0);
    const parent = Array.from({ length: x.length }, () => -1);
    const hull: Line[] = [];

    //@step 2
    hull.push({ slope: -2 * x[0], intercept: x[0] * x[0], index: 0 });

    for (let index = 1; index < x.length; index += 1) {
      //@step 5
      while (hull.length >= 2 && valueAt(hull[0], x[index]) >= valueAt(hull[1], x[index])) {
        hull.shift();
      }

      //@step 6
      const bestLine = hull[0];
      dp[index] = x[index] * x[index] + valueAt(bestLine, x[index]);
      parent[index] = bestLine.index;

      const nextLine = {
        slope: -2 * x[index],
        intercept: dp[index] + x[index] * x[index],
        index,
      };

      //@step 7
      while (hull.length >= 2 && isObsolete(hull[hull.length - 2], hull[hull.length - 1], nextLine)) {
        hull.pop();
      }

      //@step 8
      hull.push(nextLine);
    }

    let index = x.length - 1;
    while (index > 0 && parent[index] !== -1) {
      //@step 9
      index = parent[index];
    }

    //@step 10
    return dp;
  }
  //#endregion cht

  //#region hull helper collapsed
  function valueAt(line: Line, xValue: number): number {
    return line.slope * xValue + line.intercept;
  }

  function isObsolete(first: Line, second: Line, third: Line): boolean {
    return (
      (second.intercept - first.intercept) * (first.slope - third.slope) >=
      (third.intercept - first.intercept) * (first.slope - second.slope)
    );
  }
  //#endregion hull
`);

const CHT_PY = buildStructuredCode(
  `
  """
  Optimize a quadratic DP recurrence with a monotone convex hull trick.
  Input: non-decreasing x values.
  Returns: optimized dp values.
  """
  //#region cht function open
  def dp_cht(x: list[int]) -> list[int]:
      if not x:
          return []

      dp = [0] * len(x)
      parent = [-1] * len(x)
      hull: list[tuple[int, int, int]] = []

      //@step 2
      hull.append((-2 * x[0], x[0] * x[0], 0))

      for index in range(1, len(x)):
          //@step 5
          while len(hull) >= 2 and value_at(hull[0], x[index]) >= value_at(hull[1], x[index]):
              hull.pop(0)

          //@step 6
          slope, intercept, best_index = hull[0]
          dp[index] = x[index] * x[index] + value_at((slope, intercept, best_index), x[index])
          parent[index] = best_index

          next_line = (-2 * x[index], dp[index] + x[index] * x[index], index)

          //@step 7
          while len(hull) >= 2 and is_obsolete(hull[-2], hull[-1], next_line):
              hull.pop()

          //@step 8
          hull.append(next_line)

      index = len(x) - 1
      while index > 0 and parent[index] != -1:
          //@step 9
          index = parent[index]

      //@step 10
      return dp
  //#endregion cht

  //#region hull helper collapsed
  def value_at(line: tuple[int, int, int], x_value: int) -> int:
      slope, intercept, _ = line
      return slope * x_value + intercept

  def is_obsolete(first: tuple[int, int, int], second: tuple[int, int, int], third: tuple[int, int, int]) -> bool:
      return (
          (second[1] - first[1]) * (first[0] - third[0]) >=
          (third[1] - first[1]) * (first[0] - second[0])
      )
  //#endregion hull
  `,
  'python',
);

const CHT_CS = buildStructuredCode(
  `
  using System.Collections.Generic;

  //#region line interface collapsed
  public sealed class Line
  {
      public required long Slope { get; init; }
      public required long Intercept { get; init; }
      public required int Index { get; init; }
  }
  //#endregion line

  /// <summary>
  /// Optimizes a quadratic DP recurrence with a monotone convex hull trick.
  /// Input: non-decreasing x values.
  /// Returns: optimized dp values.
  /// </summary>
  //#region cht function open
  public static long[] DpCht(int[] x)
  {
      if (x.Length == 0)
      {
          return [];
      }

      var dp = new long[x.Length];
      var parent = new int[x.Length];
      var hull = new LinkedList<Line>();
      System.Array.Fill(parent, -1);

      //@step 2
      hull.AddLast(new Line { Slope = -2L * x[0], Intercept = 1L * x[0] * x[0], Index = 0 });

      for (var index = 1; index < x.Length; index += 1)
      {
          //@step 5
          while (hull.Count >= 2 && ValueAt(hull.First!.Value, x[index]) >= ValueAt(hull.First!.Next!.Value, x[index]))
          {
              hull.RemoveFirst();
          }

          //@step 6
          var bestLine = hull.First!.Value;
          dp[index] = 1L * x[index] * x[index] + ValueAt(bestLine, x[index]);
          parent[index] = bestLine.Index;

          var nextLine = new Line
          {
              Slope = -2L * x[index],
              Intercept = dp[index] + 1L * x[index] * x[index],
              Index = index,
          };

          //@step 7
          while (hull.Count >= 2 && IsObsolete(hull.Last!.Previous!.Value, hull.Last!.Value, nextLine))
          {
              hull.RemoveLast();
          }

          //@step 8
          hull.AddLast(nextLine);
      }

      var current = x.Length - 1;
      while (current > 0 && parent[current] != -1)
      {
          //@step 9
          current = parent[current];
      }

      //@step 10
      return dp;
  }
  //#endregion cht

  //#region hull helper collapsed
  private static long ValueAt(Line line, long xValue) => line.Slope * xValue + line.Intercept;

  private static bool IsObsolete(Line first, Line second, Line third)
  {
      return
          (second.Intercept - first.Intercept) * (first.Slope - third.Slope) >=
          (third.Intercept - first.Intercept) * (first.Slope - second.Slope);
  }
  //#endregion hull
  `,
  'csharp',
);

const CHT_JAVA = buildStructuredCode(
  `
  import java.util.ArrayDeque;
  import java.util.Deque;

  //#region line interface collapsed
  public record Line(long slope, long intercept, int index) {}
  //#endregion line

  /**
   * Optimizes a quadratic DP recurrence with a monotone convex hull trick.
   * Input: non-decreasing x values.
   * Returns: optimized dp values.
   */
  //#region cht function open
  public static long[] dpCht(int[] x) {
      if (x.length == 0) {
          return new long[0];
      }

      long[] dp = new long[x.length];
      int[] parent = new int[x.length];
      java.util.Arrays.fill(parent, -1);
      Deque<Line> hull = new ArrayDeque<>();

      //@step 2
      hull.addLast(new Line(-2L * x[0], 1L * x[0] * x[0], 0));

      for (int index = 1; index < x.length; index += 1) {
          //@step 5
          while (hull.size() >= 2) {
              Line first = hull.removeFirst();
              Line second = hull.peekFirst();
              if (valueAt(first, x[index]) < valueAt(second, x[index])) {
                  hull.addFirst(first);
                  break;
              }
          }

          //@step 6
          Line bestLine = hull.peekFirst();
          dp[index] = 1L * x[index] * x[index] + valueAt(bestLine, x[index]);
          parent[index] = bestLine.index();

          Line nextLine = new Line(-2L * x[index], dp[index] + 1L * x[index] * x[index], index);

          //@step 7
          while (hull.size() >= 2) {
              Line last = hull.removeLast();
              Line beforeLast = hull.peekLast();
              if (!isObsolete(beforeLast, last, nextLine)) {
                  hull.addLast(last);
                  break;
              }
          }

          //@step 8
          hull.addLast(nextLine);
      }

      int index = x.length - 1;
      while (index > 0 && parent[index] != -1) {
          //@step 9
          index = parent[index];
      }

      //@step 10
      return dp;
  }
  //#endregion cht

  //#region hull helper collapsed
  private static long valueAt(Line line, long xValue) {
      return line.slope() * xValue + line.intercept();
  }

  private static boolean isObsolete(Line first, Line second, Line third) {
      return
          (second.intercept() - first.intercept()) * (first.slope() - third.slope()) >=
          (third.intercept() - first.intercept()) * (first.slope() - second.slope());
  }
  //#endregion hull
  `,
  'java',
);

const CHT_CPP = buildStructuredCode(
  `
  #include <deque>
  #include <vector>

  struct Line {
      long long slope;
      long long intercept;
      int index;
  };

  /**
   * Optimizes a quadratic DP recurrence with a monotone convex hull trick.
   * Input: non-decreasing x values.
   * Returns: optimized dp values.
   */
  //#region cht function open
  std::vector<long long> dpCht(const std::vector<int>& x) {
      if (x.empty()) {
          return {};
      }

      std::vector<long long> dp(x.size(), 0);
      std::vector<int> parent(x.size(), -1);
      std::deque<Line> hull;

      //@step 2
      hull.push_back(Line{-2LL * x[0], 1LL * x[0] * x[0], 0});

      for (int index = 1; index < static_cast<int>(x.size()); index += 1) {
          //@step 5
          while (hull.size() >= 2 && valueAt(hull[0], x[index]) >= valueAt(hull[1], x[index])) {
              hull.pop_front();
          }

          //@step 6
          Line bestLine = hull.front();
          dp[index] = 1LL * x[index] * x[index] + valueAt(bestLine, x[index]);
          parent[index] = bestLine.index;

          Line nextLine{-2LL * x[index], dp[index] + 1LL * x[index] * x[index], index};

          //@step 7
          while (hull.size() >= 2 && isObsolete(hull[hull.size() - 2], hull.back(), nextLine)) {
              hull.pop_back();
          }

          //@step 8
          hull.push_back(nextLine);
      }

      int index = static_cast<int>(x.size()) - 1;
      while (index > 0 && parent[index] != -1) {
          //@step 9
          index = parent[index];
      }

      //@step 10
      return dp;
  }
  //#endregion cht

  //#region hull helper collapsed
  long long valueAt(const Line& line, long long xValue) {
      return line.slope * xValue + line.intercept;
  }

  bool isObsolete(const Line& first, const Line& second, const Line& third) {
      return
          (second.intercept - first.intercept) * (first.slope - third.slope) >=
          (third.intercept - first.intercept) * (first.slope - second.slope);
  }
  //#endregion hull
  `,
  'cpp',
);

export const DP_CONVEX_HULL_TRICK_CODE = CHT_TS.lines;
export const DP_CONVEX_HULL_TRICK_CODE_REGIONS = CHT_TS.regions;
export const DP_CONVEX_HULL_TRICK_CODE_HIGHLIGHT_MAP = CHT_TS.highlightMap;
export const DP_CONVEX_HULL_TRICK_CODE_VARIANTS: CodeVariantMap = {
  typescript: { language: 'typescript', lines: CHT_TS.lines, regions: CHT_TS.regions, highlightMap: CHT_TS.highlightMap, source: CHT_TS.source },
  python: { language: 'python', lines: CHT_PY.lines, regions: CHT_PY.regions, highlightMap: CHT_PY.highlightMap, source: CHT_PY.source },
  csharp: { language: 'csharp', lines: CHT_CS.lines, regions: CHT_CS.regions, highlightMap: CHT_CS.highlightMap, source: CHT_CS.source },
  java: { language: 'java', lines: CHT_JAVA.lines, regions: CHT_JAVA.regions, highlightMap: CHT_JAVA.highlightMap, source: CHT_JAVA.source },
  cpp: { language: 'cpp', lines: CHT_CPP.lines, regions: CHT_CPP.regions, highlightMap: CHT_CPP.highlightMap, source: CHT_CPP.source },
};
