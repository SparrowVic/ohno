import { GCD_MULTI_NUMBER_INPUT_SCHEMA, type GcdTask } from './euclidean-gcd-task';

export const GCD_MULTI_NUMBER_FOLD_TASK: GcdTask = {
  id: 'multi-number-fold',
  name: 'NWD wielu liczb przez fold',
  summary: 'Składanie gcd parami dla listy liczb.',
  instruction: 'Oblicz największy wspólny dzielnik liczb 252, 198, 126, 90 przez składanie parami.',
  hints: [
    'Najpierw liczysz gcd pierwszych dwóch liczb.',
    'Wynik poprzedniego kroku staje się wejściem następnego.',
  ],
  difficulty: 'medium',
  defaultValues: { values: '[252, 198, 126, 90]' },
  inputSchema: GCD_MULTI_NUMBER_INPUT_SCHEMA,
  codeSnippetId: null,
  notebookFlow: { kind: 'multi-number-fold' },
};
