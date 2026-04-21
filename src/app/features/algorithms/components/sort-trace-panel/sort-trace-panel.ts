import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import {
  faArrowRightArrowLeft,
  faCheckDouble,
  faCircle,
  faCrosshairs,
} from '@fortawesome/pro-solid-svg-icons';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

import { AppLanguageService } from '../../../../core/i18n/app-language.service';
import { I18N_KEY, I18nKey } from '../../../../core/i18n/i18n-keys';
import { SortTraceRow, SortTraceState, SortTraceTag } from '../../models/sort-trace';
import { SegmentedPanel } from '../../../../shared/components/segmented-panel/segmented-panel';
import { SegmentedPanelSection } from '../../../../shared/components/segmented-panel/segmented-panel-section';
import { Table, TableColumn, TableRow } from '../../../../shared/components/table/table';
import { UiTagModel } from '../../../../shared/components/ui-tag/ui-tag';
import { SORT_ALGORITHM_TUTORIALS } from '../../data/sort-algorithm-tutorial/sort-algorithm-tutorial';
import { TraceHint } from '../trace-hint/trace-hint';
import { I18nTextPipe } from '../../../../shared/pipes/i18n-text.pipe';

interface TagLegendItem {
  readonly id: SortTraceTag;
  readonly labelKey: I18nKey;
  readonly icon: IconDefinition;
}

const TAG_LEGEND: readonly TagLegendItem[] = [
  {
    id: 'compare',
    labelKey: I18N_KEY.features.algorithms.tracePanels.sort.tagLegend.compare,
    icon: faCrosshairs,
  },
  {
    id: 'swap',
    labelKey: I18N_KEY.features.algorithms.tracePanels.sort.tagLegend.swap,
    icon: faArrowRightArrowLeft,
  },
  {
    id: 'sorted',
    labelKey: I18N_KEY.features.algorithms.tracePanels.sort.tagLegend.sorted,
    icon: faCheckDouble,
  },
];

const TABLE_COLUMNS: readonly TableColumn[] = [
  {
    id: 'index',
    headerKey: I18N_KEY.features.algorithms.tracePanels.sort.columns.index,
    width: '64px',
    kind: 'mono',
  },
  {
    id: 'value',
    headerKey: I18N_KEY.features.algorithms.tracePanels.sort.columns.value,
    width: '92px',
    kind: 'mono',
  },
  {
    id: 'status',
    headerKey: I18N_KEY.features.algorithms.tracePanels.sort.columns.status,
    width: '110px',
    kind: 'tag',
  },
  {
    id: 'tags',
    headerKey: I18N_KEY.features.algorithms.tracePanels.sort.columns.tags,
    width: '92px',
    kind: 'tags',
  },
];

