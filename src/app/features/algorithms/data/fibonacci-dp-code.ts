import { CodeLine } from '../models/detail';

export const FIBONACCI_DP_CODE: readonly CodeLine[] = [
  { number: 1, tokens: [{ kind: 'kw', text: 'function' }, { kind: 'text', text: ' ' }, { kind: 'fn', text: 'fibonacciTab' }, { kind: 'text', text: '(n) {' }] },
  { number: 2, tokens: [{ kind: 'text', text: '  set fib[0] = 0 and fib[1] = 1;' }] },
  { number: 3, tokens: [{ kind: 'kw', text: '  for' }, { kind: 'text', text: ' i from 2..n {' }] },
  { number: 4, tokens: [{ kind: 'text', text: '    inspect fib[i-1] and fib[i-2];' }] },
  { number: 5, tokens: [{ kind: 'text', text: '    fib[i] = fib[i-1] + fib[i-2];' }] },
  { number: 6, tokens: [{ kind: 'kw', text: '  return' }, { kind: 'text', text: ' fib[n];' }] },
];
