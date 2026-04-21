import { CodeVariantMap } from '../models/detail';
import { buildStructuredCode } from './code-line-builder/code-line-builder';

const MINKOWSKI_SUM_TS = buildStructuredCode(`
  //#region point interface collapsed
  interface Point {
    readonly x: number;
    readonly y: number;
  }
  //#endregion point

  //#region vector-step interface collapsed
  interface VectorStep {
    readonly delta: Point;
    readonly nextI: number;
    readonly nextJ: number;
  }
  //#endregion vector-step

  /**
   * Merge polygon edge directions to build the configuration-space obstacle.
   * Input: two counter-clockwise polygons.
   * Returns: the Minkowski sum A ⊕ (-B).
   */
  //#region minkowski-sum function open
  //@step 1
  function minkowskiSum(obstacle: readonly Point[], robot: readonly Point[]): Point[] {
    const polygonA = rotateToAnchor(ensureCounterClockwise(obstacle));

    //@step 2
    const polygonB = rotateToAnchor(ensureCounterClockwise(reflect(robot)));

    const edgesA = edgeVectors(polygonA);
    const edgesB = edgeVectors(polygonB);

    //@step 3
    const result: Point[] = [add(polygonA[0]!, polygonB[0]!)];
    let i = 0;
    let j = 0;

    while (i < edgesA.length || j < edgesB.length) {
      //@step 5
      const step = chooseNextVector(edgesA, edgesB, i, j);
      result.push(add(result[result.length - 1]!, step.delta));
      i = step.nextI;
      j = step.nextJ;
    }

    //@step 6
    return result;
  }
  //#endregion minkowski-sum

  //#region ensure-ccw helper collapsed
  function ensureCounterClockwise(vertices: readonly Point[]): Point[] {
    return signedArea(vertices) >= 0 ? [...vertices] : [...vertices].reverse();
  }
  //#endregion ensure-ccw

  //#region rotate-anchor helper collapsed
  function rotateToAnchor(vertices: readonly Point[]): Point[] {
    let bestIndex = 0;

    for (let index = 1; index < vertices.length; index += 1) {
      const current = vertices[index]!;
      const best = vertices[bestIndex]!;
      if (current.y < best.y || (current.y === best.y && current.x < best.x)) {
        bestIndex = index;
      }
    }

    return [...vertices.slice(bestIndex), ...vertices.slice(0, bestIndex)];
  }
  //#endregion rotate-anchor

  //#region reflect helper collapsed
  function reflect(vertices: readonly Point[]): Point[] {
    return vertices.map((vertex) => ({ x: -vertex.x, y: -vertex.y }));
  }
  //#endregion reflect

  //#region edge-vectors helper collapsed
  function edgeVectors(vertices: readonly Point[]): Point[] {
    return vertices.map((vertex, index) => {
      const next = vertices[(index + 1) % vertices.length]!;
      return { x: next.x - vertex.x, y: next.y - vertex.y };
    });
  }
  //#endregion edge-vectors

  //#region choose-next helper collapsed
  function chooseNextVector(
    edgeA: readonly Point[],
    edgeB: readonly Point[],
    i: number,
    j: number,
  ): VectorStep {
    const a = edgeA[i % edgeA.length] ?? null;
    const b = edgeB[j % edgeB.length] ?? null;

    if (!a) {
      return { delta: b!, nextI: i, nextJ: j + 1 };
    }

    if (!b) {
      return { delta: a, nextI: i + 1, nextJ: j };
    }

    const turn = a.x * b.y - a.y * b.x;
    if (Math.abs(turn) < 1e-6) {
      return { delta: add(a, b), nextI: i + 1, nextJ: j + 1 };
    }

    return turn > 0
      ? { delta: a, nextI: i + 1, nextJ: j }
      : { delta: b, nextI: i, nextJ: j + 1 };
  }
  //#endregion choose-next

  //#region add helper collapsed
  function add(left: Point, right: Point): Point {
    return { x: left.x + right.x, y: left.y + right.y };
  }
  //#endregion add

  //#region signed-area helper collapsed
  function signedArea(vertices: readonly Point[]): number {
    let area = 0;

    for (let index = 0; index < vertices.length; index += 1) {
      const current = vertices[index]!;
      const next = vertices[(index + 1) % vertices.length]!;
      area += current.x * next.y - current.y * next.x;
    }

    return area / 2;
  }
  //#endregion signed-area
`);