@Component({
  selector: 'app-sort-trace-panel',
  imports: [I18nTextPipe, SegmentedPanel, SegmentedPanelSection, Table, TraceHint, TranslocoPipe],
  templateUrl: './sort-trace-panel.html',
  styleUrl: './sort-trace-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SortTracePanel {
  private readonly language = inject(AppLanguageService);
  private readonly transloco = inject(TranslocoService);

  protected readonly I18N_KEY = I18N_KEY;
  readonly state = input<SortTraceState | null>(null);
  readonly algorithmId = input<string | null>(null);
  readonly tableColumns = TABLE_COLUMNS;
  readonly legend = TAG_LEGEND;

  /** Look up the current algorithm's tutorial entry, if any, and
   *  surface its Trace-relevant key idea + watch fields. The fuller
   *  tutorial lives in the Info tab. */
  readonly hintKeyIdea = computed<string | null>(() => {
    const id = this.algorithmId();
    if (!id) return null;
    return SORT_ALGORITHM_TUTORIALS[id]?.keyIdea ?? null;
  });
  readonly hintWatch = computed<string | null>(() => {
    const id = this.algorithmId();
    if (!id) return null;
    return SORT_ALGORITHM_TUTORIALS[id]?.watch ?? null;
  });

  readonly phaseLabel = computed(() => this.state()?.phaseLabel ?? '—');
  readonly phaseTone = computed(() => this.state()?.phaseTone ?? 'idle');

  readonly pairLabel = computed(() => {
    const state = this.state();
    if (!state) return this.translate(I18N_KEY.features.algorithms.tracePanels.common.noneLabel);
    const pair = state.swapping ?? state.comparing;
    if (!pair) return this.translate(I18N_KEY.features.algorithms.tracePanels.common.noneLabel);
    return `[${pair.indexA}, ${pair.indexB}]`;
  });

  readonly pairValues = computed(() => {
    const state = this.state();
    if (!state)
      return this.translate(I18N_KEY.features.algorithms.tracePanels.common.emptyValueLabel);
    const pair = state.swapping ?? state.comparing;
    if (!pair)
      return this.translate(I18N_KEY.features.algorithms.tracePanels.common.emptyValueLabel);
    const arrow = state.swapping ? '↔' : '↔';
    return `${pair.valueA} ${arrow} ${pair.valueB}`;
  });

  readonly pairBadgeLabel = computed(() => {
    const state = this.state();
    if (!state)
      return this.translate(I18N_KEY.features.algorithms.tracePanels.sort.pairBadges.idle);
    if (state.swapping) {
      return this.translate(I18N_KEY.features.algorithms.tracePanels.sort.pairBadges.swap);
    }
    if (state.comparing) {
      return this.translate(I18N_KEY.features.algorithms.tracePanels.sort.pairBadges.compare);
    }
    return this.translate(I18N_KEY.features.algorithms.tracePanels.sort.pairBadges.idle);
  });

  readonly sortedLabel = computed(() => {
    const state = this.state();
    if (!state) return '—';
    return `${state.sortedCount} / ${state.rows.length}`;
  });

  readonly boundaryLabel = computed(() => {
    const state = this.state();
    if (!state) return '—';
    return String(state.boundary);
  });

  readonly digitLabel = computed(() => {
    const digit = this.state()?.digit;
    if (!digit) return null;
    return `${digit.index + 1} / ${digit.max}`;
  });

  readonly hasRadixContext = computed(
    () => this.digitLabel() !== null || this.state()?.buckets.length,
  );

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
      tone:
        row.status === 'swapping'
          ? 'warning'
          : row.status === 'comparing'
            ? 'active'
            : row.status === 'sorted'
              ? 'success'
              : 'default',
      cells: {
        index: row.index,
        value: row.value,
        status: this.statusTag(row),
        tags: row.tags.map((tag) => this.traceTag(tag)),
      },
    })),
  );

  tagIcon(tag: SortTraceTag): IconDefinition {
    return TAG_LEGEND.find((item) => item.id === tag)?.icon ?? faCircle;
  }

  tagLabel(tag: SortTraceTag): string {
    const labelKey = TAG_LEGEND.find((item) => item.id === tag)?.labelKey;
    return labelKey ? this.translate(labelKey) : tag;
  }

  statusTag(row: SortTraceRow): UiTagModel {
    return {
      label: this.statusLabel(row.status),
      tone:
        row.status === 'swapping'
          ? 'danger'
          : row.status === 'comparing'
            ? 'warning'
            : row.status === 'sorted'
              ? 'success'
              : 'neutral',
      appearance: 'soft',
      size: 'sm',
      uppercase: true,
    };
  }

  traceTag(tag: SortTraceTag): UiTagModel {
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

  private tagTone(tag: SortTraceTag): 'warning' | 'danger' | 'success' {
    switch (tag) {
      case 'compare':
        return 'warning';
      case 'swap':
        return 'danger';
      case 'sorted':
        return 'success';
    }
  }

  private statusLabel(status: SortTraceRow['status']): string {
    switch (status) {
      case 'unsorted':
        return this.translate(I18N_KEY.features.algorithms.tracePanels.sort.statuses.unsorted);
      case 'comparing':
        return this.translate(I18N_KEY.features.algorithms.tracePanels.sort.statuses.comparing);
      case 'swapping':
        return this.translate(I18N_KEY.features.algorithms.tracePanels.sort.statuses.swapping);
      case 'sorted':
        return this.translate(I18N_KEY.features.algorithms.tracePanels.sort.statuses.sorted);
    }
  }

  private translate(key: I18nKey, params?: Record<string, string | number>): string {
    this.language.activeLang();
    return this.transloco.translate(key, params);
  }
}
