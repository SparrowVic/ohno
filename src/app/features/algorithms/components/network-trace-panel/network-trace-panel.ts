import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
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
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

import { AppLanguageService } from '../../../../core/i18n/app-language.service';
import { I18N_KEY, I18nKey } from '../../../../core/i18n/i18n-keys';
import { GRAPH_ALGORITHM_TUTORIALS } from '../../data/graph-algorithm-tutorial/graph-algorithm-tutorial';
import { NetworkTraceRow, NetworkTraceState, NetworkTraceTag } from '../../models/network';
import { SegmentedPanel } from '../../../../shared/components/segmented-panel/segmented-panel';
import { SegmentedPanelSection } from '../../../../shared/components/segmented-panel/segmented-panel-section';
import { Table, TableColumn, TableRow } from '../../../../shared/components/table/table';
import { UiTagModel } from '../../../../shared/components/ui-tag/ui-tag';
import { TraceHint } from '../trace-hint/trace-hint';

interface NetworkTagLegendItem {
  readonly id: NetworkTraceTag;
  readonly labelKey: I18nKey;
  readonly icon: IconDefinition;
}

const TAG_LEGEND: readonly NetworkTagLegendItem[] = [
  {
    id: 'source',
    labelKey: I18N_KEY.features.algorithms.tracePanels.network.tagLegend.source,
    icon: faCircleDot,
  },
  {
    id: 'sink',
    labelKey: I18N_KEY.features.algorithms.tracePanels.network.tagLegend.sink,
    icon: faBullseye,
  },
  {
    id: 'left',
    labelKey: I18N_KEY.features.algorithms.tracePanels.network.tagLegend.left,
    icon: faCircleDot,
  },
  {
    id: 'right',
    labelKey: I18N_KEY.features.algorithms.tracePanels.network.tagLegend.right,
    icon: faBullseye,
  },
  {
    id: 'free',
    labelKey: I18N_KEY.features.algorithms.tracePanels.network.tagLegend.free,
    icon: faWandMagicSparkles,
  },
  {
    id: 'matched',
    labelKey: I18N_KEY.features.algorithms.tracePanels.network.tagLegend.matched,
    icon: faLink,
  },
  {
    id: 'frontier',
    labelKey: I18N_KEY.features.algorithms.tracePanels.network.tagLegend.frontier,
    icon: faWandMagicSparkles,
  },
  {
    id: 'current',
    labelKey: I18N_KEY.features.algorithms.tracePanels.network.tagLegend.current,
    icon: faCrosshairs,
  },
  {
    id: 'level',
    labelKey: I18N_KEY.features.algorithms.tracePanels.network.tagLegend.level,
    icon: faLayerGroup,
  },
  {
    id: 'augment',
    labelKey: I18N_KEY.features.algorithms.tracePanels.network.tagLegend.augment,
    icon: faRoute,
  },
  {
    id: 'flow',
    labelKey: I18N_KEY.features.algorithms.tracePanels.network.tagLegend.flow,
    icon: faDroplet,
  },
  {
    id: 'blocked',
    labelKey: I18N_KEY.features.algorithms.tracePanels.network.tagLegend.blocked,
    icon: faBan,
  },
  {
    id: 'saturated',
    labelKey: I18N_KEY.features.algorithms.tracePanels.network.tagLegend.saturated,
    icon: faCheckDouble,
  },
];

