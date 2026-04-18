import { AlgorithmItem } from '../models/algorithm';
import {
  BIPARTITE_EDGES,
  BIPARTITE_NODES,
  DAG_EDGES,
  DAG_NODES,
  GRAPH_RING,
  GRAPH_RING_EDGES,
  NETWORK_EDGES,
  NETWORK_NODES,
  PAINT,
  TREE_EDGES,
  TREE_NODES,
  PreviewSpec,
  barScene,
  circle,
  edgeKey,
  graphScene,
  line,
  matrixScene,
  mergeSpecs,
  path,
  pointsScene,
  polylinePath,
  rect,
  stripScene,
} from './algorithm-card-preview-spec.shared';

const SORTING_VARIANTS: Record<string, string> = {
  'bubble-sort': 'bubble',
  'selection-sort': 'selection',
  'insertion-sort': 'insertion',
  'counting-sort': 'counting',
  'merge-sort': 'merge',
  'quick-sort': 'quick',
  'heap-sort': 'heap',
  'radix-sort': 'radix',
  'bucket-sort': 'bucket',
  'shell-sort': 'shell',
  'tim-sort': 'tim',
};

const SEARCH_VARIANTS: Record<string, string> = {
  'linear-search': 'linear',
  'binary-search': 'binary',
  'binary-search-variants': 'variants',
};

const GRAPH_VARIANTS: Record<string, string> = {
  'tree-traversals': 'tree-traversal',
  bfs: 'bfs',
  dfs: 'dfs',
  dijkstra: 'dijkstra',
  'topological-sort-kahn': 'topo',
  'cycle-detection': 'cycle',
  'connected-components': 'components',
  'union-find': 'union-find',
  'flood-fill': 'flood-fill',
  'bipartite-check': 'bipartite',
  'bellman-ford': 'bellman-ford',
  'floyd-warshall': 'floyd-warshall',
  'a-star-pathfinding': 'a-star',
  'prims-mst': 'prim',
  'kruskals-mst': 'kruskal',
  'tarjan-scc': 'tarjan',
  'kosaraju-scc': 'kosaraju',
  'bridges-articulation-points': 'bridges',
  'edmonds-karp': 'edmonds-karp',
  'hungarian-algorithm': 'hungarian',
  'euler-path-circuit': 'euler',
  'hopcroft-karp': 'hopcroft-karp',
  'dinic-max-flow': 'dinic',
  'min-cost-max-flow': 'min-cost-max-flow',
  'chromatic-number': 'chromatic',
  'steiner-tree': 'steiner',
  'dominator-tree': 'dominator',
};

const DP_VARIANTS: Record<string, string> = {
  'knapsack-01': 'knapsack',
  'longest-common-subsequence': 'lcs',
  'longest-increasing-subsequence': 'lis',
  'coin-change': 'coin-change',
  'edit-distance': 'edit-distance',
  'climbing-stairs': 'stairs',
  'matrix-chain-multiplication': 'matrix-chain',
  'fibonacci-dp': 'fibonacci-dp',
  'dp-on-trees': 'tree-dp',
  'dp-with-bitmask': 'bitmask',
  'longest-palindromic-subsequence': 'palindrome-subseq',
  'traveling-salesman-dp': 'tsp',
  'subset-sum': 'subset-sum',
  'burst-balloons': 'burst-balloons',
  'regex-matching-dp': 'regex',
  'wildcard-matching': 'wildcard',
  'dp-convex-hull-trick': 'cht',
  'divide-conquer-dp-optimization': 'dc-opt',
  'knuth-dp-optimization': 'knuth',
  'sos-dp': 'sos',
  'profile-dp': 'profile',
};

const STRING_VARIANTS: Record<string, string> = {
  'kmp-pattern-matching': 'kmp',
  'rabin-karp': 'rabin-karp',
  'z-algorithm': 'z-algorithm',
  'aho-corasick': 'aho-corasick',
  manacher: 'manacher',
  'suffix-array-construction': 'suffix-array',
  'suffix-array-lcp-kasai': 'suffix-lcp',
  'palindromic-tree': 'eertree',
  'burrows-wheeler-transform': 'bwt',
  'run-length-encoding': 'rle',
  'huffman-coding': 'huffman',
};

const GEOMETRY_VARIANTS: Record<string, string> = {
  'convex-hull': 'convex-hull',
  'line-intersection': 'line-intersection',
  'closest-pair-of-points': 'closest-pair',
  'sweep-line': 'sweep-line',
  'voronoi-diagram': 'voronoi',
  'delaunay-triangulation': 'delaunay',
  'minkowski-sum': 'minkowski',
  'half-plane-intersection': 'half-plane',
};

const MISC_VARIANTS: Record<string, string> = {
  'fibonacci-iterative': 'fib-iter',
  factorial: 'factorial',
  'euclidean-gcd': 'gcd',
  'sieve-of-eratosthenes': 'sieve',
  'two-pointers': 'two-pointers',
  'sliding-window': 'sliding-window',
  'palindrome-check': 'palindrome',
  'reverse-string-array': 'reverse',
  backtracking: 'backtracking',
  kadane: 'kadane',
  'recursion-call-stack': 'recursion',
  'minimax-alpha-beta': 'minimax',
  'monte-carlo-tree-search': 'mcts',
  'reservoir-sampling': 'reservoir',
  'fft-ntt': 'fft',
  'gaussian-elimination': 'gaussian',
  'simplex-algorithm': 'simplex',
  'miller-rabin': 'miller-rabin',
  'pollards-rho': 'pollards-rho',
  'chinese-remainder-theorem': 'crt',
  'extended-euclidean': 'extended-gcd',
};

type PreviewBuilder = (variant: string) => PreviewSpec;

interface PreviewRegistryEntry {
  readonly variants: Record<string, string>;
  readonly build: PreviewBuilder;
}

