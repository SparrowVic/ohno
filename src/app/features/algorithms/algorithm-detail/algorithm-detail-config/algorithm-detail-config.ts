import { aStarPathfindingGenerator } from '../../algorithms/a-star-pathfinding/a-star-pathfinding';
import { bfsGenerator } from '../../algorithms/bfs/bfs';
import { bellmanFordGenerator } from '../../algorithms/bellman-ford/bellman-ford';
import { binarySearchGenerator } from '../../algorithms/binary-search/binary-search';
import { binarySearchVariantsGenerator } from '../../algorithms/binary-search-variants/binary-search-variants';
import { bipartiteCheckGenerator } from '../../algorithms/bipartite-check/bipartite-check';
import { bridgesArticulationPointsGenerator } from '../../algorithms/bridges-articulation-points';
import { burstBalloonsGenerator } from '../../algorithms/burst-balloons/burst-balloons';
import { bucketSortGenerator } from '../../algorithms/bucket-sort';
import { bubbleSortGenerator } from '../../algorithms/bubble-sort';
import { climbingStairsGenerator } from '../../algorithms/climbing-stairs/climbing-stairs';
import { chromaticNumberGenerator } from '../../algorithms/chromatic-number';
import {
  closestPairOfPointsGenerator,
  ClosestPairScenario,
} from '../../algorithms/closest-pair-of-points';
import { coinChangeGenerator } from '../../algorithms/coin-change/coin-change';
import { connectedComponentsGenerator } from '../../algorithms/connected-components/connected-components';
import { countingSortGenerator } from '../../algorithms/counting-sort';
import { cycleDetectionGenerator } from '../../algorithms/cycle-detection/cycle-detection';
import { dpConvexHullTrickGenerator } from '../../algorithms/dp-convex-hull-trick';
import { dpOnTreesGenerator } from '../../algorithms/dp-on-trees';
import { dpWithBitmaskGenerator } from '../../algorithms/dp-with-bitmask';
import { dijkstraGenerator } from '../../algorithms/dijkstra/dijkstra';
import { dinicMaxFlowGenerator } from '../../algorithms/dinic-max-flow';
import { divideConquerDpOptimizationGenerator } from '../../algorithms/divide-conquer-dp-optimization';
import { edmondsKarpGenerator } from '../../algorithms/edmonds-karp';
import { dfsGenerator } from '../../algorithms/dfs/dfs';
import { dominatorTreeGenerator } from '../../algorithms/dominator-tree';
import { editDistanceGenerator } from '../../algorithms/edit-distance/edit-distance';
import { eulerPathCircuitGenerator } from '../../algorithms/euler-path-circuit';
import { fibonacciDpGenerator } from '../../algorithms/fibonacci-dp/fibonacci-dp';
import { floydWarshallGenerator } from '../../algorithms/floyd-warshall/floyd-warshall';
import { floodFillGenerator } from '../../algorithms/flood-fill/flood-fill';
import { huffmanCodingGenerator } from '../../algorithms/huffman-coding/huffman-coding';
import {
  halfPlaneIntersectionGenerator,
  HalfPlaneIntersectionScenario,
} from '../../algorithms/half-plane-intersection';
import { heapSortGenerator } from '../../algorithms/heap-sort';
import { insertionSortGenerator } from '../../algorithms/insertion-sort';
import { knapsack01Generator } from '../../algorithms/knapsack-01/knapsack-01';
import { knuthDpOptimizationGenerator } from '../../algorithms/knuth-dp-optimization';
import { kruskalsMstGenerator } from '../../algorithms/kruskals-mst';
import { linearSearchGenerator } from '../../algorithms/linear-search/linear-search';
import {
  lineIntersectionGenerator,
  LineIntersectionScenario,
} from '../../algorithms/line-intersection';
import { longestCommonSubsequenceGenerator } from '../../algorithms/longest-common-subsequence/longest-common-subsequence';
import { longestIncreasingSubsequenceGenerator } from '../../algorithms/longest-increasing-subsequence/longest-increasing-subsequence';
import { longestPalindromicSubsequenceGenerator } from '../../algorithms/longest-palindromic-subsequence/longest-palindromic-subsequence';
import { manacherGenerator } from '../../algorithms/manacher/manacher';
import { matrixChainMultiplicationGenerator } from '../../algorithms/matrix-chain-multiplication/matrix-chain-multiplication';
import { mergeSortGenerator } from '../../algorithms/merge-sort';
import { minCostMaxFlowGenerator } from '../../algorithms/min-cost-max-flow';
import { minkowskiSumGenerator, MinkowskiSumScenario } from '../../algorithms/minkowski-sum';
import { kmpPatternMatchingGenerator } from '../../algorithms/kmp-pattern-matching/kmp-pattern-matching';
import { quickSortGenerator } from '../../algorithms/quick-sort';
import { radixSortGenerator } from '../../algorithms/radix-sort';
import { primsMstGenerator } from '../../algorithms/prims-mst';
import { profileDpGenerator } from '../../algorithms/profile-dp';
import { rabinKarpGenerator } from '../../algorithms/rabin-karp/rabin-karp';
import { runLengthEncodingGenerator } from '../../algorithms/run-length-encoding/run-length-encoding';
import { regexMatchingDpGenerator } from '../../algorithms/regex-matching-dp/regex-matching-dp';
import { selectionSortGenerator } from '../../algorithms/selection-sort';
import { shellSortGenerator } from '../../algorithms/shell-sort';
import { sosDpGenerator } from '../../algorithms/sos-dp';
import { subsetSumGenerator } from '../../algorithms/subset-sum/subset-sum';
import { steinerTreeGenerator } from '../../algorithms/steiner-tree';
import { sweepLineGenerator, SweepLineScenario } from '../../algorithms/sweep-line';
import { tarjanSccGenerator } from '../../algorithms/tarjan-scc';
import { timSortGenerator } from '../../algorithms/tim-sort';
import { topologicalSortKahnGenerator } from '../../algorithms/topological-sort-kahn/topological-sort-kahn';
import { travelingSalesmanDpGenerator } from '../../algorithms/traveling-salesman-dp';
import { unionFindGenerator } from '../../algorithms/union-find';
import { voronoiDiagramGenerator, VoronoiDiagramScenario } from '../../algorithms/voronoi-diagram';
import { wildcardMatchingGenerator } from '../../algorithms/wildcard-matching/wildcard-matching';
import { zAlgorithmGenerator } from '../../algorithms/z-algorithm/z-algorithm';
import { burrowsWheelerTransformGenerator } from '../../algorithms/burrows-wheeler-transform/burrows-wheeler-transform';
import { convexHullGenerator, ConvexHullScenario } from '../../algorithms/convex-hull';
import {
  delaunayTriangulationGenerator,
  DelaunayTriangulationScenario,
} from '../../algorithms/delaunay-triangulation';
import { hopcroftKarpGenerator } from '../../algorithms/hopcroft-karp';
import { hungarianAlgorithmGenerator } from '../../algorithms/hungarian-algorithm';
import { kosarajuSccGenerator } from '../../algorithms/kosaraju-scc';
import {
  A_STAR_PATHFINDING_CODE,
  A_STAR_PATHFINDING_CODE_VARIANTS,
} from '../../data/a-star-pathfinding-code';
import {
  BELLMAN_FORD_CODE,
  BELLMAN_FORD_CODE_HIGHLIGHT_MAP,
  BELLMAN_FORD_CODE_REGIONS,
  BELLMAN_FORD_CODE_VARIANTS,
} from '../../data/bellman-ford-code';
import {
  BFS_CODE,
  BFS_CODE_HIGHLIGHT_MAP,
  BFS_CODE_REGIONS,
  BFS_CODE_VARIANTS,
} from '../../data/bfs-code';
import {
  BINARY_SEARCH_CODE,
  BINARY_SEARCH_CODE_HIGHLIGHT_MAP,
  BINARY_SEARCH_CODE_REGIONS,
  BINARY_SEARCH_CODE_VARIANTS,
} from '../../data/binary-search-code';
import {
  BINARY_SEARCH_VARIANTS_CODE,
  BINARY_SEARCH_VARIANTS_CODE_HIGHLIGHT_MAP,
  BINARY_SEARCH_VARIANTS_CODE_REGIONS,
  BINARY_SEARCH_VARIANTS_CODE_VARIANTS,
} from '../../data/binary-search-variants-code';
import {
  BIPARTITE_CHECK_CODE,
  BIPARTITE_CHECK_CODE_HIGHLIGHT_MAP,
  BIPARTITE_CHECK_CODE_REGIONS,
  BIPARTITE_CHECK_CODE_VARIANTS,
} from '../../data/bipartite-check-code';
import {
  BRIDGES_ARTICULATION_POINTS_CODE,
  BRIDGES_ARTICULATION_POINTS_CODE_HIGHLIGHT_MAP,
  BRIDGES_ARTICULATION_POINTS_CODE_REGIONS,
  BRIDGES_ARTICULATION_POINTS_CODE_VARIANTS,
} from '../../data/bridges-articulation-points-code';
import {
  BURST_BALLOONS_CODE,
  BURST_BALLOONS_CODE_HIGHLIGHT_MAP,
  BURST_BALLOONS_CODE_REGIONS,
  BURST_BALLOONS_CODE_VARIANTS,
} from '../../data/burst-balloons-code';
import {
  BUCKET_SORT_CODE,
  BUCKET_SORT_CODE_HIGHLIGHT_MAP,
  BUCKET_SORT_CODE_REGIONS,
  BUCKET_SORT_CODE_VARIANTS,
} from '../../data/bucket-sort-code';
import {
  BUBBLE_SORT_CODE,
  BUBBLE_SORT_CODE_HIGHLIGHT_MAP,
  BUBBLE_SORT_CODE_REGIONS,
  BUBBLE_SORT_CODE_VARIANTS,
} from '../../data/bubble-sort-code';
import {
  CLIMBING_STAIRS_CODE,
  CLIMBING_STAIRS_CODE_HIGHLIGHT_MAP,
  CLIMBING_STAIRS_CODE_REGIONS,
  CLIMBING_STAIRS_CODE_VARIANTS,
} from '../../data/climbing-stairs-code';
import {
  CHROMATIC_NUMBER_CODE,
  CHROMATIC_NUMBER_CODE_HIGHLIGHT_MAP,
  CHROMATIC_NUMBER_CODE_REGIONS,
  CHROMATIC_NUMBER_CODE_VARIANTS,
} from '../../data/chromatic-number-code';
import {
  CLOSEST_PAIR_OF_POINTS_CODE,
  CLOSEST_PAIR_OF_POINTS_CODE_HIGHLIGHT_MAP,
  CLOSEST_PAIR_OF_POINTS_CODE_REGIONS,
  CLOSEST_PAIR_OF_POINTS_CODE_VARIANTS,
} from '../../data/closest-pair-of-points-code';
import {
  COIN_CHANGE_CODE,
  COIN_CHANGE_CODE_HIGHLIGHT_MAP,
  COIN_CHANGE_CODE_REGIONS,
  COIN_CHANGE_CODE_VARIANTS,
} from '../../data/coin-change-code';
import {
  CONNECTED_COMPONENTS_CODE,
  CONNECTED_COMPONENTS_CODE_HIGHLIGHT_MAP,
  CONNECTED_COMPONENTS_CODE_REGIONS,
  CONNECTED_COMPONENTS_CODE_VARIANTS,
} from '../../data/connected-components-code';
import {
  COUNTING_SORT_CODE,
  COUNTING_SORT_CODE_HIGHLIGHT_MAP,
  COUNTING_SORT_CODE_REGIONS,
  COUNTING_SORT_CODE_VARIANTS,
} from '../../data/counting-sort-code';
import {
  CYCLE_DETECTION_CODE,
  CYCLE_DETECTION_CODE_HIGHLIGHT_MAP,
  CYCLE_DETECTION_CODE_REGIONS,
  CYCLE_DETECTION_CODE_VARIANTS,
} from '../../data/cycle-detection-code';
import {
  DFS_CODE,
  DFS_CODE_HIGHLIGHT_MAP,
  DFS_CODE_REGIONS,
  DFS_CODE_VARIANTS,
} from '../../data/dfs-code';
import {
  DIJKSTRA_CODE,
  DIJKSTRA_CODE_HIGHLIGHT_MAP,
  DIJKSTRA_CODE_REGIONS,
  DIJKSTRA_CODE_VARIANTS,
} from '../../data/dijkstra-code';
import { DINIC_MAX_FLOW_CODE, DINIC_MAX_FLOW_CODE_VARIANTS } from '../../data/dinic-max-flow-code';
import {
  DOMINATOR_TREE_CODE,
  DOMINATOR_TREE_CODE_HIGHLIGHT_MAP,
  DOMINATOR_TREE_CODE_REGIONS,
  DOMINATOR_TREE_CODE_VARIANTS,
} from '../../data/dominator-tree-code';
import {
  DP_CONVEX_HULL_TRICK_CODE,
  DP_CONVEX_HULL_TRICK_CODE_HIGHLIGHT_MAP,
  DP_CONVEX_HULL_TRICK_CODE_REGIONS,
  DP_CONVEX_HULL_TRICK_CODE_VARIANTS,
} from '../../data/dp-convex-hull-trick-code';
import {
  DP_ON_TREES_CODE,
  DP_ON_TREES_CODE_HIGHLIGHT_MAP,
  DP_ON_TREES_CODE_REGIONS,
  DP_ON_TREES_CODE_VARIANTS,
} from '../../data/dp-on-trees-code';
import {
  DP_WITH_BITMASK_CODE,
  DP_WITH_BITMASK_CODE_HIGHLIGHT_MAP,
  DP_WITH_BITMASK_CODE_REGIONS,
  DP_WITH_BITMASK_CODE_VARIANTS,
} from '../../data/dp-with-bitmask-code';
import {
  DIVIDE_CONQUER_DP_OPTIMIZATION_CODE,
  DIVIDE_CONQUER_DP_OPTIMIZATION_CODE_HIGHLIGHT_MAP,
  DIVIDE_CONQUER_DP_OPTIMIZATION_CODE_REGIONS,
  DIVIDE_CONQUER_DP_OPTIMIZATION_CODE_VARIANTS,
} from '../../data/divide-conquer-dp-optimization-code';
import { EDMONDS_KARP_CODE, EDMONDS_KARP_CODE_VARIANTS } from '../../data/edmonds-karp-code';
import {
  EDIT_DISTANCE_CODE,
  EDIT_DISTANCE_CODE_HIGHLIGHT_MAP,
  EDIT_DISTANCE_CODE_REGIONS,
  EDIT_DISTANCE_CODE_VARIANTS,
} from '../../data/edit-distance-code';
import {
  EULER_PATH_CIRCUIT_CODE,
  EULER_PATH_CIRCUIT_CODE_HIGHLIGHT_MAP,
  EULER_PATH_CIRCUIT_CODE_REGIONS,
  EULER_PATH_CIRCUIT_CODE_VARIANTS,
} from '../../data/euler-path-circuit-code';
import {
  FIBONACCI_DP_CODE,
  FIBONACCI_DP_CODE_HIGHLIGHT_MAP,
  FIBONACCI_DP_CODE_REGIONS,
  FIBONACCI_DP_CODE_VARIANTS,
} from '../../data/fibonacci-dp-code';
import { FLOYD_WARSHALL_CODE, FLOYD_WARSHALL_CODE_VARIANTS } from '../../data/floyd-warshall-code';
import { FLOOD_FILL_CODE, FLOOD_FILL_CODE_VARIANTS } from '../../data/flood-fill-code';
import {
  HALF_PLANE_INTERSECTION_CODE,
  HALF_PLANE_INTERSECTION_CODE_HIGHLIGHT_MAP,
  HALF_PLANE_INTERSECTION_CODE_REGIONS,
  HALF_PLANE_INTERSECTION_CODE_VARIANTS,
} from '../../data/half-plane-intersection-code';
import {
  HEAP_SORT_CODE,
  HEAP_SORT_CODE_HIGHLIGHT_MAP,
  HEAP_SORT_CODE_REGIONS,
  HEAP_SORT_CODE_VARIANTS,
} from '../../data/heap-sort-code';
import {
  INSERTION_SORT_CODE,
  INSERTION_SORT_CODE_HIGHLIGHT_MAP,
  INSERTION_SORT_CODE_REGIONS,
  INSERTION_SORT_CODE_VARIANTS,
} from '../../data/insertion-sort-code';
import {
  KNAPSACK_01_CODE,
  KNAPSACK_01_CODE_HIGHLIGHT_MAP,
  KNAPSACK_01_CODE_REGIONS,
  KNAPSACK_01_CODE_VARIANTS,
} from '../../data/knapsack-01-code';
import {
  KNUTH_DP_OPTIMIZATION_CODE,
  KNUTH_DP_OPTIMIZATION_CODE_HIGHLIGHT_MAP,
  KNUTH_DP_OPTIMIZATION_CODE_REGIONS,
  KNUTH_DP_OPTIMIZATION_CODE_VARIANTS,
} from '../../data/knuth-dp-optimization-code';
import { KRUSKALS_MST_CODE, KRUSKALS_MST_CODE_VARIANTS } from '../../data/kruskals-mst-code';
import {
  LINEAR_SEARCH_CODE,
  LINEAR_SEARCH_CODE_HIGHLIGHT_MAP,
  LINEAR_SEARCH_CODE_REGIONS,
  LINEAR_SEARCH_CODE_VARIANTS,
} from '../../data/linear-search-code';
import {
  LINE_INTERSECTION_CODE,
  LINE_INTERSECTION_CODE_HIGHLIGHT_MAP,
  LINE_INTERSECTION_CODE_REGIONS,
  LINE_INTERSECTION_CODE_VARIANTS,
} from '../../data/line-intersection-code';
import {
  LONGEST_COMMON_SUBSEQUENCE_CODE,
  LONGEST_COMMON_SUBSEQUENCE_CODE_HIGHLIGHT_MAP,
  LONGEST_COMMON_SUBSEQUENCE_CODE_REGIONS,
  LONGEST_COMMON_SUBSEQUENCE_CODE_VARIANTS,
} from '../../data/longest-common-subsequence-code';
import {
  LONGEST_INCREASING_SUBSEQUENCE_CODE,
  LONGEST_INCREASING_SUBSEQUENCE_CODE_HIGHLIGHT_MAP,
  LONGEST_INCREASING_SUBSEQUENCE_CODE_REGIONS,
  LONGEST_INCREASING_SUBSEQUENCE_CODE_VARIANTS,
} from '../../data/longest-increasing-subsequence-code';
import {
  LONGEST_PALINDROMIC_SUBSEQUENCE_CODE,
  LONGEST_PALINDROMIC_SUBSEQUENCE_CODE_HIGHLIGHT_MAP,
  LONGEST_PALINDROMIC_SUBSEQUENCE_CODE_REGIONS,
  LONGEST_PALINDROMIC_SUBSEQUENCE_CODE_VARIANTS,
} from '../../data/longest-palindromic-subsequence-code';
import {
  MANACHER_CODE,
  MANACHER_CODE_HIGHLIGHT_MAP,
  MANACHER_CODE_REGIONS,
  MANACHER_CODE_VARIANTS,
} from '../../data/manacher-code';
import {
  MATRIX_CHAIN_MULTIPLICATION_CODE,
  MATRIX_CHAIN_MULTIPLICATION_CODE_HIGHLIGHT_MAP,
  MATRIX_CHAIN_MULTIPLICATION_CODE_REGIONS,
  MATRIX_CHAIN_MULTIPLICATION_CODE_VARIANTS,
} from '../../data/matrix-chain-multiplication-code';
import {
  MERGE_SORT_CODE,
  MERGE_SORT_CODE_HIGHLIGHT_MAP,
  MERGE_SORT_CODE_REGIONS,
  MERGE_SORT_CODE_VARIANTS,
} from '../../data/merge-sort-code';
import {
  MIN_COST_MAX_FLOW_CODE,
  MIN_COST_MAX_FLOW_CODE_VARIANTS,
} from '../../data/min-cost-max-flow-code';
import {
  MINKOWSKI_SUM_CODE,
  MINKOWSKI_SUM_CODE_HIGHLIGHT_MAP,
  MINKOWSKI_SUM_CODE_REGIONS,
  MINKOWSKI_SUM_CODE_VARIANTS,
} from '../../data/minkowski-sum-code';
import {
  KMP_PATTERN_MATCHING_CODE,
  KMP_PATTERN_MATCHING_CODE_HIGHLIGHT_MAP,
  KMP_PATTERN_MATCHING_CODE_REGIONS,
  KMP_PATTERN_MATCHING_CODE_VARIANTS,
} from '../../data/kmp-pattern-matching-code';
import {
  PROFILE_DP_CODE,
  PROFILE_DP_CODE_HIGHLIGHT_MAP,
  PROFILE_DP_CODE_REGIONS,
  PROFILE_DP_CODE_VARIANTS,
} from '../../data/profile-dp-code';
import {
  PRIMS_MST_CODE,
  PRIMS_MST_CODE_HIGHLIGHT_MAP,
  PRIMS_MST_CODE_REGIONS,
  PRIMS_MST_CODE_VARIANTS,
} from '../../data/prims-mst-code';
import {
  QUICK_SORT_CODE,
  QUICK_SORT_CODE_HIGHLIGHT_MAP,
  QUICK_SORT_CODE_REGIONS,
  QUICK_SORT_CODE_VARIANTS,
} from '../../data/quick-sort-code';
import {
  RADIX_SORT_CODE,
  RADIX_SORT_CODE_HIGHLIGHT_MAP,
  RADIX_SORT_CODE_REGIONS,
  RADIX_SORT_CODE_VARIANTS,
} from '../../data/radix-sort-code';
import {
  RABIN_KARP_CODE,
  RABIN_KARP_CODE_HIGHLIGHT_MAP,
  RABIN_KARP_CODE_REGIONS,
  RABIN_KARP_CODE_VARIANTS,
} from '../../data/rabin-karp-code';
import {
  REGEX_MATCHING_DP_CODE,
  REGEX_MATCHING_DP_CODE_HIGHLIGHT_MAP,
  REGEX_MATCHING_DP_CODE_REGIONS,
  REGEX_MATCHING_DP_CODE_VARIANTS,
} from '../../data/regex-matching-dp-code';
import {
  SELECTION_SORT_CODE,
  SELECTION_SORT_CODE_HIGHLIGHT_MAP,
  SELECTION_SORT_CODE_REGIONS,
  SELECTION_SORT_CODE_VARIANTS,
} from '../../data/selection-sort-code';
import {
  SHELL_SORT_CODE,
  SHELL_SORT_CODE_HIGHLIGHT_MAP,
  SHELL_SORT_CODE_REGIONS,
  SHELL_SORT_CODE_VARIANTS,
} from '../../data/shell-sort-code';
import {
  SOS_DP_CODE,
  SOS_DP_CODE_HIGHLIGHT_MAP,
  SOS_DP_CODE_REGIONS,
  SOS_DP_CODE_VARIANTS,
} from '../../data/sos-dp-code';
import {
  SUBSET_SUM_CODE,
  SUBSET_SUM_CODE_HIGHLIGHT_MAP,
  SUBSET_SUM_CODE_REGIONS,
  SUBSET_SUM_CODE_VARIANTS,
} from '../../data/subset-sum-code';
import {
  STEINER_TREE_CODE,
  STEINER_TREE_CODE_HIGHLIGHT_MAP,
  STEINER_TREE_CODE_REGIONS,
  STEINER_TREE_CODE_VARIANTS,
} from '../../data/steiner-tree-code';
import {
  SWEEP_LINE_CODE,
  SWEEP_LINE_CODE_HIGHLIGHT_MAP,
  SWEEP_LINE_CODE_REGIONS,
  SWEEP_LINE_CODE_VARIANTS,
} from '../../data/sweep-line-code';
import {
  TARJAN_SCC_CODE,
  TARJAN_SCC_CODE_HIGHLIGHT_MAP,
  TARJAN_SCC_CODE_REGIONS,
  TARJAN_SCC_CODE_VARIANTS,
} from '../../data/tarjan-scc-code';
import {
  TIM_SORT_CODE,
  TIM_SORT_CODE_HIGHLIGHT_MAP,
  TIM_SORT_CODE_REGIONS,
  TIM_SORT_CODE_VARIANTS,
} from '../../data/tim-sort-code';
import {
  TOPOLOGICAL_SORT_KAHN_CODE,
  TOPOLOGICAL_SORT_KAHN_CODE_HIGHLIGHT_MAP,
  TOPOLOGICAL_SORT_KAHN_CODE_REGIONS,
  TOPOLOGICAL_SORT_KAHN_CODE_VARIANTS,
} from '../../data/topological-sort-kahn-code';
import {
  TRAVELING_SALESMAN_DP_CODE,
  TRAVELING_SALESMAN_DP_CODE_HIGHLIGHT_MAP,
  TRAVELING_SALESMAN_DP_CODE_REGIONS,
  TRAVELING_SALESMAN_DP_CODE_VARIANTS,
} from '../../data/traveling-salesman-dp-code';
import { UNION_FIND_CODE, UNION_FIND_CODE_VARIANTS } from '../../data/union-find-code';
import {
  VORONOI_DIAGRAM_CODE,
  VORONOI_DIAGRAM_CODE_HIGHLIGHT_MAP,
  VORONOI_DIAGRAM_CODE_REGIONS,
  VORONOI_DIAGRAM_CODE_VARIANTS,
} from '../../data/voronoi-diagram-code';
import {
  WILDCARD_MATCHING_CODE,
  WILDCARD_MATCHING_CODE_HIGHLIGHT_MAP,
  WILDCARD_MATCHING_CODE_REGIONS,
  WILDCARD_MATCHING_CODE_VARIANTS,
} from '../../data/wildcard-matching-code';
import {
  Z_ALGORITHM_CODE,
  Z_ALGORITHM_CODE_HIGHLIGHT_MAP,
  Z_ALGORITHM_CODE_REGIONS,
  Z_ALGORITHM_CODE_VARIANTS,
} from '../../data/z-algorithm-code';
import {
  BURROWS_WHEELER_TRANSFORM_CODE,
  BURROWS_WHEELER_TRANSFORM_CODE_HIGHLIGHT_MAP,
  BURROWS_WHEELER_TRANSFORM_CODE_REGIONS,
  BURROWS_WHEELER_TRANSFORM_CODE_VARIANTS,
} from '../../data/burrows-wheeler-transform-code';
import { DpPresetOption, DpTraceState } from '../../models/dp';
import { DsuTraceState } from '../../models/dsu';
import { GeometryStepState } from '../../models/geometry';
import { GraphStepState, WeightedGraphData } from '../../models/graph';
import { GridTraceState } from '../../models/grid';
import { MatrixTraceState } from '../../models/matrix';
import { NetworkTraceState } from '../../models/network';
import { SearchTraceState } from '../../models/search';
import { StringPresetOption, StringTraceState } from '../../models/string';
import { TreePresetOption } from '../../models/tree';
import { AlgorithmItem } from '../../models/algorithm';
import { CodeLine, CodeRegion, CodeVariantMap, LegendItem, LogEntry } from '../../models/detail';
import { HOPCROFT_KARP_CODE, HOPCROFT_KARP_CODE_VARIANTS } from '../../data/hopcroft-karp-code';
import {
  HUFFMAN_CODE,
  HUFFMAN_CODE_HIGHLIGHT_MAP,
  HUFFMAN_CODE_REGIONS,
  HUFFMAN_CODE_VARIANTS,
} from '../../data/huffman-coding-code';
import {
  TREE_TRAVERSALS_CODE,
  TREE_TRAVERSALS_CODE_HIGHLIGHT_MAP,
  TREE_TRAVERSALS_CODE_REGIONS,
  TREE_TRAVERSALS_CODE_VARIANTS,
} from '../../data/tree-traversals-code';
import {
  CONVEX_HULL_CODE,
  CONVEX_HULL_CODE_HIGHLIGHT_MAP,
  CONVEX_HULL_CODE_REGIONS,
  CONVEX_HULL_CODE_VARIANTS,
} from '../../data/convex-hull-code';
import {
  KOSARAJU_SCC_CODE,
  KOSARAJU_SCC_CODE_HIGHLIGHT_MAP,
  KOSARAJU_SCC_CODE_REGIONS,
  KOSARAJU_SCC_CODE_VARIANTS,
} from '../../data/kosaraju-scc-code';
import {
  DELAUNAY_TRIANGULATION_CODE,
  DELAUNAY_TRIANGULATION_CODE_HIGHLIGHT_MAP,
  DELAUNAY_TRIANGULATION_CODE_REGIONS,
  DELAUNAY_TRIANGULATION_CODE_VARIANTS,
} from '../../data/delaunay-triangulation-code';
import {
  RLE_CODE,
  RLE_CODE_HIGHLIGHT_MAP,
  RLE_CODE_REGIONS,
  RLE_CODE_VARIANTS,
} from '../../data/run-length-encoding-code';
import { SortStep } from '../../models/sort-step';
import { VisualizationOption } from '../../models/visualization-option';
import { VisualizationVariant } from '../../models/visualization-renderer';
import { VIZ_COLOR } from '../../utils/visualization-palette/visualization-palette';
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
} from '../../utils/dp-scenarios/dp-scenarios';
import {
  createKruskalScenario,
  createUnionFindScenario,
  KruskalScenario,
  UnionFindScenario,
} from '../../utils/dsu-scenarios/dsu-scenarios';
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
} from '../../utils/dijkstra-graph/dijkstra-graph';
import {
  AStarScenario,
  createAStarScenario,
  createFloodFillScenario,
  FloodFillScenario,
} from '../../utils/grid-scenarios/grid-scenarios';
import {
  HUNGARIAN_ALGORITHM_CODE,
  HUNGARIAN_ALGORITHM_CODE_VARIANTS,
} from '../../data/hungarian-algorithm-code';
import {
  createFloydWarshallScenario,
  createHungarianScenario,
  FloydWarshallScenario,
  HungarianScenario,
} from '../../utils/matrix-scenarios/matrix-scenarios';
import {
  createEdmondsKarpScenario,
  createDinicScenario,
  createHopcroftKarpScenario,
  createMinCostMaxFlowScenario,
  DinicScenario,
  HopcroftKarpScenario,
  MinCostMaxFlowScenario,
} from '../../utils/network-scenarios/network-scenarios';
import {
  BWT_PRESETS,
  HUFFMAN_PRESETS,
  KMP_PRESETS,
  MANACHER_PRESETS,
  RABIN_KARP_PRESETS,
  RLE_PRESETS,
  Z_ALGORITHM_PRESETS,
  BurrowsWheelerScenario,
  HuffmanScenario,
  KmpScenario,
  ManacherScenario,
  RabinKarpScenario,
  RleScenario,
  ZAlgorithmScenario,
  createBurrowsWheelerScenario,
  createHuffmanScenario,
  createKmpScenario,
  createManacherScenario,
  createRabinKarpScenario,
  createRleScenario,
  createZAlgorithmScenario,
} from '../../utils/string-scenarios/string-scenarios';
import {
  DEFAULT_TREE_TRAVERSALS_PRESET_ID,
  TREE_TRAVERSALS_PRESETS,
  TreeTraversalScenario,
  createTreeTraversalScenario,
} from '../../utils/tree-scenarios/tree-scenarios';
import { treeTraversalsGenerator } from '../../algorithms/tree-traversals/tree-traversals';

