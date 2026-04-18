import { CodeVariantMap } from '../models/detail';
import { buildStructuredCode } from './code-line-builder/code-line-builder';

const CONVEX_HULL_TS = buildStructuredCode(`
  //#region point interface collapsed
  interface Point {
    readonly x: number;
    readonly y: number;
  }
  //#endregion point

  /**
   * Build the convex hull with Graham Scan.
   * Input: planar points.
   * Returns: hull vertices in counter-clockwise order.
   */
  //#region graham-scan function open
  //@step 1
  function grahamScan(points: readonly Point[]): Point[] {
    if (points.length < 3) {
      return [...points];
    }

    //@step 2
    const pivot = findPivot(points);

    //@step 3
    const sorted = sortByPolarAngle(points, pivot);

    //@step 4
    const hull: Point[] = [pivot, sorted[0]!];

    for (const point of sorted.slice(1)) {
      //@step 7
      while (
        hull.length >= 2 &&
        cross(hull[hull.length - 2]!, hull[hull.length - 1]!, point) <= 0
      ) {
        //@step 8
        hull.pop();
      }

      //@step 9
      hull.push(point);
    }

    //@step 10
    return hull;
  }
  //#endregion graham-scan

  //#region find-pivot helper collapsed
  function findPivot(points: readonly Point[]): Point {
    return points.reduce((best, point) =>
      point.y < best.y || (point.y === best.y && point.x < best.x) ? point : best,
    );
  }
  //#endregion find-pivot

  //#region sort-by-angle helper collapsed
  function sortByPolarAngle(points: readonly Point[], pivot: Point): Point[] {
    return points
      .filter((point) => point !== pivot)
      .sort((left, right) => {
        const angleDiff =
          Math.atan2(left.y - pivot.y, left.x - pivot.x) -
          Math.atan2(right.y - pivot.y, right.x - pivot.x);

        if (Math.abs(angleDiff) > 1e-9) {
          return angleDiff;
        }

        return squaredDistance(pivot, left) - squaredDistance(pivot, right);
      });
  }
  //#endregion sort-by-angle

  //#region cross helper collapsed
  function cross(a: Point, b: Point, c: Point): number {
    return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
  }
  //#endregion cross

  //#region squared-distance helper collapsed
  function squaredDistance(a: Point, b: Point): number {
    return (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
  }
  //#endregion squared-distance
`);

const CONVEX_HULL_PY = buildStructuredCode(
  `
  //#region point interface collapsed
  from dataclasses import dataclass
  import math


  @dataclass(frozen=True)
  class Point:
      x: float
      y: float
  //#endregion point

  """
  Build the convex hull with Graham Scan.
  Input: planar points.
  Returns: hull vertices in counter-clockwise order.
  """
  //#region graham-scan function open
  //@step 1
  def graham_scan(points: list[Point]) -> list[Point]:
      if len(points) < 3:
          return list(points)

      //@step 2
      pivot = find_pivot(points)
      //@step 3
      ordered = sort_by_polar_angle(points, pivot)

      //@step 4
      hull: list[Point] = [pivot, ordered[0]]

      for point in ordered[1:]:
          //@step 7
          while len(hull) >= 2 and cross(hull[-2], hull[-1], point) <= 0:
              //@step 8
              hull.pop()

          //@step 9
          hull.append(point)

      //@step 10
      return hull
  //#endregion graham-scan

  //#region find-pivot helper collapsed
  def find_pivot(points: list[Point]) -> Point:
      return min(points, key=lambda point: (point.y, point.x))
  //#endregion find-pivot

  //#region sort-by-angle helper collapsed
  def sort_by_polar_angle(points: list[Point], pivot: Point) -> list[Point]:
      def sort_key(point: Point) -> tuple[float, float]:
          angle = math.atan2(point.y - pivot.y, point.x - pivot.x)
          return angle, squared_distance(pivot, point)

      return sorted((point for point in points if point != pivot), key=sort_key)
  //#endregion sort-by-angle

  //#region cross helper collapsed
  def cross(a: Point, b: Point, c: Point) -> float:
      return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x)
  //#endregion cross

  //#region squared-distance helper collapsed
  def squared_distance(a: Point, b: Point) -> float:
      return (a.x - b.x) ** 2 + (a.y - b.y) ** 2
  //#endregion squared-distance
  `,
  'python',
);

