import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import {
  faBan,
  faBullseye,
  faCheckDouble,
  faCircleDot,
  faCrosshairs,
  faFillDrip,
  faRoute,
  faWandMagicSparkles,
} from '@fortawesome/pro-solid-svg-icons';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

import { AppLanguageService } from '../../../../core/i18n/app-language.service';
import { I18N_KEY, I18nKey } from '../../../../core/i18n/i18n-keys';
import { I18nTextPipe } from '../../../../shared/pipes/i18n-text.pipe';
import { i18nText, TranslatableText } from '../../../../core/i18n/translatable-text';
import { GRAPH_ALGORITHM_TUTORIALS } from '../../data/graph-algorithm-tutorial/graph-algorithm-tutorial';
import { GridTraceCell, GridTraceState, GridTraceTag } from '../../models/grid';
import { Table, TableColumn, TableRow } from '../../../../shared/components/table/table';
import { UiTagModel } from '../../../../shared/components/ui-tag/ui-tag';
import { TraceHint } from '../trace-hint/trace-hint';

interface GridTagLegendItem {
  readonly id: GridTraceTag;
  readonly labelKey: I18nKey;
  readonly icon: IconDefinition;
}

const I18N = {
  summary: I18N_KEY.features.algorithms.tracePanels.grid,
  columns: I18N_KEY.features.algorithms.tracePanels.grid.columns,
  tagLegend: I18N_KEY.features.algorithms.tracePanels.grid.tagLegend,
  statuses: I18N_KEY.features.algorithms.tracePanels.grid.statuses,
  tableEmptyLabel: I18N_KEY.features.algorithms.tracePanels.grid.tableEmptyLabel,
  emptyLabel: I18N_KEY.features.algorithms.tracePanels.grid.emptyLabel,
} as const;

const TAG_LEGEND: readonly GridTagLegendItem[] = [
  { id: 'seed', labelKey: I18N.tagLegend.seed, icon: faCircleDot },
  { id: 'goal', labelKey: I18N.tagLegend.goal, icon: faBullseye },
  { id: 'frontier', labelKey: I18N.tagLegend.frontier, icon: faWandMagicSparkles },
  { id: 'current', labelKey: I18N.tagLegend.current, icon: faCrosshairs },
  { id: 'filled', labelKey: I18N.tagLegend.filled, icon: faFillDrip },
  { id: 'closed', labelKey: I18N.tagLegend.closed, icon: faCheckDouble },
  { id: 'path', labelKey: I18N.tagLegend.path, icon: faRoute },
  { id: 'wall', labelKey: I18N.tagLegend.wall, icon: faBan },
  { id: 'blocked', labelKey: I18N.tagLegend.blocked, icon: faBan },
  { id: 'candidate', labelKey: I18N.tagLegend.candidate, icon: faWandMagicSparkles },
];

const TABLE_COLUMNS: readonly TableColumn[] = [
  { id: 'cell', headerKey: I18N.columns.cell, width: '88px' },
  { id: 'value', headerKey: I18N.columns.value, width: '72px', kind: 'mono' },
  { id: 'status', headerKey: I18N.columns.status, width: '100px', kind: 'tag' },
  { id: 'tags', headerKey: I18N.columns.tags, width: '92px', kind: 'tags' },
];

