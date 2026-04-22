import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import { i18nText } from '../../../../core/i18n/translatable-text';
import {
  BoardCell,
  BoardCellState,
  CallTreeLabTraceState,
  CallTreeNode,
  CallTreeNodePhase,
  CallTreeNodeStat,
  CallTreeSidecarBoard,
  CallTreeStat,
} from '../../models/call-tree-lab';
import { SortStep } from '../../models/sort-step';
import { NQueensScenario } from '../../utils/call-tree-lab-scenarios/call-tree-lab-scenarios';
import { createCallTreeLabStep } from '../call-tree-lab-step';

const I18N = {
  modeLabel: t('features.algorithms.runtime.callTreeLab.backtracking.modeLabel'),
  resultSuccess: t('features.algorithms.runtime.callTreeLab.backtracking.resultSuccess'),
  resultFailure: t('features.algorithms.runtime.callTreeLab.backtracking.resultFailure'),
  boardTitle: t('features.algorithms.runtime.callTreeLab.backtracking.boardTitle'),
  boardFooter: t('features.algorithms.runtime.callTreeLab.backtracking.boardFooter'),
  phases: {
    setup: t('features.algorithms.runtime.callTreeLab.backtracking.phases.setup'),
    probe: t('features.algorithms.runtime.callTreeLab.backtracking.phases.probe'),
    place: t('features.algorithms.runtime.callTreeLab.backtracking.phases.place'),
    conflict: t('features.algorithms.runtime.callTreeLab.backtracking.phases.conflict'),
    backtrack: t('features.algorithms.runtime.callTreeLab.backtracking.phases.backtrack'),
    solution: t('features.algorithms.runtime.callTreeLab.backtracking.phases.solution'),
    complete: t('features.algorithms.runtime.callTreeLab.backtracking.phases.complete'),
  },
  descriptions: {
    setup: t('features.algorithms.runtime.callTreeLab.backtracking.descriptions.setup'),
    probe: t('features.algorithms.runtime.callTreeLab.backtracking.descriptions.probe'),
    conflict: t('features.algorithms.runtime.callTreeLab.backtracking.descriptions.conflict'),
    place: t('features.algorithms.runtime.callTreeLab.backtracking.descriptions.place'),
    backtrack: t('features.algorithms.runtime.callTreeLab.backtracking.descriptions.backtrack'),
    solution: t('features.algorithms.runtime.callTreeLab.backtracking.descriptions.solution'),
    complete: t('features.algorithms.runtime.callTreeLab.backtracking.descriptions.complete'),
    noSolution: t('features.algorithms.runtime.callTreeLab.backtracking.descriptions.noSolution'),
  },
  decisions: {
    tryCol: t('features.algorithms.runtime.callTreeLab.backtracking.decisions.tryCol'),
    cellSafe: t('features.algorithms.runtime.callTreeLab.backtracking.decisions.cellSafe'),
    cellAttacked: t(
      'features.algorithms.runtime.callTreeLab.backtracking.decisions.cellAttacked',
    ),
    placed: t('features.algorithms.runtime.callTreeLab.backtracking.decisions.placed'),
    descend: t('features.algorithms.runtime.callTreeLab.backtracking.decisions.descend'),
    unwind: t('features.algorithms.runtime.callTreeLab.backtracking.decisions.unwind'),
    solved: t('features.algorithms.runtime.callTreeLab.backtracking.decisions.solved'),
    exhausted: t('features.algorithms.runtime.callTreeLab.backtracking.decisions.exhausted'),
  },
  stats: {
    row: t('features.algorithms.runtime.callTreeLab.backtracking.stats.row'),
    col: t('features.algorithms.runtime.callTreeLab.backtracking.stats.col'),
    placedCount: t('features.algorithms.runtime.callTreeLab.backtracking.stats.placedCount'),
    attempts: t('features.algorithms.runtime.callTreeLab.backtracking.stats.attempts'),
    backtracks: t('features.algorithms.runtime.callTreeLab.backtracking.stats.backtracks'),
  },
} as const;

type NodeModel = {
  id: string;
  parentId: string | null;
  row: number;
  col: number | null;
  phase: CallTreeNodePhase;
  badge: string | null;
  edgeLabel: string | null;
};

function isSafe(cols: readonly number[], row: number, col: number): boolean {
  for (let r = 0; r < cols.length; r++) {
    const c = cols[r];
    if (c === col) return false;
    if (Math.abs(c - col) === Math.abs(r - row)) return false;
  }
  return true;
}

