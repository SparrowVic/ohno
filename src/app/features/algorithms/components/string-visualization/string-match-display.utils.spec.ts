import { describe, expect, it } from 'vitest';

import { I18N_KEY } from '../../../../core/i18n/i18n-keys';
import { I18nText } from '../../../../core/i18n/translatable-text';
import { kmpPatternMatchingGenerator } from '../../algorithms/kmp-pattern-matching/kmp-pattern-matching';
import { rabinKarpGenerator } from '../../algorithms/rabin-karp/rabin-karp';
import { zAlgorithmGenerator } from '../../algorithms/z-algorithm/z-algorithm';
import { SortStep } from '../../models/sort-step';
import { KmpTraceState, RabinKarpTraceState, ZAlgorithmTraceState } from '../../models/string';
import {
  createKmpScenario,
  createRabinKarpScenario,
  createZAlgorithmScenario,
} from '../../utils/scenarios/string/string-scenarios';
import { kmpTruth } from './string-truth.utils';
import { kmpDisplay, kmpFallbackChain, kmpFallbackNote, rabinKarpDisplay, zAlgorithmDisplay } from './string-match-display.utils';

const STRING = I18N_KEY.features.algorithms.display.string;

function kmpRun(): SortStep[] {
  const base = createKmpScenario(20, 'default');
  return [...kmpPatternMatchingGenerator({ ...base, text: 'ABABDABACDABABCABAB', pattern: 'ABABCABAB' })];
}

const kmp = (step: SortStep | undefined) => step?.string as KmpTraceState;

describe('kmp display', () => {
  const steps = kmpRun();

  it('aligns the pattern tape under the text at i − j and puts the head on the compare column', () => {
    const index = steps.findIndex((step) => kmp(step).stage === 'scan' && kmp(step).compareTextIndex === 14 && kmp(step).comparePatternIndex === 4);
    expect(index).toBeGreaterThan(0);
    const view = kmpDisplay(kmp(steps[index]), null);
    const pattern = view.rows.find((row) => row.id === 'pattern')!;
    expect(pattern.cells[0]?.column).toBe(10);
    const head = view.markers.find((marker) => marker.variant === 'head')!;
    expect([head.fromRow, head.toRow, head.fromColumn, head.tone]).toEqual(['text', 'pattern', 14, 'cyan']);
    const text = view.rows.find((row) => row.id === 'text')!;
    expect(text.cells.slice(10, 14).every((cell) => cell.tone === 'lime')).toBe(true);
    expect(view.facts.find((fact) => fact.id === 'prefix')?.value).toBe('4');
    expect(view.facts.find((fact) => fact.id === 'lps')?.value).toBe('2');
  });

  it('marks a mismatch pink', () => {
    const step = steps.find((entry) => {
      const state = kmp(entry);
      return state.stage === 'scan' && state.compareTextIndex !== null && state.comparePatternIndex !== null && state.fallbackFrom === null
        && state.text[state.compareTextIndex] !== state.pattern[state.comparePatternIndex];
    });
    const view = kmpDisplay(kmp(step), null);
    expect(view.markers.find((marker) => marker.variant === 'head')?.tone).toBe('pink');
  });

  it('predicts the first match while none is found', () => {
    const view = kmpDisplay(kmpTruth(kmp(steps[0])), null);
    const rack = view.racks[0]!;
    expect(rack.rows).toEqual([]);
    expect((rack.empty[1] as I18nText).params).toEqual({ index: 18 });
  });

  it('collects the latest fallback chain at one text index', () => {
    const last = steps.findLastIndex((step) => kmp(step).stage === 'scan' && kmp(step).fallbackFrom !== null && kmp(step).fallbackFrom !== kmp(step).pattern.length);
    const chain = kmpFallbackChain(steps, last + 1)!;
    expect(chain.stage).toBe('scan');
    expect(chain.links.length).toBeGreaterThan(0);
    const state = kmp(steps[last]);
    expect(chain.links.at(-1)).toEqual({ from: state.fallbackFrom, to: state.fallbackTo });
    const note = kmpFallbackNote(chain)!;
    expect(note.tone).toBe('pink');
    expect((note.lines[0] as I18nText).key).toBe(STRING.fallback.mismatch);
    expect(note.lines.length).toBe(chain.links.length + 1);
  });

  it('chains consecutive fallbacks at the same text index', () => {
    const text = 'AABAAAB';
    const base = createKmpScenario(14, 'default');
    const run = [...kmpPatternMatchingGenerator({ ...base, text, pattern: 'AABAAB' })];
    const jumps = run
      .map((step, index) => ({ state: kmp(step), index }))
      .filter(({ state }) => state.stage === 'scan' && state.fallbackFrom !== null && state.fallbackFrom !== state.pattern.length);
    const byText = new Map<number, number>();
    for (const { state } of jumps) byText.set(state.textIndex!, (byText.get(state.textIndex!) ?? 0) + 1);
    const repeated = [...byText.entries()].find(([, count]) => count > 1);
    expect(repeated).toBeDefined();
    const lastAtIndex = jumps.filter(({ state }) => state.textIndex === repeated![0]).at(-1)!;
    expect(kmpFallbackChain(run, lastAtIndex.index)!.links.length).toBe(repeated![1]);
  });

  it('returns no chain before any fallback', () => {
    expect(kmpFallbackChain(steps, 0)).toBeNull();
  });
});

describe('rabin-karp display', () => {
  const steps = [...rabinKarpGenerator(createRabinKarpScenario(20, 'default'))];
  const states = steps.map((step) => step.string as RabinKarpTraceState);

  it('brackets the window across text and pattern', () => {
    const state = states.find((entry) => entry.windowStart > 0)!;
    const view = rabinKarpDisplay(state);
    const window = view.markers.find((marker) => marker.id === 'window')!;
    expect([window.fromColumn, window.toColumn]).toEqual([state.windowStart, state.windowStart + state.windowLength - 1]);
    expect(view.rows[1]?.cells[0]?.column).toBe(state.windowStart);
  });

  it('shows the hash rack and lists matches', () => {
    const last = states.at(-1)!;
    const view = rabinKarpDisplay(last);
    expect(view.racks.map((rack) => rack.id)).toEqual(['hash', 'matches']);
    expect(view.racks[1]?.rows.length).toBe(last.matches.length);
  });
});

describe('z-algorithm display', () => {
  const steps = [...zAlgorithmGenerator(createZAlgorithmScenario(20, 'default'))];
  const states = steps.map((step) => step.string as ZAlgorithmTraceState);

  it('aligns the prefix tape at the active index and heads the compare column', () => {
    const state = states.find((entry) => entry.compareMatchIndex !== null && entry.activeIndex !== null)!;
    const view = zAlgorithmDisplay(state);
    expect(view.rows.find((row) => row.id === 'prefix')?.cells[0]?.column).toBe(state.activeIndex);
    expect(view.markers.find((marker) => marker.variant === 'head')?.fromColumn).toBe(state.compareMatchIndex);
  });

  it('draws the z-box as a violet band', () => {
    const state = states.find((entry) => entry.boxLeft !== null && entry.boxRight !== null && entry.boxRight >= entry.boxLeft)!;
    const band = zAlgorithmDisplay(state).markers.find((marker) => marker.id === 'zbox')!;
    expect([band.tone, band.fromColumn, band.toColumn]).toEqual(['violet', state.boxLeft, state.boxRight]);
  });
});
