import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import { legendLedColor } from '../../workbench/utils/legend.utils';
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

const TABLE_FAMILY_IDS = [
  'knapsack-01',
  'longest-common-subsequence',
  'edit-distance',
  'matrix-chain-multiplication',
  'coin-change',
  'subset-sum',
  'longest-palindromic-subsequence',
  'burst-balloons',
  'wildcard-matching',
  'longest-increasing-subsequence',
  'climbing-stairs',
  'fibonacci-dp',
  'regex-matching-dp',
  'traveling-salesman-dp',
  'sos-dp',
  'profile-dp',
  'dp-on-trees',
  'dp-with-bitmask',
  'dp-convex-hull-trick',
  'divide-conquer-dp-optimization',
  'knuth-dp-optimization',
  'floyd-warshall',
  'hungarian-algorithm',
  'flood-fill',
  'a-star-pathfinding',
  'sieve-of-eratosthenes',
];

const LEGEND_KEY_PREFIX = 'features.algorithms.display.legend.';
const TOKEN_COLOR = /^var\(--(cyan|pink|lime|amber|red|violet|slate)\)$/;

const loadLegendLabels = (lang: string) =>
  (
    JSON.parse(readFileSync(resolve(process.cwd(), `public/i18n/${lang}.json`), 'utf8')) as {
      features: { algorithms: { display: { legend: Record<string, string> } } };
    }
  ).features.algorithms.display.legend;

const legendOf = (id: string) => {
  const config = getAlgorithmViewConfig(id);
  return config.legendItems(config.defaultVariant);
};

describe('table family legends', () => {
  const labels = { pl: loadLegendLabels('pl'), en: loadLegendLabels('en') };

  it.each(TABLE_FAMILY_IDS)('%s lists translated, token-coloured, distinct entries', (id) => {
    const items = legendOf(id);

    expect(items.length).toBeGreaterThan(0);
    expect(new Set(items.map((item) => item.label)).size).toBe(items.length);
    for (const item of items) {
      expect(item.label.startsWith(LEGEND_KEY_PREFIX), item.label).toBe(true);
      const key = item.label.slice(LEGEND_KEY_PREFIX.length);
      expect(labels.pl[key], `pl ${key}`).toBeTruthy();
      expect(labels.en[key], `en ${key}`).toBeTruthy();
      expect(item.color, item.label).toMatch(TOKEN_COLOR);
    }
  });

  it('follows the image 09 set for knapsack', () => {
    expect(legendOf('knapsack-01').map((item) => [item.label.slice(LEGEND_KEY_PREFIX.length), legendLedColor(item.color)])).toEqual([
      ['base', 'slate'],
      ['currentCell', 'cyan'],
      ['candidates', 'pink'],
      ['computed', 'slate'],
      ['doesNotFit', 'red'],
      ['resultPath', 'lime'],
    ]);
  });

  it('gives the sieve its own legend', () => {
    expect(legendOf('sieve-of-eratosthenes').map((item) => legendLedColor(item.color))).toEqual([
      'cyan',
      'violet',
      'pink',
      'slate',
      'lime',
    ]);
  });
});

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

      expect(config.variantOptions.length).toBeGreaterThan(0);
      expect(config.sizeOptions).toContain(config.defaultSize);

      // An algorithm without a code walkthrough is valid when all its
      // tasks explicitly opt out (codeSnippetId === null) — the Code
      // tab then renders the "snippet in progress" placeholder. Any
      // algorithm that does ship a snippet must populate codeLines.
      const tasks = (config as { tasks?: readonly { codeSnippetId: string | null }[] }).tasks;
      const allTasksSnippetless =
        Array.isArray(tasks) && tasks.length > 0 && tasks.every((t) => t.codeSnippetId === null);

      if (allTasksSnippetless) {
        expect(config.codeLines.length).toBe(0);
      } else {
        expect(config.codeLines.length).toBeGreaterThan(0);
        if (config.codeVariants) {
          expect(Object.keys(config.codeVariants).length).toBeGreaterThan(0);
        }
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