const MINKOWSKI_SUM_PY = buildStructuredCode(
  `
  //#region point interface collapsed
  from dataclasses import dataclass


  @dataclass(frozen=True)
  class Point:
      x: float
      y: float


  @dataclass(frozen=True)
  class VectorStep:
      delta: Point
      next_i: int
      next_j: int
  //#endregion point

  """
  Merge polygon edge directions to build the configuration-space obstacle.
  Input: two counter-clockwise polygons.
  Returns: the Minkowski sum A ⊕ (-B).
  """
  //#region minkowski-sum function open
  //@step 1
  def minkowski_sum(obstacle: list[Point], robot: list[Point]) -> list[Point]:
      polygon_a = rotate_to_anchor(ensure_counter_clockwise(obstacle))
      //@step 2
      polygon_b = rotate_to_anchor(ensure_counter_clockwise(reflect(robot)))
      edges_a = edge_vectors(polygon_a)
      edges_b = edge_vectors(polygon_b)

      //@step 3
      result = [add(polygon_a[0], polygon_b[0])]
      i = 0
      j = 0

      while i < len(edges_a) or j < len(edges_b):
          //@step 5
          step = choose_next_vector(edges_a, edges_b, i, j)
          result.append(add(result[-1], step.delta))
          i = step.next_i
          j = step.next_j

      //@step 6
      return result
  //#endregion minkowski-sum

  //#region ensure-ccw helper collapsed
  def ensure_counter_clockwise(vertices: list[Point]) -> list[Point]:
      return list(vertices) if signed_area(vertices) >= 0 else list(reversed(vertices))
  //#endregion ensure-ccw

  //#region rotate-anchor helper collapsed
  def rotate_to_anchor(vertices: list[Point]) -> list[Point]:
      best_index = min(
          range(len(vertices)),
          key=lambda index: (vertices[index].y, vertices[index].x),
      )
      return [*vertices[best_index:], *vertices[:best_index]]
  //#endregion rotate-anchor

  //#region reflect helper collapsed
  def reflect(vertices: list[Point]) -> list[Point]:
      return [Point(-vertex.x, -vertex.y) for vertex in vertices]
  //#endregion reflect

  //#region edge-vectors helper collapsed
  def edge_vectors(vertices: list[Point]) -> list[Point]:
      return [
          Point(
              vertices[(index + 1) % len(vertices)].x - vertex.x,
              vertices[(index + 1) % len(vertices)].y - vertex.y,
          )
          for index, vertex in enumerate(vertices)
      ]
  //#endregion edge-vectors

  //#region choose-next helper collapsed
  def choose_next_vector(edge_a: list[Point], edge_b: list[Point], i: int, j: int) -> VectorStep:
      a = edge_a[i] if i < len(edge_a) else None
      b = edge_b[j] if j < len(edge_b) else None

      if a is None:
          return VectorStep(b, i, j + 1)
      if b is None:
          return VectorStep(a, i + 1, j)

      turn = a.x * b.y - a.y * b.x
      if abs(turn) < 1e-6:
          return VectorStep(add(a, b), i + 1, j + 1)

      return VectorStep(a, i + 1, j) if turn > 0 else VectorStep(b, i, j + 1)
  //#endregion choose-next

  //#region add helper collapsed
  def add(left: Point, right: Point) -> Point:
      return Point(left.x + right.x, left.y + right.y)
  //#endregion add

  //#region signed-area helper collapsed
  def signed_area(vertices: list[Point]) -> float:
      area = 0.0
      for index, current in enumerate(vertices):
          nxt = vertices[(index + 1) % len(vertices)]
          area += current.x * nxt.y - current.y * nxt.x
      return area / 2
  //#endregion signed-area
  `,
  'python',
);

