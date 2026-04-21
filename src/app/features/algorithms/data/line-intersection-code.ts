import { CodeVariantMap } from '../models/detail';
import { buildStructuredCode } from './code-line-builder/code-line-builder';

const LINE_INTERSECTION_TS = buildStructuredCode(`
  //#region point interface collapsed
  interface Point {
    readonly x: number;
    readonly y: number;
  }
  //#endregion point

  //#region segment interface collapsed
  interface Segment {
    readonly id: number;
    readonly start: Point;
    readonly end: Point;
  }
  //#endregion segment

  //#region intersection interface collapsed
  interface Intersection {
    readonly x: number;
    readonly y: number;
    readonly segmentIds: readonly [number, number];
  }
  //#endregion intersection

  //#region sweep-event interface collapsed
  interface SweepEvent {
    readonly x: number;
    readonly kind: 'start' | 'end' | 'intersection';
    readonly segmentIds: readonly number[];
    readonly hit?: Intersection;
  }
  //#endregion sweep-event

  /**
   * Sweep segment endpoints from left to right.
   * Input: finite line segments.
   * Returns: all discovered segment intersections in sweep order.
   */
  //#region sweep-segments function open
  //@step 1
  function sweepSegmentIntersections(segments: readonly Segment[]): Intersection[] {
    const hits = collectIntersections(segments);
    const events = buildEvents(segments, hits);
    const active = new Set<number>();
    const result: Intersection[] = [];

    for (const event of events) {
      //@step 3
      if (event.kind === 'start') {
        active.add(event.segmentIds[0]!);
        continue;
      }

      //@step 4
      if (event.kind === 'end') {
        active.delete(event.segmentIds[0]!);
        continue;
      }

      //@step 5
      if (event.hit && event.segmentIds.every((id) => active.has(id))) {
        result.push(event.hit);
      }
    }

    //@step 6
    return result;
  }
  //#endregion sweep-segments

  //#region build-events helper collapsed
  function buildEvents(
    segments: readonly Segment[],
    intersections: readonly Intersection[],
  ): SweepEvent[] {
    return [
      ...segments.map((segment) => ({
        x: segment.start.x,
        kind: 'start' as const,
        segmentIds: [segment.id],
      })),
      ...segments.map((segment) => ({
        x: segment.end.x,
        kind: 'end' as const,
        segmentIds: [segment.id],
      })),
      ...intersections.map((hit) => ({
        x: hit.x,
        kind: 'intersection' as const,
        segmentIds: [...hit.segmentIds],
        hit,
      })),
    ].sort((left, right) => left.x - right.x);
  }
  //#endregion build-events

  //#region collect-intersections helper collapsed
  function collectIntersections(segments: readonly Segment[]): Intersection[] {
    const hits: Intersection[] = [];

    for (let i = 0; i < segments.length; i += 1) {
      for (let j = i + 1; j < segments.length; j += 1) {
        const hit = segmentIntersection(segments[i]!, segments[j]!);
        if (hit) {
          hits.push(hit);
        }
      }
    }

    return hits;
  }
  //#endregion collect-intersections

  //#region segment-intersection helper collapsed
  function segmentIntersection(first: Segment, second: Segment): Intersection | null {
    const { start: a, end: b } = first;
    const { start: c, end: d } = second;
    const determinant = (a.x - b.x) * (c.y - d.y) - (a.y - b.y) * (c.x - d.x);

    if (Math.abs(determinant) < 1e-6) {
      return null;
    }

    const det1 = a.x * b.y - a.y * b.x;
    const det2 = c.x * d.y - c.y * d.x;
    const x = (det1 * (c.x - d.x) - (a.x - b.x) * det2) / determinant;
    const y = (det1 * (c.y - d.y) - (a.y - b.y) * det2) / determinant;

    if (!withinSegment(a, b, x, y) || !withinSegment(c, d, x, y)) {
      return null;
    }

    return { x, y, segmentIds: [first.id, second.id] };
  }
  //#endregion segment-intersection

  //#region within-segment helper collapsed
  function withinSegment(a: Point, b: Point, x: number, y: number): boolean {
    const epsilon = 1e-6;
    return (
      x >= Math.min(a.x, b.x) - epsilon &&
      x <= Math.max(a.x, b.x) + epsilon &&
      y >= Math.min(a.y, b.y) - epsilon &&
      y <= Math.max(a.y, b.y) + epsilon
    );
  }
  //#endregion within-segment
`);

