import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import {
  faBan,
  faBullseye,
  faCheckDouble,
  faCircleDot,
  faCrosshairs,
  faDroplet,
  faLayerGroup,
  faLink,
  faRoute,
  faWandMagicSparkles,
} from '@fortawesome/pro-solid-svg-icons';

import { NetworkTraceRow, NetworkTraceState, NetworkTraceTag } from '../../models/network';

interface NetworkTagLegendItem {
  readonly id: NetworkTraceTag;
  readonly label: string;
  readonly icon: IconDefinition;
}

const TAG_LEGEND: readonly NetworkTagLegendItem[] = [
  { id: 'source', label: 'Source anchor', icon: faCircleDot },
  { id: 'sink', label: 'Sink / target', icon: faBullseye },
  { id: 'left', label: 'Left partition node', icon: faCircleDot },
  { id: 'right', label: 'Right partition node', icon: faBullseye },
  { id: 'free', label: 'Currently unmatched / idle', icon: faWandMagicSparkles },
  { id: 'matched', label: 'Paired or carrying solution structure', icon: faLink },
  { id: 'frontier', label: 'Queued BFS frontier', icon: faWandMagicSparkles },
  { id: 'current', label: 'Current inspect focus', icon: faCrosshairs },
  { id: 'level', label: 'Inside active level graph', icon: faLayerGroup },
  { id: 'augment', label: 'Current augmenting path', icon: faRoute },
  { id: 'flow', label: 'Positive flow / selected structure', icon: faDroplet },
  { id: 'blocked', label: 'Rejected / dead edge state', icon: faBan },
  { id: 'saturated', label: 'No residual capacity left', icon: faCheckDouble },
];

@Component({
  selector: 'app-network-trace-panel',
  imports: [FaIconComponent],
  templateUrl: './network-trace-panel.html',
  styleUrl: './network-trace-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NetworkTracePanel {
  readonly state = input<NetworkTraceState | null>(null);

  readonly legend = TAG_LEGEND;
  readonly visibleRows = computed<readonly NetworkTraceRow[]>(() =>
    [...(this.state()?.traceRows ?? [])].sort((left, right) => left.label.localeCompare(right.label)),
  );
  readonly queuePreview = computed(() => {
    const queue = this.state()?.queue ?? [];
    return queue.length > 0 ? queue : ['empty'];
  });
  readonly levelHeaderLabel = computed(() =>
    this.state()?.mode === 'min-cost-max-flow' ? 'Cost' : 'Level',
  );

  statusClass(row: NetworkTraceRow): string {
    return row.status;
  }

  tagIcon(tag: NetworkTraceTag): IconDefinition {
    return TAG_LEGEND.find((item) => item.id === tag)?.icon ?? faCircleDot;
  }

  tagLabel(tag: NetworkTraceTag): string {
    return TAG_LEGEND.find((item) => item.id === tag)?.label ?? tag;
  }
}
