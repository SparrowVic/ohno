import { describe, expect, it } from 'vitest';

import { NumberLabRegister } from '../../models/number-lab';
import { i18nText } from '../../../../core/i18n/translatable-text';
import { isNotebookNumber, notebookMathMode, notebookSpacedTex, notebookRegisters, notebookValueSize } from './notebook-registers.utils';

function register(id: string, value: string, tone: NumberLabRegister['tone']): NumberLabRegister {
  return { id, label: id, value, hint: null, tone };
}

describe('notebook registers', () => {
  it('maps register tones onto the notebook palette', () => {
    const views = notebookRegisters([
      register('a', '60', 'default'),
      register('i', '5', 'active'),
      register('gcd', '12', 'settled'),
      register('n', '37', 'muted'),
    ]);
    expect(views.map((view) => view.tone)).toEqual(['idle', 'cyan', 'lime', 'dim']);
  });

  it('keeps Doto for numbers and mono for words, lists and pairs', () => {
    expect(isNotebookNumber('8051')).toBe(true);
    expect(isNotebookNumber('-3')).toBe(true);
    expect(isNotebookNumber('0.4')).toBe(true);
    expect(isNotebookNumber('[E]')).toBe(false);
    expect(isNotebookNumber('zastąp')).toBe(false);
    expect(isNotebookNumber('(2, 3)')).toBe(false);
  });

  it('dims empty registers and shows a dash', () => {
    const [view] = notebookRegisters([register('s', '', 'active')]);
    expect(view).toMatchObject({ value: '—', numeric: false, tone: 'dim' });
  });

  it('shrinks long values in steps', () => {
    expect(notebookValueSize('105')).toBe('lg');
    expect(notebookValueSize('1234567')).toBe('md');
    expect(notebookValueSize('12345678901')).toBe('sm');
  });

  it('renders TeX-marked labels as math and leaves the rest to auto detection', () => {
    expect(notebookMathMode('x_1')).toBe('math');
    expect(notebookMathMode('(a_1, n_1)')).toBe('math');
    expect(notebookMathMode('37 \\text{jest pierwsza dla bazy} 2')).toBe('math');
    expect(notebookMathMode('F(5)')).toBe('auto');
    expect(notebookMathMode('target n')).toBe('auto');
    expect(notebookMathMode(i18nText('features.algorithms.display.numberLab.result'))).toBe('auto');
  });

  it('keeps the spaces around TeX text runs that math mode would swallow', () => {
    expect(notebookSpacedTex('37 \\text{jest pierwsza dla bazy} 2')).toBe('37\\;\\text{jest pierwsza dla bazy}\\;2');
    expect(notebookSpacedTex('F(10) = 55')).toBe('F(10) = 55');
  });
});
