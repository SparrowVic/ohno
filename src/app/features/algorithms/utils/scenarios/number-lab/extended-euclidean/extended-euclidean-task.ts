import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import { NotebookTask } from '../../../../models/notebook-task';
import { TaskInputSchema } from '../../../../models/task';

/** Input pair for Extended Euclidean. Same shape as the plain GCD —
 *  the algorithm reuses the division chain, then folds coefficients
 *  backwards to produce (s, t) such that `s·a + t·b = gcd(a, b)`. */
export interface ExtendedEuclideanTaskValues {
  readonly a: number;
  readonly b: number;
  readonly n?: number;
  readonly target?: number;
  readonly rhs?: number;
}

export type ExtendedEuclideanNotebookFlow =
  | {
      readonly kind: 'bezout';
    }
  | {
      /** RSA-style inverse: values mean phi(n) = a and public exponent e = b. */
      readonly kind: 'rsa-inverse';
      readonly n: number;
    }
  | {
      /** Linear Diophantine equation a*x + b*y = target. */
      readonly kind: 'linear-diophantine';
      readonly target: number;
      readonly minimize?: boolean;
    }
  | {
      /** Modular equation b*x = rhs (mod a). */
      readonly kind: 'modular-equation';
      readonly rhs: number;
    };

export interface ExtendedEuclideanTask extends NotebookTask<ExtendedEuclideanTaskValues> {
  readonly notebookFlow?: ExtendedEuclideanNotebookFlow;
}

/** Shared schema for every Extended Euclidean task — same two-integer
 *  editable popover regardless of which pair the task highlights. */
export const EXTENDED_EUCLIDEAN_TASK_INPUT_SCHEMA: TaskInputSchema<ExtendedEuclideanTaskValues> = {
  a: { kind: 'int', label: t('features.algorithms.tasks.gcd.values.a'), min: 1 },
  b: { kind: 'int', label: t('features.algorithms.tasks.gcd.values.b'), min: 1 },
};

export const EXTENDED_EUCLIDEAN_RSA_INPUT_SCHEMA: TaskInputSchema<ExtendedEuclideanTaskValues> = {
  n: {
    kind: 'int',
    label: t('features.algorithms.tasks.extendedEuclidean.values.n'),
    min: 1,
  },
  a: {
    kind: 'int',
    label: t('features.algorithms.tasks.extendedEuclidean.values.phi'),
    min: 1,
  },
  b: {
    kind: 'int',
    label: t('features.algorithms.tasks.extendedEuclidean.values.publicExponent'),
    min: 1,
  },
};

export const EXTENDED_EUCLIDEAN_DIOPHANTINE_INPUT_SCHEMA: TaskInputSchema<ExtendedEuclideanTaskValues> =
  {
    a: { kind: 'int', label: t('features.algorithms.tasks.gcd.values.a'), min: 1 },
    b: { kind: 'int', label: t('features.algorithms.tasks.gcd.values.b'), min: 1 },
    target: {
      kind: 'int',
      label: t('features.algorithms.tasks.extendedEuclidean.values.target'),
    },
  };

export const EXTENDED_EUCLIDEAN_MODULAR_EQUATION_INPUT_SCHEMA: TaskInputSchema<ExtendedEuclideanTaskValues> =
  {
    a: {
      kind: 'int',
      label: t('features.algorithms.tasks.extendedEuclidean.values.modulus'),
      min: 1,
    },
    b: {
      kind: 'int',
      label: t('features.algorithms.tasks.extendedEuclidean.values.coefficient'),
      min: 1,
    },
    rhs: {
      kind: 'int',
      label: t('features.algorithms.tasks.extendedEuclidean.values.rhs'),
    },
  };

/** Snippet id shared by Extended Euclidean tasks whose code walkthrough
 *  is already authored. Variant tasks without a written walkthrough
 *  (new entries in this migration) use `null` instead, and the Code
 *  tab renders an editorial "coming soon" placeholder. */
export const EXTENDED_EUCLIDEAN_CODE_SNIPPET_ID = 'extended-euclidean';
