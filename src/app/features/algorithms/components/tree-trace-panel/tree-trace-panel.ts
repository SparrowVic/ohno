import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { I18N_KEY } from '../../../../core/i18n/i18n-keys';
import { OhnoLed } from '../../../../shared/instrument/led/led';
import { OhnoTraceChips } from '../../../../shared/instrument/trace/trace-chips/trace-chips';
import { OhnoTraceFacts } from '../../../../shared/instrument/trace/trace-facts/trace-facts';
import { TraceChip, TraceFact } from '../../../../shared/instrument/trace/trace.types';
import { toTraceValue } from '../../../../shared/instrument/trace/trace-value.utils';
import { TreeTraversalTraceState } from '../../models/tree';

const TREE_KEYS = I18N_KEY.features.algorithms.tracePanels.tree;
const COMMON_KEYS = I18N_KEY.features.algorithms.tracePanels.common;

@Component({
  selector: 'app-tree-trace-panel',
  imports: [OhnoLed, OhnoTraceChips, OhnoTraceFacts, TranslocoPipe],
  templateUrl: './tree-trace-panel.html',
  styleUrl: './tree-trace-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TreeTracePanel {
  protected readonly keys = TREE_KEYS;
  protected readonly commonKeys = COMMON_KEYS;

  readonly state = input<TreeTraversalTraceState | null>(null);

  protected readonly usesQueue = computed(() => this.state()?.order === 'level-order');

  protected readonly summaryFacts = computed<readonly TraceFact[]>(() => {
    const state = this.state();
    if (!state) return [];
    const current = state.currentNodeId
      ? (state.nodes.find((node) => node.id === state.currentNodeId)?.label ?? state.currentNodeId)
      : null;
    return [
      { id: 'mode', label: COMMON_KEYS.modeLabel, value: toTraceValue(state.modeLabel), kind: 'mono' },
      { id: 'phase', label: COMMON_KEYS.phaseLabel, value: toTraceValue(state.phaseLabel), kind: 'mono' },
      { id: 'current', label: TREE_KEYS.currentNodeLabel, value: current, kind: 'mono', tone: current ? 'cyan' : null },
      { id: 'progress', label: TREE_KEYS.progressLabel, value: state.visitedCount, total: state.totalNodes, tone: 'lime' },
    ];
  });

  protected readonly decisionFacts = computed<readonly TraceFact[]>(() => {
    const state = this.state();
    if (!state) return [];
    const facts: TraceFact[] = [
      { id: 'decision', label: TREE_KEYS.decisionLabel, value: toTraceValue(state.decisionLabel), kind: 'mono', tone: 'pink' },
    ];
    const computation = state.computation;
    if (computation) {
      facts.push(
        { id: 'expression', label: computation.label, value: toTraceValue(computation.expression), kind: 'mono', wide: true },
        { id: 'note', label: COMMON_KEYS.decisionLabel, value: toTraceValue(computation.note), kind: 'text', wide: true },
      );
    } else {
      facts.push({ id: 'note', label: COMMON_KEYS.decisionLabel, value: toTraceValue(TREE_KEYS.waitingStepLabel), kind: 'text', wide: true });
    }
    return facts;
  });

  protected readonly frontierChips = computed<readonly TraceChip[]>(() => {
    const state = this.state();
    if (!state) return [];
    const byId = new Map(state.nodes.map((node) => [node.id, node.label] as const));
    const ids = this.usesQueue() ? state.queue : state.stack;
    const activeIndex = this.usesQueue() ? 0 : ids.length - 1;
    return ids.map((id, index) => ({
      id: `${index}-${id}`,
      label: byId.get(id) ?? id,
      tone: index === activeIndex ? 'cyan' : null,
      active: index === activeIndex,
    }));
  });

  protected readonly outputChips = computed<readonly TraceChip[]>(() =>
    (this.state()?.output ?? []).map((label, index) => ({ id: index, label, tone: 'lime' })),
  );
}
