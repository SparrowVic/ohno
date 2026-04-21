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

const CONVEX_HULL_JS = buildStructuredCode(
  `
  //@step 1
  function grahamScan(points) {
    if (points.length < 3) {
      return [...points];
    }

    //@step 2
    const pivot = findPivot(points);
    //@step 3
    const ordered = sortByPolarAngle(points, pivot);
    //@step 4
    const hull = [pivot, ordered[0]];

    for (const point of ordered.slice(1)) {
      //@step 7
      while (hull.length >= 2 && cross(hull[hull.length - 2], hull[hull.length - 1], point) <= 0) {
        //@step 8
        hull.pop();
      }

      //@step 9
      hull.push(point);
    }

    //@step 10
    return hull;
  }

  function findPivot(points) {
    return points.reduce((best, point) =>
      point.y < best.y || (point.y === best.y && point.x < best.x) ? point : best,
    );
  }

  function sortByPolarAngle(points, pivot) {
    return points
      .filter((point) => point !== pivot)
      .sort((left, right) => {
        const angleDiff =
          Math.atan2(left.y - pivot.y, left.x - pivot.x) -
          Math.atan2(right.y - pivot.y, right.x - pivot.x);
        return Math.abs(angleDiff) > 1e-9
          ? angleDiff
          : squaredDistance(pivot, left) - squaredDistance(pivot, right);
      });
  }

  function cross(a, b, c) {
    return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
  }

  function squaredDistance(a, b) {
    return (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
  }
  `,
  'javascript',
);

const CONVEX_HULL_GO = buildStructuredCode(
  `
  package geometry

  import (
      "math"
      "sort"
  )

  type Point struct {
      X float64
      Y float64
  }

  //@step 1
  func GrahamScan(points []Point) []Point {
      if len(points) < 3 {
          return append([]Point{}, points...)
      }

      //@step 2
      pivot := findPivot(points)
      //@step 3
      ordered := sortByPolarAngle(points, pivot)
      //@step 4
      hull := []Point{pivot, ordered[0]}

      for _, point := range ordered[1:] {
          //@step 7
          for len(hull) >= 2 && cross(hull[len(hull)-2], hull[len(hull)-1], point) <= 0 {
              //@step 8
              hull = hull[:len(hull)-1]
          }

          //@step 9
          hull = append(hull, point)
      }

      //@step 10
      return hull
  }

  func findPivot(points []Point) Point {
      best := points[0]
      for _, point := range points[1:] {
          if point.Y < best.Y || (point.Y == best.Y && point.X < best.X) {
              best = point
          }
      }
      return best
  }

  func sortByPolarAngle(points []Point, pivot Point) []Point {
      ordered := make([]Point, 0, len(points))
      for _, point := range points {
          if point != pivot {
              ordered = append(ordered, point)
          }
      }
      sort.Slice(ordered, func(i, j int) bool {
          left, right := ordered[i], ordered[j]
          angleDiff := math.Atan2(left.Y-pivot.Y, left.X-pivot.X) - math.Atan2(right.Y-pivot.Y, right.X-pivot.X)
          if math.Abs(angleDiff) > 1e-9 {
              return angleDiff < 0
          }
          return squaredDistance(pivot, left) < squaredDistance(pivot, right)
      })
      return ordered
  }

  func cross(a Point, b Point, c Point) float64 {
      return (b.X-a.X)*(c.Y-a.Y) - (b.Y-a.Y)*(c.X-a.X)
  }

  func squaredDistance(a Point, b Point) float64 {
      dx, dy := a.X-b.X, a.Y-b.Y
      return dx*dx + dy*dy
  }
  `,
  'go',
);

