import { CodeVariantMap } from '../models/detail';
import { buildStructuredCode } from './code-line-builder/code-line-builder';

const SWEEP_LINE_TS = buildStructuredCode(`
  //#region rect interface collapsed
  interface Rect {
    readonly id: number;
    readonly x: number;
    readonly y: number;
    readonly width: number;
    readonly height: number;
  }
  //#endregion rect

  //#region sweep-event interface collapsed
  interface SweepEvent {
    readonly x: number;
    readonly kind: 'start' | 'end';
    readonly rect: Rect;
  }
  //#endregion sweep-event

  /**
   * Compute the union area of axis-aligned rectangles with a vertical sweep.
   * Input: rectangles on the plane.
   * Returns: the total covered area.
   */
  //#region union-area function open
  //@step 1
  function unionArea(rectangles: readonly Rect[]): number {
    const events = buildEvents(rectangles);
    const active: Rect[] = [];
    let previousX = events[0]?.x ?? 0;
    let area = 0;

    for (const event of events) {
      area += mergedYLength(active) * Math.max(0, event.x - previousX);
      previousX = event.x;

      //@step 3
      if (event.kind === 'start') {
        active.push(event.rect);
        continue;
      }

      //@step 4
      removeRect(active, event.rect.id);
    }

    //@step 5
    return area;
  }
  //#endregion union-area

  //#region build-events helper collapsed
  function buildEvents(rectangles: readonly Rect[]): SweepEvent[] {
    return rectangles
      .flatMap((rect) => [
        { x: rect.x, kind: 'start' as const, rect },
        { x: rect.x + rect.width, kind: 'end' as const, rect },
      ])
      .sort((left, right) => left.x - right.x || (left.kind === 'start' ? -1 : 1));
  }
  //#endregion build-events

  //#region merged-y-length helper collapsed
  function mergedYLength(rectangles: readonly Rect[]): number {
    const spans = rectangles
      .map((rect) => [rect.y, rect.y + rect.height] as const)
      .sort((left, right) => left[0] - right[0]);

    let total = 0;
    let current: [number, number] | null = null;

    for (const span of spans) {
      if (!current || span[0] > current[1]) {
        if (current) {
          total += current[1] - current[0];
        }

        current = [span[0], span[1]];
      } else {
        current[1] = Math.max(current[1], span[1]);
      }
    }

    return current ? total + current[1] - current[0] : total;
  }
  //#endregion merged-y-length

  //#region remove-rect helper collapsed
  function removeRect(active: Rect[], id: number): void {
    const index = active.findIndex((rect) => rect.id === id);
    if (index >= 0) {
      active.splice(index, 1);
    }
  }
  //#endregion remove-rect
`);

const SWEEP_LINE_PY = buildStructuredCode(
  `
  //#region rect interface collapsed
  from dataclasses import dataclass


  @dataclass(frozen=True)
  class Rect:
      id: int
      x: float
      y: float
      width: float
      height: float
  //#endregion rect

  """
  Compute the union area of axis-aligned rectangles with a vertical sweep.
  Input: rectangles on the plane.
  Returns: the total covered area.
  """
  //#region union-area function open
  //@step 1
  def union_area(rectangles: list[Rect]) -> float:
      events = build_events(rectangles)
      active: list[Rect] = []
      previous_x = events[0]["x"] if events else 0.0
      area = 0.0

      for event in events:
          area += merged_y_length(active) * max(0.0, event["x"] - previous_x)
          previous_x = event["x"]

          //@step 3
          if event["kind"] == "start":
              active.append(event["rect"])
              continue

          //@step 4
          remove_rect(active, event["rect"].id)

      //@step 5
      return area
  //#endregion union-area

  //#region build-events helper collapsed
  def build_events(rectangles: list[Rect]) -> list[dict]:
      events = [
          *({"x": rect.x, "kind": "start", "rect": rect} for rect in rectangles),
          *({"x": rect.x + rect.width, "kind": "end", "rect": rect} for rect in rectangles),
      ]
      return sorted(events, key=lambda event: (event["x"], 0 if event["kind"] == "start" else 1))
  //#endregion build-events

  //#region merged-y-length helper collapsed
  def merged_y_length(rectangles: list[Rect]) -> float:
      spans = sorted((rect.y, rect.y + rect.height) for rect in rectangles)
      total = 0.0
      current: tuple[float, float] | None = None

      for start, end in spans:
          if current is None or start > current[1]:
              if current is not None:
                  total += current[1] - current[0]
              current = (start, end)
          else:
              current = (current[0], max(current[1], end))

      return total + (current[1] - current[0]) if current is not None else total
  //#endregion merged-y-length

  //#region remove-rect helper collapsed
  def remove_rect(active: list[Rect], rect_id: int) -> None:
      for index, rect in enumerate(active):
          if rect.id == rect_id:
              active.pop(index)
              return
  //#endregion remove-rect
  `,
  'python',
);

