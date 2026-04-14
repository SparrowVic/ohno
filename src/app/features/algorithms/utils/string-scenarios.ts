import { StringPresetOption } from '../models/string';

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

export interface BurrowsWheelerScenario extends BaseStringScenario {
  readonly kind: 'burrows-wheeler-transform';
  readonly source: string;
}

export const KMP_PRESETS: readonly StringPresetOption[] = [
  { id: 'overlap', label: 'Overlap', description: 'Classic self-overlap case where failure jumps save many retries.' },
  { id: 'dna', label: 'DNA', description: 'Short genome-style pattern with repeated prefixes and suffixes.' },
  { id: 'signal', label: 'Signal', description: 'Readable repeated phrase that makes jumps visually obvious.' },
];

export const RABIN_KARP_PRESETS: readonly StringPresetOption[] = [
  { id: 'alarm', label: 'False Alarm', description: 'Small modulus makes rolling hashes collide often enough to teach verification.' },
  { id: 'forensics', label: 'Forensics', description: 'A repetitive string where rolling updates are easier to track than full rescans.' },
  { id: 'neon', label: 'Neon Feed', description: 'Readable repeated label stream with a clear matching window.' },
];

export const Z_ALGORITHM_PRESETS: readonly StringPresetOption[] = [
  { id: 'classic', label: 'Classic', description: 'Pattern concatenation produces clear Z-box reuse and a couple of exact hits.' },
  { id: 'genome', label: 'Genome', description: 'Many overlapping prefixes turn the Z skyline into a dense cityscape.' },
  { id: 'log', label: 'Log Stream', description: 'Readable text with long repeated prefixes and visible full-pattern bars.' },
];

export const MANACHER_PRESETS: readonly StringPresetOption[] = [
  { id: 'banana', label: 'Banana Glow', description: 'Odd-length palindromes layer into a clean mirrored rainbow.' },
  { id: 'symmetry', label: 'Symmetry', description: 'Dense mirrored structure makes center reuse and boundary growth easy to see.' },
  { id: 'mixed', label: 'Mixed', description: 'Odd and even palindromes compete, so the longest answer is not obvious up front.' },
];

export const BWT_PRESETS: readonly StringPresetOption[] = [
  { id: 'banana', label: 'Banana', description: 'The canonical BWT demo: short, memorable, and perfect for grouped output runs.' },
  { id: 'panama', label: 'Panama', description: 'Readable phrase-derived string where rotations visibly cluster repeated letters.' },
  { id: 'mississippi', label: 'Mississippi', description: 'Heavier repetition shows why BWT helps later run-length compression.' },
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

function resolvePreset<TPreset extends StringPresetOption>(
  presets: readonly TPreset[],
  presetId: string,
): TPreset {
  return presets.find((preset) => preset.id === presetId) ?? presets[0]!;
}

function ensureSentinel(source: string): string {
  return source.endsWith('$') ? source : `${source}$`;
}