@Component({
  selector: 'app-network-trace-panel',
  imports: [SegmentedPanel, SegmentedPanelSection, Table, TraceHint, TranslocoPipe],
  templateUrl: './network-trace-panel.html',
  styleUrl: './network-trace-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NetworkTracePanel {
  private readonly language = inject(AppLanguageService);
  private readonly transloco = inject(TranslocoService);

  protected readonly I18N_KEY = I18N_KEY;
  readonly state = input<NetworkTraceState | null>(null);
  readonly algorithmId = input<string | null>(null);

  readonly hintKeyIdea = computed<string | null>(() => {
    const id = this.algorithmId();
    return id ? (GRAPH_ALGORITHM_TUTORIALS[id]?.keyIdea ?? null) : null;
  });
  readonly hintWatch = computed<string | null>(() => {
    const id = this.algorithmId();
    return id ? (GRAPH_ALGORITHM_TUTORIALS[id]?.watch ?? null) : null;
  });

  readonly legend = TAG_LEGEND;
  readonly tableLegendItems = computed(() =>
    TAG_LEGEND.map((item) => ({
      id: item.id,
      tag: this.traceTag(item.id),
      label: '',
      labelKey: item.labelKey,
    })),
  );
  readonly visibleRows = computed<readonly NetworkTraceRow[]>(() =>
    [...(this.state()?.traceRows ?? [])].sort((left, right) =>
      left.label.localeCompare(right.label),
    ),
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
    return this.state()?.queue ?? [];
  });
  readonly levelHeaderLabel = computed(() =>
    this.translate(
      this.state()?.mode === 'min-cost-max-flow'
        ? I18N_KEY.features.algorithms.tracePanels.network.columns.cost
        : I18N_KEY.features.algorithms.tracePanels.network.columns.level,
    ),
  );
  readonly tableColumns = computed<readonly TableColumn[]>(() => [
    {
      id: 'node',
      headerKey: I18N_KEY.features.algorithms.tracePanels.network.columns.node,
      width: '64px',
    },
    {
      id: 'lane',
      headerKey: I18N_KEY.features.algorithms.tracePanels.network.columns.lane,
      width: '64px',
    },
    {
      id: 'link',
      headerKey: I18N_KEY.features.algorithms.tracePanels.network.columns.link,
      width: '86px',
    },
    { id: 'level', header: this.levelHeaderLabel(), width: '56px', kind: 'mono' },
    {
      id: 'status',
      headerKey: I18N_KEY.features.algorithms.tracePanels.network.columns.status,
      width: '92px',
      kind: 'tag',
    },
    {
      id: 'tags',
      headerKey: I18N_KEY.features.algorithms.tracePanels.network.columns.tags,
      width: '92px',
      kind: 'tags',
    },
  ]);

  tagIcon(tag: NetworkTraceTag): IconDefinition {
    return TAG_LEGEND.find((item) => item.id === tag)?.icon ?? faCircleDot;
  }

  tagLabel(tag: NetworkTraceTag): string {
    const labelKey = TAG_LEGEND.find((item) => item.id === tag)?.labelKey;
    return labelKey ? this.translate(labelKey) : tag;
  }

  statusTag(row: NetworkTraceRow): UiTagModel {
    return {
      label: this.statusLabel(row.status),
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

  private statusTone(
    status: NetworkTraceRow['status'],
  ): 'accent' | 'hit' | 'warning' | 'success' | 'danger' | 'neutral' {
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

  private tagTone(
    tag: NetworkTraceTag,
  ): 'accent' | 'hit' | 'neutral' | 'window' | 'warning' | 'route' | 'success' | 'danger' {
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

  private statusLabel(status: NetworkTraceRow['status']): string {
    switch (status) {
      case 'idle':
        return this.translate(I18N_KEY.features.algorithms.tracePanels.network.statuses.idle);
      case 'source':
        return this.translate(I18N_KEY.features.algorithms.tracePanels.network.statuses.source);
      case 'sink':
        return this.translate(I18N_KEY.features.algorithms.tracePanels.network.statuses.sink);
      case 'frontier':
        return this.translate(I18N_KEY.features.algorithms.tracePanels.network.statuses.frontier);
      case 'current':
        return this.translate(I18N_KEY.features.algorithms.tracePanels.network.statuses.current);
      case 'linked':
        return this.translate(I18N_KEY.features.algorithms.tracePanels.network.statuses.linked);
      case 'visited':
        return this.translate(I18N_KEY.features.algorithms.tracePanels.network.statuses.visited);
      case 'blocked':
        return this.translate(I18N_KEY.features.algorithms.tracePanels.network.statuses.blocked);
    }
  }

  private translate(key: I18nKey, params?: Record<string, string | number>): string {
    this.language.activeLang();
    return this.transloco.translate(key, params);
  }
}
