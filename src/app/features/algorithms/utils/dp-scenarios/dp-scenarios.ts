import { DpPresetOption } from '../../models/dp';

export interface KnapsackItem {
  readonly id: string;
  readonly label: string;
  readonly weight: number;
  readonly value: number;
}

export interface KnapsackScenario {
  readonly kind: 'knapsack-01';
  readonly presetId: string;
  readonly presetLabel: string;
  readonly presetDescription: string;
  readonly capacity: number;
  readonly items: readonly KnapsackItem[];
}

export interface SequenceScenario {
  readonly presetId: string;
  readonly presetLabel: string;
  readonly presetDescription: string;
  readonly source: string;
  readonly target: string;
}

export interface LcsScenario extends SequenceScenario {
  readonly kind: 'longest-common-subsequence';
}

export interface EditDistanceScenario extends SequenceScenario {
  readonly kind: 'edit-distance';
}

export interface MatrixChainScenario {
  readonly kind: 'matrix-chain-multiplication';
  readonly presetId: string;
  readonly presetLabel: string;
  readonly presetDescription: string;
  readonly dimensions: readonly number[];
}

export interface CoinChangeScenario {
  readonly kind: 'coin-change';
  readonly presetId: string;
  readonly presetLabel: string;
  readonly presetDescription: string;
  readonly coins: readonly number[];
  readonly target: number;
}

export interface SubsetSumScenario {
  readonly kind: 'subset-sum';
  readonly presetId: string;
  readonly presetLabel: string;
  readonly presetDescription: string;
  readonly numbers: readonly number[];
  readonly target: number;
}

export interface LpsScenario {
  readonly kind: 'longest-palindromic-subsequence';
  readonly presetId: string;
  readonly presetLabel: string;
  readonly presetDescription: string;
  readonly source: string;
}

export interface BurstBalloonsScenario {
  readonly kind: 'burst-balloons';
  readonly presetId: string;
  readonly presetLabel: string;
  readonly presetDescription: string;
  readonly balloons: readonly number[];
}

export interface WildcardMatchingScenario extends SequenceScenario {
  readonly kind: 'wildcard-matching';
}

export interface LisScenario {
  readonly kind: 'longest-increasing-subsequence';
  readonly presetId: string;
  readonly presetLabel: string;
  readonly presetDescription: string;
  readonly values: readonly number[];
}

export interface ClimbingStairsScenario {
  readonly kind: 'climbing-stairs';
  readonly presetId: string;
  readonly presetLabel: string;
  readonly presetDescription: string;
  readonly steps: number;
}

export interface FibonacciScenario {
  readonly kind: 'fibonacci-dp';
  readonly presetId: string;
  readonly presetLabel: string;
  readonly presetDescription: string;
  readonly n: number;
}

export interface RegexMatchingScenario extends SequenceScenario {
  readonly kind: 'regex-matching-dp';
}

export interface TravelingSalesmanScenario {
  readonly kind: 'traveling-salesman-dp';
  readonly presetId: string;
  readonly presetLabel: string;
  readonly presetDescription: string;
  readonly labels: readonly string[];
  readonly distances: readonly (readonly number[])[];
  readonly startIndex: number;
}

export interface TreeDpNode {
  readonly id: string;
  readonly label: string;
  readonly weight: number;
  readonly parentId: string | null;
}

export interface TreeDpScenario {
  readonly kind: 'dp-on-trees';
  readonly presetId: string;
  readonly presetLabel: string;
  readonly presetDescription: string;
  readonly nodes: readonly TreeDpNode[];
  readonly rootId: string;
}

export interface BitmaskDpScenario {
  readonly kind: 'dp-with-bitmask';
  readonly presetId: string;
  readonly presetLabel: string;
  readonly presetDescription: string;
  readonly workers: readonly string[];
  readonly jobs: readonly string[];
  readonly costs: readonly (readonly number[])[];
}

export interface ChtDpScenario {
  readonly kind: 'dp-convex-hull-trick';
  readonly presetId: string;
  readonly presetLabel: string;
  readonly presetDescription: string;
  readonly xValues: readonly number[];
  readonly transitionCost: number;
}

export interface DivideConquerDpScenario {
  readonly kind: 'divide-conquer-dp-optimization';
  readonly presetId: string;
  readonly presetLabel: string;
  readonly presetDescription: string;
  readonly values: readonly number[];
  readonly groups: number;
}

export interface KnuthDpScenario {
  readonly kind: 'knuth-dp-optimization';
  readonly presetId: string;
  readonly presetLabel: string;
  readonly presetDescription: string;
  readonly files: readonly number[];
}