const BAR_LEGEND: readonly LegendItem[] = [
  { label: 'Unsorted', color: 'var(--viz-state-default)', opacity: 0.55 },
  { label: 'Comparing', color: 'var(--viz-state-compare)' },
  { label: 'Swapping', color: 'var(--viz-state-swap)' },
  { label: 'Sorted', color: 'var(--viz-state-sorted)' },
];

const BLOCK_LEGEND: readonly LegendItem[] = [
  { label: 'Unsorted', color: 'var(--viz-state-default)', opacity: 0.55 },
  { label: 'Comparing', color: 'var(--viz-state-compare)' },
  { label: 'Swapping', color: 'var(--viz-state-swap)' },
  { label: 'Sorted', color: 'var(--viz-state-sorted)' },
  { label: 'Boundary', color: 'var(--viz-state-sorted)' },
];

const VIZ_ACCENT = VIZ_COLOR.accent;
const VIZ_WINDOW = VIZ_COLOR.window;
const VIZ_WARNING = VIZ_COLOR.warning;
const VIZ_SUCCESS = VIZ_COLOR.success;
const VIZ_ROUTE = VIZ_COLOR.route;
const VIZ_DANGER = VIZ_COLOR.danger;
const VIZ_HIT = VIZ_COLOR.hit;
const VIZ_EMBER = VIZ_COLOR.ember;

