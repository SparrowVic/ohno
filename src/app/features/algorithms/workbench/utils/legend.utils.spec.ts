import { describe, expect, it } from 'vitest';

import { legendLabelKey, legendLedColor } from './legend.utils';

describe('legendLedColor', () => {
  it('maps the viz state tokens to the LED colours', () => {
    expect(legendLedColor('var(--viz-state-default)')).toBe('slate');
    expect(legendLedColor('var(--viz-state-compare)')).toBe('cyan');
    expect(legendLedColor('rgb(var(--viz-state-swap-rgb) / 0.9)')).toBe('pink');
    expect(legendLedColor('var(--viz-state-sorted)')).toBe('lime');
  });

  it('maps the family colours and falls back to slate', () => {
    expect(legendLedColor('var(--violet)')).toBe('violet');
    expect(legendLedColor('rgb(var(--amber-rgb) / 0.8)')).toBe('amber');
    expect(legendLedColor('var(--red)')).toBe('red');
    expect(legendLedColor('#ff00ff')).toBe('slate');
  });
});

describe('legendLabelKey', () => {
  it('passes through labels that already are i18n keys', () => {
    expect(legendLabelKey('features.algorithms.workbench.legend.unsorted')).toBe(
      'features.algorithms.workbench.legend.unsorted',
    );
    expect(legendLabelKey('features.algorithms.display.legend.source')).toBe(
      'features.algorithms.display.legend.source',
    );
  });

  it('returns null for labels without a key', () => {
    expect(legendLabelKey('Current node')).toBeNull();
    expect(legendLabelKey('Side 0')).toBeNull();
  });
});
