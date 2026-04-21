import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import {
  faArrowTurnDownRight,
  faArrowsLeftRight,
  faBadgeCheck,
  faBan,
  faBolt,
  faCheck,
  faCopy,
  faDown,
  faMerge,
  faMinus,
  faRoute,
  faScissors,
  faSquareDashed,
} from '@fortawesome/pro-solid-svg-icons';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

import { AppLanguageService } from '../../../../core/i18n/app-language.service';
import { I18N_KEY, I18nKey } from '../../../../core/i18n/i18n-keys';
import { DpCell, DpTraceState, DpTraceTag } from '../../models/dp';
import { SegmentedPanel } from '../../../../shared/components/segmented-panel/segmented-panel';
import { SegmentedPanelSection } from '../../../../shared/components/segmented-panel/segmented-panel-section';
import { Table, TableColumn, TableRow } from '../../../../shared/components/table/table';
import { UiTagModel } from '../../../../shared/components/ui-tag/ui-tag';

interface DpTagLegend {
  readonly id: DpTraceTag;
  readonly labelKey: I18nKey;
  readonly icon: IconDefinition;
}

const TAG_LEGEND: readonly DpTagLegend[] = [
  {
    id: 'active',
    labelKey: I18N_KEY.features.algorithms.tracePanels.dp.tagLegend.active,
    icon: faBolt,
  },
  {
    id: 'base',
    labelKey: I18N_KEY.features.algorithms.tracePanels.dp.tagLegend.base,
    icon: faMinus,
  },
  {
    id: 'take',
    labelKey: I18N_KEY.features.algorithms.tracePanels.dp.tagLegend.take,
    icon: faCheck,
  },
  {
    id: 'skip',
    labelKey: I18N_KEY.features.algorithms.tracePanels.dp.tagLegend.skip,
    icon: faArrowTurnDownRight,
  },
  {
    id: 'match',
    labelKey: I18N_KEY.features.algorithms.tracePanels.dp.tagLegend.match,
    icon: faBadgeCheck,
  },
  {
    id: 'insert',
    labelKey: I18N_KEY.features.algorithms.tracePanels.dp.tagLegend.insert,
    icon: faDown,
  },
  {
    id: 'delete',
    labelKey: I18N_KEY.features.algorithms.tracePanels.dp.tagLegend.delete,
    icon: faScissors,
  },
  {
    id: 'replace',
    labelKey: I18N_KEY.features.algorithms.tracePanels.dp.tagLegend.replace,
    icon: faArrowsLeftRight,
  },
  {
    id: 'split',
    labelKey: I18N_KEY.features.algorithms.tracePanels.dp.tagLegend.split,
    icon: faMerge,
  },
  {
    id: 'best',
    labelKey: I18N_KEY.features.algorithms.tracePanels.dp.tagLegend.best,
    icon: faCopy,
  },
  {
    id: 'path',
    labelKey: I18N_KEY.features.algorithms.tracePanels.dp.tagLegend.path,
    icon: faRoute,
  },
  {
    id: 'blocked',
    labelKey: I18N_KEY.features.algorithms.tracePanels.dp.tagLegend.blocked,
    icon: faBan,
  },
];

const TABLE_COLUMNS: readonly TableColumn[] = [
  { id: 'cell', headerKey: I18N_KEY.features.algorithms.tracePanels.dp.columns.cell, kind: 'mono' },
  {
    id: 'value',
    headerKey: I18N_KEY.features.algorithms.tracePanels.dp.columns.value,
    width: '72px',
    kind: 'mono',
  },
  { id: 'meta', headerKey: I18N_KEY.features.algorithms.tracePanels.dp.columns.meta, kind: 'mono' },
  {
    id: 'status',
    headerKey: I18N_KEY.features.algorithms.tracePanels.dp.columns.status,
    width: '92px',
    kind: 'tag',
  },
  {
    id: 'tags',
    headerKey: I18N_KEY.features.algorithms.tracePanels.dp.columns.tags,
    width: '92px',
    kind: 'tags',
  },
];

