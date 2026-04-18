import { CodeVariantMap } from '../models/detail';
import { buildStructuredCode } from './code-line-builder/code-line-builder';

const CLOSEST_PAIR_TS = buildStructuredCode(`
  //#region point interface collapsed
  interface Point {
    readonly x: number;
    readonly y: number;
  }
  //#endregion point

  //#region pair-result interface collapsed
  interface PairResult {
    readonly pair: readonly [Point, Point];
    readonly distance: number;
  }
  //#endregion pair-result

  /**
   * Find the closest pair with divide and conquer.
   * Input: planar points.
   * Returns: the closest pair together with its Euclidean distance.
   */
  //#region closest-pair function open
  //@step 1
  function closestPair(points: readonly Point[]): PairResult | null {
    if (points.length < 2) {
      return null;
    }

    //@step 2
    const sortedByX = [...points].sort((left, right) => left.x - right.x || left.y - right.y);
    const sortedByY = [...points].sort((left, right) => left.y - right.y || left.x - right.x);

    function solve(px: readonly Point[], py: readonly Point[]): PairResult | null {
      //@step 6
      if (px.length <= 3) {
        return bruteForce(px);
      }

      //@step 7
      const mid = Math.floor(px.length / 2);
      const leftPx = px.slice(0, mid);
      const rightPx = px.slice(mid);
      const splitX = px[mid]!.x;
      const leftSet = new Set(leftPx);
      const leftPy = py.filter((point) => leftSet.has(point));
      const rightPy = py.filter((point) => !leftSet.has(point));

      //@step 8
      let best = minPair(solve(leftPx, leftPy), solve(rightPx, rightPy));
      if (!best) {
        return null;
      }

      //@step 9
      const strip = py.filter((point) => Math.abs(point.x - splitX) < best.distance);

      for (let i = 0; i < strip.length; i += 1) {
        //@step 10
        for (
          let j = i + 1;
          j < strip.length && j <= i + 7 && strip[j]!.y - strip[i]!.y < best.distance;
          j += 1
        ) {
          best = minPair(best, pairOf(strip[i]!, strip[j]!))!;
        }
      }

      return best;
    }

    //@step 11
    return solve(sortedByX, sortedByY);
  }
  //#endregion closest-pair

  //#region brute-force helper collapsed
  function bruteForce(points: readonly Point[]): PairResult | null {
    let best: PairResult | null = null;

    for (let i = 0; i < points.length; i += 1) {
      for (let j = i + 1; j < points.length; j += 1) {
        best = minPair(best, pairOf(points[i]!, points[j]!));
      }
    }

    return best;
  }
  //#endregion brute-force

  //#region pair-of helper collapsed
  function pairOf(left: Point, right: Point): PairResult {
    return {
      pair: [left, right],
      distance: Math.hypot(left.x - right.x, left.y - right.y),
    };
  }
  //#endregion pair-of

  //#region min-pair helper collapsed
  function minPair(left: PairResult | null, right: PairResult | null): PairResult | null {
    if (!left) {
      return right;
    }

    if (!right) {
      return left;
    }

    return left.distance <= right.distance ? left : right;
  }
  //#endregion min-pair
`);

const CLOSEST_PAIR_PY = buildStructuredCode(
  `
  //#region point interface collapsed
  from dataclasses import dataclass
  import math


  @dataclass(frozen=True)
  class Point:
      x: float
      y: float


  @dataclass(frozen=True)
  class PairResult:
      pair: tuple[Point, Point]
      distance: float
  //#endregion point

  """
  Find the closest pair with divide and conquer.
  Input: planar points.
  Returns: the closest pair and its Euclidean distance.
  """
  //#region closest-pair function open
  //@step 1
  def closest_pair(points: list[Point]) -> PairResult | None:
      if len(points) < 2:
          return None

      //@step 2
      sorted_by_x = sorted(points, key=lambda point: (point.x, point.y))
      sorted_by_y = sorted(points, key=lambda point: (point.y, point.x))

      def solve(px: list[Point], py: list[Point]) -> PairResult | None:
          //@step 6
          if len(px) <= 3:
              return brute_force(px)

          //@step 7
          mid = len(px) // 2
          left_px = px[:mid]
          right_px = px[mid:]
          split_x = px[mid].x
          left_set = set(left_px)
          left_py = [point for point in py if point in left_set]
          right_py = [point for point in py if point not in left_set]

          //@step 8
          best = min_pair(solve(left_px, left_py), solve(right_px, right_py))
          if best is None:
              return None

          //@step 9
          strip = [point for point in py if abs(point.x - split_x) < best.distance]

          for i in range(len(strip)):
              //@step 10
              for j in range(i + 1, min(len(strip), i + 8)):
                  if strip[j].y - strip[i].y >= best.distance:
                      break
                  best = min_pair(best, pair_of(strip[i], strip[j]))

          return best

      //@step 11
      return solve(sorted_by_x, sorted_by_y)
  //#endregion closest-pair

  //#region brute-force helper collapsed
  def brute_force(points: list[Point]) -> PairResult | None:
      best: PairResult | None = None

      for i in range(len(points)):
          for j in range(i + 1, len(points)):
              best = min_pair(best, pair_of(points[i], points[j]))

      return best
  //#endregion brute-force

  //#region pair-of helper collapsed
  def pair_of(left: Point, right: Point) -> PairResult:
      return PairResult(pair=(left, right), distance=math.hypot(left.x - right.x, left.y - right.y))
  //#endregion pair-of

  //#region min-pair helper collapsed
  def min_pair(left: PairResult | None, right: PairResult | None) -> PairResult | None:
      if left is None:
          return right
      if right is None:
          return left
      return left if left.distance <= right.distance else right
  //#endregion min-pair
  `,
  'python',
);

