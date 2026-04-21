export interface SortAlgorithmHint {
  /** Short family tag shown as a badge next to the key-idea. */
  readonly pattern: string;
  /** One-sentence plain-language explanation of the algorithm's pattern. */
  readonly keyIdea: string;
  /** One short sentence pointing the user at what to watch on the canvas. */
  readonly watch: string;
}

/** Per-algorithm teaching hints surfaced at the top of the Trace tab.
 *  One line for "what the algorithm does" (the mental model) and one
 *  line for "what to watch on the canvas" (where to look). Keyed by
 *  algorithm id — keep additions short, plain, and beginner-friendly. */
export const SORT_ALGORITHM_HINTS: Record<string, SortAlgorithmHint> = {
  'bubble-sort': {
    pattern: 'Comparison',
    keyIdea:
      'Repeatedly swap adjacent pairs. After each pass the largest unsorted value "bubbles" to the right end.',
    watch: 'Watch the right edge: every pass locks in one more final element.',
  },
  'selection-sort': {
    pattern: 'Comparison',
    keyIdea:
      'Scan the unsorted region for the minimum, then swap it to the front of that region.',
    watch: 'Watch the left edge grow by exactly one sorted element each pass.',
  },
  'insertion-sort': {
    pattern: 'Comparison',
    keyIdea:
      'Take the next element and slide it leftward into its place inside the already-sorted prefix.',
    watch: 'The sorted prefix keeps its order; neighbors shift right to make room.',
  },
  'merge-sort': {
    pattern: 'Divide & conquer',
    keyIdea:
      'Split the array in half, sort each half recursively, then merge the sorted halves into one sorted array.',
    watch: 'Small sub-arrays become sorted first; merges combine them upward.',
  },
  'quick-sort': {
    pattern: 'Divide & conquer',
    keyIdea:
      'Pick a pivot, partition smaller values left and larger values right, then recurse into each side.',
    watch: 'After every partition, the pivot lands at its final position.',
  },
  'heap-sort': {
    pattern: 'Heap-based',
    keyIdea:
      'Build a max-heap, then repeatedly swap the root with the last element and shrink the heap.',
    watch: 'The heap region contracts from the right while the sorted suffix grows.',
  },
  'radix-sort': {
    pattern: 'Non-comparison · stable',
    keyIdea:
      'Sort by one digit position at a time, from least significant to most significant.',
    watch: 'Each digit pass preserves the order established by previous passes.',
  },
  'counting-sort': {
    pattern: 'Non-comparison · stable',
    keyIdea:
      'Count how often each value appears, then use those counts to place each value directly in the output.',
    watch: 'No comparisons happen — the algorithm trades memory for speed.',
  },
  'shell-sort': {
    pattern: 'Gap-based insertion',
    keyIdea:
      'Run insertion sort on subsequences spaced by a gap; shrink the gap and repeat until gap = 1.',
    watch: 'Larger gaps fix long-range disorder; the final gap = 1 pass polishes.',
  },
  'tim-sort': {
    pattern: 'Hybrid · stable',
    keyIdea:
      'Detect already-sorted "runs", sort short ones with insertion, then merge runs with a stack policy.',
    watch: 'Naturally ordered regions are preserved and merged without re-sorting.',
  },
  'bucket-sort': {
    pattern: 'Non-comparison · stable',
    keyIdea:
      'Partition values into buckets by range, sort each bucket independently, then concatenate the buckets.',
    watch: 'Works best when values are evenly distributed so each bucket stays small.',
  },
};
