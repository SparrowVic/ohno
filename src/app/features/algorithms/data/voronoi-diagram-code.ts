import { CodeVariantMap } from '../models/detail';
import { buildStructuredCode } from './code-line-builder';

const VORONOI_DIAGRAM_TS = buildStructuredCode(`
  //#region point interface collapsed
  interface Point {
    readonly x: number;
    readonly y: number;
  }
  //#endregion point

  //#region bounds type collapsed
  type Bounds = readonly [
    minX: number,
    minY: number,
    maxX: number,
    maxY: number,
  ];
  //#endregion bounds

  //#region cell interface collapsed
  interface Cell {
    readonly site: Point;
    readonly polygon: Point[];
  }
  //#endregion cell

  //#region delaunay type collapsed
  declare const Delaunay: {
    from(
      points: readonly Point[],
      getX: (point: Point) => number,
      getY: (point: Point) => number,
    ): {
      voronoi(bounds: Bounds): {
        cellPolygon(index: number): readonly [number, number][] | null;
      };
    };
  };
  //#endregion delaunay

  /**
   * Build clipped Voronoi cells from a site set.
   * Input: planar sites.
   * Returns: one polygonal Voronoi cell per surviving site.
   */
  //#region build-voronoi function open
  //@step 1
  function buildVoronoiDiagram(
    sites: readonly Point[],
    bounds: Bounds = [4, 4, 96, 96],
  ): Cell[] {
    const delaunay = Delaunay.from(sites, (site) => site.x, (site) => site.y);
    const voronoi = delaunay.voronoi(bounds);

    const cells = sites.map((site, index) => ({
      site,
      polygon: normalizeCell(voronoi.cellPolygon(index) ?? []),
    }));

    //@step 3
    const clipped = cells.map((cell) => ({
      ...cell,
      polygon: clipPolygonToBounds(cell.polygon, bounds),
    }));

    //@step 4
    const validCells = clipped.filter((cell) => cell.polygon.length >= 3);

    //@step 5
    return validCells;
  }
  //#endregion build-voronoi

  //#region normalize-cell helper collapsed
  function normalizeCell(polygon: readonly [number, number][]): Point[] {
    const points = polygon.map(([x, y]) => ({ x, y }));
    const first = points[0];
    const last = points[points.length - 1];

    if (first && last && first.x === last.x && first.y === last.y) {
      return points.slice(0, -1);
    }

    return points;
  }
  //#endregion normalize-cell

  //#region clip-bounds helper collapsed
  function clipPolygonToBounds(polygon: readonly Point[], bounds: Bounds): Point[] {
    const [x0, y0, x1, y1] = bounds;
    return polygon.filter(
      (point) => point.x >= x0 && point.x <= x1 && point.y >= y0 && point.y <= y1,
    );
  }
  //#endregion clip-bounds
`);

const VORONOI_DIAGRAM_PY = buildStructuredCode(
  `
  //#region point interface collapsed
  from dataclasses import dataclass
  from typing import Protocol


  @dataclass(frozen=True)
  class Point:
      x: float
      y: float


  Bounds = tuple[float, float, float, float]


  @dataclass(frozen=True)
  class Cell:
      site: Point
      polygon: list[Point]


  class VoronoiBackend(Protocol):
      def cell_polygon(self, index: int) -> list[tuple[float, float]] | None: ...


  class DelaunayBuilder(Protocol):
      def voronoi(self, sites: list[Point], bounds: Bounds) -> VoronoiBackend: ...
  //#endregion point

  """
  Build clipped Voronoi cells from a site set.
  Input: planar sites.
  Returns: one polygonal Voronoi cell per surviving site.
  """
  //#region build-voronoi function open
  //@step 1
  def build_voronoi_diagram(
      sites: list[Point],
      builder: DelaunayBuilder,
      bounds: Bounds = (4, 4, 96, 96),
  ) -> list[Cell]:
      voronoi = builder.voronoi(sites, bounds)
      cells = [
          Cell(site=site, polygon=normalize_cell(voronoi.cell_polygon(index) or []))
          for index, site in enumerate(sites)
      ]

      //@step 3
      clipped = [
          Cell(site=cell.site, polygon=clip_polygon_to_bounds(cell.polygon, bounds))
          for cell in cells
      ]

      //@step 4
      valid_cells = [cell for cell in clipped if len(cell.polygon) >= 3]

      //@step 5
      return valid_cells
  //#endregion build-voronoi

  //#region normalize-cell helper collapsed
  def normalize_cell(polygon: list[tuple[float, float]]) -> list[Point]:
      points = [Point(x, y) for x, y in polygon]
      if points and points[0] == points[-1]:
          return points[:-1]
      return points
  //#endregion normalize-cell

  //#region clip-bounds helper collapsed
  def clip_polygon_to_bounds(polygon: list[Point], bounds: Bounds) -> list[Point]:
      x0, y0, x1, y1 = bounds
      return [
          point
          for point in polygon
          if x0 <= point.x <= x1 and y0 <= point.y <= y1
      ]
  //#endregion clip-bounds
  `,
  'python',
);

