export type PointStatus =
  | 'default'
  | 'pivot'
  | 'sorted'
  | 'checking'
  | 'stack'
  | 'hull'
  | 'rejected';

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

export interface GeometryStepState {
  readonly points: readonly GeometryPoint[];
  readonly edges: readonly GeometryEdge[];
  readonly stackIds: readonly number[];
  readonly turnCheck: readonly [number, number, number] | null;
  readonly crossProduct: number | null;
  readonly phase: string;
}
