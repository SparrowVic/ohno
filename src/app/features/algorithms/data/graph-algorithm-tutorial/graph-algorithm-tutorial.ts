/**
 * Per-algorithm catalog shared by the graph-family Trace tabs (short
 * hint at the top) and the Info tab (full tutorial — how it works,
 * strengths, trade-offs).
 *
 * Covers BFS/DFS-style traversal, shortest paths, MSTs, SCCs,
 * structural-analysis algorithms, flow and matching, disjoint-set
 * utilities, and the grid / matrix adjacencies (A*, Flood Fill,
 * Floyd-Warshall, Hungarian). Keep entries beginner-friendly: plain
 * language, short sentences, one idea per bullet.
 */

export interface GraphAlgorithmTutorial {
  /** Short family label shown as a badge in the Info tutorial card. */
  readonly pattern: string;
  /** One plain-language sentence describing the algorithm's pattern. */
  readonly keyIdea: string;
  /** One short sentence pointing at what to watch on the canvas. */
  readonly watch: string;
  /** Numbered steps describing how the algorithm proceeds. */
  readonly howItWorks: readonly string[];
  /** 2–3 sentences on when this algorithm shines. */
  readonly strengths: readonly string[];
  /** 2–3 sentences on when to avoid it / watch out. */
  readonly weaknesses: readonly string[];
}

