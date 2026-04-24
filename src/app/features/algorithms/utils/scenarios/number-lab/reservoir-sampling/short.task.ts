import {
  RESERVOIR_SAMPLING_K_ONE_INPUT_SCHEMA,
  type ReservoirSamplingTask,
} from './reservoir-sampling-task';

export const RESERVOIR_SAMPLING_SHORT_TASK: ReservoirSamplingTask = {
  id: 'short',
  name: 'Podstawowy reservoir sampling dla k = 1',
  summary: 'Klasyczny przypadek k = 1 z porównaniem losowań do progu 1 / i.',
  instruction: 'Przetwórz strumień A, B, C, D, E, F algorytmem Reservoir Sampling dla k = 1.',
  hints: [
    'Pierwszy element wchodzi do rezerwuaru bez losowania.',
    'Dla elementu i zastępuj próbkę, gdy random[i] < 1 / i.',
  ],
  difficulty: 'easy',
  defaultValues: {
    k: 1,
    stream: '[A, B, C, D, E, F]',
    random: '{2: 0.70, 3: 0.20, 4: 0.90, 5: 0.10, 6: 0.40}',
  },
  inputSchema: RESERVOIR_SAMPLING_K_ONE_INPUT_SCHEMA,
  codeSnippetId: null,
  notebookFlow: { kind: 'k-one' },
};
