import { describe, expect, it } from 'vitest';

import { BINARY_SEARCH_VARIANTS_CODE_VARIANTS } from './binary-search-variants-code';
import { BINARY_SEARCH_CODE_VARIANTS } from './binary-search-code';
import { LINEAR_SEARCH_CODE_VARIANTS } from './linear-search-code';

const EXPECTED_LANGUAGES = [
  'typescript',
  'javascript',
  'python',
  'csharp',
  'java',
  'cpp',
  'go',
  'rust',
  'swift',
  'php',
  'kotlin',
] as const;

describe('searching code variants', () => {
  it.each([
    ['linear-search', LINEAR_SEARCH_CODE_VARIANTS],
    ['binary-search', BINARY_SEARCH_CODE_VARIANTS],
    ['binary-search-variants', BINARY_SEARCH_VARIANTS_CODE_VARIANTS],
  ])('exposes every supported programming language for %s', (_algorithmId, variants) => {
    expect(Object.keys(variants).sort()).toEqual([...EXPECTED_LANGUAGES].sort());
  });
});