export const GRAPH_ALGORITHM_TUTORIALS: Record<string, GraphAlgorithmTutorial> = {
  /* ==================== Traversal ==================== */

  bfs: {
    pattern: 'Traversal · Level order',
    keyIdea:
      'Explore the graph in waves: discover all neighbours of the source, then all of their neighbours, and so on.',
    watch: 'The frontier expands in concentric rings — each wave is one more hop from the source.',
    howItWorks: [
      'Mark the source visited and push it into a FIFO queue.',
      'Pop the head; look at every neighbour that is still unseen.',
      'Mark each fresh neighbour visited, record the hop count, and push it to the back of the queue.',
      'Repeat until the queue empties.',
    ],
    strengths: [
      'Finds the shortest path (in hops) on unweighted graphs in O(V + E).',
      'Easy to reason about — the queue literally tracks the next wave of work.',
    ],
    weaknesses: [
      'Ignores edge weights, so it is not a shortest-path algorithm on weighted graphs.',
      'Can exhaust memory on huge graphs because every frontier node sits in the queue at once.',
    ],
  },

  dfs: {
    pattern: 'Traversal · Deep dive',
    keyIdea:
      'Go as deep as possible down one branch before backtracking and trying the next.',
    watch: 'A long chain unfurls first; only when it dead-ends does the search jump back and branch sideways.',
    howItWorks: [
      'Start at the source, mark it visited and push it on a stack (or recurse).',
      'Pick an unvisited neighbour and dive into it — repeat recursively.',
      'When a node has no unvisited neighbours, backtrack to its parent.',
      'Continue until the whole reachable component has been explored.',
    ],
    strengths: [
      'O(V + E) and uses just O(h) stack space where h is the depth of the exploration.',
      'Natural fit for cycle detection, topological order, SCCs and bridge-finding.',
    ],
    weaknesses: [
      'Does NOT find shortest paths — order depends on which neighbour you pick first.',
      'Deep graphs can blow the call stack if implemented recursively without care.',
    ],
  },

  'tree-traversals': {
    pattern: 'Traversal · Tree orders',
    keyIdea:
      'Visit every node of a tree in a chosen order — pre-order, in-order, post-order, or level-order (BFS).',
    watch: 'The visit order is what matters — watch which node prints its label first, before or after its children.',
    howItWorks: [
      'Pre-order: node → left subtree → right subtree (top-down copy).',
      'In-order: left subtree → node → right subtree (sorted output on a BST).',
      'Post-order: left → right → node (safe for delete / cleanup).',
      'Level-order: queue-based wave by wave (the tree equivalent of BFS).',
    ],
    strengths: [
      'Linear O(n) time and O(h) space for DFS-style traversals; O(w) space for level-order.',
      'Every traversal exposes a different natural structural property of the tree.',
    ],
    weaknesses: [
      'Recursive DFS traversals can blow the stack on very deep trees — switch to iterative + explicit stack.',
      'Order matters — swapping left/right can silently break downstream consumers expecting a specific traversal.',
    ],
  },

  /* ==================== Shortest path ==================== */

  dijkstra: {
    pattern: 'Shortest path · Weighted',
    keyIdea:
      'Greedily settle the unreached node with the smallest tentative distance, then relax its outgoing edges.',
    watch: 'The settled node is always the current best pick — once settled, its distance is final.',
    howItWorks: [
      'Set every distance to infinity except the source (0).',
      'Pull the unsettled node with the smallest distance from a min-heap.',
      'For each outgoing edge, relax: if going through the current node is cheaper, update the neighbour.',
      'Repeat until every reachable node has been settled.',
    ],
    strengths: [
      'Optimal shortest-path tree in O((V + E) log V) with a binary heap.',
      'Stops early if you only need the distance to one target.',
    ],
    weaknesses: [
      'Assumes non-negative edge weights — a single negative edge can break correctness.',
      'Dense graphs benefit more from simpler O(V²) implementations than from a heap.',
    ],
  },

  'bellman-ford': {
    pattern: 'Shortest path · Negatives OK',
    keyIdea:
      'Relax every edge up to V − 1 times; if one more pass still changes a distance, you have a negative cycle.',
    watch: 'The whole edge list is swept each pass — distances shorten everywhere, not just around one focus node.',
    howItWorks: [
      'Set every distance to infinity except the source (0).',
      'Run V − 1 passes — in each pass relax every edge once.',
      'Do one extra pass: any distance that still decreases proves a reachable negative cycle.',
      'If no decrease happens, distances are correct shortest paths.',
    ],
    strengths: [
      'Handles negative edge weights and detects negative cycles.',
      'Conceptually simple — no priority queue required.',
    ],
    weaknesses: [
      'O(V · E) time — slower than Dijkstra on non-negative graphs.',
      'Not naturally incremental — adding an edge means replaying passes.',
    ],
  },

  'floyd-warshall': {
    pattern: 'All-pairs shortest path',
    keyIdea:
      'Allow paths through one more intermediate node k per outer pass; take the minimum of "direct i→j" and "i→k→j".',
    watch: 'With each k pass, the pivot row and column fix their values and improvements ripple through the rest of the table.',
    howItWorks: [
      'Start with dist[i][j] = edge weight (or infinity if no edge).',
      'For each candidate intermediate k, update dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j]).',
      'After all V passes, dist holds every shortest path length between every pair.',
      'To recover paths, keep a parent/next matrix updated alongside.',
    ],
    strengths: [
      'Answers every shortest-path query in O(1) after O(V³) preprocessing — great when the graph is dense or queries are frequent.',
      'Handles negative weights (though still not negative cycles).',
    ],
    weaknesses: [
      'O(V³) time and O(V²) memory — impractical for very large V.',
      'Not suited if you need one source only — Dijkstra or Bellman-Ford is faster.',
    ],
  },

  'a-star-pathfinding': {
    pattern: 'Shortest path · Heuristic',
    keyIdea:
      'Prioritise nodes by f = g (cost so far) + h (heuristic estimate of distance to goal) and expand the best first.',
    watch: 'The frontier hugs the goal direction because nodes with a bad h-score sit quietly in the queue.',
    howItWorks: [
      'Put the start into a priority queue with f = h(start).',
      'Pop the node with the smallest f; if it is the goal, reconstruct the path.',
      'Otherwise, relax each neighbour with g = current.g + edge cost and f = g + h(neighbour).',
      'Repeat until the goal is popped or the queue empties.',
    ],
    strengths: [
      'Dramatically faster than Dijkstra when the heuristic points toward the goal.',
      'Still optimal if the heuristic is admissible (never overestimates the true distance).',
    ],
    weaknesses: [
      'A bad heuristic degrades it to Dijkstra (or worse).',
      'Memory-hungry because every reached node stays in the open set.',
    ],
  },

  /* ==================== MST ==================== */

  'prims-mst': {
    pattern: 'MST · Grow from seed',
    keyIdea:
      'Start from any node and repeatedly add the cheapest edge that leaves the tree and reaches a new node.',
    watch: 'The growing tree always hangs off one connected blob — edges crossing the boundary are the candidates.',
    howItWorks: [
      'Pick any start node; add it to the tree.',
      'Put every edge leaving the tree into a min-heap, keyed by weight.',
      'Pop the cheapest edge; if its far endpoint is not in the tree yet, add both the edge and that endpoint.',
      'Repeat until every node is in the tree — you now have the MST.',
    ],
    strengths: [
      'O(E log V) with a heap — fast on dense graphs.',
      'Easy to parallelise along the frontier.',
    ],
    weaknesses: [
      'Only works on connected graphs — otherwise you only span one component.',
      'Implementation is more involved than Kruskal if you do not already have a heap.',
    ],
  },

  'kruskals-mst': {
    pattern: 'MST · Sort edges',
    keyIdea:
      'Sort all edges by weight; pick the cheapest one that does not close a cycle, using Union-Find to check.',
    watch: 'Edges are offered in order — accepted ones join the MST, rejected ones would have closed a cycle.',
    howItWorks: [
      'Sort every edge by weight (ascending).',
      'Walk the list; for each edge, check if its endpoints are in different components.',
      'If yes — accept it (add to MST, union the components). If no — reject it.',
      'Stop once V − 1 edges have been accepted — that is the MST.',
    ],
    strengths: [
      'O(E log E) time, dominated by the sort; linear once edges are sorted.',
      'Works cleanly on disconnected graphs (you get a minimum spanning forest).',
    ],
    weaknesses: [
      'Needs a fast disjoint-set structure to hit optimal speed.',
      'Sorting the full edge list is wasted work if only a small prefix matters.',
    ],
  },

  /* ==================== SCCs ==================== */

  'tarjan-scc': {
    pattern: 'SCC · One-pass DFS',
    keyIdea:
      'Run a single DFS and track each node\'s low-link value; whenever low-link == index, an SCC closes at the current root.',
    watch: 'Nodes sit on an auxiliary stack during DFS; a whole SCC gets popped off in one burst when its root finishes.',
    howItWorks: [
      'DFS the graph, assigning each node an index (discovery order) and a low-link (lowest index reachable).',
      'Push each newly discovered node on an SCC stack.',
      'When you finish a node whose low-link equals its own index, pop everything above it off the stack — that is one SCC.',
      'Continue until every node is processed.',
    ],
    strengths: [
      'Single DFS — O(V + E).',
      'Does not need the reversed graph.',
    ],
    weaknesses: [
      'Low-link bookkeeping is easy to get wrong; off-by-one bugs are common.',
      'Conceptually denser than Kosaraju — harder to teach.',
    ],
  },

  'kosaraju-scc': {
    pattern: 'SCC · Two-pass DFS',
    keyIdea:
      'First DFS records finish order; second DFS on the reversed graph, in reverse finish order, peels off one SCC per traversal.',
    watch: 'Pass 1 builds a stack of finish times. Pass 2 walks reversed edges — each DFS call discovers exactly one SCC.',
    howItWorks: [
      'DFS the original graph and push each node on a stack as it finishes.',
      'Reverse every edge.',
      'Pop nodes off the stack; whenever you pop an unvisited node, DFS it in the reversed graph — the reached set is one SCC.',
      'Repeat until the stack is empty.',
    ],
    strengths: [
      'Conceptually clean: two ordinary DFS runs, no low-link tracking.',
      'Easy to explain and debug.',
    ],
    weaknesses: [
      'Needs the reversed graph — extra time + memory.',
      'Two passes versus Tarjan\'s one.',
    ],
  },

  /* ==================== DAG / structural ==================== */

  'topological-sort-kahn': {
    pattern: 'DAG · In-degree ordering',
    keyIdea:
      'Repeatedly remove a node with zero in-degree; its edges vanish, freeing more zero-in-degree nodes to be taken next.',
    watch: 'A queue of "ready" nodes shrinks and refills as dependencies are satisfied.',
    howItWorks: [
      'Compute the in-degree of every node.',
      'Put every in-degree-0 node into a queue.',
      'Pop a node, append it to the result, and decrement in-degree on each outgoing neighbour.',
      'Push any neighbour whose in-degree just hit 0. Stop when the queue empties.',
    ],
    strengths: [
      'O(V + E), iterative, no recursion.',
      'Detects cycles naturally — if the result is shorter than V, a cycle exists.',
    ],
    weaknesses: [
      'Only defined on DAGs — cyclic graphs have no topological order.',
      'The returned order is one valid order out of many; not deterministic unless you tie-break.',
    ],
  },

  'cycle-detection': {
    pattern: 'Structural · Cycle witness',
    keyIdea:
      'Run DFS and track whether each node is on the current path; finding a back-edge to a path node proves a cycle.',
    watch: 'Nodes light up as "on stack" while the search descends; a back-edge completes the witness loop.',
    howItWorks: [
      'Track three colours per node: white (unseen), grey (on the DFS stack), black (fully processed).',
      'DFS: on entry mark grey, on exit mark black.',
      'If DFS sees an edge to a grey node — that is a back edge and proves a directed cycle.',
      'For undirected graphs, any non-parent edge to a seen node is a cycle.',
    ],
    strengths: [
      'O(V + E) and very simple to implement.',
      'Reports an actual cycle, not just a yes/no answer.',
    ],
    weaknesses: [
      'DFS recursion depth can be a problem on deep graphs.',
      'Needs different logic for directed versus undirected graphs.',
    ],
  },

  'connected-components': {
    pattern: 'Structural · Components',
    keyIdea:
      'Repeat DFS/BFS starting from each unvisited node; everything reached forms one connected component.',
    watch: 'Each unseen seed spawns a new coloured region — the number of colours is the component count.',
    howItWorks: [
      'Walk the node list. If the next node is unvisited, start a traversal from it.',
      'DFS or BFS marks every node it reaches as belonging to this component.',
      'When the traversal ends, increment the component counter and move to the next unvisited node.',
      'Once every node is visited, you have grouped them all into components.',
    ],
    strengths: [
      'O(V + E), straightforward implementation.',
      'Union-Find offers a near-constant online alternative if edges stream in over time.',
    ],
    weaknesses: [
      'Does not preserve order — components are discovered in arbitrary order.',
      'Needs the full graph in memory.',
    ],
  },

  'bipartite-check': {
    pattern: 'Structural · 2-colouring',
    keyIdea:
      'Try to colour every node with one of two colours so that no edge connects same-coloured nodes.',
    watch: 'Colours spread via BFS from each seed; a same-colour edge appears the moment the graph cannot be bipartite.',
    howItWorks: [
      'Pick an unvisited node, colour it A, push on a queue.',
      'Pop a node; colour every uncoloured neighbour the opposite colour and enqueue it.',
      'If a neighbour is already the same colour as the current node, the graph is NOT bipartite.',
      'Repeat from any remaining unvisited node for disconnected graphs.',
    ],
    strengths: [
      'O(V + E) time — single BFS per component.',
      'Doubles as a useful building block for matching problems.',
    ],
    weaknesses: [
      'Strictly binary — cannot generalise to k-colouring without changing approach.',
      'A conflict edge proves non-bipartite but does not locate all odd cycles.',
    ],
  },

  'bridges-articulation-points': {
    pattern: 'Critical structure',
    keyIdea:
      'DFS tracks discovery times and low-link values; an edge is a bridge and a node is an articulation point when removal disconnects the graph.',
    watch: 'Red nodes and edges flag the critical pieces — remove them and the graph falls apart.',
    howItWorks: [
      'DFS the graph, recording discovery time and low-link (earliest reachable via back-edges) per node.',
      'Edge (u, v) is a bridge if low[v] > disc[u] — no back-edge gives an alternative route.',
      'Node u is an articulation point if it is the DFS root with ≥ 2 children, or if some child has low ≥ disc[u].',
      'Report every bridge and articulation point found.',
    ],
    strengths: [
      'Single O(V + E) DFS finds both bridges and articulation points.',
      'Directly identifies structural vulnerabilities in a network.',
    ],
    weaknesses: [
      'Low-link bookkeeping is delicate and easy to get wrong.',
      'Does not generalise to directed graphs without changes.',
    ],
  },

  'euler-path-circuit': {
    pattern: 'Trail · Every edge once',
    keyIdea:
      'Find a walk that uses every edge exactly once, stitching the trail out of smaller sub-cycles (Hierholzer).',
    watch: 'Purple edges extend the live walk; teal edges are locked into the final trail as it grows.',
    howItWorks: [
      'Check degree conditions: Euler circuit needs all-even degrees, Euler path needs exactly two odd endpoints.',
      'Start at any even-degree node (or an odd endpoint for a path) and follow edges, consuming each once.',
      'If you hit a dead end, back-stitch a new sub-cycle from any revisited node with remaining unused edges.',
      'Splice sub-cycles into the main trail until every edge is consumed.',
    ],
    strengths: [
      'O(E) linear time with Hierholzer\'s algorithm.',
      'Works on directed graphs with the analogous in-degree / out-degree conditions.',
    ],
    weaknesses: [
      'Only exists on graphs meeting the degree conditions — otherwise no trail exists.',
      'Must track unused edges carefully — naive visited-edge tracking can mis-route.',
    ],
  },

  'chromatic-number': {
    pattern: 'Colouring · Minimum palette',
    keyIdea:
      'Search for the smallest k such that the graph can be coloured with k colours so no edge connects same-coloured nodes.',
    watch: 'Colours assign one-by-one; a red edge flags a conflict forcing the search to back-track and try another palette.',
    howItWorks: [
      'Try k = 1, then 2, 3, … in turn.',
      'For each k, attempt to colour nodes one by one, assigning the smallest legal colour.',
      'On a conflict, back-track and try a different assignment.',
      'The first k that succeeds is the chromatic number.',
    ],
    strengths: [
      'Conceptually straightforward — backtracking on a constraint-satisfaction problem.',
      'Works on arbitrary graphs, not just special families.',
    ],
    weaknesses: [
      'Chromatic number is NP-hard — exponential in the worst case.',
      'Good pruning (e.g., colour by highest degree first) is essential for tolerable runtime.',
    ],
  },

  'steiner-tree': {
    pattern: 'Optional connectors · DP',
    keyIdea:
      'Find the cheapest tree that connects a chosen subset of terminal nodes, allowing optional Steiner helpers along the way.',
    watch: 'Blue terminals must all connect; green nodes are optional helpers; teal edges form the growing terminal tree.',
    howItWorks: [
      'Enumerate subsets of terminals (up to 2^t subsets for t terminals).',
      'DP: cheapest tree spanning a given subset, rooted at a given node.',
      'Combine smaller subsets via tree merges and edge extensions (Dreyfus-Wagner).',
      'Answer = cheapest tree spanning the full terminal set, over all possible roots.',
    ],
    strengths: [
      'Exact solution — no heuristic approximation.',
      'Polynomial in graph size for a fixed number of terminals (Dreyfus-Wagner is O(3^t · V + 2^t · E log V)).',
    ],
    weaknesses: [
      'Exponential in the number of terminals — impractical beyond ~20 terminals.',
      'Implementation is heavy compared to MST or shortest-path.',
    ],
  },

  'dominator-tree': {
    pattern: 'Control flow · Dominance',
    keyIdea:
      'In a control-flow graph, node D dominates B if every path from entry to B goes through D — build a tree of immediate dominators.',
    watch: 'Dominator edges appear once every block\'s dominator set has stabilised.',
    howItWorks: [
      'Compute the reverse post-order of the CFG from the entry node.',
      'Initialise dom[entry] = entry; everything else unknown.',
      'Iterate: dom[B] = intersection of dom sets of all B\'s predecessors, plus B itself.',
      'When dom stops changing, the immediate dominator of B is the nearest strictly-dominating node.',
    ],
    strengths: [
      'Near-linear in practice with the Cooper-Harvey-Kennedy algorithm.',
      'Core to compiler optimisations — loops, SSA construction, code-motion.',
    ],
    weaknesses: [
      'Only meaningful on reducible control-flow graphs or with Lengauer-Tarjan for speed.',
      'Subtle edge-cases around unreachable code and exit nodes.',
    ],
  },

  /* ==================== Disjoint sets / grid / flow / matching ==================== */

  'union-find': {
    pattern: 'Structure · Disjoint sets',
    keyIdea:
      'Maintain a forest of disjoint sets with two ops: find the root of a set, and union two sets into one.',
    watch: 'Find walks up to the root; union re-parents one root under the other and path-compression flattens the chain.',
    howItWorks: [
      'Each element starts as its own set — its parent pointer points to itself.',
      'Find(x): follow parent pointers until you hit a root. Compress the path so future finds are faster.',
      'Union(a, b): find both roots; hang the smaller tree under the larger root.',
      'After enough ops, nearly all nodes point directly at the root.',
    ],
    strengths: [
      'With path compression and union by rank, operations are effectively O(α(n)) — near constant.',
      'Perfect fit for Kruskal, connectivity queries and offline connectivity checks.',
    ],
    weaknesses: [
      'Does not support deletion or split — the tree only ever merges.',
      'Path-compression mutates structure during read-only-looking find calls.',
    ],
  },

  'flood-fill': {
    pattern: 'Grid · Region paint',
    keyIdea:
      'Starting from a seed cell, paint every connected cell that matches the seed colour until the region is filled.',
    watch: 'The fill expands in waves from the seed — like a paint bucket in an image editor.',
    howItWorks: [
      'Pick a seed cell and record its original colour.',
      'Add the seed to a queue (BFS) or stack (DFS).',
      'Pop a cell, repaint it, and enqueue every 4- or 8-neighbour that still has the original colour.',
      'Stop when the queue / stack is empty — the region is fully painted.',
    ],
    strengths: [
      'Linear in the region size.',
      'Trivial to adapt to different adjacency (4-way, 8-way, diagonals).',
    ],
    weaknesses: [
      'Large regions on deep grids blow the recursion stack — prefer an explicit queue / stack.',
      'Does not preserve anti-aliased boundaries — works on sharp-edged regions.',
    ],
  },

  'edmonds-karp': {
    pattern: 'Max flow · BFS augmenting',
    keyIdea:
      'Repeatedly find a shortest augmenting path via BFS in the residual graph and push flow along it until none remains.',
    watch: 'Each BFS lights up a shortest path from source to sink; once drawn, it gets saturated and disappears.',
    howItWorks: [
      'Build the residual graph (original capacities minus current flow).',
      'BFS from source to sink in the residual graph.',
      'Find the bottleneck capacity along the path and push that much flow.',
      'Update residual capacities. Repeat until no augmenting path exists.',
    ],
    strengths: [
      'O(V · E²) polynomial time — predictable upper bound.',
      'BFS gives fewer phases than Ford-Fulkerson\'s arbitrary path picks.',
    ],
    weaknesses: [
      'Slower than Dinic on dense networks.',
      'Does not handle costs — fine for plain max flow only.',
    ],
  },

  'dinic-max-flow': {
    pattern: 'Max flow · Layered blocking',
    keyIdea:
      'Build a level graph with BFS, then push "blocking flow" through all shortest augmenting paths at once via DFS.',
    watch: 'Nodes group into BFS levels; DFS saturates every s→t shortest path in one phase before the level graph rebuilds.',
    howItWorks: [
      'BFS the residual graph from source to sink, assigning each node a level.',
      'If the sink is unreachable, you\'re done.',
      'DFS forward through edges that go strictly level by level, pushing blocking flow.',
      'Recompute the level graph and repeat until the sink is unreachable.',
    ],
    strengths: [
      'O(V²E) in general, O(E · √V) on bipartite / unit-capacity graphs — faster than Edmonds-Karp on most inputs.',
      'Blocking-flow DFS saturates many paths per phase.',
    ],
    weaknesses: [
      'More complex to implement than plain Ford-Fulkerson or Edmonds-Karp.',
      'Cost-oblivious — extend to min-cost flow for weighted problems.',
    ],
  },

  'hopcroft-karp': {
    pattern: 'Bipartite matching · Layered',
    keyIdea:
      'For bipartite graphs, find many shortest vertex-disjoint augmenting paths per phase using a BFS + DFS pair.',
    watch: 'BFS builds alternating layers between free left and right vertices; DFS threads augmenting paths through them.',
    howItWorks: [
      'BFS from every free left vertex, building alternating layers of matched / unmatched edges.',
      'Stop the BFS at the first layer containing a free right vertex.',
      'DFS back through the layers, augmenting along vertex-disjoint shortest paths.',
      'Repeat until BFS can no longer reach a free right vertex.',
    ],
    strengths: [
      'O(E · √V) — the fastest known algorithm for bipartite matching.',
      'Natural fit for assignment, bipartite covers and job-scheduling problems.',
    ],
    weaknesses: [
      'Only works on bipartite graphs.',
      'Layered bookkeeping adds implementation complexity over simpler flow-based matching.',
    ],
  },

  'min-cost-max-flow': {
    pattern: 'Flow · With costs',
    keyIdea:
      'Find the max flow whose total edge cost is minimum — repeatedly push flow along the cheapest augmenting path.',
    watch: 'Each augmentation lights up the currently-cheapest s→t route (SPFA or Bellman-Ford on residual costs).',
    howItWorks: [
      'Build the residual graph with capacities AND edge costs (negative on reverse edges).',
      'Find the cheapest s→t path via SPFA / Bellman-Ford (to allow negative reverse costs).',
      'Push the bottleneck flow along it, charging the cost × bottleneck.',
      'Repeat until no augmenting path exists; sum of costs × flows is the answer.',
    ],
    strengths: [
      'Finds both the max flow and the minimum total cost in one procedure.',
      'Fits naturally on assignment, transportation and supply-chain problems.',
    ],
    weaknesses: [
      'Slower than plain max-flow: shortest-path step per augmentation.',
      'Negative costs in reverse edges require SPFA or Johnson-style reweighting.',
    ],
  },

  'hungarian-algorithm': {
    pattern: 'Assignment · Matrix reduction',
    keyIdea:
      'Solve minimum-cost bipartite assignment by reducing the cost matrix, covering all zeros with the fewest lines, and adjusting until a perfect matching fits.',
    watch: 'Cover lines cross the matrix; when the count equals n you can pick a valid assignment of zeros.',
    howItWorks: [
      'Subtract each row\'s minimum from that row; then each column\'s minimum from that column.',
      'Cover all zeros with the minimum number of horizontal / vertical lines.',
      'If lines = n, assign zeros to form a perfect matching — done.',
      'Otherwise find the smallest uncovered value, subtract it from uncovered rows, add it to doubly-covered columns, and retry.',
    ],
    strengths: [
      'O(n³) polynomial — dramatically better than brute-force O(n!).',
      'Produces an optimal assignment, not an approximation.',
    ],
    weaknesses: [
      'The line-cover step is subtle to implement correctly.',
      'Works on square cost matrices — pad with dummy rows/cols for rectangular inputs.',
    ],
  },
};
