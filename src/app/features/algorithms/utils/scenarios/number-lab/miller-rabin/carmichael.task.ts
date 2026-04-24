import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import {
  MILLER_RABIN_TASK_INPUT_SCHEMA,
  MillerRabinTask,
} from './miller-rabin-task';

/** 561 = 3·11·17 is the smallest Carmichael number — every Fermat
 *  witness fails to reveal its compositeness. Miller-Rabin, with the
 *  stronger square-root check, succeeds where the naive Fermat test
 *  would return "probably prime". A textbook example of the exact
 *  edge case Miller-Rabin was designed to solve. */
export const MILLER_RABIN_CARMICHAEL_TASK: MillerRabinTask = {
  id: 'carmichael',
  name: t('features.algorithms.tasks.millerRabin.carmichael.title'),
  summary: t('features.algorithms.tasks.millerRabin.carmichael.summary'),
  instruction: t('features.algorithms.tasks.millerRabin.carmichael.instruction'),
  hints: [
    t('features.algorithms.tasks.millerRabin.carmichael.hints.0'),
    t('features.algorithms.tasks.millerRabin.carmichael.hints.1'),
  ],
  difficulty: 'hard',
  defaultValues: { n: 561, witnesses: '2, 3' },
  inputSchema: MILLER_RABIN_TASK_INPUT_SCHEMA,
  codeSnippetId: null,
};
