import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
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

@Component({
  selector: 'app-search-trace-panel',
  imports: [FaIconComponent],
  templateUrl: './search-trace-panel.html',
  styleUrl: './search-trace-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchTracePanel {
  readonly state = input<SearchTraceState | null>(null);

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

  statusClass(row: SearchTraceRow): string {
    return row.status;
  }

  tagIcon(tag: SearchTraceTag): IconDefinition {
    return TAG_LEGEND.find((item) => item.id === tag)?.icon ?? faCircle;
  }

  tagLabel(tag: SearchTraceTag): string {
    return TAG_LEGEND.find((item) => item.id === tag)?.label ?? tag;
  }

  resultTone(): 'found' | 'searching' | 'idle' {
    const state = this.state();
    if (!state) return 'idle';
    if (state.resultIndices.length > 0) return 'found';
    if (state.probeIndex !== null || state.low !== null || state.high !== null) return 'searching';
    return 'idle';
  }
}
