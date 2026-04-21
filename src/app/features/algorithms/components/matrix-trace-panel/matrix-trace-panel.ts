import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import {
  faBullseye,
  faCheckDouble,
  faCircle,
  faColumns3,
  faLayerGroup,
  faMinus,
  faPenRuler,
  faSquare,
  faWandMagicSparkles,
} from '@fortawesome/pro-solid-svg-icons';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

import { AppLanguageService } from '../../../../core/i18n/app-language.service';
import { I18N_KEY, I18nKey } from '../../../../core/i18n/i18n-keys';
import { GRAPH_ALGORITHM_TUTORIALS } from '../../data/graph-algorithm-tutorial/graph-algorithm-tutorial';
import { MatrixCell, MatrixTraceState, MatrixTraceTag } from '../../models/matrix';
import { Table, TableColumn, TableRow } from '../../../../shared/components/table/table';
import { UiTagModel } from '../../../../shared/components/ui-tag/ui-tag';
import { TraceHint } from '../trace-hint/trace-hint';

interface MatrixTagLegendItem {
  readonly id: MatrixTraceTag;
  readonly labelKey: I18nKey;
  readonly icon: IconDefinition;
}

const TAG_LEGEND: readonly MatrixTagLegendItem[] = [
  {
    id: 'pivot',
    labelKey: I18N_KEY.features.algorithms.tracePanels.matrix.tagLegend.pivot,
    icon: faBullseye,
  },
  {
    id: 'active',
    labelKey: I18N_KEY.features.algorithms.tracePanels.matrix.tagLegend.active,
    icon: faWandMagicSparkles,
  },
  {
    id: 'improved',
    labelKey: I18N_KEY.features.algorithms.tracePanels.matrix.tagLegend.improved,
    icon: faCheckDouble,
  },
  {
    id: 'covered',
    labelKey: I18N_KEY.features.algorithms.tracePanels.matrix.tagLegend.covered,
    icon: faColumns3,
  },
  {
    id: 'zero',
    labelKey: I18N_KEY.features.algorithms.tracePanels.matrix.tagLegend.zero,
    icon: faCircle,
  },
  {
    id: 'assignment',
    labelKey: I18N_KEY.features.algorithms.tracePanels.matrix.tagLegend.assignment,
    icon: faSquare,
  },
  {
    id: 'row',
    labelKey: I18N_KEY.features.algorithms.tracePanels.matrix.tagLegend.row,
    icon: faMinus,
  },
  {
    id: 'column',
    labelKey: I18N_KEY.features.algorithms.tracePanels.matrix.tagLegend.column,
    icon: faColumns3,
  },
  {
    id: 'adjusted',
    labelKey: I18N_KEY.features.algorithms.tracePanels.matrix.tagLegend.adjusted,
    icon: faPenRuler,
  },
  {
    id: 'infinite',
    labelKey: I18N_KEY.features.algorithms.tracePanels.matrix.tagLegend.infinite,
    icon: faLayerGroup,
  },
];

const TABLE_COLUMNS: readonly TableColumn[] = [
  {
    id: 'cell',
    headerKey: I18N_KEY.features.algorithms.tracePanels.matrix.columns.cell,
    width: '88px',
    kind: 'mono',
  },
  {
    id: 'value',
    headerKey: I18N_KEY.features.algorithms.tracePanels.matrix.columns.value,
    width: '54px',
    kind: 'mono',
  },
  {
    id: 'meta',
    headerKey: I18N_KEY.features.algorithms.tracePanels.matrix.columns.meta,
    width: '82px',
    kind: 'mono',
  },
  {
    id: 'status',
    headerKey: I18N_KEY.features.algorithms.tracePanels.matrix.columns.status,
    width: '92px',
    kind: 'tag',
  },
  {
    id: 'tags',
    headerKey: I18N_KEY.features.algorithms.tracePanels.matrix.columns.tags,
    width: '92px',
    kind: 'tags',
  },
];