const LINE_INTERSECTION_PY = buildStructuredCode(
  `
  //#region point interface collapsed
  from dataclasses import dataclass


  @dataclass(frozen=True)
  class Point:
      x: float
      y: float


  @dataclass(frozen=True)
  class Segment:
      id: int
      start: Point
      end: Point


  @dataclass(frozen=True)
  class Intersection:
      x: float
      y: float
      segment_ids: tuple[int, int]
  //#endregion point

  """
  Sweep segment endpoints from left to right.
  Input: finite line segments.
  Returns: discovered segment intersections in sweep order.
  """
  //#region sweep-segments function open
  //@step 1
  def sweep_segment_intersections(segments: list[Segment]) -> list[Intersection]:
      hits = collect_intersections(segments)
      events = build_events(segments, hits)
      active: set[int] = set()
      result: list[Intersection] = []

      for event in events:
          //@step 3
          if event["kind"] == "start":
              active.add(event["segment_ids"][0])
              continue

          //@step 4
          if event["kind"] == "end":
              active.discard(event["segment_ids"][0])
              continue

          //@step 5
          if event["hit"] and all(segment_id in active for segment_id in event["segment_ids"]):
              result.append(event["hit"])

      //@step 6
      return result
  //#endregion sweep-segments

  //#region build-events helper collapsed
  def build_events(segments: list[Segment], intersections: list[Intersection]) -> list[dict]:
      events = [
          *({"x": segment.start.x, "kind": "start", "segment_ids": [segment.id], "hit": None} for segment in segments),
          *({"x": segment.end.x, "kind": "end", "segment_ids": [segment.id], "hit": None} for segment in segments),
          *({"x": hit.x, "kind": "intersection", "segment_ids": list(hit.segment_ids), "hit": hit} for hit in intersections),
      ]
      return sorted(events, key=lambda event: event["x"])
  //#endregion build-events

  //#region collect-intersections helper collapsed
  def collect_intersections(segments: list[Segment]) -> list[Intersection]:
      hits: list[Intersection] = []
      for i in range(len(segments)):
          for j in range(i + 1, len(segments)):
              hit = segment_intersection(segments[i], segments[j])
              if hit is not None:
                  hits.append(hit)
      return hits
  //#endregion collect-intersections

  //#region segment-intersection helper collapsed
  def segment_intersection(first: Segment, second: Segment) -> Intersection | None:
      a, b = first.start, first.end
      c, d = second.start, second.end
      determinant = (a.x - b.x) * (c.y - d.y) - (a.y - b.y) * (c.x - d.x)
      if abs(determinant) < 1e-6:
          return None

      det1 = a.x * b.y - a.y * b.x
      det2 = c.x * d.y - c.y * d.x
      x = (det1 * (c.x - d.x) - (a.x - b.x) * det2) / determinant
      y = (det1 * (c.y - d.y) - (a.y - b.y) * det2) / determinant

      if not within_segment(a, b, x, y) or not within_segment(c, d, x, y):
          return None

      return Intersection(x=x, y=y, segment_ids=(first.id, second.id))
  //#endregion segment-intersection

  //#region within-segment helper collapsed
  def within_segment(a: Point, b: Point, x: float, y: float) -> bool:
      epsilon = 1e-6
      return (
          min(a.x, b.x) - epsilon <= x <= max(a.x, b.x) + epsilon and
          min(a.y, b.y) - epsilon <= y <= max(a.y, b.y) + epsilon
      )
  //#endregion within-segment
  `,
  'python',
);

