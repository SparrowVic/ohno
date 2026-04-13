import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { ClosestPairStepState, GeometryPoint } from '../../models/geometry';

@Component({
  selector: 'app-closest-pair-trace-panel',
  imports: [],
  templateUrl: './closest-pair-trace-panel.html',
  styleUrl: './closest-pair-trace-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClosestPairTracePanel {
  readonly state = input<ClosestPairStepState | null>(null);

  readonly currentPairPoints = computed(() => this.resolvePair(this.state()?.currentPair ?? null));
  readonly bestPairPoints = computed(() => this.resolvePair(this.state()?.bestPair ?? null));
  readonly stripCount = computed(
    () => this.state()?.points.filter((point) => point.status === 'strip').length ?? 0,
  );
  readonly phaseLabel = computed(() => {
    switch (this.state()?.phase ?? '') {
      case 'init': return 'Point Field';
      case 'sort': return 'Dual Sorting';
      case 'divide': return 'Divide';
      case 'base': return 'Base Case';
      case 'merge': return 'Merge';
      case 'strip': return 'Strip Window';
      case 'compare':
      case 'compare-strip':
        return 'Distance Check';
      case 'update': return 'Best Update';
      case 'complete': return 'Closest Pair';
      default: return this.state()?.phase ?? '';
    }
  });

  formatDistance(value: number | null | undefined): string {
    return value === null || value === undefined ? '—' : value.toFixed(2);
  }

  formatCoord(point: GeometryPoint | undefined): string {
    if (!point) return '—';
    return `(${point.x.toFixed(1)}, ${point.y.toFixed(1)})`;
  }

  private resolvePair(pair: readonly [number, number] | null): {
    readonly left: GeometryPoint | undefined;
    readonly right: GeometryPoint | undefined;
  } | null {
    const state = this.state();
    if (!state || !pair) return null;
    return {
      left: state.points.find((point) => point.id === pair[0]),
      right: state.points.find((point) => point.id === pair[1]),
    };
  }
}
