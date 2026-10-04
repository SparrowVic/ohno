import { describe, expect, it } from 'vitest';

import { I18N_KEY } from '../../../../core/i18n/i18n-keys';
import { i18nText } from '../../../../core/i18n/translatable-text';
import { NetworkEdgeSnapshot, NetworkNodeSnapshot } from '../../models/network';
import {
  estimateChipWidth,
  networkEdgeGeometry,
  networkEdgeText,
  networkEdgeTone,
  networkFocusEntry,
  networkLevelChip,
  networkLinkLabel,
  networkNodeTone,
  networkParentLabel,
  networkQueueEntry,
  networkViewBox,
  placeEdgeChips,
} from './network-display.utils';

const LABELS = I18N_KEY.features.algorithms.display.network.labels;

function node(partial: Partial<NetworkNodeSnapshot> & Pick<NetworkNodeSnapshot, 'id' | 'x' | 'y'>): NetworkNodeSnapshot {
  return {
    label: partial.id.toUpperCase(),
    lane: 'inner',
    level: null,
    linkLabel: null,
    status: 'idle',
    tags: [],
    ...partial,
  };
}

function edge(fromId: string, toId: string): NetworkEdgeSnapshot {
  return { id: `${fromId}-${toId}`, fromId, toId, directed: true, primaryText: '0/1', secondaryText: null, status: 'base' };
}

describe('network display tones', () => {
  it('maps node statuses onto the semantic palette', () => {
    expect(networkNodeTone('current')).toBe('cyan');
    expect(networkNodeTone('frontier')).toBe('amber');
    expect(networkNodeTone('linked')).toBe('lime');
    expect(networkNodeTone('visited')).toBe('lime');
    expect(networkNodeTone('source')).toBe('violet');
    expect(networkNodeTone('sink')).toBe('violet');
    expect(networkNodeTone('blocked')).toBe('red');
    expect(networkNodeTone('idle')).toBe('slate');
  });

  it('maps edge statuses onto the semantic palette', () => {
    expect(networkEdgeTone('base')).toBe('slate');
    expect(networkEdgeTone('candidate')).toBe('cyan');
    expect(networkEdgeTone('active')).toBe('pink');
    expect(networkEdgeTone('augment')).toBe('pink');
    expect(networkEdgeTone('matched')).toBe('lime');
    expect(networkEdgeTone('flow')).toBe('lime');
    expect(networkEdgeTone('saturated')).toBe('amber');
    expect(networkEdgeTone('blocked')).toBe('red');
  });
});

describe('network display labels', () => {
  it('translates node link labels and keeps symbols', () => {
    expect(networkLinkLabel(null)).toBeNull();
    expect(networkLinkLabel('goal')).toEqual(i18nText(LABELS.goal));
    expect(networkLinkLabel('carrying flow')).toEqual(i18nText(LABELS.carryingFlow));
    expect(networkLinkLabel('via A')).toBe('← A');
    expect(networkLinkLabel('out 2')).toEqual(i18nText(LABELS.out, { count: 2 }));
    expect(networkLinkLabel('↔ V1')).toBe('↔ V1');
  });

  it('translates edge words and keeps flow fractions', () => {
    expect(networkEdgeText('3/5')).toBe('3/5');
    expect(networkEdgeText('match')).toEqual(i18nText(LABELS.match));
    expect(networkEdgeText('free')).toEqual(i18nText(LABELS.freeEdge));
    expect(networkEdgeText('res 4')).toEqual(i18nText(LABELS.residual, { value: 4 }));
    expect(networkEdgeText('c 2 · r 1')).toEqual(i18nText(LABELS.costResidual, { cost: 2, residual: 1 }));
    expect(networkEdgeText('c -3 · r 0')).toEqual(i18nText(LABELS.costResidual, { cost: -3, residual: 0 }));
    expect(networkEdgeText('c 2 · r x')).toBe('c 2 · r x');
    expect(networkEdgeText(null)).toBeNull();
  });

  it('picks the level or cost chip by mode', () => {
    const chips = I18N_KEY.features.algorithms.display.network.chips;
    expect(networkLevelChip('dinic', null)).toBeNull();
    expect(networkLevelChip('dinic', 2)).toEqual(i18nText(chips.level, { value: 2 }));
    expect(networkLevelChip('min-cost-max-flow', 3)).toEqual(i18nText(chips.cost, { value: 3 }));
  });

  it('reads the parent out of a via label', () => {
    expect(networkParentLabel('via S')).toBe('S');
    expect(networkParentLabel('start')).toBeNull();
    expect(networkParentLabel(null)).toBeNull();
  });
});

