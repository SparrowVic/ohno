import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import { DpPresetOption } from '../../../models/dp';

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

interface DpPresetKeys {
  readonly label: string;
  readonly description: string;
}

function presetKeys(baseKey: string): DpPresetKeys {
  return {
    label: t(`${baseKey}.label`),
    description: t(`${baseKey}.description`),
  };
}

function createPresetOption(id: string, keys: DpPresetKeys): DpPresetOption {
  return {
    id,
    label: keys.label,
    description: keys.description,
  };
}

const DP_PRESET_KEY = {
  knapsack: {
    camp: presetKeys('features.algorithms.scenarios.dp.knapsack.camp'),
    heist: presetKeys('features.algorithms.scenarios.dp.knapsack.heist'),
    lab: presetKeys('features.algorithms.scenarios.dp.knapsack.lab'),
  },
  lcs: {
    dna: presetKeys('features.algorithms.scenarios.dp.lcs.dna'),
    words: presetKeys('features.algorithms.scenarios.dp.lcs.words'),
    signals: presetKeys('features.algorithms.scenarios.dp.lcs.signals'),
  },
  editDistance: {
    typo: presetKeys('features.algorithms.scenarios.dp.editDistance.typo'),
    plural: presetKeys('features.algorithms.scenarios.dp.editDistance.plural'),
    code: presetKeys('features.algorithms.scenarios.dp.editDistance.code'),
  },
  matrixChain: {
    classic: presetKeys('features.algorithms.scenarios.dp.matrixChain.classic'),
    balanced: presetKeys('features.algorithms.scenarios.dp.matrixChain.balanced'),
    swing: presetKeys('features.algorithms.scenarios.dp.matrixChain.swing'),
  },
  coinChange: {
    metro: presetKeys('features.algorithms.scenarios.dp.coinChange.metro'),
    arcade: presetKeys('features.algorithms.scenarios.dp.coinChange.arcade'),
    market: presetKeys('features.algorithms.scenarios.dp.coinChange.market'),
  },
  subsetSum: {
    trail: presetKeys('features.algorithms.scenarios.dp.subsetSum.trail'),
    laser: presetKeys('features.algorithms.scenarios.dp.subsetSum.laser'),
    lab: presetKeys('features.algorithms.scenarios.dp.subsetSum.lab'),
  },
  lps: {
    radar: presetKeys('features.algorithms.scenarios.dp.lps.radar'),
    phrase: presetKeys('features.algorithms.scenarios.dp.lps.phrase'),
    signal: presetKeys('features.algorithms.scenarios.dp.lps.signal'),
  },
  burstBalloons: {
    classic: presetKeys('features.algorithms.scenarios.dp.burstBalloons.classic'),
    zigzag: presetKeys('features.algorithms.scenarios.dp.burstBalloons.zigzag'),
    dense: presetKeys('features.algorithms.scenarios.dp.burstBalloons.dense'),
  },
  wildcard: {
    globs: presetKeys('features.algorithms.scenarios.dp.wildcard.globs'),
    routes: presetKeys('features.algorithms.scenarios.dp.wildcard.routes'),
    codes: presetKeys('features.algorithms.scenarios.dp.wildcard.codes'),
  },
  lis: {
    wave: presetKeys('features.algorithms.scenarios.dp.lis.wave'),
    skyline: presetKeys('features.algorithms.scenarios.dp.lis.skyline'),
    rebound: presetKeys('features.algorithms.scenarios.dp.lis.rebound'),
  },
  climbingStairs: {
    tower: presetKeys('features.algorithms.scenarios.dp.climbingStairs.tower'),
    metro: presetKeys('features.algorithms.scenarios.dp.climbingStairs.metro'),
    summit: presetKeys('features.algorithms.scenarios.dp.climbingStairs.summit'),
  },
  fibonacci: {
    classic: presetKeys('features.algorithms.scenarios.dp.fibonacci.classic'),
    growth: presetKeys('features.algorithms.scenarios.dp.fibonacci.growth'),
    signal: presetKeys('features.algorithms.scenarios.dp.fibonacci.signal'),
  },
  regex: {
    alias: presetKeys('features.algorithms.scenarios.dp.regex.alias'),
    logs: presetKeys('features.algorithms.scenarios.dp.regex.logs'),
    pulse: presetKeys('features.algorithms.scenarios.dp.regex.pulse'),
  },
  travelingSalesman: {
    metro: presetKeys('features.algorithms.scenarios.dp.travelingSalesman.metro'),
    drone: presetKeys('features.algorithms.scenarios.dp.travelingSalesman.drone'),
    coast: presetKeys('features.algorithms.scenarios.dp.travelingSalesman.coast'),
  },
  treeDp: {
    orchard: presetKeys('features.algorithms.scenarios.dp.treeDp.orchard'),
    campus: presetKeys('features.algorithms.scenarios.dp.treeDp.campus'),
    vault: presetKeys('features.algorithms.scenarios.dp.treeDp.vault'),
  },
  bitmaskDp: {
    robots: presetKeys('features.algorithms.scenarios.dp.bitmaskDp.robots'),
    crews: presetKeys('features.algorithms.scenarios.dp.bitmaskDp.crews'),
    labs: presetKeys('features.algorithms.scenarios.dp.bitmaskDp.labs'),
  },
  cht: {
    track: presetKeys('features.algorithms.scenarios.dp.cht.track'),
    metro: presetKeys('features.algorithms.scenarios.dp.cht.metro'),
    pulse: presetKeys('features.algorithms.scenarios.dp.cht.pulse'),
  },
  divideConquer: {
    shifts: presetKeys('features.algorithms.scenarios.dp.divideConquer.shifts'),
    pods: presetKeys('features.algorithms.scenarios.dp.divideConquer.pods'),
    freight: presetKeys('features.algorithms.scenarios.dp.divideConquer.freight'),
  },
  knuth: {
    chapters: presetKeys('features.algorithms.scenarios.dp.knuth.chapters'),
    archives: presetKeys('features.algorithms.scenarios.dp.knuth.archives'),
    packets: presetKeys('features.algorithms.scenarios.dp.knuth.packets'),
  },
  sos: {
    signals: presetKeys('features.algorithms.scenarios.dp.sos.signals'),
    radar: presetKeys('features.algorithms.scenarios.dp.sos.radar'),
    cache: presetKeys('features.algorithms.scenarios.dp.sos.cache'),
  },
  profile: {
    tiles: presetKeys('features.algorithms.scenarios.dp.profile.tiles'),
    corridor: presetKeys('features.algorithms.scenarios.dp.profile.corridor'),
    lab: presetKeys('features.algorithms.scenarios.dp.profile.lab'),
  },
} as const;

