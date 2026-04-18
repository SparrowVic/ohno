import { CodeVariantMap } from '../models/detail';
import { buildStructuredCode } from './code-line-builder/code-line-builder';

const HALF_PLANE_TS = buildStructuredCode(`
  //#region point interface collapsed
  interface Point {
    readonly x: number;
    readonly y: number;
  }
  //#endregion point

  //#region half-plane interface collapsed
  interface HalfPlane {
    readonly start: Point;
    readonly end: Point;
  }
  //#endregion half-plane

  /**
   * Intersect directed half-planes by clipping a polygon.
   * Input: lines whose feasible side is always on the left.
   * Returns: the remaining feasible polygon.
   */
  //#region intersect-half-planes function open
  //@step 1
  function intersectHalfPlanes(constraints: readonly HalfPlane[]): Point[] {
    let feasible = createCanvasBounds();

    for (const constraint of constraints) {
      //@step 3
      const forbidden = clipPolygon(createCanvasBounds(), constraint, false);

      //@step 4
      feasible = clipPolygon(feasible, constraint, true);

      //@step 5
      if (feasible.length === 0) {
        return [];
      }
    }

    //@step 6
    return feasible;
  }
  //#endregion intersect-half-planes

  //#region create-bounds helper collapsed
  function createCanvasBounds(): Point[] {
    return [
      { x: 6, y: 6 },
      { x: 94, y: 6 },
      { x: 94, y: 94 },
      { x: 6, y: 94 },
    ];
  }
  //#endregion create-bounds

  //#region clip-polygon helper collapsed
  function clipPolygon(
    polygon: readonly Point[],
    constraint: HalfPlane,
    keepInside: boolean,
  ): Point[] {
    if (polygon.length === 0) {
      return [];
    }

    const output: Point[] = [];
    const epsilon = 1e-6;

    for (let index = 0; index < polygon.length; index += 1) {
      const current = polygon[index]!;
      const previous = polygon[(index + polygon.length - 1) % polygon.length]!;
      const currentSide = cross(constraint.start, constraint.end, current);
      const previousSide = cross(constraint.start, constraint.end, previous);
      const currentInside = keepInside ? currentSide >= -epsilon : currentSide <= epsilon;
      const previousInside = keepInside ? previousSide >= -epsilon : previousSide <= epsilon;

      if (currentInside) {
        if (!previousInside) {
          output.push(lineIntersection(previous, current, constraint.start, constraint.end));
        }

        output.push(current);
      } else if (previousInside) {
        output.push(lineIntersection(previous, current, constraint.start, constraint.end));
      }
    }

    return output;
  }
  //#endregion clip-polygon

  //#region cross helper collapsed
  function cross(a: Point, b: Point, p: Point): number {
    return (b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x);
  }
  //#endregion cross

  //#region line-intersection helper collapsed
  function lineIntersection(s: Point, e: Point, a: Point, b: Point): Point {
    const denominator = (s.x - e.x) * (a.y - b.y) - (s.y - e.y) * (a.x - b.x);

    if (Math.abs(denominator) < 1e-6) {
      return { ...e };
    }

    const det1 = s.x * e.y - s.y * e.x;
    const det2 = a.x * b.y - a.y * b.x;
    return {
      x: (det1 * (a.x - b.x) - (s.x - e.x) * det2) / denominator,
      y: (det1 * (a.y - b.y) - (s.y - e.y) * det2) / denominator,
    };
  }
  //#endregion line-intersection
`);