const LINE_INTERSECTION_CS = buildStructuredCode(
  `
  //#region point interface collapsed
  public readonly record struct Point(double X, double Y);
  public readonly record struct Segment(int Id, Point Start, Point End);
  public readonly record struct Intersection(double X, double Y, (int, int) SegmentIds);
  //#endregion point

  //#region sweep-segments function open
  /// <summary>
  /// Sweeps segment endpoints from left to right.
  /// Input: finite line segments.
  /// Returns: discovered segment intersections in sweep order.
  /// </summary>
  //@step 1
  public static List<Intersection> SweepSegmentIntersections(IReadOnlyList<Segment> segments)
  {
      var hits = CollectIntersections(segments);
      var events = BuildEvents(segments, hits);
      var active = new HashSet<int>();
      var result = new List<Intersection>();

      foreach (var @event in events)
      {
          //@step 3
          if (@event.Kind == "start")
          {
              active.Add(@event.SegmentIds[0]);
              continue;
          }

          //@step 4
          if (@event.Kind == "end")
          {
              active.Remove(@event.SegmentIds[0]);
              continue;
          }

          //@step 5
          if (@event.Hit is Intersection hit && @event.SegmentIds.All(active.Contains))
          {
              result.Add(hit);
          }
      }

      //@step 6
      return result;
  }
  //#endregion sweep-segments

  //#region sweep-event helper collapsed
  private sealed record SweepEvent(double X, string Kind, int[] SegmentIds, Intersection? Hit);
  //#endregion sweep-event

  //#region build-events helper collapsed
  private static List<SweepEvent> BuildEvents(IReadOnlyList<Segment> segments, IReadOnlyList<Intersection> intersections)
  {
      return [
          .. segments.Select(segment => new SweepEvent(segment.Start.X, "start", [segment.Id], null)),
          .. segments.Select(segment => new SweepEvent(segment.End.X, "end", [segment.Id], null)),
          .. intersections.Select(hit => new SweepEvent(hit.X, "intersection", [hit.SegmentIds.Item1, hit.SegmentIds.Item2], hit)),
      ].OrderBy(@event => @event.X).ToList();
  }
  //#endregion build-events

  //#region collect-intersections helper collapsed
  private static List<Intersection> CollectIntersections(IReadOnlyList<Segment> segments)
  {
      var hits = new List<Intersection>();
      for (var i = 0; i < segments.Count; i += 1)
      {
          for (var j = i + 1; j < segments.Count; j += 1)
          {
              var hit = SegmentIntersection(segments[i], segments[j]);
              if (hit is not null) hits.Add(hit.Value);
          }
      }
      return hits;
  }
  //#endregion collect-intersections

  //#region segment-intersection helper collapsed
  private static Intersection? SegmentIntersection(Segment first, Segment second)
  {
      var a = first.Start;
      var b = first.End;
      var c = second.Start;
      var d = second.End;
      var determinant = (a.X - b.X) * (c.Y - d.Y) - (a.Y - b.Y) * (c.X - d.X);
      if (Math.Abs(determinant) < 1e-6) return null;

      var det1 = a.X * b.Y - a.Y * b.X;
      var det2 = c.X * d.Y - c.Y * d.X;
      var x = (det1 * (c.X - d.X) - (a.X - b.X) * det2) / determinant;
      var y = (det1 * (c.Y - d.Y) - (a.Y - b.Y) * det2) / determinant;
      return WithinSegment(a, b, x, y) && WithinSegment(c, d, x, y)
          ? new Intersection(x, y, (first.Id, second.Id))
          : null;
  }
  //#endregion segment-intersection

  //#region within-segment helper collapsed
  private static bool WithinSegment(Point a, Point b, double x, double y)
  {
      const double Epsilon = 1e-6;
      return
          x >= Math.Min(a.X, b.X) - Epsilon &&
          x <= Math.Max(a.X, b.X) + Epsilon &&
          y >= Math.Min(a.Y, b.Y) - Epsilon &&
          y <= Math.Max(a.Y, b.Y) + Epsilon;
  }
  //#endregion within-segment
  `,
  'csharp',
);

