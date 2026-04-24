import { marker as t } from '@jsverse/transloco-keys-manager/marker';

import { StringPresetOption } from '../../../models/string';

interface BaseStringScenario {
  readonly presetId: string;
  readonly presetLabel: string;
  readonly presetDescription: string;
}

export interface KmpScenario extends BaseStringScenario {
  readonly kind: 'kmp-pattern-matching';
  readonly text: string;
  readonly pattern: string;
}

export interface RabinKarpScenario extends BaseStringScenario {
  readonly kind: 'rabin-karp';
  readonly text: string;
  readonly pattern: string;
  readonly base: number;
  readonly mod: number;
}

export interface ZAlgorithmScenario extends BaseStringScenario {
  readonly kind: 'z-algorithm';
  readonly pattern: string;
  readonly text: string;
}

export interface ManacherScenario extends BaseStringScenario {
  readonly kind: 'manacher';
  readonly source: string;
}

export interface AhoCorasickScenario extends BaseStringScenario {
  readonly kind: 'aho-corasick';
  readonly text: string;
  readonly patterns: readonly string[];
}

export interface SuffixArrayScenario extends BaseStringScenario {
  readonly kind: 'suffix-array-construction';
  readonly source: string;
}

export interface SuffixArrayLcpScenario extends BaseStringScenario {
  readonly kind: 'suffix-array-lcp-kasai';
  readonly source: string;
}

export interface PalindromicTreeScenario extends BaseStringScenario {
  readonly kind: 'palindromic-tree';
  readonly source: string;
}

export interface BurrowsWheelerScenario extends BaseStringScenario {
  readonly kind: 'burrows-wheeler-transform';
  readonly source: string;
}

export interface RleScenario extends BaseStringScenario {
  readonly kind: 'run-length-encoding';
  readonly source: string;
}

export interface HuffmanScenario extends BaseStringScenario {
  readonly kind: 'huffman-coding';
  readonly source: string;
}

interface StringPresetKeys {
  readonly label: string;
  readonly description: string;
}

function presetKeys(baseKey: string): StringPresetKeys {
  return {
    label: t(`${baseKey}.label`),
    description: t(`${baseKey}.description`),
  };
}

function createPresetOption(id: string, keys: StringPresetKeys): StringPresetOption {
  return {
    id,
    label: keys.label,
    description: keys.description,
  };
}

const STRING_PRESET_KEY = {
  kmp: {
    overlap: presetKeys('features.algorithms.scenarios.string.kmp.overlap'),
    dna: presetKeys('features.algorithms.scenarios.string.kmp.dna'),
    signal: presetKeys('features.algorithms.scenarios.string.kmp.signal'),
  },
  rabinKarp: {
    alarm: presetKeys('features.algorithms.scenarios.string.rabinKarp.alarm'),
    forensics: presetKeys('features.algorithms.scenarios.string.rabinKarp.forensics'),
    neon: presetKeys('features.algorithms.scenarios.string.rabinKarp.neon'),
  },
  zAlgorithm: {
    classic: presetKeys('features.algorithms.scenarios.string.zAlgorithm.classic'),
    genome: presetKeys('features.algorithms.scenarios.string.zAlgorithm.genome'),
    log: presetKeys('features.algorithms.scenarios.string.zAlgorithm.log'),
  },
  manacher: {
    banana: presetKeys('features.algorithms.scenarios.string.manacher.banana'),
    symmetry: presetKeys('features.algorithms.scenarios.string.manacher.symmetry'),
    mixed: presetKeys('features.algorithms.scenarios.string.manacher.mixed'),
  },
  ahoCorasick: {
    classic: presetKeys('features.algorithms.scenarios.string.ahoCorasick.classic'),
    genome: presetKeys('features.algorithms.scenarios.string.ahoCorasick.genome'),
    alerts: presetKeys('features.algorithms.scenarios.string.ahoCorasick.alerts'),
  },
  suffixArray: {
    banana: presetKeys('features.algorithms.scenarios.string.suffixArray.banana'),
    mississippi: presetKeys('features.algorithms.scenarios.string.suffixArray.mississippi'),
    abracadabra: presetKeys('features.algorithms.scenarios.string.suffixArray.abracadabra'),
  },
  suffixArrayLcp: {
    banana: presetKeys('features.algorithms.scenarios.string.suffixArrayLcp.banana'),
    mississippi: presetKeys('features.algorithms.scenarios.string.suffixArrayLcp.mississippi'),
    abracadabra: presetKeys('features.algorithms.scenarios.string.suffixArrayLcp.abracadabra'),
  },
  palindromicTree: {
    banana: presetKeys('features.algorithms.scenarios.string.palindromicTree.banana'),
    symmetry: presetKeys('features.algorithms.scenarios.string.palindromicTree.symmetry'),
    mixed: presetKeys('features.algorithms.scenarios.string.palindromicTree.mixed'),
  },
  rle: {
    runs: presetKeys('features.algorithms.scenarios.string.rle.runs'),
    mixed: presetKeys('features.algorithms.scenarios.string.rle.mixed'),
    worst: presetKeys('features.algorithms.scenarios.string.rle.worst'),
  },
  huffman: {
    classic: presetKeys('features.algorithms.scenarios.string.huffman.classic'),
    uniform: presetKeys('features.algorithms.scenarios.string.huffman.uniform'),
    natural: presetKeys('features.algorithms.scenarios.string.huffman.natural'),
  },
  bwt: {
    banana: presetKeys('features.algorithms.scenarios.string.bwt.banana'),
    panama: presetKeys('features.algorithms.scenarios.string.bwt.panama'),
    mississippi: presetKeys('features.algorithms.scenarios.string.bwt.mississippi'),
  },
} as const;