const VORONOI_DIAGRAM_CS = buildStructuredCode(
  `
  //#region point interface collapsed
  public readonly record struct Point(double X, double Y);
  public readonly record struct Bounds(double MinX, double MinY, double MaxX, double MaxY);
  public sealed record Cell(Point Site, List<Point> Polygon);
  public interface IVoronoiBackend
  {
      IReadOnlyList<(double X, double Y)>? CellPolygon(int index);
  }

  public interface IDelaunayBuilder
  {
      IVoronoiBackend Voronoi(IReadOnlyList<Point> sites, Bounds bounds);
  }
  //#endregion point

  //#region build-voronoi function open
  /// <summary>
  /// Builds clipped Voronoi cells from a site set.
  /// Input: planar sites.
  /// Returns: one polygonal Voronoi cell per surviving site.
  /// </summary>
  //@step 1
  public static List<Cell> BuildVoronoiDiagram(
      IReadOnlyList<Point> sites,
      IDelaunayBuilder builder,
      Bounds? bounds = null
  )
  {
      var clipBounds = bounds ?? new Bounds(4, 4, 96, 96);
      var voronoi = builder.Voronoi(sites, clipBounds);
      var cells = sites.Select((site, index) =>
          new Cell(site, NormalizeCell(voronoi.CellPolygon(index) ?? []))
      ).ToList();

      //@step 3
      var clipped = cells
          .Select(cell => cell with { Polygon = ClipPolygonToBounds(cell.Polygon, clipBounds) })
          .ToList();

      //@step 4
      var validCells = clipped.Where(cell => cell.Polygon.Count >= 3).ToList();

      //@step 5
      return validCells;
  }
  //#endregion build-voronoi

  //#region normalize-cell helper collapsed
  private static List<Point> NormalizeCell(IReadOnlyList<(double X, double Y)> polygon)
  {
      var points = polygon.Select(vertex => new Point(vertex.X, vertex.Y)).ToList();
      if (points.Count > 1 && points[0].Equals(points[^1]))
      {
          points.RemoveAt(points.Count - 1);
      }

      return points;
  }
  //#endregion normalize-cell

  //#region clip-bounds helper collapsed
  private static List<Point> ClipPolygonToBounds(IReadOnlyList<Point> polygon, Bounds bounds)
  {
      return polygon
          .Where(point =>
              point.X >= bounds.MinX &&
              point.X <= bounds.MaxX &&
              point.Y >= bounds.MinY &&
              point.Y <= bounds.MaxY)
          .ToList();
  }
  //#endregion clip-bounds
  `,
  'csharp',
);

const VORONOI_DIAGRAM_JAVA = buildStructuredCode(
  `
  //#region point interface collapsed
  public record Point(double x, double y) {}
  public record Bounds(double minX, double minY, double maxX, double maxY) {}
  public record Cell(Point site, List<Point> polygon) {}

  public interface VoronoiBackend {
      List<double[]> cellPolygon(int index);
  }

  public interface DelaunayBuilder {
      VoronoiBackend voronoi(List<Point> sites, Bounds bounds);
  }
  //#endregion point

  //#region build-voronoi function open
  /**
   * Builds clipped Voronoi cells from a site set.
   * Input: planar sites.
   * Returns: one polygonal Voronoi cell per surviving site.
   */
  //@step 1
  public static List<Cell> buildVoronoiDiagram(
      List<Point> sites,
      DelaunayBuilder builder,
      Bounds bounds
  ) {
      Bounds clipBounds = bounds == null ? new Bounds(4, 4, 96, 96) : bounds;
      VoronoiBackend voronoi = builder.voronoi(sites, clipBounds);
      List<Cell> cells = new ArrayList<>();
      for (int index = 0; index < sites.size(); index += 1) {
          cells.add(new Cell(sites.get(index), normalizeCell(voronoi.cellPolygon(index))));
      }

      //@step 3
      List<Cell> clipped = cells.stream()
          .map(cell -> new Cell(cell.site(), clipPolygonToBounds(cell.polygon(), clipBounds)))
          .toList();

      //@step 4
      List<Cell> validCells = clipped.stream()
          .filter(cell -> cell.polygon().size() >= 3)
          .toList();

      //@step 5
      return validCells;
  }
  //#endregion build-voronoi

  //#region normalize-cell helper collapsed
  private static List<Point> normalizeCell(List<double[]> polygon) {
      if (polygon == null) {
          return List.of();
      }

      List<Point> points = polygon.stream()
          .map(vertex -> new Point(vertex[0], vertex[1]))
          .collect(Collectors.toCollection(ArrayList::new));

      if (points.size() > 1 && points.get(0).equals(points.get(points.size() - 1))) {
          points.remove(points.size() - 1);
      }

      return points;
  }
  //#endregion normalize-cell

  //#region clip-bounds helper collapsed
  private static List<Point> clipPolygonToBounds(List<Point> polygon, Bounds bounds) {
      return polygon.stream()
          .filter(point ->
              point.x() >= bounds.minX() &&
              point.x() <= bounds.maxX() &&
              point.y() >= bounds.minY() &&
              point.y() <= bounds.maxY())
          .toList();
  }
  //#endregion clip-bounds
  `,
  'java',
);

