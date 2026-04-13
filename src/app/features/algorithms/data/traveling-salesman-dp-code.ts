import { CodeLine } from '../models/detail';

export const TRAVELING_SALESMAN_DP_CODE: readonly CodeLine[] = [
  { number: 1, tokens: [{ kind: 'kw', text: 'function' }, { kind: 'text', text: ' ' }, { kind: 'fn', text: 'heldKarp' }, { kind: 'text', text: '(dist, start) {' }] },
  { number: 2, tokens: [{ kind: 'text', text: '  seed dp[{start}][start] = 0;' }] },
  { number: 3, tokens: [{ kind: 'kw', text: '  for' }, { kind: 'text', text: ' each subset mask containing start {' }] },
  { number: 4, tokens: [{ kind: 'kw', text: '    for' }, { kind: 'text', text: ' each end city inside that subset {' }] },
  { number: 5, tokens: [{ kind: 'kw', text: '      for' }, { kind: 'text', text: ' each next city outside the subset {' }] },
  { number: 6, tokens: [{ kind: 'text', text: '        relax dp[mask ∪ {next}][next] using dp[mask][end] + dist[end][next];' }] },
  { number: 7, tokens: [{ kind: 'text', text: '      }' }] },
  { number: 8, tokens: [{ kind: 'text', text: '  compare all full-mask end cities plus the return edge to start;' }] },
  { number: 9, tokens: [{ kind: 'text', text: '  pick the cheapest closing city;' }] },
  { number: 10, tokens: [{ kind: 'text', text: '  backtrack parent pointers across subset masks;' }] },
  { number: 11, tokens: [{ kind: 'kw', text: '  return' }, { kind: 'text', text: ' optimal Hamiltonian tour and its cost;' }] },
];
