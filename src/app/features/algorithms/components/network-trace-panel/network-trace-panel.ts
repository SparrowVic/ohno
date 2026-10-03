import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { I18N_KEY, I18nKey } from '../../../../core/i18n/i18n-keys';
import { OhnoLed } from '../../../../shared/instrument/led/led';
import { OhnoTraceChips } from '../../../../shared/instrument/trace/trace-chips/trace-chips';
import { OhnoTraceFacts } from '../../../../shared/instrument/trace/trace-facts/trace-facts';
import { OhnoTraceTable } from '../../../../shared/instrument/trace/trace-table/trace-table';
import { TraceChip, TraceColumn, TraceFact, TraceRow, TraceTone } from '../../../../shared/instrument/trace/trace.types';
import { toTraceValue } from '../../../../shared/instrument/trace/trace-value.utils';
import { GRAPH_ALGORITHM_TUTORIALS } from '../../data/graph-algorithm-tutorial/graph-algorithm-tutorial';
import { NetworkNodeStatus, NetworkTraceState, NetworkTraceTag } from '../../models/network';
import { networkLinkLabel, networkRackTitle } from '../network-visualization/network-display.utils';

const NETWORK_KEYS = I18N_KEY.features.algorithms.tracePanels.network;
const COMMON_KEYS = I18N_KEY.features.algorithms.tracePanels.common;

const STATUS_TONES: Readonly<Record<NetworkNodeStatus, TraceTone | null>> = {
  idle: null,
  source: 'violet',
  sink: 'amber',
  frontier: 'amber',
  current: 'cyan',
  linked: 'lime',
  visited: 'lime',
  blocked: 'red',
};

const TAG_CHIPS: Readonly<Record<NetworkTraceTag, { readonly label: I18nKey; readonly tone: TraceTone | null }>> = {
  source: { label: NETWORK_KEYS.statuses.source, tone: 'violet' },
  sink: { label: NETWORK_KEYS.statuses.sink, tone: 'amber' },
  left: { label: NETWORK_KEYS.leftTagLabel, tone: 'violet' },
  right: { label: NETWORK_KEYS.rightTagLabel, tone: 'amber' },
  free: { label: NETWORK_KEYS.freeTagLabel, tone: null },
  matched: { label: NETWORK_KEYS.matchedTagLabel, tone: 'lime' },
  frontier: { label: NETWORK_KEYS.statuses.frontier, tone: 'amber' },
  current: { label: NETWORK_KEYS.statuses.current, tone: 'cyan' },
  level: { label: NETWORK_KEYS.columns.level, tone: 'cyan' },
  augment: { label: NETWORK_KEYS.augmentTagLabel, tone: 'pink' },
  flow: { label: NETWORK_KEYS.flowTagLabel, tone: 'lime' },
  blocked: { label: NETWORK_KEYS.statuses.blocked, tone: 'red' },
  saturated: { label: NETWORK_KEYS.saturatedTagLabel, tone: 'red' },
};

