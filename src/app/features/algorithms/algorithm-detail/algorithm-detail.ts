import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';

import { AppLanguageService } from '../../../core/i18n/app-language.service';
import { APP_LANG } from '../../../core/i18n/app-lang';
import { getDifficultyLabel } from '../../../core/i18n/difficulty-label';
import { aStarPathfindingGenerator } from '../algorithms/a-star-pathfinding';
import { bfsGenerator } from '../algorithms/bfs';
import { bellmanFordGenerator } from '../algorithms/bellman-ford';
import { binarySearchGenerator } from '../algorithms/binary-search';
import { binarySearchVariantsGenerator } from '../algorithms/binary-search-variants';
import { bipartiteCheckGenerator } from '../algorithms/bipartite-check';
import { bridgesArticulationPointsGenerator } from '../algorithms/bridges-articulation-points';
import { burstBalloonsGenerator } from '../algorithms/burst-balloons';
import { bucketSortGenerator } from '../algorithms/bucket-sort';
import { bubbleSortGenerator } from '../algorithms/bubble-sort';
import { climbingStairsGenerator } from '../algorithms/climbing-stairs';
import { chromaticNumberGenerator } from '../algorithms/chromatic-number';
import { closestPairOfPointsGenerator, ClosestPairScenario } from '../algorithms/closest-pair-of-points';
import { coinChangeGenerator } from '../algorithms/coin-change';
import { connectedComponentsGenerator } from '../algorithms/connected-components';
import { countingSortGenerator } from '../algorithms/counting-sort';
import { cycleDetectionGenerator } from '../algorithms/cycle-detection';
import { dpConvexHullTrickGenerator } from '../algorithms/dp-convex-hull-trick';
import { dpOnTreesGenerator } from '../algorithms/dp-on-trees';
import { dpWithBitmaskGenerator } from '../algorithms/dp-with-bitmask';
import { dijkstraGenerator } from '../algorithms/dijkstra';
import { dinicMaxFlowGenerator } from '../algorithms/dinic-max-flow';
import { divideConquerDpOptimizationGenerator } from '../algorithms/divide-conquer-dp-optimization';
import { edmondsKarpGenerator } from '../algorithms/edmonds-karp';
import { dfsGenerator } from '../algorithms/dfs';
import { dominatorTreeGenerator } from '../algorithms/dominator-tree';
import { editDistanceGenerator } from '../algorithms/edit-distance';
import { eulerPathCircuitGenerator } from '../algorithms/euler-path-circuit';
import { fibonacciDpGenerator } from '../algorithms/fibonacci-dp';
import { floydWarshallGenerator } from '../algorithms/floyd-warshall';
import { floodFillGenerator } from '../algorithms/flood-fill';
import { halfPlaneIntersectionGenerator, HalfPlaneIntersectionScenario } from '../algorithms/half-plane-intersection';
import { heapSortGenerator } from '../algorithms/heap-sort';
import { insertionSortGenerator } from '../algorithms/insertion-sort';
import { knapsack01Generator } from '../algorithms/knapsack-01';
import { knuthDpOptimizationGenerator } from '../algorithms/knuth-dp-optimization';
import { kruskalsMstGenerator } from '../algorithms/kruskals-mst';
import { linearSearchGenerator } from '../algorithms/linear-search';
import { lineIntersectionGenerator, LineIntersectionScenario } from '../algorithms/line-intersection';
import { longestCommonSubsequenceGenerator } from '../algorithms/longest-common-subsequence';
import { longestIncreasingSubsequenceGenerator } from '../algorithms/longest-increasing-subsequence';
import { longestPalindromicSubsequenceGenerator } from '../algorithms/longest-palindromic-subsequence';
import { manacherGenerator } from '../algorithms/manacher';
import { matrixChainMultiplicationGenerator } from '../algorithms/matrix-chain-multiplication';
import { mergeSortGenerator } from '../algorithms/merge-sort';
import { minCostMaxFlowGenerator } from '../algorithms/min-cost-max-flow';
import { minkowskiSumGenerator, MinkowskiSumScenario } from '../algorithms/minkowski-sum';
import { kmpPatternMatchingGenerator } from '../algorithms/kmp-pattern-matching';
import { quickSortGenerator } from '../algorithms/quick-sort';
import { radixSortGenerator } from '../algorithms/radix-sort';
import { primsMstGenerator } from '../algorithms/prims-mst';
import { profileDpGenerator } from '../algorithms/profile-dp';
import { rabinKarpGenerator } from '../algorithms/rabin-karp';
import { regexMatchingDpGenerator } from '../algorithms/regex-matching-dp';
import { selectionSortGenerator } from '../algorithms/selection-sort';
import { shellSortGenerator } from '../algorithms/shell-sort';
import { sosDpGenerator } from '../algorithms/sos-dp';
import { subsetSumGenerator } from '../algorithms/subset-sum';
import { steinerTreeGenerator } from '../algorithms/steiner-tree';
import { sweepLineGenerator, SweepLineScenario } from '../algorithms/sweep-line';
import { tarjanSccGenerator } from '../algorithms/tarjan-scc';
import { timSortGenerator } from '../algorithms/tim-sort';
import { topologicalSortKahnGenerator } from '../algorithms/topological-sort-kahn';
import { travelingSalesmanDpGenerator } from '../algorithms/traveling-salesman-dp';
import { unionFindGenerator } from '../algorithms/union-find';
import { voronoiDiagramGenerator, VoronoiDiagramScenario } from '../algorithms/voronoi-diagram';
import { wildcardMatchingGenerator } from '../algorithms/wildcard-matching';
import { zAlgorithmGenerator } from '../algorithms/z-algorithm';
import { burrowsWheelerTransformGenerator } from '../algorithms/burrows-wheeler-transform';
import { convexHullGenerator, ConvexHullScenario } from '../algorithms/convex-hull';
import { delaunayTriangulationGenerator, DelaunayTriangulationScenario } from '../algorithms/delaunay-triangulation';
import { hopcroftKarpGenerator } from '../algorithms/hopcroft-karp';
import { hungarianAlgorithmGenerator } from '../algorithms/hungarian-algorithm';
import { kosarajuSccGenerator } from '../algorithms/kosaraju-scc';
import { A_STAR_PATHFINDING_CODE } from '../data/a-star-pathfinding-code';
import { BELLMAN_FORD_CODE } from '../data/bellman-ford-code';
import { BFS_CODE } from '../data/bfs-code';
import { BINARY_SEARCH_CODE } from '../data/binary-search-code';
import { BINARY_SEARCH_VARIANTS_CODE } from '../data/binary-search-variants-code';
import { BIPARTITE_CHECK_CODE } from '../data/bipartite-check-code';
import { BRIDGES_ARTICULATION_POINTS_CODE } from '../data/bridges-articulation-points-code';
import { BURST_BALLOONS_CODE } from '../data/burst-balloons-code';
import { BUCKET_SORT_CODE } from '../data/bucket-sort-code';
import { BUBBLE_SORT_CODE } from '../data/bubble-sort-code';
import { CLIMBING_STAIRS_CODE } from '../data/climbing-stairs-code';
import { CHROMATIC_NUMBER_CODE } from '../data/chromatic-number-code';
import { CLOSEST_PAIR_OF_POINTS_CODE } from '../data/closest-pair-of-points-code';
import { COIN_CHANGE_CODE } from '../data/coin-change-code';
import { CONNECTED_COMPONENTS_CODE } from '../data/connected-components-code';
import { COUNTING_SORT_CODE } from '../data/counting-sort-code';
import { CYCLE_DETECTION_CODE } from '../data/cycle-detection-code';
import { DFS_CODE } from '../data/dfs-code';
import { DIJKSTRA_CODE } from '../data/dijkstra-code';
import { DINIC_MAX_FLOW_CODE } from '../data/dinic-max-flow-code';
import { DOMINATOR_TREE_CODE } from '../data/dominator-tree-code';
import { DP_CONVEX_HULL_TRICK_CODE } from '../data/dp-convex-hull-trick-code';
import { DP_ON_TREES_CODE } from '../data/dp-on-trees-code';
import { DP_WITH_BITMASK_CODE } from '../data/dp-with-bitmask-code';
import { DIVIDE_CONQUER_DP_OPTIMIZATION_CODE } from '../data/divide-conquer-dp-optimization-code';
import { EDMONDS_KARP_CODE } from '../data/edmonds-karp-code';
import { EDIT_DISTANCE_CODE } from '../data/edit-distance-code';
import { EULER_PATH_CIRCUIT_CODE } from '../data/euler-path-circuit-code';
import { FIBONACCI_DP_CODE } from '../data/fibonacci-dp-code';
import { FLOYD_WARSHALL_CODE } from '../data/floyd-warshall-code';
import { FLOOD_FILL_CODE } from '../data/flood-fill-code';
import { HALF_PLANE_INTERSECTION_CODE } from '../data/half-plane-intersection-code';
import { HEAP_SORT_CODE } from '../data/heap-sort-code';
import { INSERTION_SORT_CODE } from '../data/insertion-sort-code';
import { KNAPSACK_01_CODE } from '../data/knapsack-01-code';
import { KNUTH_DP_OPTIMIZATION_CODE } from '../data/knuth-dp-optimization-code';
import { KRUSKALS_MST_CODE } from '../data/kruskals-mst-code';
import { LINEAR_SEARCH_CODE } from '../data/linear-search-code';
import { LINE_INTERSECTION_CODE } from '../data/line-intersection-code';
import { LONGEST_COMMON_SUBSEQUENCE_CODE } from '../data/longest-common-subsequence-code';
import { LONGEST_INCREASING_SUBSEQUENCE_CODE } from '../data/longest-increasing-subsequence-code';
import { LONGEST_PALINDROMIC_SUBSEQUENCE_CODE } from '../data/longest-palindromic-subsequence-code';
import { MANACHER_CODE } from '../data/manacher-code';
import { MATRIX_CHAIN_MULTIPLICATION_CODE } from '../data/matrix-chain-multiplication-code';
import { MERGE_SORT_CODE } from '../data/merge-sort-code';
import { MIN_COST_MAX_FLOW_CODE } from '../data/min-cost-max-flow-code';
import { MINKOWSKI_SUM_CODE } from '../data/minkowski-sum-code';
import { KMP_PATTERN_MATCHING_CODE } from '../data/kmp-pattern-matching-code';
import { PROFILE_DP_CODE } from '../data/profile-dp-code';
import { PRIMS_MST_CODE } from '../data/prims-mst-code';
import { QUICK_SORT_CODE } from '../data/quick-sort-code';
import { RADIX_SORT_CODE } from '../data/radix-sort-code';
import { RABIN_KARP_CODE } from '../data/rabin-karp-code';
import { REGEX_MATCHING_DP_CODE } from '../data/regex-matching-dp-code';
import { SELECTION_SORT_CODE } from '../data/selection-sort-code';
import { SHELL_SORT_CODE } from '../data/shell-sort-code';
import { SOS_DP_CODE } from '../data/sos-dp-code';
import { SUBSET_SUM_CODE } from '../data/subset-sum-code';
import { STEINER_TREE_CODE } from '../data/steiner-tree-code';
import { SWEEP_LINE_CODE } from '../data/sweep-line-code';
import { TARJAN_SCC_CODE } from '../data/tarjan-scc-code';
import { TIM_SORT_CODE } from '../data/tim-sort-code';
import { TOPOLOGICAL_SORT_KAHN_CODE } from '../data/topological-sort-kahn-code';
import { TRAVELING_SALESMAN_DP_CODE } from '../data/traveling-salesman-dp-code';
import { UNION_FIND_CODE } from '../data/union-find-code';
import { VORONOI_DIAGRAM_CODE } from '../data/voronoi-diagram-code';
import { WILDCARD_MATCHING_CODE } from '../data/wildcard-matching-code';
import { Z_ALGORITHM_CODE } from '../data/z-algorithm-code';
import { BURROWS_WHEELER_TRANSFORM_CODE } from '../data/burrows-wheeler-transform-code';
import { DpPresetOption, DpTraceState } from '../models/dp';
import { DsuTraceState } from '../models/dsu';
import { GeometryStepState } from '../models/geometry';
import { GraphStepState, WeightedGraphData } from '../models/graph';
import { GridTraceState } from '../models/grid';
import { MatrixTraceState } from '../models/matrix';
import { NetworkTraceState } from '../models/network';
import { SearchTraceState } from '../models/search';
import { StringPresetOption, StringTraceState } from '../models/string';
import { AlgorithmItem } from '../models/algorithm';
import { CodeLine, LegendItem, LogEntry } from '../models/detail';
import { HOPCROFT_KARP_CODE } from '../data/hopcroft-karp-code';
import { CONVEX_HULL_CODE } from '../data/convex-hull-code';
import { KOSARAJU_SCC_CODE } from '../data/kosaraju-scc-code';
import { DELAUNAY_TRIANGULATION_CODE } from '../data/delaunay-triangulation-code';
import { SortStep } from '../models/sort-step';
import { VisualizationOption } from '../models/visualization-option';
import { VisualizationVariant } from '../models/visualization-renderer';
import { AlgorithmRegistry } from '../registry/algorithm-registry';
import { VisualizationEngine } from '../services/visualization-engine';
import {
  BITMASK_DP_PRESETS,
  BURST_BALLOONS_PRESETS,
  CLIMBING_STAIRS_PRESETS,
  CHT_PRESETS,
  COIN_CHANGE_PRESETS,
  DIVIDE_CONQUER_PRESETS,
  EDIT_DISTANCE_PRESETS,
  FIBONACCI_PRESETS,
  KNAPSACK_PRESETS,
  KNUTH_PRESETS,
  LCS_PRESETS,
  LIS_PRESETS,
  LPS_PRESETS,
  MATRIX_CHAIN_PRESETS,
  PROFILE_PRESETS,
  REGEX_PRESETS,
  SOS_PRESETS,
  TREE_DP_PRESETS,
  SUBSET_SUM_PRESETS,
  TSP_PRESETS,
  WILDCARD_PRESETS,
  BitmaskDpScenario,
  BurstBalloonsScenario,
  ChtDpScenario,
  ClimbingStairsScenario,
  CoinChangeScenario,
  createBitmaskDpScenario,
  createEditDistanceScenario,
  createBurstBalloonsScenario,
  createChtDpScenario,
  createClimbingStairsScenario,
  createCoinChangeScenario,
  createDivideConquerDpScenario,
  createFibonacciScenario,
  createKnapsackScenario,
  createKnuthDpScenario,
  createLcsScenario,
  createLisScenario,
  createLpsScenario,
  createMatrixChainScenario,
  createProfileDpScenario,
  createRegexMatchingScenario,
  createSosDpScenario,
  createTreeDpScenario,
  createSubsetSumScenario,
  createTravelingSalesmanScenario,
  createWildcardMatchingScenario,
  DivideConquerDpScenario,
  EditDistanceScenario,
  FibonacciScenario,
  KnapsackScenario,
  KnuthDpScenario,
  LcsScenario,
  LisScenario,
  LpsScenario,
  MatrixChainScenario,
  ProfileDpScenario,
  RegexMatchingScenario,
  SosDpScenario,
  SubsetSumScenario,
  TreeDpScenario,
  TravelingSalesmanScenario,
  WildcardMatchingScenario,
} from '../utils/dp-scenarios';
import {
  createKruskalScenario,
  createUnionFindScenario,
  KruskalScenario,
  UnionFindScenario,
} from '../utils/dsu-scenarios';
import {
  generateBellmanFordGraph,
  generateBipartiteGraph,
  generateBridgesGraph,
  generateConnectedComponentsGraph,
  generateColoringGraph,
  generateCycleDetectionGraph,
  generateDagGraph,
  generateDijkstraGraph,
  generateDominatorGraph,
  generateEulerGraph,
  generateSccGraph,
  generateSteinerGraph,
  generateTraversalGraph,
} from '../utils/dijkstra-graph';
import { AStarScenario, createAStarScenario, createFloodFillScenario, FloodFillScenario } from '../utils/grid-scenarios';
import { HUNGARIAN_ALGORITHM_CODE } from '../data/hungarian-algorithm-code';
import {
  createFloydWarshallScenario,
  createHungarianScenario,
  FloydWarshallScenario,
  HungarianScenario,
} from '../utils/matrix-scenarios';
import {
  createEdmondsKarpScenario,
  createDinicScenario,
  createHopcroftKarpScenario,
  createMinCostMaxFlowScenario,
  DinicScenario,
  HopcroftKarpScenario,
  MinCostMaxFlowScenario,
} from '../utils/network-scenarios';
import {
  BWT_PRESETS,
  KMP_PRESETS,
  MANACHER_PRESETS,
  RABIN_KARP_PRESETS,
  Z_ALGORITHM_PRESETS,
  BurrowsWheelerScenario,
  KmpScenario,
  ManacherScenario,
  RabinKarpScenario,
  ZAlgorithmScenario,
  createBurrowsWheelerScenario,
  createKmpScenario,
  createManacherScenario,
  createRabinKarpScenario,
  createZAlgorithmScenario,
} from '../utils/string-scenarios';
import { LegendBar } from '../components/legend-bar/legend-bar';
import { SidePanel } from '../components/side-panel/side-panel';
import { VisualizationCanvas } from '../components/visualization-canvas/visualization-canvas';
import { VisualizationToolbar } from '../components/visualization-toolbar/visualization-toolbar';

