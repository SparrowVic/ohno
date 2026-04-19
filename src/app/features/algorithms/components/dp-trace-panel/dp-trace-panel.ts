import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
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

import { DpCell, DpTraceState, DpTraceTag } from '../../models/dp';
import { SegmentedPanel } from '../../../../shared/components/segmented-panel/segmented-panel';
import { SegmentedPanelSection } from '../../../../shared/components/segmented-panel/segmented-panel-section';
import { Table, TableColumn, TableRow } from '../../../../shared/components/table/table';
import { UiTagModel } from '../../../../shared/components/ui-tag/ui-tag';

interface DpTagLegend {
  readonly id: DpTraceTag;
  readonly label: string;
  readonly icon: IconDefinition;
}

const TAG_LEGEND: readonly DpTagLegend[] = [
  { id: 'active', label: 'Current DP cell', icon: faBolt },
  { id: 'base', label: 'Base case', icon: faMinus },
  { id: 'take', label: 'Take branch', icon: faCheck },
  { id: 'skip', label: 'Skip / carry branch', icon: faArrowTurnDownRight },
  { id: 'match', label: 'Character match', icon: faBadgeCheck },
  { id: 'insert', label: 'Insert operation', icon: faDown },
  { id: 'delete', label: 'Delete operation', icon: faScissors },
  { id: 'replace', label: 'Replace operation', icon: faArrowsLeftRight },
  { id: 'split', label: 'Interval split', icon: faMerge },
  { id: 'best', label: 'Best known answer', icon: faCopy },
  { id: 'path', label: 'Backtrack path', icon: faRoute },
  { id: 'blocked', label: 'Unavailable cell', icon: faBan },
];

const TABLE_COLUMNS: readonly TableColumn[] = [
  { id: 'cell', header: 'Cell', kind: 'mono' },
  { id: 'value', header: 'Value', width: '72px', kind: 'mono' },
  { id: 'meta', header: 'Meta', kind: 'mono' },
  { id: 'status', header: 'Status', width: '92px', kind: 'tag' },
  { id: 'tags', header: 'Tags', width: '92px', kind: 'tags' },
];

@Component({
  selector: 'app-dp-trace-panel',
  imports: [SegmentedPanel, SegmentedPanelSection, Table],
  templateUrl: './dp-trace-panel.html',
  styleUrl: './dp-trace-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DpTracePanel {
  readonly state = input<DpTraceState | null>(null);
  readonly legend = TAG_LEGEND;
  readonly tableColumns = TABLE_COLUMNS;
  readonly tableLegendItems = computed(() =>
    TAG_LEGEND.map((item) => ({
      id: item.id,
      tag: this.traceTag(item.id),
      label: item.label,
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
    return TAG_LEGEND.find((item) => item.id === tag)?.label ?? tag;
  }

  statusTag(cell: DpCell): UiTagModel {
    return {
      label: cell.status,
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

  private statusTone(status: DpCell['status']): 'neutral' | 'danger' | 'warning' | 'success' | 'route' | 'hit' {
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

  private tagTone(tag: DpTraceTag): 'neutral' | 'warning' | 'success' | 'route' | 'hit' | 'danger' | 'window' {
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
}
