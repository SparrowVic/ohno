import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
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

@Component({
  selector: 'app-matrix-trace-panel',
  imports: [FaIconComponent],
  templateUrl: './matrix-trace-panel.html',
  styleUrl: './matrix-trace-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatrixTracePanel {
  readonly state = input<MatrixTraceState | null>(null);

  readonly legend = TAG_LEGEND;
  readonly visibleRows = computed<readonly MatrixCell[]>(() =>
    (this.state()?.cells ?? [])
      .filter((cell) => cell.status !== 'idle' || cell.tags.length > 0)
      .sort((left, right) => left.row - right.row || left.col - right.col),
  );

  tagIcon(tag: MatrixTraceTag): IconDefinition {
    return TAG_LEGEND.find((item) => item.id === tag)?.icon ?? faCircle;
  }

  tagLabel(tag: MatrixTraceTag): string {
    return TAG_LEGEND.find((item) => item.id === tag)?.label ?? tag;
  }
}
