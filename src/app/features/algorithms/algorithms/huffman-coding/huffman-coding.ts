import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import { i18nText, TranslatableText } from '../../../../core/i18n/translatable-text';
import { createStringStep } from '../string-step';
import { SortStep } from '../../models/sort-step';
import {
  HuffmanCodeEntry,
  HuffmanEdge,
  HuffmanFreq,
  HuffmanHeapItem,
  HuffmanTraceState,
  HuffmanTreeNode,
} from '../../models/string';
import { HuffmanScenario } from '../../utils/scenarios/string/string-scenarios';

const I18N = {
  modeLabel: t('features.algorithms.runtime.string.huffmanCoding.modeLabel'),
  phases: {
    countFrequencies: t(
      'features.algorithms.runtime.string.huffmanCoding.phases.countFrequencies',
    ),
    buildHeap: t('features.algorithms.runtime.string.huffmanCoding.phases.buildHeap'),
    popMinimums: t('features.algorithms.runtime.string.huffmanCoding.phases.popMinimums'),
    mergeNodes: t('features.algorithms.runtime.string.huffmanCoding.phases.mergeNodes'),
    assignCodes: t('features.algorithms.runtime.string.huffmanCoding.phases.assignCodes'),
  },
  insights: {
    uniqueCharsLabel: t(
      'features.algorithms.runtime.string.huffmanCoding.insights.uniqueCharsLabel',
    ),
    heapSizeLabel: t('features.algorithms.runtime.string.huffmanCoding.insights.heapSizeLabel'),
    codesAssignedLabel: t(
      'features.algorithms.runtime.string.huffmanCoding.insights.codesAssignedLabel',
    ),
    savingsLabel: t('features.algorithms.runtime.string.huffmanCoding.insights.savingsLabel'),
    savingsValue: t('features.algorithms.runtime.string.huffmanCoding.insights.savingsValue'),
    noneValue: t('features.algorithms.runtime.string.huffmanCoding.insights.noneValue'),
  },
  descriptions: {
    countFrequency: t(
      'features.algorithms.runtime.string.huffmanCoding.descriptions.countFrequency',
    ),
    buildHeap: t('features.algorithms.runtime.string.huffmanCoding.descriptions.buildHeap'),
    popMinimums: t('features.algorithms.runtime.string.huffmanCoding.descriptions.popMinimums'),
    createdInternalNode: t(
      'features.algorithms.runtime.string.huffmanCoding.descriptions.createdInternalNode',
    ),
    assignCode: t('features.algorithms.runtime.string.huffmanCoding.descriptions.assignCode'),
  },
  decisions: {
    frequentShorterCodes: t(
      'features.algorithms.runtime.string.huffmanCoding.decisions.frequentShorterCodes',
    ),
    minHeapReady: t('features.algorithms.runtime.string.huffmanCoding.decisions.minHeapReady'),
    mergeSmallestFirst: t(
      'features.algorithms.runtime.string.huffmanCoding.decisions.mergeSmallestFirst',
    ),
    rootReady: t('features.algorithms.runtime.string.huffmanCoding.decisions.rootReady'),
    pushMergedNode: t('features.algorithms.runtime.string.huffmanCoding.decisions.pushMergedNode'),
    tracePath: t('features.algorithms.runtime.string.huffmanCoding.decisions.tracePath'),
  },
  computation: {
    labels: {
      characterFrequency: t(
        'features.algorithms.runtime.string.huffmanCoding.computation.labels.characterFrequency',
      ),
      initialHeap: t(
        'features.algorithms.runtime.string.huffmanCoding.computation.labels.initialHeap',
      ),
      popTwoMinimums: t(
        'features.algorithms.runtime.string.huffmanCoding.computation.labels.popTwoMinimums',
      ),
      newInternalNode: t(
        'features.algorithms.runtime.string.huffmanCoding.computation.labels.newInternalNode',
      ),
      prefixCode: t('features.algorithms.runtime.string.huffmanCoding.computation.labels.prefixCode'),
    },
    expressions: {
      codeFromPath: t(
        'features.algorithms.runtime.string.huffmanCoding.computation.expressions.codeFromPath',
      ),
    },
    results: {
      heapSize: t('features.algorithms.runtime.string.huffmanCoding.computation.results.heapSize'),
      newNodeFrequency: t(
        'features.algorithms.runtime.string.huffmanCoding.computation.results.newNodeFrequency',
      ),
      frequencyValue: t(
        'features.algorithms.runtime.string.huffmanCoding.computation.results.frequencyValue',
      ),
      codeBits: t('features.algorithms.runtime.string.huffmanCoding.computation.results.codeBits'),
    },
    notes: {
      characterFrequency: t(
        'features.algorithms.runtime.string.huffmanCoding.computation.notes.characterFrequency',
      ),
      initialHeap: t(
        'features.algorithms.runtime.string.huffmanCoding.computation.notes.initialHeap',
      ),
      popTwoMinimums: t(
        'features.algorithms.runtime.string.huffmanCoding.computation.notes.popTwoMinimums',
      ),
      newInternalNode: t(
        'features.algorithms.runtime.string.huffmanCoding.computation.notes.newInternalNode',
      ),
      prefixCodeFinal: t(
        'features.algorithms.runtime.string.huffmanCoding.computation.notes.prefixCodeFinal',
      ),
      prefixCodeSymbol: t(
        'features.algorithms.runtime.string.huffmanCoding.computation.notes.prefixCodeSymbol',
      ),
    },
  },
  labels: {
    countedProgress: t('features.algorithms.runtime.string.huffmanCoding.labels.countedProgress'),
    leafNodes: t('features.algorithms.runtime.string.huffmanCoding.labels.leafNodes'),
    readyToMerge: t('features.algorithms.runtime.string.huffmanCoding.labels.readyToMerge'),
    newNodeFrequency: t(
      'features.algorithms.runtime.string.huffmanCoding.labels.newNodeFrequency',
    ),
    heapSize: t('features.algorithms.runtime.string.huffmanCoding.labels.heapSize'),
    compressedBits: t('features.algorithms.runtime.string.huffmanCoding.labels.compressedBits'),
    codesProgress: t('features.algorithms.runtime.string.huffmanCoding.labels.codesProgress'),
    codeAssignment: t('features.algorithms.runtime.string.huffmanCoding.labels.codeAssignment'),
  },
} as const;