const MINKOWSKI_SUM_CS = buildStructuredCode(
  `
  //#region point interface collapsed
  public readonly record struct Point(double X, double Y);
  public readonly record struct VectorStep(Point Delta, int NextI, int NextJ);
  //#endregion point

  //#region minkowski-sum function open
  /// <summary>
  /// Merges polygon edge directions to build the configuration-space obstacle.
  /// Input: two counter-clockwise polygons.
  /// Returns: the Minkowski sum A ⊕ (-B).
  /// </summary>
  //@step 1
  public static List<Point> MinkowskiSum(IReadOnlyList<Point> obstacle, IReadOnlyList<Point> robot)
  {
      var polygonA = RotateToAnchor(EnsureCounterClockwise(obstacle));
      //@step 2
      var polygonB = RotateToAnchor(EnsureCounterClockwise(Reflect(robot)));
      var edgesA = EdgeVectors(polygonA);
      var edgesB = EdgeVectors(polygonB);

      //@step 3
      var result = new List<Point> { Add(polygonA[0], polygonB[0]) };
      var i = 0;
      var j = 0;

      while (i < edgesA.Count || j < edgesB.Count)
      {
          //@step 5
          var step = ChooseNextVector(edgesA, edgesB, i, j);
          result.Add(Add(result[^1], step.Delta));
          i = step.NextI;
          j = step.NextJ;
      }

      //@step 6
      return result;
  }
  //#endregion minkowski-sum

  //#region ensure-ccw helper collapsed
  private static List<Point> EnsureCounterClockwise(IReadOnlyList<Point> vertices)
  {
      return SignedArea(vertices) >= 0 ? vertices.ToList() : vertices.Reverse().ToList();
  }
  //#endregion ensure-ccw

  //#region rotate-anchor helper collapsed
  private static List<Point> RotateToAnchor(IReadOnlyList<Point> vertices)
  {
      var bestIndex = 0;
      for (var index = 1; index < vertices.Count; index += 1)
      {
          var current = vertices[index];
          var best = vertices[bestIndex];
          if (current.Y < best.Y || (current.Y == best.Y && current.X < best.X))
          {
              bestIndex = index;
          }
      }

      return [.. vertices.Skip(bestIndex), .. vertices.Take(bestIndex)];
  }
  //#endregion rotate-anchor

  //#region reflect helper collapsed
  private static List<Point> Reflect(IReadOnlyList<Point> vertices)
  {
      return vertices.Select(vertex => new Point(-vertex.X, -vertex.Y)).ToList();
  }
  //#endregion reflect

  //#region edge-vectors helper collapsed
  private static List<Point> EdgeVectors(IReadOnlyList<Point> vertices)
  {
      return vertices.Select((vertex, index) =>
      {
          var next = vertices[(index + 1) % vertices.Count];
          return new Point(next.X - vertex.X, next.Y - vertex.Y);
      }).ToList();
  }
  //#endregion edge-vectors

  //#region choose-next helper collapsed
  private static VectorStep ChooseNextVector(IReadOnlyList<Point> edgeA, IReadOnlyList<Point> edgeB, int i, int j)
  {
      Point? a = i < edgeA.Count ? edgeA[i] : null;
      Point? b = j < edgeB.Count ? edgeB[j] : null;

      if (a is null)
      {
          return new VectorStep(b!.Value, i, j + 1);
      }
      if (b is null)
      {
          return new VectorStep(a.Value, i + 1, j);
      }

      var turn = a.Value.X * b.Value.Y - a.Value.Y * b.Value.X;
      if (Math.Abs(turn) < 1e-6)
      {
          return new VectorStep(Add(a.Value, b.Value), i + 1, j + 1);
      }

      return turn > 0
          ? new VectorStep(a.Value, i + 1, j)
          : new VectorStep(b.Value, i, j + 1);
  }
  //#endregion choose-next

  //#region add helper collapsed
  private static Point Add(Point left, Point right)
  {
      return new Point(left.X + right.X, left.Y + right.Y);
  }
  //#endregion add

  //#region signed-area helper collapsed
  private static double SignedArea(IReadOnlyList<Point> vertices)
  {
      var area = 0.0;
      for (var index = 0; index < vertices.Count; index += 1)
      {
          var current = vertices[index];
          var next = vertices[(index + 1) % vertices.Count];
          area += current.X * next.Y - current.Y * next.X;
      }

      return area / 2.0;
  }
  //#endregion signed-area
  `,
  'csharp',
);

