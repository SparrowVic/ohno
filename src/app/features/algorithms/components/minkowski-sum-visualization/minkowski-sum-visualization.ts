import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { I18N_KEY } from '../../../../core/i18n/i18n-keys';
import { TranslatableText, i18nText } from '../../../../core/i18n/translatable-text';
import {
  GeometryCoord,
  GeometryPolygonRegion,
  MinkowskiSumStepState,
  isMinkowskiSumState,
} from '../../models/geometry';
import { SortStep } from '../../models/sort-step';
import { VizHeader, VizHeaderTone } from '../viz-header/viz-header';
import { VizPanel } from '../viz-panel/viz-panel';

const I18N = I18N_KEY.features.algorithms.visualizations.minkowskiSum;

interface Bounds {
  readonly minX: number;
  readonly maxX: number;
  readonly minY: number;
  readonly maxY: number;
}

@Component({
  selector: 'app-minkowski-sum-visualization',
  imports: [TranslocoPipe, VizHeader, VizPanel],
  templateUrl: './minkowski-sum-visualization.html',
  styleUrl: './minkowski-sum-visualization.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MinkowskiSumVisualization {
  protected readonly I18N_KEY = I18N_KEY;
  readonly array = input.required<readonly number[]>();
  readonly step = input<SortStep | null>(null);
  readonly speed = input<number>(5);

  readonly geoState = computed<MinkowskiSumStepState | null>(() => {
    const geometry = this.step()?.geometry ?? null;
    return isMinkowskiSumState(geometry) ? geometry : null;
  });

  readonly obstacle = computed(() => this.findPolygon('obstacle'));
  readonly robot = computed(() => this.findPolygon('robot'));
  readonly reflected = computed(() => this.findPolygon('reflected'));
  readonly result = computed(() => this.findPolygon('result') ?? this.findPolygon('result-preview'));

  readonly phaseLabel = computed<TranslatableText>(() => {
    const phase = this.geoState()?.phase;
    switch (phase) {
      case 'init': return I18N.phases.init;
      case 'reflect': return I18N.phases.reflect;
      case 'seed': return I18N.phases.seed;
      case 'merge': return I18N.phases.merge;
      case 'complete': return I18N.phases.complete;
      default: return '';
    }
  });

  readonly actionText = computed<TranslatableText>(() => {
    const geo = this.geoState();
    if (!geo) return '';
    const merged = geo.mergedEdgeCount;
    const total = geo.totalEdges;
    return geo.activeSource
      ? i18nText(I18N.action.activeAndProgress, { active: geo.activeSource, merged, total })
      : i18nText(I18N.action.progress, { merged, total });
  });

  readonly headerTone = computed<VizHeaderTone>(() => {
    const phase = this.geoState()?.phase;
    if (phase === 'complete') return 'sorted';
    if (phase === 'merge') return 'swap';
    if (phase === 'reflect' || phase === 'seed') return 'compare';
    return 'default';
  });

  galleryPoints(region: GeometryPolygonRegion | undefined): string {
    return this.projectPoints(region?.vertices ?? []);
  }

  stagePoints(region: GeometryPolygonRegion | undefined): string {
    return this.projectPoints(region?.vertices ?? [], 8);
  }

  stageVertexTransform(vertex: GeometryCoord): string {
    const projected = this.project(vertex, this.boundsOf(this.result()?.vertices ?? []), 8);
    return `translate(${projected.x}, ${projected.y})`;
  }

  /** Map Minkowski's polygon tones to the shared `.geo-poly--*` palette.
   *  Input shapes (A / B) get accent / warm tones; reflected B stays
   *  preview-dashed; the final C-space hull reads as the result. */
  polygonToneClass(tone: GeometryPolygonRegion['tone']): string {
    switch (tone) {
      case 'shape-a':         return 'accent';
      case 'shape-b':         return 'warm';
      case 'shape-reflected': return 'preview';
      case 'result':          return 'result';
      case 'result-preview':  return 'preview';
      default:                return 'preview';
    }
  }

  private findPolygon(id: string): GeometryPolygonRegion | undefined {
    return this.geoState()?.polygons.find((polygon) => polygon.id === id);
  }

  private projectPoints(vertices: readonly GeometryCoord[], padding = 12): string {
    const bounds = this.boundsOf(vertices);
    return vertices
      .map((vertex) => {
        const projected = this.project(vertex, bounds, padding);
        return `${projected.x},${projected.y}`;
      })
      .join(' ');
  }

  private boundsOf(vertices: readonly GeometryCoord[]): Bounds {
    if (vertices.length === 0) {
      return { minX: -1, maxX: 1, minY: -1, maxY: 1 };
    }

    let minX = vertices[0]!.x;
    let maxX = vertices[0]!.x;
    let minY = vertices[0]!.y;
    let maxY = vertices[0]!.y;

    for (const vertex of vertices) {
      minX = Math.min(minX, vertex.x);
      maxX = Math.max(maxX, vertex.x);
      minY = Math.min(minY, vertex.y);
      maxY = Math.max(maxY, vertex.y);
    }

    if (maxX - minX < 1) {
      maxX = minX + 1;
    }
    if (maxY - minY < 1) {
      maxY = minY + 1;
    }

    return { minX, maxX, minY, maxY };
  }

  private project(
    vertex: GeometryCoord,
    bounds: Bounds,
    padding: number,
  ): { readonly x: number; readonly y: number } {
    const width = 100 - padding * 2;
    const height = 100 - padding * 2;
    const scale = Math.min(
      width / (bounds.maxX - bounds.minX),
      height / (bounds.maxY - bounds.minY),
    );
    const offsetX = (100 - (bounds.maxX - bounds.minX) * scale) / 2;
    const offsetY = (100 - (bounds.maxY - bounds.minY) * scale) / 2;

    return {
      x: (vertex.x - bounds.minX) * scale + offsetX,
      y: 100 - ((vertex.y - bounds.minY) * scale + offsetY),
    };
  }
}