const CONVEX_HULL_RUST = buildStructuredCode(
  `
  #[derive(Clone, Copy, PartialEq)]
  struct Point {
      x: f64,
      y: f64,
  }

  //@step 1
  fn graham_scan(points: &[Point]) -> Vec<Point> {
      if points.len() < 3 {
          return points.to_vec();
      }

      //@step 2
      let pivot = find_pivot(points);
      //@step 3
      let ordered = sort_by_polar_angle(points, pivot);
      //@step 4
      let mut hull = vec![pivot, ordered[0]];

      for point in ordered.into_iter().skip(1) {
          //@step 7
          while hull.len() >= 2 && cross(hull[hull.len() - 2], hull[hull.len() - 1], point) <= 0.0 {
              //@step 8
              hull.pop();
          }

          //@step 9
          hull.push(point);
      }

      //@step 10
      hull
  }

  fn find_pivot(points: &[Point]) -> Point {
      *points
          .iter()
          .min_by(|left, right| left.y.total_cmp(&right.y).then(left.x.total_cmp(&right.x)))
          .unwrap()
  }

  fn sort_by_polar_angle(points: &[Point], pivot: Point) -> Vec<Point> {
      let mut ordered: Vec<Point> = points.iter().copied().filter(|point| *point != pivot).collect();
      ordered.sort_by(|left, right| {
          let left_angle = (left.y - pivot.y).atan2(left.x - pivot.x);
          let right_angle = (right.y - pivot.y).atan2(right.x - pivot.x);
          left_angle
              .total_cmp(&right_angle)
              .then(squared_distance(pivot, *left).total_cmp(&squared_distance(pivot, *right)))
      });
      ordered
  }

  fn cross(a: Point, b: Point, c: Point) -> f64 {
      (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x)
  }

  fn squared_distance(a: Point, b: Point) -> f64 {
      (a.x - b.x).powi(2) + (a.y - b.y).powi(2)
  }
  `,
  'rust',
);

const CONVEX_HULL_SWIFT = buildStructuredCode(
  `
  struct Point: Equatable {
      let x: Double
      let y: Double
  }

  //@step 1
  func grahamScan(_ points: [Point]) -> [Point] {
      if points.count < 3 {
          return points
      }

      //@step 2
      let pivot = findPivot(points)
      //@step 3
      let ordered = sortByPolarAngle(points, pivot: pivot)
      //@step 4
      var hull = [pivot, ordered[0]]

      for point in ordered.dropFirst() {
          //@step 7
          while hull.count >= 2 && cross(hull[hull.count - 2], hull[hull.count - 1], point) <= 0 {
              //@step 8
              hull.removeLast()
          }

          //@step 9
          hull.append(point)
      }

      //@step 10
      return hull
  }

  func findPivot(_ points: [Point]) -> Point {
      points.min {
          $0.y == $1.y ? $0.x < $1.x : $0.y < $1.y
      }!
  }

  func sortByPolarAngle(_ points: [Point], pivot: Point) -> [Point] {
      points
          .filter { $0 != pivot }
          .sorted {
              let leftAngle = atan2($0.y - pivot.y, $0.x - pivot.x)
              let rightAngle = atan2($1.y - pivot.y, $1.x - pivot.x)
              if abs(leftAngle - rightAngle) > 1e-9 {
                  return leftAngle < rightAngle
              }
              return squaredDistance(pivot, $0) < squaredDistance(pivot, $1)
          }
  }

  func cross(_ a: Point, _ b: Point, _ c: Point) -> Double {
      (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x)
  }

  func squaredDistance(_ a: Point, _ b: Point) -> Double {
      pow(a.x - b.x, 2) + pow(a.y - b.y, 2)
  }
  `,
  'swift',
);

