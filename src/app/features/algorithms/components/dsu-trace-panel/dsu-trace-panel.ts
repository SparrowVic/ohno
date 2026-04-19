import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import {
  faCheckDouble,
  faCircleDot,
  faCrosshairs,
  faEye,
  faLink,
  faXmark,
} from '@fortawesome/pro-solid-svg-icons';

import { DsuEdgeTrace, DsuNodeTrace, DsuTraceState, DsuTraceTag } from '../../models/dsu';
import { Table, TableColumn, TableRow } from '../../../../shared/components/table/table';
import { UiTagModel } from '../../../../shared/components/ui-tag/ui-tag';

interface DsuTagLegendItem {
  readonly id: DsuTraceTag | 'accepted' | 'rejected';
  readonly label: string;
  readonly icon: IconDefinition;
}

const TAG_LEGEND: readonly DsuTagLegendItem[] = [
  { id: 'root', label: 'Representative root', icon: faCircleDot },
  { id: 'active', label: 'Current merge / check focus', icon: faCrosshairs },
  { id: 'query', label: 'Find query path', icon: faEye },
  { id: 'merged', label: 'Merged under another root', icon: faLink },
  { id: 'compressed', label: 'Path compressed node', icon: faCheckDouble },
  { id: 'accepted', label: 'Accepted merge / MST edge', icon: faCheckDouble },
  { id: 'rejected', label: 'Rejected cycle / duplicate merge', icon: faXmark },
];

const TABLE_COLUMNS: readonly TableColumn[] = [
  { id: 'node', header: 'Node' },
  { id: 'parent', header: 'Parent' },
  { id: 'root', header: 'Root' },
  { id: 'rank', header: 'Rank', width: '54px', kind: 'mono' },
  { id: 'size', header: 'Size', width: '54px', kind: 'mono' },
  { id: 'status', header: 'Status', width: '92px', kind: 'tag' },
  { id: 'tags', header: 'Tags', width: '92px', kind: 'tags' },
];

@Component({
  selector: 'app-dsu-trace-panel',
  imports: [Table],
  templateUrl: './dsu-trace-panel.html',
  styleUrl: './dsu-trace-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DsuTracePanel {
  readonly state = input<DsuTraceState | null>(null);

  readonly legend = TAG_LEGEND;
  readonly tableColumns = TABLE_COLUMNS;
  readonly tableLegendItems = computed(() =>
    TAG_LEGEND.map((item) => ({
      id: item.id,
      tag: this.traceTag(item.id),
      label: item.label,
    })),
  );
  readonly activeLabel = computed(() => this.state()?.activePairLabel ?? '—');
  readonly visibleNodes = computed<readonly DsuNodeTrace[]>(() =>
    [...(this.state()?.nodes ?? [])].sort((left, right) => left.label.localeCompare(right.label)),
  );
  readonly tableRows = computed<readonly TableRow[]>(() =>
    this.visibleNodes().map((node) => ({
      id: node.id,
      tone:
        node.status === 'active' || node.status === 'query'
          ? 'active'
          : node.status === 'merged' || node.status === 'compressed'
            ? 'success'
            : 'default',
      cells: {
        node: node.label,
        parent: node.parentLabel,
        root: node.rootLabel,
        rank: node.rank,
        size: node.size,
        status: this.statusTag(node),
        tags: node.tags.map((tag) => this.traceTag(tag)),
      },
    })),
  );
  readonly edgeRows = computed<readonly DsuEdgeTrace[]>(() => this.state()?.edges ?? []);
  readonly compactGroups = computed(() =>
    [...(this.state()?.groups ?? [])].sort((left, right) => {
      if (left.active !== right.active) return left.active ? -1 : 1;
      return left.rootLabel.localeCompare(right.rootLabel);
    }),
  );

  tagIcon(tag: DsuTraceTag | 'accepted' | 'rejected'): IconDefinition {
    return TAG_LEGEND.find((item) => item.id === tag)?.icon ?? faCircleDot;
  }

  tagLabel(tag: DsuTraceTag | 'accepted' | 'rejected'): string {
    return TAG_LEGEND.find((item) => item.id === tag)?.label ?? tag;
  }

  statusTag(node: DsuNodeTrace): UiTagModel {
    return {
      label: node.status,
      tone: this.statusTone(node.status),
      appearance: 'soft',
      size: 'sm',
      uppercase: true,
    };
  }

  traceTag(tag: DsuTraceTag | 'accepted' | 'rejected'): UiTagModel {
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

  edgeLabel(edge: DsuEdgeTrace): string {
    const state = this.state();
    if (state?.mode === 'union-find') {
      if (edge.toLabel === 'find') return `find ${edge.fromLabel}`;
      return `${edge.fromLabel}-${edge.toLabel}`;
    }
    return `${edge.fromLabel}-${edge.toLabel}`;
  }

  edgeTag(edge: DsuEdgeTrace): 'accepted' | 'rejected' | null {
    if (edge.status === 'accepted') return 'accepted';
    if (edge.status === 'rejected') return 'rejected';
    return null;
  }

  private statusTone(status: DsuNodeTrace['status']): 'neutral' | 'warning' | 'accent' | 'success' {
    switch (status) {
      case 'active':
      case 'query':
        return 'warning';
      case 'root':
        return 'accent';
      case 'merged':
      case 'compressed':
        return 'success';
      default:
        return 'neutral';
    }
  }

  private tagTone(tag: DsuTraceTag | 'accepted' | 'rejected'): 'accent' | 'warning' | 'success' | 'danger' {
    switch (tag) {
      case 'root':
        return 'accent';
      case 'active':
      case 'query':
        return 'warning';
      case 'merged':
      case 'compressed':
      case 'accepted':
        return 'success';
      case 'rejected':
        return 'danger';
    }
  }
}
