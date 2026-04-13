import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { GeometryPoint, GeometryStepState } from '../../models/geometry';

@Component({
  selector: 'app-geometry-trace-panel',
  imports: [],
  templateUrl: './geometry-trace-panel.html',
  styleUrl: './geometry-trace-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GeometryTracePanel {
  readonly state = input<GeometryStepState | null>(null);

  readonly stackPoints = computed<readonly (GeometryPoint | undefined)[]>(() => {
    const s = this.state();
    if (!s) return [];
    return s.stackIds.map((id) => s.points.find((p) => p.id === id));
  });

  readonly turnPoints = computed(() => {
    const s = this.state();
    if (!s?.turnCheck) return null;
    const [a, b, c] = s.turnCheck;
    return {
      a: s.points.find((p) => p.id === a),
      b: s.points.find((p) => p.id === b),
      c: s.points.find((p) => p.id === c),
    };
  });

  readonly turnVerdict = computed(() => {
    const cp = this.state()?.crossProduct;
    if (cp === null || cp === undefined) return null;
    if (cp > 0) return { text: 'Left turn (CCW)', action: 'PUSH', tone: 'good' as const };
    if (cp === 0) return { text: 'Collinear', action: 'POP', tone: 'bad' as const };
    return { text: 'Right turn (CW)', action: 'POP', tone: 'bad' as const };
  });

  readonly pointCount = computed(() => this.state()?.points.length ?? 0);
  readonly hullCount = computed(() => this.state()?.stackIds.length ?? 0);
  readonly rejectedCount = computed(
    () => this.state()?.points.filter((p) => p.status === 'rejected').length ?? 0,
  );

  readonly phaseLabel = computed(() => {
    switch (this.state()?.phase ?? '') {
      case 'init': return 'Initializing';
      case 'pivot': return 'Finding Pivot';
      case 'sort': return 'Polar Sorting';
      case 'init-stack': return 'Stack Init';
      case 'checking': return 'Cross Product Check';
      case 'pop': return 'Popping Non-left Turn';
      case 'push': return 'Pushing to Stack';
      case 'complete': return 'Hull Complete!';
      default: return this.state()?.phase ?? '';
    }
  });

  fmt(val: number | undefined): string {
    return val !== undefined ? val.toFixed(1) : '—';
  }
}