const HALF_PLANE_PY = buildStructuredCode(
  `
  //#region point interface collapsed
  from dataclasses import dataclass


  @dataclass(frozen=True)
  class Point:
      x: float
      y: float


  @dataclass(frozen=True)
  class HalfPlane:
      start: Point
      end: Point
  //#endregion point

  """
  Intersect directed half-planes by clipping a polygon.
  Input: lines whose feasible side is always on the left.
  Returns: the remaining feasible polygon.
  """
  //#region intersect-half-planes function open
  //@step 1
  def intersect_half_planes(constraints: list[HalfPlane]) -> list[Point]:
      feasible = create_canvas_bounds()

      for constraint in constraints:
          //@step 3
          forbidden = clip_polygon(create_canvas_bounds(), constraint, False)

          //@step 4
          feasible = clip_polygon(feasible, constraint, True)

          //@step 5
          if not feasible:
              return []

      //@step 6
      return feasible
  //#endregion intersect-half-planes

  //#region create-bounds helper collapsed
  def create_canvas_bounds() -> list[Point]:
      return [
          Point(6, 6),
          Point(94, 6),
          Point(94, 94),
          Point(6, 94),
      ]
  //#endregion create-bounds

  //#region clip-polygon helper collapsed
  def clip_polygon(
      polygon: list[Point],
      constraint: HalfPlane,
      keep_inside: bool,
  ) -> list[Point]:
      if not polygon:
          return []

      output: list[Point] = []
      epsilon = 1e-6

      for index, current in enumerate(polygon):
          previous = polygon[(index - 1) % len(polygon)]
          current_side = cross(constraint.start, constraint.end, current)
          previous_side = cross(constraint.start, constraint.end, previous)
          current_inside = current_side >= -epsilon if keep_inside else current_side <= epsilon
          previous_inside = previous_side >= -epsilon if keep_inside else previous_side <= epsilon

          if current_inside:
              if not previous_inside:
                  output.append(line_intersection(previous, current, constraint.start, constraint.end))
              output.append(current)
          elif previous_inside:
              output.append(line_intersection(previous, current, constraint.start, constraint.end))

      return output
  //#endregion clip-polygon

  //#region cross helper collapsed
  def cross(a: Point, b: Point, p: Point) -> float:
      return (b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x)
  //#endregion cross

  //#region line-intersection helper collapsed
  def line_intersection(s: Point, e: Point, a: Point, b: Point) -> Point:
      denominator = (s.x - e.x) * (a.y - b.y) - (s.y - e.y) * (a.x - b.x)
      if abs(denominator) < 1e-6:
          return Point(e.x, e.y)

      det1 = s.x * e.y - s.y * e.x
      det2 = a.x * b.y - a.y * b.x
      return Point(
          (det1 * (a.x - b.x) - (s.x - e.x) * det2) / denominator,
          (det1 * (a.y - b.y) - (s.y - e.y) * det2) / denominator,
      )
  //#endregion line-intersection
  `,
  'python',
);

const HALF_PLANE_CS = buildStructuredCode(
  `
  //#region point interface collapsed
  public readonly record struct Point(double X, double Y);
  public readonly record struct HalfPlane(Point Start, Point End);
  //#endregion point

  //#region intersect-half-planes function open
  /// <summary>
  /// Intersects directed half-planes by clipping a polygon.
  /// Input: lines whose feasible side is always on the left.
  /// Returns: the remaining feasible polygon.
  /// </summary>
  //@step 1
  public static List<Point> IntersectHalfPlanes(IReadOnlyList<HalfPlane> constraints)
  {
      var feasible = CreateCanvasBounds();

      foreach (var constraint in constraints)
      {
          //@step 3
          var forbidden = ClipPolygon(CreateCanvasBounds(), constraint, keepInside: false);
          //@step 4
          feasible = ClipPolygon(feasible, constraint, keepInside: true);

          //@step 5
          if (feasible.Count == 0)
          {
              return [];
          }
      }

      //@step 6
      return feasible;
  }
  //#endregion intersect-half-planes

  //#region create-bounds helper collapsed
  private static List<Point> CreateCanvasBounds()
  {
      return
      [
          new Point(6, 6),
          new Point(94, 6),
          new Point(94, 94),
          new Point(6, 94),
      ];
  }
  //#endregion create-bounds

  //#region clip-polygon helper collapsed
  private static List<Point> ClipPolygon(
      IReadOnlyList<Point> polygon,
      HalfPlane constraint,
      bool keepInside
  )
  {
      if (polygon.Count == 0)
      {
          return [];
      }

      var output = new List<Point>();
      const double epsilon = 1e-6;

      for (var index = 0; index < polygon.Count; index += 1)
      {
          var current = polygon[index];
          var previous = polygon[(index + polygon.Count - 1) % polygon.Count];
          var currentSide = Cross(constraint.Start, constraint.End, current);
          var previousSide = Cross(constraint.Start, constraint.End, previous);
          var currentInside = keepInside ? currentSide >= -epsilon : currentSide <= epsilon;
          var previousInside = keepInside ? previousSide >= -epsilon : previousSide <= epsilon;

          if (currentInside)
          {
              if (!previousInside)
              {
                  output.Add(LineIntersection(previous, current, constraint.Start, constraint.End));
              }

              output.Add(current);
          }
          else if (previousInside)
          {
              output.Add(LineIntersection(previous, current, constraint.Start, constraint.End));
          }
      }

      return output;
  }
  //#endregion clip-polygon

  //#region cross helper collapsed
  private static double Cross(Point a, Point b, Point p)
  {
      return (b.X - a.X) * (p.Y - a.Y) - (b.Y - a.Y) * (p.X - a.X);
  }
  //#endregion cross

  //#region line-intersection helper collapsed
  private static Point LineIntersection(Point s, Point e, Point a, Point b)
  {
      var denominator = (s.X - e.X) * (a.Y - b.Y) - (s.Y - e.Y) * (a.X - b.X);
      if (Math.Abs(denominator) < 1e-6)
      {
          return e;
      }

      var det1 = s.X * e.Y - s.Y * e.X;
      var det2 = a.X * b.Y - a.Y * b.X;
      return new Point(
          (det1 * (a.X - b.X) - (s.X - e.X) * det2) / denominator,
          (det1 * (a.Y - b.Y) - (s.Y - e.Y) * det2) / denominator
      );
  }
  //#endregion line-intersection
  `,
  'csharp',
);