export const KMP_PRESETS: readonly StringPresetOption[] = [
  createPresetOption('overlap', STRING_PRESET_KEY.kmp.overlap),
  createPresetOption('dna', STRING_PRESET_KEY.kmp.dna),
  createPresetOption('signal', STRING_PRESET_KEY.kmp.signal),
];

export const RABIN_KARP_PRESETS: readonly StringPresetOption[] = [
  createPresetOption('alarm', STRING_PRESET_KEY.rabinKarp.alarm),
  createPresetOption('forensics', STRING_PRESET_KEY.rabinKarp.forensics),
  createPresetOption('neon', STRING_PRESET_KEY.rabinKarp.neon),
];

export const Z_ALGORITHM_PRESETS: readonly StringPresetOption[] = [
  createPresetOption('classic', STRING_PRESET_KEY.zAlgorithm.classic),
  createPresetOption('genome', STRING_PRESET_KEY.zAlgorithm.genome),
  createPresetOption('log', STRING_PRESET_KEY.zAlgorithm.log),
];

export const MANACHER_PRESETS: readonly StringPresetOption[] = [
  createPresetOption('banana', STRING_PRESET_KEY.manacher.banana),
  createPresetOption('symmetry', STRING_PRESET_KEY.manacher.symmetry),
  createPresetOption('mixed', STRING_PRESET_KEY.manacher.mixed),
];

export const AHO_CORASICK_PRESETS: readonly StringPresetOption[] = [
  createPresetOption('classic', STRING_PRESET_KEY.ahoCorasick.classic),
  createPresetOption('genome', STRING_PRESET_KEY.ahoCorasick.genome),
  createPresetOption('alerts', STRING_PRESET_KEY.ahoCorasick.alerts),
];

export const SUFFIX_ARRAY_PRESETS: readonly StringPresetOption[] = [
  createPresetOption('banana', STRING_PRESET_KEY.suffixArray.banana),
  createPresetOption('mississippi', STRING_PRESET_KEY.suffixArray.mississippi),
  createPresetOption('abracadabra', STRING_PRESET_KEY.suffixArray.abracadabra),
];

export const SUFFIX_ARRAY_LCP_PRESETS: readonly StringPresetOption[] = [
  createPresetOption('banana', STRING_PRESET_KEY.suffixArrayLcp.banana),
  createPresetOption('mississippi', STRING_PRESET_KEY.suffixArrayLcp.mississippi),
  createPresetOption('abracadabra', STRING_PRESET_KEY.suffixArrayLcp.abracadabra),
];

export const PALINDROMIC_TREE_PRESETS: readonly StringPresetOption[] = [
  createPresetOption('banana', STRING_PRESET_KEY.palindromicTree.banana),
  createPresetOption('symmetry', STRING_PRESET_KEY.palindromicTree.symmetry),
  createPresetOption('mixed', STRING_PRESET_KEY.palindromicTree.mixed),
];