function buildSortingPreview(variant: string): PreviewSpec {
  switch (variant) {
    case 'bubble':
      return barScene(
        [34, 62, 46, 72, 54, 88, 66, 81],
        { 4: 'warm', 5: 'warm', 6: 'primary', 7: 'success' },
        {
          overlayLines: [
            line(162, 18, 189, 10, 'warm', { strokeWidth: 1.6 }),
            line(189, 10, 216, 18, 'warm', { strokeWidth: 1.6 }),
          ],
        },
      );
    case 'selection':
      return barScene(
        [28, 40, 52, 78, 64, 72, 34, 90],
        { 0: 'success', 1: 'success', 2: 'success', 4: 'primary', 6: 'warm' },
        { overlayLines: [line(196, 14, 196, 70, 'warm', { dasharray: '2 4' })] },
      );
    case 'insertion':
      return barScene(
        [24, 36, 48, 58, 74, 52, 80, 88],
        { 0: 'success', 1: 'success', 2: 'success', 3: 'success', 4: 'success', 5: 'warm' },
        {
          liftedIndex: 5,
          overlayLines: [line(158, 14, 158, 66, 'primary', { dasharray: '2 4', opacity: 0.9 })],
        },
      );
    case 'counting':
      return mergeSpecs(
        barScene([36, 52, 28, 68, 52, 44], { 1: 'warm', 3: 'primary', 4: 'warm' }),
        stripScene(
          5,
          { 0: 'cool', 1: 'success', 2: 'warm', 3: 'primary', 4: 'danger' },
          { x: 154, y: 42, size: 24, gap: 8 },
        ),
      );
    case 'merge':
      return mergeSpecs(
        barScene(
          [24, 42, 58, 72, 28, 46, 62, 80],
          { 0: 'cool', 1: 'cool', 2: 'cool', 3: 'cool', 4: 'warm', 5: 'warm', 6: 'warm', 7: 'warm' },
          { splitAfter: [4] },
        ),
        {
          rects: [
            rect(72, 14, 22, 10, 'success', { opacity: 0.9 }),
            rect(100, 14, 22, 14, 'success', { opacity: 0.9 }),
            rect(128, 14, 22, 18, 'success', { opacity: 0.9 }),
            rect(156, 14, 22, 24, 'success', { opacity: 0.9 }),
          ],
          lines: [],
          circles: [],
          paths: [],
        },
      );
    case 'quick':
      return barScene(
        [64, 28, 52, 72, 46, 84, 58, 36],
        { 0: 'success', 1: 'success', 2: 'success', 3: 'success', 4: 'primary', 5: 'warm', 6: 'warm', 7: 'warm' },
        { splitAfter: [4], overlayLines: [line(142, 10, 142, 70, 'primary', { dasharray: '2 4' })] },
      );
    case 'heap':
      return graphScene(
        TREE_NODES,
        TREE_EDGES,
        { r: 'primary', a: 'cool', b: 'cool', c: 'ghost', d: 'warm', e: 'ghost', f: 'success' },
        {
          [edgeKey('r', 'a')]: 'primary',
          [edgeKey('r', 'b')]: 'primary',
          [edgeKey('a', 'd')]: 'warm',
          [edgeKey('b', 'f')]: 'success',
        },
      );
    case 'radix':
      return mergeSpecs(
        matrixScene(
          3,
          4,
          {
            '0:0': 'primary',
            '0:1': 'warm',
            '0:2': 'cool',
            '0:3': 'success',
            '1:0': 'ghost',
            '1:1': 'primary',
            '1:2': 'warm',
            '1:3': 'cool',
            '2:0': 'success',
            '2:1': 'ghost',
            '2:2': 'primary',
            '2:3': 'warm',
          },
          { x: 34, y: 18, size: 18, gap: 6 },
        ),
        {
          rects: [
            rect(188, 16, 24, 40, 'ghost'),
            rect(220, 24, 24, 32, 'cool'),
            rect(252, 12, 24, 44, 'success'),
          ],
          lines: [
            line(156, 28, 188, 28, 'muted', { dasharray: '2 3' }),
            line(156, 50, 252, 50, 'muted', { dasharray: '2 3' }),
          ],
          circles: [],
          paths: [],
        },
      );
    case 'bucket':
      return {
        rects: [
          rect(36, 42, 70, 22, 'ghost'),
          rect(124, 34, 70, 30, 'primary'),
          rect(212, 24, 70, 40, 'success'),
        ],
        lines: [
          line(64, 20, 70, 42, 'warm'),
          line(92, 14, 150, 34, 'cool'),
          line(126, 18, 250, 24, 'success'),
        ],
        circles: [
          circle(64, 18, 4.5, 'warm'),
          circle(92, 12, 4.5, 'cool'),
          circle(126, 16, 4.5, 'success'),
        ],
        paths: [],
      };
    case 'shell':
      return barScene(
        [26, 58, 40, 80, 52, 70, 34, 88],
        { 0: 'primary', 4: 'primary', 1: 'warm', 5: 'warm', 2: 'cool', 6: 'cool' },
        {
          overlayLines: [
            line(34, 18, 142, 18, 'primary', { dasharray: '4 4' }),
            line(61, 12, 169, 12, 'warm', { dasharray: '4 4' }),
            line(88, 24, 196, 24, 'cool', { dasharray: '4 4' }),
          ],
        },
      );
    case 'tim':
      return mergeSpecs(
        barScene(
          [26, 34, 44, 56, 28, 38, 52, 68],
          { 0: 'success', 1: 'success', 2: 'success', 3: 'success', 4: 'cool', 5: 'cool', 6: 'cool', 7: 'cool' },
          { splitAfter: [4] },
        ),
        {
          rects: [
            rect(198, 18, 18, 44, 'primary'),
            rect(222, 12, 18, 50, 'primary'),
            rect(246, 8, 18, 54, 'primary'),
          ],
          lines: [line(162, 26, 198, 26, 'primary', { dasharray: '2 3' })],
          circles: [],
          paths: [],
        },
      );
    default:
      return barScene([34, 46, 58, 72, 54, 66, 80, 42], { 3: 'primary', 5: 'warm' });
  }
}

function buildSearchPreview(variant: string): PreviewSpec {
  switch (variant) {
    case 'linear':
      return mergeSpecs(
        stripScene(8, { 0: 'muted', 1: 'muted', 2: 'muted', 3: 'muted', 4: 'warm', 5: 'muted', 6: 'success', 7: 'muted' }),
        {
          rects: [rect(188, 10, 24, 38, 'warm', { opacity: 0.18 })],
          lines: [line(201, 12, 201, 54, 'warm', { dasharray: '2 3' })],
          circles: [circle(252, 48, 5, 'success')],
          paths: [],
        },
      );
    case 'binary':
      return mergeSpecs(
        stripScene(9, { 2: 'cool', 3: 'cool', 4: 'warm', 5: 'cool', 6: 'cool', 7: 'success' }),
        {
          rects: [rect(90, 14, 166, 30, 'primary', { opacity: 0.12, rx: 12 })],
          lines: [line(171, 12, 171, 56, 'warm', { dasharray: '3 3' })],
          circles: [],
          paths: [],
        },
      );
    case 'variants':
      return mergeSpecs(
        stripScene(9, { 2: 'primary', 3: 'primary', 4: 'warm', 5: 'success', 6: 'success' }),
        {
          rects: [rect(84, 14, 168, 30, 'cool', { opacity: 0.12, rx: 12 })],
          lines: [
            line(146, 10, 146, 56, 'primary', { dasharray: '2 4' }),
            line(202, 10, 202, 56, 'success', { dasharray: '2 4' }),
          ],
          circles: [],
          paths: [],
        },
      );
    default:
      return stripScene(8, { 4: 'primary' });
  }
}