const HALF_PLANE_JAVA = buildStructuredCode(
  `
  //#region point interface collapsed
  public record Point(double x, double y) {}
  public record HalfPlane(Point start, Point end) {}
  //#endregion point

  //#region intersect-half-planes function open
  /**
   * Intersects directed half-planes by clipping a polygon.
   * Input: lines whose feasible side is always on the left.
   * Returns: the remaining feasible polygon.
   */
  //@step 1
  public static List<Point> intersectHalfPlanes(List<HalfPlane> constraints) {
      List<Point> feasible = createCanvasBounds();

      for (HalfPlane constraint : constraints) {
          //@step 3
          List<Point> forbidden = clipPolygon(createCanvasBounds(), constraint, false);
          //@step 4
          feasible = clipPolygon(feasible, constraint, true);

          //@step 5
          if (feasible.isEmpty()) {
              return List.of();
          }
      }

      //@step 6
      return feasible;
  }
  //#endregion intersect-half-planes

  //#region create-bounds helper collapsed
  private static List<Point> createCanvasBounds() {
      return List.of(
          new Point(6, 6),
          new Point(94, 6),
          new Point(94, 94),
          new Point(6, 94)
      );
  }
  //#endregion create-bounds

  //#region clip-polygon helper collapsed
  private static List<Point> clipPolygon(
      List<Point> polygon,
      HalfPlane constraint,
      boolean keepInside
  ) {
      if (polygon.isEmpty()) {
          return List.of();
      }

      List<Point> output = new ArrayList<>();
      double epsilon = 1e-6;

      for (int index = 0; index < polygon.size(); index += 1) {
          Point current = polygon.get(index);
          Point previous = polygon.get((index + polygon.size() - 1) % polygon.size());
          double currentSide = cross(constraint.start(), constraint.end(), current);
          double previousSide = cross(constraint.start(), constraint.end(), previous);
          boolean currentInside = keepInside ? currentSide >= -epsilon : currentSide <= epsilon;
          boolean previousInside = keepInside ? previousSide >= -epsilon : previousSide <= epsilon;

          if (currentInside) {
              if (!previousInside) {
                  output.add(lineIntersection(previous, current, constraint.start(), constraint.end()));
              }

              output.add(current);
          } else if (previousInside) {
              output.add(lineIntersection(previous, current, constraint.start(), constraint.end()));
          }
      }

      return output;
  }
  //#endregion clip-polygon

  //#region cross helper collapsed
  private static double cross(Point a, Point b, Point p) {
      return (b.x() - a.x()) * (p.y() - a.y()) - (b.y() - a.y()) * (p.x() - a.x());
  }
  //#endregion cross

  //#region line-intersection helper collapsed
  private static Point lineIntersection(Point s, Point e, Point a, Point b) {
      double denominator = (s.x() - e.x()) * (a.y() - b.y()) - (s.y() - e.y()) * (a.x() - b.x());
      if (Math.abs(denominator) < 1e-6) {
          return e;
      }

      double det1 = s.x() * e.y() - s.y() * e.x();
      double det2 = a.x() * b.y() - a.y() * b.x();
      return new Point(
          (det1 * (a.x() - b.x()) - (s.x() - e.x()) * det2) / denominator,
          (det1 * (a.y() - b.y()) - (s.y() - e.y()) * det2) / denominator
      );
  }
  //#endregion line-intersection
  `,
  'java',
);

