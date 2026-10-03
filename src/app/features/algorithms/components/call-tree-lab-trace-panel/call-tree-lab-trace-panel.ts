import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { I18N_KEY } from '../../../../core/i18n/i18n-keys';
import { OhnoLed } from '../../../../shared/instrument/led/led';
import { OhnoTraceChips } from '../../../../shared/instrument/trace/trace-chips/trace-chips';
import { OhnoTraceFacts } from '../../../../shared/instrument/trace/trace-facts/trace-facts';
import { TraceChip, TraceFact, TraceTone } from '../../../../shared/instrument/trace/trace.types';
import { toTraceValue } from '../../../../shared/instrument/trace/trace-value.utils';
import { CallTreeLabTraceState } from '../../models/call-tree-lab';

const TREE_KEYS = I18N_KEY.features.algorithms.tracePanels.callTreeLab;
const COMMON_KEYS = I18N_KEY.features.algorithms.tracePanels.common;

type NodeStatTone = CallTreeLabTraceState['nodes'][number]['stats'][number]['tone'];
type StatTone = CallTreeLabTraceState['stats'][number]['tone'];

const NODE_STAT_TONES: Readonly<Record<NodeStatTone, TraceTone | null>> = {
  default: null,
  accent: 'violet',
  success: 'lime',
  warning: 'amber',
  danger: 'red',
  route: 'cyan',
};

const STAT_TONES: Readonly<Record<StatTone, TraceTone>> = {
  info: 'cyan',
  accent: 'violet',
  success: 'lime',
  warning: 'amber',
  danger: 'red',
};

@Component({
  selector: 'app-call-tree-lab-trace-panel',
  imports: [OhnoLed, OhnoTraceChips, OhnoTraceFacts, TranslocoPipe],
  templateUrl: './call-tree-lab-trace-panel.html',
  styleUrl: './call-tree-lab-trace-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CallTreeLabTracePanel {
  protected readonly keys = TREE_KEYS;
  protected readonly commonKeys = COMMON_KEYS;

  readonly state = input<CallTreeLabTraceState | null>(null);

  private readonly activeNode = computed(() => {
    const state = this.state();
    if (!state) return null;
    const leafId = state.activePath.length > 0 ? state.activePath[state.activePath.length - 1] : state.rootId;
    if (!leafId) return null;
    return state.nodes.find((node) => node.id === leafId) ?? null;
  });

  protected readonly summaryFacts = computed<readonly TraceFact[]>(() => {
    const tree = this.state();
    if (!tree) return [];
    const facts: TraceFact[] = [
      { id: 'mode', label: COMMON_KEYS.modeLabel, value: toTraceValue(tree.modeLabel), kind: 'mono' },
      { id: 'phase', label: COMMON_KEYS.phaseLabel, value: toTraceValue(tree.phaseLabel), kind: 'mono' },
      { id: 'iteration', label: TREE_KEYS.iterationLabel, value: tree.iteration },
    ];
    if (tree.resultLabel) {
      facts.push({ id: 'result', label: COMMON_KEYS.resultLabel, value: toTraceValue(tree.resultLabel), kind: 'math', tone: 'lime' });
    }
    facts.push({ id: 'decision', label: TREE_KEYS.decisionLabel, value: toTraceValue(tree.decisionLabel), kind: 'math', wide: true });
    return facts;
  });

  protected readonly nodeFacts = computed<readonly TraceFact[]>(() => {
    const node = this.activeNode();
    if (!node) return [];
    const facts: TraceFact[] = [{ id: 'title', label: TREE_KEYS.activeLabel, value: node.title, kind: 'math', wide: true, tone: 'cyan' }];
    if (node.subtitle) {
      facts.push({ id: 'subtitle', label: COMMON_KEYS.statusLabel, value: toTraceValue(node.subtitle), kind: 'text', wide: true });
    }
    return facts;
  });

  protected readonly nodeStatFacts = computed<readonly TraceFact[]>(() =>
    (this.activeNode()?.stats ?? []).map((stat, index) => ({
      id: `node-stat-${index}`,
      label: stat.label,
      value: toTraceValue(stat.value),
      kind: 'math',
      tone: NODE_STAT_TONES[stat.tone],
    })),
  );

  protected readonly statFacts = computed<readonly TraceFact[]>(() =>
    (this.state()?.stats ?? []).map((stat, index) => ({
      id: `stat-${index}`,
      label: stat.label,
      value: toTraceValue(stat.value),
      kind: 'math',
      tone: STAT_TONES[stat.tone],
    })),
  );

  protected readonly pathChips = computed<readonly TraceChip[]>(() => {
    const tree = this.state();
    if (!tree) return [];
    const titles = new Map(tree.nodes.map((node) => [node.id, node.title] as const));
    const lastIndex = tree.activePath.length - 1;
    return tree.activePath.map((id, index) => ({
      id: `${index}-${id}`,
      label: titles.get(id) ?? id,
      kind: 'math',
      tone: index === lastIndex ? 'cyan' : null,
      active: index === lastIndex,
    }));
  });
}