const CONVEX_HULL_CS = buildStructuredCode(
  `
  //#region point interface collapsed
  public readonly record struct Point(double X, double Y);
  //#endregion point

  //#region graham-scan function open
  /// <summary>
  /// Builds the convex hull with Graham Scan.
  /// Input: planar points.
  /// Returns: hull vertices in counter-clockwise order.
  /// </summary>
  //@step 1
  public static List<Point> GrahamScan(IReadOnlyList<Point> points)
  {
      if (points.Count < 3)
      {
          return points.ToList();
      }

      //@step 2
      var pivot = FindPivot(points);
      //@step 3
      var ordered = SortByPolarAngle(points, pivot);

      //@step 4
      var hull = new List<Point> { pivot, ordered[0] };

      foreach (var point in ordered.Skip(1))
      {
          //@step 7
          while (hull.Count >= 2 && Cross(hull[^2], hull[^1], point) <= 0)
          {
              //@step 8
              hull.RemoveAt(hull.Count - 1);
          }

          //@step 9
          hull.Add(point);
      }

      //@step 10
      return hull;
  }
  //#endregion graham-scan

  //#region find-pivot helper collapsed
  private static Point FindPivot(IReadOnlyList<Point> points)
  {
      return points.Aggregate((best, point) =>
          point.Y < best.Y || (point.Y == best.Y && point.X < best.X) ? point : best);
  }
  //#endregion find-pivot

  //#region sort-by-angle helper collapsed
  private static List<Point> SortByPolarAngle(IReadOnlyList<Point> points, Point pivot)
  {
      return points
          .Where(point => point != pivot)
          .OrderBy(point => Math.Atan2(point.Y - pivot.Y, point.X - pivot.X))
          .ThenBy(point => SquaredDistance(pivot, point))
          .ToList();
  }
  //#endregion sort-by-angle

  //#region cross helper collapsed
  private static double Cross(Point a, Point b, Point c)
  {
      return (b.X - a.X) * (c.Y - a.Y) - (b.Y - a.Y) * (c.X - a.X);
  }
  //#endregion cross

  //#region squared-distance helper collapsed
  private static double SquaredDistance(Point a, Point b)
  {
      return Math.Pow(a.X - b.X, 2) + Math.Pow(a.Y - b.Y, 2);
  }
  //#endregion squared-distance
  `,
  'csharp',
);

const CONVEX_HULL_JAVA = buildStructuredCode(
  `
  //#region point interface collapsed
  public record Point(double x, double y) {}
  //#endregion point

  //#region graham-scan function open
  /**
   * Builds the convex hull with Graham Scan.
   * Input: planar points.
   * Returns: hull vertices in counter-clockwise order.
   */
  //@step 1
  public static List<Point> grahamScan(List<Point> points) {
      if (points.size() < 3) {
          return new ArrayList<>(points);
      }

      //@step 2
      Point pivot = findPivot(points);
      //@step 3
      List<Point> ordered = sortByPolarAngle(points, pivot);

      //@step 4
      List<Point> hull = new ArrayList<>();
      hull.add(pivot);
      hull.add(ordered.get(0));

      for (int index = 1; index < ordered.size(); index += 1) {
          Point point = ordered.get(index);

          //@step 7
          while (hull.size() >= 2 && cross(hull.get(hull.size() - 2), hull.get(hull.size() - 1), point) <= 0) {
              //@step 8
              hull.remove(hull.size() - 1);
          }

          //@step 9
          hull.add(point);
      }

      //@step 10
      return hull;
  }
  //#endregion graham-scan

  //#region find-pivot helper collapsed
  private static Point findPivot(List<Point> points) {
      return points.stream()
          .min(Comparator.comparingDouble(Point::y).thenComparingDouble(Point::x))
          .orElseThrow();
  }
  //#endregion find-pivot

  //#region sort-by-angle helper collapsed
  private static List<Point> sortByPolarAngle(List<Point> points, Point pivot) {
      return points.stream()
          .filter(point -> !point.equals(pivot))
          .sorted(
              Comparator
                  .comparingDouble((Point point) -> Math.atan2(point.y() - pivot.y(), point.x() - pivot.x()))
                  .thenComparingDouble(point -> squaredDistance(pivot, point))
          )
          .toList();
  }
  //#endregion sort-by-angle

  //#region cross helper collapsed
  private static double cross(Point a, Point b, Point c) {
      return (b.x() - a.x()) * (c.y() - a.y()) - (b.y() - a.y()) * (c.x() - a.x());
  }
  //#endregion cross

  //#region squared-distance helper collapsed
  private static double squaredDistance(Point a, Point b) {
      return Math.pow(a.x() - b.x(), 2) + Math.pow(a.y() - b.y(), 2);
  }
  //#endregion squared-distance
  `,
  'java',
);