function buildGraphPreview(variant: string): PreviewSpec {
  switch (variant) {
    case 'tree-traversal':
      return graphScene(
        TREE_NODES,
        TREE_EDGES,
        { r: 'primary', a: 'warm', d: 'success', b: 'ghost', e: 'muted', f: 'muted', c: 'cool' },
        {
          [edgeKey('r', 'a')]: 'primary',
          [edgeKey('a', 'd')]: 'success',
          [edgeKey('r', 'b')]: 'muted',
        },
      );
    case 'bfs':
      return mergeSpecs(
        graphScene(
          GRAPH_RING,
          GRAPH_RING_EDGES,
          { a: 'primary', b: 'cool', j: 'cool', c: 'success', i: 'success', d: 'ghost', h: 'ghost' },
          {
            [edgeKey('a', 'b')]: 'cool',
            [edgeKey('a', 'j')]: 'cool',
            [edgeKey('b', 'c')]: 'success',
            [edgeKey('j', 'i')]: 'success',
          },
        ),
        {
          rects: [],
          lines: [],
          circles: [circle(42, 44, 14, 'primary', { opacity: 0.08, strokeWidth: 0 })],
          paths: [],
        },
      );
    case 'dfs':
      return graphScene(
        GRAPH_RING,
        GRAPH_RING_EDGES,
        { a: 'primary', b: 'warm', c: 'warm', d: 'warm', e: 'success', h: 'cool' },
        {
          [edgeKey('a', 'b')]: 'warm',
          [edgeKey('b', 'c')]: 'warm',
          [edgeKey('c', 'd')]: 'warm',
          [edgeKey('d', 'e')]: 'success',
          [edgeKey('e', 'h')]: 'cool',
        },
      );
    case 'dijkstra':
      return graphScene(
        GRAPH_RING,
        GRAPH_RING_EDGES,
        { a: 'primary', b: 'cool', c: 'cool', d: 'success', e: 'success', h: 'warm' },
        {
          [edgeKey('a', 'b')]: 'primary',
          [edgeKey('b', 'c')]: 'cool',
          [edgeKey('c', 'd')]: 'success',
          [edgeKey('d', 'e')]: 'success',
          [edgeKey('e', 'h')]: 'warm',
        },
      );
    case 'topo':
      return graphScene(
        DAG_NODES,
        DAG_EDGES,
        { a: 'success', b: 'success', c: 'primary', d: 'cool', g: 'warm', h: 'ghost' },
        {
          [edgeKey('a', 'c')]: 'primary',
          [edgeKey('a', 'd')]: 'cool',
          [edgeKey('c', 'e')]: 'primary',
          [edgeKey('d', 'f')]: 'cool',
          [edgeKey('e', 'g')]: 'warm',
          [edgeKey('g', 'h')]: 'success',
        },
      );
    case 'cycle':
      return graphScene(
        GRAPH_RING,
        GRAPH_RING_EDGES,
        { c: 'danger', d: 'danger', e: 'danger', h: 'danger' },
        {
          [edgeKey('c', 'd')]: 'danger',
          [edgeKey('d', 'e')]: 'danger',
          [edgeKey('e', 'h')]: 'danger',
          [edgeKey('c', 'h')]: 'danger',
        },
      );
    case 'components':
      return graphScene(
        GRAPH_RING,
        GRAPH_RING_EDGES,
        { a: 'primary', b: 'primary', c: 'primary', j: 'primary', d: 'success', e: 'success', f: 'success', g: 'success', h: 'success', i: 'success' },
        {
          [edgeKey('a', 'b')]: 'primary',
          [edgeKey('a', 'j')]: 'primary',
          [edgeKey('b', 'c')]: 'primary',
          [edgeKey('d', 'e')]: 'success',
          [edgeKey('e', 'f')]: 'success',
          [edgeKey('f', 'g')]: 'success',
          [edgeKey('e', 'h')]: 'success',
          [edgeKey('h', 'i')]: 'success',
        },
      );
    case 'union-find':
      return graphScene(
        TREE_NODES,
        TREE_EDGES,
        { r: 'primary', a: 'primary', b: 'success', c: 'ghost', d: 'warm', e: 'success', f: 'success' },
        {
          [edgeKey('r', 'a')]: 'primary',
          [edgeKey('a', 'c')]: 'ghost',
          [edgeKey('a', 'd')]: 'warm',
          [edgeKey('r', 'b')]: 'success',
          [edgeKey('b', 'e')]: 'success',
          [edgeKey('b', 'f')]: 'success',
        },
        { lines: [line(136, 58, 160, 14, 'warm', { dasharray: '2 3', opacity: 0.8 })] },
      );
    case 'flood-fill':
      return mergeSpecs(
        matrixScene(
          4,
          6,
          {
            '0:0': 'primary',
            '0:1': 'primary',
            '1:0': 'primary',
            '1:1': 'success',
            '1:2': 'success',
            '2:1': 'success',
            '2:2': 'warm',
            '3:4': 'danger',
          },
          { x: 44, y: 10, size: 18, gap: 4 },
        ),
        {
          rects: [],
          lines: [line(80, 28, 120, 44, 'success', { dasharray: '2 4' })],
          circles: [],
          paths: [],
        },
      );
    case 'bipartite':
      return graphScene(
        BIPARTITE_NODES,
        BIPARTITE_EDGES,
        { l1: 'primary', l2: 'primary', l3: 'primary', r1: 'warm', r2: 'warm', r3: 'warm' },
        {
          [edgeKey('l1', 'r1')]: 'success',
          [edgeKey('l2', 'r2')]: 'success',
          [edgeKey('l3', 'r3')]: 'success',
          [edgeKey('l1', 'r2')]: 'cool',
        },
      );
    case 'bellman-ford':
      return graphScene(
        DAG_NODES,
        DAG_EDGES,
        { a: 'primary', c: 'cool', f: 'danger', h: 'success' },
        {
          [edgeKey('a', 'c')]: 'primary',
          [edgeKey('c', 'f')]: 'danger',
          [edgeKey('f', 'g')]: 'success',
          [edgeKey('g', 'h')]: 'success',
        },
      );
    case 'floyd-warshall':
      return mergeSpecs(
        matrixScene(
          4,
          4,
          { '0:1': 'primary', '1:2': 'warm', '0:2': 'success', '2:3': 'cool', '1:1': 'ghost' },
          { x: 82, y: 10, size: 18, gap: 6 },
        ),
        {
          rects: [rect(136, 10, 18, 18, 'warm')],
          lines: [
            line(145, 28, 145, 70, 'warm', { dasharray: '2 4' }),
            line(82, 38, 250, 38, 'warm', { dasharray: '2 4' }),
          ],
          circles: [],
          paths: [],
        },
      );
    case 'a-star':
      return mergeSpecs(
        matrixScene(
          4,
          6,
          {
            '0:0': 'primary',
            '0:1': 'cool',
            '1:1': 'cool',
            '1:2': 'success',
            '2:2': 'success',
            '2:3': 'warm',
            '3:4': 'danger',
          },
          { x: 40, y: 10, size: 18, gap: 4 },
        ),
        {
          rects: [],
          lines: [
            line(52, 22, 78, 22, 'cool'),
            line(78, 22, 78, 44, 'cool'),
            line(78, 44, 104, 44, 'success'),
            line(104, 44, 104, 66, 'success'),
            line(104, 66, 130, 66, 'warm'),
          ],
          circles: [circle(182, 22, 7, 'warm', { opacity: 0.2, strokeWidth: 0 })],
          paths: [],
        },
      );
    case 'prim':
      return graphScene(
        GRAPH_RING,
        GRAPH_RING_EDGES,
        { a: 'primary', b: 'success', c: 'success', i: 'success', h: 'warm', e: 'cool' },
        {
          [edgeKey('a', 'b')]: 'success',
          [edgeKey('b', 'c')]: 'success',
          [edgeKey('c', 'i')]: 'success',
          [edgeKey('i', 'h')]: 'warm',
          [edgeKey('h', 'e')]: 'cool',
        },
      );
    case 'kruskal':
      return graphScene(
        GRAPH_RING,
        GRAPH_RING_EDGES,
        { a: 'primary', c: 'success', e: 'success', h: 'success', j: 'cool' },
        {
          [edgeKey('a', 'b')]: 'success',
          [edgeKey('b', 'c')]: 'success',
          [edgeKey('d', 'e')]: 'success',
          [edgeKey('e', 'h')]: 'success',
          [edgeKey('c', 'h')]: 'danger',
        },
      );
    case 'tarjan':
      return graphScene(
        GRAPH_RING,
        GRAPH_RING_EDGES,
        { c: 'primary', d: 'primary', h: 'primary', a: 'success', b: 'success', j: 'success' },
        {
          [edgeKey('c', 'd')]: 'primary',
          [edgeKey('c', 'h')]: 'primary',
          [edgeKey('h', 'i')]: 'primary',
          [edgeKey('a', 'b')]: 'success',
          [edgeKey('a', 'j')]: 'success',
        },
      );
    case 'kosaraju':
      return graphScene(
        GRAPH_RING,
        GRAPH_RING_EDGES,
        { e: 'primary', f: 'primary', g: 'primary', c: 'success', i: 'success', j: 'cool' },
        {
          [edgeKey('e', 'f')]: 'primary',
          [edgeKey('f', 'g')]: 'primary',
          [edgeKey('e', 'h')]: 'primary',
          [edgeKey('c', 'i')]: 'success',
          [edgeKey('i', 'j')]: 'success',
        },
      );
    case 'bridges':
      return graphScene(
        GRAPH_RING,
        GRAPH_RING_EDGES,
        { c: 'danger', h: 'danger', e: 'primary' },
        {
          [edgeKey('c', 'h')]: 'danger',
          [edgeKey('d', 'e')]: 'primary',
          [edgeKey('e', 'h')]: 'primary',
        },
      );
    case 'edmonds-karp':
      return graphScene(
        NETWORK_NODES,
        NETWORK_EDGES,
        { s: 'primary', u: 'cool', x: 'success', t: 'warm' },
        {
          [edgeKey('s', 'u')]: 'primary',
          [edgeKey('u', 'x')]: 'success',
          [edgeKey('x', 't')]: 'warm',
        },
      );
    case 'hungarian':
      return mergeSpecs(
        matrixScene(
          4,
          4,
          {
            '0:1': 'success',
            '1:3': 'success',
            '2:0': 'success',
            '3:2': 'success',
            '1:1': 'primary',
            '2:2': 'warm',
          },
          { x: 90, y: 12, size: 18, gap: 6 },
        ),
        {
          rects: [],
          lines: [
            line(120, 20, 146, 40, 'success'),
            line(146, 40, 172, 60, 'success'),
            line(120, 60, 198, 40, 'success'),
          ],
          circles: [],
          paths: [],
        },
      );
    case 'euler':
      return graphScene(
        GRAPH_RING,
        GRAPH_RING_EDGES,
        { a: 'primary', b: 'cool', c: 'cool', d: 'warm', e: 'warm', h: 'success', i: 'success', j: 'success' },
        {
          [edgeKey('a', 'b')]: 'primary',
          [edgeKey('b', 'c')]: 'cool',
          [edgeKey('c', 'h')]: 'cool',
          [edgeKey('h', 'i')]: 'success',
          [edgeKey('i', 'j')]: 'success',
          [edgeKey('a', 'j')]: 'success',
        },
      );
    case 'hopcroft-karp':
      return graphScene(
        BIPARTITE_NODES,
        BIPARTITE_EDGES,
        { l1: 'primary', l2: 'primary', l3: 'primary', r1: 'success', r2: 'success', r3: 'success' },
        {
          [edgeKey('l1', 'r2')]: 'cool',
          [edgeKey('l2', 'r3')]: 'success',
          [edgeKey('l3', 'r1')]: 'success',
        },
      );
    case 'dinic':
      return graphScene(
        NETWORK_NODES,
        NETWORK_EDGES,
        { s: 'primary', u: 'cool', v: 'cool', x: 'success', y: 'success', t: 'warm' },
        {
          [edgeKey('s', 'u')]: 'cool',
          [edgeKey('s', 'v')]: 'cool',
          [edgeKey('u', 'x')]: 'success',
          [edgeKey('v', 'y')]: 'success',
          [edgeKey('x', 't')]: 'warm',
          [edgeKey('y', 't')]: 'warm',
        },
      );
    case 'min-cost-max-flow':
      return graphScene(
        NETWORK_NODES,
        NETWORK_EDGES,
        { s: 'primary', u: 'cool', x: 'warm', y: 'success', t: 'danger' },
        {
          [edgeKey('s', 'u')]: 'primary',
          [edgeKey('u', 'y')]: 'warm',
          [edgeKey('y', 't')]: 'danger',
          [edgeKey('v', 'x')]: 'success',
        },
      );
    case 'chromatic':
      return graphScene(
        GRAPH_RING,
        GRAPH_RING_EDGES,
        { a: 'primary', b: 'cool', c: 'warm', d: 'success', e: 'danger', h: 'cool', i: 'success' },
        {},
      );
    case 'steiner':
      return graphScene(
        GRAPH_RING,
        GRAPH_RING_EDGES,
        { a: 'warm', e: 'warm', j: 'warm', c: 'success', h: 'success' },
        {
          [edgeKey('a', 'b')]: 'success',
          [edgeKey('b', 'c')]: 'success',
          [edgeKey('c', 'h')]: 'success',
          [edgeKey('e', 'h')]: 'success',
        },
        { circles: [circle(174, 18, 5.5, 'primary')] },
      );
    case 'dominator':
      return mergeSpecs(
        graphScene(
          DAG_NODES,
          DAG_EDGES,
          { a: 'primary', c: 'cool', e: 'success', g: 'warm', h: 'success' },
          {
            [edgeKey('a', 'c')]: 'cool',
            [edgeKey('c', 'e')]: 'success',
            [edgeKey('e', 'g')]: 'warm',
            [edgeKey('g', 'h')]: 'success',
          },
        ),
        {
          rects: [],
          lines: [
            line(44, 20, 180, 20, 'primary', { dasharray: '2 4', opacity: 0.82 }),
            line(180, 20, 248, 38, 'primary', { dasharray: '2 4', opacity: 0.82 }),
          ],
          circles: [],
          paths: [],
        },
      );
    default:
      return graphScene(GRAPH_RING, GRAPH_RING_EDGES, { c: 'primary', h: 'warm' }, { [edgeKey('c', 'h')]: 'primary' });
  }
}

