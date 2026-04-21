import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import {
  faArrowRightArrowLeft,
  faCheckDouble,
  faCircle,
  faCrosshairs,
} from '@fortawesome/pro-solid-svg-icons';

import { SortTraceRow, SortTraceState, SortTraceTag } from '../../models/sort-trace';
import { SegmentedPanel } from '../../../../shared/components/segmented-panel/segmented-panel';
import { SegmentedPanelSection } from '../../../../shared/components/segmented-panel/segmented-panel-section';
import { Table, TableColumn, TableRow } from '../../../../shared/components/table/table';
import { UiTagModel } from '../../../../shared/components/ui-tag/ui-tag';
import { SORT_ALGORITHM_TUTORIALS } from '../../data/sort-algorithm-tutorial/sort-algorithm-tutorial';
import { TraceHint } from '../trace-hint/trace-hint';

interface TagLegendItem {
  readonly id: SortTraceTag;
  readonly label: string;
  readonly icon: IconDefinition;
}

const TAG_LEGEND: readonly TagLegendItem[] = [
  { id: 'compare', label: 'In the compare pair', icon: faCrosshairs },
  { id: 'swap', label: 'Being swapped', icon: faArrowRightArrowLeft },
  { id: 'sorted', label: 'Locked in final position', icon: faCheckDouble },
];

const TABLE_COLUMNS: readonly TableColumn[] = [
  { id: 'index', header: 'Index', width: '64px', kind: 'mono' },
  { id: 'value', header: 'Value', width: '92px', kind: 'mono' },
  { id: 'status', header: 'Status', width: '110px', kind: 'tag' },
  { id: 'tags', header: 'Tags', width: '92px', kind: 'tags' },
];

@Component({
  selector: 'app-sort-trace-panel',
  imports: [SegmentedPanel, SegmentedPanelSection, Table, TraceHint],
  templateUrl: './sort-trace-panel.html',
  styleUrl: './sort-trace-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SortTracePanel {
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
    if (!state) return 'none';
    const pair = state.swapping ?? state.comparing;
    if (!pair) return 'none';
    return `[${pair.indexA}, ${pair.indexB}]`;
  });

  readonly pairValues = computed(() => {
    const state = this.state();
    if (!state) return '—';
    const pair = state.swapping ?? state.comparing;
    if (!pair) return '—';
    const arrow = state.swapping ? '↔' : '↔';
    return `${pair.valueA} ${arrow} ${pair.valueB}`;
  });

  readonly pairBadge = computed(() => {
    const state = this.state();
    if (!state) return 'idle';
    if (state.swapping) return 'swap';
    if (state.comparing) return 'compare';
    return 'idle';
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

  readonly hasRadixContext = computed(() => this.digitLabel() !== null || this.state()?.buckets.length);

  readonly tableLegendItems = computed(() =>
    TAG_LEGEND.map((item) => ({
      id: item.id,
      tag: this.traceTag(item.id),
      label: item.label,
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
    return TAG_LEGEND.find((item) => item.id === tag)?.label ?? tag;
  }

  statusTag(row: SortTraceRow): UiTagModel {
    return {
      label: row.status,
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
}
