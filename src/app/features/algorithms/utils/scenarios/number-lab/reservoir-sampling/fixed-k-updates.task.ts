import {
  RESERVOIR_SAMPLING_FIXED_K_INPUT_SCHEMA,
  type ReservoirSamplingTask,
} from './reservoir-sampling-task';

export const RESERVOIR_SAMPLING_FIXED_K_UPDATES_TASK: ReservoirSamplingTask = {
  id: 'fixed-k-updates',
  name: 'Rezerwuar rozmiaru 3',
  summary: 'Klasyczny wariant k > 1 z losowaniem indeksu zastąpienia.',
  instruction: 'Przetwórz strumień a, b, c, d, e, f, g, h dla k = 3 i pokaż każde zastąpienie.',
  hints: [
    'Pierwsze k elementów tworzy rezerwuar startowy.',
    'Dla i > k losujemy j z zakresu [1, i]; tylko j <= k zmienia stan.',
  ],
  difficulty: 'medium',
  defaultValues: {
    k: 3,
    stream: '[a, b, c, d, e, f, g, h]',
    draws: '{4: 2, 5: 5, 6: 1, 7: 3, 8: 6}',
  },
  inputSchema: RESERVOIR_SAMPLING_FIXED_K_INPUT_SCHEMA,
  codeSnippetId: null,
  notebookFlow: { kind: 'fixed-k-updates' },
};
