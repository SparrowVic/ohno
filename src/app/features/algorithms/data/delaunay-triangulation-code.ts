import { CodeVariantMap } from '../models/detail';
import { buildStructuredCode } from './code-line-builder';

const DELAUNAY_TRIANGULATION_TS = buildStructuredCode(`
  //#region point interface collapsed
  interface Point {
    readonly x: number;
    readonly y: number;
  }
  //#endregion point

  //#region circle interface collapsed
  interface Circle {
    readonly cx: number;
    readonly cy: number;
    readonly r: number;
  }
  //#endregion circle

  //#region triangle interface collapsed
  interface Triangle {
    readonly vertices: readonly [number, number, number];
    readonly circle: Circle;
  }
  //#endregion triangle

  //#region delaunay type collapsed
  declare const Delaunay: {
    from(
      points: readonly Point[],
      getX: (point: Point) => number,
      getY: (point: Point) => number,
    ): {
      triangles: ArrayLike<number>;
    };
  };
  //#endregion delaunay

  /**
   * Build the Delaunay triangle mesh for planar sites.
   * Input: planar points.
   * Returns: triangles whose circumcircles define the mesh.
   */
  //#region build-delaunay function open
  //@step 1
  function buildDelaunayTriangulation(points: readonly Point[]): Triangle[] {
    const delaunay = Delaunay.from(points, (point) => point.x, (point) => point.y);

    //@step 3
    const triangles = chunkTriangles(delaunay.triangles).map(([a, b, c]) =>
      createTriangle(points, a, b, c),
    );

    //@step 4
    const mesh = triangles.filter((triangle) => isLocallyDelaunay(triangle, points));

    //@step 5
    return mesh;
  }
  //#endregion build-delaunay

  //#region chunk-triangles helper collapsed
  function chunkTriangles(triangles: ArrayLike<number>): Array<[number, number, number]> {
    const result: Array<[number, number, number]> = [];

    for (let index = 0; index < triangles.length; index += 3) {
      result.push([triangles[index]!, triangles[index + 1]!, triangles[index + 2]!]);
    }

    return result;
  }
  //#endregion chunk-triangles

  //#region create-triangle helper collapsed
  function createTriangle(
    points: readonly Point[],
    a: number,
    b: number,
    c: number,
  ): Triangle {
    return {
      vertices: [a, b, c],
      circle: circumcircle(points[a]!, points[b]!, points[c]!),
    };
  }
  //#endregion create-triangle

  //#region circumcircle helper collapsed
  function circumcircle(a: Point, b: Point, c: Point): Circle {
    const determinant =
      2 * (a.x * (b.y - c.y) + b.x * (c.y - a.y) + c.x * (a.y - b.y));

    if (Math.abs(determinant) < 1e-6) {
      const cx = (a.x + b.x + c.x) / 3;
      const cy = (a.y + b.y + c.y) / 3;

      return {
        cx,
        cy,
        r: Math.max(
          Math.hypot(cx - a.x, cy - a.y),
          Math.hypot(cx - b.x, cy - b.y),
          Math.hypot(cx - c.x, cy - c.y),
        ),
      };
    }

    const ux =
      ((a.x ** 2 + a.y ** 2) * (b.y - c.y) +
        (b.x ** 2 + b.y ** 2) * (c.y - a.y) +
        (c.x ** 2 + c.y ** 2) * (a.y - b.y)) /
      determinant;
    const uy =
      ((a.x ** 2 + a.y ** 2) * (c.x - b.x) +
        (b.x ** 2 + b.y ** 2) * (a.x - c.x) +
        (c.x ** 2 + c.y ** 2) * (b.x - a.x)) /
      determinant;

    return {
      cx: ux,
      cy: uy,
      r: Math.hypot(ux - a.x, uy - a.y),
    };
  }
  //#endregion circumcircle

  //#region local-delaunay helper collapsed
  function isLocallyDelaunay(_triangle: Triangle, _points: readonly Point[]): boolean {
    return true;
  }
  //#endregion local-delaunay
`);

