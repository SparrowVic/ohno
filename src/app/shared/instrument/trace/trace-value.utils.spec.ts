import { describe, expect, it } from 'vitest';

import { i18nText } from '../../../core/i18n/translatable-text';
import { isNumericTraceValue, isTraceChipList, resolveTraceValueKind, toTraceValue, traceValueText } from './trace-value.utils';

describe('isNumericTraceValue', () => {
  it('accepts numbers, ratios and infinity', () => {
    expect(isNumericTraceValue(12)).toBe(true);
    expect(isNumericTraceValue(Infinity)).toBe(true);
    expect(isNumericTraceValue('3 / 8')).toBe(true);
    expect(isNumericTraceValue('-4.5')).toBe(true);
    expect(isNumericTraceValue('∞')).toBe(true);
    expect(isNumericTraceValue('12:30')).toBe(true);
  });

  it('rejects words, brackets, lists and empty values', () => {
    expect(isNumericTraceValue('A → B')).toBe(false);
    expect(isNumericTraceValue('[0, 3]')).toBe(false);
    expect(isNumericTraceValue('1 2 3')).toBe(false);
    expect(isNumericTraceValue('')).toBe(false);
    expect(isNumericTraceValue(null)).toBe(false);
    expect(isNumericTraceValue(NaN)).toBe(false);
  });
});

describe('resolveTraceValueKind', () => {
  it('detects empties and translatable values first', () => {
    expect(resolveTraceValueKind(null)).toBe('empty');
    expect(resolveTraceValueKind('')).toBe('empty');
    expect(resolveTraceValueKind(i18nText('a.b'))).toBe('i18n');
    expect(resolveTraceValueKind(i18nText('a.b'), 'math')).toBe('math');
    expect(resolveTraceValueKind(i18nText('a.b'), 'mono')).toBe('mono');
    expect(resolveTraceValueKind(i18nText('a.b'), 'text')).toBe('i18n');
  });

  it('resolves auto to number or mono', () => {
    expect(resolveTraceValueKind(7)).toBe('number');
    expect(resolveTraceValueKind('x = 3')).toBe('mono');
  });

  it('keeps an explicit kind', () => {
    expect(resolveTraceValueKind('7', 'mono')).toBe('mono');
    expect(resolveTraceValueKind('Krok', 'text')).toBe('text');
  });
});

describe('traceValueText', () => {
  it('prints placeholders, infinities and plain values', () => {
    expect(traceValueText(undefined)).toBe('—');
    expect(traceValueText(Infinity)).toBe('∞');
    expect(traceValueText(-Infinity)).toBe('−∞');
    expect(traceValueText(2.5)).toBe('2.5');
    expect(traceValueText('B')).toBe('B');
  });
});

describe('isTraceChipList', () => {
  it('distinguishes chip arrays from scalar cells', () => {
    expect(isTraceChipList([{ id: 1, label: 'a' }])).toBe(true);
    expect(isTraceChipList('a')).toBe(false);
    expect(isTraceChipList(null)).toBe(false);
  });
});

describe('toTraceValue', () => {
  it('wraps key-shaped strings so they get translated', () => {
    expect(toTraceValue('features.algorithms.x')).toEqual({ key: 'features.algorithms.x', params: undefined });
  });

  it('passes plain text, objects and empties through', () => {
    expect(toTraceValue('Merge')).toBe('Merge');
    const text = i18nText('a.b', { n: 1 });
    expect(toTraceValue(text)).toBe(text);
    expect(toTraceValue(null)).toBeNull();
  });
});
