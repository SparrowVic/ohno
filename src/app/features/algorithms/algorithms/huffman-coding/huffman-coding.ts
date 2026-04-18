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
import { HuffmanScenario } from '../../utils/string-scenarios/string-scenarios';

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

function makeState(args: {
  readonly scenario: HuffmanScenario;
  readonly phaseLabel: string;
  readonly activeLabel: string;
  readonly resultLabel: string;
  readonly decisionLabel: string;
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
    modeLabel: 'Huffman tree',
    phaseLabel: args.phaseLabel,
    presetLabel: args.scenario.presetLabel,
    presetDescription: args.scenario.presetDescription,
    activeLabel: args.activeLabel,
    resultLabel: args.resultLabel,
    decisionLabel: args.decisionLabel,
    computation: args.computation,
    insights: [
      { label: 'Unique chars', value: String(args.charFreqs.length), tone: 'info' },
      { label: 'Heap size', value: String(args.heapItems.length), tone: 'accent' },
      { label: 'Codes assigned', value: String(args.codeTable.length), tone: 'success' },
      {
        label: 'Savings',
        value:
          args.totalOriginalBits > 0
            ? `${((1 - args.totalCompressedBits / args.totalOriginalBits) * 100).toFixed(0)}%`
            : '—',
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
      description: `Count frequency: '${ch}' appears ${freq} time${freq !== 1 ? 's' : ''} in "${source}".`,
      phase: fi === 0 ? 'init' : 'compare',
      string: makeState({
        scenario,
        phaseLabel: 'Count frequencies',
        activeLabel: `'${ch}' = ${freq}`,
        resultLabel: `${fi + 1} of ${sortedFreqs.length} chars counted`,
        decisionLabel: 'Characters that appear more frequently will get shorter codes.',
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
          label: 'Character frequency',
          expression: `freq['${ch}'] = count('${ch}', "${source}")`,
          result: String(freq),
          note: 'Higher frequency → shorter prefix code → fewer bits per occurrence.',
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
    description: `Build initial min-heap from ${sortedFreqs.length} leaf nodes, one per unique character.`,
    phase: 'pass-complete',
    string: makeState({
      scenario,
      phaseLabel: 'Build heap',
      activeLabel: `${sortedFreqs.length} leaf nodes`,
      resultLabel: 'Ready to merge',
      decisionLabel: 'The min-heap always gives us the two lowest-frequency nodes to merge first.',
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
        label: 'Initial heap',
        expression: `heap = [${sortedFreqs.map(([ch, f]) => `'${ch}'(${f})`).join(', ')}]`,
        result: `size = ${sortedFreqs.length}`,
        note: 'Each leaf will become the bottom layer of the Huffman tree.',
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
      description: `Merge step ${mi + 1}: pop minimum '${leftNode.char ?? '∅'}' (${leftNode.freq}) and '${rightNode.char ?? '∅'}' (${rightNode.freq}).`,
      phase: 'compare',
      string: makeState({
        scenario,
        phaseLabel: 'Pop minimums',
        activeLabel: `L=${leftNode.freq}, R=${rightNode.freq}`,
        resultLabel: `New node freq = ${step.newFreq}`,
        decisionLabel: 'Always merge the two nodes with the smallest frequencies first.',
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
          label: 'Pop two minimums',
          expression: `L=${leftNode.freq}, R=${rightNode.freq}`,
          result: `new node freq = ${leftNode.freq} + ${rightNode.freq} = ${step.newFreq}`,
          note: 'The merged node frequency is the sum of its two children.',
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
      description: `Created internal node with freq=${step.newFreq}. Heap now has ${currentHeapIds.length} node${currentHeapIds.length !== 1 ? 's' : ''}.`,
      phase: 'pass-complete',
      string: makeState({
        scenario,
        phaseLabel: 'Merge nodes',
        activeLabel: `new node freq=${step.newFreq}`,
        resultLabel: `Heap size = ${currentHeapIds.length}`,
        decisionLabel:
          currentHeapIds.length === 1
            ? 'Only one node left — this is the Huffman tree root!'
            : 'Push the merged node back into the heap for the next round.',
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
          label: 'New internal node',
          expression: `merge(${leftNode.freq}, ${rightNode.freq})`,
          result: `freq = ${step.newFreq}`,
          note: `Left child gets '0', right child gets '1' in the code prefix.`,
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
      description: `Assign code '${entry.code}' (${entry.code.length} bits) to '${entry.char}' (freq=${entry.freq}).`,
      phase: isLast ? 'complete' : 'compare',
      string: makeState({
        scenario,
        phaseLabel: 'Assign codes',
        activeLabel: `'${entry.char}' → '${entry.code}'`,
        resultLabel: isLast ? `${totalCompressedBits} compressed bits` : `${ci + 1} of ${fullCodeTable.length} codes`,
        decisionLabel: `Trace the path from root to leaf '${entry.char}': left = '0', right = '1'.`,
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
          label: 'Prefix code',
          expression: `code['${entry.char}'] = root-to-leaf path`,
          result: `'${entry.code}' (${entry.code.length} bit${entry.code.length !== 1 ? 's' : ''})`,
          note: isLast
            ? `Total: ${totalOriginalBits} → ${totalCompressedBits} bits (${((1 - totalCompressedBits / totalOriginalBits) * 100).toFixed(0)}% savings).`
            : `freq=${entry.freq} × ${entry.code.length} bits = ${entry.freq * entry.code.length} bits for this symbol.`,
        },
      }),
    });
  }
}
