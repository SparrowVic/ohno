import { TranslatableText, isI18nText } from '../../../../core/i18n/translatable-text';
import { MathRenderMode } from '../../../../shared/components/math-text/math-text.utils';
import { NumberLabRegister } from '../../models/number-lab';

export type NotebookRegisterTone = 'cyan' | 'lime' | 'dim' | 'idle';

export type NotebookValueSize = 'lg' | 'md' | 'sm';

export interface NotebookRegisterView {
  readonly id: string;
  readonly label: TranslatableText;
  readonly labelMode: MathRenderMode;
  readonly value: string;
  readonly numeric: boolean;
  readonly size: NotebookValueSize;
  readonly tone: NotebookRegisterTone;
  readonly hint: TranslatableText | null;
}

const REGISTER_TONES: Readonly<Record<NumberLabRegister['tone'], NotebookRegisterTone>> = {
  active: 'cyan',
  settled: 'lime',
  muted: 'dim',
  default: 'idle',
};

const NUMERIC_VALUE = /^[-−]?\d[\d\s.,]*$/;

const TEX_MARKUP = /\\[A-Za-z]+|[_^]/;

const EMPTY_VALUES: ReadonlySet<string> = new Set(['', '—', '-', '–', '·']);

export function isNotebookNumber(value: string): boolean {
  return NUMERIC_VALUE.test(value.trim());
}

export function notebookMathMode(text: TranslatableText): MathRenderMode {
  return !isI18nText(text) && TEX_MARKUP.test(text) ? 'math' : 'auto';
}

export function notebookSpacedTex(text: string): string {
  return text.replace(/\s*\\text\{([^}]*)\}\s*/g, (_, words: string) => `\\;\\text{${words.trim()}}\\;`).trim();
}

export function notebookValueSize(value: string): NotebookValueSize {
  const length = value.trim().length;
  if (length <= 5) return 'lg';
  if (length <= 9) return 'md';
  return 'sm';
}

export function notebookRegisters(registers: readonly NumberLabRegister[]): readonly NotebookRegisterView[] {
  return registers.map((register) => {
    const value = register.value.trim();
    const empty = EMPTY_VALUES.has(value);
    return {
      id: register.id,
      label: register.label,
      labelMode: notebookMathMode(register.label),
      value: empty ? '—' : value,
      numeric: !empty && isNotebookNumber(value),
      size: notebookValueSize(value),
      tone: empty ? 'dim' : REGISTER_TONES[register.tone],
      hint: register.hint,
    };
  });
}
