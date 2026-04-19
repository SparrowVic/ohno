import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
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

import { MatrixCell, MatrixTraceState, MatrixTraceTag } from '../../models/matrix';
import { Table, TableColumn, TableRow } from '../../../../shared/components/table/table';
import { UiTagModel } from '../../../../shared/components/ui-tag/ui-tag';

interface MatrixTagLegendItem {
  readonly id: MatrixTraceTag;
  readonly label: string;
  readonly icon: IconDefinition;
}

const TAG_LEGEND: readonly MatrixTagLegendItem[] = [
  { id: 'pivot', label: 'Pivot row / column', icon: faBullseye },
  { id: 'active', label: 'Current compare cell', icon: faWandMagicSparkles },
  { id: 'improved', label: 'Improved shortest distance', icon: faCheckDouble },
  { id: 'covered', label: 'Covered by current line set', icon: faColumns3 },
  { id: 'zero', label: 'Zero-cost candidate', icon: faCircle },
  { id: 'assignment', label: 'Chosen assignment cell', icon: faSquare },
  { id: 'row', label: 'Active row', icon: faMinus },
  { id: 'column', label: 'Active column', icon: faColumns3 },
  { id: 'adjusted', label: 'Changed by reduction / shift', icon: faPenRuler },
  { id: 'infinite', label: 'Currently unreachable', icon: faLayerGroup },
];

const TABLE_COLUMNS: readonly TableColumn[] = [
  { id: 'cell', header: 'Cell', width: '88px', kind: 'mono' },
  { id: 'value', header: 'Value', width: '54px', kind: 'mono' },
  { id: 'meta', header: 'Meta', width: '82px', kind: 'mono' },
  { id: 'status', header: 'Status', width: '92px', kind: 'tag' },
  { id: 'tags', header: 'Tags', width: '92px', kind: 'tags' },
];

@Component({
  selector: 'app-matrix-trace-panel',
  imports: [Table],
  templateUrl: './matrix-trace-panel.html',
  styleUrl: './matrix-trace-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatrixTracePanel {
  readonly state = input<MatrixTraceState | null>(null);

  readonly legend = TAG_LEGEND;
  readonly tableColumns = TABLE_COLUMNS;
  readonly tableLegendItems = computed(() =>
    TAG_LEGEND.map((item) => ({
      id: item.id,
      tag: this.traceTag(item.id),
      label: item.label,
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
    return TAG_LEGEND.find((item) => item.id === tag)?.label ?? tag;
  }

  statusTag(cell: MatrixCell): UiTagModel {
    return {
      label: cell.status,
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

  private statusTone(status: MatrixCell['status']): 'warning' | 'success' | 'window' | 'danger' | 'neutral' {
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
}
