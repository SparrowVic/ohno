import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { I18N_KEY } from '../../../../core/i18n/i18n-keys';
import { I18nTextPipe } from '../../../../shared/pipes/i18n-text.pipe';
import { TreeTraversalTraceState } from '../../models/tree';
import { SegmentedPanel } from '../../../../shared/components/segmented-panel/segmented-panel';
import { SegmentedPanelSection } from '../../../../shared/components/segmented-panel/segmented-panel-section';

/**
 * Trace panel for the tree-traversals algorithm. Mirrors the shape of
 * the graph / dsu trace panels so the UI feels consistent: a facts
 * row (order + node counts), a calculation card (current operation +
 * decision), and streams for the live stack/queue + emitted output.
 *
 * The visualization itself already tells the "where" story; this
 * panel is the "what" + "why" — data the user can read without
 * counting pixels on the canvas.
 */
@Component({
  selector: 'app-tree-trace-panel',
  imports: [I18nTextPipe, SegmentedPanel, SegmentedPanelSection, TranslocoPipe],
  templateUrl: './tree-trace-panel.html',
  styleUrl: './tree-trace-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TreeTracePanel {
  protected readonly I18N_KEY = I18N_KEY;
  readonly state = input<TreeTraversalTraceState | null>(null);

  readonly currentLabel = computed(() => {
    const state = this.state();
    if (!state?.currentNodeId) return '—';
    return state.nodes.find((n) => n.id === state.currentNodeId)?.label ?? state.currentNodeId;
  });

  readonly progressLabel = computed(() => {
    const state = this.state();
    if (!state) return '0 / 0';
    return `${state.visitedCount} / ${state.totalNodes}`;
  });

  readonly stackItems = computed(() => this.resolveLabels(this.state()?.stack ?? []));
  readonly queueItems = computed(() => this.resolveLabels(this.state()?.queue ?? []));

  readonly showStack = computed(() => this.state()?.order !== 'level-order');
  readonly showQueue = computed(() => this.state()?.order === 'level-order');

  private resolveLabels(ids: readonly string[]): readonly { id: string; label: string }[] {
    const state = this.state();
    if (!state) return [];
    const byId = new Map(state.nodes.map((n) => [n.id, n] as const));
    return ids.map((id) => ({ id, label: byId.get(id)?.label ?? id }));
  }
}
