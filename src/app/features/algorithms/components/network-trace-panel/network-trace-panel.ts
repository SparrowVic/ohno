import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
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

import { GRAPH_ALGORITHM_TUTORIALS } from '../../data/graph-algorithm-tutorial/graph-algorithm-tutorial';
import { NetworkTraceRow, NetworkTraceState, NetworkTraceTag } from '../../models/network';
import { Table, TableColumn, TableRow } from '../../../../shared/components/table/table';
import { UiTagModel } from '../../../../shared/components/ui-tag/ui-tag';
import { TraceHint } from '../trace-hint/trace-hint';

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
  imports: [Table, TraceHint],
  templateUrl: './network-trace-panel.html',
  styleUrl: './network-trace-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NetworkTracePanel {
  readonly state = input<NetworkTraceState | null>(null);
  readonly algorithmId = input<string | null>(null);

  readonly hintKeyIdea = computed<string | null>(() => {
    const id = this.algorithmId();
    return id ? GRAPH_ALGORITHM_TUTORIALS[id]?.keyIdea ?? null : null;
  });
  readonly hintWatch = computed<string | null>(() => {
    const id = this.algorithmId();
    return id ? GRAPH_ALGORITHM_TUTORIALS[id]?.watch ?? null : null;
  });

  readonly legend = TAG_LEGEND;
  readonly tableLegendItems = computed(() =>
    TAG_LEGEND.map((item) => ({
      id: item.id,
      tag: this.traceTag(item.id),
      label: item.label,
    })),
  );
  readonly visibleRows = computed<readonly NetworkTraceRow[]>(() =>
    [...(this.state()?.traceRows ?? [])].sort((left, right) => left.label.localeCompare(right.label)),
  );
  readonly tableRows = computed<readonly TableRow[]>(() =>
    this.visibleRows().map((row) => ({
      id: row.nodeId,
      tone:
        row.status === 'current' || row.status === 'frontier'
          ? 'active'
          : row.status === 'linked' || row.status === 'visited'
            ? 'success'
            : 'default',
      cells: {
        node: row.label,
        lane: row.laneLabel,
        link: row.linkLabel ?? '—',
        level: row.level === null ? '—' : row.level,
        status: this.statusTag(row),
        tags: row.tags.map((tag) => this.traceTag(tag)),
      },
    })),
  );
  readonly queuePreview = computed(() => {
    const queue = this.state()?.queue ?? [];
    return queue.length > 0 ? queue : ['empty'];
  });
  readonly levelHeaderLabel = computed(() =>
    this.state()?.mode === 'min-cost-max-flow' ? 'Cost' : 'Level',
  );
  readonly tableColumns = computed<readonly TableColumn[]>(() => [
    { id: 'node', header: 'Node', width: '64px' },
    { id: 'lane', header: 'Lane', width: '64px' },
    { id: 'link', header: 'Link', width: '86px' },
    { id: 'level', header: this.levelHeaderLabel(), width: '56px', kind: 'mono' },
    { id: 'status', header: 'Status', width: '92px', kind: 'tag' },
    { id: 'tags', header: 'Tags', width: '92px', kind: 'tags' },
  ]);

  tagIcon(tag: NetworkTraceTag): IconDefinition {
    return TAG_LEGEND.find((item) => item.id === tag)?.icon ?? faCircleDot;
  }

  tagLabel(tag: NetworkTraceTag): string {
    return TAG_LEGEND.find((item) => item.id === tag)?.label ?? tag;
  }

  statusTag(row: NetworkTraceRow): UiTagModel {
    return {
      label: row.status,
      tone: this.statusTone(row.status),
      appearance: 'soft',
      size: 'sm',
      uppercase: true,
    };
  }

  traceTag(tag: NetworkTraceTag): UiTagModel {
    return {
      icon: this.tagIcon(tag),
      title: this.tagLabel(tag),
      ariaLabel: this.tagLabel(tag),
      tone: this.tagTone(tag),
      appearance: 'soft',
      size: 'sm',
      shape: 'icon',
    };
  }

  private statusTone(status: NetworkTraceRow['status']): 'accent' | 'hit' | 'warning' | 'success' | 'danger' | 'neutral' {
    switch (status) {
      case 'source':
        return 'accent';
      case 'sink':
        return 'hit';
      case 'frontier':
      case 'current':
        return 'warning';
      case 'linked':
      case 'visited':
        return 'success';
      case 'blocked':
        return 'danger';
      default:
        return 'neutral';
    }
  }

  private tagTone(tag: NetworkTraceTag): 'accent' | 'hit' | 'neutral' | 'window' | 'warning' | 'route' | 'success' | 'danger' {
    switch (tag) {
      case 'source':
      case 'left':
        return 'accent';
      case 'sink':
      case 'right':
      case 'saturated':
        return 'hit';
      case 'free':
        return 'neutral';
      case 'matched':
      case 'augment':
        return 'route';
      case 'frontier':
      case 'level':
        return 'window';
      case 'current':
        return 'warning';
      case 'flow':
        return 'success';
      case 'blocked':
        return 'danger';
    }
  }
}
