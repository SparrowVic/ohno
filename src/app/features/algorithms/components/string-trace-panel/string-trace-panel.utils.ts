import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import { I18N_KEY, I18nKey } from '../../../../core/i18n/i18n-keys';
import { i18nText } from '../../../../core/i18n/translatable-text';
import { TraceChip, TraceFact, TraceTone, TraceValue } from '../../../../shared/instrument/trace/trace.types';
import { toTraceValue } from '../../../../shared/instrument/trace/trace-value.utils';
import {
  AhoCorasickTraceState,
  BurrowsWheelerTraceState,
  HuffmanTraceState,
  KmpTraceState,
  ManacherTraceState,
  PalindromicTreeTraceState,
  RabinKarpTraceState,
  RleTraceState,
  StringInsight,
  StringTraceState,
  SuffixArrayConstructionTraceState,
  SuffixArrayLcpTraceState,
  ZAlgorithmTraceState,
  isAhoCorasickState,
  isBurrowsWheelerState,
  isHuffmanState,
  isKmpState,
  isManacherState,
  isPalindromicTreeState,
  isRabinKarpState,
  isRleState,
  isSuffixArrayConstructionState,
  isSuffixArrayLcpState,
  isZAlgorithmState,
} from '../../models/string';

const KEYS = I18N_KEY.features.algorithms.tracePanels.string;
const COMMON = I18N_KEY.features.algorithms.tracePanels.common;

export interface StringTraceSection {
  readonly id: string;
  readonly title: I18nKey;
  readonly meta?: number | null;
  readonly facts?: readonly TraceFact[];
  readonly chips?: readonly TraceChip[];
  readonly emptyLabel?: I18nKey;
}

const INSIGHT_TONES: Readonly<Record<StringInsight['tone'], TraceTone>> = {
  info: 'cyan',
  accent: 'violet',
  success: 'lime',
  warning: 'amber',
};

const RLE_PHASES: Readonly<Record<RleTraceState['phase'], I18nKey>> = {
  scan: KEYS.rle.scanPhase,
  extend: KEYS.rle.extendPhase,
  emit: KEYS.rle.emitPhase,
  complete: KEYS.rle.completePhase,
};

const HUFFMAN_PHASE_KEYS: Readonly<Record<HuffmanTraceState['phase'], string>> = {
  freq: t('features.algorithms.runtime.string.huffmanCoding.phases.countFrequencies'),
  heap: t('features.algorithms.runtime.string.huffmanCoding.phases.buildHeap'),
  merge: t('features.algorithms.runtime.string.huffmanCoding.phases.mergeNodes'),
  codes: t('features.algorithms.runtime.string.huffmanCoding.phases.assignCodes'),
};

function fact(id: string, label: I18nKey, value: TraceValue, tone: TraceTone | null = null): TraceFact {
  return { id, label, value: value ?? null, kind: typeof value === 'number' ? 'auto' : 'mono', tone };
}

function indexedChips(values: readonly number[], isActive: (index: number) => boolean): readonly TraceChip[] {
  return values.map((value, index) => ({
    id: index,
    label: `${index}:${value}`,
    tone: isActive(index) ? 'cyan' : null,
    active: isActive(index),
  }));
}

function plainChips(values: readonly string[], tone: TraceTone | null = null): readonly TraceChip[] {
  return values.map((value, index) => ({ id: `${index}-${value}`, label: value, tone }));
}

export function formatStringRatio(value: number | null): string | null {
  return value === null ? null : `${value.toFixed(2)}x`;
}

export function formatPercent(value: number | null): string | null {
  return value === null ? null : `${(value * 100).toFixed(0)}%`;
}

export function stringSummaryFacts(state: StringTraceState): readonly TraceFact[] {
  return [
    { id: 'mode', label: KEYS.modeLabel, value: toTraceValue(state.modeLabel), kind: 'mono' },
    { id: 'preset', label: KEYS.presetLabel, value: toTraceValue(state.presetLabel), kind: 'mono', tone: 'violet' },
    { id: 'phase', label: KEYS.phaseLabel, value: toTraceValue(state.phaseLabel), kind: 'mono' },
    { id: 'active', label: KEYS.activeLabel, value: toTraceValue(state.activeLabel), kind: 'math', tone: 'cyan' },
    { id: 'result', label: KEYS.resultLabel, value: toTraceValue(state.resultLabel), kind: 'math', tone: 'lime' },
  ];
}

