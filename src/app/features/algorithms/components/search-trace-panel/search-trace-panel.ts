import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
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

import { SearchTraceRow, SearchTraceState, SearchTraceTag } from '../../models/search';
import { SegmentedPanel } from '../../../../shared/components/segmented-panel/segmented-panel';
import { SegmentedPanelSection } from '../../../../shared/components/segmented-panel/segmented-panel-section';
import { Table, TableColumn, TableRow } from '../../../../shared/components/table/table';
import { UiTagModel } from '../../../../shared/components/ui-tag/ui-tag';

interface SearchTagLegendItem {
  readonly id: SearchTraceTag;
  readonly label: string;
  readonly icon: IconDefinition;
}

const TAG_LEGEND: readonly SearchTagLegendItem[] = [
  { id: 'pending', label: 'Not checked yet', icon: faCircle },
  { id: 'candidate', label: 'Still inside active window', icon: faWandMagicSparkles },
  { id: 'compare', label: 'Current probe / compare', icon: faCrosshairs },
  { id: 'checked', label: 'Checked earlier', icon: faEye },
  { id: 'pruned', label: 'Eliminated from search', icon: faScissors },
  { id: 'bound', label: 'First or last match boundary', icon: faBullseye },
  { id: 'match', label: 'Confirmed hit', icon: faCheckDouble },
];

const TABLE_COLUMNS: readonly TableColumn[] = [
  { id: 'index', header: 'Index', width: '64px', kind: 'mono' },
  { id: 'value', header: 'Value', width: '92px', kind: 'mono' },
  { id: 'status', header: 'Status', width: '92px', kind: 'tag' },
  { id: 'tags', header: 'Tags', width: '92px', kind: 'tags' },
];

@Component({
  selector: 'app-search-trace-panel',
  imports: [SegmentedPanel, SegmentedPanelSection, Table],
  templateUrl: './search-trace-panel.html',
  styleUrl: './search-trace-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchTracePanel {
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
    if (low === null || high === null) return 'empty';
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
      label: item.label,
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
    return TAG_LEGEND.find((item) => item.id === tag)?.label ?? tag;
  }

  statusTag(row: SearchTraceRow): UiTagModel {
    return {
      label: row.status,
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

  private tagTone(tag: SearchTraceTag): 'neutral' | 'window' | 'warning' | 'route' | 'danger' | 'hit' | 'success' {
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
}
