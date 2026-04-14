import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import {
  faArrowTurnDownRight,
  faBarsProgress,
  faCheckDouble,
  faCircleDot,
  faCrosshairs,
  faLink,
  faRoute,
  faWandMagicSparkles,
} from '@fortawesome/pro-solid-svg-icons';

import {
  BurrowsWheelerTraceState,
  KmpTraceState,
  ManacherTraceState,
  RabinKarpTraceState,
  StringTraceState,
  ZAlgorithmTraceState,
  isBurrowsWheelerState,
  isKmpState,
  isManacherState,
  isRabinKarpState,
  isZAlgorithmState,
} from '../../models/string';

@Component({
  selector: 'app-string-trace-panel',
  imports: [FaIconComponent],
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

  readonly modeIcon = computed<IconDefinition>(() => {
    const state = this.state();
    if (!state) return faCircleDot;
    switch (state.mode) {
      case 'kmp':
        return faArrowTurnDownRight;
      case 'rabin-karp':
        return faWandMagicSparkles;
      case 'z-algorithm':
        return faBarsProgress;
      case 'manacher':
        return faRoute;
      case 'burrows-wheeler-transform':
        return faLink;
    }
  });

  readonly modeTone = computed(() => {
    const state = this.state();
    if (!state) return 'info';
    switch (state.mode) {
      case 'kmp':
        return 'accent';
      case 'rabin-karp':
        return 'warning';
      case 'z-algorithm':
        return 'info';
      case 'manacher':
        return 'success';
      case 'burrows-wheeler-transform':
        return 'accent';
    }
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