const DELAUNAY_TRIANGULATION_PY = buildStructuredCode(
  `
  //#region point interface collapsed
  from dataclasses import dataclass
  from typing import Protocol
  import math


  @dataclass(frozen=True)
  class Point:
      x: float
      y: float


  @dataclass(frozen=True)
  class Circle:
      cx: float
      cy: float
      r: float


  @dataclass(frozen=True)
  class Triangle:
      vertices: tuple[int, int, int]
      circle: Circle


  class DelaunayBackend(Protocol):
      def triangles(self, points: list[Point]) -> list[tuple[int, int, int]]: ...
  //#endregion point

  """
  Build the Delaunay triangle mesh for planar sites.
  Input: planar points.
  Returns: triangles whose circumcircles define the mesh.
  """
  //#region build-delaunay function open
  //@step 1
  def build_delaunay_triangulation(
      points: list[Point],
      backend: DelaunayBackend,
  ) -> list[Triangle]:
      raw_triangles = backend.triangles(points)

      //@step 3
      triangles = [create_triangle(points, a, b, c) for a, b, c in raw_triangles]

      //@step 4
      mesh = [triangle for triangle in triangles if is_locally_delaunay(triangle, points)]

      //@step 5
      return mesh
  //#endregion build-delaunay

  //#region create-triangle helper collapsed
  def create_triangle(points: list[Point], a: int, b: int, c: int) -> Triangle:
      return Triangle(vertices=(a, b, c), circle=circumcircle(points[a], points[b], points[c]))
  //#endregion create-triangle

  //#region circumcircle helper collapsed
  def circumcircle(a: Point, b: Point, c: Point) -> Circle:
      determinant = 2 * (a.x * (b.y - c.y) + b.x * (c.y - a.y) + c.x * (a.y - b.y))
      if abs(determinant) < 1e-6:
          cx = (a.x + b.x + c.x) / 3
          cy = (a.y + b.y + c.y) / 3
          return Circle(
              cx=cx,
              cy=cy,
              r=max(
                  math.hypot(cx - a.x, cy - a.y),
                  math.hypot(cx - b.x, cy - b.y),
                  math.hypot(cx - c.x, cy - c.y),
              ),
          )

      ux = (
          (a.x ** 2 + a.y ** 2) * (b.y - c.y) +
          (b.x ** 2 + b.y ** 2) * (c.y - a.y) +
          (c.x ** 2 + c.y ** 2) * (a.y - b.y)
      ) / determinant
      uy = (
          (a.x ** 2 + a.y ** 2) * (c.x - b.x) +
          (b.x ** 2 + b.y ** 2) * (a.x - c.x) +
          (c.x ** 2 + c.y ** 2) * (b.x - a.x)
      ) / determinant
      return Circle(cx=ux, cy=uy, r=math.hypot(ux - a.x, uy - a.y))
  //#endregion circumcircle

  //#region local-delaunay helper collapsed
  def is_locally_delaunay(_triangle: Triangle, _points: list[Point]) -> bool:
      return True
  //#endregion local-delaunay
  `,
  'python',
);

const DELAUNAY_TRIANGULATION_CS = buildStructuredCode(
  `
  //#region point interface collapsed
  public readonly record struct Point(double X, double Y);
  public readonly record struct Circle(double Cx, double Cy, double R);
  public readonly record struct Triangle((int A, int B, int C) Vertices, Circle Circle);

  public interface IDelaunayBackend
  {
      IReadOnlyList<(int A, int B, int C)> Triangles(IReadOnlyList<Point> points);
  }
  //#endregion point

  //#region build-delaunay function open
  /// <summary>
  /// Builds the Delaunay triangle mesh for planar sites.
  /// Input: planar points.
  /// Returns: triangles whose circumcircles define the mesh.
  /// </summary>
  //@step 1
  public static List<Triangle> BuildDelaunayTriangulation(
      IReadOnlyList<Point> points,
      IDelaunayBackend backend
  )
  {
      var rawTriangles = backend.Triangles(points);

      //@step 3
      var triangles = rawTriangles
          .Select(entry => CreateTriangle(points, entry.A, entry.B, entry.C))
          .ToList();

      //@step 4
      var mesh = triangles
          .Where(triangle => IsLocallyDelaunay(triangle, points))
          .ToList();

      //@step 5
      return mesh;
  }
  //#endregion build-delaunay

  //#region create-triangle helper collapsed
  private static Triangle CreateTriangle(IReadOnlyList<Point> points, int a, int b, int c)
  {
      return new Triangle((a, b, c), Circumcircle(points[a], points[b], points[c]));
  }
  //#endregion create-triangle

  //#region circumcircle helper collapsed
  private static Circle Circumcircle(Point a, Point b, Point c)
  {
      var determinant = 2 * (a.X * (b.Y - c.Y) + b.X * (c.Y - a.Y) + c.X * (a.Y - b.Y));
      if (Math.Abs(determinant) < 1e-6)
      {
          var cx = (a.X + b.X + c.X) / 3.0;
          var cy = (a.Y + b.Y + c.Y) / 3.0;
          return new Circle(
              cx,
              cy,
              Math.Max(
                  Math.Max(Math.Hypot(cx - a.X, cy - a.Y), Math.Hypot(cx - b.X, cy - b.Y)),
                  Math.Hypot(cx - c.X, cy - c.Y)
              )
          );
      }

      var ux = (
          (a.X * a.X + a.Y * a.Y) * (b.Y - c.Y) +
          (b.X * b.X + b.Y * b.Y) * (c.Y - a.Y) +
          (c.X * c.X + c.Y * c.Y) * (a.Y - b.Y)
      ) / determinant;
      var uy = (
          (a.X * a.X + a.Y * a.Y) * (c.X - b.X) +
          (b.X * b.X + b.Y * b.Y) * (a.X - c.X) +
          (c.X * c.X + c.Y * c.Y) * (b.X - a.X)
      ) / determinant;
      return new Circle(ux, uy, Math.Hypot(ux - a.X, uy - a.Y));
  }
  //#endregion circumcircle

  //#region local-delaunay helper collapsed
  private static bool IsLocallyDelaunay(Triangle _triangle, IReadOnlyList<Point> _points)
  {
      return true;
  }
  //#endregion local-delaunay
  `,
  'csharp',
);

