import { TranslatableText } from '../../../core/i18n/translatable-text';

export interface StringPresetOption {
  readonly id: string;
  readonly label: string;
  readonly description: string;
}

export interface StringInsight {
  readonly label: TranslatableText;
  readonly value: TranslatableText;
  readonly tone: 'info' | 'accent' | 'success' | 'warning';
}

export interface StringComputation {
  readonly label: TranslatableText;
  readonly expression: TranslatableText;
  readonly result: TranslatableText | null;
  readonly note: TranslatableText;
}

interface StringTraceBase {
  readonly modeLabel: TranslatableText;
  readonly phaseLabel: TranslatableText;
  readonly presetLabel: TranslatableText;
  readonly presetDescription: TranslatableText;
  readonly activeLabel: TranslatableText;
  readonly resultLabel: TranslatableText;
  readonly decisionLabel: TranslatableText;
  readonly insights: readonly StringInsight[];
  readonly computation: StringComputation | null;
}

export interface KmpTraceState extends StringTraceBase {
  readonly mode: 'kmp';
  readonly stage: 'failure' | 'scan' | 'done';
  readonly text: string;
  readonly pattern: string;
  readonly failure: readonly number[];
  readonly failureReadyIndex: number;
  readonly alignment: number;
  readonly textIndex: number | null;
  readonly patternIndex: number | null;
  readonly compareTextIndex: number | null;
  readonly comparePatternIndex: number | null;
  readonly fallbackFrom: number | null;
  readonly fallbackTo: number | null;
  readonly matches: readonly number[];
}

export interface RabinKarpTraceState extends StringTraceBase {
  readonly mode: 'rabin-karp';
  readonly text: string;
  readonly pattern: string;
  readonly windowStart: number;
  readonly windowLength: number;
  readonly patternHash: number;
  readonly windowHash: number;
  readonly base: number;
  readonly mod: number;
  readonly highestPower: number;
  readonly verifying: boolean;
  readonly verificationIndex: number | null;
  readonly collision: boolean;
  readonly matches: readonly number[];
  readonly outgoingChar: string | null;
  readonly incomingChar: string | null;
}

export interface ZAlgorithmTraceState extends StringTraceBase {
  readonly mode: 'z-algorithm';
  readonly combined: string;
  readonly patternLength: number;
  readonly zValues: readonly number[];
  readonly activeIndex: number | null;
  readonly boxLeft: number | null;
  readonly boxRight: number | null;
  readonly comparePrefixIndex: number | null;
  readonly compareMatchIndex: number | null;
  readonly matches: readonly number[];
}

export interface ManacherTraceState extends StringTraceBase {
  readonly mode: 'manacher';
  readonly source: string;
  readonly transformed: string;
  readonly radii: readonly number[];
  readonly currentCenter: number | null;
  readonly mirrorIndex: number | null;
  readonly leftBoundary: number | null;
  readonly rightBoundary: number | null;
  readonly activeRadius: number;
  readonly compareLeft: number | null;
  readonly compareRight: number | null;
  readonly longestCenter: number | null;
  readonly longestRadius: number;
  readonly longestPalindrome: string;
}

export interface StringRotationRow {
  readonly id: string;
  readonly startIndex: number;
  readonly text: string;
  readonly tone: 'pending' | 'active' | 'compare' | 'sorted' | 'output';
}

export interface StringRunGroup {
  readonly id: string;
  readonly char: string;
  readonly count: number;
  readonly tone: 'input' | 'output';
}

export interface BurrowsWheelerTraceState extends StringTraceBase {
  readonly mode: 'burrows-wheeler-transform';
  readonly source: string;
  readonly rotations: readonly StringRotationRow[];
  readonly activeRows: readonly string[];
  readonly firstColumn: string;
  readonly lastColumn: string;
  readonly output: string;
  readonly runGroups: readonly StringRunGroup[];
  readonly compressionRatio: number | null;
}

// --- RLE ---
export interface RleRun {
  readonly id: string;
  readonly char: string;
  readonly count: number;
}

export interface RleTraceState extends StringTraceBase {
  readonly mode: 'rle';
  readonly source: string;
  readonly scanIndex: number | null;
  readonly groupStart: number;
  readonly groupChar: string;
  readonly groupCount: number;
  readonly completedRuns: readonly RleRun[];
  readonly output: string;
  readonly phase: 'scan' | 'extend' | 'emit' | 'complete';
  readonly compressionRatio: number | null;
}

// --- Huffman ---
export interface HuffmanFreq {
  readonly char: string;
  readonly freq: number;
  readonly isActive: boolean;
}

export interface HuffmanHeapItem {
  readonly id: string;
  readonly char: string | null;
  readonly freq: number;
  readonly role: 'left' | 'right' | 'new' | null;
}

export interface HuffmanTreeNode {
  readonly id: string;
  readonly char: string | null;
  readonly freq: number;
  readonly code: string;
  readonly leftId: string | null;
  readonly rightId: string | null;
  readonly x: number;
  readonly y: number;
  readonly tone: 'leaf' | 'internal' | 'left' | 'right' | 'new' | 'root';
}

export interface HuffmanEdge {
  readonly fromId: string;
  readonly toId: string;
  readonly label: '0' | '1';
}

export interface HuffmanCodeEntry {
  readonly char: string;
  readonly freq: number;
  readonly code: string;
}

export interface HuffmanTraceState extends StringTraceBase {
  readonly mode: 'huffman';
  readonly source: string;
  readonly phase: 'freq' | 'heap' | 'merge' | 'codes';
  readonly charFreqs: readonly HuffmanFreq[];
  readonly heapItems: readonly HuffmanHeapItem[];
  readonly visibleNodeIds: readonly string[];
  readonly allNodes: readonly HuffmanTreeNode[];
  readonly visibleEdgeIds: readonly string[];
  readonly allEdges: readonly HuffmanEdge[];
  readonly codeTable: readonly HuffmanCodeEntry[];
  readonly totalOriginalBits: number;
  readonly totalCompressedBits: number;
}

export type StringTraceState =
  | KmpTraceState
  | RabinKarpTraceState
  | ZAlgorithmTraceState
  | ManacherTraceState
  | BurrowsWheelerTraceState
  | RleTraceState
  | HuffmanTraceState;

export function isKmpState(
  state: StringTraceState | null | undefined,
): state is KmpTraceState {
  return state?.mode === 'kmp';
}

export function isRabinKarpState(
  state: StringTraceState | null | undefined,
): state is RabinKarpTraceState {
  return state?.mode === 'rabin-karp';
}

export function isZAlgorithmState(
  state: StringTraceState | null | undefined,
): state is ZAlgorithmTraceState {
  return state?.mode === 'z-algorithm';
}

export function isManacherState(
  state: StringTraceState | null | undefined,
): state is ManacherTraceState {
  return state?.mode === 'manacher';
}

export function isBurrowsWheelerState(
  state: StringTraceState | null | undefined,
): state is BurrowsWheelerTraceState {
  return state?.mode === 'burrows-wheeler-transform';
}

export function isRleState(
  state: StringTraceState | null | undefined,
): state is RleTraceState {
  return state?.mode === 'rle';
}

export function isHuffmanState(
  state: StringTraceState | null | undefined,
): state is HuffmanTraceState {
  return state?.mode === 'huffman';
}
