import { describe, expect, it } from 'vitest';

import { DsuGroupTrace, DsuNodeTrace } from '../../models/dsu';
import {
  DSU_GRAPH_CIRCLE_CENTER_X,
  DSU_GRAPH_CIRCLE_CENTER_Y,
  DSU_GRAPH_FOREST_ROOT_Y,
  layoutDsuCircle,
  layoutDsuForest,
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
    const nodes = [makeNode('A', 'A'), makeNode('B', 'B')];
    const groups = [makeGroup('A', ['A']), makeGroup('B', ['B'])];
    const positions = layoutDsuForest(nodes, groups);
    expect(positions.get('A')!.x).not.toBe(positions.get('B')!.x);
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
