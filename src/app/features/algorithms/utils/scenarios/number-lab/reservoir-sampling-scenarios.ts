import type { TranslatableText } from '../../../../../core/i18n/translatable-text';
import {
  DEFAULT_RESERVOIR_SAMPLING_TASK_ID,
  RESERVOIR_SAMPLING_TASKS,
  formatPredicateList,
  parseLabelStream,
  parseNumberMap,
  parsePredicateStream,
  parsePriorityItems,
  parseWeightedItems,
} from './reservoir-sampling';
import type {
  PredicateStreamItem,
  PriorityItem,
  ReservoirSamplingNotebookFlow,
  ReservoirSamplingTask,
  ReservoirSamplingTaskValues,
  WeightedReservoirItem,
} from './reservoir-sampling';

export interface ReservoirSamplingPresetOption {
  readonly id: string;
  readonly label: string;
  readonly description: string;
}

export interface ReservoirSamplingResolvedValues {
  readonly k: number;
  readonly stream: readonly string[];
  readonly random: Readonly<Record<number, number>>;
  readonly draws: Readonly<Record<number, number>>;
  readonly predicate: string;
  readonly predicateStream: readonly PredicateStreamItem[];
  readonly drawsForRealItems: Readonly<Record<number, number>>;
  readonly weightedItems: readonly WeightedReservoirItem[];
  readonly keyFormula: string;
  readonly priorityMode: string;
  readonly shardA: readonly PriorityItem[];
  readonly shardB: readonly PriorityItem[];
  readonly shardC: readonly PriorityItem[];
}

interface BaseScenario {
  readonly presetId: string;
  readonly presetLabel: string;
  readonly presetDescription: string;
}

export interface ReservoirSamplingScenario extends BaseScenario {
  readonly kind: 'reservoir-sampling';
  readonly values: ReservoirSamplingResolvedValues;
  readonly notebookFlow: ReservoirSamplingNotebookFlow;
  readonly taskPrompt: TranslatableText | null;
}

export const RESERVOIR_SAMPLING_PRESETS: readonly ReservoirSamplingPresetOption[] =
  RESERVOIR_SAMPLING_TASKS.map((task) => ({
    id: task.id,
    label: typeof task.name === 'string' ? task.name : task.id,
    description: typeof task.summary === 'string' ? task.summary : '',
  }));

export const DEFAULT_RESERVOIR_SAMPLING_PRESET_ID = DEFAULT_RESERVOIR_SAMPLING_TASK_ID;
export { RESERVOIR_SAMPLING_TASKS, DEFAULT_RESERVOIR_SAMPLING_TASK_ID };
export type ReservoirSamplingValues = ReservoirSamplingTask['defaultValues'];

export function createReservoirSamplingScenario(
  _size: number,
  presetId: string | null,
  customValues?: ReservoirSamplingValues,
): ReservoirSamplingScenario {
  const id = presetId ?? DEFAULT_RESERVOIR_SAMPLING_TASK_ID;
  const task =
    RESERVOIR_SAMPLING_TASKS.find((candidate) => candidate.id === id) ??
    RESERVOIR_SAMPLING_TASKS.find(
      (candidate) => candidate.id === DEFAULT_RESERVOIR_SAMPLING_TASK_ID,
    ) ??
    RESERVOIR_SAMPLING_TASKS[0];
  const values: ReservoirSamplingTaskValues = {
    ...task.defaultValues,
    ...customValues,
  };
  const resolved = resolveValues(values, task.defaultValues);

  return {
    kind: 'reservoir-sampling',
    presetId: task.id,
    presetLabel: typeof task.name === 'string' ? task.name : task.id,
    presetDescription: typeof task.summary === 'string' ? task.summary : '',
    taskPrompt: buildTaskPrompt(task.notebookFlow, resolved),
    notebookFlow: task.notebookFlow,
    values: resolved,
  };
}

function resolveValues(
  values: ReservoirSamplingTaskValues,
  defaults: ReservoirSamplingTaskValues,
): ReservoirSamplingResolvedValues {
  return {
    k: numberValue(values.k, numberValue(defaults.k, 1)),
    stream: listValue(values.stream, defaults.stream, ['A', 'B', 'C', 'D', 'E', 'F']),
    random: mapValue(values.random, defaults.random),
    draws: mapValue(values.draws, defaults.draws),
    predicate: stringValue(values.predicate, stringValue(defaults.predicate, 'status == ERROR')),
    predicateStream: predicateStreamValue(values.stream, defaults.stream),
    drawsForRealItems: mapValue(values.draws_for_real_items, defaults.draws_for_real_items),
    weightedItems: weightedItemsValue(values.items, defaults.items),
    keyFormula: stringValue(
      values.key_formula,
      stringValue(defaults.key_formula, 'u^(1 / weight)'),
    ),
    priorityMode: stringValue(
      values.priority_mode,
      stringValue(defaults.priority_mode, 'smaller is better'),
    ),
    shardA: priorityItemsValue(values.shardA, defaults.shardA),
    shardB: priorityItemsValue(values.shardB, defaults.shardB),
    shardC: priorityItemsValue(values.shardC, defaults.shardC),
  };
}