const BAR_LEGEND: readonly LegendItem[] = [
  { label: 'Unsorted', color: 'var(--accent)', opacity: 0.5 },
  { label: 'Comparing', color: 'var(--compare-color)' },
  { label: 'Swapping', color: 'var(--swap-color)' },
  { label: 'Sorted', color: 'var(--sorted-color)' },
];

const BLOCK_LEGEND: readonly LegendItem[] = [
  { label: 'Unsorted', color: 'var(--accent)', opacity: 0.5 },
  { label: 'Comparing', color: 'var(--compare-color)' },
  { label: 'Swapping', color: 'var(--swap-color)' },
  { label: 'Sorted', color: 'var(--sorted-color)' },
  { label: 'Boundary', color: 'var(--accent)' },
];

const SOUND_LEGEND: readonly LegendItem[] = [
  { label: 'Unsorted', color: 'var(--accent)', opacity: 0.5 },
  { label: 'Comparing', color: 'var(--compare-color)' },
  { label: 'Swapping', color: 'var(--swap-color)' },
  { label: 'Sorted', color: 'var(--sorted-color)' },
  { label: 'Audio on compare/swap', color: 'var(--text-secondary)', opacity: 0.6 },
];

const RADIX_LEGEND: readonly LegendItem[] = [
  { label: 'Input stream', color: '#7c6ef0', opacity: 0.55 },
  { label: 'Active digit', color: '#38bdf8' },
  { label: 'Bucket lane', color: '#f59e0b' },
  { label: 'Gathered output', color: '#34d399' },
];

const DIJKSTRA_LEGEND: readonly LegendItem[] = [
  { label: 'Source', color: '#38bdf8' },
  { label: 'Frontier queue', color: '#7c6ef0' },
  { label: 'Current node', color: '#f0b429' },
  { label: 'Shortest-path tree', color: '#3ecf8e' },
  { label: 'Focused route', color: '#ffde59' },
  { label: 'Active edge relaxation', color: '#5eead4' },
];

const BFS_LEGEND: readonly LegendItem[] = [
  { label: 'Source', color: '#38bdf8' },
  { label: 'Queue frontier', color: '#7c6ef0' },
  { label: 'Current node', color: '#f0b429' },
  { label: 'BFS tree', color: '#3ecf8e' },
  { label: 'Focused route', color: '#ffde59' },
  { label: 'Inspected edge', color: '#5eead4' },
];

const DFS_LEGEND: readonly LegendItem[] = [
  { label: 'Source', color: '#38bdf8' },
  { label: 'Stack frontier', color: '#7c6ef0' },
  { label: 'Current node', color: '#f0b429' },
  { label: 'DFS tree', color: '#3ecf8e' },
  { label: 'Focused branch', color: '#ffde59' },
  { label: 'Inspected edge', color: '#5eead4' },
];

const TOPOLOGICAL_SORT_KAHN_LEGEND: readonly LegendItem[] = [
  { label: 'Seed node', color: '#38bdf8' },
  { label: 'Zero in-degree queue', color: '#7c6ef0' },
  { label: 'Current node', color: '#f0b429' },
  { label: 'Ordered node', color: '#3ecf8e' },
  { label: 'Directed dependency', color: '#5eead4' },
];

const CYCLE_DETECTION_LEGEND: readonly LegendItem[] = [
  { label: 'Entry node', color: '#38bdf8' },
  { label: 'Recursion stack', color: '#7c6ef0' },
  { label: 'Current node', color: '#f0b429' },
  { label: 'Closed node', color: '#3ecf8e' },
  { label: 'Cycle edge', color: '#5eead4' },
];

const CONNECTED_COMPONENTS_LEGEND: readonly LegendItem[] = [
  { label: 'Current seed / node', color: '#f0b429' },
  { label: 'Component frontier', color: '#7c6ef0' },
  { label: 'Assigned node', color: '#3ecf8e' },
  { label: 'Component tree edge', color: '#5eead4' },
];

const BIPARTITE_CHECK_LEGEND: readonly LegendItem[] = [
  { label: 'Side 0', color: '#38bdf8' },
  { label: 'Side 1', color: '#f59e0b' },
  { label: 'Queue frontier', color: '#7c6ef0' },
  { label: 'Conflict edge / node', color: '#f43f5e' },
];

const BELLMAN_FORD_LEGEND: readonly LegendItem[] = [
  { label: 'Source', color: '#38bdf8' },
  { label: 'Updated this pass', color: '#7c6ef0' },
  { label: 'Current relaxation', color: '#f0b429' },
  { label: 'Shortest-path tree', color: '#3ecf8e' },
  { label: 'Focused route', color: '#ffde59' },
  { label: 'Negative-cycle evidence', color: '#f43f5e' },
];

const PRIMS_MST_LEGEND: readonly LegendItem[] = [
  { label: 'Start node', color: '#38bdf8' },
  { label: 'Candidate frontier', color: '#7c6ef0' },
  { label: 'Current node', color: '#f0b429' },
  { label: 'MST edge', color: '#3ecf8e' },
  { label: 'Active edge check', color: '#5eead4' },
];

const BRIDGES_ARTICULATION_LEGEND: readonly LegendItem[] = [
  { label: 'DFS stack', color: '#7c6ef0' },
  { label: 'Current node', color: '#f0b429' },
  { label: 'Closed node', color: '#3ecf8e' },
  { label: 'Articulation point', color: '#f43f5e' },
  { label: 'Bridge edge', color: '#f43f5e' },
];

const TARJAN_SCC_LEGEND: readonly LegendItem[] = [
  { label: 'Seed / current node', color: '#f0b429' },
  { label: 'Tarjan stack', color: '#7c6ef0' },
  { label: 'Current inspect edge', color: '#5eead4' },
  { label: 'Finished SCC color', color: '#38bdf8' },
  { label: 'Back-edge low-link update', color: '#34d399' },
];

const KOSARAJU_SCC_LEGEND: readonly LegendItem[] = [
  { label: 'Seed / current node', color: '#f0b429' },
  { label: 'Pass 1 finish stack', color: '#7c6ef0' },
  { label: 'Pass 2 reversed edge', color: '#5eead4' },
  { label: 'Finished SCC color', color: '#38bdf8' },
  { label: 'Assigned component', color: '#34d399' },
];

const EULER_LEGEND: readonly LegendItem[] = [
  { label: 'Unused edge', color: 'rgba(255,255,255,0.22)' },
  { label: 'Current traversal edge', color: '#7c6ef0' },
  { label: 'Committed trail edge', color: '#3ecf8e' },
  { label: 'Odd start / end node', color: '#38bdf8' },
  { label: 'Sealed trail node', color: '#ffde59' },
];

const CHROMATIC_NUMBER_LEGEND: readonly LegendItem[] = [
  { label: 'Color class 1', color: 'rgba(56, 189, 248, 0.72)' },
  { label: 'Color class 2', color: 'rgba(139, 92, 246, 0.72)' },
  { label: 'Color class 3', color: 'rgba(52, 211, 153, 0.72)' },
  { label: 'Color class 4', color: 'rgba(245, 158, 11, 0.76)' },
  { label: 'Conflict edge', color: '#f43f5e' },
];

const DOMINATOR_TREE_LEGEND: readonly LegendItem[] = [
  { label: 'Entry block', color: '#38bdf8' },
  { label: 'Current predecessor inspect', color: '#f0b429' },
  { label: 'Stable dominator set', color: '#7c6ef0' },
  { label: 'Immediate dominator tree edge', color: '#3ecf8e' },
  { label: 'Current worklist block', color: '#5eead4' },
];

const STEINER_TREE_LEGEND: readonly LegendItem[] = [
  { label: 'Terminal node', color: 'rgba(56, 189, 248, 0.72)' },
  { label: 'Steiner connector', color: 'rgba(52, 211, 153, 0.74)' },
  { label: 'Weighted graph edge', color: 'rgba(255,255,255,0.22)' },
  { label: 'Exact selected tree edge', color: '#3ecf8e' },
  { label: 'Active subset root', color: '#f0b429' },
];

const SEARCH_LEGEND: readonly LegendItem[] = [
  { label: 'Candidate window', color: '#7c6ef0' },
  { label: 'Probe', color: '#f0b429' },
  { label: 'Visited', color: '#38bdf8' },
  { label: 'Eliminated', color: 'var(--text-secondary)', opacity: 0.55 },
  { label: 'Found', color: '#3ecf8e' },
];

const STRING_LEGEND: readonly LegendItem[] = [
  { label: 'Source symbols', color: 'rgba(255,255,255,0.42)' },
  { label: 'Current compare / center', color: '#f0b429' },
  { label: 'Reusable shortcut', color: '#38bdf8' },
  { label: 'Active window / box', color: '#7c6ef0' },
  { label: 'Confirmed hit / best output', color: '#3ecf8e' },
];

const FLOOD_FILL_LEGEND: readonly LegendItem[] = [
  { label: 'Seed cell', color: '#38bdf8' },
  { label: 'Current wave cell', color: '#f0b429' },
  { label: 'Fill frontier', color: '#7c6ef0' },
  { label: 'Painted region', color: '#3ecf8e' },
  { label: 'Rejected cell', color: 'var(--text-secondary)', opacity: 0.55 },
];

const A_STAR_LEGEND: readonly LegendItem[] = [
  { label: 'Start', color: '#38bdf8' },
  { label: 'Goal', color: '#f59e0b' },
  { label: 'Open set', color: '#7c6ef0' },
  { label: 'Current cell', color: '#f0b429' },
  { label: 'Closed set', color: '#5eead4' },
  { label: 'Final path', color: '#3ecf8e' },
];

const HOPCROFT_KARP_LEGEND: readonly LegendItem[] = [
  { label: 'Left partition', color: '#38bdf8' },
  { label: 'Right partition', color: '#f59e0b' },
  { label: 'BFS frontier', color: '#7c6ef0' },
  { label: 'Matching edge', color: '#3ecf8e' },
  { label: 'Augmenting path', color: '#5eead4' },
  { label: 'Current inspect edge', color: '#f0b429' },
];

const DINIC_LEGEND: readonly LegendItem[] = [
  { label: 'Source', color: '#38bdf8' },
  { label: 'Sink', color: '#f59e0b' },
  { label: 'Admissible level edge', color: '#7c6ef0' },
  { label: 'Positive flow', color: '#3ecf8e' },
  { label: 'Current augment path', color: '#5eead4' },
  { label: 'Saturated edge', color: 'var(--text-secondary)', opacity: 0.6 },
];

const EDMONDS_KARP_LEGEND: readonly LegendItem[] = [
  { label: 'Residual candidate edge', color: 'rgba(255,255,255,0.2)' },
  { label: 'BFS frontier', color: '#7c6ef0' },
  { label: 'Current inspect edge', color: '#f0b429' },
  { label: 'Augmenting path', color: '#5eead4' },
  { label: 'Positive flow / saturated edge', color: '#3ecf8e' },
];

const MIN_COST_MAX_FLOW_LEGEND: readonly LegendItem[] = [
  { label: 'Residual candidate edge', color: 'rgba(255,255,255,0.2)' },
  { label: 'Cheapest frontier', color: '#7c6ef0' },
  { label: 'Current cost relax edge', color: '#f0b429' },
  { label: 'Cheapest augmenting route', color: '#5eead4' },
  { label: 'Committed flow with price', color: '#3ecf8e' },
];

const FLOYD_WARSHALL_LEGEND: readonly LegendItem[] = [
  { label: 'Pivot row / column', color: '#38bdf8' },
  { label: 'Active compare cell', color: '#f0b429' },
  { label: 'Improved shortest path', color: '#3ecf8e' },
  { label: 'Reachable baseline', color: '#7c6ef0' },
  { label: 'Infinity / unreachable', color: 'var(--text-secondary)', opacity: 0.6 },
];

const HUNGARIAN_LEGEND: readonly LegendItem[] = [
  { label: 'Active reduction / inspect cell', color: '#f0b429' },
  { label: 'Zero candidate', color: '#7c6ef0' },
  { label: 'Covered line set', color: '#38bdf8' },
  { label: 'Chosen assignment', color: '#3ecf8e' },
  { label: 'Adjusted by matrix shift', color: '#5eead4' },
];

const KNAPSACK_LEGEND: readonly LegendItem[] = [
  { label: 'Base case', color: 'rgba(255,255,255,0.34)' },
  { label: 'Active DP cell', color: '#f0b429' },
  { label: 'Candidate predecessor', color: '#7c6ef0' },
  { label: 'Committed best value', color: '#3ecf8e' },
  { label: 'Backtrack path', color: '#ffde59' },
];

const LCS_LEGEND: readonly LegendItem[] = [
  { label: 'Base border', color: 'rgba(255,255,255,0.34)' },
  { label: 'Active compare cell', color: '#f0b429' },
  { label: 'Character match', color: '#38bdf8' },
  { label: 'Chosen carry / best value', color: '#3ecf8e' },
  { label: 'Recovered subsequence path', color: '#ffde59' },
];

const EDIT_DISTANCE_LEGEND: readonly LegendItem[] = [
  { label: 'Base border', color: 'rgba(255,255,255,0.34)' },
  { label: 'Active transition', color: '#f0b429' },
  { label: 'Free carry / char match', color: '#38bdf8' },
  { label: 'Stored cheapest edit count', color: '#3ecf8e' },
  { label: 'Recovered edit script', color: '#ffde59' },
];

const MATRIX_CHAIN_LEGEND: readonly LegendItem[] = [
  { label: 'Diagonal base interval', color: 'rgba(255,255,255,0.34)' },
  { label: 'Active interval', color: '#f0b429' },
  { label: 'Candidate subproblem', color: '#7c6ef0' },
  { label: 'Committed best split', color: '#3ecf8e' },
  { label: 'Optimal split trace', color: '#ffde59' },
];

const COIN_CHANGE_LEGEND: readonly LegendItem[] = [
  { label: 'Base amount / reachable zero', color: 'rgba(255,255,255,0.34)' },
  { label: 'Active amount check', color: '#f0b429' },
  { label: 'Candidate predecessor', color: '#7c6ef0' },
  { label: 'Committed min-coin answer', color: '#3ecf8e' },
  { label: 'Recovered coin path', color: '#ffde59' },
];

const SUBSET_SUM_LEGEND: readonly LegendItem[] = [
  { label: 'Base case', color: 'rgba(255,255,255,0.34)' },
  { label: 'Active sum check', color: '#f0b429' },
  { label: 'Candidate predecessor', color: '#7c6ef0' },
  { label: 'Reachable boolean state', color: '#3ecf8e' },
  { label: 'Recovered witness subset', color: '#ffde59' },
];

const LPS_LEGEND: readonly LegendItem[] = [
  { label: 'Diagonal single-char base', color: 'rgba(255,255,255,0.34)' },
  { label: 'Active interval', color: '#f0b429' },
  { label: 'Mirrored character pair', color: '#38bdf8' },
  { label: 'Committed interval answer', color: '#3ecf8e' },
  { label: 'Recovered palindrome trace', color: '#ffde59' },
];

const BURST_BALLOONS_LEGEND: readonly LegendItem[] = [
  { label: 'Active interval', color: '#f0b429' },
  { label: 'Candidate subinterval', color: '#7c6ef0' },
  { label: 'Saved last-burst split', color: '#38bdf8' },
  { label: 'Committed max-coin score', color: '#3ecf8e' },
  { label: 'Recovered burst order', color: '#ffde59' },
];

const WILDCARD_LEGEND: readonly LegendItem[] = [
  { label: 'Base border', color: 'rgba(255,255,255,0.34)' },
  { label: 'Active transition', color: '#f0b429' },
  { label: 'Direct char / ? match', color: '#38bdf8' },
  { label: 'Reachable wildcard state', color: '#3ecf8e' },
  { label: 'Recovered match route', color: '#ffde59' },
];

const LIS_LEGEND: readonly LegendItem[] = [
  { label: 'Input strip / base value', color: 'rgba(255,255,255,0.34)' },
  { label: 'Active end index', color: '#f0b429' },
  { label: 'Candidate predecessor', color: '#7c6ef0' },
  { label: 'Committed LIS length', color: '#3ecf8e' },
  { label: 'Recovered subsequence', color: '#ffde59' },
];

const CLIMBING_STAIRS_LEGEND: readonly LegendItem[] = [
  { label: 'Base landing', color: 'rgba(255,255,255,0.34)' },
  { label: 'Active stair', color: '#f0b429' },
  { label: 'Previous two landings', color: '#7c6ef0' },
  { label: 'Committed ways count', color: '#3ecf8e' },
];

const FIBONACCI_LEGEND: readonly LegendItem[] = [
  { label: 'Base term', color: 'rgba(255,255,255,0.34)' },
  { label: 'Active term', color: '#f0b429' },
  { label: 'Previous cache terms', color: '#7c6ef0' },
  { label: 'Committed Fibonacci value', color: '#3ecf8e' },
];

