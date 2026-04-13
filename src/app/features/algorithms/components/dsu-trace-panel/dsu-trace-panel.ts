import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
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

@Component({
  selector: 'app-dsu-trace-panel',
  imports: [FaIconComponent],
  templateUrl: './dsu-trace-panel.html',
  styleUrl: './dsu-trace-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DsuTracePanel {
  readonly state = input<DsuTraceState | null>(null);

  readonly legend = TAG_LEGEND;
  readonly activeLabel = computed(() => this.state()?.activePairLabel ?? '—');
  readonly visibleNodes = computed<readonly DsuNodeTrace[]>(() =>
    [...(this.state()?.nodes ?? [])].sort((left, right) => left.label.localeCompare(right.label)),
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
}