export const RLE_PRESETS: readonly StringPresetOption[] = [
  createPresetOption('runs', STRING_PRESET_KEY.rle.runs),
  createPresetOption('mixed', STRING_PRESET_KEY.rle.mixed),
  createPresetOption('worst', STRING_PRESET_KEY.rle.worst),
];

export const HUFFMAN_PRESETS: readonly StringPresetOption[] = [
  createPresetOption('classic', STRING_PRESET_KEY.huffman.classic),
  createPresetOption('uniform', STRING_PRESET_KEY.huffman.uniform),
  createPresetOption('natural', STRING_PRESET_KEY.huffman.natural),
];

export const BWT_PRESETS: readonly StringPresetOption[] = [
  createPresetOption('banana', STRING_PRESET_KEY.bwt.banana),
  createPresetOption('panama', STRING_PRESET_KEY.bwt.panama),
  createPresetOption('mississippi', STRING_PRESET_KEY.bwt.mississippi),
];

export function createKmpScenario(size: number, presetId: string): KmpScenario {
  const preset = resolvePreset(KMP_PRESETS, presetId);
  const tier = size <= 14 ? 'short' : size <= 20 ? 'medium' : 'long';

  if (preset.id === 'dna') {
    return {
      kind: 'kmp-pattern-matching',
      presetId: preset.id,
      presetLabel: preset.label,
      presetDescription: preset.description,
      text:
        tier === 'short'
          ? 'AACAADAABAABA'
          : tier === 'medium'
            ? 'AABAACAADAABAABA'
            : 'AABAACAADAABAABAACAADAABA',
      pattern: tier === 'short' ? 'AABA' : 'AABAACA',
    };
  }

  if (preset.id === 'signal') {
    return {
      kind: 'kmp-pattern-matching',
      presetId: preset.id,
      presetLabel: preset.label,
      presetDescription: preset.description,
      text:
        tier === 'short'
          ? 'NEONNEONSYNC'
          : tier === 'medium'
            ? 'NEONNEBULANEONNEB'
            : 'NEONNEBULANEONNEBULANEON',
      pattern: tier === 'short' ? 'NEON' : 'NEONNEB',
    };
  }

  return {
    kind: 'kmp-pattern-matching',
    presetId: preset.id,
    presetLabel: preset.label,
    presetDescription: preset.description,
    text:
      tier === 'short'
        ? 'ABABDABABCAB'
        : tier === 'medium'
          ? 'ABABDABACDABABCABAB'
          : 'ABABDABACDABABCABABABABCABAB',
    pattern: tier === 'short' ? 'ABABC' : 'ABABCABAB',
  };
}

export function createRabinKarpScenario(size: number, presetId: string): RabinKarpScenario {
  const preset = resolvePreset(RABIN_KARP_PRESETS, presetId);
  const tier = size <= 14 ? 'short' : size <= 20 ? 'medium' : 'long';

  if (preset.id === 'forensics') {
    return {
      kind: 'rabin-karp',
      presetId: preset.id,
      presetLabel: preset.label,
      presetDescription: preset.description,
      text:
        tier === 'short'
          ? 'GEEKSFORGEEK'
          : tier === 'medium'
            ? 'GEEKSFORGEEKS'
            : 'GEEKSFORGEEKSFORGEEK',
      pattern: 'GEEK',
      base: 29,
      mod: 19,
    };
  }

  if (preset.id === 'neon') {
    return {
      kind: 'rabin-karp',
      presetId: preset.id,
      presetLabel: preset.label,
      presetDescription: preset.description,
      text:
        tier === 'short'
          ? 'NEONSIGNAL'
          : tier === 'medium'
            ? 'NEONSIGNALNEON'
            : 'NEONSIGNALNEONSYNCNEON',
      pattern: tier === 'short' ? 'SIGN' : 'NEON',
      base: 31,
      mod: 23,
    };
  }

  return {
    kind: 'rabin-karp',
    presetId: preset.id,
    presetLabel: preset.label,
    presetDescription: preset.description,
    text:
      tier === 'short'
        ? 'ABACABAFABA'
        : tier === 'medium'
          ? 'ABACABADABACABA'
          : 'ABACABADABACABAFABACABA',
    pattern: 'CABA',
    base: 31,
    mod: 11,
  };
}

