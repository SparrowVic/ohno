import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import { i18nText } from '../../../../core/i18n/translatable-text';
import {
  CallTreeLabTraceState,
  CallTreeNode,
  CallTreeNodePhase,
  CallTreeStat,
} from '../../models/call-tree-lab';
import { SortStep } from '../../models/sort-step';
import { MinimaxScenario } from '../../utils/call-tree-lab-scenarios/call-tree-lab-scenarios';
import { createCallTreeLabStep } from '../call-tree-lab-step';

const I18N = {
  modeLabel: t('features.algorithms.runtime.callTreeLab.minimax.modeLabel'),
  resultFormat: t('features.algorithms.runtime.callTreeLab.minimax.resultFormat'),
  phases: {
    setup: t('features.algorithms.runtime.callTreeLab.minimax.phases.setup'),
    descend: t('features.algorithms.runtime.callTreeLab.minimax.phases.descend'),
    evaluate: t('features.algorithms.runtime.callTreeLab.minimax.phases.evaluate'),
    update: t('features.algorithms.runtime.callTreeLab.minimax.phases.update'),
    prune: t('features.algorithms.runtime.callTreeLab.minimax.phases.prune'),
    settle: t('features.algorithms.runtime.callTreeLab.minimax.phases.settle'),
    complete: t('features.algorithms.runtime.callTreeLab.minimax.phases.complete'),
  },
  descriptions: {
    setup: t('features.algorithms.runtime.callTreeLab.minimax.descriptions.setup'),
    enter: t('features.algorithms.runtime.callTreeLab.minimax.descriptions.enter'),
    leaf: t('features.algorithms.runtime.callTreeLab.minimax.descriptions.leaf'),
    updateMax: t('features.algorithms.runtime.callTreeLab.minimax.descriptions.updateMax'),
    updateMin: t('features.algorithms.runtime.callTreeLab.minimax.descriptions.updateMin'),
    prune: t('features.algorithms.runtime.callTreeLab.minimax.descriptions.prune'),
    settle: t('features.algorithms.runtime.callTreeLab.minimax.descriptions.settle'),
    complete: t('features.algorithms.runtime.callTreeLab.minimax.descriptions.complete'),
  },
  decisions: {
    descend: t('features.algorithms.runtime.callTreeLab.minimax.decisions.descend'),
    leafReturn: t('features.algorithms.runtime.callTreeLab.minimax.decisions.leafReturn'),
    maxUp: t('features.algorithms.runtime.callTreeLab.minimax.decisions.maxUp'),
    minDown: t('features.algorithms.runtime.callTreeLab.minimax.decisions.minDown'),
    cutAlpha: t('features.algorithms.runtime.callTreeLab.minimax.decisions.cutAlpha'),
    cutBeta: t('features.algorithms.runtime.callTreeLab.minimax.decisions.cutBeta'),
    settle: t('features.algorithms.runtime.callTreeLab.minimax.decisions.settle'),
    done: t('features.algorithms.runtime.callTreeLab.minimax.decisions.done'),
  },
  stats: {
    player: t('features.algorithms.runtime.callTreeLab.minimax.stats.player'),
    alpha: t('features.algorithms.runtime.callTreeLab.minimax.stats.alpha'),
    beta: t('features.algorithms.runtime.callTreeLab.minimax.stats.beta'),
    value: t('features.algorithms.runtime.callTreeLab.minimax.stats.value'),
    leaf: t('features.algorithms.runtime.callTreeLab.minimax.stats.leaf'),
    best: t('features.algorithms.runtime.callTreeLab.minimax.stats.best'),
    evaluated: t('features.algorithms.runtime.callTreeLab.minimax.stats.evaluated'),
    pruned: t('features.algorithms.runtime.callTreeLab.minimax.stats.pruned'),
  },
} as const;

type NodeModel = {
  id: string;
  parentId: string | null;
  depth: number;
  isMax: boolean;
  leafValue: number | null;
  alpha: number;
  beta: number;
  value: number | null;
  phase: CallTreeNodePhase;
  badge: string | null;
  edgeLabel: string | null;
};

function fmtBound(v: number): string {
  if (v === Infinity) return '+∞';
  if (v === -Infinity) return '−∞';
  return String(v);
}