export function stringCalculationFacts(state: StringTraceState): readonly TraceFact[] {
  const computation = state.computation;
  return [
    { id: 'preset', label: KEYS.presetNoteLabel, value: toTraceValue(state.presetDescription), kind: 'math', wide: true },
    {
      id: 'expression',
      label: computation?.label || KEYS.currentTransitionLabel,
      value: toTraceValue(computation?.expression ?? KEYS.waitingEventLabel),
      kind: 'math',
      wide: true,
      tone: computation ? 'cyan' : null,
    },
    { id: 'result', label: COMMON.resultLabel, value: toTraceValue(computation?.result ?? null), kind: 'math', tone: 'lime' },
    { id: 'note', label: COMMON.watchLabel, value: toTraceValue(computation?.note ?? KEYS.noFormulaLabel), kind: 'math', wide: true },
    { id: 'decision', label: KEYS.decisionLabel, value: toTraceValue(state.decisionLabel), kind: 'text', wide: true },
  ];
}

export function stringInsightFacts(state: StringTraceState): readonly TraceFact[] {
  return state.insights.map((insight, index) => ({
    id: `insight-${index}`,
    label: insight.label,
    value: toTraceValue(insight.value),
    kind: 'math',
    tone: INSIGHT_TONES[insight.tone],
  }));
}

function kmpSections(kmp: KmpTraceState): readonly StringTraceSection[] {
  const jump = kmp.fallbackFrom !== null ? `${kmp.fallbackFrom} → ${kmp.fallbackTo}` : toTraceValue(KEYS.kmp.noJumpLabel);
  return [
    {
      id: 'failure',
      title: KEYS.kmp.failureTableLabel,
      meta: kmp.failure.length,
      chips: indexedChips(kmp.failure, (index) => index === kmp.patternIndex || index === kmp.comparePatternIndex),
    },
    {
      id: 'scan',
      title: KEYS.kmp.scanStateLabel,
      facts: [
        fact('alignment', KEYS.kmp.alignmentLabel, kmp.alignment),
        fact('text', KEYS.kmp.textIndexLabel, kmp.textIndex, 'cyan'),
        fact('pattern', KEYS.kmp.patternIndexLabel, kmp.patternIndex, 'cyan'),
        fact('jump', KEYS.kmp.jumpLabel, jump, kmp.fallbackFrom !== null ? 'amber' : null),
      ],
    },
  ];
}

function rabinSections(rabin: RabinKarpTraceState): readonly StringTraceSection[] {
  const status = rabin.collision
    ? KEYS.rabinKarp.collisionStatusLabel
    : rabin.verifying
      ? KEYS.rabinKarp.verifyStatusLabel
      : KEYS.rabinKarp.hashOnlyStatusLabel;
  return [
    {
      id: 'hashes',
      title: KEYS.rabinKarp.hashesLabel,
      facts: [
        fact('pattern', KEYS.rabinKarp.patternLabel, rabin.patternHash, 'violet'),
        fact('window', KEYS.rabinKarp.windowLabel, rabin.windowHash, rabin.windowHash === rabin.patternHash ? 'lime' : 'cyan'),
        fact('base', KEYS.rabinKarp.baseModLabel, `${rabin.base} / ${rabin.mod}`),
        fact('verify', KEYS.rabinKarp.verifyStepLabel, rabin.verificationIndex),
      ],
    },
    {
      id: 'window',
      title: KEYS.rabinKarp.rollingWindowLabel,
      facts: [
        fact('start', KEYS.rabinKarp.startLabel, rabin.windowStart),
        fact('out', KEYS.rabinKarp.outgoingLabel, rabin.outgoingChar),
        fact('in', KEYS.rabinKarp.incomingLabel, rabin.incomingChar),
        fact('status', KEYS.rabinKarp.statusLabel, toTraceValue(status), rabin.collision ? 'red' : rabin.verifying ? 'amber' : null),
      ],
    },
  ];
}

function zSections(z: ZAlgorithmTraceState): readonly StringTraceSection[] {
  return [
    {
      id: 'skyline',
      title: KEYS.zAlgorithm.skylineLabel,
      meta: z.zValues.length,
      chips: indexedChips(z.zValues, (index) => index === z.activeIndex),
    },
    {
      id: 'box',
      title: KEYS.zAlgorithm.boxLabel,
      facts: [
        fact('left', KEYS.zAlgorithm.leftLabel, z.boxLeft, 'amber'),
        fact('right', KEYS.zAlgorithm.rightLabel, z.boxRight, 'amber'),
        fact('prefix', KEYS.zAlgorithm.prefixCompareLabel, z.comparePrefixIndex, 'cyan'),
        fact('text', KEYS.zAlgorithm.textCompareLabel, z.compareMatchIndex, 'cyan'),
      ],
    },
  ];
}