const CLOSEST_PAIR_CS = buildStructuredCode(
  `
  //#region point interface collapsed
  public readonly record struct Point(double X, double Y);
  public readonly record struct PairResult((Point Left, Point Right) Pair, double Distance);
  //#endregion point

  //#region closest-pair function open
  /// <summary>
  /// Finds the closest pair with divide and conquer.
  /// Input: planar points.
  /// Returns: the closest pair and its Euclidean distance.
  /// </summary>
  //@step 1
  public static PairResult? ClosestPair(IReadOnlyList<Point> points)
  {
      if (points.Count < 2)
      {
          return null;
      }

      //@step 2
      var sortedByX = points.OrderBy(point => point.X).ThenBy(point => point.Y).ToList();
      var sortedByY = points.OrderBy(point => point.Y).ThenBy(point => point.X).ToList();

      PairResult? Solve(IReadOnlyList<Point> px, IReadOnlyList<Point> py)
      {
          //@step 6
          if (px.Count <= 3)
          {
              return BruteForce(px);
          }

          //@step 7
          var mid = px.Count / 2;
          var leftPx = px.Take(mid).ToList();
          var rightPx = px.Skip(mid).ToList();
          var splitX = px[mid].X;
          var leftSet = leftPx.ToHashSet();
          var leftPy = py.Where(leftSet.Contains).ToList();
          var rightPy = py.Where(point => !leftSet.Contains(point)).ToList();

          //@step 8
          var best = MinPair(Solve(leftPx, leftPy), Solve(rightPx, rightPy));
          if (best is null)
          {
              return null;
          }

          //@step 9
          var strip = py.Where(point => Math.Abs(point.X - splitX) < best.Value.Distance).ToList();

          for (var i = 0; i < strip.Count; i += 1)
          {
              //@step 10
              for (var j = i + 1; j < strip.Count && j <= i + 7; j += 1)
              {
                  if (strip[j].Y - strip[i].Y >= best.Value.Distance)
                  {
                      break;
                  }
                  best = MinPair(best, PairOf(strip[i], strip[j]));
              }
          }

          return best;
      }

      //@step 11
      return Solve(sortedByX, sortedByY);
  }
  //#endregion closest-pair

  //#region brute-force helper collapsed
  private static PairResult? BruteForce(IReadOnlyList<Point> points)
  {
      PairResult? best = null;
      for (var i = 0; i < points.Count; i += 1)
      {
          for (var j = i + 1; j < points.Count; j += 1)
          {
              best = MinPair(best, PairOf(points[i], points[j]));
          }
      }
      return best;
  }
  //#endregion brute-force

  //#region pair-of helper collapsed
  private static PairResult PairOf(Point left, Point right)
  {
      return new PairResult((left, right), Math.Sqrt(Math.Pow(left.X - right.X, 2) + Math.Pow(left.Y - right.Y, 2)));
  }
  //#endregion pair-of

  //#region min-pair helper collapsed
  private static PairResult? MinPair(PairResult? left, PairResult? right)
  {
      if (left is null) return right;
      if (right is null) return left;
      return left.Value.Distance <= right.Value.Distance ? left : right;
  }
  //#endregion min-pair
  `,
  'csharp',
);

