import { describe, expect, it } from 'vitest';

import { buildBars, buildBuckets, buildGraph, buildMatrix, buildNotebook, buildStack, buildTape, buildXy, hashSeed } from './module-preview.utils';

describe('module preview data', () => {
  it('derives a stable seed from an id', () => {
    expect(hashSeed('bubble-sort')).toBe(hashSeed('bubble-sort'));
    expect(hashSeed('bubble-sort')).not.toBe(hashSeed('quick-sort'));
  });

  it('builds thirteen bars in range with a sorted lime tail and one cyan pair', () => {
    const bars = buildBars(hashSeed('bubble-sort'));
    expect(bars).toHaveLength(13);
    expect(bars.every((bar) => bar.height >= 1 && bar.height <= 14)).toBe(true);
    const tail = bars.filter((bar) => bar.tone === 'lime').map((bar) => bar.height);
    expect(tail.length).toBeGreaterThanOrEqual(2);
    expect([...tail].sort((a, b) => a - b)).toEqual(tail);
    expect(bars.filter((bar) => bar.tone === 'cyan')).toHaveLength(2);
    expect(buildBars(7)).toEqual(buildBars(7));
  });

  it('builds eight buckets with one cyan column', () => {
    const buckets = buildBuckets(hashSeed('counting-sort'));
    expect(buckets).toHaveLength(8);
    expect(buckets.every((bucket) => bucket.count >= 1 && bucket.count <= 5)).toBe(true);
    expect(buckets.filter((bucket) => bucket.tone === 'cyan')).toHaveLength(1);
  });

  it('picks a current and a frontier node that differ', () => {
    const graph = buildGraph(hashSeed('bfs'));
    expect(graph.current).not.toBe(graph.frontier);
    expect(graph.current).toBeGreaterThan(0);
  });

  it('fills the matrix in reading order up to the current cell', () => {
    const matrix = buildMatrix(hashSeed('knapsack-01'));
    expect(matrix.columns).toBe(8);
    expect(matrix.rows).toBe(4);
    expect(matrix.filled).toBeGreaterThan(0);
    expect(matrix.filled).toBeLessThan(32);
    expect(matrix.current).toBe(matrix.filled);
  });

  it('puts the tape head right after the matched prefix', () => {
    const tape = buildTape(hashSeed('kmp-pattern-matching'));
    expect(tape.cells).toHaveLength(12);
    expect(tape.cells.slice(0, tape.head).every((cell) => cell === 'lime')).toBe(true);
    expect(tape.cells[tape.head]).toBe('cyan');
  });

  it('draws notebook lines, points with a hull, and stack frames', () => {
    expect(buildNotebook(1)).toHaveLength(5);
    const xy = buildXy(hashSeed('convex-hull'));
    expect(xy.points).toHaveLength(9);
    expect(xy.hull.length).toBeGreaterThanOrEqual(3);
    expect(xy.points.every(([x, y]) => x >= 20 && x <= 225 && y >= 12 && y <= 80)).toBe(true);
    const stack = buildStack(hashSeed('recursion-call-stack'));
    expect(stack.length).toBeGreaterThanOrEqual(3);
    expect(stack[stack.length - 1].tone).toBe('cyan');
  });
});
