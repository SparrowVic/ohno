import { CodeLine } from '../models/detail';

export const EULER_PATH_CIRCUIT_CODE: readonly CodeLine[] = [
  { number: 1, tokens: [{ kind: 'kw', text: 'function' }, { kind: 'text', text: ' ' }, { kind: 'fn', text: 'hierholzer' }, { kind: 'text', text: '(graph) {' }] },
  { number: 2, tokens: [{ kind: 'text', text: '  choose an odd-degree start node if it exists, otherwise any node;' }] },
  { number: 3, tokens: [{ kind: 'text', text: '  push start onto a stack;' }] },
  { number: 4, tokens: [{ kind: 'kw', text: '  while' }, { kind: 'text', text: ' (stack is not empty) {' }] },
  { number: 5, tokens: [{ kind: 'text', text: '    if the top node still has an unused incident edge, pick one;' }] },
  { number: 6, tokens: [{ kind: 'text', text: '    mark that edge used and push the neighbor onto the stack;' }] },
  { number: 7, tokens: [{ kind: 'kw', text: '    else' }, { kind: 'text', text: ' pop the top node into the final trail;' }] },
  { number: 8, tokens: [{ kind: 'text', text: '  }' }] },
  { number: 9, tokens: [{ kind: 'kw', text: '  return' }, { kind: 'text', text: ' the reversed trail as the Euler path / circuit;' }] },
  { number: 10, tokens: [{ kind: 'text', text: '}' }] },
];