function ahoSections(aho: AhoCorasickTraceState): readonly StringTraceSection[] {
  return [
    {
      id: 'automaton',
      title: KEYS.ahoCorasick.automatonLabel,
      facts: [
        fact('state', KEYS.ahoCorasick.currentStateLabel, aho.activeNodeId, 'cyan'),
        fact('char', KEYS.ahoCorasick.currentCharLabel, aho.currentChar),
        fact('failure', KEYS.ahoCorasick.failurePathLabel, aho.failurePath.length > 0 ? aho.failurePath.join(' → ') : null, 'amber'),
        fact('matches', KEYS.ahoCorasick.matchCountLabel, aho.matches.length, 'lime'),
      ],
    },
    {
      id: 'matches',
      title: KEYS.ahoCorasick.matchesLabel,
      meta: aho.matches.length,
      chips: plainChips(
        aho.matches.map((match) => `${match.pattern}@${match.startIndex}`),
        'lime',
      ),
      emptyLabel: COMMON.noneYetLabel,
    },
  ];
}

function manacherSections(manacher: ManacherTraceState): readonly StringTraceSection[] {
  return [
    {
      id: 'radii',
      title: KEYS.manacher.radiusArrayLabel,
      meta: manacher.radii.length,
      chips: indexedChips(manacher.radii, (index) => index === manacher.currentCenter || index === manacher.longestCenter),
    },
    {
      id: 'mirror',
      title: KEYS.manacher.mirrorWindowLabel,
      facts: [
        fact('center', KEYS.manacher.centerLabel, manacher.currentCenter, 'cyan'),
        fact('mirror', KEYS.manacher.mirrorLabel, manacher.mirrorIndex, 'violet'),
        fact('bounds', KEYS.manacher.boundsLabel, `${manacher.leftBoundary ?? '—'}..${manacher.rightBoundary ?? '—'}`, 'amber'),
        fact('longest', KEYS.manacher.longestLabel, manacher.longestPalindrome || null, 'lime'),
      ],
    },
  ];
}

function suffixArraySections(suffix: SuffixArrayConstructionTraceState): readonly StringTraceSection[] {
  return [
    {
      id: 'order',
      title: KEYS.suffixArray.orderLabel,
      facts: [
        fact('step', KEYS.suffixArray.stepSizeLabel, suffix.stepSize),
        fact('ranks', KEYS.suffixArray.distinctRanksLabel, suffix.distinctRanks, 'lime'),
        { ...fact('order', KEYS.suffixArray.orderLabel, suffix.suffixArray.join(', ')), wide: true },
      ],
    },
    {
      id: 'ranks',
      title: KEYS.suffixArray.ranksLabel,
      meta: suffix.rows.length,
      chips: suffix.rows.map((row) => {
        const active = suffix.activeSuffixes.includes(row.startIndex);
        return { id: row.id, label: `${row.startIndex}:r${row.rank}`, tone: active ? 'cyan' : null, active };
      }),
    },
  ];
}

function suffixLcpSections(lcp: SuffixArrayLcpTraceState): readonly StringTraceSection[] {
  const pair = lcp.activeSuffixes.length === 2 ? `${lcp.activeSuffixes[0]} / ${lcp.activeSuffixes[1]}` : null;
  return [
    {
      id: 'pair',
      title: KEYS.suffixArrayLcp.activePairLabel,
      facts: [
        fact('pair', KEYS.suffixArrayLcp.activePairLabel, pair, 'cyan'),
        fact('compare', KEYS.suffixArrayLcp.compareWithLabel, lcp.compareWith),
        fact('overlap', KEYS.suffixArrayLcp.overlapLabel, lcp.currentMatchLength, 'lime'),
      ],
    },
    {
      id: 'lcp',
      title: KEYS.suffixArrayLcp.lcpLabel,
      meta: lcp.rows.length,
      chips: plainChips(lcp.lcpValues.slice(0, Math.max(lcp.lcpValues.length - 1, 0)).map((value, index) => `${index}:${value}`)),
    },
  ];
}

function palindromicTreeSections(tree: PalindromicTreeTraceState): readonly StringTraceSection[] {
  return [
    {
      id: 'active',
      title: KEYS.palindromicTree.activeNodeLabel,
      facts: [
        fact('char', KEYS.palindromicTree.currentCharLabel, tree.currentChar),
        fact('node', KEYS.palindromicTree.activeNodeLabel, tree.activeNodeId, 'cyan'),
        fact('processed', KEYS.palindromicTree.processedLabel, tree.processedIndex + 1),
        fact('distinct', KEYS.palindromicTree.distinctLabel, tree.distinctCount, 'lime'),
      ],
    },
    {
      id: 'nodes',
      title: KEYS.palindromicTree.nodesLabel,
      meta: tree.nodes.length,
      chips: plainChips(tree.nodes.flatMap((node) => (typeof node.palindrome === 'string' ? [`${node.palindrome}(${node.occurrences})`] : []))),
    },
  ];
}

