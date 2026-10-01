import { describe, expect, it } from 'vitest';

import { MatrixGridTraceState } from '../../models/matrix-grid';
import { NumberLabTraceState } from '../../models/number-lab';
import { ScratchpadLabTraceState } from '../../models/scratchpad-lab';
import { EMPTY_TRACES, WorkbenchTraces } from '../models/workbench-traces';
import { pickTracePanel } from './trace-host.utils';

const scratchpadLab = { mode: 'euclidean-gcd', lines: [], margins: [] } as unknown as ScratchpadLabTraceState;
const numberLab = { registers: [], history: [] } as unknown as NumberLabTraceState;
const matrixGrid = { mode: 'gaussian-elimination', cells: [] } as unknown as MatrixGridTraceState;

function traces(partial: Partial<WorkbenchTraces>): WorkbenchTraces {
  return { ...EMPTY_TRACES, ...partial };
}

describe('pickTracePanel', () => {
  it('lets the chalkboard win while a chalkboard view is active', () => {
    expect(pickTracePanel(traces({ scratchpadLab, numberLab }), 'scratchpad-lab')).toBe('scratchpadLab');
  });

  it('lets the number lab win while its view is active', () => {
    expect(pickTracePanel(traces({ scratchpadLab, numberLab }), 'number-lab')).toBe('numberLab');
  });

  it('gives the matrix grid its own panel while its view is active', () => {
    expect(pickTracePanel(traces({ scratchpadLab, matrixGrid }), 'matrix-grid')).toBe('matrixGrid');
    expect(pickTracePanel(traces({ scratchpadLab, matrixGrid }), 'scratchpad-lab')).toBe('scratchpadLab');
  });

  it('falls back to the number lab and then the search panel', () => {
    expect(pickTracePanel(traces({ numberLab }), 'scratchpad-lab')).toBe('numberLab');
    expect(pickTracePanel(traces({}), 'bar')).toBe('search');
  });

  it('keeps the slot order for the other families', () => {
    expect(pickTracePanel(traces({ sort: {} as WorkbenchTraces['sort'], dp: {} as WorkbenchTraces['dp'] }), 'dp')).toBe('dp');
  });
});
