import { CodeLine } from '../models/detail';

export const MIN_COST_MAX_FLOW_CODE: readonly CodeLine[] = [
  { number: 1, tokens: [{ kind: 'kw', text: 'function' }, { kind: 'text', text: ' ' }, { kind: 'fn', text: 'minCostMaxFlow' }, { kind: 'text', text: '(network, source, sink) {' }] },
  { number: 2, tokens: [{ kind: 'text', text: '  flow = 0 and totalCost = 0;' }] },
  { number: 3, tokens: [{ kind: 'kw', text: '  while' }, { kind: 'text', text: ' (a residual source-to-sink path still exists) {' }] },
  { number: 4, tokens: [{ kind: 'text', text: '    relax residual edges by cumulative transport cost;' }] },
  { number: 5, tokens: [{ kind: 'text', text: '    store the cheapest predecessor edge for every reachable node;' }] },
  { number: 6, tokens: [{ kind: 'text', text: '    reconstruct the cheapest augmenting path to sink;' }] },
  { number: 7, tokens: [{ kind: 'text', text: '    push the bottleneck flow and add pathCost × bottleneck to totalCost;' }] },
  { number: 8, tokens: [{ kind: 'text', text: '  }' }] },
  { number: 9, tokens: [{ kind: 'kw', text: '  return' }, { kind: 'text', text: ' (maxFlow, minCost);' }] },
  { number: 10, tokens: [{ kind: 'text', text: '}' }] },
];
