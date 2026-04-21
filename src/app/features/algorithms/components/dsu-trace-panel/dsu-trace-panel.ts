import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import {
  faCheckDouble,
  faCircleDot,
  faCrosshairs,
  faEye,
  faLink,
  faXmark,
} from '@fortawesome/pro-solid-svg-icons';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

import { AppLanguageService } from '../../../../core/i18n/app-language.service';
import { I18N_KEY, I18nKey } from '../../../../core/i18n/i18n-keys';
import { GRAPH_ALGORITHM_TUTORIALS } from '../../data/graph-algorithm-tutorial/graph-algorithm-tutorial';
import { DsuEdgeTrace, DsuNodeTrace, DsuTraceState, DsuTraceTag } from '../../models/dsu';
import { Table, TableColumn, TableRow } from '../../../../shared/components/table/table';
import { UiTagModel } from '../../../../shared/components/ui-tag/ui-tag';
import { TraceHint } from '../trace-hint/trace-hint';

interface DsuTagLegendItem {
  readonly id: DsuTraceTag | 'accepted' | 'rejected';
  readonly labelKey: I18nKey;
  readonly icon: IconDefinition;
}

const TAG_LEGEND: readonly DsuTagLegendItem[] = [
  {
    id: 'root',
    labelKey: I18N_KEY.features.algorithms.tracePanels.dsu.tagLegend.root,
    icon: faCircleDot,
  },
  {
    id: 'active',
    labelKey: I18N_KEY.features.algorithms.tracePanels.dsu.tagLegend.active,
    icon: faCrosshairs,
  },
  {
    id: 'query',
    labelKey: I18N_KEY.features.algorithms.tracePanels.dsu.tagLegend.query,
    icon: faEye,
  },
  {
    id: 'merged',
    labelKey: I18N_KEY.features.algorithms.tracePanels.dsu.tagLegend.merged,
    icon: faLink,
  },
  {
    id: 'compressed',
    labelKey: I18N_KEY.features.algorithms.tracePanels.dsu.tagLegend.compressed,
    icon: faCheckDouble,
  },
  {
    id: 'accepted',
    labelKey: I18N_KEY.features.algorithms.tracePanels.dsu.tagLegend.accepted,
    icon: faCheckDouble,
  },
  {
    id: 'rejected',
    labelKey: I18N_KEY.features.algorithms.tracePanels.dsu.tagLegend.rejected,
    icon: faXmark,
  },
];

const TABLE_COLUMNS: readonly TableColumn[] = [
  { id: 'node', headerKey: I18N_KEY.features.algorithms.tracePanels.dsu.columns.node },
  { id: 'parent', headerKey: I18N_KEY.features.algorithms.tracePanels.dsu.columns.parent },
  { id: 'root', headerKey: I18N_KEY.features.algorithms.tracePanels.dsu.columns.root },
  {
    id: 'rank',
    headerKey: I18N_KEY.features.algorithms.tracePanels.dsu.columns.rank,
    width: '54px',
    kind: 'mono',
  },
  {
    id: 'size',
    headerKey: I18N_KEY.features.algorithms.tracePanels.dsu.columns.size,
    width: '54px',
    kind: 'mono',
  },
  {
    id: 'status',
    headerKey: I18N_KEY.features.algorithms.tracePanels.dsu.columns.status,
    width: '92px',
    kind: 'tag',
  },
  {
    id: 'tags',
    headerKey: I18N_KEY.features.algorithms.tracePanels.dsu.columns.tags,
    width: '92px',
    kind: 'tags',
  },
];

