import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { I18N_KEY } from '../../../../core/i18n/i18n-keys';
import { TranslatableText, i18nText } from '../../../../core/i18n/translatable-text';
import {
  ClosestPairStepState,
  GeometryBand,
  GeometryPairLine,
  GeometryPoint,
  isClosestPairState,
} from '../../models/geometry';
import { SortStep } from '../../models/sort-step';
import { VizHeader, VizHeaderTone } from '../viz-header/viz-header';
import { VizPanel } from '../viz-panel/viz-panel';

const I18N = I18N_KEY.features.algorithms.visualizations.closestPair;

@Component({
  selector: 'app-closest-pair-visualization',
  imports: [VizHeader, VizPanel],
  templateUrl: './closest-pair-visualization.html',
  styleUrl: './closest-pair-visualization.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClosestPairVisualization {
  readonly array = input.required<readonly number[]>();
  readonly step = input<SortStep | null>(null);
  readonly speed = input<number>(5);

  readonly geoState = computed<ClosestPairStepState | null>(() => {
    const geometry = this.step()?.geometry ?? null;
    return isClosestPairState(geometry) ? geometry : null;
  });

  readonly points = computed(() => this.geoState()?.points ?? []);
  readonly bands = computed(() => this.geoState()?.bands ?? []);
  readonly dividers = computed(() => this.geoState()?.dividers ?? []);
  readonly pairLines = computed(() => this.geoState()?.pairLines ?? []);

  private readonly pointMap = computed(() => {
    const map = new Map<number, GeometryPoint>();
    for (const point of this.points()) {
      map.set(point.id, point);
    }
    return map;
  });

  readonly phaseLabel = computed<TranslatableText>(() => {
    const phase = this.geoState()?.phase;
    switch (phase) {
      case 'init': return I18N.phases.init;
      case 'sort': return I18N.phases.sort;
      case 'divide': return I18N.phases.divide;
      case 'base': return I18N.phases.base;
      case 'merge': return I18N.phases.merge;
      case 'strip': return I18N.phases.strip;
      case 'compare':
      case 'compare-strip':
        return I18N.phases.compare;
      case 'update': return I18N.phases.update;
      case 'complete': return I18N.phases.complete;
      default: return '';
    }
  });

  readonly actionText = computed<TranslatableText>(() => {
    const geo = this.geoState();
    if (!geo) return '';
    const best = geo.bestDistance;
    const region = geo.regionLabel;
    if (best !== null && best !== undefined) {
      return i18nText(I18N.action.regionAndBest, { region, best: best.toFixed(2) });
    }
    return region ?? '';
  });

  readonly headerTone = computed<VizHeaderTone>(() => {
    const phase = this.geoState()?.phase;
    if (phase === 'complete') return 'sorted';
    if (phase === 'update') return 'sorted';
    if (phase === 'compare' || phase === 'compare-strip') return 'swap';
    if (phase === 'strip' || phase === 'merge') return 'compare';
    return 'default';
  });

  ptSvgX(id: number): number {
    return this.pointMap().get(id)?.x ?? 0;
  }

  ptSvgY(id: number): number {
    return 100 - (this.pointMap().get(id)?.y ?? 0);
  }

  ptTransform(point: GeometryPoint): string {
    return `translate(${point.x}, ${100 - point.y})`;
  }

  pairMidX(pair: GeometryPairLine): number {
    const [left, right] = pair.pointIds;
    return (this.ptSvgX(left) + this.ptSvgX(right)) / 2;
  }

  pairMidY(pair: GeometryPairLine): number {
    const [left, right] = pair.pointIds;
    return (this.ptSvgY(left) + this.ptSvgY(right)) / 2 - 3.4;
  }

  showGlow(point: GeometryPoint): boolean {
    return point.status === 'compare' || point.status === 'best' || point.status === 'strip';
  }

  bandOpacity(band: GeometryBand): number {
    const depth = band.depth ?? 0;
    switch (band.tone) {
      case 'left':
      case 'right':
        return Math.max(0.08, 0.16 - depth * 0.02);
      case 'strip':
        return 0.2;
      default:
        return Math.max(0.04, 0.08 - depth * 0.01);
    }
  }

  /** Map the generator's status string to the shared `.geo-point--*`
   *  tone modifier. Keeps the generator's vocabulary (compare, best,
   *  strip, left, right, dimmed, default) pointing at the right
   *  visual recipe without polluting the template with switch logic. */
  pointToneClass(status: GeometryPoint['status']): string {
    switch (status) {
      case 'compare': return 'active';
      case 'best':    return 'hit';
      case 'strip':   return 'route';
      case 'left':    return 'accent';
      case 'right':   return 'warm';
      case 'dimmed':  return 'muted';
      default:        return 'default';
    }
  }

  /** Same mapping for the pair line connecting two points. */
  pairToneClass(tone: GeometryPairLine['tone']): string {
    switch (tone) {
      case 'candidate': return 'candidate';
      case 'best':      return 'best';
      case 'final':     return 'final';
      default:          return 'active';
    }
  }
}