export interface SosDpScenario {
  readonly kind: 'sos-dp';
  readonly presetId: string;
  readonly presetLabel: string;
  readonly presetDescription: string;
  readonly bitCount: number;
  readonly baseValues: readonly number[];
  readonly focusMask: number;
}

export interface ProfileDpScenario {
  readonly kind: 'profile-dp';
  readonly presetId: string;
  readonly presetLabel: string;
  readonly presetDescription: string;
  readonly columns: number;
  readonly height: number;
}

export const KNAPSACK_PRESETS: readonly DpPresetOption[] = [
  { id: 'camp', label: 'Camp Pack', description: 'Balanced weights and values, ideal for showing skip vs take decisions.' },
  { id: 'heist', label: 'Heist Loadout', description: 'Several flashy high-value items compete for a tight capacity budget.' },
  { id: 'lab', label: 'Lab Crate', description: 'Dense scientific cargo where medium items often beat one expensive choice.' },
];

export const LCS_PRESETS: readonly DpPresetOption[] = [
  { id: 'dna', label: 'DNA', description: 'Short nucleotide strings make diagonal matches visually obvious.' },
  { id: 'words', label: 'Words', description: 'Readable word pairs make the final subsequence easy to understand.' },
  { id: 'signals', label: 'Signals', description: 'Letter-code sequences create competing left vs top DP decisions.' },
];

export const EDIT_DISTANCE_PRESETS: readonly DpPresetOption[] = [
  { id: 'typo', label: 'Typo Fix', description: 'Classic misspellings show replace, insert and delete transitions cleanly.' },
  { id: 'plural', label: 'Grammar', description: 'Word-shape changes make suffix edits and carry moves easy to follow.' },
  { id: 'code', label: 'Code Refactor', description: 'Programmer-ish tokens reveal how edits cluster around naming changes.' },
];

export const MATRIX_CHAIN_PRESETS: readonly DpPresetOption[] = [
  { id: 'classic', label: 'Classic', description: 'The textbook chain exposes why split points matter so much.' },
  { id: 'balanced', label: 'Balanced', description: 'Dimensions stay moderate and produce a steady triangular DP fill.' },
  { id: 'swing', label: 'Swing', description: 'Alternating small and huge dimensions make bad split costs explode.' },
];

export const COIN_CHANGE_PRESETS: readonly DpPresetOption[] = [
  { id: 'metro', label: 'Metro Fare', description: 'Classic coin set where one greedy-looking pick is not always optimal.' },
  { id: 'arcade', label: 'Arcade Tokens', description: 'Medium denominations create several competing minimum-coin paths.' },
  { id: 'market', label: 'Market Change', description: 'Small and large coins mix to show reuse of the same row in unbounded DP.' },
];

export const SUBSET_SUM_PRESETS: readonly DpPresetOption[] = [
  { id: 'trail', label: 'Trail Mix', description: 'Snack weights create one clean subset and a few tempting dead ends.' },
  { id: 'laser', label: 'Laser Grid', description: 'Numbers are balanced so multiple near-target branches compete.' },
  { id: 'lab', label: 'Lab Budget', description: 'A denser set makes the boolean table light up in clusters.' },
];

export const LPS_PRESETS: readonly DpPresetOption[] = [
  { id: 'radar', label: 'Radar', description: 'Letter symmetry creates a visibly clean palindromic backbone.' },
  { id: 'phrase', label: 'Phrase', description: 'Readable words make matching outer characters easier to follow.' },
  { id: 'signal', label: 'Signal', description: 'The best palindrome is hidden across several skipped positions.' },
];

export const BURST_BALLOONS_PRESETS: readonly DpPresetOption[] = [
  { id: 'classic', label: 'Classic', description: 'A compact coin-yield set shows why the last balloon in an interval matters.' },
  { id: 'zigzag', label: 'Zigzag', description: 'High-low alternation makes the split decisions visually dramatic.' },
  { id: 'dense', label: 'Dense', description: 'A slightly larger board emphasizes interval reuse and split storage.' },
];

export const WILDCARD_PRESETS: readonly DpPresetOption[] = [
  { id: 'globs', label: 'Globs', description: 'Simple ? and * patterns show horizontal vs vertical star movement clearly.' },
  { id: 'routes', label: 'Routes', description: 'Path-like strings make wildcard spans easy to reason about.' },
  { id: 'codes', label: 'Codes', description: 'Dense symbol-like strings make skipped vs consumed star states stand out.' },
];