const MINKOWSKI_SUM_JAVA = buildStructuredCode(
  `
  //#region point interface collapsed
  public record Point(double x, double y) {}
  public record VectorStep(Point delta, int nextI, int nextJ) {}
  //#endregion point

  //#region minkowski-sum function open
  /**
   * Merges polygon edge directions to build the configuration-space obstacle.
   * Input: two counter-clockwise polygons.
   * Returns: the Minkowski sum A ⊕ (-B).
   */
  //@step 1
  public static List<Point> minkowskiSum(List<Point> obstacle, List<Point> robot) {
      List<Point> polygonA = rotateToAnchor(ensureCounterClockwise(obstacle));
      //@step 2
      List<Point> polygonB = rotateToAnchor(ensureCounterClockwise(reflect(robot)));
      List<Point> edgesA = edgeVectors(polygonA);
      List<Point> edgesB = edgeVectors(polygonB);

      //@step 3
      List<Point> result = new ArrayList<>();
      result.add(add(polygonA.get(0), polygonB.get(0)));
      int i = 0;
      int j = 0;

      while (i < edgesA.size() || j < edgesB.size()) {
          //@step 5
          VectorStep step = chooseNextVector(edgesA, edgesB, i, j);
          result.add(add(result.get(result.size() - 1), step.delta()));
          i = step.nextI();
          j = step.nextJ();
      }

      //@step 6
      return result;
  }
  //#endregion minkowski-sum

  //#region ensure-ccw helper collapsed
  private static List<Point> ensureCounterClockwise(List<Point> vertices) {
      List<Point> ordered = new ArrayList<>(vertices);
      if (signedArea(ordered) >= 0) {
          return ordered;
      }

      Collections.reverse(ordered);
      return ordered;
  }
  //#endregion ensure-ccw

  //#region rotate-anchor helper collapsed
  private static List<Point> rotateToAnchor(List<Point> vertices) {
      int bestIndex = 0;
      for (int index = 1; index < vertices.size(); index += 1) {
          Point current = vertices.get(index);
          Point best = vertices.get(bestIndex);
          if (current.y() < best.y() || (current.y() == best.y() && current.x() < best.x())) {
              bestIndex = index;
          }
      }

      List<Point> rotated = new ArrayList<>(vertices.size());
      rotated.addAll(vertices.subList(bestIndex, vertices.size()));
      rotated.addAll(vertices.subList(0, bestIndex));
      return rotated;
  }
  //#endregion rotate-anchor

  //#region reflect helper collapsed
  private static List<Point> reflect(List<Point> vertices) {
      return vertices.stream()
          .map(vertex -> new Point(-vertex.x(), -vertex.y()))
          .toList();
  }
  //#endregion reflect

  //#region edge-vectors helper collapsed
  private static List<Point> edgeVectors(List<Point> vertices) {
      List<Point> edges = new ArrayList<>(vertices.size());
      for (int index = 0; index < vertices.size(); index += 1) {
          Point current = vertices.get(index);
          Point next = vertices.get((index + 1) % vertices.size());
          edges.add(new Point(next.x() - current.x(), next.y() - current.y()));
      }
      return edges;
  }
  //#endregion edge-vectors

  //#region choose-next helper collapsed
  private static VectorStep chooseNextVector(List<Point> edgeA, List<Point> edgeB, int i, int j) {
      Point a = i < edgeA.size() ? edgeA.get(i) : null;
      Point b = j < edgeB.size() ? edgeB.get(j) : null;

      if (a == null) {
          return new VectorStep(b, i, j + 1);
      }
      if (b == null) {
          return new VectorStep(a, i + 1, j);
      }

      double turn = a.x() * b.y() - a.y() * b.x();
      if (Math.abs(turn) < 1e-6) {
          return new VectorStep(add(a, b), i + 1, j + 1);
      }

      return turn > 0
          ? new VectorStep(a, i + 1, j)
          : new VectorStep(b, i, j + 1);
  }
  //#endregion choose-next

  //#region add helper collapsed
  private static Point add(Point left, Point right) {
      return new Point(left.x() + right.x(), left.y() + right.y());
  }
  //#endregion add

  //#region signed-area helper collapsed
  private static double signedArea(List<Point> vertices) {
      double area = 0.0;
      for (int index = 0; index < vertices.size(); index += 1) {
          Point current = vertices.get(index);
          Point next = vertices.get((index + 1) % vertices.size());
          area += current.x() * next.y() - current.y() * next.x();
      }
      return area / 2.0;
  }
  //#endregion signed-area
  `,
  'java',
);