const VORONOI_DIAGRAM_CPP = buildStructuredCode(
  `
  //#region point interface collapsed
  struct Point {
      double x;
      double y;
  };

  struct Bounds {
      double minX;
      double minY;
      double maxX;
      double maxY;
  };

  struct Cell {
      Point site;
      std::vector<Point> polygon;
  };

  struct VoronoiBackend {
      virtual std::vector<std::array<double, 2>> cellPolygon(int index) const = 0;
      virtual ~VoronoiBackend() = default;
  };

  struct DelaunayBuilder {
      virtual std::unique_ptr<VoronoiBackend> voronoi(
          const std::vector<Point>& sites,
          const Bounds& bounds
      ) const = 0;
      virtual ~DelaunayBuilder() = default;
  };
  //#endregion point

  //#region build-voronoi function open
  /**
   * Builds clipped Voronoi cells from a site set.
   * Input: planar sites.
   * Returns: one polygonal Voronoi cell per surviving site.
   */
  //@step 1
  std::vector<Cell> buildVoronoiDiagram(
      const std::vector<Point>& sites,
      const DelaunayBuilder& builder,
      Bounds bounds = {4, 4, 96, 96}
  ) {
      auto voronoi = builder.voronoi(sites, bounds);
      std::vector<Cell> cells;
      cells.reserve(sites.size());
      for (int index = 0; index < static_cast<int>(sites.size()); index += 1) {
          cells.push_back({sites[index], normalizeCell(voronoi->cellPolygon(index))});
      }

      //@step 3
      std::vector<Cell> clipped;
      clipped.reserve(cells.size());
      for (const auto& cell : cells) {
          clipped.push_back({cell.site, clipPolygonToBounds(cell.polygon, bounds)});
      }

      //@step 4
      std::vector<Cell> validCells;
      for (const auto& cell : clipped) {
          if (cell.polygon.size() >= 3) {
              validCells.push_back(cell);
          }
      }

      //@step 5
      return validCells;
  }
  //#endregion build-voronoi

  //#region normalize-cell helper collapsed
  std::vector<Point> normalizeCell(const std::vector<std::array<double, 2>>& polygon) {
      std::vector<Point> points;
      points.reserve(polygon.size());
      for (const auto& vertex : polygon) {
          points.push_back({vertex[0], vertex[1]});
      }

      if (points.size() > 1 && points.front().x == points.back().x && points.front().y == points.back().y) {
          points.pop_back();
      }

      return points;
  }
  //#endregion normalize-cell

  //#region clip-bounds helper collapsed
  std::vector<Point> clipPolygonToBounds(const std::vector<Point>& polygon, const Bounds& bounds) {
      std::vector<Point> clipped;
      for (const auto& point : polygon) {
          if (
              point.x >= bounds.minX &&
              point.x <= bounds.maxX &&
              point.y >= bounds.minY &&
              point.y <= bounds.maxY
          ) {
              clipped.push_back(point);
          }
      }

      return clipped;
  }
  //#endregion clip-bounds
  `,
  'cpp',
);

export const VORONOI_DIAGRAM_CODE = VORONOI_DIAGRAM_TS.lines;
export const VORONOI_DIAGRAM_CODE_REGIONS = VORONOI_DIAGRAM_TS.regions;
export const VORONOI_DIAGRAM_CODE_HIGHLIGHT_MAP = VORONOI_DIAGRAM_TS.highlightMap;
export const VORONOI_DIAGRAM_CODE_VARIANTS: CodeVariantMap = {
  typescript: {
    language: 'typescript',
    lines: VORONOI_DIAGRAM_TS.lines,
    regions: VORONOI_DIAGRAM_TS.regions,
    highlightMap: VORONOI_DIAGRAM_TS.highlightMap,
    source: VORONOI_DIAGRAM_TS.source,
  },
  python: {
    language: 'python',
    lines: VORONOI_DIAGRAM_PY.lines,
    regions: VORONOI_DIAGRAM_PY.regions,
    highlightMap: VORONOI_DIAGRAM_PY.highlightMap,
    source: VORONOI_DIAGRAM_PY.source,
  },
  csharp: {
    language: 'csharp',
    lines: VORONOI_DIAGRAM_CS.lines,
    regions: VORONOI_DIAGRAM_CS.regions,
    highlightMap: VORONOI_DIAGRAM_CS.highlightMap,
    source: VORONOI_DIAGRAM_CS.source,
  },
  java: {
    language: 'java',
    lines: VORONOI_DIAGRAM_JAVA.lines,
    regions: VORONOI_DIAGRAM_JAVA.regions,
    highlightMap: VORONOI_DIAGRAM_JAVA.highlightMap,
    source: VORONOI_DIAGRAM_JAVA.source,
  },
  cpp: {
    language: 'cpp',
    lines: VORONOI_DIAGRAM_CPP.lines,
    regions: VORONOI_DIAGRAM_CPP.regions,
    highlightMap: VORONOI_DIAGRAM_CPP.highlightMap,
    source: VORONOI_DIAGRAM_CPP.source,
  },
};