export const LIS_PRESETS: readonly DpPresetOption[] = [
  { id: 'wave', label: 'Wave', description: 'Alternating rises and dips force the algorithm to keep revising its best predecessor.' },
  { id: 'skyline', label: 'Skyline', description: 'Mostly rising values with a few breaks make the final subsequence easy to spot.' },
  { id: 'rebound', label: 'Rebound', description: 'Late recovery values create a more dramatic backtrack route.' },
];

export const CLIMBING_STAIRS_PRESETS: readonly DpPresetOption[] = [
  { id: 'tower', label: 'Tower', description: 'A clean staircase count where each landing inherits the two previous counts.' },
  { id: 'metro', label: 'Metro', description: 'Urban stop labels frame the recurrence as a compact commuter problem.' },
  { id: 'summit', label: 'Summit', description: 'A slightly taller climb makes the Fibonacci-like growth feel more dramatic.' },
];

export const FIBONACCI_PRESETS: readonly DpPresetOption[] = [
  { id: 'classic', label: 'Classic', description: 'The standard Fibonacci sequence is ideal for showing additive DP growth.' },
  { id: 'growth', label: 'Growth', description: 'A slightly larger n turns the recurrence into a visibly accelerating wave.' },
  { id: 'signal', label: 'Signal', description: 'Shorter terms keep the focus on how the cache fills from left to right.' },
];

export const REGEX_PRESETS: readonly DpPresetOption[] = [
  { id: 'alias', label: 'Alias', description: 'Dot and star mix to show both literal matches and repeated spans.' },
  { id: 'logs', label: 'Logs', description: 'A denser pattern makes zero-occurrence vs consume-one branches easy to compare.' },
  { id: 'pulse', label: 'Pulse', description: 'Short strings keep the regex star mechanic readable and compact.' },
];

export const TSP_PRESETS: readonly DpPresetOption[] = [
  { id: 'metro', label: 'Metro Loop', description: 'A compact symmetric city map that produces a clear optimal Hamiltonian tour.' },
  { id: 'drone', label: 'Drone Route', description: 'Edge weights vary more sharply, so bad subset transitions stand out.' },
  { id: 'coast', label: 'Coast Hop', description: 'A slightly larger route shows why subset masks need to remember the end city.' },
];

export const TREE_DP_PRESETS: readonly DpPresetOption[] = [
  { id: 'orchard', label: 'Orchard', description: 'Fruit values on a branching tree make include-vs-skip choices easy to follow.' },
  { id: 'campus', label: 'Campus', description: 'A wider tree creates clear postorder aggregation across several children.' },
  { id: 'vault', label: 'Vault', description: 'Heavier leaf rewards make the independent-set backtrack more dramatic.' },
];

export const BITMASK_DP_PRESETS: readonly DpPresetOption[] = [
  { id: 'robots', label: 'Robots', description: 'Assigning robots to charging bays shows subset masks filling from sparse to dense.' },
  { id: 'crews', label: 'Crews', description: 'Crew-to-task costs create several close assignment alternatives.' },
  { id: 'labs', label: 'Labs', description: 'A denser cost matrix highlights why each mask encodes used jobs.' },
];

export const CHT_PRESETS: readonly DpPresetOption[] = [
  { id: 'track', label: 'Track', description: 'Monotone x-values make query order and hull pruning visually clean.' },
  { id: 'metro', label: 'Metro', description: 'A slightly noisier distance sequence shows why older lines become obsolete.' },
  { id: 'pulse', label: 'Pulse', description: 'Compact points keep the line transitions readable in a strip view.' },
];

export const DIVIDE_CONQUER_PRESETS: readonly DpPresetOption[] = [
  { id: 'shifts', label: 'Shifts', description: 'Segmenting workloads into teams gives a clear partition-cost narrative.' },
  { id: 'pods', label: 'Pods', description: 'Balanced numbers make monotone optimal splits easy to spot.' },
  { id: 'freight', label: 'Freight', description: 'Heavier tails force the optimal split range to move steadily right.' },
];

export const KNUTH_PRESETS: readonly DpPresetOption[] = [
  { id: 'chapters', label: 'Chapters', description: 'Adjacent file-merge costs produce a compact interval DP with narrow opt windows.' },
  { id: 'archives', label: 'Archives', description: 'Uneven file sizes make the saved split window more interesting.' },
  { id: 'packets', label: 'Packets', description: 'A short merge chain keeps the Knuth optimization readable and dense.' },
];

