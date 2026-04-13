import { SearchRowStatus, SearchTraceRow, SearchTraceState, SearchTraceTag } from '../models/search';
import { SortPhase, SortStep } from '../models/sort-step';

export interface SearchStepArgs {
  readonly array: readonly number[];
  readonly target: number;
  readonly activeCodeLine: number;
  readonly description: string;
  readonly phase?: SortPhase;
  readonly modeLabel: string;
  readonly statusLabel: string;
  readonly decision?: string | null;
  readonly probeIndex?: number | null;
  readonly low?: number | null;
  readonly high?: number | null;
  readonly leftBound?: number | null;
  readonly rightBound?: number | null;
  readonly resultIndices?: readonly number[];
  readonly eliminated?: readonly number[];
  readonly visitedOrder?: readonly number[];
}

export function createSearchStep(args: SearchStepArgs): SortStep {
  const trace = createSearchTraceState(args);
  const probeIndex = args.probeIndex ?? null;

  return {
    array: [...args.array],
    comparing: probeIndex === null ? null : [probeIndex, probeIndex],
    swapping: null,
    sorted: [...trace.resultIndices],
    boundary: trace.high === null ? args.array.length : trace.high + 1,
    activeCodeLine: args.activeCodeLine,
    description: args.description,
    phase: args.phase,
    search: trace,
  };
}

function createSearchTraceState(args: SearchStepArgs): SearchTraceState {
  const resultIndices = [...(args.resultIndices ?? [])];
  const eliminated = [...(args.eliminated ?? [])];
  const visitedOrder = [...(args.visitedOrder ?? [])];
  const probeIndex = args.probeIndex ?? null;
  const low = args.low ?? null;
  const high = args.high ?? null;
  const leftBound = args.leftBound ?? null;
  const rightBound = args.rightBound ?? null;

  return {
    target: args.target,
    modeLabel: args.modeLabel,
    statusLabel: args.statusLabel,
    decision: args.decision ?? null,
    low,
    high,
    probeIndex,
    probeValue: probeIndex === null ? null : args.array[probeIndex] ?? null,
    leftBound,
    rightBound,
    resultIndices,
    eliminated,
    visitedOrder,
    rows: args.array.map((value, index) =>
      createSearchTraceRow({
        arrayLength: args.array.length,
        value,
        index,
        target: args.target,
        probeIndex,
        low,
        high,
        leftBound,
        rightBound,
        resultIndices,
        eliminated,
        visitedOrder,
      }),
    ),
  };
}

function createSearchTraceRow(args: {
  readonly arrayLength: number;
  readonly value: number;
  readonly index: number;
  readonly target: number;
  readonly probeIndex: number | null;
  readonly low: number | null;
  readonly high: number | null;
  readonly leftBound: number | null;
  readonly rightBound: number | null;
  readonly resultIndices: readonly number[];
  readonly eliminated: readonly number[];
  readonly visitedOrder: readonly number[];
}): SearchTraceRow {
  const status = resolveRowStatus(args);
  return {
    index: args.index,
    value: args.value,
    status,
    tags: tagsForStatus(status),
  };
}

function resolveRowStatus(args: {
  readonly index: number;
  readonly probeIndex: number | null;
  readonly low: number | null;
  readonly high: number | null;
  readonly leftBound: number | null;
  readonly rightBound: number | null;
  readonly resultIndices: readonly number[];
  readonly eliminated: readonly number[];
  readonly visitedOrder: readonly number[];
}): SearchRowStatus {
  if (args.resultIndices.includes(args.index)) return 'found';
  if (args.probeIndex === args.index) return 'probe';
  if (args.leftBound === args.index || args.rightBound === args.index) return 'bound';
  if (args.eliminated.includes(args.index)) return 'eliminated';
  if (args.visitedOrder.includes(args.index)) return 'visited';
  if (args.low !== null && args.high !== null && args.index >= args.low && args.index <= args.high) {
    return 'window';
  }
  return 'idle';
}

function tagsForStatus(status: SearchRowStatus): readonly SearchTraceTag[] {
  switch (status) {
    case 'found':
      return ['match'];
    case 'probe':
      return ['compare'];
    case 'bound':
      return ['bound'];
    case 'eliminated':
      return ['pruned'];
    case 'visited':
      return ['checked'];
    case 'window':
      return ['candidate'];
    default:
      return ['pending'];
  }
}
