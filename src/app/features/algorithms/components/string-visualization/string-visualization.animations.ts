import {
  BurrowsWheelerTraceState,
  HuffmanTraceState,
  KmpTraceState,
  ManacherTraceState,
  RabinKarpTraceState,
  RleTraceState,
  ZAlgorithmTraceState,
} from '../../models/string';
import { SortStep } from '../../models/sort-step';
import { createMotionProfile, pulseElement } from '../../utils/visualization-motion';

export function animateStringStepEffects(
  container: HTMLElement,
  speed: number,
  previousStep: SortStep | null,
  step: SortStep,
): void {
  const current = step.string;
  const previous = previousStep?.string ?? null;
  if (!current) {
    return;
  }

  const motion = createMotionProfile(speed);

  if (current.mode === 'kmp') {
    if (
      current.compareTextIndex !== (previous as KmpTraceState | null)?.compareTextIndex ||
      current.comparePatternIndex !== (previous as KmpTraceState | null)?.comparePatternIndex
    ) {
      pulseBySelector(container, `[data-kmp-text="${current.compareTextIndex}"]`, motion.compareMs, 1.02);
      pulseBySelector(container, `[data-kmp-pattern="${current.comparePatternIndex}"]`, motion.compareMs, 1.02);
    }
    if ((previous as KmpTraceState | null)?.fallbackTo !== current.fallbackTo && current.fallbackTo !== null) {
      pulseBySelector(container, '.string-jump', motion.swapMs, 1.015);
    }
    return;
  }

  if (current.mode === 'rabin-karp') {
    if ((previous as RabinKarpTraceState | null)?.windowStart !== current.windowStart) {
      pulseBySelector(container, '.hash-card--window', motion.swapMs, 1.02);
    }
    if (current.collision && !(previous as RabinKarpTraceState | null)?.collision) {
      pulseBySelector(container, '.hash-card--alert', motion.settleMs, 1.025);
    }
    return;
  }

  if (current.mode === 'z-algorithm') {
    if ((previous as ZAlgorithmTraceState | null)?.activeIndex !== current.activeIndex && current.activeIndex !== null) {
      pulseBySelector(container, `[data-z-bar="${current.activeIndex}"]`, motion.compareMs, 1.03);
    }
    return;
  }

  if (current.mode === 'manacher') {
    if ((previous as ManacherTraceState | null)?.currentCenter !== current.currentCenter && current.currentCenter !== null) {
      pulseBySelector(container, `[data-manacher-char="${current.currentCenter}"]`, motion.compareMs, 1.03);
    }
    return;
  }

  if (current.mode === 'burrows-wheeler-transform') {
    const previousOutput = (previous as BurrowsWheelerTraceState | null)?.output ?? '';
    if (previousOutput !== current.output && current.output) {
      pulseBySelector(container, '.bwt-summary__value--output', motion.settleMs, 1.025);
    }
    if (
      (previous as BurrowsWheelerTraceState | null)?.activeRows.join('|') !== current.activeRows.join('|') &&
      current.activeRows.length > 0
    ) {
      pulseBySelector(container, `[data-bwt-row="${current.activeRows[0]}"]`, motion.compareMs, 1.01);
    }
    return;
  }

  if (current.mode === 'rle') {
    if ((previous as RleTraceState | null)?.scanIndex !== current.scanIndex && current.scanIndex !== null) {
      const cells = container.querySelectorAll<HTMLElement>('.string-stage--rle .str-cell');
      const cell = cells.item(current.scanIndex);
      if (cell) {
        pulseElement(cell, { duration: motion.compareMs, scale: 1.03 });
      }
    }
    if ((previous as RleTraceState | null)?.completedRuns.length !== current.completedRuns.length) {
      pulseBySelector(container, '.rle-chip--done:last-child', motion.settleMs, 1.04);
    }
    return;
  }

  if (current.mode === 'huffman') {
    if ((previous as HuffmanTraceState | null)?.visibleNodeIds.length !== current.visibleNodeIds.length) {
      pulseBySelector(container, '.huff-tree-wrap', motion.settleMs, 1.01);
    }
    if ((previous as HuffmanTraceState | null)?.codeTable.length !== current.codeTable.length) {
      pulseBySelector(container, '.huff-code-row:last-child', motion.settleMs, 1.03);
    }
  }
}

function pulseBySelector(
  container: HTMLElement,
  selector: string,
  duration: number,
  scale: number,
): void {
  const element = container.querySelector<HTMLElement>(selector);
  if (element) {
    pulseElement(element, { duration, scale });
  }
}