const RADIX_LEGEND: readonly LegendItem[] = [
  { label: 'Input stream', color: VIZ_WINDOW, opacity: 0.55 },
  { label: 'Active digit', color: VIZ_ACCENT },
  { label: 'Bucket lane', color: VIZ_EMBER },
  { label: 'Gathered output', color: VIZ_SUCCESS },
];

const DIJKSTRA_LEGEND: readonly LegendItem[] = [
  { label: 'Source', color: VIZ_ACCENT },
  { label: 'Frontier queue', color: VIZ_WINDOW },
  { label: 'Current node', color: VIZ_WARNING },
  { label: 'Shortest-path tree', color: VIZ_SUCCESS },
  { label: 'Focused route', color: VIZ_HIT },
  { label: 'Active edge relaxation', color: VIZ_ROUTE },
];

const BFS_LEGEND: readonly LegendItem[] = [
  { label: 'Source', color: VIZ_ACCENT },
  { label: 'Queue frontier', color: VIZ_WINDOW },
  { label: 'Current node', color: VIZ_WARNING },
  { label: 'BFS tree', color: VIZ_SUCCESS },
  { label: 'Focused route', color: VIZ_HIT },
  { label: 'Inspected edge', color: VIZ_ROUTE },
];

const DFS_LEGEND: readonly LegendItem[] = [
  { label: 'Source', color: VIZ_ACCENT },
  { label: 'Stack frontier', color: VIZ_WINDOW },
  { label: 'Current node', color: VIZ_WARNING },
  { label: 'DFS tree', color: VIZ_SUCCESS },
  { label: 'Focused branch', color: VIZ_HIT },
  { label: 'Inspected edge', color: VIZ_ROUTE },
];

const TOPOLOGICAL_SORT_KAHN_LEGEND: readonly LegendItem[] = [
  { label: 'Seed node', color: VIZ_ACCENT },
  { label: 'Zero in-degree queue', color: VIZ_WINDOW },
  { label: 'Current node', color: VIZ_WARNING },
  { label: 'Ordered node', color: VIZ_SUCCESS },
  { label: 'Directed dependency', color: VIZ_ROUTE },
];

const CYCLE_DETECTION_LEGEND: readonly LegendItem[] = [
  { label: 'Entry node', color: VIZ_ACCENT },
  { label: 'Recursion stack', color: VIZ_WINDOW },
  { label: 'Current node', color: VIZ_WARNING },
  { label: 'Closed node', color: VIZ_SUCCESS },
  { label: 'Cycle edge', color: VIZ_ROUTE },
];

const CONNECTED_COMPONENTS_LEGEND: readonly LegendItem[] = [
  { label: 'Current seed / node', color: VIZ_WARNING },
  { label: 'Component frontier', color: VIZ_WINDOW },
  { label: 'Assigned node', color: VIZ_SUCCESS },
  { label: 'Component tree edge', color: VIZ_ROUTE },
];

const BIPARTITE_CHECK_LEGEND: readonly LegendItem[] = [
  { label: 'Side 0', color: VIZ_ACCENT },
  { label: 'Side 1', color: VIZ_EMBER },
  { label: 'Queue frontier', color: VIZ_WINDOW },
  { label: 'Conflict edge / node', color: VIZ_DANGER },
];

const BELLMAN_FORD_LEGEND: readonly LegendItem[] = [
  { label: 'Source', color: VIZ_ACCENT },
  { label: 'Updated this pass', color: VIZ_WINDOW },
  { label: 'Current relaxation', color: VIZ_WARNING },
  { label: 'Shortest-path tree', color: VIZ_SUCCESS },
  { label: 'Focused route', color: VIZ_HIT },
  { label: 'Negative-cycle evidence', color: VIZ_DANGER },
];

