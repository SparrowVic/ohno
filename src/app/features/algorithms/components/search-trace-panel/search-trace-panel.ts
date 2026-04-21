import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import {
  faBullseye,
  faCheckDouble,
  faCircle,
  faCrosshairs,
  faEye,
  faScissors,
  faWandMagicSparkles,
} from '@fortawesome/pro-solid-svg-icons';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

import { AppLanguageService } from '../../../../core/i18n/app-language.service';
import { I18N_KEY, I18nKey } from '../../../../core/i18n/i18n-keys';
import { SearchTraceRow, SearchTraceState, SearchTraceTag } from '../../models/search';
import { SegmentedPanel } from '../../../../shared/components/segmented-panel/segmented-panel';
import { SegmentedPanelSection } from '../../../../shared/components/segmented-panel/segmented-panel-section';
import { Table, TableColumn, TableRow } from '../../../../shared/components/table/table';
import { UiTagModel } from '../../../../shared/components/ui-tag/ui-tag';
import { I18nTextPipe } from '../../../../shared/pipes/i18n-text.pipe';

interface SearchTagLegendItem {
  readonly id: SearchTraceTag;
  readonly labelKey: I18nKey;
  readonly icon: IconDefinition;
}

const TAG_LEGEND: readonly SearchTagLegendItem[] = [
  {
    id: 'pending',
    labelKey: I18N_KEY.features.algorithms.tracePanels.search.tagLegend.pending,
    icon: faCircle,
  },
  {
    id: 'candidate',
    labelKey: I18N_KEY.features.algorithms.tracePanels.search.tagLegend.candidate,
    icon: faWandMagicSparkles,
  },
  {
    id: 'compare',
    labelKey: I18N_KEY.features.algorithms.tracePanels.search.tagLegend.compare,
    icon: faCrosshairs,
  },
  {
    id: 'checked',
    labelKey: I18N_KEY.features.algorithms.tracePanels.search.tagLegend.checked,
    icon: faEye,
  },
  {
    id: 'pruned',
    labelKey: I18N_KEY.features.algorithms.tracePanels.search.tagLegend.pruned,
    icon: faScissors,
  },
  {
    id: 'bound',
    labelKey: I18N_KEY.features.algorithms.tracePanels.search.tagLegend.bound,
    icon: faBullseye,
  },
  {
    id: 'match',
    labelKey: I18N_KEY.features.algorithms.tracePanels.search.tagLegend.match,
    icon: faCheckDouble,
  },
];

const TABLE_COLUMNS: readonly TableColumn[] = [
  {
    id: 'index',
    headerKey: I18N_KEY.features.algorithms.tracePanels.search.columns.index,
    width: '64px',
    kind: 'mono',
  },
  {
    id: 'value',
    headerKey: I18N_KEY.features.algorithms.tracePanels.search.columns.value,
    width: '92px',
    kind: 'mono',
  },
  {
    id: 'status',
    headerKey: I18N_KEY.features.algorithms.tracePanels.search.columns.status,
    width: '92px',
    kind: 'tag',
  },
  {
    id: 'tags',
    headerKey: I18N_KEY.features.algorithms.tracePanels.search.columns.tags,
    width: '92px',
    kind: 'tags',
  },
];

@Component({
  selector: 'app-search-trace-panel',
  imports: [I18nTextPipe, SegmentedPanel, SegmentedPanelSection, Table, TranslocoPipe],
  templateUrl: './search-trace-panel.html',
  styleUrl: './search-trace-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchTracePanel {
  private readonly language = inject(AppLanguageService);
  private readonly transloco = inject(TranslocoService);

  protected readonly I18N_KEY = I18N_KEY;
  readonly state = input<SearchTraceState | null>(null);
  readonly tableColumns = TABLE_COLUMNS;

  readonly probeLabel = computed(() => {
    const probeIndex = this.state()?.probeIndex;
    if (probeIndex === null || probeIndex === undefined) return '—';
    const probeValue = this.state()?.probeValue;
    return `${probeIndex}${probeValue === null ? '' : ` · ${probeValue}`}`;
  });

  readonly windowLabel = computed(() => {
    const low = this.state()?.low;
    const high = this.state()?.high;
    if (low === null || high === null) {
      return this.translate(I18N_KEY.features.algorithms.tracePanels.common.emptyValueLabel);
    }
    return `[${low}, ${high}]`;
  });

  readonly hitLabel = computed(() => {
    const hits = this.state()?.resultIndices ?? [];
    if (hits.length === 0) return '—';
    if (hits.length === 1) return String(hits[0]);
    return `${hits[0]}..${hits[hits.length - 1]}`;
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
  readonly tableRows = computed<readonly TableRow[]>(() =>
    (this.state()?.rows ?? []).map((row) => ({
      id: row.index,
      tone: row.status === 'probe' ? 'active' : row.status === 'found' ? 'success' : 'default',
      cells: {
        index: row.index,
        value: row.value,
        status: this.statusTag(row),
        tags: row.tags.map((tag) => this.traceTag(tag)),
      },
    })),
  );

  tagIcon(tag: SearchTraceTag): IconDefinition {
    return TAG_LEGEND.find((item) => item.id === tag)?.icon ?? faCircle;
  }

  tagLabel(tag: SearchTraceTag): string {
    const labelKey = TAG_LEGEND.find((item) => item.id === tag)?.labelKey;
    return labelKey ? this.translate(labelKey) : tag;
  }

  statusTag(row: SearchTraceRow): UiTagModel {
    return {
      label: this.statusLabel(row.status),
      tone: row.status === 'found' ? 'success' : row.status === 'probe' ? 'warning' : 'neutral',
      appearance: 'soft',
      size: 'sm',
      uppercase: true,
    };
  }

  traceTag(tag: SearchTraceTag): UiTagModel {
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

  resultTone(): 'found' | 'searching' | 'idle' {
    const state = this.state();
    if (!state) return 'idle';
    if (state.resultIndices.length > 0) return 'found';
    if (state.probeIndex !== null || state.low !== null || state.high !== null) return 'searching';
    return 'idle';
  }

  private tagTone(
    tag: SearchTraceTag,
  ): 'neutral' | 'window' | 'warning' | 'route' | 'danger' | 'hit' | 'success' {
    switch (tag) {
      case 'pending':
        return 'neutral';
      case 'candidate':
        return 'window';
      case 'compare':
        return 'warning';
      case 'checked':
        return 'route';
      case 'pruned':
        return 'danger';
      case 'bound':
        return 'hit';
      case 'match':
        return 'success';
    }
  }

  private statusLabel(status: SearchTraceRow['status']): string {
    switch (status) {
      case 'idle':
        return this.translate(I18N_KEY.features.algorithms.tracePanels.search.statuses.idle);
      case 'window':
        return this.translate(I18N_KEY.features.algorithms.tracePanels.search.statuses.window);
      case 'probe':
        return this.translate(I18N_KEY.features.algorithms.tracePanels.search.statuses.probe);
      case 'visited':
        return this.translate(I18N_KEY.features.algorithms.tracePanels.search.statuses.visited);
      case 'eliminated':
        return this.translate(I18N_KEY.features.algorithms.tracePanels.search.statuses.eliminated);
      case 'bound':
        return this.translate(I18N_KEY.features.algorithms.tracePanels.search.statuses.bound);
      case 'found':
        return this.translate(I18N_KEY.features.algorithms.tracePanels.search.statuses.found);
    }
  }

  private translate(key: I18nKey, params?: Record<string, string | number>): string {
    this.language.activeLang();
    return this.transloco.translate(key, params);
  }
}