const REGEX_LEGEND: readonly LegendItem[] = [
  { label: 'Base border', color: 'rgba(255,255,255,0.34)' },
  { label: 'Active regex state', color: '#f0b429' },
  { label: 'Dot / literal match', color: '#38bdf8' },
  { label: 'Reachable regex state', color: '#3ecf8e' },
  { label: 'Recovered derivation route', color: '#ffde59' },
];

const TSP_LEGEND: readonly LegendItem[] = [
  { label: 'Start subset', color: 'rgba(255,255,255,0.34)' },
  { label: 'Active subset expansion', color: '#f0b429' },
  { label: 'Candidate predecessor state', color: '#7c6ef0' },
  { label: 'Committed subset route', color: '#3ecf8e' },
  { label: 'Recovered optimal tour', color: '#ffde59' },
];

const SOS_LEGEND: readonly LegendItem[] = [
  { label: 'Base subset row', color: 'rgba(255,255,255,0.34)' },
  { label: 'Active SOS state', color: '#f0b429' },
  { label: 'Candidate source states', color: '#7c6ef0' },
  { label: 'Committed aggregated value', color: '#3ecf8e' },
  { label: 'Recovered contributing submasks', color: '#ffde59' },
];

const PROFILE_LEGEND: readonly LegendItem[] = [
  { label: 'Empty frontier base', color: 'rgba(255,255,255,0.34)' },
  { label: 'Active profile state', color: '#f0b429' },
  { label: 'Candidate predecessor profile', color: '#7c6ef0' },
  { label: 'Committed tiling count', color: '#3ecf8e' },
  { label: 'Recovered frontier route', color: '#ffde59' },
];

const TREE_DP_LEGEND: readonly LegendItem[] = [
  { label: 'Node weight base', color: 'rgba(255,255,255,0.34)' },
  { label: 'Active parent node', color: '#f0b429' },
  { label: 'Child subtree being merged', color: '#7c6ef0' },
  { label: 'Committed subtree DP', color: '#3ecf8e' },
  { label: 'Recovered independent set', color: '#ffde59' },
];

const BITMASK_DP_LEGEND: readonly LegendItem[] = [
  { label: 'Empty-mask base', color: 'rgba(255,255,255,0.34)' },
  { label: 'Active subset state', color: '#f0b429' },
  { label: 'Candidate predecessor mask', color: '#7c6ef0' },
  { label: 'Committed subset cost', color: '#3ecf8e' },
  { label: 'Recovered assignment path', color: '#ffde59' },
];

const CHT_LEGEND: readonly LegendItem[] = [
  { label: 'Base point', color: 'rgba(255,255,255,0.34)' },
  { label: 'Active query point', color: '#f0b429' },
  { label: 'Candidate predecessor line', color: '#7c6ef0' },
  { label: 'Committed query answer', color: '#3ecf8e' },
  { label: 'Recovered transition chain', color: '#ffde59' },
];

const DIVIDE_CONQUER_LEGEND: readonly LegendItem[] = [
  { label: 'Base DP state', color: 'rgba(255,255,255,0.34)' },
  { label: 'Active midpoint cell', color: '#f0b429' },
  { label: 'Candidate split source', color: '#7c6ef0' },
  { label: 'Committed midpoint answer', color: '#3ecf8e' },
  { label: 'Recovered partition cuts', color: '#ffde59' },
];

const KNUTH_LEGEND: readonly LegendItem[] = [
  { label: 'Diagonal base interval', color: 'rgba(255,255,255,0.34)' },
  { label: 'Active interval', color: '#f0b429' },
  { label: 'Candidate subinterval', color: '#7c6ef0' },
  { label: 'Committed split window answer', color: '#3ecf8e' },
  { label: 'Recovered merge tree', color: '#ffde59' },
];

const UNION_FIND_LEGEND: readonly LegendItem[] = [
  { label: 'Root representative', color: '#38bdf8' },
  { label: 'Active / queried node', color: '#f0b429' },
  { label: 'Merged / compressed node', color: '#3ecf8e' },
  { label: 'Pending operation', color: '#7c6ef0' },
  { label: 'Completed operation', color: '#5eead4' },
];

const KRUSKAL_LEGEND: readonly LegendItem[] = [
  { label: 'Current edge check', color: '#f0b429' },
  { label: 'Accepted MST edge', color: '#3ecf8e' },
  { label: 'Rejected cycle edge', color: '#f43f5e' },
  { label: 'Current DSU roots', color: '#38bdf8' },
  { label: 'Pending sorted edge', color: '#7c6ef0' },
];

const CONVEX_HULL_LEGEND: readonly LegendItem[] = [
  { label: 'Pivot (base point)', color: '#38bdf8' },
  { label: 'Sorted (waiting)', color: '#94a3b8', opacity: 0.7 },
  { label: 'Checking (cross product)', color: '#f0b429' },
  { label: 'Stack (hull candidate)', color: '#7c6ef0' },
  { label: 'Hull vertex (final)', color: '#3ecf8e' },
  { label: 'Rejected (interior point)', color: 'rgba(244,63,94,0.55)' },
];

const CLOSEST_PAIR_LEGEND: readonly LegendItem[] = [
  { label: 'Left recursive half', color: '#38bdf8' },
  { label: 'Right recursive half', color: '#fb923c' },
  { label: 'Strip corridor candidate', color: '#2dd4bf' },
  { label: 'Current distance check', color: '#f0b429' },
  { label: 'Best pair so far', color: '#ffde59' },
];

const LINE_INTERSECTION_LEGEND: readonly LegendItem[] = [
  { label: 'Pending segment', color: 'rgba(148,163,184,0.55)' },
  { label: 'Active sweep segment', color: '#5eead4' },
  { label: 'Focused event segment', color: '#f0b429' },
  { label: 'Confirmed crossing point', color: '#38bdf8' },
  { label: 'Sweep line', color: '#fff176' },
];

const HALF_PLANE_LEGEND: readonly LegendItem[] = [
  { label: 'Current boundary line', color: '#ffde59' },
  { label: 'Already applied constraint', color: '#2dd4bf' },
  { label: 'Forbidden side', color: 'rgba(244,63,94,0.52)' },
  { label: 'Feasible polygon', color: '#ffde59' },
  { label: 'Final intersection polygon', color: '#2dd4bf' },
];

const MINKOWSKI_SUM_LEGEND: readonly LegendItem[] = [
  { label: 'Obstacle polygon A', color: 'rgba(244,63,94,0.6)' },
  { label: 'Robot polygon B', color: '#38bdf8' },
  { label: "Reflected robot -B", color: '#7c6ef0' },
  { label: 'Growing sum path', color: '#ffde59' },
  { label: 'Final configuration obstacle', color: '#2dd4bf' },
];

const SWEEP_LINE_LEGEND: readonly LegendItem[] = [
  { label: 'Pending rectangle', color: 'rgba(148,163,184,0.5)' },
  { label: 'Active rectangle at sweep x', color: '#5eead4' },
  { label: 'Focused event rectangle', color: '#f0b429' },
  { label: 'Merged vertical coverage span', color: '#ffde59' },
  { label: 'Sweep progress region', color: 'rgba(45,212,191,0.32)' },
];

const VORONOI_LEGEND: readonly LegendItem[] = [
  { label: 'Site points', color: 'rgba(255,255,255,0.92)' },
  { label: 'Active site event', color: '#ff7a45' },
  { label: 'Settled Voronoi cell', color: 'rgba(186,230,253,0.5)' },
  { label: 'Current cell freeze', color: '#ff7a45' },
  { label: 'Descending sweep line', color: '#ff7a45' },
];

const DELAUNAY_LEGEND: readonly LegendItem[] = [
  { label: 'Committed triangle mesh', color: 'rgba(56,189,248,0.45)' },
  { label: 'Current candidate triangle', color: '#f0b429' },
  { label: 'Active circumcircle', color: '#ffde59' },
  { label: 'Committed mesh edges', color: 'rgba(186,230,253,0.5)' },
  { label: 'Active triangle vertices', color: '#ffde59' },
];

const CONVEX_HULL_VARIANT_OPTIONS: readonly VisualizationOption[] = [
  { value: 'convex-hull', label: 'Point Cloud' },
];

const CLOSEST_PAIR_VARIANT_OPTIONS: readonly VisualizationOption[] = [
  { value: 'closest-pair', label: 'Divide & Strip' },
];

const LINE_INTERSECTION_VARIANT_OPTIONS: readonly VisualizationOption[] = [
  { value: 'line-intersection', label: 'Laser Sweep' },
];

const HALF_PLANE_VARIANT_OPTIONS: readonly VisualizationOption[] = [
  { value: 'half-plane', label: 'Constraint Clip' },
];

const MINKOWSKI_SUM_VARIANT_OPTIONS: readonly VisualizationOption[] = [
  { value: 'minkowski-sum', label: 'Vector Merge' },
];

const SWEEP_LINE_VARIANT_OPTIONS: readonly VisualizationOption[] = [
  { value: 'sweep-line', label: 'Area Scanner' },
];

const VORONOI_VARIANT_OPTIONS: readonly VisualizationOption[] = [
  { value: 'voronoi', label: 'Crystal Cells' },
];

const DELAUNAY_VARIANT_OPTIONS: readonly VisualizationOption[] = [
  { value: 'delaunay', label: 'Triangle Mesh' },
];

const BUBBLE_VARIANT_OPTIONS: readonly VisualizationOption[] = [
  { value: 'bar', label: 'Bar Chart' },
  { value: 'block', label: 'Block Swap' },
  { value: 'gradient', label: 'Color Gradient' },
  { value: 'dot', label: 'Dot Plot' },
  { value: 'radial', label: 'Radial Circle' },
  { value: 'sound', label: 'Sound Bars' },
];

const SORT_BAR_BLOCK_VARIANT_OPTIONS: readonly VisualizationOption[] = [
  { value: 'bar', label: 'Bar Chart' },
  { value: 'block', label: 'Block Swap' },
];

const RADIX_VARIANT_OPTIONS: readonly VisualizationOption[] = [
  { value: 'radix', label: 'Bucket Flow' },
  { value: 'radix-strip', label: 'Digit Strip' },
  { value: 'radix-matrix', label: 'Digit Matrix' },
];

const SEARCH_VARIANT_OPTIONS: readonly VisualizationOption[] = [
  { value: 'search', label: 'Signal Sweep' },
];

const STRING_VARIANT_OPTIONS: readonly VisualizationOption[] = [
  { value: 'string', label: 'String Lab' },
];

const GRID_VARIANT_OPTIONS: readonly VisualizationOption[] = [
  { value: 'grid', label: 'Grid Board' },
];

const MATRIX_VARIANT_OPTIONS: readonly VisualizationOption[] = [
  { value: 'matrix', label: 'Matrix Lab' },
];

const DP_VARIANT_OPTIONS: readonly VisualizationOption[] = [
  { value: 'dp', label: 'DP Lab' },
];

const UNION_FIND_VARIANT_OPTIONS: readonly VisualizationOption[] = [
  { value: 'dsu', label: 'Set Forest' },
];

const KRUSKAL_VARIANT_OPTIONS: readonly VisualizationOption[] = [
  { value: 'dsu', label: 'Edge Forest' },
];

const HOPCROFT_KARP_VARIANT_OPTIONS: readonly VisualizationOption[] = [
  { value: 'network', label: 'Matching Layers' },
];

const DINIC_VARIANT_OPTIONS: readonly VisualizationOption[] = [
  { value: 'network', label: 'Residual Layers' },
];

const EDMONDS_KARP_VARIANT_OPTIONS: readonly VisualizationOption[] = [
  { value: 'network', label: 'Augmenting Route' },
];

const MIN_COST_MAX_FLOW_VARIANT_OPTIONS: readonly VisualizationOption[] = [
  { value: 'network', label: 'Costed Residuals' },
];

const DIJKSTRA_VARIANT_OPTIONS: readonly VisualizationOption[] = [
  { value: 'dijkstra-graph', label: 'Path Network' },
];

const BFS_VARIANT_OPTIONS: readonly VisualizationOption[] = [
  { value: 'dijkstra-graph', label: 'Layer Wave' },
];

const DFS_VARIANT_OPTIONS: readonly VisualizationOption[] = [
  { value: 'dijkstra-graph', label: 'Depth Chase' },
];

const TOPOLOGICAL_SORT_KAHN_VARIANT_OPTIONS: readonly VisualizationOption[] = [
  { value: 'dijkstra-graph', label: 'DAG Flow' },
];

const CYCLE_DETECTION_VARIANT_OPTIONS: readonly VisualizationOption[] = [
  { value: 'dijkstra-graph', label: 'Back Edge Hunt' },
];

const CONNECTED_COMPONENTS_VARIANT_OPTIONS: readonly VisualizationOption[] = [
  { value: 'dijkstra-graph', label: 'Island Sweep' },
];

const BIPARTITE_CHECK_VARIANT_OPTIONS: readonly VisualizationOption[] = [
  { value: 'dijkstra-graph', label: 'Two-Side Check' },
];

const BELLMAN_FORD_VARIANT_OPTIONS: readonly VisualizationOption[] = [
  { value: 'dijkstra-graph', label: 'Pass Relaxation' },
];

const PRIMS_MST_VARIANT_OPTIONS: readonly VisualizationOption[] = [
  { value: 'dijkstra-graph', label: 'Tree Builder' },
];

const BRIDGES_ARTICULATION_VARIANT_OPTIONS: readonly VisualizationOption[] = [
  { value: 'dijkstra-graph', label: 'Critical Cuts' },
];

const TARJAN_SCC_VARIANT_OPTIONS: readonly VisualizationOption[] = [
  { value: 'dijkstra-graph', label: 'Low-Link SCC' },
];

const KOSARAJU_SCC_VARIANT_OPTIONS: readonly VisualizationOption[] = [
  { value: 'dijkstra-graph', label: 'Two-Pass SCC' },
];

const EULER_VARIANT_OPTIONS: readonly VisualizationOption[] = [
  { value: 'dijkstra-graph', label: 'Edge Trail' },
];

const CHROMATIC_NUMBER_VARIANT_OPTIONS: readonly VisualizationOption[] = [
  { value: 'dijkstra-graph', label: 'Color Search' },
];

const STEINER_TREE_VARIANT_OPTIONS: readonly VisualizationOption[] = [
  { value: 'dijkstra-graph', label: 'Terminal DP Tree' },
];

const DOMINATOR_TREE_VARIANT_OPTIONS: readonly VisualizationOption[] = [
  { value: 'dijkstra-graph', label: 'CFG Dominance' },
];

const BUBBLE_SIZE_OPTIONS: readonly number[] = [16, 32, 64];
const COUNTING_SIZE_OPTIONS: readonly number[] = [12, 24, 36];
const RADIX_SIZE_OPTIONS: readonly number[] = [12, 18, 24];
const DIJKSTRA_SIZE_OPTIONS: readonly number[] = [6, 8, 10];

interface RandomRange {
  readonly min: number;
  readonly max: number;
}

interface BaseAlgorithmViewConfig {
  readonly codeLines: readonly CodeLine[];
  readonly variantOptions: readonly VisualizationOption[];
  readonly defaultVariant: VisualizationVariant;
  readonly sizeOptions: readonly number[];
  readonly defaultSize: number;
  readonly legendItems: (variant: VisualizationVariant) => readonly LegendItem[];
  readonly sizeUnit: string;
  readonly randomizeLabel: string;
}

interface ArrayAlgorithmViewConfig extends BaseAlgorithmViewConfig {
  readonly kind: 'array';
  readonly randomRange: RandomRange;
  readonly generator: (array: readonly number[]) => Generator<SortStep>;
}

interface GraphAlgorithmViewConfig extends BaseAlgorithmViewConfig {
  readonly kind: 'graph';
  readonly createGraph: (size: number) => WeightedGraphData;
  readonly generator: (graph: WeightedGraphData) => Generator<SortStep>;
}

interface SearchScenario {
  readonly array: readonly number[];
  readonly target: number;
}

interface SearchAlgorithmViewConfig extends BaseAlgorithmViewConfig {
  readonly kind: 'search';
  readonly createScenario: (size: number) => SearchScenario;
  readonly generator: (scenario: SearchScenario) => Generator<SortStep>;
}

interface StringAlgorithmViewConfig<TScenario = unknown> extends BaseAlgorithmViewConfig {
  readonly kind: 'string';
  readonly presetOptions: readonly StringPresetOption[];
  readonly defaultPresetId: string;
  readonly createScenario: (size: number, presetId: string) => TScenario;
  readonly generator: (scenario: TScenario) => Generator<SortStep>;
}

interface GridAlgorithmViewConfig<TScenario = unknown> extends BaseAlgorithmViewConfig {
  readonly kind: 'grid';
  readonly createScenario: (size: number) => TScenario;
  readonly generator: (scenario: TScenario) => Generator<SortStep>;
}

interface MatrixAlgorithmViewConfig<TScenario = unknown> extends BaseAlgorithmViewConfig {
  readonly kind: 'matrix';
  readonly createScenario: (size: number) => TScenario;
  readonly generator: (scenario: TScenario) => Generator<SortStep>;
}

interface DpAlgorithmViewConfig<TScenario = unknown> extends BaseAlgorithmViewConfig {
  readonly kind: 'dp';
  readonly presetOptions: readonly DpPresetOption[];
  readonly defaultPresetId: string;
  readonly createScenario: (size: number, presetId: string) => TScenario;
  readonly generator: (scenario: TScenario) => Generator<SortStep>;
}

