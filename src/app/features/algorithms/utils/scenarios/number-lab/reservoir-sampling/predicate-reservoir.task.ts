import {
  RESERVOIR_SAMPLING_PREDICATE_INPUT_SCHEMA,
  type ReservoirSamplingTask,
} from './reservoir-sampling-task';

export const RESERVOIR_SAMPLING_PREDICATE_RESERVOIR_TASK: ReservoirSamplingTask = {
  id: 'predicate-reservoir',
  name: 'Reservoir Sampling z predykatem',
  summary: 'Sampling tylko po elementach spełniających predykat status == ERROR.',
  instruction:
    'Ignoruj elementy OK i wykonuj losowania tylko dla elementów spełniających predykat.',
  hints: [
    'Licznik r rośnie tylko dla elementów ERROR.',
    'Losowanie j dotyczy realnego licznika r, nie indeksu w całym strumieniu.',
  ],
  difficulty: 'medium',
  defaultValues: {
    k: 2,
    predicate: 'status == ERROR',
    stream: '[(1, OK), (2, ERROR), (3, OK), (4, ERROR), (5, ERROR), (6, OK), (7, ERROR)]',
    draws_for_real_items: '{3: 1, 4: 4}',
  },
  inputSchema: RESERVOIR_SAMPLING_PREDICATE_INPUT_SCHEMA,
  codeSnippetId: null,
  notebookFlow: { kind: 'predicate-reservoir' },
};
