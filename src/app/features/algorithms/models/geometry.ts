export type PointStatus =
  | 'default'
  | 'pivot'
  | 'sorted'
  | 'checking'
  | 'stack'
  | 'hull'
  | 'rejected'
  | 'dimmed'
  | 'left'
  | 'right'
  | 'strip'
  | 'compare'
  | 'best';

export interface GeometryPoint {
  readonly id: number;
  readonly x: number;
  readonly y: number;
  readonly status: PointStatus;
  readonly sortIndex?: number | null;
}

export interface GeometryEdge {
  readonly fromId: number;
  readonly toId: number;
  readonly kind: 'stack' | 'hull';
}

export interface GeometryBand {
  readonly x0: number;
  readonly x1: number;
  readonly tone: 'region' | 'left' | 'right' | 'strip';
  readonly label?: string | null;
  readonly depth?: number | null;
}

export interface GeometryDivider {
  readonly x: number;
  readonly tone: 'split' | 'strip';
  readonly label?: string | null;
}

export interface GeometryPairLine {
  readonly pointIds: readonly [number, number];
  readonly tone: 'candidate' | 'best' | 'final';
  readonly distance: number;
  readonly label?: string | null;
}

export interface GeometryCoord {
  readonly x: number;
  readonly y: number;
}

export interface GeometrySegmentLine {
  readonly id: string;
  readonly label: string;
  readonly start: GeometryCoord;
  readonly end: GeometryCoord;
  readonly tone: 'pending' | 'active' | 'focus' | 'hit' | 'done';
}

export interface GeometryEventChip {
  readonly id: string;
  readonly label: string;
  readonly x: number;
  readonly kind: 'start' | 'end' | 'intersection' | 'constraint' | 'vector';
  readonly tone: 'queued' | 'current' | 'done';
}

export interface GeometryMarker {
  readonly id: string;
  readonly x: number;
  readonly y: number;
  readonly tone:
    | 'intersection'
    | 'current'
    | 'vertex'
    | 'candidate'
    | 'terminal'
    | 'robot'
    | 'result';
  readonly label?: string | null;
}

export interface GeometryPolygonRegion {
  readonly id: string;
  readonly label: string;
  readonly vertices: readonly GeometryCoord[];
  readonly tone:
    | 'feasible'
    | 'previous'
    | 'forbidden'
    | 'shape-a'
    | 'shape-b'
    | 'shape-reflected'
    | 'result'
    | 'result-preview'
    | 'cell'
    | 'cell-active'
    | 'triangle'
    | 'triangle-current'
    | 'mesh';
}

export interface GeometryConstraintLine {
  readonly id: string;
  readonly label: string;
  readonly start: GeometryCoord;
  readonly end: GeometryCoord;
  readonly tone: 'pending' | 'active' | 'applied' | 'blocking';
  readonly keepSide: 'left';
}

export interface GeometryVectorArrow {
  readonly id: string;
  readonly label: string;
  readonly dx: number;
  readonly dy: number;
  readonly tone: 'shape-a' | 'shape-b' | 'merge' | 'current' | 'done';
}

export interface GeometryRect {
  readonly id: string;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly tone: 'pending' | 'active' | 'done' | 'focus';
  readonly label?: string | null;
}

export interface GeometrySpan {
  readonly id: string;
  readonly y0: number;
  readonly y1: number;
  readonly tone: 'active' | 'merged' | 'done';
  readonly label?: string | null;
}

export interface GeometryCircleOverlay {
  readonly id: string;
  readonly cx: number;
  readonly cy: number;
  readonly r: number;
  readonly tone: 'candidate' | 'accepted' | 'rejected' | 'current';
  readonly label?: string | null;
}

export interface ConvexHullStepState {
  readonly mode: 'convex-hull';
  readonly points: readonly GeometryPoint[];
  readonly edges: readonly GeometryEdge[];
  readonly stackIds: readonly number[];
  readonly turnCheck: readonly [number, number, number] | null;
  readonly crossProduct: number | null;
  readonly phase: string;
}

export interface ClosestPairStepState {
  readonly mode: 'closest-pair';
  readonly points: readonly GeometryPoint[];
  readonly phase: string;
  readonly bands: readonly GeometryBand[];
  readonly dividers: readonly GeometryDivider[];
  readonly pairLines: readonly GeometryPairLine[];
  readonly regionBounds: readonly [number, number] | null;
  readonly regionLabel: string;
  readonly trail: readonly string[];
  readonly depth: number;
  readonly midX: number | null;
  readonly stripWidth: number | null;
  readonly bestDistance: number | null;
  readonly candidateDistance: number | null;
  readonly checkedPairs: number;
  readonly currentPair: readonly [number, number] | null;
  readonly bestPair: readonly [number, number] | null;
}

