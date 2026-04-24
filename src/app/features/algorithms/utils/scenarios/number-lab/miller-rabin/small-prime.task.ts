import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import {
  MILLER_RABIN_TASK_INPUT_SCHEMA,
  MillerRabinTask,
} from './miller-rabin-task';

/** 29 is prime — an easy sanity run. Single witness `a = 2` is enough
 *  to demonstrate the square chain and the "x = n-1 → pass" branch
 *  without getting lost in arithmetic. Good first contact with the
 *  algorithm. */
export const MILLER_RABIN_SMALL_PRIME_TASK: MillerRabinTask = {
  id: 'small-prime',
  name: t('features.algorithms.tasks.millerRabin.smallPrime.title'),
  summary: t('features.algorithms.tasks.millerRabin.smallPrime.summary'),
  instruction: t('features.algorithms.tasks.millerRabin.smallPrime.instruction'),
  hints: [
    t('features.algorithms.tasks.millerRabin.smallPrime.hints.0'),
    t('features.algorithms.tasks.millerRabin.smallPrime.hints.1'),
  ],
  difficulty: 'easy',
  defaultValues: { n: 29, witnesses: '2' },
  inputSchema: MILLER_RABIN_TASK_INPUT_SCHEMA,
  codeSnippetId: null,
};