const CLOSEST_PAIR_JAVA = buildStructuredCode(
  `
  //#region point interface collapsed
  public record Point(double x, double y) {}
  public record PairResult(Point left, Point right, double distance) {}
  //#endregion point

  //#region closest-pair function open
  /**
   * Finds the closest pair with divide and conquer.
   * Input: planar points.
   * Returns: the closest pair and its Euclidean distance.
   */
  //@step 1
  public static PairResult closestPair(List<Point> points) {
      if (points.size() < 2) {
          return null;
      }

      //@step 2
      List<Point> sortedByX = points.stream()
          .sorted(Comparator.comparingDouble(Point::x).thenComparingDouble(Point::y))
          .toList();
      List<Point> sortedByY = points.stream()
          .sorted(Comparator.comparingDouble(Point::y).thenComparingDouble(Point::x))
          .toList();

      //@step 11
      return solve(sortedByX, sortedByY);
  }
  //#endregion closest-pair

  //#region solve helper collapsed
  private static PairResult solve(List<Point> px, List<Point> py) {
      //@step 6
      if (px.size() <= 3) {
          return bruteForce(px);
      }

      //@step 7
      int mid = px.size() / 2;
      List<Point> leftPx = px.subList(0, mid);
      List<Point> rightPx = px.subList(mid, px.size());
      double splitX = px.get(mid).x();
      Set<Point> leftSet = new HashSet<>(leftPx);
      List<Point> leftPy = py.stream().filter(leftSet::contains).toList();
      List<Point> rightPy = py.stream().filter(point -> !leftSet.contains(point)).toList();

      //@step 8
      PairResult best = minPair(solve(leftPx, leftPy), solve(rightPx, rightPy));
      if (best == null) {
          return null;
      }

      //@step 9
      List<Point> strip = py.stream()
          .filter(point -> Math.abs(point.x() - splitX) < best.distance())
          .toList();

      for (int i = 0; i < strip.size(); i += 1) {
          //@step 10
          for (int j = i + 1; j < strip.size() && j <= i + 7; j += 1) {
              if (strip.get(j).y() - strip.get(i).y() >= best.distance()) {
                  break;
              }
              best = minPair(best, pairOf(strip.get(i), strip.get(j)));
          }
      }

      return best;
  }
  //#endregion solve

  //#region brute-force helper collapsed
  private static PairResult bruteForce(List<Point> points) {
      PairResult best = null;
      for (int i = 0; i < points.size(); i += 1) {
          for (int j = i + 1; j < points.size(); j += 1) {
              best = minPair(best, pairOf(points.get(i), points.get(j)));
          }
      }
      return best;
  }
  //#endregion brute-force

  //#region pair-of helper collapsed
  private static PairResult pairOf(Point left, Point right) {
      return new PairResult(left, right, Math.hypot(left.x() - right.x(), left.y() - right.y()));
  }
  //#endregion pair-of

  //#region min-pair helper collapsed
  private static PairResult minPair(PairResult left, PairResult right) {
      if (left == null) return right;
      if (right == null) return left;
      return left.distance() <= right.distance() ? left : right;
  }
  //#endregion min-pair
  `,
  'java',
);

