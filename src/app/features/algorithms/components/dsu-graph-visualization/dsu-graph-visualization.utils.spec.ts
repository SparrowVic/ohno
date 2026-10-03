import { describe, expect, it } from 'vitest';

import { DsuEdgeTrace, DsuGroupTrace, DsuNodeTrace } from '../../models/dsu';
import {
  dsuArrowMarkerId,
  dsuChipPoint,
  dsuCurrentNodeId,
  dsuEdgeRows,
  dsuGraphFrame,
  dsuGraphGlyphs,
  dsuGraphMinScreen,
  dsuGraphViewBoxAttr,
  dsuGroupsByNodeId,
  dsuKruskalEdgeTone,
  dsuNodeTone,
  dsuOperationRows,
  dsuParentEdgeTone,
  dsuSetRows,
  dsuSpreadRing,
  dsuTrimSegment,
  dsuWeightChipTone,
  dsuWeightChipWidth,
} from './dsu-graph-visualization.utils';

function node(id: string, parentId: string, rootId: string, status: DsuNodeTrace['status'] = 'idle'): DsuNodeTrace {
  return {
    id,
    label: id.toUpperCase(),
    parentId,
    parentLabel: parentId.toUpperCase(),
    rootId,
    rootLabel: rootId.toUpperCase(),
    rank: 0,
    size: 1,
    status,
    tags: [],
  };
}

function edge(id: string, fromId: string, toId: string, status: DsuEdgeTrace['status'], weight: number | null = null): DsuEdgeTrace {
  return {
    id,
    fromId,
    fromLabel: fromId.toUpperCase(),
    toId,
    toLabel: fromId === toId ? 'find' : toId.toUpperCase(),
    weight,
    status,
  };
}

describe('dsu graph display tones', () => {
  it('maps node status to the semantic tone', () => {
    expect(dsuNodeTone('active', false)).toBe('cyan');
    expect(dsuNodeTone('query', true)).toBe('cyan');
    expect(dsuNodeTone('merged', true)).toBe('pink');
    expect(dsuNodeTone('compressed', false)).toBe('amber');
    expect(dsuNodeTone('root', true)).toBe('violet');
    expect(dsuNodeTone('idle', true)).toBe('violet');
    expect(dsuNodeTone('idle', false)).toBe('slate');
  });

  it('paints parent pointers from the child status', () => {
    expect(dsuParentEdgeTone('merged')).toBe('pink');
    expect(dsuParentEdgeTone('compressed')).toBe('amber');
    expect(dsuParentEdgeTone('active')).toBe('cyan');
    expect(dsuParentEdgeTone('query')).toBe('cyan');
    expect(dsuParentEdgeTone('idle')).toBe('idle');
  });

  it('paints kruskal edges and chips from the edge status', () => {
    expect(dsuKruskalEdgeTone('active')).toBe('pink');
    expect(dsuKruskalEdgeTone('accepted')).toBe('lime');
    expect(dsuKruskalEdgeTone('rejected')).toBe('red');
    expect(dsuKruskalEdgeTone('pending')).toBe('idle');
    expect(dsuWeightChipTone('pending')).toBe('slate');
    expect(dsuWeightChipTone('active')).toBe('pink');
  });

  it('picks only the first active node as current', () => {
    const nodes = [node('a', 'a', 'a', 'query'), node('b', 'a', 'a', 'active'), node('c', 'a', 'a', 'active')];
    expect(dsuCurrentNodeId(nodes)).toBe('b');
    expect(dsuCurrentNodeId([node('a', 'a', 'a')])).toBeNull();
  });
});

describe('dsu graph racks', () => {
  const groups: DsuGroupTrace[] = [
    { rootId: 'e', rootLabel: 'E', size: 1, members: ['E'], active: false },
    { rootId: 'a', rootLabel: 'A', size: 3, members: ['A', 'B', 'C'], active: false },
    { rootId: 'd', rootLabel: 'D', size: 2, members: ['D', 'F'], active: true },
  ];

  it('orders sets by size, drops the root from the members and dims singletons', () => {
    const rows = dsuSetRows(groups);
    expect(rows.map((row) => row.rootLabel)).toEqual(['A', 'D', 'E']);
    expect(rows[0]).toMatchObject({ members: 'B C', size: 3, tone: 'default' });
    expect(rows[1]?.tone).toBe('now');
    expect(rows[2]).toMatchObject({ members: '', tone: 'dim' });
  });

  it('maps edge statuses onto rack row tones', () => {
    const rows = dsuEdgeRows([
      edge('1', 'a', 'b', 'accepted', 1),
      edge('2', 'b', 'c', 'active', 2),
      edge('3', 'a', 'c', 'rejected', 3),
      edge('4', 'c', 'd', 'pending', 4),
    ]);
    expect(rows.map((row) => row.tone)).toEqual(['done', 'head', 'dim', 'default']);
    expect(rows[1]).toMatchObject({ fromLabel: 'B', toLabel: 'C', weight: 2 });
  });

  it('tells find operations from unions', () => {
    const rows = dsuOperationRows([edge('op-0', 'a', 'b', 'accepted'), edge('op-1', 'c', 'c', 'active')]);
    expect(rows.map((row) => row.kind)).toEqual(['union', 'find']);
    expect(rows.map((row) => row.mark)).toEqual(['accepted', 'active']);
  });
});