const CONVEX_HULL_CPP = buildStructuredCode(
  `
  //#region point interface collapsed
  struct Point {
      double x;
      double y;
  };
  //#endregion point

  //#region graham-scan function open
  /**
   * Build the convex hull with Graham Scan.
   * Input: planar points.
   * Returns: hull vertices in counter-clockwise order.
   */
  //@step 1
  std::vector<Point> grahamScan(const std::vector<Point>& points) {
      if (points.size() < 3) {
          return points;
      }

      //@step 2
      Point pivot = findPivot(points);
      //@step 3
      std::vector<Point> ordered = sortByPolarAngle(points, pivot);

      //@step 4
      std::vector<Point> hull{pivot, ordered.front()};

      for (std::size_t index = 1; index < ordered.size(); ++index) {
          const Point& point = ordered[index];

          //@step 7
          while (hull.size() >= 2 && cross(hull[hull.size() - 2], hull[hull.size() - 1], point) <= 0.0) {
              //@step 8
              hull.pop_back();
          }

          //@step 9
          hull.push_back(point);
      }

      //@step 10
      return hull;
  }
  //#endregion graham-scan

  //#region find-pivot helper collapsed
  Point findPivot(const std::vector<Point>& points) {
      return *std::min_element(points.begin(), points.end(), [](const Point& left, const Point& right) {
          return left.y < right.y || (left.y == right.y && left.x < right.x);
      });
  }
  //#endregion find-pivot

  //#region sort-by-angle helper collapsed
  std::vector<Point> sortByPolarAngle(const std::vector<Point>& points, const Point& pivot) {
      std::vector<Point> ordered;
      for (const Point& point : points) {
          if (point.x != pivot.x || point.y != pivot.y) {
              ordered.push_back(point);
          }
      }

      std::sort(ordered.begin(), ordered.end(), [&](const Point& left, const Point& right) {
          double angleLeft = std::atan2(left.y - pivot.y, left.x - pivot.x);
          double angleRight = std::atan2(right.y - pivot.y, right.x - pivot.x);
          if (std::abs(angleLeft - angleRight) > 1e-9) {
              return angleLeft < angleRight;
          }

          return squaredDistance(pivot, left) < squaredDistance(pivot, right);
      });

      return ordered;
  }
  //#endregion sort-by-angle

  //#region cross helper collapsed
  double cross(const Point& a, const Point& b, const Point& c) {
      return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
  }
  //#endregion cross

  //#region squared-distance helper collapsed
  double squaredDistance(const Point& a, const Point& b) {
      return std::pow(a.x - b.x, 2.0) + std::pow(a.y - b.y, 2.0);
  }
  //#endregion squared-distance
  `,
  'cpp',
);

export const CONVEX_HULL_CODE = CONVEX_HULL_TS.lines;
export const CONVEX_HULL_CODE_REGIONS = CONVEX_HULL_TS.regions;
export const CONVEX_HULL_CODE_HIGHLIGHT_MAP = CONVEX_HULL_TS.highlightMap;
export const CONVEX_HULL_CODE_VARIANTS: CodeVariantMap = {
  typescript: {
    language: 'typescript',
    lines: CONVEX_HULL_TS.lines,
    regions: CONVEX_HULL_TS.regions,
    highlightMap: CONVEX_HULL_TS.highlightMap,
    source: CONVEX_HULL_TS.source,
  },
  python: {
    language: 'python',
    lines: CONVEX_HULL_PY.lines,
    regions: CONVEX_HULL_PY.regions,
    highlightMap: CONVEX_HULL_PY.highlightMap,
    source: CONVEX_HULL_PY.source,
  },
  csharp: {
    language: 'csharp',
    lines: CONVEX_HULL_CS.lines,
    regions: CONVEX_HULL_CS.regions,
    highlightMap: CONVEX_HULL_CS.highlightMap,
    source: CONVEX_HULL_CS.source,
  },
  java: {
    language: 'java',
    lines: CONVEX_HULL_JAVA.lines,
    regions: CONVEX_HULL_JAVA.regions,
    highlightMap: CONVEX_HULL_JAVA.highlightMap,
    source: CONVEX_HULL_JAVA.source,
  },
  cpp: {
    language: 'cpp',
    lines: CONVEX_HULL_CPP.lines,
    regions: CONVEX_HULL_CPP.regions,
    highlightMap: CONVEX_HULL_CPP.highlightMap,
    source: CONVEX_HULL_CPP.source,
  },
};