export const SOS_PRESETS: readonly DpPresetOption[] = [
  { id: 'signals', label: 'Signals', description: 'Subset values make it easy to see how supersets absorb all of their submasks.' },
  { id: 'radar', label: 'Radar', description: 'Bitmask contributions are clustered, so each SOS stage lights up different families.' },
  { id: 'cache', label: 'Cache', description: 'A denser base array makes the sum-over-subsets propagation feel more dramatic.' },
];

export const PROFILE_PRESETS: readonly DpPresetOption[] = [
  { id: 'tiles', label: 'Tiles', description: 'Classic domino tilings show how frontier masks move from one column to the next.' },
  { id: 'corridor', label: 'Corridor', description: 'A slightly longer board makes recurring profiles and counts easy to compare.' },
  { id: 'lab', label: 'Lab Grid', description: 'Compact profile states expose how a frontier DP reuses the same mask vocabulary.' },
];

const KNAPSACK_TEMPLATES = {
  camp: [
    ['Compass', 2, 6],
    ['Torch', 1, 3],
    ['Rope', 3, 7],
    ['Map', 4, 10],
    ['Flask', 2, 5],
    ['Boots', 5, 12],
  ],
  heist: [
    ['Mask', 1, 4],
    ['Lockpick', 2, 6],
    ['Drone', 5, 15],
    ['EMP', 4, 11],
    ['Vault Key', 3, 9],
    ['Decoder', 2, 7],
  ],
  lab: [
    ['Vial', 1, 2],
    ['Sensor', 2, 6],
    ['Battery', 3, 7],
    ['Microscope', 5, 13],
    ['Chipset', 4, 9],
    ['Sample Box', 3, 8],
  ],
} satisfies Record<string, readonly (readonly [string, number, number])[]>;

const LCS_TEMPLATES = {
  dna: ['ACGTGCA', 'CATGCGA'],
  words: ['DYNAMIC', 'PANORAM'],
  signals: ['ABCADEG', 'BACDAFG'],
} satisfies Record<string, readonly [string, string]>;

const EDIT_TEMPLATES = {
  typo: ['KITTEN', 'SITTING'],
  plural: ['DRAGON', 'DRAGONS'],
  code: ['RENDER', 'READER'],
} satisfies Record<string, readonly [string, string]>;

const MATRIX_CHAIN_TEMPLATES = {
  classic: [30, 35, 15, 5, 10, 20, 25],
  balanced: [8, 12, 9, 14, 11, 13, 10],
  swing: [18, 4, 22, 3, 20, 5, 16],
} satisfies Record<string, readonly number[]>;

const COIN_CHANGE_TEMPLATES = {
  metro: { coins: [1, 3, 4, 7, 9], target: 12 },
  arcade: { coins: [1, 5, 6, 9, 11], target: 15 },
  market: { coins: [1, 2, 5, 8, 10], target: 13 },
} satisfies Record<string, { readonly coins: readonly number[]; readonly target: number }>;

const SUBSET_SUM_TEMPLATES = {
  trail: { numbers: [2, 4, 6, 9, 11, 13, 15], target: 19 },
  laser: { numbers: [3, 5, 7, 8, 10, 12, 14], target: 20 },
  lab: { numbers: [1, 4, 6, 7, 9, 11, 13], target: 18 },
} satisfies Record<string, { readonly numbers: readonly number[]; readonly target: number }>;

const LPS_TEMPLATES = {
  radar: 'RADARXAR',
  phrase: 'CHARACTER',
  signal: 'BANANAGRAM',
} satisfies Record<string, string>;

const BURST_BALLOONS_TEMPLATES = {
  classic: [3, 1, 5, 8, 4, 2],
  zigzag: [2, 7, 1, 9, 3, 6],
  dense: [4, 2, 6, 3, 5, 1],
} satisfies Record<string, readonly number[]>;

const WILDCARD_TEMPLATES = {
  globs: ['ABRACAD', 'A*RA?A*'],
  routes: ['ROUTERX', 'R*UT?R*'],
  codes: ['ZXCVBNM', 'Z*V?*NM'],
} satisfies Record<string, readonly [string, string]>;

const LIS_TEMPLATES = {
  wave: [3, 1, 4, 2, 5, 0, 6, 7],
  skyline: [2, 5, 3, 7, 4, 8, 6, 9],
  rebound: [9, 1, 3, 2, 5, 4, 7, 8],
} satisfies Record<string, readonly number[]>;

const REGEX_TEMPLATES = {
  alias: ['AABBC', 'A.*BC'],
  logs: ['MISSIONS', 'MI.*I.*S'],
  pulse: ['ABCCD', 'A.*C.D'],
} satisfies Record<string, readonly [string, string]>;