export function createZAlgorithmScenario(size: number, presetId: string): ZAlgorithmScenario {
  const preset = resolvePreset(Z_ALGORITHM_PRESETS, presetId);
  const tier = size <= 14 ? 'short' : size <= 20 ? 'medium' : 'long';

  if (preset.id === 'genome') {
    return {
      kind: 'z-algorithm',
      presetId: preset.id,
      presetLabel: preset.label,
      presetDescription: preset.description,
      pattern: tier === 'short' ? 'ATA' : 'ATAT',
      text:
        tier === 'short'
          ? 'GATATAT'
          : tier === 'medium'
            ? 'GATATATGCATATACT'
            : 'GATATATGCATATACTATAT',
    };
  }

  if (preset.id === 'log') {
    return {
      kind: 'z-algorithm',
      presetId: preset.id,
      presetLabel: preset.label,
      presetDescription: preset.description,
      pattern: tier === 'short' ? 'LOG' : 'SYNC',
      text:
        tier === 'short'
          ? 'LOGBOOKLOG'
          : tier === 'medium'
            ? 'SYNCTRACESYNCLOGSYNC'
            : 'SYNCTRACESYNCLOGSYNCTRACESYNC',
    };
  }

  return {
    kind: 'z-algorithm',
    presetId: preset.id,
    presetLabel: preset.label,
    presetDescription: preset.description,
    pattern: tier === 'short' ? 'ABA' : 'ABABA',
    text:
      tier === 'short'
        ? 'ABACABAABA'
        : tier === 'medium'
          ? 'ABACABAZABABA'
          : 'ABACABAZABABAABACABA',
  };
}

export function createManacherScenario(size: number, presetId: string): ManacherScenario {
  const preset = resolvePreset(MANACHER_PRESETS, presetId);
  const tier = size <= 12 ? 'short' : size <= 16 ? 'medium' : 'long';

  if (preset.id === 'symmetry') {
    return {
      kind: 'manacher',
      presetId: preset.id,
      presetLabel: preset.label,
      presetDescription: preset.description,
      source:
        tier === 'short'
          ? 'ABACABA'
          : tier === 'medium'
            ? 'ABACABADABACABA'
            : 'ABACABADABACABAXABACABA',
    };
  }

  if (preset.id === 'mixed') {
    return {
      kind: 'manacher',
      presetId: preset.id,
      presetLabel: preset.label,
      presetDescription: preset.description,
      source:
        tier === 'short'
          ? 'NOONLEVEL'
          : tier === 'medium'
            ? 'NOONRACECARANNA'
            : 'NOONRACECARANNAXLEVEL',
    };
  }

  return {
    kind: 'manacher',
    presetId: preset.id,
    presetLabel: preset.label,
    presetDescription: preset.description,
    source:
      tier === 'short'
        ? 'BANANA'
        : tier === 'medium'
          ? 'BANANALEVEL'
          : 'BANANALEVELCIVIC',
  };
}

export function createAhoCorasickScenario(
  size: number,
  presetId: string,
): AhoCorasickScenario {
  const preset = resolvePreset(AHO_CORASICK_PRESETS, presetId);
  const tier = size <= 12 ? 'short' : size <= 18 ? 'medium' : 'long';

  if (preset.id === 'genome') {
    return {
      kind: 'aho-corasick',
      presetId: preset.id,
      presetLabel: preset.label,
      presetDescription: preset.description,
      text:
        tier === 'short'
          ? 'ACGATCGA'
          : tier === 'medium'
            ? 'ACGATCGACGTA'
            : 'ACGATCGACGTACGATC',
      patterns: ['AC', 'CGA', 'GAT', 'TCG'],
    };
  }

  if (preset.id === 'alerts') {
    return {
      kind: 'aho-corasick',
      presetId: preset.id,
      presetLabel: preset.label,
      presetDescription: preset.description,
      text:
        tier === 'short'
          ? 'warnalert'
          : tier === 'medium'
            ? 'warnalerterror'
            : 'warnalerterrorpanic',
      patterns: ['warn', 'alert', 'error', 'panic'],
    };
  }

  return {
    kind: 'aho-corasick',
    presetId: preset.id,
    presetLabel: preset.label,
    presetDescription: preset.description,
    text:
      tier === 'short'
        ? 'ushers'
        : tier === 'medium'
          ? 'ushershis'
          : 'ushershishers',
    patterns: ['he', 'she', 'his', 'hers'],
  };
}