const SWEEP_LINE_CS = buildStructuredCode(
  `
  //#region rect interface collapsed
  public readonly record struct Rect(int Id, double X, double Y, double Width, double Height);
  public readonly record struct SweepEvent(double X, string Kind, Rect Rect);
  //#endregion rect

  //#region union-area function open
  /// <summary>
  /// Computes the union area of axis-aligned rectangles with a vertical sweep.
  /// Input: rectangles on the plane.
  /// Returns: the total covered area.
  /// </summary>
  //@step 1
  public static double UnionArea(IReadOnlyList<Rect> rectangles)
  {
      var events = BuildEvents(rectangles);
      var active = new List<Rect>();
      var previousX = events.FirstOrDefault().X;
      var area = 0.0;

      foreach (var @event in events)
      {
          area += MergedYLength(active) * Math.Max(0.0, @event.X - previousX);
          previousX = @event.X;

          //@step 3
          if (@event.Kind == "start")
          {
              active.Add(@event.Rect);
              continue;
          }

          //@step 4
          RemoveRect(active, @event.Rect.Id);
      }

      //@step 5
      return area;
  }
  //#endregion union-area

  //#region build-events helper collapsed
  private static List<SweepEvent> BuildEvents(IReadOnlyList<Rect> rectangles)
  {
      return rectangles
          .SelectMany(rect => new[]
          {
              new SweepEvent(rect.X, "start", rect),
              new SweepEvent(rect.X + rect.Width, "end", rect),
          })
          .OrderBy(@event => @event.X)
          .ThenBy(@event => @event.Kind == "start" ? 0 : 1)
          .ToList();
  }
  //#endregion build-events

  //#region merged-y-length helper collapsed
  private static double MergedYLength(IReadOnlyList<Rect> rectangles)
  {
      var spans = rectangles
          .Select(rect => (Start: rect.Y, End: rect.Y + rect.Height))
          .OrderBy(span => span.Start)
          .ToList();

      var total = 0.0;
      (double Start, double End)? current = null;

      foreach (var span in spans)
      {
          if (current is null || span.Start > current.Value.End)
          {
              if (current is not null)
              {
                  total += current.Value.End - current.Value.Start;
              }

              current = span;
          }
          else
          {
              current = (current.Value.Start, Math.Max(current.Value.End, span.End));
          }
      }

      return current is null ? total : total + current.Value.End - current.Value.Start;
  }
  //#endregion merged-y-length

  //#region remove-rect helper collapsed
  private static void RemoveRect(List<Rect> active, int id)
  {
      var index = active.FindIndex(rect => rect.Id == id);
      if (index >= 0)
      {
          active.RemoveAt(index);
      }
  }
  //#endregion remove-rect
  `,
  'csharp',
);

const SWEEP_LINE_JAVA = buildStructuredCode(
  `
  //#region rect interface collapsed
  public record Rect(int id, double x, double y, double width, double height) {}
  public record SweepEvent(double x, String kind, Rect rect) {}
  //#endregion rect

  //#region union-area function open
  /**
   * Computes the union area of axis-aligned rectangles with a vertical sweep.
   * Input: rectangles on the plane.
   * Returns: the total covered area.
   */
  //@step 1
  public static double unionArea(List<Rect> rectangles) {
      List<SweepEvent> events = buildEvents(rectangles);
      List<Rect> active = new ArrayList<>();
      double previousX = events.isEmpty() ? 0.0 : events.get(0).x();
      double area = 0.0;

      for (SweepEvent event : events) {
          area += mergedYLength(active) * Math.max(0.0, event.x() - previousX);
          previousX = event.x();

          //@step 3
          if ("start".equals(event.kind())) {
              active.add(event.rect());
              continue;
          }

          //@step 4
          removeRect(active, event.rect().id());
      }

      //@step 5
      return area;
  }
  //#endregion union-area

  //#region build-events helper collapsed
  private static List<SweepEvent> buildEvents(List<Rect> rectangles) {
      return rectangles.stream()
          .flatMap(rect -> Stream.of(
              new SweepEvent(rect.x(), "start", rect),
              new SweepEvent(rect.x() + rect.width(), "end", rect)
          ))
          .sorted(Comparator
              .comparingDouble(SweepEvent::x)
              .thenComparing(event -> "start".equals(event.kind()) ? 0 : 1))
          .toList();
  }
  //#endregion build-events

  //#region merged-y-length helper collapsed
  private static double mergedYLength(List<Rect> rectangles) {
      List<double[]> spans = rectangles.stream()
          .map(rect -> new double[] {rect.y(), rect.y() + rect.height()})
          .sorted(Comparator.comparingDouble(span -> span[0]))
          .toList();

      double total = 0.0;
      double[] current = null;

      for (double[] span : spans) {
          if (current == null || span[0] > current[1]) {
              if (current != null) {
                  total += current[1] - current[0];
              }
              current = new double[] {span[0], span[1]};
          } else {
              current[1] = Math.max(current[1], span[1]);
          }
      }

      return current == null ? total : total + current[1] - current[0];
  }
  //#endregion merged-y-length

  //#region remove-rect helper collapsed
  private static void removeRect(List<Rect> active, int id) {
      active.removeIf(rect -> rect.id() == id);
  }
  //#endregion remove-rect
  `,
  'java',
);