const TSP_TEMPLATES = {
  metro: {
    labels: ['A', 'B', 'C', 'D', 'E'],
    distances: [
      [0, 4, 8, 7, 6],
      [4, 0, 5, 6, 3],
      [8, 5, 0, 4, 7],
      [7, 6, 4, 0, 5],
      [6, 3, 7, 5, 0],
    ],
  },
  drone: {
    labels: ['A', 'B', 'C', 'D', 'E'],
    distances: [
      [0, 6, 9, 4, 7],
      [6, 0, 5, 8, 3],
      [9, 5, 0, 6, 4],
      [4, 8, 6, 0, 5],
      [7, 3, 4, 5, 0],
    ],
  },
  coast: {
    labels: ['A', 'B', 'C', 'D', 'E'],
    distances: [
      [0, 5, 7, 6, 8],
      [5, 0, 4, 7, 5],
      [7, 4, 0, 3, 6],
      [6, 7, 3, 0, 4],
      [8, 5, 6, 4, 0],
    ],
  },
} satisfies Record<string, { readonly labels: readonly string[]; readonly distances: readonly (readonly number[])[] }>;

const TREE_DP_TEMPLATES = {
  orchard: [
    ['A', 7, null],
    ['B', 4, 'A'],
    ['C', 6, 'A'],
    ['D', 5, 'B'],
    ['E', 3, 'B'],
    ['F', 8, 'C'],
    ['G', 2, 'C'],
  ],
  campus: [
    ['A', 6, null],
    ['B', 5, 'A'],
    ['C', 4, 'A'],
    ['D', 7, 'A'],
    ['E', 3, 'B'],
    ['F', 8, 'C'],
    ['G', 2, 'D'],
  ],
  vault: [
    ['A', 5, null],
    ['B', 3, 'A'],
    ['C', 4, 'A'],
    ['D', 9, 'B'],
    ['E', 6, 'B'],
    ['F', 7, 'C'],
    ['G', 5, 'C'],
  ],
} satisfies Record<string, readonly (readonly [string, number, string | null])[]>;

const BITMASK_DP_TEMPLATES = {
  robots: {
    workers: ['R1', 'R2', 'R3', 'R4'],
    jobs: ['B1', 'B2', 'B3', 'B4'],
    costs: [
      [4, 6, 8, 5],
      [7, 3, 6, 4],
      [5, 8, 4, 6],
      [6, 5, 7, 3],
    ],
  },
  crews: {
    workers: ['C1', 'C2', 'C3', 'C4'],
    jobs: ['T1', 'T2', 'T3', 'T4'],
    costs: [
      [9, 4, 7, 6],
      [6, 5, 8, 3],
      [5, 7, 4, 6],
      [8, 6, 5, 4],
    ],
  },
  labs: {
    workers: ['L1', 'L2', 'L3', 'L4'],
    jobs: ['J1', 'J2', 'J3', 'J4'],
    costs: [
      [5, 7, 4, 6],
      [6, 4, 8, 5],
      [7, 5, 6, 4],
      [4, 6, 5, 7],
    ],
  },
} satisfies Record<string, { readonly workers: readonly string[]; readonly jobs: readonly string[]; readonly costs: readonly (readonly number[])[] }>;

const CHT_TEMPLATES = {
  track: { xValues: [1, 3, 5, 7, 9, 11], transitionCost: 4 },
  metro: { xValues: [2, 4, 6, 9, 12, 15], transitionCost: 5 },
  pulse: { xValues: [1, 2, 4, 6, 8, 10], transitionCost: 3 },
} satisfies Record<string, { readonly xValues: readonly number[]; readonly transitionCost: number }>;

const DIVIDE_CONQUER_TEMPLATES = {
  shifts: { values: [3, 5, 2, 6, 4, 7, 3], groups: 3 },
  pods: { values: [2, 4, 5, 3, 6, 4, 5], groups: 3 },
  freight: { values: [4, 3, 7, 5, 8, 6, 4], groups: 3 },
} satisfies Record<string, { readonly values: readonly number[]; readonly groups: number }>;

const KNUTH_TEMPLATES = {
  chapters: [5, 2, 4, 7, 3, 6],
  archives: [6, 3, 5, 8, 4, 7],
  packets: [4, 2, 6, 3, 5, 4],
} satisfies Record<string, readonly number[]>;