export function createSuffixArrayScenario(
  size: number,
  presetId: string,
): SuffixArrayScenario {
  const preset = resolvePreset(SUFFIX_ARRAY_PRESETS, presetId);
  const tier = size <= 8 ? 'short' : size <= 12 ? 'medium' : 'long';

  if (preset.id === 'mississippi') {
    return {
      kind: 'suffix-array-construction',
      presetId: preset.id,
      presetLabel: preset.label,
      presetDescription: preset.description,
      source: tier === 'short' ? 'mississ' : tier === 'medium' ? 'mississippi' : 'mississippian',
    };
  }

  if (preset.id === 'abracadabra') {
    return {
      kind: 'suffix-array-construction',
      presetId: preset.id,
      presetLabel: preset.label,
      presetDescription: preset.description,
      source:
        tier === 'short' ? 'abracad' : tier === 'medium' ? 'abracadabra' : 'abracadabracad',
    };
  }

  return {
    kind: 'suffix-array-construction',
    presetId: preset.id,
    presetLabel: preset.label,
    presetDescription: preset.description,
    source: tier === 'short' ? 'banana' : tier === 'medium' ? 'bananaband' : 'bananabandana',
  };
}

export function createSuffixArrayLcpScenario(
  size: number,
  presetId: string,
): SuffixArrayLcpScenario {
  const preset = resolvePreset(SUFFIX_ARRAY_LCP_PRESETS, presetId);
  const tier = size <= 8 ? 'short' : size <= 12 ? 'medium' : 'long';

  if (preset.id === 'mississippi') {
    return {
      kind: 'suffix-array-lcp-kasai',
      presetId: preset.id,
      presetLabel: preset.label,
      presetDescription: preset.description,
      source: tier === 'short' ? 'mississ' : tier === 'medium' ? 'mississippi' : 'mississippian',
    };
  }

  if (preset.id === 'abracadabra') {
    return {
      kind: 'suffix-array-lcp-kasai',
      presetId: preset.id,
      presetLabel: preset.label,
      presetDescription: preset.description,
      source:
        tier === 'short' ? 'abracad' : tier === 'medium' ? 'abracadabra' : 'abracadabracad',
    };
  }

  return {
    kind: 'suffix-array-lcp-kasai',
    presetId: preset.id,
    presetLabel: preset.label,
    presetDescription: preset.description,
    source: tier === 'short' ? 'banana' : tier === 'medium' ? 'bananaband' : 'bananabandana',
  };
}

export function createPalindromicTreeScenario(
  size: number,
  presetId: string,
): PalindromicTreeScenario {
  const preset = resolvePreset(PALINDROMIC_TREE_PRESETS, presetId);
  const tier = size <= 8 ? 'short' : size <= 12 ? 'medium' : 'long';

  if (preset.id === 'symmetry') {
    return {
      kind: 'palindromic-tree',
      presetId: preset.id,
      presetLabel: preset.label,
      presetDescription: preset.description,
      source: tier === 'short' ? 'abacaba' : tier === 'medium' ? 'abacabaxaba' : 'abacabaxabacaba',
    };
  }

  if (preset.id === 'mixed') {
    return {
      kind: 'palindromic-tree',
      presetId: preset.id,
      presetLabel: preset.label,
      presetDescription: preset.description,
      source: tier === 'short' ? 'levelup' : tier === 'medium' ? 'levelupnoon' : 'levelupnooncivic',
    };
  }

  return {
    kind: 'palindromic-tree',
    presetId: preset.id,
    presetLabel: preset.label,
    presetDescription: preset.description,
    source: tier === 'short' ? 'banana' : tier === 'medium' ? 'bananalevel' : 'bananalevelcivic',
  };
}

