import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { inject } from '@angular/core';

import { AppLanguageService } from '../../../../core/i18n/app-language.service';
import { I18N_KEY } from '../../../../core/i18n/i18n-keys';
import { TranslatableText, i18nText } from '../../../../core/i18n/translatable-text';
import { ConvexHullStepState, GeometryPoint, isConvexHullState } from '../../models/geometry';
import { SortStep } from '../../models/sort-step';
import { VizHeader, VizHeaderTone } from '../viz-header/viz-header';
import { VizPanel } from '../viz-panel/viz-panel';

const I18N = I18N_KEY.features.algorithms.visualizations.convexHull;

@Component({
  selector: 'app-convex-hull-visualization',
  imports: [VizHeader, VizPanel],
  templateUrl: './convex-hull-visualization.html',
  styleUrl: './convex-hull-visualization.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConvexHullVisualization {
  private readonly language = inject(AppLanguageService);
  private readonly transloco = inject(TranslocoService);

  readonly array = input.required<readonly number[]>();
  readonly step = input<SortStep | null>(null);
  readonly speed = input<number>(5);

  readonly geoState = computed<ConvexHullStepState | null>(() => {
    const geometry = this.step()?.geometry ?? null;
    return isConvexHullState(geometry) ? geometry : null;
  });
  readonly points = computed(() => this.geoState()?.points ?? []);
  readonly edges = computed(() => this.geoState()?.edges ?? []);
  readonly isComplete = computed(() => this.geoState()?.phase === 'complete');

  private readonly pointMap = computed(() => {
    const map = new Map<number, GeometryPoint>();
    for (const pt of this.points()) {
      map.set(pt.id, pt);
    }
    return map;
  });

  readonly phaseLabel = computed<TranslatableText>(() => {
    const phase = this.geoState()?.phase;
    switch (phase) {
      case 'init': return I18N.phases.init;
      case 'pivot': return I18N.phases.pivot;
      case 'sort': return I18N.phases.sort;
      case 'init-stack': return I18N.phases.initStack;
      case 'checking': return I18N.phases.checking;
      case 'pop': return I18N.phases.pop;
      case 'push': return I18N.phases.push;
      case 'complete': return I18N.phases.complete;
      default: return '';
    }
  });

  /** `detail` interpolates a turn acronym — resolve it through
   *  Transloco so locale-specific overrides stay in the catalog; touch
   *  `activeLang()` so the computed re-fires on language change. */
  readonly actionText = computed<TranslatableText>(() => {
    this.language.activeLang();
    const geo = this.geoState();
    if (!geo) return '';
    const hull = geo.stackIds.length;
    const cross = geo.crossProduct;
    if (cross !== null && cross !== undefined) {
      const turn = this.transloco.translate(cross > 0 ? I18N.turn.ccw : I18N.turn.cw);
      return i18nText(I18N.action.detail, { turn, cross: cross.toFixed(0), hull });
    }
    return i18nText(I18N.action.hullOnly, { hull });
  });

  readonly headerTone = computed<VizHeaderTone>(() => {
    const phase = this.geoState()?.phase;
    if (phase === 'complete') return 'sorted';
    if (phase === 'push') return 'sorted';
    if (phase === 'pop') return 'compare';
    if (phase === 'checking') return 'swap';
    return 'default';
  });

  ptSvgX(id: number): number {
    return this.pointMap().get(id)?.x ?? 0;
  }

  ptSvgY(id: number): number {
    return 100 - (this.pointMap().get(id)?.y ?? 0);
  }

  ptTransform(pt: GeometryPoint): string {
    return `translate(${pt.x}, ${100 - pt.y})`;
  }

  hullPolyPoints(): string {
    const geo = this.geoState();
    if (!geo) return '';
    return geo.stackIds
      .map((id) => {
        const pt = this.pointMap().get(id);
        return pt ? `${pt.x},${100 - pt.y}` : '';
      })
      .filter(Boolean)
      .join(' ');
  }

  turnTriPoints(): string | null {
    const geo = this.geoState();
    if (!geo?.turnCheck) return null;
    const [a, b, c] = geo.turnCheck;
    const ptA = this.pointMap().get(a);
    const ptB = this.pointMap().get(b);
    const ptC = this.pointMap().get(c);
    if (!ptA || !ptB || !ptC) return null;
    return [ptA, ptB, ptC].map((pt) => `${pt.x},${100 - pt.y}`).join(' ');
  }

  showGlow(pt: GeometryPoint): boolean {
    return (
      pt.status === 'pivot' ||
      pt.status === 'checking' ||
      pt.status === 'stack' ||
      pt.status === 'hull'
    );
  }
}
