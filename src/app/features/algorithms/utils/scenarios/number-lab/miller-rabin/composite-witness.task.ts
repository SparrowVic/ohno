import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import {
  MILLER_RABIN_TASK_INPUT_SCHEMA,
  MillerRabinTask,
} from './miller-rabin-task';

/** 25 = 5² is composite but small enough to inspect by hand. Witness
 *  `a = 2` fails the square-chain condition (chain 8, 14, 21 never
 *  hits `n - 1 = 24` nor `1`), proving compositeness in a few
 *  arithmetic steps. Note that `a = 7` is a strong liar for 25 and
 *  would pass — the choice of witness matters. */
export const MILLER_RABIN_COMPOSITE_WITNESS_TASK: MillerRabinTask = {
  id: 'composite-witness',
  name: t('features.algorithms.tasks.millerRabin.compositeWitness.title'),
  summary: t('features.algorithms.tasks.millerRabin.compositeWitness.summary'),
  instruction: t('features.algorithms.tasks.millerRabin.compositeWitness.instruction'),
  hints: [t('features.algorithms.tasks.millerRabin.compositeWitness.hints.0')],
  difficulty: 'medium',
  defaultValues: { n: 25, witnesses: '2' },
  inputSchema: MILLER_RABIN_TASK_INPUT_SCHEMA,
  codeSnippetId: null,
};