function buildDpPreview(variant: string): PreviewSpec {
  switch (variant) {
    case 'knapsack':
      return mergeSpecs(
        matrixScene(
          4,
          6,
          {
            '0:0': 'primary',
            '1:1': 'cool',
            '2:2': 'success',
            '2:3': 'success',
            '3:4': 'warm',
            '3:5': 'primary',
          },
          { x: 38, y: 12, size: 16, gap: 4 },
        ),
        {
          rects: [rect(234, 18, 18, 14, 'warm'), rect(260, 18, 18, 22, 'success'), rect(286, 18, 18, 28, 'primary')],
          lines: [],
          circles: [],
          paths: [],
        },
      );
    case 'lcs':
    case 'edit-distance':
    case 'regex':
    case 'wildcard':
    case 'palindrome-subseq':
      return mergeSpecs(
        matrixScene(
          5,
          5,
          {
            '0:0': 'primary',
            '1:1': 'primary',
            '2:1': 'cool',
            '2:2': 'success',
            '3:3': 'success',
            '4:4': variant === 'edit-distance' ? 'warm' : 'success',
          },
          { x: 84, y: 10, size: 16, gap: 4 },
        ),
        {
          rects: [],
          lines: [
            line(92, 18, 188, 18, 'muted', { dasharray: '2 4' }),
            line(92, 18, 92, 94, 'muted', { dasharray: '2 4' }),
            line(100, 26, 120, 46, 'primary'),
            line(120, 46, 140, 46, 'cool'),
            line(140, 46, 160, 66, 'success'),
            line(160, 66, 180, 86, variant === 'edit-distance' ? 'warm' : 'success'),
          ],
          circles: [],
          paths: [],
        },
      );
    case 'lis':
      return mergeSpecs(
        barScene([28, 54, 34, 62, 42, 74, 50, 84], { 0: 'primary', 2: 'primary', 4: 'primary', 6: 'primary', 7: 'success' }),
        {
          rects: [],
          lines: [
            line(34, 58, 88, 46, 'primary'),
            line(88, 46, 142, 38, 'primary'),
            line(142, 38, 196, 26, 'primary'),
            line(196, 26, 250, 14, 'success'),
          ],
          circles: [circle(250, 14, 4, 'success', { fill: PAINT.glow, stroke: 'none' })],
          paths: [],
        },
      );
    case 'coin-change':
      return mergeSpecs(
        stripScene(7, { 0: 'primary', 1: 'warm', 2: 'success', 3: 'cool', 4: 'primary', 5: 'success', 6: 'warm' }, { y: 18, size: 20 }),
        stripScene(6, { 0: 'warm', 1: 'success', 2: 'success', 3: 'primary', 4: 'cool', 5: 'success' }, { x: 64, y: 48, size: 18, gap: 8 }),
      );
    case 'stairs':
      return {
        rects: [
          rect(56, 58, 26, 12, 'ghost'),
          rect(86, 46, 26, 24, 'cool'),
          rect(116, 34, 26, 36, 'success'),
          rect(146, 22, 26, 48, 'warm'),
          rect(176, 10, 26, 60, 'primary'),
        ],
        lines: [line(68, 58, 188, 10, 'primary', { dasharray: '3 4' })],
        circles: [circle(188, 10, 5, 'primary')],
        paths: [],
      };
    case 'matrix-chain':
    case 'burst-balloons':
    case 'dc-opt':
    case 'knuth':
      return mergeSpecs(
        matrixScene(
          5,
          5,
          {
            '0:1': 'primary',
            '1:2': 'cool',
            '2:3': 'success',
            '3:4': 'warm',
            '0:4': variant === 'knuth' ? 'success' : 'primary',
          },
          { x: 84, y: 12, size: 16, gap: 4 },
        ),
        {
          rects: [],
          lines: [line(92, 20, 184, 80, variant === 'burst-balloons' ? 'warm' : 'primary', { dasharray: '2 3' })],
          circles: [],
          paths: [],
        },
      );
    case 'fibonacci-dp':
      return mergeSpecs(
        stripScene(7, { 0: 'cool', 1: 'cool', 2: 'success', 3: 'success', 4: 'warm', 5: 'primary', 6: 'primary' }, { y: 34, size: 20 }),
        {
          rects: [],
          lines: [
            line(54, 32, 106, 32, 'muted', { dasharray: '3 4' }),
            line(80, 32, 132, 32, 'muted', { dasharray: '3 4' }),
            line(106, 32, 158, 32, 'muted', { dasharray: '3 4' }),
          ],
          circles: [],
          paths: [],
        },
      );
    case 'tree-dp':
      return graphScene(
        TREE_NODES,
        TREE_EDGES,
        { r: 'primary', a: 'cool', b: 'cool', c: 'success', d: 'warm', e: 'success', f: 'warm' },
        { [edgeKey('a', 'c')]: 'success', [edgeKey('a', 'd')]: 'warm', [edgeKey('b', 'e')]: 'success', [edgeKey('b', 'f')]: 'warm' },
      );
    case 'bitmask':
    case 'tsp':
    case 'sos':
    case 'profile':
      return mergeSpecs(
        stripScene(5, { 0: 'primary', 1: 'cool', 2: 'warm', 3: 'success', 4: 'danger' }, { x: 42, y: 18, size: 18, gap: 8 }),
        {
          rects: [
            rect(204, 20, 18, 18, 'primary'),
            rect(228, 20, 18, 18, 'cool'),
            rect(252, 20, 18, 18, 'warm'),
            rect(216, 46, 18, 18, variant === 'tsp' ? 'danger' : 'success'),
            rect(240, 46, 18, 18, 'success'),
          ],
          lines: variant === 'tsp'
            ? [
                line(94, 50, 204, 28, 'primary'),
                line(222, 28, 252, 28, 'cool'),
                line(252, 28, 249, 55, 'danger'),
                line(249, 55, 94, 50, 'success'),
              ]
            : [line(94, 50, 204, 28, 'primary', { dasharray: '2 4' })],
          circles: [],
          paths: [],
        },
      );
    case 'subset-sum':
      return mergeSpecs(
        matrixScene(
          4,
          6,
          {
            '0:0': 'success',
            '1:2': 'primary',
            '2:3': 'warm',
            '3:5': 'success',
          },
          { x: 42, y: 12, size: 18, gap: 4 },
        ),
        {
          rects: [rect(246, 18, 40, 18, 'success', { rx: 9 })],
          lines: [],
          circles: [],
          paths: [],
        },
      );
    case 'cht':
      return {
        rects: [],
        lines: [
          line(46, 66, 98, 18, 'cool'),
          line(74, 66, 138, 18, 'primary'),
          line(108, 66, 180, 18, 'success'),
          line(144, 66, 224, 18, 'warm'),
          line(216, 12, 216, 70, 'danger', { dasharray: '2 3' }),
        ],
        circles: [circle(216, 34, 4.8, 'danger'), circle(216, 46, 4.8, 'primary')],
        paths: [path('M34 66 L286 66', 'muted', { fill: 'none', strokeWidth: 1.1 })],
      };
    default:
      return matrixScene(4, 5, { '1:1': 'primary', '2:3': 'success' }, { x: 76, y: 12, size: 18, gap: 5 });
  }
}