describe('network rack entries', () => {
  it('splits flow items with and without spaces and an optional cost', () => {
    expect(networkFocusEntry('S → A 3/5')).toEqual({ lead: 'S', body: '→ A', value: '3/5' });
    expect(networkFocusEntry('S→A 3/4')).toEqual({ lead: 'S', body: '→ A', value: '3/4' });
    expect(networkFocusEntry('A → D 1/1 @ 2')).toEqual({
      lead: 'A',
      body: '→ D',
      value: '1/1',
      detail: i18nText(LABELS.cost, { value: 2 }),
    });
    expect(networkFocusEntry('S → A 3/5').detail).toBeUndefined();
  });

  it('splits matching pairs and falls back to the raw text', () => {
    expect(networkFocusEntry('U1-V2')).toEqual({ lead: 'U1', body: '↔ V2', value: null });
    expect(networkFocusEntry('odd item')).toEqual({ lead: '', body: 'odd item', value: null });
  });

  it('builds queue rows from the node parent and level', () => {
    const nodes = [node({ id: 's', x: 0, y: 0, level: 0, linkLabel: 'start' }), node({ id: 'a', x: 1, y: 0, level: 1, linkLabel: 'via S' })];
    expect(networkQueueEntry('A', nodes)).toEqual({ lead: 'A', body: '← S', value: '1' });
    expect(networkQueueEntry('S', nodes)).toEqual({ lead: 'S', body: '—', value: '0' });
    expect(networkQueueEntry('Z', nodes)).toEqual({ lead: 'Z', body: '—', value: null });
  });
});

describe('network geometry', () => {
  it('trims edges by the node radius and keeps the midpoint', () => {
    const nodes = new Map([
      ['a', node({ id: 'a', x: 0, y: 0 })],
      ['b', node({ id: 'b', x: 100, y: 0 })],
    ]);
    expect(networkEdgeGeometry(edge('a', 'b'), nodes, 20)).toEqual({ x1: 20, y1: 0, x2: 80, y2: 0, midX: 50, midY: 0 });
  });

  it('never trims past the middle of a short edge', () => {
    const nodes = new Map([
      ['a', node({ id: 'a', x: 0, y: 0 })],
      ['b', node({ id: 'b', x: 10, y: 0 })],
    ]);
    const geometry = networkEdgeGeometry(edge('a', 'b'), nodes, 20);
    expect(geometry.x1).toBeLessThanOrEqual(geometry.x2);
  });

  it('fits the view box around the nodes with padding', () => {
    expect(networkViewBox([], 10, 10)).toEqual({ x: 0, y: 0, width: 960, height: 560 });
    const nodes = [node({ id: 'a', x: 100, y: 50 }), node({ id: 'b', x: 300, y: 250 })];
    expect(networkViewBox(nodes, 20, 30)).toEqual({ x: 80, y: 20, width: 240, height: 260 });
  });

  it('estimates chip widths with a floor', () => {
    expect(estimateChipWidth('ab', 8, 6, 30)).toBe(30);
    expect(estimateChipWidth('abcdef', 8, 6, 30)).toBe(60);
  });
});

describe('edge chip placement', () => {
  it('keeps a free chip on the midpoint', () => {
    const [point] = placeEdgeChips([{ x1: 0, y1: 0, x2: 200, y2: 0, width: 40, height: 20 }], []);
    expect(point).toEqual({ x: 100, y: 0 });
  });

  it('moves chips of crossing edges apart', () => {
    const chips = [
      { x1: 0, y1: 0, x2: 200, y2: 200, width: 40, height: 20 },
      { x1: 0, y1: 200, x2: 200, y2: 0, width: 40, height: 20 },
    ];
    const [first, second] = placeEdgeChips(chips, []);
    const apart = Math.abs(first.x - second.x) >= 40 || Math.abs(first.y - second.y) >= 20;
    expect(apart).toBe(true);
  });

  it('steps aside from an obstacle on the midpoint', () => {
    const [point] = placeEdgeChips(
      [{ x1: 0, y1: 0, x2: 200, y2: 0, width: 40, height: 20 }],
      [{ cx: 100, cy: 0, width: 30, height: 30 }],
    );
    expect(point.x).not.toBe(100);
    expect(point.y).toBe(0);
  });
});