const MINKOWSKI_SUM_CPP = buildStructuredCode(
  `
  //#region point interface collapsed
  struct Point {
      double x;
      double y;
  };

  struct VectorStep {
      Point delta;
      int nextI;
      int nextJ;
  };
  //#endregion point

  //#region minkowski-sum function open
  /**
   * Merges polygon edge directions to build the configuration-space obstacle.
   * Input: two counter-clockwise polygons.
   * Returns: the Minkowski sum A ⊕ (-B).
   */
  //@step 1
  std::vector<Point> minkowskiSum(const std::vector<Point>& obstacle, const std::vector<Point>& robot) {
      auto polygonA = rotateToAnchor(ensureCounterClockwise(obstacle));
      //@step 2
      auto polygonB = rotateToAnchor(ensureCounterClockwise(reflect(robot)));
      auto edgesA = edgeVectors(polygonA);
      auto edgesB = edgeVectors(polygonB);

      //@step 3
      std::vector<Point> result = { add(polygonA.front(), polygonB.front()) };
      int i = 0;
      int j = 0;

      while (i < static_cast<int>(edgesA.size()) || j < static_cast<int>(edgesB.size())) {
          //@step 5
          auto step = chooseNextVector(edgesA, edgesB, i, j);
          result.push_back(add(result.back(), step.delta));
          i = step.nextI;
          j = step.nextJ;
      }

      //@step 6
      return result;
  }
  //#endregion minkowski-sum

  //#region ensure-ccw helper collapsed
  std::vector<Point> ensureCounterClockwise(const std::vector<Point>& vertices) {
      if (signedArea(vertices) >= 0) {
          return vertices;
      }

      return { vertices.rbegin(), vertices.rend() };
  }
  //#endregion ensure-ccw

  //#region rotate-anchor helper collapsed
  std::vector<Point> rotateToAnchor(const std::vector<Point>& vertices) {
      int bestIndex = 0;
      for (int index = 1; index < static_cast<int>(vertices.size()); index += 1) {
          const auto& current = vertices[index];
          const auto& best = vertices[bestIndex];
          if (current.y < best.y || (current.y == best.y && current.x < best.x)) {
              bestIndex = index;
          }
      }

      std::vector<Point> rotated;
      rotated.insert(rotated.end(), vertices.begin() + bestIndex, vertices.end());
      rotated.insert(rotated.end(), vertices.begin(), vertices.begin() + bestIndex);
      return rotated;
  }
  //#endregion rotate-anchor

  //#region reflect helper collapsed
  std::vector<Point> reflect(const std::vector<Point>& vertices) {
      std::vector<Point> reflected;
      reflected.reserve(vertices.size());
      for (const auto& vertex : vertices) {
          reflected.push_back({-vertex.x, -vertex.y});
      }
      return reflected;
  }
  //#endregion reflect

  //#region edge-vectors helper collapsed
  std::vector<Point> edgeVectors(const std::vector<Point>& vertices) {
      std::vector<Point> edges;
      edges.reserve(vertices.size());
      for (int index = 0; index < static_cast<int>(vertices.size()); index += 1) {
          const auto& current = vertices[index];
          const auto& next = vertices[(index + 1) % vertices.size()];
          edges.push_back({next.x - current.x, next.y - current.y});
      }
      return edges;
  }
  //#endregion edge-vectors

  //#region choose-next helper collapsed
  VectorStep chooseNextVector(
      const std::vector<Point>& edgeA,
      const std::vector<Point>& edgeB,
      int i,
      int j
  ) {
      const Point* a = i < static_cast<int>(edgeA.size()) ? &edgeA[i] : nullptr;
      const Point* b = j < static_cast<int>(edgeB.size()) ? &edgeB[j] : nullptr;

      if (a == nullptr) {
          return {*b, i, j + 1};
      }
      if (b == nullptr) {
          return {*a, i + 1, j};
      }

      double turn = a->x * b->y - a->y * b->x;
      if (std::abs(turn) < 1e-6) {
          return {add(*a, *b), i + 1, j + 1};
      }

      return turn > 0
          ? VectorStep{*a, i + 1, j}
          : VectorStep{*b, i, j + 1};
  }
  //#endregion choose-next

  //#region add helper collapsed
  Point add(const Point& left, const Point& right) {
      return {left.x + right.x, left.y + right.y};
  }
  //#endregion add

  //#region signed-area helper collapsed
  double signedArea(const std::vector<Point>& vertices) {
      double area = 0.0;
      for (int index = 0; index < static_cast<int>(vertices.size()); index += 1) {
          const auto& current = vertices[index];
          const auto& next = vertices[(index + 1) % vertices.size()];
          area += current.x * next.y - current.y * next.x;
      }
      return area / 2.0;
  }
  //#endregion signed-area
  `,
  'cpp',
);