const PRIMS_MST_LEGEND: readonly LegendItem[] = [
  { label: 'Start node', color: VIZ_ACCENT },
  { label: 'Candidate frontier', color: VIZ_WINDOW },
  { label: 'Current node', color: VIZ_WARNING },
  { label: 'MST edge', color: VIZ_SUCCESS },
  { label: 'Active edge check', color: VIZ_ROUTE },
];

const BRIDGES_ARTICULATION_LEGEND: readonly LegendItem[] = [
  { label: 'DFS stack', color: VIZ_WINDOW },
  { label: 'Current node', color: VIZ_WARNING },
  { label: 'Closed node', color: VIZ_SUCCESS },
  { label: 'Articulation point', color: VIZ_DANGER },
  { label: 'Bridge edge', color: VIZ_DANGER },
];

const TARJAN_SCC_LEGEND: readonly LegendItem[] = [
  { label: 'Seed / current node', color: VIZ_WARNING },
  { label: 'Tarjan stack', color: VIZ_WINDOW },
  { label: 'Current inspect edge', color: VIZ_ROUTE },
  { label: 'Finished SCC color', color: VIZ_ACCENT },
  { label: 'Back-edge low-link update', color: VIZ_SUCCESS },
];

const KOSARAJU_SCC_LEGEND: readonly LegendItem[] = [
  { label: 'Seed / current node', color: VIZ_WARNING },
  { label: 'Pass 1 finish stack', color: VIZ_WINDOW },
  { label: 'Pass 2 reversed edge', color: VIZ_ROUTE },
  { label: 'Finished SCC color', color: VIZ_ACCENT },
  { label: 'Assigned component', color: VIZ_SUCCESS },
];

const EULER_LEGEND: readonly LegendItem[] = [
  { label: 'Unused edge', color: 'rgba(255,255,255,0.22)' },
  { label: 'Current traversal edge', color: VIZ_WINDOW },
  { label: 'Committed trail edge', color: VIZ_SUCCESS },
  { label: 'Odd start / end node', color: VIZ_ACCENT },
  { label: 'Sealed trail node', color: VIZ_HIT },
];

const CHROMATIC_NUMBER_LEGEND: readonly LegendItem[] = [
  { label: 'Color class 1', color: 'rgba(56, 189, 248, 0.72)' },
  { label: 'Color class 2', color: 'rgba(139, 92, 246, 0.72)' },
  { label: 'Color class 3', color: 'rgba(52, 211, 153, 0.72)' },
  { label: 'Color class 4', color: 'rgba(245, 158, 11, 0.76)' },
  { label: 'Conflict edge', color: VIZ_DANGER },
];

const DOMINATOR_TREE_LEGEND: readonly LegendItem[] = [
  { label: 'Entry block', color: VIZ_ACCENT },
  { label: 'Current predecessor inspect', color: VIZ_WARNING },
  { label: 'Stable dominator set', color: VIZ_WINDOW },
  { label: 'Immediate dominator tree edge', color: VIZ_SUCCESS },
  { label: 'Current worklist block', color: VIZ_ROUTE },
];

const STEINER_TREE_LEGEND: readonly LegendItem[] = [
  { label: 'Terminal node', color: 'rgba(56, 189, 248, 0.72)' },
  { label: 'Steiner connector', color: 'rgba(52, 211, 153, 0.74)' },
  { label: 'Weighted graph edge', color: 'rgba(255,255,255,0.22)' },
  { label: 'Exact selected tree edge', color: VIZ_SUCCESS },
  { label: 'Active subset root', color: VIZ_WARNING },
];

const SEARCH_LEGEND: readonly LegendItem[] = [
  { label: 'Candidate window', color: VIZ_WINDOW },
  { label: 'Probe', color: VIZ_WARNING },
  { label: 'Visited', color: VIZ_ACCENT },
  { label: 'Eliminated', color: 'var(--text-secondary)', opacity: 0.55 },
  { label: 'Found', color: VIZ_SUCCESS },
];

const STRING_LEGEND: readonly LegendItem[] = [
  { label: 'Source symbols', color: 'rgba(255,255,255,0.42)' },
  { label: 'Current compare / center', color: VIZ_WARNING },
  { label: 'Reusable shortcut', color: VIZ_ACCENT },
  { label: 'Active window / box', color: VIZ_WINDOW },
  { label: 'Confirmed hit / best output', color: VIZ_SUCCESS },
];

const FLOOD_FILL_LEGEND: readonly LegendItem[] = [
  { label: 'Seed cell', color: VIZ_ACCENT },
  { label: 'Current wave cell', color: VIZ_WARNING },
  { label: 'Fill frontier', color: VIZ_WINDOW },
  { label: 'Painted region', color: VIZ_SUCCESS },
  { label: 'Rejected cell', color: 'var(--text-secondary)', opacity: 0.55 },
];

const A_STAR_LEGEND: readonly LegendItem[] = [
  { label: 'Start', color: VIZ_ACCENT },
  { label: 'Goal', color: VIZ_EMBER },
  { label: 'Open set', color: VIZ_WINDOW },
  { label: 'Current cell', color: VIZ_WARNING },
  { label: 'Closed set', color: VIZ_ROUTE },
  { label: 'Final path', color: VIZ_SUCCESS },
];

const HOPCROFT_KARP_LEGEND: readonly LegendItem[] = [
  { label: 'Left partition', color: VIZ_ACCENT },
  { label: 'Right partition', color: VIZ_EMBER },
  { label: 'BFS frontier', color: VIZ_WINDOW },
  { label: 'Matching edge', color: VIZ_SUCCESS },
  { label: 'Augmenting path', color: VIZ_ROUTE },
  { label: 'Current inspect edge', color: VIZ_WARNING },
];

const DINIC_LEGEND: readonly LegendItem[] = [
  { label: 'Source', color: VIZ_ACCENT },
  { label: 'Sink', color: VIZ_EMBER },
  { label: 'Admissible level edge', color: VIZ_WINDOW },
  { label: 'Positive flow', color: VIZ_SUCCESS },
  { label: 'Current augment path', color: VIZ_ROUTE },
  { label: 'Saturated edge', color: 'var(--text-secondary)', opacity: 0.6 },
];

const EDMONDS_KARP_LEGEND: readonly LegendItem[] = [
  { label: 'Residual candidate edge', color: 'rgba(255,255,255,0.2)' },
  { label: 'BFS frontier', color: VIZ_WINDOW },
  { label: 'Current inspect edge', color: VIZ_WARNING },
  { label: 'Augmenting path', color: VIZ_ROUTE },
  { label: 'Positive flow / saturated edge', color: VIZ_SUCCESS },
];

const MIN_COST_MAX_FLOW_LEGEND: readonly LegendItem[] = [
  { label: 'Residual candidate edge', color: 'rgba(255,255,255,0.2)' },
  { label: 'Cheapest frontier', color: VIZ_WINDOW },
  { label: 'Current cost relax edge', color: VIZ_WARNING },
  { label: 'Cheapest augmenting route', color: VIZ_ROUTE },
  { label: 'Committed flow with price', color: VIZ_SUCCESS },
];

const FLOYD_WARSHALL_LEGEND: readonly LegendItem[] = [
  { label: 'Pivot row / column', color: VIZ_ACCENT },
  { label: 'Active compare cell', color: VIZ_WARNING },
  { label: 'Improved shortest path', color: VIZ_SUCCESS },
  { label: 'Reachable baseline', color: VIZ_WINDOW },
  { label: 'Infinity / unreachable', color: 'var(--text-secondary)', opacity: 0.6 },
];

const HUNGARIAN_LEGEND: readonly LegendItem[] = [
  { label: 'Active reduction / inspect cell', color: VIZ_WARNING },
  { label: 'Zero candidate', color: VIZ_WINDOW },
  { label: 'Covered line set', color: VIZ_ACCENT },
  { label: 'Chosen assignment', color: VIZ_SUCCESS },
  { label: 'Adjusted by matrix shift', color: VIZ_ROUTE },
];

const KNAPSACK_LEGEND: readonly LegendItem[] = [
  { label: 'Base case', color: 'rgba(255,255,255,0.34)' },
  { label: 'Active DP cell', color: VIZ_WARNING },
  { label: 'Candidate predecessor', color: VIZ_WINDOW },
  { label: 'Committed best value', color: VIZ_SUCCESS },
  { label: 'Backtrack path', color: VIZ_HIT },
];

const LCS_LEGEND: readonly LegendItem[] = [
  { label: 'Base border', color: 'rgba(255,255,255,0.34)' },
  { label: 'Active compare cell', color: VIZ_WARNING },
  { label: 'Character match', color: VIZ_ACCENT },
  { label: 'Chosen carry / best value', color: VIZ_SUCCESS },
  { label: 'Recovered subsequence path', color: VIZ_HIT },
];

const EDIT_DISTANCE_LEGEND: readonly LegendItem[] = [
  { label: 'Base border', color: 'rgba(255,255,255,0.34)' },
  { label: 'Active transition', color: VIZ_WARNING },
  { label: 'Free carry / char match', color: VIZ_ACCENT },
  { label: 'Stored cheapest edit count', color: VIZ_SUCCESS },
  { label: 'Recovered edit script', color: VIZ_HIT },
];

const MATRIX_CHAIN_LEGEND: readonly LegendItem[] = [
  { label: 'Diagonal base interval', color: 'rgba(255,255,255,0.34)' },
  { label: 'Active interval', color: VIZ_WARNING },
  { label: 'Candidate subproblem', color: VIZ_WINDOW },
  { label: 'Committed best split', color: VIZ_SUCCESS },
  { label: 'Optimal split trace', color: VIZ_HIT },
];

const COIN_CHANGE_LEGEND: readonly LegendItem[] = [
  { label: 'Base amount / reachable zero', color: 'rgba(255,255,255,0.34)' },
  { label: 'Active amount check', color: VIZ_WARNING },
  { label: 'Candidate predecessor', color: VIZ_WINDOW },
  { label: 'Committed min-coin answer', color: VIZ_SUCCESS },
  { label: 'Recovered coin path', color: VIZ_HIT },
];

const SUBSET_SUM_LEGEND: readonly LegendItem[] = [
  { label: 'Base case', color: 'rgba(255,255,255,0.34)' },
  { label: 'Active sum check', color: VIZ_WARNING },
  { label: 'Candidate predecessor', color: VIZ_WINDOW },
  { label: 'Reachable boolean state', color: VIZ_SUCCESS },
  { label: 'Recovered witness subset', color: VIZ_HIT },
];

const LPS_LEGEND: readonly LegendItem[] = [
  { label: 'Diagonal single-char base', color: 'rgba(255,255,255,0.34)' },
  { label: 'Active interval', color: VIZ_WARNING },
  { label: 'Mirrored character pair', color: VIZ_ACCENT },
  { label: 'Committed interval answer', color: VIZ_SUCCESS },
  { label: 'Recovered palindrome trace', color: VIZ_HIT },
];

const BURST_BALLOONS_LEGEND: readonly LegendItem[] = [
  { label: 'Active interval', color: VIZ_WARNING },
  { label: 'Candidate subinterval', color: VIZ_WINDOW },
  { label: 'Saved last-burst split', color: VIZ_ACCENT },
  { label: 'Committed max-coin score', color: VIZ_SUCCESS },
  { label: 'Recovered burst order', color: VIZ_HIT },
];

const WILDCARD_LEGEND: readonly LegendItem[] = [
  { label: 'Base border', color: 'rgba(255,255,255,0.34)' },
  { label: 'Active transition', color: VIZ_WARNING },
  { label: 'Direct char / ? match', color: VIZ_ACCENT },
  { label: 'Reachable wildcard state', color: VIZ_SUCCESS },
  { label: 'Recovered match route', color: VIZ_HIT },
];

const LIS_LEGEND: readonly LegendItem[] = [
  { label: 'Input strip / base value', color: 'rgba(255,255,255,0.34)' },
  { label: 'Active end index', color: VIZ_WARNING },
  { label: 'Candidate predecessor', color: VIZ_WINDOW },
  { label: 'Committed LIS length', color: VIZ_SUCCESS },
  { label: 'Recovered subsequence', color: VIZ_HIT },
];