const SWEEP_LINE_CPP = buildStructuredCode(
  `
  //#region rect interface collapsed
  struct Rect {
      int id;
      double x;
      double y;
      double width;
      double height;
  };

  struct SweepEvent {
      double x;
      std::string kind;
      Rect rect;
  };
  //#endregion rect

  //#region union-area function open
  /**
   * Computes the union area of axis-aligned rectangles with a vertical sweep.
   * Input: rectangles on the plane.
   * Returns: the total covered area.
   */
  //@step 1
  double unionArea(const std::vector<Rect>& rectangles) {
      auto events = buildEvents(rectangles);
      std::vector<Rect> active;
      double previousX = events.empty() ? 0.0 : events.front().x;
      double area = 0.0;

      for (const auto& event : events) {
          area += mergedYLength(active) * std::max(0.0, event.x - previousX);
          previousX = event.x;

          //@step 3
          if (event.kind == "start") {
              active.push_back(event.rect);
              continue;
          }

          //@step 4
          removeRect(active, event.rect.id);
      }

      //@step 5
      return area;
  }
  //#endregion union-area

  //#region build-events helper collapsed
  std::vector<SweepEvent> buildEvents(const std::vector<Rect>& rectangles) {
      std::vector<SweepEvent> events;
      for (const auto& rect : rectangles) {
          events.push_back({rect.x, "start", rect});
          events.push_back({rect.x + rect.width, "end", rect});
      }

      std::sort(events.begin(), events.end(), [](const SweepEvent& left, const SweepEvent& right) {
          if (left.x != right.x) {
              return left.x < right.x;
          }
          return left.kind == "start" && right.kind == "end";
      });
      return events;
  }
  //#endregion build-events

  //#region merged-y-length helper collapsed
  double mergedYLength(const std::vector<Rect>& rectangles) {
      std::vector<std::pair<double, double>> spans;
      spans.reserve(rectangles.size());
      for (const auto& rect : rectangles) {
          spans.emplace_back(rect.y, rect.y + rect.height);
      }

      std::sort(spans.begin(), spans.end());

      double total = 0.0;
      std::optional<std::pair<double, double>> current;
      for (const auto& span : spans) {
          if (!current.has_value() || span.first > current->second) {
              if (current.has_value()) {
                  total += current->second - current->first;
              }
              current = span;
          } else {
              current->second = std::max(current->second, span.second);
          }
      }

      return current.has_value() ? total + current->second - current->first : total;
  }
  //#endregion merged-y-length

  //#region remove-rect helper collapsed
  void removeRect(std::vector<Rect>& active, int id) {
      auto it = std::find_if(active.begin(), active.end(), [id](const Rect& rect) {
          return rect.id == id;
      });
      if (it != active.end()) {
          active.erase(it);
      }
  }
  //#endregion remove-rect
  `,
  'cpp',
);

export const SWEEP_LINE_CODE = SWEEP_LINE_TS.lines;
export const SWEEP_LINE_CODE_REGIONS = SWEEP_LINE_TS.regions;
export const SWEEP_LINE_CODE_HIGHLIGHT_MAP = SWEEP_LINE_TS.highlightMap;
export const SWEEP_LINE_CODE_VARIANTS: CodeVariantMap = {
  typescript: {
    language: 'typescript',
    lines: SWEEP_LINE_TS.lines,
    regions: SWEEP_LINE_TS.regions,
    highlightMap: SWEEP_LINE_TS.highlightMap,
    source: SWEEP_LINE_TS.source,
  },
  python: {
    language: 'python',
    lines: SWEEP_LINE_PY.lines,
    regions: SWEEP_LINE_PY.regions,
    highlightMap: SWEEP_LINE_PY.highlightMap,
    source: SWEEP_LINE_PY.source,
  },
  csharp: {
    language: 'csharp',
    lines: SWEEP_LINE_CS.lines,
    regions: SWEEP_LINE_CS.regions,
    highlightMap: SWEEP_LINE_CS.highlightMap,
    source: SWEEP_LINE_CS.source,
  },
  java: {
    language: 'java',
    lines: SWEEP_LINE_JAVA.lines,
    regions: SWEEP_LINE_JAVA.regions,
    highlightMap: SWEEP_LINE_JAVA.highlightMap,
    source: SWEEP_LINE_JAVA.source,
  },
  cpp: {
    language: 'cpp',
    lines: SWEEP_LINE_CPP.lines,
    regions: SWEEP_LINE_CPP.regions,
    highlightMap: SWEEP_LINE_CPP.highlightMap,
    source: SWEEP_LINE_CPP.source,
  },
};
