import { aStarPathfindingGenerator } from '../../algorithms/a-star-pathfinding/a-star-pathfinding';
import { ahoCorasickGenerator } from '../../algorithms/aho-corasick/aho-corasick';
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
import { palindromicTreeGenerator } from '../../algorithms/palindromic-tree/palindromic-tree';
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
import { suffixArrayConstructionGenerator } from '../../algorithms/suffix-array-construction/suffix-array-construction';
import { suffixArrayLcpKasaiGenerator } from '../../algorithms/suffix-array-lcp-kasai/suffix-array-lcp-kasai';
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
  AHO_CORASICK_CODE,
  AHO_CORASICK_CODE_HIGHLIGHT_MAP,
  AHO_CORASICK_CODE_REGIONS,
  AHO_CORASICK_CODE_VARIANTS,
} from '../../data/aho-corasick-code';
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
  PALINDROMIC_TREE_CODE,
  PALINDROMIC_TREE_CODE_HIGHLIGHT_MAP,
  PALINDROMIC_TREE_CODE_REGIONS,
  PALINDROMIC_TREE_CODE_VARIANTS,
} from '../../data/palindromic-tree-code';
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
  SUFFIX_ARRAY_CONSTRUCTION_CODE,
  SUFFIX_ARRAY_CONSTRUCTION_CODE_HIGHLIGHT_MAP,
  SUFFIX_ARRAY_CONSTRUCTION_CODE_REGIONS,
  SUFFIX_ARRAY_CONSTRUCTION_CODE_VARIANTS,
} from '../../data/suffix-array-construction-code';
import {
  SUFFIX_ARRAY_LCP_KASAI_CODE,
  SUFFIX_ARRAY_LCP_KASAI_CODE_HIGHLIGHT_MAP,
  SUFFIX_ARRAY_LCP_KASAI_CODE_REGIONS,
  SUFFIX_ARRAY_LCP_KASAI_CODE_VARIANTS,
} from '../../data/suffix-array-lcp-kasai-code';
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
import { Task } from '../../models/task';
import { TreePresetOption } from '../../models/tree';
import {
  NumberLabPresetOption,
  FibonacciScenario as FibonacciIterScenario,
  FactorialScenario,
  EuclideanGcdScenario,
  FIBONACCI_PRESETS as FIBONACCI_ITER_PRESETS,
  FACTORIAL_PRESETS,
  EUCLIDEAN_GCD_PRESETS,
  EUCLIDEAN_GCD_TASKS,
  EuclideanGcdValues,
  DEFAULT_FIBONACCI_PRESET_ID as DEFAULT_FIBONACCI_ITER_PRESET_ID,
  DEFAULT_FACTORIAL_PRESET_ID,
  DEFAULT_EUCLIDEAN_GCD_PRESET_ID,
  DEFAULT_EUCLIDEAN_GCD_TASK_ID,
  createFibonacciScenario as createFibonacciIterScenario,
  createFactorialScenario,
  createEuclideanGcdScenario,
} from '../../utils/scenarios/number-lab/number-lab-scenarios';
import {
  PointerLabPresetOption,
  TwoPointersScenario,
  TwoPointersValues,
  SlidingWindowScenario,
  SlidingWindowValues,
  PalindromeCheckScenario,
  PalindromeValues,
  ReverseScenario,
  ReverseValues,
  KadaneScenario,
  KadaneValues,
  TWO_POINTERS_PRESETS,
  SLIDING_WINDOW_PRESETS,
  PALINDROME_PRESETS,
  REVERSE_PRESETS,
  KADANE_PRESETS,
  TWO_POINTERS_TASKS,
  SLIDING_WINDOW_TASKS,
  PALINDROME_TASKS,
  REVERSE_TASKS,
  KADANE_TASKS,
  DEFAULT_TWO_POINTERS_PRESET_ID,
  DEFAULT_SLIDING_WINDOW_PRESET_ID,
  DEFAULT_PALINDROME_PRESET_ID,
  DEFAULT_REVERSE_PRESET_ID,
  DEFAULT_KADANE_PRESET_ID,
  DEFAULT_TWO_POINTERS_TASK_ID,
  DEFAULT_SLIDING_WINDOW_TASK_ID,
  DEFAULT_PALINDROME_TASK_ID,
  DEFAULT_REVERSE_TASK_ID,
  DEFAULT_KADANE_TASK_ID,
  createTwoPointersScenario,
  createSlidingWindowScenario,
  createPalindromeScenario,
  createReverseScenario,
  createKadaneScenario,
} from '../../utils/scenarios/pointer-lab/pointer-lab-scenarios';
import {
  SieveGridPresetOption,
  SieveEratosthenesScenario,
  EratosthenesValues,
  ERATOSTHENES_PRESETS,
  ERATOSTHENES_TASKS,
  DEFAULT_ERATOSTHENES_PRESET_ID,
  DEFAULT_ERATOSTHENES_TASK_ID,
  createEratosthenesScenario,
} from '../../utils/scenarios/sieve-grid/sieve-grid-scenarios';
import {
  CallStackLabPresetOption,
  RecursiveFibonacciScenario,
  RECURSIVE_FIBONACCI_PRESETS,
  DEFAULT_RECURSIVE_FIBONACCI_PRESET_ID,
  createRecursiveFibonacciScenario,
} from '../../utils/scenarios/call-stack-lab/call-stack-lab-scenarios';
import {
  CallTreeLabPresetOption,
  NQueensScenario,
  MinimaxScenario,
  McTsScenario,
  N_QUEENS_PRESETS,
  MINIMAX_PRESETS,
  MCTS_PRESETS,
  DEFAULT_N_QUEENS_PRESET_ID,
  DEFAULT_MINIMAX_PRESET_ID,
  DEFAULT_MCTS_PRESET_ID,
  createNQueensScenario,
  createMinimaxScenario,
  createMcTsScenario,
} from '../../utils/scenarios/call-tree-lab/call-tree-lab-scenarios';
import { fibonacciIterativeGenerator } from '../../algorithms/fibonacci-iterative/fibonacci-iterative';
import { factorialGenerator } from '../../algorithms/factorial/factorial';
import { euclideanGcdGenerator } from '../../algorithms/euclidean-gcd/euclidean-gcd';
import { twoPointersGenerator } from '../../algorithms/two-pointers/two-pointers';
import { slidingWindowGenerator } from '../../algorithms/sliding-window/sliding-window';
import { palindromeCheckGenerator } from '../../algorithms/palindrome-check/palindrome-check';
import { reverseStringArrayGenerator } from '../../algorithms/reverse-string-array/reverse-string-array';
import { kadaneGenerator } from '../../algorithms/kadane/kadane';
import { sieveOfEratosthenesGenerator } from '../../algorithms/sieve-of-eratosthenes/sieve-of-eratosthenes';
import { recursionCallStackGenerator } from '../../algorithms/recursion-call-stack/recursion-call-stack';
import { backtrackingGenerator } from '../../algorithms/backtracking/backtracking';
import { minimaxAlphaBetaGenerator } from '../../algorithms/minimax-alpha-beta/minimax-alpha-beta';
import { mctsGenerator } from '../../algorithms/mcts/mcts';
import { extendedEuclideanGenerator } from '../../algorithms/extended-euclidean/extended-euclidean';
import {
  ExtendedEuclideanScenario,
  ExtendedEuclideanValues,
  EXTENDED_EUCLIDEAN_PRESETS,
  EXTENDED_EUCLIDEAN_TASKS,
  DEFAULT_EXTENDED_EUCLIDEAN_PRESET_ID,
  DEFAULT_EXTENDED_EUCLIDEAN_TASK_ID,
  createExtendedEuclideanScenario,
} from '../../utils/scenarios/number-lab/extended-euclidean-scenarios';
import { millerRabinGenerator } from '../../algorithms/miller-rabin/miller-rabin';
import {
  MillerRabinScenario,
  MillerRabinValues,
  MILLER_RABIN_PRESETS,
  MILLER_RABIN_TASKS,
  DEFAULT_MILLER_RABIN_PRESET_ID,
  DEFAULT_MILLER_RABIN_TASK_ID,
  createMillerRabinScenario,
} from '../../utils/scenarios/number-lab/miller-rabin-scenarios';
import { crtGenerator } from '../../algorithms/crt/crt';
import {
  CrtScenario,
  CrtValues,
  CRT_PRESETS,
  CRT_TASKS,
  DEFAULT_CRT_PRESET_ID,
  DEFAULT_CRT_TASK_ID,
  createCrtScenario,
} from '../../utils/scenarios/number-lab/crt-scenarios';
import { pollardsRhoGenerator } from '../../algorithms/pollards-rho/pollards-rho';
import {
  PollardsRhoScenario,
  PollardsRhoValues,
  POLLARDS_RHO_PRESETS,
  POLLARDS_RHO_TASKS,
  DEFAULT_POLLARDS_RHO_PRESET_ID,
  DEFAULT_POLLARDS_RHO_TASK_ID,
  createPollardsRhoScenario,
} from '../../utils/scenarios/number-lab/pollards-rho-scenarios';
import { gaussianEliminationGenerator } from '../../algorithms/gaussian-elimination/gaussian-elimination';
import {
  GaussianEliminationScenario,
  GaussianEliminationValues,
  GAUSSIAN_ELIMINATION_PRESETS,
  GAUSSIAN_ELIMINATION_TASKS,
  DEFAULT_GAUSSIAN_ELIMINATION_PRESET_ID,
  DEFAULT_GAUSSIAN_ELIMINATION_TASK_ID,
  createGaussianEliminationScenario,
} from '../../utils/scenarios/number-lab/gaussian-elimination-scenarios';
import { simplexAlgorithmGenerator } from '../../algorithms/simplex-algorithm/simplex-algorithm';
import {
  SimplexAlgorithmScenario,
  SimplexAlgorithmValues,
  SIMPLEX_ALGORITHM_PRESETS,
  SIMPLEX_ALGORITHM_TASKS,
  DEFAULT_SIMPLEX_ALGORITHM_PRESET_ID,
  DEFAULT_SIMPLEX_ALGORITHM_TASK_ID,
  createSimplexAlgorithmScenario,
} from '../../utils/scenarios/number-lab/simplex-algorithm-scenarios';
import {
  FIBONACCI_CODE,
  FIBONACCI_CODE_HIGHLIGHT_MAP,
  FIBONACCI_CODE_REGIONS,
  FIBONACCI_CODE_VARIANTS,
} from '../../data/fibonacci-iterative-code';
import {
  FACTORIAL_CODE,
  FACTORIAL_CODE_HIGHLIGHT_MAP,
  FACTORIAL_CODE_REGIONS,
  FACTORIAL_CODE_VARIANTS,
} from '../../data/factorial-code';
import {
  EUCLIDEAN_GCD_CODE,
  EUCLIDEAN_GCD_CODE_HIGHLIGHT_MAP,
  EUCLIDEAN_GCD_CODE_REGIONS,
  EUCLIDEAN_GCD_CODE_VARIANTS,
} from '../../data/euclidean-gcd-code';
import {
  EXTENDED_EUCLIDEAN_CODE,
  EXTENDED_EUCLIDEAN_CODE_HIGHLIGHT_MAP,
  EXTENDED_EUCLIDEAN_CODE_REGIONS,
  EXTENDED_EUCLIDEAN_CODE_VARIANTS,
} from '../../data/extended-euclidean-code';
import {
  TWO_POINTERS_CODE,
  TWO_POINTERS_CODE_HIGHLIGHT_MAP,
  TWO_POINTERS_CODE_REGIONS,
  TWO_POINTERS_CODE_VARIANTS,
} from '../../data/two-pointers-code';
import {
  SLIDING_WINDOW_CODE,
  SLIDING_WINDOW_CODE_HIGHLIGHT_MAP,
  SLIDING_WINDOW_CODE_REGIONS,
  SLIDING_WINDOW_CODE_VARIANTS,
} from '../../data/sliding-window-code';
import {
  PALINDROME_CODE,
  PALINDROME_CODE_HIGHLIGHT_MAP,
  PALINDROME_CODE_REGIONS,
  PALINDROME_CODE_VARIANTS,
} from '../../data/palindrome-check-code';
import {
  REVERSE_CODE,
  REVERSE_CODE_HIGHLIGHT_MAP,
  REVERSE_CODE_REGIONS,
  REVERSE_CODE_VARIANTS,
} from '../../data/reverse-string-array-code';
import {
  KADANE_CODE,
  KADANE_CODE_HIGHLIGHT_MAP,
  KADANE_CODE_REGIONS,
  KADANE_CODE_VARIANTS,
} from '../../data/kadane-code';
import {
  SIEVE_OF_ERATOSTHENES_CODE,
  SIEVE_OF_ERATOSTHENES_CODE_HIGHLIGHT_MAP,
  SIEVE_OF_ERATOSTHENES_CODE_REGIONS,
  SIEVE_OF_ERATOSTHENES_CODE_VARIANTS,
} from '../../data/sieve-of-eratosthenes-code';
import {
  RECURSION_CALL_STACK_CODE,
  RECURSION_CALL_STACK_CODE_HIGHLIGHT_MAP,
  RECURSION_CALL_STACK_CODE_REGIONS,
  RECURSION_CALL_STACK_CODE_VARIANTS,
} from '../../data/recursion-call-stack-code';
import {
  BACKTRACKING_CODE,
  BACKTRACKING_CODE_HIGHLIGHT_MAP,
  BACKTRACKING_CODE_REGIONS,
  BACKTRACKING_CODE_VARIANTS,
} from '../../data/backtracking-code';
import {
  MINIMAX_ALPHA_BETA_CODE,
  MINIMAX_ALPHA_BETA_CODE_HIGHLIGHT_MAP,
  MINIMAX_ALPHA_BETA_CODE_REGIONS,
  MINIMAX_ALPHA_BETA_CODE_VARIANTS,
} from '../../data/minimax-alpha-beta-code';
import {
  MCTS_CODE,
  MCTS_CODE_HIGHLIGHT_MAP,
  MCTS_CODE_REGIONS,
  MCTS_CODE_VARIANTS,
} from '../../data/mcts-code';
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
import { VIZ_COLOR } from '../../utils/helpers/visualization-palette/visualization-palette';
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
} from '../../utils/scenarios/dp/dp-scenarios';
import {
  createKruskalScenario,
  createUnionFindScenario,
  KruskalScenario,
  UnionFindScenario,
} from '../../utils/scenarios/dsu/dsu-scenarios';
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
} from '../../utils/helpers/dijkstra-graph/dijkstra-graph';
import {
  AStarScenario,
  createAStarScenario,
  createFloodFillScenario,
  FloodFillScenario,
} from '../../utils/scenarios/grid/grid-scenarios';
import {
  HUNGARIAN_ALGORITHM_CODE,
  HUNGARIAN_ALGORITHM_CODE_VARIANTS,
} from '../../data/hungarian-algorithm-code';
import {
  createFloydWarshallScenario,
  createHungarianScenario,
  FloydWarshallScenario,
  HungarianScenario,
} from '../../utils/scenarios/matrix/matrix-scenarios';
import {
  createEdmondsKarpScenario,
  createDinicScenario,
  createHopcroftKarpScenario,
  createMinCostMaxFlowScenario,
  DinicScenario,
  HopcroftKarpScenario,
  MinCostMaxFlowScenario,
} from '../../utils/scenarios/network/network-scenarios';
import {
  AHO_CORASICK_PRESETS,
  BWT_PRESETS,
  HUFFMAN_PRESETS,
  KMP_PRESETS,
  MANACHER_PRESETS,
  PALINDROMIC_TREE_PRESETS,
  RABIN_KARP_PRESETS,
  RLE_PRESETS,
  SUFFIX_ARRAY_LCP_PRESETS,
  SUFFIX_ARRAY_PRESETS,
  Z_ALGORITHM_PRESETS,
  AhoCorasickScenario,
  BurrowsWheelerScenario,
  HuffmanScenario,
  KmpScenario,
  ManacherScenario,
  PalindromicTreeScenario,
  RabinKarpScenario,
  RleScenario,
  SuffixArrayLcpScenario,
  SuffixArrayScenario,
  ZAlgorithmScenario,
  createAhoCorasickScenario,
  createBurrowsWheelerScenario,
  createHuffmanScenario,
  createKmpScenario,
  createManacherScenario,
  createPalindromicTreeScenario,
  createRabinKarpScenario,
  createRleScenario,
  createSuffixArrayLcpScenario,
  createSuffixArrayScenario,
  createZAlgorithmScenario,
} from '../../utils/scenarios/string/string-scenarios';
import {
  DEFAULT_TREE_TRAVERSALS_PRESET_ID,
  DEFAULT_TREE_TRAVERSALS_TASK_ID,
  TREE_TRAVERSALS_PRESETS,
  TREE_TRAVERSALS_TASKS,
  TreeTraversalScenario,
  TreeTraversalValues,
  createTreeTraversalScenario,
} from '../../utils/scenarios/tree/tree-scenarios';
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