interface MutableNode {
  id: string;
  char: string | null;
  freq: number;
  leftId: string | null;
  rightId: string | null;
  code: string;
  x: number;
  y: number;
  tone: HuffmanTreeNode['tone'];
}

interface MergeStep {
  leftId: string;
  rightId: string;
  newId: string;
  newFreq: number;
  heapAfter: readonly string[];
}

function assignLayout(
  id: string,
  depth: number,
  nodes: Map<string, MutableNode>,
  leafCounter: { value: number },
): { x: number; y: number } {
  const node = nodes.get(id)!;
  node.y = depth * 72 + 20;

  if (!node.leftId && !node.rightId) {
    // Leaf
    node.x = leafCounter.value * 76 + 38;
    leafCounter.value++;
    return { x: node.x, y: node.y };
  }

  const leftPos = node.leftId ? assignLayout(node.leftId, depth + 1, nodes, leafCounter) : null;
  const rightPos = node.rightId ? assignLayout(node.rightId, depth + 1, nodes, leafCounter) : null;

  const leftX = leftPos?.x ?? 38;
  const rightX = rightPos?.x ?? 38;
  node.x = (leftX + rightX) / 2;

  return { x: node.x, y: node.y };
}

function assignCodes(id: string, code: string, nodes: Map<string, MutableNode>): void {
  const node = nodes.get(id);
  if (!node) return;
  node.code = code;
  if (node.leftId) assignCodes(node.leftId, code + '0', nodes);
  if (node.rightId) assignCodes(node.rightId, code + '1', nodes);
}

function nodesToFrozen(nodes: Map<string, MutableNode>): readonly HuffmanTreeNode[] {
  return Array.from(nodes.values()).map((n) => ({
    id: n.id,
    char: n.char,
    freq: n.freq,
    code: n.code,
    leftId: n.leftId,
    rightId: n.rightId,
    x: n.x,
    y: n.y,
    tone: n.tone,
  }));
}

function buildEdges(nodes: Map<string, MutableNode>): readonly HuffmanEdge[] {
  const edges: HuffmanEdge[] = [];
  for (const node of nodes.values()) {
    if (node.leftId) {
      edges.push({ fromId: node.id, toId: node.leftId, label: '0' });
    }
    if (node.rightId) {
      edges.push({ fromId: node.id, toId: node.rightId, label: '1' });
    }
  }
  return edges;
}