const MINKOWSKI_SUM_JS = buildStructuredCode(
  `
  //@step 1
  function minkowskiSum(obstacle, robot) {
    const polygonA = rotateToAnchor(ensureCounterClockwise(obstacle));

    //@step 2
    const polygonB = rotateToAnchor(ensureCounterClockwise(reflect(robot)));

    const edgesA = edgeVectors(polygonA);
    const edgesB = edgeVectors(polygonB);

    //@step 3
    const result = [add(polygonA[0], polygonB[0])];
    let i = 0;
    let j = 0;

    while (i < edgesA.length || j < edgesB.length) {
      //@step 5
      const step = chooseNextVector(edgesA, edgesB, i, j);
      result.push(add(result[result.length - 1], step.delta));
      i = step.nextI;
      j = step.nextJ;
    }

    //@step 6
    return result;
  }
  `,
  'javascript',
);

const MINKOWSKI_SUM_GO = buildStructuredCode(
  `
  package geometry

  type Point struct {
      X float64
      Y float64
  }

  type VectorStep struct {
      Delta Point
      NextI int
      NextJ int
  }

  //@step 1
  func MinkowskiSum(obstacle []Point, robot []Point) []Point {
      polygonA := rotateToAnchor(ensureCounterClockwise(obstacle))

      //@step 2
      polygonB := rotateToAnchor(ensureCounterClockwise(reflect(robot)))

      edgesA := edgeVectors(polygonA)
      edgesB := edgeVectors(polygonB)

      //@step 3
      result := []Point{add(polygonA[0], polygonB[0])}
      i, j := 0, 0

      for i < len(edgesA) || j < len(edgesB) {
          //@step 5
          step := chooseNextVector(edgesA, edgesB, i, j)
          result = append(result, add(result[len(result)-1], step.Delta))
          i = step.NextI
          j = step.NextJ
      }

      //@step 6
      return result
  }
  `,
  'go',
);