export interface LineIntersectionStepState {
  readonly mode: 'line-intersection';
  readonly phase: string;
  readonly segments: readonly GeometrySegmentLine[];
  readonly sweepX: number | null;
  readonly events: readonly GeometryEventChip[];
  readonly intersections: readonly GeometryMarker[];
  readonly activeOrder: readonly string[];
  readonly foundCount: number;
  readonly currentEventLabel: string;
}

export interface HalfPlaneIntersectionStepState {
  readonly mode: 'half-plane-intersection';
  readonly phase: string;
  readonly constraints: readonly GeometryConstraintLine[];
  readonly polygons: readonly GeometryPolygonRegion[];
  readonly markers: readonly GeometryMarker[];
  readonly events: readonly GeometryEventChip[];
  readonly feasibleArea: number | null;
  readonly vertexCount: number;
  readonly status: 'feasible' | 'empty' | 'complete';
  readonly currentConstraintLabel: string;
}

export interface MinkowskiSumStepState {
  readonly mode: 'minkowski-sum';
  readonly phase: string;
  readonly polygons: readonly GeometryPolygonRegion[];
  readonly vectors: readonly GeometryVectorArrow[];
  readonly events: readonly GeometryEventChip[];
  readonly activeSource: 'a' | 'b' | 'both' | null;
  readonly mergedEdgeCount: number;
  readonly totalEdges: number;
  readonly currentVectorLabel: string | null;
  readonly resultArea: number | null;
}

export interface SweepLineStepState {
  readonly mode: 'sweep-line';
  readonly phase: string;
  readonly rectangles: readonly GeometryRect[];
  readonly spans: readonly GeometrySpan[];
  readonly sweepX: number | null;
  readonly fillWidth: number | null;
  readonly events: readonly GeometryEventChip[];
  readonly coveredArea: number;
  readonly currentEventLabel: string;
}

export interface VoronoiDiagramStepState {
  readonly mode: 'voronoi-diagram';
  readonly phase: string;
  readonly points: readonly GeometryPoint[];
  readonly cells: readonly GeometryPolygonRegion[];
  readonly sweepY: number | null;
  readonly events: readonly GeometryEventChip[];
  readonly activeSiteId: number | null;
  readonly closedCells: number;
  readonly currentCellLabel: string;
}

export interface DelaunayTriangulationStepState {
  readonly mode: 'delaunay-triangulation';
  readonly phase: string;
  readonly points: readonly GeometryPoint[];
  readonly triangles: readonly GeometryPolygonRegion[];
  readonly edges: readonly GeometrySegmentLine[];
  readonly circles: readonly GeometryCircleOverlay[];
  readonly events: readonly GeometryEventChip[];
  readonly activeTriangleLabel: string;
  readonly triangleCount: number;
}

export type GeometryStepState =
  | ConvexHullStepState
  | ClosestPairStepState
  | LineIntersectionStepState
  | HalfPlaneIntersectionStepState
  | MinkowskiSumStepState
  | SweepLineStepState
  | VoronoiDiagramStepState
  | DelaunayTriangulationStepState;

export function isConvexHullState(
  state: GeometryStepState | null | undefined,
): state is ConvexHullStepState {
  return state?.mode === 'convex-hull';
}

export function isClosestPairState(
  state: GeometryStepState | null | undefined,
): state is ClosestPairStepState {
  return state?.mode === 'closest-pair';
}

export function isLineIntersectionState(
  state: GeometryStepState | null | undefined,
): state is LineIntersectionStepState {
  return state?.mode === 'line-intersection';
}

export function isHalfPlaneIntersectionState(
  state: GeometryStepState | null | undefined,
): state is HalfPlaneIntersectionStepState {
  return state?.mode === 'half-plane-intersection';
}

export function isMinkowskiSumState(
  state: GeometryStepState | null | undefined,
): state is MinkowskiSumStepState {
  return state?.mode === 'minkowski-sum';
}

export function isSweepLineState(
  state: GeometryStepState | null | undefined,
): state is SweepLineStepState {
  return state?.mode === 'sweep-line';
}

export function isVoronoiDiagramState(
  state: GeometryStepState | null | undefined,
): state is VoronoiDiagramStepState {
  return state?.mode === 'voronoi-diagram';
}

export function isDelaunayTriangulationState(
  state: GeometryStepState | null | undefined,
): state is DelaunayTriangulationStepState {
  return state?.mode === 'delaunay-triangulation';
}
