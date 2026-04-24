import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import { i18nText } from '../../../../core/i18n/translatable-text';
import {
  CallTreeLabTraceState,
  CallTreeNode,
  CallTreeNodePhase,
  CallTreeNodeStat,
  CallTreeStat,
} from '../../models/call-tree-lab';
import { SortStep } from '../../models/sort-step';
import { McTsScenario } from '../../utils/scenarios/call-tree-lab/call-tree-lab-scenarios';
import { createCallTreeLabStep } from '../call-tree-lab-step';

const I18N = {
  modeLabel: t('features.algorithms.runtime.callTreeLab.mcts.modeLabel'),
  resultFormat: t('features.algorithms.runtime.callTreeLab.mcts.resultFormat'),
  phases: {
    setup: t('features.algorithms.runtime.callTreeLab.mcts.phases.setup'),
    select: t('features.algorithms.runtime.callTreeLab.mcts.phases.select'),
    expand: t('features.algorithms.runtime.callTreeLab.mcts.phases.expand'),
    simulate: t('features.algorithms.runtime.callTreeLab.mcts.phases.simulate'),
    backprop: t('features.algorithms.runtime.callTreeLab.mcts.phases.backprop'),
    complete: t('features.algorithms.runtime.callTreeLab.mcts.phases.complete'),
  },
  descriptions: {
    setup: t('features.algorithms.runtime.callTreeLab.mcts.descriptions.setup'),
    selectStart: t('features.algorithms.runtime.callTreeLab.mcts.descriptions.selectStart'),
    selectPick: t('features.algorithms.runtime.callTreeLab.mcts.descriptions.selectPick'),
    expand: t('features.algorithms.runtime.callTreeLab.mcts.descriptions.expand'),
    simulate: t('features.algorithms.runtime.callTreeLab.mcts.descriptions.simulate'),
    backprop: t('features.algorithms.runtime.callTreeLab.mcts.descriptions.backprop'),
    complete: t('features.algorithms.runtime.callTreeLab.mcts.descriptions.complete'),
  },
  decisions: {
    descend: t('features.algorithms.runtime.callTreeLab.mcts.decisions.descend'),
    explore: t('features.algorithms.runtime.callTreeLab.mcts.decisions.explore'),
    expand: t('features.algorithms.runtime.callTreeLab.mcts.decisions.expand'),
    simulate: t('features.algorithms.runtime.callTreeLab.mcts.decisions.simulate'),
    bubbleUp: t('features.algorithms.runtime.callTreeLab.mcts.decisions.bubbleUp'),
    done: t('features.algorithms.runtime.callTreeLab.mcts.decisions.done'),
  },
  stats: {
    visits: t('features.algorithms.runtime.callTreeLab.mcts.stats.visits'),
    reward: t('features.algorithms.runtime.callTreeLab.mcts.stats.reward'),
    ucb: t('features.algorithms.runtime.callTreeLab.mcts.stats.ucb'),
    iteration: t('features.algorithms.runtime.callTreeLab.mcts.stats.iteration'),
    bestArm: t('features.algorithms.runtime.callTreeLab.mcts.stats.bestArm'),
    explored: t('features.algorithms.runtime.callTreeLab.mcts.stats.explored'),
  },
} as const;

type NodeModel = {
  id: string;
  parentId: string | null;
  depth: number;
  armIndex: number;
  visits: number;
  reward: number;
  children: string[];
  /** Which leaf reward index this node resolves to when simulated.
   *  For internal nodes we expand one child at a time following the
   *  branching; leaves deterministically hand back their reward. */
  leafRewardIndex: number | null;
  phase: CallTreeNodePhase;
  edgeLabel: string | null;
};

function ucb1(node: NodeModel, parentVisits: number, c: number): number {
  if (node.visits === 0) return Number.POSITIVE_INFINITY;
  const exploit = node.reward / node.visits;
  const explore = c * Math.sqrt(Math.log(Math.max(1, parentVisits)) / node.visits);
  return exploit + explore;
}

function fmtFixed(value: number, digits = 2): string {
  if (!isFinite(value)) return '∞';
  return value.toFixed(digits);
}

