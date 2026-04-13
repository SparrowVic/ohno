import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
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

@Component({
  selector: 'app-grid-trace-panel',
  imports: [FaIconComponent],
  templateUrl: './grid-trace-panel.html',
  styleUrl: './grid-trace-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GridTracePanel {
  readonly state = input<GridTraceState | null>(null);

  readonly legend = TAG_LEGEND;
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

  tagIcon(tag: GridTraceTag): IconDefinition {
    return TAG_LEGEND.find((item) => item.id === tag)?.icon ?? faCircleDot;
  }

  tagLabel(tag: GridTraceTag): string {
    return TAG_LEGEND.find((item) => item.id === tag)?.label ?? tag;
  }

  visibleRows(): readonly GridTraceCell[] {
    const state = this.state();
    if (!state) return [];
    return state.cells.filter((cell) => cell.status !== 'idle').sort((left, right) => left.row - right.row || left.col - right.col);
  }
}
