import { NumberLabFormula, NumberLabFormulaPart, NumberLabHistoryEntry } from '../../models/number-lab';
import { MathRenderMode } from '../../../../shared/components/math-text/math-text.utils';
import { isNotebookNumber, notebookMathMode } from '../notebook-register-rack/notebook-registers.utils';

export type NumberLabPartTone = 'idle' | 'dim' | 'lime' | 'cyan';

export interface NumberLabPartView {
  readonly text: string;
  readonly tone: NumberLabPartTone;
}

export interface NumberLabFormulaView {
  readonly lhs: readonly NumberLabPartView[];
  readonly rhs: readonly NumberLabPartView[];
}

export interface NumberLabHistoryCell {
  readonly id: string;
  readonly label: string;
  readonly labelMode: MathRenderMode;
  readonly value: string;
  readonly numeric: boolean;
  readonly current: boolean;
}

const PART_TONES: Readonly<Record<NumberLabFormulaPart['role'], NumberLabPartTone>> = {
  operand: 'idle',
  operator: 'dim',
  result: 'lime',
  active: 'cyan',
};

const toPart = (part: NumberLabFormulaPart): NumberLabPartView => ({ text: part.text, tone: PART_TONES[part.role] });

export function numberLabFormula(formula: NumberLabFormula | null): NumberLabFormulaView | null {
  if (!formula || (formula.lhs.length === 0 && formula.rhs.length === 0)) return null;
  return { lhs: formula.lhs.map(toPart), rhs: formula.rhs.map(toPart) };
}

export function numberLabHistory(history: readonly NumberLabHistoryEntry[]): readonly NumberLabHistoryCell[] {
  const lastCurrent = history.map((entry) => entry.isCurrent).lastIndexOf(true);
  return history.map((entry, index) => ({
    id: entry.id,
    label: entry.label,
    labelMode: notebookMathMode(entry.label),
    value: entry.value,
    numeric: isNotebookNumber(entry.value),
    current: index === lastCurrent,
  }));
}

export function numberLabCellWidth(cells: readonly NumberLabHistoryCell[]): number {
  const longest = cells.reduce((width, cell) => Math.max(width, cell.value.length, cell.label.length * 0.8), 1);
  return Math.round(Math.min(132, Math.max(44, 16 + longest * 12)));
}