interface DsuAlgorithmViewConfig<TScenario = unknown> extends BaseAlgorithmViewConfig {
  readonly kind: 'dsu';
  readonly createScenario: (size: number) => TScenario;
  readonly generator: (scenario: TScenario) => Generator<SortStep>;
}

interface NetworkAlgorithmViewConfig<TScenario = unknown> extends BaseAlgorithmViewConfig {
  readonly kind: 'network';
  readonly createScenario: (size: number) => TScenario;
  readonly generator: (scenario: TScenario) => Generator<SortStep>;
}

interface GeometryAlgorithmViewConfig<TScenario = unknown> extends BaseAlgorithmViewConfig {
  readonly kind: 'geometry';
  readonly createScenario: (size: number) => TScenario;
  readonly generator: (scenario: TScenario) => Generator<SortStep>;
}

type AlgorithmViewConfig =
  | ArrayAlgorithmViewConfig
  | GraphAlgorithmViewConfig
  | SearchAlgorithmViewConfig
  | StringAlgorithmViewConfig<any>
  | GridAlgorithmViewConfig<any>
  | MatrixAlgorithmViewConfig<any>
  | DpAlgorithmViewConfig<any>
  | DsuAlgorithmViewConfig<any>
  | NetworkAlgorithmViewConfig<any>
  | GeometryAlgorithmViewConfig<any>;

const BUBBLE_VIEW_CONFIG: AlgorithmViewConfig = {
  kind: 'array',
  codeLines: BUBBLE_SORT_CODE,
  variantOptions: BUBBLE_VARIANT_OPTIONS,
  defaultVariant: 'bar',
  sizeOptions: BUBBLE_SIZE_OPTIONS,
  defaultSize: 16,
  randomRange: { min: 1, max: 99 },
  generator: bubbleSortGenerator,
  legendItems: (variant) => {
    if (variant === 'block') return BLOCK_LEGEND;
    if (variant === 'sound') return SOUND_LEGEND;
    return BAR_LEGEND;
  },
  sizeUnit: 'elements',
  randomizeLabel: 'Randomize',
};

const RADIX_VIEW_CONFIG: AlgorithmViewConfig = {
  kind: 'array',
  codeLines: RADIX_SORT_CODE,
  variantOptions: RADIX_VARIANT_OPTIONS,
  defaultVariant: 'radix',
  sizeOptions: RADIX_SIZE_OPTIONS,
  defaultSize: 18,
  randomRange: { min: 10, max: 999 },
  generator: radixSortGenerator,
  legendItems: () => RADIX_LEGEND,
  sizeUnit: 'elements',
  randomizeLabel: 'Randomize',
};

function createSortViewConfig(args: {
  readonly codeLines: readonly CodeLine[];
  readonly generator: (array: readonly number[]) => Generator<SortStep>;
  readonly randomRange: RandomRange;
  readonly sizeOptions?: readonly number[];
  readonly defaultSize?: number;
}): AlgorithmViewConfig {
  const sizeOptions = args.sizeOptions ?? BUBBLE_SIZE_OPTIONS;
  return {
    kind: 'array',
    codeLines: args.codeLines,
    variantOptions: SORT_BAR_BLOCK_VARIANT_OPTIONS,
    defaultVariant: 'bar',
    sizeOptions,
    defaultSize: args.defaultSize ?? sizeOptions[0] ?? 16,
    randomRange: args.randomRange,
    generator: args.generator,
    legendItems: (variant) => (variant === 'block' ? BLOCK_LEGEND : BAR_LEGEND),
    sizeUnit: 'elements',
    randomizeLabel: 'Randomize',
  };
}

const SELECTION_VIEW_CONFIG = createSortViewConfig({
  codeLines: SELECTION_SORT_CODE,
  generator: selectionSortGenerator,
  randomRange: { min: 1, max: 99 },
  defaultSize: 16,
});

const INSERTION_VIEW_CONFIG = createSortViewConfig({
  codeLines: INSERTION_SORT_CODE,
  generator: insertionSortGenerator,
  randomRange: { min: 1, max: 99 },
  defaultSize: 16,
});

const COUNTING_VIEW_CONFIG = createSortViewConfig({
  codeLines: COUNTING_SORT_CODE,
  generator: countingSortGenerator,
  randomRange: { min: 1, max: 24 },
  sizeOptions: COUNTING_SIZE_OPTIONS,
  defaultSize: 24,
});

const MERGE_VIEW_CONFIG = createSortViewConfig({
  codeLines: MERGE_SORT_CODE,
  generator: mergeSortGenerator,
  randomRange: { min: 1, max: 99 },
  defaultSize: 16,
});

const QUICK_VIEW_CONFIG = createSortViewConfig({
  codeLines: QUICK_SORT_CODE,
  generator: quickSortGenerator,
  randomRange: { min: 1, max: 99 },
  defaultSize: 16,
});

const HEAP_VIEW_CONFIG = createSortViewConfig({
  codeLines: HEAP_SORT_CODE,
  generator: heapSortGenerator,
  randomRange: { min: 1, max: 99 },
  defaultSize: 16,
});

function createSearchViewConfig(args: {
  readonly codeLines: readonly CodeLine[];
  readonly createScenario: (size: number) => SearchScenario;
  readonly generator: (scenario: SearchScenario) => Generator<SortStep>;
  readonly sizeOptions?: readonly number[];
  readonly defaultSize?: number;
}): AlgorithmViewConfig {
  const sizeOptions = args.sizeOptions ?? BUBBLE_SIZE_OPTIONS;
  return {
    kind: 'search',
    codeLines: args.codeLines,
    variantOptions: SEARCH_VARIANT_OPTIONS,
    defaultVariant: 'search',
    sizeOptions,
    defaultSize: args.defaultSize ?? sizeOptions[0] ?? 16,
    createScenario: args.createScenario,
    generator: args.generator,
    legendItems: () => SEARCH_LEGEND,
    sizeUnit: 'items',
    randomizeLabel: 'New challenge',
  };
}

function createGridViewConfig<TScenario>(args: {
  readonly codeLines: readonly CodeLine[];
  readonly createScenario: (size: number) => TScenario;
  readonly generator: (scenario: TScenario) => Generator<SortStep>;
  readonly legendItems: readonly LegendItem[];
  readonly sizeOptions?: readonly number[];
  readonly defaultSize?: number;
  readonly randomizeLabel?: string;
}): GridAlgorithmViewConfig<TScenario> {
  const sizeOptions = args.sizeOptions ?? [8, 10, 12];
  return {
    kind: 'grid',
    codeLines: args.codeLines,
    variantOptions: GRID_VARIANT_OPTIONS,
    defaultVariant: 'grid',
    sizeOptions,
    defaultSize: args.defaultSize ?? sizeOptions[0] ?? 8,
    createScenario: args.createScenario,
    generator: args.generator,
    legendItems: () => args.legendItems,
    sizeUnit: 'cells / side',
    randomizeLabel: args.randomizeLabel ?? 'New board',
  };
}

function createStringViewConfig<TScenario>(args: {
  readonly codeLines: readonly CodeLine[];
  readonly createScenario: (size: number, presetId: string) => TScenario;
  readonly generator: (scenario: TScenario) => Generator<SortStep>;
  readonly presetOptions: readonly StringPresetOption[];
  readonly sizeOptions?: readonly number[];
  readonly defaultSize?: number;
  readonly sizeUnit?: string;
  readonly randomizeLabel?: string;
}): StringAlgorithmViewConfig<TScenario> {
  const sizeOptions = args.sizeOptions ?? [12, 18, 24];
  const defaultPresetId = args.presetOptions[0]?.id ?? 'default';
  return {
    kind: 'string',
    codeLines: args.codeLines,
    variantOptions: STRING_VARIANT_OPTIONS,
    defaultVariant: 'string',
    sizeOptions,
    defaultSize: args.defaultSize ?? sizeOptions[0] ?? 12,
    presetOptions: args.presetOptions,
    defaultPresetId,
    createScenario: args.createScenario,
    generator: args.generator,
    legendItems: () => STRING_LEGEND,
    sizeUnit: args.sizeUnit ?? 'chars',
    randomizeLabel: args.randomizeLabel ?? 'New string case',
  };
}

function createMatrixViewConfig<TScenario>(args: {
  readonly codeLines: readonly CodeLine[];
  readonly createScenario: (size: number) => TScenario;
  readonly generator: (scenario: TScenario) => Generator<SortStep>;
  readonly legendItems: readonly LegendItem[];
  readonly sizeOptions?: readonly number[];
  readonly defaultSize?: number;
  readonly randomizeLabel?: string;
  readonly sizeUnit?: string;
}): MatrixAlgorithmViewConfig<TScenario> {
  const sizeOptions = args.sizeOptions ?? [4, 5, 6];
  return {
    kind: 'matrix',
    codeLines: args.codeLines,
    variantOptions: MATRIX_VARIANT_OPTIONS,
    defaultVariant: 'matrix',
    sizeOptions,
    defaultSize: args.defaultSize ?? sizeOptions[0] ?? 4,
    createScenario: args.createScenario,
    generator: args.generator,
    legendItems: () => args.legendItems,
    sizeUnit: args.sizeUnit ?? 'rows / cols',
    randomizeLabel: args.randomizeLabel ?? 'New matrix',
  };
}

function createDpViewConfig<TScenario>(args: {
  readonly codeLines: readonly CodeLine[];
  readonly createScenario: (size: number, presetId: string) => TScenario;
  readonly generator: (scenario: TScenario) => Generator<SortStep>;
  readonly legendItems: readonly LegendItem[];
  readonly presetOptions: readonly DpPresetOption[];
  readonly sizeOptions?: readonly number[];
  readonly defaultSize?: number;
  readonly randomizeLabel?: string;
  readonly sizeUnit?: string;
}): DpAlgorithmViewConfig<TScenario> {
  const sizeOptions = args.sizeOptions ?? [4, 6, 8];
  const defaultPresetId = args.presetOptions[0]?.id ?? 'default';
  return {
    kind: 'dp',
    codeLines: args.codeLines,
    variantOptions: DP_VARIANT_OPTIONS,
    defaultVariant: 'dp',
    sizeOptions,
    defaultSize: args.defaultSize ?? sizeOptions[0] ?? 4,
    presetOptions: args.presetOptions,
    defaultPresetId,
    createScenario: args.createScenario,
    generator: args.generator,
    legendItems: () => args.legendItems,
    sizeUnit: args.sizeUnit ?? 'states',
    randomizeLabel: args.randomizeLabel ?? 'New preset case',
  };
}

function createDsuViewConfig<TScenario>(args: {
  readonly codeLines: readonly CodeLine[];
  readonly variantOptions: readonly VisualizationOption[];
  readonly createScenario: (size: number) => TScenario;
  readonly generator: (scenario: TScenario) => Generator<SortStep>;
  readonly legendItems: readonly LegendItem[];
  readonly sizeOptions?: readonly number[];
  readonly defaultSize?: number;
  readonly sizeUnit?: string;
  readonly randomizeLabel?: string;
}): DsuAlgorithmViewConfig<TScenario> {
  const sizeOptions = args.sizeOptions ?? [6, 8, 10];
  return {
    kind: 'dsu',
    codeLines: args.codeLines,
    variantOptions: args.variantOptions,
    defaultVariant: 'dsu',
    sizeOptions,
    defaultSize: args.defaultSize ?? sizeOptions[0] ?? 6,
    createScenario: args.createScenario,
    generator: args.generator,
    legendItems: () => args.legendItems,
    sizeUnit: args.sizeUnit ?? 'nodes',
    randomizeLabel: args.randomizeLabel ?? 'New scenario',
  };
}

function createNetworkViewConfig<TScenario>(args: {
  readonly codeLines: readonly CodeLine[];
  readonly variantOptions: readonly VisualizationOption[];
  readonly createScenario: (size: number) => TScenario;
  readonly generator: (scenario: TScenario) => Generator<SortStep>;
  readonly legendItems: readonly LegendItem[];
  readonly sizeOptions?: readonly number[];
  readonly defaultSize?: number;
  readonly sizeUnit?: string;
  readonly randomizeLabel?: string;
}): NetworkAlgorithmViewConfig<TScenario> {
  const sizeOptions = args.sizeOptions ?? [8, 10];
  return {
    kind: 'network',
    codeLines: args.codeLines,
    variantOptions: args.variantOptions,
    defaultVariant: 'network',
    sizeOptions,
    defaultSize: args.defaultSize ?? sizeOptions[0] ?? 8,
    createScenario: args.createScenario,
    generator: args.generator,
    legendItems: () => args.legendItems,
    sizeUnit: args.sizeUnit ?? 'nodes',
    randomizeLabel: args.randomizeLabel ?? 'New network',
  };
}

const BUCKET_VIEW_CONFIG = createSortViewConfig({
  codeLines: BUCKET_SORT_CODE,
  generator: bucketSortGenerator,
  randomRange: { min: 1, max: 99 },
  defaultSize: 16,
});

const SHELL_VIEW_CONFIG = createSortViewConfig({
  codeLines: SHELL_SORT_CODE,
  generator: shellSortGenerator,
  randomRange: { min: 1, max: 99 },
  defaultSize: 16,
});

const TIM_VIEW_CONFIG = createSortViewConfig({
  codeLines: TIM_SORT_CODE,
  generator: timSortGenerator,
  randomRange: { min: 1, max: 99 },
  defaultSize: 16,
});

const LINEAR_SEARCH_VIEW_CONFIG = createSearchViewConfig({
  codeLines: LINEAR_SEARCH_CODE,
  createScenario: (size) => createLinearSearchScenario(size),
  generator: linearSearchGenerator,
  sizeOptions: [12, 20, 28],
  defaultSize: 20,
});

const BINARY_SEARCH_VIEW_CONFIG = createSearchViewConfig({
  codeLines: BINARY_SEARCH_CODE,
  createScenario: (size) => createBinarySearchScenario(size),
  generator: binarySearchGenerator,
  sizeOptions: [16, 24, 32],
  defaultSize: 24,
});

const BINARY_SEARCH_VARIANTS_VIEW_CONFIG = createSearchViewConfig({
  codeLines: BINARY_SEARCH_VARIANTS_CODE,
  createScenario: (size) => createBinarySearchVariantsScenario(size),
  generator: binarySearchVariantsGenerator,
  sizeOptions: [16, 24, 32],
  defaultSize: 24,
});

const KMP_VIEW_CONFIG = createStringViewConfig<KmpScenario>({
  codeLines: KMP_PATTERN_MATCHING_CODE,
  createScenario: (size, presetId) => createKmpScenario(size, presetId),
  generator: kmpPatternMatchingGenerator,
  presetOptions: KMP_PRESETS,
  sizeOptions: [14, 20, 28],
  defaultSize: 20,
  sizeUnit: 'text chars',
  randomizeLabel: 'New KMP case',
});

const RABIN_KARP_VIEW_CONFIG = createStringViewConfig<RabinKarpScenario>({
  codeLines: RABIN_KARP_CODE,
  createScenario: (size, presetId) => createRabinKarpScenario(size, presetId),
  generator: rabinKarpGenerator,
  presetOptions: RABIN_KARP_PRESETS,
  sizeOptions: [14, 20, 28],
  defaultSize: 20,
  sizeUnit: 'text chars',
  randomizeLabel: 'New rolling-hash case',
});

const Z_ALGORITHM_VIEW_CONFIG = createStringViewConfig<ZAlgorithmScenario>({
  codeLines: Z_ALGORITHM_CODE,
  createScenario: (size, presetId) => createZAlgorithmScenario(size, presetId),
  generator: zAlgorithmGenerator,
  presetOptions: Z_ALGORITHM_PRESETS,
  sizeOptions: [14, 20, 28],
  defaultSize: 20,
  sizeUnit: 'combined chars',
  randomizeLabel: 'New Z skyline',
});

const MANACHER_VIEW_CONFIG = createStringViewConfig<ManacherScenario>({
  codeLines: MANACHER_CODE,
  createScenario: (size, presetId) => createManacherScenario(size, presetId),
  generator: manacherGenerator,
  presetOptions: MANACHER_PRESETS,
  sizeOptions: [10, 14, 18],
  defaultSize: 14,
  sizeUnit: 'chars',
  randomizeLabel: 'New palindrome field',
});

const BURROWS_WHEELER_VIEW_CONFIG =
  createStringViewConfig<BurrowsWheelerScenario>({
    codeLines: BURROWS_WHEELER_TRANSFORM_CODE,
    createScenario: (size, presetId) => createBurrowsWheelerScenario(size, presetId),
    generator: burrowsWheelerTransformGenerator,
    presetOptions: BWT_PRESETS,
    sizeOptions: [6, 8, 10],
    defaultSize: 8,
    sizeUnit: 'chars',
    randomizeLabel: 'New BWT matrix',
  });

const DIJKSTRA_VIEW_CONFIG: AlgorithmViewConfig = {
  kind: 'graph',
  codeLines: DIJKSTRA_CODE,
  variantOptions: DIJKSTRA_VARIANT_OPTIONS,
  defaultVariant: 'dijkstra-graph',
  sizeOptions: DIJKSTRA_SIZE_OPTIONS,
  defaultSize: 8,
  createGraph: generateDijkstraGraph,
  generator: dijkstraGenerator,
  legendItems: () => DIJKSTRA_LEGEND,
  sizeUnit: 'nodes',
  randomizeLabel: 'New graph',
};