const CLIMBING_STAIRS_LEGEND: readonly LegendItem[] = [
  { label: 'Base landing', color: 'rgba(255,255,255,0.34)' },
  { label: 'Active stair', color: VIZ_WARNING },
  { label: 'Previous two landings', color: VIZ_WINDOW },
  { label: 'Committed ways count', color: VIZ_SUCCESS },
];

const FIBONACCI_LEGEND: readonly LegendItem[] = [
  { label: 'Base term', color: 'rgba(255,255,255,0.34)' },
  { label: 'Active term', color: VIZ_WARNING },
  { label: 'Previous cache terms', color: VIZ_WINDOW },
  { label: 'Committed Fibonacci value', color: VIZ_SUCCESS },
];

const REGEX_LEGEND: readonly LegendItem[] = [
  { label: 'Base border', color: 'rgba(255,255,255,0.34)' },
  { label: 'Active regex state', color: VIZ_WARNING },
  { label: 'Dot / literal match', color: VIZ_ACCENT },
  { label: 'Reachable regex state', color: VIZ_SUCCESS },
  { label: 'Recovered derivation route', color: VIZ_HIT },
];

const TSP_LEGEND: readonly LegendItem[] = [
  { label: 'Start subset', color: 'rgba(255,255,255,0.34)' },
  { label: 'Active subset expansion', color: VIZ_WARNING },
  { label: 'Candidate predecessor state', color: VIZ_WINDOW },
  { label: 'Committed subset route', color: VIZ_SUCCESS },
  { label: 'Recovered optimal tour', color: VIZ_HIT },
];

const SOS_LEGEND: readonly LegendItem[] = [
  { label: 'Base subset row', color: 'rgba(255,255,255,0.34)' },
  { label: 'Active SOS state', color: VIZ_WARNING },
  { label: 'Candidate source states', color: VIZ_WINDOW },
  { label: 'Committed aggregated value', color: VIZ_SUCCESS },
  { label: 'Recovered contributing submasks', color: VIZ_HIT },
];

const PROFILE_LEGEND: readonly LegendItem[] = [
  { label: 'Empty frontier base', color: 'rgba(255,255,255,0.34)' },
  { label: 'Active profile state', color: VIZ_WARNING },
  { label: 'Candidate predecessor profile', color: VIZ_WINDOW },
  { label: 'Committed tiling count', color: VIZ_SUCCESS },
  { label: 'Recovered frontier route', color: VIZ_HIT },
];

const TREE_DP_LEGEND: readonly LegendItem[] = [
  { label: 'Node weight base', color: 'rgba(255,255,255,0.34)' },
  { label: 'Active parent node', color: VIZ_WARNING },
  { label: 'Child subtree being merged', color: VIZ_WINDOW },
  { label: 'Committed subtree DP', color: VIZ_SUCCESS },
  { label: 'Recovered independent set', color: VIZ_HIT },
];

const BITMASK_DP_LEGEND: readonly LegendItem[] = [
  { label: 'Empty-mask base', color: 'rgba(255,255,255,0.34)' },
  { label: 'Active subset state', color: VIZ_WARNING },
  { label: 'Candidate predecessor mask', color: VIZ_WINDOW },
  { label: 'Committed subset cost', color: VIZ_SUCCESS },
  { label: 'Recovered assignment path', color: VIZ_HIT },
];

const CHT_LEGEND: readonly LegendItem[] = [
  { label: 'Base point', color: 'rgba(255,255,255,0.34)' },
  { label: 'Active query point', color: VIZ_WARNING },
  { label: 'Candidate predecessor line', color: VIZ_WINDOW },
  { label: 'Committed query answer', color: VIZ_SUCCESS },
  { label: 'Recovered transition chain', color: VIZ_HIT },
];

const DIVIDE_CONQUER_LEGEND: readonly LegendItem[] = [
  { label: 'Base DP state', color: 'rgba(255,255,255,0.34)' },
  { label: 'Active midpoint cell', color: VIZ_WARNING },
  { label: 'Candidate split source', color: VIZ_WINDOW },
  { label: 'Committed midpoint answer', color: VIZ_SUCCESS },
  { label: 'Recovered partition cuts', color: VIZ_HIT },
];

const KNUTH_LEGEND: readonly LegendItem[] = [
  { label: 'Diagonal base interval', color: 'rgba(255,255,255,0.34)' },
  { label: 'Active interval', color: VIZ_WARNING },
  { label: 'Candidate subinterval', color: VIZ_WINDOW },
  { label: 'Committed split window answer', color: VIZ_SUCCESS },
  { label: 'Recovered merge tree', color: VIZ_HIT },
];

const UNION_FIND_LEGEND: readonly LegendItem[] = [
  { label: 'Root representative', color: VIZ_ACCENT },
  { label: 'Active / queried node', color: VIZ_WARNING },
  { label: 'Merged / compressed node', color: VIZ_SUCCESS },
  { label: 'Pending operation', color: VIZ_WINDOW },
  { label: 'Completed operation', color: VIZ_ROUTE },
];

const KRUSKAL_LEGEND: readonly LegendItem[] = [
  { label: 'Current edge check', color: VIZ_WARNING },
  { label: 'Accepted MST edge', color: VIZ_SUCCESS },
  { label: 'Rejected cycle edge', color: VIZ_DANGER },
  { label: 'Current DSU roots', color: VIZ_ACCENT },
  { label: 'Pending sorted edge', color: VIZ_WINDOW },
];

const CONVEX_HULL_LEGEND: readonly LegendItem[] = [
  { label: 'Pivot (base point)', color: VIZ_ACCENT },
  { label: 'Sorted (waiting)', color: '#94a3b8', opacity: 0.7 },
  { label: 'Checking (cross product)', color: VIZ_WARNING },
  { label: 'Stack (hull candidate)', color: VIZ_WINDOW },
  { label: 'Hull vertex (final)', color: VIZ_SUCCESS },
  { label: 'Rejected (interior point)', color: 'rgba(244,63,94,0.55)' },
];

const CLOSEST_PAIR_LEGEND: readonly LegendItem[] = [
  { label: 'Left recursive half', color: VIZ_ACCENT },
  { label: 'Right recursive half', color: VIZ_EMBER },
  { label: 'Strip corridor candidate', color: VIZ_ROUTE },
  { label: 'Current distance check', color: VIZ_WARNING },
  { label: 'Best pair so far', color: VIZ_HIT },
];

const LINE_INTERSECTION_LEGEND: readonly LegendItem[] = [
  { label: 'Pending segment', color: 'rgba(148,163,184,0.55)' },
  { label: 'Active sweep segment', color: VIZ_ROUTE },
  { label: 'Focused event segment', color: VIZ_WARNING },
  { label: 'Confirmed crossing point', color: VIZ_ACCENT },
  { label: 'Sweep line', color: VIZ_HIT },
];

const HALF_PLANE_LEGEND: readonly LegendItem[] = [
  { label: 'Current boundary line', color: VIZ_HIT },
  { label: 'Already applied constraint', color: VIZ_ROUTE },
  { label: 'Forbidden side', color: 'rgba(244,63,94,0.52)' },
  { label: 'Feasible polygon', color: VIZ_HIT },
  { label: 'Final intersection polygon', color: VIZ_ROUTE },
];

const MINKOWSKI_SUM_LEGEND: readonly LegendItem[] = [
  { label: 'Obstacle polygon A', color: 'rgba(244,63,94,0.6)' },
  { label: 'Robot polygon B', color: VIZ_ACCENT },
  { label: 'Reflected robot -B', color: VIZ_WINDOW },
  { label: 'Growing sum path', color: VIZ_HIT },
  { label: 'Final configuration obstacle', color: VIZ_ROUTE },
];

const SWEEP_LINE_LEGEND: readonly LegendItem[] = [
  { label: 'Pending rectangle', color: 'rgba(148,163,184,0.5)' },
  { label: 'Active rectangle at sweep x', color: VIZ_ROUTE },
  { label: 'Focused event rectangle', color: VIZ_WARNING },
  { label: 'Merged vertical coverage span', color: VIZ_HIT },
  { label: 'Sweep progress region', color: 'rgba(45,212,191,0.32)' },
];

const VORONOI_LEGEND: readonly LegendItem[] = [
  { label: 'Site points', color: 'rgba(255,255,255,0.92)' },
  { label: 'Active site event', color: VIZ_EMBER },
  { label: 'Settled Voronoi cell', color: 'rgba(186,230,253,0.5)' },
  { label: 'Current cell freeze', color: VIZ_EMBER },
  { label: 'Descending sweep line', color: VIZ_EMBER },
];