@Component({
  selector: 'app-matrix-trace-panel',
  imports: [Table, TraceHint, TranslocoPipe],
  templateUrl: './matrix-trace-panel.html',
  styleUrl: './matrix-trace-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatrixTracePanel {
  private readonly language = inject(AppLanguageService);
  private readonly transloco = inject(TranslocoService);

  protected readonly I18N_KEY = I18N_KEY;
  readonly state = input<MatrixTraceState | null>(null);
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
  readonly visibleRows = computed<readonly MatrixCell[]>(() =>
    (this.state()?.cells ?? [])
      .filter((cell) => cell.status !== 'idle' || cell.tags.length > 0)
      .sort((left, right) => left.row - right.row || left.col - right.col),
  );
  readonly tableRows = computed<readonly TableRow[]>(() =>
    this.visibleRows().map((cell) => ({
      id: cell.id,
      tone:
        cell.status === 'active' || cell.status === 'candidate'
          ? 'active'
          : cell.status === 'improved' || cell.status === 'assignment'
            ? 'success'
            : 'default',
      cells: {
        cell: `${cell.rowLabel}→${cell.colLabel}`,
        value: cell.valueLabel,
        meta: cell.metaLabel ?? '—',
        status: this.statusTag(cell),
        tags: cell.tags.map((tag) => this.traceTag(tag)),
      },
    })),
  );

  tagIcon(tag: MatrixTraceTag): IconDefinition {
    return TAG_LEGEND.find((item) => item.id === tag)?.icon ?? faCircle;
  }

  tagLabel(tag: MatrixTraceTag): string {
    const labelKey = TAG_LEGEND.find((item) => item.id === tag)?.labelKey;
    return labelKey ? this.translate(labelKey) : tag;
  }

  statusTag(cell: MatrixCell): UiTagModel {
    return {
      label: this.statusLabel(cell.status),
      tone: this.statusTone(cell.status),
      appearance: 'soft',
      size: 'sm',
      uppercase: true,
    };
  }

  traceTag(tag: MatrixTraceTag): UiTagModel {
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
    status: MatrixCell['status'],
  ): 'warning' | 'success' | 'window' | 'danger' | 'neutral' {
    switch (status) {
      case 'active':
      case 'candidate':
      case 'pivot':
        return 'warning';
      case 'improved':
      case 'assignment':
      case 'adjusted':
        return 'success';
      case 'covered':
      case 'zero':
        return 'window';
      case 'blocked':
        return 'danger';
      default:
        return 'neutral';
    }
  }

  private tagTone(tag: MatrixTraceTag): 'warning' | 'success' | 'window' | 'neutral' {
    switch (tag) {
      case 'pivot':
      case 'active':
      case 'row':
      case 'column':
        return 'warning';
      case 'improved':
      case 'assignment':
      case 'adjusted':
        return 'success';
      case 'covered':
      case 'zero':
        return 'window';
      case 'infinite':
        return 'neutral';
    }
  }

  private statusLabel(status: MatrixCell['status']): string {
    switch (status) {
      case 'idle':
        return this.translate(I18N_KEY.features.algorithms.tracePanels.matrix.statuses.idle);
      case 'pivot':
        return this.translate(I18N_KEY.features.algorithms.tracePanels.matrix.statuses.pivot);
      case 'active':
        return this.translate(I18N_KEY.features.algorithms.tracePanels.matrix.statuses.active);
      case 'candidate':
        return this.translate(I18N_KEY.features.algorithms.tracePanels.matrix.statuses.candidate);
      case 'improved':
        return this.translate(I18N_KEY.features.algorithms.tracePanels.matrix.statuses.improved);
      case 'assignment':
        return this.translate(I18N_KEY.features.algorithms.tracePanels.matrix.statuses.assignment);
      case 'adjusted':
        return this.translate(I18N_KEY.features.algorithms.tracePanels.matrix.statuses.adjusted);
      case 'covered':
        return this.translate(I18N_KEY.features.algorithms.tracePanels.matrix.statuses.covered);
      case 'zero':
        return this.translate(I18N_KEY.features.algorithms.tracePanels.matrix.statuses.zero);
      case 'blocked':
        return this.translate(I18N_KEY.features.algorithms.tracePanels.matrix.statuses.blocked);
    }
  }

  private translate(key: I18nKey, params?: Record<string, string | number>): string {
    this.language.activeLang();
    return this.transloco.translate(key, params);
  }
}