const LINE_INTERSECTION_JAVA = buildStructuredCode(
  `
  //#region point interface collapsed
  public record Point(double x, double y) {}
  public record Segment(int id, Point start, Point end) {}
  public record Intersection(double x, double y, int leftId, int rightId) {}
  //#endregion point

  //#region sweep-segments function open
  /**
   * Sweeps segment endpoints from left to right.
   * Input: finite line segments.
   * Returns: discovered segment intersections in sweep order.
   */
  //@step 1
  public static List<Intersection> sweepSegmentIntersections(List<Segment> segments) {
      List<Intersection> hits = collectIntersections(segments);
      List<SweepEvent> events = buildEvents(segments, hits);
      Set<Integer> active = new HashSet<>();
      List<Intersection> result = new ArrayList<>();

      for (SweepEvent event : events) {
          //@step 3
          if (event.kind.equals("start")) {
              active.add(event.segmentIds.get(0));
              continue;
          }

          //@step 4
          if (event.kind.equals("end")) {
              active.remove(event.segmentIds.get(0));
              continue;
          }

          //@step 5
          if (event.hit != null && event.segmentIds.stream().allMatch(active::contains)) {
              result.add(event.hit);
          }
      }

      //@step 6
      return result;
  }
  //#endregion sweep-segments

  //#region sweep-event helper collapsed
  private record SweepEvent(double x, String kind, List<Integer> segmentIds, Intersection hit) {}
  //#endregion sweep-event

  //#region build-events helper collapsed
  private static List<SweepEvent> buildEvents(List<Segment> segments, List<Intersection> intersections) {
      List<SweepEvent> events = new ArrayList<>();
      segments.forEach(segment -> events.add(new SweepEvent(segment.start().x(), "start", List.of(segment.id()), null)));
      segments.forEach(segment -> events.add(new SweepEvent(segment.end().x(), "end", List.of(segment.id()), null)));
      intersections.forEach(hit -> events.add(new SweepEvent(hit.x(), "intersection", List.of(hit.leftId(), hit.rightId()), hit)));
      events.sort(Comparator.comparingDouble(SweepEvent::x));
      return events;
  }
  //#endregion build-events

  //#region collect-intersections helper collapsed
  private static List<Intersection> collectIntersections(List<Segment> segments) {
      List<Intersection> hits = new ArrayList<>();
      for (int i = 0; i < segments.size(); i += 1) {
          for (int j = i + 1; j < segments.size(); j += 1) {
              Intersection hit = segmentIntersection(segments.get(i), segments.get(j));
              if (hit != null) hits.add(hit);
          }
      }
      return hits;
  }
  //#endregion collect-intersections

  //#region segment-intersection helper collapsed
  private static Intersection segmentIntersection(Segment first, Segment second) {
      Point a = first.start();
      Point b = first.end();
      Point c = second.start();
      Point d = second.end();
      double determinant = (a.x() - b.x()) * (c.y() - d.y()) - (a.y() - b.y()) * (c.x() - d.x());
      if (Math.abs(determinant) < 1e-6) return null;

      double det1 = a.x() * b.y() - a.y() * b.x();
      double det2 = c.x() * d.y() - c.y() * d.x();
      double x = (det1 * (c.x() - d.x()) - (a.x() - b.x()) * det2) / determinant;
      double y = (det1 * (c.y() - d.y()) - (a.y() - b.y()) * det2) / determinant;
      return withinSegment(a, b, x, y) && withinSegment(c, d, x, y)
          ? new Intersection(x, y, first.id(), second.id())
          : null;
  }
  //#endregion segment-intersection

  //#region within-segment helper collapsed
  private static boolean withinSegment(Point a, Point b, double x, double y) {
      double epsilon = 1e-6;
      return
          x >= Math.min(a.x(), b.x()) - epsilon &&
          x <= Math.max(a.x(), b.x()) + epsilon &&
          y >= Math.min(a.y(), b.y()) - epsilon &&
          y <= Math.max(a.y(), b.y()) + epsilon;
  }
  //#endregion within-segment
  `,
  'java',
);

const LINE_INTERSECTION_CPP = buildStructuredCode(
  `
  //#region point interface collapsed
  struct Point { double x; double y; };
  struct Segment { int id; Point start; Point end; };
  struct Intersection { double x; double y; int leftId; int rightId; };
  //#endregion point

  //#region sweep-segments function open
  /**
   * Sweeps segment endpoints from left to right.
   * Input: finite line segments.
   * Returns: discovered segment intersections in sweep order.
   */
  //@step 1
  std::vector<Intersection> sweepSegmentIntersections(const std::vector<Segment>& segments) {
      auto hits = collectIntersections(segments);
      auto events = buildEvents(segments, hits);
      std::unordered_set<int> active;
      std::vector<Intersection> result;

      for (const SweepEvent& event : events) {
          //@step 3
          if (event.kind == "start") {
              active.insert(event.segmentIds.front());
              continue;
          }

          //@step 4
          if (event.kind == "end") {
              active.erase(event.segmentIds.front());
              continue;
          }

          //@step 5
          if (event.hit.has_value() && std::all_of(event.segmentIds.begin(), event.segmentIds.end(), [&](int id) { return active.contains(id); })) {
              result.push_back(*event.hit);
          }
      }

      //@step 6
      return result;
  }
  //#endregion sweep-segments

  //#region sweep-event helper collapsed
  struct SweepEvent {
      double x;
      std::string kind;
      std::vector<int> segmentIds;
      std::optional<Intersection> hit;
  };
  //#endregion sweep-event

  //#region build-events helper collapsed
  std::vector<SweepEvent> buildEvents(const std::vector<Segment>& segments, const std::vector<Intersection>& intersections) {
      std::vector<SweepEvent> events;
      for (const Segment& segment : segments) {
          events.push_back({segment.start.x, "start", {segment.id}, std::nullopt});
          events.push_back({segment.end.x, "end", {segment.id}, std::nullopt});
      }
      for (const Intersection& hit : intersections) {
          events.push_back({hit.x, "intersection", {hit.leftId, hit.rightId}, hit});
      }
      std::sort(events.begin(), events.end(), [](const SweepEvent& left, const SweepEvent& right) { return left.x < right.x; });
      return events;
  }
  //#endregion build-events

  //#region collect-intersections helper collapsed
  std::vector<Intersection> collectIntersections(const std::vector<Segment>& segments) {
      std::vector<Intersection> hits;
      for (std::size_t i = 0; i < segments.size(); ++i) {
          for (std::size_t j = i + 1; j < segments.size(); ++j) {
              auto hit = segmentIntersection(segments[i], segments[j]);
              if (hit.has_value()) hits.push_back(*hit);
          }
      }
      return hits;
  }
  //#endregion collect-intersections

  //#region segment-intersection helper collapsed
  std::optional<Intersection> segmentIntersection(const Segment& first, const Segment& second) {
      Point a = first.start;
      Point b = first.end;
      Point c = second.start;
      Point d = second.end;
      double determinant = (a.x - b.x) * (c.y - d.y) - (a.y - b.y) * (c.x - d.x);
      if (std::abs(determinant) < 1e-6) return std::nullopt;

      double det1 = a.x * b.y - a.y * b.x;
      double det2 = c.x * d.y - c.y * d.x;
      double x = (det1 * (c.x - d.x) - (a.x - b.x) * det2) / determinant;
      double y = (det1 * (c.y - d.y) - (a.y - b.y) * det2) / determinant;
      if (!withinSegment(a, b, x, y) || !withinSegment(c, d, x, y)) return std::nullopt;
      return Intersection{x, y, first.id, second.id};
  }
  //#endregion segment-intersection

  //#region within-segment helper collapsed
  bool withinSegment(const Point& a, const Point& b, double x, double y) {
      double epsilon = 1e-6;
      return x >= std::min(a.x, b.x) - epsilon &&
          x <= std::max(a.x, b.x) + epsilon &&
          y >= std::min(a.y, b.y) - epsilon &&
          y <= std::max(a.y, b.y) + epsilon;
  }
  //#endregion within-segment
  `,
  'cpp',
);

