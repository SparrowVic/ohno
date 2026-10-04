import { describe, expect, it } from 'vitest';

import { I18N_KEY, RUNTIME_KEY } from '../../../core/i18n/i18n-keys';
import { i18nText, isI18nText, translatableKey } from '../../../core/i18n/translatable-text';
import { SortStep } from '../models/sort-step';
import { createEdmondsKarpScenario } from '../utils/scenarios/network/network-scenarios';
import { createHungarianScenario } from '../utils/scenarios/matrix/matrix-scenarios';
import { createSosDpScenario } from '../utils/scenarios/dp/dp-scenarios';
import { createPalindromicTreeScenario } from '../utils/scenarios/string/string-scenarios';
import { createRecursiveFibonacciScenario } from '../utils/scenarios/call-stack-lab/call-stack-lab-scenarios';
import { createMinimaxScenario } from '../utils/scenarios/call-tree-lab/call-tree-lab-scenarios';
import { dijkstraGenerator } from './dijkstra/dijkstra';
import { edmondsKarpGenerator } from './edmonds-karp';
import { hungarianAlgorithmGenerator } from './hungarian-algorithm';
import { sosDpGenerator } from './sos-dp';
import { palindromicTreeGenerator } from './palindromic-tree/palindromic-tree';
import { recursionCallStackGenerator } from './recursion-call-stack/recursion-call-stack';
import { minimaxAlphaBetaGenerator } from './minimax-alpha-beta/minimax-alpha-beta';

const DISPLAY = I18N_KEY.features.algorithms.display;

function keys(values: readonly unknown[]): readonly (string | null)[] {
  return values.map((value) => (isI18nText(value) ? value.key : null));
}

describe('runtime text keys', () => {
  it('emits Dijkstra keep decisions and the idle path as keys', () => {
    const steps: SortStep[] = [
      ...dijkstraGenerator({
        sourceId: 'a',
        nodes: [
          { id: 'a', label: 'A', x: 0, y: 0 },
          { id: 'b', label: 'B', x: 1, y: 0 },
          { id: 'c', label: 'C', x: 2, y: 0 },
        ],
        edges: [
          { id: 'ab', from: 'a', to: 'b', weight: 1 },
          { id: 'ac', from: 'a', to: 'c', weight: 2 },
          { id: 'bc', from: 'b', to: 'c', weight: 5 },
        ],
      }),
    ];
    expect(steps[0]?.graph?.detailValue).toEqual(i18nText(RUNTIME_KEY.graph.common.noActiveNode));
    expect(steps[0]?.graph?.metricLabel).toEqual(i18nText(DISPLAY.graph.labels.distance));
    const keep = steps.find((step) => step.phase === 'skip-relax');
    expect(keep?.graph?.computation?.decision).toEqual(i18nText(RUNTIME_KEY.graph.common.keep, { value: 2 }));
    const relax = steps.find((step) => step.phase === 'relax');
    expect(translatableKey(relax?.graph?.computation?.decision)).toBe(RUNTIME_KEY.graph.common.betterThan);
  });

  it('emits Edmonds-Karp computation labels, lanes and rack titles as keys', () => {
    const steps = [...edmondsKarpGenerator(createEdmondsKarpScenario(6))];
    const network = steps[0]?.network;
    expect(network?.modeLabel).toEqual(i18nText(RUNTIME_KEY.network.common.modes.edmondsKarp));
    expect(network?.frontierLabel).toEqual(i18nText(RUNTIME_KEY.network.common.frontiers.bfsFrontier));
    expect(network?.queueLabel).toEqual(i18nText(DISPLAY.network.labels.residualQueue));
    expect(network?.traceRows.every((row) => isI18nText(row.laneLabel))).toBe(true);
    const computations = steps.flatMap((step) => (step.network?.computation ? [step.network.computation] : []));
    expect(computations.every((entry) => isI18nText(entry.label) && isI18nText(entry.decision))).toBe(true);
    expect(computations[0]?.result).toEqual(i18nText(RUNTIME_KEY.network.common.computation.residualBfsReady));
  });

  it('emits Hungarian rack titles, sentences and verdicts as keys', () => {
    const steps = [...hungarianAlgorithmGenerator(createHungarianScenario(4))];
    expect(steps[0]?.matrix?.focusItemsLabel).toEqual(i18nText(DISPLAY.matrix.racks.workers));
    const subtract = steps.find((step) => translatableKey(step.matrix?.computation?.label) === DISPLAY.matrix.notes.titles.subtractMinimum);
    expect(translatableKey(subtract?.matrix?.computation?.expression)).toBe(DISPLAY.matrix.notes.formulas.subtractRow);
    expect(translatableKey(subtract?.matrix?.computation?.result)).toBe(DISPLAY.matrix.notes.verdicts.zeroCreated);
    const last = steps.at(-1)?.matrix;
    expect(keys(last?.secondaryItems ?? [])).toEqual([DISPLAY.matrix.sentences.perfectMatchingOptimal]);
  });

  it('emits SOS DP bit labels and the active cell as keys with params', () => {
    const steps = [...sosDpGenerator(createSosDpScenario(3, 'signals'))];
    const dp = steps.find((step) => step.dp?.activeLabel && translatableKey(step.dp.activeLabel) === RUNTIME_KEY.dp.sosDp.trace.activeBit)?.dp;
    expect(dp).toBeDefined();
    expect(isI18nText(dp?.activeLabel) && typeof dp.activeLabel.params?.['bit']).toBe('number');
    expect(dp?.rowHeaders[1]?.label).toEqual(i18nText(DISPLAY.dp.labels.bit, { n: 0 }));
    expect(keys(dp?.secondaryItems ?? []).every((key) => key === DISPLAY.dp.labels.bit)).toBe(true);
  });

  it('names the palindromic tree roots through keys', () => {
    const steps = [...palindromicTreeGenerator(createPalindromicTreeScenario(8, 'banana'))];
    const nodes = steps.at(-1)?.string;
    const tree = nodes && 'nodes' in nodes ? nodes.nodes : [];
    expect(tree.slice(0, 2).map((node) => (node as { palindrome: unknown }).palindrome)).toEqual([
      i18nText(DISPLAY.string.nodes.oddRoot),
      i18nText(DISPLAY.string.nodes.evenRoot),
    ]);
  });

  it('labels call-stack locals and call-tree nodes through keys', () => {
    const stack = [...recursionCallStackGenerator(createRecursiveFibonacciScenario(4, null))];
    const locals = stack.flatMap((step) => step.callStackLab?.frames.flatMap((frame) => frame.locals) ?? []);
    const left = locals.find((local) => translatableKey(local.label) === DISPLAY.callStack.locals.left);
    expect(left).toBeDefined();
    const tree = [...minimaxAlphaBetaGenerator(createMinimaxScenario(0, null))].at(-1)?.callTreeLab;
    const titles = new Set(tree?.nodes.map((node) => translatableKey(node.title)));
    expect(titles.has(DISPLAY.callTree.titles.max)).toBe(true);
    expect(titles.has(DISPLAY.callTree.titles.leaf)).toBe(true);
  });
});
