import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { CallStackLabTracePanel } from '../../components/call-stack-lab-trace-panel/call-stack-lab-trace-panel';
import { CallTreeLabTracePanel } from '../../components/call-tree-lab-trace-panel/call-tree-lab-trace-panel';
import { ClosestPairTracePanel } from '../../components/closest-pair-trace-panel/closest-pair-trace-panel';
import { DelaunayTracePanel } from '../../components/delaunay-trace-panel/delaunay-trace-panel';
import { DpTracePanel } from '../../components/dp-trace-panel/dp-trace-panel';
import { DsuTracePanel } from '../../components/dsu-trace-panel/dsu-trace-panel';
import { GeometryTracePanel } from '../../components/geometry-trace-panel/geometry-trace-panel';
import { GraphTracePanel } from '../../components/graph-trace-panel/graph-trace-panel';
import { GridTracePanel } from '../../components/grid-trace-panel/grid-trace-panel';
import { HalfPlaneTracePanel } from '../../components/half-plane-trace-panel/half-plane-trace-panel';
import { LineIntersectionTracePanel } from '../../components/line-intersection-trace-panel/line-intersection-trace-panel';
import { MatrixGridTracePanel } from '../../components/matrix-grid-trace-panel/matrix-grid-trace-panel';
import { MatrixTracePanel } from '../../components/matrix-trace-panel/matrix-trace-panel';
import { MinkowskiSumTracePanel } from '../../components/minkowski-sum-trace-panel/minkowski-sum-trace-panel';
import { NetworkTracePanel } from '../../components/network-trace-panel/network-trace-panel';
import { NumberLabTracePanel } from '../../components/number-lab-trace-panel/number-lab-trace-panel';
import { PointerLabTracePanel } from '../../components/pointer-lab-trace-panel/pointer-lab-trace-panel';
import { ScratchpadLabTracePanel } from '../../components/scratchpad-lab-trace-panel/scratchpad-lab-trace-panel';
import { SearchTracePanel } from '../../components/search-trace-panel/search-trace-panel';
import { SieveGridTracePanel } from '../../components/sieve-grid-trace-panel/sieve-grid-trace-panel';
import { SortTracePanel } from '../../components/sort-trace-panel/sort-trace-panel';
import { StringTracePanel } from '../../components/string-trace-panel/string-trace-panel';
import { SweepLineTracePanel } from '../../components/sweep-line-trace-panel/sweep-line-trace-panel';
import { TreeTracePanel } from '../../components/tree-trace-panel/tree-trace-panel';
import { VoronoiTracePanel } from '../../components/voronoi-trace-panel/voronoi-trace-panel';
import {
  isClosestPairState,
  isConvexHullState,
  isDelaunayTriangulationState,
  isHalfPlaneIntersectionState,
  isLineIntersectionState,
  isMinkowskiSumState,
  isSweepLineState,
  isVoronoiDiagramState,
} from '../../models/geometry';
import { VisualizationVariant } from '../../models/visualization-renderer';
import { WorkbenchTraces } from '../models/workbench-traces';
import { pickTracePanel } from './trace-host.utils';

@Component({
  selector: 'ohno-trace-host',
  imports: [
    CallStackLabTracePanel,
    CallTreeLabTracePanel,
    ClosestPairTracePanel,
    DelaunayTracePanel,
    DpTracePanel,
    DsuTracePanel,
    GeometryTracePanel,
    GraphTracePanel,
    GridTracePanel,
    HalfPlaneTracePanel,
    LineIntersectionTracePanel,
    MatrixGridTracePanel,
    MatrixTracePanel,
    MinkowskiSumTracePanel,
    NetworkTracePanel,
    NumberLabTracePanel,
    PointerLabTracePanel,
    ScratchpadLabTracePanel,
    SearchTracePanel,
    SieveGridTracePanel,
    SortTracePanel,
    StringTracePanel,
    SweepLineTracePanel,
    TreeTracePanel,
    VoronoiTracePanel,
  ],
  templateUrl: './trace-host.html',
  styleUrl: './trace-host.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OhnoTraceHost {
  readonly traces = input.required<WorkbenchTraces>();
  readonly algorithmId = input.required<string>();
  readonly variant = input.required<VisualizationVariant>();

  protected readonly panel = computed(() => pickTracePanel(this.traces(), this.variant()));

  protected readonly geometry = computed(() => {
    const state = this.traces().geometry;
    return {
      convexHull: isConvexHullState(state) ? state : null,
      closestPair: isClosestPairState(state) ? state : null,
      lineIntersection: isLineIntersectionState(state) ? state : null,
      halfPlane: isHalfPlaneIntersectionState(state) ? state : null,
      minkowski: isMinkowskiSumState(state) ? state : null,
      sweepLine: isSweepLineState(state) ? state : null,
      voronoi: isVoronoiDiagramState(state) ? state : null,
      delaunay: isDelaunayTriangulationState(state) ? state : null,
    };
  });
}