function attackedCells(
  n: number,
  cols: readonly number[],
  excludingRow: number,
): Set<string> {
  const out = new Set<string>();
  for (let r = 0; r < cols.length; r++) {
    if (r === excludingRow) continue;
    const c = cols[r];
    for (let j = 0; j < n; j++) {
      out.add(`${r}:${j}`); // same row
      out.add(`${j}:${c}`); // same column
    }
    for (let j = 1; j < n; j++) {
      [
        [r + j, c + j],
        [r + j, c - j],
        [r - j, c + j],
        [r - j, c - j],
      ].forEach(([rr, cc]) => {
        if (rr >= 0 && rr < n && cc >= 0 && cc < n) out.add(`${rr}:${cc}`);
      });
    }
  }
  return out;
}

function buildBoard(
  n: number,
  cols: readonly number[],
  activeRow: number | null,
  activeCol: number | null,
  conflictCell: [number, number] | null,
  solved: boolean,
): CallTreeSidecarBoard {
  const attacks = attackedCells(n, cols, -1);
  const cells: BoardCell[] = [];
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      const placed = r < cols.length && cols[r] === c;
      let state: BoardCellState = 'idle';
      let value = '';
      if (placed) {
        state = solved ? 'solution' : 'placed';
        value = '♛';
      } else if (conflictCell && conflictCell[0] === r && conflictCell[1] === c) {
        state = 'conflict';
        value = '✗';
      } else if (activeRow === r && activeCol === c) {
        state = 'current';
        value = '·';
      } else if (attacks.has(`${r}:${c}`)) {
        state = 'attacked';
      }
      cells.push({ row: r, col: c, value, state });
    }
  }
  return {
    title: I18N.boardTitle,
    rows: n,
    cols: n,
    cells,
    footer: i18nText(I18N.boardFooter, { placed: cols.length, n }),
  };
}

function nodeStats(row: number, col: number | null): readonly CallTreeNodeStat[] {
  const stats: CallTreeNodeStat[] = [
    { label: I18N.stats.row, value: String(row), tone: 'default' },
  ];
  if (col !== null) {
    stats.push({ label: I18N.stats.col, value: String(col), tone: 'accent' });
  }
  return stats;
}