const DELAUNAY_TRIANGULATION_JAVA = buildStructuredCode(
  `
  //#region point interface collapsed
  public record Point(double x, double y) {}
  public record Circle(double cx, double cy, double r) {}
  public record Triangle(int a, int b, int c, Circle circle) {}

  public interface DelaunayBackend {
      List<int[]> triangles(List<Point> points);
  }
  //#endregion point

  //#region build-delaunay function open
  /**
   * Builds the Delaunay triangle mesh for planar sites.
   * Input: planar points.
   * Returns: triangles whose circumcircles define the mesh.
   */
  //@step 1
  public static List<Triangle> buildDelaunayTriangulation(
      List<Point> points,
      DelaunayBackend backend
  ) {
      List<int[]> rawTriangles = backend.triangles(points);

      //@step 3
      List<Triangle> triangles = rawTriangles.stream()
          .map(entry -> createTriangle(points, entry[0], entry[1], entry[2]))
          .toList();

      //@step 4
      List<Triangle> mesh = triangles.stream()
          .filter(triangle -> isLocallyDelaunay(triangle, points))
          .toList();

      //@step 5
      return mesh;
  }
  //#endregion build-delaunay

  //#region create-triangle helper collapsed
  private static Triangle createTriangle(List<Point> points, int a, int b, int c) {
      return new Triangle(a, b, c, circumcircle(points.get(a), points.get(b), points.get(c)));
  }
  //#endregion create-triangle

  //#region circumcircle helper collapsed
  private static Circle circumcircle(Point a, Point b, Point c) {
      double determinant = 2 * (a.x() * (b.y() - c.y()) + b.x() * (c.y() - a.y()) + c.x() * (a.y() - b.y()));
      if (Math.abs(determinant) < 1e-6) {
          double cx = (a.x() + b.x() + c.x()) / 3.0;
          double cy = (a.y() + b.y() + c.y()) / 3.0;
          return new Circle(
              cx,
              cy,
              Math.max(
                  Math.max(Math.hypot(cx - a.x(), cy - a.y()), Math.hypot(cx - b.x(), cy - b.y())),
                  Math.hypot(cx - c.x(), cy - c.y())
              )
          );
      }

      double ux = (
          (a.x() * a.x() + a.y() * a.y()) * (b.y() - c.y()) +
          (b.x() * b.x() + b.y() * b.y()) * (c.y() - a.y()) +
          (c.x() * c.x() + c.y() * c.y()) * (a.y() - b.y())
      ) / determinant;
      double uy = (
          (a.x() * a.x() + a.y() * a.y()) * (c.x() - b.x()) +
          (b.x() * b.x() + b.y() * b.y()) * (a.x() - c.x()) +
          (c.x() * c.x() + c.y() * c.y()) * (b.x() - a.x())
      ) / determinant;
      return new Circle(ux, uy, Math.hypot(ux - a.x(), uy - a.y()));
  }
  //#endregion circumcircle

  //#region local-delaunay helper collapsed
  private static boolean isLocallyDelaunay(Triangle _triangle, List<Point> _points) {
      return true;
  }
  //#endregion local-delaunay
  `,
  'java',
);