const CONVEX_HULL_PHP = buildStructuredCode(
  `
  final class Point
  {
      public function __construct(
          public float $x,
          public float $y,
      ) {}
  }

  //@step 1
  function grahamScan(array $points): array
  {
      if (count($points) < 3) {
          return array_values($points);
      }

      //@step 2
      $pivot = findPivot($points);
      //@step 3
      $ordered = sortByPolarAngle($points, $pivot);
      //@step 4
      $hull = [$pivot, $ordered[0]];

      foreach (array_slice($ordered, 1) as $point) {
          //@step 7
          while (count($hull) >= 2 && cross($hull[count($hull) - 2], $hull[count($hull) - 1], $point) <= 0.0) {
              //@step 8
              array_pop($hull);
          }

          //@step 9
          $hull[] = $point;
      }

      //@step 10
      return $hull;
  }

  function findPivot(array $points): Point
  {
      $best = $points[0];
      foreach (array_slice($points, 1) as $point) {
          if ($point->y < $best->y || ($point->y === $best->y && $point->x < $best->x)) {
              $best = $point;
          }
      }
      return $best;
  }

  function sortByPolarAngle(array $points, Point $pivot): array
  {
      $ordered = array_values(array_filter($points, fn (Point $point): bool => $point !== $pivot));
      usort($ordered, function (Point $left, Point $right) use ($pivot): int {
          $leftAngle = atan2($left->y - $pivot->y, $left->x - $pivot->x);
          $rightAngle = atan2($right->y - $pivot->y, $right->x - $pivot->x);
          if (abs($leftAngle - $rightAngle) > 1e-9) {
              return $leftAngle <=> $rightAngle;
          }
          return squaredDistance($pivot, $left) <=> squaredDistance($pivot, $right);
      });
      return $ordered;
  }

  function cross(Point $a, Point $b, Point $c): float
  {
      return ($b->x - $a->x) * ($c->y - $a->y) - ($b->y - $a->y) * ($c->x - $a->x);
  }

  function squaredDistance(Point $a, Point $b): float
  {
      return ($a->x - $b->x) ** 2 + ($a->y - $b->y) ** 2;
  }
  `,
  'php',
);

const CONVEX_HULL_KOTLIN = buildStructuredCode(
  `
  data class Point(val x: Double, val y: Double)

  //@step 1
  fun grahamScan(points: List<Point>): List<Point> {
      if (points.size < 3) {
          return points.toList()
      }

      //@step 2
      val pivot = findPivot(points)
      //@step 3
      val ordered = sortByPolarAngle(points, pivot)
      //@step 4
      val hull = mutableListOf(pivot, ordered.first())

      for (point in ordered.drop(1)) {
          //@step 7
          while (hull.size >= 2 && cross(hull[hull.size - 2], hull[hull.size - 1], point) <= 0.0) {
              //@step 8
              hull.removeAt(hull.lastIndex)
          }

          //@step 9
          hull += point
      }

      //@step 10
      return hull
  }

  fun findPivot(points: List<Point>): Point =
      points.minWith(compareBy<Point> { it.y }.thenBy { it.x })

  fun sortByPolarAngle(points: List<Point>, pivot: Point): List<Point> =
      points
          .filter { it != pivot }
          .sortedWith(
              compareBy<Point> { kotlin.math.atan2(it.y - pivot.y, it.x - pivot.x) }
                  .thenBy { squaredDistance(pivot, it) },
          )

  fun cross(a: Point, b: Point, c: Point): Double =
      (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x)

  fun squaredDistance(a: Point, b: Point): Double =
      (a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y)
  `,
  'kotlin',
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
  javascript: {
    language: 'javascript',
    lines: CONVEX_HULL_JS.lines,
    regions: CONVEX_HULL_JS.regions,
    highlightMap: CONVEX_HULL_JS.highlightMap,
    source: CONVEX_HULL_JS.source,
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
  go: {
    language: 'go',
    lines: CONVEX_HULL_GO.lines,
    regions: CONVEX_HULL_GO.regions,
    highlightMap: CONVEX_HULL_GO.highlightMap,
    source: CONVEX_HULL_GO.source,
  },
  rust: {
    language: 'rust',
    lines: CONVEX_HULL_RUST.lines,
    regions: CONVEX_HULL_RUST.regions,
    highlightMap: CONVEX_HULL_RUST.highlightMap,
    source: CONVEX_HULL_RUST.source,
  },
  swift: {
    language: 'swift',
    lines: CONVEX_HULL_SWIFT.lines,
    regions: CONVEX_HULL_SWIFT.regions,
    highlightMap: CONVEX_HULL_SWIFT.highlightMap,
    source: CONVEX_HULL_SWIFT.source,
  },
  php: {
    language: 'php',
    lines: CONVEX_HULL_PHP.lines,
    regions: CONVEX_HULL_PHP.regions,
    highlightMap: CONVEX_HULL_PHP.highlightMap,
    source: CONVEX_HULL_PHP.source,
  },
  kotlin: {
    language: 'kotlin',
    lines: CONVEX_HULL_KOTLIN.lines,
    regions: CONVEX_HULL_KOTLIN.regions,
    highlightMap: CONVEX_HULL_KOTLIN.highlightMap,
    source: CONVEX_HULL_KOTLIN.source,
  },
};