const BFS_VIEW_CONFIG: AlgorithmViewConfig = {
  kind: 'graph',
  codeLines: BFS_CODE,
  variantOptions: BFS_VARIANT_OPTIONS,
  defaultVariant: 'dijkstra-graph',
  sizeOptions: DIJKSTRA_SIZE_OPTIONS,
  defaultSize: 8,
  createGraph: generateTraversalGraph,
  generator: bfsGenerator,
  legendItems: () => BFS_LEGEND,
  sizeUnit: 'nodes',
  randomizeLabel: 'New graph',
};

const DFS_VIEW_CONFIG: AlgorithmViewConfig = {
  kind: 'graph',
  codeLines: DFS_CODE,
  variantOptions: DFS_VARIANT_OPTIONS,
  defaultVariant: 'dijkstra-graph',
  sizeOptions: DIJKSTRA_SIZE_OPTIONS,
  defaultSize: 8,
  createGraph: generateTraversalGraph,
  generator: dfsGenerator,
  legendItems: () => DFS_LEGEND,
  sizeUnit: 'nodes',
  randomizeLabel: 'New graph',
};

const TOPOLOGICAL_SORT_KAHN_VIEW_CONFIG: AlgorithmViewConfig = {
  kind: 'graph',
  codeLines: TOPOLOGICAL_SORT_KAHN_CODE,
  variantOptions: TOPOLOGICAL_SORT_KAHN_VARIANT_OPTIONS,
  defaultVariant: 'dijkstra-graph',
  sizeOptions: DIJKSTRA_SIZE_OPTIONS,
  defaultSize: 8,
  createGraph: generateDagGraph,
  generator: topologicalSortKahnGenerator,
  legendItems: () => TOPOLOGICAL_SORT_KAHN_LEGEND,
  sizeUnit: 'nodes',
  randomizeLabel: 'New DAG',
};

const CYCLE_DETECTION_VIEW_CONFIG: AlgorithmViewConfig = {
  kind: 'graph',
  codeLines: CYCLE_DETECTION_CODE,
  variantOptions: CYCLE_DETECTION_VARIANT_OPTIONS,
  defaultVariant: 'dijkstra-graph',
  sizeOptions: DIJKSTRA_SIZE_OPTIONS,
  defaultSize: 8,
  createGraph: generateCycleDetectionGraph,
  generator: cycleDetectionGenerator,
  legendItems: () => CYCLE_DETECTION_LEGEND,
  sizeUnit: 'nodes',
  randomizeLabel: 'New graph',
};

const CONNECTED_COMPONENTS_VIEW_CONFIG: AlgorithmViewConfig = {
  kind: 'graph',
  codeLines: CONNECTED_COMPONENTS_CODE,
  variantOptions: CONNECTED_COMPONENTS_VARIANT_OPTIONS,
  defaultVariant: 'dijkstra-graph',
  sizeOptions: DIJKSTRA_SIZE_OPTIONS,
  defaultSize: 8,
  createGraph: generateConnectedComponentsGraph,
  generator: connectedComponentsGenerator,
  legendItems: () => CONNECTED_COMPONENTS_LEGEND,
  sizeUnit: 'nodes',
  randomizeLabel: 'New graph',
};

const BIPARTITE_CHECK_VIEW_CONFIG: AlgorithmViewConfig = {
  kind: 'graph',
  codeLines: BIPARTITE_CHECK_CODE,
  variantOptions: BIPARTITE_CHECK_VARIANT_OPTIONS,
  defaultVariant: 'dijkstra-graph',
  sizeOptions: DIJKSTRA_SIZE_OPTIONS,
  defaultSize: 8,
  createGraph: generateBipartiteGraph,
  generator: bipartiteCheckGenerator,
  legendItems: () => BIPARTITE_CHECK_LEGEND,
  sizeUnit: 'nodes',
  randomizeLabel: 'New graph',
};

const BELLMAN_FORD_VIEW_CONFIG: AlgorithmViewConfig = {
  kind: 'graph',
  codeLines: BELLMAN_FORD_CODE,
  variantOptions: BELLMAN_FORD_VARIANT_OPTIONS,
  defaultVariant: 'dijkstra-graph',
  sizeOptions: DIJKSTRA_SIZE_OPTIONS,
  defaultSize: 8,
  createGraph: generateBellmanFordGraph,
  generator: bellmanFordGenerator,
  legendItems: () => BELLMAN_FORD_LEGEND,
  sizeUnit: 'nodes',
  randomizeLabel: 'New graph',
};

const PRIMS_MST_VIEW_CONFIG: AlgorithmViewConfig = {
  kind: 'graph',
  codeLines: PRIMS_MST_CODE,
  variantOptions: PRIMS_MST_VARIANT_OPTIONS,
  defaultVariant: 'dijkstra-graph',
  sizeOptions: DIJKSTRA_SIZE_OPTIONS,
  defaultSize: 8,
  createGraph: generateDijkstraGraph,
  generator: primsMstGenerator,
  legendItems: () => PRIMS_MST_LEGEND,
  sizeUnit: 'nodes',
  randomizeLabel: 'New graph',
};

const BRIDGES_ARTICULATION_VIEW_CONFIG: AlgorithmViewConfig = {
  kind: 'graph',
  codeLines: BRIDGES_ARTICULATION_POINTS_CODE,
  variantOptions: BRIDGES_ARTICULATION_VARIANT_OPTIONS,
  defaultVariant: 'dijkstra-graph',
  sizeOptions: DIJKSTRA_SIZE_OPTIONS,
  defaultSize: 8,
  createGraph: generateBridgesGraph,
  generator: bridgesArticulationPointsGenerator,
  legendItems: () => BRIDGES_ARTICULATION_LEGEND,
  sizeUnit: 'nodes',
  randomizeLabel: 'New graph',
};

const TARJAN_SCC_VIEW_CONFIG: AlgorithmViewConfig = {
  kind: 'graph',
  codeLines: TARJAN_SCC_CODE,
  variantOptions: TARJAN_SCC_VARIANT_OPTIONS,
  defaultVariant: 'dijkstra-graph',
  sizeOptions: DIJKSTRA_SIZE_OPTIONS,
  defaultSize: 8,
  createGraph: generateSccGraph,
  generator: tarjanSccGenerator,
  legendItems: () => TARJAN_SCC_LEGEND,
  sizeUnit: 'nodes',
  randomizeLabel: 'New graph',
};

const KOSARAJU_SCC_VIEW_CONFIG: AlgorithmViewConfig = {
  kind: 'graph',
  codeLines: KOSARAJU_SCC_CODE,
  variantOptions: KOSARAJU_SCC_VARIANT_OPTIONS,
  defaultVariant: 'dijkstra-graph',
  sizeOptions: DIJKSTRA_SIZE_OPTIONS,
  defaultSize: 8,
  createGraph: generateSccGraph,
  generator: kosarajuSccGenerator,
  legendItems: () => KOSARAJU_SCC_LEGEND,
  sizeUnit: 'nodes',
  randomizeLabel: 'New graph',
};

const EULER_VIEW_CONFIG: AlgorithmViewConfig = {
  kind: 'graph',
  codeLines: EULER_PATH_CIRCUIT_CODE,
  variantOptions: EULER_VARIANT_OPTIONS,
  defaultVariant: 'dijkstra-graph',
  sizeOptions: DIJKSTRA_SIZE_OPTIONS,
  defaultSize: 8,
  createGraph: generateEulerGraph,
  generator: eulerPathCircuitGenerator,
  legendItems: () => EULER_LEGEND,
  sizeUnit: 'nodes',
  randomizeLabel: 'New trail graph',
};

const CHROMATIC_NUMBER_VIEW_CONFIG: AlgorithmViewConfig = {
  kind: 'graph',
  codeLines: CHROMATIC_NUMBER_CODE,
  variantOptions: CHROMATIC_NUMBER_VARIANT_OPTIONS,
  defaultVariant: 'dijkstra-graph',
  sizeOptions: DIJKSTRA_SIZE_OPTIONS,
  defaultSize: 8,
  createGraph: generateColoringGraph,
  generator: chromaticNumberGenerator,
  legendItems: () => CHROMATIC_NUMBER_LEGEND,
  sizeUnit: 'nodes',
  randomizeLabel: 'New conflict graph',
};

const STEINER_TREE_VIEW_CONFIG: AlgorithmViewConfig = {
  kind: 'graph',
  codeLines: STEINER_TREE_CODE,
  variantOptions: STEINER_TREE_VARIANT_OPTIONS,
  defaultVariant: 'dijkstra-graph',
  sizeOptions: DIJKSTRA_SIZE_OPTIONS,
  defaultSize: 8,
  createGraph: generateSteinerGraph,
  generator: steinerTreeGenerator,
  legendItems: () => STEINER_TREE_LEGEND,
  sizeUnit: 'nodes',
  randomizeLabel: 'New terminal graph',
};

const DOMINATOR_TREE_VIEW_CONFIG: AlgorithmViewConfig = {
  kind: 'graph',
  codeLines: DOMINATOR_TREE_CODE,
  variantOptions: DOMINATOR_TREE_VARIANT_OPTIONS,
  defaultVariant: 'dijkstra-graph',
  sizeOptions: DIJKSTRA_SIZE_OPTIONS,
  defaultSize: 8,
  createGraph: generateDominatorGraph,
  generator: dominatorTreeGenerator,
  legendItems: () => DOMINATOR_TREE_LEGEND,
  sizeUnit: 'nodes',
  randomizeLabel: 'New CFG',
};

const FLOOD_FILL_VIEW_CONFIG = createGridViewConfig<FloodFillScenario>({
  codeLines: FLOOD_FILL_CODE,
  createScenario: (size) => createFloodFillScenario(size),
  generator: floodFillGenerator,
  legendItems: FLOOD_FILL_LEGEND,
  sizeOptions: [8, 10, 12],
  defaultSize: 10,
  randomizeLabel: 'New board',
});

const A_STAR_VIEW_CONFIG = createGridViewConfig<AStarScenario>({
  codeLines: A_STAR_PATHFINDING_CODE,
  createScenario: (size) => createAStarScenario(size),
  generator: aStarPathfindingGenerator,
  legendItems: A_STAR_LEGEND,
  sizeOptions: [8, 10, 12],
  defaultSize: 10,
  randomizeLabel: 'New board',
});

const FLOYD_WARSHALL_VIEW_CONFIG = createMatrixViewConfig<FloydWarshallScenario>({
  codeLines: FLOYD_WARSHALL_CODE,
  createScenario: (size) => createFloydWarshallScenario(size),
  generator: floydWarshallGenerator,
  legendItems: FLOYD_WARSHALL_LEGEND,
  sizeOptions: [5, 6],
  defaultSize: 5,
  randomizeLabel: 'New matrix',
});

const HUNGARIAN_VIEW_CONFIG = createMatrixViewConfig<HungarianScenario>({
  codeLines: HUNGARIAN_ALGORITHM_CODE,
  createScenario: (size) => createHungarianScenario(size),
  generator: hungarianAlgorithmGenerator,
  legendItems: HUNGARIAN_LEGEND,
  sizeOptions: [4, 5],
  defaultSize: 4,
  randomizeLabel: 'New assignment grid',
});

const KNAPSACK_VIEW_CONFIG = createDpViewConfig<KnapsackScenario>({
  codeLines: KNAPSACK_01_CODE,
  createScenario: (size, presetId) => createKnapsackScenario(size, presetId),
  generator: knapsack01Generator,
  legendItems: KNAPSACK_LEGEND,
  presetOptions: KNAPSACK_PRESETS,
  sizeOptions: [4, 5, 6],
  defaultSize: 5,
  sizeUnit: 'items',
  randomizeLabel: 'New backpack case',
});

const LCS_VIEW_CONFIG = createDpViewConfig<LcsScenario>({
  codeLines: LONGEST_COMMON_SUBSEQUENCE_CODE,
  createScenario: (size, presetId) => createLcsScenario(size, presetId),
  generator: longestCommonSubsequenceGenerator,
  legendItems: LCS_LEGEND,
  presetOptions: LCS_PRESETS,
  sizeOptions: [5, 6, 7],
  defaultSize: 6,
  sizeUnit: 'chars',
  randomizeLabel: 'New string pair',
});

const EDIT_DISTANCE_VIEW_CONFIG = createDpViewConfig<EditDistanceScenario>({
  codeLines: EDIT_DISTANCE_CODE,
  createScenario: (size, presetId) => createEditDistanceScenario(size, presetId),
  generator: editDistanceGenerator,
  legendItems: EDIT_DISTANCE_LEGEND,
  presetOptions: EDIT_DISTANCE_PRESETS,
  sizeOptions: [5, 6, 7],
  defaultSize: 6,
  sizeUnit: 'chars',
  randomizeLabel: 'New word pair',
});

const MATRIX_CHAIN_VIEW_CONFIG = createDpViewConfig<MatrixChainScenario>({
  codeLines: MATRIX_CHAIN_MULTIPLICATION_CODE,
  createScenario: (size, presetId) => createMatrixChainScenario(size, presetId),
  generator: matrixChainMultiplicationGenerator,
  legendItems: MATRIX_CHAIN_LEGEND,
  presetOptions: MATRIX_CHAIN_PRESETS,
  sizeOptions: [4, 5, 6],
  defaultSize: 5,
  sizeUnit: 'matrices',
  randomizeLabel: 'New matrix chain',
});

const COIN_CHANGE_VIEW_CONFIG = createDpViewConfig<CoinChangeScenario>({
  codeLines: COIN_CHANGE_CODE,
  createScenario: (size, presetId) => createCoinChangeScenario(size, presetId),
  generator: coinChangeGenerator,
  legendItems: COIN_CHANGE_LEGEND,
  presetOptions: COIN_CHANGE_PRESETS,
  sizeOptions: [4, 5, 6],
  defaultSize: 5,
  sizeUnit: 'coins',
  randomizeLabel: 'New change case',
});

const SUBSET_SUM_VIEW_CONFIG = createDpViewConfig<SubsetSumScenario>({
  codeLines: SUBSET_SUM_CODE,
  createScenario: (size, presetId) => createSubsetSumScenario(size, presetId),
  generator: subsetSumGenerator,
  legendItems: SUBSET_SUM_LEGEND,
  presetOptions: SUBSET_SUM_PRESETS,
  sizeOptions: [5, 6],
  defaultSize: 5,
  sizeUnit: 'numbers',
  randomizeLabel: 'New target sum',
});

const LPS_VIEW_CONFIG = createDpViewConfig<LpsScenario>({
  codeLines: LONGEST_PALINDROMIC_SUBSEQUENCE_CODE,
  createScenario: (size, presetId) => createLpsScenario(size, presetId),
  generator: longestPalindromicSubsequenceGenerator,
  legendItems: LPS_LEGEND,
  presetOptions: LPS_PRESETS,
  sizeOptions: [5, 7, 9],
  defaultSize: 7,
  sizeUnit: 'chars',
  randomizeLabel: 'New palindrome case',
});

const BURST_BALLOONS_VIEW_CONFIG = createDpViewConfig<BurstBalloonsScenario>({
  codeLines: BURST_BALLOONS_CODE,
  createScenario: (size, presetId) => createBurstBalloonsScenario(size, presetId),
  generator: burstBalloonsGenerator,
  legendItems: BURST_BALLOONS_LEGEND,
  presetOptions: BURST_BALLOONS_PRESETS,
  sizeOptions: [4, 5, 6],
  defaultSize: 5,
  sizeUnit: 'balloons',
  randomizeLabel: 'New burst board',
});

const WILDCARD_VIEW_CONFIG = createDpViewConfig<WildcardMatchingScenario>({
  codeLines: WILDCARD_MATCHING_CODE,
  createScenario: (size, presetId) => createWildcardMatchingScenario(size, presetId),
  generator: wildcardMatchingGenerator,
  legendItems: WILDCARD_LEGEND,
  presetOptions: WILDCARD_PRESETS,
  sizeOptions: [5, 6, 7],
  defaultSize: 6,
  sizeUnit: 'chars',
  randomizeLabel: 'New wildcard pair',
});

const LIS_VIEW_CONFIG = createDpViewConfig<LisScenario>({
  codeLines: LONGEST_INCREASING_SUBSEQUENCE_CODE,
  createScenario: (size, presetId) => createLisScenario(size, presetId),
  generator: longestIncreasingSubsequenceGenerator,
  legendItems: LIS_LEGEND,
  presetOptions: LIS_PRESETS,
  sizeOptions: [6, 8],
  defaultSize: 6,
  sizeUnit: 'values',
  randomizeLabel: 'New LIS strip',
});

const CLIMBING_STAIRS_VIEW_CONFIG = createDpViewConfig<ClimbingStairsScenario>({
  codeLines: CLIMBING_STAIRS_CODE,
  createScenario: (size, presetId) => createClimbingStairsScenario(size, presetId),
  generator: climbingStairsGenerator,
  legendItems: CLIMBING_STAIRS_LEGEND,
  presetOptions: CLIMBING_STAIRS_PRESETS,
  sizeOptions: [6, 8, 10],
  defaultSize: 8,
  sizeUnit: 'stairs',
  randomizeLabel: 'New staircase',
});

