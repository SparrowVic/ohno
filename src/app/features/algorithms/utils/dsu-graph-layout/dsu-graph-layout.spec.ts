import { describe, expect, it } from 'vitest';

import { DsuGroupTrace, DsuNodeTrace } from '../../models/dsu';
import {
  DSU_GRAPH_ARROW_TIP_INSET,
  DSU_GRAPH_CIRCLE_CENTER_X,
  DSU_GRAPH_CIRCLE_CENTER_Y,
  DSU_GRAPH_FOREST_ROOT_Y,
  DSU_GRAPH_NODE_RADIUS,
  buildDsuRenderedEdge,
  layoutDsuCircle,
  layoutDsuForest,
  unionFindEdgeStatusFromChild,
} from './dsu-graph-layout';

function makeNode(
  id: string,
  parentId: string,
  options: Partial<Pick<DsuNodeTrace, 'status' | 'rank' | 'size'>> = {},
): DsuNodeTrace {
  return {
    id,
    label: id,
    parentId,
    parentLabel: parentId,
    rootId: parentId,
    rootLabel: parentId,
    rank: options.rank ?? 0,
    size: options.size ?? 1,
    status: options.status ?? 'idle',
    tags: [],
  };
}

function makeGroup(rootId: string, members: readonly string[]): DsuGroupTrace {
  return {
    rootId,
    rootLabel: rootId,
    size: members.length,
    members,
    active: false,
  };
}

describe('layoutDsuForest', () => {
  it('returns an empty map when no groups are provided', () => {
    const positions = layoutDsuForest([], []);
    expect(positions.size).toBe(0);
  });

  it('places a single root at the root Y baseline', () => {
    const nodes = [makeNode('A', 'A')];
    const groups = [makeGroup('A', ['A'])];
    const positions = layoutDsuForest(nodes, groups);
    expect(positions.get('A')?.y).toBe(DSU_GRAPH_FOREST_ROOT_Y);
  });

  it('fans children one level below their parent', () => {
    //     A (root)
    //    / \
    //   B   C
    const nodes = [
      makeNode('A', 'A'),
      makeNode('B', 'A'),
      makeNode('C', 'A'),
    ];
    const groups = [makeGroup('A', ['A', 'B', 'C'])];
    const positions = layoutDsuForest(nodes, groups);

    const rootY = positions.get('A')!.y;
    const bY = positions.get('B')!.y;
    const cY = positions.get('C')!.y;
    expect(bY).toBe(cY);
    expect(bY).toBeGreaterThan(rootY);
    expect(positions.get('B')!.x).not.toBe(positions.get('C')!.x);
  });

  it('recurses into grandchildren via BFS', () => {
    //     A (root)
    //     |
    //     B
    //     |
    //     C
    const nodes = [
      makeNode('A', 'A'),
      makeNode('B', 'A'),
      makeNode('C', 'B'),
    ];
    const groups = [makeGroup('A', ['A', 'B', 'C'])];
    const positions = layoutDsuForest(nodes, groups);

    const aY = positions.get('A')!.y;
    const bY = positions.get('B')!.y;
    const cY = positions.get('C')!.y;
    expect(bY).toBeGreaterThan(aY);
    expect(cY).toBeGreaterThan(bY);
  });

  it('lays multiple groups out horizontally, not stacked', () => {
    // Two separate singletons — their Xs must differ.
    const nodes = [makeNode('A', 'A'), makeNode('B', 'B')];
    const groups = [makeGroup('A', ['A']), makeGroup('B', ['B'])];
    const positions = layoutDsuForest(nodes, groups);
    expect(positions.get('A')!.x).not.toBe(positions.get('B')!.x);
    // Same baseline — both roots.
    expect(positions.get('A')!.y).toBe(positions.get('B')!.y);
  });
});

