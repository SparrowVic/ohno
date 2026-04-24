import {
  RESERVOIR_SAMPLING_WEIGHTED_INPUT_SCHEMA,
  type ReservoirSamplingTask,
} from './reservoir-sampling-task';

export const RESERVOIR_SAMPLING_WEIGHTED_RESERVOIR_TASK: ReservoirSamplingTask = {
  id: 'weighted-reservoir',
  name: 'Weighted Reservoir Sampling',
  summary: 'Ważony sampling przez klucze priorytetowe u^(1 / weight).',
  instruction: 'Policz klucz dla każdego elementu i zachowaj k elementów z największymi kluczami.',
  hints: [
    'Większa waga zwiększa szansę na wysoki klucz.',
    'Wynik wybieramy przez ranking kluczy, nie przez kolejność strumienia.',
  ],
  difficulty: 'hard',
  defaultValues: {
    k: 2,
    items: '[(A, 1, 0.64), (B, 2, 0.25), (C, 4, 0.81), (D, 3, 0.125), (E, 1, 0.90)]',
    key_formula: 'u^(1 / weight)',
  },
  inputSchema: RESERVOIR_SAMPLING_WEIGHTED_INPUT_SCHEMA,
  codeSnippetId: null,
  notebookFlow: { kind: 'weighted-reservoir' },
};
