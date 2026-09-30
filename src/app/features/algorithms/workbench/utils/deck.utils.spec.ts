import { describe, expect, it } from 'vitest';

import { TaskInputSchema } from '../../models/task';
import { hasCustomFields, showSizeSection } from './deck.utils';

describe('hasCustomFields', () => {
  it('is true for int, float and string fields', () => {
    const schema: TaskInputSchema<Record<string, unknown>> = {
      a: { kind: 'int', label: 'a' },
      text: { kind: 'string', label: 'text' },
    };
    expect(hasCustomFields(schema)).toBe(true);
  });

  it('is false without a schema or with only unsupported fields', () => {
    expect(hasCustomFields(null)).toBe(false);
    expect(hasCustomFields({})).toBe(false);
    expect(hasCustomFields({ notes: { kind: 'textarea', label: 'notes' } })).toBe(false);
  });
});

describe('showSizeSection', () => {
  it('shows the size window only with several sizes and no tasks', () => {
    expect(showSizeSection([16, 32, 64], [])).toBe(true);
    expect(showSizeSection([16], [])).toBe(false);
    expect(showSizeSection([1], [{ id: 'gcd', label: 'Znany gcd' }])).toBe(false);
    expect(showSizeSection([6, 8], [{ id: 'gcd', label: 'Znany gcd' }])).toBe(false);
  });
});