@Component({
  selector: 'app-dsu-trace-panel',
  imports: [Table, TraceHint, TranslocoPipe],
  templateUrl: './dsu-trace-panel.html',
  styleUrl: './dsu-trace-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DsuTracePanel {
  private readonly language = inject(AppLanguageService);
  private readonly transloco = inject(TranslocoService);

  protected readonly I18N_KEY = I18N_KEY;
  readonly state = input<DsuTraceState | null>(null);
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
  readonly tableColumns = TABLE_COLUMNS;
  readonly tableLegendItems = computed(() =>
    TAG_LEGEND.map((item) => ({
      id: item.id,
      tag: this.traceTag(item.id),
      label: '',
      labelKey: item.labelKey,
    })),
  );
  readonly activeLabel = computed(() => this.state()?.activePairLabel ?? '—');
  readonly visibleNodes = computed<readonly DsuNodeTrace[]>(() =>
    [...(this.state()?.nodes ?? [])].sort((left, right) => left.label.localeCompare(right.label)),
  );
  readonly tableRows = computed<readonly TableRow[]>(() =>
    this.visibleNodes().map((node) => ({
      id: node.id,
      tone:
        node.status === 'active' || node.status === 'query'
          ? 'active'
          : node.status === 'merged' || node.status === 'compressed'
            ? 'success'
            : 'default',
      cells: {
        node: node.label,
        parent: node.parentLabel,
        root: node.rootLabel,
        rank: node.rank,
        size: node.size,
        status: this.statusTag(node),
        tags: node.tags.map((tag) => this.traceTag(tag)),
      },
    })),
  );
  readonly edgeRows = computed<readonly DsuEdgeTrace[]>(() => this.state()?.edges ?? []);
  readonly compactGroups = computed(() =>
    [...(this.state()?.groups ?? [])].sort((left, right) => {
      if (left.active !== right.active) return left.active ? -1 : 1;
      return left.rootLabel.localeCompare(right.rootLabel);
    }),
  );

  tagIcon(tag: DsuTraceTag | 'accepted' | 'rejected'): IconDefinition {
    return TAG_LEGEND.find((item) => item.id === tag)?.icon ?? faCircleDot;
  }

  tagLabel(tag: DsuTraceTag | 'accepted' | 'rejected'): string {
    const labelKey = TAG_LEGEND.find((item) => item.id === tag)?.labelKey;
    return labelKey ? this.translate(labelKey) : tag;
  }

  statusTag(node: DsuNodeTrace): UiTagModel {
    return {
      label: this.statusLabel(node.status),
      tone: this.statusTone(node.status),
      appearance: 'soft',
      size: 'sm',
      uppercase: true,
    };
  }

  traceTag(tag: DsuTraceTag | 'accepted' | 'rejected'): UiTagModel {
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

  edgeLabel(edge: DsuEdgeTrace): string {
    const state = this.state();
    if (state?.mode === 'union-find') {
      if (edge.toLabel === 'find') {
        return this.translate(I18N_KEY.features.algorithms.tracePanels.dsu.findOperationLabel, {
          label: edge.fromLabel,
        });
      }
      return `${edge.fromLabel}-${edge.toLabel}`;
    }
    return `${edge.fromLabel}-${edge.toLabel}`;
  }

  edgeTag(edge: DsuEdgeTrace): 'accepted' | 'rejected' | null {
    if (edge.status === 'accepted') return 'accepted';
    if (edge.status === 'rejected') return 'rejected';
    return null;
  }

  private statusTone(status: DsuNodeTrace['status']): 'neutral' | 'warning' | 'accent' | 'success' {
    switch (status) {
      case 'active':
      case 'query':
        return 'warning';
      case 'root':
        return 'accent';
      case 'merged':
      case 'compressed':
        return 'success';
      default:
        return 'neutral';
    }
  }

  private tagTone(
    tag: DsuTraceTag | 'accepted' | 'rejected',
  ): 'accent' | 'warning' | 'success' | 'danger' {
    switch (tag) {
      case 'root':
        return 'accent';
      case 'active':
      case 'query':
        return 'warning';
      case 'merged':
      case 'compressed':
      case 'accepted':
        return 'success';
      case 'rejected':
        return 'danger';
    }
  }

  private statusLabel(status: DsuNodeTrace['status']): string {
    switch (status) {
      case 'idle':
        return this.translate(I18N_KEY.features.algorithms.tracePanels.dsu.statuses.idle);
      case 'root':
        return this.translate(I18N_KEY.features.algorithms.tracePanels.dsu.statuses.root);
      case 'active':
        return this.translate(I18N_KEY.features.algorithms.tracePanels.dsu.statuses.active);
      case 'query':
        return this.translate(I18N_KEY.features.algorithms.tracePanels.dsu.statuses.query);
      case 'merged':
        return this.translate(I18N_KEY.features.algorithms.tracePanels.dsu.statuses.merged);
      case 'compressed':
        return this.translate(I18N_KEY.features.algorithms.tracePanels.dsu.statuses.compressed);
    }
  }

  private translate(key: I18nKey, params?: Record<string, string | number>): string {
    this.language.activeLang();
    return this.transloco.translate(key, params);
  }
}