const CLOSEST_PAIR_CPP = buildStructuredCode(
  `
  //#region point interface collapsed
  struct Point {
      double x;
      double y;
  };

  struct PairResult {
      Point left;
      Point right;
      double distance;
  };
  //#endregion point

  //#region closest-pair function open
  /**
   * Finds the closest pair with divide and conquer.
   * Input: planar points.
   * Returns: the closest pair and its Euclidean distance.
   */
  //@step 1
  std::optional<PairResult> closestPair(const std::vector<Point>& points) {
      if (points.size() < 2) {
          return std::nullopt;
      }

      //@step 2
      auto sortedByX = points;
      auto sortedByY = points;
      std::sort(sortedByX.begin(), sortedByX.end(), [](const Point& left, const Point& right) {
          return left.x < right.x || (left.x == right.x && left.y < right.y);
      });
      std::sort(sortedByY.begin(), sortedByY.end(), [](const Point& left, const Point& right) {
          return left.y < right.y || (left.y == right.y && left.x < right.x);
      });

      //@step 11
      return solve(sortedByX, sortedByY);
  }
  //#endregion closest-pair

  //#region solve helper collapsed
  std::optional<PairResult> solve(const std::vector<Point>& px, const std::vector<Point>& py) {
      //@step 6
      if (px.size() <= 3) {
          return bruteForce(px);
      }

      //@step 7
      std::size_t mid = px.size() / 2;
      std::vector<Point> leftPx(px.begin(), px.begin() + static_cast<long>(mid));
      std::vector<Point> rightPx(px.begin() + static_cast<long>(mid), px.end());
      double splitX = px[mid].x;

      std::unordered_set<std::string> leftKeys;
      for (const Point& point : leftPx) {
          leftKeys.insert(pointKey(point));
      }

      std::vector<Point> leftPy;
      std::vector<Point> rightPy;
      for (const Point& point : py) {
          if (leftKeys.contains(pointKey(point))) leftPy.push_back(point);
          else rightPy.push_back(point);
      }

      //@step 8
      auto best = minPair(solve(leftPx, leftPy), solve(rightPx, rightPy));
      if (!best.has_value()) {
          return std::nullopt;
      }

      //@step 9
      std::vector<Point> strip;
      for (const Point& point : py) {
          if (std::abs(point.x - splitX) < best->distance) {
              strip.push_back(point);
          }
      }

      for (std::size_t i = 0; i < strip.size(); ++i) {
          //@step 10
          for (std::size_t j = i + 1; j < strip.size() && j <= i + 7; ++j) {
              if (strip[j].y - strip[i].y >= best->distance) {
                  break;
              }
              best = minPair(best, pairOf(strip[i], strip[j]));
          }
      }

      return best;
  }
  //#endregion solve

  //#region brute-force helper collapsed
  std::optional<PairResult> bruteForce(const std::vector<Point>& points) {
      std::optional<PairResult> best = std::nullopt;
      for (std::size_t i = 0; i < points.size(); ++i) {
          for (std::size_t j = i + 1; j < points.size(); ++j) {
              best = minPair(best, pairOf(points[i], points[j]));
          }
      }
      return best;
  }
  //#endregion brute-force

  //#region pair-of helper collapsed
  PairResult pairOf(const Point& left, const Point& right) {
      return {left, right, std::hypot(left.x - right.x, left.y - right.y)};
  }
  //#endregion pair-of

  //#region min-pair helper collapsed
  std::optional<PairResult> minPair(
      const std::optional<PairResult>& left,
      const std::optional<PairResult>& right
  ) {
      if (!left.has_value()) return right;
      if (!right.has_value()) return left;
      return left->distance <= right->distance ? left : right;
  }
  //#endregion min-pair

  //#region point-key helper collapsed
  std::string pointKey(const Point& point) {
      return std::to_string(point.x) + ":" + std::to_string(point.y);
  }
  //#endregion point-key
  `,
  'cpp',
);

export const CLOSEST_PAIR_OF_POINTS_CODE = CLOSEST_PAIR_TS.lines;
export const CLOSEST_PAIR_OF_POINTS_CODE_REGIONS = CLOSEST_PAIR_TS.regions;
export const CLOSEST_PAIR_OF_POINTS_CODE_HIGHLIGHT_MAP = CLOSEST_PAIR_TS.highlightMap;
export const CLOSEST_PAIR_OF_POINTS_CODE_VARIANTS: CodeVariantMap = {
  typescript: {
    language: 'typescript',
    lines: CLOSEST_PAIR_TS.lines,
    regions: CLOSEST_PAIR_TS.regions,
    highlightMap: CLOSEST_PAIR_TS.highlightMap,
    source: CLOSEST_PAIR_TS.source,
  },
  python: {
    language: 'python',
    lines: CLOSEST_PAIR_PY.lines,
    regions: CLOSEST_PAIR_PY.regions,
    highlightMap: CLOSEST_PAIR_PY.highlightMap,
    source: CLOSEST_PAIR_PY.source,
  },
  csharp: {
    language: 'csharp',
    lines: CLOSEST_PAIR_CS.lines,
    regions: CLOSEST_PAIR_CS.regions,
    highlightMap: CLOSEST_PAIR_CS.highlightMap,
    source: CLOSEST_PAIR_CS.source,
  },
  java: {
    language: 'java',
    lines: CLOSEST_PAIR_JAVA.lines,
    regions: CLOSEST_PAIR_JAVA.regions,
    highlightMap: CLOSEST_PAIR_JAVA.highlightMap,
    source: CLOSEST_PAIR_JAVA.source,
  },
  cpp: {
    language: 'cpp',
    lines: CLOSEST_PAIR_CPP.lines,
    regions: CLOSEST_PAIR_CPP.regions,
    highlightMap: CLOSEST_PAIR_CPP.highlightMap,
    source: CLOSEST_PAIR_CPP.source,
  },
};
