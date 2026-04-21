/**
 * Per-algorithm catalog shared by the sorting Trace tab (short hint
 * at the top — step-accompanying teaching) and the sorting Info tab
 * (full tutorial — how it works, strengths, trade-offs).
 *
 * Keep entries beginner-friendly: plain language, short sentences,
 * one idea per bullet.
 */

export interface SortAlgorithmTutorial {
  /** Short family label shown as a badge in the Info tutorial card. */
  readonly pattern: string;
  /** One plain-language sentence describing the algorithm's pattern. */
  readonly keyIdea: string;
  /** One short sentence pointing the user at what to watch on the canvas. */
  readonly watch: string;
  /** Numbered steps describing how the algorithm proceeds. */
  readonly howItWorks: readonly string[];
  /** 2–3 sentences on when this algorithm shines. */
  readonly strengths: readonly string[];
  /** 2–3 sentences on when to avoid it / watch out. */
  readonly weaknesses: readonly string[];
}

export const SORT_ALGORITHM_TUTORIALS: Record<string, SortAlgorithmTutorial> = {
  'bubble-sort': {
    pattern: 'Comparison',
    keyIdea:
      'Repeatedly swap adjacent pairs. After each pass the largest unsorted value "bubbles" to the right end.',
    watch: 'Watch the right edge: every pass locks in one more final element.',
    howItWorks: [
      'Walk left-to-right, comparing each pair of neighbours.',
      'If the left value is bigger, swap them.',
      'After a full pass the largest unsorted value settles at the right end.',
      'Shrink the pass range by one and repeat — stop when a whole pass has no swaps.',
    ],
    strengths: [
      'Easy to implement and very easy to explain.',
      'Runs in O(n) on input that is already sorted — the early-exit check catches it.',
    ],
    weaknesses: [
      'O(n²) on average — impractical for anything beyond small inputs.',
      'Every swap touches adjacent memory only, so it has no structural advantages over insertion sort.',
    ],
  },

  'selection-sort': {
    pattern: 'Comparison',
    keyIdea:
      'Scan the unsorted region for the minimum, then swap it to the front of that region.',
    watch: 'Watch the left edge grow by exactly one sorted element each pass.',
    howItWorks: [
      'Treat the whole array as one unsorted region.',
      'Scan the unsorted region for the smallest value.',
      'Swap that smallest value into the first unsorted slot.',
      'Move the sorted-boundary one step right and repeat.',
    ],
    strengths: [
      'Uses at most n − 1 swaps — the fewest of any O(n²) sort.',
      'Constant extra memory and very simple control flow.',
    ],
    weaknesses: [
      'Always O(n²) — there is no early exit on already-sorted input.',
      'Not stable by default: equal values can change their relative order.',
    ],
  },

  'insertion-sort': {
    pattern: 'Comparison',
    keyIdea:
      'Take the next element and slide it leftward into its place inside the already-sorted prefix.',
    watch: 'The sorted prefix keeps its order; neighbours shift right to make room.',
    howItWorks: [
      'Treat the first element as a sorted prefix of length 1.',
      'Pick the next element from the unsorted region.',
      'Shift larger sorted values one step right until the pick fits.',
      'Drop the pick into the gap. Repeat until nothing is left to insert.',
    ],
    strengths: [
      'Near-linear (O(n)) on nearly-sorted input — excellent for "mostly sorted" data.',
      'Stable, in-place, and simple enough to hand-execute.',
    ],
    weaknesses: [
      'O(n²) on random or reverse-sorted input.',
      'Lots of small shifts — cache-friendly but slow for large arrays.',
    ],
  },

  'merge-sort': {
    pattern: 'Divide & conquer · Stable',
    keyIdea:
      'Split the array in half, sort each half recursively, then merge the sorted halves into one sorted array.',
    watch: 'Small sub-arrays become sorted first; merges combine them upward.',
    howItWorks: [
      'Split the array into two halves.',
      'Recursively sort each half with the same procedure.',
      'Walk both sorted halves in parallel, copying the smaller head into the output.',
      'Continue until both halves are drained into the merged result.',
    ],
    strengths: [
      'Guaranteed O(n log n) time on every input.',
      'Stable — equal values keep their original order.',
    ],
    weaknesses: [
      'Needs O(n) extra memory for the merge buffer.',
      'Slower in practice than quick sort due to the extra copying.',
    ],
  },

  'quick-sort': {
    pattern: 'Divide & conquer',
    keyIdea:
      'Pick a pivot, partition smaller values left and larger values right, then recurse into each side.',
    watch: 'After every partition, the pivot lands at its final position.',
    howItWorks: [
      'Pick a pivot element (first, last, middle, or random).',
      'Partition: move every value smaller than the pivot to its left, every larger value to its right.',
      'The pivot now sits at its final sorted position.',
      'Recurse into the left partition and the right partition.',
    ],
    strengths: [
      'Often the fastest in-practice comparison sort — great cache behaviour.',
      'In-place with O(log n) recursion depth when pivots split evenly.',
    ],
    weaknesses: [
      'O(n²) in the worst case when pivots split the array badly.',
      'Not stable by default; randomised pivots mitigate adversarial inputs.',
    ],
  },

  'heap-sort': {
    pattern: 'Heap-based',
    keyIdea:
      'Build a max-heap, then repeatedly swap the root with the last element and shrink the heap.',
    watch: 'The heap region contracts from the right while the sorted suffix grows.',
    howItWorks: [
      'Rearrange the array into a max-heap — every parent ≥ its children.',
      'Swap the root (the max) with the last heap element.',
      'Shrink the heap by one and restore the heap property on the new root (sift-down).',
      'Repeat until the heap is empty.',
    ],
    strengths: [
      'Guaranteed O(n log n), in-place, constant extra memory.',
      'Worst-case behaviour matches the average — no adversarial inputs.',
    ],
    weaknesses: [
      'Cache-unfriendly index jumps — slower in practice than quick/merge sort.',
      'Not stable.',
    ],
  },

  'radix-sort': {
    pattern: 'Non-comparison · Stable',
    keyIdea:
      'Sort by one digit position at a time, from least significant to most significant.',
    watch: 'Each digit pass preserves the order established by previous passes.',
    howItWorks: [
      'Find the number with the most digits — this sets the number of passes.',
      'Sort the array by the least-significant digit using a stable bucket sort.',
      'Repeat for each more-significant digit.',
      'After the most-significant digit pass, the whole array is sorted.',
    ],
    strengths: [
      'Beats O(n log n) for fixed-width keys — runs in O(nk), where k = digit count.',
      'Stable, so it is safe to use as the inner sort of a bigger pipeline.',
    ],
    weaknesses: [
      'Only works out-of-the-box for non-negative integers or bounded keys.',
      'Extra memory for the bucket arrays on every pass.',
    ],
  },

  'counting-sort': {
    pattern: 'Non-comparison · Stable',
    keyIdea:
      'Count how many times each value appears, then use those counts to place each value directly in the output.',
    watch: 'No comparisons happen — the algorithm trades memory for speed.',
    howItWorks: [
      'Scan the array once and count how many times each value appears.',
      'Turn the counts into cumulative positions in the output.',
      'Walk the input again and place each value at its reserved output index.',
      'Copy the output back into the array.',
    ],
    strengths: [
      'Linear time: O(n + k), where k = size of the value range.',
      'Stable and comparison-free.',
    ],
    weaknesses: [
      'Needs O(k) extra memory — impractical when the value range is very large.',
      'Only works for integer-like, bounded keys.',
    ],
  },

  'shell-sort': {
    pattern: 'Gap-based insertion',
    keyIdea:
      'Run insertion sort on subsequences spaced by a gap; shrink the gap and repeat until gap = 1.',
    watch: 'Larger gaps fix long-range disorder; the final gap = 1 pass polishes.',
    howItWorks: [
      'Pick a gap sequence (for example n/2, n/4, …, 1).',
      'For each gap, run insertion sort on the subsequences that are exactly that far apart.',
      'Move to the next, smaller gap and repeat.',
      'Finish with a gap = 1 pass — a final insertion sort on the whole array.',
    ],
    strengths: [
      'Much faster than plain insertion sort on random input — usually O(n^1.25) to O(n^1.5).',
      'Simple, in-place, no recursion.',
    ],
    weaknesses: [
      'Exact complexity depends on the gap sequence, and analysing it is surprisingly hard.',
      'Not stable.',
    ],
  },

  'tim-sort': {
    pattern: 'Hybrid · Stable',
    keyIdea:
      'Detect already-sorted "runs", sort short ones with insertion, then merge runs with a stack policy.',
    watch: 'Naturally ordered regions are preserved and merged without re-sorting.',
    howItWorks: [
      'Scan the array for monotonic runs (ascending or descending sequences).',
      'Pad runs that are shorter than a minimum using insertion sort.',
      'Push each run on a stack and merge while a size-balance invariant is violated.',
      'When the scan ends, drain the stack by merging the remaining runs.',
    ],
    strengths: [
      'O(n) on sorted or nearly-sorted input — the runs are reused as-is.',
      'Stable; shipped as the default sort in Python, Java, Android, and many others.',
    ],
    weaknesses: [
      'The implementation is much more complex than merge or quick sort.',
      'Small O(n) extra memory for the merge buffer.',
    ],
  },

  'bucket-sort': {
    pattern: 'Non-comparison · Stable',
    keyIdea:
      'Partition values into buckets by range, sort each bucket independently, then concatenate the buckets.',
    watch: 'Works best when values are evenly distributed so each bucket stays small.',
    howItWorks: [
      'Split the value range into a fixed number of buckets.',
      'Drop each value into the bucket that covers its range.',
      'Sort each bucket independently (usually with insertion sort).',
      'Concatenate the buckets in order to get the final sorted array.',
    ],
    strengths: [
      'Close to O(n) when values are uniformly distributed.',
      'Stable if the inner bucket sort is stable.',
    ],
    weaknesses: [
      'Degrades to O(n²) if many values cluster in a single bucket.',
      'Extra memory proportional to the number of buckets.',
    ],
  },
};