export const KNAPSACK_PRESETS: readonly DpPresetOption[] = [
  createPresetOption('camp', DP_PRESET_KEY.knapsack.camp),
  createPresetOption('heist', DP_PRESET_KEY.knapsack.heist),
  createPresetOption('lab', DP_PRESET_KEY.knapsack.lab),
];

export const LCS_PRESETS: readonly DpPresetOption[] = [
  createPresetOption('dna', DP_PRESET_KEY.lcs.dna),
  createPresetOption('words', DP_PRESET_KEY.lcs.words),
  createPresetOption('signals', DP_PRESET_KEY.lcs.signals),
];

export const EDIT_DISTANCE_PRESETS: readonly DpPresetOption[] = [
  createPresetOption('typo', DP_PRESET_KEY.editDistance.typo),
  createPresetOption('plural', DP_PRESET_KEY.editDistance.plural),
  createPresetOption('code', DP_PRESET_KEY.editDistance.code),
];

export const MATRIX_CHAIN_PRESETS: readonly DpPresetOption[] = [
  createPresetOption('classic', DP_PRESET_KEY.matrixChain.classic),
  createPresetOption('balanced', DP_PRESET_KEY.matrixChain.balanced),
  createPresetOption('swing', DP_PRESET_KEY.matrixChain.swing),
];

export const COIN_CHANGE_PRESETS: readonly DpPresetOption[] = [
  createPresetOption('metro', DP_PRESET_KEY.coinChange.metro),
  createPresetOption('arcade', DP_PRESET_KEY.coinChange.arcade),
  createPresetOption('market', DP_PRESET_KEY.coinChange.market),
];

export const SUBSET_SUM_PRESETS: readonly DpPresetOption[] = [
  createPresetOption('trail', DP_PRESET_KEY.subsetSum.trail),
  createPresetOption('laser', DP_PRESET_KEY.subsetSum.laser),
  createPresetOption('lab', DP_PRESET_KEY.subsetSum.lab),
];

export const LPS_PRESETS: readonly DpPresetOption[] = [
  createPresetOption('radar', DP_PRESET_KEY.lps.radar),
  createPresetOption('phrase', DP_PRESET_KEY.lps.phrase),
  createPresetOption('signal', DP_PRESET_KEY.lps.signal),
];