const SOS_TEMPLATES = {
  signals: { bitCount: 3, baseValues: [2, 5, 1, 4, 3, 6, 2, 7], focusMask: 0b111 },
  radar: { bitCount: 3, baseValues: [1, 4, 2, 3, 5, 2, 6, 4], focusMask: 0b101 },
  cache: { bitCount: 4, baseValues: [1, 3, 2, 5, 4, 2, 6, 3, 2, 4, 5, 1, 3, 2, 4, 6], focusMask: 0b1111 },
} satisfies Record<string, { readonly bitCount: number; readonly baseValues: readonly number[]; readonly focusMask: number }>;

const PROFILE_TEMPLATES = {
  tiles: { columns: 5, height: 2 },
  corridor: { columns: 6, height: 2 },
  lab: { columns: 7, height: 2 },
} satisfies Record<string, { readonly columns: number; readonly height: number }>;

export function createKnapsackScenario(size: number, presetId: string): KnapsackScenario {
  const preset = resolvePreset(KNAPSACK_PRESETS, presetId);
  const source = KNAPSACK_TEMPLATES[preset.id as keyof typeof KNAPSACK_TEMPLATES] ?? KNAPSACK_TEMPLATES.camp;
  const items = source.slice(0, size).map(([label, weight, value], index) => ({
    id: `item-${index}`,
    label,
    weight,
    value,
  }));
  const weightSum = items.reduce((total, item) => total + item.weight, 0);
  const capacity = Math.max(5, Math.min(weightSum - 1, Math.round(weightSum * 0.58)));

  return {
    kind: 'knapsack-01',
    presetId: preset.id,
    presetLabel: preset.label,
    presetDescription: preset.description,
    capacity,
    items,
  };
}

export function createLcsScenario(size: number, presetId: string): LcsScenario {
  const preset = resolvePreset(LCS_PRESETS, presetId);
  const [left, right] = LCS_TEMPLATES[preset.id as keyof typeof LCS_TEMPLATES] ?? LCS_TEMPLATES.dna;
  return {
    kind: 'longest-common-subsequence',
    presetId: preset.id,
    presetLabel: preset.label,
    presetDescription: preset.description,
    source: fitLength(left, size),
    target: fitLength(right, size),
  };
}

export function createEditDistanceScenario(size: number, presetId: string): EditDistanceScenario {
  const preset = resolvePreset(EDIT_DISTANCE_PRESETS, presetId);
  const [left, right] = EDIT_TEMPLATES[preset.id as keyof typeof EDIT_TEMPLATES] ?? EDIT_TEMPLATES.typo;
  return {
    kind: 'edit-distance',
    presetId: preset.id,
    presetLabel: preset.label,
    presetDescription: preset.description,
    source: fitLength(left, size),
    target: fitLength(right, size + (preset.id === 'plural' ? 1 : 0)),
  };
}

export function createMatrixChainScenario(size: number, presetId: string): MatrixChainScenario {
  const preset = resolvePreset(MATRIX_CHAIN_PRESETS, presetId);
  const dims = MATRIX_CHAIN_TEMPLATES[preset.id as keyof typeof MATRIX_CHAIN_TEMPLATES] ?? MATRIX_CHAIN_TEMPLATES.classic;
  return {
    kind: 'matrix-chain-multiplication',
    presetId: preset.id,
    presetLabel: preset.label,
    presetDescription: preset.description,
    dimensions: dims.slice(0, size + 1),
  };
}

export function createCoinChangeScenario(size: number, presetId: string): CoinChangeScenario {
  const preset = resolvePreset(COIN_CHANGE_PRESETS, presetId);
  const source = COIN_CHANGE_TEMPLATES[preset.id as keyof typeof COIN_CHANGE_TEMPLATES] ?? COIN_CHANGE_TEMPLATES.metro;
  const coins = source.coins.slice(0, size).sort((left, right) => left - right);
  const target = Math.max(coins[coins.length - 1] ?? 1, source.target);
  return {
    kind: 'coin-change',
    presetId: preset.id,
    presetLabel: preset.label,
    presetDescription: preset.description,
    coins,
    target,
  };
}

export function createSubsetSumScenario(size: number, presetId: string): SubsetSumScenario {
  const preset = resolvePreset(SUBSET_SUM_PRESETS, presetId);
  const source = SUBSET_SUM_TEMPLATES[preset.id as keyof typeof SUBSET_SUM_TEMPLATES] ?? SUBSET_SUM_TEMPLATES.trail;
  const numbers = source.numbers.slice(0, size);
  const maxPossible = numbers.reduce((total, value) => total + value, 0);
  return {
    kind: 'subset-sum',
    presetId: preset.id,
    presetLabel: preset.label,
    presetDescription: preset.description,
    numbers,
    target: Math.min(source.target, maxPossible - 1),
  };
}