const HALF_PLANE_CPP = buildStructuredCode(
  `
  //#region point interface collapsed
  struct Point {
      double x;
      double y;
  };

  struct HalfPlane {
      Point start;
      Point end;
  };
  //#endregion point

  //#region intersect-half-planes function open
  /**
   * Intersects directed half-planes by clipping a polygon.
   * Input: lines whose feasible side is always on the left.
   * Returns: the remaining feasible polygon.
   */
  //@step 1
  std::vector<Point> intersectHalfPlanes(const std::vector<HalfPlane>& constraints) {
      auto feasible = createCanvasBounds();

      for (const auto& constraint : constraints) {
          //@step 3
          auto forbidden = clipPolygon(createCanvasBounds(), constraint, false);
          //@step 4
          feasible = clipPolygon(feasible, constraint, true);

          //@step 5
          if (feasible.empty()) {
              return {};
          }
      }

      //@step 6
      return feasible;
  }
  //#endregion intersect-half-planes

  //#region create-bounds helper collapsed
  std::vector<Point> createCanvasBounds() {
      return {
          {6, 6},
          {94, 6},
          {94, 94},
          {6, 94},
      };
  }
  //#endregion create-bounds

  //#region clip-polygon helper collapsed
  std::vector<Point> clipPolygon(
      const std::vector<Point>& polygon,
      const HalfPlane& constraint,
      bool keepInside
  ) {
      if (polygon.empty()) {
          return {};
      }

      std::vector<Point> output;
      constexpr double epsilon = 1e-6;

      for (std::size_t index = 0; index < polygon.size(); index += 1) {
          const Point& current = polygon[index];
          const Point& previous = polygon[(index + polygon.size() - 1) % polygon.size()];
          double currentSide = cross(constraint.start, constraint.end, current);
          double previousSide = cross(constraint.start, constraint.end, previous);
          bool currentInside = keepInside ? currentSide >= -epsilon : currentSide <= epsilon;
          bool previousInside = keepInside ? previousSide >= -epsilon : previousSide <= epsilon;

          if (currentInside) {
              if (!previousInside) {
                  output.push_back(lineIntersection(previous, current, constraint.start, constraint.end));
              }

              output.push_back(current);
          } else if (previousInside) {
              output.push_back(lineIntersection(previous, current, constraint.start, constraint.end));
          }
      }

      return output;
  }
  //#endregion clip-polygon

  //#region cross helper collapsed
  double cross(const Point& a, const Point& b, const Point& p) {
      return (b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x);
  }
  //#endregion cross

  //#region line-intersection helper collapsed
  Point lineIntersection(const Point& s, const Point& e, const Point& a, const Point& b) {
      double denominator = (s.x - e.x) * (a.y - b.y) - (s.y - e.y) * (a.x - b.x);
      if (std::abs(denominator) < 1e-6) {
          return e;
      }

      double det1 = s.x * e.y - s.y * e.x;
      double det2 = a.x * b.y - a.y * b.x;
      return {
          (det1 * (a.x - b.x) - (s.x - e.x) * det2) / denominator,
          (det1 * (a.y - b.y) - (s.y - e.y) * det2) / denominator,
      };
  }
  //#endregion line-intersection
  `,
  'cpp',
);

export const HALF_PLANE_INTERSECTION_CODE = HALF_PLANE_TS.lines;
export const HALF_PLANE_INTERSECTION_CODE_REGIONS = HALF_PLANE_TS.regions;
export const HALF_PLANE_INTERSECTION_CODE_HIGHLIGHT_MAP = HALF_PLANE_TS.highlightMap;
export const HALF_PLANE_INTERSECTION_CODE_VARIANTS: CodeVariantMap = {
  typescript: {
    language: 'typescript',
    lines: HALF_PLANE_TS.lines,
    regions: HALF_PLANE_TS.regions,
    highlightMap: HALF_PLANE_TS.highlightMap,
    source: HALF_PLANE_TS.source,
  },
  python: {
    language: 'python',
    lines: HALF_PLANE_PY.lines,
    regions: HALF_PLANE_PY.regions,
    highlightMap: HALF_PLANE_PY.highlightMap,
    source: HALF_PLANE_PY.source,
  },
  csharp: {
    language: 'csharp',
    lines: HALF_PLANE_CS.lines,
    regions: HALF_PLANE_CS.regions,
    highlightMap: HALF_PLANE_CS.highlightMap,
    source: HALF_PLANE_CS.source,
  },
  java: {
    language: 'java',
    lines: HALF_PLANE_JAVA.lines,
    regions: HALF_PLANE_JAVA.regions,
    highlightMap: HALF_PLANE_JAVA.highlightMap,
    source: HALF_PLANE_JAVA.source,
  },
  cpp: {
    language: 'cpp',
    lines: HALF_PLANE_CPP.lines,
    regions: HALF_PLANE_CPP.regions,
    highlightMap: HALF_PLANE_CPP.highlightMap,
    source: HALF_PLANE_CPP.source,
  },
};
