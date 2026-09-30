import { describe, expect, it } from 'vitest';

import { TaskInputSchema } from '../../models/task';
import { collectCustomValues, parseFieldText, seedFieldText, validateFieldValue } from './custom-values.utils';

const schema: TaskInputSchema<Record<string, unknown>> = {
  a: { kind: 'int', label: 'a', min: 1, max: 1000, nonZero: true },
  ratio: { kind: 'float', label: 'ratio', min: 0, max: 1 },
  witnesses: { kind: 'string', label: 'witnesses', pattern: /^\d+(,\d+)*$/ },
};

describe('seedFieldText', () => {
  it('prints numbers and strings, and blanks anything else', () => {
    expect(seedFieldText(schema['a']!, 735)).toBe('735');
    expect(seedFieldText(schema['witnesses']!, '2,3')).toBe('2,3');
    expect(seedFieldText(schema['a']!, undefined)).toBe('');
    expect(seedFieldText(schema['a']!, Number.NaN)).toBe('');
  });
});

describe('parseFieldText', () => {
  it('parses integers strictly and floats with a comma or a dot', () => {
    expect(parseFieldText(schema['a']!, ' 42 ')).toBe(42);
    expect(parseFieldText(schema['a']!, '4.2')).toBeNull();
    expect(parseFieldText(schema['ratio']!, '0,25')).toBe(0.25);
    expect(parseFieldText(schema['ratio']!, 'x')).toBeNull();
    expect(parseFieldText(schema['witnesses']!, '2,3')).toBe('2,3');
  });
});

describe('validateFieldValue', () => {
  it('reports range, zero and pattern errors', () => {
    expect(validateFieldValue(schema['a']!, 0)).toBe('features.algorithms.toolbar.customizeValues.belowMinimumLabel');
    expect(validateFieldValue(schema['a']!, 1001)).toBe('features.algorithms.toolbar.customizeValues.aboveMaximumLabel');
    expect(validateFieldValue(schema['a']!, null)).toBe('features.algorithms.toolbar.customizeValues.notAnIntegerLabel');
    expect(validateFieldValue(schema['ratio']!, 0.5)).toBeNull();
    expect(validateFieldValue(schema['witnesses']!, '2;3')).toBe('features.algorithms.toolbar.customizeValues.notAnIntegerLabel');
    expect(validateFieldValue({ kind: 'textarea', label: 'x' }, 'x')).toBe('features.algorithms.toolbar.customizeValues.fieldTypeUnsupportedLabel');
  });
});

describe('collectCustomValues', () => {
  it('returns typed values when every field is valid, otherwise null', () => {
    expect(collectCustomValues(schema, { a: '735', ratio: '0.5', witnesses: '2,3' })).toEqual({ a: 735, ratio: 0.5, witnesses: '2,3' });
    expect(collectCustomValues(schema, { a: '735', ratio: '', witnesses: '2,3' })).toBeNull();
  });
});