export function createLpsScenario(size: number, presetId: string): LpsScenario {
  const preset = resolvePreset(LPS_PRESETS, presetId);
  const value = LPS_TEMPLATES[preset.id as keyof typeof LPS_TEMPLATES] ?? LPS_TEMPLATES.radar;
  return {
    kind: 'longest-palindromic-subsequence',
    presetId: preset.id,
    presetLabel: preset.label,
    presetDescription: preset.description,
    source: fitLength(value, size),
  };
}

export function createBurstBalloonsScenario(size: number, presetId: string): BurstBalloonsScenario {
  const preset = resolvePreset(BURST_BALLOONS_PRESETS, presetId);
  const values = BURST_BALLOONS_TEMPLATES[preset.id as keyof typeof BURST_BALLOONS_TEMPLATES] ?? BURST_BALLOONS_TEMPLATES.classic;
  return {
    kind: 'burst-balloons',
    presetId: preset.id,
    presetLabel: preset.label,
    presetDescription: preset.description,
    balloons: values.slice(0, size),
  };
}

export function createWildcardMatchingScenario(size: number, presetId: string): WildcardMatchingScenario {
  const preset = resolvePreset(WILDCARD_PRESETS, presetId);
  const [source, pattern] = WILDCARD_TEMPLATES[preset.id as keyof typeof WILDCARD_TEMPLATES] ?? WILDCARD_TEMPLATES.globs;
  return {
    kind: 'wildcard-matching',
    presetId: preset.id,
    presetLabel: preset.label,
    presetDescription: preset.description,
    source: fitLength(source, size),
    target: fitLength(pattern, size),
  };
}

export function createLisScenario(size: number, presetId: string): LisScenario {
  const preset = resolvePreset(LIS_PRESETS, presetId);
  const source = LIS_TEMPLATES[preset.id as keyof typeof LIS_TEMPLATES] ?? LIS_TEMPLATES.wave;
  return {
    kind: 'longest-increasing-subsequence',
    presetId: preset.id,
    presetLabel: preset.label,
    presetDescription: preset.description,
    values: source.slice(0, size),
  };
}

export function createClimbingStairsScenario(size: number, presetId: string): ClimbingStairsScenario {
  const preset = resolvePreset(CLIMBING_STAIRS_PRESETS, presetId);
  return {
    kind: 'climbing-stairs',
    presetId: preset.id,
    presetLabel: preset.label,
    presetDescription: preset.description,
    steps: Math.max(3, size),
  };
}

export function createFibonacciScenario(size: number, presetId: string): FibonacciScenario {
  const preset = resolvePreset(FIBONACCI_PRESETS, presetId);
  return {
    kind: 'fibonacci-dp',
    presetId: preset.id,
    presetLabel: preset.label,
    presetDescription: preset.description,
    n: Math.max(3, size),
  };
}

export function createRegexMatchingScenario(size: number, presetId: string): RegexMatchingScenario {
  const preset = resolvePreset(REGEX_PRESETS, presetId);
  const [source, pattern] = REGEX_TEMPLATES[preset.id as keyof typeof REGEX_TEMPLATES] ?? REGEX_TEMPLATES.alias;
  return {
    kind: 'regex-matching-dp',
    presetId: preset.id,
    presetLabel: preset.label,
    presetDescription: preset.description,
    source: fitLength(source, size),
    target: pattern,
  };
}

export function createTravelingSalesmanScenario(size: number, presetId: string): TravelingSalesmanScenario {
  const preset = resolvePreset(TSP_PRESETS, presetId);
  const source = TSP_TEMPLATES[preset.id as keyof typeof TSP_TEMPLATES] ?? TSP_TEMPLATES.metro;
  const labels = source.labels.slice(0, size);
  const distances = source.distances
    .slice(0, size)
    .map((row) => row.slice(0, size));

  return {
    kind: 'traveling-salesman-dp',
    presetId: preset.id,
    presetLabel: preset.label,
    presetDescription: preset.description,
    labels,
    distances,
    startIndex: 0,
  };
}

export function createTreeDpScenario(size: number, presetId: string): TreeDpScenario {
  const preset = resolvePreset(TREE_DP_PRESETS, presetId);
  const source = TREE_DP_TEMPLATES[preset.id as keyof typeof TREE_DP_TEMPLATES] ?? TREE_DP_TEMPLATES.orchard;
  const nodes = source.slice(0, Math.max(5, Math.min(size, source.length))).map(([label, weight, parentId]) => ({
    id: label,
    label,
    weight,
    parentId,
  }));
  return {
    kind: 'dp-on-trees',
    presetId: preset.id,
    presetLabel: preset.label,
    presetDescription: preset.description,
    nodes,
    rootId: nodes[0]?.id ?? 'A',
  };
}

