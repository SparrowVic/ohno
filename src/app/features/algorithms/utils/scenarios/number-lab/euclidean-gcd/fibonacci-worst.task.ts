import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import { GCD_TASK_INPUT_SCHEMA, GcdTask } from './euclidean-gcd-task';

/** Worst-case pair for the Euclidean algorithm: two consecutive
 *  Fibonacci numbers. Every division yields the next Fibonacci number
 *  as its remainder, maxing out the iteration count for the input
 *  size. This is the canonical witness for the `O(log_φ max(a, b))`
 *  bound — Lamé's theorem. */
export const GCD_FIBONACCI_WORST_TASK: GcdTask = {
  id: 'fibonacci-worst',
  name: t('features.algorithms.tasks.gcd.fibonacciWorst.title'),
  summary: t('features.algorithms.tasks.gcd.fibonacciWorst.summary'),
  instruction: t('features.algorithms.tasks.gcd.fibonacciWorst.instruction'),
  hints: [
    t('features.algorithms.tasks.gcd.fibonacciWorst.hints.0'),
    t('features.algorithms.tasks.gcd.fibonacciWorst.hints.1'),
    t('features.algorithms.tasks.gcd.fibonacciWorst.hints.2'),
  ],
  difficulty: 'hard',
  defaultValues: { a: 89, b: 55 },
  inputSchema: GCD_TASK_INPUT_SCHEMA,
  codeSnippetId: null,
};