const DELAUNAY_LEGEND: readonly LegendItem[] = [
  { label: 'Committed triangle mesh', color: 'rgba(56,189,248,0.45)' },
  { label: 'Current candidate triangle', color: VIZ_WARNING },
  { label: 'Active circumcircle', color: VIZ_HIT },
  { label: 'Committed mesh edges', color: 'rgba(186,230,253,0.5)' },
  { label: 'Active triangle vertices', color: VIZ_HIT },
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

const TREE_TRAVERSALS_VARIANT_OPTIONS: readonly VisualizationOption[] = [
  { value: 'tree', label: 'Tree Walk' },
];

const GRID_VARIANT_OPTIONS: readonly VisualizationOption[] = [
  { value: 'grid', label: 'Grid Board' },
];

const MATRIX_VARIANT_OPTIONS: readonly VisualizationOption[] = [
  { value: 'matrix', label: 'Matrix Lab' },
];

const DP_VARIANT_OPTIONS: readonly VisualizationOption[] = [{ value: 'dp', label: 'DP Lab' }];

const UNION_FIND_VARIANT_OPTIONS: readonly VisualizationOption[] = [
  { value: 'dsu-graph', label: 'Tree Graph' },
  { value: 'dsu', label: 'Set Forest' },
];

const KRUSKAL_VARIANT_OPTIONS: readonly VisualizationOption[] = [
  { value: 'dsu-graph', label: 'Edge Graph' },
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

export const INSPECTOR_COLLAPSED_KEY = 'ohno:algorithm-detail:inspector-collapsed';
export const INSPECTOR_LAYOUT_KEY = 'ohno:algorithm-detail:inspector-layout';

export interface RandomRange {
  readonly min: number;
  readonly max: number;
}

interface BaseAlgorithmViewConfig {
  readonly codeLines: readonly CodeLine[];
  readonly codeRegions?: readonly CodeRegion[];
  readonly codeHighlightMap?: Readonly<Record<number, number>>;
  readonly codeVariants?: CodeVariantMap;
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

interface TreeAlgorithmViewConfig<TScenario = unknown> extends BaseAlgorithmViewConfig {
  readonly kind: 'tree';
  readonly presetOptions: readonly TreePresetOption[];
  readonly defaultPresetId: string;
  readonly createScenario: (size: number, presetId: string) => TScenario;
  readonly generator: (scenario: TScenario) => Generator<SortStep>;
}

export type AlgorithmViewConfig =
  | ArrayAlgorithmViewConfig
  | GraphAlgorithmViewConfig
  | SearchAlgorithmViewConfig
  | StringAlgorithmViewConfig<any>
  | GridAlgorithmViewConfig<any>
  | MatrixAlgorithmViewConfig<any>
  | DpAlgorithmViewConfig<any>
  | DsuAlgorithmViewConfig<any>
  | NetworkAlgorithmViewConfig<any>
  | GeometryAlgorithmViewConfig<any>
  | TreeAlgorithmViewConfig<any>;

const BUBBLE_VIEW_CONFIG: AlgorithmViewConfig = {
  kind: 'array',
  codeLines: BUBBLE_SORT_CODE,
  codeRegions: BUBBLE_SORT_CODE_REGIONS,
  codeHighlightMap: BUBBLE_SORT_CODE_HIGHLIGHT_MAP,
  codeVariants: BUBBLE_SORT_CODE_VARIANTS,
  variantOptions: BUBBLE_VARIANT_OPTIONS,
  defaultVariant: 'bar',
  sizeOptions: BUBBLE_SIZE_OPTIONS,
  defaultSize: 16,
  randomRange: { min: 1, max: 99 },
  generator: bubbleSortGenerator,
  legendItems: (variant) => {
    if (variant === 'block') return BLOCK_LEGEND;
    return BAR_LEGEND;
  },
  sizeUnit: 'elements',
  randomizeLabel: 'Randomize',
};

const RADIX_VIEW_CONFIG: AlgorithmViewConfig = {
  kind: 'array',
  codeLines: RADIX_SORT_CODE,
  codeRegions: RADIX_SORT_CODE_REGIONS,
  codeHighlightMap: RADIX_SORT_CODE_HIGHLIGHT_MAP,
  codeVariants: RADIX_SORT_CODE_VARIANTS,
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
  readonly codeRegions?: readonly CodeRegion[];
  readonly codeHighlightMap?: Readonly<Record<number, number>>;
  readonly codeVariants?: CodeVariantMap;
  readonly generator: (array: readonly number[]) => Generator<SortStep>;
  readonly randomRange: RandomRange;
  readonly sizeOptions?: readonly number[];
  readonly defaultSize?: number;
}): AlgorithmViewConfig {
  const sizeOptions = args.sizeOptions ?? BUBBLE_SIZE_OPTIONS;
  return {
    kind: 'array',
    codeLines: args.codeLines,
    codeRegions: args.codeRegions,
    codeHighlightMap: args.codeHighlightMap,
    codeVariants: args.codeVariants,
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
  codeRegions: SELECTION_SORT_CODE_REGIONS,
  codeHighlightMap: SELECTION_SORT_CODE_HIGHLIGHT_MAP,
  codeVariants: SELECTION_SORT_CODE_VARIANTS,
  generator: selectionSortGenerator,
  randomRange: { min: 1, max: 99 },
  defaultSize: 16,
});

const INSERTION_VIEW_CONFIG = createSortViewConfig({
  codeLines: INSERTION_SORT_CODE,
  codeRegions: INSERTION_SORT_CODE_REGIONS,
  codeHighlightMap: INSERTION_SORT_CODE_HIGHLIGHT_MAP,
  codeVariants: INSERTION_SORT_CODE_VARIANTS,
  generator: insertionSortGenerator,
  randomRange: { min: 1, max: 99 },
  defaultSize: 16,
});

const COUNTING_VIEW_CONFIG = createSortViewConfig({
  codeLines: COUNTING_SORT_CODE,
  codeRegions: COUNTING_SORT_CODE_REGIONS,
  codeHighlightMap: COUNTING_SORT_CODE_HIGHLIGHT_MAP,
  codeVariants: COUNTING_SORT_CODE_VARIANTS,
  generator: countingSortGenerator,
  randomRange: { min: 1, max: 24 },
  sizeOptions: COUNTING_SIZE_OPTIONS,
  defaultSize: 24,
});

const MERGE_VIEW_CONFIG = createSortViewConfig({
  codeLines: MERGE_SORT_CODE,
  codeRegions: MERGE_SORT_CODE_REGIONS,
  codeHighlightMap: MERGE_SORT_CODE_HIGHLIGHT_MAP,
  codeVariants: MERGE_SORT_CODE_VARIANTS,
  generator: mergeSortGenerator,
  randomRange: { min: 1, max: 99 },
  defaultSize: 16,
});

const QUICK_VIEW_CONFIG = createSortViewConfig({
  codeLines: QUICK_SORT_CODE,
  codeRegions: QUICK_SORT_CODE_REGIONS,
  codeHighlightMap: QUICK_SORT_CODE_HIGHLIGHT_MAP,
  codeVariants: QUICK_SORT_CODE_VARIANTS,
  generator: quickSortGenerator,
  randomRange: { min: 1, max: 99 },
  defaultSize: 16,
});

const HEAP_VIEW_CONFIG = createSortViewConfig({
  codeLines: HEAP_SORT_CODE,
  codeRegions: HEAP_SORT_CODE_REGIONS,
  codeHighlightMap: HEAP_SORT_CODE_HIGHLIGHT_MAP,
  codeVariants: HEAP_SORT_CODE_VARIANTS,
  generator: heapSortGenerator,
  randomRange: { min: 1, max: 99 },
  defaultSize: 16,
});

function createSearchViewConfig(args: {
  readonly codeLines: readonly CodeLine[];
  readonly codeRegions?: readonly CodeRegion[];
  readonly codeHighlightMap?: Readonly<Record<number, number>>;
  readonly codeVariants?: CodeVariantMap;
  readonly createScenario: (size: number) => SearchScenario;
  readonly generator: (scenario: SearchScenario) => Generator<SortStep>;
  readonly sizeOptions?: readonly number[];
  readonly defaultSize?: number;
}): AlgorithmViewConfig {
  const sizeOptions = args.sizeOptions ?? BUBBLE_SIZE_OPTIONS;
  return {
    kind: 'search',
    codeLines: args.codeLines,
    codeRegions: args.codeRegions,
    codeHighlightMap: args.codeHighlightMap,
    codeVariants: args.codeVariants,
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
  readonly codeVariants?: CodeVariantMap;
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
    codeVariants: args.codeVariants,
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
  readonly codeRegions?: readonly CodeRegion[];
  readonly codeHighlightMap?: Readonly<Record<number, number>>;
  readonly codeVariants?: CodeVariantMap;
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
    codeRegions: args.codeRegions,
    codeHighlightMap: args.codeHighlightMap,
    codeVariants: args.codeVariants,
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
  readonly codeVariants?: CodeVariantMap;
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
    codeVariants: args.codeVariants,
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
  readonly codeRegions?: readonly CodeRegion[];
  readonly codeHighlightMap?: Readonly<Record<number, number>>;
  readonly codeVariants?: CodeVariantMap;
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
    codeRegions: args.codeRegions,
    codeHighlightMap: args.codeHighlightMap,
    codeVariants: args.codeVariants,
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
  readonly codeVariants?: CodeVariantMap;
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
  // First variant in the list wins as default — lets callers put
  // their preferred default view at the top (e.g. `dsu-graph` for
  // Union-Find / Kruskal, which now default to the graph view).
  const defaultVariant = args.variantOptions[0]?.value ?? 'dsu';
  return {
    kind: 'dsu',
    codeLines: args.codeLines,
    codeVariants: args.codeVariants,
    variantOptions: args.variantOptions,
    defaultVariant,
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
  readonly codeVariants?: CodeVariantMap;
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
    codeVariants: args.codeVariants,
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
  codeRegions: BUCKET_SORT_CODE_REGIONS,
  codeHighlightMap: BUCKET_SORT_CODE_HIGHLIGHT_MAP,
  codeVariants: BUCKET_SORT_CODE_VARIANTS,
  generator: bucketSortGenerator,
  randomRange: { min: 1, max: 99 },
  defaultSize: 16,
});

const SHELL_VIEW_CONFIG = createSortViewConfig({
  codeLines: SHELL_SORT_CODE,
  codeRegions: SHELL_SORT_CODE_REGIONS,
  codeHighlightMap: SHELL_SORT_CODE_HIGHLIGHT_MAP,
  codeVariants: SHELL_SORT_CODE_VARIANTS,
  generator: shellSortGenerator,
  randomRange: { min: 1, max: 99 },
  defaultSize: 16,
});

const TIM_VIEW_CONFIG = createSortViewConfig({
  codeLines: TIM_SORT_CODE,
  codeRegions: TIM_SORT_CODE_REGIONS,
  codeHighlightMap: TIM_SORT_CODE_HIGHLIGHT_MAP,
  codeVariants: TIM_SORT_CODE_VARIANTS,
  generator: timSortGenerator,
  randomRange: { min: 1, max: 99 },
  defaultSize: 16,
});

const LINEAR_SEARCH_VIEW_CONFIG = createSearchViewConfig({
  codeLines: LINEAR_SEARCH_CODE,
  codeRegions: LINEAR_SEARCH_CODE_REGIONS,
  codeHighlightMap: LINEAR_SEARCH_CODE_HIGHLIGHT_MAP,
  codeVariants: LINEAR_SEARCH_CODE_VARIANTS,
  createScenario: (size) => createLinearSearchScenario(size),
  generator: linearSearchGenerator,
  sizeOptions: [12, 20, 28],
  defaultSize: 20,
});

const BINARY_SEARCH_VIEW_CONFIG = createSearchViewConfig({
  codeLines: BINARY_SEARCH_CODE,
  codeRegions: BINARY_SEARCH_CODE_REGIONS,
  codeHighlightMap: BINARY_SEARCH_CODE_HIGHLIGHT_MAP,
  codeVariants: BINARY_SEARCH_CODE_VARIANTS,
  createScenario: (size) => createBinarySearchScenario(size),
  generator: binarySearchGenerator,
  sizeOptions: [16, 24, 32],
  defaultSize: 24,
});

const BINARY_SEARCH_VARIANTS_VIEW_CONFIG = createSearchViewConfig({
  codeLines: BINARY_SEARCH_VARIANTS_CODE,
  codeRegions: BINARY_SEARCH_VARIANTS_CODE_REGIONS,
  codeHighlightMap: BINARY_SEARCH_VARIANTS_CODE_HIGHLIGHT_MAP,
  codeVariants: BINARY_SEARCH_VARIANTS_CODE_VARIANTS,
  createScenario: (size) => createBinarySearchVariantsScenario(size),
  generator: binarySearchVariantsGenerator,
  sizeOptions: [16, 24, 32],
  defaultSize: 24,
});

const KMP_VIEW_CONFIG = createStringViewConfig<KmpScenario>({
  codeLines: KMP_PATTERN_MATCHING_CODE,
  codeRegions: KMP_PATTERN_MATCHING_CODE_REGIONS,
  codeHighlightMap: KMP_PATTERN_MATCHING_CODE_HIGHLIGHT_MAP,
  codeVariants: KMP_PATTERN_MATCHING_CODE_VARIANTS,
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
  codeRegions: RABIN_KARP_CODE_REGIONS,
  codeHighlightMap: RABIN_KARP_CODE_HIGHLIGHT_MAP,
  codeVariants: RABIN_KARP_CODE_VARIANTS,
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
  codeRegions: Z_ALGORITHM_CODE_REGIONS,
  codeHighlightMap: Z_ALGORITHM_CODE_HIGHLIGHT_MAP,
  codeVariants: Z_ALGORITHM_CODE_VARIANTS,
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
  codeRegions: MANACHER_CODE_REGIONS,
  codeHighlightMap: MANACHER_CODE_HIGHLIGHT_MAP,
  codeVariants: MANACHER_CODE_VARIANTS,
  createScenario: (size, presetId) => createManacherScenario(size, presetId),
  generator: manacherGenerator,
  presetOptions: MANACHER_PRESETS,
  sizeOptions: [10, 14, 18],
  defaultSize: 14,
  sizeUnit: 'chars',
  randomizeLabel: 'New palindrome field',
});

const BURROWS_WHEELER_VIEW_CONFIG = createStringViewConfig<BurrowsWheelerScenario>({
  codeLines: BURROWS_WHEELER_TRANSFORM_CODE,
  codeRegions: BURROWS_WHEELER_TRANSFORM_CODE_REGIONS,
  codeHighlightMap: BURROWS_WHEELER_TRANSFORM_CODE_HIGHLIGHT_MAP,
  codeVariants: BURROWS_WHEELER_TRANSFORM_CODE_VARIANTS,
  createScenario: (size, presetId) => createBurrowsWheelerScenario(size, presetId),
  generator: burrowsWheelerTransformGenerator,
  presetOptions: BWT_PRESETS,
  sizeOptions: [6, 8, 10],
  defaultSize: 8,
  sizeUnit: 'chars',
  randomizeLabel: 'New BWT matrix',
});

const RLE_VIEW_CONFIG = createStringViewConfig<RleScenario>({
  codeLines: RLE_CODE,
  codeRegions: RLE_CODE_REGIONS,
  codeHighlightMap: RLE_CODE_HIGHLIGHT_MAP,
  codeVariants: RLE_CODE_VARIANTS,
  createScenario: (size, presetId) => createRleScenario(size, presetId),
  generator: runLengthEncodingGenerator,
  presetOptions: RLE_PRESETS,
  sizeOptions: [10, 16, 22],
  defaultSize: 16,
  sizeUnit: 'chars',
  randomizeLabel: 'New run sequence',
});

const HUFFMAN_VIEW_CONFIG = createStringViewConfig<HuffmanScenario>({
  codeLines: HUFFMAN_CODE,
  codeRegions: HUFFMAN_CODE_REGIONS,
  codeHighlightMap: HUFFMAN_CODE_HIGHLIGHT_MAP,
  codeVariants: HUFFMAN_CODE_VARIANTS,
  createScenario: (size, presetId) => createHuffmanScenario(size, presetId),
  generator: huffmanCodingGenerator,
  presetOptions: HUFFMAN_PRESETS,
  sizeOptions: [8, 12, 16],
  defaultSize: 12,
  sizeUnit: 'chars',
  randomizeLabel: 'New frequency set',
});

const TREE_TRAVERSALS_VIEW_CONFIG: AlgorithmViewConfig = {
  kind: 'tree',
  codeLines: TREE_TRAVERSALS_CODE,
  codeRegions: TREE_TRAVERSALS_CODE_REGIONS,
  codeHighlightMap: TREE_TRAVERSALS_CODE_HIGHLIGHT_MAP,
  codeVariants: TREE_TRAVERSALS_CODE_VARIANTS,
  variantOptions: TREE_TRAVERSALS_VARIANT_OPTIONS,
  defaultVariant: 'tree',
  sizeOptions: [7, 15, 31],
  defaultSize: 15,
  sizeUnit: 'nodes',
  randomizeLabel: 'New tree shape',
  legendItems: () => [],
  presetOptions: TREE_TRAVERSALS_PRESETS,
  defaultPresetId: DEFAULT_TREE_TRAVERSALS_PRESET_ID,
  createScenario: (size, presetId) => createTreeTraversalScenario(size, presetId),
  generator: (scenario: TreeTraversalScenario) => treeTraversalsGenerator(scenario),
};

const DIJKSTRA_VIEW_CONFIG: AlgorithmViewConfig = {
  kind: 'graph',
  codeLines: DIJKSTRA_CODE,
  codeRegions: DIJKSTRA_CODE_REGIONS,
  codeHighlightMap: DIJKSTRA_CODE_HIGHLIGHT_MAP,
  codeVariants: DIJKSTRA_CODE_VARIANTS,
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
  codeRegions: BFS_CODE_REGIONS,
  codeHighlightMap: BFS_CODE_HIGHLIGHT_MAP,
  codeVariants: BFS_CODE_VARIANTS,
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
  codeRegions: DFS_CODE_REGIONS,
  codeHighlightMap: DFS_CODE_HIGHLIGHT_MAP,
  codeVariants: DFS_CODE_VARIANTS,
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
  codeRegions: TOPOLOGICAL_SORT_KAHN_CODE_REGIONS,
  codeHighlightMap: TOPOLOGICAL_SORT_KAHN_CODE_HIGHLIGHT_MAP,
  codeVariants: TOPOLOGICAL_SORT_KAHN_CODE_VARIANTS,
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
  codeRegions: CYCLE_DETECTION_CODE_REGIONS,
  codeHighlightMap: CYCLE_DETECTION_CODE_HIGHLIGHT_MAP,
  codeVariants: CYCLE_DETECTION_CODE_VARIANTS,
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
  codeRegions: CONNECTED_COMPONENTS_CODE_REGIONS,
  codeHighlightMap: CONNECTED_COMPONENTS_CODE_HIGHLIGHT_MAP,
  codeVariants: CONNECTED_COMPONENTS_CODE_VARIANTS,
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
  codeRegions: BIPARTITE_CHECK_CODE_REGIONS,
  codeHighlightMap: BIPARTITE_CHECK_CODE_HIGHLIGHT_MAP,
  codeVariants: BIPARTITE_CHECK_CODE_VARIANTS,
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
  codeRegions: BELLMAN_FORD_CODE_REGIONS,
  codeHighlightMap: BELLMAN_FORD_CODE_HIGHLIGHT_MAP,
  codeVariants: BELLMAN_FORD_CODE_VARIANTS,
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
  codeRegions: PRIMS_MST_CODE_REGIONS,
  codeHighlightMap: PRIMS_MST_CODE_HIGHLIGHT_MAP,
  codeVariants: PRIMS_MST_CODE_VARIANTS,
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
  codeRegions: BRIDGES_ARTICULATION_POINTS_CODE_REGIONS,
  codeHighlightMap: BRIDGES_ARTICULATION_POINTS_CODE_HIGHLIGHT_MAP,
  codeVariants: BRIDGES_ARTICULATION_POINTS_CODE_VARIANTS,
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
  codeRegions: TARJAN_SCC_CODE_REGIONS,
  codeHighlightMap: TARJAN_SCC_CODE_HIGHLIGHT_MAP,
  codeVariants: TARJAN_SCC_CODE_VARIANTS,
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
  codeRegions: KOSARAJU_SCC_CODE_REGIONS,
  codeHighlightMap: KOSARAJU_SCC_CODE_HIGHLIGHT_MAP,
  codeVariants: KOSARAJU_SCC_CODE_VARIANTS,
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
  codeRegions: EULER_PATH_CIRCUIT_CODE_REGIONS,
  codeHighlightMap: EULER_PATH_CIRCUIT_CODE_HIGHLIGHT_MAP,
  codeVariants: EULER_PATH_CIRCUIT_CODE_VARIANTS,
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
  codeRegions: CHROMATIC_NUMBER_CODE_REGIONS,
  codeHighlightMap: CHROMATIC_NUMBER_CODE_HIGHLIGHT_MAP,
  codeVariants: CHROMATIC_NUMBER_CODE_VARIANTS,
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
  codeRegions: STEINER_TREE_CODE_REGIONS,
  codeHighlightMap: STEINER_TREE_CODE_HIGHLIGHT_MAP,
  codeVariants: STEINER_TREE_CODE_VARIANTS,
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
  codeRegions: DOMINATOR_TREE_CODE_REGIONS,
  codeHighlightMap: DOMINATOR_TREE_CODE_HIGHLIGHT_MAP,
  codeVariants: DOMINATOR_TREE_CODE_VARIANTS,
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
  codeVariants: FLOOD_FILL_CODE_VARIANTS,
  createScenario: (size) => createFloodFillScenario(size),
  generator: floodFillGenerator,
  legendItems: FLOOD_FILL_LEGEND,
  sizeOptions: [8, 10, 12],
  defaultSize: 10,
  randomizeLabel: 'New board',
});

const A_STAR_VIEW_CONFIG = createGridViewConfig<AStarScenario>({
  codeLines: A_STAR_PATHFINDING_CODE,
  codeVariants: A_STAR_PATHFINDING_CODE_VARIANTS,
  createScenario: (size) => createAStarScenario(size),
  generator: aStarPathfindingGenerator,
  legendItems: A_STAR_LEGEND,
  sizeOptions: [8, 10, 12],
  defaultSize: 10,
  randomizeLabel: 'New board',
});

const FLOYD_WARSHALL_VIEW_CONFIG = createMatrixViewConfig<FloydWarshallScenario>({
  codeLines: FLOYD_WARSHALL_CODE,
  codeVariants: FLOYD_WARSHALL_CODE_VARIANTS,
  createScenario: (size) => createFloydWarshallScenario(size),
  generator: floydWarshallGenerator,
  legendItems: FLOYD_WARSHALL_LEGEND,
  sizeOptions: [5, 6],
  defaultSize: 5,
  randomizeLabel: 'New matrix',
});

const HUNGARIAN_VIEW_CONFIG = createMatrixViewConfig<HungarianScenario>({
  codeLines: HUNGARIAN_ALGORITHM_CODE,
  codeVariants: HUNGARIAN_ALGORITHM_CODE_VARIANTS,
  createScenario: (size) => createHungarianScenario(size),
  generator: hungarianAlgorithmGenerator,
  legendItems: HUNGARIAN_LEGEND,
  sizeOptions: [4, 5],
  defaultSize: 4,
  randomizeLabel: 'New assignment grid',
});

const KNAPSACK_VIEW_CONFIG = createDpViewConfig<KnapsackScenario>({
  codeLines: KNAPSACK_01_CODE,
  codeRegions: KNAPSACK_01_CODE_REGIONS,
  codeHighlightMap: KNAPSACK_01_CODE_HIGHLIGHT_MAP,
  codeVariants: KNAPSACK_01_CODE_VARIANTS,
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
  codeRegions: LONGEST_COMMON_SUBSEQUENCE_CODE_REGIONS,
  codeHighlightMap: LONGEST_COMMON_SUBSEQUENCE_CODE_HIGHLIGHT_MAP,
  codeVariants: LONGEST_COMMON_SUBSEQUENCE_CODE_VARIANTS,
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
  codeRegions: EDIT_DISTANCE_CODE_REGIONS,
  codeHighlightMap: EDIT_DISTANCE_CODE_HIGHLIGHT_MAP,
  codeVariants: EDIT_DISTANCE_CODE_VARIANTS,
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
  codeRegions: MATRIX_CHAIN_MULTIPLICATION_CODE_REGIONS,
  codeHighlightMap: MATRIX_CHAIN_MULTIPLICATION_CODE_HIGHLIGHT_MAP,
  codeVariants: MATRIX_CHAIN_MULTIPLICATION_CODE_VARIANTS,
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
  codeRegions: COIN_CHANGE_CODE_REGIONS,
  codeHighlightMap: COIN_CHANGE_CODE_HIGHLIGHT_MAP,
  codeVariants: COIN_CHANGE_CODE_VARIANTS,
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
  codeRegions: SUBSET_SUM_CODE_REGIONS,
  codeHighlightMap: SUBSET_SUM_CODE_HIGHLIGHT_MAP,
  codeVariants: SUBSET_SUM_CODE_VARIANTS,
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
  codeRegions: LONGEST_PALINDROMIC_SUBSEQUENCE_CODE_REGIONS,
  codeHighlightMap: LONGEST_PALINDROMIC_SUBSEQUENCE_CODE_HIGHLIGHT_MAP,
  codeVariants: LONGEST_PALINDROMIC_SUBSEQUENCE_CODE_VARIANTS,
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
  codeRegions: BURST_BALLOONS_CODE_REGIONS,
  codeHighlightMap: BURST_BALLOONS_CODE_HIGHLIGHT_MAP,
  codeVariants: BURST_BALLOONS_CODE_VARIANTS,
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
  codeRegions: WILDCARD_MATCHING_CODE_REGIONS,
  codeHighlightMap: WILDCARD_MATCHING_CODE_HIGHLIGHT_MAP,
  codeVariants: WILDCARD_MATCHING_CODE_VARIANTS,
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
  codeRegions: LONGEST_INCREASING_SUBSEQUENCE_CODE_REGIONS,
  codeHighlightMap: LONGEST_INCREASING_SUBSEQUENCE_CODE_HIGHLIGHT_MAP,
  codeVariants: LONGEST_INCREASING_SUBSEQUENCE_CODE_VARIANTS,
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
  codeRegions: CLIMBING_STAIRS_CODE_REGIONS,
  codeHighlightMap: CLIMBING_STAIRS_CODE_HIGHLIGHT_MAP,
  codeVariants: CLIMBING_STAIRS_CODE_VARIANTS,
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
  codeRegions: FIBONACCI_DP_CODE_REGIONS,
  codeHighlightMap: FIBONACCI_DP_CODE_HIGHLIGHT_MAP,
  codeVariants: FIBONACCI_DP_CODE_VARIANTS,
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
  codeRegions: REGEX_MATCHING_DP_CODE_REGIONS,
  codeHighlightMap: REGEX_MATCHING_DP_CODE_HIGHLIGHT_MAP,
  codeVariants: REGEX_MATCHING_DP_CODE_VARIANTS,
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
  codeRegions: TRAVELING_SALESMAN_DP_CODE_REGIONS,
  codeHighlightMap: TRAVELING_SALESMAN_DP_CODE_HIGHLIGHT_MAP,
  codeVariants: TRAVELING_SALESMAN_DP_CODE_VARIANTS,
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
  codeRegions: SOS_DP_CODE_REGIONS,
  codeHighlightMap: SOS_DP_CODE_HIGHLIGHT_MAP,
  codeVariants: SOS_DP_CODE_VARIANTS,
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
  codeRegions: PROFILE_DP_CODE_REGIONS,
  codeHighlightMap: PROFILE_DP_CODE_HIGHLIGHT_MAP,
  codeVariants: PROFILE_DP_CODE_VARIANTS,
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
  codeRegions: DP_ON_TREES_CODE_REGIONS,
  codeHighlightMap: DP_ON_TREES_CODE_HIGHLIGHT_MAP,
  codeVariants: DP_ON_TREES_CODE_VARIANTS,
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
  codeRegions: DP_WITH_BITMASK_CODE_REGIONS,
  codeHighlightMap: DP_WITH_BITMASK_CODE_HIGHLIGHT_MAP,
  codeVariants: DP_WITH_BITMASK_CODE_VARIANTS,
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
  codeRegions: DP_CONVEX_HULL_TRICK_CODE_REGIONS,
  codeHighlightMap: DP_CONVEX_HULL_TRICK_CODE_HIGHLIGHT_MAP,
  codeVariants: DP_CONVEX_HULL_TRICK_CODE_VARIANTS,
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
  codeRegions: DIVIDE_CONQUER_DP_OPTIMIZATION_CODE_REGIONS,
  codeHighlightMap: DIVIDE_CONQUER_DP_OPTIMIZATION_CODE_HIGHLIGHT_MAP,
  codeVariants: DIVIDE_CONQUER_DP_OPTIMIZATION_CODE_VARIANTS,
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
  codeRegions: KNUTH_DP_OPTIMIZATION_CODE_REGIONS,
  codeHighlightMap: KNUTH_DP_OPTIMIZATION_CODE_HIGHLIGHT_MAP,
  codeVariants: KNUTH_DP_OPTIMIZATION_CODE_VARIANTS,
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
  codeVariants: UNION_FIND_CODE_VARIANTS,
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
  codeVariants: KRUSKALS_MST_CODE_VARIANTS,
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
  codeVariants: HOPCROFT_KARP_CODE_VARIANTS,
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
  codeVariants: DINIC_MAX_FLOW_CODE_VARIANTS,
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
  codeVariants: EDMONDS_KARP_CODE_VARIANTS,
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
  codeVariants: MIN_COST_MAX_FLOW_CODE_VARIANTS,
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
  codeRegions: CONVEX_HULL_CODE_REGIONS,
  codeHighlightMap: CONVEX_HULL_CODE_HIGHLIGHT_MAP,
  codeVariants: CONVEX_HULL_CODE_VARIANTS,
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
  codeRegions: CLOSEST_PAIR_OF_POINTS_CODE_REGIONS,
  codeHighlightMap: CLOSEST_PAIR_OF_POINTS_CODE_HIGHLIGHT_MAP,
  codeVariants: CLOSEST_PAIR_OF_POINTS_CODE_VARIANTS,
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
  codeRegions: LINE_INTERSECTION_CODE_REGIONS,
  codeHighlightMap: LINE_INTERSECTION_CODE_HIGHLIGHT_MAP,
  codeVariants: LINE_INTERSECTION_CODE_VARIANTS,
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
  codeRegions: HALF_PLANE_INTERSECTION_CODE_REGIONS,
  codeHighlightMap: HALF_PLANE_INTERSECTION_CODE_HIGHLIGHT_MAP,
  codeVariants: HALF_PLANE_INTERSECTION_CODE_VARIANTS,
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
  codeRegions: MINKOWSKI_SUM_CODE_REGIONS,
  codeHighlightMap: MINKOWSKI_SUM_CODE_HIGHLIGHT_MAP,
  codeVariants: MINKOWSKI_SUM_CODE_VARIANTS,
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
  codeRegions: SWEEP_LINE_CODE_REGIONS,
  codeHighlightMap: SWEEP_LINE_CODE_HIGHLIGHT_MAP,
  codeVariants: SWEEP_LINE_CODE_VARIANTS,
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
  codeRegions: VORONOI_DIAGRAM_CODE_REGIONS,
  codeHighlightMap: VORONOI_DIAGRAM_CODE_HIGHLIGHT_MAP,
  codeVariants: VORONOI_DIAGRAM_CODE_VARIANTS,
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
  codeRegions: DELAUNAY_TRIANGULATION_CODE_REGIONS,
  codeHighlightMap: DELAUNAY_TRIANGULATION_CODE_HIGHLIGHT_MAP,
  codeVariants: DELAUNAY_TRIANGULATION_CODE_VARIANTS,
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

export function humanizeLabel(value: string): string {
  return value
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function getAlgorithmViewConfig(id: string): AlgorithmViewConfig {
  if (id === 'radix-sort') return RADIX_VIEW_CONFIG;
  if (id === 'selection-sort') return SELECTION_VIEW_CONFIG;
  if (id === 'insertion-sort') return INSERTION_VIEW_CONFIG;
  if (id === 'counting-sort') return COUNTING_VIEW_CONFIG;
  if (id === 'merge-sort') return MERGE_VIEW_CONFIG;
  if (id === 'quick-sort') return QUICK_VIEW_CONFIG;
  if (id === 'heap-sort') return HEAP_VIEW_CONFIG;
  if (id === 'bucket-sort') return BUCKET_VIEW_CONFIG;
  if (id === 'shell-sort') return SHELL_VIEW_CONFIG;
  if (id === 'tim-sort') return TIM_VIEW_CONFIG;
  if (id === 'linear-search') return LINEAR_SEARCH_VIEW_CONFIG;
  if (id === 'binary-search') return BINARY_SEARCH_VIEW_CONFIG;
  if (id === 'binary-search-variants') return BINARY_SEARCH_VARIANTS_VIEW_CONFIG;
  if (id === 'kmp-pattern-matching') return KMP_VIEW_CONFIG;
  if (id === 'rabin-karp') return RABIN_KARP_VIEW_CONFIG;
  if (id === 'z-algorithm') return Z_ALGORITHM_VIEW_CONFIG;
  if (id === 'manacher') return MANACHER_VIEW_CONFIG;
  if (id === 'burrows-wheeler-transform') return BURROWS_WHEELER_VIEW_CONFIG;
  if (id === 'run-length-encoding') return RLE_VIEW_CONFIG;
  if (id === 'huffman-coding') return HUFFMAN_VIEW_CONFIG;
  if (id === 'knapsack-01') return KNAPSACK_VIEW_CONFIG;
  if (id === 'longest-common-subsequence') return LCS_VIEW_CONFIG;
  if (id === 'edit-distance') return EDIT_DISTANCE_VIEW_CONFIG;
  if (id === 'matrix-chain-multiplication') return MATRIX_CHAIN_VIEW_CONFIG;
  if (id === 'coin-change') return COIN_CHANGE_VIEW_CONFIG;
  if (id === 'subset-sum') return SUBSET_SUM_VIEW_CONFIG;
  if (id === 'longest-palindromic-subsequence') return LPS_VIEW_CONFIG;
  if (id === 'burst-balloons') return BURST_BALLOONS_VIEW_CONFIG;
  if (id === 'wildcard-matching') return WILDCARD_VIEW_CONFIG;
  if (id === 'longest-increasing-subsequence') return LIS_VIEW_CONFIG;
  if (id === 'climbing-stairs') return CLIMBING_STAIRS_VIEW_CONFIG;
  if (id === 'fibonacci-dp') return FIBONACCI_VIEW_CONFIG;
  if (id === 'regex-matching-dp') return REGEX_VIEW_CONFIG;
  if (id === 'traveling-salesman-dp') return TSP_VIEW_CONFIG;
  if (id === 'sos-dp') return SOS_VIEW_CONFIG;
  if (id === 'profile-dp') return PROFILE_VIEW_CONFIG;
  if (id === 'dp-on-trees') return TREE_DP_VIEW_CONFIG;
  if (id === 'dp-with-bitmask') return BITMASK_DP_VIEW_CONFIG;
  if (id === 'dp-convex-hull-trick') return CHT_VIEW_CONFIG;
  if (id === 'divide-conquer-dp-optimization') return DIVIDE_CONQUER_VIEW_CONFIG;
  if (id === 'knuth-dp-optimization') return KNUTH_VIEW_CONFIG;
  if (id === 'dijkstra') return DIJKSTRA_VIEW_CONFIG;
  if (id === 'bfs') return BFS_VIEW_CONFIG;
  if (id === 'dfs') return DFS_VIEW_CONFIG;
  if (id === 'topological-sort-kahn') return TOPOLOGICAL_SORT_KAHN_VIEW_CONFIG;
  if (id === 'cycle-detection') return CYCLE_DETECTION_VIEW_CONFIG;
  if (id === 'connected-components') return CONNECTED_COMPONENTS_VIEW_CONFIG;
  if (id === 'bipartite-check') return BIPARTITE_CHECK_VIEW_CONFIG;
  if (id === 'bellman-ford') return BELLMAN_FORD_VIEW_CONFIG;
  if (id === 'prims-mst') return PRIMS_MST_VIEW_CONFIG;
  if (id === 'bridges-articulation-points') return BRIDGES_ARTICULATION_VIEW_CONFIG;
  if (id === 'tarjan-scc') return TARJAN_SCC_VIEW_CONFIG;
  if (id === 'kosaraju-scc') return KOSARAJU_SCC_VIEW_CONFIG;
  if (id === 'euler-path-circuit') return EULER_VIEW_CONFIG;
  if (id === 'chromatic-number') return CHROMATIC_NUMBER_VIEW_CONFIG;
  if (id === 'steiner-tree') return STEINER_TREE_VIEW_CONFIG;
  if (id === 'dominator-tree') return DOMINATOR_TREE_VIEW_CONFIG;
  if (id === 'flood-fill') return FLOOD_FILL_VIEW_CONFIG;
  if (id === 'a-star-pathfinding') return A_STAR_VIEW_CONFIG;
  if (id === 'floyd-warshall') return FLOYD_WARSHALL_VIEW_CONFIG;
  if (id === 'hungarian-algorithm') return HUNGARIAN_VIEW_CONFIG;
  if (id === 'union-find') return UNION_FIND_VIEW_CONFIG;
  if (id === 'kruskals-mst') return KRUSKAL_VIEW_CONFIG;
  if (id === 'hopcroft-karp') return HOPCROFT_KARP_VIEW_CONFIG;
  if (id === 'dinic-max-flow') return DINIC_VIEW_CONFIG;
  if (id === 'edmonds-karp') return EDMONDS_KARP_VIEW_CONFIG;
  if (id === 'min-cost-max-flow') return MIN_COST_MAX_FLOW_VIEW_CONFIG;
  if (id === 'convex-hull') return CONVEX_HULL_VIEW_CONFIG;
  if (id === 'closest-pair-of-points') return CLOSEST_PAIR_VIEW_CONFIG;
  if (id === 'line-intersection') return LINE_INTERSECTION_VIEW_CONFIG;
  if (id === 'half-plane-intersection') return HALF_PLANE_VIEW_CONFIG;
  if (id === 'minkowski-sum') return MINKOWSKI_SUM_VIEW_CONFIG;
  if (id === 'sweep-line') return SWEEP_LINE_VIEW_CONFIG;
  if (id === 'voronoi-diagram') return VORONOI_VIEW_CONFIG;
  if (id === 'delaunay-triangulation') return DELAUNAY_VIEW_CONFIG;
  if (id === 'tree-traversals') return TREE_TRAVERSALS_VIEW_CONFIG;
  return BUBBLE_VIEW_CONFIG;
}

export function describeGraphPath(trace: GraphStepState, nodeId: string): string {
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
  const rightYs = [...leftYs]
    .reverse()
    .map((value, index) => Number((value + (index % 2 === 0 ? 2.2 : -2.2)).toFixed(1)));

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
    const angle = (Math.PI * 2 * index) / vertexCount + (Math.random() * 0.3 - 0.15);
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

function createSpacedGeometryPoints(
  count: number,
  minDistance: number,
): { x: number; y: number }[] {
  const points: { x: number; y: number }[] = [];
  let guard = 0;

  while (points.length < count && guard < count * 120) {
    guard += 1;
    const candidate = {
      x: Math.round(Math.random() * 74) + 12,
      y: Math.round(Math.random() * 74) + 12,
    };
    const tooClose = points.some(
      (point) => Math.hypot(point.x - candidate.x, point.y - candidate.y) < minDistance,
    );
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