const DELAUNAY_TRIANGULATION_CPP = buildStructuredCode(
  `
  //#region point interface collapsed
  struct Point {
      double x;
      double y;
  };

  struct Circle {
      double cx;
      double cy;
      double r;
  };

  struct Triangle {
      std::array<int, 3> vertices;
      Circle circle;
  };

  struct DelaunayBackend {
      virtual std::vector<std::array<int, 3>> triangles(const std::vector<Point>& points) const = 0;
      virtual ~DelaunayBackend() = default;
  };
  //#endregion point

  //#region build-delaunay function open
  /**
   * Builds the Delaunay triangle mesh for planar sites.
   * Input: planar points.
   * Returns: triangles whose circumcircles define the mesh.
   */
  //@step 1
  std::vector<Triangle> buildDelaunayTriangulation(
      const std::vector<Point>& points,
      const DelaunayBackend& backend
  ) {
      auto rawTriangles = backend.triangles(points);

      //@step 3
      std::vector<Triangle> triangles;
      triangles.reserve(rawTriangles.size());
      for (const auto& entry : rawTriangles) {
          triangles.push_back(createTriangle(points, entry[0], entry[1], entry[2]));
      }

      //@step 4
      std::vector<Triangle> mesh;
      for (const auto& triangle : triangles) {
          if (isLocallyDelaunay(triangle, points)) {
              mesh.push_back(triangle);
          }
      }

      //@step 5
      return mesh;
  }
  //#endregion build-delaunay

  //#region create-triangle helper collapsed
  Triangle createTriangle(const std::vector<Point>& points, int a, int b, int c) {
      return {{a, b, c}, circumcircle(points[a], points[b], points[c])};
  }
  //#endregion create-triangle

  //#region circumcircle helper collapsed
  Circle circumcircle(const Point& a, const Point& b, const Point& c) {
      double determinant = 2 * (a.x * (b.y - c.y) + b.x * (c.y - a.y) + c.x * (a.y - b.y));
      if (std::abs(determinant) < 1e-6) {
          double cx = (a.x + b.x + c.x) / 3.0;
          double cy = (a.y + b.y + c.y) / 3.0;
          return {
              cx,
              cy,
              std::max(
                  std::max(std::hypot(cx - a.x, cy - a.y), std::hypot(cx - b.x, cy - b.y)),
                  std::hypot(cx - c.x, cy - c.y)
              )
          };
      }

      double ux = (
          (a.x * a.x + a.y * a.y) * (b.y - c.y) +
          (b.x * b.x + b.y * b.y) * (c.y - a.y) +
          (c.x * c.x + c.y * c.y) * (a.y - b.y)
      ) / determinant;
      double uy = (
          (a.x * a.x + a.y * a.y) * (c.x - b.x) +
          (b.x * b.x + b.y * b.y) * (a.x - c.x) +
          (c.x * c.x + c.y * c.y) * (b.x - a.x)
      ) / determinant;
      return {ux, uy, std::hypot(ux - a.x, uy - a.y)};
  }
  //#endregion circumcircle

  //#region local-delaunay helper collapsed
  bool isLocallyDelaunay(const Triangle& _triangle, const std::vector<Point>& _points) {
      return true;
  }
  //#endregion local-delaunay
  `,
  'cpp',
);

export const DELAUNAY_TRIANGULATION_CODE = DELAUNAY_TRIANGULATION_TS.lines;
export const DELAUNAY_TRIANGULATION_CODE_REGIONS = DELAUNAY_TRIANGULATION_TS.regions;
export const DELAUNAY_TRIANGULATION_CODE_HIGHLIGHT_MAP = DELAUNAY_TRIANGULATION_TS.highlightMap;
export const DELAUNAY_TRIANGULATION_CODE_VARIANTS: CodeVariantMap = {
  typescript: {
    language: 'typescript',
    lines: DELAUNAY_TRIANGULATION_TS.lines,
    regions: DELAUNAY_TRIANGULATION_TS.regions,
    highlightMap: DELAUNAY_TRIANGULATION_TS.highlightMap,
    source: DELAUNAY_TRIANGULATION_TS.source,
  },
  python: {
    language: 'python',
    lines: DELAUNAY_TRIANGULATION_PY.lines,
    regions: DELAUNAY_TRIANGULATION_PY.regions,
    highlightMap: DELAUNAY_TRIANGULATION_PY.highlightMap,
    source: DELAUNAY_TRIANGULATION_PY.source,
  },
  csharp: {
    language: 'csharp',
    lines: DELAUNAY_TRIANGULATION_CS.lines,
    regions: DELAUNAY_TRIANGULATION_CS.regions,
    highlightMap: DELAUNAY_TRIANGULATION_CS.highlightMap,
    source: DELAUNAY_TRIANGULATION_CS.source,
  },
  java: {
    language: 'java',
    lines: DELAUNAY_TRIANGULATION_JAVA.lines,
    regions: DELAUNAY_TRIANGULATION_JAVA.regions,
    highlightMap: DELAUNAY_TRIANGULATION_JAVA.highlightMap,
    source: DELAUNAY_TRIANGULATION_JAVA.source,
  },
  cpp: {
    language: 'cpp',
    lines: DELAUNAY_TRIANGULATION_CPP.lines,
    regions: DELAUNAY_TRIANGULATION_CPP.regions,
    highlightMap: DELAUNAY_TRIANGULATION_CPP.highlightMap,
    source: DELAUNAY_TRIANGULATION_CPP.source,
  },
};