const FIBONACCI_VIEW_CONFIG = createDpViewConfig<FibonacciScenario>({
  codeLines: FIBONACCI_DP_CODE,
  createScenario: (size, presetId) => createFibonacciScenario(size, presetId),
  generator: fibonacciDpGenerator,
  legendItems: FIBONACCI_LEGEND,
  presetOptions: FIBONACCI_PRESETS,
  sizeOptions: [6, 8, 10],
  defaultSize: 8,
  sizeUnit: 'terms',
  randomizeLabel: 'New Fibonacci run',
});

const REGEX_VIEW_CONFIG = createDpViewConfig<RegexMatchingScenario>({
  codeLines: REGEX_MATCHING_DP_CODE,
  createScenario: (size, presetId) => createRegexMatchingScenario(size, presetId),
  generator: regexMatchingDpGenerator,
  legendItems: REGEX_LEGEND,
  presetOptions: REGEX_PRESETS,
  sizeOptions: [5, 6, 7],
  defaultSize: 6,
  sizeUnit: 'text chars',
  randomizeLabel: 'New regex pair',
});

const TSP_VIEW_CONFIG = createDpViewConfig<TravelingSalesmanScenario>({
  codeLines: TRAVELING_SALESMAN_DP_CODE,
  createScenario: (size, presetId) => createTravelingSalesmanScenario(size, presetId),
  generator: travelingSalesmanDpGenerator,
  legendItems: TSP_LEGEND,
  presetOptions: TSP_PRESETS,
  sizeOptions: [4, 5],
  defaultSize: 4,
  sizeUnit: 'cities',
  randomizeLabel: 'New city loop',
});

const SOS_VIEW_CONFIG = createDpViewConfig<SosDpScenario>({
  codeLines: SOS_DP_CODE,
  createScenario: (size, presetId) => createSosDpScenario(size, presetId),
  generator: sosDpGenerator,
  legendItems: SOS_LEGEND,
  presetOptions: SOS_PRESETS,
  sizeOptions: [3, 4],
  defaultSize: 3,
  sizeUnit: 'bits',
  randomizeLabel: 'New subset family',
});

const PROFILE_VIEW_CONFIG = createDpViewConfig<ProfileDpScenario>({
  codeLines: PROFILE_DP_CODE,
  createScenario: (size, presetId) => createProfileDpScenario(size, presetId),
  generator: profileDpGenerator,
  legendItems: PROFILE_LEGEND,
  presetOptions: PROFILE_PRESETS,
  sizeOptions: [5, 6, 7],
  defaultSize: 5,
  sizeUnit: 'columns',
  randomizeLabel: 'New frontier board',
});

const TREE_DP_VIEW_CONFIG = createDpViewConfig<TreeDpScenario>({
  codeLines: DP_ON_TREES_CODE,
  createScenario: (size, presetId) => createTreeDpScenario(size, presetId),
  generator: dpOnTreesGenerator,
  legendItems: TREE_DP_LEGEND,
  presetOptions: TREE_DP_PRESETS,
  sizeOptions: [6, 7],
  defaultSize: 7,
  sizeUnit: 'nodes',
  randomizeLabel: 'New rooted tree',
});

const BITMASK_DP_VIEW_CONFIG = createDpViewConfig<BitmaskDpScenario>({
  codeLines: DP_WITH_BITMASK_CODE,
  createScenario: (size, presetId) => createBitmaskDpScenario(size, presetId),
  generator: dpWithBitmaskGenerator,
  legendItems: BITMASK_DP_LEGEND,
  presetOptions: BITMASK_DP_PRESETS,
  sizeOptions: [3, 4],
  defaultSize: 4,
  sizeUnit: 'jobs',
  randomizeLabel: 'New mask assignment',
});

const CHT_VIEW_CONFIG = createDpViewConfig<ChtDpScenario>({
  codeLines: DP_CONVEX_HULL_TRICK_CODE,
  createScenario: (size, presetId) => createChtDpScenario(size, presetId),
  generator: dpConvexHullTrickGenerator,
  legendItems: CHT_LEGEND,
  presetOptions: CHT_PRESETS,
  sizeOptions: [4, 6],
  defaultSize: 6,
  sizeUnit: 'points',
  randomizeLabel: 'New hull run',
});

const DIVIDE_CONQUER_VIEW_CONFIG = createDpViewConfig<DivideConquerDpScenario>({
  codeLines: DIVIDE_CONQUER_DP_OPTIMIZATION_CODE,
  createScenario: (size, presetId) => createDivideConquerDpScenario(size, presetId),
  generator: divideConquerDpOptimizationGenerator,
  legendItems: DIVIDE_CONQUER_LEGEND,
  presetOptions: DIVIDE_CONQUER_PRESETS,
  sizeOptions: [5, 7],
  defaultSize: 7,
  sizeUnit: 'values',
  randomizeLabel: 'New partition case',
});

const KNUTH_VIEW_CONFIG = createDpViewConfig<KnuthDpScenario>({
  codeLines: KNUTH_DP_OPTIMIZATION_CODE,
  createScenario: (size, presetId) => createKnuthDpScenario(size, presetId),
  generator: knuthDpOptimizationGenerator,
  legendItems: KNUTH_LEGEND,
  presetOptions: KNUTH_PRESETS,
  sizeOptions: [4, 6],
  defaultSize: 6,
  sizeUnit: 'files',
  randomizeLabel: 'New merge chain',
});

const UNION_FIND_VIEW_CONFIG = createDsuViewConfig<UnionFindScenario>({
  codeLines: UNION_FIND_CODE,
  variantOptions: UNION_FIND_VARIANT_OPTIONS,
  createScenario: (size) => createUnionFindScenario(size),
  generator: unionFindGenerator,
  legendItems: UNION_FIND_LEGEND,
  sizeOptions: [6, 8, 10],
  defaultSize: 8,
  sizeUnit: 'elements',
  randomizeLabel: 'New scenario',
});

const KRUSKAL_VIEW_CONFIG = createDsuViewConfig<KruskalScenario>({
  codeLines: KRUSKALS_MST_CODE,
  variantOptions: KRUSKAL_VARIANT_OPTIONS,
  createScenario: (size) => createKruskalScenario(size),
  generator: kruskalsMstGenerator,
  legendItems: KRUSKAL_LEGEND,
  sizeOptions: [6, 8, 10],
  defaultSize: 8,
  sizeUnit: 'nodes',
  randomizeLabel: 'New graph',
});

const HOPCROFT_KARP_VIEW_CONFIG = createNetworkViewConfig<HopcroftKarpScenario>({
  codeLines: HOPCROFT_KARP_CODE,
  variantOptions: HOPCROFT_KARP_VARIANT_OPTIONS,
  createScenario: (size) => createHopcroftKarpScenario(size),
  generator: hopcroftKarpGenerator,
  legendItems: HOPCROFT_KARP_LEGEND,
  sizeOptions: [8, 10],
  defaultSize: 8,
  sizeUnit: 'nodes',
  randomizeLabel: 'New matching graph',
});

const DINIC_VIEW_CONFIG = createNetworkViewConfig<DinicScenario>({
  codeLines: DINIC_MAX_FLOW_CODE,
  variantOptions: DINIC_VARIANT_OPTIONS,
  createScenario: (size) => createDinicScenario(size),
  generator: dinicMaxFlowGenerator,
  legendItems: DINIC_LEGEND,
  sizeOptions: [8, 10],
  defaultSize: 8,
  sizeUnit: 'nodes',
  randomizeLabel: 'New flow network',
});

const EDMONDS_KARP_VIEW_CONFIG = createNetworkViewConfig<DinicScenario>({
  codeLines: EDMONDS_KARP_CODE,
  variantOptions: EDMONDS_KARP_VARIANT_OPTIONS,
  createScenario: (size) => createEdmondsKarpScenario(size),
  generator: edmondsKarpGenerator,
  legendItems: EDMONDS_KARP_LEGEND,
  sizeOptions: [8, 10],
  defaultSize: 8,
  sizeUnit: 'nodes',
  randomizeLabel: 'New augmenting network',
});

const MIN_COST_MAX_FLOW_VIEW_CONFIG = createNetworkViewConfig<MinCostMaxFlowScenario>({
  codeLines: MIN_COST_MAX_FLOW_CODE,
  variantOptions: MIN_COST_MAX_FLOW_VARIANT_OPTIONS,
  createScenario: (size) => createMinCostMaxFlowScenario(size),
  generator: minCostMaxFlowGenerator,
  legendItems: MIN_COST_MAX_FLOW_LEGEND,
  sizeOptions: [8, 10],
  defaultSize: 8,
  sizeUnit: 'nodes',
  randomizeLabel: 'New priced network',
});

const CONVEX_HULL_VIEW_CONFIG: GeometryAlgorithmViewConfig<ConvexHullScenario> = {
  kind: 'geometry',
  codeLines: CONVEX_HULL_CODE,
  variantOptions: CONVEX_HULL_VARIANT_OPTIONS,
  defaultVariant: 'convex-hull',
  sizeOptions: [10, 16, 24],
  defaultSize: 16,
  createScenario: createConvexHullScenario,
  generator: convexHullGenerator,
  legendItems: () => CONVEX_HULL_LEGEND,
  sizeUnit: 'points',
  randomizeLabel: 'New point cloud',
};

const CLOSEST_PAIR_VIEW_CONFIG: GeometryAlgorithmViewConfig<ClosestPairScenario> = {
  kind: 'geometry',
  codeLines: CLOSEST_PAIR_OF_POINTS_CODE,
  variantOptions: CLOSEST_PAIR_VARIANT_OPTIONS,
  defaultVariant: 'closest-pair',
  sizeOptions: [10, 14, 18],
  defaultSize: 14,
  createScenario: createClosestPairScenario,
  generator: closestPairOfPointsGenerator,
  legendItems: () => CLOSEST_PAIR_LEGEND,
  sizeUnit: 'points',
  randomizeLabel: 'New split cloud',
};

const LINE_INTERSECTION_VIEW_CONFIG: GeometryAlgorithmViewConfig<LineIntersectionScenario> = {
  kind: 'geometry',
  codeLines: LINE_INTERSECTION_CODE,
  variantOptions: LINE_INTERSECTION_VARIANT_OPTIONS,
  defaultVariant: 'line-intersection',
  sizeOptions: [5, 6, 7],
  defaultSize: 6,
  createScenario: createLineIntersectionScenario,
  generator: lineIntersectionGenerator,
  legendItems: () => LINE_INTERSECTION_LEGEND,
  sizeUnit: 'segments',
  randomizeLabel: 'New segment field',
};

const HALF_PLANE_VIEW_CONFIG: GeometryAlgorithmViewConfig<HalfPlaneIntersectionScenario> = {
  kind: 'geometry',
  codeLines: HALF_PLANE_INTERSECTION_CODE,
  variantOptions: HALF_PLANE_VARIANT_OPTIONS,
  defaultVariant: 'half-plane',
  sizeOptions: [4, 5, 6],
  defaultSize: 5,
  createScenario: createHalfPlaneIntersectionScenario,
  generator: halfPlaneIntersectionGenerator,
  legendItems: () => HALF_PLANE_LEGEND,
  sizeUnit: 'planes',
  randomizeLabel: 'New feasible cut',
};

const MINKOWSKI_SUM_VIEW_CONFIG: GeometryAlgorithmViewConfig<MinkowskiSumScenario> = {
  kind: 'geometry',
  codeLines: MINKOWSKI_SUM_CODE,
  variantOptions: MINKOWSKI_SUM_VARIANT_OPTIONS,
  defaultVariant: 'minkowski-sum',
  sizeOptions: [4, 5, 6],
  defaultSize: 5,
  createScenario: createMinkowskiSumScenario,
  generator: minkowskiSumGenerator,
  legendItems: () => MINKOWSKI_SUM_LEGEND,
  sizeUnit: 'verts',
  randomizeLabel: 'New shape pair',
};

const SWEEP_LINE_VIEW_CONFIG: GeometryAlgorithmViewConfig<SweepLineScenario> = {
  kind: 'geometry',
  codeLines: SWEEP_LINE_CODE,
  variantOptions: SWEEP_LINE_VARIANT_OPTIONS,
  defaultVariant: 'sweep-line',
  sizeOptions: [5, 7, 9],
  defaultSize: 7,
  createScenario: createSweepLineScenario,
  generator: sweepLineGenerator,
  legendItems: () => SWEEP_LINE_LEGEND,
  sizeUnit: 'rects',
  randomizeLabel: 'New scan field',
};

const VORONOI_VIEW_CONFIG: GeometryAlgorithmViewConfig<VoronoiDiagramScenario> = {
  kind: 'geometry',
  codeLines: VORONOI_DIAGRAM_CODE,
  variantOptions: VORONOI_VARIANT_OPTIONS,
  defaultVariant: 'voronoi',
  sizeOptions: [6, 8, 10],
  defaultSize: 8,
  createScenario: createVoronoiScenario,
  generator: voronoiDiagramGenerator,
  legendItems: () => VORONOI_LEGEND,
  sizeUnit: 'sites',
  randomizeLabel: 'New crystal field',
};

const DELAUNAY_VIEW_CONFIG: GeometryAlgorithmViewConfig<DelaunayTriangulationScenario> = {
  kind: 'geometry',
  codeLines: DELAUNAY_TRIANGULATION_CODE,
  variantOptions: DELAUNAY_VARIANT_OPTIONS,
  defaultVariant: 'delaunay',
  sizeOptions: [6, 8, 10],
  defaultSize: 8,
  createScenario: createDelaunayScenario,
  generator: delaunayTriangulationGenerator,
  legendItems: () => DELAUNAY_LEGEND,
  sizeUnit: 'sites',
  randomizeLabel: 'New star mesh',
};