const MINKOWSKI_SUM_RUST = buildStructuredCode(
  `
  #[derive(Clone, Copy)]
  struct Point {
      x: f64,
      y: f64,
  }

  struct VectorStep {
      delta: Point,
      next_i: usize,
      next_j: usize,
  }

  //@step 1
  fn minkowski_sum(obstacle: &[Point], robot: &[Point]) -> Vec<Point> {
      let polygon_a = rotate_to_anchor(ensure_counter_clockwise(obstacle));

      //@step 2
      let polygon_b = rotate_to_anchor(ensure_counter_clockwise(reflect(robot)));

      let edges_a = edge_vectors(&polygon_a);
      let edges_b = edge_vectors(&polygon_b);

      //@step 3
      let mut result = vec![add(polygon_a[0], polygon_b[0])];
      let (mut i, mut j) = (0, 0);

      while i < edges_a.len() || j < edges_b.len() {
          //@step 5
          let step = choose_next_vector(&edges_a, &edges_b, i, j);
          let last = *result.last().unwrap();
          result.push(add(last, step.delta));
          i = step.next_i;
          j = step.next_j;
      }

      //@step 6
      result
  }
  `,
  'rust',
);

const MINKOWSKI_SUM_SWIFT = buildStructuredCode(
  `
  struct Point {
      let x: Double
      let y: Double
  }

  struct VectorStep {
      let delta: Point
      let nextI: Int
      let nextJ: Int
  }

  //@step 1
  func minkowskiSum(_ obstacle: [Point], _ robot: [Point]) -> [Point] {
      let polygonA = rotateToAnchor(ensureCounterClockwise(obstacle))

      //@step 2
      let polygonB = rotateToAnchor(ensureCounterClockwise(reflect(robot)))

      let edgesA = edgeVectors(polygonA)
      let edgesB = edgeVectors(polygonB)

      //@step 3
      var result = [add(polygonA[0], polygonB[0])]
      var i = 0
      var j = 0

      while i < edgesA.count || j < edgesB.count {
          //@step 5
          let step = chooseNextVector(edgesA, edgesB, i, j)
          result.append(add(result[result.count - 1], step.delta))
          i = step.nextI
          j = step.nextJ
      }

      //@step 6
      return result
  }
  `,
  'swift',
);

const MINKOWSKI_SUM_PHP = buildStructuredCode(
  `
  final class Point
  {
      public function __construct(public float $x, public float $y) {}
  }

  final class VectorStep
  {
      public function __construct(
          public Point $delta,
          public int $nextI,
          public int $nextJ,
      ) {}
  }

  //@step 1
  function minkowskiSum(array $obstacle, array $robot): array
  {
      $polygonA = rotateToAnchor(ensureCounterClockwise($obstacle));

      //@step 2
      $polygonB = rotateToAnchor(ensureCounterClockwise(reflect($robot)));

      $edgesA = edgeVectors($polygonA);
      $edgesB = edgeVectors($polygonB);

      //@step 3
      $result = [add($polygonA[0], $polygonB[0])];
      $i = 0;
      $j = 0;

      while ($i < count($edgesA) || $j < count($edgesB)) {
          //@step 5
          $step = chooseNextVector($edgesA, $edgesB, $i, $j);
          $result[] = add($result[count($result) - 1], $step->delta);
          $i = $step->nextI;
          $j = $step->nextJ;
      }

      //@step 6
      return $result;
  }
  `,
  'php',
);

const MINKOWSKI_SUM_KOTLIN = buildStructuredCode(
  `
  data class Point(val x: Double, val y: Double)
  data class VectorStep(val delta: Point, val nextI: Int, val nextJ: Int)

  //@step 1
  fun minkowskiSum(obstacle: List<Point>, robot: List<Point>): List<Point> {
      val polygonA = rotateToAnchor(ensureCounterClockwise(obstacle))

      //@step 2
      val polygonB = rotateToAnchor(ensureCounterClockwise(reflect(robot)))

      val edgesA = edgeVectors(polygonA)
      val edgesB = edgeVectors(polygonB)

      //@step 3
      val result = mutableListOf(add(polygonA.first(), polygonB.first()))
      var i = 0
      var j = 0

      while (i < edgesA.size || j < edgesB.size) {
          //@step 5
          val step = chooseNextVector(edgesA, edgesB, i, j)
          result += add(result.last(), step.delta)
          i = step.nextI
          j = step.nextJ
      }

      //@step 6
      return result
  }
  `,
  'kotlin',
);