describe('dsu graph geometry', () => {
  it('rebuilds group members as node ids for the forest layout', () => {
    const nodes = [node('n1', 'n1', 'n1'), node('n2', 'n1', 'n1'), node('n3', 'n3', 'n3')];
    const result = dsuGroupsByNodeId(nodes, [
      { rootId: 'n1', rootLabel: 'N1', size: 2, members: ['N1', 'N2'], active: false },
      { rootId: 'n3', rootLabel: 'N3', size: 1, members: ['N3'], active: false },
    ]);
    expect(result.map((group) => group.members)).toEqual([['n1', 'n2'], ['n3']]);
  });

  it('spreads a ring to the target radius around its centre', () => {
    const ring = new Map([
      ['a', { x: 100, y: 0 }],
      ['b', { x: 0, y: 100 }],
      ['c', { x: -100, y: 0 }],
      ['d', { x: 0, y: -100 }],
    ]);
    const spread = dsuSpreadRing(ring, 200);
    expect(spread.get('a')).toEqual({ x: 200, y: 0 });
    expect(spread.get('d')).toEqual({ x: 0, y: -200 });
    const single = new Map([['a', { x: 4, y: 5 }]]);
    expect(dsuSpreadRing(single, 200)).toBe(single);
  });

  it('places chips off the midpoint so crossing diameters do not stack', () => {
    expect(dsuChipPoint({ x1: 0, y1: 0, x2: 100, y2: 50 })).toEqual({ x: 40, y: 20 });
    expect(dsuWeightChipWidth(7)).toBe(16);
    expect(dsuWeightChipWidth(12)).toBe(22);
  });

  it('builds per-instance marker ids', () => {
    expect(dsuArrowMarkerId('dsu-graph-3', 'pink')).toBe('dsu-graph-3-arrow-pink');
  });
});

describe('dsu graph frame', () => {
  const padding = { x: 50, top: 40, bottom: 20 };
  const ring = [
    { x: 0, y: -200 },
    { x: 200, y: 0 },
    { x: 0, y: 200 },
    { x: -200, y: 0 },
  ];

  it('fits the content inside the measured screen with the padding kept in pixels', () => {
    const frame = dsuGraphFrame(ring, 600, 260, padding);
    expect(frame.unit).toBe(2);
    expect(frame.width).toBe(1200);
    expect(frame.height).toBe(520);
    expect(frame.y).toBe(-280);
    expect(frame.y + 40 * frame.unit).toBe(-200);
    expect(frame.y + frame.height - 20 * frame.unit).toBe(200);
    expect(frame.x).toBe(-600);
    expect(dsuGraphViewBoxAttr(frame)).toBe('-600 -280 1200 520');
  });

  it('never magnifies past one pixel per unit and keeps a lone node centred', () => {
    const frame = dsuGraphFrame([{ x: 10, y: 20 }], 400, 300, padding);
    expect(frame.unit).toBe(1);
    expect(frame.x + frame.width / 2).toBe(10);
    expect(frame.y + 40 + (frame.height - 60) / 2).toBe(20);
  });

  it('falls back to the reference canvas before the screen is measured', () => {
    expect(dsuGraphFrame([], 0, 0, padding)).toEqual({ x: 0, y: 0, width: 960, height: 620, unit: 1 });
    expect(dsuGraphFrame(ring, 0, 0, padding)).toMatchObject({ width: 960, height: 620, unit: 1 });
  });

  it('asks for enough screen to keep the closest nodes apart', () => {
    const row = [
      { x: 0, y: 0 },
      { x: 80, y: 0 },
      { x: 400, y: 100 },
    ];
    expect(dsuGraphMinScreen(row, padding, 40)).toEqual({ width: 300, height: 110 });
    expect(dsuGraphMinScreen([{ x: 3, y: 4 }], padding, 40)).toEqual({ width: 0, height: 0 });
    expect(dsuGraphMinScreen([], padding, 40)).toEqual({ width: 0, height: 0 });
  });

  it('sizes glyphs in screen pixels', () => {
    const glyphs = dsuGraphGlyphs(2);
    expect(glyphs.ring).toBe(28);
    expect(glyphs.edgeInset).toBe(32);
    expect(glyphs.valueY).toBe(-48);
    expect(glyphs.chipHeight).toBe(32);
  });

  it('trims segments by the inset and never past the midpoint', () => {
    expect(dsuTrimSegment({ x: 0, y: 0 }, { x: 100, y: 0 }, 10)).toEqual({ x1: 10, y1: 0, x2: 90, y2: 0 });
    expect(dsuTrimSegment({ x: 0, y: 0 }, { x: 10, y: 0 }, 20)).toEqual({ x1: 4.5, y1: 0, x2: 5.5, y2: 0 });
  });
});