const LINE_INTERSECTION_JS = buildStructuredCode(
  `
  //@step 1
  function sweepSegmentIntersections(segments) {
    const hits = collectIntersections(segments);
    const events = buildEvents(segments, hits);
    const active = new Set();
    const result = [];

    for (const event of events) {
      //@step 3
      if (event.kind === 'start') {
        active.add(event.segmentIds[0]);
        continue;
      }

      //@step 4
      if (event.kind === 'end') {
        active.delete(event.segmentIds[0]);
        continue;
      }

      //@step 5
      if (event.hit && event.segmentIds.every((id) => active.has(id))) {
        result.push(event.hit);
      }
    }

    //@step 6
    return result;
  }

  function buildEvents(segments, intersections) {
    return [
      ...segments.map((segment) => ({ x: segment.start.x, kind: 'start', segmentIds: [segment.id], hit: null })),
      ...segments.map((segment) => ({ x: segment.end.x, kind: 'end', segmentIds: [segment.id], hit: null })),
      ...intersections.map((hit) => ({ x: hit.x, kind: 'intersection', segmentIds: [...hit.segmentIds], hit })),
    ].sort((left, right) => left.x - right.x);
  }

  function collectIntersections(segments) {
    const hits = [];
    for (let i = 0; i < segments.length; i += 1) {
      for (let j = i + 1; j < segments.length; j += 1) {
        const hit = segmentIntersection(segments[i], segments[j]);
        if (hit) hits.push(hit);
      }
    }
    return hits;
  }
  `,
  'javascript',
);