@Component({
  selector: 'app-grid-trace-panel',
  imports: [I18nTextPipe, Table, TraceHint, TranslocoPipe],
  templateUrl: './grid-trace-panel.html',
  styleUrl: './grid-trace-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GridTracePanel {
  private readonly language = inject(AppLanguageService);
  private readonly transloco = inject(TranslocoService);

  protected readonly I18N = I18N;
  readonly state = input<GridTraceState | null>(null);
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
  readonly tableColumns = TABLE_COLUMNS;
  readonly tableLegendItems = computed(() =>
    TAG_LEGEND.map((item) => ({
      id: item.id,
      tag: this.traceTag(item.id),
      label: '',
      labelKey: item.labelKey,
    })),
  );
  readonly activeLabel = computed(() => {
    const activeId = this.state()?.activeCellId;
    if (!activeId) return '—';
    return this.state()?.cells.find((cell) => cell.id === activeId)?.metaLabel ?? activeId;
  });
  readonly resultLabel = computed<TranslatableText>(() => {
    const state = this.state();
    if (!state) return '—';
    return state.mode === 'flood-fill'
      ? i18nText(I18N.summary.filledCount, { count: state.resultCount })
      : i18nText(I18N.summary.pathCount, { count: state.resultCount });
  });
  readonly tableRows = computed<readonly TableRow[]>(() =>
    this.visibleRows().map((cell) => ({
      id: cell.id,
      tone:
        cell.status === 'current'
          ? 'active'
          : cell.status === 'filled' || cell.status === 'path'
            ? 'success'
            : 'default',
      cells: {
        cell: cell.metaLabel,
        value: cell.valueLabel || '—',
        status: this.statusTag(cell),
        tags: cell.tags.map((tag) => this.traceTag(tag)),
      },
    })),
  );

  tagIcon(tag: GridTraceTag): IconDefinition {
    return TAG_LEGEND.find((item) => item.id === tag)?.icon ?? faCircleDot;
  }

  tagLabel(tag: GridTraceTag): string {
    const labelKey = TAG_LEGEND.find((item) => item.id === tag)?.labelKey;
    return labelKey ? this.translate(labelKey) : tag;
  }

  statusTag(cell: GridTraceCell): UiTagModel {
    return {
      label: this.statusLabel(cell.status),
      tone: this.statusTone(cell.status),
      appearance: 'soft',
      size: 'sm',
      uppercase: true,
    };
  }

  traceTag(tag: GridTraceTag): UiTagModel {
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

  visibleRows(): readonly GridTraceCell[] {
    const state = this.state();
    if (!state) return [];
    return state.cells.filter((cell) => cell.status !== 'idle').sort((left, right) => left.row - right.row || left.col - right.col);
  }

  private statusLabel(status: GridTraceCell['status']): string {
    switch (status) {
      case 'idle':
        return this.translate(I18N.statuses.idle);
      case 'wall':
        return this.translate(I18N.statuses.wall);
      case 'source':
        return this.translate(I18N.statuses.source);
      case 'goal':
        return this.translate(I18N.statuses.goal);
      case 'frontier':
        return this.translate(I18N.statuses.frontier);
      case 'current':
        return this.translate(I18N.statuses.current);
      case 'filled':
        return this.translate(I18N.statuses.filled);
      case 'closed':
        return this.translate(I18N.statuses.closed);
      case 'path':
        return this.translate(I18N.statuses.path);
      case 'blocked':
        return this.translate(I18N.statuses.blocked);
    }
  }

  private statusTone(status: GridTraceCell['status']): 'accent' | 'hit' | 'window' | 'warning' | 'success' | 'danger' | 'neutral' {
    switch (status) {
      case 'source':
        return 'accent';
      case 'goal':
        return 'hit';
      case 'frontier':
        return 'window';
      case 'current':
        return 'warning';
      case 'filled':
      case 'closed':
      case 'path':
        return 'success';
      case 'wall':
      case 'blocked':
        return 'danger';
      default:
        return 'neutral';
    }
  }

  private tagTone(tag: GridTraceTag): 'accent' | 'hit' | 'window' | 'warning' | 'success' | 'danger' {
    switch (tag) {
      case 'seed':
        return 'accent';
      case 'goal':
        return 'hit';
      case 'frontier':
      case 'candidate':
        return 'window';
      case 'current':
        return 'warning';
      case 'filled':
      case 'closed':
      case 'path':
        return 'success';
      case 'wall':
      case 'blocked':
        return 'danger';
    }
  }

  private translate(key: I18nKey, params?: Record<string, string | number>): string {
    this.language.activeLang();
    return this.transloco.translate(key, params);
  }
}