export function* backtrackingGenerator(scenario: NQueensScenario): Generator<SortStep> {
  const n = scenario.n;
  const mode = I18N.modeLabel;
  const presetLabel = scenario.presetLabel;

  const nodes: NodeModel[] = [];
  let idSeq = 0;
  let attempts = 0;
  let backtracks = 0;
  let iteration = 0;

  const cols: number[] = [];

  const makeState = (partial: {
    phaseLabel: CallTreeLabTraceState['phaseLabel'];
    decisionLabel: CallTreeLabTraceState['decisionLabel'];
    tone: CallTreeLabTraceState['tone'];
    activePath: readonly string[];
    boardActive: { row: number; col: number } | null;
    boardConflict: [number, number] | null;
    solved: boolean;
    resultLabel: CallTreeLabTraceState['resultLabel'];
  }): CallTreeLabTraceState => {
    const outNodes: CallTreeNode[] = nodes.map((m) => ({
      id: m.id,
      parentId: m.parentId,
      title:
        m.col === null ? `row ${m.row}` : `r${m.row}, c${m.col}`,
      subtitle: null,
      badge: m.badge,
      phase: m.phase,
      stats: nodeStats(m.row, m.col),
      edgeLabel: m.edgeLabel,
    }));

    const stats: CallTreeStat[] = [
      { label: I18N.stats.placedCount, value: `${cols.length} / ${n}`, tone: 'accent' },
      { label: I18N.stats.attempts, value: String(attempts), tone: 'info' },
      { label: I18N.stats.backtracks, value: String(backtracks), tone: 'warning' },
    ];

    return {
      mode: 'backtracking',
      modeLabel: mode,
      presetLabel,
      phaseLabel: partial.phaseLabel,
      decisionLabel: partial.decisionLabel,
      tone: partial.tone,
      nodes: outNodes,
      activePath: partial.activePath,
      rootId: nodes.length > 0 ? nodes[0].id : null,
      stats,
      sidecar: buildBoard(
        n,
        cols,
        partial.boardActive?.row ?? null,
        partial.boardActive?.col ?? null,
        partial.boardConflict,
        partial.solved,
      ),
      resultLabel: partial.resultLabel,
      iteration,
    };
  };

  // ---------- Setup ----------
  const rootId = `row-0-root`;
  nodes.push({
    id: rootId,
    parentId: null,
    row: -1,
    col: null,
    phase: 'current',
    badge: null,
    edgeLabel: null,
  });
  iteration++;
  yield createCallTreeLabStep({
    activeCodeLine: 1,
    description: i18nText(I18N.descriptions.setup, { n }),
    state: makeState({
      phaseLabel: I18N.phases.setup,
      decisionLabel: I18N.decisions.tryCol,
      tone: 'idle',
      activePath: [rootId],
      boardActive: null,
      boardConflict: null,
      solved: false,
      resultLabel: null,
    }),
  });

  function setNodePhase(id: string, phase: CallTreeNodePhase, badge?: string | null) {
    const m = nodes.find((n) => n.id === id);
    if (!m) return;
    m.phase = phase;
    if (badge !== undefined) m.badge = badge;
  }

  /** Recursive driver — yields SortSteps for each transition. Returns
   *  true if a complete placement is found below this row. */
  function* place(row: number, parentNodeId: string): Generator<SortStep, boolean> {
    if (row === n) {
      // Solution — mark the latest placed node's phase to 'solution'.
      setNodePhase(parentNodeId, 'solution', '✓');
      iteration++;
      yield createCallTreeLabStep({
        activeCodeLine: 1,
        description: i18nText(I18N.descriptions.solution, { n }),
        state: makeState({
          phaseLabel: I18N.phases.solution,
          decisionLabel: I18N.decisions.solved,
          tone: 'solve',
          activePath: [...ancestry(parentNodeId)],
          boardActive: null,
          boardConflict: null,
          solved: true,
          resultLabel: i18nText(I18N.resultSuccess, { cols: cols.join(', ') }),
        }),
      });
      return true;
    }

    for (let col = 0; col < n; col++) {
      attempts++;
      const childId = `r${row}c${col}-${idSeq++}`;
      nodes.push({
        id: childId,
        parentId: parentNodeId,
        row,
        col,
        phase: 'exploring',
        badge: null,
        edgeLabel: `c${col}`,
      });

      // Probe the cell.
      iteration++;
      yield createCallTreeLabStep({
        activeCodeLine: 2,
        description: i18nText(I18N.descriptions.probe, { row, col }),
        state: makeState({
          phaseLabel: I18N.phases.probe,
          decisionLabel: I18N.decisions.tryCol,
          tone: 'descend',
          activePath: [...ancestry(childId)],
          boardActive: { row, col },
          boardConflict: null,
          solved: false,
          resultLabel: null,
        }),
      });

      const safe = isSafe(cols, row, col);
      if (!safe) {
        setNodePhase(childId, 'conflict', '✗');
        iteration++;
        yield createCallTreeLabStep({
          activeCodeLine: 3,
          description: i18nText(I18N.descriptions.conflict, { row, col }),
          state: makeState({
            phaseLabel: I18N.phases.conflict,
            decisionLabel: I18N.decisions.cellAttacked,
            tone: 'prune',
            activePath: [...ancestry(childId)],
            boardActive: { row, col },
            boardConflict: [row, col],
            solved: false,
            resultLabel: null,
          }),
        });
        continue;
      }

      // Place the queen.
      cols.push(col);
      setNodePhase(childId, 'current');
      iteration++;
      yield createCallTreeLabStep({
        activeCodeLine: 4,
        description: i18nText(I18N.descriptions.place, { row, col }),
        state: makeState({
          phaseLabel: I18N.phases.place,
          decisionLabel: I18N.decisions.placed,
          tone: 'descend',
          activePath: [...ancestry(childId)],
          boardActive: { row, col },
          boardConflict: null,
          solved: false,
          resultLabel: null,
        }),
      });

      const solved = yield* place(row + 1, childId);
      if (solved) return true;

      // Backtrack — pop this queen, mark node as backtracked.
      cols.pop();
      setNodePhase(childId, 'backtracked', '↶');
      backtracks++;
      iteration++;
      yield createCallTreeLabStep({
        activeCodeLine: 6,
        description: i18nText(I18N.descriptions.backtrack, { row, col }),
        state: makeState({
          phaseLabel: I18N.phases.backtrack,
          decisionLabel: I18N.decisions.unwind,
          tone: 'return',
          activePath: [...ancestry(parentNodeId)],
          boardActive: null,
          boardConflict: null,
          solved: false,
          resultLabel: null,
        }),
      });
    }

    // No column worked at this row.
    return false;
  }

  /** Walk up the parent chain to produce an active-path list
   *  (root-first). */
  function ancestry(leafId: string): readonly string[] {
    const out: string[] = [];
    let current: string | null = leafId;
    const byId = new Map(nodes.map((n) => [n.id, n] as const));
    while (current !== null) {
      out.unshift(current);
      current = byId.get(current)?.parentId ?? null;
    }
    return out;
  }

  // Bootstrap — root is row -1; children represent "row 0 decisions".
  const solved = yield* place(0, rootId);
  if (!solved) {
    iteration++;
    yield createCallTreeLabStep({
      activeCodeLine: 7,
      description: I18N.descriptions.noSolution,
      state: makeState({
        phaseLabel: I18N.phases.complete,
        decisionLabel: I18N.decisions.exhausted,
        tone: 'complete',
        activePath: [rootId],
        boardActive: null,
        boardConflict: null,
        solved: false,
        resultLabel: I18N.resultFailure,
      }),
    });
  }
}