const LINE_INTERSECTION_GO = buildStructuredCode(
  `
  package geometry

  import "sort"

  type Point struct {
      X float64
      Y float64
  }

  type Segment struct {
      ID    int
      Start Point
      End   Point
  }

  type Intersection struct {
      X float64
      Y float64
      SegmentIDs [2]int
  }

  type SweepEvent struct {
      X          float64
      Kind       string
      SegmentIDs []int
      Hit        *Intersection
  }

  //@step 1
  func SweepSegmentIntersections(segments []Segment) []Intersection {
      hits := collectIntersections(segments)
      events := buildEvents(segments, hits)
      active := map[int]bool{}
      result := make([]Intersection, 0)

      for _, event := range events {
          //@step 3
          if event.Kind == "start" {
              active[event.SegmentIDs[0]] = true
              continue
          }

          //@step 4
          if event.Kind == "end" {
              delete(active, event.SegmentIDs[0])
              continue
          }

          //@step 5
          if event.Hit != nil && active[event.SegmentIDs[0]] && active[event.SegmentIDs[1]] {
              result = append(result, *event.Hit)
          }
      }

      //@step 6
      return result
  }

  func buildEvents(segments []Segment, intersections []Intersection) []SweepEvent {
      events := make([]SweepEvent, 0, len(segments)*2+len(intersections))
      for _, segment := range segments {
          events = append(events, SweepEvent{X: segment.Start.X, Kind: "start", SegmentIDs: []int{segment.ID}})
          events = append(events, SweepEvent{X: segment.End.X, Kind: "end", SegmentIDs: []int{segment.ID}})
      }
      for _, hit := range intersections {
          ids := hit.SegmentIDs
          copyHit := hit
          events = append(events, SweepEvent{X: hit.X, Kind: "intersection", SegmentIDs: []int{ids[0], ids[1]}, Hit: &copyHit})
      }
      sort.Slice(events, func(i, j int) bool { return events[i].X < events[j].X })
      return events
  }

  func collectIntersections(segments []Segment) []Intersection {
      hits := make([]Intersection, 0)
      for i := 0; i < len(segments); i++ {
          for j := i + 1; j < len(segments); j++ {
              if hit, ok := segmentIntersection(segments[i], segments[j]); ok {
                  hits = append(hits, hit)
              }
          }
      }
      return hits
  }
  `,
  'go',
);

const LINE_INTERSECTION_RUST = buildStructuredCode(
  `
  #[derive(Clone, Copy)]
  struct Point {
      x: f64,
      y: f64,
  }

  #[derive(Clone, Copy)]
  struct Segment {
      id: usize,
      start: Point,
      end: Point,
  }

  #[derive(Clone, Copy)]
  struct Intersection {
      x: f64,
      y: f64,
      segment_ids: [usize; 2],
  }

  struct SweepEvent {
      x: f64,
      kind: &'static str,
      segment_ids: Vec<usize>,
      hit: Option<Intersection>,
  }

  //@step 1
  fn sweep_segment_intersections(segments: &[Segment]) -> Vec<Intersection> {
      let hits = collect_intersections(segments);
      let mut events = build_events(segments, &hits);
      events.sort_by(|left, right| left.x.total_cmp(&right.x));
      let mut active = std::collections::HashSet::new();
      let mut result = Vec::new();

      for event in events {
          //@step 3
          if event.kind == "start" {
              active.insert(event.segment_ids[0]);
              continue;
          }

          //@step 4
          if event.kind == "end" {
              active.remove(&event.segment_ids[0]);
              continue;
          }

          //@step 5
          if let Some(hit) = event.hit {
              if event.segment_ids.iter().all(|id| active.contains(id)) {
                  result.push(hit);
              }
          }
      }

      //@step 6
      result
  }

  fn build_events(segments: &[Segment], intersections: &[Intersection]) -> Vec<SweepEvent> {
      let mut events = Vec::new();
      for segment in segments {
          events.push(SweepEvent { x: segment.start.x, kind: "start", segment_ids: vec![segment.id], hit: None });
          events.push(SweepEvent { x: segment.end.x, kind: "end", segment_ids: vec![segment.id], hit: None });
      }
      for hit in intersections {
          events.push(SweepEvent { x: hit.x, kind: "intersection", segment_ids: hit.segment_ids.to_vec(), hit: Some(*hit) });
      }
      events
  }

  fn collect_intersections(segments: &[Segment]) -> Vec<Intersection> {
      let mut hits = Vec::new();
      for i in 0..segments.len() {
          for j in (i + 1)..segments.len() {
              if let Some(hit) = segment_intersection(segments[i], segments[j]) {
                  hits.push(hit);
              }
          }
      }
      hits
  }
  `,
  'rust',
);

