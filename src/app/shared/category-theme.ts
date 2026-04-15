export interface CategoryTheme {
  readonly accentRgb: string;
  readonly accentAltRgb: string;
  readonly accentStrong: string;
  readonly accentAltStrong: string;
  readonly ink: string;
}

function hslToRgbTriplet(hue: number, saturation: number, lightness: number): string {
  const s = saturation / 100;
  const l = lightness / 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = l - c / 2;

  let red = 0;
  let green = 0;
  let blue = 0;

  if (hue < 60) {
    red = c;
    green = x;
  } else if (hue < 120) {
    red = x;
    green = c;
  } else if (hue < 180) {
    green = c;
    blue = x;
  } else if (hue < 240) {
    green = x;
    blue = c;
  } else if (hue < 300) {
    red = x;
    blue = c;
  } else {
    red = c;
    blue = x;
  }

  return [red, green, blue]
    .map((channel) => Math.round((channel + m) * 255))
    .join(' ');
}

function rgbTripletToHex(triplet: string): string {
  return `#${triplet
    .split(' ')
    .map((value) => Number(value).toString(16).padStart(2, '0'))
    .join('')}`;
}

function hashString(value: string): number {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function createDerivedTheme(key: string): CategoryTheme {
  const hash = hashString(key);
  const hue = hash % 360;
  const altHue = (hue + 42 + ((hash >> 8) % 48)) % 360;

  const accentRgb = hslToRgbTriplet(hue, 72, 64);
  const accentAltRgb = hslToRgbTriplet(altHue, 78, 68);
  const accentStrong = rgbTripletToHex(hslToRgbTriplet(hue, 82, 82));
  const accentAltStrong = rgbTripletToHex(hslToRgbTriplet(altHue, 84, 84));
  const ink = rgbTripletToHex(hslToRgbTriplet((hue + altHue) / 2, 88, 93));

  return {
    accentRgb,
    accentAltRgb,
    accentStrong,
    accentAltStrong,
    ink,
  };
}

const DEFAULT_CATEGORY_THEME: CategoryTheme = {
  accentRgb: '141 123 255',
  accentAltRgb: '50 217 255',
  accentStrong: '#ddd7ff',
  accentAltStrong: '#d3f7ff',
  ink: '#f4f2ff',
};

const CATEGORY_THEME_MAP: Record<string, CategoryTheme> = {
  overview: DEFAULT_CATEGORY_THEME,
  catalog: DEFAULT_CATEGORY_THEME,
  sorting: {
    accentRgb: '187 220 106',
    accentAltRgb: '255 184 94',
    accentStrong: '#ecf7c8',
    accentAltStrong: '#ffe7bf',
    ink: '#fff7ea',
  },
  searching: {
    accentRgb: '93 225 255',
    accentAltRgb: '113 154 255',
    accentStrong: '#d9f9ff',
    accentAltStrong: '#dae4ff',
    ink: '#eefaff',
  },
  trees: {
    accentRgb: '86 229 165',
    accentAltRgb: '136 216 187',
    accentStrong: '#dbf9e9',
    accentAltStrong: '#d9f7ef',
    ink: '#effcf6',
  },
  graphs: {
    accentRgb: '72 214 255',
    accentAltRgb: '156 129 255',
    accentStrong: '#daf8ff',
    accentAltStrong: '#e4dbff',
    ink: '#f2f5ff',
  },
  dp: {
    accentRgb: '196 124 255',
    accentAltRgb: '255 122 204',
    accentStrong: '#efd9ff',
    accentAltStrong: '#ffd8ef',
    ink: '#fff1fa',
  },
  strings: {
    accentRgb: '255 185 99',
    accentAltRgb: '255 120 120',
    accentStrong: '#ffe8c4',
    accentAltStrong: '#ffd6d6',
    ink: '#fff4eb',
  },
  geometry: {
    accentRgb: '95 224 230',
    accentAltRgb: '108 184 255',
    accentStrong: '#d8fbfc',
    accentAltStrong: '#d9ecff',
    ink: '#eefcff',
  },
  misc: {
    accentRgb: '194 171 255',
    accentAltRgb: '129 160 255',
    accentStrong: '#ece4ff',
    accentAltStrong: '#dde7ff',
    ink: '#f4f3ff',
  },
  linear: {
    accentRgb: '255 187 104',
    accentAltRgb: '191 221 116',
    accentStrong: '#ffe8c8',
    accentAltStrong: '#edf8c9',
    ink: '#fff7ec',
  },
  hashing: {
    accentRgb: '107 164 255',
    accentAltRgb: '191 124 255',
    accentStrong: '#dcebff',
    accentAltStrong: '#edd8ff',
    ink: '#f3f4ff',
  },
  specialized: {
    accentRgb: '255 135 201',
    accentAltRgb: '255 187 104',
    accentStrong: '#ffd7ef',
    accentAltStrong: '#ffe8c8',
    ink: '#fff2f8',
  },
};

export function getCategoryTheme(categoryId?: string | null): CategoryTheme {
  if (!categoryId) {
    return DEFAULT_CATEGORY_THEME;
  }

  return CATEGORY_THEME_MAP[categoryId] ?? createDerivedTheme(categoryId);
}

export function buildCategoryThemeVars(
  categoryId: string | null | undefined,
  prefix: string,
): Record<string, string> {
  const theme = getCategoryTheme(categoryId);

  return {
    [`--${prefix}-accent-rgb`]: theme.accentRgb,
    [`--${prefix}-accent-alt-rgb`]: theme.accentAltRgb,
    [`--${prefix}-accent-strong`]: theme.accentStrong,
    [`--${prefix}-accent-alt-strong`]: theme.accentAltStrong,
    [`--${prefix}-ink`]: theme.ink,
  };
}