@Component({
  selector: 'app-algorithm-detail',
  imports: [LegendBar, SidePanel, VisualizationCanvas, VisualizationToolbar],
  templateUrl: './algorithm-detail.html',
  styleUrl: './algorithm-detail.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [VisualizationEngine],
})
export class AlgorithmDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly registry = inject(AlgorithmRegistry);
  private readonly engine = inject(VisualizationEngine);
  private readonly language = inject(AppLanguageService);

  private readonly idParam = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('id'))),
    { initialValue: this.route.snapshot.paramMap.get('id') },
  );

  readonly algorithm = computed<AlgorithmItem | undefined>(() => {
    const id = this.idParam();
    return id ? this.registry.getById(id) : undefined;
  });

  readonly difficultyLabel = computed(() => {
    const algorithm = this.algorithm();
    if (!algorithm) return '';
    return getDifficultyLabel(algorithm.difficulty, this.language.activeLang());
  });

  readonly unavailableLabel = computed(() =>
    this.language.activeLang() === APP_LANG.EN
      ? 'Visualization is not implemented yet.'
      : 'Ta wizualizacja nie jest jeszcze zaimplementowana.',
  );

  readonly config = computed<AlgorithmViewConfig | null>(() => {
    const algorithm = this.algorithm();
    if (!algorithm?.implemented) {
      return null;
    }
    if (algorithm.id === 'radix-sort') {
      return RADIX_VIEW_CONFIG;
    }
    if (algorithm.id === 'selection-sort') {
      return SELECTION_VIEW_CONFIG;
    }
    if (algorithm.id === 'insertion-sort') {
      return INSERTION_VIEW_CONFIG;
    }
    if (algorithm.id === 'counting-sort') {
      return COUNTING_VIEW_CONFIG;
    }
    if (algorithm.id === 'merge-sort') {
      return MERGE_VIEW_CONFIG;
    }
    if (algorithm.id === 'quick-sort') {
      return QUICK_VIEW_CONFIG;
    }
    if (algorithm.id === 'heap-sort') {
      return HEAP_VIEW_CONFIG;
    }
    if (algorithm.id === 'bucket-sort') {
      return BUCKET_VIEW_CONFIG;
    }
    if (algorithm.id === 'shell-sort') {
      return SHELL_VIEW_CONFIG;
    }
    if (algorithm.id === 'tim-sort') {
      return TIM_VIEW_CONFIG;
    }
    if (algorithm.id === 'linear-search') {
      return LINEAR_SEARCH_VIEW_CONFIG;
    }
    if (algorithm.id === 'binary-search') {
      return BINARY_SEARCH_VIEW_CONFIG;
    }
    if (algorithm.id === 'binary-search-variants') {
      return BINARY_SEARCH_VARIANTS_VIEW_CONFIG;
    }
    if (algorithm.id === 'kmp-pattern-matching') {
      return KMP_VIEW_CONFIG;
    }
    if (algorithm.id === 'rabin-karp') {
      return RABIN_KARP_VIEW_CONFIG;
    }
    if (algorithm.id === 'z-algorithm') {
      return Z_ALGORITHM_VIEW_CONFIG;
    }
    if (algorithm.id === 'manacher') {
      return MANACHER_VIEW_CONFIG;
    }
    if (algorithm.id === 'burrows-wheeler-transform') {
      return BURROWS_WHEELER_VIEW_CONFIG;
    }
    if (algorithm.id === 'knapsack-01') {
      return KNAPSACK_VIEW_CONFIG;
    }
    if (algorithm.id === 'longest-common-subsequence') {
      return LCS_VIEW_CONFIG;
    }
    if (algorithm.id === 'edit-distance') {
      return EDIT_DISTANCE_VIEW_CONFIG;
    }
    if (algorithm.id === 'matrix-chain-multiplication') {
      return MATRIX_CHAIN_VIEW_CONFIG;
    }
    if (algorithm.id === 'coin-change') {
      return COIN_CHANGE_VIEW_CONFIG;
    }
    if (algorithm.id === 'subset-sum') {
      return SUBSET_SUM_VIEW_CONFIG;
    }
    if (algorithm.id === 'longest-palindromic-subsequence') {
      return LPS_VIEW_CONFIG;
    }
    if (algorithm.id === 'burst-balloons') {
      return BURST_BALLOONS_VIEW_CONFIG;
    }
    if (algorithm.id === 'wildcard-matching') {
      return WILDCARD_VIEW_CONFIG;
    }
    if (algorithm.id === 'longest-increasing-subsequence') {
      return LIS_VIEW_CONFIG;
    }
    if (algorithm.id === 'climbing-stairs') {
      return CLIMBING_STAIRS_VIEW_CONFIG;
    }
    if (algorithm.id === 'fibonacci-dp') {
      return FIBONACCI_VIEW_CONFIG;
    }
    if (algorithm.id === 'regex-matching-dp') {
      return REGEX_VIEW_CONFIG;
    }
    if (algorithm.id === 'traveling-salesman-dp') {
      return TSP_VIEW_CONFIG;
    }
    if (algorithm.id === 'sos-dp') {
      return SOS_VIEW_CONFIG;
    }
    if (algorithm.id === 'profile-dp') {
      return PROFILE_VIEW_CONFIG;
    }
    if (algorithm.id === 'dp-on-trees') {
      return TREE_DP_VIEW_CONFIG;
    }
    if (algorithm.id === 'dp-with-bitmask') {
      return BITMASK_DP_VIEW_CONFIG;
    }
    if (algorithm.id === 'dp-convex-hull-trick') {
      return CHT_VIEW_CONFIG;
    }
    if (algorithm.id === 'divide-conquer-dp-optimization') {
      return DIVIDE_CONQUER_VIEW_CONFIG;
    }
    if (algorithm.id === 'knuth-dp-optimization') {
      return KNUTH_VIEW_CONFIG;
    }
    if (algorithm.id === 'dijkstra') {
      return DIJKSTRA_VIEW_CONFIG;
    }
    if (algorithm.id === 'bfs') {
      return BFS_VIEW_CONFIG;
    }
    if (algorithm.id === 'dfs') {
      return DFS_VIEW_CONFIG;
    }
    if (algorithm.id === 'topological-sort-kahn') {
      return TOPOLOGICAL_SORT_KAHN_VIEW_CONFIG;
    }
    if (algorithm.id === 'cycle-detection') {
      return CYCLE_DETECTION_VIEW_CONFIG;
    }
    if (algorithm.id === 'connected-components') {
      return CONNECTED_COMPONENTS_VIEW_CONFIG;
    }
    if (algorithm.id === 'bipartite-check') {
      return BIPARTITE_CHECK_VIEW_CONFIG;
    }
    if (algorithm.id === 'bellman-ford') {
      return BELLMAN_FORD_VIEW_CONFIG;
    }
    if (algorithm.id === 'prims-mst') {
      return PRIMS_MST_VIEW_CONFIG;
    }
    if (algorithm.id === 'bridges-articulation-points') {
      return BRIDGES_ARTICULATION_VIEW_CONFIG;
    }
    if (algorithm.id === 'tarjan-scc') {
      return TARJAN_SCC_VIEW_CONFIG;
    }
    if (algorithm.id === 'kosaraju-scc') {
      return KOSARAJU_SCC_VIEW_CONFIG;
    }
    if (algorithm.id === 'euler-path-circuit') {
      return EULER_VIEW_CONFIG;
    }
    if (algorithm.id === 'chromatic-number') {
      return CHROMATIC_NUMBER_VIEW_CONFIG;
    }
    if (algorithm.id === 'steiner-tree') {
      return STEINER_TREE_VIEW_CONFIG;
    }
    if (algorithm.id === 'dominator-tree') {
      return DOMINATOR_TREE_VIEW_CONFIG;
    }
    if (algorithm.id === 'flood-fill') {
      return FLOOD_FILL_VIEW_CONFIG;
    }
    if (algorithm.id === 'a-star-pathfinding') {
      return A_STAR_VIEW_CONFIG;
    }
    if (algorithm.id === 'floyd-warshall') {
      return FLOYD_WARSHALL_VIEW_CONFIG;
    }
    if (algorithm.id === 'hungarian-algorithm') {
      return HUNGARIAN_VIEW_CONFIG;
    }
    if (algorithm.id === 'union-find') {
      return UNION_FIND_VIEW_CONFIG;
    }
    if (algorithm.id === 'kruskals-mst') {
      return KRUSKAL_VIEW_CONFIG;
    }
    if (algorithm.id === 'hopcroft-karp') {
      return HOPCROFT_KARP_VIEW_CONFIG;
    }
    if (algorithm.id === 'dinic-max-flow') {
      return DINIC_VIEW_CONFIG;
    }
    if (algorithm.id === 'edmonds-karp') {
      return EDMONDS_KARP_VIEW_CONFIG;
    }
    if (algorithm.id === 'min-cost-max-flow') {
      return MIN_COST_MAX_FLOW_VIEW_CONFIG;
    }
    if (algorithm.id === 'convex-hull') {
      return CONVEX_HULL_VIEW_CONFIG;
    }
    if (algorithm.id === 'closest-pair-of-points') {
      return CLOSEST_PAIR_VIEW_CONFIG;
    }
    if (algorithm.id === 'line-intersection') {
      return LINE_INTERSECTION_VIEW_CONFIG;
    }
    if (algorithm.id === 'half-plane-intersection') {
      return HALF_PLANE_VIEW_CONFIG;
    }
    if (algorithm.id === 'minkowski-sum') {
      return MINKOWSKI_SUM_VIEW_CONFIG;
    }
    if (algorithm.id === 'sweep-line') {
      return SWEEP_LINE_VIEW_CONFIG;
    }
    if (algorithm.id === 'voronoi-diagram') {
      return VORONOI_VIEW_CONFIG;
    }
    if (algorithm.id === 'delaunay-triangulation') {
      return DELAUNAY_VIEW_CONFIG;
    }
    return BUBBLE_VIEW_CONFIG;
  });

  private readonly sizeSig = signal(16);
  private readonly variantSig = signal<VisualizationVariant>('bar');
  private readonly mutedSig = signal(true);
  private readonly arraySig = signal<readonly number[]>(this.generateArray(16, { min: 1, max: 99 }));
  private readonly graphSig = signal<WeightedGraphData | null>(null);
  private readonly dpPresetSig = signal<string | null>(null);
  private readonly stringPresetSig = signal<string | null>(null);
  private readonly currentSnapshot = signal<SortStep | null>(null);
  private readonly logEntriesSig = signal<readonly LogEntry[]>([]);
  private readonly graphFocusTargetIdSig = signal<string | null>(null);
  private lastLoggedStep = -1;

  readonly size = this.sizeSig.asReadonly();
  readonly variant = this.variantSig.asReadonly();
  readonly muted = this.mutedSig.asReadonly();
  readonly array = this.arraySig.asReadonly();
  readonly graph = this.graphSig.asReadonly();
  readonly dpPresetId = this.dpPresetSig.asReadonly();
  readonly stringPresetId = this.stringPresetSig.asReadonly();
  readonly graphFocusTargetId = this.graphFocusTargetIdSig.asReadonly();
  readonly currentStep = this.engine.currentStep;
  readonly totalSteps = this.engine.totalSteps;
  readonly isPlaying = this.engine.isPlaying;
  readonly speed = this.engine.speed;
  readonly step = this.currentSnapshot.asReadonly();
  readonly logEntries = this.logEntriesSig.asReadonly();
  readonly sizeOptions = computed(() => this.config()?.sizeOptions ?? []);
  readonly variantOptions = computed(() => this.config()?.variantOptions ?? []);
  readonly dpPresetOptions = computed<readonly DpPresetOption[]>(() => {
    const config = this.config();
    return config?.kind === 'dp' ? config.presetOptions : [];
  });
  readonly stringPresetOptions = computed<readonly StringPresetOption[]>(() => {
    const config = this.config();
    return config?.kind === 'string' ? config.presetOptions : [];
  });
  readonly sizeUnit = computed(() => this.config()?.sizeUnit ?? 'elements');
  readonly randomizeLabel = computed(() => this.config()?.randomizeLabel ?? 'Randomize');
  readonly graphTrace = computed(() => this.currentSnapshot()?.graph ?? null);
  readonly dpTrace = computed<DpTraceState | null>(() => this.currentSnapshot()?.dp ?? null);
  readonly dsuTrace = computed<DsuTraceState | null>(() => this.currentSnapshot()?.dsu ?? null);
  readonly gridTrace = computed<GridTraceState | null>(() => this.currentSnapshot()?.grid ?? null);
  readonly matrixTrace = computed<MatrixTraceState | null>(() => this.currentSnapshot()?.matrix ?? null);
  readonly networkTrace = computed<NetworkTraceState | null>(() => this.currentSnapshot()?.network ?? null);
  readonly searchTrace = computed<SearchTraceState | null>(() => this.currentSnapshot()?.search ?? null);
  readonly stringTrace = computed<StringTraceState | null>(() => this.currentSnapshot()?.string ?? null);
  readonly geometryTrace = computed<GeometryStepState | null>(() => this.currentSnapshot()?.geometry ?? null);
  readonly graphRouteModeLabel = computed(() => {
    const trace = this.graphTrace();
    if (!trace) return null;
    if (trace.metricLabel === 'Distance') return 'Focused shortest path';
    if (trace.metricLabel === 'Level') return 'Focused BFS route';
    if (trace.metricLabel === 'Depth' && trace.detailLabel === 'Depth path') return 'Focused DFS branch';
    return null;
  });
  readonly graphFocusTargetLabel = computed(() => {
    const trace = this.graphTrace();
    const targetId = this.resolvedGraphFocusTargetId();
    if (!trace || !targetId || !this.graphRouteModeLabel()) return null;
    return trace.nodes.find((node) => node.id === targetId)?.label ?? null;
  });
  readonly graphFocusPathLabel = computed(() => {
    const trace = this.graphTrace();
    const targetId = this.resolvedGraphFocusTargetId();
    if (!trace || !targetId || !this.graphRouteModeLabel()) return null;
    return describeGraphPath(trace, targetId);
  });
  readonly graphFocusHint = computed(() => {
    const trace = this.graphTrace();
    if (!trace || !this.graphRouteModeLabel()) return null;
    if (trace.metricLabel === 'Distance') {
      return 'Whole graph shows the shortest-path tree. This line shows one selected endpoint route.';
    }
    if (trace.metricLabel === 'Level') {
      return 'Whole graph shows the BFS discovery tree. This line shows one selected source-to-node route.';
    }
    if (trace.metricLabel === 'Depth' && trace.detailLabel === 'Depth path') {
      return 'Whole graph shows the DFS tree. This line shows one selected explored branch.';
    }
    return null;
  });

  readonly activeLineNumber = computed<number | null>(() => {
    const snap = this.currentSnapshot();
    return snap ? snap.activeCodeLine : null;
  });

  readonly legendItems = computed<readonly LegendItem[]>(() => {
    return this.config()?.legendItems(this.variantSig()) ?? [];
  });

  readonly codeLines = computed(() => this.config()?.codeLines ?? []);

  constructor() {
    effect(() => {
      const config = this.config();
      const algorithm = this.algorithm();

      untracked(() => {
        if (!algorithm?.implemented || !config) {
          this.logEntriesSig.set([]);
          this.lastLoggedStep = -1;
          this.currentSnapshot.set(null);
          this.graphSig.set(null);
          this.dpPresetSig.set(null);
          this.stringPresetSig.set(null);
          this.graphFocusTargetIdSig.set(null);
          this.engine.reset();
          return;
        }

        this.sizeSig.set(config.defaultSize);
        this.variantSig.set(config.defaultVariant);
        this.mutedSig.set(true);
        this.dpPresetSig.set(config.kind === 'dp' ? config.defaultPresetId : null);
        this.stringPresetSig.set(config.kind === 'string' ? config.defaultPresetId : null);
        this.graphFocusTargetIdSig.set(null);

        if (config.kind === 'graph') {
          const nextGraph = config.createGraph(config.defaultSize);
          this.arraySig.set([]);
          this.graphSig.set(nextGraph);
          this.loadGraphEngine(nextGraph, config.generator);
          return;
        }

        if (config.kind === 'search') {
          const scenario = config.createScenario(config.defaultSize);
          this.arraySig.set(scenario.array);
          this.graphSig.set(null);
          this.loadSearchEngine(scenario, config.generator);
          return;
        }

        if (config.kind === 'string') {
          const scenario = config.createScenario(config.defaultSize, config.defaultPresetId);
          this.arraySig.set([]);
          this.graphSig.set(null);
          this.loadStringEngine(scenario, config.generator);
          return;
        }

        if (config.kind === 'grid') {
          const scenario = config.createScenario(config.defaultSize);
          this.arraySig.set([]);
          this.graphSig.set(null);
          this.loadGridEngine(scenario, config.generator);
          return;
        }

        if (config.kind === 'matrix') {
          const scenario = config.createScenario(config.defaultSize);
          this.arraySig.set([]);
          this.graphSig.set(null);
          this.loadMatrixEngine(scenario, config.generator);
          return;
        }

        if (config.kind === 'dp') {
          const scenario = config.createScenario(config.defaultSize, config.defaultPresetId);
          this.arraySig.set([]);
          this.graphSig.set(null);
          this.loadDpEngine(scenario, config.generator);
          return;
        }

        if (config.kind === 'dsu') {
          const scenario = config.createScenario(config.defaultSize);
          this.arraySig.set([]);
          this.graphSig.set(null);
          this.loadDsuEngine(scenario, config.generator);
          return;
        }

        if (config.kind === 'network') {
          const scenario = config.createScenario(config.defaultSize);
          this.arraySig.set([]);
          this.graphSig.set(null);
          this.loadNetworkEngine(scenario, config.generator);
          return;
        }

        if (config.kind === 'geometry') {
          const scenario = config.createScenario(config.defaultSize);
          this.arraySig.set([]);
          this.graphSig.set(null);
          this.loadGeometryEngine(scenario, config.generator);
          return;
        }

        const nextArray = this.generateArray(config.defaultSize, config.randomRange);
        this.arraySig.set(nextArray);
        this.graphSig.set(null);
        this.loadArrayEngine(nextArray, config.generator);
      });
    });
  }

  back(): void {
    this.router.navigate(['/algorithms']);
  }

  onReset(): void {
    this.logEntriesSig.set([]);
    this.lastLoggedStep = -1;
    this.graphFocusTargetIdSig.set(null);
    this.engine.reset();
  }

  onStepBack(): void {
    this.engine.stepBack();
  }

  onPlayToggle(): void {
    if (this.engine.state() === 'running') {
      this.engine.pause();
    } else {
      this.engine.play();
    }
  }

  onStepForward(): void {
    this.engine.stepForward();
  }

  onSpeedChange(value: number): void {
    this.engine.setSpeed(value);
  }

  onSizeChange(value: number): void {
    const config = this.config();
    if (!config) return;

    this.sizeSig.set(value);

    if (config.kind === 'graph') {
      const nextGraph = config.createGraph(value);
      this.graphSig.set(nextGraph);
      this.arraySig.set([]);
      this.loadGraphEngine(nextGraph, config.generator);
      return;
    }

    if (config.kind === 'search') {
      const scenario = config.createScenario(value);
      this.arraySig.set(scenario.array);
      this.graphSig.set(null);
      this.loadSearchEngine(scenario, config.generator);
      return;
    }

    if (config.kind === 'string') {
      const presetId = this.stringPresetSig() ?? config.defaultPresetId;
      const scenario = config.createScenario(value, presetId);
      this.arraySig.set([]);
      this.graphSig.set(null);
      this.loadStringEngine(scenario, config.generator);
      return;
    }

    if (config.kind === 'grid') {
      const scenario = config.createScenario(value);
      this.arraySig.set([]);
      this.graphSig.set(null);
      this.loadGridEngine(scenario, config.generator);
      return;
    }

    if (config.kind === 'matrix') {
      const scenario = config.createScenario(value);
      this.arraySig.set([]);
      this.graphSig.set(null);
      this.loadMatrixEngine(scenario, config.generator);
      return;
    }

    if (config.kind === 'dp') {
      const presetId = this.dpPresetSig() ?? config.defaultPresetId;
      const scenario = config.createScenario(value, presetId);
      this.arraySig.set([]);
      this.graphSig.set(null);
      this.loadDpEngine(scenario, config.generator);
      return;
    }

    if (config.kind === 'dsu') {
      const scenario = config.createScenario(value);
      this.arraySig.set([]);
      this.graphSig.set(null);
      this.loadDsuEngine(scenario, config.generator);
      return;
    }

    if (config.kind === 'network') {
      const scenario = config.createScenario(value);
      this.arraySig.set([]);
      this.graphSig.set(null);
      this.loadNetworkEngine(scenario, config.generator);
      return;
    }

    if (config.kind === 'geometry') {
      const scenario = config.createScenario(value);
      this.arraySig.set([]);
      this.graphSig.set(null);
      this.loadGeometryEngine(scenario, config.generator);
      return;
    }

    const nextArray = this.generateArray(value, config.randomRange);
    this.arraySig.set(nextArray);
    this.graphSig.set(null);
    this.loadArrayEngine(nextArray, config.generator);
  }

  onRandomize(): void {
    const config = this.config();
    if (!config) return;

    if (config.kind === 'graph') {
      const nextGraph = config.createGraph(this.sizeSig());
      this.graphSig.set(nextGraph);
      this.arraySig.set([]);
      this.loadGraphEngine(nextGraph, config.generator);
      return;
    }

    if (config.kind === 'search') {
      const scenario = config.createScenario(this.sizeSig());
      this.arraySig.set(scenario.array);
      this.graphSig.set(null);
      this.loadSearchEngine(scenario, config.generator);
      return;
    }

    if (config.kind === 'string') {
      const presetId = this.stringPresetSig() ?? config.defaultPresetId;
      const scenario = config.createScenario(this.sizeSig(), presetId);
      this.arraySig.set([]);
      this.graphSig.set(null);
      this.loadStringEngine(scenario, config.generator);
      return;
    }

    if (config.kind === 'grid') {
      const scenario = config.createScenario(this.sizeSig());
      this.arraySig.set([]);
      this.graphSig.set(null);
      this.loadGridEngine(scenario, config.generator);
      return;
    }

    if (config.kind === 'matrix') {
      const scenario = config.createScenario(this.sizeSig());
      this.arraySig.set([]);
      this.graphSig.set(null);
      this.loadMatrixEngine(scenario, config.generator);
      return;
    }

    if (config.kind === 'dp') {
      const presetId = this.dpPresetSig() ?? config.defaultPresetId;
      const scenario = config.createScenario(this.sizeSig(), presetId);
      this.arraySig.set([]);
      this.graphSig.set(null);
      this.loadDpEngine(scenario, config.generator);
      return;
    }

    if (config.kind === 'dsu') {
      const scenario = config.createScenario(this.sizeSig());
      this.arraySig.set([]);
      this.graphSig.set(null);
      this.loadDsuEngine(scenario, config.generator);
      return;
    }

    if (config.kind === 'network') {
      const scenario = config.createScenario(this.sizeSig());
      this.arraySig.set([]);
      this.graphSig.set(null);
      this.loadNetworkEngine(scenario, config.generator);
      return;
    }

    if (config.kind === 'geometry') {
      const scenario = config.createScenario(this.sizeSig());
      this.arraySig.set([]);
      this.graphSig.set(null);
      this.loadGeometryEngine(scenario, config.generator);
      return;
    }

    const nextArray = this.generateArray(this.sizeSig(), config.randomRange);
    this.arraySig.set(nextArray);
    this.graphSig.set(null);
    this.loadArrayEngine(nextArray, config.generator);
  }

  onVariantChange(value: VisualizationVariant): void {
    const config = this.config();
    if (!config) return;
    const allowed = config.variantOptions.some((option) => option.value === value);
    if (!allowed || value === this.variantSig()) return;

    this.variantSig.set(value);
    this.logEntriesSig.set([]);
    this.lastLoggedStep = -1;
    this.engine.reset();
  }

  onMuteToggle(): void {
    this.mutedSig.update((muted) => !muted);
  }

  onGraphFocusTargetChange(value: string | null): void {
    this.graphFocusTargetIdSig.set(value);
  }

  onDpPresetChange(value: string): void {
    const config = this.config();
    if (!config || config.kind !== 'dp') return;
    const allowed = config.presetOptions.some((option) => option.id === value);
    if (!allowed || value === this.dpPresetSig()) return;

    this.dpPresetSig.set(value);
    const scenario = config.createScenario(this.sizeSig(), value);
    this.arraySig.set([]);
    this.graphSig.set(null);
    this.loadDpEngine(scenario, config.generator);
  }

  onStringPresetChange(value: string): void {
    const config = this.config();
    if (!config || config.kind !== 'string') return;
    const allowed = config.presetOptions.some((option) => option.id === value);
    if (!allowed || value === this.stringPresetSig()) return;

    this.stringPresetSig.set(value);
    const scenario = config.createScenario(this.sizeSig(), value);
    this.arraySig.set([]);
    this.graphSig.set(null);
    this.loadStringEngine(scenario, config.generator);
  }

  private loadArrayEngine(
    array: readonly number[],
    generator: (values: readonly number[]) => Generator<SortStep>,
  ): void {
    this.loadEngine(generator(array));
  }

  private loadGraphEngine(
    graph: WeightedGraphData,
    generator: (graph: WeightedGraphData) => Generator<SortStep>,
  ): void {
    this.loadEngine(generator(graph));
  }

  private loadSearchEngine(
    scenario: SearchScenario,
    generator: (scenario: SearchScenario) => Generator<SortStep>,
  ): void {
    this.loadEngine(generator(scenario));
  }

  private loadStringEngine<TScenario>(
    scenario: TScenario,
    generator: (scenario: TScenario) => Generator<SortStep>,
  ): void {
    this.loadEngine(generator(scenario));
  }

  private loadGridEngine<TScenario>(
    scenario: TScenario,
    generator: (scenario: TScenario) => Generator<SortStep>,
  ): void {
    this.loadEngine(generator(scenario));
  }

  private loadMatrixEngine<TScenario>(
    scenario: TScenario,
    generator: (scenario: TScenario) => Generator<SortStep>,
  ): void {
    this.loadEngine(generator(scenario));
  }

  private loadDpEngine<TScenario>(
    scenario: TScenario,
    generator: (scenario: TScenario) => Generator<SortStep>,
  ): void {
    this.loadEngine(generator(scenario));
  }

  private loadDsuEngine<TScenario>(
    scenario: TScenario,
    generator: (scenario: TScenario) => Generator<SortStep>,
  ): void {
    this.loadEngine(generator(scenario));
  }

  private loadNetworkEngine<TScenario>(
    scenario: TScenario,
    generator: (scenario: TScenario) => Generator<SortStep>,
  ): void {
    this.loadEngine(generator(scenario));
  }

  private loadGeometryEngine<TScenario>(
    scenario: TScenario,
    generator: (scenario: TScenario) => Generator<SortStep>,
  ): void {
    this.loadEngine(generator(scenario));
  }

  private loadEngine(generator: Generator<SortStep>): void {
    this.logEntriesSig.set([]);
    this.lastLoggedStep = -1;
    this.currentSnapshot.set(null);
    this.graphFocusTargetIdSig.set(null);
    this.engine.load(generator, (step, index) => {
      this.currentSnapshot.set(step);
      this.appendLog(step, index);
    });
  }

  private appendLog(step: SortStep, index: number): void {
    if (index <= this.lastLoggedStep) return;
    this.lastLoggedStep = index;
    const entries = this.logEntriesSig();
    const next: LogEntry = {
      step: index,
      description: step.description,
      timestamp: Date.now() + entries.length,
    };
    this.logEntriesSig.set([...entries, next]);
  }

  private generateArray(size: number, range: RandomRange): readonly number[] {
    const result: number[] = [];
    for (let index = 0; index < size; index++) {
      const span = range.max - range.min + 1;
      result.push(Math.floor(Math.random() * span) + range.min);
    }
    return result;
  }

  private resolvedGraphFocusTargetId(): string | null {
    const trace = this.graphTrace();
    if (!trace) return null;

    const selected = this.graphFocusTargetIdSig();
    if (selected && trace.nodes.some((node) => node.id === selected)) {
      return selected;
    }

    if (trace.currentNodeId) {
      return trace.currentNodeId;
    }

    const sourceId = trace.sourceId;
    const candidates = trace.nodes
      .filter((node) => node.id !== sourceId && node.distance !== null)
      .sort((left, right) => {
        const leftDistance = left.distance ?? Number.NEGATIVE_INFINITY;
        const rightDistance = right.distance ?? Number.NEGATIVE_INFINITY;
        if (leftDistance !== rightDistance) return rightDistance - leftDistance;
        return left.label.localeCompare(right.label);
      });

    return candidates[0]?.id ?? sourceId ?? null;
  }
}