function printableNodeChar(char: string | null): string {
  return char ?? '∅';
}

function makeState(args: {
  readonly scenario: HuffmanScenario;
  readonly phaseLabel: TranslatableText;
  readonly activeLabel: TranslatableText;
  readonly resultLabel: TranslatableText;
  readonly decisionLabel: TranslatableText;
  readonly phase: HuffmanTraceState['phase'];
  readonly charFreqs: readonly HuffmanFreq[];
  readonly heapItems: readonly HuffmanHeapItem[];
  readonly visibleNodeIds: readonly string[];
  readonly allNodes: readonly HuffmanTreeNode[];
  readonly visibleEdgeIds: readonly string[];
  readonly allEdges: readonly HuffmanEdge[];
  readonly codeTable: readonly HuffmanCodeEntry[];
  readonly totalOriginalBits: number;
  readonly totalCompressedBits: number;
  readonly computation: HuffmanTraceState['computation'];
}): HuffmanTraceState {
  return {
    mode: 'huffman',
    modeLabel: I18N.modeLabel,
    phaseLabel: args.phaseLabel,
    presetLabel: args.scenario.presetLabel,
    presetDescription: args.scenario.presetDescription,
    activeLabel: args.activeLabel,
    resultLabel: args.resultLabel,
    decisionLabel: args.decisionLabel,
    computation: args.computation,
    insights: [
      {
        label: I18N.insights.uniqueCharsLabel,
        value: String(args.charFreqs.length),
        tone: 'info',
      },
      {
        label: I18N.insights.heapSizeLabel,
        value: String(args.heapItems.length),
        tone: 'accent',
      },
      {
        label: I18N.insights.codesAssignedLabel,
        value: String(args.codeTable.length),
        tone: 'success',
      },
      {
        label: I18N.insights.savingsLabel,
        value:
          args.totalOriginalBits > 0
            ? i18nText(I18N.insights.savingsValue, {
                percent: ((1 - args.totalCompressedBits / args.totalOriginalBits) * 100).toFixed(0),
              })
            : I18N.insights.noneValue,
        tone: 'warning',
      },
    ],
    source: args.scenario.source,
    phase: args.phase,
    charFreqs: args.charFreqs,
    heapItems: args.heapItems,
    visibleNodeIds: args.visibleNodeIds,
    allNodes: args.allNodes,
    visibleEdgeIds: args.visibleEdgeIds,
    allEdges: args.allEdges,
    codeTable: args.codeTable,
    totalOriginalBits: args.totalOriginalBits,
    totalCompressedBits: args.totalCompressedBits,
  };
}