describe('layoutDsuCircle', () => {
  it('returns an empty map when no nodes are provided', () => {
    expect(layoutDsuCircle([]).size).toBe(0);
  });

  it('places a single node directly above the circle centre', () => {
    const positions = layoutDsuCircle([makeNode('A', 'A')]);
    const pos = positions.get('A')!;
    expect(Math.round(pos.x)).toBe(DSU_GRAPH_CIRCLE_CENTER_X);
    expect(pos.y).toBeLessThan(DSU_GRAPH_CIRCLE_CENTER_Y);
  });

  it('spreads four nodes to the four cardinal directions (top, right, bottom, left)', () => {
    const nodes = ['A', 'B', 'C', 'D'].map((id) => makeNode(id, id));
    const positions = layoutDsuCircle(nodes);
    const top = positions.get('A')!;
    const right = positions.get('B')!;
    const bottom = positions.get('C')!;
    const left = positions.get('D')!;

    expect(Math.round(top.x)).toBe(DSU_GRAPH_CIRCLE_CENTER_X);
    expect(top.y).toBeLessThan(DSU_GRAPH_CIRCLE_CENTER_Y);

    expect(right.x).toBeGreaterThan(DSU_GRAPH_CIRCLE_CENTER_X);
    expect(Math.round(right.y)).toBe(DSU_GRAPH_CIRCLE_CENTER_Y);

    expect(Math.round(bottom.x)).toBe(DSU_GRAPH_CIRCLE_CENTER_X);
    expect(bottom.y).toBeGreaterThan(DSU_GRAPH_CIRCLE_CENTER_Y);

    expect(left.x).toBeLessThan(DSU_GRAPH_CIRCLE_CENTER_X);
    expect(Math.round(left.y)).toBe(DSU_GRAPH_CIRCLE_CENTER_Y);
  });
});

describe('buildDsuRenderedEdge', () => {
  it('returns null when either endpoint is missing', () => {
    expect(
      buildDsuRenderedEdge({
        id: 'e',
        fromId: 'A',
        toId: 'B',
        from: undefined,
        to: { x: 100, y: 100 },
        weight: null,
        status: 'parent',
        directed: true,
      }),
    ).toBeNull();
  });

  it('trims both endpoints by (node radius + inset) along the line direction', () => {
    const edge = buildDsuRenderedEdge({
      id: 'e',
      fromId: 'A',
      toId: 'B',
      from: { x: 0, y: 0 },
      to: { x: 200, y: 0 },
      weight: null,
      status: 'parent',
      directed: true,
    })!;
    // Edge is purely horizontal — y stays zero, x shrinks inward on
    // both sides by (radius + inset).
    expect(edge.y1).toBe(0);
    expect(edge.y2).toBe(0);
    const trim = DSU_GRAPH_NODE_RADIUS + DSU_GRAPH_ARROW_TIP_INSET;
    expect(edge.x1).toBeCloseTo(trim, 5);
    expect(edge.x2).toBeCloseTo(200 - trim, 5);
  });

  it('keeps the midpoint at the raw from/to midpoint (not trimmed)', () => {
    const edge = buildDsuRenderedEdge({
      id: 'e',
      fromId: 'A',
      toId: 'B',
      from: { x: 40, y: 40 },
      to: { x: 140, y: 140 },
      weight: 7,
      status: 'accepted',
      directed: false,
    })!;
    expect(edge.midX).toBe(90);
    expect(edge.midY).toBe(90);
    expect(edge.weight).toBe(7);
  });

  it('clamps trim for very short edges so endpoints do not invert', () => {
    // Distance of 20 — trim would otherwise be 24 and push endpoints
    // past each other. The helper caps it at dist / 2 - 0.5 = 9.5.
    const edge = buildDsuRenderedEdge({
      id: 'e',
      fromId: 'A',
      toId: 'B',
      from: { x: 0, y: 0 },
      to: { x: 20, y: 0 },
      weight: null,
      status: 'parent',
      directed: true,
    })!;
    expect(edge.x1).toBeCloseTo(9.5, 5);
    expect(edge.x2).toBeCloseTo(10.5, 5);
    expect(edge.x1).toBeLessThan(edge.x2);
  });
});

describe('unionFindEdgeStatusFromChild', () => {
  it('promotes active / query children to active edges', () => {
    expect(unionFindEdgeStatusFromChild('active')).toBe('active');
    expect(unionFindEdgeStatusFromChild('query')).toBe('active');
  });

  it('promotes merged / compressed children to accepted edges', () => {
    expect(unionFindEdgeStatusFromChild('merged')).toBe('accepted');
    expect(unionFindEdgeStatusFromChild('compressed')).toBe('accepted');
  });

  it('falls back to a quiet parent pointer for idle / root / untagged states', () => {
    expect(unionFindEdgeStatusFromChild('idle')).toBe('parent');
    expect(unionFindEdgeStatusFromChild('root')).toBe('parent');
  });
});