function buildStringPreview(variant: string): PreviewSpec {
  switch (variant) {
    case 'kmp':
      return mergeSpecs(
        stripScene(8, { 2: 'primary', 3: 'primary', 4: 'warm' }, { y: 12, size: 18, gap: 6 }),
        stripScene(5, { 1: 'cool', 2: 'warm', 3: 'danger' }, { x: 96, y: 42, size: 18, gap: 6 }),
        {
          rects: [],
          lines: [line(150, 28, 126, 58, 'primary', { dasharray: '2 3' })],
          circles: [],
          paths: [],
        },
      );
    case 'rabin-karp':
      return mergeSpecs(
        stripScene(8, { 2: 'primary', 3: 'primary', 4: 'primary', 5: 'warm' }, { y: 14, size: 18, gap: 6 }),
        {
          rects: [rect(70, 48, 66, 18, 'cool', { rx: 9 }), rect(154, 48, 66, 18, 'warm', { rx: 9 })],
          lines: [line(120, 32, 188, 32, 'muted', { dasharray: '2 4' })],
          circles: [],
          paths: [],
        },
      );
    case 'z-algorithm':
      return mergeSpecs(
        stripScene(8, { 0: 'primary', 1: 'primary', 2: 'cool', 3: 'warm', 4: 'success' }, { y: 14, size: 18, gap: 6 }),
        {
          rects: [
            rect(56, 58, 18, 10, 'ghost'),
            rect(80, 52, 18, 16, 'cool'),
            rect(104, 42, 18, 26, 'primary'),
            rect(128, 34, 18, 34, 'warm'),
            rect(152, 46, 18, 22, 'success'),
          ],
          lines: [],
          circles: [],
          paths: [],
        },
      );
    case 'aho-corasick':
      return graphScene(
        TREE_NODES,
        TREE_EDGES,
        { r: 'primary', a: 'cool', b: 'cool', c: 'success', d: 'warm', e: 'success', f: 'warm' },
        { [edgeKey('r', 'a')]: 'primary', [edgeKey('a', 'd')]: 'warm', [edgeKey('b', 'f')]: 'success' },
        {
          lines: [
            line(80, 58, 184, 58, 'danger', { dasharray: '2 4', opacity: 0.88 }),
            line(136, 58, 240, 58, 'danger', { dasharray: '2 4', opacity: 0.88 }),
          ],
        },
      );
    case 'manacher':
      return mergeSpecs(
        stripScene(7, { 2: 'primary', 3: 'warm', 4: 'primary' }, { y: 38, size: 18, gap: 8 }),
        {
          rects: [],
          lines: [],
          circles: [
            circle(118, 47, 12, 'cool', { fill: 'none', strokeWidth: 1.3 }),
            circle(146, 47, 18, 'primary', { fill: 'none', strokeWidth: 1.5 }),
            circle(174, 47, 12, 'cool', { fill: 'none', strokeWidth: 1.3 }),
          ],
          paths: [],
        },
      );
    case 'suffix-array':
      return {
        rects: [
          rect(42, 14, 166, 12, 'ghost'),
          rect(60, 32, 148, 12, 'cool'),
          rect(82, 50, 126, 12, 'primary'),
          rect(108, 68, 100, 12, 'success'),
        ],
        lines: [line(218, 14, 282, 74, 'warm', { dasharray: '2 3' })],
        circles: [circle(282, 74, 5, 'warm')],
        paths: [],
      };
    case 'suffix-lcp':
      return mergeSpecs(
        {
          rects: [
            rect(42, 16, 138, 12, 'ghost'),
            rect(64, 34, 116, 12, 'cool'),
            rect(92, 52, 88, 12, 'primary'),
          ],
          lines: [],
          circles: [],
          paths: [],
        },
        {
          rects: [
            rect(214, 58, 18, 10, 'cool'),
            rect(238, 48, 18, 20, 'primary'),
            rect(262, 40, 18, 28, 'warm'),
          ],
          lines: [],
          circles: [],
          paths: [],
        },
      );
    case 'eertree':
      return graphScene(
        TREE_NODES,
        TREE_EDGES,
        { r: 'primary', a: 'cool', b: 'success', d: 'warm', e: 'primary' },
        { [edgeKey('r', 'a')]: 'cool', [edgeKey('r', 'b')]: 'success', [edgeKey('a', 'd')]: 'warm', [edgeKey('b', 'e')]: 'primary' },
      );
    case 'bwt':
      return {
        rects: [
          rect(38, 14, 142, 12, 'ghost'),
          rect(54, 30, 142, 12, 'cool'),
          rect(70, 46, 142, 12, 'primary'),
          rect(86, 62, 142, 12, 'success'),
          rect(250, 14, 18, 60, 'warm'),
        ],
        lines: [],
        circles: [],
        paths: [],
      };
    case 'rle':
      return {
        rects: [
          rect(44, 26, 48, 22, 'primary'),
          rect(98, 26, 28, 22, 'cool'),
          rect(132, 26, 66, 22, 'success'),
          rect(204, 26, 42, 22, 'warm'),
        ],
        lines: [],
        circles: [],
        paths: [],
      };
    case 'huffman':
      return mergeSpecs(
        {
          rects: [
            rect(42, 52, 18, 18, 'cool'),
            rect(68, 42, 18, 28, 'success'),
            rect(94, 34, 18, 36, 'warm'),
            rect(120, 24, 18, 46, 'primary'),
          ],
          lines: [],
          circles: [],
          paths: [],
        },
        graphScene(
          [
            { id: 'r', x: 232, y: 18 },
            { id: 'a', x: 210, y: 42 },
            { id: 'b', x: 254, y: 42 },
            { id: 'c', x: 194, y: 64 },
            { id: 'd', x: 224, y: 64 },
            { id: 'e', x: 254, y: 64 },
            { id: 'f', x: 284, y: 64 },
          ],
          [
            ['r', 'a'],
            ['r', 'b'],
            ['a', 'c'],
            ['a', 'd'],
            ['b', 'e'],
            ['b', 'f'],
          ],
          { r: 'primary', a: 'cool', b: 'warm', c: 'success', d: 'success', e: 'cool', f: 'warm' },
          { [edgeKey('r', 'a')]: 'primary', [edgeKey('r', 'b')]: 'primary' },
        ),
      );
    default:
      return stripScene(8, { 3: 'primary', 4: 'warm' }, { y: 22, size: 18, gap: 6 });
  }
}

