import { describe, expect, it } from 'vitest';

import {
  describeGraphPath,
  getAlgorithmViewConfig,
  humanizeLabel,
  INSPECTOR_COLLAPSED_KEY,
  INSPECTOR_LAYOUT_KEY,
} from './algorithm-detail-config';
import { ALGORITHM_CATALOG } from '../../data/catalog/catalog';
import type { GraphStepState } from '../../models/graph';

function makeGraphTrace(
  nodes: GraphStepState['nodes'],
): GraphStepState {
  return {
    nodes,
    edges: [],
    sourceId: nodes[0]?.id ?? 'source',
    phaseLabel: 'Phase',
    metricLabel: 'Metric',
    secondaryLabel: 'Secondary',
    frontierLabel: 'Frontier',
    frontierHeadLabel: 'Frontier head',
    completionLabel: 'Completion',
    frontierStatusLabel: 'Frontier status',
    completionStatusLabel: 'Completion status',
    showEdgeWeights: true,
    detailLabel: 'Detail',
    detailValue: 'Value',
    visitOrderLabel: 'Visit order',
    currentNodeId: null,
    activeEdgeId: null,
    queue: [],
    visitOrder: [],
    traceRows: [],
    computation: null,
  };
}

describe('algorithm-detail-config', () => {
  it('exposes stable inspector storage keys and humanizes dashed labels', () => {
    expect(INSPECTOR_COLLAPSED_KEY).toBe('ohno:algorithm-detail:inspector-collapsed');
    expect(INSPECTOR_LAYOUT_KEY).toBe('ohno:algorithm-detail:inspector-layout');
    expect(humanizeLabel('min-cost-max-flow')).toBe('Min Cost Max Flow');
  });

  it('returns dedicated configs for known algorithms and bubble fallback for unknown ids', () => {
    const radix = getAlgorithmViewConfig('radix-sort');
    const fallback = getAlgorithmViewConfig('totally-unknown');

    expect(radix.kind).toBe('array');
    expect(radix.defaultVariant).toBe('radix');
    expect(radix.sizeOptions).toContain(radix.defaultSize);

    expect(fallback.kind).toBe('array');
    expect(fallback.defaultVariant).toBe('bar');
    expect(fallback.sizeOptions).toContain(fallback.defaultSize);
  });

  it('builds usable configs for every implemented catalog item', () => {
    const implementedItems = ALGORITHM_CATALOG.filter((item) => item.implemented);

    expect(implementedItems.length).toBeGreaterThan(0);

    for (const item of implementedItems) {
      const config = getAlgorithmViewConfig(item.id);

      expect(config.codeLines.length).toBeGreaterThan(0);
      expect(config.variantOptions.length).toBeGreaterThan(0);
      expect(config.sizeOptions).toContain(config.defaultSize);
      if (config.codeVariants) {
        expect(Object.keys(config.codeVariants).length).toBeGreaterThan(0);
      }
    }
  });

  it('describes graph paths from previous-node chains and stops on cycles', () => {
    const trace = makeGraphTrace([
      {
        id: 'a',
        label: 'A',
        x: 0,
        y: 0,
        distance: 0,
        previousId: null,
        secondaryText: null,
        isSource: true,
        isCurrent: false,
        isSettled: true,
        isFrontier: false,
      },
      {
        id: 'b',
        label: 'B',
        x: 1,
        y: 0,
        distance: 4,
        previousId: 'a',
        secondaryText: null,
        isSource: false,
        isCurrent: false,
        isSettled: false,
        isFrontier: true,
      },
      {
        id: 'c',
        label: 'C',
        x: 2,
        y: 0,
        distance: 9,
        previousId: 'b',
        secondaryText: null,
        isSource: false,
        isCurrent: true,
        isSettled: false,
        isFrontier: true,
      },
    ]);
    const cyclicTrace = makeGraphTrace([
      {
        id: 'a',
        label: 'A',
        x: 0,
        y: 0,
        distance: 0,
        previousId: 'b',
        secondaryText: null,
        isSource: true,
        isCurrent: false,
        isSettled: true,
        isFrontier: false,
      },
      {
        id: 'b',
        label: 'B',
        x: 1,
        y: 0,
        distance: 1,
        previousId: 'a',
        secondaryText: null,
        isSource: false,
        isCurrent: true,
        isSettled: false,
        isFrontier: true,
      },
    ]);

    expect(describeGraphPath(trace, 'c')).toBe('A → B → C');
    expect(describeGraphPath(cyclicTrace, 'a')).toBe('A → B → A');
  });
});