function bwtSections(bwt: BurrowsWheelerTraceState): readonly StringTraceSection[] {
  return [
    {
      id: 'columns',
      title: KEYS.burrowsWheeler.columnsLabel,
      facts: [
        { ...fact('input', KEYS.burrowsWheeler.inputLabel, bwt.source), wide: true },
        { ...fact('first', KEYS.burrowsWheeler.firstColumnLabel, bwt.firstColumn || null, 'violet'), wide: true },
        { ...fact('last', KEYS.burrowsWheeler.lastColumnLabel, bwt.lastColumn || null, 'lime'), wide: true },
        fact('gain', KEYS.burrowsWheeler.gainLabel, formatStringRatio(bwt.compressionRatio)),
      ],
    },
    {
      id: 'runs',
      title: KEYS.burrowsWheeler.outputRunsLabel,
      meta: bwt.runGroups.length,
      chips: plainChips(
        bwt.runGroups.map((group) => `${group.count}×${group.char}`),
        'lime',
      ),
      emptyLabel: KEYS.burrowsWheeler.noneYetLabel,
    },
  ];
}

function rleSections(rle: RleTraceState): readonly StringTraceSection[] {
  return [
    {
      id: 'scanner',
      title: KEYS.rle.scannerLabel,
      facts: [
        fact('position', KEYS.rle.positionLabel, rle.scanIndex, 'cyan'),
        fact('char', KEYS.rle.charLabel, `'${rle.groupChar || '—'}'`),
        fact('count', KEYS.rle.countLabel, rle.groupCount, 'pink'),
        fact('phase', KEYS.rle.phaseLabel, toTraceValue(RLE_PHASES[rle.phase])),
      ],
    },
    {
      id: 'result',
      title: KEYS.rle.resultLabel,
      meta: rle.completedRuns.length,
      facts: [
        fact('runs', KEYS.rle.runsDoneLabel, rle.completedRuns.length),
        { ...fact('output', KEYS.rle.outputLabel, rle.output || null, 'lime'), wide: true },
        fact('ratio', KEYS.rle.ratioLabel, formatPercent(rle.compressionRatio)),
        fact('original', KEYS.rle.originalLabel, i18nText(KEYS.rle.charsCount, { count: rle.source.length })),
      ],
    },
  ];
}

function huffmanSections(huffman: HuffmanTraceState): readonly StringTraceSection[] {
  const original = huffman.totalOriginalBits;
  const compressed = huffman.totalCompressedBits;
  const ratio = original > 0 ? compressed / original : null;
  return [
    {
      id: 'heap',
      title: KEYS.huffman.heapLabel,
      meta: huffman.heapItems.length,
      facts: [
        fact('size', KEYS.huffman.sizeLabel, huffman.heapItems.length),
        fact('phase', KEYS.huffman.phaseLabel, toTraceValue(HUFFMAN_PHASE_KEYS[huffman.phase])),
        fact('unique', KEYS.huffman.uniqueCharsLabel, huffman.charFreqs.length),
        fact('codes', KEYS.huffman.codesAssignedLabel, huffman.codeTable.length, 'lime'),
      ],
    },
    {
      id: 'compression',
      title: KEYS.huffman.compressionLabel,
      facts: [
        fact('original', KEYS.huffman.originalLabel, i18nText(KEYS.huffman.bitsCount, { count: original })),
        fact('compressed', KEYS.huffman.compressedLabel, i18nText(KEYS.huffman.bitsCount, { count: compressed }), 'lime'),
        fact('savings', KEYS.huffman.savingsLabel, ratio === null ? null : formatPercent(1 - ratio)),
        fact('ratio', KEYS.huffman.ratioLabel, formatStringRatio(ratio)),
      ],
    },
  ];
}

export function stringDetailSections(state: StringTraceState | null): readonly StringTraceSection[] {
  if (isKmpState(state)) return kmpSections(state);
  if (isRabinKarpState(state)) return rabinSections(state);
  if (isZAlgorithmState(state)) return zSections(state);
  if (isAhoCorasickState(state)) return ahoSections(state);
  if (isManacherState(state)) return manacherSections(state);
  if (isSuffixArrayConstructionState(state)) return suffixArraySections(state);
  if (isSuffixArrayLcpState(state)) return suffixLcpSections(state);
  if (isPalindromicTreeState(state)) return palindromicTreeSections(state);
  if (isBurrowsWheelerState(state)) return bwtSections(state);
  if (isRleState(state)) return rleSections(state);
  if (isHuffmanState(state)) return huffmanSections(state);
  return [];
}