function buildTaskPrompt(
  flow: ReservoirSamplingNotebookFlow,
  values: ReservoirSamplingResolvedValues,
): TranslatableText {
  switch (flow.kind) {
    case 'k-one':
      return [
        `Przetwórz strumień [[math]]${values.stream.join(', ')}[[/math]] algorytmem Reservoir Sampling dla [[math]]k = ${values.k}[[/math]].`,
        'Dla elementu [[math]]i[[/math]] zastąp aktualną próbkę, gdy [[math]]random[i] < 1 / i[[/math]].',
      ].join('\n');
    case 'fixed-k-updates':
      return [
        `Przetwórz strumień [[math]]${values.stream.join(', ')}[[/math]] algorytmem Reservoir Sampling dla [[math]]k = ${values.k}[[/math]].`,
        'Pierwsze trzy elementy trafiają do rezerwuaru. Dla każdego kolejnego elementu losowany jest indeks [[math]]j[[/math]] z zakresu [[math]][1, i][[/math]].',
        'Jeśli [[math]]j <= k[[/math]], zastąp pozycję [[math]]j[[/math]] w rezerwuarze.',
      ].join('\n');
    case 'predicate-reservoir':
      return [
        'Z próbek mają być wybierane tylko zdarzenia spełniające predykat:',
        '',
        `[[math]]${values.predicate}[[/math]]`,
        '',
        'Elementy niespełniające predykatu są ignorowane i nie zwiększają licznika losowania.',
        `Strumień: [[math]]${formatPredicateList(values.predicateStream)}[[/math]]`,
      ].join('\n');
    case 'weighted-reservoir':
      return [
        `Wykonaj ważony Reservoir Sampling dla [[math]]k = ${values.k}[[/math]].`,
        'Każdy element ma wagę [[math]]w[[/math]] oraz wylosowaną wartość [[math]]u[[/math]] z przedziału [[math]](0, 1)[[/math]].',
        `Dla każdego elementu policz klucz [[math]]key = ${values.keyFormula}[[/math]] i zachowaj [[math]]k[[/math]] elementów z największymi kluczami.`,
      ].join('\n');
    case 'distributed-merge':
      return [
        'Każdy element w strumieniu dostał globalny losowy priorytet. Mniejszy priorytet jest lepszy.',
        `Każdy shard lokalnie zachowuje [[math]]k = ${values.k}[[/math]] najlepsze elementy.`,
        'Następnie połącz lokalne rezerwuary i wybierz globalne najlepsze elementy.',
      ].join('\n');
  }
}

function listValue(
  input: string | undefined,
  fallbackInput: string | undefined,
  hardFallback: readonly string[],
): readonly string[] {
  const parsed = parseLabelStream(input);
  if (parsed.length > 0) return parsed;
  const fallback = parseLabelStream(fallbackInput);
  return fallback.length > 0 ? fallback : hardFallback;
}

function mapValue(
  input: string | undefined,
  fallbackInput: string | undefined,
): Readonly<Record<number, number>> {
  const parsed = parseNumberMap(input);
  if (Object.keys(parsed).length > 0) return parsed;
  return parseNumberMap(fallbackInput);
}

function predicateStreamValue(
  input: string | undefined,
  fallbackInput: string | undefined,
): readonly PredicateStreamItem[] {
  const parsed = parsePredicateStream(input);
  if (parsed.length > 0) return parsed;
  return parsePredicateStream(fallbackInput);
}

function weightedItemsValue(
  input: string | undefined,
  fallbackInput: string | undefined,
): readonly WeightedReservoirItem[] {
  const parsed = parseWeightedItems(input);
  if (parsed.length > 0) return parsed;
  return parseWeightedItems(fallbackInput);
}

function priorityItemsValue(
  input: string | undefined,
  fallbackInput: string | undefined,
): readonly PriorityItem[] {
  const parsed = parsePriorityItems(input);
  if (parsed.length > 0) return parsed;
  return parsePriorityItems(fallbackInput);
}

function numberValue(value: number | undefined, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function stringValue(value: string | undefined, fallback: string): string {
  return value?.trim() || fallback;
}