const LINE_INTERSECTION_SWIFT = buildStructuredCode(
  `
  struct Point {
      let x: Double
      let y: Double
  }

  struct Segment {
      let id: Int
      let start: Point
      let end: Point
  }

  struct Intersection {
      let x: Double
      let y: Double
      let segmentIds: [Int]
  }

  struct SweepEvent {
      let x: Double
      let kind: String
      let segmentIds: [Int]
      let hit: Intersection?
  }

  //@step 1
  func sweepSegmentIntersections(_ segments: [Segment]) -> [Intersection] {
      let hits = collectIntersections(segments)
      let events = buildEvents(segments, hits).sorted { $0.x < $1.x }
      var active = Set<Int>()
      var result: [Intersection] = []

      for event in events {
          //@step 3
          if event.kind == "start" {
              active.insert(event.segmentIds[0])
              continue
          }

          //@step 4
          if event.kind == "end" {
              active.remove(event.segmentIds[0])
              continue
          }

          //@step 5
          if let hit = event.hit, event.segmentIds.allSatisfy(active.contains) {
              result.append(hit)
          }
      }

      //@step 6
      return result
  }

  func buildEvents(_ segments: [Segment], _ intersections: [Intersection]) -> [SweepEvent] {
      let segmentEvents = segments.flatMap { segment in
          [
              SweepEvent(x: segment.start.x, kind: "start", segmentIds: [segment.id], hit: nil),
              SweepEvent(x: segment.end.x, kind: "end", segmentIds: [segment.id], hit: nil),
          ]
      }
      let hitEvents = intersections.map { hit in
          SweepEvent(x: hit.x, kind: "intersection", segmentIds: hit.segmentIds, hit: hit)
      }
      return segmentEvents + hitEvents
  }

  func collectIntersections(_ segments: [Segment]) -> [Intersection] {
      var hits: [Intersection] = []
      for i in segments.indices {
          for j in (i + 1)..<segments.count {
              if let hit = segmentIntersection(segments[i], segments[j]) {
                  hits.append(hit)
              }
          }
      }
      return hits
  }
  `,
  'swift',
);

const LINE_INTERSECTION_PHP = buildStructuredCode(
  `
  final class Point
  {
      public function __construct(public float $x, public float $y) {}
  }

  final class Segment
  {
      public function __construct(
          public int $id,
          public Point $start,
          public Point $end,
      ) {}
  }

  final class Intersection
  {
      public function __construct(
          public float $x,
          public float $y,
          public array $segmentIds,
      ) {}
  }

  //@step 1
  function sweepSegmentIntersections(array $segments): array
  {
      $hits = collectIntersections($segments);
      $events = buildEvents($segments, $hits);
      $active = [];
      $result = [];

      foreach ($events as $event) {
          //@step 3
          if ($event['kind'] === 'start') {
              $active[$event['segmentIds'][0]] = true;
              continue;
          }

          //@step 4
          if ($event['kind'] === 'end') {
              unset($active[$event['segmentIds'][0]]);
              continue;
          }

          //@step 5
          if ($event['hit'] !== null && isset($active[$event['segmentIds'][0]], $active[$event['segmentIds'][1]])) {
              $result[] = $event['hit'];
          }
      }

      //@step 6
      return $result;
  }

  function buildEvents(array $segments, array $intersections): array
  {
      $events = [];
      foreach ($segments as $segment) {
          $events[] = ['x' => $segment->start->x, 'kind' => 'start', 'segmentIds' => [$segment->id], 'hit' => null];
          $events[] = ['x' => $segment->end->x, 'kind' => 'end', 'segmentIds' => [$segment->id], 'hit' => null];
      }
      foreach ($intersections as $hit) {
          $events[] = ['x' => $hit->x, 'kind' => 'intersection', 'segmentIds' => $hit->segmentIds, 'hit' => $hit];
      }
      usort($events, fn (array $left, array $right): int => $left['x'] <=> $right['x']);
      return $events;
  }

  function collectIntersections(array $segments): array
  {
      $hits = [];
      for ($i = 0; $i < count($segments); $i += 1) {
          for ($j = $i + 1; $j < count($segments); $j += 1) {
              $hit = segmentIntersection($segments[$i], $segments[$j]);
              if ($hit !== null) {
                  $hits[] = $hit;
              }
          }
      }
      return $hits;
  }
  `,
  'php',
);

const LINE_INTERSECTION_KOTLIN = buildStructuredCode(
  `
  data class Point(val x: Double, val y: Double)
  data class Segment(val id: Int, val start: Point, val end: Point)
  data class Intersection(val x: Double, val y: Double, val segmentIds: List<Int>)
  data class SweepEvent(val x: Double, val kind: String, val segmentIds: List<Int>, val hit: Intersection?)

  //@step 1
  fun sweepSegmentIntersections(segments: List<Segment>): List<Intersection> {
      val hits = collectIntersections(segments)
      val events = buildEvents(segments, hits).sortedBy { it.x }
      val active = mutableSetOf<Int>()
      val result = mutableListOf<Intersection>()

      for (event in events) {
          //@step 3
          if (event.kind == "start") {
              active += event.segmentIds.first()
              continue
          }

          //@step 4
          if (event.kind == "end") {
              active -= event.segmentIds.first()
              continue
          }

          //@step 5
          if (event.hit != null && event.segmentIds.all(active::contains)) {
              result += event.hit
          }
      }

      //@step 6
      return result
  }

  fun buildEvents(segments: List<Segment>, intersections: List<Intersection>): List<SweepEvent> =
      buildList {
          segments.forEach { segment ->
              add(SweepEvent(segment.start.x, "start", listOf(segment.id), null))
              add(SweepEvent(segment.end.x, "end", listOf(segment.id), null))
          }
          intersections.forEach { hit ->
              add(SweepEvent(hit.x, "intersection", hit.segmentIds, hit))
          }
      }

  fun collectIntersections(segments: List<Segment>): List<Intersection> =
      buildList {
          for (i in segments.indices) {
              for (j in i + 1 until segments.size) {
                  segmentIntersection(segments[i], segments[j])?.let(::add)
              }
          }
      }
  `,
  'kotlin',
);