function buildGeometryPreview(variant: string): PreviewSpec {
  switch (variant) {
    case 'convex-hull': {
      const points: ReadonlyArray<readonly [number, number]> = [
        [48, 54],
        [72, 20],
        [116, 28],
        [152, 58],
        [198, 20],
        [250, 38],
        [286, 60],
        [120, 52],
        [188, 50],
      ];
      return pointsScene(points, { 1: 'primary', 4: 'primary', 6: 'primary' }, {
        paths: [path(polylinePath([[48, 54], [72, 20], [198, 20], [286, 60], [120, 52]], true), 'success', { fill: 'rgb(110 231 183 / 0.08)' })],
        lines: [line(48, 54, 72, 20, 'success'), line(72, 20, 198, 20, 'success'), line(198, 20, 286, 60, 'success'), line(286, 60, 120, 52, 'success'), line(120, 52, 48, 54, 'success')],
      });
    }
    case 'line-intersection':
      return {
        rects: [],
        lines: [
          line(54, 62, 150, 16, 'primary', { strokeWidth: 2 }),
          line(70, 16, 194, 66, 'warm', { strokeWidth: 2 }),
          line(178, 10, 274, 62, 'cool', { strokeWidth: 2 }),
          line(210, 62, 286, 16, 'success', { strokeWidth: 2 }),
        ],
        circles: [circle(122, 30, 5.2, 'danger'), circle(241, 42, 5.2, 'danger')],
        paths: [],
      };
    case 'closest-pair':
      return pointsScene(
        [
          [42, 58],
          [74, 24],
          [104, 42],
          [136, 64],
          [172, 34],
          [198, 38],
          [246, 18],
          [278, 52],
        ],
        { 4: 'primary', 5: 'primary', 6: 'cool' },
        { lines: [line(172, 34, 198, 38, 'primary', { strokeWidth: 2 })] },
      );
    case 'sweep-line':
      return pointsScene(
        [
          [64, 18],
          [88, 42],
          [122, 30],
          [158, 56],
          [188, 24],
          [228, 46],
          [264, 18],
        ],
        { 2: 'warm', 4: 'warm', 5: 'danger' },
        { lines: [line(172, 8, 172, 72, 'primary', { strokeWidth: 1.6, dasharray: '4 4' })] },
      );
    case 'voronoi':
      return pointsScene(
        [
          [74, 22],
          [118, 54],
          [172, 28],
          [220, 58],
          [270, 28],
        ],
        { 0: 'primary', 1: 'cool', 2: 'warm', 3: 'success', 4: 'danger' },
        {
          lines: [
            line(40, 40, 100, 32, 'muted'),
            line(100, 32, 142, 70, 'muted'),
            line(142, 70, 202, 18, 'muted'),
            line(202, 18, 244, 72, 'muted'),
            line(244, 72, 296, 40, 'muted'),
          ],
        },
      );
    case 'delaunay':
      return pointsScene(
        [
          [64, 18],
          [108, 52],
          [162, 18],
          [210, 56],
          [264, 24],
        ],
        { 0: 'primary', 2: 'cool', 4: 'warm' },
        {
          lines: [
            line(64, 18, 108, 52, 'cool'),
            line(108, 52, 162, 18, 'cool'),
            line(162, 18, 210, 56, 'cool'),
            line(210, 56, 264, 24, 'cool'),
            line(64, 18, 162, 18, 'primary'),
            line(108, 52, 210, 56, 'success'),
            line(162, 18, 264, 24, 'warm'),
          ],
        },
      );
    case 'minkowski':
      return {
        rects: [],
        lines: [
          line(86, 58, 118, 22, 'primary'),
          line(118, 22, 154, 58, 'primary'),
          line(154, 58, 86, 58, 'primary'),
          line(188, 56, 220, 32, 'cool'),
          line(220, 32, 246, 56, 'cool'),
          line(246, 56, 188, 56, 'cool'),
        ],
        circles: [circle(168, 38, 5, 'warm')],
        paths: [path('M116 62 L152 28 L234 28 L268 60 L194 74 Z', 'success', { fill: 'rgb(110 231 183 / 0.08)' })],
      };
    case 'half-plane':
      return {
        rects: [],
        lines: [
          line(60, 18, 210, 62, 'danger', { strokeWidth: 1.8 }),
          line(92, 62, 242, 18, 'cool', { strokeWidth: 1.8 }),
          line(148, 10, 148, 72, 'warm', { strokeWidth: 1.8 }),
        ],
        circles: [],
        paths: [path('M148 24 L178 32 L164 62 L126 58 Z', 'success', { fill: 'rgb(110 231 183 / 0.12)' })],
      };
    default:
      return pointsScene(
        [
          [64, 18],
          [108, 52],
          [162, 18],
          [210, 56],
          [264, 24],
        ],
        { 2: 'primary' },
      );
  }
}

