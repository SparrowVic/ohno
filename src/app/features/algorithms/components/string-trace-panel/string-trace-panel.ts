import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faCheckDouble, faCrosshairs, faLink } from '@fortawesome/pro-solid-svg-icons';

import {
  BurrowsWheelerTraceState,
  HuffmanTraceState,
  KmpTraceState,
  ManacherTraceState,
  RabinKarpTraceState,
  RleTraceState,
  StringTraceState,
  ZAlgorithmTraceState,
  isBurrowsWheelerState,
  isHuffmanState,
  isKmpState,
  isManacherState,
  isRabinKarpState,
  isRleState,
  isZAlgorithmState,
} from '../../models/string';
import { SegmentedPanel } from '../../../../shared/components/segmented-panel/segmented-panel';
import { SegmentedPanelSection } from '../../../../shared/components/segmented-panel/segmented-panel-section';

@Component({
  selector: 'app-string-trace-panel',
  imports: [FaIconComponent, SegmentedPanel, SegmentedPanelSection],
  templateUrl: './string-trace-panel.html',
  styleUrl: './string-trace-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StringTracePanel {
  readonly state = input.required<StringTraceState | null>();

  readonly kmpState = computed<KmpTraceState | null>(() => {
    const state = this.state();
    return isKmpState(state) ? state : null;
  });
  readonly rabinState = computed<RabinKarpTraceState | null>(() => {
    const state = this.state();
    return isRabinKarpState(state) ? state : null;
  });
  readonly zState = computed<ZAlgorithmTraceState | null>(() => {
    const state = this.state();
    return isZAlgorithmState(state) ? state : null;
  });
  readonly manacherState = computed<ManacherTraceState | null>(() => {
    const state = this.state();
    return isManacherState(state) ? state : null;
  });
  readonly bwtState = computed<BurrowsWheelerTraceState | null>(() => {
    const state = this.state();
    return isBurrowsWheelerState(state) ? state : null;
  });
  readonly rleState = computed<RleTraceState | null>(() => {
    const state = this.state();
    return isRleState(state) ? state : null;
  });
  readonly huffmanState = computed<HuffmanTraceState | null>(() => {
    const state = this.state();
    return isHuffmanState(state) ? state : null;
  });

  readonly legend = [
    { label: 'Current focus', icon: faCrosshairs },
    { label: 'Reusable shortcut / structure', icon: faLink },
    { label: 'Confirmed result', icon: faCheckDouble },
  ] as const;

  failurePreview(state: KmpTraceState): readonly number[] {
    return state.failure;
  }

  zPreview(state: ZAlgorithmTraceState): readonly number[] {
    return state.zValues;
  }

  radiiPreview(state: ManacherTraceState): readonly number[] {
    return state.radii;
  }

  groupPreview(state: BurrowsWheelerTraceState): readonly string[] {
    return state.runGroups.map((group) => `${group.count}×${group.char}`);
  }

  formatRatio(value: number | null): string {
    return value === null ? '—' : `${value.toFixed(2)}x`;
  }
}