export const MINKOWSKI_SUM_CODE = MINKOWSKI_SUM_TS.lines;
export const MINKOWSKI_SUM_CODE_REGIONS = MINKOWSKI_SUM_TS.regions;
export const MINKOWSKI_SUM_CODE_HIGHLIGHT_MAP = MINKOWSKI_SUM_TS.highlightMap;
export const MINKOWSKI_SUM_CODE_VARIANTS: CodeVariantMap = {
  typescript: {
    language: 'typescript',
    lines: MINKOWSKI_SUM_TS.lines,
    regions: MINKOWSKI_SUM_TS.regions,
    highlightMap: MINKOWSKI_SUM_TS.highlightMap,
    source: MINKOWSKI_SUM_TS.source,
  },
  javascript: {
    language: 'javascript',
    lines: MINKOWSKI_SUM_JS.lines,
    regions: MINKOWSKI_SUM_JS.regions,
    highlightMap: MINKOWSKI_SUM_JS.highlightMap,
    source: MINKOWSKI_SUM_JS.source,
  },
  python: {
    language: 'python',
    lines: MINKOWSKI_SUM_PY.lines,
    regions: MINKOWSKI_SUM_PY.regions,
    highlightMap: MINKOWSKI_SUM_PY.highlightMap,
    source: MINKOWSKI_SUM_PY.source,
  },
  csharp: {
    language: 'csharp',
    lines: MINKOWSKI_SUM_CS.lines,
    regions: MINKOWSKI_SUM_CS.regions,
    highlightMap: MINKOWSKI_SUM_CS.highlightMap,
    source: MINKOWSKI_SUM_CS.source,
  },
  java: {
    language: 'java',
    lines: MINKOWSKI_SUM_JAVA.lines,
    regions: MINKOWSKI_SUM_JAVA.regions,
    highlightMap: MINKOWSKI_SUM_JAVA.highlightMap,
    source: MINKOWSKI_SUM_JAVA.source,
  },
  cpp: {
    language: 'cpp',
    lines: MINKOWSKI_SUM_CPP.lines,
    regions: MINKOWSKI_SUM_CPP.regions,
    highlightMap: MINKOWSKI_SUM_CPP.highlightMap,
    source: MINKOWSKI_SUM_CPP.source,
  },
  go: {
    language: 'go',
    lines: MINKOWSKI_SUM_GO.lines,
    regions: MINKOWSKI_SUM_GO.regions,
    highlightMap: MINKOWSKI_SUM_GO.highlightMap,
    source: MINKOWSKI_SUM_GO.source,
  },
  rust: {
    language: 'rust',
    lines: MINKOWSKI_SUM_RUST.lines,
    regions: MINKOWSKI_SUM_RUST.regions,
    highlightMap: MINKOWSKI_SUM_RUST.highlightMap,
    source: MINKOWSKI_SUM_RUST.source,
  },
  swift: {
    language: 'swift',
    lines: MINKOWSKI_SUM_SWIFT.lines,
    regions: MINKOWSKI_SUM_SWIFT.regions,
    highlightMap: MINKOWSKI_SUM_SWIFT.highlightMap,
    source: MINKOWSKI_SUM_SWIFT.source,
  },
  php: {
    language: 'php',
    lines: MINKOWSKI_SUM_PHP.lines,
    regions: MINKOWSKI_SUM_PHP.regions,
    highlightMap: MINKOWSKI_SUM_PHP.highlightMap,
    source: MINKOWSKI_SUM_PHP.source,
  },
  kotlin: {
    language: 'kotlin',
    lines: MINKOWSKI_SUM_KOTLIN.lines,
    regions: MINKOWSKI_SUM_KOTLIN.regions,
    highlightMap: MINKOWSKI_SUM_KOTLIN.highlightMap,
    source: MINKOWSKI_SUM_KOTLIN.source,
  },
};
