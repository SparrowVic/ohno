import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
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

@Component({
  selector: 'app-dp-trace-panel',
  imports: [FaIconComponent, SegmentedPanel, SegmentedPanelSection],
  templateUrl: './dp-trace-panel.html',
  styleUrl: './dp-trace-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DpTracePanel {
  readonly state = input<DpTraceState | null>(null);
  readonly legend = TAG_LEGEND;
  readonly visibleRows = computed<readonly DpCell[]>(() =>
    (this.state()?.cells ?? [])
      .filter((cell) => cell.status !== 'idle' || cell.tags.length > 0)
      .sort((left, right) => left.row - right.row || left.col - right.col),
  );

  tagIcon(tag: DpTraceTag): IconDefinition {
    return TAG_LEGEND.find((item) => item.id === tag)?.icon ?? faSquareDashed;
  }

  tagLabel(tag: DpTraceTag): string {
    return TAG_LEGEND.find((item) => item.id === tag)?.label ?? tag;
  }
}