export const LINE_INTERSECTION_CODE = LINE_INTERSECTION_TS.lines;
export const LINE_INTERSECTION_CODE_REGIONS = LINE_INTERSECTION_TS.regions;
export const LINE_INTERSECTION_CODE_HIGHLIGHT_MAP = LINE_INTERSECTION_TS.highlightMap;
export const LINE_INTERSECTION_CODE_VARIANTS: CodeVariantMap = {
  typescript: {
    language: 'typescript',
    lines: LINE_INTERSECTION_TS.lines,
    regions: LINE_INTERSECTION_TS.regions,
    highlightMap: LINE_INTERSECTION_TS.highlightMap,
    source: LINE_INTERSECTION_TS.source,
  },
  javascript: {
    language: 'javascript',
    lines: LINE_INTERSECTION_JS.lines,
    regions: LINE_INTERSECTION_JS.regions,
    highlightMap: LINE_INTERSECTION_JS.highlightMap,
    source: LINE_INTERSECTION_JS.source,
  },
  python: {
    language: 'python',
    lines: LINE_INTERSECTION_PY.lines,
    regions: LINE_INTERSECTION_PY.regions,
    highlightMap: LINE_INTERSECTION_PY.highlightMap,
    source: LINE_INTERSECTION_PY.source,
  },
  csharp: {
    language: 'csharp',
    lines: LINE_INTERSECTION_CS.lines,
    regions: LINE_INTERSECTION_CS.regions,
    highlightMap: LINE_INTERSECTION_CS.highlightMap,
    source: LINE_INTERSECTION_CS.source,
  },
  java: {
    language: 'java',
    lines: LINE_INTERSECTION_JAVA.lines,
    regions: LINE_INTERSECTION_JAVA.regions,
    highlightMap: LINE_INTERSECTION_JAVA.highlightMap,
    source: LINE_INTERSECTION_JAVA.source,
  },
  cpp: {
    language: 'cpp',
    lines: LINE_INTERSECTION_CPP.lines,
    regions: LINE_INTERSECTION_CPP.regions,
    highlightMap: LINE_INTERSECTION_CPP.highlightMap,
    source: LINE_INTERSECTION_CPP.source,
  },
  go: {
    language: 'go',
    lines: LINE_INTERSECTION_GO.lines,
    regions: LINE_INTERSECTION_GO.regions,
    highlightMap: LINE_INTERSECTION_GO.highlightMap,
    source: LINE_INTERSECTION_GO.source,
  },
  rust: {
    language: 'rust',
    lines: LINE_INTERSECTION_RUST.lines,
    regions: LINE_INTERSECTION_RUST.regions,
    highlightMap: LINE_INTERSECTION_RUST.highlightMap,
    source: LINE_INTERSECTION_RUST.source,
  },
  swift: {
    language: 'swift',
    lines: LINE_INTERSECTION_SWIFT.lines,
    regions: LINE_INTERSECTION_SWIFT.regions,
    highlightMap: LINE_INTERSECTION_SWIFT.highlightMap,
    source: LINE_INTERSECTION_SWIFT.source,
  },
  php: {
    language: 'php',
    lines: LINE_INTERSECTION_PHP.lines,
    regions: LINE_INTERSECTION_PHP.regions,
    highlightMap: LINE_INTERSECTION_PHP.highlightMap,
    source: LINE_INTERSECTION_PHP.source,
  },
  kotlin: {
    language: 'kotlin',
    lines: LINE_INTERSECTION_KOTLIN.lines,
    regions: LINE_INTERSECTION_KOTLIN.regions,
    highlightMap: LINE_INTERSECTION_KOTLIN.highlightMap,
    source: LINE_INTERSECTION_KOTLIN.source,
  },
};
