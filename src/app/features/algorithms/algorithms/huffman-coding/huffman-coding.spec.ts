import { describe, expect, it } from 'vitest';

import type { SortStep } from '../../models/sort-step';
import type { HuffmanScenario } from '../../utils/string-scenarios/string-scenarios';
import { huffmanCodingGenerator } from './huffman-coding';

function collectSteps(scenario: HuffmanScenario): SortStep[] {
  return [...huffmanCodingGenerator(scenario)];
}

describe('huffman-coding', () => {
  it('builds deterministic prefix codes from skewed frequencies', () => {
    const steps = collectSteps({
      kind: 'huffman-coding',
      presetId: 'spec-skewed',
      presetLabel: 'Spec Skewed',
      presetDescription: 'Three distinct frequencies produce a stable tree.',
      source: 'AAABBC',
    });
    const finalStep = steps.at(-1);

    expect(finalStep?.string?.phaseLabel).toBe('Assign codes');
    expect(finalStep?.string?.codeTable).toEqual([
      { char: 'A', freq: 3, code: '1' },
      { char: 'B', freq: 2, code: '01' },
      { char: 'C', freq: 1, code: '00' },
    ]);
    expect(finalStep?.string?.totalOriginalBits).toBe(48);
    expect(finalStep?.string?.totalCompressedBits).toBe(9);
    expect(steps.filter((step) => step.string?.phaseLabel === 'Merge nodes')).toHaveLength(2);
  });

  it('handles the two-symbol base case with one merge and one-bit codes', () => {
    const steps = collectSteps({
      kind: 'huffman-coding',
      presetId: 'spec-two-symbols',
      presetLabel: 'Spec Two Symbols',
      presetDescription: 'Smallest non-trivial Huffman tree.',
      source: 'AB',
    });
    const finalStep = steps.at(-1);

    expect(finalStep?.string?.codeTable).toEqual([
      { char: 'A', freq: 1, code: '0' },
      { char: 'B', freq: 1, code: '1' },
    ]);
    expect(finalStep?.string?.totalCompressedBits).toBe(2);
    expect(steps.filter((step) => step.string?.phaseLabel === 'Merge nodes')).toHaveLength(1);
  });
});