@Component({
  selector: 'app-network-trace-panel',
  imports: [OhnoLed, OhnoTraceChips, OhnoTraceFacts, OhnoTraceTable, TranslocoPipe],
  templateUrl: './network-trace-panel.html',
  styleUrl: './network-trace-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NetworkTracePanel {
  protected readonly keys = NETWORK_KEYS;
  protected readonly commonKeys = COMMON_KEYS;

  readonly state = input<NetworkTraceState | null>(null);
  readonly algorithmId = input<string | null>(null);

  protected readonly hintFacts = computed<readonly TraceFact[]>(() => {
    const id = this.algorithmId();
    const tutorial = id ? GRAPH_ALGORITHM_TUTORIALS[id] : undefined;
    if (!tutorial) return [];
    return [
      { id: 'idea', label: COMMON_KEYS.keyIdeaLabel, value: toTraceValue(tutorial.keyIdea), kind: 'text', wide: true },
      { id: 'watch', label: COMMON_KEYS.watchLabel, value: toTraceValue(tutorial.watch), kind: 'text', wide: true },
    ];
  });

  protected readonly summaryFacts = computed<readonly TraceFact[]>(() => {
    const state = this.state();
    if (!state) return [];
    return [
      { id: 'mode', label: COMMON_KEYS.modeLabel, value: toTraceValue(state.modeLabel), kind: 'mono' },
      { id: 'phase', label: COMMON_KEYS.phaseLabel, value: toTraceValue(state.phaseLabel), kind: 'mono' },
      { id: 'frontier', label: networkRackTitle(state.frontierLabel), value: state.frontierCount, tone: 'amber' },
      { id: 'result', label: COMMON_KEYS.resultLabel, value: toTraceValue(state.resultLabel), kind: 'mono', tone: 'lime' },
    ];
  });

  protected readonly stepFacts = computed<readonly TraceFact[]>(() => {
    const state = this.state();
    if (!state) return [];
    const computation = state.computation;
    const facts: TraceFact[] = [
      { id: 'status', label: COMMON_KEYS.statusLabel, value: toTraceValue(state.statusLabel), kind: 'mono' },
      { id: 'route', label: COMMON_KEYS.routeLabel, value: state.activeRouteLabel, kind: 'mono', tone: 'pink' },
    ];
    if (computation) {
      const result = computation.result ? ` = ${computation.result}` : '';
      facts.push(
        { id: 'expression', label: computation.label, value: `${computation.expression}${result}`, kind: 'mono', wide: true },
        { id: 'decision', label: COMMON_KEYS.decisionLabel, value: toTraceValue(computation.decision), kind: 'text', wide: true },
      );
    } else {
      facts.push({
        id: 'decision',
        label: COMMON_KEYS.decisionLabel,
        value: toTraceValue(NETWORK_KEYS.waitingStepLabel),
        kind: 'text',
        wide: true,
      });
    }
    return facts;
  });

  protected readonly queueTitle = computed(() => networkRackTitle(this.state()?.queueLabel ?? ''));
  protected readonly focusTitle = computed(() => networkRackTitle(this.state()?.focusItemsLabel ?? ''));

  protected readonly queueChips = computed<readonly TraceChip[]>(() =>
    (this.state()?.queue ?? []).map((item, index) => ({ id: index, label: item, tone: index === 0 ? 'cyan' : 'amber', active: index === 0 })),
  );

  protected readonly focusChips = computed<readonly TraceChip[]>(() =>
    (this.state()?.focusItems ?? []).map((item, index) => ({ id: index, label: item, tone: 'lime' })),
  );

  protected readonly columns = computed<readonly TraceColumn[]>(() => [
    { id: 'node', header: NETWORK_KEYS.columns.node },
    { id: 'lane', header: NETWORK_KEYS.columns.lane, kind: 'mono' },
    { id: 'link', header: NETWORK_KEYS.columns.link, kind: 'mono' },
    {
      id: 'level',
      header: this.state()?.mode === 'min-cost-max-flow' ? NETWORK_KEYS.columns.cost : NETWORK_KEYS.columns.level,
      align: 'end',
    },
    { id: 'status', header: NETWORK_KEYS.columns.status, kind: 'chips' },
    { id: 'tags', header: NETWORK_KEYS.columns.tags, kind: 'chips' },
  ]);

  protected readonly rows = computed<readonly TraceRow[]>(() =>
    [...(this.state()?.traceRows ?? [])]
      .sort((left, right) => left.label.localeCompare(right.label))
      .map((row) => {
        const tone = STATUS_TONES[row.status];
        const highlighted = ['current', 'frontier', 'linked', 'visited'].includes(row.status);
        return {
          id: row.nodeId,
          tone: highlighted ? tone : null,
          cells: {
            node: row.label,
            lane: row.laneLabel,
            link: toTraceValue(networkLinkLabel(row.linkLabel)),
            level: row.level,
            status: [{ id: row.status, label: toTraceValue(NETWORK_KEYS.statuses[row.status]), tone }],
            tags: row.tags.map((tag) => ({ id: tag, label: toTraceValue(TAG_CHIPS[tag].label), tone: TAG_CHIPS[tag].tone })),
          },
        };
      }),
  );
}
