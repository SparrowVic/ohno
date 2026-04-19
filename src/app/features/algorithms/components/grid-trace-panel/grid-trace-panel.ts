import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
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

import { GridTraceCell, GridTraceState, GridTraceTag } from '../../models/grid';
import { Table, TableColumn, TableRow } from '../../../../shared/components/table/table';
import { UiTagModel } from '../../../../shared/components/ui-tag/ui-tag';

interface GridTagLegendItem {
  readonly id: GridTraceTag;
  readonly label: string;
  readonly icon: IconDefinition;
}

const TAG_LEGEND: readonly GridTagLegendItem[] = [
  { id: 'seed', label: 'Source / start cell', icon: faCircleDot },
  { id: 'goal', label: 'Goal / target cell', icon: faBullseye },
  { id: 'frontier', label: 'Active frontier', icon: faWandMagicSparkles },
  { id: 'current', label: 'Currently processed cell', icon: faCrosshairs },
  { id: 'filled', label: 'Filled result cell', icon: faFillDrip },
  { id: 'closed', label: 'Closed / explored cell', icon: faCheckDouble },
  { id: 'path', label: 'Final best path', icon: faRoute },
  { id: 'wall', label: 'Blocked wall cell', icon: faBan },
  { id: 'blocked', label: 'Rejected / mismatched cell', icon: faBan },
  { id: 'candidate', label: 'Potential next move', icon: faWandMagicSparkles },
];

const TABLE_COLUMNS: readonly TableColumn[] = [
  { id: 'cell', header: 'Cell', width: '88px' },
  { id: 'value', header: 'Value', width: '72px', kind: 'mono' },
  { id: 'status', header: 'Status', width: '100px', kind: 'tag' },
  { id: 'tags', header: 'Tags', width: '92px', kind: 'tags' },
];

@Component({
  selector: 'app-grid-trace-panel',
  imports: [Table],
  templateUrl: './grid-trace-panel.html',
  styleUrl: './grid-trace-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GridTracePanel {
  readonly state = input<GridTraceState | null>(null);

  readonly legend = TAG_LEGEND;
  readonly tableColumns = TABLE_COLUMNS;
  readonly tableLegendItems = computed(() =>
    TAG_LEGEND.map((item) => ({
      id: item.id,
      tag: this.traceTag(item.id),
      label: item.label,
    })),
  );
  readonly activeLabel = computed(() => {
    const activeId = this.state()?.activeCellId;
    if (!activeId) return '—';
    return this.state()?.cells.find((cell) => cell.id === activeId)?.metaLabel ?? activeId;
  });
  readonly resultLabel = computed(() => {
    const state = this.state();
    if (!state) return '—';
    return state.mode === 'flood-fill' ? `${state.resultCount} filled` : `${state.resultCount} in path`;
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
    return TAG_LEGEND.find((item) => item.id === tag)?.label ?? tag;
  }

  statusTag(cell: GridTraceCell): UiTagModel {
    return {
      label: cell.status,
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
}
