import {
  RESERVOIR_SAMPLING_DISTRIBUTED_INPUT_SCHEMA,
  type ReservoirSamplingTask,
} from './reservoir-sampling-task';

export const RESERVOIR_SAMPLING_DISTRIBUTED_MERGE_TASK: ReservoirSamplingTask = {
  id: 'distributed-merge',
  name: 'Łączenie rezerwuarów rozproszonych',
  summary: 'Lokalne rezerwuary shardów scalane przez globalne priorytety.',
  instruction:
    'Wybierz lokalne top-k z każdego shardu, połącz kandydatów i wybierz globalne top-k.',
  hints: [
    'Każdy shard zachowuje tylko swoje najlepsze elementy.',
    'Globalny wynik powstaje przez ranking kandydatów z lokalnych rezerwuarów.',
  ],
  difficulty: 'hard',
  defaultValues: {
    k: 2,
    priority_mode: 'smaller is better',
    shardA: '[(a1, 0.72), (a2, 0.15), (a3, 0.44), (a4, 0.05)]',
    shardB: '[(b1, 0.20), (b2, 0.91), (b3, 0.11)]',
    shardC: '[(c1, 0.36), (c2, 0.07), (c3, 0.62), (c4, 0.18), (c5, 0.02)]',
  },
  inputSchema: RESERVOIR_SAMPLING_DISTRIBUTED_INPUT_SCHEMA,
  codeSnippetId: null,
  notebookFlow: { kind: 'distributed-merge' },
};