export const BURST_BALLOONS_PRESETS: readonly DpPresetOption[] = [
  createPresetOption('classic', DP_PRESET_KEY.burstBalloons.classic),
  createPresetOption('zigzag', DP_PRESET_KEY.burstBalloons.zigzag),
  createPresetOption('dense', DP_PRESET_KEY.burstBalloons.dense),
];

export const WILDCARD_PRESETS: readonly DpPresetOption[] = [
  createPresetOption('globs', DP_PRESET_KEY.wildcard.globs),
  createPresetOption('routes', DP_PRESET_KEY.wildcard.routes),
  createPresetOption('codes', DP_PRESET_KEY.wildcard.codes),
];

export const LIS_PRESETS: readonly DpPresetOption[] = [
  createPresetOption('wave', DP_PRESET_KEY.lis.wave),
  createPresetOption('skyline', DP_PRESET_KEY.lis.skyline),
  createPresetOption('rebound', DP_PRESET_KEY.lis.rebound),
];

export const CLIMBING_STAIRS_PRESETS: readonly DpPresetOption[] = [
  createPresetOption('tower', DP_PRESET_KEY.climbingStairs.tower),
  createPresetOption('metro', DP_PRESET_KEY.climbingStairs.metro),
  createPresetOption('summit', DP_PRESET_KEY.climbingStairs.summit),
];

export const FIBONACCI_PRESETS: readonly DpPresetOption[] = [
  createPresetOption('classic', DP_PRESET_KEY.fibonacci.classic),
  createPresetOption('growth', DP_PRESET_KEY.fibonacci.growth),
  createPresetOption('signal', DP_PRESET_KEY.fibonacci.signal),
];

export const REGEX_PRESETS: readonly DpPresetOption[] = [
  createPresetOption('alias', DP_PRESET_KEY.regex.alias),
  createPresetOption('logs', DP_PRESET_KEY.regex.logs),
  createPresetOption('pulse', DP_PRESET_KEY.regex.pulse),
];

export const TSP_PRESETS: readonly DpPresetOption[] = [
  createPresetOption('metro', DP_PRESET_KEY.travelingSalesman.metro),
  createPresetOption('drone', DP_PRESET_KEY.travelingSalesman.drone),
  createPresetOption('coast', DP_PRESET_KEY.travelingSalesman.coast),
];

export const TREE_DP_PRESETS: readonly DpPresetOption[] = [
  createPresetOption('orchard', DP_PRESET_KEY.treeDp.orchard),
  createPresetOption('campus', DP_PRESET_KEY.treeDp.campus),
  createPresetOption('vault', DP_PRESET_KEY.treeDp.vault),
];

export const BITMASK_DP_PRESETS: readonly DpPresetOption[] = [
  createPresetOption('robots', DP_PRESET_KEY.bitmaskDp.robots),
  createPresetOption('crews', DP_PRESET_KEY.bitmaskDp.crews),
  createPresetOption('labs', DP_PRESET_KEY.bitmaskDp.labs),
];

export const CHT_PRESETS: readonly DpPresetOption[] = [
  createPresetOption('track', DP_PRESET_KEY.cht.track),
  createPresetOption('metro', DP_PRESET_KEY.cht.metro),
  createPresetOption('pulse', DP_PRESET_KEY.cht.pulse),
];

export const DIVIDE_CONQUER_PRESETS: readonly DpPresetOption[] = [
  createPresetOption('shifts', DP_PRESET_KEY.divideConquer.shifts),
  createPresetOption('pods', DP_PRESET_KEY.divideConquer.pods),
  createPresetOption('freight', DP_PRESET_KEY.divideConquer.freight),
];

export const KNUTH_PRESETS: readonly DpPresetOption[] = [
  createPresetOption('chapters', DP_PRESET_KEY.knuth.chapters),
  createPresetOption('archives', DP_PRESET_KEY.knuth.archives),
  createPresetOption('packets', DP_PRESET_KEY.knuth.packets),
];

export const SOS_PRESETS: readonly DpPresetOption[] = [
  createPresetOption('signals', DP_PRESET_KEY.sos.signals),
  createPresetOption('radar', DP_PRESET_KEY.sos.radar),
  createPresetOption('cache', DP_PRESET_KEY.sos.cache),
];

export const PROFILE_PRESETS: readonly DpPresetOption[] = [
  createPresetOption('tiles', DP_PRESET_KEY.profile.tiles),
  createPresetOption('corridor', DP_PRESET_KEY.profile.corridor),
  createPresetOption('lab', DP_PRESET_KEY.profile.lab),
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
