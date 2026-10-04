import { I18N_KEY, I18nKey } from './i18n-keys';

const UNIT_KEY_SUFFIXES = {
  balloons: I18N_KEY.features.algorithms.toolbar.units.balloons,
  bits: I18N_KEY.features.algorithms.toolbar.units.bits,
  'cells / side': I18N_KEY.features.algorithms.toolbar.units.cellsSlashSide,
  chars: I18N_KEY.features.algorithms.toolbar.units.chars,
  cities: I18N_KEY.features.algorithms.toolbar.units.cities,
  coins: I18N_KEY.features.algorithms.toolbar.units.coins,
  columns: I18N_KEY.features.algorithms.toolbar.units.columns,
  'combined chars': I18N_KEY.features.algorithms.toolbar.units.combinedChars,
  elements: I18N_KEY.features.algorithms.toolbar.units.elements,
  files: I18N_KEY.features.algorithms.toolbar.units.files,
  items: I18N_KEY.features.algorithms.toolbar.units.items,
  jobs: I18N_KEY.features.algorithms.toolbar.units.jobs,
  matrices: I18N_KEY.features.algorithms.toolbar.units.matrices,
  nodes: I18N_KEY.features.algorithms.toolbar.units.nodes,
  numbers: I18N_KEY.features.algorithms.toolbar.units.numbers,
  planes: I18N_KEY.features.algorithms.toolbar.units.planes,
  points: I18N_KEY.features.algorithms.toolbar.units.points,
  rects: I18N_KEY.features.algorithms.toolbar.units.rects,
  'rows / cols': I18N_KEY.features.algorithms.toolbar.units.rowsSlashCols,
  segments: I18N_KEY.features.algorithms.toolbar.units.segments,
  sites: I18N_KEY.features.algorithms.toolbar.units.sites,
  stairs: I18N_KEY.features.algorithms.toolbar.units.stairs,
  states: I18N_KEY.features.algorithms.toolbar.units.states,
  terms: I18N_KEY.features.algorithms.toolbar.units.terms,
  'text chars': I18N_KEY.features.algorithms.toolbar.units.textChars,
  values: I18N_KEY.features.algorithms.toolbar.units.values,
  verts: I18N_KEY.features.algorithms.toolbar.units.verts,
} as const;

function resolveKey(suffixes: Record<string, I18nKey>, value: string): I18nKey | null {
  return suffixes[value] ?? null;
}

export function getVisualizationSizeUnitLabelKey(unit: string): I18nKey | null {
  return resolveKey(UNIT_KEY_SUFFIXES, unit);
}