export function createBitmaskDpScenario(size: number, presetId: string): BitmaskDpScenario {
  const preset = resolvePreset(BITMASK_DP_PRESETS, presetId);
  const source = BITMASK_DP_TEMPLATES[preset.id as keyof typeof BITMASK_DP_TEMPLATES] ?? BITMASK_DP_TEMPLATES.robots;
  const dimension = Math.max(3, Math.min(size, source.workers.length));
  return {
    kind: 'dp-with-bitmask',
    presetId: preset.id,
    presetLabel: preset.label,
    presetDescription: preset.description,
    workers: source.workers.slice(0, dimension),
    jobs: source.jobs.slice(0, dimension),
    costs: source.costs.slice(0, dimension).map((row) => row.slice(0, dimension)),
  };
}

export function createChtDpScenario(size: number, presetId: string): ChtDpScenario {
  const preset = resolvePreset(CHT_PRESETS, presetId);
  const source = CHT_TEMPLATES[preset.id as keyof typeof CHT_TEMPLATES] ?? CHT_TEMPLATES.track;
  return {
    kind: 'dp-convex-hull-trick',
    presetId: preset.id,
    presetLabel: preset.label,
    presetDescription: preset.description,
    xValues: source.xValues.slice(0, Math.max(4, Math.min(size, source.xValues.length))),
    transitionCost: source.transitionCost,
  };
}

export function createDivideConquerDpScenario(size: number, presetId: string): DivideConquerDpScenario {
  const preset = resolvePreset(DIVIDE_CONQUER_PRESETS, presetId);
  const source = DIVIDE_CONQUER_TEMPLATES[preset.id as keyof typeof DIVIDE_CONQUER_TEMPLATES] ?? DIVIDE_CONQUER_TEMPLATES.shifts;
  const values = source.values.slice(0, Math.max(5, Math.min(size, source.values.length)));
  return {
    kind: 'divide-conquer-dp-optimization',
    presetId: preset.id,
    presetLabel: preset.label,
    presetDescription: preset.description,
    values,
    groups: Math.min(source.groups, values.length),
  };
}

export function createKnuthDpScenario(size: number, presetId: string): KnuthDpScenario {
  const preset = resolvePreset(KNUTH_PRESETS, presetId);
  const files = (KNUTH_TEMPLATES[preset.id as keyof typeof KNUTH_TEMPLATES] ?? KNUTH_TEMPLATES.chapters)
    .slice(0, Math.max(4, Math.min(size, 6)));
  return {
    kind: 'knuth-dp-optimization',
    presetId: preset.id,
    presetLabel: preset.label,
    presetDescription: preset.description,
    files,
  };
}

export function createSosDpScenario(size: number, presetId: string): SosDpScenario {
  const preset = resolvePreset(SOS_PRESETS, presetId);
  const source = SOS_TEMPLATES[preset.id as keyof typeof SOS_TEMPLATES] ?? SOS_TEMPLATES.signals;
  const bitCount = Math.max(3, Math.min(size, source.bitCount));
  const maskCount = 1 << bitCount;
  return {
    kind: 'sos-dp',
    presetId: preset.id,
    presetLabel: preset.label,
    presetDescription: preset.description,
    bitCount,
    baseValues: source.baseValues.slice(0, maskCount),
    focusMask: Math.min(source.focusMask, maskCount - 1),
  };
}

export function createProfileDpScenario(size: number, presetId: string): ProfileDpScenario {
  const preset = resolvePreset(PROFILE_PRESETS, presetId);
  const source = PROFILE_TEMPLATES[preset.id as keyof typeof PROFILE_TEMPLATES] ?? PROFILE_TEMPLATES.tiles;
  return {
    kind: 'profile-dp',
    presetId: preset.id,
    presetLabel: preset.label,
    presetDescription: preset.description,
    columns: Math.max(4, Math.min(size, source.columns)),
    height: source.height,
  };
}

function resolvePreset(options: readonly DpPresetOption[], presetId: string): DpPresetOption {
  return options.find((option) => option.id === presetId) ?? options[0]!;
}

function fitLength(value: string, size: number): string {
  if (value.length === size) return value;
  if (value.length > size) return value.slice(0, size);
  let result = value;
  while (result.length < size) {
    result += value[result.length % value.length] ?? 'A';
  }
  return result;
}