function buildMiscPreview(variant: string): PreviewSpec {
  switch (variant) {
    case 'fib-iter':
      return mergeSpecs(
        stripScene(7, { 0: 'cool', 1: 'cool', 2: 'success', 3: 'success', 4: 'warm', 5: 'primary', 6: 'primary' }, { y: 34, size: 18, gap: 10 }),
        { rects: [], lines: [line(44, 28, 262, 28, 'muted', { dasharray: '3 4' })], circles: [], paths: [] },
      );
    case 'factorial':
      return {
        rects: [
          rect(66, 54, 26, 14, 'ghost'),
          rect(96, 44, 26, 24, 'cool'),
          rect(126, 34, 26, 34, 'success'),
          rect(156, 24, 26, 44, 'warm'),
          rect(186, 14, 26, 54, 'primary'),
        ],
        lines: [],
        circles: [],
        paths: [],
      };
    case 'gcd':
    case 'extended-gcd':
      return {
        rects: [rect(42, 18, 58, 18, 'primary', { rx: 9 }), rect(128, 18, 58, 18, 'warm', { rx: 9 }), rect(214, 18, 58, 18, 'success', { rx: 9 })],
        lines: [line(100, 27, 128, 27, 'muted', { dasharray: '3 4' }), line(186, 27, 214, 27, 'muted', { dasharray: '3 4' }), line(156, 42, 156, 72, 'cool', { dasharray: '2 4' })],
        circles: [circle(156, 54, 6, variant === 'extended-gcd' ? 'danger' : 'cool')],
        paths: [],
      };
    case 'sieve':
      return matrixScene(
        4,
        6,
        {
          '0:0': 'success',
          '0:2': 'success',
          '0:4': 'success',
          '1:1': 'danger',
          '1:3': 'danger',
          '2:0': 'success',
          '2:2': 'danger',
          '2:4': 'success',
          '3:5': 'success',
        },
        { x: 42, y: 12, size: 18, gap: 4 },
      );
    case 'two-pointers':
      return mergeSpecs(
        stripScene(8, { 0: 'primary', 7: 'warm', 3: 'success' }, { y: 28, size: 20, gap: 6 }),
        { rects: [], lines: [line(32, 18, 32, 62, 'primary', { dasharray: '2 4' }), line(286, 18, 286, 62, 'warm', { dasharray: '2 4' })], circles: [], paths: [] },
      );
    case 'sliding-window':
      return mergeSpecs(
        stripScene(8, { 2: 'primary', 3: 'primary', 4: 'primary', 5: 'primary', 6: 'warm' }, { y: 28, size: 20, gap: 6 }),
        { rects: [rect(84, 18, 112, 40, 'cool', { opacity: 0.11, rx: 14 })], lines: [], circles: [], paths: [] },
      );
    case 'palindrome':
      return mergeSpecs(
        stripScene(7, { 1: 'cool', 2: 'primary', 3: 'warm', 4: 'primary', 5: 'cool' }, { y: 30, size: 20, gap: 8 }),
        { rects: [], lines: [line(112, 20, 194, 20, 'success', { dasharray: '3 4' })], circles: [], paths: [] },
      );
    case 'reverse':
      return mergeSpecs(
        stripScene(7, { 0: 'primary', 6: 'warm' }, { y: 30, size: 20, gap: 8 }),
        {
          rects: [],
          lines: [
            line(54, 18, 274, 18, 'muted', { dasharray: '3 4' }),
            line(54, 18, 274, 18, 'primary', { dasharray: '10 12', opacity: 0.42 }),
          ],
          circles: [circle(54, 18, 4.5, 'primary'), circle(274, 18, 4.5, 'warm')],
          paths: [],
        },
      );
    case 'backtracking':
      return graphScene(
        TREE_NODES,
        TREE_EDGES,
        { r: 'primary', a: 'warm', d: 'danger', b: 'success', e: 'success' },
        { [edgeKey('r', 'a')]: 'warm', [edgeKey('a', 'd')]: 'danger', [edgeKey('r', 'b')]: 'success', [edgeKey('b', 'e')]: 'success' },
      );
    case 'kadane':
      return mergeSpecs(
        barScene([24, 52, 38, 70, 84, 54, 26, 46], { 1: 'success', 2: 'success', 3: 'success', 4: 'success', 5: 'success', 6: 'danger' }),
        { rects: [rect(54, 12, 166, 58, 'success', { opacity: 0.06, rx: 12 })], lines: [], circles: [], paths: [] },
      );
    case 'recursion':
      return {
        rects: [
          rect(84, 54, 112, 14, 'ghost', { rx: 10 }),
          rect(96, 38, 112, 14, 'cool', { rx: 10 }),
          rect(108, 22, 112, 14, 'primary', { rx: 10 }),
        ],
        lines: [line(164, 18, 164, 72, 'muted', { dasharray: '3 4' })],
        circles: [],
        paths: [],
      };
    case 'minimax':
      return graphScene(
        TREE_NODES,
        TREE_EDGES,
        { r: 'primary', a: 'cool', b: 'warm', c: 'success', d: 'danger', e: 'warm', f: 'success' },
        { [edgeKey('r', 'a')]: 'cool', [edgeKey('r', 'b')]: 'warm', [edgeKey('a', 'd')]: 'danger' },
        { lines: [line(136, 58, 160, 14, 'danger', { dasharray: '2 4' })] },
      );
    case 'mcts':
      return graphScene(
        TREE_NODES,
        TREE_EDGES,
        { r: 'primary', a: 'cool', b: 'cool', c: 'success', d: 'warm', e: 'success', f: 'warm' },
        {},
        { circles: [circle(80, 70, 3.5, 'warm'), circle(140, 74, 3.5, 'success'), circle(236, 74, 3.5, 'cool')] },
      );
    case 'reservoir':
      return {
        rects: [rect(214, 18, 28, 42, 'cool'), rect(248, 18, 28, 42, 'success')],
        lines: [line(34, 30, 214, 30, 'muted', { dasharray: '3 4' }), line(34, 48, 248, 48, 'muted', { dasharray: '3 4' })],
        circles: [circle(42, 30, 4, 'ghost'), circle(68, 48, 4, 'ghost'), circle(94, 30, 4, 'ghost'), circle(120, 48, 4, 'ghost'), circle(146, 30, 4, 'warm'), circle(172, 48, 4, 'primary')],
        paths: [],
      };
    case 'fft':
      return {
        rects: [],
        lines: [
          line(54, 16, 116, 32, 'primary'),
          line(54, 60, 116, 32, 'primary'),
          line(116, 32, 180, 16, 'cool'),
          line(116, 32, 180, 60, 'cool'),
          line(180, 16, 248, 32, 'warm'),
          line(180, 60, 248, 32, 'warm'),
        ],
        circles: [circle(54, 16, 4, 'ghost'), circle(54, 60, 4, 'ghost'), circle(248, 32, 5, 'success')],
        paths: [],
      };
    case 'gaussian':
      return mergeSpecs(
        matrixScene(4, 4, { '0:0': 'primary', '1:0': 'cool', '1:1': 'success', '2:2': 'warm', '3:3': 'success' }, { x: 86, y: 12, size: 18, gap: 5 }),
        { rects: [], lines: [line(72, 44, 252, 44, 'primary', { dasharray: '3 4' })], circles: [], paths: [] },
      );
    case 'simplex':
      return {
        rects: [],
        lines: [
          line(54, 62, 116, 20, 'muted'),
          line(116, 20, 218, 24, 'muted'),
          line(218, 24, 264, 62, 'muted'),
          line(54, 62, 264, 62, 'muted'),
          line(78, 54, 246, 18, 'primary', { dasharray: '3 4' }),
        ],
        circles: [circle(116, 20, 4.5, 'success'), circle(218, 24, 4.5, 'warm'), circle(168, 40, 4.5, 'primary')],
        paths: [path('M54 62 L116 20 L218 24 L264 62 Z', 'cool', { fill: 'rgb(125 211 252 / 0.07)' })],
      };
    case 'miller-rabin':
      return {
        rects: [],
        lines: [
          line(160, 10, 160, 72, 'muted', { dasharray: '3 4' }),
          line(64, 22, 256, 22, 'muted', { dasharray: '3 4' }),
          line(96, 54, 224, 18, 'warm'),
        ],
        circles: [circle(160, 40, 26, 'primary', { fill: 'none', strokeWidth: 1.4 }), circle(224, 18, 5, 'warm')],
        paths: [],
      };
    case 'pollards-rho':
      return {
        rects: [],
        lines: [],
        circles: [
          circle(132, 24, 5, 'ghost'),
          circle(168, 24, 5, 'cool'),
          circle(192, 46, 5, 'primary'),
          circle(160, 62, 5, 'warm'),
          circle(122, 46, 5, 'success'),
        ],
        paths: [path('M132 24 C170 10, 210 32, 192 46 C178 60, 136 76, 122 46 C112 32, 116 24, 132 24 Z', 'primary', { fill: 'none', strokeWidth: 1.8 })],
      };
    case 'crt':
      return {
        rects: [
          rect(46, 18, 54, 16, 'cool', { rx: 9 }),
          rect(46, 42, 54, 16, 'warm', { rx: 9 }),
          rect(46, 66, 54, 16, 'success', { rx: 9 }),
          rect(218, 42, 60, 20, 'primary', { rx: 10 }),
        ],
        lines: [
          line(100, 26, 190, 50, 'cool', { dasharray: '2 4' }),
          line(100, 50, 190, 50, 'warm', { dasharray: '2 4' }),
          line(100, 74, 190, 50, 'success', { dasharray: '2 4' }),
        ],
        circles: [circle(190, 50, 5, 'primary')],
        paths: [],
      };
    default:
      return stripScene(6, { 2: 'primary', 3: 'warm' }, { y: 28, size: 20, gap: 8 });
  }
}