export function* minimaxAlphaBetaGenerator(scenario: MinimaxScenario): Generator<SortStep> {
  const { branching, leaves, presetLabel } = scenario;
  const depth = Math.ceil(Math.log(leaves.length) / Math.log(branching));
  const mode = I18N.modeLabel;

  const nodes: NodeModel[] = [];
  let idSeq = 0;
  let leafIndex = 0;
  let evaluated = 0;
  let pruned = 0;
  let iteration = 0;

  const makeState = (partial: {
    phaseLabel: CallTreeLabTraceState['phaseLabel'];
    decisionLabel: CallTreeLabTraceState['decisionLabel'];
    tone: CallTreeLabTraceState['tone'];
    activePath: readonly string[];
    resultLabel: CallTreeLabTraceState['resultLabel'];
  }): CallTreeLabTraceState => {
    const outNodes: CallTreeNode[] = nodes.map((m) => {
      const labelKey = m.isMax ? 'MAX' : 'MIN';
      const title = m.leafValue !== null
        ? `leaf=${m.leafValue}`
        : `${labelKey}(d=${depth - m.depth})`;
      return {
        id: m.id,
        parentId: m.parentId,
        title,
        subtitle: null,
        badge: m.badge,
        phase: m.phase,
        edgeLabel: m.edgeLabel,
        stats:
          m.leafValue !== null
            ? [
                {
                  label: I18N.stats.leaf,
                  value: String(m.leafValue),
                  tone: 'accent',
                },
              ]
            : [
                {
                  label: I18N.stats.alpha,
                  value: fmtBound(m.alpha),
                  tone: 'accent',
                },
                {
                  label: I18N.stats.beta,
                  value: fmtBound(m.beta),
                  tone: 'warning',
                },
                ...(m.value !== null
                  ? [
                      {
                        label: I18N.stats.value,
                        value: String(m.value),
                        tone: 'success' as const,
                      },
                    ]
                  : []),
              ],
      };
    });
    const root = nodes.length > 0 ? nodes[0] : null;
    // Keep the stat count stable across steps so the strip doesn't
    // reshape mid-run — best starts as "—" and fills in at the end.
    const stats: CallTreeStat[] = [
      { label: I18N.stats.evaluated, value: String(evaluated), tone: 'accent' },
      { label: I18N.stats.pruned, value: String(pruned), tone: 'danger' },
      {
        label: I18N.stats.best,
        value: root && root.value !== null ? String(root.value) : '—',
        tone: root && root.value !== null ? 'success' : 'info',
      },
    ];
    return {
      mode: 'minimax',
      modeLabel: mode,
      presetLabel,
      phaseLabel: partial.phaseLabel,
      decisionLabel: partial.decisionLabel,
      tone: partial.tone,
      nodes: outNodes,
      activePath: partial.activePath,
      rootId: root?.id ?? null,
      stats,
      sidecar: null,
      resultLabel: partial.resultLabel,
      iteration,
    };
  };

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

  function setPhase(id: string, phase: CallTreeNodePhase, badge?: string | null) {
    const m = nodes.find((n) => n.id === id);
    if (!m) return;
    m.phase = phase;
    if (badge !== undefined) m.badge = badge;
  }

  function setValue(id: string, value: number) {
    const m = nodes.find((n) => n.id === id);
    if (m) m.value = value;
  }

  function setAlphaBeta(id: string, alpha: number, beta: number) {
    const m = nodes.find((n) => n.id === id);
    if (m) {
      m.alpha = alpha;
      m.beta = beta;
    }
  }

  // ---------- Setup ----------
  const rootId = `root-${idSeq++}`;
  nodes.push({
    id: rootId,
    parentId: null,
    depth: 0,
    isMax: true,
    leafValue: null,
    alpha: -Infinity,
    beta: Infinity,
    value: null,
    phase: 'current',
    badge: null,
    edgeLabel: null,
  });
  iteration++;
  yield createCallTreeLabStep({
    activeCodeLine: 1,
    description: i18nText(I18N.descriptions.setup, { depth, branching }),
    state: makeState({
      phaseLabel: I18N.phases.setup,
      decisionLabel: I18N.decisions.descend,
      tone: 'idle',
      activePath: [rootId],
      resultLabel: null,
    }),
  });

  /** Recursive driver. */
  function* explore(
    parentNodeId: string,
    currentDepth: number,
    alpha: number,
    beta: number,
    isMax: boolean,
  ): Generator<SortStep, number> {
    setAlphaBeta(parentNodeId, alpha, beta);

    // Base case — leaf level.
    if (currentDepth === depth) {
      const lv = leaves[leafIndex % leaves.length];
      leafIndex++;
      evaluated++;
      const leafId = `leaf-${idSeq++}`;
      nodes.push({
        id: leafId,
        parentId: parentNodeId,
        depth: currentDepth,
        isMax: false,
        leafValue: lv,
        alpha: lv,
        beta: lv,
        value: lv,
        phase: 'explored',
        badge: null,
        edgeLabel: null,
      });
      iteration++;
      yield createCallTreeLabStep({
        activeCodeLine: 1,
        description: i18nText(I18N.descriptions.leaf, { value: lv }),
        state: makeState({
          phaseLabel: I18N.phases.evaluate,
          decisionLabel: I18N.decisions.leafReturn,
          tone: 'descend',
          activePath: [...ancestry(leafId)],
          resultLabel: null,
        }),
      });
      return lv;
    }

    // Internal node — iterate children.
    let best = isMax ? -Infinity : Infinity;
    for (let i = 0; i < branching; i++) {
      const childId = `n-${idSeq++}`;
      const childIsMax = !isMax;
      nodes.push({
        id: childId,
        parentId: parentNodeId,
        depth: currentDepth + 1,
        isMax: childIsMax,
        leafValue: null,
        alpha,
        beta,
        value: null,
        phase: 'current',
        badge: null,
        edgeLabel: `#${i + 1}`,
      });
      iteration++;
      yield createCallTreeLabStep({
        activeCodeLine: isMax ? 3 : 6,
        description: i18nText(I18N.descriptions.enter, {
          player: childIsMax ? 'MAX' : 'MIN',
          depth: depth - (currentDepth + 1),
          alpha: fmtBound(alpha),
          beta: fmtBound(beta),
        }),
        state: makeState({
          phaseLabel: I18N.phases.descend,
          decisionLabel: I18N.decisions.descend,
          tone: 'descend',
          activePath: [...ancestry(childId)],
          resultLabel: null,
        }),
      });

      const childValue = yield* explore(childId, currentDepth + 1, alpha, beta, childIsMax);

      if (isMax) {
        best = Math.max(best, childValue);
        alpha = Math.max(alpha, best);
        setValue(parentNodeId, best);
        setAlphaBeta(parentNodeId, alpha, beta);
        iteration++;
        yield createCallTreeLabStep({
          activeCodeLine: 4,
          description: i18nText(I18N.descriptions.updateMax, {
            value: childValue,
            best,
            alpha: fmtBound(alpha),
          }),
          state: makeState({
            phaseLabel: I18N.phases.update,
            decisionLabel: I18N.decisions.maxUp,
            tone: 'return',
            activePath: [...ancestry(parentNodeId)],
            resultLabel: null,
          }),
        });
      } else {
        best = Math.min(best, childValue);
        beta = Math.min(beta, best);
        setValue(parentNodeId, best);
        setAlphaBeta(parentNodeId, alpha, beta);
        iteration++;
        yield createCallTreeLabStep({
          activeCodeLine: 7,
          description: i18nText(I18N.descriptions.updateMin, {
            value: childValue,
            best,
            beta: fmtBound(beta),
          }),
          state: makeState({
            phaseLabel: I18N.phases.update,
            decisionLabel: I18N.decisions.minDown,
            tone: 'return',
            activePath: [...ancestry(parentNodeId)],
            resultLabel: null,
          }),
        });
      }

      if (alpha >= beta) {
        // Prune remaining siblings + skip leaves they'd consume.
        const remaining = branching - i - 1;
        const subtreeLeaves = Math.pow(branching, depth - currentDepth - 1);
        const toSkip = remaining * subtreeLeaves;
        pruned += toSkip;
        // Advance leaf index so subsequent evaluations line up.
        leafIndex += toSkip;
        // Create placeholder pruned nodes for visual clarity.
        for (let j = i + 1; j < branching; j++) {
          const prunedId = `p-${idSeq++}`;
          nodes.push({
            id: prunedId,
            parentId: parentNodeId,
            depth: currentDepth + 1,
            isMax: !isMax,
            leafValue: null,
            alpha,
            beta,
            value: null,
            phase: 'pruned',
            badge: 'cut',
            edgeLabel: `#${j + 1}`,
          });
        }
        iteration++;
        yield createCallTreeLabStep({
          activeCodeLine: isMax ? 5 : 8,
          description: i18nText(I18N.descriptions.prune, {
            alpha: fmtBound(alpha),
            beta: fmtBound(beta),
            skipped: toSkip,
          }),
          state: makeState({
            phaseLabel: I18N.phases.prune,
            decisionLabel: isMax ? I18N.decisions.cutBeta : I18N.decisions.cutAlpha,
            tone: 'prune',
            activePath: [...ancestry(parentNodeId)],
            resultLabel: null,
          }),
        });
        break;
      }
    }

    setPhase(parentNodeId, 'explored');
    setValue(parentNodeId, best);
    iteration++;
    yield createCallTreeLabStep({
      activeCodeLine: isMax ? 4 : 7,
      description: i18nText(I18N.descriptions.settle, {
        player: isMax ? 'MAX' : 'MIN',
        value: best,
      }),
      state: makeState({
        phaseLabel: I18N.phases.settle,
        decisionLabel: I18N.decisions.settle,
        tone: 'return',
        activePath: [...ancestry(parentNodeId)],
        resultLabel: null,
      }),
    });
    return best;
  }

  const result = yield* explore(rootId, 0, -Infinity, Infinity, true);
  setValue(rootId, result);
  setPhase(rootId, 'solution', String(result));
  iteration++;
  yield createCallTreeLabStep({
    activeCodeLine: 1,
    description: i18nText(I18N.descriptions.complete, { value: result, evaluated, pruned }),
    state: makeState({
      phaseLabel: I18N.phases.complete,
      decisionLabel: I18N.decisions.done,
      tone: 'complete',
      activePath: [rootId],
      resultLabel: i18nText(I18N.resultFormat, { value: result }),
    }),
  });
}
