import type { TranslatableText } from '../../../../../../core/i18n/translatable-text';
import type { NotebookTask } from '../../../../models/notebook-task';
import type { TaskInputSchema } from '../../../../models/task';

/** One entry in a CRT system: `x = residue (mod modulus)`. */
export interface CrtCongruence {
  readonly residue: number;
  readonly modulus: number;
}

export interface CrtTaskValues {
  readonly a1: number;
  readonly m1: number;
  readonly a2: number;
  readonly m2: number;
  readonly a3: number;
  readonly m3: number;
  readonly a4?: number;
  readonly m4?: number;
}

export type CrtNotebookFlow =
  | { readonly kind: 'direct' }
  | { readonly kind: 'progressive-merge' }
  | { readonly kind: 'non-coprime-compatible' }
  | { readonly kind: 'non-coprime-trap' }
  | { readonly kind: 'garner-mixed-radix' };

export interface CrtTask extends NotebookTask<CrtTaskValues> {
  readonly notebookFlow: CrtNotebookFlow;
}

const RESIDUE_MIN = 0;
const MODULUS_MIN = 2;

const A1_FIELD = { kind: 'int' as const, label: 'a1', min: RESIDUE_MIN };
const M1_FIELD = { kind: 'int' as const, label: 'm1', min: MODULUS_MIN };
const A2_FIELD = { kind: 'int' as const, label: 'a2', min: RESIDUE_MIN };
const M2_FIELD = { kind: 'int' as const, label: 'm2', min: MODULUS_MIN };
const A3_FIELD = { kind: 'int' as const, label: 'a3', min: RESIDUE_MIN };
const M3_FIELD = { kind: 'int' as const, label: 'm3', min: MODULUS_MIN };
const A4_FIELD = { kind: 'int' as const, label: 'a4', min: RESIDUE_MIN };
const M4_FIELD = { kind: 'int' as const, label: 'm4', min: MODULUS_MIN };

export const CRT_THREE_CONGRUENCE_INPUT_SCHEMA: TaskInputSchema<CrtTaskValues> = {
  a1: A1_FIELD,
  m1: M1_FIELD,
  a2: A2_FIELD,
  m2: M2_FIELD,
  a3: A3_FIELD,
  m3: M3_FIELD,
};

export const CRT_FOUR_CONGRUENCE_INPUT_SCHEMA: TaskInputSchema<CrtTaskValues> = {
  ...CRT_THREE_CONGRUENCE_INPUT_SCHEMA,
  a4: A4_FIELD,
  m4: M4_FIELD,
};

export function parseCongruences(values: CrtTaskValues): readonly CrtCongruence[] {
  const congruences = [
    { residue: values.a1, modulus: values.m1 },
    { residue: values.a2, modulus: values.m2 },
    { residue: values.a3, modulus: values.m3 },
  ];

  if (values.a4 !== undefined && values.m4 !== undefined) {
    congruences.push({ residue: values.a4, modulus: values.m4 });
  }

  return congruences.map(({ residue, modulus }) => ({
    residue: normalizeModulo(residue, modulus),
    modulus,
  }));
}

export function validatePairwiseCoprime(values: CrtTaskValues): TranslatableText | null {
  const congruences = parseCongruences(values);
  for (let i = 0; i < congruences.length; i++) {
    for (let j = i + 1; j < congruences.length; j++) {
      const left = congruences[i].modulus;
      const right = congruences[j].modulus;
      if (gcd(left, right) !== 1) {
        return 'Moduly w tym zadaniu musza byc parami wzglednie pierwsze.';
      }
    }
  }
  return null;
}

function normalizeModulo(value: number, modulus: number): number {
  return ((value % modulus) + modulus) % modulus;
}

function gcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) {
    [x, y] = [y, x % y];
  }
  return x;
}