@Component({
  selector: 'app-dp-trace-panel',
  imports: [SegmentedPanel, SegmentedPanelSection, Table, TranslocoPipe],
  templateUrl: './dp-trace-panel.html',
  styleUrl: './dp-trace-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DpTracePanel {
  private readonly language = inject(AppLanguageService);
  private readonly transloco = inject(TranslocoService);

  protected readonly I18N_KEY = I18N_KEY;
  readonly state = input<DpTraceState | null>(null);
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
  readonly visibleRows = computed<readonly DpCell[]>(() =>
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
          : cell.status === 'improved' || cell.status === 'chosen' || cell.status === 'backtrack'
            ? 'success'
            : 'default',
      cells: {
        cell: `${cell.rowLabel} × ${cell.colLabel}`,
        value: cell.valueLabel,
        meta: cell.metaLabel ?? '—',
        status: this.statusTag(cell),
        tags: cell.tags.map((tag) => this.traceTag(tag)),
      },
    })),
  );

  tagIcon(tag: DpTraceTag): IconDefinition {
    return TAG_LEGEND.find((item) => item.id === tag)?.icon ?? faSquareDashed;
  }

  tagLabel(tag: DpTraceTag): string {
    const labelKey = TAG_LEGEND.find((item) => item.id === tag)?.labelKey;
    return labelKey ? this.translate(labelKey) : tag;
  }

  statusTag(cell: DpCell): UiTagModel {
    return {
      label: this.statusLabel(cell.status),
      tone: this.statusTone(cell.status),
      appearance: 'soft',
      size: 'sm',
      uppercase: true,
    };
  }

  traceTag(tag: DpTraceTag): UiTagModel {
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
    status: DpCell['status'],
  ): 'neutral' | 'danger' | 'warning' | 'success' | 'route' | 'hit' {
    switch (status) {
      case 'base':
        return 'neutral';
      case 'blocked':
        return 'danger';
      case 'active':
      case 'candidate':
        return 'warning';
      case 'improved':
      case 'chosen':
        return 'success';
      case 'backtrack':
        return 'route';
      case 'match':
        return 'hit';
      default:
        return 'neutral';
    }
  }

  private tagTone(
    tag: DpTraceTag,
  ): 'neutral' | 'warning' | 'success' | 'route' | 'hit' | 'danger' | 'window' {
    switch (tag) {
      case 'active':
        return 'warning';
      case 'base':
        return 'neutral';
      case 'take':
      case 'best':
        return 'success';
      case 'skip':
      case 'path':
        return 'route';
      case 'match':
        return 'hit';
      case 'insert':
      case 'delete':
      case 'replace':
        return 'warning';
      case 'split':
        return 'window';
      case 'blocked':
        return 'danger';
    }
  }

  private statusLabel(status: DpCell['status']): string {
    switch (status) {
      case 'idle':
        return this.translate(I18N_KEY.features.algorithms.tracePanels.dp.statuses.idle);
      case 'base':
        return this.translate(I18N_KEY.features.algorithms.tracePanels.dp.statuses.base);
      case 'blocked':
        return this.translate(I18N_KEY.features.algorithms.tracePanels.dp.statuses.blocked);
      case 'active':
        return this.translate(I18N_KEY.features.algorithms.tracePanels.dp.statuses.active);
      case 'candidate':
        return this.translate(I18N_KEY.features.algorithms.tracePanels.dp.statuses.candidate);
      case 'improved':
        return this.translate(I18N_KEY.features.algorithms.tracePanels.dp.statuses.improved);
      case 'chosen':
        return this.translate(I18N_KEY.features.algorithms.tracePanels.dp.statuses.chosen);
      case 'backtrack':
        return this.translate(I18N_KEY.features.algorithms.tracePanels.dp.statuses.backtrack);
      case 'match':
        return this.translate(I18N_KEY.features.algorithms.tracePanels.dp.statuses.match);
    }
  }

  private translate(key: I18nKey, params?: Record<string, string | number>): string {
    this.language.activeLang();
    return this.transloco.translate(key, params);
  }
}
