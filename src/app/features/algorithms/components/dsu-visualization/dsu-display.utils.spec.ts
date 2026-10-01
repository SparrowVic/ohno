import { describe, expect, it } from 'vitest';

import { kruskalsMstGenerator } from '../../algorithms/kruskals-mst';
import { unionFindGenerator } from '../../algorithms/union-find';
import { DsuEdgeTrace, DsuNodeStatus, DsuNodeTrace, DsuTraceState } from '../../models/dsu';
import { createKruskalScenario, createUnionFindScenario } from '../../utils/scenarios/dsu/dsu-scenarios';
import {
  dsuActivePairChanged,
  dsuChip,
  dsuComplete,
  dsuDecidedCount,
  dsuFocusOperationId,
  dsuGroupRows,
  dsuMovedNodeIds,
  dsuNodeTone,
  dsuNoteTone,
  dsuOperationKind,
  dsuOperationRows,
} from './dsu-display.utils';

function node(id: string, parentId: string, rootId: string, status: DsuNodeStatus = 'idle', rank = 0): DsuNodeTrace {
  return {
    id,
    label: id.toUpperCase(),
    parentId,
    parentLabel: parentId.toUpperCase(),
    rootId,
    rootLabel: rootId.toUpperCase(),
    rank,
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

function state(nodes: DsuNodeTrace[], edges: DsuEdgeTrace[] = []): DsuTraceState {
  const roots = [...new Set(nodes.map((item) => item.rootId))];
  return {
    mode: 'union-find',
    modeLabel: 'Union-Find',
    statusLabel: '',
    decision: null,
    activePairLabel: null,
    componentCount: roots.length,
    resultLabel: '',
    operationsLabel: '',
    nodes,
    groups: roots.map((rootId) => {
      const members = nodes.filter((item) => item.rootId === rootId);
      return {
        rootId,
        rootLabel: rootId.toUpperCase(),
        size: members.length,
        members: members.map((item) => item.label),
        active: members.some((item) => item.status !== 'idle' && item.status !== 'root'),
      };
    }),
    edges,
  };
}

function collect(generator: Generator<{ dsu?: DsuTraceState }>): DsuTraceState[] {
  return [...generator].map((step) => step.dsu!).filter(Boolean);
}

describe('dsu display utils', () => {
  it('maps every node status onto a display tone', () => {
    expect(dsuNodeTone('active')).toBe('cyan');
    expect(dsuNodeTone('query')).toBe('cyan');
    expect(dsuNodeTone('merged')).toBe('pink');
    expect(dsuNodeTone('compressed')).toBe('amber');
    expect(dsuNodeTone('root')).toBe('violet');
    expect(dsuNodeTone('idle')).toBe('slate');
  });

  it('marks query chips and shows the parent only for nested members', () => {
    expect(dsuChip(node('b', 'a', 'a', 'query'))).toEqual({
      id: 'b',
      label: 'B',
      tone: 'cyan',
      query: true,
      parentHint: null,
    });
    expect(dsuChip(node('c', 'b', 'a')).parentHint).toBe('B');
    expect(dsuChip(node('a', 'a', 'a', 'root')).parentHint).toBeNull();
  });

  it('builds one row per group in node order with the root split from its members', () => {
    const rows = dsuGroupRows(
      state([node('a', 'c', 'c'), node('b', 'b', 'b', 'root'), node('c', 'c', 'c', 'root', 1), node('d', 'a', 'c')]),
    );
    expect(rows.map((row) => row.rootId)).toEqual(['c', 'b']);
    expect(rows[0]!.root.label).toBe('C');
    expect(rows[0]!.rank).toBe(1);
    expect(rows[0]!.size).toBe(3);
    expect(rows[0]!.members.map((chip) => chip.label)).toEqual(['A', 'D']);
    expect(rows[0]!.members[1]!.parentHint).toBe('A');
    expect(rows[1]!.members).toEqual([]);
  });

  it('classifies operations and maps edge status onto rack tones', () => {
    const current = state(
      [node('a', 'a', 'a', 'root'), node('b', 'b', 'b', 'root')],
      [edge('op-0', 'a', 'b', 'accepted'), edge('op-1', 'b', 'b', 'active'), edge('op-2', 'a', 'b', 'rejected'), edge('e', 'a', 'b', 'pending', 4)],
    );
    expect(current.edges.map(dsuOperationKind)).toEqual(['union', 'find', 'union', 'edge']);
    const rows = dsuOperationRows(current);
    expect(rows.map((row) => row.tone)).toEqual(['done', 'head', 'dim', 'default']);
    expect(rows.map((row) => row.verdict)).toEqual(['accepted', null, 'rejected', null]);
    expect(rows[3]!.weight).toBe(4);
    expect(rows.map((row) => row.order)).toEqual(['01', '02', '03', '04']);
    expect(dsuDecidedCount(current)).toBe(2);
    expect(dsuFocusOperationId(current)).toBe('op-1');
  });

  it('focuses the latest decided operation when nothing is active', () => {
    const current = state([node('a', 'a', 'a', 'root')], [edge('x', 'a', 'a', 'accepted'), edge('y', 'a', 'a', 'rejected'), edge('z', 'a', 'a', 'pending')]);
    expect(dsuFocusOperationId(current)).toBe('y');
    expect(dsuFocusOperationId(state([node('a', 'a', 'a', 'root')]))).toBeNull();
  });

  it('picks the note tone from what the step is doing', () => {
    expect(dsuNoteTone(state([node('a', 'a', 'a', 'active'), node('b', 'a', 'a', 'merged')]))).toBe('pink');
    expect(dsuNoteTone(state([node('a', 'a', 'a', 'active'), node('b', 'a', 'a', 'compressed')]))).toBe('amber');
    expect(dsuNoteTone(state([node('a', 'a', 'a', 'root')], [edge('x', 'a', 'a', 'active')]))).toBe('cyan');
    expect(dsuNoteTone(state([node('a', 'a', 'a', 'active')], [edge('x', 'a', 'a', 'rejected'), edge('y', 'a', 'a', 'pending')]))).toBe('red');
    expect(dsuNoteTone(state([node('a', 'a', 'a', 'root')], [edge('x', 'a', 'a', 'accepted')]))).toBe('lime');
    expect(dsuNoteTone(state([node('a', 'a', 'a', 'root')], [edge('x', 'a', 'a', 'pending')]))).toBe('violet');
  });

  it('marks the run complete once every operation is decided and nothing is live', () => {
    expect(dsuComplete(state([node('a', 'a', 'a', 'root')], [edge('x', 'a', 'a', 'accepted'), edge('y', 'a', 'a', 'rejected')]))).toBe(true);
    expect(dsuComplete(state([node('a', 'a', 'a', 'active')], [edge('x', 'a', 'a', 'accepted')]))).toBe(false);
    expect(dsuComplete(state([node('a', 'a', 'a', 'root')], [edge('x', 'a', 'a', 'pending')]))).toBe(false);
    expect(dsuComplete(state([node('a', 'a', 'a', 'root')]))).toBe(false);
  });

  it('reports the nodes whose representative changed between steps', () => {
    const before = state([node('a', 'a', 'a', 'root'), node('b', 'b', 'b', 'root'), node('c', 'b', 'b')]);
    const after = state([node('a', 'a', 'a', 'root'), node('b', 'a', 'a', 'merged'), node('c', 'b', 'a')]);
    expect(dsuMovedNodeIds(null, after)).toEqual([]);
    expect(dsuMovedNodeIds(before, after)).toEqual(['b', 'c']);
    expect(dsuMovedNodeIds(after, after)).toEqual([]);
  });

  it('detects a new active pair only when the label changes', () => {
    const base = state([node('a', 'a', 'a', 'root')]);
    const paired = { ...base, activePairLabel: 'A ↔ B' };
    expect(dsuActivePairChanged(null, base)).toBe(false);
    expect(dsuActivePairChanged(base, paired)).toBe(true);
    expect(dsuActivePairChanged(paired, paired)).toBe(false);
  });

  it('keeps every union-find node in exactly one row across the whole run', () => {
    const states = collect(unionFindGenerator(createUnionFindScenario(8)));
    expect(states.length).toBeGreaterThan(10);
    for (const current of states) {
      const rows = dsuGroupRows(current);
      const ids = rows.flatMap((row) => [row.root.id, ...row.members.map((chip) => chip.id)]);
      expect(new Set(ids).size).toBe(current.nodes.length);
      expect(rows.reduce((total, row) => total + row.size, 0)).toBe(current.nodes.length);
    }
    const last = states[states.length - 1]!;
    expect(dsuOperationRows(last).some((row) => row.kind === 'find')).toBe(true);
    expect(dsuOperationRows(last).every((row) => row.verdict !== null)).toBe(true);
  });

  it('moves chips between rows when kruskal accepts an edge', () => {
    const states = collect(kruskalsMstGenerator(createKruskalScenario(8)));
    const moves = states.slice(1).map((current, index) => dsuMovedNodeIds(states[index]!, current));
    expect(moves.some((ids) => ids.length > 0)).toBe(true);
    expect(dsuOperationRows(states[0]!).every((row) => row.kind === 'edge')).toBe(true);
  });
});
