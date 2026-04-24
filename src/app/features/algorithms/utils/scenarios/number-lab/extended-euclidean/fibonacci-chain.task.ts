import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import {
  EXTENDED_EUCLIDEAN_TASK_INPUT_SCHEMA,
  ExtendedEuclideanTask,
} from './extended-euclidean-task';

/** Consecutive Fibonacci numbers maximise forward chain length, which
 *  means maximum back-substitution depth in Extended Euclidean. The
 *  Bézout coefficients themselves turn out to be Fibonacci numbers —
 *  an elegant number-theoretic cameo that the chalkboard view makes
 *  immediately obvious once you annotate the sequence. */
export const EXTENDED_EUCLIDEAN_FIBONACCI_CHAIN_TASK: ExtendedEuclideanTask = {
  id: 'fibonacci-chain',
  name: t('features.algorithms.tasks.extendedEuclidean.fibonacciChain.title'),
  summary: t('features.algorithms.tasks.extendedEuclidean.fibonacciChain.summary'),
  instruction: t('features.algorithms.tasks.extendedEuclidean.fibonacciChain.instruction'),
  hints: [
    t('features.algorithms.tasks.extendedEuclidean.fibonacciChain.hints.0'),
    t('features.algorithms.tasks.extendedEuclidean.fibonacciChain.hints.1'),
    t('features.algorithms.tasks.extendedEuclidean.fibonacciChain.hints.2'),
  ],
  difficulty: 'hard',
  defaultValues: { a: 89, b: 55 },
  inputSchema: EXTENDED_EUCLIDEAN_TASK_INPUT_SCHEMA,
  codeSnippetId: null,
};