const NUMBER_LAB_VARIANT_OPTIONS: readonly VisualizationOption[] = [
  { value: 'number-lab', label: 'Number Lab' },
];

/** Variant pair offered for math-heavy algorithms that should default
 *  to the chalkboard (derivational) view but can also be explored in
 *  the register dashboard. Students toggle from the toolbar. */
const NUMBER_LAB_WITH_SCRATCHPAD_VARIANT_OPTIONS: readonly VisualizationOption[] = [
  { value: 'scratchpad-lab', label: 'Chalkboard' },
  { value: 'number-lab', label: 'Number Lab' },
];

/** Chalkboard-only option for algorithms whose derivational story is
 *  the whole point (Extended Euclidean, Miller-Rabin, CRT, …) — the
 *  dashboard view would only restate the registers without adding
 *  pedagogical value, so we skip it. */
const SCRATCHPAD_LAB_ONLY_VARIANT_OPTIONS: readonly VisualizationOption[] = [
  { value: 'scratchpad-lab', label: 'Chalkboard' },
];

const POINTER_LAB_VARIANT_OPTIONS: readonly VisualizationOption[] = [
  { value: 'pointer-lab', label: 'Pointer Lab' },
];

const SIEVE_GRID_VARIANT_OPTIONS: readonly VisualizationOption[] = [
  { value: 'sieve-grid', label: 'Sieve Grid' },
];