export function* mctsGenerator(scenario: McTsScenario): Generator<SortStep> {
  const { branching, iterations, c, leafRewards, presetLabel } = scenario;
  const depth = 2; // Keep the explore tree shallow so the trace is readable.
  const mode = I18N.modeLabel;

  const nodes: NodeModel[] = [];
  let idSeq = 0;
  let iterationCount = 0;
  let stepIteration = 0;

  /** Stats attached to each node's card. */
  function statsFor(m: NodeModel, parent: NodeModel | null): readonly CallTreeNodeStat[] {
    const stats: CallTreeNodeStat[] = [
      { label: I18N.stats.visits, value: String(m.visits), tone: 'accent' },
      {
        label: I18N.stats.reward,
        value: m.visits > 0 ? fmtFixed(m.reward / m.visits) : '—',
        tone: 'success',
      },
    ];
    if (parent) {
      const ucb = ucb1(m, parent.visits, c);
      stats.push({
        label: I18N.stats.ucb,
        value: fmtFixed(ucb),
        tone: 'route',
      });
    }
    return stats;
  }

  const makeState = (partial: {
    phaseLabel: CallTreeLabTraceState['phaseLabel'];
    decisionLabel: CallTreeLabTraceState['decisionLabel'];
    tone: CallTreeLabTraceState['tone'];
    activePath: readonly string[];
    resultLabel: CallTreeLabTraceState['resultLabel'];
  }): CallTreeLabTraceState => {
    const byId = new Map(nodes.map((n) => [n.id, n] as const));
    const outNodes: CallTreeNode[] = nodes.map((m) => {
      const parent = m.parentId ? (byId.get(m.parentId) ?? null) : null;
      const title = m.parentId === null
        ? 'root'
        : m.leafRewardIndex !== null
          ? `leaf #${m.armIndex + 1}`
          : `arm #${m.armIndex + 1}`;
      return {
        id: m.id,
        parentId: m.parentId,
        title,
        subtitle: null,
        badge: null,
        phase: m.phase,
        edgeLabel: m.edgeLabel,
        stats: statsFor(m, parent),
      };
    });
    const root = nodes.length > 0 ? nodes[0] : null;
    // Compute best-arm eagerly so the stat is always rendered — this
    // keeps the strip from reshaping when visits first appear.
    let bestArmValue: string = '—';
    let bestArmTone: CallTreeStat['tone'] = 'info';
    if (root) {
      const children = nodes.filter((n) => n.parentId === root.id);
      const best = children
        .filter((c) => c.visits > 0)
        .sort((a, b) => b.visits - a.visits)[0];
      if (best) {
        bestArmValue = `#${best.armIndex + 1} (${best.visits})`;
        bestArmTone = 'success';
      }
    }
    const stats: CallTreeStat[] = [
      {
        label: I18N.stats.iteration,
        value: `${iterationCount} / ${iterations}`,
        tone: 'accent',
      },
      { label: I18N.stats.explored, value: String(nodes.length - 1), tone: 'info' },
      { label: I18N.stats.bestArm, value: bestArmValue, tone: bestArmTone },
    ];
    return {
      mode: 'mcts',
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
      iteration: stepIteration,
    };
  };

  function ancestry(id: string): readonly string[] {
    const out: string[] = [];
    let current: string | null = id;
    const byId = new Map(nodes.map((n) => [n.id, n] as const));
    while (current !== null) {
      out.unshift(current);
      current = byId.get(current)?.parentId ?? null;
    }
    return out;
  }

  function setPhase(id: string, phase: CallTreeNodePhase) {
    const m = nodes.find((n) => n.id === id);
    if (m) m.phase = phase;
  }

  function resetPhasesExceptPath(path: readonly string[]) {
    const pathSet = new Set(path);
    for (const m of nodes) {
      if (!pathSet.has(m.id)) {
        m.phase = m.phase === 'solution' ? 'solution' : 'explored';
      }
    }
  }

  // ---------- Setup ----------
  const rootId = `root-${idSeq++}`;
  nodes.push({
    id: rootId,
    parentId: null,
    depth: 0,
    armIndex: -1,
    visits: 0,
    reward: 0,
    children: [],
    leafRewardIndex: null,
    phase: 'current',
    edgeLabel: null,
  });
  stepIteration++;
  yield createCallTreeLabStep({
    activeCodeLine: 1,
    description: i18nText(I18N.descriptions.setup, { iterations, c: fmtFixed(c) }),
    state: makeState({
      phaseLabel: I18N.phases.setup,
      decisionLabel: I18N.decisions.descend,
      tone: 'idle',
      activePath: [rootId],
      resultLabel: null,
    }),
  });

  for (let iter = 0; iter < iterations; iter++) {
    iterationCount = iter + 1;

    // ---------- Selection: walk down using UCB1 ----------
    resetPhasesExceptPath([]);
    let current = nodes[0];
    setPhase(current.id, 'current');
    stepIteration++;
    yield createCallTreeLabStep({
      activeCodeLine: 2,
      description: i18nText(I18N.descriptions.selectStart, { iter: iterationCount }),
      state: makeState({
        phaseLabel: I18N.phases.select,
        decisionLabel: I18N.decisions.descend,
        tone: 'descend',
        activePath: [current.id],
        resultLabel: null,
      }),
    });

    // Descend while all branches are fully expanded (branching children present).
    while (current.children.length === branching && current.depth < depth) {
      const children = current.children.map((id) => nodes.find((n) => n.id === id) as NodeModel);
      const scored = children
        .map((child) => ({ child, score: ucb1(child, current.visits, c) }))
        .sort((a, b) => b.score - a.score);
      const picked = scored[0].child;
      setPhase(picked.id, 'current');
      stepIteration++;
      yield createCallTreeLabStep({
        activeCodeLine: 2,
        description: i18nText(I18N.descriptions.selectPick, {
          arm: picked.armIndex + 1,
          ucb: fmtFixed(scored[0].score),
        }),
        state: makeState({
          phaseLabel: I18N.phases.select,
          decisionLabel: I18N.decisions.explore,
          tone: 'descend',
          activePath: [...ancestry(picked.id)],
          resultLabel: null,
        }),
      });
      current = picked;
    }

    // ---------- Expansion: add one new child ----------
    let simNode = current;
    if (current.depth < depth && current.children.length < branching) {
      const armIndex = current.children.length;
      const childDepth = current.depth + 1;
      // Compute leaf reward index deterministically by path.
      let leafRewardIndex: number | null = null;
      if (childDepth === depth) {
        const ancestorArms: number[] = [];
        let walker: NodeModel | undefined = current;
        while (walker && walker.parentId !== null) {
          ancestorArms.unshift(walker.armIndex);
          walker = nodes.find((n) => n.id === walker?.parentId);
        }
        const path = [...ancestorArms, armIndex];
        let idx = 0;
        for (let i = 0; i < path.length; i++) {
          idx = idx * branching + path[i];
        }
        leafRewardIndex = idx;
      }
      const childId = `n-${idSeq++}`;
      const child: NodeModel = {
        id: childId,
        parentId: current.id,
        depth: childDepth,
        armIndex,
        visits: 0,
        reward: 0,
        children: [],
        leafRewardIndex,
        phase: 'current',
        edgeLabel: `a${armIndex + 1}`,
      };
      nodes.push(child);
      current.children.push(childId);
      simNode = child;
      stepIteration++;
      yield createCallTreeLabStep({
        activeCodeLine: 3,
        description: i18nText(I18N.descriptions.expand, {
          arm: armIndex + 1,
          depth: childDepth,
        }),
        state: makeState({
          phaseLabel: I18N.phases.expand,
          decisionLabel: I18N.decisions.expand,
          tone: 'descend',
          activePath: [...ancestry(child.id)],
          resultLabel: null,
        }),
      });
    }

    // ---------- Simulation: deterministic reward lookup ----------
    const rewardIdx =
      simNode.leafRewardIndex !== null
        ? simNode.leafRewardIndex
        : // Walk down arm 0 until a leaf to get a reward for non-leaf expansions.
          rolloutRewardIndex(simNode);
    const reward = leafRewards[rewardIdx % leafRewards.length];
    stepIteration++;
    yield createCallTreeLabStep({
      activeCodeLine: 4,
      description: i18nText(I18N.descriptions.simulate, { reward: fmtFixed(reward) }),
      state: makeState({
        phaseLabel: I18N.phases.simulate,
        decisionLabel: I18N.decisions.simulate,
        tone: 'descend',
        activePath: [...ancestry(simNode.id)],
        resultLabel: null,
      }),
    });

    // ---------- Backpropagation ----------
    const path = ancestry(simNode.id);
    for (let i = path.length - 1; i >= 0; i--) {
      const m = nodes.find((n) => n.id === path[i]);
      if (!m) continue;
      m.visits += 1;
      m.reward += reward;
    }
    stepIteration++;
    yield createCallTreeLabStep({
      activeCodeLine: 5,
      description: i18nText(I18N.descriptions.backprop, {
        reward: fmtFixed(reward),
        depth: simNode.depth,
      }),
      state: makeState({
        phaseLabel: I18N.phases.backprop,
        decisionLabel: I18N.decisions.bubbleUp,
        tone: 'return',
        activePath: [...path],
        resultLabel: null,
      }),
    });
  }

  function rolloutRewardIndex(startNode: NodeModel): number {
    const ancestorArms: number[] = [];
    let walker: NodeModel | undefined = startNode;
    while (walker && walker.parentId !== null) {
      ancestorArms.unshift(walker.armIndex);
      walker = nodes.find((n) => n.id === walker?.parentId);
    }
    const remainingDepth = depth - startNode.depth;
    const padded = [...ancestorArms];
    for (let i = 0; i < remainingDepth; i++) padded.push(0);
    let idx = 0;
    for (let i = 0; i < padded.length; i++) idx = idx * branching + padded[i];
    return idx;
  }

  // ---------- Complete: pick best arm of root ----------
  const rootModel = nodes[0];
  const rootChildren = nodes.filter((n) => n.parentId === rootModel.id);
  const best = [...rootChildren].sort((a, b) => b.visits - a.visits)[0];
  if (best) setPhase(best.id, 'solution');
  stepIteration++;
  yield createCallTreeLabStep({
    activeCodeLine: 6,
    description: i18nText(I18N.descriptions.complete, {
      arm: best ? best.armIndex + 1 : '—',
      visits: best?.visits ?? 0,
      mean: best && best.visits > 0 ? fmtFixed(best.reward / best.visits) : '—',
    }),
    state: makeState({
      phaseLabel: I18N.phases.complete,
      decisionLabel: I18N.decisions.done,
      tone: 'complete',
      activePath: best ? [rootModel.id, best.id] : [rootModel.id],
      resultLabel: best
        ? i18nText(I18N.resultFormat, {
            arm: best.armIndex + 1,
            visits: best.visits,
            mean: best.visits > 0 ? fmtFixed(best.reward / best.visits) : '—',
          })
        : null,
    }),
  });
}