export function createBurrowsWheelerScenario(
  size: number,
  presetId: string,
): BurrowsWheelerScenario {
  const preset = resolvePreset(BWT_PRESETS, presetId);
  const tier = size <= 6 ? 'short' : size <= 8 ? 'medium' : 'long';

  if (preset.id === 'panama') {
    return {
      kind: 'burrows-wheeler-transform',
      presetId: preset.id,
      presetLabel: preset.label,
      presetDescription: preset.description,
      source: ensureSentinel(
        tier === 'short' ? 'PANAMA' : tier === 'medium' ? 'PANAMAB' : 'PANAMABAN',
      ),
    };
  }

  if (preset.id === 'mississippi') {
    return {
      kind: 'burrows-wheeler-transform',
      presetId: preset.id,
      presetLabel: preset.label,
      presetDescription: preset.description,
      source: ensureSentinel(
        tier === 'short' ? 'MISSIS' : tier === 'medium' ? 'MISSISSI' : 'MISSISSIPPI',
      ),
    };
  }

  return {
    kind: 'burrows-wheeler-transform',
    presetId: preset.id,
    presetLabel: preset.label,
    presetDescription: preset.description,
    source: ensureSentinel(
      tier === 'short' ? 'BANANA' : tier === 'medium' ? 'BANANAS' : 'BANANABAN',
    ),
  };
}

export function createRleScenario(size: number, presetId: string): RleScenario {
  const preset = resolvePreset(RLE_PRESETS, presetId);
  const tier = size <= 12 ? 'short' : size <= 18 ? 'medium' : 'long';

  if (preset.id === 'mixed') {
    return {
      kind: 'run-length-encoding',
      presetId: preset.id,
      presetLabel: preset.label,
      presetDescription: preset.description,
      source:
        tier === 'short'
          ? 'AABBCBBA'
          : tier === 'medium'
            ? 'AABBCCCDDDBBAAA'
            : 'AABBBBCCCCCDDDDAABBCC',
    };
  }

  if (preset.id === 'worst') {
    return {
      kind: 'run-length-encoding',
      presetId: preset.id,
      presetLabel: preset.label,
      presetDescription: preset.description,
      source:
        tier === 'short'
          ? 'ABCDEFGH'
          : tier === 'medium'
            ? 'ABCDEFGHIJKLMN'
            : 'ABCDEFGHIJKLMNOPQRST',
    };
  }

  return {
    kind: 'run-length-encoding',
    presetId: preset.id,
    presetLabel: preset.label,
    presetDescription: preset.description,
    source:
      tier === 'short'
        ? 'AAABBBCCC'
        : tier === 'medium'
          ? 'AAABBBBBCCCCCDDDD'
          : 'AAAAABBBBBCCCCCDDDDDEEEEE',
  };
}

export function createHuffmanScenario(size: number, presetId: string): HuffmanScenario {
  const preset = resolvePreset(HUFFMAN_PRESETS, presetId);
  const tier = size <= 8 ? 'short' : size <= 12 ? 'medium' : 'long';

  if (preset.id === 'uniform') {
    return {
      kind: 'huffman-coding',
      presetId: preset.id,
      presetLabel: preset.label,
      presetDescription: preset.description,
      source:
        tier === 'short'
          ? 'ABCD'
          : tier === 'medium'
            ? 'AABBCCDD'
            : 'AAABBBCCCDDD',
    };
  }

  if (preset.id === 'natural') {
    return {
      kind: 'huffman-coding',
      presetId: preset.id,
      presetLabel: preset.label,
      presetDescription: preset.description,
      source:
        tier === 'short'
          ? 'MISSISSI'
          : tier === 'medium'
            ? 'MISSISSIPPI'
            : 'ABRACADABRA!',
    };
  }

  return {
    kind: 'huffman-coding',
    presetId: preset.id,
    presetLabel: preset.label,
    presetDescription: preset.description,
    source:
      tier === 'short'
        ? 'AABBC'
        : tier === 'medium'
          ? 'AABBCCCDDDD'
          : 'AABBBCCCDDDDEEEEEE',
  };
}

function resolvePreset<TPreset extends StringPresetOption>(
  presets: readonly TPreset[],
  presetId: string,
): TPreset {
  return presets.find((preset) => preset.id === presetId) ?? presets[0]!;
}

function ensureSentinel(source: string): string {
  return source.endsWith('$') ? source : `${source}$`;
}