const CALL_STACK_LAB_VARIANT_OPTIONS: readonly VisualizationOption[] = [
  { value: 'call-stack-lab', label: 'Call Stack Lab' },
];

const CALL_TREE_LAB_VARIANT_OPTIONS: readonly VisualizationOption[] = [
  { value: 'call-tree-lab', label: 'Call Tree Lab' },
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

interface TreeAlgorithmViewConfig<TScenario = any, TValues = any>
  extends BaseAlgorithmViewConfig {
  readonly kind: 'tree';
  readonly presetOptions: readonly TreePresetOption[];
  readonly defaultPresetId: string;
  readonly createScenario: (
    size: number,
    presetId: string,
    customValues?: TValues,
  ) => TScenario;
  readonly generator: (scenario: TScenario) => Generator<SortStep>;
  readonly tasks?: readonly Task<TValues>[];
  readonly defaultTaskId?: string;
}

interface NumberLabAlgorithmViewConfig<TScenario = any, TValues = any>
  extends BaseAlgorithmViewConfig {
  readonly kind: 'number-lab';
  readonly presetOptions: readonly NumberLabPresetOption[];
  readonly defaultPresetId: string;
  readonly createScenario: (
    size: number,
    presetId: string,
    customValues?: TValues,
  ) => TScenario;
  readonly generator: (scenario: TScenario) => Generator<SortStep>;
  /** New unified task model. When present, the toolbar task picker
   *  takes over and the per-viz `presetOptions` are treated as legacy
   *  source of truth only for algorithms that haven't migrated yet.
   *  During migration both coexist. */
  readonly tasks?: readonly Task<TValues>[];
  readonly defaultTaskId?: string;
}

interface PointerLabAlgorithmViewConfig<TScenario = any, TValues = any>
  extends BaseAlgorithmViewConfig {
  readonly kind: 'pointer-lab';
  readonly presetOptions: readonly PointerLabPresetOption[];
  readonly defaultPresetId: string;
  readonly createScenario: (
    size: number,
    presetId: string,
    customValues?: TValues,
  ) => TScenario;
  readonly generator: (scenario: TScenario) => Generator<SortStep>;
  readonly tasks?: readonly Task<TValues>[];
  readonly defaultTaskId?: string;
}

interface SieveGridAlgorithmViewConfig<TScenario = any, TValues = any>
  extends BaseAlgorithmViewConfig {
  readonly kind: 'sieve-grid';
  readonly presetOptions: readonly SieveGridPresetOption[];
  readonly defaultPresetId: string;
  readonly createScenario: (
    size: number,
    presetId: string,
    customValues?: TValues,
  ) => TScenario;
  readonly generator: (scenario: TScenario) => Generator<SortStep>;
  readonly tasks?: readonly Task<TValues>[];
  readonly defaultTaskId?: string;
}

interface CallStackLabAlgorithmViewConfig<TScenario = unknown> extends BaseAlgorithmViewConfig {
  readonly kind: 'call-stack-lab';
  readonly presetOptions: readonly CallStackLabPresetOption[];
  readonly defaultPresetId: string;
  readonly createScenario: (size: number, presetId: string) => TScenario;
  readonly generator: (scenario: TScenario) => Generator<SortStep>;
}

interface CallTreeLabAlgorithmViewConfig<TScenario = unknown> extends BaseAlgorithmViewConfig {
  readonly kind: 'call-tree-lab';
  readonly presetOptions: readonly CallTreeLabPresetOption[];
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
  | TreeAlgorithmViewConfig<any>
  | NumberLabAlgorithmViewConfig<any>
  | PointerLabAlgorithmViewConfig<any>
  | SieveGridAlgorithmViewConfig<any>
  | CallStackLabAlgorithmViewConfig<any>
  | CallTreeLabAlgorithmViewConfig<any>;

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

const AHO_CORASICK_VIEW_CONFIG = createStringViewConfig<AhoCorasickScenario>({
  codeLines: AHO_CORASICK_CODE,
  codeRegions: AHO_CORASICK_CODE_REGIONS,
  codeHighlightMap: AHO_CORASICK_CODE_HIGHLIGHT_MAP,
  codeVariants: AHO_CORASICK_CODE_VARIANTS,
  createScenario: (size, presetId) => createAhoCorasickScenario(size, presetId),
  generator: ahoCorasickGenerator,
  presetOptions: AHO_CORASICK_PRESETS,
  sizeOptions: [12, 18, 24],
  defaultSize: 18,
  sizeUnit: 'text chars',
  randomizeLabel: 'New string case',
});

const SUFFIX_ARRAY_VIEW_CONFIG = createStringViewConfig<SuffixArrayScenario>({
  codeLines: SUFFIX_ARRAY_CONSTRUCTION_CODE,
  codeRegions: SUFFIX_ARRAY_CONSTRUCTION_CODE_REGIONS,
  codeHighlightMap: SUFFIX_ARRAY_CONSTRUCTION_CODE_HIGHLIGHT_MAP,
  codeVariants: SUFFIX_ARRAY_CONSTRUCTION_CODE_VARIANTS,
  createScenario: (size, presetId) => createSuffixArrayScenario(size, presetId),
  generator: suffixArrayConstructionGenerator,
  presetOptions: SUFFIX_ARRAY_PRESETS,
  sizeOptions: [8, 12, 16],
  defaultSize: 12,
  sizeUnit: 'chars',
  randomizeLabel: 'New string case',
});

const SUFFIX_ARRAY_LCP_VIEW_CONFIG = createStringViewConfig<SuffixArrayLcpScenario>({
  codeLines: SUFFIX_ARRAY_LCP_KASAI_CODE,
  codeRegions: SUFFIX_ARRAY_LCP_KASAI_CODE_REGIONS,
  codeHighlightMap: SUFFIX_ARRAY_LCP_KASAI_CODE_HIGHLIGHT_MAP,
  codeVariants: SUFFIX_ARRAY_LCP_KASAI_CODE_VARIANTS,
  createScenario: (size, presetId) => createSuffixArrayLcpScenario(size, presetId),
  generator: suffixArrayLcpKasaiGenerator,
  presetOptions: SUFFIX_ARRAY_LCP_PRESETS,
  sizeOptions: [8, 12, 16],
  defaultSize: 12,
  sizeUnit: 'chars',
  randomizeLabel: 'New string case',
});

const PALINDROMIC_TREE_VIEW_CONFIG = createStringViewConfig<PalindromicTreeScenario>({
  codeLines: PALINDROMIC_TREE_CODE,
  codeRegions: PALINDROMIC_TREE_CODE_REGIONS,
  codeHighlightMap: PALINDROMIC_TREE_CODE_HIGHLIGHT_MAP,
  codeVariants: PALINDROMIC_TREE_CODE_VARIANTS,
  createScenario: (size, presetId) => createPalindromicTreeScenario(size, presetId),
  generator: palindromicTreeGenerator,
  presetOptions: PALINDROMIC_TREE_PRESETS,
  sizeOptions: [8, 12, 16],
  defaultSize: 12,
  sizeUnit: 'chars',
  randomizeLabel: 'New string case',
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

const FIBONACCI_ITER_VIEW_CONFIG: AlgorithmViewConfig = {
  kind: 'number-lab',
  codeLines: FIBONACCI_CODE,
  codeRegions: FIBONACCI_CODE_REGIONS,
  codeHighlightMap: FIBONACCI_CODE_HIGHLIGHT_MAP,
  codeVariants: FIBONACCI_CODE_VARIANTS,
  variantOptions: NUMBER_LAB_VARIANT_OPTIONS,
  defaultVariant: 'number-lab',
  sizeOptions: [6, 10, 15],
  defaultSize: 10,
  sizeUnit: 'iterations',
  randomizeLabel: 'New Fibonacci run',
  legendItems: () => [],
  presetOptions: FIBONACCI_ITER_PRESETS,
  defaultPresetId: DEFAULT_FIBONACCI_ITER_PRESET_ID,
  createScenario: (size, presetId) => createFibonacciIterScenario(size, presetId),
  generator: fibonacciIterativeGenerator,
};

const FACTORIAL_VIEW_CONFIG: AlgorithmViewConfig = {
  kind: 'number-lab',
  codeLines: FACTORIAL_CODE,
  codeRegions: FACTORIAL_CODE_REGIONS,
  codeHighlightMap: FACTORIAL_CODE_HIGHLIGHT_MAP,
  codeVariants: FACTORIAL_CODE_VARIANTS,
  variantOptions: NUMBER_LAB_VARIANT_OPTIONS,
  defaultVariant: 'number-lab',
  sizeOptions: [4, 6, 10],
  defaultSize: 6,
  sizeUnit: 'iterations',
  randomizeLabel: 'New factorial run',
  legendItems: () => [],
  presetOptions: FACTORIAL_PRESETS,
  defaultPresetId: DEFAULT_FACTORIAL_PRESET_ID,
  createScenario: (size, presetId) => createFactorialScenario(size, presetId),
  generator: factorialGenerator,
};

const EUCLIDEAN_GCD_VIEW_CONFIG: NumberLabAlgorithmViewConfig<
  EuclideanGcdScenario,
  EuclideanGcdValues
> = {
  kind: 'number-lab',
  codeLines: EUCLIDEAN_GCD_CODE,
  codeRegions: EUCLIDEAN_GCD_CODE_REGIONS,
  codeHighlightMap: EUCLIDEAN_GCD_CODE_HIGHLIGHT_MAP,
  codeVariants: EUCLIDEAN_GCD_CODE_VARIANTS,
  variantOptions: NUMBER_LAB_WITH_SCRATCHPAD_VARIANT_OPTIONS,
  defaultVariant: 'scratchpad-lab',
  /* Size has no meaning here — the (a, b) pair comes from the task
   *  picker + customize-values popover. Single-option hides the
   *  toolbar's size select. */
  sizeOptions: [1],
  defaultSize: 1,
  sizeUnit: 'scenario',
  randomizeLabel: 'New GCD pair',
  legendItems: () => [],
  /* `presetOptions` stays populated for now so the legacy scratchpad
   *  per-viz picker keeps working during migration; once the toolbar
   *  task picker is live it'll be hidden via an empty array at the
   *  algorithm-detail level. */
  presetOptions: EUCLIDEAN_GCD_PRESETS,
  defaultPresetId: DEFAULT_EUCLIDEAN_GCD_PRESET_ID,
  tasks: EUCLIDEAN_GCD_TASKS,
  defaultTaskId: DEFAULT_EUCLIDEAN_GCD_TASK_ID,
  createScenario: (size, presetId, customValues) =>
    createEuclideanGcdScenario(size, presetId, customValues),
  generator: euclideanGcdGenerator,
};

/** Extended Euclidean — chalkboard-only. Two-phase derivation (forward
 *  division chain + back-substitution for Bézout coefficients) is the
 *  whole pedagogical story; a register dashboard would have nothing
 *  interesting to add. Reuses the `number-lab` kind dispatcher so the
 *  rebuild logic can wire the scenario factory + generator exactly
 *  like other (a, b)-pair algorithms. */
const EXTENDED_EUCLIDEAN_VIEW_CONFIG: NumberLabAlgorithmViewConfig<
  ExtendedEuclideanScenario,
  ExtendedEuclideanValues
> = {
  kind: 'number-lab',
  codeLines: EXTENDED_EUCLIDEAN_CODE,
  codeRegions: EXTENDED_EUCLIDEAN_CODE_REGIONS,
  codeHighlightMap: EXTENDED_EUCLIDEAN_CODE_HIGHLIGHT_MAP,
  codeVariants: EXTENDED_EUCLIDEAN_CODE_VARIANTS,
  variantOptions: SCRATCHPAD_LAB_ONLY_VARIANT_OPTIONS,
  defaultVariant: 'scratchpad-lab',
  /* Size has no meaning here — the (a, b) pair comes from the task
   *  picker + customize-values popover. */
  sizeOptions: [1],
  defaultSize: 1,
  sizeUnit: 'scenario',
  randomizeLabel: 'New pair',
  legendItems: () => [],
  presetOptions: EXTENDED_EUCLIDEAN_PRESETS,
  defaultPresetId: DEFAULT_EXTENDED_EUCLIDEAN_PRESET_ID,
  tasks: EXTENDED_EUCLIDEAN_TASKS,
  defaultTaskId: DEFAULT_EXTENDED_EUCLIDEAN_TASK_ID,
  createScenario: (size, presetId, customValues) =>
    createExtendedEuclideanScenario(size, presetId, customValues),
  generator: extendedEuclideanGenerator,
};

/** Miller-Rabin primality — chalkboard-only. Decomposition of `n - 1`
 *  into `2^r · d`, then per-witness square chain. No code snippet yet
 *  (`codeSnippetId: null` on each task triggers the editorial
 *  placeholder). Registered under the `number-lab` view-config kind
 *  so the rebuild path shares wiring with other scratchpad notebooks. */
const MILLER_RABIN_VIEW_CONFIG: NumberLabAlgorithmViewConfig<
  MillerRabinScenario,
  MillerRabinValues
> = {
  kind: 'number-lab',
  codeLines: [],
  codeRegions: [],
  codeVariants: {},
  variantOptions: SCRATCHPAD_LAB_ONLY_VARIANT_OPTIONS,
  defaultVariant: 'scratchpad-lab',
  sizeOptions: [1],
  defaultSize: 1,
  sizeUnit: 'scenario',
  randomizeLabel: 'New candidate',
  legendItems: () => [],
  presetOptions: MILLER_RABIN_PRESETS,
  defaultPresetId: DEFAULT_MILLER_RABIN_PRESET_ID,
  tasks: MILLER_RABIN_TASKS,
  defaultTaskId: DEFAULT_MILLER_RABIN_TASK_ID,
  createScenario: (size, presetId, customValues) =>
    createMillerRabinScenario(size, presetId, customValues),
  generator: millerRabinGenerator,
};

/** Chinese Remainder Theorem — chalkboard-only. Systematic residue
 *  reconstruction: product of moduli, per-term `Mᵢ · yᵢ · rᵢ`, sum,
 *  reduce. `codeSnippetId: null` on each task triggers the editorial
 *  placeholder on the Code tab. */
const CRT_VIEW_CONFIG: NumberLabAlgorithmViewConfig<CrtScenario, CrtValues> = {
  kind: 'number-lab',
  codeLines: [],
  codeRegions: [],
  codeVariants: {},
  variantOptions: SCRATCHPAD_LAB_ONLY_VARIANT_OPTIONS,
  defaultVariant: 'scratchpad-lab',
  sizeOptions: [1],
  defaultSize: 1,
  sizeUnit: 'scenario',
  randomizeLabel: 'New system',
  legendItems: () => [],
  presetOptions: CRT_PRESETS,
  defaultPresetId: DEFAULT_CRT_PRESET_ID,
  tasks: CRT_TASKS,
  defaultTaskId: DEFAULT_CRT_TASK_ID,
  createScenario: (size, presetId, customValues) =>
    createCrtScenario(size, presetId, customValues),
  generator: crtGenerator,
};

/** Pollard's rho factorization — chalkboard-only. Tortoise-hare
 *  iteration table: each row records `(x, y, |x-y|, gcd)` until a
 *  non-trivial factor drops out or the pointers collide without one.
 *  `codeSnippetId: null` triggers the editorial placeholder. */
const POLLARDS_RHO_VIEW_CONFIG: NumberLabAlgorithmViewConfig<
  PollardsRhoScenario,
  PollardsRhoValues
> = {
  kind: 'number-lab',
  codeLines: [],
  codeRegions: [],
  codeVariants: {},
  variantOptions: SCRATCHPAD_LAB_ONLY_VARIANT_OPTIONS,
  defaultVariant: 'scratchpad-lab',
  sizeOptions: [1],
  defaultSize: 1,
  sizeUnit: 'scenario',
  randomizeLabel: 'New composite',
  legendItems: () => [],
  presetOptions: POLLARDS_RHO_PRESETS,
  defaultPresetId: DEFAULT_POLLARDS_RHO_PRESET_ID,
  tasks: POLLARDS_RHO_TASKS,
  defaultTaskId: DEFAULT_POLLARDS_RHO_TASK_ID,
  createScenario: (size, presetId, customValues) =>
    createPollardsRhoScenario(size, presetId, customValues),
  generator: pollardsRhoGenerator,
};

/** Gaussian elimination — chalkboard-only. Matrix snapshots render
 *  as KaTeX `\left[\begin{array}...|c\end{array}\right]` blocks, one
 *  per row operation (swap / scale / eliminate). No code snippet yet
 *  — each task carries `codeSnippetId: null` so the Code tab shows
 *  the editorial placeholder. */
const GAUSSIAN_ELIMINATION_VIEW_CONFIG: NumberLabAlgorithmViewConfig<
  GaussianEliminationScenario,
  GaussianEliminationValues
> = {
  kind: 'number-lab',
  codeLines: [],
  codeRegions: [],
  codeVariants: {},
  variantOptions: SCRATCHPAD_LAB_ONLY_VARIANT_OPTIONS,
  defaultVariant: 'scratchpad-lab',
  sizeOptions: [1],
  defaultSize: 1,
  sizeUnit: 'scenario',
  randomizeLabel: 'New system',
  legendItems: () => [],
  presetOptions: GAUSSIAN_ELIMINATION_PRESETS,
  defaultPresetId: DEFAULT_GAUSSIAN_ELIMINATION_PRESET_ID,
  tasks: GAUSSIAN_ELIMINATION_TASKS,
  defaultTaskId: DEFAULT_GAUSSIAN_ELIMINATION_TASK_ID,
  createScenario: (size, presetId, customValues) =>
    createGaussianEliminationScenario(size, presetId, customValues),
  generator: gaussianEliminationGenerator,
};

/** Simplex algorithm — chalkboard-only. Tableau snapshots as
 *  augmented-matrix KaTeX blocks, one per pivot, with the basis
 *  annotated alongside so students track which variable sits in
 *  which row. Shares the matrix-rendering approach with Gaussian
 *  elimination. */
const SIMPLEX_ALGORITHM_VIEW_CONFIG: NumberLabAlgorithmViewConfig<
  SimplexAlgorithmScenario,
  SimplexAlgorithmValues
> = {
  kind: 'number-lab',
  codeLines: [],
  codeRegions: [],
  codeVariants: {},
  variantOptions: SCRATCHPAD_LAB_ONLY_VARIANT_OPTIONS,
  defaultVariant: 'scratchpad-lab',
  sizeOptions: [1],
  defaultSize: 1,
  sizeUnit: 'scenario',
  randomizeLabel: 'New LP',
  legendItems: () => [],
  presetOptions: SIMPLEX_ALGORITHM_PRESETS,
  defaultPresetId: DEFAULT_SIMPLEX_ALGORITHM_PRESET_ID,
  tasks: SIMPLEX_ALGORITHM_TASKS,
  defaultTaskId: DEFAULT_SIMPLEX_ALGORITHM_TASK_ID,
  createScenario: (size, presetId, customValues) =>
    createSimplexAlgorithmScenario(size, presetId, customValues),
  generator: simplexAlgorithmGenerator,
};

const TWO_POINTERS_VIEW_CONFIG: PointerLabAlgorithmViewConfig<
  TwoPointersScenario,
  TwoPointersValues
> = {
  kind: 'pointer-lab',
  codeLines: TWO_POINTERS_CODE,
  codeRegions: TWO_POINTERS_CODE_REGIONS,
  codeHighlightMap: TWO_POINTERS_CODE_HIGHLIGHT_MAP,
  codeVariants: TWO_POINTERS_CODE_VARIANTS,
  variantOptions: POINTER_LAB_VARIANT_OPTIONS,
  defaultVariant: 'pointer-lab',
  sizeOptions: [1],
  defaultSize: 1,
  sizeUnit: 'elements',
  randomizeLabel: 'New sorted array',
  legendItems: () => [],
  presetOptions: TWO_POINTERS_PRESETS,
  defaultPresetId: DEFAULT_TWO_POINTERS_PRESET_ID,
  tasks: TWO_POINTERS_TASKS,
  defaultTaskId: DEFAULT_TWO_POINTERS_TASK_ID,
  createScenario: (size, presetId, customValues) =>
    createTwoPointersScenario(size, presetId, customValues),
  generator: twoPointersGenerator,
};

const SLIDING_WINDOW_VIEW_CONFIG: PointerLabAlgorithmViewConfig<
  SlidingWindowScenario,
  SlidingWindowValues
> = {
  kind: 'pointer-lab',
  codeLines: SLIDING_WINDOW_CODE,
  codeRegions: SLIDING_WINDOW_CODE_REGIONS,
  codeHighlightMap: SLIDING_WINDOW_CODE_HIGHLIGHT_MAP,
  codeVariants: SLIDING_WINDOW_CODE_VARIANTS,
  variantOptions: POINTER_LAB_VARIANT_OPTIONS,
  defaultVariant: 'pointer-lab',
  sizeOptions: [1],
  defaultSize: 1,
  sizeUnit: 'elements',
  randomizeLabel: 'New stream',
  legendItems: () => [],
  presetOptions: SLIDING_WINDOW_PRESETS,
  defaultPresetId: DEFAULT_SLIDING_WINDOW_PRESET_ID,
  tasks: SLIDING_WINDOW_TASKS,
  defaultTaskId: DEFAULT_SLIDING_WINDOW_TASK_ID,
  createScenario: (size, presetId, customValues) =>
    createSlidingWindowScenario(size, presetId, customValues),
  generator: slidingWindowGenerator,
};

const PALINDROME_VIEW_CONFIG: PointerLabAlgorithmViewConfig<
  PalindromeCheckScenario,
  PalindromeValues
> = {
  kind: 'pointer-lab',
  codeLines: PALINDROME_CODE,
  codeRegions: PALINDROME_CODE_REGIONS,
  codeHighlightMap: PALINDROME_CODE_HIGHLIGHT_MAP,
  codeVariants: PALINDROME_CODE_VARIANTS,
  variantOptions: POINTER_LAB_VARIANT_OPTIONS,
  defaultVariant: 'pointer-lab',
  sizeOptions: [1],
  defaultSize: 1,
  sizeUnit: 'characters',
  randomizeLabel: 'New word',
  legendItems: () => [],
  presetOptions: PALINDROME_PRESETS,
  defaultPresetId: DEFAULT_PALINDROME_PRESET_ID,
  tasks: PALINDROME_TASKS,
  defaultTaskId: DEFAULT_PALINDROME_TASK_ID,
  createScenario: (size, presetId, customValues) =>
    createPalindromeScenario(size, presetId, customValues),
  generator: palindromeCheckGenerator,
};

const REVERSE_VIEW_CONFIG: PointerLabAlgorithmViewConfig<
  ReverseScenario,
  ReverseValues
> = {
  kind: 'pointer-lab',
  codeLines: REVERSE_CODE,
  codeRegions: REVERSE_CODE_REGIONS,
  codeHighlightMap: REVERSE_CODE_HIGHLIGHT_MAP,
  codeVariants: REVERSE_CODE_VARIANTS,
  variantOptions: POINTER_LAB_VARIANT_OPTIONS,
  defaultVariant: 'pointer-lab',
  sizeOptions: [1],
  defaultSize: 1,
  sizeUnit: 'elements',
  randomizeLabel: 'New sequence',
  legendItems: () => [],
  presetOptions: REVERSE_PRESETS,
  defaultPresetId: DEFAULT_REVERSE_PRESET_ID,
  tasks: REVERSE_TASKS,
  defaultTaskId: DEFAULT_REVERSE_TASK_ID,
  createScenario: (size, presetId, customValues) =>
    createReverseScenario(size, presetId, customValues),
  generator: reverseStringArrayGenerator,
};

const KADANE_VIEW_CONFIG: PointerLabAlgorithmViewConfig<
  KadaneScenario,
  KadaneValues
> = {
  kind: 'pointer-lab',
  codeLines: KADANE_CODE,
  codeRegions: KADANE_CODE_REGIONS,
  codeHighlightMap: KADANE_CODE_HIGHLIGHT_MAP,
  codeVariants: KADANE_CODE_VARIANTS,
  variantOptions: POINTER_LAB_VARIANT_OPTIONS,
  defaultVariant: 'pointer-lab',
  sizeOptions: [1],
  defaultSize: 1,
  sizeUnit: 'elements',
  randomizeLabel: 'New sequence',
  legendItems: () => [],
  presetOptions: KADANE_PRESETS,
  defaultPresetId: DEFAULT_KADANE_PRESET_ID,
  tasks: KADANE_TASKS,
  defaultTaskId: DEFAULT_KADANE_TASK_ID,
  createScenario: (size, presetId, customValues) =>
    createKadaneScenario(size, presetId, customValues),
  generator: kadaneGenerator,
};

const SIEVE_OF_ERATOSTHENES_VIEW_CONFIG: SieveGridAlgorithmViewConfig<
  SieveEratosthenesScenario,
  EratosthenesValues
> = {
  kind: 'sieve-grid',
  codeLines: SIEVE_OF_ERATOSTHENES_CODE,
  codeRegions: SIEVE_OF_ERATOSTHENES_CODE_REGIONS,
  codeHighlightMap: SIEVE_OF_ERATOSTHENES_CODE_HIGHLIGHT_MAP,
  codeVariants: SIEVE_OF_ERATOSTHENES_CODE_VARIANTS,
  variantOptions: SIEVE_GRID_VARIANT_OPTIONS,
  defaultVariant: 'sieve-grid',
  /* `upper` now lives on the task — the size select becomes redundant,
   *  so we collapse to a single option which the toolbar auto-hides. */
  sizeOptions: [1],
  defaultSize: 1,
  sizeUnit: 'integers',
  randomizeLabel: 'New range',
  legendItems: () => [],
  presetOptions: ERATOSTHENES_PRESETS,
  defaultPresetId: DEFAULT_ERATOSTHENES_PRESET_ID,
  tasks: ERATOSTHENES_TASKS,
  defaultTaskId: DEFAULT_ERATOSTHENES_TASK_ID,
  createScenario: (size, presetId, customValues) =>
    createEratosthenesScenario(size, presetId, customValues),
  generator: sieveOfEratosthenesGenerator,
};

const RECURSION_CALL_STACK_VIEW_CONFIG: AlgorithmViewConfig = {
  kind: 'call-stack-lab',
  codeLines: RECURSION_CALL_STACK_CODE,
  codeRegions: RECURSION_CALL_STACK_CODE_REGIONS,
  codeHighlightMap: RECURSION_CALL_STACK_CODE_HIGHLIGHT_MAP,
  codeVariants: RECURSION_CALL_STACK_CODE_VARIANTS,
  variantOptions: CALL_STACK_LAB_VARIANT_OPTIONS,
  defaultVariant: 'call-stack-lab',
  sizeOptions: [3, 4, 5, 6, 7],
  defaultSize: 5,
  sizeUnit: 'n',
  randomizeLabel: 'New depth',
  legendItems: () => [],
  presetOptions: RECURSIVE_FIBONACCI_PRESETS,
  defaultPresetId: DEFAULT_RECURSIVE_FIBONACCI_PRESET_ID,
  createScenario: (size, presetId) => createRecursiveFibonacciScenario(size, presetId),
  generator: recursionCallStackGenerator,
};

const BACKTRACKING_VIEW_CONFIG: AlgorithmViewConfig = {
  kind: 'call-tree-lab',
  codeLines: BACKTRACKING_CODE,
  codeRegions: BACKTRACKING_CODE_REGIONS,
  codeHighlightMap: BACKTRACKING_CODE_HIGHLIGHT_MAP,
  codeVariants: BACKTRACKING_CODE_VARIANTS,
  variantOptions: CALL_TREE_LAB_VARIANT_OPTIONS,
  defaultVariant: 'call-tree-lab',
  sizeOptions: [4, 5, 6],
  defaultSize: 5,
  sizeUnit: 'board',
  randomizeLabel: 'New scenario',
  legendItems: () => [],
  presetOptions: N_QUEENS_PRESETS,
  defaultPresetId: DEFAULT_N_QUEENS_PRESET_ID,
  createScenario: (size, presetId) => createNQueensScenario(size, presetId),
  generator: backtrackingGenerator,
};

const MINIMAX_ALPHA_BETA_VIEW_CONFIG: AlgorithmViewConfig = {
  kind: 'call-tree-lab',
  codeLines: MINIMAX_ALPHA_BETA_CODE,
  codeRegions: MINIMAX_ALPHA_BETA_CODE_REGIONS,
  codeHighlightMap: MINIMAX_ALPHA_BETA_CODE_HIGHLIGHT_MAP,
  codeVariants: MINIMAX_ALPHA_BETA_CODE_VARIANTS,
  variantOptions: CALL_TREE_LAB_VARIANT_OPTIONS,
  defaultVariant: 'call-tree-lab',
  sizeOptions: [8, 9, 16],
  defaultSize: 9,
  sizeUnit: 'leaves',
  randomizeLabel: 'New game tree',
  legendItems: () => [],
  presetOptions: MINIMAX_PRESETS,
  defaultPresetId: DEFAULT_MINIMAX_PRESET_ID,
  createScenario: (size, presetId) => createMinimaxScenario(size, presetId),
  generator: minimaxAlphaBetaGenerator,
};

const MCTS_VIEW_CONFIG: AlgorithmViewConfig = {
  kind: 'call-tree-lab',
  codeLines: MCTS_CODE,
  codeRegions: MCTS_CODE_REGIONS,
  codeHighlightMap: MCTS_CODE_HIGHLIGHT_MAP,
  codeVariants: MCTS_CODE_VARIANTS,
  variantOptions: CALL_TREE_LAB_VARIANT_OPTIONS,
  defaultVariant: 'call-tree-lab',
  sizeOptions: [6, 10, 12],
  defaultSize: 10,
  sizeUnit: 'iterations',
  randomizeLabel: 'New playout',
  legendItems: () => [],
  presetOptions: MCTS_PRESETS,
  defaultPresetId: DEFAULT_MCTS_PRESET_ID,
  createScenario: (size, presetId) => createMcTsScenario(size, presetId),
  generator: mctsGenerator,
};

const TREE_TRAVERSALS_VIEW_CONFIG: TreeAlgorithmViewConfig<
  TreeTraversalScenario,
  TreeTraversalValues
> = {
  kind: 'tree',
  codeLines: TREE_TRAVERSALS_CODE,
  codeRegions: TREE_TRAVERSALS_CODE_REGIONS,
  codeHighlightMap: TREE_TRAVERSALS_CODE_HIGHLIGHT_MAP,
  codeVariants: TREE_TRAVERSALS_CODE_VARIANTS,
  variantOptions: TREE_TRAVERSALS_VARIANT_OPTIONS,
  defaultVariant: 'tree',
  /* Size (tree depth) stays as an independent scale knob in the
   *  toolbar — tasks only name the traversal order + tree shape. */
  sizeOptions: [7, 15, 31],
  defaultSize: 15,
  sizeUnit: 'nodes',
  randomizeLabel: 'New tree shape',
  legendItems: () => [],
  presetOptions: TREE_TRAVERSALS_PRESETS,
  defaultPresetId: DEFAULT_TREE_TRAVERSALS_PRESET_ID,
  tasks: TREE_TRAVERSALS_TASKS,
  defaultTaskId: DEFAULT_TREE_TRAVERSALS_TASK_ID,
  createScenario: (size, presetId, customValues) =>
    createTreeTraversalScenario(size, presetId, customValues),
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
  if (id === 'aho-corasick') return AHO_CORASICK_VIEW_CONFIG;
  if (id === 'manacher') return MANACHER_VIEW_CONFIG;
  if (id === 'suffix-array-construction') return SUFFIX_ARRAY_VIEW_CONFIG;
  if (id === 'suffix-array-lcp-kasai') return SUFFIX_ARRAY_LCP_VIEW_CONFIG;
  if (id === 'palindromic-tree') return PALINDROMIC_TREE_VIEW_CONFIG;
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
  if (id === 'fibonacci-iterative') return FIBONACCI_ITER_VIEW_CONFIG;
  if (id === 'factorial') return FACTORIAL_VIEW_CONFIG;
  if (id === 'euclidean-gcd') return EUCLIDEAN_GCD_VIEW_CONFIG;
  if (id === 'extended-euclidean') return EXTENDED_EUCLIDEAN_VIEW_CONFIG;
  if (id === 'miller-rabin') return MILLER_RABIN_VIEW_CONFIG;
  if (id === 'chinese-remainder-theorem') return CRT_VIEW_CONFIG;
  if (id === 'pollards-rho') return POLLARDS_RHO_VIEW_CONFIG;
  if (id === 'gaussian-elimination') return GAUSSIAN_ELIMINATION_VIEW_CONFIG;
  if (id === 'simplex-algorithm') return SIMPLEX_ALGORITHM_VIEW_CONFIG;
  if (id === 'two-pointers') return TWO_POINTERS_VIEW_CONFIG;
  if (id === 'sliding-window') return SLIDING_WINDOW_VIEW_CONFIG;
  if (id === 'palindrome-check') return PALINDROME_VIEW_CONFIG;
  if (id === 'reverse-string-array') return REVERSE_VIEW_CONFIG;
  if (id === 'kadane') return KADANE_VIEW_CONFIG;
  if (id === 'sieve-of-eratosthenes') return SIEVE_OF_ERATOSTHENES_VIEW_CONFIG;
  if (id === 'recursion-call-stack') return RECURSION_CALL_STACK_VIEW_CONFIG;
  if (id === 'backtracking') return BACKTRACKING_VIEW_CONFIG;
  if (id === 'minimax-alpha-beta') return MINIMAX_ALPHA_BETA_VIEW_CONFIG;
  if (id === 'monte-carlo-tree-search') return MCTS_VIEW_CONFIG;
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
