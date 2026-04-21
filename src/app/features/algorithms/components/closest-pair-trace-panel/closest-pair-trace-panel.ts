import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

import { AppLanguageService } from '../../../../core/i18n/app-language.service';
import { I18N_KEY, I18nKey } from '../../../../core/i18n/i18n-keys';
import { ClosestPairStepState, GeometryPoint } from '../../models/geometry';
import { SegmentedPanel } from '../../../../shared/components/segmented-panel/segmented-panel';
import { SegmentedPanelSection } from '../../../../shared/components/segmented-panel/segmented-panel-section';

@Component({
  selector: 'app-closest-pair-trace-panel',
  imports: [SegmentedPanel, SegmentedPanelSection, TranslocoPipe],
  templateUrl: './closest-pair-trace-panel.html',
  styleUrl: './closest-pair-trace-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClosestPairTracePanel {
  private readonly language = inject(AppLanguageService);
  private readonly transloco = inject(TranslocoService);

  protected readonly I18N_KEY = I18N_KEY;
  readonly state = input<ClosestPairStepState | null>(null);

  private readonly emptyPair = {
    left: undefined,
    right: undefined,
  } as const;

  readonly hasCurrentPair = computed(() => !!this.state()?.currentPair);
  readonly currentPairSlot = computed(
    () => this.resolvePair(this.state()?.currentPair ?? null) ?? this.emptyPair,
  );
  readonly hasBestPair = computed(() => !!this.state()?.bestPair);
  readonly bestPairSlot = computed(
    () => this.resolvePair(this.state()?.bestPair ?? null) ?? this.emptyPair,
  );
  readonly stripCount = computed(
    () => this.state()?.points.filter((point) => point.status === 'strip').length ?? 0,
  );
  readonly phaseLabel = computed(() => {
    switch (this.state()?.phase ?? '') {
      case 'init':
        return this.translate(I18N_KEY.features.algorithms.tracePanels.closestPair.phases.init);
      case 'sort':
        return this.translate(I18N_KEY.features.algorithms.tracePanels.closestPair.phases.sort);
      case 'divide':
        return this.translate(I18N_KEY.features.algorithms.tracePanels.closestPair.phases.divide);
      case 'base':
        return this.translate(I18N_KEY.features.algorithms.tracePanels.closestPair.phases.base);
      case 'merge':
        return this.translate(I18N_KEY.features.algorithms.tracePanels.closestPair.phases.merge);
      case 'strip':
        return this.translate(I18N_KEY.features.algorithms.tracePanels.closestPair.phases.strip);
      case 'compare':
      case 'compare-strip':
        return this.translate(I18N_KEY.features.algorithms.tracePanels.closestPair.phases.compare);
      case 'update':
        return this.translate(I18N_KEY.features.algorithms.tracePanels.closestPair.phases.update);
      case 'complete':
        return this.translate(I18N_KEY.features.algorithms.tracePanels.closestPair.phases.complete);
      default:
        return this.state()?.phase ?? '';
    }
  });

  formatDistance(value: number | null | undefined): string {
    return value === null || value === undefined ? '—' : value.toFixed(2);
  }

  formatCoord(point: GeometryPoint | undefined): string {
    if (!point) return '(—, —)';
    return `(${point.x.toFixed(1)}, ${point.y.toFixed(1)})`;
  }

  formatPairLabel(pair: {
    readonly left: GeometryPoint | undefined;
    readonly right: GeometryPoint | undefined;
  }): string {
    return `P${pair.left?.id ?? '—'} · P${pair.right?.id ?? '—'}`;
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

  private translate(key: I18nKey, params?: Record<string, string | number>): string {
    this.language.activeLang();
    return this.transloco.translate(key, params);
  }
}