export function* huffmanCodingGenerator(scenario: HuffmanScenario): Generator<SortStep> {
  // TODO: Upgrade this visualization with richer heap merge motion, more intentional tree staging,
  // tighter HUD density, and a stronger encoded-output / savings narrative during the final phase.
  const source = scenario.source;

  // ---- Pre-compute everything ----

  // Count frequencies
  const freqMap = new Map<string, number>();
  for (const ch of source) {
    freqMap.set(ch, (freqMap.get(ch) ?? 0) + 1);
  }
  const sortedFreqs = Array.from(freqMap.entries())
    .sort((a, b) => a[1] - b[1] || a[0].localeCompare(b[0]));

  // Build initial nodes
  const nodesMap = new Map<string, MutableNode>();
  for (const [ch, freq] of sortedFreqs) {
    const id = `leaf-${ch}`;
    nodesMap.set(id, {
      id,
      char: ch,
      freq,
      leftId: null,
      rightId: null,
      code: '',
      x: 0,
      y: 0,
      tone: 'leaf',
    });
  }

  // Simulate Huffman merge to record merge steps
  let heap = sortedFreqs.map(([ch]) => `leaf-${ch}`);
  const mergeSteps: MergeStep[] = [];
  let internalCounter = 0;

  while (heap.length > 1) {
    // Sort heap by freq asc, then id for stability
    heap.sort((a, b) => {
      const fa = nodesMap.get(a)!.freq;
      const fb = nodesMap.get(b)!.freq;
      return fa - fb || a.localeCompare(b);
    });

    const leftId = heap.shift()!;
    const rightId = heap.shift()!;
    const leftNode = nodesMap.get(leftId)!;
    const rightNode = nodesMap.get(rightId)!;
    const newFreq = leftNode.freq + rightNode.freq;
    const newId = `internal-${internalCounter++}`;

    nodesMap.set(newId, {
      id: newId,
      char: null,
      freq: newFreq,
      leftId,
      rightId,
      code: '',
      x: 0,
      y: 0,
      tone: 'internal',
    });

    heap.push(newId);

    const heapAfter = [...heap];
    mergeSteps.push({ leftId, rightId, newId, newFreq, heapAfter });
  }

  // The root is the only remaining node
  const rootId = heap[0] ?? `leaf-${sortedFreqs[0]?.[0] ?? 'A'}`;

  // Mark root tone
  const rootNode = nodesMap.get(rootId);
  if (rootNode) {
    rootNode.tone = 'root';
  }

  // Assign codes via DFS
  assignCodes(rootId, '', nodesMap);

  // Assign layout
  const leafCounter = { value: 0 };
  assignLayout(rootId, 0, nodesMap, leafCounter);

  // Build final frozen arrays
  const allNodes = nodesToFrozen(nodesMap);
  const allEdges = buildEdges(nodesMap);

  // Compute compression stats
  const totalOriginalBits = source.length * 8;
  let totalCompressedBits = 0;
  for (const [ch, freq] of sortedFreqs) {
    const nodeId = `leaf-${ch}`;
    const node = nodesMap.get(nodeId);
    totalCompressedBits += freq * (node?.code.length ?? 8);
  }

  // Build code table (will be revealed progressively)
  const fullCodeTable: HuffmanCodeEntry[] = sortedFreqs
    .map(([ch, freq]) => {
      const node = nodesMap.get(`leaf-${ch}`);
      return { char: ch, freq, code: node?.code ?? '' };
    })
    .sort((a, b) => a.code.length - b.code.length || a.char.localeCompare(b.char));

  // Build charFreqs for freq phase (all inactive initially)
  const allCharFreqs: readonly HuffmanFreq[] = sortedFreqs.map(([ch, freq]) => ({
    char: ch,
    freq,
    isActive: false,
  }));

  // ---- Yield steps ----

  // PHASE: freq — reveal each character's frequency one by one
  let activeCharFreqs: HuffmanFreq[] = sortedFreqs.map(([ch, freq]) => ({
    char: ch,
    freq,
    isActive: false,
  }));

  for (let fi = 0; fi < sortedFreqs.length; fi++) {
    activeCharFreqs = activeCharFreqs.map((f, idx) => ({
      ...f,
      isActive: idx <= fi,
    }));

    const [ch, freq] = sortedFreqs[fi]!;

    yield createStringStep({
      activeCodeLine: 2,
      description: i18nText(I18N.descriptions.countFrequency, {
        char: ch,
        freq,
        source,
      }),
      phase: fi === 0 ? 'init' : 'compare',
      string: makeState({
        scenario,
        phaseLabel: I18N.phases.countFrequencies,
        activeLabel: `'${ch}' = ${freq}`,
        resultLabel: i18nText(I18N.labels.countedProgress, {
          current: fi + 1,
          total: sortedFreqs.length,
        }),
        decisionLabel: I18N.decisions.frequentShorterCodes,
        phase: 'freq',
        charFreqs: activeCharFreqs,
        heapItems: [],
        visibleNodeIds: [],
        allNodes,
        visibleEdgeIds: [],
        allEdges,
        codeTable: [],
        totalOriginalBits,
        totalCompressedBits,
        computation: {
          label: I18N.computation.labels.characterFrequency,
          expression: `freq['${ch}'] = count('${ch}', "${source}")`,
          result: String(freq),
          note: I18N.computation.notes.characterFrequency,
        },
      }),
    });
  }

  // PHASE: heap — show initial heap with all leaf nodes visible
  const initialHeapItems: HuffmanHeapItem[] = sortedFreqs.map(([ch, freq]) => ({
    id: `leaf-${ch}`,
    char: ch,
    freq,
    role: null,
  }));

  const initialVisibleNodeIds = sortedFreqs.map(([ch]) => `leaf-${ch}`);

  yield createStringStep({
    activeCodeLine: 3,
    description: i18nText(I18N.descriptions.buildHeap, {
      count: sortedFreqs.length,
    }),
    phase: 'pass-complete',
    string: makeState({
      scenario,
      phaseLabel: I18N.phases.buildHeap,
      activeLabel: i18nText(I18N.labels.leafNodes, { count: sortedFreqs.length }),
      resultLabel: I18N.labels.readyToMerge,
      decisionLabel: I18N.decisions.minHeapReady,
      phase: 'heap',
      charFreqs: allCharFreqs,
      heapItems: initialHeapItems,
      visibleNodeIds: initialVisibleNodeIds,
      allNodes,
      visibleEdgeIds: [],
      allEdges,
      codeTable: [],
      totalOriginalBits,
      totalCompressedBits,
      computation: {
        label: I18N.computation.labels.initialHeap,
        expression: `heap = [${sortedFreqs.map(([ch, f]) => `'${ch}'(${f})`).join(', ')}]`,
        result: i18nText(I18N.computation.results.heapSize, { size: sortedFreqs.length }),
        note: I18N.computation.notes.initialHeap,
      },
    }),
  });

  // PHASE: merge
  let currentVisibleNodeIds = [...initialVisibleNodeIds];
  let currentVisibleEdgeIds: string[] = [];
  let currentHeapIds = [...initialVisibleNodeIds];

  for (let mi = 0; mi < mergeSteps.length; mi++) {
    const step = mergeSteps[mi]!;
    const leftNode = nodesMap.get(step.leftId)!;
    const rightNode = nodesMap.get(step.rightId)!;
    const newNode = nodesMap.get(step.newId)!;

    // Build heap items without the new node yet (showing L and R highlighted)
    const heapBeforeItems: HuffmanHeapItem[] = currentHeapIds
      .filter((id) => id !== step.leftId && id !== step.rightId)
      .map((id) => {
        const n = nodesMap.get(id)!;
        return { id: n.id, char: n.char, freq: n.freq, role: null as 'left' | 'right' | 'new' | null };
      });

    const heapWithLR: HuffmanHeapItem[] = [
      { id: step.leftId, char: leftNode.char, freq: leftNode.freq, role: 'left' },
      { id: step.rightId, char: rightNode.char, freq: rightNode.freq, role: 'right' },
      ...heapBeforeItems,
    ];

    yield createStringStep({
      activeCodeLine: 5,
      description: i18nText(I18N.descriptions.popMinimums, {
        step: mi + 1,
        leftChar: printableNodeChar(leftNode.char),
        leftFreq: leftNode.freq,
        rightChar: printableNodeChar(rightNode.char),
        rightFreq: rightNode.freq,
      }),
      phase: 'compare',
      string: makeState({
        scenario,
        phaseLabel: I18N.phases.popMinimums,
        activeLabel: `L=${leftNode.freq}, R=${rightNode.freq}`,
        resultLabel: i18nText(I18N.labels.newNodeFrequency, { freq: step.newFreq }),
        decisionLabel: I18N.decisions.mergeSmallestFirst,
        phase: 'merge',
        charFreqs: allCharFreqs,
        heapItems: heapWithLR,
        visibleNodeIds: currentVisibleNodeIds,
        allNodes,
        visibleEdgeIds: currentVisibleEdgeIds,
        allEdges,
        codeTable: [],
        totalOriginalBits,
        totalCompressedBits,
        computation: {
          label: I18N.computation.labels.popTwoMinimums,
          expression: `L=${leftNode.freq}, R=${rightNode.freq}`,
          result: i18nText(I18N.computation.results.newNodeFrequency, {
            left: leftNode.freq,
            right: rightNode.freq,
            total: step.newFreq,
          }),
          note: I18N.computation.notes.popTwoMinimums,
        },
      }),
    });

    // Now reveal the new merged node and its edges
    currentVisibleNodeIds = [...currentVisibleNodeIds, step.newId];
    const leftEdgeId = `${step.newId}|${step.leftId}`;
    const rightEdgeId = `${step.newId}|${step.rightId}`;
    currentVisibleEdgeIds = [...currentVisibleEdgeIds, leftEdgeId, rightEdgeId];

    // Update heap list
    currentHeapIds = currentHeapIds.filter((id) => id !== step.leftId && id !== step.rightId);
    currentHeapIds.push(step.newId);

    // Sort heap for display
    const sortedHeapIds = [...currentHeapIds].sort((a, b) => {
      const fa = nodesMap.get(a)!.freq;
      const fb = nodesMap.get(b)!.freq;
      return fa - fb || a.localeCompare(b);
    });

    const heapAfterItems: HuffmanHeapItem[] = sortedHeapIds.map((id) => {
      const n = nodesMap.get(id)!;
      const role = id === step.newId ? 'new' : null;
      return { id: n.id, char: n.char, freq: n.freq, role } as HuffmanHeapItem;
    });

    yield createStringStep({
      activeCodeLine: 7,
      description: i18nText(I18N.descriptions.createdInternalNode, {
        freq: step.newFreq,
        heapSize: currentHeapIds.length,
      }),
      phase: 'pass-complete',
      string: makeState({
        scenario,
        phaseLabel: I18N.phases.mergeNodes,
        activeLabel: i18nText(I18N.labels.newNodeFrequency, { freq: step.newFreq }),
        resultLabel: i18nText(I18N.labels.heapSize, { size: currentHeapIds.length }),
        decisionLabel:
          currentHeapIds.length === 1
            ? I18N.decisions.rootReady
            : I18N.decisions.pushMergedNode,
        phase: 'merge',
        charFreqs: allCharFreqs,
        heapItems: heapAfterItems,
        visibleNodeIds: currentVisibleNodeIds,
        allNodes,
        visibleEdgeIds: currentVisibleEdgeIds,
        allEdges,
        codeTable: [],
        totalOriginalBits,
        totalCompressedBits,
        computation: {
          label: I18N.computation.labels.newInternalNode,
          expression: `merge(${leftNode.freq}, ${rightNode.freq})`,
          result: i18nText(I18N.computation.results.frequencyValue, { freq: step.newFreq }),
          note: I18N.computation.notes.newInternalNode,
        },
      }),
    });
  }

  // PHASE: codes — reveal code table entries one by one
  const finalHeapItems: HuffmanHeapItem[] = currentHeapIds.map((id) => {
    const n = nodesMap.get(id)!;
    return { id: n.id, char: n.char, freq: n.freq, role: null };
  });

  let revealedCodeTable: HuffmanCodeEntry[] = [];

  for (let ci = 0; ci < fullCodeTable.length; ci++) {
    const entry = fullCodeTable[ci]!;
    revealedCodeTable = [...revealedCodeTable, entry];

    const isLast = ci === fullCodeTable.length - 1;

    yield createStringStep({
      activeCodeLine: 10,
      description: i18nText(I18N.descriptions.assignCode, {
        code: entry.code,
        bits: entry.code.length,
        char: entry.char,
        freq: entry.freq,
      }),
      phase: isLast ? 'complete' : 'compare',
      string: makeState({
        scenario,
        phaseLabel: I18N.phases.assignCodes,
        activeLabel: i18nText(I18N.labels.codeAssignment, {
          char: entry.char,
          code: entry.code,
        }),
        resultLabel: isLast
          ? i18nText(I18N.labels.compressedBits, { bits: totalCompressedBits })
          : i18nText(I18N.labels.codesProgress, { current: ci + 1, total: fullCodeTable.length }),
        decisionLabel: i18nText(I18N.decisions.tracePath, { char: entry.char }),
        phase: 'codes',
        charFreqs: allCharFreqs,
        heapItems: finalHeapItems,
        visibleNodeIds: currentVisibleNodeIds,
        allNodes,
        visibleEdgeIds: currentVisibleEdgeIds,
        allEdges,
        codeTable: revealedCodeTable,
        totalOriginalBits,
        totalCompressedBits,
        computation: {
          label: I18N.computation.labels.prefixCode,
          expression: i18nText(I18N.computation.expressions.codeFromPath, { char: entry.char }),
          result: i18nText(I18N.computation.results.codeBits, {
            code: entry.code,
            bits: entry.code.length,
          }),
          note: isLast
            ? i18nText(I18N.computation.notes.prefixCodeFinal, {
                original: totalOriginalBits,
                compressed: totalCompressedBits,
                savings: ((1 - totalCompressedBits / totalOriginalBits) * 100).toFixed(0),
              })
            : i18nText(I18N.computation.notes.prefixCodeSymbol, {
                freq: entry.freq,
                bits: entry.code.length,
                total: entry.freq * entry.code.length,
              }),
        },
      }),
    });
  }
}