const PREVIEW_REGISTRIES: readonly PreviewRegistryEntry[] = [
  { variants: SORTING_VARIANTS, build: buildSortingPreview },
  { variants: SEARCH_VARIANTS, build: buildSearchPreview },
  { variants: GRAPH_VARIANTS, build: buildGraphPreview },
  { variants: DP_VARIANTS, build: buildDpPreview },
  { variants: STRING_VARIANTS, build: buildStringPreview },
  { variants: GEOMETRY_VARIANTS, build: buildGeometryPreview },
  { variants: MISC_VARIANTS, build: buildMiscPreview },
];

export function resolvePreviewSpec(algorithm: AlgorithmItem): PreviewSpec {
  for (const registry of PREVIEW_REGISTRIES) {
    const variant = registry.variants[algorithm.id];
    if (variant) {
      return registry.build(variant);
    }
  }

  switch (algorithm.category) {
    case 'sorting':
      return buildSortingPreview('bubble');
    case 'searching':
      return buildSearchPreview('linear');
    case 'graphs':
    case 'trees':
      return buildGraphPreview('bfs');
    case 'dp':
      return buildDpPreview('knapsack');
    case 'strings':
      return buildStringPreview('kmp');
    case 'geometry':
      return buildGeometryPreview('convex-hull');
    default:
      return buildMiscPreview('two-pointers');
  }
}