function describeGraphPath(trace: GraphStepState, nodeId: string): string {
  const path: string[] = [];
  let currentId: string | null = nodeId;
  let hops = 0;
  while (currentId && hops < trace.nodes.length + 1) {
    const node = trace.nodes.find((item) => item.id === currentId);
    path.unshift(node?.label ?? currentId);
    currentId = node?.previousId ?? null;
    hops++;
  }
  return path.join(' → ');
}

function createLinearSearchScenario(size: number): SearchScenario {
  const array = Array.from({ length: size }, () => Math.floor(Math.random() * 89) + 10);
  const shouldHit = Math.random() < 0.78;
  if (shouldHit && array.length > 0) {
    return {
      array,
      target: array[Math.floor(Math.random() * array.length)] ?? 0,
    };
  }

  let target = Math.floor(Math.random() * 89) + 10;
  while (array.includes(target)) {
    target = Math.floor(Math.random() * 89) + 10;
  }
  return { array, target };
}

function createBinarySearchScenario(size: number): SearchScenario {
  const set = new Set<number>();
  while (set.size < size) {
    set.add(Math.floor(Math.random() * 90) + 10);
  }
  const array = [...set].sort((left, right) => left - right);
  const shouldHit = Math.random() < 0.76;

  if (shouldHit && array.length > 0) {
    return {
      array,
      target: array[Math.floor(Math.random() * array.length)] ?? 0,
    };
  }

  let target = (array[0] ?? 10) - 1;
  while (array.includes(target)) {
    target++;
  }
  return { array, target };
}

function createConvexHullScenario(size: number): ConvexHullScenario {
  const points: { x: number; y: number }[] = [];
  for (let i = 0; i < size; i++) {
    points.push({
      x: Math.round(Math.random() * 76) + 12,
      y: Math.round(Math.random() * 76) + 12,
    });
  }
  return { points };
}

function createClosestPairScenario(size: number): ClosestPairScenario {
  const points: { x: number; y: number }[] = [];
  const closePairY = Math.round(Math.random() * 26) + 34;
  const centerX = 50 + (Math.random() * 2 - 1);

  points.push({ x: Number((centerX - 1.4).toFixed(1)), y: Number((closePairY - 0.9).toFixed(1)) });
  points.push({ x: Number((centerX + 1.3).toFixed(1)), y: Number((closePairY + 1.2).toFixed(1)) });

  const leftTarget = Math.floor((size - 2) / 2);

  const tryAddPoint = (xMin: number, xMax: number, yMin: number, yMax: number): boolean => {
    const candidate = {
      x: Math.round(Math.random() * (xMax - xMin)) + xMin,
      y: Math.round(Math.random() * (yMax - yMin)) + yMin,
    };
    const tooClose = points.some(
      (point) => Math.hypot(point.x - candidate.x, point.y - candidate.y) < 7,
    );
    if (tooClose) return false;
    points.push(candidate);
    return true;
  };

  let guard = 0;
  while (points.length < leftTarget + 2 && guard < 300) {
    guard += 1;
    tryAddPoint(12, 42, 12, 86);
  }

  guard = 0;
  while (points.length < size && guard < 400) {
    guard += 1;
    const remainingRight = points.length >= leftTarget + 2;
    if (remainingRight) {
      tryAddPoint(58, 88, 12, 86);
    } else {
      tryAddPoint(12, 42, 12, 86);
    }
  }

  while (points.length < size) {
    const onRight = points.length >= leftTarget + 2;
    points.push({
      x: Math.round(Math.random() * 20) + (onRight ? 60 : 16),
      y: Math.round(Math.random() * 64) + 16,
    });
  }

  return { points: points.slice(0, Math.max(2, size)) };
}

function createLineIntersectionScenario(size: number): LineIntersectionScenario {
  const count = Math.max(4, size);
  const step = count > 1 ? 70 / (count - 1) : 0;
  const leftYs = Array.from({ length: count }, (_, index) =>
    Number((15 + index * step + (Math.random() * 3 - 1.5)).toFixed(1)),
  );
  const rightYs = [...leftYs].reverse().map((value, index) =>
    Number((value + (index % 2 === 0 ? 2.2 : -2.2)).toFixed(1)),
  );

  return {
    segments: leftYs.map((leftY, index) => ({
      x1: Number((12 + index * 1.2).toFixed(1)),
      y1: leftY,
      x2: Number((88 - index * 1.1).toFixed(1)),
      y2: Math.max(12, Math.min(88, rightYs[index] ?? leftY)),
    })),
  };
}

function createHalfPlaneIntersectionScenario(size: number): HalfPlaneIntersectionScenario {
  const polygon = createConvexPolygon(size, 50, 50, 18, 28);
  const constraints = polygon.map((vertex, index) => ({
    start: vertex,
    end: polygon[(index + 1) % polygon.length]!,
  }));

  shuffleInPlace(constraints);
  return { constraints };
}

function createMinkowskiSumScenario(size: number): MinkowskiSumScenario {
  const obstacle = createConvexPolygon(size, 0, 0, 10, 18);
  const robot = createConvexPolygon(Math.max(3, Math.min(5, size - 1)), 0, 0, 4, 8);
  return { obstacle, robot };
}

function createSweepLineScenario(size: number): SweepLineScenario {
  const rectangles: { x: number; y: number; width: number; height: number }[] = [];
  for (let index = 0; index < Math.max(4, size); index++) {
    const width = Math.round(Math.random() * 12) + 12;
    const height = Math.round(Math.random() * 18) + 10;
    rectangles.push({
      x: Math.round(Math.random() * 52) + 10,
      y: Math.round(Math.random() * (78 - height)) + 10,
      width,
      height,
    });
  }
  return { rectangles };
}

function createVoronoiScenario(size: number): VoronoiDiagramScenario {
  return { points: createSpacedGeometryPoints(Math.max(5, size), 9) };
}

function createDelaunayScenario(size: number): DelaunayTriangulationScenario {
  return { points: createSpacedGeometryPoints(Math.max(5, size), 9) };
}

function createConvexPolygon(
  count: number,
  centerX: number,
  centerY: number,
  radiusMin: number,
  radiusMax: number,
): { x: number; y: number }[] {
  const vertexCount = Math.max(3, count);
  const baseRadius = (radiusMin + radiusMax) / 2;
  return Array.from({ length: vertexCount }, (_, index) => {
    const angle =
      (Math.PI * 2 * index) / vertexCount +
      (Math.random() * 0.3 - 0.15);
    const radius = baseRadius * (0.88 + Math.random() * 0.18);
    return {
      x: Number((centerX + Math.cos(angle) * radius).toFixed(1)),
      y: Number((centerY + Math.sin(angle) * radius).toFixed(1)),
    };
  });
}

function shuffleInPlace<T>(values: T[]): void {
  for (let index = values.length - 1; index > 0; index--) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [values[index], values[swapIndex]] = [values[swapIndex]!, values[index]!];
  }
}

function createSpacedGeometryPoints(count: number, minDistance: number): { x: number; y: number }[] {
  const points: { x: number; y: number }[] = [];
  let guard = 0;

  while (points.length < count && guard < count * 120) {
    guard += 1;
    const candidate = {
      x: Math.round(Math.random() * 74) + 12,
      y: Math.round(Math.random() * 74) + 12,
    };
    const tooClose = points.some((point) => Math.hypot(point.x - candidate.x, point.y - candidate.y) < minDistance);
    if (!tooClose) {
      points.push(candidate);
    }
  }

  while (points.length < count) {
    points.push({
      x: Math.round(Math.random() * 74) + 12,
      y: Math.round(Math.random() * 74) + 12,
    });
  }

  return points;
}

function createBinarySearchVariantsScenario(size: number): SearchScenario {
  const baseValues: number[] = [];
  let current = Math.floor(Math.random() * 6) + 8;
  while (baseValues.length < Math.max(6, Math.ceil(size / 2))) {
    current += Math.floor(Math.random() * 4) + 1;
    baseValues.push(current);
  }

  const array: number[] = [];
  for (const value of baseValues) {
    array.push(value);
    if (array.length >= size) break;
    if (Math.random() < 0.58 && array.length < size) array.push(value);
    if (Math.random() < 0.22 && array.length < size) array.push(value);
    if (array.length >= size) break;
  }

  while (array.length < size) {
    array.push(baseValues[Math.floor(Math.random() * baseValues.length)] ?? current);
  }

  array.sort((left, right) => left - right);

  const counts = new Map<number, number>();
  for (const value of array) {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  const duplicatedValues = [...counts.entries()]
    .filter(([, count]) => count > 1)
    .map(([value]) => value);

  const targetPool = duplicatedValues.length > 0 ? duplicatedValues : array;
  return {
    array,
    target: targetPool[Math.floor(Math.random() * targetPool.length)] ?? array[0] ?? 0,
  };
}
